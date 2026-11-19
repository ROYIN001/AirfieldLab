// le_calc.mjs — derived numbers for the Cessna 172R data card (topic 10, code LE) and the older 172M/N/P summary.
// Run from the repo root:  node <this folder>/le_calc.mjs [--json]      → scripts/out/le_calc.json
// Inputs are POH / Information Manual / TCDS numbers transcribed in scripts/out/le_notes.md (each with source and page).
// Uses the LM tools (lm_polar, lm_inertia, lm_engine, lm_prop) exactly as documented in 01-methods.md, same steps as
// lc_calc.mjs (C172S) so the two cards stay comparable. Node >= 18, no dependencies.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { clmaxFromStall, polarFromGlide, toSimPolar, stallSpeed, rhoISA, G0, RHO0, KT, FT, HP, LB } from './lm_polar.mjs';
import { inertiaFromRadii, radiiOf, RADII } from './lm_inertia.mjs';
import { powerIndFriction, lapseGaggFerrar } from './lm_engine.mjs';
import { PROPS, bem, staticRpm, calibrateChord, figureOfMerit } from './lm_prop.mjs';
import { isMainModule } from './lm_lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const IN = 0.0254, GAL = 3.785411784, NM = 1852;
const r = (x, d = 3) => (x == null ? null : +(+x).toFixed(d));
const lin = (xs, ys, x) => { let i = 0; while (i < xs.length - 2 && x > xs[i + 1]) i++; return ys[i] + (x - xs[i]) / (xs[i + 1] - xs[i]) * (ys[i + 1] - ys[i]); };

