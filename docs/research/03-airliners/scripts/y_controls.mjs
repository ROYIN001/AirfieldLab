// y_controls.mjs — expected values for topic 3.7 (flight-control hardware) tests T-Y-xx
// Run: node y_controls.mjs   (Node >= 18, no dependencies). All inputs are quoted in 07-flight-controls.md.
const KT = 0.514444, LB = 4.448222, IN = 0.0254, DEG = Math.PI / 180;
const r = (x, n = 3) => Math.round(x * 10 ** n) / 10 ** n;
const qbar = (kcas) => 0.5 * 1.225 * (kcas * KT) ** 2;            // Pa, CAS => sea-level equivalent q
const lerpTab = (xs, ys, x) => { if (x <= xs[0]) return ys[0]; for (let i = 1; i < xs.length; i++) if (x <= xs[i]) return ys[i - 1] + (ys[i] - ys[i - 1]) * (x - xs[i - 1]) / (xs[i] - xs[i - 1]); return ys[ys.length - 1]; };
const out = {};

// ---------- 737 stabilizer (KNKT LNI610 §1.6.5.3; JATR p.19; FAA RTS p.23; Lemme 2019) ----------
const unitsToStabDeg = u => 4 - u;       // + = leading edge up (TE down, nose-down moment), deg ; 4 units = 0 deg
out.stab = {
  deg_at_0u: unitsToStabDeg(0), deg_at_m0_2u: unitsToStabDeg(-0.2), deg_at_16_9u: unitsToStabDeg(16.9),
  range_units: r(16.9 - (-0.2), 2),
  fullRange_s_mainElecFlapsUp_0p2: r(17.1 / 0.2, 1), fullRange_s_mainElecFlapsDn_0p4: r(17.1 / 0.4, 2),
  mistrim_3s_0p2_units: r(3 * 0.2, 2),                         // 14 CFR 25.255(a)(1) -> 0.6 unit (JATR p.19)
  mcas_2p5deg_time_s: r(2.5 / 0.27, 2),                        // ET302: "engaged for 9 seconds"
  knkt_AND_rate_u_per_s: r((6.1 - 3.8) / 10, 3),              // KNKT p.21: 6.1 -> 3.8 units in ~10 s
  et302_mcas1_rate_u_per_s: r((4.6 - 2.1) / 9, 3),            // ET302 p.17/p.23: AP trim to 4.6 units, then MCAS 9 s to 2.1 units
  ap_full_range_s_flapsUp_0p09: r(17.1 / 0.09, 0), ap_flapsDn_10s_units: r(10 * 0.27, 2), ap_flapsUp_10s_units: r(10 * 0.09, 2),
  elecLimitFlapsUp_after120s_from4: Math.min(14.5, 4 + 0.2 * 120),
};

// ---------- 737 rudder (NTSB AAR-99/01 pp.26-28; Boeing [C25] p.29-31) ----------
const pedalIn = dr => dr / 6.5;                                   // 1 in per 6.5 deg
const pedalForceLb = x => (x === 0 ? 0 : 9 + (70 - 9) * Math.min(Math.abs(x), 4) / 4); // feel unit 9..70 lb (linear, est)
out.rudder737 = {
  pedal_in_full_26: r(pedalIn(26), 3), pedal_lb_full: r(pedalForceLb(pedalIn(26)), 1), pedal_lb_13deg: r(pedalForceLb(pedalIn(13)), 2),
  pedal_gradient_lb_per_in: r((70 - 9) / 4, 3), pedal_gradient_N_per_m: r((70 - 9) / 4 * LB / IN, 0),
  slew_s_full_66: r(26 / 66, 3), slew_s_full_33: r(26 / 33, 3), yd_slew_s_3deg: r(3 / 50, 3),
  trim_full_s_16_at_0p5: r(16 / 0.5, 1),
};
// blowdown model (est): delta_max = stop * min(1, qb/q), qb calibrated so that delta_max = 21 deg at 190 KCAS, beta = 0 (Boeing p.31: 14-21 deg at the 427 condition)
const qb = 21 / 26 * qbar(190);
const blow = (kcas, pr = 1) => Math.min(26, 26 * pr * qb / qbar(kcas));
out.blowdown737 = { q190_Pa: r(qbar(190), 0), qb_Pa: r(qb, 0), qb_kcas: r(Math.sqrt(2 * qb / 1.225) / KT, 1),
  at150: r(blow(150), 2), at190: r(blow(190), 2), at250: r(blow(250), 2), at280: r(blow(280), 2), at340: r(blow(340), 2),
  rpr_1000psi_at250: r(blow(250, 1000 / 3000), 2), rpr_1800psi_at250: r(blow(250, 1800 / 3000), 2) };

