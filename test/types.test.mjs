// Research round 2 tests flown through the simulator cards, as the per-type regression lock (plan C1 and C2). Plan C1: the
// tests of C172S (04-c172s.md, scripts/lc_tests.mjs), C172R (10-c172r.md, le_tests.mjs) and the two DA40 types
// (05-da40.md, ld_tests.mjs) through the cards of data/aircraft, with the research's expected values and tolerances, then
// an autoland smoke test for all six types. Plan C2 (research task items 11 and 23) adds, in this order: the round 1
// trainer's numbers through lm_card (T-LM-02…07) and the lateral tolerance guide (T-LM-31); V_SR of every type at the
// mass of its POH figure by the project's stall definition (V_SR at 1 g against VS_POH/√0.95, R2-04, plan B5); the C152
// (T-LF) and P2006T (T-LG); the DA42 (T-LT-01…16, which the plan's list leaves out but "every card passes V_SR, ROC,
// glide, takeoff" asks for); the stall-recovery robot pilot (test/lib/stall_recovery.mjs) for T-LD-41, T-LT-33,
// T-LP-62…65 and T-LG-26; a regression table of every card at its training mass (LOCK); the autoland bands; and the list
// of the ids that wait for a later plan item (DEFERRED), checked against the ids the tests name. Plan C3 (research task
// item 12) adds the KIAS rows: T-LC-03 and T-LC-05 (C172S), T-LE-04 (C172R) and T-LF-07 (C152), read through the card's
// speeds.ias_cas by iasToCas and casToIas of src/20-flight.js, the functions the HUD and the Evaluator use (test/kias.test.mjs
// holds the properties of those functions and the Evaluator's use of them).
// Each case sets a copy of the generated card at the test mass (acFromCard scales the inertia by m/ref_mass, as
// round 2's buildAC does) and runs the calls of the research scripts from lm_card.mjs; runCard reads AC only for idle.
// The C152, P2006T, PC-9M, PC-7 MkII, T-6A, T-6C and DA40 NG have no file in data/aircraft: test/lib/rcard.mjs makes their
// cards the way tools/aircraft/build_cards.mjs does (nothing is written, the page does not offer them).
// A value that misses the research expectation at the research tolerance is a known gap: the research expectation goes to
// t.diagnostic, a regression band holds the measured value, and the comment names the cause and the research task item
// (01-flight-physics.md and 02-light-aircraft.md task lists) that should close it. A physics change that moves a band
// updates it in the same pull request. `TYPES_LOCK_PRINT=1 node --test test/types.test.mjs` prints the LOCK and AUTOLAND
// tables as the current model gives them. This file sets cards on the shared AC and puts the trainer back at the end.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { M, AIRCRAFT_CARD } from './harness.mjs';
import { prepare, TYPE_IDS } from '../tools/aircraft/build_cards.mjs';
import { loadType, val, iasCas } from '../docs/research/02-light-aircraft/scripts/lm_lib.mjs';
import { simCLmax, buildAC, cardInfo, runCard, climbSweep, takeoffTest, landingTest, stallAt, trim, trimThr, modes } from '../docs/research/02-light-aircraft/scripts/lm_card.mjs';
import { vsrTarget, clmaxFromStall } from '../docs/research/02-light-aircraft/scripts/lm_polar.mjs';
import { researchCard } from './lib/rcard.mjs';
import { stallRecovery } from './lib/stall_recovery.mjs';

const { setAircraft, Aircraft, Flight, SCENARIOS, setActiveRunway, KT, FT, RAD } = M;
const card = (id) => JSON.parse(fs.readFileSync(new URL(`../data/aircraft/${id}.json`, import.meta.url), 'utf8'));
const trainer = () => JSON.parse(fs.readFileSync(AIRCRAFT_CARD, 'utf8'));
after(() => setAircraft(trainer()));

// the simulator card of a type: the file of data/aircraft, or (C152, P2006T, turboprops, DA40 NG) one made in memory
const simCard = (id) => (TYPE_IDS.includes(id) ? card(id) : researchCard(id));
// the research card of a type, as the research scripts read it (provenance fixes included for the six of plan C1)
const researchOf = (id) => (TYPE_IDS.includes(id) ? prepare(id) : loadType(id));
// the card at mass kg (training_mass.kg, or the plain number of a card that gives one), with the derivatives of opts.config
function useCard(id, kg, opts) {
  const c = simCard(id);
  if (kg != null) { const m = c.airframe.weights.training_mass; if (typeof m.v === 'number') m.v = kg; else m.v.kg = kg; }
  setAircraft(c, opts);
}
// the research's test conditions for a type (speeds, takeoff flap and technique, trim targets)
const infoOf = (id, kg) => cardInfo(researchOf(id), buildAC(researchOf(id), { mass: kg }));
const near = (x, exp, tol, what) => assert.ok(Math.abs(x - exp) <= tol, `${what}: ${x.toFixed(3)} against ${exp} ± ${tol}`);
const within = (x, lo, hi, what) => assert.ok(x >= lo && x <= hi, `${what}: ${x.toFixed(3)} outside ${lo}…${hi}`);
const r = (x, n = 2) => (x == null ? '–' : (+x).toFixed(n));

// The research ids a test names (plan C2 checks them against the list it was given, see the last test of this file):
// "T-LF-04/05/06" names T-LF-04, T-LF-05 and T-LF-06. `S` is t.test that records the ids of the title.
const NAMED = new Set();
const nameIds = (title) => { for (const m of title.matchAll(/T-(L[A-Z])-(\d\d(?:\/\d\d)*)/g)) for (const n of m[2].split('/')) NAMED.add(`T-${m[1]}-${n}`); };
const S = (t, title, fn) => { nameIds(title); return t.test(title, fn); };
// runCard's stall, climb, glide and modes, and lm_card's takeoff run (VR as runCard picks it); opts.landing adds the
// autoland with full braking after the nose wheel is down (landingTest, as runCard's maxBrake)
function fly(id, kg, opts = {}) {
  const I = infoOf(id, kg); useCard(id, kg);
  const R = runCard(M, M.AC, I, { noGround: true });
  const VR = I.takeoff.VR ?? Math.round(1.05 * R.stall[I.takeoff.name].VSR_eas);
  R.takeoff = takeoffTest(M, { f: I.takeoff.f, VR, theta: I.takeoff.theta });
  if (opts.landing) R.landing = landingTest(M, { maxBrake: true });
  return { I, R };
}

