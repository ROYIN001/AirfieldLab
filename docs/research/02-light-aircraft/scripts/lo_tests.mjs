#!/usr/bin/env node
// Topic 09 (LO) test cases T-LO-01..: expected values computed here from first principles, compared with
// lo_lib.mjs, and (where the current sim can measure it) with AirfieldLab's Evaluator and an autoland run.
// Run from the repo root. Writes scripts/out/lo_tests.json and lo_tests.md ($LM_OUT_DIR when set).
// Completeness fix 19 Nov 2026 (gap 25, D1, D6, gap 4):
//   - every row has an explicit tolerance: a number (|got - exp| <= tol), a per-element list, 'le' (got <= exp, an upper
//     bound) or 'exact' (logic, text and lists must match exactly);
//   - every row has a current-model result: a value measured on today's sim (test/harness.mjs) or "ไม่รองรับในซิมวันนี้";
//   - gate tests use the card speeds (D1): Vapp = speeds.VAPP_kt, and the current g500 gate is evaluated with AC.Vref set
//     to the card's speeds.VREF_kt (restored afterwards);
//   - new T-LO-31 (D1 Vapp, cross-file), T-LO-32 (D6 detent names), T-LO-33/34 (AIP facts from out/lo_aip_check.json).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { makeCircuit, toNE, turnRadius, defaultOffset, sinkForPath, windLeg, gateCheck, gateFor, checklistFor, checklistAudit, phaseOf, TYPES, KT, FT, NM, SM, G0, DEG } from './lo_lib.mjs';
import { mergeDir, loadType, leaf as cardLeaf, val, MASS_CORRECTED, outFile } from './lm_lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
// Repo root: $AIRFIELDLAB_ROOT first (lm_ci.mjs points it at the pinned sim snapshot), then the repo this folder sits
// in (docs/research/02-light-aircraft/scripts -> four levels up), the same order as lm_card.mjs.
const IN_REPO = path.resolve(HERE, '..', '..', '..', '..');
const ROOT = process.env.AIRFIELDLAB_ROOT || IN_REPO;
const { M } = await import(pathToFileURL(path.join(ROOT, 'test', 'harness.mjs')).href);
const OUT = new URL('./out/', import.meta.url);
const NS = 'ไม่รองรับในซิมวันนี้';
const T = [];
/** tol: number | number[] | 'le' (got <= exp) | 'exact' */
const add = (id, cond, qty, exp, tol, got, src, cur = NS) => {
  let pass;
  if (tol === 'exact') pass = JSON.stringify(got) === JSON.stringify(exp);
  else if (tol === 'le') pass = got <= exp;
  else if (Array.isArray(tol)) pass = exp.every((e, i) => Math.abs(got[i] - e) <= tol[i]);
  else pass = Math.abs(got - exp) <= tol;
  T.push({ id, cond, qty, exp, tol, got, pass, src, cur });
};
const r2 = (v, n = 1) => +(+v).toFixed(n);
const E = M.RWY_END;
const circ = (rwy, id, extra = {}) => makeCircuit({ L: E[rwy].lda, aim: E[rwy].aim, side: { '03R': 'R', '21L': 'L', '03L': 'L', '21R': 'R' }[rwy], hP_ft: TYPES[id].features.turboprop ? 1000 : 800, V: TYPES[id].V, roc_fpm: TYPES[id].roc_fpm, xLiftoff: TYPES[id].features.turboprop ? 700 : 400, ...extra });

// cards (D1, D6): one merge of the topic files, then resolve each id (inheritance included)
const merged = mergeDir(path.join(HERE, '..'), { checks: false, bases: false }).merged;
const card = (id) => loadType(id, { merged });
const cardV = (id, p) => cardLeaf(card(id), p)?.v;

