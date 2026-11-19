#!/usr/bin/env node
// Topic 09 (LO) test cases T-LO-01..: expected values computed here from first principles, compared with
// lo_lib.mjs, and (where the current sim can measure it) with AirfieldLab's Evaluator. Run from the repo root.
// Writes scripts/out/lo_tests.json and lo_tests.md.
import fs from 'node:fs';
import { makeCircuit, toNE, turnRadius, defaultOffset, sinkForPath, windLeg, gateCheck, gateFor, checklistFor, checklistAudit, phaseOf, TYPES, KT, FT, NM, SM, G0, DEG } from './lo_lib.mjs';

const ROOT = process.env.AIRFIELDLAB_ROOT || decodeURIComponent(new URL('../../../../', import.meta.url).pathname).replace(/\/$/, '');
const { M } = await import(ROOT + '/test/harness.mjs');
const OUT = new URL('./out/', import.meta.url);
const T = [];
const add = (id, cond, qty, exp, tol, got, src, cur = '–') => {
  const pass = typeof exp === 'number' ? Math.abs(got - exp) <= tol : JSON.stringify(got) === JSON.stringify(exp);
  T.push({ id, cond, qty, exp, tol, got, pass, src, cur });
};
const r2 = (v, n = 1) => +(+v).toFixed(n);
const E = M.RWY_END;
const circ = (rwy, id, extra = {}) => makeCircuit({ L: E[rwy].lda, aim: E[rwy].aim, side: { '03R': 'R', '21L': 'L', '03L': 'L', '21R': 'R' }[rwy], hP_ft: TYPES[id].features.turboprop ? 1000 : 800, V: TYPES[id].V, roc_fpm: TYPES[id].roc_fpm, xLiftoff: TYPES[id].features.turboprop ? 700 : 400, ...extra });

// 01 turn radius
{ const V = 90 * 0.514444, exp = V * V / (9.80665 * Math.tan(25 * Math.PI / 180));
  add('T-LO-01', 'level turn 90 KIAS (TAS), bank 25°', 'R (m)', r2(exp), 1, r2(turnRadius(90, 25)), 'physics, LO0'); }
// 02 default downwind offset
{ const R = turnRadius(90, 25), exp = Math.min(1609.344, Math.max(804.672, 2 * R + 400));
  add('T-LO-02', 'c172s downwind 90 kt, bank 25°', 'D (m)', r2(exp), 1, r2(defaultOffset(90, 25)), 'LO3 p8-3 range; rule LO0 (est)'); }
// 03, 04 circuit east of 03R/21L
for (const [id, rwy] of [['T-LO-03', '21L'], ['T-LO-04', '03R']]) {
  const c = circ(rwy, 'c172s'), ne = toNE(c, E[rwy]); const ab = ne.find((w) => w.k === 'abeam_threshold');
  const east = ab.e - E[rwy].thr[1];   // east offset of the abeam point from the threshold
  const exp = c.D * Math.abs(E[rwy].u[0]);   // the runway is ~029/209: east component of the lateral offset = D cos(28.75°)
  add(id, `VTBD ${rwy}, c172s, side ${c.p.side}`, 'east offset of downwind abeam threshold (m)', r2(exp, 0), 2, r2(east, 0), 'LO13 AD 2.20 4.2 (east of 03R/21L)');
}
// 05 final length on 21L for roll-out 400 ft on 3°
{ const exp = 400 * FT / Math.tan(3 * DEG) - E['21L'].aim;
  add('T-LO-05', 'VTBD 21L, roll-out 400 ft, γ 3°, aim 308.2 m', 'F (m)', r2(exp), 1, r2(circ('21L', 'c172s').F), 'LO4 p9-6 (3°), LO0'); }
