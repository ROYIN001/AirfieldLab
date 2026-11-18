// b_aero.mjs — Boeing 737-800 data card (round 3, topic 3.2): Vref fit, CLmax per detent,
// lift-curve slope, downwash, neutral point, derivatives, drag polar, Mach drag.
// All outputs are ESTIMATES (est:true) unless they reproduce a quoted source number.
// Run: node b_aero.mjs
const g = 9.80665, rho0 = 1.225, KT = 0.514444, DEG = Math.PI / 180;
const S = 124.6, b = 34.32, bW = 35.79, c = 4.17, cTCDS = 3.96; // [B1][B3][B11][B12]
const A = b * b / S, lam = 0.278, sweepC4 = 25 * DEG;            // [B11]
const f = (x, n = 3) => Number(x.toFixed(n));
const out = {};

// ── 1. Vref = k * sqrt(m) fits (CAS ~ EAS at sea level) ──
const v40pts = [[76400, 149], [66400, 139]];        // ATSB AO-2014-162 [B17]
const v30pts = [[65317, 143]];                      // JCAA AA331 (144,000 lb) [B18]
const fitK = pts => pts.reduce((s, [m, v]) => s + v * Math.sqrt(m), 0) / pts.reduce((s, [m]) => s + m, 0);
const k40 = fitK(v40pts), k30 = fitK(v30pts);
const CLat = k => 2 * g / (rho0 * S * (k * KT) ** 2);  // CL at Vref, independent of mass
out.k40 = f(k40, 5); out.k30 = f(k30, 5);
out.residual40 = v40pts.map(([m, v]) => f(k40 * Math.sqrt(m) - v, 2));
out.CLref40 = f(CLat(k40)); out.CLref30 = f(CLat(k30));
const RVREF = 1.23;                                  // 14 CFR 25.125(b)(2)(i) [B36]
const CLmax40 = CLat(k40) * RVREF ** 2, CLmax30 = CLat(k30) * RVREF ** 2;
out.CLmax40 = f(CLmax40); out.CLmax30 = f(CLmax30);
out.CLmax40_if_ratio_1_27 = f(CLat(k40) * 1.27 ** 2);   // sensitivity (PPRuNe 737-9 126-128 %) [B28]
// ── 2. Flap manoeuvre speeds Vref40 + additive [B28]; assumed Vman = rm * VS1g(flap) ──
const add = { '0': 70, '1': 50, '5': 30, '15': 20 };
const rm = 1.33;                                      // chosen so that V2(76.4 t) >= 1.13 VSR(F5) holds (see below)
const CLmax = { '40': CLmax40, '30': CLmax30 };
for (const [d, a] of Object.entries(add)) {
  // VS1g(d) = (Vref40 + a)/rm ; CL ratio uses Vref40 at a reference mass 60 t
  const m = 60000, v40 = k40 * Math.sqrt(m), vs40 = v40 / RVREF, vsd = (v40 + a) / rm;
  CLmax[d] = CLmax40 * (vs40 / vsd) ** 2;
}
const lin = (x0, y0, x1, y1, x) => y0 + (y1 - y0) * (x - x0) / (x1 - x0);
CLmax['2'] = lin(1, CLmax['1'], 5, CLmax['5'], 2);
CLmax['10'] = lin(5, CLmax['5'], 15, CLmax['15'], 10);
CLmax['25'] = lin(15, CLmax['15'], 30, CLmax['30'], 25);
const det = ['0', '1', '2', '5', '10', '15', '25', '30', '40'];
out.CLmax = Object.fromEntries(det.map(d => [d, f(CLmax[d])]));
// V2 check: ATSB V2 158 kt at 76.4 t; 14 CFR 25.107(b)(1) V2min = 1.13 VSR [B36]
const VS = (m, CL) => Math.sqrt(2 * m * g / (rho0 * S * CL)) / KT;
out.V2_over_VSR_F5_76400 = f(158 / VS(76400, CLmax['5']));
out.V2_over_VSR_F1_76400 = f(158 / VS(76400, CLmax['1']));
out.V2_over_VSR_F10_76400 = f(158 / VS(76400, CLmax['10']));
// VS1g / Vref tables
const masses = [40000, 45000, 50000, 55000, 60000, 65000, 66361, 70000, 75000, 79015];
out.VSR_table = masses.map(m => [m, ...det.map(d => f(VS(m, CLmax[d]), 1))]);
out.Vref_table = masses.map(m => [m, f(k30 * Math.sqrt(m), 1), f(k40 * Math.sqrt(m), 1)]);
out.Vref40_MLW = f(k40 * Math.sqrt(66361), 1); out.Vref30_MLW = f(k30 * Math.sqrt(66361), 1);
out.Boeing_app_142_vs_k30_k40 = [out.Vref30_MLW, out.Vref40_MLW];