// ───────────────────────── C172S at 1,156.66 kg (MTOW, CG ref 27.4 %MAC), lc_tests.mjs ─────────────────────────
test('C172S at 1,156.66 kg: research round 2 T-LC tests through the card', async (t) => {
  const kg = 1156.66;
  try {
    const { I, R } = fly('c172s', kg), st = R.stall;
    await S(t, 'T-LC-03: the POH stall table (Fig 5-3, forward CG, flaps 0, power off): VS0° 53 KCAS and VS(φ) = VS0/√cosφ = 63 / 75 ± 1 KCAS at 45° / 60°, every cell within 0.5 kt; the sim reads the 0° cell as 48 KIAS', (tt) => {
      const row = val(researchOf('c172s'), 'speeds.stall_table').cg_fwd['0'], bank = [0, 30, 45, 60], vs0 = row[0][1];
      assert.equal(vs0, 53);
      near(row[2][1], 63, 1, '45°'); near(row[3][1], 75, 1, '60°');
      bank.forEach((b, i) => near(row[i][1], vs0 / Math.sqrt(Math.cos(b * Math.PI / 180)), 0.5, `bank ${b}°`));
      // the 0° pair is the first point of the card's flaps 0 row (plan C3): the sim's KIAS of 53 KCAS is the POH's 48 KIAS
      near(M.casToIas(M.AC.kias, 0, 53), 48, 0.01, 'KIAS of 53 KCAS');
      tt.diagnostic(`KIAS of the 30 / 45 / 60° cells (POH 52 / 57 / 68, a power-off calibration the level-flight row does not give): ${[1, 2, 3].map((i) => r(M.casToIas(M.AC.kias, 0, row[i][1]), 1)).join(' / ')}`);
    });
    await S(t, 'T-LC-05: Fig 5-1 read linearly through the card: Vy 74 KIAS flaps 0 / Vref 61 KIAS flaps 30 / Vx 62 KIAS flaps 0 = 73.2 / 63.9 / 63.6 ± 0.1 KCAS', () => {
      const cas = (kias, f) => M.iasToCas(M.AC.kias, f, kias);
      near(cas(74, 0), 73.2, 0.1, 'Vy'); near(cas(61, 1), 63.9, 0.1, 'Vref'); near(cas(62, 0), 63.6, 0.1, 'Vx');
      near(M.AC.Vref, 63.9, 0.1, 'AC.Vref (the same conversion at card load)'); near(M.AC.kias.Vref, 61, 1e-9, 'AC.kias.Vref');
    });
    await t.test('T-LC-04: CLmax at 1 g, 1 kt/s, flaps 0 / 30 is 1.464 / 1.785 ± 0.03', () => {
      near(st['0'].CLmax, 1.464, 0.03, 'flaps 0'); near(st['30'].CLmax, 1.785, 0.03, 'flaps 30');
    });
    // The stall rows below use the project's definition (01-methods.md, R2-04, plan B5): V_SR at 1 g against the POH's VS
    // (KCAS) / √0.95, at the research tolerance; the research's own Vmin comparison (the sim's minimum speed, information
    // only by rule 3 of the stall-speed section of scripts/README.md) goes to the diagnostic.
    await t.test('T-LC-06/07/08: V_SR at 3,000 ft idle, flaps 0 / 10 / 30 = VS 53 / 51 / 48 KCAS / √0.95 ± 3', (tt) => {
      tt.diagnostic(`Vmin ${r(st['0'].Vmin_eas)} / ${r(st['10'].Vmin_eas)} / ${r(st['30'].Vmin_eas)} KCAS (the research's Vmin rule: 53 / 51 / 48 ± 3)`);
      for (const [d, vs] of [['0', 53], ['10', 51], ['30', 48]]) near(st[d].VSR_cas, vsrTarget(vs), 3, `flaps ${d}`);
    });
    await t.test('T-LC-12: best glide at 3,000 ft, zero thrust: 68.4 ± 3 KCAS, L/D 9.1 ± 0.5', () => {
      near(R.glide.zeroThrust.Vbg_kt, 68.4, 3, 'Vbg'); near(R.glide.zeroThrust.LD, 9.1, 0.5, 'L/D');
    });
    await t.test('T-LC-13/14: short-field takeoff, flaps 10, SL ISA, VR 52, θ 12°: ground roll 293 ± 61 m, 50 ft 497 ± 49.7 m', () => {
      assert.deepEqual([I.takeoff.name, I.takeoff.VR, I.takeoff.theta], ['10', 52, 12]);
      near(R.takeoff.groundRoll_m, 293, 61, 'ground roll'); near(R.takeoff.dist50ft_m, 497, 49.7, 'to 50 ft');
    });
    const ap = R.modes.approach;
    // the cruise modes with the card's cruise-configuration derivatives (lc_tests.mjs replaces runCard's)
    useCard('c172s', kg, { config: 'cruise' });
    const cr = modes(M, { ias: I.cruise.ias, h: I.cruise.h, flaps: 0, gear: 1, gammaDeg: 0 }, { adot: true });
    useCard('c172s', kg);
    await t.test('T-LC-20/21: cruise 110 KCAS 3,000 ft (cruise derivatives): short period ζ 0.30–2.00, ωn 4.55–8.45 rad/s; phugoid ζ ≥ 0.04', (tt) => {
      tt.diagnostic(`short period ζ ${r(cr.sp.zeta, 3)}, ωn ${r(cr.sp.wn, 3)} rad/s, CAP ${r(cr.CAP, 3)} (not judged); phugoid ζ ${r(cr.ph.zeta, 3)}, period ${r(cr.ph.T, 1)} s (not judged)`);
      assert.ok(cr.sp.zeta >= 0.3 && cr.sp.zeta <= 2.0 && cr.sp.wn >= 4.55 && cr.sp.wn <= 8.45, `ζ ${cr.sp.zeta}, ωn ${cr.sp.wn}`);
      assert.ok(cr.ph.zeta >= 0.04, `phugoid ζ ${cr.ph.zeta}`);
    });
    await t.test('T-LC-22/23/24: approach 67 KCAS 300 m flaps 30 γ −3°: Dutch roll ωn ≥ 1, ζ ≥ 0.08, ζωn ≥ 0.15; τR ≤ 1.0 / 1.4 s; spiral T₂ ≥ 12 / 20 s', (tt) => {
      tt.diagnostic(`approach Dutch roll ωn ${r(ap.dr.wn, 3)}, ζ ${r(ap.dr.zeta, 3)}, ζωn ${r(ap.dr.wn * ap.dr.zeta, 3)}; cruise ${r(cr.dr.wn, 3)} / ${r(cr.dr.zeta, 3)} (not judged)`);
      assert.ok(ap.dr.wn >= 1.0 && ap.dr.zeta >= 0.08 && ap.dr.wn * ap.dr.zeta >= 0.15, `Dutch roll ${ap.dr.wn} / ${ap.dr.zeta}`);
      assert.ok(ap.roll_tau <= 1.0 && cr.roll.tau <= 1.4, `τR ${ap.roll_tau} / ${cr.roll.tau}`);
      assert.ok((!ap.spiral.grows || ap.spiral.t2 >= 12) && (!cr.spiral.grows || cr.spiral.t2 >= 20), `spiral ${JSON.stringify(ap.spiral)} / ${JSON.stringify(cr.spiral)}`);
    });
    await t.test('T-LC-31: trim at 63.9 KCAS, flaps 30, γ −3°, 300 m leaves ≥ 10° of the 28° elevator travel up for the flare', () => {
      const T = trim(M, new Aircraft(), { ias: 63.9, h: 300, flaps: 1, gear: 1, gammaDeg: -3 });
      assert.ok(28 + T.de * RAD >= 10, `δe ${r(T.de * RAD)}°`);
    });
  } finally { setAircraft(trainer()); }
});

// ───────────────────────── C172R at 1,111.3 kg, le_tests.mjs ─────────────────────────
test('C172R at 1,111.3 kg: research round 2 T-LE tests through the card', async (t) => {
  const kg = 1111.3;
  try {
    const { I, R } = fly('c172r', kg), st = R.stall, md = R.modes;
    // V_SR against VS / √0.95 (R2-04, plan B5), the research's Vmin comparison in the diagnostic
    await t.test('T-LE-05/06/07: V_SR flaps 0 / 10 / 30 = VS 52 / 50 / 47 KCAS / √0.95 ± 3', (tt) => {
      tt.diagnostic(`Vmin ${r(st['0'].Vmin_eas)} / ${r(st['10'].Vmin_eas)} / ${r(st['30'].Vmin_eas)} KCAS (the research's Vmin rule: 52 / 50 / 47 ± 3)`);
      for (const [d, vs] of [['0', 52], ['10', 50], ['30', 47]]) near(st[d].VSR_cas, vsrTarget(vs), 3, `flaps ${d}`);
    });
    await S(t, 'T-LE-04: Fig 5-1 of the 172R read linearly through the card: Vy 79 KIAS / Vx 60 KIAS / VG 65 KIAS (flaps 0), Vref 62 KIAS (flaps 30) = 78.1 / 62.0 / 66.0 / 62.8 ± 0.1 KCAS', () => {
      const cas = (kias, f) => M.iasToCas(M.AC.kias, f, kias);
      near(cas(79, 0), 78.1, 0.1, 'Vy'); near(cas(60, 0), 62.0, 0.1, 'Vx'); near(cas(65, 0), 66.0, 0.1, 'VG'); near(cas(62, 1), 62.8, 0.1, 'Vref');
      near(M.AC.kias.Vref, 62, 1e-9, 'AC.kias.Vref'); near(M.AC.kias.Vs0, 33, 0.01, 'the 47 KCAS VS0 reads 33 KIAS, the POH white arc (Fig 5-3)');
    });
    // Known gap (design §4.3): research expects Vx 62 ± 3 KCAS, but its 60 is the first point of a 2-kt sweep, not a
    // maximum of γ. A 1-kt sweep from ceil(1.02·VSR) finds the true maximum near 57–58 kt on the flat γ(V) of the
    // legacy polar. Research item 20 (a drag model that places the maximum climb angle) closes it.
    await t.test('T-LE-09 (known gap): Vx at SL, full throttle, 1-kt sweep: regression band 57.4 ± 1.5 KCAS', (tt) => {
      const v0 = Math.ceil(1.02 * st['0'].VSR_eas);
      const cs = climbSweep(M, { h: 30, v0, v1: v0 + 30, step: 1, flaps: 0, gear: 1 });
      tt.diagnostic(`Vx ${r(cs.Vx_kt)} KCAS (γ ${r(cs.gammaMax_deg, 3)}°, sweep from ${v0} kt); research expects 62 ± 3 KCAS, its 2-kt sweep gave ${r(R.climb.Vx_kt)}; research item 20`);
      // the γ maximum itself lies inside the sweep (climbSweep's edge flag is the ROC one, Vy's): the same trims as
      // climbSweep, whose largest γ must be neither the first nor the last point, so Vx is a maximum, not an edge
      const g = []; for (let v = v0; v <= v0 + 30 + 1e-9; v += 1) g.push(trimThr(M, v, 1, 0, 1, 30).gamma);
      const iMax = g.indexOf(Math.max(...g));
      assert.ok(iMax > 0 && iMax < g.length - 1, `the largest γ is at point ${iMax} of ${g.length} (${v0 + iMax} kt), an edge of the sweep`);
      near(cs.Vx_kt, 57.4, 1.5, 'Vx');
    });
    await t.test('T-LE-11: best glide 66.0 ± 3 KCAS, L/D 9.1 ± 0.5', () => {
      near(R.glide.zeroThrust.Vbg_kt, 66.0, 3, 'Vbg'); near(R.glide.zeroThrust.LD, 9.1, 0.5, 'L/D');
    });
    await t.test('T-LE-12/13: short-field takeoff, flaps 10: ground roll 288 ± 61 m, 50 ft 514 ± 10 %', () => {
      assert.equal(I.takeoff.name, '10');
      near(R.takeoff.groundRoll_m, 288, 61, 'ground roll'); near(R.takeoff.dist50ft_m, 514, 51.4, 'to 50 ft');
    });
    // the cruise modes with runCard's (approach-configuration) derivatives, as le_tests.mjs flies them
    await t.test('T-LE-19/20: cruise 110 KCAS: short period ζ 0.30–2.00, ωn 5.60 ± 10 %; phugoid ζ ≥ 0.04', (tt) => {
      const c = md.cruise;
      tt.diagnostic(`short period ζ ${r(c.sp.zeta, 3)}, ωn ${r(c.sp.wn, 3)} rad/s; phugoid ζ ${r(c.ph.zeta, 3)}, period ${r(c.ph.T, 1)} s (not judged)`);
      assert.ok(c.sp.zeta >= 0.3 && c.sp.zeta <= 2.0 && Math.abs(c.sp.wn / 5.6 - 1) <= 0.1, `ζ ${c.sp.zeta}, ωn ${c.sp.wn}`);
      assert.ok(c.ph.zeta >= 0.04, `phugoid ζ ${c.ph.zeta}`);
    });
    await t.test('T-LE-21/22/23: approach 66 KCAS: Dutch roll ωn ≥ 1, ζ ≥ 0.08, ζωn ≥ 0.15; τR ≤ 1.0 / 1.4 s; spiral T₂ ≥ 12 / 20 s', (tt) => {
      const a = md.approach, c = md.cruise;
      tt.diagnostic(`approach Dutch roll ωn ${r(a.dr.wn, 3)}, ζ ${r(a.dr.zeta, 3)}, ζωn ${r(a.dr.wn * a.dr.zeta, 3)}; cruise ${r(c.dr.wn, 3)} / ${r(c.dr.zeta, 3)} (not judged)`);
      assert.ok(a.dr.wn >= 1.0 && a.dr.zeta >= 0.08 && a.dr.wn * a.dr.zeta >= 0.15, `Dutch roll ${a.dr.wn} / ${a.dr.zeta}`);
      assert.ok(a.roll_tau <= 1.0 && c.roll_tau <= 1.4, `τR ${a.roll_tau} / ${c.roll_tau}`);
      assert.ok((!a.spiral.grows || a.spiral.t2 >= 12) && (!c.spiral.grows || c.spiral.t2 >= 20), `spiral ${JSON.stringify(a.spiral)} / ${JSON.stringify(c.spiral)}`);
    });
  } finally { setAircraft(trainer()); }
});

