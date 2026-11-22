#!/usr/bin/env node
// lh_tests.mjs — AirfieldLab research round 2, topic 08 (LH): test cases T-LH-01 … for the attitude estimates
// (lh_attitude.mjs), the proposed evaluator (lh_eval.mjs) on synthetic time series, the stick-force targets
// (lh_stick.mjs) and the 08 ↔ card consistency (D1). Node >= 18.
// Every result row carries: conditions, quantity, expected value, explicit tolerance, origin and the current-model
// result ("today"): the sim of today (src/20-flight.js through lm_card.loadSim) with the card loaded by
// lm_card.buildAC/applyAC where the quantity exists there, today's Evaluator.score() for touchdowns, otherwise
// "ไม่รองรับในซิมวันนี้".
//   node lh_tests.mjs        → prints a table, writes out/lh_tests.json ($LM_OUT_DIR/lh_tests.json when set), exit code 1 on any failure
//   node lh_tests.mjs --md   → also prints the 08.9 markdown table
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TYPES, CARD_IDS, attitude, iasToCas, fpmPerDeg, vsOnPath, balloon, run as runAttitude } from './lh_attitude.mjs';
import { PROFILES, PROFILE_CARD, detect, score, synth, synthTakeoff, firstTouchdown, scoreToday } from './lh_eval.mjs';
export { scoreToday };   // moved to lh_eval.mjs (22 Nov 2026) so lm_selftest T-LM-32 can import it without running these tests
import { compute as computeStick, CFR23_143 } from './lh_stick.mjs';
import { loadType, mergeDir, val, isObj, trainingMassKg, outFile } from './lm_lib.mjs';
import { loadSim, buildAC, applyAC, trim, detents, flapMap, simCLtrim } from './lm_card.mjs';


const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEG = Math.PI / 180, RAD = 180 / Math.PI, KT = 0.514444, LBF = 4.44822;
const C = PROFILES.c172s;
const NS = 'ไม่รองรับในซิมวันนี้';
const results = [];
const fx = (x, n = 2) => (typeof x === 'number' ? +x.toFixed(n) : x);
/** numeric case: |got − exp| ≤ tol */
const num = (id, cond, qty, got, exp, tol, src, today = NS) => results.push({ id, cond, qty, got: fx(got, 3), exp: `${exp}`, tol: `± ${tol}`, pass: Math.abs(got - exp) <= tol, src, today });
/** bound case: got ≥ lo (or ≤ hi) */
const bound = (id, cond, qty, got, { lo = null, hi = null }, src, today = NS) => results.push({ id, cond, qty, got: fx(got, 3),
  exp: lo != null && hi != null ? `${lo} … ${hi}` : lo != null ? `≥ ${lo}` : `≤ ${hi}`, tol: 'ขอบเขตปิด (ไม่มีส่วนเผื่อเพิ่ม)', pass: (lo == null || got >= lo) && (hi == null || got <= hi), src, today });
// what today's Evaluator (src/20-flight.js: gates g500/g200, stall + excursion events, touchdown score parts) can see
const TODAY_SEES = { unstable_500: 'gate g500', stall_warning: 'event stall', near_stall: 'event stall', hard_landing: 'คะแนน sink', very_hard_landing: 'คะแนน sink (cap 35)',
  nose_first: 'คะแนน att −5', off_centre: 'คะแนน cl', short_landing: 'คะแนน pos (cap 20)', long_landing: 'คะแนน pos', side_load: 'คะแนน att (crab/latV)',
  dir_control: 'event excursion (เฉพาะออกนอกทางวิ่ง)', fast: 'gate ias (500/200 ft)', slow: 'gate ias (500/200 ft)', high_on_path: 'gate gs dots', low_on_path: 'gate gs dots', sink_high: 'gate vs' };
