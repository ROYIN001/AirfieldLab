// JSBSim oracle, JavaScript side (research round 1 §12.8, tests T-S-01…T-S-03, plan item B1). The same open-loop
// doublets are flown by our model here and by a JSBSim model built from our own AC numbers in tools/jsbsim/;
// test/oracle.test.mjs compares the two against test/fixtures/jsbsim_trainer_doublet.json, and
// tools/jsbsim/run_cases.py calls tools/jsbsim/js_case.mjs (which uses this file) when it regenerates the fixture.
// No gear contact (the run stays above 230 m), no wind, ISA. Pure: no DOM, no files.
import { M } from '../harness.mjs';
const { AC, Aircraft, DEG, RAD, FIELD, KT, atmosphere, rwyLocal, inertiaInverse } = M;

export const DT = 1 / 240;          // s, our RK4 step and the JSBSim step (Adams–Bashforth 3 there)
export const T_END = 25;            // s
export const EVERY = 24;            // samples every 0.1 s (10 Hz)
export const COLS = ['t', 'h_m', 'V_mps', 'alpha_deg', 'beta_deg', 'phi_deg', 'theta_deg', 'psi_deg', 'p_dps', 'q_dps', 'r_dps'];
// research §12.8 step 3: elevator ±2° at 1–3 s, aileron ±5° at 8–10 s, rudder +5° at 14–15 s, on top of the trim
export function schedule(t, de0) {
  return {
    de: de0 + (t >= 1 && t < 2 ? 2 : t >= 2 && t < 3 ? -2 : 0) * DEG,
    da: (t >= 8 && t < 9 ? 5 : t >= 9 && t < 10 ? -5 : 0) * DEG,
    dr: (t >= 14 && t < 15 ? 5 : 0) * DEG,
  };
}
// T-S-01 / T-S-02 (no α̇ terms) and T-S-03 (CLadot 1.6, Cmadot −4.5): `gen` is the research test that
// tools/jsbsim/run_cases.py runs when it makes the fixture, `test` the one test/oracle.test.mjs runs on it. `tol` holds the research tolerances
// (12-other-sims.md): for T-S-01/02 about 2.4–13.6 times the differences measured at AB3 240 Hz for h, V, θ, φ, β and
// p, 10 times for q and 25 times for r (oracleTolerance); for T-S-03 about 2 times the research's differences ("ผลจริง
// คูณ ~2"), which run_cases.py halves by applying each control on the same step as here, so about 4 times now.
// `extra` holds limits this repo adds (estimates): ψ and α, which the research records but does not bound, at about
// 4 times the differences measured here, and h and V in the α̇ case at T-S-01's limits, the columns that see a large
// CLadot error.
export const CASES = {
  noadot: {
    gen: 'T-S-01', test: 'T-S-02',
    adot: { CLadot: 0, Cmadot: 0 },
    tol: { h_m: 0.05, V_mps: 0.01, theta_deg: 0.05, phi_deg: 0.1, beta_deg: 0.05, p_dps: 0.5, q_dps: 0.5, r_dps: 0.5 },
    extra: { alpha_deg: 0.05, psi_deg: 0.05 },
  },
  adot: {
    gen: 'T-S-03', test: 'T-S-03',
    adot: { CLadot: 1.6, Cmadot: -4.5 },
    tol: { theta_deg: 0.1, alpha_deg: 0.1, q_dps: 0.25 },
    extra: { h_m: 0.05, V_mps: 0.01, psi_deg: 0.05 },
  },
};
export const limits = (name) => ({ ...CASES[name].tol, ...CASES[name].extra });
// New numeric AC fields the fixture may lack because Aircraft.deriv and Aircraft.step do not read them (the test and
// run_cases.py --check accept them as added fields). The fixture holds every numeric AC field it was made with, Vref,
// Vapp and Vs0 included (deriv and step do not read those three), so ORACLE_AC_FROZEN checks them too. The stall
// warning (plan A5) came after it: only the Evaluator reads its four fields. A renamed or removed field always needs
// a new fixture.
export const AC_NOT_IN_DERIV = ['aWarn', 'aWarnFlap', 'aWarnHyst', 'aWarnMinOn'];

// The numeric AC parameters (what tools/jsbsim/make_model.py turns into the JSBSim model)
export function acParams() {
  const p = {};
  for (const [k, v] of Object.entries(AC)) if (typeof v === 'number') p[k] = v;
  return p;
}

// The inverse inertia tensor that Aircraft.deriv uses, for the tensor [[Ixx, 0, −Ixz], [0, Iyy, 0], [−Ixz, 0, Izz]]:
// src/20-flight.js's own inertiaInverse (plan B3: setAircraft builds AC.Iinv with it), so the oracle flies what src
// builds. test/oracle.test.mjs checks it independently, by multiplying the result by the tensor.
export { inertiaInverse };