// ── POH / IM / TCDS inputs (le_notes.md: LE1 = FAA TCDS 3A12 Rev 84, LE2 = 172R Information Manual 172RIM, LE3 = 172R POH Sec 5) ──
export const POH = {
  MTOW_lb: 2450, ramp_lb: 2457, MLW_lb: 2450, BEW_lb: 1639, BEW_alt_lb: 1699, useful_lb: 818, utility_MTOW_lb: 2100, utility_MTOW_late_lb: 2200,
  S_ft2: 174, b_m: 10.9982 /* 36 ft 1 in */, length_m: (27 * 12 + 2) * IN, height_max_m: (8 * 12 + 11) * IN,
  MAC_in: 58.8, LEMAC_in: 25.9, cg: { fwd_low_in: 35.0, fwd_low_lb: 1950, fwd_mtow_in: 40.0, aft_in: 47.3, util_fwd_in: 36.5, util_fwd_late_in: 37.5, util_aft_in: 40.5 },
  fuel_total_gal: 56, fuel_usable_gal: 53, fuel_arm_in: 48.0, avgas_lb_per_gal: 6.0,
  wheelbase_in: 65, prop_clear_in: 11.25,
  P_hp: 160, rpm_rated: 2400, static_rpm: [2065, 2165], prop_D_in: 75, prop_D_min_in: 74, prop_pitch_in: 70,
  // Fig 5-1 normal static source (KIAS -> KCAS), POH p5-9 [LE3]
  iasCas: { '0': [[50, 56], [60, 62], [70, 70], [80, 79], [90, 89], [100, 98], [110, 107], [120, 117], [130, 126], [140, 135], [150, 145], [160, 154]],
            '10': [[40, 49], [50, 55], [60, 62], [70, 70], [80, 79], [90, 89], [100, 98], [110, 108]],
            '30': [[40, 47], [50, 53], [60, 61], [70, 70], [80, 80], [85, 84]] },
  // Fig 5-3 stall 2450 lb power off, [KIAS, KCAS] at bank 0/30/45/60, POH p5-12 [LE3]
  stall: { fwd: { '0': [[44, 52], [48, 56], [53, 62], [63, 74]], '10': [[37, 50], [40, 53], [44, 59], [53, 70]], '30': [[33, 47], [36, 50], [40, 56], [47, 66]] },
           aft: { '0': [[44, 51], [48, 55], [53, 61], [63, 73]], '10': [[35, 48], [38, 52], [42, 58], [50, 69]], '30': [[33, 47], [36, 50], [40, 56], [47, 66]] } },
  glide: { kias: 65, nm_per_1000ft: 1.5 },     // IM p3-3 (speed); FAASTeam handout (ratio rule of thumb, LC4) — POH Fig 3-1 chart not machine-readable
  // Fig 5-5 short field takeoff 2450 lb, flaps 10: [PA][OAT 0,10,20,30,40] ft, POH p5-14 [LE3]
  to: { PA: [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000], OAT: [0, 10, 20, 30, 40],
        roll: [[845, 910, 980, 1055, 1135], [925, 1000, 1075, 1160, 1245], [1015, 1095, 1185, 1275, 1365], [1115, 1205, 1305, 1400, 1505], [1230, 1330, 1435, 1545, 1655], [1355, 1470, 1585, 1705, 1830], [1500, 1625, 1750, 1880, 2020], [1660, 1795, 1935, 2085, 2240], [1840, 1995, 2150, 2315, null]],
        total: [[1510, 1625, 1745, 1875, 2015], [1660, 1790, 1925, 2070, 2220], [1830, 1970, 2125, 2290, 2455], [2020, 2185, 2360, 2540, 2730], [2245, 2430, 2630, 2830, 3045], [2500, 2715, 2945, 3175, 3430], [2805, 3060, 3315, 3590, 3895], [3170, 3470, 3770, 4105, 4485], [3620, 3975, 4345, 4775, null]] },
  // Fig 5-6 max ROC 2450 lb: PA, KIAS, fpm at -20,0,20,40 C, POH p5-15 [LE3]
  roc: { PA: [0, 2000, 4000, 6000, 8000, 10000, 12000], kias: [79, 77, 76, 74, 72, 71, 69], OAT: [-20, 0, 20, 40],
         fpm: [[830, 770, 705, 640], [720, 655, 595, 535], [645, 585, 525, 465], [530, 475, 415, 360], [420, 365, 310, 250], [310, 255, 200, 145], [200, 145, null, null]] },
  // Fig 5-11 short field landing 2450 lb flaps 30, 62 KIAS: [roll,total] ft at OAT 0..40, POH p5-21 [LE3]
  ldg: { PA: [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000], OAT: [0, 10, 20, 30, 40],
         roll: [[525, 540, 560, 580, 600], [545, 560, 580, 600, 620], [565, 585, 605, 625, 645], [585, 605, 625, 650, 670], [605, 630, 650, 670, 695], [630, 650, 675, 700, 720], [655, 675, 700, 725, 750], [null, 705, 730, 755, 775], [705, 730, 755, 780, 810]],
         total: [[1250, 1280, 1310, 1340, 1370], [1280, 1310, 1345, 1375, 1405], [1310, 1345, 1375, 1410, 1440], [1345, 1380, 1415, 1445, 1480], [1380, 1415, 1450, 1485, 1520], [1415, 1455, 1490, 1525, 1560], [1455, 1490, 1530, 1565, 1605], [1495, 1535, 1570, 1610, 1650], [1535, 1575, 1615, 1655, 1695]] },
  // Fig 5-8 cruise 2450 lb lean, ISA column, WITH speed fairings (subtract 2 kt without), POH p5-17 [LE3]: [PA, rpm, %BHP, KTAS, GPH]
  cruiseISA: [[2000, 2250, 79, 115, 9.0], [2000, 2200, 74, 112, 8.5], [2000, 2100, 65, 106, 7.5], [2000, 2000, 58, 99, 6.6], [2000, 1900, 51, 91, 5.9],
              [4000, 2300, 79, 117, 9.1], [4000, 2250, 75, 114, 8.6], [4000, 2200, 70, 111, 8.1], [4000, 2100, 62, 105, 7.1], [4000, 2000, 55, 98, 6.4], [4000, 1900, 50, 90, 5.8],
              [6000, 2350, 80, 120, 9.2], [6000, 2300, 75, 117, 8.6], [6000, 2250, 71, 114, 8.1], [6000, 2200, 67, 111, 7.7], [6000, 2100, 60, 104, 6.9], [6000, 2000, 53, 96, 6.2]],
  // Fig 5-8 sheet 2 of 2 (8,000-12,000 ft), same conditions, POH p5-18 [LE3] (added in review 2026-11-19; ManualsLib viewer page 132)
  cruiseISA2: [[8000, 2400, 80, 122, 9.2], [8000, 2350, 76, 119, 8.7], [8000, 2300, 71, 116, 8.2], [8000, 2200, 64, 110, 7.3], [8000, 2100, 57, 102, 6.6], [8000, 2000, 52, 94, 6.0],
               [10000, 2350, 72, 118, 8.2], [10000, 2300, 68, 115, 7.8], [10000, 2250, 65, 112, 7.4], [10000, 2200, 61, 108, 7.0], [10000, 2100, 55, 100, 6.4], [10000, 2000, 51, 91, 5.9],
               [12000, 2350, 69, 117, 7.9], [12000, 2300, 65, 113, 7.5], [12000, 2250, 62, 109, 7.1], [12000, 2200, 59, 105, 6.8], [12000, 2100, 54, 97, 6.2]],
  summary: { roc_sl: 720, to_roll: 945, to_50: 1685, ldg_roll: 550, ldg_50: 1295, vs1_kcas_spec: 51, vs0_kcas_spec: 47, cruise80_8000_ktas: 122, vmax_sl_kt: 123, ceiling_ft: 13500,
             range80_nm: 580, endur80_h: 4.8, range60_nm: 687, endur60_h: 6.6 },
};