// ---------- 737 elevator feel (est): F = Fbo + K(p) * |de| ; p = clamp(180 + kq*q, 180, 1400) psi ----------
// calibration: ET302 'calculated column force of up to 110 lbs' at ~340 KCAS while holding an elevator ~ 3.5 u / tau 0.45 = 7.8 deg nose-up (est)
const Fbo = 4;                                  // lb, chosen (est)
const de_cal = 3.5 / 0.45;                      // deg elevator to cancel 3.5 deg stab mistrim (tau_e 0.45 est)
const Kmax = (110 - Fbo) / de_cal;              // lb/deg at p = 1400 psi
const kq = (1400 - 180) / qbar(340);            // psi per Pa, saturating at VMO 340 KCAS (est)
const pFeel = kcas => Math.min(1400, 180 + kq * qbar(kcas));
const Kfeel = kcas => Kmax * pFeel(kcas) / 1400; // lb per deg elevator
out.feel737 = { de_cal_deg: r(de_cal, 2), Kmax_lb_per_deg: r(Kmax, 3), Kmax_N_per_deg: r(Kmax * LB, 2), kq_psi_per_Pa: r(kq, 5),
  p_at_0: 180, p_at_150: r(pFeel(150), 1), p_at_250: r(pFeel(250), 1), p_at_340: r(pFeel(340), 1),
  K_at_150_lb_per_deg: r(Kfeel(150), 3), K_at_250_lb_per_deg: r(Kfeel(250), 3),
  F_5deg_at_150_lb: r(Fbo + Kfeel(150) * 5, 2), F_5deg_at_250_lb: r(Fbo + Kfeel(250) * 5, 2), F_7p8deg_at_340_lb: r(Fbo + Kfeel(340) * de_cal, 1),
  EFS_x2_at_150_5deg: r(2 * (Fbo + Kfeel(150) * 5), 2) };

// ---------- 737 roll: flight-spoiler mixing (FlightGear 737-800YV table, wheel normalised) ----------
const spLowX = [0.149, 0.161, 0.172, 0.23, 0.483, 0.69, 0.839, 0.954, 0.966], spLowY = [0, 0.262478, 0.734767, 3.08542, 10.0735, 17.9607, 25.816, 32.5422, 33.0184];
const spHiX = [0.126, 0.207, 0.322, 0.494, 0.69, 0.828, 0.874, 0.885, 0.897, 0.908], spHiY = [0, 3.93022, 6.87439, 12.3579, 21.2068, 29.3878, 32.3305, 32.7384, 33, 33.0184];
out.spoiler737 = { at0p1: lerpTab(spLowX, spLowY, 0.1), lo_at0p5: r(lerpTab(spLowX, spLowY, 0.5), 2), hi_at0p5: r(lerpTab(spHiX, spHiY, 0.5), 2),
  lo_at1: r(lerpTab(spLowX, spLowY, 1), 2), speedbrake_flight_0p65: 25, speedbrake_full: 33 };

// ---------- ATR 72 (NTSB AAR-96/01; ATSB AO-2014-032; AAIB EI-SLG) ----------
const atrSpoiler = da => da <= 2.5 ? 0 : Math.min(57, 57 * (da - 2.5) / (14 - 2.5));
const tluLimit = (t, dir) => { // dir +1: low->high speed mode (27 -> 3 deg) over 15 s (linear, est)
  const f = Math.min(1, Math.max(0, t / 15)); return dir > 0 ? 27 + (3 - 27) * f : 3 + (27 - 3) * f; };
out.atr = { spoiler_at_2p5: atrSpoiler(2.5), spoiler_at_8: r(atrSpoiler(8), 2), spoiler_at_14: atrSpoiler(14), spoiler_gain_deg_per_deg: r(57 / 11.5, 3),
  elev_col_ratio_up: r(23 / 11.25, 3), elev_col_ratio_dn: r(13 / 6.75, 3), aileron_wheel_ratio: r(14 / 65, 4),
  tlu_mid_7p5s: tluLimit(7.5, +1), tlu_full_15s: tluLimit(15, +1), pum_each_daN: [50, 55], pum_each_lbf: [r(500 / LB, 1), r(550 / LB, 1)],
  vmo_q_Pa: r(qbar(250), 0) };
