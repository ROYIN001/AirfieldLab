// Approach speeds by mass, configuration and wind (plan C5, research round 3 task item 3, R3-3; docs/research/03-airliners.md
// and 03-airliners/*.md): the pure functions of src/20-flight.js (SPD, Approach) read the card's tables
// (speeds.VREF_kt, VS0_kt with one column per flap detent) and speeds.approach_rule (tools/aircraft/build_airliners.mjs), and
// the HUD, the Autopilot, the autothrottle and the Evaluator use the flight's Approach instead of the fixed AC.Vref.
// The research's test cases: T-B-01…T-B-03 and T-B-24 (737-800), T-L-04…T-L-06 (A320, A321), T-R-05, T-R-06, T-R-21 and
// T-R-29 (ATR 72-600), T-H-01…T-H-04 (A330-300), T-K-01…T-K-06 (the approach speed rules of topic 3.10). Owner decisions:
// OD-737-VREF (Vref = 1.23 VS1g kept), OD-WIND-ADDITIVE (Boeing cap Vref + 20 kt by default, + 15 kt the unconfirmed option:
// T-K-02 is run with both), OD-A321NEO-CLMAX (3.05). That the trainer and the six light cards did not move is the
// bit-identity script of the plan and the 'fixed' tests below.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { M, AIRCRAFT_CARD } from './harness.mjs';
import { AIRLINER_IDS, research } from '../tools/aircraft/build_airliners.mjs';
import { TYPE_IDS } from '../tools/aircraft/build_cards.mjs';

const { AC, SPD, Approach, Flight, Evaluator, SCENARIOS, setActiveRunway, setAircraft, acFromCard, speedsKias, KT, G0, FT, FIELD, DEG } = M;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const card = (id) => JSON.parse(read(`data/aircraft/${id}.json`));
const trainer = () => JSON.parse(fs.readFileSync(AIRCRAFT_CARD, 'utf8'));
after(() => { setActiveRunway('21R'); setAircraft(trainer()); });
const near = (x, want, tol, what) => assert.ok(Math.abs(x - want) <= tol, `${what}: ${x} (want ${want} ± ${tol})`);
// the speed model of a card, at its default mass unless a mass is given
const model = (id, opts) => { setAircraft(card(id), opts); return AC.spd; };
const RHO0 = 1.225;
const vs1gCL = (m, S, CL) => Math.sqrt(2 * m * G0 / (RHO0 * S * CL)) / KT;   // the research's VS1g = √(2 m g/(ρ0 S CLmax)), kt CAS

// ───────────────────────── the cards carry what the functions read ─────────────────────────
test('every airliner card has speeds.approach_rule of its kind and a column per flap detent in VREF_kt and VS0_kt; AC.Vref still reads the landing detent', () => {
  const kinds = { b737_800: 'boeing', atr72_600: 'atr', a320ceo: 'airbus', a320neo: 'airbus', a321ceo: 'airbus', a321neo: 'airbus', a330_300: 'airbus' };
  const landing = { b737_800: '40', atr72_600: '30', a320ceo: 'FULL', a320neo: 'FULL', a321ceo: 'FULL', a321neo: 'FULL', a330_300: 'FULL' };
  for (const id of AIRLINER_IDS) {
    const c = card(id), S = model(id);
    assert.equal(S.kind, kinds[id], id); assert.equal(c.speeds.approach_rule.v.kind, kinds[id], id);
    assert.equal(S.land, landing[id], `${id}: the landing detent`);
    assert.ok(S.ref.cols[S.land] || S.ref.cols[''], `${id}: VREF_kt has the landing column`);
    assert.ok(S.stall.cols[S.land], `${id}: VS0_kt has the landing column`);
    near(SPD.vref(S, AC.m), AC.Vref, 0, `${id}: SPD.vref at the card's mass is AC.Vref`);
    near(SPD.vs1g(S, AC.m), AC.Vs0, 0, `${id}: SPD.vs1g at the card's mass is AC.Vs0`);
    const r = c.speeds.approach_rule;
    assert.equal(r.est, false, `${id}: the rule is sourced, not an estimate`); assert.ok(r.src.includes('AL:C5'), id);
    assert.ok(c._meta.sources['AL:C5'] && /plan C5/.test(c._meta.sources['AL:C5'].what), `${id}: AL:C5 is listed in _meta.sources`);
    // the detents' VFE and the Airbus ground speed mini come with the card
    assert.deepEqual(Object.keys(S.vfe), c.aero.flaps.detents.v.filter((d) => typeof d.VFE_kt === 'number').map((d) => String(d.name)), `${id}: VFE per detent`);
    assert.equal(!!S.gs, kinds[id] === 'airbus', `${id}: ground speed mini only on the Airbus cards`);
  }
  // the 737's flap 30 and 40 columns, the Airbus VLS columns the research gives (CG ≥ 25 % MAC) and the stall table of every detent
  assert.deepEqual(Object.keys(model('b737_800').ref.cols), ['30', '40']); assert.equal(Object.keys(model('b737_800').stall.cols).length, 9);
  assert.deepEqual(Object.keys(model('a320ceo').ref.cols), ['CONF3', 'FULL']); assert.deepEqual(Object.keys(model('a321ceo').ref.cols), ['FULL']);
  assert.equal(Object.keys(model('a320ceo').stall.cols).length, 6); assert.deepEqual(Object.keys(model('atr72_600').ref.cols), ['']);
  // the 737 card's cap option (OD-WIND-ADDITIVE) is the only one
  assert.equal(SPD.capOption(model('b737_800')), 15); for (const id of AIRLINER_IDS) if (id !== 'b737_800') assert.equal(SPD.capOption(model(id)), null, id);
  assert.match(card('b737_800').speeds.approach_rule.note, /ยังไม่ยืนยัน/, 'the 15 kt option is labelled unconfirmed');
});

