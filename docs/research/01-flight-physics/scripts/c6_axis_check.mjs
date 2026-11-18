// Section 6: check the ControlAxis code proposed in sec-06 against the prototype numbers (template for test/controls.test.mjs)
import { M } from 'test/harness.mjs';
const { Flight, SCENARIOS, AC, KT, DEG, RAD } = M;
const LBF = 4.44822;
class ControlAxis {
  constructor(p) { this.p = p; this.tab = 0; this.d = 0; this.Fv = 0; }
  update(dt, Fpilot, aLoc, qbar, dCmd) {
    const p = this.p, K = p.G * p.eta * qbar * p.S * p.c;
    const Kc = p.Kc * Math.max(0, Math.min(1, 1 - qbar / p.qFade));
    const chB = p.Ch0 + p.Cha * aLoc + p.Cht * this.tab;
    let dEq;
    if (Fpilot == null) dEq = dCmd;
    else { const Fb = Math.sign(Fpilot) * Math.max(0, Math.abs(Fpilot) - p.Fbo); dEq = (Fb - K * chB) / (K * p.Chd - Kc); }
    dEq = Math.min(p.dMaxTED, Math.max(-p.dMaxTEU, dEq));
    this.d += (dEq - this.d) * Math.min(1, dt / p.tauF);
    this.Fv = K * (chB + p.Chd * this.d) - Kc * this.d;
    return this.d;
  }
  trim(dt, dir, flapsDown) { const r = flapsDown ? this.p.trimRateDn : this.p.trimRateUp; this.tab = Math.min(this.p.tabMax, Math.max(-this.p.tabMax, this.tab + dir * r * dt)); }
  autoTrim(dt, flapsDown) { const dir = Math.max(-1, Math.min(1, this.Fv / this.p.FtrimRef)); if (Math.abs(this.Fv) > this.p.Fbo) this.trim(dt, dir, flapsDown); }
}
const PE = { G: 2.40, eta: 0.90, S: 1.10, c: 0.30, Ch0: 0, Cha: -0.0020 * RAD, Chd: -0.0060 * RAD, Cht: -0.0035 * RAD, Kc: 60, qFade: 400, Fbo: 4.45, tauF: 0.05,
  dMaxTED: AC.deDn, dMaxTEU: AC.deUp, tabMax: 20 * DEG, trimRateDn: 1.0 * DEG, trimRateUp: 0.5 * DEG, FtrimRef: 4.45, deda: AC.Cmadot / AC.Cmq, lt: (-AC.Cmde / AC.CLde) * AC.c };
const aLoc = (a) => a.alpha * (1 - PE.deda) + a.q * PE.lt / a.V;
function setup(opts = {}) {
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'man', assist: false, autoThr: false, dist: 14000, seed: 1 });
  f.input.thr = f.trim.thr; const ax = new ControlAxis(PE); ax.d = f.ac.de;
  ax.tab = -(PE.Cha * aLoc(f.ac.air) + PE.Chd * f.ac.de) / PE.Cht;   // in trim
  const st = { F: 0, auto: false };
  f.laws.update = function (dt, inp) { const ac = f.ac, a = ac.air, c = ac.cmd; c.de = ax.update(dt, st.F, aLoc(a), a.qbar, null); if (st.auto) ax.autoTrim(dt, ac.flaps > 0.5);
    c.da = Math.max(-AC.daMax, Math.min(AC.daMax, 1.2 * (0 - a.phi) - 0.3 * a.p)); c.dr = 0; c.thr = inp.thr; c.brake = 0; return c; };
  return { f, ax, st };
}
const out = {};
{ const { f, ax } = setup(); let lo = 1e9, hi = 0; while (f.ac.t < 120) { f.tick(f.dt); const v = f.ac.air.ias / KT; lo = Math.min(lo, v); hi = Math.max(hi, v); } out.handsOff = { lo: +lo.toFixed(1), hi: +hi.toFixed(1), tab_deg: +(ax.tab * RAD).toFixed(2) }; }
for (const F of [2, -2]) { const { f, st } = setup(); let vh; while (f.ac.t < 60) { st.F = F * LBF; f.tick(f.dt); } vh = f.ac.air.ias / KT; out[`hold_${F}lbf_with_1lbf_breakout`] = +vh.toFixed(1); }
// auto-trim: hold 2 lbf pull with auto-trim on: tab should move nose-up until |Fv| < breakout; then release -> new trim speed holds
{ const { f, ax, st } = setup(); st.auto = true; const tab0 = ax.tab; while (f.ac.t < 60) { st.F = 2 * LBF; f.tick(f.dt); } const Fv60 = ax.Fv / LBF; out.autoTrim = { tabChange_deg: +((ax.tab - tab0) * RAD).toFixed(2), Fv_at60s_lbf: +Fv60.toFixed(2), ias60: +(f.ac.air.ias / KT).toFixed(1) }; }
// gamepad mapping function
const shape = (x, d = 0.08, e = 0.5) => { const u = Math.max(0, (Math.abs(x) - d) / (1 - d)); return Math.sign(x) * ((1 - e) * u + e * u ** 3); };
out.gamepad = { f0_08: shape(0.08), f0_5: +shape(0.5).toFixed(4), f1: shape(1), fm1: shape(-1), F0_5_N: +(267 * shape(0.5)).toFixed(1) };
console.log(JSON.stringify(out, null, 1));
