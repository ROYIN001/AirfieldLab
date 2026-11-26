// r_engine_prop.mjs — หัวข้อ 3.1 ATR 72-600: PW127M + ใบพัด 568F
// ตรวจความสอดคล้องของ rating/torque/Np, แรงขับสถิต (momentum + figure of merit), CT/CP, tip Mach,
// แรงขับตามความเร็ว และค่า propulsion.legacy สำหรับ thrustAvail() ปัจจุบัน
// แหล่งตัวเลข: EASA TCDS IM.E.041 [R3], ATR factsheet [R4], FCOM 1.16 (สำเนาไม่เป็นทางการ) [R15], ASC GE235 [R7]
// ทุกผลลัพธ์ในไฟล์นี้เป็นค่าประมาณ (est) ยกเว้นการแปลงหน่วย
const HP = 745.69987;            // W per shp (mechanical hp)
const LBF = 4.4482216;
const KT = 0.514444;
const FT = 0.3048;
function isa(h, dT = 0) {        // troposphere USSA-1976
  const T0 = 288.15 - 0.0065 * h, T = T0 + dT;
  const p = 101325 * Math.pow(T0 / 288.15, 5.25588);
  return { T, p, rho: p / (287.053 * T), a: Math.sqrt(1.4 * 287.053 * T) };
}
const f = (x, d = 1) => Number(x.toFixed(d));
const out = {};

// 1) ratings: kW (TCDS) <-> shp (ATR)
const R = { MTO_RTO_kW: 2051, NTO_kW: 1846, MCT_kW: 1864 };           // [R3]
const S = { TO: 2475, RTO: 2750, MCT: 2500, CLB: 2192, CRZ: 2132 };   // shp [R4][R15]
out.ratings = {
  RTO_shp_from_kW: f(R.MTO_RTO_kW * 1e3 / HP, 0), NTO_shp_from_kW: f(R.NTO_kW * 1e3 / HP, 0), MCT_shp_from_kW: f(R.MCT_kW * 1e3 / HP, 0),
  CLB_kW: f(S.CLB * HP / 1e3, 0), CRZ_kW: f(S.CRZ * HP / 1e3, 0),
  NTO_over_RTO: f(R.NTO_kW / R.MTO_RTO_kW, 3),
};

// 2) torque: 100 % TQ, ระดับ % ของแต่ละ rating ที่ Np 100 % (1200 rpm [R15]) และ 82 %
const Np100 = 1200, w100 = 2 * Math.PI * Np100 / 60;
const Qlim = 17354, Qtr20 = 19578;                 // N m [R3]
const Q100_fromRed = Qlim / 1.063;                 // red line 106.3 % [R15][R7]
const Q100_fromRTO = R.MTO_RTO_kW * 1e3 / w100;
out.torque = {
  omega100_rad_s: f(w100, 3), Q100_from_redline_Nm: f(Q100_fromRed, 0), Q100_from_RTO_at_1200_Nm: f(Q100_fromRTO, 0),
  diff_pct: f(100 * (Q100_fromRTO / Q100_fromRed - 1), 2),
  NTO_pct: f(100 * R.NTO_kW * 1e3 / w100 / Q100_fromRTO, 1),
  MCT_pct_Np100: f(100 * R.MCT_kW * 1e3 / w100 / Q100_fromRTO, 1),
  CLB_pct_Np82: f(100 * S.CLB * HP / (0.82 * w100) / Q100_fromRTO, 1),
  CRZ_pct_Np82: f(100 * S.CRZ * HP / (0.82 * w100) / Q100_fromRTO, 1),
  transient20s_pct: f(100 * Qtr20 / Q100_fromRTO, 1),
  Q100_lbf_ft: f(Q100_fromRTO / (LBF * FT), 0),
  TCDS_Npmax_1212_over_1200_pct: f(100 * 1212 / 1200, 2),
};

// 3) ใบพัด: D 3.93 m, 6 ใบ [R4]; momentum theory static thrust
const D = 3.93, A = Math.PI * D * D / 4, n100 = Np100 / 60;
const sl = isa(0), dmk = isa(0, 31 - 15);           // ISA SL และวันร้อน 31 °C ที่ DMK (ทำเป็นระดับน้ำทะเล)
const Tideal = (P, rho) => Math.cbrt(2 * rho * A * P * P);
const FM = [0.70, 0.75, 0.80];                       // figure of merit ที่สมมติ (ใบพัดเครื่องบินช่วง 0.7–0.8)
out.static = { disk_area_m2: f(A, 3), tip_speed_static_ms: f(Math.PI * n100 * D, 1), tip_Mach_static_ISA: f(Math.PI * n100 * D / sl.a, 3) };
for (const [k, P] of [['NTO', R.NTO_kW * 1e3], ['RTO', R.MTO_RTO_kW * 1e3]]) {
  out.static[k] = {
    ideal_kN: f(Tideal(P, sl.rho) / 1e3, 1),
    ...Object.fromEntries(FM.map(m => ['FM' + m, f(Tideal(m * P, sl.rho) / 1e3, 1)])),
    FM0_75_lbf: f(Tideal(0.75 * P, sl.rho) / LBF, 0),
    FM0_75_lbf_per_shp: f(Tideal(0.75 * P, sl.rho) / LBF / (P / HP), 2),
    FM0_75_DMK31C_kN: f(Tideal(0.75 * P, dmk.rho) / 1e3, 1),
    CP_static: f(P / (sl.rho * n100 ** 3 * D ** 5), 4),
    CT_static_FM075: f(Tideal(0.75 * P, sl.rho) / (sl.rho * n100 ** 2 * D ** 4), 4),
    disk_loading_kW_m2: f(P / 1e3 / A, 1),
  };
}