test('a card with no approach_rule (the trainer and the six light cards) is kind fixed: every function returns the card\'s own numbers at any mass and configuration', () => {
  for (const id of ['trainer', ...TYPE_IDS]) {
    const S = model(id);
    assert.equal(S.kind, 'fixed', id);
    for (const m of [0.5 * AC.m, AC.m, 2 * AC.m]) {
      assert.equal(SPD.vref(S, m), AC.Vref, id); assert.equal(SPD.vs1g(S, m, '0'), AC.Vs0, id);
      const w = SPD.vapp(S, m, { hw: 30, gust: 20, atOn: false });
      assert.deepEqual([w.vref, w.vapp, w.keep], [AC.Vref, AC.Vapp, 0], `${id}: no wind additive`);
    }
    // the flight's Approach: AC's numbers in CAS, speedsKias() in the HUD's unit, the autopilot's target as before plan C5
    const a = new Approach({ wind: SCENARIOS.head, atOn: true }), K = speedsKias();
    assert.deepEqual([a.vref, a.vapp, a.Vref, a.Vapp, a.keep, a.extra, a.hwTower, a.label, a.cmd], [AC.Vref, AC.Vapp, K.Vref, K.Vapp, 0, 0, 0, 'Vref', K.Vapp], id);
    const sm = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
    for (const h of [0, 10, 15, 30, 61, 100, 500]) assert.equal(a.target(h), AC.Vref + (AC.Vapp - AC.Vref) * sm(15, 61, h), `${id}: target at ${h} m is the old lerp`);
  }
});

// ───────────────────────── Boeing 737-800 (T-B-01…T-B-03, T-B-24, OD-737-VREF) ─────────────────────────
test('T-B-01…T-B-03: Vref40 of the 737-800 at 76,400 and 66,400 kg = 149 and 139 kt (± 1) and Vref30 at 65,317 kg = 143 kt (± 1); the table is the k√m fit', () => {
  const S = model('b737_800');
  near(SPD.vref(S, 76400, '40'), 149, 1, 'T-B-01'); near(SPD.vref(S, 66400, '40'), 139, 1, 'T-B-02'); near(SPD.vref(S, 65317, '30'), 143, 1, 'T-B-03');
  // the research's fit Vref30 = 0.55953 √m, Vref40 = 0.53923 √m (± 0.05 kt in the reports): the card's table follows it over its whole range
  for (const m of [40000, 45000, 50000, 55000, 60000, 65000, 66361, 70000, 75000, 79015]) {
    near(SPD.vref(S, m, '30'), 0.55953 * Math.sqrt(m), 0.1, `Vref30 at ${m} kg`); near(SPD.vref(S, m, '40'), 0.53923 * Math.sqrt(m), 0.1, `Vref40 at ${m} kg`);
  }
  // between the table's masses it reads linearly (the √m curve is within 0.05 kt of that chord), and it is clamped at the ends, never extrapolated
  near(SPD.vref(S, 72500, '40'), 0.53923 * Math.sqrt(72500), 0.1, 'between two table masses');
  assert.equal(SPD.vref(S, 30000, '40'), SPD.vref(S, 40000, '40')); assert.equal(SPD.vref(S, 90000, '40'), SPD.vref(S, 79015, '40'));
  // OD-737-VREF: Vref/VS1g = 1.23 kept (the VSR table is 1.23-fold below Vref at flaps 30 and 40, to the table's rounding)
  for (const m of [50000, 66361, 76400]) for (const f of ['30', '40']) near(SPD.vref(S, m, f) / SPD.vs1g(S, m, f), 1.23, 0.006, `Vref${f}/VS1g at ${m} kg`);
  // an unknown configuration has no Vref
  assert.equal(SPD.vref(S, 66361, '15'), null);
});

test('T-B-24: ICAO approach category D from 142 kt and C from Vref40 at MLW (138.9 kt); the other bands of Doc 8168 / 14 CFR 97.3', () => {
  const S = model('b737_800');
  assert.equal(SPD.category(142), 'D'); near(SPD.vref(S, 66361, '40'), 138.9, 0.05, 'Vref40 at MLW'); assert.equal(SPD.category(SPD.vref(S, 66361, '40')), 'C');
  assert.equal(card('b737_800').speeds.icao_approach_category.v, 'D', 'Boeing and the FAA list the 737-800 as D (142 kt)');
  for (const [v, c] of [[90.9, 'A'], [91, 'B'], [120.9, 'B'], [121, 'C'], [140.9, 'C'], [141, 'D'], [165.9, 'D'], [166, 'E'], [210.9, 'E']]) assert.equal(SPD.category(v), c, `Vat ${v}`);
  assert.equal(SPD.category(211), null);
});

