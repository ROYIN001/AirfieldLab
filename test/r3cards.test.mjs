// The experimental airliner cards of plan C4 (research round 3 task items 1, 2 and 39, docs/research/03-airliners.md;
// owner decisions OD-LEMAC, OD-SOURCES, OD-RATINGS): data/aircraft/<id>.json of tools/aircraft/build_airliners.mjs,
// read by acFromCard (src/20-flight.js) in legacy mode on today's equations, with AC.K_CL_offset. The research's own
// test cases: T-B-14, T-B-22, T-B-25 (737-800), T-L-24, T-L-26 (A320), T-H-08, T-H-17, T-H-21 (A330), T-R-23, T-R-24,
// T-R-25 (ATR 72-600), T-J-19 (thrust lapse), T-K-27 (ops paths); the r3_merge.mjs --coverage gaps against each card's
// _na and _deferred; the Thai label รุ่นทดลอง. That the trainer and the six light cards did not move is the bit-identity
// script of the plan (AC JSON without K_CL_offset), test/types.test.mjs (LOCK, AUTOLAND) and every older test.
// (The name avoids test/airliner.test.mjs, which research item 4 / plan C6 reserves for the trimmed approaches.)
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { M, AIRCRAFT_CARD } from './harness.mjs';
import { trim } from './lib/fstd.mjs';
import { AIRLINER_IDS, RATINGS, researchGaps, matches, research } from '../tools/aircraft/build_airliners.mjs';
import { TYPE_IDS } from '../tools/aircraft/build_cards.mjs';
import { lapseBY, ENG } from '../docs/research/03-airliners/scripts/j_lib.mjs';

const { AC, Aircraft, acFromCard, setAircraft, toSI, pctMAC, armAtPctMAC, thrustAvail, DEG, KT, NM } = { ...M, NM: 1852 };
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'data', 'aircraft');
const card = (id) => JSON.parse(fs.readFileSync(path.join(DIR, `${id}.json`), 'utf8'));
const trainer = () => JSON.parse(fs.readFileSync(AIRCRAFT_CARD, 'utf8'));
after(() => setAircraft(trainer()));
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const TY = new Function('"use strict";\n' + read('src/22-types.js') + '\nreturn { AIRLINER_TYPES, typeInfo, modelSpec, massOptions, ratingOptions, ratingName, EXP_NOTES, AP_CALM, AP_WIND };')();
const near = (x, want, tol, what) => assert.ok(Math.abs(x - want) <= tol, `${what}: ${x} (want ${want} ± ${tol})`);

// CLmax of the blend on the simulator's lift line, as the research scripts measure it: δe 0, q 0, α̇ 0, h 1,000 m (out of
// ground effect), α 0…25° in steps of 0.01°
function clmax(f) {
  let pk = { CL: 0, a: 0 };
  for (let i = 0; i <= 2500; i++) {
    const a = i * 0.01, th = a * DEG, ac = new Aircraft(); ac.flaps = f; ac.gearPos = 1; ac.thr = 0; ac.de = 0;
    const d = { wow: [0, 0, 0], load: [0, 0, 0] }, o = new Float64Array(13);
    ac.x.set([0, 0, -1000, 60, 0, 0, Math.cos(th / 2), 0, Math.sin(th / 2), 0, 0, 0, 0]); ac.deriv(ac.x, o, d);
    if (d.CL > pk.CL) pk = { CL: d.CL, a };
  }
  return pk;
}

// ───────────────────────── the file set and the selector ─────────────────────────
test('plan C4: seven airliner cards, the selector\'s AIRLINER_TYPES in the generator\'s order, none of them a light type', () => {
  assert.deepEqual(AIRLINER_IDS, ['a320ceo', 'b737_800', 'a320neo', 'a330_300', 'a321neo', 'atr72_600', 'a321ceo']);
  assert.deepEqual(TY.AIRLINER_TYPES, AIRLINER_IDS);
  for (const id of AIRLINER_IDS) { assert.ok(fs.existsSync(path.join(DIR, `${id}.json`)), id); assert.ok(!TYPE_IDS.includes(id), id); }
});

