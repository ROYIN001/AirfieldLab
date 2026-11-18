// yrev_controls.mjs — independent reviewer recomputation of test expectations in 07-flight-controls.md
// Run: node yrev_controls.mjs   (Node >= 18). Written from the equations in the report, not copied from y_controls.mjs.
const KT = 0.514444, LBF = 4.4482216, IN = 0.0254, PSI = 6894.757, DEG = Math.PI / 180, RHO0 = 1.225;
const q = kcas => 0.5 * RHO0 * (kcas * KT) ** 2;          // Pa, CAS treated as EAS at sea level
const r = (x, n = 3) => +x.toFixed(n);
const interp = (xs, ys, x) => { if (x <= xs[0]) return ys[0]; for (let i = 1; i < xs.length; i++) if (x <= xs[i]) return ys[i-1] + (ys[i]-ys[i-1])*(x-xs[i-1])/(xs[i]-xs[i-1]); return ys.at(-1); };
const o = {};

// --- unit conversions used in text/JSON
o.conv = { psi3000_Pa: r(3000*PSI,0), psi180_Pa: r(180*PSI,0), psi1400_Pa: r(1400*PSI,0), psi850_Pa: r(850*PSI,0), psi1000_Pa: r(1000*PSI,0),
  lbf5900_N: r(5900*LBF,0), lbf60_N: r(60*LBF,1), lbf40_N: r(40*LBF,1), lbf70_N: r(70*LBF,1), lbf9_N: r(9*LBF,1), lbf10_N: r(10*LBF,1), lbf25_N: r(25*LBF,1), lbf50_N: r(50*LBF,1),
  in4_m: r(4*IN,4), m_per_deg_rudder: r(IN/6.5,5), pedal_grad_N_per_m: r((70-9)*LBF/(4*IN),0), jam_N_per_m: r(300*LBF/IN,0),
  daN5_lbf: r(50/LBF,2), daN3p5_lbf: r(35/LBF,2), daN50_lbf: r(500/LBF,1), daN55_lbf: r(550/LBF,1) };

// --- 737 rudder blowdown (T-Y-10, T-Y-11). Pressure reducer acts on system A only (ETEB p.1-4; Watts/Brady):
// main PCU force = F_A*(pA/3000) + F_B, F_A ~= F_B (NTSB p.29: "each ... about 3,000 pounds") => f = (1 + pA/3000)/2
const qb = 21/26 * q(190);
const dmax = (kcas, f = 1) => Math.min(26, 26 * f * qb / q(kcas));
const fA = pA => (1 + pA/3000) / 2;
o.blowdown = { q190: r(q(190),0), qb: r(qb,0), qb_kcas: r(Math.sqrt(2*qb/RHO0)/KT,1),
  d150: r(dmax(150),2), d190: r(dmax(190),2), d250: r(dmax(250),2), d280: r(dmax(280),2), d340: r(dmax(340),2),
  author_wholePCU_1000psi_250: r(dmax(250, 1/3),2), author_wholePCU_1800psi_250: r(dmax(250, 0.6),2),
  sysA_only_1000psi_f: r(fA(1000),4), sysA_only_1000psi_250: r(dmax(250, fA(1000)),2),
  sysA_only_1800psi_f: r(fA(1800),4), sysA_only_1800psi_250: r(dmax(250, fA(1800)),2),
  sysA_only_1000psi_190: r(dmax(190, fA(1000)),2), sysA_only_1000psi_280: r(dmax(280, fA(1000)),2) };
console.log(JSON.stringify(o, null, 1));

