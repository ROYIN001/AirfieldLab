// s12_oracle_js.mjs - open-loop run of the AirfieldLab flight model (src/20-flight.js via test/harness.mjs)
// for cross-checking against JSBSim (see s12_oracle_jsb.py). No gear contact, no wind, ISA.
// Usage: node s12_oracle_js.mjs <noadot|adot> <out.json>
import fs from 'fs';
import { M } from 'test/harness.mjs';
const [mode = 'noadot', outFile = 'oracle_js.json'] = process.argv.slice(2);
const { AC, Aircraft, DEG, RAD, KT, FT, FIELD } = M;
if (mode === 'noadot') { AC.CLadot = 0; AC.Cmadot = 0; }
const ac = new Aircraft();
const trim = ac.setApproach({ dist: 5500 });          // 95 KIAS, flaps 1, gear down, on the 3 deg path (~305 m)
const de0 = ac.de, da0 = 0, dr0 = 0, thr0 = ac.thr;
const sched = (t) => ({
  de: de0 + (t >= 1 && t < 2 ? 2 : t >= 2 && t < 3 ? -2 : 0) * DEG,
  da: da0 + (t >= 8 && t < 9 ? 5 : t >= 9 && t < 10 ? -5 : 0) * DEG,
  dr: dr0 + (t >= 14 && t < 15 ? 5 : 0) * DEG,
});
const x = ac.x, R = (q) => { const [w, a, b, c] = q; return [1 - 2 * (b * b + c * c), 2 * (a * b - w * c), 2 * (a * c + w * b), 2 * (a * b + w * c), 1 - 2 * (a * a + c * c), 2 * (b * c - w * a), 2 * (a * c - w * b), 2 * (b * c + w * a), 1 - 2 * (a * a + b * b)]; };
const Rm = R([x[6], x[7], x[8], x[9]]), v = [x[3], x[4], x[5]];
const uvw = [Rm[0] * v[0] + Rm[3] * v[1] + Rm[6] * v[2], Rm[1] * v[0] + Rm[4] * v[1] + Rm[7] * v[2], Rm[2] * v[0] + Rm[5] * v[1] + Rm[8] * v[2]];
const a0 = ac.air;
const ic = { h_m: -x[2], elev_m: FIELD.elev, u: uvw[0], v: uvw[1], w: uvw[2], phi: a0.phi, theta: a0.theta, psi: a0.psi, de0, thr0, flaps: ac.flaps, gear: ac.gearPos, trim };
const dt = 1 / 240, T = 25, rows = [];
let maxSig = 0;
const t0 = performance.now();
for (let i = 0; i <= Math.round(T / dt); i++) {
  const t = i * dt, a = ac.air;
  if (i % 24 === 0) rows.push([+t.toFixed(4), a.h, a.V, a.alpha * RAD, a.beta * RAD, a.phi * RAD, a.theta * RAD, a.psi * RAD, a.p * RAD, a.q * RAD, a.r * RAD]);
  maxSig = Math.max(maxSig, a.stall);
  if (i === Math.round(T / dt)) break;
  const s = sched(t);
  ac.de = ac.cmd.de = s.de; ac.da = ac.cmd.da = s.da; ac.dr = ac.cmd.dr = s.dr; ac.cmd.thr = thr0;
  ac.step(dt);
}
const wall = performance.now() - t0;
const params = {}; for (const k of Object.keys(AC)) if (typeof AC[k] === 'number') params[k] = AC[k];
fs.writeFileSync(outFile, JSON.stringify({ mode, ic, params, cols: ['t', 'h_m', 'V_mps', 'alpha_deg', 'beta_deg', 'phi_deg', 'theta_deg', 'psi_deg', 'p_dps', 'q_dps', 'r_dps'], rows, maxSig, wallMs: wall, steps: Math.round(T / dt) }));
console.log(JSON.stringify({ mode, ic: { ...ic, trim: undefined }, trim, maxSig, wallMs: +wall.toFixed(1), usPerStep: +(wall * 1000 / (T / dt)).toFixed(2) }));