// current sim: one calm autoland (trainer AC) to read the sink rate and the gate heights at 500 ft
const sim = (() => {
  const f = new M.Flight({ wind: M.SCENARIOS.calm, pilot: 'ap', seed: 5 }); let at500 = null, last = Infinity;
  while (f.ac.t < 260 && !f.ev.done && !f.crashed) {
    f.tick(f.dt); const a = f.ac.air, hft = a.h / M.FT;
    if (!at500 && last >= 500 && hft < 500) at500 = { gs: a.gs / M.KT, vs: a.vs / M.FT * 60, ias: a.ias / M.KT };
    last = hft;
  }
  return { at500, gates: Object.keys(f.ev.gates), crashed: f.crashed };
})();
// current g500 gate of Evaluator, with AC.Vref temporarily = the card's VREF of the type (today's sim has one type)
function curGate(s, id) {
  const c = card(id), det = val(c, 'aero.flaps.detents') || [], fmax = Math.max(...det.map((d) => d.flap_deg));
  const fd = det.find((d) => d.name === String(s.flaps)); const flapFrac = fd ? fd.flap_deg / fmax : 0;
  const F = new M.Flight(); const keep = M.AC.Vref; M.AC.Vref = cardV(id, 'speeds.VREF_kt');
  const gsDots = s.gsDots ?? (s.pathDeg - 3) / 0.35;   // FIELD.gsDot 0.35 deg per dot (src/20-flight.js:13)
  const fake = { air: { ias: s.ias * M.KT, vs: s.vs_fpm * M.FT / 60, locDots: s.locDots ?? 0, gsDots }, gearPos: s.gearDown ? 1 : 0, flaps: flapFrac };
  F.ev.gates = {}; F.ev.gateCheck(fake, 'g500'); M.AC.Vref = keep;
  const g = F.ev.gates.g500; return { ok: g.ok, fails: Object.keys(g.items).filter((k) => !g.items[k]), Vref: cardV(id, 'speeds.VREF_kt') };
}
const curTxt = (r) => `g500 ปัจจุบัน (AC.Vref = VREF บัตร ${r.Vref}): ${r.ok ? 'ผ่าน' : 'ไม่ผ่าน ' + r.fails.join(',')}`;

// 01 turn radius
{ const V = 90 * 0.514444, exp = V * V / (9.80665 * Math.tan(25 * Math.PI / 180));
  add('T-LO-01', 'level turn 90 KIAS (TAS), bank 25°', 'R (m)', r2(exp), 1, r2(turnRadius(90, 25)), 'physics, LO0', `${NS} (ไม่มีโหมดเลี้ยวระดับอัตโนมัติ)`); }
// 02 default downwind offset
{ const R = turnRadius(90, 25), exp = Math.min(1609.344, Math.max(804.672, 2 * R + 400));
  add('T-LO-02', 'c172s downwind 90 kt, bank 25°', 'D (m)', r2(exp), 1, r2(defaultOffset(90, 25)), 'LO3 p8-3 range; rule LO0 (est)', `${NS} (ไม่มีตัวสร้างวงจร)`); }
// 03, 04 circuit east of 03R/21L
for (const [id, rwy] of [['T-LO-03', '21L'], ['T-LO-04', '03R']]) {
  const c = circ(rwy, 'c172s'), ne = toNE(c, E[rwy]); const ab = ne.find((w) => w.k === 'abeam_threshold');
  const east = ab.e - E[rwy].thr[1];   // east offset of the abeam point from the threshold
  const exp = c.D * Math.abs(E[rwy].u[0]);   // the runway is ~029/209: east component of the lateral offset = D cos(28.75°)
  add(id, `VTBD ${rwy}, c172s, side ${c.p.side}`, 'east offset of downwind abeam threshold (m)', r2(exp, 0), 2, r2(east, 0), 'LO13/LO39 AD 2.20 4.2 (east of 03R/21L)', `${NS} (ไม่มีตัวสร้างวงจร; ใช้ RWY_END ของ repo)`);
}
// 05 final length on 21L for roll-out 400 ft on 3°
{ const exp = 400 * FT / Math.tan(3 * DEG) - E['21L'].aim;
  add('T-LO-05', `VTBD 21L, roll-out 400 ft, γ 3°, aim ${r2(E['21L'].aim)} m`, 'F (m)', r2(exp), 1, r2(circ('21L', 'c172s').F), 'LO4 p9-6 (3°), LO0', `${NS} (ฉาก approach ของซิมเริ่มบน GS ที่ระยะคงที่)`); }
