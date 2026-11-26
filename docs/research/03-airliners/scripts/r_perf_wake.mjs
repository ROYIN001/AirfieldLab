// r_perf_wake.mjs — หัวข้อ 3.1 ATR 72-600: ตรวจ drag polar กับข้อมูลผู้ผลิต (cruise fuel flow, ROC),
// แรงบิดขณะ approach, ระยะลงจอด/วิ่งขึ้นแบบง่าย, โหลดล้อ/ยาง, พลังงานโช้ค และค่า wake vortex
// ค่าที่ได้ทั้งหมดเป็นค่าประมาณ (est) จากสมการ; ค่าเป้าหมายมาจาก [R4][R5][R8][R9][R12]
const g = 9.80665, KT = 0.514444, FT = 0.3048, HP = 745.69987, LB = 0.45359237, D2R = Math.PI / 180;
const S = 61.0, b = 27.05, D = 3.93, A = Math.PI * D * D / 4;
const f = (x, d = 3) => Number(x.toFixed(d));
function isa(h, dT = 0) { const T0 = 288.15 - 0.0065 * h, T = T0 + dT; const p = 101325 * Math.pow(T0 / 288.15, 5.25588); return { rho: p / (287.053 * T), T, a: Math.sqrt(401.874 * T) }; }
function etaMom(V, P, rho, k = 0.90) { let e = 0.8; for (let i = 0; i < 60; i++) { const T = e * P / V; e = k * 2 / (1 + Math.sqrt(1 + T / (0.5 * rho * V * V * A))); } return e; }
const K = 0.0313;                       // [R29] -> e = 0.847
const Q100 = 16321, w100 = 2 * Math.PI * 1200 / 60;   // r_engine_prop.mjs
const out = {};

// 1) CD0 จาก cruise: 762 kg/h รวม ที่ 275 KTAS, 95 % MTOW (22.8 t) [R4]; psfc สมมติ 0.46–0.50 lb/(shp h)
out.cruiseCD0 = [];
for (const hft of [17000, 20000]) for (const psfc of [0.46, 0.48, 0.50]) {
  const at = isa(hft * FT), V = 275 * KT, m = 0.95 * 22800, q = 0.5 * at.rho * V * V;
  const P = (762 / LB / psfc) * HP;          // W รวมสองเครื่องยนต์
  const eta = etaMom(V, P / 2, at.rho);
  const Dg = eta * P / V, CL = m * g / (q * S), CD = Dg / (q * S);
  out.cruiseCD0.push({ FL: hft / 100, psfc, P_kW_total: f(P / 1e3, 0), eta: f(eta), CL: f(CL), CD: f(CD, 4), CD0: f(CD - K * CL * CL, 4) });
}
const CD0 = 0.030;   // ค่าที่เลือก (est) — กลางช่วงด้านบน (0.028–0.034); FG 0.029 [R22], Nita 0.0274 [R27]

// 2) ROC ที่ MTOW 22.8 t, ISA SL, 170 KCAS, max climb 2×2192 shp ที่ Np 82 % [R4][R15]
{
  const at = isa(0), V = 170 * KT, m = 22800, W = m * g, q = 0.5 * at.rho * V * V;
  const P = 2 * 2192 * HP, eta = etaMom(V, P / 2, at.rho);
  const CL = W / (q * S), CD = CD0 + K * CL * CL, Dg = q * S * CD;
  const roc = (eta * P - Dg * V) / W;
  out.ROC = { eta: f(eta), CL: f(CL), CD: f(CD, 4), ROC_ms: f(roc), ROC_fpm: f(roc / FT * 60, 0), target_fpm: 1355 };
  // ความไวต่อ CD0 ±0.003
  out.ROC.sens_fpm = [0.026, 0.032].map(c0 => f(((eta * P - q * S * (c0 + K * CL * CL) * V) / W) / FT * 60, 0));
}

