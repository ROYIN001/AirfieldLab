// Section 7: misc derived values (spin-up, brake energy, turnover, steering radius). Run: node g7_misc.mjs
import { mu109max, KT } from './g7_ground.mjs';
const g = 9.80665, m = 2250, W = m * g, Iyy = 7300, hcg = 1.30, wb = 2.65, track = 3.10;
// wheel spin-up at touchdown (main 6.50-8): I_w estimate 0.33 kg m2, rolling radius 0.235 m, mu 0.6, N ~ 0.6 W per two mains during first 50 ms
const Iw = 0.33, r = 0.235, V = 85 * KT, mu = 0.6, N1 = 0.6 * W / 2;
const tSpin = Iw * (V / r) / (mu * N1 * r), J = 2 * Iw * V / (r * r);
console.log(`spin-up: omega ${(V / r).toFixed(0)} rad/s, t_spin ${(tSpin * 1000).toFixed(0)} ms, drag impulse both mains ${J.toFixed(0)} N s, dV ${(J / m).toFixed(3)} m/s, pitch-rate kick ${(-J * 1.50 / Iyy * 57.2958).toFixed(2)} deg/s (arm 1.50 m below CG at touchdown)`);
// brake energy, dry stop 80 kt with braking fraction from point model (approx: share of decel from brakes)
const KE = 0.5 * m * (80 * KT) ** 2;
console.log(`KE 80 kt ${(KE / 1e6).toFixed(2)} MJ; if ~85% goes to brakes -> ${(0.85 * KE / 2 / 1e3).toFixed(0)} kJ per brake; steel heat sink 3 kg, c=490 J/kgK -> dT ${(0.85 * KE / 2 / (3 * 490)).toFixed(0)} K (adiabatic)`);
// turnover: static lateral acceleration limit (rigid, CG height / half track), with nose-main geometry angle
const xm = 0.35, half = track / 2; // CG 0.35 m ahead of main axle line, nose 2.30 ahead of CG
// distance from CG ground projection to the line joining nose wheel and one main wheel
const A = [2.30, 0], B = [-0.35, half]; const dx = B[0] - A[0], dy = B[1] - A[1];
const dist = Math.abs(dx * (A[1] - 0) - (A[0] - 0) * dy) / Math.hypot(dx, dy);
console.log(`turnover: distance CG to nose-main line ${dist.toFixed(3)} m -> static rollover a_y/g = ${(dist / hcg).toFixed(2)}; turnover angle ${(Math.atan(hcg / dist) * 57.2958).toFixed(1)} deg (<= 63 deg guideline, unverified)`);
for (const d of [10, 12, 15, 35]) console.log(`  steer ${d} deg -> kinematic radius about main-axle midpoint ${(wb / Math.tan(d / 57.2958)).toFixed(1)} m`);
console.log(`wet mu at 60 psi 25.109(c): 0 kt ${mu109max(0, 60).toFixed(3)}, 30 kt ${mu109max(30, 60).toFixed(3)}, 59 kt ${mu109max(59, 60).toFixed(3)}, 85 kt ${mu109max(85, 60).toFixed(3)}`);
