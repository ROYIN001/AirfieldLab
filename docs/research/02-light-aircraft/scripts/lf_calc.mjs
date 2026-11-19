#!/usr/bin/env node
// lf_calc.mjs — derived numbers for the Cessna 152 (+C150H) short data card (topic 11, code LF).
// Every input fact carries its source code (LF1..LF10 in 11-c152.md §11.14); everything computed here is either a unit
// conversion / definition (conf สูง) or an ESTIMATE (ค่าประมาณ) made with the LM tools of 01-methods.md.
// Run from the repo root:  node <this folder>/lf_calc.mjs [--json]   → scripts/out/lf_calc.json
// Pure Node >= 18, no dependencies. Uses lm_polar, lm_inertia, lm_prop, lm_engine, lm_derivs, lm_lib.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { clmaxFromStall, polarFromGlide, toSimPolar, pointFromCruise, simPolarEmax, rhoISA } from './lm_polar.mjs';
import { inertiaFromRadii, RADII } from './lm_inertia.mjs';
import { PROPS, staticRpm, calibrateChord, bem, figureOfMerit } from './lm_prop.mjs';
import { lapse, fitBsfc, isa } from './lm_engine.mjs';
import { estimate, geoFromCard } from './lm_derivs.mjs';
import { loadType, val, isMainModule } from './lm_lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const LB = 0.45359237, IN = 0.0254, FT = 0.3048, KT = 0.514444, HP = 745.69987, G0 = 9.80665, GAL = 3.785411784;
const r = (x, n = 4) => +(+x).toPrecision(n);

