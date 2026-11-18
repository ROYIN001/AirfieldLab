// v10_timeresp.mjs — flight-test-style time responses on the CURRENT nonlinear model (240 Hz RK4)
import { M } from 'test/harness.mjs';
import { trim, modes } from './v10_modes.mjs';
const { Aircraft, AC, DEG, RAD, KT, FT, G0 } = M;
const e2q = (f, t, p) => { const cr = Math.cos(f/2), sr = Math.sin(f/2), cp = Math.cos(t/2), sp = Math.sin(t/2), cy = Math.cos(p/2), sy = Math.sin(p/2);
  return [cr*cp*cy + sr*sp*sy, sr*cp*cy - cr*sp*sy, cr*sp*cy + sr*cp*sy, cr*cp*sy - sr*sp*cy]; };
export function startTrimmed(c) {
  const ac = new Aircraft(); const T = trim(ac, c); const [u, v, w, , , , ph, th] = T.y0;
  const Q = e2q(ph, th, 0); const sg = Math.sin(th - T.alpha), cg = Math.cos(th - T.alpha);
  ac.x.set([0, 0, -T.h, T.V*cg, 0, -T.V*sg, ...Q, 0, 0, 0]);
  Object.assign(ac.cmd, { de: T.de, da: 0, dr: 0, thr: T.thr, flaps: c.flaps, gear: c.gear, brake: 0 });
  ac.de = T.de; ac.thr = T.thr; ac.flaps = c.flaps; ac.gearPos = c.gear; ac.updateAir(0);
  return { ac, T };
}
const dt = 1/240;
const run = (ac, t1, fn, rec) => { while (ac.t < t1) { if (fn) fn(ac); ac.step(dt); if (rec) rec(ac); } };
// peaks of a signal after t0: returns [{t, v}] local extrema
function extrema(ts, xs, t0) { const P = []; for (let i = 1; i < xs.length - 1; i++) if (ts[i] > t0 && ((xs[i] > xs[i-1] && xs[i] >= xs[i+1]) || (xs[i] < xs[i-1] && xs[i] <= xs[i+1]))) P.push({ t: ts[i], v: xs[i] }); return P; }
function fitOsc(P, ref) { // period from successive same-sign peaks, damping from log decrement
  const a = P.map(p => ({ t: p.t, A: p.v - ref })); const per = [], dec = [];
  for (let i = 0; i + 2 < a.length; i++) { per.push(a[i+2].t - a[i].t); dec.push(Math.log(Math.abs(a[i].A/a[i+2].A))); }
  const T = per.slice(0, 2).reduce((s, v) => s + v, 0)/Math.min(2, per.length), d = dec.slice(0, 2).reduce((s, v) => s + v, 0)/Math.min(2, dec.length);
  const zeta = d/Math.sqrt(4*Math.PI**2 + d*d); return { T, zeta, t2: Math.LN2*T/d };
}
const out = {}; const MAIN = process.argv[1].endsWith("v10_timeresp.mjs");
const cruise = { ias: 155, h: 3000*FT, flaps: 0, gear: 0, gammaDeg: 0 }, appr = { ias: 95, h: 300, flaps: 1, gear: 1, gammaDeg: -3 };
// 1) phugoid: elevator pulse 2 deg nose-up for 2 s then back to trim; read airspeed oscillation (controls fixed)
for (const [k, c] of [['cruise', cruise], ['approach', appr]]) {
  const { ac, T } = startTrimmed(c); const ts = [], vs = [];
  run(ac, 2, a => { a.cmd.de = T.de - 2*DEG; }); run(ac, 260, a => { a.cmd.de = T.de; }, a => { ts.push(a.t); vs.push(a.air.V); });
  const a2 = new Aircraft(), lin = modes(a2, trim(a2, c));
  out['phugoid_' + k] = { sim: fitOsc(extrema(ts, vs, 8), T.V), lin: { T: lin.ph.T, zeta: lin.ph.zeta, t2: lin.ph.t2 } };
}
// 2) dutch roll: rudder doublet +-5 deg (1 s each), controls fixed after; sideslip oscillation
for (const [k, c] of [['cruise', cruise], ['approach', appr]]) {
  const { ac, T } = startTrimmed(c); const ts = [], bs = [];
  run(ac, 1, a => { a.cmd.dr = 5*DEG; }); run(ac, 2, a => { a.cmd.dr = -5*DEG; }); run(ac, 20, a => { a.cmd.dr = 0; }, a => { ts.push(a.t); bs.push(a.air.beta); });
  const a2 = new Aircraft(), lin = modes(a2, trim(a2, c));
  out['dutch_' + k] = { sim: fitOsc(extrema(ts, bs, 2.6), 0), lin: { T: lin.dr.T, zeta: lin.dr.zeta, t2: lin.dr.t2 } };
}
// 3) spiral: establish 20 deg bank (aileron loop), release with controls at trim, bank after 20 s (Part 60 style)
for (const [k, c] of [['cruise', cruise], ['approach', appr]]) {
  const { ac, T } = startTrimmed(c);
  run(ac, 15, a => { a.cmd.da = Math.max(-AC.daMax, Math.min(AC.daMax, 1.25*(20*DEG - a.air.phi) - 0.28*a.air.p)); a.cmd.dr = -1.6*a.air.beta; });
  const phi0 = ac.air.phi; run(ac, 35, a => { a.cmd.da = 0; a.cmd.dr = 0; });
  out['spiral_' + k] = { phi0: phi0*RAD, phi20: ac.air.phi*RAD };
}
// 4) roll performance: full aileron step from wings level, rudder fixed at trim; time to 30 deg (Cat C) and 60 deg
for (const [k, c] of [['approach', appr], ['cruise', cruise]]) {
  const { ac } = startTrimmed(c); let t30 = null, t45 = null, t60 = null; const t0 = ac.t;
  run(ac, 4, a => { a.cmd.da = AC.daMax; }, a => { const p = a.air.phi*RAD; if (t30 == null && p >= 30) t30 = a.t - t0; if (t45 == null && p >= 45) t45 = a.t - t0; if (t60 == null && p >= 60) t60 = a.t - t0; });
  out['roll_' + k] = { t30, t45, t60, pss_degs: ac.air.p*RAD };
}
// 5) pitch-rate response to elevator step (short period): peak q and time to peak
{ const { ac, T } = startTrimmed(cruise); let qmax = 0, tq = 0; const t0 = ac.t;
  run(ac, 3, a => { a.cmd.de = T.de - 2*DEG; }, a => { if (a.air.q > qmax) { qmax = a.air.q; tq = a.t - t0; } });
  out.pitchStep_cruise = { qmax_degs: qmax*RAD, t_peak: tq, q_end_degs: ac.air.q*RAD }; }
if (MAIN) console.log(JSON.stringify(out, (k, v) => typeof v === "number" ? +v.toFixed(3) : v, 1));