// ───────────────────────── DA40 (IO-360) at 1,200 kg and DA40 D at 1,150 kg, ld_tests.mjs ─────────────────────────
// The cards fly their own thrust line, (2.22, 0, 0.05) m FRD; the research run flew the trainer's (3.5, 0, 0).
// Maximum level speed: the exact trim (Aircraft.trim, plan B2) at h 50 m (wheels clear), dry ISA (a bare Aircraft),
// flaps 0, gear down, the highest TAS that trims with the throttle at or under full (bisection to 0.0001 kt).
function vmaxTAS() {
  const ac = new Aircraft(); ac.flaps = ac.cmd.flaps = 0; ac.gearPos = 1;
  const trims = (kt) => { const s = ac.trim({ h: 50, n: 0, e: 0, tas: kt * KT, gammaA: 0, chi: 0 }); return s.ok && !s.limited; };
  let lo = 80, hi = 170;
  assert.ok(trims(lo) && !trims(hi), 'vmax lies between 80 and 170 KTAS');
  for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (trims(mid)) lo = mid; else hi = mid; }
  return lo;
}

test('DA40 (IO-360) at 1,200 kg: research round 2 T-LD tests through the card', async (t) => {
  try {
    const { I, R } = fly('da40_180', 1200), st = R.stall;
    assert.deepEqual(M.AC.engines.map((e) => e.pos), [[2.22, 0, 0.05]]);
    // ld_tests.mjs: 53 / 52 KIAS through the IAS–CAS table of the earlier DA40
    // V_SR against VS / √0.95 (R2-04, plan B5); UP keeps the ± 5 of OD-DA40-CLMAX path (a), LDG ± 3
    await t.test('T-LD-27: V_SR at 3,000 ft idle, flaps UP / LDG = VS 56.7 ± 5 / 55.7 ± 3 KCAS / √0.95', (tt) => {
      tt.diagnostic(`Vmin ${r(st.UP.Vmin_eas)} / ${r(st.LDG.Vmin_eas)} KCAS (the research's Vmin rule: 56.7 ± 5 / 55.7 ± 3)`);
      near(st.UP.VSR_cas, vsrTarget(56.7), 5, 'UP'); near(st.LDG.VSR_cas, vsrTarget(55.7), 3, 'LDG');
    });
    await t.test('T-LD-28: ROC max at SL 780 ± 100 fpm; glide L/D 8.8 ± 0.5', () => {
      near(R.climb.ROCmax_fpm, 780, 100, 'ROC'); near(R.glide.zeroThrust.LD, 8.8, 0.5, 'L/D');
    });
    // Known gap (design §4.3): research expects 450 ± 45 m to 50 ft; the card's thrust line gives 507 m (+12.7 %).
    // Research item 13 (engine and propeller model) closes it.
    await t.test('T-LD-29: takeoff, flaps T/O, VR 62.1, θ 8°: ground roll 305 ± 15.25 m; 50 ft (known gap) regression band 507.2 m ± 3 %', (tt) => {
      assert.deepEqual([I.takeoff.name, I.takeoff.VR, I.takeoff.theta], ['T/O', 62.1, 8]);
      tt.diagnostic(`ground roll ${r(R.takeoff.groundRoll_m, 1)} m; to 50 ft ${r(R.takeoff.dist50ft_m, 1)} m, research expects 450 ± 45 m; research item 13`);
      near(R.takeoff.groundRoll_m, 305, 15.25, 'ground roll');
      near(R.takeoff.dist50ft_m, 507.18, 0.03 * 507.18, 'to 50 ft');
    });
    // Known gap (design §4.3): research expects 142 ± 3 KTAS (its quasi-steady formula gave 113.9); research item 13
    await t.test('T-LD-30 (known gap): vmax at SL, full throttle, level: regression band 114.2 ± 1 KTAS', (tt) => {
      const v = vmaxTAS();
      tt.diagnostic(`vmax ${r(v, 2)} KTAS; research expects 142 ± 3 KTAS; research item 13`);
      near(v, 114.18, 1, 'vmax');
    });
  } finally { setAircraft(trainer()); }
});

test('DA40 D at 1,150 kg: research round 2 T-LD tests through the card', async (t) => {
  try {
    const { R } = fly('da40d', 1150);
    await t.test('T-LD-31: V_SR flaps UP = VS 55.9 ± 5 KCAS / √0.95 (R2-04, plan B5); ROC max at SL 550 ± 100 fpm', (tt) => {
      tt.diagnostic(`Vmin ${r(R.stall.UP.Vmin_eas)} KCAS (the research's Vmin rule: 55.9 ± 5)`);
      near(R.stall.UP.VSR_cas, vsrTarget(55.9), 5, 'V_SR UP'); near(R.climb.ROCmax_fpm, 550, 100, 'ROC');
    });
    // Known gap (design §4.3): research expects 640 ± 64 m; the card's thrust line gives 574 m, 1.6 m outside (the
    // research run passed at 577 m only because it flew the trainer's engine position); research item 13.
    await t.test('T-LD-32 (known gap): takeoff to 50 ft, flaps T/O: regression band 574.4 m ± 3 %', (tt) => {
      tt.diagnostic(`to 50 ft ${r(R.takeoff.dist50ft_m, 1)} m (ground roll ${r(R.takeoff.groundRoll_m, 1)} m); research expects 640 ± 64 m; research item 13`);
      near(R.takeoff.dist50ft_m, 574.43, 0.03 * 574.43, 'to 50 ft');
    });
  } finally { setAircraft(trainer()); }
});