// 3) Approach: VAPP 111 kt (VREF 106 + 5), 20.4 t, flaps 30 + gear, γ −3°, Np 100 %
//    หา ΔCD (flap30 + gear) ที่ให้ torque 25 % ตาม FCTM [R9]; K_landing = 0.040 (est: e ≈ 0.66 รวมผลแฟลป)
{
  const Kl = 0.040, at = isa(0), V = 111 * KT, m = 20400, W = m * g, q = 0.5 * at.rho * V * V;
  const CL = W * Math.cos(3 * D2R) / (q * S);
  const torque = (dCD, gam = -3) => {
    const CLg = W * Math.cos(gam * D2R) / (q * S);
    const Dg = q * S * (CD0 + dCD + Kl * CLg * CLg);
    const T = Dg + W * Math.sin(gam * D2R);       // T ต้องการ (สองเครื่องยนต์)
    // P จาก T: แก้ T = η(P)·P/V
    let P = T * V / 0.8; for (let i = 0; i < 50; i++) P = T * V / etaMom(V, P / 2, at.rho);
    return { T, P, tq: 100 * (P / 2) / (Q100 * w100) };
  };
  let lo = 0, hi = 0.2; for (let i = 0; i < 60; i++) { const m_ = (lo + hi) / 2; if (torque(m_).tq < 25) lo = m_; else hi = m_; }
  const dCD = (lo + hi) / 2;
  const t3 = torque(dCD), t2 = torque(dCD, -2), t4 = torque(dCD, -4);
  // ATSB VH-FVZ: 21.7 t, 113 kt → torque ทำนาย (เทียบ 22 % [R8])
  const atsb = (() => { const V2 = 113 * KT, q2 = 0.5 * at.rho * V2 * V2, W2 = 21700 * g, CLg = W2 * Math.cos(3 * D2R) / (q2 * S);
    const T = q2 * S * (CD0 + dCD + Kl * CLg * CLg) - W2 * Math.sin(3 * D2R); let P = T * V2 / 0.8; for (let i = 0; i < 50; i++) P = T * V2 / etaMom(V2, P / 2, at.rho); return 100 * (P / 2) / (Q100 * w100); })();
  out.approach = { CL: f(CL), dCD_flap30_gear_fit: f(dCD, 4), CD_total: f(CD0 + dCD + Kl * CL * CL, 4), T_total_kN: f(t3.T / 1e3, 2), torque_pct_3deg: f(t3.tq, 1),
    torque_pct_2deg: f(t2.tq, 1), torque_pct_4deg: f(t4.tq, 1), dTorque_per_deg: f((t2.tq - t4.tq) / 2, 2), ATSB_21_7t_113kt_pred_pct: f(atsb, 1),
    LoverD: f(CL / (CD0 + dCD + Kl * CL * CL), 2), glide_angle_idle_deg: f(Math.atan((CD0 + dCD + Kl * CL * CL) / CL) / D2R, 2) };
}

// 4) ระยะลงจอด: LFL 915 m (EASA Air Ops) [R5]; turboprop: ALD ≤ 70 % LDA (CAT.POL.A.230) [R36] -> ALD = 640.5 m
{
  const LFL = 915, ALD = 0.7 * LFL, air = 50 * FT / Math.tan(3 * D2R) * 0.5 + 300 * 0.5;  // air distance ~ ครึ่งหนึ่งของ 50ft/tan3 + flare (est ≈ 300 m รวม)
  const airDist = 300;                     // est
  const Vtd = 106 * KT;                    // VREF−6 kt ≈ VREF 112 ที่ MLW −6
  const Vtd2 = (112 - 6) * KT;
  const sg = ALD - airDist;
  out.landing = { ALD_m_70pct: f(ALD, 1), ALD_m_if_60pct: f(0.6 * LFL, 1), air_m_assumed: airDist, ground_roll_m: f(sg, 1),
    mean_decel_ms2: f(Vtd2 * Vtd2 / (2 * sg), 2), mean_decel_g: f(Vtd2 * Vtd2 / (2 * sg) / g, 3) };
}

