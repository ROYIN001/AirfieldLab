// k_flare.mjs — approach/flare/touchdown kinematics for topic 3.10 (prefix K). Node >= 18.
// Exponential flare law (same family as Boeing patent law in topic 9 [O]): hdot = -K (h + hB)
//   K = (s0 - std)/hF , hB = std/K , t_flare = ln((hF+hB)/hB)/K , s0 = V sin(gamma)
// Wheel path: wheels are H below the GS antenna (Boeing VLA data / Airbus visual-aids data, topic 5 [D3][D4]),
//   so the wheel path meets the ground at x_w = (RDH - H)/tan(gamma) from the threshold.
const KT = 0.514444, FT = 0.3048, D = Math.PI / 180;
const g3 = 3 * D;
const r = (x, n = 1) => Math.round(x * 10 ** n) / 10 ** n;
export function flare({ Vkt, hFft, stdFps, dVkt = 5, rdhFt = 54, Hft, gamma = g3 }) {
  const V = Vkt * KT, s0 = V * Math.sin(gamma), hF = hFft * FT, std = stdFps * FT;
  const K = (s0 - std) / hF, hB = std / K, tF = Math.log((hF + hB) / hB) / K;
  const xw = ((rdhFt - Hft) * FT) / Math.tan(gamma);      // wheel-path ground intercept
  const xf = xw - hF / Math.tan(gamma);                     // flare start position
  const Vavg = (Vkt - dVkt / 2) * KT;                        // linear speed decay in flare
  const xtd = xf + Vavg * tF;
  return { s0fpm: s0 / FT * 60, K, hBft: hB / FT, tF, xw, xf, xtd, xtdFt: xtd / FT, Vtd: Vkt - dVkt };
}
const cases = [
  ['737-800 60 t F30 Vref+5', { Vkt: 142.05, hFft: 20, stdFps: 2.5, dVkt: 5, Hft: 14.2 }],
  ['737-800 60 t F30 Vref+5, flare 30 ft', { Vkt: 142.05, hFft: 30, stdFps: 2.5, dVkt: 5, Hft: 14.2 }],
  ['A320ceo 64.5 t FULL VAPP', { Vkt: 133.5, hFft: 30, stdFps: 2.5, dVkt: 8, Hft: 16.0 }],
  ['A321neo 79.2 t FULL VAPP', { Vkt: 144.2, hFft: 30, stdFps: 2.5, dVkt: 8, Hft: 15.8 }],
  ['A321neo flare 20 ft (FCOM Bull. 22/2)', { Vkt: 144.2, hFft: 20, stdFps: 2.5, dVkt: 8, Hft: 15.8 }],
  ['A330-300 VAPP 140 kt (est)', { Vkt: 140, hFft: 40, stdFps: 2.5, dVkt: 8, Hft: 28.1 }],
  ['ATR 72-600 20.4 t VAPP 106', { Vkt: 106, hFft: 20, stdFps: 2.5, dVkt: 7.5, Hft: 6.5 }],
];
const lines = [];
for (const [n, c] of cases) {
  const f = flare(c);
  lines.push(`${n}: sink on 3deg ${r(f.s0fpm, 0)} fpm; K ${r(f.K, 3)} 1/s, hB ${r(f.hBft)} ft, flare ${r(f.tF, 2)} s; wheel aim ${r(f.xw, 0)} m, flare start ${r(f.xf, 0)} m, TD ${r(f.xtd, 0)} m (${r(f.xtdFt, 0)} ft) at ${r(f.Vtd, 1)} kt`);
}
// float sensitivity: each extra second of hold-off
lines.push(`float: +1 s at 140 kt adds ${r(140 * KT, 1)} m (${r(140 * KT / FT, 0)} ft)`);
// AC 91-79B checks (constant deceleration, ground roll ∝ V^2)
lines.push(`AC 91-79B: +10% speed -> ground roll x${r(1.1 ** 2, 3)} (+${r((1.1 ** 2 - 1) * 100, 0)} %)`);
lines.push(`AC 91-79B: +10 ft TCH -> +${r(10 / Math.tan(g3), 0)} ft air distance`);
lines.push(`AC 91-79B: 2 s delay at 118 kt -> +${r(2 * 118 * KT / FT, 0)} ft`);
lines.push(`AC 91-79B: 132 kt vs 120 kt over 3,000 ft -> ${r(3000 * (132 / 120) ** 2, 0)} ft (AC says 3,600)`);
// tailwind 10 kt on Vapp 140: ground-speed energy ratio
lines.push(`tailwind 10 kt at 140 kt: GS^2 ratio ${r(((150) / 140) ** 2, 3)} ; 21% in AC includes air distance`);
// DMK 21R: GP origin from RDH 54 ft
lines.push(`DMK 21R GP origin ${r(54 * FT / Math.tan(g3), 1)} m; 21L (53 ft) ${r(53 * FT / Math.tan(g3), 1)} m; 03L (55 ft) ${r(55 * FT / Math.tan(g3), 1)} m`);
// Required average deceleration to stop in remaining LDA after a long touchdown
for (const [lda, xtd, v] of [[3150, 500, 135], [3150, 1200, 135], [3500, 500, 135]]) {
  const rem = lda - xtd, a = (v * KT) ** 2 / (2 * rem);
  lines.push(`LDA ${lda} m, TD at ${xtd} m, ${v} kt GS: required mean decel ${r(a, 2)} m/s^2 (${r(a / 0.3048, 1)} ft/s^2)`);
}
console.log(lines.join('\n'));