const todayEval = (S, P, ids) => {
  const sc = scoreToday(S, P);
  const seen = [...new Set(ids.map(i => TODAY_SEES[i]).filter(Boolean))], miss = ids.filter(i => !TODAY_SEES[i]);
  if (sc == null) return `${NS} (ไม่มีตัวตรวจ go-around/ขึ้นบิน${seen.length ? '; เห็นบางส่วน: ' + seen.join(', ') : ''})`;
  return `คะแนน touchdown ${sc}${seen.length ? '; เห็น: ' + seen.join(', ') : ''}${miss.length ? '; ' + NS + ': ' + miss.join(', ') : ''}`;
};
/** evaluator case: must contain all ids in `has`, none in `not`; score within ±tol (default 1 point) when given */
const evc = (id, cond, P, S, has, not = [], opts = {}, src = '') => {
  const ev = detect(S, P, opts), ids = ev.map(e => e.id), sc = score(S, P, ev, opts), tol = opts.tol ?? 1;
  const pass = has.every(h => ids.includes(h)) && not.every(n => !ids.includes(n)) && (opts.score == null || (sc.total != null && Math.abs(sc.total - opts.score) <= tol));
  results.push({ id, cond, qty: 'events / score', got: `${ids.join(',') || '–'} / ${sc.total ?? '–'}`, exp: `${has.join(',') || 'none'}${not.length ? ' ; not ' + not.join(',') : ''}${opts.score != null ? ' ; score ' + opts.score : ''}`,
    tol: `เหตุการณ์: ต้องมีครบ/ต้องไม่มี (ตรงตัว)${opts.score != null ? `; คะแนน ± ${tol}` : ''}`, pass, src, today: todayEval(S, P, has), score: sc });
};

// ---- current model: the sim of today with a card loaded (lm_card) ----
const M = await loadSim();
const MERGED = mergeDir(path.dirname(HERE), { checks: false, bases: false }).merged;
const cardOf = id => loadType(id, { merged: MERGED });
function withCard(id, mass, fn) {
  const card = cardOf(id), ac = buildAC(card, { mass: mass ?? trainingMassKg(card) }), restore = applyAC(M, ac);
  const fm = Object.fromEntries(flapMap(detents(card)).map(d => [String(d.name), d.f]));
  try { return fn({ card, ac, fm }); } finally { restore(); }
}
/** sim trim pitch (deg) at CAS (≈ EAS), detent, gamma (deg), height (m) */
const simTheta = (id, det, cas, gammaDeg, h = 300, mass) => withCard(id, mass, ({ fm }) => {
  const T = trim(M, new M.Aircraft(), { ias: cas, h, flaps: fm[String(det)] ?? 0, gear: 1, gammaDeg });
  const ok = Math.abs(T.de * RAD) < 25 && T.thr > -0.05 && T.thr < 1.2;
  return { theta: T.theta * RAD, alpha: T.alpha * RAD, de: T.de * RAD, thr: T.thr, ok };
});
const tdeg = r => (Math.abs(r.de) < 25 ? `ซิม+บัตร θ ${r.theta.toFixed(1)}° (δe ${r.de.toFixed(1)}°${r.thr > 1.0 ? `, ต้องการกำลัง ${(r.thr * 100).toFixed(0)} % เกินเต็ม` : ''})` : `${NS} (trim ไม่ลู่เข้า δe ${r.de.toFixed(0)}°)`);

// ---- physics checks of 08.1 / 08.2 / 08.4 (formula of lh_attitude.mjs; today = sim trim with the card) ----
const t6 = 'T-6A บัตร t6a มวลฝึก 2,575 kg';
num('T-LH-01', `T-6A 150 KIAS level flaps UP 3,000 ft (${t6})`, 'pitch θ (deg)', attitude(TYPES.t6a, 'UP', 150, 0).theta, 2.0, 1.0, 'LH14 Table 2.1: 2° NH', tdeg(simTheta('t6a', 'UP', 150, 0, 914)));
{ const g = Math.asin(3000 * 0.00508 / (140 * KT));
  num('T-LH-02', 'T-6A 140 KIAS climb 3,000 fpm flaps UP', 'pitch θ (deg)', attitude(TYPES.t6a, 'UP', 140, g).theta, 15.0, 1.5, 'LH14: 15° NH', tdeg(simTheta('t6a', 'UP', 140, g * RAD, 300))); }