// ── 3. Lift-curve slope (Helmbold/DATCOM form, Raymer eq. 12.6) ──
const tanHalf = (A_, tanc4, l) => tanc4 - (4 / A_) * 0.25 * (1 - l) / (1 + l);
const CLaH = (A_, tanc2, M, eta = 0.95, F = 0.98) => {
  const beta = Math.sqrt(1 - M * M);
  return 2 * Math.PI * A_ / (2 + Math.sqrt(4 + (A_ * A_ * beta * beta / (eta * eta)) * (1 + tanc2 * tanc2 / (beta * beta)))) * F;
};
const tc2 = tanHalf(A, Math.tan(sweepC4), lam);
const aw = M => CLaH(A, tc2, M);
// horizontal tail [B11]: S_h 32.40, AR 5.54, taper 0.186, sweep 30, l_h 17.68
const Sh = 32.40, Ah = 5.54, lh = 17.68, lamh = 0.186, eta_t = 0.90;
const at = M => CLaH(Ah, tanHalf(Ah, Math.tan(30 * DEG), lamh), M, 0.95, 1.0);
// DATCOM downwash gradient (Roskam / DATCOM 4.4.1): deda = 4.44 [KA Kl KH sqrt(cos c/4)]^1.19 * CLa(M)/CLa(0)
const hH = 5.56 - 2.4;   // stab height above ground (ACAPS 5.49-5.64 m [B1]) minus est wing-root height 2.4 m
const KA = 1 / A - 1 / (1 + A ** 1.7), Kl = (10 - 3 * lam) / 7, KH = (1 - Math.abs(hH / b)) / Math.cbrt(2 * lh / b);
const deda = M => 4.44 * Math.pow(KA * Kl * KH * Math.sqrt(Math.cos(sweepC4)), 1.19) * aw(M) / aw(0);
const VH = Sh * lh / (S * c);
const aTot = M => aw(M) + at(M) * eta_t * (Sh / S) * (1 - deda(M));
out.A_noWinglet = f(A, 3); out.A_winglet_geom = f(bW * bW / S, 3); out.tanLambda_c2 = f(tc2, 4);
out.CLa_wb = { 'M0.2': f(aw(0.2)), 'M0.5': f(aw(0.5)), 'M0.785': f(aw(0.785)) };
out.a_t = f(at(0.2)); out.deda = { 'M0.2': f(deda(0.2)), 'M0.785': f(deda(0.785)) };
out.VH = f(VH); out.CLa_total = { 'M0.2': f(aTot(0.2)), 'M0.5': f(aTot(0.5)), 'M0.785': f(aTot(0.785)) };

// ── 4. Neutral point and Cm_alpha at 25 % MAC (Perkins-Hage fuselage, Torenbeek nacelles) ──
const wf = 3.76, Lf = 38.08;                       // [B12][B11]
const Kf = 0.019;                                  // per deg, chart value at wing c/4 ~43 % of body length (est)
const Cma_fus = Kf * wf * wf * Lf / (S * c) / DEG; // per rad
const dx_fus = -Cma_fus / aw(0.2);
const bn = 2.06, ln = 4.5;                         // nacelle width [B11], est distance nacelle inlet to c/4 MAC
const dx_nac = 2 * (-4.0) * bn * bn * ln / (S * c * aw(0.2));
const hn = 0.25 + dx_fus + dx_nac + eta_t * VH * (at(0.2) / aTot(0.2)) * (1 - deda(0.2));
out.dx_fus = f(dx_fus); out.dx_nac = f(dx_nac); out.h_n = f(hn);
const Cma25 = -aTot(0.2) * (hn - 0.25);
out.Cma_at25 = f(Cma25); out.SM_at_fwd6 = f(hn - 0.06); out.SM_at_aft36 = f(hn - 0.36);