// ───────────────────────── approach speed rules (T-K-01…T-K-06) ─────────────────────────
test('T-K-01: 737-800 at 60,000 kg: Vref30 137.1, Vref40 132.1 and Vapp 142.1 kt with the autothrottle on (± 2)', () => {
  const S = model('b737_800');
  near(SPD.vref(S, 60000, '30'), 137.1, 2, 'Vref30'); near(SPD.vref(S, 60000, '40'), 132.1, 2, 'Vref40');
  const w = SPD.vapp(S, 60000, { atOn: true, hw: 30, gust: 15 }, '30');   // A/T engaged: Vref + 5 whatever the wind
  near(w.vapp, 142.1, 2, 'Vapp F30 A/T'); assert.equal(w.add, 5); assert.equal(w.keep, 0);
  near(SPD.vapp(S, 60000, { atOn: true }, '40').vapp, 137.1, 2, 'Vapp F40 A/T');
});

test('T-K-02 (OD-WIND-ADDITIVE, both settings): Vref30 137.1 kt, A/T off, (headwind, gust) = (10,0), (20,0), (20,10), (0,25) kt: additive 5, 10, 20, 20 kt and gust kept to touchdown 0, 0, 10, 20; with the 15 kt option 5, 10, 15, 15 and 0, 0, 10, 15', () => {
  const R = model('b737_800').rule, cases = [[10, 0], [20, 0], [20, 10], [0, 25]];
  cases.forEach(([hw, gust], i) => {
    const d = SPD.boeing(R, 137.1, { atOn: false, hw, gust });   // the default cap, Vref + 20 kt (FCTM 2013)
    near(d.add, [5, 10, 20, 20][i], 0.1, `additive (${hw},${gust})`); near(d.keep, [0, 0, 10, 20][i], 0.1, `kept (${hw},${gust})`);
    near(d.vapp, 137.1 + [5, 10, 20, 20][i], 0.1, `Vapp (${hw},${gust})`);
    const o = SPD.boeing(R, 137.1, { atOn: false, hw, gust, cap: SPD.capOption(model('b737_800')) });   // the unconfirmed 15 kt
    near(o.add, [5, 10, 15, 15][i], 0.1, `additive, 15 kt cap (${hw},${gust})`); near(o.keep, [0, 0, 10, 15][i], 0.1, `kept, 15 kt cap (${hw},${gust})`);
  });
  // only the two cases that reach 15 kt change with the cap (the owner's note in the research: (20,10) and (0,25))
  assert.deepEqual(cases.map(([hw, gust]) => SPD.boeing(R, 137.1, { atOn: false, hw, gust }).add !== SPD.boeing(R, 137.1, { atOn: false, hw, gust, cap: 15 }).add), [false, false, true, true]);
  // the minimum is 5 kt, a tail wind adds nothing, and the model reads the same rule from the card at a mass
  assert.equal(SPD.boeing(R, 137.1, { atOn: false, hw: -20, gust: 0 }).add, 5);
  const S = model('b737_800');
  near(SPD.vapp(S, 60000, { atOn: false, hw: 20, gust: 10 }, '30').vapp, 137.1 + 20, 2, 'the model, A/T off');
  assert.equal(SPD.vapp(S, 60000, { atOn: false, hw: 20, gust: 10, cap: 15 }, '30').add, 15);
  // the command speed stays under VFE − 5 kt (k_testvals.mjs: F30 VFE 175 → 170, not binding; F40 VFE 162 → 157 binds at a high mass)
  near(SPD.vapp(S, 60000, { atOn: false, hw: 40, gust: 20 }, '30').vapp, 137.1 + 20, 0.1, 'F30 at the cap, under VFE − 5');
  const heavy = SPD.vapp(S, 79015, { atOn: false, hw: 40, gust: 20 }, '40');
  assert.ok(heavy.vapp <= 162 - 5 + 1e-9 && heavy.add < 20, `F40 at 79 t is held to VFE − 5: ${heavy.vapp}`); near(heavy.vapp, 157, 1e-9, 'F40 command speed');
});