num('T-LH-03', 'T-6A 250 KIAS level 3,000 ft', 'pitch θ (deg)', attitude(TYPES.t6a, 'UP', 250, 0).theta, -2.0, 1.5, 'LH14: 2° NL', tdeg(simTheta('t6a', 'UP', 250, 0, 914)));
num('T-LH-04', '1° pitch at 90 KIAS', 'Δ fpm', fpmPerDeg(90), 159.1, 1, 'ฟิสิกส์; กฎ SOP 2×IAS = 180 [LH10 p.4] ต่าง 13 %', 'เรขาคณิต ไม่ขึ้นกับซิม: ผลเท่ากัน');
num('T-LH-05', 'glide path 3°, GS 65 kt', 'descent fpm', vsOnPath(65), 345, 2, 'LH1 (500–1,000 fpm ใช้กับ GS สูงกว่า)', 'เรขาคณิต ไม่ขึ้นกับซิม: ผลเท่ากัน');
{ const c0 = iasToCas(TYPES.c172s, '0', 65), c30 = iasToCas(TYPES.c172s, '30', 65);
  const a = simTheta('c172s', '0', c0, 0), b = simTheta('c172s', '30', c30, -3);
  num('T-LH-06', 'C172S 65 KIAS: α flap 0 level − α flap 30 path 3° (มวลฝึก 1,010 kg)', 'Δα (deg)', attitude(TYPES.c172s, '0', c0, 0).alpha - attitude(TYPES.c172s, '30', c30, -3 * DEG).alpha, 4.0, 0.3,
    'LH1 p.9-8 (แฟลปเต็ม attitude ต่ำลง)', `ซิม+บัตร Δα ${(a.alpha - b.alpha).toFixed(2)}°`); }
{ const today = withCard('c172s', null, ({ ac, fm }) => { const v = iasToCas(TYPES.c172s, '10', 85) * KT, q = 0.5 * 1.225 * v * v, al = 3 * DEG;
    return (simCLtrim(ac, fm['10'], al) - simCLtrim(ac, fm['0'], al)) * q * ac.S / (ac.m * 9.80665); });
  num('T-LH-07', 'C172S แฟลป 0→10 ที่ 85 KIAS ถือ α เดิม', 'Δn (g)', balloon(TYPES.c172s, '0', '10', 85), 0.22, 0.02, 'LH1 p.9-2 (balloon)', `ซิม+บัตร Δn ${today.toFixed(3)} g (รวมแรงยก elevator ที่ trim ใหม่)`); }
num('T-LH-08', 'crab C172S 15 kt / 65 kt', 'crab (deg)', Math.asin(15 / 65) / DEG, 13.3, 0.1, 'LH1 p.9-15; DA40 25/74 = 19.7°, T-6 25/100 = 14.5°', 'เรขาคณิต ไม่ขึ้นกับซิม: ผลเท่ากัน');