// ───────────────────────── units and %MAC (research item 1) ─────────────────────────
test('T-B-25 lb → kg (174,200 / 146,300 / 138,300 lb = 79,015 / 66,360 / 62,731 kg ± 1) and the 737-800 default_sim holds them', () => {
  const kg = [174200, 146300, 138300].map((lb) => toSI(lb, 'lb'));
  [79015, 66360, 62731].forEach((w, i) => near(kg[i], w, 1, `${[174200, 146300, 138300][i]} lb`));
  const ds = card('b737_800').airframe.weights.default_sim.v;
  assert.deepEqual([ds.MTOW, ds.MLW, ds.MZFW], [79015, 66360, 62731]);
  // the other units the cards use, and an unknown one throws
  near(toSI(1, 'in'), 0.0254, 0, 'in'); assert.equal(toSI(1, 'kt'), KT); near(toSI(1, 'ft'), 0.3048, 1e-15, 'ft');
  near(toSI(1, 'slug ft2'), 1.3558179483314004, 1e-12, 'slug ft2'); near(toSI(1, 'lbf'), 4.4482216152605, 1e-12, 'lbf');
  assert.throws(() => toSI(1, 'furlong'), /unknown unit "furlong"/);
});

test('T-B-22 %MAC of a balance arm (LEMAC BA 627.1 in, MAC 155.8 in): 658.26 in = 20.00 %, 666.05 in = 25.00 % (± 0.01); OD-LEMAC on the 737 card', () => {
  const L = toSI(627.1, 'in'), C = toSI(155.8, 'in');
  near(pctMAC(toSI(658.26, 'in'), L, C), 20, 0.01, '658.26 in'); near(pctMAC(toSI(666.05, 'in'), L, C), 25, 0.01, '666.05 in');
  near(armAtPctMAC(25, L, C), toSI(666.05, 'in'), 1e-3, 'the inverse');
  // the card: LEMAC at BA 627.1 in (W&B report [B9]), MAC 155.8 in, low confidence (OD-LEMAC)
  const cg = card('b737_800').airframe.cg;
  near(cg.LEMAC_x.v, L, 0.001, 'LEMAC_x'); near(cg.MAC.v, C, 0.001, 'MAC'); assert.equal(cg.LEMAC_x.u, 'm DAT');
  assert.equal(cg.LEMAC_x.conf, 'ต่ำ'); assert.ok(cg.LEMAC_x.src.includes('B9') && /OD-LEMAC/.test(cg.LEMAC_x.note));
});

test('OD-LEMAC (R3-C5): both A321 cards take LEMAC Sta 700.85 in from FAA TCDS A28NM, in its datum frame, low confidence', () => {
  for (const id of ['a321ceo', 'a321neo']) {
    const l = card(id).airframe.cg.LEMAC_x;
    near(l.v, toSI(700.85, 'in'), 1e-4, id); assert.equal(l.u, 'm DAT'); assert.equal(l.conf, 'ต่ำ'); assert.equal(l.est, true);
    assert.ok(l.src.includes('L3') && l.src.includes('D14') && /A28NM/.test(l.note) && /OD-LEMAC/.test(l.note), id);
    // the research card still holds its own estimate; the fix is the reader's (plan C4: never edit the research data)
    assert.equal(research(id).airframe.cg.LEMAC_x.v, 19.53);
  }
});

// ───────────────────────── mass, inertia, speeds (research items 1 and 2) ─────────────────────────
test('T-B-14, T-L-24, T-H-17: inertia at the research\'s masses through acFromCard (scaled from ref_mass)', () => {
  const I = (id, m) => { const a = acFromCard(card(id), { mass: m }); return [a.Ixx, a.Iyy, a.Izz]; };
  const b = I('b737_800', 66361); [2.132e6, 3.878e6, 5.823e6].forEach((w, i) => near(b[i], w, 0.01 * w, `737 I${'xyz'[i]}`));
  const l = I('a320ceo', 64500); [[1.749e6, 0.15], [4.946e6, 0.10], [6.248e6, 0.10]].forEach(([w, f], i) => near(l[i], w, f * w, `A320 I${'xyz'[i]}`));
  const ratio = l[2] / (l[0] + l[1]); assert.ok(ratio >= 0.85 && ratio <= 1.0, `A320 Izz/(Ixx+Iyy) ${ratio}`);
  const h = I('a330_300', 187000); [1.581e7, 4.114e7, 5.413e7].forEach((w, i) => near(h[i], w, 0.01 * w, `A330 I${'xyz'[i]}`));
});