test('T-K-03 and T-L-05: Airbus VAPP = VLS + APPR COR, APPR COR = ⅓ of the tower headwind between 5 and 15 kt (A/THR on)', () => {
  const R = model('a320ceo').rule;
  [[0, 133.5], [12, 133.5], [20, 135.2], [30, 138.5], [60, 143.5]].forEach(([hw, v]) => near(SPD.airbus(R, 128.5, { hw }).vapp, v, 0.1, `T-K-03 headwind ${hw}`));
  [[0, 133.6], [12, 133.6], [30, 138.6], [60, 143.6]].forEach(([hw, v]) => near(SPD.airbus(R, 128.6, { hw }).vapp, v, 0.1, `T-L-05 headwind ${hw}`));
  assert.equal(SPD.airbus(R, 128.5, { hw: -15 }).add, 5, 'a tail wind: the 5 kt minimum');
  // the model: A320ceo at 64.5 t reads VLS 128.5 from the card and adds the same rule
  const S = model('a320ceo');
  [[0, 133.5], [20, 135.2], [60, 143.5]].forEach(([hw, v]) => near(SPD.vapp(S, 64500, { hw }).vapp, v, 0.1, `A320ceo at 64.5 t, headwind ${hw}`));
  near(SPD.vapp(S, 64500, {}).vref, 128.5, 0.05, 'the model reports VLS as its Vref');
  // a gust adds nothing to an Airbus VAPP (it goes to the ground speed mini)
  assert.equal(SPD.vapp(S, 64500, { hw: 12, gust: 30 }).vapp, SPD.vapp(S, 64500, { hw: 12 }).vapp);
});

test('T-K-04: ground speed mini, VAPP 133.5 kt, tower headwind 10 kt: headwind 25 kt now gives 148.5 kt (A320ceo, k 1) and 138.5 kt (A320neo, k 0.33), headwind 5 kt gives 133.5', () => {
  const ceo = model('a320ceo').gs, neo = model('a320neo').gs;
  assert.deepEqual([ceo.kAbove, ceo.kBelow, neo.kAbove, neo.kBelow], [1, 1, 0.33, 0.33]);
  near(133.5 + SPD.gsMini(ceo.kAbove, 10, 25), 148.5, 0.2, 'A320ceo'); near(133.5 + SPD.gsMini(neo.kAbove, 10, 25), 138.5, 0.2, 'A320neo');
  near(133.5 + SPD.gsMini(ceo.kAbove, 10, 5), 133.5, 0.2, 'headwind below the tower\'s adds nothing'); assert.equal(SPD.gsMini(1, -5, -2), 0, 'tail wind: nothing');
  // the A321 cards carry the same factors as the A320 of their engine generation (k 1 for the ceo, 0.33 for the neo)
  assert.equal(model('a321ceo').gs.kAbove, 1); assert.equal(model('a321neo').gs.kAbove, 0.33);
});

test('T-K-05: A330-300 ground speed mini, 15 kt more headwind: +15 kt at 800 ft and at 0 s below 400 ft, +9.98 at 12.5 s, +4.95 at 25 s (± 0.1)', () => {
  const g = model('a330_300').gs;
  assert.deepEqual([g.kAbove, g.kBelow, g.blendS], [1, 0.33, 25]);
  [[800, 0, 15], [300, 0, 15], [300, 12.5, 9.98], [300, 25, 4.95]].forEach(([h, t, want]) => near(SPD.gsMini(SPD.gsK(g, h, t), 0, 15), want, 0.1, `${h} ft, ${t} s`));
  // 40 s below 400 ft: the blend is done; back above 400 ft: k is 1 again
  near(SPD.gsK(g, 200, 40), 0.33, 1e-12, 'blend done'); assert.equal(SPD.gsK(g, 401, 40), 1);
});

test('T-K-06: ATR 72-600 VREF 106 kt and VMCL 95 kt, (headwind, gust) = (0,0), (15,0), (15,10), (60,0): VAPP 106, 111, 116, 121 kt (± 0.1); the card\'s own VMCL (98 kt) is the floor', () => {
  const R = model('atr72_600').rule;
  [[0, 0, 106], [15, 0, 111], [15, 10, 116], [60, 0, 121]].forEach(([hw, gust, v]) => near(SPD.atr(R, 106, { hw, gust, vmcl: 95 }).vapp, v, 0.1, `(${hw},${gust})`));
  assert.equal(R.vmcl_kt, 98); assert.equal(SPD.atr(R, 90, { hw: 0, gust: 0 }).vapp, 98, 'VMCL is the floor of VAPP');
  // the model at 20.4 t: VmHB30 from the table plus the wind factor
  const S = model('atr72_600');
  near(SPD.vapp(S, 20400, { hw: 15, gust: 10 }).vapp, SPD.vref(S, 20400) + 10, 1e-9, 'the model adds the wind factor to VmHB30');
});