// ───────── input facts (sources in 11-c152.md §11.14) ─────────
export const F = {
  // LF1 = 1980 Model 152 Information Manual; LF2 = FAA TCDS 3A19 Rev 45; LF3 = service-manual data (blog copy); LF4 = Wikipedia
  mtow_lb: 1670, ramp_lb: 1675, mlw_lb: 1670,                       // LF1 p1-5, LF2
  bew_lb: 1109, bew2_lb: 1142, useful_lb: 566, useful2_lb: 533,     // LF1 p1-5 (152 / 152 II)
  fuel_std_gal: [26, 24.5], fuel_lr_gal: [39, 37.5], fuel_arm_in: 42.0, avgas_lb_per_gal: 6.0, // LF1 p1-3, LF2; 6 lb/gal (PHAK, LM4)
  S_ft2: 159.5,                                                      // LF1 p1-2 (Wikipedia 160 ft2)
  span_in: 400.0, length_in: 284.84, height_in: 102.0, track_in: 91.28, tailspan_in: 120.0, // LF3
  length_wiki_m: 7.34, wheelbase_in: 58, turn_radius_ft: 24 + 8 / 12, // LF4; LF1 p1-2
  cg: { datum: 'front face of firewall', fwd: [[1350, 31.0], [1670, 32.65]], aft_in: 36.5 }, // LF1 p2-5, LF2
  seat_arm_in: 39, oil_arm_in: -14.7,                                 // LF2
  vs: { fwd: { '0': [40, 48], '10': [40, 46], '30': [35, 43] }, aft: { '0': [36, 46], '10': [36, 43], '30': [31, 41] } }, // LF1 Fig 5-3 [KIAS, KCAS] 0° bank
  stall_bank: { bank: [0, 30, 45, 60],
    fwd: { '0': [[40, 48], [43, 52], [48, 57], [57, 68]], '10': [[40, 46], [43, 49], [48, 55], [57, 65]], '30': [[35, 43], [38, 46], [42, 51], [49, 61]] },
    aft: { '0': [[36, 46], [39, 49], [43, 55], [51, 65]], '10': [[36, 43], [39, 46], [43, 51], [51, 61]], '30': [[31, 41], [33, 44], [37, 49], [44, 58]] } },
  ias_cas: { '0': [[40, 46], [50, 53], [60, 60], [70, 69], [80, 78], [90, 88], [100, 97], [110, 107], [120, 117], [130, 127], [140, 136]],
    '10': [[40, 44], [50, 52], [60, 61], [70, 70], [80, 80], [85, 84]], '30': [[40, 43], [50, 51], [60, 61], [70, 71], [80, 82], [85, 87]] }, // LF1 Fig 5-1 p5-8; LF5 Fig 5-1 p5-7 (review 2026-11-19: flaps 10 at 60 KIAS = 61 KCAS, rows 85 KIAS added)
  kias: { VX: 55, VY: 67, VY10k: 61, VR: 50, V50_short: 54, VAPP: 60, VAPP_range: [55, 65], VAPP_short: 54, VG: 60, VA: { 1350: 93, 1500: 98, 1670: 104 },
    VNO: 111, VNE: 149, VFE: 85, balked: 55, xwind_kt: 12 },          // LF1 p2-3, 3-3, 4-3, 4-8
  kcas: { VA: { 1350: 91, 1500: 96, 1670: 101 }, VNO: 108, VNE: 145, VFE: 87 }, // LF1 p2-3
  roc_sl_fpm: 715, ceiling_ft: 14700,                                 // LF1 specs page
  roc_table: { PA_ft: [0, 2000, 4000, 6000, 8000, 10000, 12000], OAT_C: [-20, 0, 20, 40], kias: [67, 66, 65, 63, 62, 61, 60],
    data: [[835, 765, 700, 630], [735, 670, 600, 535], [635, 570, 505, 445], [535, 475, 415, 355], [440, 380, 320, 265], [340, 285, 230, 175], [245, 190, 135, 85]] }, // LF1 Fig 5-5
  to: { gr_ft: 725, d50_ft: 1340 }, ldg: { gr_ft: 475, d50_ft: 1200 },   // LF1 specs page
  to_table: { PA_ft: [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000], OAT_C: [0, 10, 20, 30, 40],
    roll_ft: [[640, 695, 755, 810, 875], [705, 765, 825, 890, 960], [775, 840, 910, 980, 1055], [855, 925, 1000, 1080, 1165], [940, 1020, 1100, 1190, 1285], [1040, 1125, 1215, 1315, 1420], [1145, 1245, 1345, 1455, 1570], [1270, 1375, 1490, 1615, 1745], [1405, 1525, 1655, 1795, 1940]],
    total50_ft: [[1190, 1290, 1390, 1495, 1605], [1310, 1420, 1530, 1645, 1770], [1445, 1565, 1690, 1820, 1960], [1600, 1730, 1870, 2020, 2185], [1775, 1920, 2080, 2250, 2440], [1970, 2140, 2320, 2525, 2750], [2200, 2395, 2610, 2855, 3125], [2470, 2705, 2960, 3255, 3590], [2800, 3080, 3395, 3765, 4195]] }, // LF1 Fig 5-4 (flaps 10, short field)
  ldg_table: { PA_ft: [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000], OAT_C: [0, 10, 20, 30, 40],
    roll_ft: [[450, 465, 485, 500, 515], [465, 485, 500, 520, 535], [485, 500, 520, 535, 555], [500, 520, 540, 560, 575], [520, 540, 560, 580, 600], [540, 560, 580, 600, 620], [560, 580, 605, 625, 645], [585, 605, 625, 650, 670], [605, 630, 650, 675, 695]],
    total50_ft: [[1160, 1185, 1215, 1240, 1265], [1185, 1215, 1240, 1270, 1295], [1215, 1240, 1270, 1300, 1330], [1240, 1275, 1305, 1335, 1360], [1275, 1305, 1335, 1370, 1400], [1305, 1335, 1370, 1400, 1435], [1340, 1370, 1410, 1440, 1475], [1375, 1410, 1440, 1480, 1515], [1410, 1450, 1480, 1520, 1555]] }, // LF1 Landing Distance chart p5-19 (Fig 5-10 in the TOC and text; the OCR caption reads 5-11) (flaps 30, 54 KIAS)
  corrections: { headwind_pct_per_kt: 10 / 9, tailwind_pct_per_kt: 10 / 2, tailwind_max_kt: 10, grass_to_pct_of_roll: 15, grass_ldg_pct_of_roll: 45, flaps_up_ldg_pct: 35 }, // LF5 Fig 5-4 notes p5-10 and landing chart p5-18; LF1 p5-11, p5-19 (grass, flaps up)
  cruise_2000ft: [{ rpm: 2400, pct: 75, ktas: 101, gph: 6.1 }, { rpm: 2300, pct: 66, ktas: 96, gph: 5.4 }, { rpm: 2200, pct: 59, ktas: 91, gph: 4.8 }, { rpm: 2100, pct: 53, ktas: 86, gph: 4.3 }, { rpm: 2000, pct: 47, ktas: 80, gph: 3.9 }], // LF1 Fig 5-7
  glide: { kias: 60, ratio_faa: 1.5 * 6076.12 / 1000, ratio_poh_axis: 1.6 * 6076.12 / 1000 },   // LF1 p3-3; LF6 (1.5 NM/1000 ft); LF5 Fig 3-1 axis (1.6)
  engine: { model: 'Lycoming O-235-L2C', hp: 110, rpm: 2550, disp_in3: 233.3, dry_lb: 249, static_rpm: [2280, 2380] }, // LF1, LF2, LF7
  prop: { model: 'McCauley 1A103/TCM6958', D_in: [67.5, 69], pitch_in: 58, mass_lb: 23.2, arm_in: -36.5 }, // LF2 (pitch from designation, conf กลาง)
  travel: { elev: { up: 25, down: 18 }, ail: { up: 20, down: 15 }, rud: 23, rud_wl: 20.5, flap: 30, tab: { up: 10, down: 20 } }, // LF2, LF3
  tyres: { main: { size: '15x6.00-6 (6.00-6) 4 ply', psi: 29 }, nose: { size: '5.00-5 4 ply', psi: 30 }, nose_strut_psi: 20 }, // LF3
  steering: { pedal: 8.5, brakes: 30 },                                // LF10
  c150h: { mtow_lb: 1600, hp: 100, rpm: 2750, fuel_gal: [26, 22.5], cg: { fwd: [[1280, 31.5], [1600, 32.9]], aft_in: 37.5 },
    vne_mph_cas: 162, vno_mph_cas: 120, va_mph_cas: 109, vfe_mph_cas: 100, flap: 40, elev: { up: 25, down: 15 }, ail: { up: 20, down: 14 },
    stall_mph_cas: { '0': 55, '20': 49, '40': 48 }, roc_sl: 670, ceiling: 12650, to: [735, 1385], ldg: [445, 1075], vy_mph: 73, vg_mph: 65, short_app_mph: 58,
    ias_cas_mph: { up: [[40, 51], [60, 65], [80, 82], [100, 100], [120, 118], [140, 136]], down: [[40, 49], [60, 63], [80, 81], [100, 98]] } }, // LF2, LF8
};