// ───────────────────────── plan C2: the round 1 trainer through lm_card, T-LM-02…07 ─────────────────────────
// 01-methods.md §01.11 (T-LM-02…07), lm_selftest.mjs: the trainer card of data/aircraft is the round 1 trainer's numbers
// (plan B3), so lm_card on the round 2 fixture trainer_r1 must give round 1's published numbers on today's sim too.
test('trainer (round 1 numbers through lm_card): research round 2 T-LM-02…07', async (t) => {
  try {
    setAircraft(trainer());
    const r1 = loadType('trainer_r1'), I = cardInfo(r1, buildAC(r1, {}));
    const R = runCard(M, M.AC, I, {});
    await S(t, 'T-LM-02: V_SR flaps landing + gear down / clean at 3,000 ft idle 1 kt/s: 71.9 / 79.6 ± 0.3 KEAS', () => {
      near(R.stall.LDG.VSR_eas, 71.9, 0.3, 'LDG'); near(R.stall.UP.VSR_eas, 79.6, 0.3, 'UP');
    });
    await S(t, 'T-LM-03: SL full throttle clean, 2-kt sweep: Vy 128 ± 1 kt, ROC 3,225 ± 15 fpm', () => {
      near(R.climb.Vy_grid_kt, 128, 1, 'Vy'); near(R.climb.ROC_grid_fpm, 3225, 15, 'ROC');
    });
    await S(t, 'T-LM-04: best glide at 3,000 ft, zero thrust / idle 0.045: L/D 16.5 / 21.7 ± 0.1', () => {
      near(R.glide.zeroThrust.LD, 16.5, 0.1, 'zero thrust'); near(R.glide.idle.LD, 21.7, 0.1, 'idle');
    });
    await S(t, 'T-LM-05: approach 95 kt flaps landing 300 m γ −3°: short period ωn 2.22 ± 0.02 rad/s, ζ 0.58 ± 0.01', () => {
      const a = R.modes.approach; near(a.sp.wn, 2.22, 0.02, 'ωn'); near(a.sp.zeta, 0.58, 0.01, 'ζ');
    });
    await S(t, 'T-LM-06: approach: Dutch roll ωn 1.61 ± 0.02, ζ 0.139 ± 0.003; roll mode τR 0.218 ± 0.005 s', () => {
      const a = R.modes.approach; near(a.dr.wn, 1.61, 0.02, 'ωn'); near(a.dr.zeta, 0.139, 0.003, 'ζ'); near(a.roll_tau, 0.218, 0.005, 'τR');
    });
    await S(t, 'T-LM-07: takeoff flaps 0 VR 82 θ 10° to 50 ft 590 ± 10 m; landing from 50 ft, full braking, 714 ± 15 m', (tt) => {
      tt.diagnostic(`takeoff ${r(R.takeoff.dist50ft_m, 1)} m (ground roll ${r(R.takeoff.groundRoll_m, 1)}), landing ${r(R.landing.maxBrake.total_m, 1)} m (air ${r(R.landing.maxBrake.air_m, 0)}, ground ${r(R.landing.maxBrake.ground_m, 0)})`);
      near(R.takeoff.dist50ft_m, 590, 10, 'takeoff'); near(R.landing.maxBrake.total_m, 714, 15, 'landing');
    });
  } finally { setAircraft(trainer()); }
});

// ───────────────────────── T-LM-31: the lateral-mode tolerance guide ─────────────────────────
// 01-methods.md §01.3.4: leaf common_light.methods.lateral_mode_tolerance. A sim mode is compared with a real aircraft's
// value R by the ratio R / sim, which must lie in the class's range (not ±5–10 % as for the longitudinal modes); a
// regression against a value the same card computed earlier keeps a narrow tolerance. Spiral: no number, T2 ≥ 12 s when
// it diverges (MIL-F-8785C Level 1, Category C [R1:V7]). lm_selftest.mjs T-LM-31 checks the leaf against lm_tolerance.mjs
// (lm_ci runs it); here the leaf, the use of the class ranges on the one type with a flight-test reference (P2006T,
// T-LG-14/15) and the spiral rule on every card.
const LATERAL_TOL = JSON.parse(fs.readFileSync(new URL('../docs/research/02-light-aircraft/params-light.json', import.meta.url), 'utf8')).common_light.methods.lateral_mode_tolerance.v;
test('T-LM-31: lateral_mode_tolerance leaf, class ranges and the spiral rule on every card', async (t) => {
  await S(t, 'T-LM-31: the leaf holds the ranges of 01-methods.md §01.3.4 (validated class and K 1.5 class)', () => {
    assert.deepEqual([LATERAL_TOL.validated_class.dr_wn, LATERAL_TOL.validated_class.dr_zeta, LATERAL_TOL.validated_class.tauR], [[0.9, 1.45], [0.6, 1.4], [0.65, 1.6]]);
    assert.deepEqual([LATERAL_TOL.unvalidated_class.dr_wn, LATERAL_TOL.unvalidated_class.dr_zeta, LATERAL_TOL.unvalidated_class.tauR], [[0.75, 1.55], [0.45, 1.75], [0.55, 2.1]]);
    assert.equal(LATERAL_TOL.unvalidated_class.K_widen, 1.5);
  });
  try {
    for (const id of TYPE_IDS) {
      const { R } = fly(id);
      for (const k of ['approach', 'cruise']) {
        const m = R.modes[k];
        assert.ok(!m.spiral.grows || m.spiral.t2 >= 12, `${id} ${k}: spiral diverges with T2 ${r(m.spiral.t2, 1)} s, under 12 s`);
      }
    }
  } finally { setAircraft(trainer()); }
});

// ───────────────────────── C152 at 757.5 kg (MTOW), lf_tests.mjs ─────────────────────────
// 11-c152.md §11.12, the ids of the research task list item 11 (T-LF-01…06, 08, 10…12, 14, 18, 20, 21, 26…28). The
// stall rows use the project's definition (01-methods.md, R2-04, plan B5): the sim's V_SR at 1 g against the POH's VS
// (KCAS) / √0.95, at the research tolerance; the research's own Vmin comparison goes to the diagnostic.
test('C152 at 757.5 kg: research round 2 T-LF tests through a card made in memory', async (t) => {
  const LB = 0.45359237, IN = 0.0254;
  try {
    const rc = loadType('c152'), { I, R } = fly('c152', 757.5), st = R.stall;
    await S(t, 'T-LF-01/02/03: card MTOW 1,670 lb = 757.499 ± 0.1 kg; CG limit at 1,500 lb 31.773 ± 0.01 in DAT; wing loading 10.5 ± 0.05 lb/ft²', () => {
      near(val(rc, 'airframe.weights.MTOW'), 1670 * LB, 0.1, 'MTOW');
      const [a, b] = val(rc, 'airframe.cg.envelope'), f = (1500 * LB - a[0]) / (b[0] - a[0]);
      near((a[1] + f * (b[1] - a[1])) / IN, 31.773, 0.01, 'forward CG at 1,500 lb');
      near(val(rc, 'airframe.weights.MTOW') / LB / (val(rc, 'aero.ref.S') / 0.09290304), 10.5, 0.05, 'wing loading');
    });
    await S(t, 'T-LF-04/05/06: V_SR at 3,000 ft idle 1 kt/s, flaps 0 / 10 / 30 = VS 48 / 46 / 43 KCAS / √0.95 ± 1.5', (tt) => {
      tt.diagnostic(`Vmin ${r(st['0'].Vmin_eas)} / ${r(st['10'].Vmin_eas)} / ${r(st['30'].Vmin_eas)} KCAS (the research's Vmin rule: 48 / 46 / 43 ± 1.5)`);
      for (const [d, vs] of [['0', 48], ['10', 46], ['30', 43]]) near(st[d].VSR_cas, vsrTarget(vs), 1.5, `flaps ${d}`);
    });
    // The calibration table of Fig 5-1 starts at 40 KIAS; the research's 40.3 KIAS was above the POH's 35 (Fig 5-3, flaps 30:
    // 35 KIAS = 43 KCAS). Plan C3 starts each row of the card's table at the stall pair (build_cards.mjs anchorStallRows).
    await S(t, 'T-LF-07: flaps 30, MTOW, idle, 1 kt/s: the minimum speed Vmin reads 35 ± 3 KIAS through the card table', (tt) => {
      const vmin = st['30'].Vmin_eas, kias = M.casToIas(M.AC.kias, 1, vmin);
      tt.diagnostic(`Vmin ${r(vmin)} KCAS reads ${r(kias, 1)} KIAS (research expects 35 ± 3; without the stall pair in the row 40.3)`);
      near(kias, 35, 3, 'Vmin in KIAS');
    });
    await S(t, 'T-LF-08/10: SL full throttle clean: ROC 715 ± 40 fpm, Vx 56.5 ± 3 KCAS (55 KIAS through the card table)', () => {
      near(R.climb.ROCmax_fpm, 715, 40, 'ROC'); near(R.climb.Vx_kt, iasCas(rc, '0').f(55), 3, 'Vx');
    });
    await S(t, 'T-LF-11/12: best glide at 3,000 ft zero thrust: L/D 9.114 ± 0.3 (1.5 NM per 1,000 ft) at 60 ± 2 KEAS; sink V_TAS/(L/D) 696 ± 30 fpm', () => {
      const g = R.glide.zeroThrust, ratio = 1.5 * 1852 / (1000 * FT);
      near(g.LD, ratio, 0.3, 'L/D'); near(g.Vbg_kt, 60, 2, 'Vbg');
      const tas = g.Vbg_kt / Math.sqrt(M.atmosphere(M.FIELD.elev + 3000 * FT, 0).rho / 1.225);
      near(g.sink_fpm, tas * KT / ratio / FT * 60, 30, 'sink');
    });
    await S(t, 'T-LF-14: takeoff flaps 10 VR 52 θ 12° to 50 ft 1,340 ft = 408 ± 15 % m', (tt) => {
      assert.deepEqual([I.takeoff.name, I.takeoff.VR, I.takeoff.theta], ['10', 52, 12]);
      tt.diagnostic(`ground roll ${r(R.takeoff.groundRoll_m, 1)} m (POH 725 ft = 221 m, its short-field technique lifts off sooner; not asserted)`);
      near(R.takeoff.dist50ft_m, 1340 * FT, 0.15 * 1340 * FT, 'to 50 ft');
    });
    await S(t, 'T-LF-18/20/21: trim 90 KCAS 3,000 ft: throttle 0.6–1.0, δe inside −25…+18°; approach 61 KCAS: short period ζ 0.35–1.30, CAP 0.15–3.6; Dutch roll ζ ≥ 0.08, ωn ≥ 0.4, ζωn ≥ 0.15, τR ≤ 1 s, spiral T2 ≥ 12 s if it diverges', () => {
      const tc = R.trim.cruise, a = R.modes.approach;
      within(tc.thr, 0.6, 1.0, 'cruise throttle'); within(tc.de_deg, -25, 18, 'cruise δe');
      within(a.sp.zeta, 0.35, 1.3, 'short period ζ'); within(a.CAP, 0.15, 3.6, 'CAP');
      assert.ok(a.dr.zeta >= 0.08 && a.dr.wn >= 0.4 && a.dr.zeta * a.dr.wn >= 0.15, `Dutch roll ${a.dr.wn} / ${a.dr.zeta}`);
      assert.ok(a.roll_tau <= 1, `τR ${a.roll_tau}`); assert.ok(!a.spiral.grows || a.spiral.t2 >= 12, `spiral ${JSON.stringify(a.spiral)}`);
    });
    await S(t, 'T-LF-26/27/28: card data: stall table at 60° bank = V0/√cos φ ± 1.5; ias_cas flaps 30 at 85 KIAS = 87, flaps 10 at 60 KIAS = 61 ± 0.5 KCAS; takeoff roll with 9 kt headwind 652.5 ± 1 ft', () => {
      const tab = val(rc, 'speeds.stall_table').cg_fwd['0'];
      near(tab[3][1], tab[0][1] * Math.SQRT2, 1.5, 'stall table 60°');
      near(iasCas(rc, '30').f(85), 87, 0.5, 'VFE'); near(iasCas(rc, '10').f(60), 61, 0.5, 'flaps 10');
      near(725 * (1 - val(rc, 'performance.corrections').headwind_pct_per_kt * 9 / 100), 652.5, 1, 'headwind');
    });
  } finally { setAircraft(trainer()); }
});