test('OD-RATINGS: each card\'s default mass and the masses offered; Vref, Vapp and VS0 from the mass tables at the chosen mass (kt CAS)', () => {
  const want = { a320ceo: 64500, b737_800: 66360, a320neo: 67400, a330_300: 187000, a321neo: 79200, atr72_600: 22350, a321ceo: 75500 };
  for (const id of AIRLINER_IDS) {
    const c = card(id), a = acFromCard(c), opts = TY.massOptions(c);
    assert.equal(a.m, want[id], id); assert.equal(opts[0], want[id], `${id}: the default first`);
    assert.ok(opts.every((m, i) => i === 0 || m < opts[i - 1]), `${id}: masses descending`);
    assert.ok(a.Vs0 < a.Vref && a.Vref <= a.Vapp, `${id}: Vs0 ${a.Vs0} < Vref ${a.Vref} ≤ Vapp ${a.Vapp}`);
    assert.equal(a.kias, null, `${id}: no IAS–CAS table, the HUD shows KCAS`);
    const light = acFromCard(c, { mass: opts.at(-1) });
    assert.ok(light.Vref < a.Vref && light.Ixx < a.Ixx, `${id}: a lighter aircraft is slower and has less inertia`);
  }
  // the research's own anchors
  near(acFromCard(card('a320ceo')).Vref, 128.5, 0.05, 'A320ceo VLS FULL at 64.5 t (VREF_kt.at_64500kg)');
  near(acFromCard(card('a320ceo')).Vapp, 133.5, 0.05, 'A320ceo Vapp calm at 64.5 t (VAPP_kt.calm_64500kg)');
  near(acFromCard(card('a320neo')).Vref, 131.4, 0.05, 'A320neo VLS FULL at 67.4 t');
  near(acFromCard(card('a330_300')).Vapp, 144.0, 0.05, 'A330 VAPP FULL at 187 t');
  for (const m of [50000, 60000, 66360, 75000]) near(acFromCard(card('b737_800'), { mass: m }).Vref, 0.53923 * Math.sqrt(m), 0.15, `737 Vref40 = 0.53923√m at ${m} kg`);
  near(acFromCard(card('atr72_600'), { mass: 20400 }).Vref, 106, 1, 'ATR VmHB30 at 20.4 t (BEA 106 kt)');
  // a bad mass throws and names the option
  assert.throws(() => acFromCard(card('a320ceo'), { mass: -1 }), (e) => e.path === 'opts.mass');
});

test('OD-RATINGS: the engine ratings offered (default first), T0 and P scaled by the F00 ratio; CFM56-7B flat rating 30 °C', () => {
  for (const id of AIRLINER_IDS) {
    const c = card(id), rs = TY.ratingOptions(c);
    assert.deepEqual(rs, RATINGS[id], id);
    if (!rs.length) { assert.equal(c.turbofan, undefined, `${id}: the ATR has no turbofan`); continue; }
    assert.equal(rs[0], c.turbofan.engine_default.v, `${id}: the default first`);
    const a0 = acFromCard(c);
    // the default's T0 is the twin's legacy thrust: 2 × F00 of the default class (research propulsion.legacy)
    near(a0.T0, 2 * c.turbofan.engines[rs[0]].F00.v, 1, `${id} T0 = 2 F00`);
    for (const r of rs) {
      const a = acFromCard(c, { rating: r }), k = c.turbofan.engines[r].F00.v / c.turbofan.engines[rs[0]].F00.v;
      near(a.T0, a0.T0 * k, 1e-6, `${id} ${r} T0`); near(a.P, a0.P * k, 1e-3, `${id} ${r} P`); assert.equal(a.eta, a0.eta);
    }
    assert.throws(() => acFromCard(c, { rating: 'NO_SUCH_class' }), /opts\.rating names no engine class/);
  }
  const b = card('b737_800');
  for (const r of RATINGS.b737_800) assert.equal(b.turbofan.engines[r].Tflat_C.v, 30, r);
  assert.deepEqual(TY.ratingOptions(b).map(TY.ratingName), ['CFM56-7B26', 'CFM56-7B27', 'CFM56-7B24']);
});