// 06 the AFH 45° base rule with a 3° final rolls out below the 300 ft circuit gate
{ const c = circ('21L', 'c172s', { baseRule: '45' }); const exp = (c.D - turnRadius(75, 20) + E['21L'].aim) * Math.tan(3 * DEG) / FT;
  add('T-LO-06', 'VTBD 21L, c172s, base at 45° (X_B = −D), final 3°', 'roll-out height (ft)', r2(exp, 0), 1, r2(c.hRollFt, 0), 'LO3 p8-3 vs LO4 p9-6', `${NS} (ไม่มีวงจรและประตู 300 ft)`); }
// 07 ATZ containment, all types, four runways (upper bound, no margin)
{ let worst = 0; for (const rwy of ['21L', '03R', '03L', '21R']) for (const id of Object.keys(TYPES)) { const ne = toNE(circ(rwy, id), E[rwy]); worst = Math.max(worst, ...ne.map((w) => Math.hypot(w.n, w.e))); }
  add('T-LO-07', `${Object.keys(TYPES).length} types × 4 runways, default circuits`, 'largest waypoint distance from ARP (NM)', 5.0, 'le', r2(worst / NM, 2), 'LO13/LO39 AD 2.17 (ATZ 5 NM)', `${NS} (ไม่มีตัวสร้างวงจร)`); }
// 08 crosswind turn point and height (C172S, 03R)
{ const G = (730 * FT / 60) / (74 * KT); const xReach = 400 + (800 - 300) * FT / G; const exp = Math.max(E['03R'].lda, xReach);
  const c = circ('03R', 'c172s');
  add('T-LO-08', 'VTBD 03R, c172s, ROC 730 fpm at 74 KIAS', 'x of crosswind turn (m) [= runway end]', r2(exp, 0), 1, r2(c.xCw, 0), 'LO1, LO2 11.7', `${NS} (ไม่มีฉากวิ่งขึ้นและวงจร)`); }
// 09 descent angle abeam -> roll-out
{ const c = circ('21L', 'c172s'); const S1 = (c.F + c.Rf) + c.D + c.Rf - (2 - Math.PI / 2) * (c.Rb + c.Rf); const exp = Math.atan((800 - 400) * FT / S1) / DEG;
  add('T-LO-09', 'VTBD 21L, c172s, 800 → 400 ft', 'mean descent angle before final (°)', r2(exp, 2), 0.01, r2(c.descentDeg, 2), 'LO0', `${NS} (ไม่มีวงจร)`); }
// 10 3° sink vs AC 91-79A rule of thumb; current model: the sim's calm autoland at 500 ft
{ const exp = 65 * 1852 / 60 / FT * Math.tan(3 * DEG); const a = sim.at500;
  const cur = a ? `autoland ลมสงบ ที่ 500 ft: GS ${r2(a.gs)} kt, จม ${r2(-a.vs, 0)} fpm = ${r2(-a.vs / a.gs, 2)} × GS (3° ให้ ${r2(sinkForPath(a.gs), 0)} fpm, ต่าง ${r2((-a.vs / sinkForPath(a.gs) - 1) * 100)} %)` : 'autoland ไม่ถึง 500 ft';
  add('T-LO-10', 'GS 65 kt, γ 3°', 'sink (fpm) [rule 5×GS = 325]', r2(exp, 0), 1, r2(sinkForPath(65), 0), 'LO9 App 1 3.c', cur); }
// 11 wind correction on downwind (two numbers, each with its own tolerance)
{ const trk = 28.75, rel = (90 - trk) * DEG; const crab = Math.asin(10 * Math.sin(rel) / 90) / DEG; const gs = 90 * Math.cos(crab * DEG) - 10 * Math.cos(rel);
  const w = windLeg(trk, 90, 90, 10);
  add('T-LO-11', '21L downwind track 028.75°, 90 kt, wind 090/10', 'crab (°) / GS (kt)', [r2(crab, 2), r2(gs, 2)], [0.01, 0.01], [r2(w.crab, 2), r2(w.gs, 2)], 'LO3 p8-2, p8-4', `${NS} (autopilot ไม่บินขา downwind)`); }