// ───────────────────────── P2006T: 1,180 kg, 1,230 kg and the training mass, lg_tests.mjs ─────────────────────────
// 12-p2006t.md §12.11, the ids of task item 11 (T-LG-01…12, 14…17, 19). Stall rows by V_SR as above; the rest as the
// research script computes them. The two Dutch roll rows are also held to the class ranges of T-LM-31: the reference is
// a flight test [LG7] and the P2006T is a twin, so the range of the unvalidated class applies to R / sim.
test('P2006T: research round 2 T-LG tests through a card made in memory', async (t) => {
  try {
    const rc = loadType('p2006t'), A = fly('p2006t', 1180), B = fly('p2006t', 1230, { landing: true }), Tm = fly('p2006t');
    const st = A.R.stall, kcas = (d, kias) => A.I.ias2cas(d).f(kias);
    await S(t, 'T-LG-01/02/03: V_SR at 1,180 kg, flaps UP / T/O / FULL = VS 66 / 56 / 53 KIAS (through the card table) / √0.95 ± 2 KCAS', (tt) => {
      tt.diagnostic(`Vmin ${r(st.UP.Vmin_kias)} / ${r(st['T/O'].Vmin_kias)} / ${r(st.FULL.Vmin_kias)} KIAS (the research's Vmin rule: 66 / 56 / 53 ± 2)`);
      for (const [d, vs] of [['UP', 66], ['T/O', 56], ['FULL', 53]]) near(st[d].VSR_cas, vsrTarget(kcas(d, vs)), 2, d);
    });
    await S(t, 'T-LG-04: V_SR at 1,230 kg, flaps FULL = 55 KCAS / √0.95 ± 2', (tt) => {
      tt.diagnostic(`Vmin ${r(B.R.stall.FULL.Vmin_eas)} KCAS (the research's Vmin rule: 55 ± 2)`);
      near(B.R.stall.FULL.VSR_cas, vsrTarget(55), 2, 'FULL');
    });
    await S(t, 'T-LG-05/06: stall table FULL at 60° bank = 54/√cos 60° = 76.37 ± 1.5 KCAS; CLmax at 1 g (lm_polar from 54 KCAS) 1.576 ± 0.01', () => {
      const tab = val(rc, 'speeds.stall_table').data[1];
      near(tab[4][1], tab[0][1] / Math.sqrt(Math.cos(60 * Math.PI / 180)), 1.5, 'table at 60°');
      near(st.FULL.CLmax, clmaxFromStall({ mass: 1180, S: val(rc, 'aero.ref.S'), vs_kcas: 54, kind: 'min' }).CLmax_1g, 0.01, 'CLmax');
    });
    await S(t, 'T-LG-07/08: SL full throttle both engines clean: Vy 79 ± 3 KCAS, ROC 1,105 ± 80 fpm', () => {
      near(A.R.climb.Vy_kt, 79, 3, 'Vy'); near(A.R.climb.ROCmax_fpm, 1105, 80, 'ROC');
    });
    await S(t, 'T-LG-09/10: idle glide at 3,000 ft: L/D 11.2 ± 0.6, best-glide speed 82 ± 3 KCAS', () => {
      near(A.R.glide.idle.LD, 11.2, 0.6, 'L/D'); near(A.R.glide.idle.Vbg_kt, 82, 3, 'Vbg');
    });
    await S(t, 'T-LG-11: trim 110 KCAS 3,000 ft at 1,128 kg: α = (CL − CL0 − CLδe·δe)/CLα within ± 0.3°', () => {
      useCard('p2006t');
      const tc = Tm.R.trim.cruise, CL = M.AC.m * 9.80665 / (0.5 * 1.225 * (110 * KT) ** 2 * M.AC.S);
      near(tc.alpha_deg, (CL - M.AC.CL0 - M.AC.CLde * tc.de_deg / RAD) / M.AC.CLa * RAD, 0.3, 'α');
    });
    const c = Tm.R.modes.cruise;
    await S(t, 'T-LG-12: cruise 110 KCAS 3,000 ft, flight test [LG7]: short period ωn 3.41 ± 15 %', () => { near(c.sp.wn, 3.41, 0.15 * 3.41, 'ωn'); });
    await S(t, 'T-LG-14/15: Dutch roll ωn 2.00 ± 15 %, ζ 0.26 ± 0.08; and R / sim inside the unvalidated class ranges (ωn 0.75–1.55, ζ 0.45–1.75)', () => {
      near(c.dr.wn, 2.0, 0.15 * 2.0, 'ωn'); near(c.dr.zeta, 0.26, 0.08, 'ζ');
      const U = LATERAL_TOL.unvalidated_class;
      within(2.0 / c.dr.wn, ...U.dr_wn, 'R/sim ωn'); within(0.26 / c.dr.zeta, ...U.dr_zeta, 'R/sim ζ');
    });
    await S(t, 'T-LG-16: phugoid period 27 ± 20 % s', () => { near(c.ph.T, 27, 0.2 * 27, 'period'); });
    await S(t, 'T-LG-17: 1,230 kg takeoff flaps T/O VR 64 θ 12° ground roll 301 ± 20 % m', (tt) => {
      assert.deepEqual([B.I.takeoff.name, B.I.takeoff.VR, B.I.takeoff.theta], ['T/O', 64, 12]);
      tt.diagnostic(`to 50 ft ${r(B.R.takeoff.dist50ft_m, 1)} m, research expects 394 ± 20 % (T-LG-18: the sim lifts off at ${r(B.R.takeoff.V_LOF_kt, 1)} kt, 66.5 KIAS in the AFM; task item 19)`);
      near(B.R.takeoff.groundRoll_m, 301, 0.2 * 301, 'ground roll');
    });
    await S(t, 'T-LG-19: 1,230 kg landing flaps FULL, autoland and full braking after the nose wheel: ground roll 231 ± 20 % m', (tt) => {
      tt.diagnostic(`from 50 ft ${r(B.R.landing.total_m, 1)} m, research expects 349 ± 20 % (T-LG-20; the 3° glide path gives ${r(B.R.landing.air_m, 0)} m in the air; task item 18)`);
      near(B.R.landing.ground_m, 231, 0.2 * 231, 'ground roll');
    });
  } finally { setAircraft(trainer()); }
});