// ───────────────────────── ATR 72-600 (T-R-05, T-R-06, T-R-21, T-R-29) ─────────────────────────
test('T-R-05, T-R-06, T-R-29, T-R-21: ATR VREF 106 kt at 20,400 kg (± 1), 112 kt at MLW 22,350 kg (± 2), 98 kt at 16,000 and 14,000 kg (± 0.5, VMCL floor below 17,124 kg), approach category B', () => {
  const S = model('atr72_600');
  near(SPD.vref(S, 20400), 106, 1, 'T-R-05'); near(SPD.vref(S, 22350), 112, 2, 'T-R-06');
  near(SPD.vref(S, 16000), 98, 0.5, 'T-R-29 at 16,000 kg'); near(SPD.vref(S, 14000), 98, 0.5, 'T-R-29 at 14,000 kg');
  assert.equal(SPD.category(SPD.vref(S, 22350)), 'B', 'T-R-21'); assert.equal(card('atr72_600').speeds.icao_approach_category.v, 'B');
  // VREF = max(1.23 VSR30, VMCL 98 kt) (research r_speeds_clmax.mjs): the 1.23 VSR30 above the floor mass and the floor below it,
  // also between the table's rows at 16,000 and 18,000 kg (a straight line between them ran up to 1.4 kt too high at 17,000 kg)
  for (const m of [18000, 19000, 20000, 22000]) near(SPD.vref(S, m) / SPD.vs1g(S, m), 1.23, 0.012, `VREF/VSR30 at ${m} kg`);
  for (const m of [16500, 17000, 17124]) near(SPD.vref(S, m), 98, 0.5, `T-R-29: VREF at ${m} kg is the VMCL floor`);
  for (const m of [17500, 17900]) near(SPD.vref(S, m), Math.max(98, 1.23 * SPD.vs1g(S, m)), 1e-9, `VREF = max(VMCL, 1.23 VSR30) at ${m} kg`);
  // the whole range is continuous and never below the floor
  { let prev = 0; for (let m = 14000; m <= 23000; m += 50) { const v = SPD.vref(S, m); assert.ok(v >= 98 - 1e-9 && v >= prev - 0.05, `VREF at ${m} kg: ${v} after ${prev}`); prev = v; } }
  // the table has only flaps 30: no VREF for another detent
  assert.equal(SPD.vref(S, 20400, '15'), null); near(SPD.vs1g(S, 20400, '15'), 98.0, 1, 'VSR at flaps 15 comes from the stall table');
});

// ───────────────────────── Airbus (T-L-04…T-L-06, T-H-01…T-H-04, OD-A321NEO-CLMAX) ─────────────────────────
test('T-L-04: A320ceo 64.5 t, CONF FULL, CG ≥ 25 %: VLS 128.5 kt (± 1.5) and VLS/VS1g in the Airbus 1.23…1.28', () => {
  const S = model('a320ceo');
  near(SPD.vls(S, 64500, 'FULL'), 128.5, 1.5, 'VLS');
  const k = SPD.vls(S, 64500, 'FULL') / SPD.vs1g(S, 64500, 'FULL');
  // the FBW tables the research took the speeds from are whole knots (VLS and VS1g each ± 0.5 kt of about 105): the ratio carries
  // ± 0.011, and the research's own script (l_speeds_clmax.mjs) reads 1.228 to 1.247 over 40…80 t. The ratio of the tables is 1.2285
  // at 64.5 t, 0.0015 under the research's 1.23: a deviation from the text of T-L-04 (1.23 to 1.28), kept inside the rounding and
  // reported in the commit of plan C5 for the owner (no owner decision covers it), not a change of the tables
  const RATIO_LO = 1.23 - 0.011;
  assert.ok(k >= RATIO_LO && k <= 1.28, `VLS/VS1g ${k}`);
  // (below 50 t the FBW table's VLS stays flat while VS1g keeps falling with √m, so the ratio is read over 55…75 t)
  for (const m of [55000, 60000, 65000, 70000, 75000]) { const r = SPD.vls(S, m, 'FULL') / SPD.vs1g(S, m, 'FULL'); assert.ok(r >= RATIO_LO && r <= 1.28, `VLS/VS1g at ${m} kg: ${r}`); }
  // and the flat part stays visible: the ratio there is above the research's 1.28 (the tables hold VLS from 50 t down), not hidden
  assert.equal(SPD.vls(S, 40000, 'FULL'), SPD.vls(S, 45000, 'FULL'), 'VLS flat below 50 t');
  assert.ok(SPD.vls(S, 40000, 'FULL') / SPD.vs1g(S, 40000, 'FULL') > 1.28, 'the ratio at 40 t is above 1.28 (flat VLS)');
  // CONF3 is in the CG ≥ 25 % table; CONF0…2 are not, so VLS there is 1.23 VS1g (an estimate)
  assert.ok(SPD.vls(S, 64500, 'CONF3') > SPD.vls(S, 64500, 'FULL'));
  near(SPD.vls(S, 64500, 'CONF1'), 1.23 * SPD.vs1g(S, 64500, 'CONF1'), 1e-12, 'CONF1 falls back to 1.23 VS1g');
  assert.equal(SPD.vls(model('b737_800'), 66000), null, 'a Boeing has no VLS');
});