// 12-18 gate checks on synthetic approaches. D1: Vapp from the cards via TYPES (c172s 65, landing flaps 20/30; da42ng 84, retract)
const ty = (id) => ({ Vapp: TYPES[id].V.final, landingFlaps: TYPES[id].landingFlaps, retract: !!TYPES[id].features.retract });
const c172 = ty('c172s'), da42 = ty('da42ng');
const base = { ias: 66, vs_fpm: -650, bank: 3, pathDeg: 3.0, locDots: 0.2, flaps: '30', gearDown: true, gust: 0 };
const g = (s, t) => gateCheck({ ...base, ...s }, t);
const OF = ({ ok, fails }) => ({ ok, fails });
add('T-LO-12', `c172s (Vapp ${c172.Vapp}) at 300 ft: 66 KIAS, −650 fpm, bank 3°, path 3.0°, flaps 30`, 'gate result', { ok: true, fails: [] }, 'exact', OF(g({}, c172)), 'LO4 p9-6, LO8', curTxt(curGate({ ...base }, 'c172s')));
add('T-LO-13', `same, 78 KIAS (Vapp + ${78 - c172.Vapp})`, 'gate result', { ok: false, fails: ['spd'] }, 'exact', OF(g({ ias: 78 }, c172)), 'LO4 p9-6 (+10/−5), LO36', curTxt(curGate({ ...base, ias: 78 }, 'c172s')));
add('T-LO-14', 'same, −1,100 fpm', 'gate result', { ok: false, fails: ['sink'] }, 'exact', OF(g({ vs_fpm: -1100 }, c172)), 'LO8 (≤ 1,000 fpm)', curTxt(curGate({ ...base, vs_fpm: -1100 }, 'c172s')));
add('T-LO-15', 'same, bank 20° (still in the final turn)', 'gate result', { ok: false, fails: ['bank'] }, 'exact', OF(g({ bank: 20 }, c172)), 'LO4 p9-6 (≤ 15°), LO18', curTxt(curGate({ ...base, bank: 20 }, 'c172s')) + ' (ไม่มีข้อ bank)');
add('T-LO-16', 'same, path 3.6° (PAPI four white)', 'gate result', { ok: false, fails: ['path'] }, 'exact', OF(g({ pathDeg: 3.6 }, c172)), 'LO8; PAPI 2.5–3.5° (repo)', curTxt(curGate({ ...base, pathDeg: 3.6 }, 'c172s')) + ' (GS +1.7 dot)');
add('T-LO-17', `da42ng ${da42.Vapp} KIAS, flaps LDG, gear UP`, 'gate result', { ok: false, fails: ['cfg'] }, 'exact', OF(g({ ias: 84, flaps: 'LDG', gearDown: false }, da42)), 'LO8, LO9 App 1 3.a', curTxt(curGate({ ...base, ias: 84, flaps: 'LDG', gearDown: false }, 'da42ng')));
{ const a = g({ ias: 78, gust: 10 }, c172), b = g({ ias: 78, gust: 0 }, c172), ca = curGate({ ...base, ias: 78 }, 'c172s');
  add('T-LO-18', 'c172s 78 KIAS with gust factor 10 kt vs none', 'pass with gust / without', 'true / false', 'exact', `${a.ok} / ${b.ok}`, 'LO5 p9-20 (½ gust), LO4', `g500 ปัจจุบัน: ${ca.ok} / ${ca.ok} (ไม่มีส่วนเพิ่ม gust)`); }
add('T-LO-19', 'gate height: vfr_circuit / vmc_straight_in / imc', 'ft', [300, 500, 1000], [0, 0, 0], [gateFor('vfr_circuit'), gateFor('vmc_straight_in'), gateFor('imc')], 'LO4 p9-6, LO8, LO9, LO18',
  `ซิมวันนี้ตรวจ ${sim.gates.join(', ')} = ${sim.gates.map((k) => k.slice(1)).join(' / ')} ft (ไม่มี 300 และ 1000)`);
