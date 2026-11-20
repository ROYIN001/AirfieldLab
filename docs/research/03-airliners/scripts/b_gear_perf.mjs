// b_gear_perf.mjs — 737-800: unit conversions, tyre load ratio, oleo stroke estimate, legacy gear springs,
// takeoff speed scaling, landing distance from LFL, wake circulation, %MAC conversion, approach category.
// Run: node b_gear_perf.mjs
const g = 9.80665, LB = 0.45359237, LBF = 4.4482216, IN = 0.0254, FT = 0.3048, KT = 0.514444, DEG = Math.PI / 180;
const f = (x, n = 3) => Number(x.toFixed(n));
const out = {};
// weights (ACAPS Rev C [B1]) lb -> kg check
const w = { MTW: [156000, 173000, 174700], MTOW: [155500, 172500, 174200], MLW: [144000, 144000, 146300], MZFW: [136000, 136000, 138300], OEW: [91300] };
out.weights_kg = Object.fromEntries(Object.entries(w).map(([k, a]) => [k, a.map(x => Math.round(x * LB))]));
// %MAC conversion with Flyware datum [B9]: LEMAC BA 627.1 in, MAC 155.8 in
const pctMAC = BA => (BA - 627.1) / 155.8 * 100;
out.refStation_658_26_pctMAC = f(pctMAC(658.26), 2);
out.BA_at_25pct_in = f(627.1 + 0.25 * 155.8, 2);
out.MAC_in_m = f(155.81 * IN, 4);
// tyres [B7]
const mainRated = 44700, noseRated = 9650;
const mainFrac = 0.93;                              // est share of weight on main gear
out.main_tyre_load_lb_MTW = Math.round(174700 * mainFrac / 4);
out.main_tyre_ratio = f(out.main_tyre_load_lb_MTW / mainRated);
out.nose_tyre_load_lb_MTW = Math.round(174700 * (1 - mainFrac) / 2);
out.nose_tyre_ratio = f(out.nose_tyre_load_lb_MTW / noseRated);
out.tyre_SI = { main_OD_m: f(44.5 * IN), main_W_m: f(16.5 * IN), main_rated_N: Math.round(mainRated * LBF), main_rated_kPa: Math.round(214 * 6.894757),
  nose_OD_m: f(27 * IN), nose_W_m: f(7.75 * IN), nose_rated_N: Math.round(noseRated * LBF), nose_rated_kPa: Math.round(200 * 6.894757) };
// oleo stroke estimate (Raymer 11.4 / Currey): S = V^2/(2 g eta N) - (etaT/eta) ST + 1 in
const Vs = 10 * FT, eta = 0.80, N = 1.5, etaT = 0.47, ST = 0.08;
out.stroke_main_est_m = f(Vs * Vs / (2 * g * eta * N) - (etaT / eta) * ST + IN);
// JSBSim linear gear springs [B13] -> SI
out.jsb_gear_SI = { nose_k_Npm: Math.round(90000 * LBF / FT), nose_c_Nspm: Math.round(4000 * LBF / FT), nose_c_reb: Math.round(8000 * LBF / FT),
  main_k_Npm: Math.round(120000 * LBF / FT), main_c_Nspm: Math.round(10000 * LBF / FT), main_c_reb: Math.round(20000 * LBF / FT) };
// static deflection of a main strut with JSBSim k at 66.361 t
out.jsb_main_static_defl_m = f(66361 * g * mainFrac / 2 / out.jsb_gear_SI.main_k_Npm);
// takeoff speed scaling from ATSB 76.4 t [B17] to MTOW 79,015 kg (V ~ sqrt(m)), est
const sc = Math.sqrt(79015 / 76400);
out.TO_speeds_79015 = { V1: f(152 * sc, 1), VR: f(155 * sc, 1), V2: f(158 * sc, 1) };
out.TO_speeds_70000 = { V1: f(152 * Math.sqrt(70000 / 76400), 1), VR: f(155 * Math.sqrt(70000 / 76400), 1), V2: f(158 * Math.sqrt(70000 / 76400), 1) };
// landing distance: LFL / 1.667 (14 CFR 121.195(b) 60 % rule) [B5][B36]
out.LDact_from_LFL = { basic_65317: Math.round(1630 / (1 / 0.6)), max_66360: Math.round(1655 * 0.6), jenkinson_1600: Math.round(1600 * 0.6) };
// stopping distance at constant decel from Vref30 at MLW (144.1 kt), 7 s air+transition est
const Vtd = 144.1 * KT;
out.ground_roll_m = Object.fromEntries([1.36, 2.0, 3.0, 4.27].map(a => [a, Math.round(Vtd * Vtd / (2 * a))]));
// wake (round 1 W31/W32 definitions): Gamma0 = M g/(rho V b0), b0 = pi/4 b, w0 = Gamma0/(2 pi b0)
const wake = (m, span, Vkt, rho = 1.1262) => { const b0 = Math.PI / 4 * span, G = m * g / (rho * Vkt * KT * b0); return { b0: f(b0, 2), Gamma0: f(G, 1), w0: f(G / (2 * Math.PI * b0)) }; };
out.wake_800W_MLW_142 = wake(66361, 35.79, 142); out.wake_800_MLW_142 = wake(66361, 34.32, 142);
out.wake_800W_60t_Vref30p5 = wake(60000, 35.79, 142.1); out.wake_800W_60t_ISA_SL = wake(60000, 35.79, 142.1, 1.225);
// ICAO approach category from Vat (ICAO Doc 8168): C 121-140, D 141-165
const cat = v => v < 91 ? 'A' : v <= 120 ? 'B' : v <= 140 ? 'C' : v <= 165 ? 'D' : 'E';
out.cat_Boeing142 = cat(142); out.cat_Vref40_MLW = cat(0.53923 * Math.sqrt(66361)); out.cat_Vref30_MLW = cat(0.55953 * Math.sqrt(66361));
// conversions for report tables
out.conv = { VMO_mps: f(340 * KT, 1), VLE_mps: f(320 * KT, 1), VLO_ext_mps: f(270 * KT, 1), VLO_ret_mps: f(235 * KT, 1),
  ceiling_m: f(41000 * FT, 0), TOFL_ft_2230: Math.round(2230 / FT), LFL_ft_1655: Math.round(1655 / FT), ROC_WRAP_fpm: Math.round(12.27 / FT * 60),
  ROC_preCAS_fpm: Math.round(10.61 / FT * 60), fa_vs_fpm: Math.round(3.84 / FT * 60), thrust_7B26_kN: f(26300 * LBF / 1000, 1),
  thrust_7B27_kN: f(27300 * LBF / 1000, 1), thrust_7B24_kN: f(24200 * LBF / 1000, 1), brake_3000psi_MPa: f(3000 * 6.894757 / 1000, 2) };
console.log(JSON.stringify(out, null, 1));
