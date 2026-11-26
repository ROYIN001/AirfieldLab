// d_turning.mjs — round 3 topic 3.5 (prefix D): geometric turning radii at a given (effective) nose-wheel steering angle.
// Planar no-slip geometry with the turn centre on the main-gear axle line (twin-strut aircraft, no body-gear steering):
//   d  = WB / tan(θe)                       lateral offset of turn centre from the fuselage centre line
//   R1 = d − T/2 (inner main gear centre), R2 = d + T/2 (outer main gear centre)
//   R3 = WB / sin(θe)                       nose gear
//   R4 = hypot(d + b/2, Δx_tip)             outer wing tip (Δx_tip = tip aft of MG, est)
//   R5 = hypot(d, L_nose)                   nose (L_nose = nose to MG)
//   R6 = hypot(d, L_tail)                   aft end of fuselage on the centre line (L_tail = MG to tail end)
// Effective angle: Airbus line-up document (D6); Boeing min turning radii use max steering − 3° tyre slip (D2, ACAPS TOC).
// All radii are ESTIMATES (est) unless they match published airport-planning tables, which could not be read as text.
const D2R = Math.PI / 180, f = (x, n = 2) => x.toFixed(n);
const T = {
  b737_800W: { WB: 15.60, T: 5.72, b: 35.79, th: [78, 75], Ln: 19.69, Lt: 39.47 - 19.69, dxTip: 5.0 },
  a320ceo: { WB: 12.64, T: 7.60, b: 35.80, th: [75, 71.8], Ln: 17.71, Lt: 37.57 - 17.71, dxTip: 3.65 },
  a321ceo_69: { WB: 16.90, T: 7.60, b: 35.80, th: [75, 69.2], Ln: 21.98, Lt: 44.51 - 21.98, dxTip: 3.65 },
  a321ceo_73: { WB: 16.90, T: 7.60, b: 35.80, th: [75, 73.1], Ln: 21.98, Lt: 44.51 - 21.98, dxTip: 3.65 },
  a330_300_full: { WB: 25.40, T: 10.70, b: 60.30, th: [72, 67.8], Ln: 32.8, Lt: 63.66 - 32.8, dxTip: 10.0 },
  a330_300_reduced: { WB: 25.40, T: 10.70, b: 60.30, th: [65, 62.1], Ln: 32.8, Lt: 63.66 - 32.8, dxTip: 10.0 },
  atr72_600_est: { WB: 10.77, T: 4.10, b: 27.05, th: [60, 57], Ln: 13.7, Lt: 27.17 - 13.7, dxTip: 0.0 },
};
export function radii(g, thDeg) {
  const t = thDeg * D2R, d = g.WB / Math.tan(t);
  return { d, R1: d - g.T / 2, R2: d + g.T / 2, R3: g.WB / Math.sin(t), R4: Math.hypot(d + g.b / 2, g.dxTip), R5: Math.hypot(d, g.Ln), R6: Math.hypot(d, g.Lt) };
}
console.log('type              θ(deg)  d      R1     R2     R3     R4     R5     R6   (m)');
for (const [n, g] of Object.entries(T)) for (const th of g.th) {
  const r = radii(g, th);
  console.log(`${n.padEnd(17)} ${String(th).padEnd(6)} ${[r.d, r.R1, r.R2, r.R3, r.R4, r.R5, r.R6].map((x) => f(x).padStart(6)).join(' ')}`);
}
// unit checks used as tests
const chk = radii({ WB: 10, T: 4, b: 20, Ln: 12, Lt: 15, dxTip: 0 }, 45);
console.log('check WB10 θ45: d', f(chk.d, 4), 'R3', f(chk.R3, 4), 'R4', f(chk.R4, 4), 'R5', f(chk.R5, 4));
// 180° turn on the runway about a fixed centre: the outer main gear sweeps from +R2 to −R2 and the nose gear reaches
// −R3 half-way, so the gear paths span W180 = R2 + max(R2, R3) laterally (tyre half-width and edge clearance not included).
console.log('W180 = R2 + max(R2,R3) at the effective angle (m), compared with VTBD widths 45 m (03R/21L) and 60 m (03L/21R):');
for (const [n, g] of Object.entries(T)) {
  const r = radii(g, g.th[1]), w = r.R2 + Math.max(r.R2, r.R3);
  console.log(`  ${n.padEnd(17)} θe ${g.th[1]}°  W180 ${f(w)}  margin/side 45 m ${f((45 - w) / 2)}  60 m ${f((60 - w) / 2)}`);
}