// 06 the AFH 45° base rule with a 3° final rolls out below the 300 ft circuit gate
{ const c = circ('21L', 'c172s', { baseRule: '45' }); const exp = (c.D - turnRadius(75, 20) + E['21L'].aim) * Math.tan(3 * DEG) / FT;
  add('T-LO-06', 'VTBD 21L, c172s, base at 45° (X_B = −D), final 3°', 'roll-out height (ft)', r2(exp, 0), 1, r2(c.hRollFt, 0), 'LO3 p8-3 vs LO4 p9-6', 'roll-out < 300 ft → gate ไม่ผ่าน'); }
// 07 ATZ containment, all types, four runways
{ let worst = 0; for (const rwy of ['21L', '03R', '03L', '21R']) for (const id of Object.keys(TYPES)) { const ne = toNE(circ(rwy, id), E[rwy]); worst = Math.max(worst, ...ne.map((w) => Math.hypot(w.n, w.e))); }
  add('T-LO-07', `${Object.keys(TYPES).length} types × 4 runways, default circuits`, 'all waypoints within 5 NM of ARP (max NM)', 'true (2.85)', 0, `${worst <= 5 * NM} (${r2(worst / NM, 2)})`, 'LO13 AD 2.17 (ATZ 5 NM)'); }
// 08 crosswind turn point and height (C172S, 03R)
{ const G = (730 * FT / 60) / (74 * KT); const xReach = 400 + (800 - 300) * FT / G; const exp = Math.max(E['03R'].lda, xReach);
  const c = circ('03R', 'c172s');
  add('T-LO-08', 'VTBD 03R, c172s, ROC 730 fpm at 74 KIAS', 'x of crosswind turn (m) [= runway end]', r2(exp, 0), 1, r2(c.xCw, 0), 'LO1, LO2 11.7'); }
// 09 descent angle abeam -> roll-out
{ const c = circ('21L', 'c172s'); const S1 = (c.F + c.Rf) + c.D + c.Rf - (2 - Math.PI / 2) * (c.Rb + c.Rf); const exp = Math.atan((800 - 400) * FT / S1) / DEG;
  add('T-LO-09', 'VTBD 21L, c172s, 800 → 400 ft', 'mean descent angle before final (°)', r2(exp, 2), 0.01, r2(c.descentDeg, 2), 'LO0'); }
// 10 3° sink vs AC 91-79A rule of thumb
{ const exp = 65 * 1852 / 60 / FT * Math.tan(3 * DEG);
  add('T-LO-10', 'GS 65 kt, γ 3°', 'sink (fpm) [rule 5×GS = 325]', r2(exp, 0), 1, r2(sinkForPath(65), 0), 'LO9 App 1 3.c'); }
// 11 wind correction on downwind
{ const trk = 28.75, rel = (90 - trk) * DEG; const crab = Math.asin(10 * Math.sin(rel) / 90) / DEG; const gs = 90 * Math.cos(crab * DEG) - 10 * Math.cos(rel);
  const w = windLeg(trk, 90, 90, 10);
  add('T-LO-11', '21L downwind track 028.75°, 90 kt, wind 090/10', 'crab (°) / GS (kt)', `${r2(crab, 2)} / ${r2(gs, 2)}`, 0, `${r2(w.crab, 2)} / ${r2(w.gs, 2)}`, 'LO3 p8-2, p8-4'); }
