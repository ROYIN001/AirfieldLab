// U7: prototype of the PROPOSED ground-effect model patched into a copy of src/20-flight.js (repo untouched),
// to compute expected values for the test table. ค่าประมาณ.
import fs from 'fs';
const dir = 'src/';
let src = ['10-atmo.js', '15-geo.js', '20-flight.js'].map(f => fs.readFileSync(dir + f, 'utf8')).join('\n');
const GE = `
const GEP = { A: AC.b * AC.b / AC.S, hbMin: 0.05, xac: 0.0, zac: 0.36, deda: 0.43, etaH: 0.9, VH: 0.69, at: 3.67, CLaW: 4.8, kTail: 1.0 };
function geKDi(hb) { hb = Math.max(hb, GEP.hbMin); return 1 - Math.exp(-4.74 * Math.pow(hb, 0.814)) - hb * hb * Math.exp(-3.88 * Math.pow(hb, 0.758)); }
function geKL(hb) { hb = Math.max(hb, GEP.hbMin); return 1 + 288 * Math.pow(hb, 0.787) * Math.exp(-9.14 * Math.pow(hb, 0.327)) / Math.pow(GEP.A, 0.882); }
`;
src = src.replace('// ── small vector / quaternion helpers ──', GE + '\n// ── small vector / quaternion helpers ──');
// replace ground-effect lines in deriv
src = src.replace(
  "const hw = Math.max(0.2, h - 0.35);                       // wing height above ground\n    const ge = (16 * hw / AC.b) ** 2; const phiGE = ge / (1 + ge);",
  "const acN = mulR(R, [GEP.xac, 0, GEP.zac]); const hw = Math.max(0.05, h - acN[2]); const hb = hw / AC.b;\n    const kL = geKL(hb), kDi = geKDi(hb), phiGE = kDi;");
src = src.replace(
  "const CLlin = AC.CL0 + AC.CLflap * f + AC.CLa * (1 + 0.12 * (1 - phiGE)) * alpha + AC.CLq * qh + AC.CLadot * adh + AC.CLde * this.de;",
  "const CLw = (AC.CL0 + AC.CLflap * f + AC.CLa * alpha) * kL; const CLlin = CLw + AC.CLq * qh + AC.CLadot * adh + AC.CLde * this.de;\n    const epsOGE = GEP.deda / GEP.CLaW * CLw / kL; const dEps = (1 - kDi * kL) * epsOGE * GEP.kTail; // tail downwash IGE = kDi * eps_OGE(CL_IGE) (VLM U2), baseline Cm already holds eps_OGE(CL_OGE(alpha))");
src = src.replace("const a0 = (AC.aStall + AC.aStallFlap * f) * DEG;", "const a0 = (AC.aStall + AC.aStallFlap * f) * DEG; // (stall shift in GE omitted in this prototype)");
src = src.replace("AC.K * phiGE * (CLlin - 0.15) ** 2", "AC.K * kDi * (CLlin - 0.15) ** 2");
src = src.replace("- 0.06 * (1 - phiGE) - sig * 0.25", "- GEP.etaH * GEP.VH * GEP.at * dEps - sig * 0.25");
const MM = new Function(src + '\nreturn { AC, Aircraft, KT, DEG, RAD, geKL, geKDi };')();
const { AC, Aircraft, KT, DEG, RAD, geKL, geKDi } = MM;
const ac = new Aircraft(); ac.isaDev = 31 - (15 - 0.0065 * 3); ac.gearPos = 0.979; ac.flaps = 1;
function trim(hw, kt) {
  const V = kt * KT; let x = [5 * DEG, -2 * DEG, 0.3]; let diag;
  const res = (p) => { const [a, de, thr] = p; ac.de = de; ac.thr = thr; ac.adot = 0; const q = [Math.cos(a / 2), 0, Math.sin(a / 2), 0];
    // CG height so that the aerodynamic-centre point (0.36 m below CG) sits at hw
    const hcg = hw + 0.36 * Math.cos(a); ac.x.set([0, 0, -hcg, V, 0, 0, q[0], q[1], q[2], q[3], 0, 0, 0]);
    const d = new Float64Array(13); diag = { wow: [0, 0, 0], load: [0, 0, 0] }; ac.deriv(ac.x, d, diag); return [d[3], d[5], d[11]]; };
  for (let it = 0; it < 30; it++) { const f0 = res(x), J = [0, 1, 2].map(j => { const xp = x.slice(); xp[j] += 1e-6; const f1 = res(xp); return f1.map((v, i) => (v - f0[i]) / 1e-6); });
    const Mx = [0, 1, 2].map(i => [0, 1, 2].map(j => J[j][i]));
    const det = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    const D0 = det(Mx); x = x.map((v, k) => v + det(Mx.map((row, i) => row.map((u, j) => (j === k ? -f0[i] : u)))) / D0); }
  res(x); return { hw, hb: +(hw / AC.b).toFixed(3), alpha_deg: +(x[0] * RAD).toFixed(2), de_deg: +(x[1] * RAD).toFixed(2), thr: +x[2].toFixed(3), CL: +diag.CL.toFixed(3), D_N: Math.round(diag.D) };
}
console.log('Proposed GE model: factors for the trainer (A =', (AC.b * AC.b / AC.S).toFixed(3), ')');
for (const hb of [0.05, 0.07, 0.1, 0.15, 0.2, 0.3, 0.5, 0.75, 1.0]) console.log(JSON.stringify({ hb, kDi: +geKDi(hb).toFixed(3), kL: +geKL(hb).toFixed(3) }));
console.log('Level trim, 85 kt TAS, landing flaps, proposed model:');
const oge = trim(60, 85);
for (const hw of [0.51, 1.02, 1.53, 2.04, 3.06, 5.1, 10.2, 60]) { const t = trim(hw, 85); console.log(JSON.stringify({ ...t, dAlpha: +(t.alpha_deg - oge.alpha_deg).toFixed(2), dDe: +(t.de_deg - oge.de_deg).toFixed(2), dD_pct: +(100 * (t.D_N / oge.D_N - 1)).toFixed(1) })); }