// ── 5. Tail-based dynamic derivatives (Etkin/Roskam forms) ──
const CLq = 2 * eta_t * at(0.2) * VH, CLadot = CLq * deda(0.2);
const Cmq_t = -2 * eta_t * at(0.2) * VH * lh / c, Cmq = 1.1 * Cmq_t, Cmadot = Cmq_t * deda(0.2);
const tau_e = 0.40;                                // elevator effectiveness (est, elevator chord ~25-30 %)
const CLde = eta_t * at(0.2) * (Sh / S) * tau_e, Cmde = -eta_t * at(0.2) * VH * tau_e;
Object.assign(out, { CLq: f(CLq), CLadot: f(CLadot), Cmq: f(Cmq), Cmadot: f(Cmadot), CLde: f(CLde), Cmde: f(Cmde) });
// vertical tail [B11]: S_v 23.13, h 6.00, AR 1.56, sweep 35, arm 17.7; est z_v 3.5 m above CG
const Sv = 23.13, lv = 17.7, zv = 3.5, av = 2.5, eta_v = 0.9, tau_r = 0.55;
const Vv = Sv * lv / (S * b);
const Cnb_v = eta_v * av * Vv * 1.1, Cnb_fus = -0.07, Cnb = Cnb_v + Cnb_fus;
const CYb_v = -eta_v * av * Sv / S;
const CYb = CYb_v - 0.45;                          // + fuselage/wing est
const Cnr = -2 * eta_v * av * Sv * lv * lv / (S * b * b);
const CYr = 2 * eta_v * av * Vv;
const CYdr = av * eta_v * tau_r * Sv / S, Cndr = -CYdr * lv / b, Cldr = CYdr * zv / b;
const ClbG = -(aw(0.2) * 6 * DEG / 6) * (1 + 2 * lam) / (1 + lam);
const ClbS = CL => -CL * Math.tan(sweepC4) * (1 + 2 * lam) / (6 * (1 + lam));
const Clb_v = CYb_v * zv / b, Clb_lowwing = 0.03;
const Clb = CL => ClbG + ClbS(CL) + Clb_v + Clb_lowwing;
const Clp_strip = -(aw(0.2) / 12) * (1 + 3 * lam) / (1 + lam) * Math.cos(sweepC4);
Object.assign(out, { Vv: f(Vv), Cnb: f(Cnb), CYb: f(CYb), Cnr_tail: f(Cnr), CYr: f(CYr), CYdr: f(CYdr), Cndr: f(Cndr), Cldr: f(Cldr),
  Clb_CL0_5: f(Clb(0.5)), Clb_CL1_45: f(Clb(1.45)), Clp_strip: f(Clp_strip),
  Clr_CL0_5: f(0.5 / 4 + 0.02), Clr_CL1_45: f(1.45 / 4 + 0.02), Cnp_CL0_5: f(-0.5 / 8), Cnp_CL1_45: f(-1.45 / 8),
  Cnr_CL0_5: f(Cnr - 0.02), Cnr_CL1_45: f(Cnr - 0.05) });
// spiral stability check (Clb*Cnr > Clr*Cnb)
out.spiral_margin_app = f(Clb(1.45) * (Cnr - 0.05) - (1.45 / 4 + 0.02) * Cnb, 4);

// ── 6. Approach trim: CL at Vref+5 (independent of mass to <0.5 %), alpha from FCTM pitch + 3 deg path ──
const m60 = 60000;
const CLapp = (k, m) => 2 * m * g / (rho0 * S * ((k * Math.sqrt(m) + 5) * KT) ** 2);
const th30 = 2.4, th40 = 1.4;                       // FCTM via [B30]
const aL = aTot(0.2) * 1.0;                         // use same slope with flaps (est)
out.CLapp30_60t = f(CLapp(k30, m60)); out.CLapp40_60t = f(CLapp(k40, m60));
out.CLapp30_45t = f(CLapp(k30, 45000)); out.CLapp30_66t = f(CLapp(k30, 66361));
const CL0_30 = CLapp(k30, m60) - aL * (th30 + 3) * DEG, CL0_40 = CLapp(k40, m60) - aL * (th40 + 3) * DEG;
out.CL0_30 = f(CL0_30); out.CL0_40 = f(CL0_40);
const CL0_0 = 0.20;                                 // JSBSim CL(alpha=0) clean [B13], est
// intermediate CL0: Fowler extension first, deflection later (est shape) — fraction of dCL0(40)
const frac = { '0': 0, '1': 0.10, '2': 0.15, '5': 0.27, '10': 0.40, '15': 0.52, '25': 0.68, '30': (CL0_30 - CL0_0) / (CL0_40 - CL0_0), '40': 1 };
const CL0 = Object.fromEntries(det.map(d => [d, CL0_0 + frac[d] * (CL0_40 - CL0_0)]));
out.CL0 = Object.fromEntries(det.map(d => [d, f(CL0[d])]));
out.frac_legacy = Object.fromEntries(det.map(d => [d, f(frac[d])]));
out.alpha_CLmax_lin_deg = Object.fromEntries(det.map(d => [d, f((CLmax[d] - CL0[d]) / aTot(0.2) / DEG, 1)]));
// cruise trim check: M0.785 FL350 ISA, 65 t
const rho350 = 0.37960, a350 = 296.54;               // USSA-1976 at 10,668 m
const V350 = 0.785 * a350, q350 = 0.5 * rho350 * V350 * V350, CLcr = 65000 * g / (q350 * S);
out.CL_cruise = f(CLcr); out.alpha_cruise_deg = f((CLcr - CL0_0) / aTot(0.785) / DEG, 2);

