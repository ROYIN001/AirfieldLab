// U4: quasi-steady blade-element estimate of the propeller normal force (in-plane force) at small inflow angle,
// 4-blade 2.44 m prop, 2000 rpm, clockwise from behind (rotation +x in FRD). Uniform momentum inflow. ค่าประมาณ.
// Blade planform from src/70-aircraft.js (chord 0.20 m root -> 0.11 m tip), scaled to R = 1.22 m.
import { M } from 'test/harness.mjs';
const { AC, KT, DEG, RAD, atmosphere } = M;
const B = 4, R = 1.22, rh = 0.27, Om = 2000 * 2 * Math.PI / 60, A = Math.PI * R * R;
const rho = atmosphere(3, 16).rho;
const chord = (r) => 0.20 + (0.11 - 0.20) * (r - rh) / (R - rh);
const cl = (a) => { const s = 0.9 * 2 * Math.PI * (a + 2 * DEG); return Math.max(-1.3, Math.min(1.3, s)); };
const cd = (a) => 0.012 + 0.6 * a * a;
const thrustAvail = (V) => { const Vc = AC.eta * AC.P / AC.T0; return AC.T0 * Vc / Math.sqrt(V * V + Vc * Vc); };
const NR = 40, NP = 72;
// blade angle: beta(r) = beta75 + twist(r), twist from constant geometric pitch relative to 0.75R
const beta = (r, b75) => b75 + Math.atan(Math.tan(b75) * 0.75 * R / r) - b75 * 0 - Math.atan(Math.tan(b75));
function rotor(V, aP, b75) { // returns thrust, torque, in-plane force (body y,z), thrust-centre moments
  let T = 0, Q = 0, Fy = 0, Fz = 0, My = 0, Mz = 0, vi = 5;
  for (let it = 0; it < 30; it++) {
    T = 0; Q = 0; Fy = 0; Fz = 0; My = 0; Mz = 0;
    const Va = V * Math.cos(aP) + vi, Vc = V * Math.sin(aP); // crossflow: air moves toward -z (up) for aP>0
    for (let i = 0; i < NR; i++) {
      const r = rh + (R - rh) * (i + 0.5) / NR, dr = (R - rh) / NR, c = chord(r);
      for (let k = 0; k < NP; k++) {
        const ps = 2 * Math.PI * (k + 0.5) / NP; // blade position e_r=(0,cos,sin); tangential e_t=(0,-sin,cos) (rotation +x)
        const Ut = Om * r + Vc * Math.cos(ps); // air moving -z meets blade moving +z at ps=0 (right side, descending blade)
        const phi = Math.atan2(Va, Ut), a = beta(r, b75) - phi, W2 = Va * Va + Ut * Ut;
        const dL = 0.5 * rho * W2 * c * cl(a) * dr, dD = 0.5 * rho * W2 * c * cd(a) * dr;
        const dT = (dL * Math.cos(phi) - dD * Math.sin(phi)) * B / NP, dFt = (dL * Math.sin(phi) + dD * Math.cos(phi)) * B / NP;
        T += dT; Q += dFt * r;
        // in-plane force on the prop opposes blade motion: along -e_t
        Fy += dFt * Math.sin(ps); Fz += -dFt * Math.cos(ps);
        // thrust (+x) acting at (y,z)=(r cos, r sin): moments about the hub: My = z*Fx... M = r x F
        const y = r * Math.cos(ps), z = r * Math.sin(ps);
        My += z * dT * 1;   // pitching moment component: (r x F)_y = z*Fx - x*Fz -> z*dT
        Mz += -y * dT;      // yawing moment: (r x F)_z = x*Fy - y*Fx -> -y*dT
      }
    }
    const viNew = 0.5 * (-V * Math.cos(aP) + Math.sqrt((V * Math.cos(aP)) ** 2 + 2 * Math.max(T, 0) / (rho * A)));
    vi += 0.5 * (viNew - vi);
  }
  return { T, Q, Fy, Fz, My, Mz, P: Q * Om, vi };
}
function trimBeta(V, Treq) { let lo = 5 * DEG, hi = 70 * DEG; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (rotor(V, 0, m).T < Treq) lo = m; else hi = m; } return (lo + hi) / 2; }
const out = [];
for (const [kt, thr] of [[60, 1], [80, 1], [95, 0.26], [95, 0.6], [140, 1], [200, 1]]) {
  const V = kt * KT, Treq = thr * thrustAvail(V), b75 = trimBeta(V, Treq);
  const r0 = rotor(V, 0, b75), da = 2 * DEG, r1 = rotor(V, da, b75);
  const q = 0.5 * rho * V * V;
  const CNa = (-(r1.Fz - r0.Fz)) / (q * A * da);              // normal force (up, -z) per rad, based on q*A
  const dMz = (r1.Mz - r0.Mz) / da;                           // yaw moment from thrust-centre offset per rad
  out.push({ kt, thr, T: Math.round(r0.T), P_kW: +(r0.P / 1000).toFixed(0), beta75_deg: +(b75 * RAD).toFixed(1), J: +(V / (Om / (2 * Math.PI) * 2 * R)).toFixed(2),
    Tc_qA: +(r0.T / (q * A)).toFixed(2), CN_alpha_per_rad: +CNa.toFixed(3), dN_dalpha_N_per_rad: Math.round(-(r1.Fz - r0.Fz) / da),
    yaw_moment_from_thrust_offset_Nm_per_rad: Math.round(dMz), side_force_Fy_at_alpha_N_per_rad: Math.round((r1.Fy - r0.Fy) / da) });
}
console.log('solidity at 0.75R', (B * chord(0.75 * R) / (Math.PI * R)).toFixed(3));
for (const o of out) console.log(JSON.stringify(o));
// Pitching-moment contribution about the CG: dCm/dalpha = (x_p/c) * (A/S) * CN_alpha * (1 + d eps_u/d alpha)
const xp = 3.94, deu = 0.07;
for (const o of out) console.log(o.kt, o.thr, 'dCm/dalpha_prop =', ((xp / AC.c) * (Math.PI * R * R / AC.S) * o.CN_alpha_per_rad * (1 + deu)).toFixed(3), 'vs AC.Cma', AC.Cma);
