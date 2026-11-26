// j_lib.mjs — shared helpers for topic 3.6 (jet engines). Pure JS, no deps. Node >= 18.
// ISA troposphere (USSA-1976 below 11 km, same constants as AirfieldLab 10-atmo.js), Bartel & Young (2008)
// take-off lapse as written in OpenAP thrust.py (LGPL-3.0; equations re-typed, not copied code),
// flat-rating correction, and the engine database chosen in 06-jet-engines.md.
export const LBF = 4.4482216152605, KT = 0.514444, FT = 0.3048, G0 = 9.80665;
export function isa(h, dT = 0) {           // h geopotential m (<11 km), dT ISA deviation K
  const T0 = 288.15, p0 = 101325, L = 0.0065, R = 287.05287;
  const Ts = T0 - L * h, p = p0 * Math.pow(Ts / T0, G0 / (R * L)), T = Ts + dT;
  return { T, p, rho: p / (R * T), a: Math.sqrt(1.4 * R * T), delta: p / p0, theta: T / T0 };
}
export function lapseBY(M, d, bpr) {      // F/F00, Bartel & Young 2008 eq. 11-14, d = p/p0
  const G0f = 0.0606 * bpr + 0.6337;
  const A = -0.4327 * d * d + 1.3855 * d + 0.0472;
  const Z = 0.9106 * d ** 3 - 1.7736 * d * d + 1.8697 * d;
  const X = 0.1377 * d ** 3 - 0.4374 * d * d + 1.3003 * d;
  return A - 0.377 * (1 + bpr) / Math.sqrt((1 + 0.82 * bpr) * G0f) * Z * M + (0.23 + 0.19 * Math.sqrt(bpr)) * X * M * M;
}
// Flat rating: Theta = 1 - kT*max(0, OAT - Tflat) (+ optional hot-day bump, Trent 772B-60 Note VI.12)
export function flatTheta(E, oatC) {
  const over = Math.max(0, oatC - E.TflatC);
  const bump = E.bumpMax ? Math.min(E.bumpMax, E.kT * over) : 0;  // 772B: extra thrust above ISA+15, max 5.4 %
  return Math.min(1, 1 - E.kT * over + bump);
}
export function ratedThrust(E, amb, M) { return E.F00 * lapseBY(Math.min(M, 0.45), amb.delta, E.bpr) * flatTheta(E, amb.T - 273.15); }
// Engine DB (values and sources: see หัวข้อ 3.6 tables). F00 in N, TflatC in degC.
export const ENG = {
  CFM56_7B24_class: { F00: 107650, MCT: 101420, bpr: 5.3, opr: 25.6, TflatC: 30, kT: 0.0065, ff: [1.086, 0.895, 0.308, 0.103] },
  CFM56_7B26_class: { F00: 116990, MCT: 115210, bpr: 5.1, opr: 27.7, TflatC: 30, kT: 0.0065, ff: [1.213, 0.986, 0.331, 0.108] },
  CFM56_7B27_class: { F00: 121430, MCT: 115210, bpr: 5.1, opr: 29.0, TflatC: 30, kT: 0.0065, ff: [1.293, 1.031, 0.343, 0.110] },
  CFM56_5B6_class:  { F00: 104530, MCT: 90080,  bpr: 5.9, opr: 24.3, TflatC: 45, kT: 0.0065, ff: [0.965, 0.800, 0.279, 0.095] },
  CFM56_5B4_class:  { F00: 120100, MCT: 108400, bpr: 5.7, opr: 27.3, TflatC: 45, kT: 0.0065, ff: [1.142, 0.939, 0.316, 0.102] },
  CFM56_5B3_class:  { F00: 142340, MCT: 129400, bpr: 5.4, opr: 32.6, TflatC: 30, kT: 0.0065, ff: [1.462, 1.153, 0.369, 0.113] },
  LEAP_1A26_class:  { F00: 120640, MCT: 118680, bpr: 11.1, opr: 33.3, TflatC: 44, kT: 0.0065, ff: [0.861, 0.710, 0.244, 0.091] },
  LEAP_1A32_class:  { F00: 143050, MCT: 140960, bpr: 10.5, opr: 38.5, TflatC: 30, kT: 0.0065, ff: [1.062, 0.869, 0.284, 0.098] },
  TRENT_772B_class: { F00: 316300, MCT: 282700, bpr: 5.0, opr: 36.3, TflatC: 30, kT: 0.0065, bumpMax: 0.054, ff: [3.139, 2.530, 0.821, 0.270], F00bare: 320300 },
};
// EEDB LTO thrust points (fraction of rated output): idle 7 %, approach 30 %, climb-out 85 %, take-off 100 %
export const LTO_X = [0.07, 0.30, 0.85, 1.00];
export function ffInterp(E, x) {           // piecewise-linear fuel flow (kg/s) vs thrust fraction, SLS
  const xs = LTO_X, ys = [E.ff[3], E.ff[2], E.ff[1], E.ff[0]];
  if (x <= xs[0]) return ys[0] * Math.max(0.5, x / xs[0]) ** 0.5;   // below 7 %: weak sqrt taper (est)
  for (let i = 1; i < 4; i++) if (x <= xs[i]) return ys[i - 1] + (ys[i] - ys[i - 1]) * (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
  return ys[3] * x;
}
export function fmt(x, n = 3) { return Number(x).toFixed(n); }