const lin = (xs, ys, x) => { let i = 0; while (i < xs.length - 2 && x > xs[i + 1]) i++; return ys[i] + (x - xs[i]) / (xs[i + 1] - xs[i]) * (ys[i + 1] - ys[i]); };
export const iasToCas = (det, kias) => { const t = F.ias_cas[det]; return lin(t.map(p => p[0]), t.map(p => p[1]), kias); };

export function compute() {
  const out = { units: {}, geom: {}, weights: {}, cg: {}, inertia: {}, stall: {}, polar: {}, prop: {}, engine: {}, perf: {}, derivs: {}, c150h: {} };
  const m = F.mtow_lb * LB, S = F.S_ft2 * FT * FT, b = F.span_in * IN, L = F.length_in * IN, AR = b * b / S;
  // ── geometry (MAC/LEMAC are ESTIMATES: not in TCDS 3A19 or the POH)
  const taper = 0.70;   // ค่าประมาณ: same equivalent single-taper wing as the C172S card (constant-chord inboard + tapered outboard)
  const cr = 2 * S / (b * (1 + taper)), mac = 2 / 3 * cr * (1 + taper + taper * taper) / (1 + taper);
  // LEMAC: C172S fuel tanks at +48.0 in with LEMAC +25.9 in (TCDS 3A12/IM.A.051, card 04) → tank arm 22.1 in aft of LEMAC;
  // the C152 tanks (same wing structure family) are at +42.0 in (TCDS 3A19) ⇒ LEMAC ≈ 42.0 − 22.1 = 19.9 in (ค่าประมาณ)
  const lemac_in = F.fuel_arm_in - (48.0 - 25.9), mac_in = mac / IN;
  const pct = x_in => 100 * (x_in - lemac_in) / mac_in;
  out.geom = { S, b, L, AR, taper, c_root: cr, c_tip: cr * taper, MAC: mac, MAC_in: mac_in, LEMAC_in: lemac_in, LEMAC_m: lemac_in * IN,
    height: F.height_in * IN, track: F.track_in * IN, wheelbase: F.wheelbase_in * IN, b_h: F.tailspan_in * IN, mgc: S / b, turn_radius_m: F.turn_radius_ft * FT,
    wing_loading_lb_ft2: F.mtow_lb / F.S_ft2, power_loading_lb_hp: F.mtow_lb / F.engine.hp };
  // tail (ค่าประมาณ): span 3.048 m (LF3); chord like C172 class (TM-80163: S_h 3.35 m2 on b_h 3.45 m ⇒ 0.97 m) ⇒ S_h ≈ 2.9 m2;
  // tail arm scaled from C172 (4.36 m) by overall length 7.235/8.205
  const S_h = 0.95 * out.geom.b_h, l_h = 4.36 * L / 8.205, S_v = 1.39 * 0.92, b_v = 1.55;
  out.geom.tail = { S_h, b_h: out.geom.b_h, l_h, S_v, b_v, l_v: l_h, VH: S_h * l_h / (S * mac), VV: S_v * l_h / (S * b) };
  // ── weights
  const fuelStdKg = F.fuel_std_gal[1] * F.avgas_lb_per_gal * LB, fuelLrKg = F.fuel_lr_gal[1] * F.avgas_lb_per_gal * LB;
  const trainFuelGal = 20, crew = 85 + 75;
  const tm = F.bew_lb * LB + crew + trainFuelGal * F.avgas_lb_per_gal * LB;
  out.weights = { MTOW: m, MRW: F.ramp_lb * LB, MLW: F.mlw_lb * LB, BEW: F.bew_lb * LB, BEW_II: F.bew2_lb * LB, useful: F.useful_lb * LB, fuel_std_usable_kg: fuelStdKg, fuel_lr_usable_kg: fuelLrKg,
    fuel_std_usable_L: F.fuel_std_gal[1] * GAL, fuel_lr_usable_L: F.fuel_lr_gal[1] * GAL, training_mass: tm, training_mass_lb: tm / LB, trainFuelGal,
    full_std_fuel_two_adults_kg: F.bew_lb * LB + crew + fuelStdKg };
  // ── CG
  const env = F.cg.fwd.map(([w, x]) => [w * LB, x * IN, F.cg.aft_in * IN]);
  const ref_in = 34.0;
  out.cg = { envelope: env, envelope_pct: F.cg.fwd.map(([w, x]) => [w, r(pct(x), 3), r(pct(F.cg.aft_in), 3)]), ref_in, ref_m: ref_in * IN, ref_pct: pct(ref_in),
    // training-mass CG (ค่าประมาณ): BEW CG not published for the type; sample ≈ 30.5 in? we only check the mass-weighted crew/fuel arms
    crew_arm_in: F.seat_arm_in, fuel_arm_in: F.fuel_arm_in };
  // ── inertia (ค่าประมาณ): radii from NASA TM-80163 (C172 class, flight test) as in card 04, plus class single_prop (01-methods §01.4)
  const rTM = { Rx: 0.235, Ry: 0.324, Rz: 0.364 };
  const I_tm = inertiaFromRadii({ m, b, L, ...rTM }), I_cls = inertiaFromRadii({ m, b, L, ...RADII.single_prop });
  out.inertia = { ref_mass: m, radii_tm80163: rTM, tm80163: I_tm, Ixz: I_tm.Ixx * 123 / 1395, class_single_prop: I_cls, radii_class: RADII.single_prop };
  // ── stall → CLmax (1 g, trimmed, CG fwd, MTOW, min-speed nz 0.95) per detent; aft-CG check
  for (const cgk of ['fwd', 'aft']) {
    out.stall[cgk] = {};
    for (const [det, [kias, kcas]] of Object.entries(F.vs[cgk])) { const c = clmaxFromStall({ mass: m, S, vs_kcas: kcas, kind: 'min', nzAtVmin: 0.95 }); out.stall[cgk][det] = { kias, kcas, CLmax_1g: c.CLmax_1g, V1g_kcas: c.V1g_kcas, CLapp: c.CLapparent }; }
  }
  const f = out.stall.fwd;
  f['20'] = { kcas: null, CLmax_1g: 0.5 * (f['10'].CLmax_1g + f['30'].CLmax_1g), interp: true };
  // flap increments: dCL0 = ΔCLmax (same stall α assumed, as card 04); dCD0, dCm0 from card 04 (JSBSim c172r tables, same flap family)
  const c172 = { '10': { dCD0: 0.0069, dCm0: -0.0518 }, '20': { dCD0: 0.0124, dCm0: -0.0762 }, '30': { dCD0: 0.0193, dCm0: -0.0864 } };
  out.stall.detents = ['0', '10', '20', '30'].map(k => ({ name: k, flap_deg: +k, VFE_kt: k === '0' ? undefined : F.kias.VFE, dCL0: r(f[k].CLmax_1g - f['0'].CLmax_1g, 4),
    dCD0: k === '0' ? 0 : c172[k].dCD0, dCm0: k === '0' ? 0 : c172[k].dCm0, CLmax: r(f[k].CLmax_1g, 4) }));
  const full = out.stall.detents[3].dCL0; out.stall.detents.forEach(d => { d.f_lift = r(d.dCL0 / full, 4); });
  out.stall.cg_effect_kt = { '0': F.vs.fwd['0'][1] - F.vs.aft['0'][1], '10': F.vs.fwd['10'][1] - F.vs.aft['10'][1], '30': F.vs.fwd['30'][1] - F.vs.aft['30'][1] };
  // load-factor check of the bank table: V(φ) = V(0)/√cos φ (fwd CG, KCAS)
  out.stall.bank_check = F.stall_bank.bank.map((ph, i) => ({ bank: ph, table_kcas_0: F.stall_bank.fwd['0'][i][1], theory_kcas_0: r(48 / Math.sqrt(Math.cos(ph * Math.PI / 180)), 3) }));
  // ── polar
  const vbg = iasToCas('0', F.glide.kias);
  const pg = polarFromGlide({ mass: m, S, v_kcas: vbg, E: F.glide.ratio_faa, AR }), pgPOH = polarFromGlide({ mass: m, S, v_kcas: vbg, E: F.glide.ratio_poh_axis, AR });
  const sim = toSimPolar({ CD0: pg.CD0, K: pg.K });
  const cr2k = F.cruise_2000ft.map(c => ({ ...c, ...pointFromCruise({ mass: m, S, ktas: c.ktas, h_m: 2000 * FT, P_W: c.pct / 100 * F.engine.hp * HP, eta: 0.80 }) }));
  cr2k.forEach(c => { c.CD_glidePolar = pg.CD0 + pg.K * c.CL * c.CL; c.ratio = c.CD / c.CD_glidePolar; });
  out.polar = { vbg_kcas: vbg, glide_faa: pg, glide_poh_axis: pgPOH, sim, simCheck: simPolarEmax(sim), cruise_points_eta080: cr2k };
  // ── propeller BEM (ค่าประมาณ geometry; diameter, pitch designation and static rpm from TCDS)
  const P = { ...PROPS.fixed_76x60, D: F.prop.D_in[1] * IN, pitch_m: F.prop.pitch_in * IN, note: 'McCauley 1A103/TCM6958 class (C152): 69 in, 58 in pitch (designation), GA planform (ค่าประมาณ)' };
  const eng = { P_rated_W: F.engine.hp * HP, rpm_rated: F.engine.rpm };
  const rpm0 = 0.5 * (F.engine.static_rpm[0] + F.engine.static_rpm[1]);
  const before = staticRpm(P, eng);
  const cs = calibrateChord(P, rpm0, eng); const Pc = { ...P, chordScale: cs };
  const st = staticRpm(Pc, eng), stHot = staticRpm(Pc, { ...eng, dT: 20 });
  const Js = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  const tab = Js.map(J => bem(Pc, J, { n: st.rpm / 60 }));
  const pk = (() => { let best = { J: 0, eta: 0 }; for (let J = 0.3; J <= 0.95; J += 0.01) { const x = bem(Pc, J, { n: 2400 / 60 }); if (x.eta > best.eta) best = { J, eta: x.eta }; } return best; })();
  const A = Math.PI * P.D * P.D / 4;
  // cruise check: 2400 rpm, 101 KTAS, 2000 ft: J and BEM power vs 75 % of 110 hp
  const rho2k = rhoISA(2000 * FT), Jc = 101 * KT / (2400 / 60 * P.D), bc = bem(Pc, Jc, { n: 40 });
  const Pabs = bc.CP * rho2k * 40 ** 3 * P.D ** 5, Tc = bc.CT * rho2k * 40 ** 2 * P.D ** 4;
  out.prop = { D: P.D, pitch_m: P.pitch_m, beta75_deg: Math.atan(P.pitch_m / (0.75 * Math.PI * P.D)) * 180 / Math.PI, rpm_before_cal: before.rpm, chordScale: cs, static: st, staticHot35C: stHot,
    FM: figureOfMerit(st.T0_N, st.P_W, 1.225, P.D), T_ideal_FM1: Math.pow(st.P_W * Math.sqrt(2 * 1.225 * A), 2 / 3), peak: pk,
    table: { J: Js, CT: tab.map(t => r(t.CT, 4)), CP: tab.map(t => r(t.CP, 4)), eta: tab.map(t => r(t.eta, 3)) },
    cruise_check: { J: Jc, CT: bc.CT, CP: bc.CP, eta: bc.eta, P_abs_W: Pabs, P_abs_pct: 100 * Pabs / (F.engine.hp * HP), T_N: Tc, D_glidePolar_N: cr2k[0].CD_glidePolar * 0.5 * rho2k * (101 * KT) ** 2 * S },
    chordOverD: P.cx.map((x, i) => r(P.cD[i] * cs, 4)), cx: P.cx, Ip_est: 1.4 * (F.prop.mass_lb * LB / 14) * (69 / 76) ** 2, mass_kg: F.prop.mass_lb * LB };
  // ── engine
  const bs = fitBsfc(F.cruise_2000ft.map(c => ({ pct: c.pct, ff: c.gph, unit: 'gph', fuel: 'avgas' })), F.engine.hp * HP);
  out.engine = { P_rated_W: F.engine.hp * HP, P_N2C_W: 108 * HP, disp_L: F.engine.disp_in3 * 0.016387064, dry_kg: F.engine.dry_lb * LB, bsfc: bs,
    lapse_ind_friction: { SL_ISA: lapse('ind_friction', 0, 0), SL_35C: lapse('ind_friction', 0, 20), SL_30C: lapse('ind_friction', 0, 15), ft8000: lapse('ind_friction', 8000 * FT, 0) },
    lapse_gagg: { SL_35C: lapse('gagg_ferrar', 0, 20), ft8000: lapse('gagg_ferrar', 8000 * FT, 0) } };
  // ── performance: VTBD hot day (PA 0 ft ≈ field 9 ft; OAT 30 and 35 °C), table interpolation in OAT at PA 0
  const at = (tbl, key, T) => lin(tbl.OAT_C, tbl[key][0], T);
  const rocAt = T => lin(F.roc_table.OAT_C, F.roc_table.data[0], T);
  out.perf = {
    takeoff_m: { gr: F.to.gr_ft * FT, d50: F.to.d50_ft * FT }, landing_m: { gr: F.ldg.gr_ft * FT, d50: F.ldg.d50_ft * FT },
    isa_check: { to_gr_15C: at(F.to_table, 'roll_ft', 15), to_50_15C: at(F.to_table, 'total50_ft', 15), ldg_gr_15C: at(F.ldg_table, 'roll_ft', 15), ldg_50_15C: at(F.ldg_table, 'total50_ft', 15), roc_15C: rocAt(15) },
    vtbd30: { to_gr_ft: at(F.to_table, 'roll_ft', 30), to_50_ft: at(F.to_table, 'total50_ft', 30), ldg_gr_ft: at(F.ldg_table, 'roll_ft', 30), ldg_50_ft: at(F.ldg_table, 'total50_ft', 30), roc_fpm: rocAt(30) },
    vtbd35: { to_gr_ft: at(F.to_table, 'roll_ft', 35), to_50_ft: at(F.to_table, 'total50_ft', 35), ldg_gr_ft: at(F.ldg_table, 'roll_ft', 35), ldg_50_ft: at(F.ldg_table, 'total50_ft', 35), roc_fpm: rocAt(35) },
    sigma35: isa(0, 20).sigma, part23_descent: (() => { const ws = F.mtow_lb / F.S_ft2, v = Math.min(10, Math.max(7, 4.4 * Math.pow(ws, 0.25))); return { WS: ws, V_fps: v, V_mps: v * FT }; })(),
    vref_over_vs0: iasToCas('30', F.kias.V50_short) / F.vs.fwd['30'][1], vapp_over_vs0: iasToCas('30', F.kias.VAPP) / F.vs.fwd['30'][1],
  };
  // ── C150H differences (LF2, LF8)
  const h = F.c150h, mph = 0.868976;
  out.c150h = { mtow_kg: h.mtow_lb * LB, P_W: h.hp * HP, vne_kcas: h.vne_mph_cas * mph, vno_kcas: h.vno_mph_cas * mph, va_kcas: h.va_mph_cas * mph, vfe_kcas: h.vfe_mph_cas * mph,
    stall_kcas: Object.fromEntries(Object.entries(h.stall_mph_cas).map(([k, v]) => [k, v * mph])),
    CLmax: Object.fromEntries(Object.entries(h.stall_mph_cas).map(([k, v]) => [k, clmaxFromStall({ mass: h.mtow_lb * LB, S, vs_kcas: v * mph, kind: 'min' }).CLmax_1g])),
    roc_ratio_vs_152: h.roc_sl / F.roc_sl_fpm, to_m: h.to.map(x => x * FT), ldg_m: h.ldg.map(x => x * FT), vy_kias: h.vy_mph * mph, vg_kias: h.vg_mph * mph, short_app_kias: h.short_app_mph * mph,
    cg_m: h.cg.fwd.map(([w, x]) => [w * LB, x * IN, h.cg.aft_in * IN]) };
  return out;
}