// Runs fn with AC set to the given numbers (AC.Iinv rebuilt for them by src's inertiaInverse) and, when given,
// FIELD.elev set to the elevation the case was flown at; then puts back AC and FIELD.elev exactly as they were (the same
// Iinv array, no added keys). AC.engines, not a number, stays the trainer's: one engine along body +x through the CG,
// the thrust line tools/jsbsim/make_model.py models (test/oracle.test.mjs checks it).
export function withParams(params, elev, fn) {
  const saved = { ...AC }, elev0 = FIELD.elev;
  try {
    Object.assign(AC, params);
    AC.Iinv = inertiaInverse(AC);
    if (elev !== undefined) FIELD.elev = elev;
    return fn();
  } finally {
    for (const k of Object.keys(AC)) if (!(k in saved)) delete AC[k];
    Object.assign(AC, saved);
    FIELD.elev = elev0;
  }
}

// Initial condition: the trimmed approach of research §12.8 (95 KIAS, flaps 1, gear down, 5,500 m before the active
// runway's threshold, 21R, on the 3° path), as the full 13-element state plus the surfaces it was trimmed with.
export const START = { dist: 5500, ias: 95 };
export function approachIC(params) {
  return withParams(params, undefined, () => {
    const ac = new Aircraft();
    const trim = ac.setApproach(START);
    return { x: Array.from(ac.x), de0: ac.de, thr0: ac.thr, flaps: ac.flaps, gear: ac.gearPos, elev_m: FIELD.elev, rwy: FIELD.rwy, rwyHdg: FIELD.rwyHdg, trim };
  });
}

// What makes a recorded start other than that approach: 95 ± 0.5 KIAS with no wind, flaps 1, gear down, 5,500 ± 1 m
// before the threshold of 21R (the active runway here too) and 280–320 m up. An empty list when it is that start;
// test/oracle.test.mjs and tools/jsbsim/run_cases.py --check (through js_case.mjs --start) both ask it.
export function startProblems(ic) {
  const x = ic && ic.x, p = [];
  if (!Array.isArray(x) || x.length !== 13 || !x.every(Number.isFinite)) return ['the state is not 13 numbers'];
  if (FIELD.rwy !== '21R') p.push(`the model's active runway is ${FIELD.rwy}, not 21R`);
  if (ic.rwy !== '21R') p.push(`runway ${ic.rwy}`);
  if (ic.flaps !== 1) p.push(`flaps ${ic.flaps}`);
  if (ic.gear !== 1) p.push(`gear ${ic.gear}`);
  const h = -x[2];
  if (!(h > 280 && h < 320)) p.push(`height ${h.toFixed(1)} m`);
  const ias = Math.hypot(x[3], x[4], x[5]) * Math.sqrt(atmosphere(ic.elev_m + h, 0).rho / atmosphere(0, 0).rho) / KT;
  if (!(Math.abs(ias - START.ias) < 0.5)) p.push(`${ias.toFixed(2)} KIAS`);
  const along = rwyLocal(x[0], x[1])[0];
  if (!(Math.abs(along + START.dist) < 1)) p.push(`${(-along).toFixed(1)} m before the threshold`);
  return p;
}

// Flies the schedule from the initial condition with the given parameters, at the elevation the case was recorded at;
// returns 10 Hz rows in COLS order. `sub` splits each 240 Hz step into that many RK4 steps with the same controls
// (test/oracle.test.mjs uses 4 to check that our integrator converges).
export function runCase({ params, ic }, sub = 1) {
  return withParams(params, ic.elev_m, () => {
    const ac = new Aircraft();
    ac.flaps = ac.cmd.flaps = ic.flaps; ac.gearPos = ic.gear; ac.cmd.gear = ic.gear ? 1 : 0;
    ac.x.set(ic.x);
    ac.de = ac.cmd.de = ic.de0; ac.da = ac.cmd.da = 0; ac.dr = ac.cmd.dr = 0;
    ac.thr = ac.cmd.thr = ic.thr0; ac.brake = ac.cmd.brake = 0; ac.steer = 0;
    ac.adot = 0; ac.aPrev = null; ac.t = 0;              // as at the end of setApproach
    ac.updateAir(0);
    const n = Math.round(T_END / DT), rows = [];
    for (let i = 0; i <= n; i++) {
      const t = i * DT, a = ac.air;
      if (i % EVERY === 0) rows.push([+t.toFixed(4), a.h, a.V, a.alpha * RAD, a.beta * RAD, a.phi * RAD, a.theta * RAD, a.psi * RAD, a.p * RAD, a.q * RAD, a.r * RAD]);
      if (i === n) break;
      const s = schedule(t, ic.de0);                     // held over the step t → t + DT
      ac.de = ac.cmd.de = s.de; ac.da = ac.cmd.da = s.da; ac.dr = ac.cmd.dr = s.dr;   // no actuator rate limit
      ac.cmd.thr = ic.thr0;
      for (let j = 0; j < sub; j++) ac.step(DT / sub);
    }
    return rows;
  });
}

// Largest absolute difference per column between two row sets of the same length (ψ wrapped to ±180°)
export function maxAbsErr(a, b) {
  if (a.length !== b.length) throw new Error(`row counts differ: ${a.length} and ${b.length}`);
  const err = {};
  COLS.forEach((c, k) => {
    if (k === 0) return;
    let e = 0;
    for (let i = 0; i < a.length; i++) {
      let d = a[i][k] - b[i][k];
      if (c === 'psi_deg') d = ((d + 180) % 360 + 360) % 360 - 180;
      e = Math.max(e, Math.abs(d));
    }
    err[c] = e;
  });
  return err;
}