// ───────────────────────── legacy mode on today's equations (research item 2) ─────────────────────────
test('AC.K_CL_offset: 0.15 when a card gives none (the trainer, the six light cards, the Airbus legacy sets), 0 on the ATR and the 737', () => {
  assert.equal(acFromCard(trainer()).K_CL_offset, 0.15);
  for (const id of TYPE_IDS) assert.equal(acFromCard(card(id)).K_CL_offset, 0.15, id);
  for (const id of AIRLINER_IDS) assert.equal(acFromCard(card(id)).K_CL_offset, id === 'atr72_600' || id === 'b737_800' ? 0 : 0.15, id);
  const c = trainer(); c.aero.legacy.v.K_CL_offset = 'x';
  assert.throws(() => acFromCard(c), /aero\.legacy\.K_CL_offset is not a number/);
});

test('T-R-23, T-L-26, T-H-08: CLmax of the blend (M 55) with each legacy set, out of ground effect', () => {
  const cases = [
    ['atr72_600', [[0, 1.50, 0.02], [0.584, 2.18, 0.05], [1, 2.675, 0.03]]],
    ['a320ceo', [[1, 2.902, 0.01, 17.6, 0.5], [0.647, 2.336, 0.02], [0, 1.316, 0.01]]],
    ['a330_300', [[0, 1.260, 0.01, 14.0, 0.3], [1, 2.450, 0.01, 17.4, 0.3], [0.563, 1.925, 0.01]]],
  ];
  for (const [id, rows] of cases) {
    setAircraft(card(id));
    for (const [f, cl, tol, a, atol] of rows) {
      const p = clmax(f);
      near(p.CL, cl, tol, `${id} f ${f} CLmax`);
      if (a !== undefined) near(p.a, a, atol, `${id} f ${f} α at CLmax`);
    }
  }
});

test('T-R-25 and T-R-24: the ATR trims at 20.4 t, 111 kt, flaps 30, gear down, γ −3° with throttle 0.31 ± 0.03 (0.275 with the old offset 0.15), δe 0 ± 1° there and in cruise', () => {
  const ac = new Aircraft();
  setAircraft(card('atr72_600'), { mass: 20400 });
  const app = trim(ac, { ias: 111, h: 300, flaps: 1, gear: 1, gammaDeg: -3 });
  near(app.thr, 0.31, 0.03, 'throttle'); near(app.de / DEG, 0, 1, 'δe approach'); assert.ok(app.residual < 1e-9);
  const old = card('atr72_600'); old.aero.legacy.v.K_CL_offset = 0.15; setAircraft(old, { mass: 20400 });
  near(trim(ac, { ias: 111, h: 300, flaps: 1, gear: 1, gammaDeg: -3 }).thr, 0.275, 0.005, 'throttle with 0.15');
  setAircraft(card('atr72_600'), { mass: 21000 });
  const h = 17000 * 0.3048, eas = 275 * Math.sqrt(ac.atm(h).rho / 1.225);
  near(trim(ac, { ias: eas, h, flaps: 0, gear: 0 }).de / DEG, 0, 1, 'δe cruise 275 KTAS FL170 21 t');
});

test('T-J-19: thrustAvail(70 m/s)/T0 is 0.8059 on the 737 and 0.7667 on the A320neo (± 0.0005); within 0.05 of Bartel & Young over 0–90 m/s on every jet', () => {
  for (const id of AIRLINER_IDS.filter((x) => x !== 'atr72_600')) {
    const c = card(id); setAircraft(c);
    const E = ENG[c.turbofan.engine_default.v];
    let err = 0; for (let V = 0; V <= 90; V += 0.5) err = Math.max(err, Math.abs(thrustAvail(V) / AC.T0 - lapseBY(V / 340.294, 1, E.bpr)));
    assert.ok(err <= 0.05, `${id}: max error ${err}`);
    if (id === 'b737_800') near(thrustAvail(70) / AC.T0, 0.8059, 0.0005, id);
    if (id === 'a320neo') near(thrustAvail(70) / AC.T0, 0.7667, 0.0005, id);
  }
});

