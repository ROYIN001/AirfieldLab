#!/usr/bin/env node
// lp_perf.mjs — LP (07-turboprop-trainers.md §07.4.4, completeness check 19 Nov 2026, gaps 6/7/16): physical climb and
// field-performance estimates for pc9m, pc7mk2, t6a, t6c that do NOT use the sim's thrust law. All results are ค่าประมาณ.
//   node scripts/lp_perf.mjs           → scripts/out/lp_perf.json (Node >= 18, no dependencies; < 1 s)
// Model:
//  • Constant-speed propeller from the round-1 BEM tables propeller.tables.CT/CP(J, β75) of the Hartzell HC-D4N/D9512
//    (params-trainer.json, round-1 topic 3): at each TAS the governor sets β75 so that CP(J, β) = P/(ρ n³ D⁵);
//    thrust T = CT ρ n² D⁴. The same nondimensional tables are used for the T-6 (E9612, 97 in) with its own D and P (est).
//  • Clean powered polar CD = CD0c + K CL², gear and flaps up. K from the T-6 glide polar (lp_cards d.t6a.polar, includes a
//    feathered prop, est). CD0c is fitted so that the max level speed of each type is reproduced with this thrust model
//    (PC-9 M 276 KTAS / 2,000 ft / 2,100 kg [LP12]; PC-7 MkII 242 KTAS / SL / 2,100 kg [LP9]; T-6A 270 KTAS / 1,000 ft /
//    6,000 lb [LB16]); masses at max speed are estimates.
//  • Climb at SL, ISA (or OAT 31/35 °C at VTBD elevation 9 ft): γ = asin((T − D)/W) with L = W cos γ; Vx = max γ,
//    Vy = max ROC; speeds as KEAS (= KCAS within 0.1 kt at SL). Flat-rated shaft power (PT6A-62 to 37 °C [R1:E1];
//    PT6A-25C 850 → 700 shp; PT6A-68 in the T-6 1,100 shp of 1,250 shp, est to 46 °C), lapse 1.35 %/°C above it.
//  • Vx: the max-γ speed of this model lies at or below 1.2 VS1 (governed prop thrust grows as speed falls), so the card's Vx is
//    max(Vx_model, 1.2 VS1) at the same mass: 1.2 VS1 is the lowest climb speed of 14 CFR 23.65(a)(4)/(b) [LP30] (est).
//  • Hot-day field factors (VTBD 9 ft, 31/35 °C): take-off distance ∝ W²/(ρ·T̄) with T̄ the BEM thrust at 0.7 V_LOF TAS
//    (V_LOF EAS fixed); landing distance ∝ V_TAS² ∝ 1/σ (same braking, no reverse).
import fs from 'node:fs';
import { R1, PUB, derive, KT, FT, LB, G0, HP } from './lp_cards.mjs';
import { rhoISA } from './lm_polar.mjs';

const RHO0 = 1.225, r = (x, n = 4) => (x == null || !Number.isFinite(+x) ? null : +(+x).toPrecision(n));
const tab = n => R1.propeller.tables[n].v;
const CT = tab('CT'), CP = tab('CP');
const Ja = CT.axes.J, Ba = CT.axes.beta75_deg;
function bilin(t, J, b) {      // bilinear in (J, β75); data[iJ][iβ]; clamped at the table edges
  const xs = t.axes.J, ys = t.axes.beta75_deg, idx = (a, x) => { let i = 0; while (i < a.length - 2 && x > a[i + 1]) i++; return i; };
  const ix = idx(xs, J), iy = idx(ys, b);
  const tx = Math.max(0, Math.min(1, (J - xs[ix]) / (xs[ix + 1] - xs[ix]))), ty = Math.max(0, Math.min(1, (b - ys[iy]) / (ys[iy + 1] - ys[iy])));
  const d = t.data;
  return (1 - tx) * (1 - ty) * d[ix][iy] + tx * (1 - ty) * d[ix + 1][iy] + (1 - tx) * ty * d[ix][iy + 1] + tx * ty * d[ix + 1][iy + 1];
}
/** governed thrust (N) of a constant-speed prop at TAS V (m/s), density rho, shaft power P (W), diameter D (m), rpm */
export function propThrust(V, rho, P, D, rpm) {
  const n = rpm / 60, J = Math.min(V / (n * D), Ja.at(-1)), cpReq = P / (rho * n ** 3 * D ** 5);
  let lo = Ba[0], hi = Ba.at(-1);
  if (bilin(CP, J, hi) < cpReq) lo = hi;
  else for (let k = 0; k < 50; k++) { const m = 0.5 * (lo + hi); if (bilin(CP, J, m) > cpReq) hi = m; else lo = m; }
  const beta = 0.5 * (lo + hi), ct = bilin(CT, J, beta);
  return { T: ct * rho * n * n * D ** 4, beta, J, eta: ct * rho * n * n * D ** 4 * V / P };
}