// ───────────────────────── DA42 NG at 1,900 kg and TAE 125 at 1,785 kg, lt_tests.mjs ─────────────────────────
// 06-da42.md §06.11. Not in plan C2's list (the plan names only T-LT-33 of the DA42), but "every card passes V_SR, ROC,
// glide and takeoff" needs the two DA42 cards flown: the rows the research marks as passing today, T-LT-01…05, 07…09,
// 11…16. The DA42-VI (T-LT-06, 10) has no card. T-LT-16 is the hot-day takeoff with the ISA deviation on the aircraft.
test('DA42 NG at 1,900 kg and DA42 (TAE 125) at 1,785 kg: research round 2 T-LT tests through the cards', async (t) => {
  try {
    const ng = fly('da42ng', 1900, { landing: true }), td = fly('da42_tae125', 1785);
    const ngc = prepare('da42ng'), tdc = prepare('da42_tae125');
    await S(t, 'T-LT-01/02/03: NG V_SR, flaps UP / APP / LDG = VS 68 / 65 / 62 KIAS (card table) / √0.95 ± 2 KCAS', (tt) => {
      tt.diagnostic(`Vmin ${r(ng.R.stall.UP.Vmin_kias)} / ${r(ng.R.stall.APP.Vmin_kias)} / ${r(ng.R.stall.LDG.Vmin_kias)} KIAS (the research's Vmin rule: 68 / 65 / 62 ± 2)`);
      for (const [d, vs] of [['UP', 68], ['APP', 65], ['LDG', 62]]) near(ng.R.stall[d].VSR_cas, vsrTarget(iasCas(ngc, d).f(vs)), 2, d);
    });
    await S(t, 'T-LT-04/05: TAE 125 V_SR, flaps UP / LDG = VS 64 / 57 KIAS (card table) / √0.95 ± 2 KCAS', () => {
      for (const [d, vs] of [['UP', 64], ['LDG', 57]]) near(td.R.stall[d].VSR_cas, vsrTarget(iasCas(tdc, d).f(vs)), 2, d);
    });
    await S(t, 'T-LT-07/08/09: SL ISA both engines full: NG ROC 1,180 ± 118 fpm at Vy 89.9 ± 5 KCAS (90 KIAS); TAE 125 ROC 1,060 ± 106', () => {
      near(ng.R.climb.ROCmax_fpm, 1180, 118, 'NG ROC'); near(ng.R.climb.Vy_kt, iasCas(ngc, 'UP').f(90), 5, 'NG Vy'); near(td.R.climb.ROCmax_fpm, 1060, 106, 'TAE ROC');
    });
    await S(t, 'T-LT-11/12/13: takeoff flaps UP: NG ground roll 458 ± 69 m, to 50 ft 733 ± 110 m; TAE 125 to 50 ft 691 ± 104 m', () => {
      near(ng.R.takeoff.groundRoll_m, 458, 69, 'NG roll'); near(ng.R.takeoff.dist50ft_m, 733, 110, 'NG 50 ft'); near(td.R.takeoff.dist50ft_m, 691, 104, 'TAE 50 ft');
    });
    await S(t, 'T-LT-14/15: NG landing from 50 ft, flaps LDG, full braking after the nose wheel: 594 ± 119 m, of which ground roll 366 ± 73 m', () => {
      near(ng.R.landing.total_m, 594, 119, 'from 50 ft'); near(ng.R.landing.ground_m, 366, 73, 'ground roll');
    });
    await S(t, 'T-LT-16: NG takeoff at 35 °C (ISA +20 on the aircraft): ground roll 458·σ^−1.33 = 501 ± 15 % m', () => {
      useCard('da42ng', 1900);
      const Hot = class extends Aircraft { constructor(...a) { super(...a); this.isaDev = 20; } };
      const hot = takeoffTest({ ...M, Aircraft: Hot }, { f: ng.I.takeoff.f, VR: ng.I.takeoff.VR, theta: ng.I.takeoff.theta });
      const e = 458 * (288.15 / 308.15) ** -1.33;
      near(hot.groundRoll_m, e, 0.15 * e, 'hot ground roll');
    });
  } finally { setAircraft(trainer()); }
});


// ───────────────────────── stall recovery: the robot pilot, research task item 23 ─────────────────────────
// Rows: research id, type, mass (kg; null = the card's training mass, as the research row says; MTOW for the turboprops),
// the research's expected height lost (ft) and tolerance (ft; ± 35 % where the row says so), then the height the robot
// loses on today's model (regression pin, ft). Expected values are class values of the research, h = c·VS1² with c from
// three trainers' POH figures (05-da40.md §05.6, 06-da42.md §06.6.5, 07-turboprop-trainers.md §07.13 note 7), except the
// P2006T's, the AFM's own maximum (12-p2006t.md T-LG-26). The robot (test/lib/stall_recovery.mjs) enters the 1 kt/s idle
// stall flaps UP at 3,000 ft and recovers by reducing α until the stall warning stops, full power, wings level.
// Known gap, all nine rows: the sim loses 47–131 ft, a sixth to a half of the research value (the pins below hold the
// measured numbers; flaps UP, gear up on the retractable types as the stall test flies them). Likely cause: the Beard–
// McLain blend (plan F6 replaces it) gives no sink build-up in the stall (its post-stall pitch-down term, −0.25·σ·(α −
// α₀) in Cm, lowers the nose by itself), the thrust follows TAS only with no spool-up, and the robot recovers at the first
// sign of the break; the POH figures are the most a real recovery may cost ("may lose up to 230 ft", C172S POH), not
// what a prompt one costs. Research task item 23 is this robot: it measures, it does not close the gap; plans F6 and G4
// re-baseline the rows. Until then the pins catch a physics change that moves the recovery up to the lift peak and the first
// part of the break; the robot stops at CL 1 % under its peak, 2.7–2.9° under the blend centre (stall fraction about 0.11), so
// the post-stall drag and pitch terms of the model are not exercised and nothing here pins them.
const MTOW = (id) => val(loadType(id), 'airframe.weights.MTOW');
const RECOVERY = [
  ['T-LD-41', 'da40ng', null, 240, 84, 75.4], ['T-LD-41', 'da40_180', null, 180, 63, 58.3], ['T-LD-41', 'da40d', null, 190, 66.5, 72.9],
  ['T-LT-33', 'da42ng', null, 280, 100, 47.0],
  ['T-LP-62', 'pc9m', MTOW('pc9m'), 380, 135, 64.6], ['T-LP-63', 'pc7mk2', MTOW('pc7mk2'), 360, 128, 73.8],
  ['T-LP-64', 't6a', MTOW('t6a'), 450, 163, 106.0], ['T-LP-65', 't6c', MTOW('t6c'), 470, 166, 131.4],
  ['T-LG-26', 'p2006t', 1180, 180, 30, 86.2],
];
const printed = [];   // TYPES_LOCK_PRINT: what the tables below would hold
test('stall recovery robot pilot: height lost, research T-LD-41, T-LT-33, T-LP-62…65, T-LG-26 (known gaps, regression pins)', async (t) => {
  try {
    for (const [id, type, kg, exp, tol, pin] of RECOVERY) {
      await S(t, `${id} (known gap): ${type} stall flaps UP at ${kg ?? 'training mass'} kg, recovered by the robot: research ${exp} ± ${tol} ft, regression pin ${pin ?? '?'} ft ± 3 %`, (tt) => {
        const rc = loadType(type);
        assert.equal(val(rc, 'speeds.stall_altitude_loss_ft'), exp, 'the research card holds the number the row expects');
        const I = infoOf(type, kg ?? undefined); useCard(type, kg ?? undefined);
        const rec = stallRecovery(M, { flaps: 0, gear: I.retract ? 0 : 1 });
        const vsr = stallAt(M, M.AC, I, I.dets[0]);
        tt.diagnostic(`${type} ${r(M.AC.m, 1)} kg: lost ${r(rec.loss_ft, 1)} ft in ${r(rec.t_recover_s, 1)} s from the break (research ${exp} ± ${tol} ft; VS1 ${I.VS1} KCAS, c·VS1² = ${r(exp / I.VS1 ** 2, 4)} ft/kt²); break at ${r(rec.V_break_eas, 1)} KEAS, V_SR ${r(rec.VSR_eas, 2)} (stall test ${r(vsr.VSR_eas, 2)}); α ${r(rec.alphaPeak_deg, 1)}° at the lift peak, held at ${r(rec.alphaRec_deg, 1)}°`);
        if (process.env.TYPES_LOCK_PRINT) printed.push(`RECOVERY ${id} ${type} ${r(rec.loss_ft, 1)}`);
        assert.ok(rec.recovered, 'the robot recovered (sink rate zero again within 60 s)');
        assert.ok(rec.maxPhi_deg < 1, `wings stay level: bank ${rec.maxPhi_deg}°`);
        near(rec.VSR_eas, vsr.VSR_eas, 0.5, 'the robot enters the same stall as the V_SR test');
        // the entry reached the lift peak and the break (not only the pre-stall approach to them): α of the largest CL at the α of
        // the sim's trimmed 1-g CLmax (simCLmax, within 1°) and that CL within 2 %, CL under 0.99 of its peak at the break, and
        // the blend fraction above 0.05. It does not reach α_stall: this robot's pins leave the post-stall model unpinned (see
        // the header of test/lib/stall_recovery.mjs)
        const pk = simCLmax(M.AC, 0);
        near(rec.alphaPeak_deg, pk.alpha, 1, 'α at the lift peak against the sim CLmax α');
        near(rec.CLmax, pk.CL, 0.02 * pk.CL, 'CLmax of the entry against the sim CLmax');
        assert.ok(rec.CLbreak < 0.99 * rec.CLmax, `CL at the break ${rec.CLbreak} against peak ${rec.CLmax}`);
        assert.ok(rec.alphaMax_deg > rec.alphaPeak_deg && rec.stallMax_frac > 0.05, `past the peak: α max ${rec.alphaMax_deg}°, stall fraction ${rec.stallMax_frac}`);
        if (pin != null) near(rec.loss_ft, pin, Math.max(1, 0.03 * pin), 'height lost');
      });
    }
  } finally { setAircraft(trainer()); }
});