test('every airliner loads, trims on a 3° glide at its Vapp (flaps 1, gear down) and flies 20 s from setApproach', () => {
  for (const id of AIRLINER_IDS) {
    setAircraft(card(id));
    const t = trim(new Aircraft(), { ias: AC.Vapp, h: 300, flaps: 1, gear: 1, gammaDeg: -3 });
    assert.ok(t.residual < 1e-9 && t.thr > 0.1 && t.thr < 0.6 && Math.abs(t.de) < 5 * DEG && t.alpha > 0 && t.alpha < 8 * DEG,
      `${id}: α ${t.alpha / DEG} δe ${t.de / DEG} thr ${t.thr}`);
    const ac = new Aircraft(); ac.setApproach({ dist: 5500 });
    for (let i = 0; i < 240 * 20; i++) ac.step(1 / 240);
    assert.ok(ac.air.h > 150 && Math.abs(ac.air.V / KT - AC.Vapp) < 10, `${id}: h ${ac.air.h} V ${ac.air.V / KT}`);
  }
});

// ───────────────────────── the trainer's Autopilot on the airliners (known gap, plans C5/C6) ─────────────────────────
// The Autopilot and the flare are tuned for the trainer; plan C4 does not tune them. This table pins what they do with
// each card at its default mass and rating, so that plans C5/C6 can show what they improve (and move these rows on
// purpose, with the reason). Seed 5, the A8 default weather, as test/types.test.mjs AUTOLAND: calm on [21R, 21L, 03L,
// 03R], then 03L `head`, 03L `xr` and 21R `xl`. A row is [crashed (1/0), score, touchdown or impact point (m from the
// threshold), the Evaluator's events]. Calm has no turbulence, so the calm rows do not depend on the seed. Bands: the
// crash flag and the events exact, score ± 7, point ± 4 m in calm and ± 8 m in wind (types.test.mjs's). Measured
// 2026-11-27 on 8bfcd48 (the C4 review: the commit said only "some 737 and A321ceo runs crash in wind"). The 737-800
// and the A321ceo hit too hard in calm air on every end; the A320neo, the A321neo and the ATR in some winds; the A330
// stalls about 29 s after the start, 3.3 km before the threshold; the A320ceo lands everywhere but at 135–165 m, short
// of the 300 m window (score 55–63).
// Plan C5 moved the rows that have a wind along the runway, on purpose: the approach speed now follows the wind rule of
// the type (src/20-flight.js SPD, Approach): the ATR's wind factor adds a third of the 10 kt headwind of `head` (3.3 kt;
// score 69 → 88, the point 414 → 244 m); the Airbus cards fly the ground speed
// mini (the headwind aloft above the tower's: k 1 for the A320ceo and A321ceo, 0.33 for the neo types and the A330), which
// moves every `head` row (the A320ceo lands at 147 m, score 60; the A321ceo no longer stalls, 84 at 132 m, but still
// crashes; the A321neo no longer stalls but crashes at 80 m; the A330 still stalls) and, by the 0.4° that the rounded wind
// direction leaves between `xl` and a pure crosswind, the `xl` rows by at most 1.2 m and 1 point. The calm rows and
// `xr` did not move. Boeing's additive stays at Vref + 5 in these winds (no gust figure in the scenarios). The cause of
// the crashes is still the trainer-tuned Autopilot, not the speeds.
const AIRLINER_AUTOLAND = {
  a320ceo: [[0, 57, 158.8, ''], [0, 57, 153.1, ''], [0, 55, 164.5, ''], [0, 55, 135.4, ''], [0, 60, 147.2, ''], [0, 58, 162.0, ''], [0, 64, 152.5, '']],
  b737_800: [[1, 63, 195.6, 'crash'], [1, 63, 189.8, 'crash'], [1, 64, 201.4, 'crash'], [1, 63, 172.3, 'crash'], [1, 71, 201.5, 'crash'], [1, 66, 200.1, 'crash'], [0, 72, 187.8, '']],
  a320neo: [[0, 56, 159.6, ''], [0, 56, 153.8, ''], [0, 56, 165.4, ''], [0, 35, 136.3, ''], [0, 64, 163.2, ''], [0, 35, 158.6, ''], [1, 35, 145.2, 'crash']],
  a330_300: [[1, 20, -3300.2, 'stall,crash'], [1, 20, -3300.8, 'stall,crash'], [1, 20, -3299.5, 'stall,crash'], [1, 20, -3302.5, 'stall,crash'], [1, 20, -3110.8, 'stall,crash'], [1, 20, -3308.7, 'stall,crash'], [1, 2, -3264.1, 'stall,crash']],
  a321neo: [[0, 35, 162.4, ''], [0, 35, 157.8, ''], [0, 35, 167.4, ''], [0, 35, 143.4, ''], [1, 35, 79.8, 'crash'], [1, 35, 161.0, 'crash'], [1, 35, 150.2, 'crash']],
  atr72_600: [[0, 86, 266.3, ''], [0, 86, 260.5, ''], [0, 86, 272.1, ''], [0, 86, 243.1, ''], [0, 88, 243.8, ''], [0, 76, 271.5, ''], [1, 89, 281.7, 'crash']],
  a321ceo: [[1, 35, 146.3, 'crash'], [1, 35, 140.7, 'crash'], [1, 35, 151.6, 'crash'], [1, 35, 124.9, 'crash'], [1, 84, 132.0, 'crash'], [1, 35, 141.8, 'crash'], [1, 35, 117.1, 'crash']],
};
const AL_RUNS = [['21R', 'calm'], ['21L', 'calm'], ['03L', 'calm'], ['03R', 'calm'], ['03L', 'head'], ['03L', 'xr'], ['21R', 'xl']];
test('known gap: the trainer\'s Autopilot on each airliner, seed 5, calm on all four ends and three winds (regression table for plans C5/C6; the Thai note follows it)', (t) => {
  const { Flight, SCENARIOS, setActiveRunway } = M;
  assert.deepEqual(Object.keys(AIRLINER_AUTOLAND), AIRLINER_IDS);
  const printed = [];
  try {
    for (const id of AIRLINER_IDS) {
      setAircraft(card(id));
      AL_RUNS.forEach(([rw, key], k) => {
        setActiveRunway(rw);
        const f = new Flight({ wind: SCENARIOS[key], pilot: 'ap', seed: 5 });
        while (f.ac.t < 260 && !f.ev.done && !f.crashed) f.tick(f.dt);
        const s = f.ev.score(), ev = [...new Set(f.ev.events.map((e) => e.k))].join(','), [c, score, td, pinEv] = AIRLINER_AUTOLAND[id][k];
        const info = `${id} ${rw} ${key}: ${f.crashed ? 'crash' : 'landed'} at ${f.ac.t.toFixed(1)} s, score ${s.total}, point ${f.ev.td ? f.ev.td.s.toFixed(1) : 'none'} m, events [${ev}]`;
        t.diagnostic(info);
        printed.push(`[${f.crashed ? 1 : 0}, ${s.total}, ${f.ev.td ? f.ev.td.s.toFixed(1) : null}, '${ev}']`);
        assert.equal(f.crashed ? 1 : 0, c, info); assert.equal(ev, pinEv, info);
        near(s.total, score, 7, `${info}: score`); near(f.ev.td.s, td, key === 'calm' ? 4 : 8, `${info}: point`);
      });
      // the Thai note of the type says what the table says: crashes in calm, crashes only in some winds, the A330's stall
      const rows = AIRLINER_AUTOLAND[id], calmCrash = rows.slice(0, 4).some((r) => r[0]), windCrash = rows.slice(4).some((r) => r[0]);
      const notes = TY.typeInfo(id, card(id), acFromCard(card(id))).notes;
      const stall = rows.every((r) => r[3].includes('stall'));
      assert.equal(notes.includes(TY.AP_CALM), calmCrash && !stall, `${id}: AP_CALM`);
      assert.equal(notes.includes(TY.AP_WIND), !calmCrash && windCrash, `${id}: AP_WIND`);
      assert.equal(notes.some((n) => /^ออโต้ไพลอตของเครื่องฝึกพาแบบนี้ stall ระหว่างร่อน/.test(n)), stall, `${id}: stall note`);
    }
  } finally { setActiveRunway('21R'); setAircraft(trainer()); }
  if (process.env.TYPES_LOCK_PRINT) console.log(printed.join('\n'));
});

