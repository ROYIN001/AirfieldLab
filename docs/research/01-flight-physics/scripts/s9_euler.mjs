// Euler extraction near θ = ±90°: current qToEuler vs a robust version; round-trip error measured on the rotation matrix.
import { M } from './s9_harness.mjs';
const { qToR, qToEuler, eulerToQ, DEG, RAD } = M;
function qToEulerRobust(q) { // ZYX (ψ, θ, φ) from R (body→NED), θ via atan2 to keep precision near ±90°
  const R = qToR(q, new Array(9));
  const s = -R[6], c = Math.hypot(R[0], R[3]);
  const th = Math.atan2(s, c);
  if (c < 1e-9) { const psi = Math.atan2(-R[1], R[4]); return [0, th, psi]; } // gimbal lock: put all yaw/roll in ψ, φ = 0
  return [Math.atan2(R[7], R[8]), th, Math.atan2(R[3], R[0])];
}
const Rerr = (q, e) => { const A = qToR(q, new Array(9)), B = qToR(eulerToQ(...e), new Array(9)); return Math.max(...A.map((v, i) => Math.abs(v - B[i]))); };
const rows = [];
for (const thDeg of [45, 89, 89.9, 89.99, 89.9999, 90, 90 - 1e-7, -90, 90.01]) {
  const q = eulerToQ(30 * DEG, thDeg * DEG, 120 * DEG);
  const e1 = qToEuler(q), e2 = qToEulerRobust(q);
  rows.push({ thDeg, 'cur φ,θ,ψ (deg)': e1.map((v) => (v * RAD).toFixed(5)).join(', '), 'cur R err': Rerr(q, e1).toExponential(1), 'robust φ,θ,ψ': e2.map((v) => (v * RAD).toFixed(5)).join(', '), 'robust R err': Rerr(q, e2).toExponential(1) });
}
console.table(rows);
// precision of asin near 1: θ from asin(-R6) vs atan2 for θ = 90° - 1e-6 rad
const th = Math.PI / 2 - 1e-6; const q = eulerToQ(0, th, 0); const R = qToR(q, new Array(9));
console.log('θ true 90°-1e-6 rad; asin error (rad):', (-Math.asin(R[6]) - th).toExponential(2), ' atan2 error:', (Math.atan2(-R[6], Math.hypot(R[0], R[3])) - th).toExponential(2));
// wrapPi check
console.log('wrapPi(3π) =', M.wrapPi(3 * Math.PI).toFixed(6), ' wrapPi(-π) =', M.wrapPi(-Math.PI).toFixed(6), ' wrapPi(π) =', M.wrapPi(Math.PI).toFixed(6), ' wrapPi(1e9) finite:', Number.isFinite(M.wrapPi(1e9)));
