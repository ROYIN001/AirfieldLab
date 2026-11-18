// U10: collected expected values for the T-U test table (formula-level), recomputed in one place.
import { M } from 'test/harness.mjs';
const { AC, KT, DEG, RAD, atmosphere } = M;
const out = {};
// T-U-01
{ const St = 3.645, lt = 5.10, at = 3.67, eta = 0.9, deda = 0.43; const VH = St * lt / (AC.S * AC.c);
  const CLad = 2 * eta * at * VH * deda; out.T01 = { VH: +VH.toFixed(4), CLadot: +CLad.toFixed(3), Cmadot: +(-CLad * lt / AC.c).toFixed(3), CLq_tail: +(2 * eta * at * VH).toFixed(3), Cmq_tail: +(-2 * eta * at * VH * lt / AC.c).toFixed(3) }; }
// T-U-04 short period approximation at 95 kt IAS, ISA+16 (31 C at field)
{ const rho = atmosphere(3, 16).rho, u0 = 95 * KT / Math.sqrt(rho / 1.225), q = 0.5 * rho * u0 * u0, k = q * AC.S * AC.c / AC.Iyy, c2u = AC.c / (2 * u0);
  const f = (Cmad) => { const Ma = k * AC.Cma, Mq = k * AC.Cmq * c2u, Mad = k * Cmad * c2u, Za = -q * AC.S * (AC.CLa + 0.10) / AC.m; const wn = Math.sqrt(Za * Mq / u0 - Ma); return { wn: +wn.toFixed(3), zeta: +(-(Mq + Mad + Za / u0) / (2 * wn)).toFixed(3) }; };
  out.T04 = { u0: +u0.toFixed(2), Cmadot0: f(0), Cmadot_m4_5: f(-4.5), Cmadot_m6_06: f(-6.058) }; }
// T-U-05/06 Phillips & Hunsaker eq. (10), (11)
{ const A = AC.b * AC.b / AC.S; const kDi = (x) => 1 - Math.exp(-4.74 * x ** 0.814) - x * x * Math.exp(-3.88 * x ** 0.758);
  const kL = (x) => 1 + 288 * x ** 0.787 * Math.exp(-9.14 * x ** 0.327) / A ** 0.882;
  const mc = (x) => { const g = (16 * x) ** 2; return g / (1 + g); }, mcCorr = (x) => { const g = (16 * x / Math.PI) ** 2; return g / (1 + g); };
  const hoerner = (x) => 33 * x ** 1.5 / (1 + 33 * x ** 1.5), katzoff = (x) => 1 - Math.exp(-2.48 * (2 * x) ** 0.768);
  out.T05_06 = [0.05, 0.1, 0.2, 0.25, 0.5, 1.0].map(x => ({ hb: x, kDi_PH: +kDi(x).toFixed(3), kDi_Hoerner: +hoerner(x).toFixed(3), kDi_TR738: +katzoff(x).toFixed(3), kDi_McCormick16_current: +mc(x).toFixed(3), kDi_McCormick_pi: +mcCorr(x).toFixed(3), kL_PH: +kL(x).toFixed(3), currentCLaFactor: +(1 + 0.12 * (1 - mc(x))).toFixed(3) }));
  // Katzoff simplified: d alpha at CL 1.21, A, 2d/b = 0.2
  const sigma = Math.exp(-2.48 * 0.2 ** 0.768); out.T07_katzoff = { sigma: +sigma.toFixed(3), dAlpha_deg: +(-57.3 * 1.21 / (Math.PI * A) * sigma).toFixed(2) };
  // PH beta_D / beta_L sanity (statements in the paper)
  out.PH_checks = { betaD_AR9_5_CL1_2_hb0_1: +(1 + 0.0361 * 1.2 ** 1.21 / (9.5 ** 1.19 * 0.1 ** 1.51)).toFixed(4), betaL_AR6_9_CL1_2_hb0_1: +(1 + 0.269 * 1.2 ** 1.45 / (6.9 ** 3.18 * 0.1 ** 1.12)).toFixed(4),
    ratio_McCormick16_to_Hoerner_at0_1: +(mc(0.1) / hoerner(0.1)).toFixed(3), ratio_McCormickPi_to_Hoerner_at0_1: +(mcCorr(0.1) / hoerner(0.1)).toFixed(3) };
}
// T-U-13 static elevator / rudder moments
{ const qH = 750, qV = 655; out.T13 = { elevatorFullUp_Nm: Math.round(qH * AC.S * AC.c * Math.abs(AC.Cmde) * AC.deUp), rudderFull_Nm: Math.round(qV * AC.S * AC.b * Math.abs(AC.Cndr) * AC.drMax) }; }
// T-U-14 swirl roll recovery and net roll
{ const Q = 700e3 / (2000 * 2 * Math.PI / 60); out.T14 = { Q_Nm: Math.round(Q), wingRecovery_Nm_rsw0_4: Math.round(0.4 * Q), netRoll_Nm: Math.round(-0.6 * Q) }; }
console.log(JSON.stringify(out, null, 1));
