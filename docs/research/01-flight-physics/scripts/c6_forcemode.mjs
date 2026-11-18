// Section 6 prototype: "force-command" reversible elevator (stick-free emulation) running inside the CURRENT 6-DOF model.
// Pilot input = stick FORCE (N, pull +). Elevator floats to hinge-moment equilibrium; trim tab sets the zero-force speed.
import { M } from 'test/harness.mjs';
const { Flight, SCENARIOS, AC, KT, DEG, RAD, G0 } = M;
const LBF = 4.44822;
const P = { eta: 0.90, deda: AC.Cmadot / AC.Cmq, lt: (-AC.Cmde / AC.CLde) * AC.c, Se: 1.10, ce: 0.30, G: 2.40,
  Cha: -0.0020 * RAD, Chd: -0.0060 * RAD, Cht: -0.0035 * RAD, tauFloat: 0.05 };
function qToR(q) { const [w, x, y, z] = q; return [1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y), 2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x), 2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)]; }
const tmp = new Float64Array(13);
function nz(ac) { ac.deriv(ac.x, tmp); const R = qToR([ac.x[6], ac.x[7], ac.x[8], ac.x[9]]); const f = [tmp[3], tmp[4], tmp[5] - G0]; const fz = R[2] * f[0] + R[5] * f[1] + R[8] * f[2]; return -fz / G0; }
function alphaT(a) { return a.alpha * (1 - P.deda) + a.q * P.lt / a.V; }
function tabForZeroForce(ac) { const a = ac.air; return -(P.Cha * alphaT(a) + P.Chd * ac.de) / P.Cht; }
function makeForceLaw(f, st) {
  f.laws.update = function (dt, inp) {
    const ac = f.ac, a = ac.air, c = ac.cmd;
    const qt = P.eta * a.qbar;
    let de = (st.F / (P.G * qt * P.Se * P.ce) - P.Cha * alphaT(a) - P.Cht * st.tab) / P.Chd;
    de = Math.max(-AC.deUp, Math.min(AC.deDn, de));
    st.deF += (de - st.deF) * Math.min(1, dt / P.tauFloat);
    c.de = st.deF; c.da = 0; c.dr = 0; c.thr = inp.thr; c.brake = 0;
    // wings level helper so the longitudinal test is clean (ailerons only)
    c.da = Math.max(-AC.daMax, Math.min(AC.daMax, 1.2 * (0 - a.phi) - 0.3 * a.p));
    return c;
  };
}
function setup(ias, flaps, gear) {
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'man', assist: false, autoThr: false, dist: 14000, seed: 1 });
  if (ias !== 95 || flaps !== 1) { const tr = f.ac.setApproach({ dist: 14000, ias, flaps, gearDown: gear }); f.trim = tr; }
  f.input.thr = f.trim.thr;
  const st = { F: 0, tab: tabForZeroForce(f.ac), deF: f.ac.de };
  makeForceLaw(f, st); return { f, st };
}
const out = {};
// A) hands-off with tab at trim: speed hold over 120 s
{ const { f, st } = setup(95, 1, true); let vmin = 1e9, vmax = 0; while (f.ac.t < 120) { f.tick(f.dt); const v = f.ac.air.ias / KT; vmin = Math.min(vmin, v); vmax = Math.max(vmax, v); }
  out.handsOff95 = { tab_deg: +(st.tab * RAD).toFixed(2), vmin: +vmin.toFixed(1), vmax: +vmax.toFixed(1), vEnd: +(f.ac.air.ias / KT).toFixed(1), de_end: +(f.ac.de * RAD).toFixed(2) }; }
// B) pull 2 lbf... (≈ 0.9 kt per 0.14 lbf/kt → ~14 kt slower) for 20 s then release; and push
for (const [name, F] of [['pull5lbf', 5], ['push5lbf', -5]]) {
  const { f, st } = setup(95, 1, true); let vHold = null; let vmin = 1e9, vmax = 0;
  while (f.ac.t < 150) { st.F = f.ac.t < 40 ? F * LBF : 0; f.tick(f.dt); const v = f.ac.air.ias / KT; if (Math.abs(f.ac.t - 39.9) < f.dt / 2) vHold = v; if (f.ac.t > 40) { vmin = Math.min(vmin, v); vmax = Math.max(vmax, v); } }
  out[name] = { vAt40s_holdingForce: +vHold.toFixed(1), afterRelease_vmin: +vmin.toFixed(1), afterRelease_vmax: +vmax.toFixed(1), vEnd150: +(f.ac.air.ias / KT).toFixed(1) };
}
// C) pull-up: step force = 1 g worth of the analytic gradient (8.93 lbf) at 120 kt clean, gear up
for (const ias of [95, 120]) {
  const fl = ias === 95 ? 1 : 0; const { f, st } = setup(ias, fl, ias === 95);
  const n0 = nz(f.ac); const hist = [];
  while (f.ac.t < 4) { st.F = f.ac.t > 0.5 ? 8.93 * LBF : 0; f.tick(f.dt); if (Math.abs(((f.ac.t * 1000) | 0) % 250) < 5) hist.push([+f.ac.t.toFixed(2), +(nz(f.ac) - n0).toFixed(3), +(f.ac.air.ias / KT).toFixed(1)]); }
  let peak = 0; for (const h of hist) peak = Math.max(peak, h[1]);
  out[`pullup_${ias}`] = { n0: +n0.toFixed(3), dn_peak: +peak.toFixed(3), dn_at_2_5s: hist.find((h) => h[0] >= 2.5)?.[1], hist: hist.filter((_, i) => i % 2 === 0) };
}
console.log(JSON.stringify(out, null, 1));