// ───────────────────────── the per-type regression lock ─────────────────────────
// Every card of data/aircraft at its training mass (the mass the page flies), measured as the research's runCard does:
// V_SR per flap detent (KCAS, 3,000 ft idle 1 kt/s), the climb sweep at SL (Vy, ROC, Vx; 2-kt steps), the best glide at
// zero thrust (3,000 ft), the takeoff flap and technique of the card (ground roll, 50 ft), the trims and linear modes at
// the card's cruise and approach points (short period, phugoid, Dutch roll ωn ζ, roll τR, spiral growth rate) and the
// height the robot loses in the stall recovery. These pin the model as it is, not as the research expects it (the research
// tests above do that, with the known gaps said): a physics PR must keep them or move them on purpose, with the reason,
// in the same commit. Bands: 1.5 % (floor 0.02° on the trim α, 0.002 elsewhere); the spiral rate ± 0.0005 /s; the recovery ± 3 % (1 ft floor).
// V_SR is also held to the POH figure at the POH's mass by the tests above (every type: c172s, c172r, DA40 and DA42, the
// C152 and the P2006T, all by V_SR against VS / √0.95): this table is for the training mass, where the POH gives no figure.
// The cruise rows were measured again on main after PR #14 (plan B6, R2-07: lm_card's modes take the derivative set of
// the flight point, so cruise now flies the cards' cruise derivatives); only cruise moved (Dutch roll, roll mode and
// spiral most), the sim itself did not change.
function lockOf(id) {
  const { I, R } = fly(id);
  const rec = stallRecovery(M, { flaps: 0, gear: I.retract ? 0 : 1 });
  const mode = (k) => { const x = R.modes[k]; return { trim: [R.trim[k].alpha_deg, R.trim[k].thr], sp: [x.sp.wn, x.sp.zeta], ph: [x.ph.T, x.ph.zeta], dr: [x.dr.wn, x.dr.zeta], tauR: x.roll_tau, spiral: x.spiral.lam }; };
  return {
    vsr: Object.fromEntries(Object.entries(R.stall).map(([k, s]) => [k, s.VSR_cas])),
    climb: [R.climb.Vy_kt, R.climb.ROCmax_fpm, R.climb.Vx_kt], glide: [R.glide.zeroThrust.Vbg_kt, R.glide.zeroThrust.LD],
    takeoff: [R.takeoff.groundRoll_m, R.takeoff.dist50ft_m], approach: mode('approach'), cruise: mode('cruise'), recovery: rec.loss_ft,
  };
}
const LOCK = {
  c172s: {
    vsr: { "0": 50.792, "10": 48.885, "20": 46.907, "30": 46 },
    climb: [64.911, 957.79, 56], glide: [63.734, 9.1132], takeoff: [253.9, 418.84],
    approach: { trim: [3.5675, 0.32542], sp: [3.7727, 0.74908], ph: [19.897, 0.12451], dr: [1.8878, 0.33378], tauR: 0.19427, spiral: 0.012424 },
    cruise: { trim: [0.80883, 1.1065], sp: [6.1191, 0.73463], ph: [33.927, 0.22841], dr: [2.512, 0.27469], tauR: 0.11395, spiral: -0.022858 },
    recovery: 60.433,
  },
  c172r: {
    vsr: { "0": 50.517, "10": 48.62, "20": 46.652, "30": 45.751 },
    climb: [67.073, 886.96, 56], glide: [62.405, 9.1133], takeoff: [254.11, 426.16],
    approach: { trim: [3.7568, 0.3341], sp: [3.7101, 0.74906], ph: [19.629, 0.11883], dr: [1.8663, 0.33606], tauR: 0.19527, spiral: 0.013355 },
    cruise: { trim: [0.76925, 1.0957], sp: [6.1077, 0.73466], ph: [33.964, 0.22551], dr: [2.5168, 0.27597], tauR: 0.11279, spiral: -0.022948 },
    recovery: 63.367,
  },
  da42ng: {
    vsr: { "UP": 66.523, "APP": 62.515, "LDG": 59.127 },
    climb: [85.397, 1343, 74], glide: [83.372, 13.598], takeoff: [443.83, 665.08],
    approach: { trim: [-0.12458, 0.36393], sp: [2.5464, 0.74905], ph: [28.032, 0.15598], dr: [1.6572, 0.19517], tauR: 0.29455, spiral: 0.032697 },
    cruise: { trim: [0.11279, 0.7708], sp: [3.9665, 0.71812], ph: [49.298, 0.16292], dr: [2.4134, 0.13695], tauR: 0.19275, spiral: 0.004746 },
    recovery: 47.026,
  },
  da42_tae125: {
    vsr: { "UP": 62.107, "APP": 58.437, "LDG": 55.327 },
    climb: [77.866, 1266.6, 70], glide: [77.548, 12.999], takeoff: [396.23, 613.71],
    approach: { trim: [-0.96365, 0.42047], sp: [2.733, 0.77023], ph: [28.995, 0.18309], dr: [1.6766, 0.19566], tauR: 0.29657, spiral: 0.029672 },
    cruise: { trim: [-0.21533, 0.96053], sp: [4.2523, 0.73997], ph: [51.863, 0.2066], dr: [2.4413, 0.14055], tauR: 0.19448, spiral: 0.0040365 },
    recovery: 46.635,
  },
  da40d: {
    vsr: { "UP": 55.056, "T/O": 53.524, "LDG": 52.876 },
    climb: [65.981, 688.45, 62], glide: [70.053, 8.8], takeoff: [326.13, 512.02],
    approach: { trim: [-1.769, 0.49409], sp: [3.5254, 0.60722], ph: [19.903, 0.13569], dr: [1.6045, 0.24348], tauR: 0.21262, spiral: 0.0064162 },
    cruise: { trim: [1.429, 0.94533], sp: [4.8586, 0.5927], ph: [28.745, 0.15622], dr: [2.0709, 0.21176], tauR: 0.1558, spiral: 0.0089173 },
    recovery: 72.939,
  },
  da40_180: {
    vsr: { "UP": 54.431, "T/O": 53.747, "LDG": 53.441 },
    climb: [68.923, 1039.8, 60], glide: [70.961, 8.7995], takeoff: [261.66, 428.71],
    approach: { trim: [-2.1367, 0.40836], sp: [3.5962, 0.60946], ph: [20.201, 0.13707], dr: [1.6326, 0.24375], tauR: 0.20773, spiral: 0.0048722 },
    cruise: { trim: [1.3798, 0.74546], sp: [4.8874, 0.59481], ph: [28.743, 0.15236], dr: [2.0807, 0.2126], tauR: 0.15436, spiral: 0.0087734 },
    recovery: 58.275,
  },
};
function lockDiff(pin, got, path, out) {
  if (typeof pin === 'number') {
    // 1.5 % of the pin, with a floor sized to the quantity: 0.02° for the trim α (it passes through zero) and 0.002 for the rest,
    // so that a damping ratio or a throttle near 0.1–0.4 keeps a band of 1.5 % (a 0.02 floor made it 5–16 %: review of C2)
    const tol = /spiral$/.test(path) ? 5e-4 : /recovery$/.test(path) ? Math.max(1, 0.03 * Math.abs(pin)) : Math.max(/trim\[0\]$/.test(path) ? 0.02 : 0.002, 0.015 * Math.abs(pin));
    if (!(Math.abs(got - pin) <= tol)) out.push(`${path}: ${got} against ${pin} ± ${+tol.toPrecision(2)}`);
  } else if (Array.isArray(pin)) pin.forEach((x, i) => lockDiff(x, got?.[i], `${path}[${i}]`, out));
  else for (const k of Object.keys(pin)) lockDiff(pin[k], got?.[k], `${path}.${k}`, out);
  return out;
}
test('per-type regression lock: every card at its training mass (V_SR, climb, glide, takeoff, modes, stall recovery)', async (t) => {
  try {
    for (const id of TYPE_IDS) {
      await S(t, `${id}: lock at ${r(card(id).airframe.weights.training_mass.v.kg ?? card(id).airframe.weights.training_mass.v, 1)} kg`, () => {
        const got = lockOf(id);
        if (process.env.TYPES_LOCK_PRINT) printed.push(`LOCK ${id} ${JSON.stringify(got, (k, v) => (typeof v === 'number' ? +v.toPrecision(5) : v))}`);
        assert.deepEqual(Object.keys(got.vsr), Object.keys(LOCK[id].vsr), 'the flap detents');
        const bad = lockDiff(LOCK[id], got, id, []);
        assert.equal(bad.length, 0, `moved: ${bad.join('; ')}`);
      });
    }
  } finally { setAircraft(trainer()); }
});