test('T-L-06 and OD-A321NEO-CLMAX: A321ceo FULL 74 t and 78 t: VLS = 1.23 VS1g (CLmax 2.85) = 139.2 and 143.0 kt (± 2); the A321neo FULL CLmax is 3.05, which gives category C at MLW 79.2 t (2.85 would give D)', () => {
  const ceo = card('a321ceo'), full = (c) => c.aero.flaps.detents.v.find((d) => d.name === 'FULL').CLmax, S = ceo.aero.ref.S.v;
  assert.equal(full(ceo), 2.85);
  const f = (m) => 1.23 * vs1gCL(m, S, full(ceo));
  near(f(74000), 139.2, 0.1, 'formula 74 t'); near(f(78000), 143.0, 0.1, 'formula 78 t');
  const A = model('a321ceo');
  near(SPD.vls(A, 74000, 'FULL'), 139, 2, 'T-L-06 74 t'); near(SPD.vls(A, 78000, 'FULL'), 143, 2, 'T-L-06 78 t');
  near(SPD.vref(A, 74000), f(74000), 1, 'the card\'s table is the formula, in whole knots'); near(SPD.vref(A, 78000), f(78000), 1, 'at 78 t');
  // the A321neo (OD-A321NEO-CLMAX): 3.05
  const neo = card('a321neo'); assert.equal(full(neo), 3.05);
  const N = model('a321neo');
  near(SPD.vls(N, 79200, 'FULL'), 1.23 * vs1gCL(79200, S, 3.05), 1, 'VLS of the A321neo at 79.2 t from CLmax 3.05'); near(1.23 * vs1gCL(79200, S, 3.05), 139.2, 0.1, 'the research: 139.2 kt');
  assert.equal(SPD.category(SPD.vls(N, 79200, 'FULL')), 'C'); assert.equal(neo.speeds.icao_approach_category.v, 'C');
  assert.equal(SPD.category(1.23 * vs1gCL(79200, S, 2.85)), 'D', 'with the ceo\'s 2.85 the neo would be D, against Airbus (C)');
  near(1.23 * vs1gCL(79200, S, 2.85), 144.0, 0.1, 'the research: 144.0 kt with 2.85');
});

test('T-H-01…T-H-04: A330-300 VS1g 113.0 / 157.6 kt (FULL / CONF0, 187 t), VLS 136.0 at 179 t, VLS 139.0 and VAPP 144.0 at MLW (category C), V2min 151.9 / 156.9 kt at 242 t and the TSB\'s 1.216', () => {
  const S = model('a330_300'), c = card('a330_300'), Sw = c.aero.ref.S.v;
  near(SPD.vs1g(S, 187000, 'FULL'), 113.0, 0.5, 'T-H-01 FULL'); near(SPD.vs1g(S, 187000, 'CONF0'), 157.6, 0.5, 'T-H-01 CONF0');
  // the same from the card's CLmax of each detent (the research's own equation, ISA sea level, CAS)
  const CL = (n) => c.aero.flaps.detents.v.find((d) => d.name === n).CLmax;
  near(vs1gCL(187000, Sw, CL('FULL')), 113.0, 0.5, 'equation FULL'); near(vs1gCL(187000, Sw, CL('CONF0')), 157.6, 0.5, 'equation CONF0');
  near(SPD.vls(S, 179000, 'FULL'), 136.0, 1, 'T-H-02'); near(1.23 * SPD.vs1g(S, 179000, 'FULL'), 136.0, 1, 'T-H-02, 1.23 VS1g');
  near(SPD.vls(S, 187000, 'FULL'), 139.0, 1, 'T-H-03 VLS'); near(SPD.vapp(S, 187000, { hw: 0 }).vapp, 144.0, 1, 'T-H-03 VAPP');
  assert.ok(SPD.vls(S, 187000, 'FULL') < 141 && SPD.category(SPD.vls(S, 187000, 'FULL')) === 'C'); assert.equal(c.speeds.icao_approach_category.v, 'C');
  // the A330 VAPP table of the research (VLS + 5) is the model's calm A/THR value
  near(SPD.vapp(S, 187000, {}).vapp, AC.Vapp, 0.05, 'model VAPP = the card\'s VAPP_kt at the card\'s mass');
  near(SPD.v2min(SPD.vs1g(S, 242000, 'CONF2')), 151.9, 1, 'T-H-04 CONF2'); near(SPD.v2min(SPD.vs1g(S, 242000, 'CONF1+F')), 156.9, 1, 'T-H-04 CONF1+F');
  // the TSB's V2 162 kt at 222.7 t (research speeds.V2_kt note [H22]) over VS1g(1+F) there: 1.216 ± 0.02, and it clears V2min = 1.13 VS1g
  assert.match(research('a330_300').speeds.V2_kt.note, /TSB 162 kt = 1\.216 VS1g ที่ 222\.7 t/);
  const ratio = 162 / SPD.vs1g(S, 222700, 'CONF1+F'); near(ratio, 1.216, 0.02, 'V2/VS1g(1+F) of the TSB'); assert.ok(ratio >= 1.13);
});

// ───────────────────────── the flight uses them ─────────────────────────
const fly = (id, wind, opts = {}, n = 0) => { setAircraft(card(id), opts.card); setActiveRunway(opts.rwy || '03L'); const f = new Flight({ wind, ...opts.flight }); for (let i = 0; i < n; i++) f.tick(f.dt); return f; };