// 4) J, helical tip Mach, ηp ที่ความเร็วสำคัญ (ηp จาก momentum: ideal ηi แล้วคูณ 0.90 สำหรับ profile/swirl)
function etaMomentum(V, P, rho, k = 0.90) {      // แก้สมการ ηi^3 ... : T = ηP/V, ηi = 2/(1+sqrt(1+T/(0.5ρV²A)))
  let eta = 0.8;
  for (let i = 0; i < 60; i++) { const T = eta * P / V; const ei = 2 / (1 + Math.sqrt(1 + T / (0.5 * rho * V * V * A))); eta = k * ei; }
  return eta;
}
out.speedpoints = [];
for (const [name, Vkt, h, P, NpFrac] of [
  ['V2 116 KCAS SL RTO', 116, 0, R.MTO_RTO_kW * 1e3, 1.0],
  ['climb 170 KCAS SL CLB', 170, 0, S.CLB * HP, 0.82],
  ['cruise 275 KTAS FL170 CRZ', 275, 17000 * FT, S.CRZ * HP, 0.82],
  ['approach 110 KCAS SL 25% TQ', 110, 0, 0.25 * Q100_fromRTO * w100, 1.0],
]) {
  const at = isa(h), V = Vkt * KT * (name.includes('KTAS') ? 1 : Math.sqrt(1.225 / at.rho)); // KCAS→TAS (ประมาณด้วย EAS)
  const n = n100 * NpFrac;
  out.speedpoints.push({
    name, TAS_ms: f(V, 1), J: f(V / (n * D), 3),
    helical_tip_Mach: f(Math.hypot(V, Math.PI * n * D) / at.a, 3),
    eta_momentum_x0_90: f(etaMomentum(V, P, at.rho), 3),
    T_per_engine_kN_at_eta: f(etaMomentum(V, P, at.rho) * P / V / 1e3, 2),
    CP: f(P / (at.rho * n ** 3 * D ** 5), 4),
  });
}

// 5) propulsion.legacy (thrustAvail: T = T0 Vc / sqrt(V²+Vc²), Vc = eta P / T0) สำหรับทั้งลำ (2 เครื่องยนต์)
//    เลือก P = 2×NTO (1846 kW), T0 = 2×แรงขับสถิตที่ FM 0.75, แล้วเลือก eta ให้ตรงกับ ηp จาก momentum ที่ V2
const P_leg = 2 * R.NTO_kW * 1e3, T0_leg = 2 * Tideal(0.75 * R.NTO_kW * 1e3, sl.rho);
const V2 = 116 * KT;
const eta_v2 = etaMomentum(V2, R.NTO_kW * 1e3, sl.rho);
// หา eta ของสูตร legacy ที่ให้ T(V2) เท่ากับ eta_v2·P/V2
const target = eta_v2 * P_leg / V2;
let lo = 0.3, hi = 1.2;
for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; const Vc = m * P_leg / T0_leg; const T = T0_leg * Vc / Math.hypot(V2, Vc); if (T < target) lo = m; else hi = m; }
const eta_leg = (lo + hi) / 2, Vc = eta_leg * P_leg / T0_leg;
const legT = V => T0_leg * Vc / Math.hypot(V, Vc);
out.legacy = {
  P_W: P_leg, T0_N: f(T0_leg, 0), eta: f(eta_leg, 3), Vc_ms: f(Vc, 1),
  check_T_kN: Object.fromEntries([0, 30, 60, 87.5, 141.5].map(v => [v + 'ms', f(legT(v) / 1e3, 1)])),
  momentum_T_kN: Object.fromEntries([30, 60, 87.5].map(v => [v + 'ms', f(2 * etaMomentum(v, R.NTO_kW * 1e3, sl.rho) * R.NTO_kW * 1e3 / v / 1e3, 1)])),
};

// 6) ความเฉื่อยใบพัด: มวล 180 kg [R15]; I ≈ m_blades·(k R)²; สมมติมวลใบ 6×22 kg, k = 0.45 R, hub 48 kg ที่ r 0.2 m
const R_ = D / 2, mBl = 6 * 22, mHub = 180 - mBl;
out.prop_inertia = {
  I_blades: f(mBl * (0.45 * R_) ** 2, 1), I_hub: f(mHub * 0.2 ** 2 / 2, 1),
  I_total_kgm2: f(mBl * (0.45 * R_) ** 2 + mHub * 0.2 ** 2 / 2, 1),
  FG_value_kgm2: f(107.85 * 1.3558179, 1),   // FlightGear prop_hs568f ixx 107.85 slug ft² [R22]
  H_at_Np100_kgm2s: f((mBl * (0.45 * R_) ** 2 + mHub * 0.02) * w100, 0),
};
console.log(JSON.stringify(out, null, 1));