/** derivative estimates for the C152 with lm_derivs, plus a class correction: ratio (NASA TM-80163 flight value ÷ lm_derivs)
 *  measured on the C172S card (04) at its own condition, applied to the C152 estimate (ค่าประมาณ). card = in-memory c152 card. */
export function derivs(card, c172card = null) {
  const flags = [], geo = geoFromCard(card, flags), m = val(card, 'airframe.weights.MTOW');
  const run = (g, mass, Vkt) => { const V = Vkt * KT, CL = 2 * mass * G0 / (1.225 * g.S * V * V); return { V_kt: Vkt, CL, ...estimate(g, { CL, M: V / 340, alpha: (CL - 0.25) / 5 }) }; };
  const crV = val(card, 'validation.trim_targets.cruise')?.ias_kt ?? 90, apV = iasToCas('30', F.kias.VAPP);
  const out = { flags, geo, cruise: run(geo, m, crV), approach: run(geo, m, apV), ratio: {} };
  const c172 = c172card ?? loadType('c172s');
  const g2 = geoFromCard(c172, []), m2 = val(c172, 'airframe.weights.MTOW');
  const e2 = run(g2, m2, val(c172, 'validation.trim_targets.cruise')?.ias_kt ?? 110);
  for (const n of ['CLde', 'CYb', 'Clb', 'Clp', 'Clda', 'Cmq', 'Cmde', 'Cnb', 'Cnr', 'Cndr']) {
    const fl = val(c172, 'aero.derivatives.' + n); const est = e2.body[n];
    if (typeof fl === 'number' && typeof est === 'number' && est !== 0) out.ratio[n] = { flight_c172: fl, est_c172: est, ratio: fl / est };
  }
  out.ratio.CLalpha = { flight_c172: val(c172, 'aero.static_long.CLalpha'), est_c172: e2.static.CLalpha, ratio: val(c172, 'aero.static_long.CLalpha') / e2.static.CLalpha };
  out.c172_est = e2;
  return out;
}