// older variants (FAA TCDS 3A12 [LE1]; spec-page numbers: 172N POH 1978 [LE4], 172P POH via topic 03 [LB9, LB10], 172M 172guide [LE5])
export const OLD = {
  c172m: { years: '1973–1976', engine: 'Lycoming O-320-E2D (carburetted)', P_hp: 150, rpm: 2700, prop: 'McCauley 1C160/CTM7553 or DTM7553', prop_D_in: 75, static_rpm: [2270, 2370],
           MTOW_lb: 2300, flap_max_deg: 40, VNE_kias: 158, VNO_kias: 126, VA_kias: 97, VFE_kias: 87, cg_fwd_mtow_in: 38.5, cg_aft_in: 47.3,
           note_speeds: 's/n 17256493, 17260759–17265684 (VNE 182 mph = 158 kt); later 172M (17265685–17267584) VNE 160, VNO 128, VFE 85 kt',
           spec: { roc_sl_fpm: 645, ceiling_ft: 13100, to_roll_ft: 865, to_50_ft: 1525, ldg_roll_ft: 520, ldg_50_ft: 1250, src: 'LE5' } },
  c172n: { years: '1977–1980', engine: 'Lycoming O-320-H2AD (carburetted)', P_hp: 160, rpm: 2700, prop: 'McCauley 1C160/DTM7557', prop_D_in: 75, static_rpm: [2280, 2400],
           MTOW_lb: 2300, flap_max_deg: 40, VNE_kias: 160, VNO_kias: 128, VA_kias: 97, VFE_kias: 85, cg_fwd_mtow_in: 38.5, cg_aft_in: 47.3,
           note_speeds: '1980 model VNE 158, VNO 127',
           spec: { roc_sl_fpm: 770, ceiling_ft: 14200, to_roll_ft: 805, to_50_ft: 1440, ldg_roll_ft: 520, ldg_50_ft: 1250, vs1_kcas: 50, vs0_kcas: 44, vx_kias: 59, vy_kias: 73, vg_kias: 65, vref_short_kias: 60, cruise75_8000_ktas: 122, src: 'LE4' } },
  c172p: { years: '1981–1986', engine: 'Lycoming O-320-D2J (carburetted)', P_hp: 160, rpm: 2700, prop: 'McCauley 1C160/DTM7557', prop_D_in: 75, static_rpm: [2300, 2420],
           MTOW_lb: 2400, flap_max_deg: 30, VNE_kias: 158, VNO_kias: 127, VA_kias: 99, VFE_kias: 85, cg_fwd_mtow_in: 39.5, cg_aft_in: 47.3,
           // review 2026-11-19: ceiling 13,000 ft and landing 540 / 1,280 ft from the 172P spec page via 172guide [LB10]; spec-page VS1 51 KCAS (= aft CG row of Fig 5-3)
           spec: { roc_sl_fpm: 700, ceiling_ft: 13000, to_roll_ft: 890, to_50_ft: 1625, ldg_roll_ft: 540, ldg_50_ft: 1280, vs1_kcas: 52, vs1_kcas_spec: 51, vs0_kcas: 46, vy_kias: 76, vg_kias: 65, cruise75_8000_ktas: 120, src: 'LB9, LB10' } },
};