test('Approach in a Flight: the 737 flies Vref + 5 with the autopilot, and the manual rule with the autothrottle off; the ATR adds its wind factor; the Airbus cards ground speed mini', () => {
  // 737: pilot 'ap' = A/T on → +5 even with a gust; a hand flight without the autothrottle takes the wind rule; switching is followed on the next tick
  let f = fly('b737_800', SCENARIOS.head, { flight: { pilot: 'ap', gust: 12 } });
  near(f.appr.vapp - f.appr.vref, 5, 1e-9, 'A/P: Vref + 5'); assert.equal(f.appr.keep, 0);
  // the scenario's wind direction is a whole degree and 03L's heading is not, so the 10 kt headwind is 9.99996 kt there: bound H
  const H = 1e-3;
  f = fly('b737_800', SCENARIOS.head, { flight: { pilot: 'man', assist: true, autoThr: false, gust: 12 } });
  near(f.appr.add, 12 + 5, H, 'A/T off, headwind 10 kt (½ = 5) and gust 12'); near(f.appr.keep, 12, H, 'the gust is kept to touchdown');
  near(f.appr.target(0), f.appr.vref + 12, H, 'the commanded speed at the threshold is Vref + the gust allowance'); near(f.appr.target(100), f.appr.vapp, H, 'and Vapp far out');
  near(f.appr.Keep, 12, H, 'in the HUD unit too');
  f.opts.autoThr = true; f.tick(f.dt); assert.equal(f.appr.atOn, true); near(f.appr.add, 5, 1e-9, 'A/T on again: +5');
  // the option cap reaches the flight
  f = fly('b737_800', SCENARIOS.head, { flight: { pilot: 'man', assist: true, autoThr: false, gust: 25, windCap: 15 } });
  near(f.appr.add, 15, 1e-9, 'cap 15'); f = fly('b737_800', SCENARIOS.head, { flight: { pilot: 'man', assist: true, autoThr: false, gust: 25 } }); { const S = AC.spd, e = Math.min(20, S.vfe[S.land] - 5 - f.appr.vref); near(f.appr.add, e, 1e-9, 'cap 20 by default, or VFE − 5 kt where that is less (the 737 at FULL: VFE 162 kt)'); assert.ok(e < 20 && e > 15, 'here VFE − 5 kt binds, so the 15 kt option is below it'); }
  // the scenario's wind: the tower headwind is kt·cos(angle to the runway); a crosswind adds nothing
  near(new Approach({ wind: SCENARIOS.head }).hwTower, 10, H, 'head'); assert.ok(Math.abs(new Approach({ wind: SCENARIOS.xr }).hwTower) < 0.2, 'xr: a rounded wind direction leaves < 0.2 kt of headwind');
  // ATR in 10 kt headwind: wind factor a third of it, and the flight starts on that speed
  f = fly('atr72_600', SCENARIOS.head, { flight: { pilot: 'ap' } });
  near(f.appr.add, 10 / 3, H, 'ATR wind factor'); near(f.appr.vapp, AC.Vref + 10 / 3, H, 'VmHB30 + WF');
  near(f.ac.air.ias / KT, f.appr.vapp, 0.3, 'setApproach starts at the wind-corrected approach speed');
  // calm: every airliner starts on AC.Vapp, the card's calm A/THR speed
  for (const id of AIRLINER_IDS) { const g = fly(id, SCENARIOS.calm, { flight: { pilot: 'ap' } }); assert.equal(g.appr.vapp, AC.Vapp, id); assert.equal(g.appr.vref, AC.Vref, id); }
});

test('the Airbus ground speed mini in a flight: the extra rises with the headwind aloft over the tower\'s, is k times it, stops with the autothrottle, and the A330 blends k below 400 ft', () => {
  // 03L head: 10 kt at the tower; the log-law wind is stronger aloft
  const ceo = fly('a320ceo', SCENARIOS.head, { flight: { pilot: 'ap', dist: 5500 } }, 240 * 20);
  assert.ok(ceo.appr.extra > 0.5 && ceo.appr.extra < 8, `A320ceo extra ${ceo.appr.extra}`);
  const neo = fly('a320neo', SCENARIOS.head, { flight: { pilot: 'ap', dist: 5500 } }, 240 * 20);
  near(neo.appr.extra / ceo.appr.extra, 0.33, 0.03, 'k 0.33 against k 1 at about the same height');
  near(ceo.appr.target(100), ceo.appr.vapp + ceo.appr.extra, 1e-9, 'the commanded speed far out includes it'); assert.equal(ceo.appr.cmd, ceo.appr.Vapp + ceo.appr.extra);
  near(ceo.appr.target(0), ceo.appr.vref, 1e-9, 'and it is gone at the threshold');
  ceo.opts.autoThr = false; ceo.pilot = 'man'; ceo.tick(ceo.dt); assert.equal(ceo.appr.extra, 0, 'no autothrottle, no ground speed mini');
  // the 737 and the ATR have none
  for (const id of ['b737_800', 'atr72_600']) assert.equal(fly(id, SCENARIOS.head, { flight: { pilot: 'ap' } }, 240 * 5).appr.extra, 0, id);
  // a stub aircraft: the A330's k falls over 25 s below 400 ft (the stub's wind is a 25 kt headwind aloft against 10 at the tower)
  setAircraft(card('a330_300')); setActiveRunway('21R');
  const a = new Approach({ wind: SCENARIOS.head, atOn: true }), crs = FIELD.rwyHdg * DEG;
  const ac = { air: { h: 300 * FT }, wind: { mean: () => [-25 * KT * Math.cos(crs), -25 * KT * Math.sin(crs), 0] } };
  a.update(ac, 0); near(a.extra, 15 * (1 - 0.67 * 0 / 25), 0.01, 'just below 400 ft: k 1');
  for (let i = 0; i < 125; i++) a.update(ac, 0.1);   // 12.5 s
  near(a.extra, 15 * (1 - 0.67 * 12.5 / 25), 0.05, 'k after 12.5 s'); for (let i = 0; i < 125; i++) a.update(ac, 0.1);
  near(a.extra, 15 * 0.33, 0.05, 'k after 25 s'); ac.air.h = 500 * FT; a.update(ac, 0.1); near(a.extra, 15, 0.01, 'above 400 ft: k 1 and the timer restarts');
});

