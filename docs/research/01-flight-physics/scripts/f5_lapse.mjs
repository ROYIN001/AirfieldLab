// Section 5 (turbofan): compare thrust-lapse models. Uses AirfieldLab atmosphere() via harness.
import { M } from 'test/harness.mjs';
const { atmosphere, FT } = M;
const P0 = 101325, RHO0 = 1.225;
const amb = (hft, dT = 0) => { const a = atmosphere(hft * FT, dT); return { d: a.p / P0, s: a.rho / RHO0, T: a.T, a: Math.sqrt(1.4 * 287.05287 * a.T) }; };
// Bartel & Young 2008 eq. 11-14 (as coded in OpenAP thrust.py, LGPL-3.0; equations cited, code not copied)
const G0fit = bpr => 0.0606 * bpr + 0.6337;               // OpenAP fit to B&Y Fig. 5
function BY(M_, dP, bpr, G = G0fit(bpr)) {
  const A = -0.4327 * dP * dP + 1.3855 * dP + 0.0472;
  const Z = 0.9106 * dP ** 3 - 1.7736 * dP * dP + 1.8697 * dP;
  const X = 0.1377 * dP ** 3 - 0.4374 * dP * dP + 1.3003 * dP;
  return A - 0.377 * (1 + bpr) / Math.sqrt((1 + 0.82 * bpr) * G) * Z * M_ + (0.23 + 0.19 * Math.sqrt(bpr)) * X * M_ * M_;
}
// Torenbeek 1982 static-to-flight ratio (form per Schulz 2007 eq 2.6; G = 0.9 low BPR / 1.0 high BPR) -- form partly unverified
const TOR = (M_, bpr, G = 1.0, k = 0.11) => 1 - 0.45 * (1 + bpr) / Math.sqrt((1 + 0.75 * bpr) * G) * M_ + (0.6 + k * bpr / G) * M_ * M_;
// Howe 2000 (Schulz 2007 Table 2.1): tau = (k1 + k2 BPR + (k3 + k4 BPR) M) sigma^s
const HOWE = { '3-6': [[1, 0, -0.6, -0.04], [0.88, -0.016, -0.3, 0]], '8': [[1, 0, -0.595, -0.03], [0.89, -0.014, -0.3, 0.005]] };
function howe(M_, sig, bpr, band, hm) { const k = HOWE[band][M_ <= 0.4 ? 0 : 1]; const s = hm > 11000 ? 1 : 0.7; return (k[0] + k[1] * bpr + (k[2] + k[3] * bpr) * M_) * sig ** s; }
// Poll & Schumann 2024 check at M=0.4 SL: F/F00 ~ 0.97*(0.825-0.018 BPR)  (0.97 = installation factor)
const PS04 = bpr => 0.97 * (0.825 - 0.018 * bpr);
// JSBSim CFM56.xml MilThrust table (Aero-Matic generic, BPR 5.9) for comparison only (LGPL; not to be copied into repo)
const JSB = { M: [0, 0.2, 0.4, 0.6, 0.8, 1.0], H: [-10000, 0, 10000, 20000, 30000, 40000], d: [[1.26, 1, 0.74, 0.534, 0.372, 0.241], [1.171, 0.934, 0.697, 0.506, 0.355, 0.231], [1.15, 0.921, 0.692, 0.506, 0.357, 0.233], [1.181, 0.951, 0.721, 0.532, 0.378, 0.248], [1.258, 1.02, 0.782, 0.582, 0.417, 0.275], [1.369, 1.12, 0.871, 0.651, 0.475, 0.315]] };
function jsb(M_, hd) { // bilinear (density altitude in ft)
  const f = (arr, x) => { let i = 0; while (i < arr.length - 2 && x > arr[i + 1]) i++; return [i, (x - arr[i]) / (arr[i + 1] - arr[i])]; };
  const [i, u] = f(JSB.M, M_), [j, v] = f(JSB.H, hd);
  const d = JSB.d; return (1 - u) * ((1 - v) * d[i][j] + v * d[i][j + 1]) + u * ((1 - v) * d[i + 1][j] + v * d[i + 1][j + 1]);
}
const densAltFt = (s) => { // ISA density altitude; troposphere closed form, stratosphere exponential
  const s11 = 0.29707; if (s >= s11) return (1 - s ** (1 / 4.2559)) * 288.15 / 0.0065 / FT;
  return (11000 + Math.log(s11 / s) * 287.05287 * 216.65 / 9.80665) / FT; };
const out = {};
for (const [name, bpr, band] of [['CFM56-7B27 (BPR 5.1)', 5.1, '3-6'], ['CFM56-5B4 (BPR 5.7)', 5.7, '3-6'], ['LEAP-1A26 (BPR 11.1)', 11.1, '8'], ['PW1127G (BPR ~12, unverified)', 12.0, '8']]) {
  const rows = [];
  for (const [hft, Ms] of [[0, [0, 0.1, 0.2, 0.3, 0.4]], [5000, [0.3, 0.4]], [10000, [0.4, 0.5]], [20000, [0.6]], [35000, [0.78]]]) {
    const A = amb(hft);
    for (const m of Ms) rows.push({ hft, M: m, BY: +BY(m, A.d, bpr).toFixed(3), TOR_G1: hft === 0 ? +TOR(m, bpr).toFixed(3) : null, Howe: +howe(m, A.s, bpr, band, hft * FT).toFixed(3), JSB_CFM56: +jsb(m, densAltFt(A.s)).toFixed(3), sigma07: +(A.s ** 0.7).toFixed(3), PS_M04: (hft === 0 && m === 0.4) ? +PS04(bpr).toFixed(3) : null });
  }
  out[name] = { G0: +G0fit(bpr).toFixed(3), rows };
}
// sensitivity of BY to G at SL M=0.2 for BPR 5.1 / 11.1
out.G_sens = [5.1, 11.1].map(b => ({ bpr: b, G_fit: +G0fit(b).toFixed(3), BY_M02_Gfit: +BY(0.2, 1, b).toFixed(3), BY_M02_G09: +BY(0.2, 1, b, 0.9).toFixed(3), BY_M02_G11: +BY(0.2, 1, b, 1.1).toFixed(3) }));
// hot day at VTBD: elevation ~ 3 m; ISA+20 -> d, s
const hot = amb(10 / 3.28084 * 0 + 0, 20); out.VTBD_ISA20 = { delta: +hot.d.toFixed(4), sigma: +hot.s.toFixed(4) };
// Kt at 140 kt TAS SL for touchdown/rotation: M
out.M_at = [120, 140, 160].map(kt => ({ kt, M: +(kt * 0.514444 / amb(0).a).toFixed(3) }));
console.log(JSON.stringify(out, null, 1));