// ---- evaluator on synthetic series (C172S unless noted) ----
evc('T-LH-09', 'C172S nominal: 65 KIAS, 3°, flare 15 ft, TD −120 fpm ที่ aim+66 m', C, synth(C), [], ['unstable_500', 'hard_landing', 'bounce'], { score: 100 }, 'ACS PA.IV.B');
evc('T-LH-10', 'เร็วเกิน +15 kt จาก 600 ถึง 20 ft', C, synth(C, { spdBias: [15, 600, 20] }), ['fast', 'unstable_500', 'unstable_300', 'continued_unstable'], [], {}, 'LH2 +10/−5');
evc('T-LH-11', 'ช้า −8 kt จาก 400 ถึง 100 ft', C, synth(C, { spdBias: [-8, 400, 100] }), ['slow', 'unstable_300'], [], {}, 'LH2');
evc('T-LH-12', 'สูงกว่า path +60 ft จาก 900 ถึง 300 ft', C, synth(C, { pathOffFt: [60, 900, 300] }), ['high_on_path'], ['low_on_path'], {}, 'R1 gate 1 dot');
evc('T-LH-13', 'ต่ำกว่า path −40 ft จาก 800 ถึง 200 ft', C, synth(C, { pathOffFt: [-40, 800, 200] }), ['low_on_path'], ['high_on_path'], {}, 'R1');
evc('T-LH-14', 'จม 1,200 fpm จาก 600 ถึง 450 ft', C, synth(C, { sinkExtra: [1200, 600, 450] }), ['sink_high', 'unstable_500'], [], {}, 'LH1 p.9-6');
evc('T-LH-15', 'flare สูง: ค้างที่ 12 ft 3 s แล้วตก 500 fpm', C, synth(C, { levelOffFt: 12, levelHold: 3, dropVs: -500 }), ['high_flare', 'hard_landing'], [], {}, 'LH1 p.9-31, LH5');
evc('T-LH-16', 'ไม่ flare: เริ่มที่ 2 ft แตะ −330 fpm', C, synth(C, { flareFt: 2, vsTD: -330 }), ['late_flare'], ['high_flare'], {}, 'LH1 p.9-32, LH5');
evc('T-LH-17', 'balloon +5 ft ระหว่าง flare', C, synth(C, { balloonFt: 5 }), ['balloon'], [], {}, 'LH1 p.9-32');
evc('T-LH-18', 'float: ลอยที่ 1–2 ft นาน 8 s', C, synth(C, { floatHoldS: 8 }), ['float'], [], {}, 'LH1 p.9-32');
evc('T-LH-19', 'เด้ง 3 ft หนึ่งครั้ง', C, synth(C, { bounceFt: 3 }), ['bounce'], ['bounce_big', 'porpoise'], {}, 'LH1 p.9-33');
evc('T-LH-20', 'เด้ง 7 ft', C, synth(C, { bounceFt: 7 }), ['bounce', 'bounce_big'], [], {}, 'LH1 p.9-34');
evc('T-LH-21', 'ล้อหน้าแตะก่อนแล้วเด้งสองครั้ง', C, synth(C, { noseFirst: true, bounceFt: 2, bounces: 2 }), ['porpoise'], ['nose_first'], {}, 'LH1 p.9-34');
evc('T-LH-22', 'ล้อหน้าแตะก่อน ไม่เด้ง', C, synth(C, { noseFirst: true }), ['nose_first'], ['porpoise'], {}, 'LH1, R1');
evc('T-LH-23', 'flare ค้างที่ 4 ft 1 s แล้วตก −450 fpm', C, synth(C, { levelOffFt: 4, levelHold: 1, dropVs: -450 }), ['hard_landing'], ['very_hard_landing', 'late_flare', 'high_flare'], { score: 83, tol: 1 }, 'LH1 p.9-35 (6 in ≈ 340 fpm), R1');
evc('T-LH-24', 'แตะ −700 fpm', C, synth(C, { vsTD: -700, flareTau: 0.3 }), ['very_hard_landing'], [], { score: 35, tol: 1 }, 'R1 cap 35');
evc('T-LH-25', 'ลมขวาง 12 kt ไม่ decrab', C, synth(C, { xw: 12, decrab: false }), ['side_load'], [], {}, 'LH1 p.9-35, LH2');
evc('T-LH-26', 'drift 2 m/s ตอนแตะ', C, synth(C, { driftTD: 2 }), ['side_load'], [], {}, 'LH2 no side drift');
evc('T-LH-27', 'หันออก 15° ขณะวิ่ง > 15 kt', C, synth(C, { rolloutYaw: 15 }), ['dir_control'], [], {}, 'LH5 (ครึ่งหนึ่งของอุบัติเหตุลงจอด)');
evc('T-LH-28', 'แตะห่างเส้นกลาง 8 m', C, synth(C, { yTD: 8 }), ['off_centre'], [], { score: 91, tol: 1 }, 'R1 cl 6/15');
evc('T-LH-29', 'แตะก่อน threshold (GP origin −100 m)', C, synth({ ...C, aim: -100 }), ['short_landing'], [], { score: 20, tol: 1 }, 'R1 cap 20');
evc('T-LH-30', 'แตะเลยจุด (GP origin 600 m)', C, synth({ ...C, aim: 600 }), ['long_landing'], [], {}, 'LH2 400 ft');
evc('T-LH-31', 'C152 ลดกำลังไม่ดึง carb heat', PROFILES.c152, synth(PROFILES.c152, { carbHeat: false }), ['carb_heat'], [], {}, 'LH13 p.4-9');
evc('T-LH-32', 'C172R mixture 0.7 ระหว่าง approach', PROFILES.c172r, synth(PROFILES.c172r, { mixture: 0.7 }), ['mixture'], [], {}, 'LH13');
evc('T-LH-33', 'elevator ห่าง trim 4° ตลอด final', C, synth(C, { deTrim: 4 }), ['trim'], [], {}, 'LH30 10 lbf');
evc('T-LH-34', 'DA42 NG ล้อไม่ลง', PROFILES.da42ng, synth(PROFILES.da42ng, { gear: 0 }), ['gear_up', 'unstable_500'], [], {}, 'LH29');
evc('T-LH-35', 'go-around ปกติที่ 200 ft', C, synth(C, { goAroundAt: 200 }), [], ['ga_pitch_first', 'ga_flaps_dump', 'ga_no_climb', 'ga_late'], {}, 'LH1 p.9-11');
evc('T-LH-36', 'go-around ยกหัวก่อนเพิ่มกำลัง', C, synth(C, { goAroundAt: 200, gaPitchFirst: true }), ['ga_pitch_first'], [], {}, 'LH1 p.9-11');
evc('T-LH-37', 'go-around เก็บแฟลปทีเดียว', C, synth(C, { goAroundAt: 200, gaFlapDump: true }), ['ga_flaps_dump'], [], {}, 'LH1 p.9-11');
evc('T-LH-38', 'go-around แต่ไม่ไต่', C, synth(C, { goAroundAt: 200, gaNoClimb: true }), ['ga_no_climb'], [], {}, 'LH1');
evc('T-LH-39', 'ไม่ stable (เร็ว) แล้ว go-around ที่ 80 ft', C, synth(C, { spdBias: [15, 600, 20], goAroundAt: 80 }), ['unstable_300', 'ga_late'], ['continued_unstable'], {}, 'LH1 p.9-6');
evc('T-LH-40', 'เลี้ยว skid β 8° เอียง 20° ที่ 900–600 ft', C, synth(C, { skidAt: [900, 600, 8], bankAt: [900, 600, 20] }), ['skid_turn'], ['bank_final'], {}, 'LH6 (stall/spin 81 % ของ LOC-I)');
evc('T-LH-41', 'เอียง 20° ที่ 400–300 ft', C, synth(C, { bankAt: [400, 300, 20] }), ['bank_final'], [], {}, 'LH1 ≤ 15°');
evc('T-LH-42', 'ขึ้นบิน ยกหัวที่ 45 KIAS (VR 55)', C, synthTakeoff(C, { vr: 45 }), ['rotate_early'], [], {}, 'LH11');
evc('T-LH-43', 'ไต่ที่ 90 KIAS (Vy 74)', C, synthTakeoff(C, { vclimb: 90 }), ['vy_hold'], [], {}, 'LH2 Vy +10/−5');
evc('T-LH-44', 'เบรกเต็มตั้งแต่แตะพื้น (ล้อหน้ายังไม่ลง)', C, synth(C, { brakeAt: 1 }), ['brake_fast'], [], {}, 'LH15, LH1');
evc('T-LH-45', 'ลมขวาง 10 kt จากขวา aileron ไปซ้ายขณะวิ่ง', C, synth(C, { xw: 10, da: -0.3 }), ['aileron_rollout'], [], {}, 'LH1 p.9-36');
evc('T-LH-46', 'เร็ว +7 kt ระดับ PPL', C, synth(C, { spdBias: [7, 600, 50] }), [], ['fast'], { level: 'ppl' }, 'LH2 +10');
evc('T-LH-47', 'เร็ว +7 kt ระดับ CPL', C, synth(C, { spdBias: [7, 600, 50] }), ['fast'], [], { level: 'cpl' }, 'LH3 ±5, LH32 ±5');
evc('T-LH-48', 'ช้าจน VS0+3 ที่ 300–100 ft', C, synth(C, { spdBias: [-22, 300, 100] }), ['near_stall', 'stall_warning', 'slow'], [], {}, 'LM3, LH4');
evc('T-LH-49', 'DA40 NG nominal', PROFILES.da40ng, synth(PROFILES.da40ng), [], ['unstable_500', 'hard_landing'], { score: 100 }, 'LH17');
evc('T-LH-50', 'T-6A nominal (final 100 KIAS)', PROFILES.t6a, synth(PROFILES.t6a), [], ['unstable_500', 'hard_landing'], { score: 100 }, 'LH15');