// 5) Take-off AEO แบบง่าย: 22.8 t, ISA SL, flaps 15, 2×NTO, μ_roll 0.02, CL_ground 0.9, VR 110 KCAS -> 35 ft ที่ V2 116
{
  const at = isa(0), m = 22800, W = m * g, P = 2 * 1846e3, mu = 0.02, CLg = 0.9, CDg = CD0 + 0.012 + 0.02 + 0.045 * CLg * CLg; // + flap15 + gear (est)
  let V = 0.5, x = 0, t = 0; const dt = 0.01, VR = 110 * KT;
  const Tst = 2 * Math.cbrt(2 * at.rho * A * (0.75 * 1846e3) ** 2);
  while (V < VR) { const Tm = Math.min(Tst, etaMom(Math.max(V, 5), P / 2, at.rho) * P / Math.max(V, 5)); const q = 0.5 * at.rho * V * V;
    const a = (Tm - q * S * CDg - mu * (W - q * S * CLg)) / m; V += a * dt; x += V * dt; t += dt; }
  // ช่วงอากาศ: จาก VR ถึง 35 ft ที่ V2 ด้วยมุมไต่ γ จากแรงขับส่วนเกิน (ประมาณ) + ช่วงหมุน 3 s
  const V2 = 116 * KT, q2 = 0.5 * at.rho * V2 * V2, CL2 = W / (q2 * S), CD2 = CD0 + 0.012 + 0.04 * CL2 * CL2;
  const T2 = etaMom(V2, P / 2, at.rho) * P / V2, gam = Math.asin((T2 - q2 * S * CD2) / W);
  const xRot = 3 * (VR + V2) / 2, xAir = 35 * FT / Math.tan(gam);
  out.takeoffAEO = { ground_roll_m: f(x, 0), t_s: f(t, 1), static_T_total_kN: f(Tst / 1e3, 1), climb_grad_pct: f(100 * Math.tan(gam), 1), TOD35_m: f(x + xRot + xAir, 0), TOD35x1_15_m: f(1.15 * (x + xRot + xAir), 0), TOFL_published_m: 1279 };
}

// 6) โหลดล้อและยาง (MTOW 23 t, MLW 22.35 t; สัดส่วนโหลดล้อหน้า 8 % est)
{
  const Wt = 23000 * g, nf = 0.08;
  out.tyres = { main_static_per_tyre_N: f((1 - nf) * Wt / 4, 0), main_static_per_tyre_lbf: f((1 - nf) * Wt / 4 / 4.4482216, 0),
    nose_static_per_tyre_N: f(nf * Wt / 2, 0), nose_static_per_tyre_lbf: f(nf * Wt / 2 / 4.4482216, 0),
    main_ratio_to_13000lb: f((1 - nf) * Wt / 4 / 4.4482216 / 13000), nose_ratio_to_3600lb: f(nf * Wt / 2 / 4.4482216 / 3600) };
}

// 7) พลังงานโช้ค: 600 fpm ที่ MLW [R8] (= 10 fps ของ CS 25.473), reserve 720 fpm (= 12 fps ของ 25.723)
{
  const v = 600 * FT / 60, v2 = 720 * FT / 60, m = 22350;
  const E = 0.5 * m * v * v, E2 = 0.5 * m * v2 * v2;
  const n = 1.5, etaS = 0.80, etaT = 0.47, St = 0.08;      // est
  const Ss = (v * v / (2 * g) / n - etaT * St) / etaS;
  out.gearEnergy = { sink_ms: f(v), sink_fps: f(v / FT, 2), E_kJ: f(E / 1e3, 1), reserve_sink_fps: f(v2 / FT, 2), reserve_E_kJ: f(E2 / 1e3, 1), stroke_est_m_for_n1_5: f(Ss) };
}

// 8) wake vortex: b0 = π/4·b, Γ0 = W/(ρ V b0), w0 = Γ0/(2π b0)
{
  const at = isa(0), b0 = Math.PI / 4 * b;
  const wv = (m, Vkt) => { const V = Vkt * KT, G = m * g / (at.rho * V * b0); return { Gamma0: f(G, 1), w0: f(G / (2 * Math.PI * b0), 3), t_ref_s: f(b0 / (G / (2 * Math.PI * b0)), 1) }; };
  out.wake = { b0: f(b0, 2), landing_MLW_VREF112: wv(22350, 112), takeoff_MTOW_V2_116: wv(23000, 116), landing_20t_VREF106: wv(20400, 106) };
}
console.log(JSON.stringify(out, null, 1));