// 20 current AirfieldLab g500 vs proposal. Review 2026-11-19: the proposed window is centred on the type's approach speed,
// and the sim trainer flies Vapp = AC.Vapp (95, = trainer_r2 card VAPP), not Vref (88). Two speeds separate the gates:
// Vapp + 12 (= Vref + 19) and Vref - 3.
{ const F = new M.Flight(); const Vref = M.AC.Vref, Vapp = M.AC.Vapp;
  const cur = [], prop = [];
  for (const ias of [Vapp + 12, Vref - 3]) {
    const fake = { air: { ias: ias * M.KT, vs: -700 * M.FT / 60, locDots: 0.2, gsDots: 0.3 }, gearPos: 1, flaps: 1 };
    F.ev.gates = {}; F.ev.gateCheck(fake, 'g500'); cur.push(F.ev.gates.g500.ok);
    prop.push(gateCheck({ ias, vs_fpm: -700, bank: 0, gsDots: 0.3, locDots: 0.2, flaps: 'LDG', gearDown: true }, { Vapp, landingFlaps: TYPES.trainer_r2.landingFlaps, retract: true }).ok);
  }
  add('T-LO-20', `AirfieldLab trainer Vref ${Vref} / Vapp ${Vapp}, 500 ft on GS/LOC, IAS ${Vapp + 12} and ${Vref - 3} KIAS`, 'current g500 / proposed gate (both speeds)', 'true,true / false,false', 'exact', `${cur.join(',')} / ${prop.join(',')}`, 'src/20-flight.js 485–493; LO4 p9-6; LO36', `ปัจจุบัน ${cur.join(',')} (ช่อง Vref−5…+20 = ${Vref - 5}–${Vref + 20})`); }
// 21 checklist content by type
{ const has = (id, ph, it) => checklistFor(TYPES[id])[ph].some((i) => i.id === it);
  const got = [has('c172s', 'before_landing', 'gear_down'), has('c172s', 'before_landing', 'carb_heat_on'), has('pa28_161', 'before_landing', 'carb_heat_on'), has('da42ng', 'before_landing', 'gear_down'), has('da42ng', 'before_landing', 'prop_high'), has('da42ng', 'emergency_efato', 'feather_secure'), has('c152', 'emergency_efato', 'pitch_glide')].join(',');
  add('T-LO-21', 'items: c172s gear/carb, pa28 carb, da42 gear/prop/feather, c152 glide', 'present?', 'false,false,true,true,false,true,true', 'exact', got, 'LO0 (features from LO19–LO33, LT2)', `${NS} (ไม่มี checklist)`); }
// 22 checklist deadline audit
{ const done = {}; for (const it of checklistFor(TYPES.c172s).before_landing) done[it.id] = 'abeam_threshold'; done.landing_clearance = 'base_turn';
  for (const it of checklistFor(TYPES.c172s).final) done[it.id] = 'gate';
  add('T-LO-22', 'c172s: before-landing items at abeam, landing clearance at base turn', 'late / missing', JSON.stringify({ missing: [], late: ['landing_clearance'] }), 'exact', JSON.stringify(checklistAudit(TYPES.c172s, done)), 'LO17 p15, LO18 (checklist on downwind)', `${NS} (ไม่มี checklist)`); }
// 23 phase classification of a synthetic touch-and-go trace
{ const trace = [
    { onGround: true, gs: 0 }, { onGround: true, gs: 10, ias: 8 }, { onGround: true, gs: 50, ias: 50, thrHigh: true },
    { onGround: false, vs_fpm: 700, h_ft: 300, leg: 'upwind' }, { onGround: false, vs_fpm: 0, h_ft: 800, leg: 'downwind' },
    { onGround: false, vs_fpm: -350, h_ft: 400, leg: 'final' }, { onGround: true, gs: 40, ias: 40, wasAirborne: true }];
  add('T-LO-23', 'synthetic circuit trace (7 samples)', 'phases', 'parked,taxi,takeoff,after_takeoff,before_landing,final,after_landing', 'exact', trace.map(phaseOf).join(','), 'LO0', `${NS} (ซิมมีเฉพาะ approach และ rollout)`); }