if (isMainModule(import.meta.url)) {
  const o = compute();
  const s = JSON.stringify(o, (k, v) => (typeof v === 'number' ? +v.toPrecision(5) : v), 1);
  fs.mkdirSync(path.join(HERE, 'out'), { recursive: true });
  fs.writeFileSync(path.join(HERE, 'out', 'lf_calc.json'), s);
  if (process.argv.includes('--json')) console.log(s);
  else {
    const g = o.geom, w = o.weights;
    console.log(`geom S ${g.S.toFixed(3)} m2 b ${g.b.toFixed(3)} AR ${g.AR.toFixed(3)} MAC ${g.MAC.toFixed(3)} (${g.MAC_in.toFixed(1)} in) LEMAC ${g.LEMAC_in.toFixed(1)} in; tail VH ${g.tail.VH.toFixed(3)} l_h ${g.tail.l_h.toFixed(2)}`);
    console.log(`weights MTOW ${w.MTOW.toFixed(1)} kg BEW ${w.BEW.toFixed(1)} training ${w.training_mass.toFixed(1)} kg (${w.training_mass_lb.toFixed(0)} lb); CG env %MAC ${JSON.stringify(o.cg.envelope_pct)} ref ${o.cg.ref_pct.toFixed(1)} %`);
    console.log(`inertia TM80163 ${JSON.stringify(o.inertia.tm80163, (k, v) => typeof v === 'number' ? Math.round(v) : v)} class ${JSON.stringify(o.inertia.class_single_prop, (k, v) => typeof v === 'number' ? Math.round(v) : v)}`);
    console.log(`CLmax fwd ${Object.entries(o.stall.fwd).map(([k, v]) => k + ':' + v.CLmax_1g.toFixed(3)).join(' ')} | aft ${Object.entries(o.stall.aft).map(([k, v]) => k + ':' + v.CLmax_1g.toFixed(3)).join(' ')}`);
    console.log(`polar glide ${o.polar.vbg_kcas} KCAS E ${F.glide.ratio_faa.toFixed(3)}: CL* ${o.polar.glide_faa.CL.toFixed(3)} CD0 ${o.polar.glide_faa.CD0.toFixed(4)} K ${o.polar.glide_faa.K.toFixed(4)} e ${o.polar.glide_faa.e.toFixed(3)}; sim CD0s ${o.polar.sim.CD0.toFixed(4)} Ks ${o.polar.sim.K.toFixed(4)}`);
    console.log(`cruise CD/CDglide ${o.polar.cruise_points_eta080.map(c => c.ratio.toFixed(2)).join(' ')}`);
    console.log(`prop: before cal ${o.prop.rpm_before_cal.toFixed(0)} rpm, chordScale ${o.prop.chordScale.toFixed(3)}, static ${o.prop.static.rpm.toFixed(0)} rpm T0 ${o.prop.static.T0_N.toFixed(0)} N FM ${o.prop.FM.toFixed(3)}; hot ${o.prop.staticHot35C.rpm.toFixed(0)} rpm ${o.prop.staticHot35C.T0_N.toFixed(0)} N; peak eta ${o.prop.peak.eta.toFixed(3)} @J ${o.prop.peak.J.toFixed(2)}; cruise J ${o.prop.cruise_check.J.toFixed(3)} P% ${o.prop.cruise_check.P_abs_pct.toFixed(1)} T ${o.prop.cruise_check.T_N.toFixed(0)} vs D ${o.prop.cruise_check.D_glidePolar_N.toFixed(0)}`);
    console.log(`engine bsfc ${o.engine.bsfc.mean_g_per_kWh.toFixed(0)} g/kWh; lapse 35C ${o.engine.lapse_ind_friction.SL_35C.toFixed(3)} 8000ft ${o.engine.lapse_ind_friction.ft8000.toFixed(3)}`);
    console.log(`perf VTBD35 ${JSON.stringify(o.perf.vtbd35)} isa ${JSON.stringify(o.perf.isa_check)}`);
    console.log(`c150h CLmax ${JSON.stringify(o.c150h.CLmax, (k, v) => typeof v === 'number' ? +v.toFixed(3) : v)} vne ${o.c150h.vne_kcas.toFixed(1)}`);
  }
}
