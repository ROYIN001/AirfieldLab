// Section 5: (1) engine-out Vmc closed form with JSBSim 737 illustrative numbers; (2) cruise-thrust check vs OpenAP engines.csv
import { M } from 'test/harness.mjs';
const { atmosphere, FT } = M;
const BY = (Mach, dP, bpr) => { const G = 0.0606 * bpr + 0.6337; const A = -0.4327 * dP * dP + 1.3855 * dP + 0.0472, Z = 0.9106 * dP ** 3 - 1.7736 * dP * dP + 1.8697 * dP, X = 0.1377 * dP ** 3 - 0.4374 * dP * dP + 1.3003 * dP;
  return A - 0.377 * (1 + bpr) / Math.sqrt((1 + 0.82 * bpr) * G) * Z * Mach + (0.23 + 0.19 * Math.sqrt(bpr)) * X * Mach * Mach; };
const howe = (Mach, sig, bpr, hm) => { const k = Mach <= 0.4 ? [1, 0, -0.6, -0.04] : [0.88, -0.016, -0.3, 0]; return (k[0] + k[1] * bpr + (k[2] + k[3] * bpr) * Mach) * sig ** (hm > 11000 ? 1 : 0.7); };
const out = {};
// (1) Vmc: rudder yaw moment capacity = asymmetric thrust moment (beta=0, bank ~0, windmill drag neglected)
//     0.5 rho V^2 S b |Cn_dr| dr_max = F(V) * y_e   -> iterate because F depends on Mach
const J = { S: 1171 * 0.09290304, b: 94.7 * 0.3048, Cndr: 0.20, drmax: 0.35, ye: 193 * 0.0254, F0: 20000 * 4.4482216, bpr: 5.9 };
const rho = 1.225, a0 = 340.29; let V = 50;
for (let i = 0; i < 50; i++) { const F = J.F0 * BY(V / a0, 1, J.bpr); V = Math.sqrt(2 * F * J.ye / (rho * J.S * J.b * J.Cndr * J.drmax)); }
out.vmc_JSBSim737 = { V_ms: +V.toFixed(2), V_kt: +(V / 0.514444).toFixed(1), F_at_Vmc_kN: +(J.F0 * BY(V / a0, 1, J.bpr) / 1000).toFixed(1), yawMoment_kNm: +(J.F0 * BY(V / a0, 1, J.bpr) * J.ye / 1000).toFixed(0), inputs: J };
// with windmilling drag of dead engine ~ +10% of moment (assumption) and 0.85 rudder effectiveness factor
{ let V2 = 50; for (let i = 0; i < 50; i++) { const F = J.F0 * BY(V2 / a0, 1, J.bpr) * 1.10; V2 = Math.sqrt(2 * F * J.ye / (rho * J.S * J.b * J.Cndr * 0.85 * J.drmax)); } out.vmc_JSBSim737_conservative_kt = +(V2 / 0.514444).toFixed(1); }
// sensitivity: dV/V = 0.5 dF/F
// (2) cruise thrust check: OpenAP engines.csv cruise_thrust/max_thrust at M0.8 FL350
const atm = atmosphere(35000 * FT); const dP = atm.p / 101325, sig = atm.rho / 1.225;
out.cruiseCheck = [['CFM56-7B26', 5.1, 24376 / 116990], ['CFM56-5B4', 5.9, 22241 / 117900]].map(([n, b, r]) => ({ engine: n, OpenAP_ratio: +r.toFixed(3), BY_takeoffEq: +BY(0.8, dP, b).toFixed(3), Howe: +howe(0.8, sig, b, 35000 * FT).toFixed(3) }));
console.log(JSON.stringify(out, null, 1));
