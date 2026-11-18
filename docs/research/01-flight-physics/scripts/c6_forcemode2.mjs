// Section 6 prototype (cont.): release test with 1 lbf, and pull force at stall-warning onset at 95 kt flaps landing
import { M } from 'test/harness.mjs';
const { Flight, SCENARIOS, AC, KT, DEG, RAD } = M;
const LBF = 4.44822;
const P = { eta: 0.90, deda: AC.Cmadot / AC.Cmq, lt: (-AC.Cmde / AC.CLde) * AC.c, Se: 1.10, ce: 0.30, G: 2.40, Cha: -0.0020 * RAD, Chd: -0.0060 * RAD, Cht: -0.0035 * RAD, tauFloat: 0.05 };
const aT = (a) => a.alpha * (1 - P.deda) + a.q * P.lt / a.V;
function setup() {
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'man', assist: false, autoThr: false, dist: 14000, seed: 1 });
  f.input.thr = f.trim.thr; const st = { F: 0, tab: -(P.Cha * aT(f.ac.air) + P.Chd * f.ac.de) / P.Cht, deF: f.ac.de };
  f.laws.update = function (dt, inp) { const ac = f.ac, a = ac.air, c = ac.cmd; let de = (st.F / (P.G * P.eta * a.qbar * P.Se * P.ce) - P.Cha * aT(a) - P.Cht * st.tab) / P.Chd; de = Math.max(-AC.deUp, Math.min(AC.deDn, de)); st.deF += (de - st.deF) * Math.min(1, dt / P.tauFloat); c.de = st.deF; c.da = Math.max(-AC.daMax, Math.min(AC.daMax, 1.2 * (0 - a.phi) - 0.3 * a.p)); c.dr = 0; c.thr = inp.thr; c.brake = 0; return c; };
  return { f, st };
}
const out = {};
for (const F of [1, -1]) { const { f, st } = setup(); let v40; const vs = []; while (f.ac.t < 200) { st.F = f.ac.t < 60 ? F * LBF : 0; f.tick(f.dt); if (Math.abs(f.ac.t - 59.9) < f.dt / 2) v40 = f.ac.air.ias / KT; if (f.ac.t > 60) vs.push(f.ac.air.ias / KT); }
  const last = vs.slice(-240 * 40); out[`hold${F}lbf`] = { vHold60s: +v40.toFixed(1), afterRelease_min: +Math.min(...vs).toFixed(1), afterRelease_max: +Math.max(...vs).toFixed(1), mean_last40s: +(last.reduce((s, x) => s + x, 0) / last.length).toFixed(1) }; }
{ const { f, st } = setup(); let Fw = null, vw = null; while (f.ac.t < 60 && Fw === null) { st.F = Math.max(0, f.ac.t - 1) * 0.5 * LBF; f.tick(f.dt); const a = f.ac.air; if (a.stall > 0.25 || a.alpha > (AC.aStall + AC.aStallFlap * f.ac.flaps - 4) * DEG) { Fw = st.F / LBF; vw = a.ias / KT; } }
  out.stallWarn_ramp0p5lbfps = { F_lbf: +Fw.toFixed(2), ias: +vw.toFixed(1) }; }
console.log(JSON.stringify(out, null, 1));