const d = derive();
const K = d.t6a.polar.K;
const T = PUB.t6a, P9 = PUB.pc9m;
// type data (P in W, D m, rpm, S m², MTOW kg, flat-rating °C, max-speed point for CD0c)
export const TYPES = {
  pc9m: { P: 708e3, D: P9.propD, rpm: 2000, S: P9.S, m: 2350, tflat: 37, vs1: { v: 77, m: 2350 }, vmax: { ktas: 276, h_ft: 2000, m: 2100, src: 'LP12' } },
  pc7mk2: { P: 522e3, D: P9.propD, rpm: 2040, S: 16.283, m: 2250, tflat: 45, vs1: { v: 75, m: 2250 }, vmax: { ktas: 242, h_ft: 0, m: 2100, src: 'LP9' } },
  t6a: { P: 1100 * HP, D: T.propD, rpm: 2000, S: T.S, m: T.MTOW, tflat: 46, vs1: { v: T.aopa.VS1, m: T.aopa.m_lb * LB }, vmax: { ktas: 270, h_ft: 1000, m: 6000 * LB, src: 'LB16' } },
  t6c: { P: 1100 * HP, D: T.propD, rpm: 2000, S: T.S, m: PUB.t6c.MTOW, tflat: 46, vs1: { v: T.aopa.VS1, m: T.aopa.m_lb * LB }, vmax: null },
};
const rhoAt = (oat = null, h_m = 0) => (oat == null ? rhoISA(h_m) : rhoISA(h_m, oat - (15 - 0.0065 * h_m)));
const Pflat = (ty, oat) => (oat == null || oat <= ty.tflat ? ty.P : ty.P * (1 - 0.0135 * (oat - ty.tflat)));