test('A330 lateral derivatives are in body axes (04-a330-300.md §3.4.7.5: stability axes with Ixz 0 give an unstable Dutch roll)', () => {
  const d = card('a330_300').aero.derivatives;
  const want = { Clb: -0.205, Cnb: 0.026, Clp: -0.492, Clr: 0.235, Cnp: -0.180, Cnr: -0.188 };
  for (const [k, w] of Object.entries(want)) near(d[k].v.approach, w, 0.0015, k);
  assert.equal(card('a330_300').airframe.inertia.Ixz.v, 0);
  // the research card keeps its stability-axis numbers
  assert.equal(research('a330_300').aero.derivatives.Clb.v.approach, -0.201);
});

// ───────────────────────── classification and ops (T-H-21, T-K-27) ─────────────────────────
test('T-H-21: the A330 is ICAO H, RECAT-EU B, FAA CWT B, ARC 4E, approach category C; 4 NM at 140 kt is 103 ± 2 s', () => {
  const c = card('a330_300'), w = c.wind.wake.category.v;
  assert.equal(w.ICAO, 'H'); assert.match(w.RECAT_EU, /^CAT-B/); assert.equal(w.FAA_CWT, 'B'); assert.equal(w.ARC, '4E');
  assert.equal(c.speeds.icao_approach_category.v, 'C');
  near(4 * NM / (140 * KT), 103, 2, '4 NM at 140 kt');
});