// ───────────────────────── six-type autoland: smoke and regression bands ─────────────────────────
// Seed 5, the A8 default weather, the A9 log-law wind, each card at its training mass. Calm on all four runway ends:
// no crash, score ≥ 90, no near-stall debrief event, no stall warning in the air. The 15 kt gusty crosswind on 21R: no
// crash, score ≥ 70, no near-stall event. Plan C2 adds the bands: AUTOLAND holds, per type, the score and touchdown
// point (m from the threshold) of the four calm landings [21R, 21L, 03L, 03R] and of the `xl` landing on 21R with the
// highest height at which its stall horn sounded (ft; 0 = never; the autopilot flies Vref with no gust allowance, plan C1
// risk R3: the c172s and c172r hear it low, the DA40s from about 930 ft because their landing flaps leave only 2.4–2.8° of
// α under the warning angle). Bands: calm score ± 7 (one step of the 300 m window) and touchdown ± 4 m; `xl` score ± 5,
// touchdown ± 8 m, horn height ± 20 ft. Measured 2026-11-26 on the plan C1 model; the horn rows move with any change to the
// gust filter or the warning angle.
const AUTOLAND = {
  c172s: { calm: [[100, 301.5], [93, 295.7], [100, 307.2], [93, 278.2]], xl: [79, 293.1, 36] },
  c172r: { calm: [[100, 302.7], [93, 296.9], [100, 308.5], [93, 279.5]], xl: [72, 271.0, 67] },
  da42ng: { calm: [[100, 329.1], [100, 323.2], [100, 334.8], [100, 305.8]], xl: [96, 325.7, 0] },
  da42_tae125: { calm: [[100, 300.7], [93, 294.8], [100, 306.5], [93, 277.4]], xl: [81, 282.6, 0] },
  da40d: { calm: [[100, 314.7], [100, 309.0], [100, 320.6], [93, 291.5]], xl: [93, 307.3, 932] },
  da40_180: { calm: [[100, 312.6], [100, 306.7], [100, 318.2], [93, 289.2]], xl: [88, 308.3, 934] },
};
for (const id of TYPE_IDS) {
  test(`${id}: autoland, seed 5, calm on all four ends and gusty crosswind on 21R (smoke and regression bands)`, (t) => {
    try {
      setAircraft(card(id));
      const runs = [...['21R', '21L', '03L', '03R'].map((rw, k) => [rw, 'calm', AUTOLAND[id].calm[k]]), ['21R', 'xl', AUTOLAND[id].xl]];
      for (const [rw, key, pin] of runs) {
        setActiveRunway(rw);
        const f = new Flight({ wind: SCENARIOS[key], pilot: 'ap', seed: 5 });
        let horn = 0, hornTop = 0;
        while (f.ac.t < 260 && !f.ev.done && !f.crashed) {
          f.tick(f.dt);
          if (f.ev.stallHorn) { horn++; hornTop = Math.max(hornTop, f.ac.air.hWheel / FT); }
        }
        const s = f.ev.score(), ev = f.ev.events.map((e) => e.k);
        const info = `${id} ${rw} ${key}: score ${s.total}, touchdown ${f.ev.td ? r(f.ev.td.s, 1) + ' m' : 'none'}, events [${ev}], horn ${horn ? `${horn} steps, highest ${r(hornTop, 0)} ft` : 'none'}`;
        t.diagnostic(info);
        if (process.env.TYPES_LOCK_PRINT) printed.push(`AUTOLAND ${id} ${rw} ${key} ${s.total} ${r(f.ev.td?.s, 1)} ${horn ? r(hornTop, 0) : 0}`);
        assert.ok(!f.crashed && f.ev.td && f.ev.td.onRunway, info);
        assert.ok(!ev.includes('stall'), info);
        assert.ok(s.total >= (key === 'calm' ? 90 : 70), info);
        if (key === 'calm') assert.equal(horn, 0, info);
        const [score, td, hornPin] = pin.length === 2 ? [...pin, 0] : pin;
        near(s.total, score, key === 'calm' ? 7 : 5, `${rw} ${key} score`);
        near(f.ev.td.s, td, key === 'calm' ? 4 : 8, `${rw} ${key} touchdown`);
        near(horn ? hornTop : 0, hornPin, key === 'calm' ? 0 : 20, `${rw} ${key} highest horn`);
      }
    } finally { setActiveRunway('21R'); setAircraft(trainer()); }
  });
}

// ───────────────────────── ids that wait for a later item ─────────────────────────
// The ids of plan C2's list that no test above asserts, and the other research ids of the topics flown here that the
// current model cannot answer, each with the reason and the item that enables it (research task items of
// 02-light-aircraft.md and 01-flight-physics.md; plan items where the plan names them). The last test checks that every id
// of C2's list is either named by a test title above or listed here, and that no id is both: a test that starts to run
// leaves the list in the same commit. Passing ids of the research list that item 11 leaves out (T-LF-13, 15, 19) stay here
// too: item 11 keeps the rows that do not depend on the POH's takeoff and landing technique or on estimated ranges.
const DEFERRED = {
  'T-LF-09': ['Vy 59.7 KCAS against 66.3 ± 3: the sim has one polar from the glide, with the windmilling-propeller drag in it (01-methods.md §01.8.3)', 'research items 13 and 20'],
  'T-LF-13': ['ground roll 255 m against the POH short-field 221 ± 20 %: passes today, but the POH technique lifts off sooner than the sim robot (V_LOF 61.3 kt); left out by item 11', 'research item 19'],
  'T-LF-15': ['landing ground roll 167 m against 145 ± 20 %: passes today, depends on the autoland and braking technique; left out by item 11', 'research item 18'],
  'T-LF-16': ['landing from 50 ft 472 m against 366 ± 15 %: the autoland crosses 50 ft at 54.5 kt on a 3° path (305 m in the air against 221 m)', 'research item 18'],
  'T-LF-17': ['maximum speed 95.6 KTAS against 110 ± 5: the glide polar has 24 % more drag than cruise', 'research items 13 and 20'],
  'T-LF-19': ['approach trim α 3–6°, θ −1…+3°, throttle 0.2–0.6: passes today, an estimated range; left out by item 11', 'research item 24 (attitude targets per type)'],
  'T-LF-22': ['hot day takeoff at 35 °C against the POH chart, and T-LF-23 (climb 728 fpm against 648 ± 40): the thrust has no density term', 'research items 13 and 26'],
  'T-LF-23': ['see T-LF-22: the climb at 35 °C', 'research items 13 and 26'],
  'T-LF-24': ['blade-element check of the 69×58 propeller, a research calculation (lf_calc.mjs), not a sim measurement', 'research item 13'],
  'T-LF-25': ['C150H stall from the C152 CLmax by the lm_polar formula: no C150H card', 'research item 38'],
  'T-LG-13': ['short period ζ 0.59 against 0.40 ± 0.10: the stabilator and anti-servo tab need a stick-free control model', 'research item 36'],
  'T-LG-18': ['takeoff to 50 ft 513 m against 394 ± 20 %: the sim lifts off at 72 kt, the AFM at 66.5 KIAS', 'research item 19'],
  'T-LG-20': ['landing from 50 ft 549 m against 349 ± 20 %: the autoland path is 3° and crosses 50 ft fast', 'research item 18'],
  'T-LG-21': ['Rotax 912 propeller shaft torque from power and rpm: no engine model', 'research item 13'],
  'T-LG-22': ['hot day engine power (ind_friction): no density term', 'research item 13'],
  'T-LG-23': ['climb at 35 °C: no density term', 'research item 13'],
  'T-LG-24': ['climb with one engine out: no engine-out state, feathering or yaw moment', 'research item 14'],
  'T-LG-25': ['stick force per g: no control force model', 'research item 22'],
  'T-LT-06': ['DA42-VI stall: no da42_vi card in data/aircraft', 'a later card (research item 38)'],
  'T-LT-10': ['DA42-VI climb: no da42_vi card in data/aircraft', 'a later card (research item 38)'],
  'T-LT-17': ['cruise TAS at 8,000 ft 162 kt against 176 ± 7: no density term in the thrust and the glide drag polar', 'research items 13 and 20'],
  'T-LT-18': ['VMCA and the one-engine-out rows T-LT-19…25, 28, 29: no engine-out model', 'research item 14'],
  'T-LT-26': ['gear transition time 6 s is a constant of the sim, not a card value', 'research item 20'],
  'T-LT-30': ['short period of the DA42 at 84 KIAS against an estimate from the card (2-DOF)', 'none yet (a card-level check of Cmα, not a sim test)'],
  'T-LT-31': ['stick force per g: no control force model', 'research item 22'],
  'T-LT-32': ['one-engine-out ceiling of the DA42-VI: no engine-out model, no density term', 'research items 13 and 14'],
};
test('plan C2: every id of its list is tested above or waits for a named item', () => {
  const range = (pre, a, b) => Array.from({ length: b - a + 1 }, (_, k) => `${pre}-${String(a + k).padStart(2, '0')}`);
  const PLAN = [...range('T-LM', 2, 7), 'T-LM-31', ...range('T-LF', 1, 28), ...range('T-LG', 1, 12), ...range('T-LG', 14, 17), 'T-LG-19', 'T-LG-26',
    'T-LD-41', 'T-LT-33', ...range('T-LP', 62, 65)];
  assert.deepEqual(PLAN.filter((id) => !NAMED.has(id) && !(id in DEFERRED)), [], 'an id of the plan list that nothing tests and nothing defers');
  assert.deepEqual(Object.keys(DEFERRED).filter((id) => NAMED.has(id)), [], 'an id both tested and deferred: take it off the list');
  for (const [id, [why, item]] of Object.entries(DEFERRED)) assert.ok(why.length > 20 && item.length > 5, `${id}: a reason and an item`);
});

test('plan C3: every id of its list is tested above (T-LF-07 left the list of ids that wait)', () => {
  assert.deepEqual(['T-LC-03', 'T-LC-05', 'T-LE-04', 'T-LF-07'].filter((id) => !NAMED.has(id) || id in DEFERRED), []);
});

after(() => { if (printed.length) console.log(printed.join('\n')); });
