#!/usr/bin/env node
// lh_tests.mjs — AirfieldLab research round 2, topic 08 (LH): test cases T-LH-01 … for the attitude estimates
// (lh_attitude.mjs) and the proposed evaluator (lh_eval.mjs) on synthetic time series. Pure Node >= 18.
//   node lh_tests.mjs        → prints a table, writes out/lh_tests.json, exit code 1 on any failure
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TYPES, attitude, iasToCas, fpmPerDeg, vsOnPath, balloon } from './lh_attitude.mjs';
import { PROFILES, detect, score, synth, synthTakeoff, firstTouchdown } from './lh_eval.mjs';

/** today's Evaluator.score() of src/20-flight.js (lines ~517-542) applied to the same touchdown, Vref = profile Vref */
export function scoreToday(S, P) {
  const i = firstTouchdown(S); if (i < 0) return null;
  const td = S[i], sink = -td.vs, lerp = (a, b, f) => a + (b - a) * f;
  const pSink = sink <= 180 ? 40 : sink <= 360 ? lerp(40, 30, (sink - 180) / 180) : sink <= 600 ? lerp(30, 10, (sink - 360) / 240) : 0;
  const d = td.s, pPos = d < 0 || d > 900 ? 0 : (d >= 300 && d <= 600) ? 25 : (d >= 220 && d <= 750) ? 18 : 10;
  const cl = Math.abs(td.y), pCl = cl <= 2 ? 15 : cl <= 5 ? 12 : cl <= 10 ? 6 : 0;
  const dv = td.ias - P.Vref, pSpd = dv >= -8 && dv <= 5 ? 10 : dv >= -12 && dv <= 12 ? 6 : 2;
  const noseFirst = td.wow[0] && !(td.wow[1] || td.wow[2]);
  const att = (Math.abs(td.phi) <= 3 ? 4 : Math.abs(td.phi) <= 6 ? 2 : 0) + (Math.abs(td.crab) <= 3 ? 3 : Math.abs(td.crab) <= 6 ? 1.5 : 0) + (Math.abs(td.latV) <= 0.8 ? 3 : Math.abs(td.latV) <= 1.6 ? 1.5 : 0) - (noseFirst ? 5 : 0);
  let total = pSink + pPos + pCl + pSpd + Math.max(0, att);
  if (d < 0) total = Math.min(total, 20); if (sink > 600) total = Math.min(total, 35);
  return Math.round(total);
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEG = Math.PI / 180;
const C = PROFILES.c172s;
const results = [];
const num = (id, cond, qty, got, exp, tol, src) => results.push({ id, cond, qty, got: +got.toFixed(3), exp: `${exp} ± ${tol}`, pass: Math.abs(got - exp) <= tol, src });
/** evaluator case: must contain all ids in `has`, none in `not` */
const evc = (id, cond, P, S, has, not = [], opts = {}, src = '') => {
  const ev = detect(S, P, opts), ids = ev.map(e => e.id), sc = score(S, P, ev, opts);
  const pass = has.every(h => ids.includes(h)) && not.every(n => !ids.includes(n)) && (opts.score == null || (sc.total != null && Math.abs(sc.total - opts.score) <= (opts.tol ?? 0)));
  results.push({ id, cond, qty: 'events / score', today: scoreToday(S, P), got: `${ids.join(',') || '–'} / ${sc.total ?? '–'}`, exp: `${has.join(',') || 'none'}${not.length ? ' ; not ' + not.join(',') : ''}${opts.score != null ? ' ; score ' + opts.score : ''}`, pass, src, score: sc });
};

// ---- physics checks of 08.1 / 08.2 / 08.4 ----
num('T-LH-01', 'T-6A 150 KIAS level flaps UP, 2,575 kg', 'pitch θ (deg)', attitude(TYPES.t6a, 'UP', 150, 0).theta, 2.0, 1.0, 'LH14 Table 2.1: 2° NH');
num('T-LH-02', 'T-6A 140 KIAS climb 3,000 fpm', 'pitch θ (deg)', attitude(TYPES.t6a, 'UP', 140, Math.asin(3000 * 0.00508 / (140 * 0.514444))).theta, 15.0, 1.5, 'LH14: 15° NH');
num('T-LH-03', 'T-6A 250 KIAS level', 'pitch θ (deg)', attitude(TYPES.t6a, 'UP', 250, 0).theta, -2.0, 1.5, 'LH14: 2° NL');
num('T-LH-04', '1° pitch at 90 KIAS', 'Δ fpm', fpmPerDeg(90), 159.1, 1, 'ฟิสิกส์; กฎ SOP 2×IAS = 180 [LH10 p.4] ต่าง 13 %');
num('T-LH-05', 'glide path 3°, GS 65 kt', 'descent fpm', vsOnPath(65), 345, 2, 'LH1 (500–1,000 fpm ใช้กับ GS สูงกว่า)');
num('T-LH-06', 'C172S 65 KIAS: α flap 0 level − α flap 30 path 3°', 'Δα (deg)', attitude(TYPES.c172s, 0, iasToCas(TYPES.c172s, 0, 65), 0).alpha - attitude(TYPES.c172s, 30, iasToCas(TYPES.c172s, 30, 65), -3 * DEG).alpha, 4.0, 0.3, 'LH1 p.9-8 (แฟลปเต็ม attitude ต่ำลง)');
num('T-LH-07', 'C172S แฟลป 0→10 ที่ 85 KIAS ถือ α เดิม', 'Δn (g)', balloon(TYPES.c172s, 0, 10, 85), 0.22, 0.02, 'LH1 p.9-2 (balloon)');
num('T-LH-08', 'crab C172S 15 kt / 65 kt', 'crab (deg)', Math.asin(15 / 65) / DEG, 13.3, 0.1, 'LH1 p.9-15; DA40 25/74 = 19.7°, T-6 25/100 = 14.5°');

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
evc('T-LH-24', 'แตะ −700 fpm', C, synth(C, { vsTD: -700, flareTau: 0.3 }), ['very_hard_landing'], [], { score: 35, tol: 0 }, 'R1 cap 35');
evc('T-LH-25', 'ลมขวาง 12 kt ไม่ decrab', C, synth(C, { xw: 12, decrab: false }), ['side_load'], [], {}, 'LH1 p.9-35, LH2');
evc('T-LH-26', 'drift 2 m/s ตอนแตะ', C, synth(C, { driftTD: 2 }), ['side_load'], [], {}, 'LH2 no side drift');
evc('T-LH-27', 'หันออก 15° ขณะวิ่ง > 15 kt', C, synth(C, { rolloutYaw: 15 }), ['dir_control'], [], {}, 'LH5 (ครึ่งหนึ่งของอุบัติเหตุลงจอด)');
evc('T-LH-28', 'แตะห่างเส้นกลาง 8 m', C, synth(C, { yTD: 8 }), ['off_centre'], [], { score: 91, tol: 0 }, 'R1 cl 6/15');
evc('T-LH-29', 'แตะก่อน threshold (GP origin −100 m)', C, synth({ ...C, aim: -100 }), ['short_landing'], [], { score: 20, tol: 0 }, 'R1 cap 20');
evc('T-LH-30', 'แตะเลยจุด (GP origin 600 m)', C, synth({ ...C, aim: 600 }), ['long_landing'], [], {}, 'LH2 400 ft');
evc('T-LH-31', 'C152 ลดกำลังไม่ดึง carb heat', PROFILES.c152, synth(PROFILES.c152, { carbHeat: false }), ['carb_heat'], [], {}, 'LH13 p.4-9');
evc('T-LH-32', 'mixture 0.7 ระหว่าง approach', PROFILES.c172m, synth(PROFILES.c172m, { mixture: 0.7 }), ['mixture'], [], {}, 'LH13');
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
  num('T-LH-51', 'C172S 67 KCAS แฟลป 30 path 3° ที่ MTOW 1,157 kg + แรงยก elevator (δe −8.8°, CLδe 0.42)', 'pitch θ (deg)', attitude(t, 30, 67, -3 * DEG).theta, 2.0, 0.3, 'บัตร 04 §04.7 ตาราง trim: θ 2.0° (ซิม + บัตร)'); }
num('T-LH-52', 'T-6A 200 KIAS level flaps UP, 2,575 kg', 'pitch θ (deg)', attitude(TYPES.t6a, 'UP', 200, 0).theta, 0.0, 1.0, 'LH14 Table 2.1: 0° (200 KIAS level)');

const nPass = results.filter(r => r.pass).length;
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'} ${r.id} ${r.cond} | ${r.qty}: ${r.got} | expect ${r.exp}${r.today != null ? ' | today ' + r.today : ''}`);
console.log(`\n${nPass}/${results.length} pass`);
fs.mkdirSync(path.join(HERE, 'out'), { recursive: true });
fs.writeFileSync(path.join(HERE, 'out', 'lh_tests.json'), JSON.stringify({ generated: 'lh_tests.mjs', pass: nPass, total: results.length, results }, null, 1) + '\n');
process.exitCode = nPass === results.length ? 0 : 1;