// 12-18 gate checks on synthetic approaches (C172S Vapp 65, landing flaps 20/30; DA42 Vapp 84, retract)
const c172 = { Vapp: 65, landingFlaps: ['20', '30'], retract: false }, da42 = { Vapp: 84, landingFlaps: ['LDG', 'APP'], retract: true };
const base = { ias: 66, vs_fpm: -650, bank: 3, pathDeg: 3.0, locDots: 0.2, flaps: '30', gearDown: true, gust: 0 };
const g = (s, t) => gateCheck({ ...base, ...s }, t);
add('T-LO-12', 'c172s at 300 ft: 66 KIAS, −650 fpm, bank 3°, path 3.0°, flaps 30', 'gate result', { ok: true, fails: [] }, 0, (({ ok, fails }) => ({ ok, fails }))(g({}, c172)), 'LO4 p9-6, LO8');
add('T-LO-13', 'same, 78 KIAS (Vapp + 13)', 'gate result', { ok: false, fails: ['spd'] }, 0, (({ ok, fails }) => ({ ok, fails }))(g({ ias: 78 }, c172)), 'LO4 p9-6 (+10/−5), LO36');
add('T-LO-14', 'same, −1,100 fpm', 'gate result', { ok: false, fails: ['sink'] }, 0, (({ ok, fails }) => ({ ok, fails }))(g({ vs_fpm: -1100 }, c172)), 'LO8 (≤ 1,000 fpm)');
add('T-LO-15', 'same, bank 20° (still in the final turn)', 'gate result', { ok: false, fails: ['bank'] }, 0, (({ ok, fails }) => ({ ok, fails }))(g({ bank: 20 }, c172)), 'LO4 p9-6 (≤ 15°), LO18');
add('T-LO-16', 'same, path 3.6° (PAPI four white)', 'gate result', { ok: false, fails: ['path'] }, 0, (({ ok, fails }) => ({ ok, fails }))(g({ pathDeg: 3.6 }, c172)), 'LO8; PAPI 2.5–3.5° (repo)');
add('T-LO-17', 'da42ng 84 KIAS, flaps LDG, gear UP', 'gate result', { ok: false, fails: ['cfg'] }, 0, (({ ok, fails }) => ({ ok, fails }))(g({ ias: 84, flaps: 'LDG', gearDown: false }, da42)), 'LO8, LO9 App 1 3.a');
{ const a = g({ ias: 78, gust: 10 }, c172), b = g({ ias: 78, gust: 0 }, c172);
  add('T-LO-18', 'c172s 78 KIAS with gust factor 10 kt vs none', 'pass with gust / without', 'true / false', 0, `${a.ok} / ${b.ok}`, 'LO5 p9-20 (½ gust), LO4'); }
add('T-LO-19', 'gate height: vfr_circuit / vmc_straight_in / imc', 'ft', '300 / 500 / 1000', 0, `${gateFor('vfr_circuit')} / ${gateFor('vmc_straight_in')} / ${gateFor('imc')}`, 'LO4 p9-6, LO8, LO9, LO18');
// 20 current AirfieldLab g500 vs proposal. Review 2026-11-19: the proposed window is centred on the type's approach speed,
// and the sim trainer flies Vapp = AC.Vapp (95), not Vref (88). The first draft used Vapp = Vref (IAS Vref + 15 = 103 KIAS),
// which passes the proposed gate once Vapp 95 is used. Two speeds now separate the gates: Vapp + 12 (= Vref + 19) and Vref - 3.
{ const F = new M.Flight(); const Vref = M.AC.Vref, Vapp = M.AC.Vapp;
  const cur = [], prop = [];
  for (const ias of [Vapp + 12, Vref - 3]) {
    const fake = { air: { ias: ias * M.KT, vs: -700 * M.FT / 60, locDots: 0.2, gsDots: 0.3 }, gearPos: 1, flaps: 1 };
    F.ev.gates = {}; F.ev.gateCheck(fake, 'g500'); cur.push(F.ev.gates.g500.ok);
    prop.push(gateCheck({ ias, vs_fpm: -700, bank: 0, gsDots: 0.3, locDots: 0.2, flaps: 'LDG', gearDown: true }, { Vapp, landingFlaps: TYPES.trainer_r2.landingFlaps, retract: true }).ok);
  }
  add('T-LO-20', `AirfieldLab trainer Vref ${Vref} / Vapp ${Vapp}, 500 ft on GS/LOC, IAS ${Vapp + 12} and ${Vref - 3} KIAS`, 'current g500 / proposed gate (both speeds)', 'true,true / false,false', 0, `${cur.join(',')} / ${prop.join(',')}`, 'src/20-flight.js 485–493; LO4 p9-6; LO36', `ปัจจุบัน ${cur.join(',')} (ช่อง Vref−5…+20 = ${Vref - 5}–${Vref + 20})`); }