// ---- added in review (2026-11-18) ----
// T-LH-51: the 08.1 formula reproduces the C172S card trim table (04-c172s §04.7: approach flap 30 γ −3° 67 KCAS MTOW,
// θ 2.0°, δe −8.8°) once the card mass (MTOW 1,157 kg) and the elevator lift CLde·δe (CLde 0.42/rad, card 04) are included.
{ const t = { ...TYPES.c172s, mass: 1157 }; t.CL0 = { ...t.CL0, 30: t.CL0[30] + 0.42 * (-8.8 * DEG) };
  num('T-LH-51', 'C172S 67 KCAS แฟลป 30 path 3° ที่ MTOW 1,157 kg + แรงยก elevator (δe −8.8°, CLδe 0.42)', 'pitch θ (deg)', attitude(t, '30', 67, -3 * DEG).theta, 2.0, 0.3, 'บัตร 04 §04.7 ตาราง trim: θ 2.0° (ซิม + บัตร)',
    tdeg(simTheta('c172s', '30', 67, -3, 300, 1157))); }
num('T-LH-52', 'T-6A 200 KIAS level flaps UP, 2,575 kg, 3,000 ft', 'pitch θ (deg)', attitude(TYPES.t6a, 'UP', 200, 0).theta, 0.0, 1.0, 'LH14 Table 2.1: 0° (200 KIAS level)', tdeg(simTheta('t6a', 'UP', 200, 0, 914)));