test('T-K-27: every type has ops.tailstrike_pitch_deg and ops.flare_height_m, and the a321ceo gs_mini k is 1 (not 0.33), in the research data and the cards', () => {
  for (const id of AIRLINER_IDS) {
    for (const [what, c] of [['research', research(id)], ['card', card(id)]]) {
      assert.ok(c.ops && c.ops.tailstrike_pitch_deg && c.ops.flare_height_m, `${what} ${id}`);
      assert.ok(Number.isFinite(c.ops.flare_height_m.v) && c.ops.flare_height_m.v > 0, `${what} ${id} flare height`);
    }
  }
  assert.equal(research('a321ceo').ops.gs_mini.v.k, 1); assert.equal(card('a321ceo').ops.gs_mini.v.k, 1);
});

// ───────────────────────── _na and the coverage of research item 39 ─────────────────────────
test('r3_merge.mjs --dry --coverage: its gaps are researchGaps(); every gap is in the card\'s _na or _deferred; no path the reader needs is _na', () => {
  const dir = path.join(ROOT, 'docs', 'research', '03-airliners');
  const r = spawnSync(process.execPath, [path.join(dir, 'scripts', 'r3_merge.mjs'), '--dry', '--coverage'], { encoding: 'utf8', cwd: dir });
  assert.equal(r.status, 0, r.stderr);
  const missing = {}; let id = null;
  for (const l of r.stdout.split('\n')) {
    const c = /^coverage (\S+): /.exec(l); if (c) { id = c[1]; missing[id] = []; continue; }
    const m = /^\s+missing (\S+)$/.exec(l); if (m && id) missing[id].push(m[1]);
  }
  assert.deepEqual(Object.keys(missing).sort(), [...AIRLINER_IDS].sort());
  for (const id of AIRLINER_IDS) {
    assert.deepEqual([...missing[id]].sort(), [...researchGaps(id)].sort(), `${id}: researchGaps follows r3_merge`);
    const c = card(id), na = c._na.v, def = c._deferred.v;
    const deferred = new Set(Object.values(def).flatMap((d) => d.paths));
    for (const p of missing[id]) {
      const inNa = na.some((q) => matches(q, p)), inDef = deferred.has(p);
      assert.ok(inNa !== inDef, `${id}: ${p} is ${inNa ? 'in both' : 'in neither'} _na and _deferred`);
    }
    for (const [pat, d] of Object.entries(def)) assert.ok(d.item && d.paths.every((p) => matches(pat, p)), `${id}: _deferred ${pat}`);
    // the research's own _na is kept, and the reader still reads the card (no path it needs is marked)
    for (const q of (research(id)._na || { v: [] }).v) assert.ok(na.includes(q), `${id}: research _na ${q}`);
    acFromCard(c);
  }
  // research item 39: hinge moments and tabs are n/a on the irreversible 737 and the FBW Airbus, not on the cable ATR
  for (const id of AIRLINER_IDS) assert.equal(card(id)._na.v.includes('controls.pitch.Ch_delta'), id !== 'atr72_600', id);
});