// 21 checklist content by type
{ const has = (id, ph, it) => checklistFor(TYPES[id])[ph].some((i) => i.id === it);
  const got = [has('c172s', 'before_landing', 'gear_down'), has('c172s', 'before_landing', 'carb_heat_on'), has('pa28_161', 'before_landing', 'carb_heat_on'), has('da42ng', 'before_landing', 'gear_down'), has('da42ng', 'before_landing', 'prop_high'), has('da42ng', 'emergency_efato', 'feather_secure'), has('c152', 'emergency_efato', 'pitch_glide')].join(',');
  add('T-LO-21', 'items: c172s gear/carb, pa28 carb, da42 gear/prop/feather, c152 glide', 'present?', 'false,false,true,true,false,true,true', 0, got, 'LO0 (features from LO19–LO33, LT2)'); }
// 22 checklist deadline audit
{ const done = {}; for (const it of checklistFor(TYPES.c172s).before_landing) done[it.id] = 'abeam_threshold'; done.landing_clearance = 'base_turn';
  for (const it of checklistFor(TYPES.c172s).final) done[it.id] = 'gate';
  add('T-LO-22', 'c172s: before-landing items at abeam, landing clearance at base turn', 'late / missing', JSON.stringify({ missing: [], late: ['landing_clearance'] }), 0, JSON.stringify(checklistAudit(TYPES.c172s, done)), 'LO17 p15, LO18 (checklist on downwind)'); }
// 23 phase classification of a synthetic touch-and-go trace
{ const trace = [
    { onGround: true, gs: 0 }, { onGround: true, gs: 10, ias: 8 }, { onGround: true, gs: 50, ias: 50, thrHigh: true },
    { onGround: false, vs_fpm: 700, h_ft: 300, leg: 'upwind' }, { onGround: false, vs_fpm: 0, h_ft: 800, leg: 'downwind' },
    { onGround: false, vs_fpm: -350, h_ft: 400, leg: 'final' }, { onGround: true, gs: 40, ias: 40, wasAirborne: true }];
  add('T-LO-23', 'synthetic circuit trace (7 samples)', 'phases', 'parked,taxi,takeoff,after_takeoff,before_landing,final,after_landing', 0, trace.map(phaseOf).join(','), 'LO0'); }
// 24 circuit time
{ const c = circ('21L', 'c172s'); const exp = c.legs.reduce((a, l) => a + l.len / (l.V * KT), 0) / 60;
  add('T-LO-24', 'VTBD 21L c172s, no wind (lift-off → aim)', 'circuit time (min)', r2(exp, 2), 0.01, r2(c.timeS / 60, 2), 'LO0'); }
// 25 separation of the east circuit from the 03L/21R centreline (smallest circuit: c152)
{ const c = circ('21L', 'c152'), ne = toNE(c, E['21L']); const ab = ne.find((w) => w.k === 'abeam_threshold'); const O = E['21R'];
  const lat = -((ab.n - O.thr[0]) * O.r[0] + (ab.e - O.thr[1]) * O.r[1]);
  const sep = Math.abs((E['21L'].thr[0] - O.thr[0]) * O.r[0] + (E['21L'].thr[1] - O.thr[1]) * O.r[1]);
  add('T-LO-25', 'c152 downwind (21L, east) vs runway 21R centreline', 'lateral distance (m) = D + runway spacing', r2(c.D + sep, 0), 2, r2(lat, 0), 'LO13; repo geometry'); }
// 26 multi-engine final speed vs VYSE rule
{ const bad = Object.entries(TYPES).filter(([, t]) => t.features.twin && t.VYSE && t.V.base < t.VYSE).map(([k]) => k);
  add('T-LO-26', 'twins: base speed ≥ VYSE (AFH: not below VYSE until landing assured)', 'types violating', '[]', 0, JSON.stringify(bad), 'LO7 p13-20'); }