function fitCD0(ty) {
  const v = ty.vmax, rho = rhoISA(v.h_ft * FT), V = v.ktas * KT, q = 0.5 * rho * V * V, CL = v.m * G0 / (q * ty.S);
  const th = propThrust(V, rho, ty.P, ty.D, ty.rpm);
  return { CD0c: th.T / (q * ty.S) - K * CL * CL, eta_vmax: th.eta, beta: th.beta, J: th.J, CL };
}
/** climb sweep at mass m, density from OAT (null = ISA) at h, gear/flaps up */
export function climb(ty, CD0c, m, { oat = null, h_m = 0, v0 = 60, v1 = 220, P = null } = {}) {
  const rho = rhoAt(oat, h_m), sig = rho / RHO0, W = m * G0, Pw = P ?? Pflat(ty, oat);
  let best = { roc: -1e9 }, bestG = { g: -1e9 };
  for (let ve = v0; ve <= v1; ve += 0.25) {
    const V = ve * KT / Math.sqrt(sig), q = 0.5 * rho * V * V, th = propThrust(V, rho, Pw, ty.D, ty.rpm);
    let g = 0; for (let k = 0; k < 4; k++) { const CL = W * Math.cos(g) / (q * ty.S), D = q * ty.S * (CD0c + K * CL * CL); g = Math.asin(Math.max(-1, Math.min(1, (th.T - D) / W))); }
    const roc = V * Math.sin(g) / FT * 60;
    if (roc > best.roc) best = { roc, keas: ve, eta: th.eta, g_deg: g * 180 / Math.PI };
    if (g > bestG.g) bestG = { g, keas: ve, roc };
  }
  const gammaAt = ve => { const V = ve * KT / Math.sqrt(sig), q = 0.5 * rho * V * V, th = propThrust(V, rho, Pw, ty.D, ty.rpm); let g = 0; for (let k = 0; k < 4; k++) { const CL = W * Math.cos(g) / (q * ty.S), D = q * ty.S * (CD0c + K * CL * CL); g = Math.asin(Math.max(-1, Math.min(1, (th.T - D) / W))); } return { g_deg: g * 180 / Math.PI, roc: V * Math.sin(g) / FT * 60 }; };
  const vs1 = ty.vs1.v * Math.sqrt(m / ty.vs1.m), v12 = 1.2 * vs1, VxCard = Math.max(bestG.keas, v12), gx = gammaAt(VxCard);
  return { Vy_keas: best.keas, ROC_fpm: best.roc, eta_at_Vy: best.eta, Vx_model_keas: bestG.keas, gamma_max_deg: bestG.g * 180 / Math.PI, VS1: vs1, Vx_card: VxCard,
    gamma_at_Vx_card_deg: gx.g_deg, ROC_at_Vx_card_fpm: gx.roc, sigma: sig, P_kW: Pw / 1e3 };
}
/** take-off thrust ratio and field factors at VTBD for OAT (relative to SL ISA) */
function hotFactors(ty, m, vlofKeas, oat) {
  const T0 = propThrust(0.7 * vlofKeas * KT, RHO0, ty.P, ty.D, ty.rpm).T;
  const rho = rhoAt(oat, 9 * FT), sig = rho / RHO0;
  const Th = propThrust(0.7 * vlofKeas * KT / Math.sqrt(sig), rho, Pflat(ty, oat), ty.D, ty.rpm).T;
  return { sigma: sig, thrust_ratio: Th / T0, takeoff_factor: 1 / (sig * (Th / T0)), landing_factor: 1 / sig };
}