// 24 circuit time
{ const c = circ('21L', 'c172s'); const exp = c.legs.reduce((a, l) => a + l.len / (l.V * KT), 0) / 60;
  add('T-LO-24', 'VTBD 21L c172s, no wind (lift-off → aim)', 'circuit time (min)', r2(exp, 2), 0.01, r2(c.timeS / 60, 2), 'LO0', `${NS} (ไม่มีวงจร)`); }
// 25 separation of the east circuit from the 03L/21R centreline (smallest circuit of the c152 group)
{ const c = circ('21L', 'c152'), ne = toNE(c, E['21L']); const ab = ne.find((w) => w.k === 'abeam_threshold'); const O = E['21R'];
  const lat = -((ab.n - O.thr[0]) * O.r[0] + (ab.e - O.thr[1]) * O.r[1]);
  const sep = Math.abs((E['21L'].thr[0] - O.thr[0]) * O.r[0] + (E['21L'].thr[1] - O.thr[1]) * O.r[1]);
  add('T-LO-25', 'c152 downwind (21L, east) vs runway 21R centreline', 'lateral distance (m) = D + runway spacing', r2(c.D + sep, 0), 2, r2(lat, 0), 'LO13/LO39 AD 2.20 4.2; repo geometry', `${NS} (ไม่มีวงจร; ระยะห่างทางวิ่ง ${r2(sep, 0)} m จาก RWY_END)`); }
// 26 multi-engine base speed vs VYSE rule
{ const bad = Object.entries(TYPES).filter(([, t]) => t.features.twin && t.VYSE && t.V.base < t.VYSE).map(([k]) => k);
  add('T-LO-26', 'twins: base speed ≥ VYSE (AFH: not below VYSE until landing assured)', 'types violating', '[]', 'exact', JSON.stringify(bad), 'LO7 p13-20', `${NS} (ซิมมีแบบเดียว เครื่องยนต์เดียว)`); }
// 27 heights fall monotonically from abeam to the aim point for every type and runway
{ const bad = []; for (const rwy of ['21L', '03R', '03L', '21R']) for (const id of Object.keys(TYPES)) { const w = circ(rwy, id).wp; const k = w.findIndex((x) => x.k === 'abeam_threshold');
    for (let i = k + 1; i < w.length; i++) if (w[i].h > w[i - 1].h + 1e-6) bad.push(`${rwy}:${id}`); }
  add('T-LO-27', `${Object.keys(TYPES).length} types × 4 runways: abeam → base → final turn → roll-out → aim`, 'non-monotonic profiles', '[]', 'exact', JSON.stringify([...new Set(bad)]), 'LO3 p8-3 (descend from abeam), LO0', `${NS} (ไม่มีวงจร)`); }
// 28 (review) gust correction moves both bounds of the speed window [LO36 PA.IV.B.S7, LO5 p9-20]
{ const V = c172.Vapp, exp = [V + 5 - 5, V + 5 + 10]; const w = gateCheck({ ...base, ias: 62, gust: 10 }, c172);   // 62 passed the first draft's window 60–80
  add('T-LO-28', `c172s Vapp ${V}, gust factor 10 kt (add 5), IAS 62`, 'speed window (KIAS) / spd item', `${exp[0]}–${exp[1]} / false`, 'exact', `${w.window[0]}–${w.window[1]} / ${w.items.spd}`, 'LO5 p9-20; LO36 PA.IV.B.S7 (+10/−5 with gust factor applied)', curTxt(curGate({ ...base, ias: 62 }, 'c172s')) + ' (ไม่มีส่วนเพิ่ม gust)'); }
// 29 (review) fast types: the downwind offset is widened to keep a straight base leg of >= 200 m (trainer_r2, 21L)
{ const t = TYPES.trainer_r2.V; const Rb = turnRadius(t.abeam, 25), Rf = turnRadius(t.base, 20);
  const exp = Math.max(Math.min(SM, Math.max(0.5 * SM, 2 * turnRadius(t.downwind, 25) + 400)), Rb + Rf + 200);
  const c = circ('21L', 'trainer_r2');
  add('T-LO-29', 'trainer_r2 (V downwind 140 / abeam 120 / base 110 KIAS), 21L, 1,000 ft', 'D (m) = max(clamp(2R+400), R_b+R_f+200)', r2(exp, 0), 1, r2(c.D, 0), 'LO3 p8-3; LO0 (est)', `${NS} (ไม่มีวงจร)`); }