// ---- added for the completeness check (19 Nov 2026) ----
const ATT = runAttitude();
// T-LH-53 (D1): final IAS of ops.attitude_power equals the card VAPP_kt (±0.5 kt) for every id with both leaves
{ const bad = [], ids = [];
  for (const id of Object.keys(MERGED.types || MERGED).filter(k => !k.startsWith('_'))) {
    let c; try { c = cardOf(id); } catch { continue; }
    const fin = c.ops?.attitude_power?.final, vapp = val(c, 'speeds.VAPP_kt');
    if (!isObj(fin) || !isObj(fin.v) || typeof fin.v.ias_kt !== 'number' || typeof vapp !== 'number') continue;
    ids.push(id); if (Math.abs(fin.v.ias_kt - vapp) > 0.5 && !/แก้มวล|แก้ตามมวล/.test(fin.note || '')) bad.push(`${id} ${fin.v.ias_kt}≠${vapp}`);
  }
  num('T-LH-53', `D1: ops.attitude_power.final.ias_kt = บัตร speeds.VAPP_kt ทุก id (${ids.length} id)`, 'จำนวน id ที่ไม่ตรง', bad.length, 0, 0, 'D1; บัตรเป็นเจ้าของ VAPP ที่ training_mass', 'ข้อมูล ไม่ขึ้นกับซิม' + (bad.length ? ': ' + bad.join('; ') : ''));
  const vv = [];
  for (const id of ids) { const c = cardOf(id), a = val(c, 'speeds.VAPP_kt'), r = val(c, 'speeds.VREF_kt'); if (typeof r === 'number' && a < r - 0.01) vv.push(`${id} ${a}<${r}`); }
  num('T-LH-54', `VAPP ≥ VREF ในบัตรทุก id ที่มี ops (${ids.length} id)`, 'จำนวน id ที่ VAPP < VREF', vv.length, 0, 0, 'D1; AFH p.9-6 (approach ≥ 1.3 VS0)', 'ข้อมูล ไม่ขึ้นกับซิม' + (vv.length ? ': ' + vv.join('; ') : '')); }
// T-LH-55: evaluator profiles mirror the card speeds
{ const bad = [];
  for (const [id, P] of Object.entries(PROFILES)) { const c = cardOf(id); for (const [k, leafPath] of Object.entries(PROFILE_CARD)) { const v = val(c, leafPath); if (typeof v === 'number' && Math.abs(P[k] - v) > 0.5) bad.push(`${id}.${k} ${P[k]}≠${v}`); } }
  num('T-LH-55', `PROFILES (Vapp, Vref, VY, demoXwind) ของ ${Object.keys(PROFILES).length} แบบ = บัตร`, 'จำนวนช่องที่ไม่ตรง', bad.length, 0, 0, 'บัตร 04/05/06/07/10/11', 'ข้อมูล ไม่ขึ้นกับซิม' + (bad.length ? ': ' + bad.join('; ') : '')); }
