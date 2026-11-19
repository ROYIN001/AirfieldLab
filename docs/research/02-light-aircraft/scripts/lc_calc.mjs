// lc_calc.mjs — derived numbers for the Cessna 172S data card (topic 04, code LC).
// Run from the repo root:  node <this folder>/lc_calc.mjs [--json]
// Inputs are POH/TCDS numbers transcribed in scripts/out/lc_notes.md (each with source); outputs scripts/out/lc_calc.json.
// Uses the LM tools (lm_polar, lm_inertia, lm_engine, lm_prop) exactly as documented in 01-methods.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { clmaxFromStall, polarFromGlide, toSimPolar, stallSpeed, rhoISA, G0, RHO0, KT, FT, HP, LB } from './lm_polar.mjs';
import { inertiaFromRadii, radiiOf, RADII } from './lm_inertia.mjs';
import { isa, powerIndFriction, lapseGaggFerrar } from './lm_engine.mjs';
import { PROPS, bem, staticRpm, calibrateChord, figureOfMerit } from './lm_prop.mjs';
import { isMainModule } from './lm_lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const IN = 0.0254, GAL = 3.785411784, NM = 1852;
const r = (x, d = 3) => +(+x).toFixed(d);
const lin = (xs, ys, x) => { let i = 0; while (i < xs.length - 2 && x > xs[i + 1]) i++; return ys[i] + (x - xs[i]) / (xs[i + 1] - xs[i]) * (ys[i + 1] - ys[i]); };

