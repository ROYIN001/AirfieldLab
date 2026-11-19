// u2_ge_table.mjs — ground-effect factors: formulas vs VLM (trainer planform) + tail downwash change
import { solve } from './u2_vlm_ge.mjs';
const D2R = Math.PI / 180, b = 10.2, A = 6.38, a2d = 2 * Math.PI * 0.9;
const tani = (hb) => Math.exp(-2.48 * Math.pow(2 * hb, 0.768));          // sigma, NACA 738 p.10 / Torenbeek
const mcc = (hb) => { const g = (16 * hb) ** 2; return g / (1 + g); };    // McCormick first-printing form used in repo
const hoer = (hb) => { const g = 33 * Math.pow(hb, 1.5); return g / (1 + g); };   // Hoerner–Borst (as read, Phillips&Hunsaker eq.1)
const jsbCD = [[0, .48], [.1, .515], [.15, .629], [.2, .709], [.3, .815], [.4, .882], [.5, .928], [.6, .962], [.7, .988], [.8, 1], [1.1, 1]];
const jsbCL = [[0, 1.203], [.1, 1.127], [.15, 1.09], [.2, 1.073], [.3, 1.046], [.4, 1.055], [.5, 1.019], [.6, 1.013], [.7, 1.008], [.8, 1.006], [.9, 1.003], [1, 1.002], [1.1, 1]];
const lerpT = (T, x) => { if (x <= T[0][0]) return T[0][1]; for (let i = 1; i < T.length; i++) if (x <= T[i][0]) { const [x0, y0] = T[i - 1], [x1, y1] = T[i]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0); } return T[T.length - 1][1]; };
// lift-curve-slope ratio implied by induced-angle reduction (Katzoff Δα formula): a = 1/(1/a2d + (1-σ)/(πA))
const claRatio = (hb) => (1 / (1 / a2d + (1 - tani(hb)) / (Math.PI * A))) / (1 / (1 / a2d + 1 / (Math.PI * A)));
const a1 = 4 * D2R, a2 = 6 * D2R;
const f1 = solve({ alpha: a1, ground: false }), f2 = solve({ alpha: a2, ground: false });
const CLa = (f2.CL - f1.CL) / (a2 - a1);
const dzs = [-0.3, 0, 0.3, 0.6, 0.9];
const epsFree = dzs.map((dz) => solve({ alpha: a2, ground: false, tailDz: dz }).eps);
const out = [];
console.log('h/b | CDi ratio: McC  Tani  Hoerner  JSBc172  VLM | CLa ratio: repo  Tani-induced  JSBc172(CL)  VLM(CLa)  VLM(CL@6°) | eps_IGE/eps_OGE same CL (VLM, mean over dz) ');
for (const hb of [0.05, 0.075, 0.1, 0.125, 0.15, 0.2, 0.3, 0.5, 0.75, 1.0]) {
  const hw = hb * b;
  const g1 = solve({ alpha: a1, hw }), g2 = solve({ alpha: a2, hw });
  const cla = (g2.CL - g1.CL) / (a2 - a1), aSame = a1 + (f2.CL - g1.CL) / cla;
  const kD = (g2.CDi / g2.CL ** 2) / (f2.CDi / f2.CL ** 2);
  const er = dzs.map((dz, i) => solve({ alpha: aSame, hw, tailDz: dz }).eps / epsFree[i]);
  const erMean = er.reduce((s, v) => s + v, 0) / er.length, erMin = Math.min(...er), erMax = Math.max(...er);
  const row = { hb, mcc: mcc(hb), tani: 1 - tani(hb), hoer: hoer(hb), jsbCD: lerpT(jsbCD, hb), vlmCD: kD,
    repoCLa: 1 + 0.12 * (1 - mcc(hb)), taniCLa: claRatio(hb), jsbCL: lerpT(jsbCL, hb), vlmCLa: cla / CLa, vlmCL6: g2.CL / f2.CL,
    epsRatio: erMean, epsRatioMin: erMin, epsRatioMax: erMax, dAlphaSameCL_deg: (aSame - a2) / D2R };
  out.push(row);
  console.log(`${hb.toFixed(3)} | ${row.mcc.toFixed(3)} ${row.tani.toFixed(3)} ${row.hoer.toFixed(3)} ${row.jsbCD.toFixed(3)} ${row.vlmCD.toFixed(3)} | ${row.repoCLa.toFixed(3)} ${row.taniCLa.toFixed(3)} ${row.jsbCL.toFixed(3)} ${row.vlmCLa.toFixed(3)} ${row.vlmCL6.toFixed(3)} | ${erMean.toFixed(3)} (${erMin.toFixed(3)}–${erMax.toFixed(3)}) dα@CL ${row.dAlphaSameCL_deg.toFixed(2)}°`);
}
console.log('free-air: CLa', CLa.toFixed(3), 'eps(6deg) by dz', epsFree.map((e) => (e / D2R).toFixed(2)).join(' '));
// tail pitching-moment change at touchdown using sec-06 geometry: etaVH*a_t = 0.9*0.596*3.9
const k = 0.9 * 0.596 * 3.9, Cmde = -1.15;
for (const epsFreeDeg of [3.0, 4.5, 6.0]) for (const hb of [0.1, 0.15, 0.2]) {
  const r = out.find((o) => o.hb === hb).epsRatio;
  const dEps = -(1 - r) * epsFreeDeg * D2R, dCm = k * dEps, dde = -dCm / Cmde;   // dEps<0 => tail alpha up => nose down
  console.log(`eps_free ${epsFreeDeg}° h/b ${hb}: dEps ${(dEps / D2R).toFixed(2)}°, dCm ${dCm.toFixed(4)}, extra elevator ${(dde / D2R).toFixed(2)}° (neg = TEU)`);
}
import fs from 'fs'; fs.writeFileSync(new URL('./u2_ge_table.json', import.meta.url), JSON.stringify({ CLa, out }, null, 1));