export function perfAll() {
  const out = { model: 'BEM CT/CP of round 1 (HC-D4N/D9512) + clean polar CD0c + K CL² (K from the T-6 glide polar); ค่าประมาณ', K: r(K, 5) };
  const cd0 = {};
  for (const id of ['pc9m', 'pc7mk2', 't6a']) cd0[id] = fitCD0(TYPES[id]);
  cd0.t6c = cd0.t6a;
  // VLOF EAS for the hot factors (lm_card take-off runs at MTOW, lp_check.json; est)
  const vlof = { pc9m: 95.5, pc7mk2: 92, t6a: 101, t6c: 103 };
  for (const id of ['pc9m', 'pc7mk2', 't6a', 't6c']) {
    const ty = TYPES[id], c = cd0[id].CD0c, tm = d[id].training_mass;
    const o = out[id] = { CD0c: r(c, 4), eta_at_vmax: r(cd0[id].eta_vmax, 3), vmax_point: ty.vmax ?? 'ใช้ CD0c ของ t6a' };
    const at = (m, opt) => { const x = climb(ty, c, m, opt); return { m: r(m, 5), VS1_kcas: r(x.VS1, 4), Vx_model_keas: r(x.Vx_model_keas, 4), gamma_max_deg: r(x.gamma_max_deg, 3), Vx_card_kcas: r(x.Vx_card, 4), gamma_at_Vx_card_deg: r(x.gamma_at_Vx_card_deg, 3), ROC_at_Vx_card_fpm: Math.round(x.ROC_at_Vx_card_fpm), Vy_keas: r(x.Vy_keas, 4), ROC_fpm: Math.round(x.ROC_fpm), ROC_ms: r(x.ROC_fpm * FT / 60, 3), eta_at_Vy: r(x.eta_at_Vy, 3), P_kW: Math.round(x.P_kW) }; };
    o.MTOW = at(ty.m); o.training_mass = at(tm);
    if (id === 't6a') { o.m6300 = at(T.aopa.m_lb * LB); o.roc_6500_over_6300 = r(o.MTOW.ROC_fpm / o.m6300.ROC_fpm, 4); }
    o.hot = [15, 31, 35].map(oat => { const x = climb(ty, c, ty.m, { oat, h_m: 9 * FT }); const f = hotFactors(ty, ty.m, vlof[id], oat); return { oat_C: oat, sigma: r(f.sigma, 4), P_kW: Math.round(x.P_kW), ROC_fpm_MTOW: Math.round(x.ROC_fpm), Vy_keas: r(x.Vy_keas, 4), thrust_ratio_TO: r(f.thrust_ratio, 4), takeoff_factor: r(f.takeoff_factor, 4), landing_factor: r(f.landing_factor, 4) }; });
    o.static_thrust_kN = r(propThrust(0.01, RHO0, ty.P, ty.D, ty.rpm).T / 1e3, 4);
  }
  // check of the model against the public climb numbers (no fitting to ROC)
  out.check = {
    pc7mk2_ROC_MTOW: { model: out.pc7mk2.MTOW.ROC_fpm, public: 2840, src: 'LP9' },
    pc9m_ROC_MTOW: { model: out.pc9m.MTOW.ROC_fpm, public: 4090, src: 'LP12/LP13 (mass not stated)' },
    t6a_ROC_6300lb: { model: out.t6a.m6300.ROC_fpm, public: T.aopa.ROC, src: 'LP29 (SL ISA 6,300 lb)' },
    t6a_Vy_6300lb: { model: out.t6a.m6300.Vy_keas, public: T.aopa.VY, src: 'LP29 (KIAS)' },
  };
  // PC-7 MkII take-off from the T-6A numbers [LP29] (ค่าประมาณ): ground roll ∝ W²/(CLmax_TO · T at 0.7 V_LOF); air part ∝ W/CLmax_TO
  {
    const t7 = propThrust(0.7 * vlof.pc7mk2 * KT, RHO0, TYPES.pc7mk2.P, TYPES.pc7mk2.D, TYPES.pc7mk2.rpm).T, t6 = propThrust(0.7 * vlof.t6a * KT, RHO0, TYPES.t6a.P, TYPES.t6a.D, TYPES.t6a.rpm).T;
    const m6 = T.aopa.m_lb * LB, m7 = 2250, clTO = (u, l) => (u + l) / 2 + 0.03;
    const cl6 = clTO(d.stallCL.t6a_UP.CLmax_1g, d.stallCL.t6a_LDG.CLmax_1g), cl7 = clTO(d.stallCL.pc7mk2_UP.CLmax_1g, d.stallCL.pc7mk2_LDG.CLmax_1g);
    const kg = (m7 / m6) ** 2 * (cl6 / cl7) * (t6 / t7), ka = (m7 / m6) * (cl6 / cl7), gr = T.aopa.TO_gr_ft * FT, air = (T.aopa.TO50_ft - T.aopa.TO_gr_ft) * FT;
    out.check.pc7mk2_TO_from_t6a = { thrust_07VLOF_kN: { t6a: r(t6 / 1e3, 4), pc7mk2: r(t7 / 1e3, 4) }, ground_scale: r(kg, 3), air_scale: r(ka, 3), ground_roll_m: Math.round(gr * kg), dist50ft_m: Math.round(gr * kg + air * ka), public: 415, src: 'LP29 scaled vs LP9' };
  }
  return out;
}

const isMain = process.argv[1] && new URL(import.meta.url).pathname === fs.realpathSync(process.argv[1]);
if (isMain) {
  const o = perfAll();
  fs.writeFileSync(new URL('./out/lp_perf.json', import.meta.url), JSON.stringify(o, null, 1) + '\n');
  console.log(JSON.stringify(o, null, 1));
}