// 30 (review) sub-variant checklists: the Lycoming DA40 has mixture, magnetos and a prop lever; the DA40 NG (FADEC) has none
{ const has = (id, ph, it) => checklistFor(TYPES[id])[ph].some((i) => i.id === it);
  const got = ['da40_180', 'da40ng'].map((id) => [has(id, 'before_landing', 'mixture_rich'), has(id, 'before_takeoff', 'runup_mag'), has(id, 'before_landing', 'prop_high')].join(',')).join(' / ');
  add('T-LO-30', 'items mixture_rich / runup_mag / prop_high: da40_180 vs da40ng', 'present?', 'true,true,true / false,false,false', 'exact', got, 'LO0; features from LD1/LD6 (IO-360-M1A, MTV-12) and LD2 (AE300 FADEC)', `${NS} (ไม่มี checklist)`); }
// 31 (fix 19 Nov 2026, D1) every Vapp of topic 09 equals the card VAPP of the same type (±0.5 kt) unless the note says
// "แก้มวล": lo_lib V.final, procedures.stabilised.v.Vapp and procedures.pattern.v.final of the merged (resolved) cards
const IDS = [...Object.keys(TYPES), 'da42_vi'];
{ const bad = [];
  for (const id of IDS) { const c = card(id); const V = cardV(id, 'speeds.VAPP_kt');
    const st = cardLeaf(c, 'procedures.stabilised'), pt = cardLeaf(c, 'procedures.pattern');
    const vals = { lib: TYPES[id]?.V.final, stabilised: st?.v?.Vapp, pattern: pt?.v?.final };
    for (const [k, x] of Object.entries(vals)) if (x != null && Math.abs(x - V) > 0.5 && !(k === 'stabilised' && MASS_CORRECTED.test(st.note || ''))) bad.push(`${id}.${k} ${x}≠${V}`); }
  add('T-LO-31', `${IDS.length} ids (incl. inheriting da42_vi): lo_lib final, procedures.stabilised.Vapp, procedures.pattern.final vs card speeds.VAPP_kt`, 'mismatches > 0.5 kt (D1)', '[]', 'exact', JSON.stringify(bad), 'D1; cards 04–07, 10–13 (via lm_lib.loadType)',
    `ซิมวันนี้: AC.Vapp ${M.AC.Vapp} = Vapp ของ trainer_r2 ${TYPES.trainer_r2.V.final} (${M.AC.Vapp === TYPES.trainer_r2.V.final ? 'ตรง' : 'ไม่ตรง'})`); }
// 32 (fix 19 Nov 2026, D6) every flap name in procedures.* is a detent name of the card (aero.flaps.detents[].name)
{ const bad = [];
  for (const id of IDS) { const c = card(id); const names = new Set((val(c, 'aero.flaps.detents') || []).map((d) => String(d.name))); const pr = val(c, 'procedures') ?? {};
    const pv = (k) => cardLeaf(c, 'procedures.' + k)?.v;
    const used = [...(pv('stabilised')?.landingFlaps ?? []), ...Object.values(pv('pattern')?.flapsAt ?? {}), ...(pv('go_around')?.flapsSeq ?? []),
      ...['short_field', 'soft_field'].flatMap((k) => ['takeoff', 'landing'].map((p) => pv(k)?.[p]?.flaps).filter((x) => x != null))];
    for (const n of used) if (!names.has(String(n))) bad.push(`${id}:${n}`); }
  add('T-LO-32', `${IDS.length} ids: flap names in procedures.{stabilised, pattern, go_around, short_field, soft_field}`, 'names not in the card detents (D6)', '[]', 'exact', JSON.stringify([...new Set(bad)]), 'D6; aero.flaps.detents of cards 04–07, 10–13', `${NS} (แฟลปในซิมเป็นค่าต่อเนื่อง AC.flaps 0–1 ไม่มีชื่อ detent)`); }