// ── POH / TCDS inputs (see lc_notes.md for page references) ──
export const POH = {
  MTOW_lb: 2550, ramp_lb: 2558, MLW_lb: 2550, BEW_lb: 1663, useful_lb: 895, utility_MTOW_lb: 2200,
  S_ft2: 174, S_tcds_m2: 16.3045, b_m: 10.9982, span_ftin: [36, 1], length_m: 8.20522, height_m: 2.35661,
  MAC_in: 58.8, LEMAC_in: 25.9, cg: { fwd_low_in: 35.0, fwd_low_lb: 1950, fwd_mtow_in: 41.0, aft_in: 47.3, util_fwd_in: 37.5, util_aft_in: 40.5 },
  fuel_total_gal: 56, fuel_usable_gal: 53, fuel_arm_in: 48.0, avgas_lb_per_gal: 6.0,
  wheelbase_in: 65, prop_clear_in: 11.25,
  P_hp: 180, rpm_rated: 2700, static_rpm: [2300, 2400], prop_D_in: 76,
  // Fig 5-1 normal static source (KIAS -> KCAS), p5-9
  iasCas: { '0': [[50, 56], [60, 62], [70, 70], [80, 78], [90, 87], [100, 97], [110, 107], [120, 117], [130, 127], [140, 137], [150, 147], [160, 157]],
            '10': [[40, 51], [50, 57], [60, 63], [70, 71], [80, 80], [90, 89]],
            '30': [[40, 50], [50, 56], [60, 63], [70, 72], [80, 81], [85, 86]] },
  // Fig 5-3 stall 2550 lb power off, [KIAS, KCAS] at bank 0/30/45/60
  stall: { fwd: { '0': [[48, 53], [52, 57], [57, 63], [68, 75]], '10': [[43, 51], [46, 55], [51, 61], [61, 72]], '30': [[40, 48], [43, 52], [48, 57], [57, 68]] },
           aft: { '0': [[48, 53], [52, 57], [57, 63], [68, 75]], '10': [[42, 50], [45, 54], [50, 59], [59, 71]], '30': [[40, 48], [43, 52], [48, 57], [57, 68]] } },
  glide: { kias: 68, nm_per_1000ft: 1.5 },       // p3-3 (speed); FAA Safety Briefing (ratio rule of thumb)
  // Fig 5-5 short field takeoff 2550 lb, flaps 10: [PA ft][OAT 0,10,20,30,40] = [roll, total] ft
  to: { PA: [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000], OAT: [0, 10, 20, 30, 40],
        roll: [[860, 925, 995, 1070, 1150], [940, 1010, 1090, 1170, 1260], [1025, 1110, 1195, 1285, 1380], [1125, 1215, 1310, 1410, 1515], [1235, 1335, 1440, 1550, 1660], [1355, 1465, 1585, 1705, 1825], [1495, 1615, 1745, 1875, 2010], [1645, 1785, 1920, 2065, 2215], [1820, 1970, 2120, 2280, 2450]],
        total: [[1465, 1575, 1690, 1810, 1945], [1600, 1720, 1850, 1990, 2135], [1755, 1890, 2035, 2190, 2355], [1925, 2080, 2240, 2420, 2605], [2120, 2295, 2480, 2685, 2880], [2345, 2545, 2755, 2975, 3205], [2605, 2830, 3075, 3320, 3585], [2910, 3170, 3440, 3730, 4045], [3265, 3575, 3880, 4225, 4615]] },
  // Fig 5-6 max ROC 2550 lb: PA, KIAS, fpm at -20,0,20,40 C
  roc: { PA: [0, 2000, 4000, 6000, 8000, 10000, 12000], kias: [74, 73, 73, 73, 72, 72, 72], OAT: [-20, 0, 20, 40],
         fpm: [[855, 785, 710, 645], [760, 695, 625, 560], [685, 620, 555, 495], [575, 515, 450, 390], [465, 405, 345, 285], [360, 300, 240, 180], [255, 195, 135, null]] },
  // Fig 5-11 short field landing 2550 lb flaps 30: [roll,total] ft at OAT 0..40
  ldg: { PA: [0, 1000, 2000, 4000, 8000], OAT: [0, 10, 20, 30, 40],
         roll: [[545, 565, 585, 605, 625], [565, 585, 605, 625, 650], [585, 610, 630, 650, 670], [630, 655, 675, 700, 725], [735, 760, 790, 815, 840]],
         total: [[1290, 1320, 1350, 1380, 1415], [1320, 1350, 1385, 1420, 1450], [1355, 1385, 1420, 1455, 1490], [1425, 1460, 1495, 1535, 1570], [1585, 1630, 1670, 1715, 1755]] },
  summary: { roc_sl: 730, to_roll: 960, to_50: 1630, ldg_roll: 575, ldg_50: 1335, vs1_kcas: 53, vs0_kcas: 48, cruise75_8500_ktas: 124, vmax_sl_kt: 126, ceiling_ft: 14000 },
};