// ================= part 2: all other test expectations, recomputed independently =================
const p = {};
// 737 stabilizer (T-Y-01..06)
const stabDeg = u => 4 - u;
p.T01 = [0, -0.2, 4, 16.9].map(u => r(stabDeg(u), 2));
p.T02_author_fullMech_flapsUp_s = r(17.1 / 0.2, 2);                 // ignores electric limits
p.T02_flapsUp_electricLimits_3p9_14p5_s = r((14.5 - 3.9) / 0.2, 2);    // consistent with T-Y-06 limits
p.T02_flapsDn_m0p2_16p9_s = r(17.1 / 0.4, 2);
p.T03 = r(3 * 0.2, 3);
p.T04 = { t_2p5deg_at_0p27: r(2.5 / 0.27, 2), et302_rate: r((4.6 - 2.1) / 9, 3), knkt_rate: r((6.1 - 3.8) / 10, 3), knkt_vs_design_pct: r(100 * (1 - 0.23 / 0.27), 1) };
p.T05 = { flapsDn: r(10 * 0.27, 2), flapsUp: r(10 * 0.09, 2) };
p.T06 = Math.min(14.5, 4 + 0.2 * 120);
// 737 pedal (T-Y-07), linear feel 9..70 lbf over 0..4 in
const pedIn = d => d / 6.5, pedLb = x => 9 + (70 - 9) * Math.min(Math.abs(x), 4) / 4;
p.T07 = { in26: r(pedIn(26), 3), lb26: r(pedLb(pedIn(26)), 2), N26: r(pedLb(pedIn(26)) * LBF, 1), in13: r(pedIn(13), 2), lb13: r(pedLb(pedIn(13)), 2) };
p.T08 = { dual: r(26 / 66, 3), primary: r(26 / 33, 3) }; p.T09 = r(3 / 50, 3);
// 737 feel (T-Y-12, T-Y-13)
const Fbo = 4, deCal = 3.5 / 0.45, Kmax = (110 - Fbo) / deCal, qsat = q(340), kq = (1400 - 180) / qsat;
const pf = k => Math.min(1400, 180 + kq * q(k)), F = (k, de, efs = 1) => efs * (Fbo + Kmax * pf(k) / 1400 * de);
p.feel = { deCal: r(deCal, 3), Kmax_lb: r(Kmax, 3), Kmax_N: r(Kmax * LBF, 2), q340_Pa: r(qsat, 0), kq_psi_per_Pa: r(kq, 5), kq_SI_Pa_per_Pa: r(kq * PSI, 1),
  p150: r(pf(150), 1), F150: r(F(150, 5), 2), p250: r(pf(250), 1), F250: r(F(250, 5), 2), K250_lb: r(Kmax * pf(250) / 1400, 3), K250_N: r(Kmax * pf(250) / 1400 * LBF, 2), F340: r(F(340, deCal), 2),
  T13_EFS_whole_force: r(F(150, 5, 2), 2), T13_EFS_gradient_only: r(Fbo + 2 * Kmax * pf(150) / 1400 * 5, 2) };
// 737 spoiler mixing (T-Y-15) — table from 737-800YV low outboard
const sx = [0.149, 0.161, 0.172, 0.23, 0.483, 0.69, 0.839, 0.954, 0.966], sy = [0, 0.262478, 0.734767, 3.08542, 10.0735, 17.9607, 25.816, 32.5422, 33.0184];
p.T15 = [0.1, 0.5, 1.0].map(w => r(interp(sx, sy, w), 2));
// ATR (T-Y-18, 19, 21, 22, 23)
const atrSp = a => a <= 2.5 ? 0 : Math.min(57, 57 * (a - 2.5) / 11.5);
p.T18 = [2.5, 8, 14].map(a => r(atrSp(a), 2));
p.T19 = [r(23 / 11.25, 3), r(13 / 6.75, 3)];
{ const Sa = 1.5, ca = 0.45, rw = 0.18, G = 14 / 65; const Ch = 60 * LBF * rw / (2 * q(250) * Sa * ca * 14 * DEG * G);
  const Fw = (k, da) => 2 * q(k) * Sa * ca * Ch * da * DEG * G / rw / LBF;
  p.T21 = { Ch: r(Ch, 4), gearing: r(G / rw, 3), F250_14: r(Fw(250, 14), 2), F150_14: r(Fw(150, 14), 2), F180_7: r(Fw(180, 7), 2) }; }
{ const Se = 3.5, ce = 0.48, arm = 0.55, Ge = 23 / 11.25; const Ch = 500 * arm / (q(154) * Se * ce * 23 * DEG * Ge);
  const Fc = (k, de) => q(k) * Se * ce * Ch * de * DEG * Ge / arm / 10;
  p.T22 = { Ch: r(Ch, 4), gearing: r(Ge / arm, 3), F154_23: r(Fc(154, 23), 2), F200_5: r(Fc(200, 5), 2), F250_5: r(Fc(250, 5), 2),
    note_if_cert_force_is_one_elevator_Ch_x2: r(2 * Ch, 4) }; }
