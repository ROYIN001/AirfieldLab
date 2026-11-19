// REVIEW copy of g7_patch.mjs: tyre damping capped at the tyre spring force and sd0 clamped at top-out; also reports main-gear N after the first 1/240 s step.
// Section 7: run the CURRENT 6-DOF model and a PATCHED copy whose vertical gear force is the series tyre+oleo model.
// The repo is not modified: the source text is patched in memory. Run: node g7_patch.mjs
import fs from 'fs';
import { OLEO, prep, gasF, solveSd } from './g7_series.mjs';
function strutStep(P, pen, penDot, s) {
  const Fa = gasF(P, s), dl = pen - s, Ft0 = dl > 0 ? P.kt * dl : 0;
  let sd0 = solveSd(P, Ft0 - Fa); if (s <= 0 && sd0 < 0) sd0 = 0;
  const damp = Math.max(-Ft0, Math.min(Ft0, P.ct * (penDot - sd0)));
  const Ft = dl > 0 ? Math.max(0, Ft0 + damp) : 0;
  let sd = solveSd(P, Ft - Fa); if (s <= 0 && sd < 0) sd = 0; if (s >= P.S && sd > 0) sd = 0;
  return { N: Ft, sd, Fa };
}
const dir = 'src/';
const src0 = ['10-atmo.js', '15-geo.js', '20-flight.js'].map(f => fs.readFileSync(dir + f, 'utf8')).join('\n');
const RET = '\nreturn { FIELD, AC, Aircraft, Flight, SCENARIOS, KT, FT, DEG, RAD, G0, wrapPi };';
function build(patched) {
  let src = src0;
  if (patched) {
    const a = `      const pen = s[2] + cn[2];
      if (pen <= 0) { if (diag) { diag.wow[i] = false; diag.load[i] = 0; } continue; }
      const vrel = cross(w, g.b), vc0 = mulR(R, vrel);
      const vc = [s[3] + vc0[0], s[4] + vc0[1], s[5] + vc0[2]];
      let N = g.k * Math.min(pen, g.stroke) + (pen > g.stroke ? 12 * g.k * (pen - g.stroke) : 0) + g.c * vc[2];
      N = Math.max(0, N);`;
    const b = `      const pen = s[2] + cn[2];
      const vrel = cross(w, g.b), vc0 = mulR(R, vrel);
      const vc = [s[3] + vc0[0], s[4] + vc0[1], s[5] + vc0[2]];
      const rS = __strut(i, pen, vc[2], s[13 + i]); out[13 + i] = rS.sd;
      if (rS.N <= 0) { if (diag) { diag.wow[i] = false; diag.load[i] = 0; } continue; }
      let N = rS.N;`;
    if (!src.includes(a)) throw new Error('patch anchor not found');
    src = src.replace(a, b);
    src = src.replace("if (this.gearPos < 0.98) { if (diag)", "out[13 + i] = 0; if (this.gearPos < 0.98) { if (diag)");
    src = src.replace('this.x = new Float64Array(13);', 'this.x = new Float64Array(16);');
    src = src.replace('this.k = [0, 1, 2, 3].map(() => new Float64Array(13)); this.tmp = new Float64Array(13);', 'this.k = [0, 1, 2, 3].map(() => new Float64Array(16)); this.tmp = new Float64Array(16);');
    src = src.split('for (let i = 0; i < 13; i++)').join('for (let i = 0; i < 16; i++)');
    src = src.replace('for (let i = 0; i < 16; i++) x[i] += (dt / 6) * (k[0][i] + 2 * k[1][i] + 2 * k[2][i] + k[3][i]);',
      'for (let i = 0; i < 16; i++) x[i] += (dt / 6) * (k[0][i] + 2 * k[1][i] + 2 * k[2][i] + k[3][i]); for (let i = 13; i < 16; i++) x[i] = Math.min(Math.max(x[i], 0), __S[i - 13]);');
  }
  const g0 = 9.80665, W = 2250 * g0, WN = W * 0.35 / 2.65, WM = (W - WN) / 2;
  const PN = prep(OLEO.nose, WN), PM = prep(OLEO.main, WM), PS = [PN, PM, PM];
  const strut = (i, pen, penDot, s) => strutStep(PS[i], pen, penDot, s);
  const M = new Function('__strut', '__S', src + RET)(strut, PS.map(p => p.S));
  if (patched) { // raise extended wheel positions so the parked CG height matches the current model
    const dN = 0.137 + 0.018 - 0.0614, dM = 0.171 + 0.030 - 0.0755;
    M.AC.gear[0].b[2] += dN; M.AC.gear[1].b[2] += dM; M.AC.gear[2].b[2] += dM;
  }
  return M;
}
function parked(M) {
  const f = new M.Flight({ wind: M.SCENARIOS.calm }); const ac = f.ac;
  ac.setParked(0, 0, 30 * M.DEG); const n0 = ac.x[0], e0 = ac.x[1];
  for (let i = 0; i < 240 * 10; i++) ac.step(1 / 240);
  const a = ac.air, L = a.load, W = M.AC.m * M.G0;
  return { h: a.h, pitch: a.theta * M.RAD, loads: L.map(v => Math.round(v)), noseShare: L[0] / (L[0] + L[1] + L[2]), sumW: (L[0] + L[1] + L[2]) / W, creep10s: Math.hypot(ac.x[0] - n0, ac.x[1] - e0), strokes: ac.x.length > 13 ? [ac.x[13], ac.x[14], ac.x[15]].map(v => +(v * 1000).toFixed(0)) : null };
}
function drop(M, vs, liftFrac, th = 5 * M.DEG, T = 1.5) {
  const ac = new M.Aircraft(); const W = M.AC.m * M.G0;
  ac.gearPos = 1; ac.flaps = 1; ac.thr = 0;
  const gm = M.AC.gear[1].b, c = Math.cos(th), sn = Math.sin(th);
  const d0 = -(-sn * gm[0] + c * gm[2]) - 0.001;
  ac.x.set([0, 0, d0, 0, 0, vs, Math.cos(th / 2), 0, Math.sin(th / 2), 0, 0, 0, 0]);
  const orig = ac.deriv.bind(ac); ac.deriv = (s, out, diag) => { orig(s, out, diag); out[5] -= liftFrac * M.G0; };
  ac.updateAir(0);
  let N1 = null, maxN = [0, 0, 0], nmax = 0, tpk = 0, on = false, bounce = false, maxStroke = [0, 0, 0];
  for (let t = 0; t < T; t += 1 / 240) {
    ac.step(1 / 240); const L = ac.air.load; if (N1 === null) N1 = L[1] / (W * (2.30 / 2.65) / 2);
    for (let i = 0; i < 3; i++) { maxN[i] = Math.max(maxN[i], L[i]); if (ac.x.length > 13) maxStroke[i] = Math.max(maxStroke[i], ac.x[13 + i]); }
    const n = (L[0] + L[1] + L[2]) / W; if (n > nmax) { nmax = n; tpk = t; }
    const w = ac.air.wow[1] || ac.air.wow[2]; if (on && !w) bounce = true; on = on || w;
  }
  return { N1step_over_Wst: +N1.toFixed(2), mainN: Math.round(maxN[1]), n_ground: +nmax.toFixed(2), tPeak_ms: Math.round(tpk * 1000), bounce, maxStroke_mm: maxStroke.map(v => Math.round(v * 1000)) };
}
function autoland(M, sc = 'calm') {
  const f = new M.Flight({ wind: M.SCENARIOS[sc], pilot: 'ap', seed: 5 }); const W = M.AC.m * M.G0;
  let tdT = null, nmax = 0, lostContact = 0, prevOn = false, tAirAfter = 0, hMax = 0;
  while (f.ac.t < 260 && !f.ev.done && !f.crashed) {
    f.tick(f.dt); const a = f.ac.air; const on = a.wow[1] || a.wow[2];
    if (on && tdT == null) tdT = f.ac.t;
    if (tdT != null) { nmax = Math.max(nmax, (a.load[0] + a.load[1] + a.load[2]) / W); if (prevOn && !on) lostContact++; if (!on && f.ac.t - tdT < 5) { tAirAfter += f.dt; hMax = Math.max(hMax, a.hWheel); } }
    prevOn = on || (tdT != null && prevOn);
    if (tdT != null) prevOn = on;
  }
  const sc2 = f.ev.score();
  return { tdSinkFpm: +f.ev.td?.vsFpm.toFixed(0), n_ground_max: +nmax.toFixed(2), bounces: lostContact, airborneAfterTD_s: +tAirAfter.toFixed(2), bounceHeight_mm: Math.round(hMax * 1000), stopS: +f.ev.stopS?.toFixed(0), score: sc2?.total, crashed: f.crashed };
}
for (const [lab, patched] of [['CURRENT', false], ['PROPOSED (series oleo)', true]]) {
  const M = build(patched);
  console.log(`== ${lab}`);
  console.log(' parked', JSON.stringify(parked(M)));
  for (const [vs, L] of [[3.0, 1.0], [3.048, 2 / 3], [3.66, 2 / 3], [1.0, 1.0]]) console.log(` drop vs ${vs} L ${L.toFixed(2)}`, JSON.stringify(drop(M, vs, L)));
  for (const sc of ['calm', 'xl']) console.log(` autoland ${sc}`, JSON.stringify(autoland(M, sc)));
}