// ── 7. Drag polar (OpenAP clean + gear [B14][B16]; flap dCD0 scaled to JSBSim 0.059 at flaps 40 [B13]) ──
const CD0c = 0.019, K = 0.042, CDgear = 0.017;
const flapDeg = { '0': 0, '1': 1, '2': 2, '5': 5, '10': 10, '15': 15, '25': 25, '30': 30, '40': 40 };
const slat = d => (d === '0' ? 0 : 0.003);           // LE device drag est
const dCD0 = d => 0.059 * Math.sin(flapDeg[d] * DEG) ** 2 / Math.sin(40 * DEG) ** 2 + slat(d);
const Kf_ = d => 1 / (1 / K + Math.PI * A * 0.0026 * flapDeg[d]);   // OpenAP/Obert fig 27.39
out.dCD0 = Object.fromEntries(det.map(d => [d, f(dCD0(d), 4)]));
out.K_flap = Object.fromEntries(det.map(d => [d, f(Kf_(d), 4)]));
out.openap_dCDflap_40 = f(0.9 * 0.15 ** 1.38 * 0.15 * Math.sin(40 * DEG) ** 2, 4);
out.openap_dCDgear = f(79000 * g / S * 3.16e-5 * 79000 ** -0.215, 4);
out.LDmax_clean = f(1 / (2 * Math.sqrt(CD0c * K)), 2);
out.CL_LDmax = f(Math.sqrt(CD0c / K), 3);
const LDapp = d => { const CL = d === '30' ? CLapp(k30, m60) : CLapp(k40, m60); return CL / (CD0c + dCD0(d) + CDgear + Kf_(d) * CL * CL); };
out.LD_app30 = f(LDapp('30'), 2); out.LD_app40 = f(LDapp('40'), 2);
out.Treq_app30_60t_kN = f(m60 * g * (1 / LDapp('30') - Math.sin(3 * DEG)) / 1000, 1);
out.Treq_app40_60t_kN = f(m60 * g * (1 / LDapp('40') - Math.sin(3 * DEG)) / 1000, 1);
out.Treq_app30_frac_of_2x117kN = f(out.Treq_app30_60t_kN / 234, 3);
// cruise drag
const CDcr0 = CD0c + K * CLcr * CLcr;
// Mach drag (OpenAP / Gur et al. 2010): Mcrit = 0.95/cos - tc/cos^2 - 0.1 CL/cos^3 - 0.108; dCDw = 20 (M-Mcrit)^4
const tc = 0.12, cs = Math.cos(sweepC4);
const Mcrit = CL => 0.95 / cs - tc / cs ** 2 - 0.1 * CL / cs ** 3 - 0.108;
const dCDw = (M, CL) => 20 * Math.max(0, M - Mcrit(CL)) ** 4;
out.Mcrit_CL0_5 = f(Mcrit(0.5)); out.MDD_Korn_CL0_5 = f(Mcrit(0.5) + 0.108);
out.CD_wave = [0.70, 0.74, 0.76, 0.78, 0.785, 0.80, 0.82, 0.84].map(M => [M, f(dCDw(M, 0.5), 5)]);
out.cruise_drag_kN = f((CDcr0 + dCDw(0.785, CLcr)) * q350 * S / 1000, 1);
out.cruise_LD = f(CLcr / (CDcr0 + dCDw(0.785, CLcr)), 2);
console.log(JSON.stringify(out, null, 1));