p.T23 = { a: (55 * -55 < 0) && Math.abs(55 + 55) >= 100, b: (40 * -40 < 0) && Math.abs(40 + 40) >= 100 };
// TLU (T-Y-20), 240 Hz, hysteresis
{ let pos = 0, tgt = 0; const dt = 1 / 240, rec = {}; const ias = t => t < 20 ? 200 : t < 30 ? 182 : 175;
  for (let n = 1; n <= 50 * 240; n++) { const t0 = (n - 1) * dt; const v = ias(t0); if (v > 185) tgt = 1; else if (v < 180) tgt = 0;
    pos += Math.max(-dt / 15, Math.min(dt / 15, tgt - pos)); const t = n * dt; for (const k of [7.5, 15, 25, 37.5, 45]) if (Math.abs(t - k) < 1e-9) rec[k] = r(27 - 24 * pos, 2); }
  p.T20 = rec; }
// A320 RTL & speedbrake (T-Y-24, 25)
p.T24 = [140, 180, 250, 290, 350].map(v => r(interp([100,160,200,240,320,380,400], [25,25,14.5,8.8,4.8,3.4,3.4], v), 2));
p.T25 = [0.25, 0.5, 0.75, 1].map(l => r(interp([0,0.05,0.051,0.5,1], [0,0,2,25,40], l), 2));
p.T27 = { pitch_lbf: r(50 / LBF, 2), roll_lbf: r(35 / LBF, 2) };
p.T28 = { pitch: [10, 50, 75].map(x => r(x * LBF, 1)), roll: [5, 25, 50].map(x => r(x * LBF, 1)), yaw: [20, 150].map(x => r(x * LBF, 1)), f25255_125lb: r(125 * LBF, 1), fstd_2lb: r(2 * LBF, 2) };
// actuator (T-Y-14): first-order lag + rate limit; Euler 240 Hz, and exact-discretisation for comparison
function t90(step, tau, rate, exact = false) { const dt = 1 / 240; let x = 0; for (let n = 1; n < 2400; n++) {
  let dx = exact ? (step - x) * (1 - Math.exp(-dt / tau)) : (step - x) / tau * dt; dx = Math.max(-rate * dt, Math.min(rate * dt, dx)); x += dx; if (x >= 0.9 * step) return r(n * dt, 3); } }
p.T14 = { e10: t90(10, 0.05, 50), e20: t90(20, 0.05, 50), r20_66: t90(20, 0.05, 66), a320_10: t90(10, 0.06, 40),
  e10_exact: t90(10, 0.05, 50, true), e20_exact: t90(20, 0.05, 50, true), analytic_lag_only_t90: r(0.05 * Math.log(10), 3) };
// misc
p.misc = { af447_ths_dps: r(10 / 60, 3), atr_vmo_q: r(q(250), 0), sb737_rate: r(33 / 0.6, 1), atr_spoiler_gain: r(57 / 11.5, 3), tlu_rate: r(1 / 15, 4),
  stab_full_0p2: r(17.1 / 0.2, 1), stab_full_0p4: r(17.1 / 0.4, 2), Lemme_3p9u_deg: r(stabDeg(3.9), 1), Lemme_14p5u_deg: r(stabDeg(14.5), 1) };
console.log(JSON.stringify(p, null, 1));
