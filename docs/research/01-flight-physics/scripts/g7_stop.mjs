// Section 7: ground-roll stopping distance, point mass with aero and nose/main load transfer (reference model for tests)
// and the CURRENT 6-DOF model with full brake after touchdown. Run: node g7_stop.mjs
import { M } from 'test/harness.mjs';
import { mu109max, VP, KT } from './g7_ground.mjs';
const { AC, G0, Flight, SCENARIOS, atmosphere, FIELD } = M;
const m = AC.m, W = m * G0, wb = 2.65, xcgm = 0.35, hcg = 1.30;
const rho = atmosphere(FIELD.elev, 31 - (15 - 0.0065 * FIELD.elev)).rho;
const CL = AC.CL0 + AC.CLflap, CD = AC.CD0 + AC.CDflap + AC.CDgear + AC.K * 0.3 * (CL - 0.15) ** 2;
const Fbmax = 0.60 * (W * (1 - xcgm / wb));     // brake torque limit: 0.6 x static main load (estimate)
function stop(V0kt, muFn, { rollMu = 0.02, thrIdle = true } = {}) {
  let V = V0kt * KT, x = 0, t = 0; const dt = 0.005;
  while (V > 0.05 && t < 200) {
    const q = 0.5 * rho * V * V, L = q * AC.S * CL, D = q * AC.S * CD;
    const T = thrIdle ? AC.idle * AC.T0 * (AC.eta * AC.P / AC.T0) / Math.hypot(V, AC.eta * AC.P / AC.T0) : 0;
    let a = 2;
    for (let it = 0; it < 6; it++) {
      const Nn = Math.max(0, ((W - L) * xcgm + m * a * hcg) / wb), Nm = Math.max(0, W - L - Nn);
      const Fb = Math.min(Fbmax, muFn(V / KT) * Nm);
      a = (Fb + rollMu * Nn + D - T) / m;
    }
    V -= a * dt; x += V * dt; t += dt;
  }
  return { x, t };
}
const p = 60; // main tyre psi
const cases = {
  'RWYCC6 dry (mu_peak 0.8, brake-torque limited)': () => 0.8,
  'RWYCC5 wet 25.109(c) x0.8': (v) => 0.8 * mu109max(v, p),
  'RWYCC5 wet 25.109(c) x0.375 (on-off / poor modulation)': (v) => 0.375 * mu109max(v, p),
  'RWYCC3 0.16': () => 0.16,
  'RWYCC2 standing water': (v) => (v < 0.85 * VP(p) ? Math.min(0.16, 0.5 * 0.8 * mu109max(v, p)) : 0.05),
  'RWYCC1 ice 0.08': () => 0.08,
};
console.log(`rho ${rho.toFixed(4)} CL_ground ${CL.toFixed(2)} CD_ground ${CD.toFixed(3)} Fbmax ${Fbmax.toFixed(0)} N (=${(Fbmax / W).toFixed(3)} W)`);
for (const [k, f] of Object.entries(cases)) { const r = stop(80, f); console.log(`  80 kt -> stop: ${k.padEnd(52)} ${r.x.toFixed(0)} m  ${r.t.toFixed(1)} s  mean decel ${(80 * KT / r.t / G0).toFixed(3)} g`); }
// CURRENT model: autoland then full manual braking 0.5 s after touchdown
function currentFullBrake(sc = 'calm') {
  const f = new Flight({ wind: SCENARIOS[sc], pilot: 'ap', seed: 5 });
  let td = null, sTD = null, gsTD = null, man = false;
  while (f.ac.t < 260 && !f.ev.done && !f.crashed) {
    f.tick(f.dt); const a = f.ac.air;
    if (td == null && (a.wow[1] || a.wow[2])) { td = f.ac.t; sTD = a.s; gsTD = a.gs; }
    if (td != null && !man && f.ac.t > td + 0.5) { f.setPilot('man'); man = true; }
    if (man) { f.input.brake = 1; f.input.thr = 0; f.input.x = 0; f.input.y = 0; f.input.rud = 0; }
  }
  return { gsTD_kt: gsTD / KT, roll: f.ev.stopS - sTD, t: f.ac.t - td };
}
const c = currentFullBrake();
console.log(`CURRENT 6-DOF full brake: TD gs ${c.gsTD_kt.toFixed(1)} kt, ground roll ${c.roll.toFixed(0)} m, ${c.t.toFixed(1)} s, mean decel ${(c.gsTD_kt * KT / c.t / G0).toFixed(3)} g (same on any surface: no surface model)`);
const r0 = stop(c.gsTD_kt, () => 0.8); console.log(`  reference model from same TD speed, dry: ${r0.x.toFixed(0)} m; wet RWYCC5 x0.8: ${stop(c.gsTD_kt, (v) => 0.8 * mu109max(v, p)).x.toFixed(0)} m; RWYCC2: ${stop(c.gsTD_kt, cases['RWYCC2 standing water']).x.toFixed(0)} m`);