export function compute() {
  const o = {};
  const m = POH.MTOW_lb * LB, S = POH.S_ft2 * FT * FT, b = POH.b_m, c = POH.MAC_in * IN, L = POH.length_m;
  o.geom = { MTOW_kg: r(m, 2), ramp_kg: r(POH.ramp_lb * LB, 2), BEW_kg: r(POH.BEW_lb * LB, 1), BEW_alt_kg: r(POH.BEW_alt_lb * LB, 1), useful_kg: r(POH.useful_lb * LB, 1),
    utility_MTOW_kg: r(POH.utility_MTOW_lb * LB, 1), utility_MTOW_late_kg: r(POH.utility_MTOW_late_lb * LB, 1),
    S_m2: r(S, 3), b_m: b, MAC_m: r(c, 4), AR: r(b * b / S, 3), length_m: r(L, 4), height_max_m: r(POH.height_max_m, 4),
    wing_loading_kg_m2: r(m / S, 1), wing_loading_lb_ft2: r(POH.MTOW_lb / POH.S_ft2, 2), power_loading_lb_hp: r(POH.MTOW_lb / POH.P_hp, 2),
    wheelbase_m: r(POH.wheelbase_in * IN, 3), prop_D_m: r(POH.prop_D_in * IN, 4), prop_D_min_m: r(POH.prop_D_min_in * IN, 4), prop_clear_m: r(POH.prop_clear_in * IN, 3),
    fuel_usable_kg: r(POH.fuel_usable_gal * POH.avgas_lb_per_gal * LB, 1), fuel_usable_L: r(POH.fuel_usable_gal * GAL, 1), fuel_total_L: r(POH.fuel_total_gal * GAL, 1),
    P_W: r(POH.P_hp * HP, 0), P_kW: r(POH.P_hp * HP / 1000, 2) };
  const pm = x => r(100 * (x - POH.LEMAC_in) / POH.MAC_in, 1), cg = POH.cg;
  o.cg = { LEMAC_m: r(POH.LEMAC_in * IN, 4), MAC_m: r(c, 4),
    normal: [[r(cg.fwd_low_lb * LB, 1), r(cg.fwd_low_in * IN, 4), r(cg.aft_in * IN, 4)], [r(m, 2), r(cg.fwd_mtow_in * IN, 4), r(cg.aft_in * IN, 4)]],
    normal_pctMAC: { fwd_low: pm(cg.fwd_low_in), fwd_mtow: pm(cg.fwd_mtow_in), aft: pm(cg.aft_in) },
    utility_early: [[r(cg.fwd_low_lb * LB, 1), r(cg.fwd_low_in * IN, 4), r(cg.util_aft_in * IN, 4)], [r(POH.utility_MTOW_lb * LB, 1), r(cg.util_fwd_in * IN, 4), r(cg.util_aft_in * IN, 4)]],
    utility_late: [[r(cg.fwd_low_lb * LB, 1), r(cg.fwd_low_in * IN, 4), r(cg.util_aft_in * IN, 4)], [r(POH.utility_MTOW_late_lb * LB, 1), r(cg.util_fwd_late_in * IN, 4), r(cg.util_aft_in * IN, 4)]],
    utility_pctMAC: { fwd_early: pm(cg.util_fwd_in), fwd_late: pm(cg.util_fwd_late_in), aft: pm(cg.util_aft_in) },
    ref_in: 42.0, ref_m: r(42.0 * IN, 4), ref_pctMAC: pm(42.0), mid_mtow_in: (cg.fwd_mtow_in + cg.aft_in) / 2, mid_mtow_pctMAC: pm((cg.fwd_mtow_in + cg.aft_in) / 2) };
  // training mass (estimate, same rule as the C172S card): BEW + instructor 85 kg + student 75 kg + 35 US gal fuel
  const fuel35 = 35 * POH.avgas_lb_per_gal * LB;
  o.training = { BEW_kg: r(POH.BEW_lb * LB, 1), crew_kg: 160, fuel_kg: r(fuel35, 1), total_kg: r(POH.BEW_lb * LB + 160 + fuel35, 1), total_lb: r((POH.BEW_lb * LB + 160 + fuel35) / LB, 0) };
  // CG of the training load (est): BEW CG 39.5 in (assumed, typical C172R weighing), crew 37 in, fuel 48 in
  const bewArm = 39.5, cgT = (POH.BEW_lb * LB * bewArm + 160 * 37.0 + fuel35 * 48.0) / (POH.BEW_lb * LB + 160 + fuel35);
  o.training.cg_in_est = r(cgT, 1); o.training.cg_pctMAC_est = pm(cgT);

  // stall table consistency: V(phi) = V0 / sqrt(cos phi) in KCAS
  const banks = [0, 30, 45, 60]; let maxDev = 0;
  for (const cgk of ['fwd', 'aft']) for (const row of Object.values(POH.stall[cgk])) for (let i = 1; i < 4; i++) {
    const pred = row[0][1] / Math.sqrt(Math.cos(banks[i] * Math.PI / 180)); maxDev = Math.max(maxDev, Math.abs(pred - row[i][1])); }
  o.stallTableCheck = { maxDev_kt: r(maxDev, 2), note: 'all KCAS cells vs V0/sqrt(cos phi); rounding of V0 to 1 kt allows up to ~0.7 kt at 60°' };

  // CLmax (1 g, trimmed, MTOW) from POH stall speeds (KCAS, min-speed definition, nz 0.95); flap 20 interpolated (est)
  const cl = {};
  for (const cgk of ['fwd', 'aft']) { cl[cgk] = {};
    for (const fl of ['0', '10', '30']) { const v = POH.stall[cgk][fl][0][1];
      const a = clmaxFromStall({ mass: m, S, vs_kcas: v, kind: 'min' });
      const lo = clmaxFromStall({ mass: m, S, vs_kcas: v, kind: 'min', nzAtVmin: 0.90 }).CLmax_1g, hi = clmaxFromStall({ mass: m, S, vs_kcas: v, kind: 'min', nzAtVmin: 1.0 }).CLmax_1g;
      const lo1 = clmaxFromStall({ mass: m, S, vs_kcas: v + 0.5, kind: 'min' }).CLmax_1g, hi1 = clmaxFromStall({ mass: m, S, vs_kcas: v - 0.5, kind: 'min' }).CLmax_1g;
      cl[cgk][fl] = { vs_kcas: v, CLapp: r(a.CLapparent, 3), CLmax_1g: r(a.CLmax_1g, 3), V1g_kcas: r(a.V1g_kcas, 2), range_nz: [r(lo, 3), r(hi, 3)], range_round: [r(lo1, 3), r(hi1, 3)] }; }
    const c10 = cl[cgk]['10'].CLmax_1g, c30 = cl[cgk]['30'].CLmax_1g, c20 = c10 + (2 / 3) * (c30 - c10);
    cl[cgk]['20'] = { CLmax_1g: r(c20, 3), V1g_kcas: r(stallSpeed({ mass: m, S, CLmax: c20 }), 2), vs_kcas_equiv_min: r(stallSpeed({ mass: m, S, CLmax: c20 }) * Math.sqrt(0.95), 2), est: true }; }
  o.CLmax = cl;
  // the C172S card (same wing): 1.464 / 1.581 / 1.717 / 1.785 (fwd CG, 2,550 lb) — difference shows POH rounding
  const c172s = { '0': 1.464, '10': 1.581, '20': 1.717, '30': 1.785 };
  o.CLmax_vs_c172s = Object.fromEntries(Object.keys(c172s).map(k => [k, r(100 * (cl.fwd[k].CLmax_1g / c172s[k] - 1), 1)]));
  o.flaps = {}; for (const fl of ['10', '20', '30']) o.flaps[fl] = { dCLmax: r(cl.fwd[fl].CLmax_1g - cl.fwd['0'].CLmax_1g, 3), dCLmax_aft: r(cl.aft[fl].CLmax_1g - cl.aft['0'].CLmax_1g, 3) };
  // stall speeds the C172S CLmax would give at 2,450 lb (cross-check of "same wing")
  o.stallFromC172sCL = Object.fromEntries(Object.keys(c172s).map(k => [k, r(stallSpeed({ mass: m, S, CLmax: c172s[k] }) * Math.sqrt(0.95), 2)]));

  // IAS -> CAS
  const ias2cas = (fl, kias) => { const t = POH.iasCas[fl]; return lin(t.map(p => p[0]), t.map(p => p[1]), kias); };
  o.speedsCAS = { VY_79: r(ias2cas('0', 79), 1), VY_71_10k: r(ias2cas('0', 71), 1), VX_60: r(ias2cas('0', 60), 1), VG_65: r(ias2cas('0', 65), 1), VR_51_f10: r(ias2cas('10', 51), 1), V50_57_f10: r(ias2cas('10', 57), 1),
    VREF_62_f30: r(ias2cas('30', 62), 1), VAPP_65_f30: r(ias2cas('30', 65), 1), VA_99: r(ias2cas('0', 99), 1), VNO_129: r(ias2cas('0', 129), 1), VNE_163_extrap: r(ias2cas('0', 163), 1),
    VFE10_110_f0table: r(ias2cas('0', 110), 1), VFE10_110_f10table: r(ias2cas('10', 110), 1), VFE30_85: r(ias2cas('30', 85), 1), whiteArc_33_f30_extrap: r(ias2cas('30', 33), 1), greenArc_44_f0_extrap: r(ias2cas('0', 44), 1),
    note: 'POH p2-4 gives VNE 160, VNO 126, VA 97, VFE10 108, VFE 84 KCAS; Fig 5-1 flaps-up row ends at 160 KIAS = 154 KCAS (does not reach VNE)' };

  // glide polar (est): 65 KIAS -> KCAS; E from 1.5 NM / 1000 ft (FAASTeam rule of thumb)
  const E = POH.glide.nm_per_1000ft * NM / (1000 * FT), vbg = ias2cas('0', POH.glide.kias);
  const pg = polarFromGlide({ mass: m, S, v_kcas: vbg, E, AR: b * b / S }); const sp = toSimPolar({ CD0: pg.CD0, K: pg.K });
  o.glide = { E: r(E, 3), vbg_kcas: r(vbg, 2), CL: r(pg.CL, 4), CD0: r(pg.CD0, 4), K: r(pg.K, 4), e: r(pg.e, 3), sim: { CD0: r(sp.CD0, 4), K: r(sp.K, 4), Emax: r(sp.Emax, 3), CLstar: r(sp.CLstar, 3) },
    sink_fpm: r(vbg * KT / E / FT * 60, 0), vbg_scaled_from_c172s_kias: r(68 * Math.sqrt(POH.MTOW_lb / 2550), 1) };
  // cruise point 80 % (128 hp) at 8,000 ft ISA, 122 KTAS WITH speed fairings (IM p ii note and Fig 5-8 sheet 2: 2,400 rpm), eta 0.80 (est)
  // (review 2026-11-19: the IM spec page and Fig 5-8 both state speeds with optional speed fairings, ~2 kt faster than without)
  const rho8 = rhoISA(8000 * FT), Vc = 122 * KT, qc = 0.5 * rho8 * Vc * Vc, CLc = m * G0 / (qc * S);
  const etaC = 0.80, Pc = 0.80 * POH.P_hp * HP, CDc = etaC * Pc / (Vc * qc * S);
  o.cruise80 = { rho: r(rho8, 4), CL: r(CLc, 4), CD_eta080: r(CDc, 4), CD_glidepolar: r(pg.CD0 + pg.K * CLc * CLc, 4), ratio: r(CDc / (pg.CD0 + pg.K * CLc * CLc), 3) };
  // clean (thrust-on) polar: CD0 from that cruise point, e 0.75 (est, as C172S card)
  const Kc = 1 / (Math.PI * (b * b / S) * 0.75), CD0c = CDc - Kc * CLc * CLc;
  o.cleanPolar = { CD0: r(CD0c, 4), K: r(Kc, 4), e: 0.75, Emax: r(0.5 / Math.sqrt(CD0c * Kc), 2), CLstar: r(Math.sqrt(CD0c / Kc), 3) };
  // second check: every ISA cruise-table point of both sheets, at the printed KTAS (with fairings, same basis as the polar point) -> CD at eta 0.80
  // (before review: used KTAS - 2 kt, i.e. mixed bases; the ratio CD/CD_clean is reported per point)
  const cruiseAll = [...POH.cruiseISA, ...POH.cruiseISA2];
  o.cruiseTable = cruiseAll.map(([pa, rpm, pct, ktas, gph]) => { const rho = rhoISA(pa * FT), V = ktas * KT, q = 0.5 * rho * V * V, CL = m * G0 / (q * S);
    const CD = etaC * pct / 100 * POH.P_hp * HP / (V * q * S), CDcl = CD0c + Kc * CL * CL;
    return { pa, rpm, pct, ktas, CL: r(CL, 3), CD: r(CD, 4), CD_clean: r(CDcl, 4), ratio: r(CD / CDcl, 3) }; });
  const rat = o.cruiseTable.map(t => t.ratio); o.cruiseTableRatio = { min: Math.min(...rat), max: Math.max(...rat), n: rat.length };
  // BSFC from the cruise table (recommended lean): lb/h = GPH * 6.0; both sheets (34 points)
  const bs = cruiseAll.map(([, , pct, , gph]) => gph * POH.avgas_lb_per_gal / (pct / 100 * POH.P_hp));
  const bsAvg = bs.reduce((a, x) => a + x, 0) / bs.length;
  o.bsfc = { lb_per_hp_h: r(bsAvg, 3), g_per_kWh: r(bsAvg * 453.59237 / 0.74569987, 0), min: r(Math.min(...bs), 3), max: r(Math.max(...bs), 3), n: bs.length };

  // inertia at MTOW: TM-80163 C172-class radii (as C172S card) with the 172R mass and length; class radii for comparison
  const tm = radiiOf({ m: 837.93, Ixx: 1395, Iyy: 1480, Izz: 2563, b: 11.0, L: 8.2 });
  const Ia = inertiaFromRadii({ m, b, L, ...tm }), Ib = inertiaFromRadii({ m, b, L, ...RADII.single_prop });
  const Ic = inertiaFromRadii({ m, b, L: 8.20522, ...tm });
  o.inertia = { radii_TM80163: { Rx: r(tm.Rx), Ry: r(tm.Ry), Rz: r(tm.Rz) }, MTOW_TM: { Ixx: r(Ia.Ixx, 0), Iyy: r(Ia.Iyy, 0), Izz: r(Ia.Izz, 0), Ixz: r(123 * m / 837.93, 0) },
    MTOW_TM_L172S: { Ixx: r(Ic.Ixx, 0), Iyy: r(Ic.Iyy, 0), Izz: r(Ic.Izz, 0) },
    radii_class: RADII.single_prop, MTOW_class: { Ixx: r(Ib.Ixx, 0), Iyy: r(Ib.Iyy, 0), Izz: r(Ib.Izz, 0) } };

  // performance tables: VTBD hot-day points (field 9 ft ≈ SL; OAT 30 / 35 C)
  const tab2 = (T, key, pa, oat) => { const i = T.PA.indexOf(pa); return lin(T.OAT, T[key][i], oat); };
  o.hot = {};
  for (const oat of [15, 30, 35]) o.hot[oat] = { to_roll_ft: r(tab2(POH.to, 'roll', 0, oat), 0), to_50_ft: r(tab2(POH.to, 'total', 0, oat), 0),
    ldg_roll_ft: r(tab2(POH.ldg, 'roll', 0, oat), 0), ldg_50_ft: r(tab2(POH.ldg, 'total', 0, oat), 0), roc_fpm: r(lin(POH.roc.OAT, POH.roc.fpm[0], oat), 0) };
  for (const h of Object.values(o.hot)) { h.to_roll_m = r(h.to_roll_ft * FT, 0); h.to_50_m = r(h.to_50_ft * FT, 0); h.ldg_roll_m = r(h.ldg_roll_ft * FT, 0); h.ldg_50_m = r(h.ldg_50_ft * FT, 0); }
  o.hotRatio35 = { to_roll: r(o.hot[35].to_roll_ft / o.hot[15].to_roll_ft, 3), to_50: r(o.hot[35].to_50_ft / o.hot[15].to_50_ft, 3), ldg_50: r(o.hot[35].ldg_50_ft / o.hot[15].ldg_50_ft, 3), roc: r(o.hot[35].roc_fpm / o.hot[15].roc_fpm, 3) };
  o.rocISA = POH.roc.PA.map((pa, i) => { const t = 15 - 1.98 * pa / 1000, row = POH.roc.fpm[i]; const xs = POH.roc.OAT.filter((_, j) => row[j] != null), ys = row.filter(x => x != null);
    return [pa, POH.roc.kias[i], r(lin(xs, ys, t), 0)]; });
  // absolute ceiling (ROC -> 0) and service ceiling (100 fpm) from the ISA column, linear extrapolation
  const ri = o.rocISA, a5 = ri[5], a6 = ri[6], slope = (a6[2] - a5[2]) / (a6[0] - a5[0]);
  o.ceilings = { service_100fpm_ft: r(a6[0] + (100 - a6[2]) / slope, 0), absolute_ft: r(a6[0] - a6[2] / slope, 0) };
  const pIF = t => powerIndFriction({ delta: 1, theta: (273.15 + t) / 288.15, f: 0.10 }), pGF = t => lapseGaggFerrar(288.15 / (273.15 + t));
  o.lapseVTBD = { ind_friction_35C: r(pIF(35), 4), gagg_farrar_35C: r(pGF(35), 4), POH_roc_ratio_35_15: o.hotRatio35.roc };

  // part 23 limit descent velocity: V = 4.4 (W/S)^0.25 fps, 7..10 fps
  const ws = POH.MTOW_lb / POH.S_ft2; o.part23 = { WS_lb_ft2: r(ws, 2), Vdesc_fps: r(Math.min(10, Math.max(7, 4.4 * Math.pow(ws, 0.25))), 2) };
  o.part23.Vdesc_mps = r(o.part23.Vdesc_fps * FT, 3);

  // propeller: lm_prop fixed-pitch planform with the 1C235/LFA7570 size (75 in, 70 in pitch), chord calibrated to the
  // TCDS static-rpm midpoint 2,115 rpm on the 160 hp / 2,400 rpm engine (ESTIMATE: blade planform not public)
  const prated = POH.P_hp * HP, eng = { P_rated_W: prated, rpm_rated: POH.rpm_rated };
  const P0 = { ...PROPS.fixed_76x60, D: POH.prop_D_in * IN, pitch_m: POH.prop_pitch_in * IN, note: 'McCauley 1C235/LFA7570 class (C172R): 75 in, 70 in pitch (ค่าประมาณ planform)' };
  P0.chordScale = calibrateChord(P0, 2115, eng);
  const st = staticRpm(P0, eng), stH = staticRpm(P0, { ...eng, dT: 20 });
  const stLo = staticRpm({ ...P0, chordScale: calibrateChord(P0, 2065, eng) }, eng), stHi = staticRpm({ ...P0, chordScale: calibrateChord(P0, 2165, eng) }, eng);
  const D = P0.D;
  const bal = (Vkt, h = 0) => { const V = Vkt * KT, rho = rhoISA(h * FT), th = (288.15 - 0.0065 * h * FT) / 288.15; const delta = Math.pow(th, 5.25588); let lo = 1200, hi = 3500;
    for (let k = 0; k < 50; k++) { const N = 0.5 * (lo + hi), n = N / 60, J = V / (n * D); const b2 = bem(P0, J, { n });
      const Pp = b2.CP * rho * n ** 3 * D ** 5, Pe = prated * powerIndFriction({ delta, theta: th, rpmFrac: N / POH.rpm_rated, f: 0.10 }); if (Pp > Pe) hi = N; else lo = N; }
    const N = 0.5 * (lo + hi), n = N / 60, J = V / (n * D), b2 = bem(P0, J, { n }); return { rpm: r(N, 0), J: r(J, 3), T_N: r(b2.CT * rho * n * n * D ** 4, 0), eta: r(b2.eta, 3) }; };
  const dragClean = (Vkt, h = 0) => { const rho = rhoISA(h * FT), V = Vkt * KT, q = 0.5 * rho * V * V, CL = m * G0 / (q * S); return r((CD0c + Kc * CL * CL) * q * S, 0); };
  // full-throttle level speed at SL with the clean polar: T(V) = D(V)
  let vlo = 80, vhi = 160; for (let k = 0; k < 40; k++) { const v = 0.5 * (vlo + vhi); if (bal(v).T_N > dragClean(v)) vlo = v; else vhi = v; }
  o.prop = { chordScale: r(P0.chordScale, 4), pitch_in: POH.prop_pitch_in, beta75_deg: r(Math.atan(POH.prop_pitch_in / (0.75 * Math.PI * POH.prop_D_in)) * 180 / Math.PI, 2),
    static: { rpm: r(st.rpm, 0), T0_N: r(st.T0_N, 0), T0_lbf: r(st.T0_N / 4.4482216, 0), P_hp: r(st.P_W / HP, 1), FM: r(figureOfMerit(st.T0_N, st.P_W, RHO0, D), 3) },
    static_range: { rpm2065_T0_N: r(stLo.T0_N, 0), rpm2165_T0_N: r(stHi.T0_N, 0) },
    staticISA20: { rpm: r(stH.rpm, 0), T0_N: r(stH.T0_N, 0) },
    vmax_SL_clean_polar_kt: r(0.5 * (vlo + vhi), 1), at123: { ...bal(123), drag_clean_N: dragClean(123) }, at100: { ...bal(100), drag_clean_N: dragClean(100) },
    vy: { ...bal(o.speedsCAS.VY_79), drag_clean_N: dragClean(o.speedsCAS.VY_79) }, cruise80_8000: bal(122, 8000),
    // review 2026-11-19: power absorbed by the BEM prop at the POH cruise points (Fig 5-8, rpm and KTAS as printed) vs POH %BHP x 160 hp
    cruiseAbsorb: cruiseAll.map(([pa, rpm, pct, ktas]) => { const rho = rhoISA(pa * FT), n = rpm / 60, J = ktas * KT / (n * D), b2 = bem(P0, J, { n });
      return { pa, rpm, ktas, J: r(J, 3), P_bem_hp: r(b2.CP * rho * n ** 3 * D ** 5 / HP, 1), P_poh_hp: r(pct / 100 * POH.P_hp, 1), ratio: r(b2.CP * rho * n ** 3 * D ** 5 / HP / (pct / 100 * POH.P_hp), 3) }; }),
    table: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1].map(J => { const x = bem(P0, J, { n: 35 }); return [J, r(x.CT, 4), r(x.CP, 4), r(x.eta, 3)]; }) };
  o.prop.peakEta = Math.max(...o.prop.table.map(t => t[3]));
  o.prop.momentumIdealStatic_N = r(Math.pow(st.P_W * Math.sqrt(2 * RHO0 * Math.PI * D * D / 4), 2 / 3), 0);

  // older variants in SI
  o.old = {};
  for (const [id, v] of Object.entries(OLD)) o.old[id] = { MTOW_kg: r(v.MTOW_lb * LB, 1), P_kW: r(v.P_hp * HP / 1000, 1), rpm: v.rpm, prop_D_m: r(v.prop_D_in * IN, 3), static_rpm: v.static_rpm,
    power_loading_lb_hp: r(v.MTOW_lb / v.P_hp, 2), wing_loading_lb_ft2: r(v.MTOW_lb / 174, 2), cg_fwd_mtow_pctMAC: pm(v.cg_fwd_mtow_in), cg_aft_pctMAC: pm(v.cg_aft_in),
    CLmax0_from_vs1: v.spec.vs1_kcas ? r(clmaxFromStall({ mass: v.MTOW_lb * LB, S, vs_kcas: v.spec.vs1_kcas, kind: 'min' }).CLmax_1g, 3) : null,
    CLmaxFull_from_vs0: v.spec.vs0_kcas ? r(clmaxFromStall({ mass: v.MTOW_lb * LB, S, vs_kcas: v.spec.vs0_kcas, kind: 'min' }).CLmax_1g, 3) : null,
    to_roll_m: v.spec.to_roll_ft ? r(v.spec.to_roll_ft * FT, 0) : null, to_50_m: v.spec.to_50_ft ? r(v.spec.to_50_ft * FT, 0) : null, roc_sl_mps: r(v.spec.roc_sl_fpm * FT / 60, 2) };
  return o;
}

if (isMainModule(import.meta.url)) {
  const o = compute();
  fs.mkdirSync(path.join(HERE, 'out'), { recursive: true });
  fs.writeFileSync(path.join(HERE, 'out', 'le_calc.json'), JSON.stringify(o, null, 1));
  console.log(JSON.stringify(o, null, process.argv.includes('--json') ? 1 : 0).slice(0, process.argv.includes('--json') ? 1e9 : 9000));
}