// 27 heights fall monotonically from abeam to the aim point for every type and runway
{ const bad = []; for (const rwy of ['21L', '03R', '03L', '21R']) for (const id of Object.keys(TYPES)) { const w = circ(rwy, id).wp; const k = w.findIndex((x) => x.k === 'abeam_threshold');
    for (let i = k + 1; i < w.length; i++) if (w[i].h > w[i - 1].h + 1e-6) bad.push(`${rwy}:${id}`); }
  add('T-LO-27', `${Object.keys(TYPES).length} types × 4 runways: abeam → base → final turn → roll-out → aim`, 'non-monotonic profiles', '[]', 0, JSON.stringify([...new Set(bad)]), 'LO3 p8-3 (descend from abeam), LO0'); }
// 28 (review) gust correction moves both bounds of the speed window [LO36 PA.IV.B.S7, LO5 p9-20]
{ const exp = [65 + 5 - 5, 65 + 5 + 10]; const w = gateCheck({ ...base, ias: 62, gust: 10 }, c172);   // 62 passed the first draft's window 60–80
  add('T-LO-28', 'c172s Vapp 65, gust factor 10 kt (add 5), IAS 62', 'speed window (KIAS) / spd item', `${exp[0]}–${exp[1]} / false`, 0, `${w.window[0]}–${w.window[1]} / ${w.items.spd}`, 'LO5 p9-20; LO36 PA.IV.B.S7 (+10/−5 with gust factor applied)'); }
// 29 (review) fast types: the downwind offset is widened to keep a straight base leg of >= 200 m (trainer_r2, 21L)
{ const t = TYPES.trainer_r2.V; const Rb = turnRadius(t.abeam, 25), Rf = turnRadius(t.base, 20);
  const exp = Math.max(Math.min(SM, Math.max(0.5 * SM, 2 * turnRadius(t.downwind, 25) + 400)), Rb + Rf + 200);
  const c = circ('21L', 'trainer_r2');
  add('T-LO-29', 'trainer_r2 (V downwind 140 / abeam 120 / base 110 KIAS), 21L, 1,000 ft', 'D (m) = max(clamp(2R+400), R_b+R_f+200)', r2(exp, 0), 1, r2(c.D, 0), 'LO3 p8-3; LO0 (est)'); }
// 30 (review) sub-variant checklists: the Lycoming DA40 has mixture, magnetos and a prop lever; the DA40 NG (FADEC) has none
{ const has = (id, ph, it) => checklistFor(TYPES[id])[ph].some((i) => i.id === it);
  const got = ['da40_180', 'da40ng'].map((id) => [has(id, 'before_landing', 'mixture_rich'), has(id, 'before_takeoff', 'runup_mag'), has(id, 'before_landing', 'prop_high')].join(',')).join(' / ');
  add('T-LO-30', 'items mixture_rich / runup_mag / prop_high: da40_180 vs da40ng', 'present?', 'true,true,true / false,false,false', 0, got, 'LO0; features from LD1/LD6 (IO-360-M1A, MTV-12) and LD2 (AE300 FADEC)'); }
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(new URL('lo_tests.json', OUT), JSON.stringify(T, null, 1));
const md = ['| รหัส | เงื่อนไข | ปริมาณที่วัด | ผลคาดหวัง ± tolerance | ที่มา | โมเดลปัจจุบัน | lo_lib |', '|---|---|---|---|---|---|---|'];
for (const t of T) md.push(`| ${t.id} | ${t.cond} | ${t.qty} | ${typeof t.exp === 'object' ? JSON.stringify(t.exp) : t.exp}${typeof t.exp === 'number' ? ' ± ' + t.tol : ''} | ${t.src} | ${t.cur} | ${typeof t.got === 'object' ? JSON.stringify(t.got) : t.got} ${t.pass ? '✓' : '✗'} |`);
fs.writeFileSync(new URL('lo_tests.md', OUT), md.join('\n') + '\n');
console.log(md.join('\n'));
console.log(`\n${T.filter((t) => t.pass).length}/${T.length} pass`);
process.exitCode = T.every((t) => t.pass) ? 0 : 1;