test('the Autopilot and the autothrottle fly the flight\'s target speed; the Evaluator scores against its Vref plus the kept gust and gates on its Vref', () => {
  const src = read('src/20-flight.js');
  assert.match(src, /const vTgt = this\.appr \? this\.appr\.target\(a\.hWheel\) : lerp\(AC\.Vref, AC\.Vapp, smoothstep\(15, 61, a\.hWheel\)\);/);
  assert.match(src, /const err = \(this\.appr \? this\.appr\.target\(a\.hWheel\) : lerp\(AC\.Vref, AC\.Vapp, smoothstep\(15, 61, a\.hWheel\)\)\) - a\.ias \/ KT;/);
  assert.match(src, /this\.ap = new Autopilot\(this\.ac, trim, this\.appr\);\s*this\.laws = new PilotLaws\(this\.ac, trim, this\.appr\);\s*this\.ev = new Evaluator\(this\.appr\);/);
  assert.match(src, /setApproach\(\{ dist, dh, dt: dtl, ias: this\.appr\.vapp \}\)/);
  assert.match(src, /this\.appr\.setAt\(this\.pilot === 'ap' \|\| this\.opts\.autoThr\);\s*this\.appr\.update\(ac, dt\);/);
  // a stub Approach in the Evaluator: gates and the speed score follow its Vref and Keep (KIAS of the HUD)
  const mkEv = (appr) => new Evaluator(appr);
  const td = (ias) => ({ t: 0, s: 450, tl: 0, vsFpm: -150, ias, gs: 0, bank: 0, pitch: 3, crab: 0, drift: 0, noseFirst: false, onRunway: true });
  const pts = (ev) => ev.score().parts.find((p) => p.k === 'spd').pts;
  let ev = mkEv({ Vref: 140, Keep: 0, Vapp: 145 }); ev.td = td(152); assert.equal(pts(ev), 6, 'Vref + 12: 6 points');
  ev = mkEv({ Vref: 140, Keep: 10, Vapp: 145 }); ev.td = td(152); assert.equal(pts(ev), 10, 'the same speed with a 10 kt gust kept: Vref + 2, 10 points');
  ev = mkEv({ Vref: 140, Keep: 0, Vapp: 145 }); ev.td = td(140 - 7); assert.equal(pts(ev), 10, 'Vref − 7: 10 points');
  const stubAc = (kt) => ({ air: { locDots: 0, gsDots: 0, vs: 0, ias: kt * KT, h: 0 }, flaps: 1, gearPos: 1 });
  ev = mkEv({ Vref: 140, Keep: 0, Vapp: 145 }); ev.gateCheck(stubAc(158), 'g500'); assert.equal(ev.gates.g500.items.spd, true, 'Vref + 18 inside the band against Vref 140');
  ev = mkEv({ Vref: 130, Keep: 0, Vapp: 135 }); ev.gateCheck(stubAc(158), 'g500'); assert.equal(ev.gates.g500.items.spd, false, 'and outside it against Vref 130');
  // with no Approach (a direct caller) it is speedsKias() as before
  setAircraft(trainer()); ev = new Evaluator(); ev.td = td(speedsKias().Vref + 3); assert.equal(pts(ev), 10);
  // the page: the brief, FMA, HUD read it (the strings are pinned in test/cards.test.mjs)
  assert.match(read('src/80-hud.js'), /const ap = fl\.appr;/); assert.match(read('src/90-app.js'), /V = fl\.appr/);
});

test('mass changes the speeds a flight flies: a lighter 737 and A320ceo are slower on the approach and in the Evaluator\'s Vref', () => {
  for (const id of ['b737_800', 'a320ceo', 'a330_300', 'atr72_600']) {
    const heavy = fly(id, SCENARIOS.calm, { flight: { pilot: 'ap' } }), mH = AC.m;
    const light = fly(id, SCENARIOS.calm, { card: { mass: 0.8 * mH }, flight: { pilot: 'ap' } });
    assert.ok(light.appr.vref < heavy.appr.vref - 1 && light.appr.vapp < heavy.appr.vapp - 1, `${id}: ${light.appr.vref} against ${heavy.appr.vref}`);
    assert.equal(light.appr.Vref, light.appr.vref, `${id}: no IAS–CAS table, the HUD unit is CAS`);
    assert.ok(light.ac.air.ias / KT < heavy.ac.air.ias / KT - 1, `${id}: the light flight starts slower`);
  }
});
