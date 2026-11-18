// U9: expected values for propeller normal force (Ribner fin-analogy scaling), blown-wing lift and swirl roll. ค่าประมาณ.
import { M } from 'test/harness.mjs';
const { AC, KT, DEG, RAD, atmosphere } = M;
const D = 2.44, R = D / 2, A = Math.PI * R * R, Om = 2000 * 2 * Math.PI / 60, rho = atmosphere(3, 16).rho;
const thrustAvail = (V) => { const Vc = AC.eta * AC.P / AC.T0; return AC.T0 * Vc / Math.sqrt(V * V + Vc * Vc); };
const P = { xp: 3.94, CNa0: 0.17, deu: 0.07, Sfus: 1.0, cRoot: 2.2, kbw: 0.6, rsw: 0.4 };
function cond(kt, thr) {
  const V = kt * KT, T = thr * thrustAvail(V), q = 0.5 * rho * V * V;
  const vi = 0.5 * (-V + Math.sqrt(V * V + 2 * T / (rho * A))), a = vi / V;
  const f = (1 + a) ** 2;                                  // Ribner (NACA TR 820): local q ~ disc dynamic pressure
  const k = (P.xp / AC.c) * (A / AC.S) * (1 + P.deu);
  const dCma_total = k * P.CNa0 * f, dCma_power = k * P.CNa0 * (f - 1);
  const dCnb_total = -(P.xp / AC.b) * (A / AC.S) * P.CNa0 * f, dCnb_power = -(P.xp / AC.b) * (A / AC.S) * P.CNa0 * (f - 1);
  // normal force at alpha_body = 5 deg
  const Np5 = q * f * A * P.CNa0 * 5 * DEG * (1 + P.deu);
  // blown wing: velocity at the wing (x/R = 2.8 behind the disc) ~ V + vi*(1 + x/sqrt(x^2+R^2))
  const xw = 3.39, Vw = V + vi * (1 + xw / Math.hypot(xw, R)), Rw = R * Math.sqrt((V + vi) / (V + 2 * vi));
  const Simm = Math.max(0, 2 * Rw - P.Sfus) * P.cRoot;
  const dCL_per_CL = P.kbw * (Simm / AC.S) * ((Vw / V) ** 2 - 1);
  const Q = thr * AC.P / Om;
  return { kt, thr, T: Math.round(T), a: +a.toFixed(3), f_Ribner: +f.toFixed(3), CNa_eff: +(P.CNa0 * f).toFixed(3), Np_at5deg_N: Math.round(Np5),
    dCma_prop_total: +dCma_total.toFixed(3), dCma_prop_powerPart: +dCma_power.toFixed(3), dCnb_prop_total: +dCnb_total.toFixed(4), dCnb_prop_powerPart: +dCnb_power.toFixed(4),
    staticMarginShift_pctMAC_total: +(100 * dCma_total / AC.CLa).toFixed(1), Vwing_over_V: +(Vw / V).toFixed(3), S_immersed_m2: +Simm.toFixed(2), dCL_blown_per_unit_CL: +dCL_per_CL.toFixed(3),
    torque_Nm: Math.round(Q), netRoll_Nm: Math.round(-Q * (1 - P.rsw)) };
}
for (const [kt, thr] of [[40, 1], [70, 1], [80, 1], [95, 0.26], [140, 1], [200, 1]]) console.log(JSON.stringify(cond(kt, thr)));
// aileron needed to hold net propeller roll at 80 kt full power (current Clda, daMax)
{ const V = 80 * KT, q = 0.5 * rho * V * V, Lmax = q * AC.S * AC.b * AC.Clda * AC.daMax; const c = cond(80, 1);
  console.log(JSON.stringify({ at80kt: { aileronMoment_full_Nm: Math.round(Lmax), netRoll_Nm: c.netRoll_Nm, fraction: +(Math.abs(c.netRoll_Nm) / Lmax).toFixed(2) } })); }
