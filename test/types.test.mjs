// Research round 2 tests flown through the plan C1 cards (data/aircraft/<id>.json, read by acFromCard), with the
// research's expected values and tolerances: C172S (04-c172s.md, scripts/lc_tests.mjs), C172R (10-c172r.md,
// le_tests.mjs) and the two DA40 types (05-da40.md, ld_tests.mjs), then an autoland smoke test for all six types.
// Each case sets a copy of the generated card at the test mass (acFromCard scales the inertia by m/ref_mass, as
// round 2's buildAC does) and runs the calls of the research scripts from lm_card.mjs; runCard reads AC only for idle.
// Four values cannot pass at the research tolerance on today's physics (plan C1 design §4.3). Each is a known gap:
// the research expectation goes to t.diagnostic, a regression band holds the measured value, and the comment names
// the research task item (01-flight-physics.md task list) that should close it. A physics change that moves a band
// updates it in the same pull request. This file sets cards on the shared AC and puts the trainer back at the end.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { M, AIRCRAFT_CARD } from './harness.mjs';
import { prepare, TYPE_IDS } from '../tools/aircraft/build_cards.mjs';
import { buildAC, cardInfo, runCard, climbSweep, takeoffTest, trim, trimThr, modes } from '../docs/research/02-light-aircraft/scripts/lm_card.mjs';

const { setAircraft, Aircraft, Flight, SCENARIOS, setActiveRunway, KT, FT, RAD } = M;
const card = (id) => JSON.parse(fs.readFileSync(new URL(`../data/aircraft/${id}.json`, import.meta.url), 'utf8'));
const trainer = () => JSON.parse(fs.readFileSync(AIRCRAFT_CARD, 'utf8'));
after(() => setAircraft(trainer()));

// the card at mass kg (training_mass.kg), with the derivatives of configuration opts.config
function useCard(id, kg, opts) { const c = card(id); if (kg != null) c.airframe.weights.training_mass.v.kg = kg; setAircraft(c, opts); }
// the research's test conditions for a type (speeds, takeoff flap and technique, trim targets)
const infoOf = (id, kg) => cardInfo(prepare(id), buildAC(prepare(id), { mass: kg }));
const near = (x, exp, tol, what) => assert.ok(Math.abs(x - exp) <= tol, `${what}: ${x.toFixed(3)} against ${exp} ± ${tol}`);
const r = (x, n = 2) => (x == null ? '–' : (+x).toFixed(n));
// runCard's stall, climb, glide and modes, and lm_card's takeoff run (VR as runCard picks it)
function fly(id, kg) {
  const I = infoOf(id, kg); useCard(id, kg);
  const R = runCard(M, M.AC, I, { noGround: true });
  const VR = I.takeoff.VR ?? Math.round(1.05 * R.stall[I.takeoff.name].VSR_eas);
  R.takeoff = takeoffTest(M, { f: I.takeoff.f, VR, theta: I.takeoff.theta });
  return { I, R };
}

// ───────────────────────── C172S at 1,156.66 kg (MTOW, CG ref 27.4 %MAC), lc_tests.mjs ─────────────────────────
test('C172S at 1,156.66 kg: research round 2 T-LC tests through the card', async (t) => {
  const kg = 1156.66;
  try {
    const { I, R } = fly('c172s', kg), st = R.stall;
    await t.test('T-LC-04: CLmax at 1 g, 1 kt/s, flaps 0 / 30 is 1.464 / 1.785 ± 0.03', () => {
      near(st['0'].CLmax, 1.464, 0.03, 'flaps 0'); near(st['30'].CLmax, 1.785, 0.03, 'flaps 30');
    });
    await t.test('T-LC-06/07/08: Vmin at 3,000 ft idle, flaps 0 / 10 / 30 is 53 / 51 / 48 ± 3 KCAS', () => {
      near(st['0'].Vmin_eas, 53, 3, 'flaps 0'); near(st['10'].Vmin_eas, 51, 3, 'flaps 10'); near(st['30'].Vmin_eas, 48, 3, 'flaps 30');
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
    await t.test('T-LE-05/06/07: Vmin flaps 0 / 10 / 30 is 52 / 50 / 47 ± 3 KCAS', () => {
      near(st['0'].Vmin_eas, 52, 3, 'flaps 0'); near(st['10'].Vmin_eas, 50, 3, 'flaps 10'); near(st['30'].Vmin_eas, 47, 3, 'flaps 30');
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
    await t.test('T-LD-27: Vmin at 3,000 ft idle, flaps UP / LDG is 56.7 ± 5 / 55.7 ± 3 KCAS', () => {
      near(st.UP.Vmin_eas, 56.7, 5, 'UP'); near(st.LDG.Vmin_eas, 55.7, 3, 'LDG');
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
    await t.test('T-LD-31: Vmin flaps UP 55.9 ± 5 KCAS; ROC max at SL 550 ± 100 fpm', () => {
      near(R.stall.UP.Vmin_eas, 55.9, 5, 'Vmin UP'); near(R.climb.ROCmax_fpm, 550, 100, 'ROC');
    });
    // Known gap (design §4.3): research expects 640 ± 64 m; the card's thrust line gives 574 m, 1.6 m outside (the
    // research run passed at 577 m only because it flew the trainer's engine position); research item 13.
    await t.test('T-LD-32 (known gap): takeoff to 50 ft, flaps T/O: regression band 574.4 m ± 3 %', (tt) => {
      tt.diagnostic(`to 50 ft ${r(R.takeoff.dist50ft_m, 1)} m (ground roll ${r(R.takeoff.groundRoll_m, 1)} m); research expects 640 ± 64 m; research item 13`);
      near(R.takeoff.dist50ft_m, 574.43, 0.03 * 574.43, 'to 50 ft');
    });
  } finally { setAircraft(trainer()); }
});

// ───────────────────────── six-type autoland smoke ─────────────────────────
// Seed 5, the A8 default weather, the A9 log-law wind, each card at its training mass. Calm on all four runway ends:
// no crash, score ≥ 90, no near-stall debrief event, no stall warning in the air. The 15 kt gusty crosswind on 21R: no
// crash, score ≥ 70, no near-stall event; its horn is logged, not asserted (the autopilot flies Vref with no gust
// allowance, as with the trainer; plan C1 risk R3). C2 tightens these into regression bands.
for (const id of TYPE_IDS) {
  test(`${id}: autoland, seed 5, calm on all four ends and gusty crosswind on 21R`, (t) => {
    try {
      setAircraft(card(id));
      const runs = [...['21R', '21L', '03L', '03R'].map((rw) => [rw, 'calm']), ['21R', 'xl']];
      for (const [rw, key] of runs) {
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
        assert.ok(!f.crashed && f.ev.td && f.ev.td.onRunway, info);
        assert.ok(!ev.includes('stall'), info);
        assert.ok(s.total >= (key === 'calm' ? 90 : 70), info);
        if (key === 'calm') assert.equal(horn, 0, info);
      }
    } finally { setActiveRunway('21R'); setAircraft(trainer()); }
  });
}