test('_na in acFromCard: a needed path marked not applicable throws and names it; an optional one is skipped', () => {
  const c = card('a320ceo'); c._na.v = [...c._na.v, 'aero.legacy.*'];
  assert.throws(() => acFromCard(c), (e) => e.path === 'aero.legacy.CL0' && /not applicable/.test(e.message));
  const d = card('a320ceo'); d._na.v = [...d._na.v, 'speeds.ias_cas'];
  assert.equal(acFromCard(d).kias, null);
  const e = card('b737_800'); e._na.v = [...e._na.v, 'aero.legacy.K_CL_offset'];
  assert.equal(acFromCard(e).K_CL_offset, 0.15, 'an n/a offset is the default');
});

// ───────────────────────── labelled experimental, estimates (OD-SOURCES) ─────────────────────────
test('every airliner is labelled รุ่นทดลอง and ค่าประมาณ: the card, the selector text, the switch in the template; explore stays on the trainer', () => {
  const TPL = read('src/template.html'), APP = read('src/90-app.js');
  assert.match(TPL, /<label class="toggle"><input type="checkbox" id="chkExp">รุ่นทดลอง: [^<]*ค่าประมาณ[^<]*<\/label>/);
  for (const id of ['expOpts', 'segMass', 'segRating', 'ratingRow']) assert.match(TPL, new RegExp(`id="${id}"`));
  for (const id of AIRLINER_IDS) {
    const c = card(id);
    assert.match(c._meta.note, /รุ่นทดลอง/); assert.match(c._meta.note, /ค่าประมาณ/);
    assert.match(c._meta.license, /no code or file copied/);
    const i = TY.typeInfo(id, c, acFromCard(c));
    assert.equal(i.exp, true); assert.equal(i.real, true);
    assert.match(i.span, /^รุ่นทดลอง · ค่าประมาณ · มวล /); assert.match(i.em, /KCAS$/); assert.match(i.lede, /รุ่นทดลอง/);
    for (const n of TY.EXP_NOTES) assert.ok(i.notes.includes(n), `${id}: ${n}`);
    assert.ok(i.notes.some((n) => /สายการบินไม่เผยแพร่มวลและ rating/.test(n)), id);
    assert.ok(TY.modelSpec(id, c, acFromCard(c)).retract, `${id}: retractable gear`);
  }
  assert.ok(TY.typeInfo('b737_800', card('b737_800'), acFromCard(card('b737_800'))).notes.some((n) => /CFM56-7B 30 °C/.test(n)));
  // the page: the switch fetches the cards, an airliner is chosen only while it is on, and explore flies the trainer
  assert.match(APP, /app\.train\.exp = store\.get\('afl-exp', '0'\) === '1';/);
  assert.match(APP, /const loadLiners = \(\) => \(linersP \?\?= loadCards\(AIRLINER_TYPES, acFromCard\)/);
  assert.match(APP, /else if \(isLiner\(app\.train\.type\)\) selectType\('trainer'\);/);
  assert.match(APP, /if \(m === 'explore'\) \{ useType\('trainer'\);/);
});