export function compute() {
  const o = {};
  const m = POH.MTOW_lb * LB, S = POH.S_ft2 * FT * FT, b = POH.b_m, c = POH.MAC_in * IN, L = POH.length_m;
  o.geom = { MTOW_kg: r(m, 2), ramp_kg: r(POH.ramp_lb * LB, 2), BEW_kg: r(POH.BEW_lb * LB, 1), useful_kg: r(POH.useful_lb * LB, 1), utility_MTOW_kg: r(POH.utility_MTOW_lb * LB, 1),
    S_m2: r(S, 3), S_tcds_m2: POH.S_tcds_m2, S_diff_pct: r(100 * (POH.S_tcds_m2 / S - 1), 2), b_m: b, MAC_m: r(c, 4), AR: r(b * b / S, 3), AR_tcds: r(b * b / POH.S_tcds_m2, 3),
    mean_chord_m: r(S / b, 3), wing_loading_kg_m2: r(m / S, 1), wing_loading_lb_ft2: r(POH.MTOW_lb / POH.S_ft2, 2), power_loading_lb_hp: r(POH.MTOW_lb / POH.P_hp, 2),
    wheelbase_m: r(POH.wheelbase_in * IN, 3), prop_D_m: r(POH.prop_D_in * IN, 4), prop_clear_m: r(POH.prop_clear_in * IN, 3),
    fuel_usable_kg: r(POH.fuel_usable_gal * POH.avgas_lb_per_gal * LB, 1), fuel_usable_L: r(POH.fuel_usable_gal * GAL, 1) };
  // CG envelope in m DAT and %MAC
  const pm = x => r(100 * (x - POH.LEMAC_in) / POH.MAC_in, 1);
  const cg = POH.cg;
  o.cg = { LEMAC_m: r(POH.LEMAC_in * IN, 4), MAC_m: r(c, 4),
    normal: [[r(cg.fwd_low_lb * LB, 1), r(cg.fwd_low_in * IN, 4), r(cg.aft_in * IN, 4)], [r(m, 2), r(cg.fwd_mtow_in * IN, 4), r(cg.aft_in * IN, 4)]],
    normal_pctMAC: { fwd_low: pm(cg.fwd_low_in), fwd_mtow: pm(cg.fwd_mtow_in), aft: pm(cg.aft_in) },
    utility: [[r(cg.fwd_low_lb * LB, 1), r(cg.fwd_low_in * IN, 4), r(cg.util_aft_in * IN, 4)], [r(POH.utility_MTOW_lb * LB, 1), r(cg.util_fwd_in * IN, 4), r(cg.util_aft_in * IN, 4)]],
    utility_pctMAC: { fwd: pm(cg.util_fwd_in), aft: pm(cg.util_aft_in) },
    ref_in: 42.0, ref_m: r(42.0 * IN, 4), ref_pctMAC: pm(42.0), mid_mtow_in: (cg.fwd_mtow_in + cg.aft_in) / 2, mid_mtow_pctMAC: pm((cg.fwd_mtow_in + cg.aft_in) / 2) };
  // training mass (estimate): BEW + instructor 85 kg + student 75 kg + 35 US gal fuel
  const fuel35 = 35 * POH.avgas_lb_per_gal * LB;
  o.training = { BEW_kg: r(POH.BEW_lb * LB, 1), crew_kg: 160, fuel_kg: r(fuel35, 1), total_kg: r(POH.BEW_lb * LB + 160 + fuel35, 1) };

  // stall table consistency: V(phi) = V0 sqrt(1/cos phi) in KCAS
  const banks = [0, 30, 45, 60]; let maxDev = 0;
  for (const cgk of ['fwd', 'aft']) for (const [fl, row] of Object.entries(POH.stall[cgk])) for (let i = 1; i < 4; i++) {
    const pred = row[0][1] / Math.sqrt(Math.cos(banks[i] * Math.PI / 180)); maxDev = Math.max(maxDev, Math.abs(pred - row[i][1])); }
  o.stallTableCheck = { maxDev_kt: r(maxDev, 2), note: 'all KCAS cells vs V0/sqrt(cos phi)' };

  // CLmax (1 g, trimmed, at MTOW) from POH stall speeds (KCAS, min-speed definition, nz 0.95); flap 20 interpolated (est)
  const cl = {}; for (const cgk of ['fwd', 'aft']) { cl[cgk] = {};
    for (const fl of ['0', '10', '30']) { const v = POH.stall[cgk][fl][0][1];
      const a = clmaxFromStall({ mass: m, S, vs_kcas: v, kind: 'min' }); const lo = clmaxFromStall({ mass: m, S, vs_kcas: v, kind: 'min', nzAtVmin: 0.90 }).CLmax_1g, hi = clmaxFromStall({ mass: m, S, vs_kcas: v, kind: 'min', nzAtVmin: 1.0 }).CLmax_1g;
      const lo1 = clmaxFromStall({ mass: m, S, vs_kcas: v + 0.5, kind: 'min' }).CLmax_1g, hi1 = clmaxFromStall({ mass: m, S, vs_kcas: v - 0.5, kind: 'min' }).CLmax_1g;
      cl[cgk][fl] = { vs_kcas: v, CLapp: r(a.CLapparent, 3), CLmax_1g: r(a.CLmax_1g, 3), V1g_kcas: r(a.V1g_kcas, 2), range_nz: [r(lo, 3), r(hi, 3)], range_round: [r(lo1, 3), r(hi1, 3)] }; }
    // flap 20: JSBSim c172 increments 0.20/0.30/0.35 (10/20/30) put 20 at 2/3 of the way from 10 to 30
    const c10 = cl[cgk]['10'].CLmax_1g, c30 = cl[cgk]['30'].CLmax_1g; const c20 = c10 + (2 / 3) * (c30 - c10);
    cl[cgk]['20'] = { CLmax_1g: r(c20, 3), V1g_kcas: r(stallSpeed({ mass: m, S, CLmax: c20 }), 2), vs_kcas_equiv_min: r(stallSpeed({ mass: m, S, CLmax: c20 }) * Math.sqrt(0.95), 2), est: true }; }
  o.CLmax = cl;
  // flap increments (est): dCL0 = dCLmax (fwd CG) assuming no stall-alpha shift
  o.flaps = {}; for (const fl of ['10', '20', '30']) o.flaps[fl] = { dCLmax: r(cl.fwd[fl].CLmax_1g - cl.fwd['0'].CLmax_1g, 3), dCLmax_aft: r(cl.aft[fl].CLmax_1g - cl.aft['0'].CLmax_1g, 3) };

  // IAS->CAS helper
  const ias2cas = (fl, kias) => { const t = POH.iasCas[fl]; return lin(t.map(p => p[0]), t.map(p => p[1]), kias); };
  o.speedsCAS = { VY_74: r(ias2cas('0', 74), 1), VX_62: r(ias2cas('0', 62), 1), VG_68: r(ias2cas('0', 68), 1), VR_51_f10: r(ias2cas('10', 51), 1), V50_56_f10: r(ias2cas('10', 56), 1),
    VREF_61_f30: r(ias2cas('30', 61), 1), VAPP_65_f30: r(ias2cas('30', 65), 1), VA_105: r(ias2cas('0', 105), 1), VNO_129: r(ias2cas('0', 129), 1), VNE_163_extrap: r(ias2cas('0', 163), 1), VFE10_110: r(ias2cas('0', 110), 1), VFE30_85: r(ias2cas('30', 85), 1) };
  o.speedsCAS.note = 'POH p2-4 gives VNE 160, VNO 126, VA 102, VFE10 107, VFE 84/85 KCAS: compare';

  // glide polar (est): V_bg 68 KIAS -> KCAS; E = 1.5 NM / 1000 ft
  const E = POH.glide.nm_per_1000ft * NM / (1000 * FT), vbg = ias2cas('0', POH.glide.kias);
  const pg = polarFromGlide({ mass: m, S, v_kcas: vbg, E, AR: b * b / S }); const sp = toSimPolar({ CD0: pg.CD0, K: pg.K });
  o.glide = { E: r(E, 3), vbg_kcas: r(vbg, 2), CL: r(pg.CL, 4), CD0: r(pg.CD0, 4), K: r(pg.K, 4), e: r(pg.e, 3), sim: { CD0: r(sp.CD0, 4), K: r(sp.K, 4), Emax: r(sp.Emax, 3), CLstar: r(sp.CLstar, 3) },
    sink_fpm: r(vbg * KT / E / FT * 60, 0), E_range_1p4_1p6: [r(1.4 * NM / 304.8, 2), r(1.6 * NM / 304.8, 2)] };
  // cruise point 75 % 8,500 ft 124 KTAS at 2,550 lb, eta 0.80 (est) -> CD; compare to glide polar
  const rho85 = rhoISA(8500 * FT), Vc = 124 * KT, qc = 0.5 * rho85 * Vc * Vc, CLc = m * G0 / (qc * S);
  const etaC = 0.80, Pc = 0.75 * POH.P_hp * HP, CDc = etaC * Pc / (Vc * qc * S);
  o.cruise75 = { rho: r(rho85, 4), CL: r(CLc, 4), CD_eta080: r(CDc, 4), CD_glidepolar: r(pg.CD0 + pg.K * CLc * CLc, 4), CD0_implied_K_glide: r(CDc - pg.K * CLc * CLc, 4), ratio: r(CDc / (pg.CD0 + pg.K * CLc * CLc), 3) };
  // clean (thrust-on) polar estimate: CD0 from cruise, e 0.75 (est) -> L/Dmax clean
  const Kc = 1 / (Math.PI * (b * b / S) * 0.75), CD0c = CDc - Kc * CLc * CLc;
  o.cleanPolar = { CD0: r(CD0c, 4), K: r(Kc, 4), e: 0.75, Emax: r(0.5 / Math.sqrt(CD0c * Kc), 2), CLstar: r(Math.sqrt(CD0c / Kc), 3), dCD_windmill_at_glide: r(pg.CD0 + pg.K * pg.CL ** 2 - (CD0c + Kc * pg.CL ** 2), 4) };

  // inertia at MTOW: (a) TM-80163 measured C172-class radii, (b) LM class single_prop, (c) JSBSim c172x (from LM table)
  const tm = radiiOf({ m: 837.93, Ixx: 1395, Iyy: 1480, Izz: 2563, b: 11.0, L: 8.2 });
  const Ia = inertiaFromRadii({ m, b, L, ...tm }), Ib = inertiaFromRadii({ m, b, L, ...RADII.single_prop });
  o.inertia = { radii_TM80163: { Rx: r(tm.Rx), Ry: r(tm.Ry), Rz: r(tm.Rz) }, MTOW_TM: { Ixx: r(Ia.Ixx, 0), Iyy: r(Ia.Iyy, 0), Izz: r(Ia.Izz, 0), Ixz: r(123 * m / 837.93, 0) },
    radii_class: RADII.single_prop, MTOW_class: { Ixx: r(Ib.Ixx, 0), Iyy: r(Ib.Iyy, 0), Izz: r(Ib.Izz, 0) },
    fuel_Ixx_add: r(POH.fuel_usable_gal * POH.avgas_lb_per_gal * LB * 2.0 ** 2, 0), note: 'fuel 144 kg at |y| ~2.0 m (est) adds ~576 kg m2 to Ixx and Izz' };

  // performance tables: VTBD hot-day points (field 9 ft ~ SL; OAT 30/35 C)
  const tab2 = (T, key, pa, oat) => { const i = T.PA.indexOf(pa); return lin(T.OAT, T[key][i], oat); };
  o.hot = {};
  for (const oat of [15, 30, 35]) o.hot[oat] = { to_roll_ft: r(tab2(POH.to, 'roll', 0, oat), 0), to_50_ft: r(tab2(POH.to, 'total', 0, oat), 0),
    ldg_roll_ft: r(tab2(POH.ldg, 'roll', 0, oat), 0), ldg_50_ft: r(tab2(POH.ldg, 'total', 0, oat), 0),
    roc_fpm: r(lin(POH.roc.OAT, POH.roc.fpm[0], oat), 0) };
  for (const k of Object.keys(o.hot)) { const h = o.hot[k]; h.to_roll_m = r(h.to_roll_ft * FT, 0); h.to_50_m = r(h.to_50_ft * FT, 0); h.ldg_roll_m = r(h.ldg_roll_ft * FT, 0); h.ldg_50_m = r(h.ldg_50_ft * FT, 0); }
  // ISA ROC at each altitude (T_ISA = 15 - 1.98 per 1000 ft)
  o.rocISA = POH.roc.PA.map((pa, i) => { const t = 15 - 1.98 * pa / 1000; const row = POH.roc.fpm[i]; const xs = POH.roc.OAT.filter((_, j) => row[j] != null), ys = row.filter(x => x != null);
    return [pa, POH.roc.kias[i], r(lin(xs, ys, t), 0)]; });
  // ROC drop with OAT at SL vs engine lapse (ind_friction f 0.10, gagg_ferrar)
  const pIF = t => powerIndFriction({ delta: 1, theta: (273.15 + t) / 288.15, f: 0.10 }), pGF = t => lapseGaggFerrar(288.15 / (273.15 + t));
  o.lapseVTBD = { ind_friction_35C: r(pIF(35), 4), gagg_farrar_35C: r(pGF(35), 4), ind_friction_30C: r(pIF(30), 4),
    POH_roc_ratio_35_15: r(o.hot[35].roc_fpm / o.hot[15].roc_fpm, 3) };

  // part 23 limit descent velocity: V = 4.4 (W/S)^0.25 fps, 7..10 fps (14 CFR 23.473(d) pre-amdt 64)
  const ws = POH.MTOW_lb / POH.S_ft2; o.part23 = { WS_lb_ft2: r(ws, 2), Vdesc_fps: r(Math.min(10, Math.max(7, 4.4 * Math.pow(ws, 0.25))), 2) };
  o.part23.Vdesc_mps = r(o.part23.Vdesc_fps * FT, 3);

  // propeller: lm_prop fixed_76x60 (chord calibrated to 2350 rpm), operating points
  const P0 = { ...PROPS.fixed_76x60 }; P0.chordScale = calibrateChord(P0, 2350);
  const st = staticRpm(P0), stH = staticRpm(P0, { dT: 20 });
  const D = P0.D, Prated = POH.P_hp * HP;
  // full-throttle level-flight balance at SL: rpm where engine power (ind_friction) = prop power at V
  const bal = Vkt => { const V = Vkt * KT; let lo = 1500, hi = 3500;
    for (let k = 0; k < 50; k++) { const N = 0.5 * (lo + hi), n = N / 60, J = V / (n * D); const b2 = bem(P0, J, { n });
      const Pp = b2.CP * RHO0 * n ** 3 * D ** 5, Pe = Prated * powerIndFriction({ delta: 1, theta: 1, rpmFrac: N / POH.rpm_rated, f: 0.10 }); if (Pp > Pe) hi = N; else lo = N; }
    const N = 0.5 * (lo + hi), n = N / 60, J = V / (n * D), b2 = bem(P0, J, { n }); return { rpm: r(N, 0), J: r(J, 3), T_N: r(b2.CT * RHO0 * n * n * D ** 4, 0), eta: r(b2.eta, 3) }; };
  const dragClean = Vkt => { const q = 0.5 * RHO0 * (Vkt * KT) ** 2, CL = m * G0 / (q * S); return r((CD0c + Kc * CL * CL) * q * S, 0); };
  o.prop = { chordScale: r(P0.chordScale, 4), static: { rpm: r(st.rpm, 0), T0_N: r(st.T0_N, 0), T0_lbf: r(st.T0_N / 4.4482216, 0), P_hp: r(st.P_W / HP, 1), FM: r(figureOfMerit(st.T0_N, st.P_W, RHO0, D), 3) },
    staticISA20: { rpm: r(stH.rpm, 0), T0_N: r(stH.T0_N, 0) },
    vmax126: { ...bal(126), drag_clean_N: dragClean(126) }, v100: { ...bal(100), drag_clean_N: dragClean(100) }, vy: { ...bal(o.speedsCAS.VY_74), drag_clean_N: dragClean(o.speedsCAS.VY_74) },
    table: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map(J => { const x = bem(P0, J, { n: 40 }); return [J, r(x.CT, 4), r(x.CP, 4), r(x.eta, 3)]; }) };
  return o;
}

if (isMainModule(import.meta.url)) {
  const o = compute();
  fs.mkdirSync(path.join(HERE, 'out'), { recursive: true });
  fs.writeFileSync(path.join(HERE, 'out', 'lc_calc.json'), JSON.stringify(o, null, 1));
  console.log(JSON.stringify(o, null, process.argv.includes('--json') ? 1 : 0).slice(0, process.argv.includes('--json') ? 1e9 : 6000));
}
