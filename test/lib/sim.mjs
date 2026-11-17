// Helpers for the physics tests: trimmed aircraft at a given speed and configuration, stepping, sampling.
import { M } from '../harness.mjs';
const { Aircraft, Flight, KT, DEG, FIELD, RHO0, atmosphere } = M;
export const DT = 1 / 240;

// Trimmed wings-level aircraft. ias in knots, gamma in degrees (air-relative), flaps 0..1, gear 0/1.
// Pass pcl to fix the power lever and solve for the flight-path angle instead (glides, climbs).
export function trimmed({ ias, gamma = 0, flaps = 0, gear = 0, h = 600, oatC = 15, pcl = null, seed = 1 } = {}) {
  const ac = new Aircraft();
  ac.isaDev = oatC - (15 - 0.0065 * FIELD.elev);
  ac.seed(seed);
  ac.flaps = ac.cmd.flaps = flaps; ac.gearPos = gear; ac.cmd.gear = gear;
  const atm = atmosphere(FIELD.elev + h, ac.isaDev);
  const tas = ias * KT / Math.sqrt(atm.rho / RHO0);
  const tr = ac.trimFlight({ tas, gamma: gamma * DEG, h, pcl });
  return { ac, tr, tas };
}
// Step for `secs` seconds calling ctl(ac, t) before every step; returns samples every `every` seconds.
export function run(ac, secs, ctl = null, every = 0) {
  const out = []; let next = 0;
  const n = Math.round(secs / DT);
  for (let i = 0; i < n; i++) {
    if (ctl) ctl(ac, i * DT);
    ac.step(DT);
    if (every && i * DT >= next) { next += every; out.push(snap(ac)); }
  }
  return out;
}
export const snap = (ac) => { const a = ac.air; return { t: ac.t, ias: a.ias / KT, h: a.h, vs: a.vs, alpha: a.alpha, phi: a.phi, theta: a.theta, psi: a.psi, p: a.p, q: a.q, r: a.r, beta: a.beta, gs: a.gs, buf: a.buffet, sig: a.stall }; };
// Aircraft at rest on the runway centre line of the active runway, s metres past the threshold.
export function onRunway(s = 0, { oatC = 15, surface = 'dry', flaps = 0.45 } = {}) {
  const ac = new Aircraft();
  ac.isaDev = oatC - (15 - 0.0065 * FIELD.elev);
  ac.surface = surface;
  const [n, e] = M.rwyToNED(s, 0);
  ac.setParked(n, e, FIELD.rwyHdg * DEG);
  ac.flaps = ac.cmd.flaps = flaps;
  run(ac, 3);   // settle on the struts with the brakes on
  return ac;
}
export { M };