// T-LH-56..58 (gap 9): the formula with the C152 and C172R cards against the sim with the same card (elevator lift is the difference)
for (const [tid, id, ph, tol] of [['T-LH-56', 'c152', 'final', 1.0], ['T-LH-57', 'c172r', 'final', 1.0], ['T-LH-58', 'c152', 'downwind', 0.5]]) {
  const r = ATT[id][ph], sm = simTheta(id, r.flap, r.cas_kt, r.gamma_deg, 300);
  num(tid, `${id.toUpperCase()} ${ph} ${r.ias_kt} KIAS แฟลป ${r.flap} ${r.rate_fpm} fpm มวลฝึก ${Math.round(TYPES[id].mass)} kg: สูตร 08.1 เทียบซิม+บัตร`, 'pitch θ (deg)', r.pitch_deg, +sm.theta.toFixed(1), tol,
    'lh_attitude (สูตร α = (CL − CL0)/CLα) เทียบ lm_card.trim', tdeg(sm));
}
// T-LH-59: main wheels first at touchdown: pitch IGE − ground attitude (nose and main contact on the ground) ≥ 2°, all cards
{ let worst = { m: 99 }; const simOk = [], simNo = [];
  for (const id of CARD_IDS) { const c = cardOf(id), n = val(c, 'gear.geometry.nose_contact_body_extended'), m = val(c, 'gear.geometry.main_contact_body_extended');
    const nn = Array.isArray(n[0]) ? n[0] : n, mm = Array.isArray(m[0]) ? m[0] : m, tg = Math.atan((nn[2] - mm[2]) / (nn[0] - mm[0])) * RAD, td = ATT[id].touchdown, mg = td.pitch_deg - tg;
    if (mg < worst.m) worst = { m: mg, id };
    // today: sim trim at the CG height when the mains touch (the sim's own ground effect), same speed and sink
    const th = td.pitch_deg * DEG, hcg = mm[2] * Math.cos(th) - mm[0] * Math.sin(th), sm = simTheta(id, td.flap, td.cas_kt, td.gamma_deg, hcg);
    if (Math.abs(sm.de) < 25 && sm.thr >= -0.05) simOk.push(`${id} ${(sm.theta - tg).toFixed(1)}`); else simNo.push(id); }
  bound('T-LH-59', `touchdown 1.05 VS0 มวลฝึก −120 fpm ใน ground effect: θ − θ_พื้น (${CARD_IDS.length} บัตร; ต่ำสุด ${worst.id})`, 'ส่วนต่างต่ำสุด (deg)', worst.m, { lo: 2.0 },
    'AFH ch.9: ล้อหลักแตะก่อน ล้อหน้าลอย [LH1]; σ ground effect รอบที่ 1 §2.4',
    `ซิม+บัตร (ground effect ของซิม) θ − θ_พื้น: ${simOk.join(', ')}${simNo.length ? `; ${NS} สำหรับ ${simNo.join(', ')} (trim ที่ 1.05 VS0 ไม่ลู่เข้า: CLmax ของซิมต่ำกว่าเป้าใน ground effect)` : ''}`); }
// T-LH-60: the flare leaves are ordered (touchdown IAS < flare IAS < final IAS) for all cards
{ let bad = 0; for (const id of CARD_IDS) { const f = ATT[id].flare, td = ATT[id].touchdown, fi = ATT[id].final; if (!(td.ias_kt < f.ias_kt && f.ias_kt < fi.ias_kt)) bad++; }
  num('T-LH-60', `ลำดับความเร็ว touchdown < flare < final (${CARD_IDS.length} บัตร)`, 'จำนวนบัตรที่ผิดลำดับ', bad, 0, 0, 'AFH p.9-8 (ความเร็วลดลงตลอด roundout) [LH1]', 'ข้อมูล ไม่ขึ้นกับซิม'); }
// ---- stick force (gap 18): lh_stick.mjs, round-1 hinge model with card leaves; the sim has no stick-force model today ----
const ST = await computeStick();
const NSF = `${NS} (ไม่มีโมเดลแรงที่คัน)`;
num('T-LH-61', 'DA40 NG approach VAPP แฟลป LDG มวลฝึก 1,150 kg: Fs/g hinge model เทียบ ld_stickforce.mjs', 'Fs/g (N)', ST.da40ng.train.approach.Fs_per_g_N, 19.4, 0.5, 'scripts/out/ld_stickforce.json (สคริปต์อิสระของบัตร 05)', NSF);
num('T-LH-62', 'T-6A approach 100 KIAS แฟลป LDG มวลฝึก: Fs/g hinge model เทียบบัตร hinge_model', 'Fs/g (N)', ST.t6a.train.approach.Fs_per_g_N, 50.1, 0.5, 'บัตร 07 validation.stick_force_targets.hinge_model', NSF);
bound('T-LH-63', 'C172S cruise 110 KCAS 3,000 ft มวลฝึก: Fs/g hinge model อยู่ในแถบ MIL-F-8785C L1 wheel + 23.155', 'Fs/g (lbf)', ST.c172s.train.cruise.Fs_per_g_lbf,
  { lo: ST.c172s.band_lbf_per_g.min, hi: ST.c172s.band_lbf_per_g.max }, 'บัตร 04 stick_force_targets [R1:C12][LM3]', NSF);