// ATR roll reversible calibration (est): two ailerons, S_a 1.5 m2 each, c_a 0.45 m, wheel radius 0.18 m (assumed);
// choose |Ch_delta_eff| so that full aileron (14 deg) at VMO 250 KCAS needs 60 lb at the wheel rim (NTSB: designed < 60 lb).
const Sa = 1.5, ca = 0.45, rw = 0.18, G = 14 / 65;  // G = d(delta_a)/d(theta_wheel)
const ChEff = 60 * LB * rw / (2 * qbar(250) * Sa * ca * (14 * DEG) * G);
const Fwheel = (kcas, da) => 2 * qbar(kcas) * Sa * ca * ChEff * (da * DEG) * G / rw / LB;
out.atrRoll = { ChEff_per_rad: r(ChEff, 4), F_full_250_lb: r(Fwheel(250, 14), 1), F_full_150_lb: r(Fwheel(150, 14), 1), F_7deg_180_lb: r(Fwheel(180, 7), 1) };
// ATR pitch reversible calibration (est): S_e 3.5 m2 (both), c_e 0.48 m, column grip arm 0.55 m, gearing 2.0 rad/rad;
// choose |Ch_delta_eff| so that full nose-up elevator (23 deg) at 154 kt needs 50 daN at one column (order of ATSB cert test 56-62 daN, PUM 50-55 daN).
const Se = 3.5, ce = 0.48, arm = 0.55, Ge = 23 / 11.25;
const ChE = 500 * arm / (qbar(154) * Se * ce * (23 * DEG) * Ge);
const Fcol = (kcas, de) => qbar(kcas) * Se * ce * ChE * (de * DEG) * Ge / arm; // N
out.atrPitch = { gearing_rad_per_m: r(Ge / arm, 3), ChE_per_rad: r(ChE, 4), F_full_154_daN: r(Fcol(154, 23) / 10, 1), F_5deg_200_daN: r(Fcol(200, 5) / 10, 2), F_5deg_250_daN: r(Fcol(250, 5) / 10, 2) };

// ---------- Airbus A320 (FBW A32NX FAC table; KNKT QZ8501; FBW SEC table) ----------
const rtlV = [100, 160, 200, 240, 320, 380, 400], rtlD = [25, 25, 14.5, 8.8, 4.8, 3.4, 3.4];
out.a320 = { rtl_140: lerpTab(rtlV, rtlD, 140), rtl_180: r(lerpTab(rtlV, rtlD, 180), 2), rtl_250: r(lerpTab(rtlV, rtlD, 250), 2), rtl_290: r(lerpTab(rtlV, rtlD, 290), 2), rtl_350: r(lerpTab(rtlV, rtlD, 350), 2),
  sb_0p25: r(lerpTab([0, 0.05, 0.051, 0.5, 1.0], [0, 0, 2, 25, 40], 0.25), 2), sb_0p5: 25, sb_0p75: r(lerpTab([0, 0.05, 0.051, 0.5, 1.0], [0, 0, 2, 25, 40], 0.75), 2), sb_1: 40,
  ss_breakout_pitch_lbf: r(50 / LB, 2), ss_breakout_roll_lbf: r(35 / LB, 2),
  af447_ths_rate_dps: r((13 - 3) / 60, 3) };
// A300-600 limiter (NTSB A-02-01): 30 deg / 4.0 in / 65 lb below 165 kt; 9.3 deg / 1.3 in / 32 lb at 250 kt; breakout 22 lb
out.a300 = { in_per_deg_low: r(4.0 / 30, 4), in_per_deg_250: r(1.3 / 9.3, 4), lb_above_bo_low: 65 - 22, lb_above_bo_250: 32 - 22 };

// ---------- generic actuator: first-order lag + rate limit, Euler at 240 Hz ----------
function stepResp(step, tau, rate, tEnd = 2, dt = 1 / 240) {
  let x = 0, t = 0, t90 = null; while (t < tEnd) { const v = Math.max(-rate, Math.min(rate, (step - x) / tau)); x += v * dt; t += dt; if (t90 === null && x >= 0.9 * step) t90 = t; } return { x, t90 };
}
out.actuator = {
  e737_10deg_tau0p05_r50: r(stepResp(10, 0.05, 50).t90, 3),
  e737_20deg_tau0p05_r50: r(stepResp(20, 0.05, 50).t90, 3),
  r737_20deg_tau0p05_r66: r(stepResp(20, 0.05, 66).t90, 3),
  a320_elev_10deg_tau0p06_r40: r(stepResp(10, 0.06, 40).t90, 3),
};
// ATR TLU with 5 kt hysteresis, simulated at 240 Hz (T-Y-20)
{ let pos = 0, tgt = 0, t = 0; const dt = 1 / 240, rec = {};
  const ias = tt => (tt < 20 ? 200 : tt < 30 ? 182 : 175);
  while (t < 50) { const v = ias(t); if (v > 185) tgt = 1; else if (v < 180) tgt = 0;
    pos += Math.max(-dt / 15, Math.min(dt / 15, tgt - pos)); t += dt;
    for (const k of [7.5, 15, 25, 37.5, 45]) if (Math.abs(t - k) < dt / 2) rec['t' + k] = r(27 + (3 - 27) * pos, 2); }
  out.tluSim = rec; }
// ATR PUM (T-Y-23): uncouple when opposing forces and |F_L - F_R| >= 100 daN (lower bound)
const pum = (fl, fr) => fl * fr < 0 && Math.abs(fl - fr) >= 100;
out.pum = { p55_m55: pum(55, -55), p40_m40: pum(40, -40) };
// force-cue marks (T-Y-28), 14 CFR 25.143(d)
out.cue_N = { pitch: [10, 50, 75].map(x => r(x * LB, 1)), roll: [5, 25, 50].map(x => r(x * LB, 1)), yaw: [20, 150].map(x => r(x * LB, 1)) };
console.log(JSON.stringify(out, null, 1));