// 33, 34 (fix 19 Nov 2026, gap 4) AIP facts read by lo_aip_check.mjs (network) from out/lo_aip_check.json (offline here)
{ let A = null; try { A = JSON.parse(fs.readFileSync(new URL('lo_aip_check.json', OUT), 'utf8')); } catch { /* not run yet */ }
  const eds = ['2026-05-14', '2026-07-09', '2026-10-29'];
  const f = (d) => A?.editions?.[d];
  const row33 = eds.map((d) => f(d) ? [f(d).freq_MHz.TWR, f(d).freq_MHz.GND?.join('/'), f(d).freq_MHz.DEL, f(d).freq_MHz.ATIS_arr, f(d).freq_MHz.ATIS_dep, f(d).ad220_items.vacate21L_holdShort21R?.item, f(d).ad220_items.clearanceTOLDG, f(d).ad222_items.speed250].join(' ') : 'missing');
  const exp33 = '118.1 121.9/122.5 127.7 126.4 118.55 6.3 7.3 4.1.2';
  const same = (row) => (new Set(row).size === 1 && !row.includes('missing') ? `ทั้ง 3 ฉบับ: ${row[0]}` : row.join(' / '));
  add('T-LO-33', 'AIP AD 2 VTBD AIRAC 14 MAY / 9 JUL / 29 OCT 2026: TWR, GND, DEL, ATIS arr/dep (MHz); AD 2.20 items of the 21L hold-short warning and the clearance rule; AD 2.22 item of 250 kt', 'values per edition', `ทั้ง 3 ฉบับ: ${exp33}`, 'exact', same(row33), `LO39, LS20; lo_aip_check.mjs run ${A?.run ?? '–'}`, `${NS} (UI ไม่มีความถี่และวงจร; repo ใช้ AIRAC 14 MAY 2026)`);
  const row34 = eds.map((d) => f(d) ? `${f(d).ad222_items.trainingArea} ${f(d).ad222_items.reportingPoints} ${f(d).ad222_items.trainOut && f(d).ad222_items.trainBack}` : 'missing');
  add('T-LO-34', 'AIP AD 2.22 same editions: training-area designator in 9.2, reporting points in the 8.5.2 table, training route out/back at 1,000 ft', 'designator, count, route found', ['D72 26 true', 'D72 26 true', 'D6A,D6B 26 true'], 'exact', row34, `LO39, LS20, LS37; lo_aip_check.mjs run ${A?.run ?? '–'}`, `${NS} (ไม่มีเส้นทาง VFR)`); }

fs.writeFileSync(outFile('lo_tests.json'), JSON.stringify({ run: new Date().toISOString().slice(0, 10), sim: sim.at500 && { at500: sim.at500, gates: sim.gates }, tests: T }, null, 1));
const fmtV = (v) => (Array.isArray(v) ? v.join(' / ') : typeof v === 'object' ? JSON.stringify(v) : String(v));
const fmtExp = (t) => t.tol === 'exact' ? `${fmtV(t.exp)} (ตรงทุกตัว)` : t.tol === 'le' ? `≤ ${t.exp} (ขอบบน ไม่มีส่วนเผื่อ)` : Array.isArray(t.tol) ? `${fmtV(t.exp)} ± ${t.tol.join(' / ')}` : `${t.exp} ± ${t.tol}`;
const md = ['| รหัส | เงื่อนไข | ปริมาณที่วัด | ผลคาดหวัง ± tolerance | ที่มา | โมเดลปัจจุบัน | lo_lib |', '|---|---|---|---|---|---|---|'];
for (const t of T) md.push(`| ${t.id} | ${t.cond} | ${t.qty} | ${fmtExp(t)} | ${t.src} | ${t.cur} | ${fmtV(t.got)} ${t.pass ? '✓' : '✗'} |`);
fs.writeFileSync(outFile('lo_tests.md'), md.join('\n') + '\n');
console.log(md.join('\n'));
console.log(`\n${T.filter((t) => t.pass).length}/${T.length} pass`);
process.exitCode = T.every((t) => t.pass) ? 0 : 1;