num('T-LH-64', 'DA42 NG: hinge model ค่าคลาสรอบที่ 1 ต่ำกว่าพื้น 23.155 จึงตั้งเป้าที่พื้นแถบ', 'เป้า Fs/g (N)', ST.da42ng.target.fs_per_g_N.cruise, 48, 1, 'lh_stick: 23.155 stick max(W/140,15) lb ÷ (nL−1) = 10.7 lbf/g [LM3]', NSF);
{ let worst = { r: 0 }; for (const [id, r] of Object.entries(ST)) { const temp = r.cfr23_143.temporary_pitch_lbf, x = r.target.fs_per_g_lbf.max * (r.nL - 1) / temp; if (x > worst.r) worst = { r: x, id }; }
  bound('T-LH-65', `เป้า Fs/g สูงสุด × (nL − 1) ≤ แรงชั่วคราวของ 23.143 (stick 60, wheel 75 lbf) ทุกบัตร (${Object.keys(ST).length}; สูงสุด ${worst.id})`, 'อัตราส่วนต่อขีด', worst.r, { hi: 1.0 }, '14 CFR 23.143(c) [LH30]', NSF); }
{ let worst = { f: 0 }; for (const [id, r] of Object.entries(ST)) if (r.target.flare_pull_N != null && r.target.flare_pull_N > worst.f) worst = { f: r.target.flare_pull_N, id };
  bound('T-LH-66', `แรงดึงตอน flare (trim ที่ VAPP → 1.05 VS0) ≤ ขีดมือเดียว 50 lbf (222 N) ทุกบัตรที่มี hinge model (สูงสุด ${worst.id})`, 'แรงดึง (N)', worst.f, { hi: 222 }, '14 CFR 23.143(c) one hand [LH30]', NSF); }
{ let worst = { g: 99 }; for (const [id, r] of Object.entries(ST)) if (r.target.grad_N_per_kt) for (const k of ['approach', 'cruise']) if (r.target.grad_N_per_kt[k] < worst.g) worst = { g: r.target.grad_N_per_kt[k], id: id + ' ' + k };
  bound('T-LH-67', `ความชันแรงต่อความเร็ว (tab trim) เป็นบวกทุกบัตร (ต่ำสุด ${worst.id})`, 'N/kt', worst.g, { lo: 0.01 }, '14 CFR 23.173(a): ช้ากว่า trim ต้องดึง [LM3]', NSF); }

const nPass = results.filter(r => r.pass).length;
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'} ${r.id} ${r.cond} | ${r.qty}: ${r.got} | expect ${r.exp} (${r.tol}) | today ${r.today}`);
console.log(`\n${nPass}/${results.length} pass`);
if (process.argv.includes('--md')) {
  const esc = x => String(x).replace(/\|/g, '\\|');
  console.log('\n| id | เงื่อนไข | ปริมาณ | คาด | ส่วนเผื่อ | ที่มา | ผล (สคริปต์) | ผลโมเดลปัจจุบัน (ซิมวันนี้) |\n|---|---|---|---|---|---|---|---|');
  for (const r of results) console.log(`| ${r.id} | ${esc(r.cond)} | ${esc(r.qty)} | ${esc(r.exp)} | ${esc(r.tol)} | ${esc(r.src)} | ${esc(r.got)} ${r.pass ? '✓' : '✗'} | ${esc(r.today)} |`);
}
fs.writeFileSync(outFile('lh_tests.json'), JSON.stringify({ generated: 'lh_tests.mjs (19 Nov 2026)', pass: nPass, total: results.length, results }, null, 1) + '\n');
process.exitCode = nPass === results.length ? 0 : 1;
