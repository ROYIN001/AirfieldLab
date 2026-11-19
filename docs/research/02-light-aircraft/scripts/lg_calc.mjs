#!/usr/bin/env node
// lg_calc.mjs — Tecnam P2006T (12-p2006t.md, code LG): facts with sources, derived geometry, CG in %MAC, weights,
// inertia by component build-up (ค่าประมาณ), CLmax from AFM stall speeds, polar and glide estimate, BEM propeller,
// engine lapse at VTBD. Writes scripts/out/lg_calc.json. Uses the round-2 tools lm_polar, lm_prop, lm_engine, lm_inertia.
// Run from the repo root: node <this folder>/lg_calc.mjs [--print]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { clmaxFromStall, toSimPolar, polarFromGlide, rhoISA, KT, FT, G0, RHO0, HP, LB } from './lm_polar.mjs';
import { PROPS, bem, betaForPower, figureOfMerit } from './lm_prop.mjs';
import { lapse, isa } from './lm_engine.mjs';
import { RADII, radiiOf, inertiaFromRadii } from './lm_inertia.mjs';
import { isMainModule } from './lm_lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const r = (x, n = 4) => (typeof x === 'number' ? +x.toPrecision(n) : x);

// ───────── facts (source tag in comment; LG numbering as in 12-p2006t.md §12.13) ─────────
export const F = {
  // [LG1] EASA TCDS EASA.A.185 Issue 19 (20 Apr 2026)
  MTOW: 1180, MZFW: 1145, MTOW_1230: 1230, MZFW_1230: 1195, MTOW_1290: 1290,
  MAC_tcds: 1.339, cg_fwd: 0.221, cg_aft: 0.415, cg_fwd_pct: 16.5, cg_aft_pct: 31.0, baggage_arm: 1.215, baggage_max: 80,
  travel: { stab: { up: 15, down: 4 }, stabTab: { up: 2, down: 19 }, ail: { up: 20, down: 17 }, rud: 26, rudTab: 20, flapFull: 40 },
  nz: { up: [3.8, -1.78], flaps: [2.0, 0] }, maxAlt_ft: 14000, fuelTotal_L: 200, fuelUsable_L: 194.4,
  spdTCDS: { VA: [119, 117], VFE_LDG: [93, 92], VFE_TO: [119, 117], VLO: [93, 92], VLE: [93, 92], VMC: [62, 62], VNO: [135, 134], VNE: [167, 168] },
  // [LG2] AFM Doc 2006/044 4th ed Rev 5 (12 Jan 2018), sections 0–3
  b: 11.4, L: 8.7, H: 2.58, S: 14.76, MGC: 1.295, AR: 8.80, dihedral: 1, track: 2.0, wheelbase: 2.9,
  P_TO_kW: 73.5, P_MCP_kW: 69.0, rpmEngTO: 5800, rpmEngMCP: 5500, rpmPropTO: 2388, rpmPropMCP: 2265, D_prop: 1.78,
  spdAFM: { VA: [118, 117], VNO: [135, 133] }, asi: { white: [53, 93], green: [66, 135], yellow: [135, 167], VMC: 62, VYSE: 80 },
  oei: { VYSE: [80, 84], VXSE: [79, 83] }, vyEmergency: [83, 84],
  // [LG3] AFM 4th ed sections 3–4 (normal speeds p S4-7) 1180 / 1230 kg
  normal: { VR: [64, 65], VX: [73, 72], VY: [80, 84], approachTO: [90, 90], finalFULL: [70, 71], touchdown: 65, VSSE: 70 },
  // [LG4] AFM 4th ed p 5-5 stall table (manualslib text extraction): bank 0/15/30/45/60, [KIAS, KCAS], 1180 kg, CG 22 %, idle, gear down
  stall: { TO: [[56, 56], [57, 57], [60, 60], [67, 67], [81, 79]], FULL: [[53, 54], [54, 55], [58, 58], [64, 64], [78, 76]] },
  stall1230: { TO: [[59, 57], [58, 58], [61, 61], [68, 68], [83, 81]], FULL: [[54, 55], [55, 56], [59, 59], [65, 65], [79, 78]] },
  stallAltLoss_ft: 180, xwind_kt: 17, asiExample: [75, 74],
  // [LG4] AFM 4th ed en-route rate of climb table, first row (sea level inferred), °C → fpm (1180 kg inferred)
  rocEnroute: [[-25, 1392], [0, 1205], [25, 1038]], rocTakeoff: [[-25, 1347], [0, 1154], [25, 982]],
  // [LG5] AFM 1st ed (2009) p 5-9: take-off on grass, flaps T/O, lift-off 66.5 KIAS; paved −6 %; headwind −2.5 m/kt
  tkoLiftoff: 66.5,
  // [LG6] brochure 2021 (MTOW 1230 kg, conditions not stated)
  bro: { BEW: 860, useful: 370, cruiseMax: 145, VS0_kcas: 55, toRun: 301, toDist: 394, ldgRun: 231, ldgDist: 349, roc: 1036, range_nm: 650 },
  // [LG7] Nicolosi, De Marco, Della Vecchia, EWADE 2011 (flight test / parameter estimation, 110 kt)
  ft: { CD0: 0.0334, CDa: 0.222, CL0: 0.289, CLa: 4.152, CLa_level: 3.85, Cma: -0.871, Cmq: -14.799, Cmde: -1.811, CLmax_static: 1.25, e_winglet: 0.82,
    lat: { Clb: -0.029, Clp: -0.281, Clr: 0.057, Clda: -0.045, Cldr: 0.0009, Cnb: 0.0135, Cnp: -0.130, Cnr: -0.106, Cnda: -0.009, Cndr: -0.0304, CYb: -0.355, CYdr: 0.04 },
    WT: { CD0: 0.027, CL0: 0.153, CLa: 4.5, Cm0: -0.08, Cma: -0.80, Cmde: -1.830, Clb: -0.0573, Cldr: 0.0115, Cnb: 0.05, Cndr: -0.0631, CYb: -0.688 },
    semi: { Cmq: -19.05, Clb: -0.061, Clp: -0.529, Clda: -0.057, Cldr: 0.014, Cnb: 0.096, Cnr: -0.084, Cndr: -0.0679, CYb: -0.563, CYdr: 0.173 },
    modes: { ph: { T: 27, zeta: 0.09, wn: 0.234 }, sp: { wn: 3.41, zeta: 0.40, CAP: 1.009 }, dr: { wn: 2.00, zeta: 0.26, T: 3.25 }, V_kt: 110 } },
  // [LG8] Pascale & Nicolosi, ICAS 2008 paper 629
  icas: { airfoilRoot: 'NACA 63A415 mod', airfoilTip: 'NACA 63A412 mod', polarWinglet: { CD0: 0.024, e: 0.83 }, polarTrim: { CD0: 0.037, e: 0.70 },
    xac_wb: 0.11, xnp: 0.41, sm: 0.16, cgCruise: 0.25, Vmax_kt: 150, nacelleW: 0.575, rotaxDry: 59, ffPerEng_lph: 19 },
  // [LG9] Flying 2011 ; [LG10] AOPA 2010
  fly: { roc: 1050, rocOEI: 250, ceilOEI: 7500, cruise: 145, gph: 10, BEW_lb: 1817, engine_lb: 160 },
  aopa: { VR: 65, roc: 1140, maxPwr: [151, 26], cruise75: [142, 25, 3500, -8], gphMCP: 5, gph75: 4, gearTime: 20, final: { FULL: 70, TO: 75, UP: 82 } },
  // [LG11] Rotax 912 ULS/S datasheet 2021/01
  rotax: { disp_L: 1.352, bore: 84, stroke: 61, Tmax: 128, rpmTmax: 5100, gear: 2.43, mass: 56.6 },
};

// ───────── derived ─────────
export function compute() {
  const out = {};
  // geometry
  const S = F.S, b = F.b, AR = b * b / S;
  out.geom = { S, b, AR_calc: r(AR, 4), AR_afm: F.AR, MGC: F.MGC, MGC_calc: r(S / b, 4), MAC: F.MAC_tcds, L: F.L };
  // CG: LEMAC from TCDS limits (both limits give the same LEMAC)
  const lemac1 = F.cg_fwd - F.cg_fwd_pct / 100 * F.MAC_tcds, lemac2 = F.cg_aft - F.cg_aft_pct / 100 * F.MAC_tcds;
  const pct = x => 100 * (x - 0) / F.MAC_tcds;
  const xref = 0.25 * F.MAC_tcds;   // reference CG 25 % MAC (ICAS 2008 cruise CG)
  out.cg = { LEMAC_from_fwd: r(lemac1, 3), LEMAC_from_aft: r(lemac2, 3), ref_m: r(xref, 4), ref_pct: 25,
    pct_with_MGC: { fwd: r(100 * F.cg_fwd / F.MGC, 3), aft: r(100 * F.cg_aft / F.MGC, 3) },
    envelope: [[700, F.cg_fwd, F.cg_aft], [F.MTOW, F.cg_fwd, F.cg_aft]], envelope_1230: [[700, F.cg_fwd, F.cg_aft], [1230, F.cg_fwd, F.cg_aft]],
    envelope_1290_fwd: 0.261 };
  // weights and training mass (est): BEW brochure 860 kg + instructor 85 + student 75 + 150 L fuel (MOGAS/AVGAS 0.72 kg/l)
  const fuelL = 150, fuel = fuelL * 0.72;
  out.weights = { MTOW: F.MTOW, MLW: F.MTOW, MZFW: F.MZFW, BEW: F.bro.BEW, fuel_usable_kg: r(F.fuelUsable_L * 0.72, 4), useful_1180: F.MTOW - F.bro.BEW,
    training_mass: r(F.bro.BEW + 85 + 75 + fuel, 4), trainFuelL: fuelL, fullFuelTwoPilots: r(F.bro.BEW + 160 + F.fuelUsable_L * 0.72, 4) };

  // inertia by component build-up (Roskam Part V ch.10 method, masses/positions ค่าประมาณ), DAT x aft of wing LE, z down from wing chord plane
  const EMPTY_CG = 0.30;   // est (m DAT)
  const build = ({ empty = 860, crew = 160, fuelL: fl = 150, rear = 0 } = {}) => {
    const it = [
      ['engine 912 S3 incl. fluids + MT prop + mount/cowl/radiator (each)', 94, -1.00, 1.65, 0.20, 'pt'],
      ['wing structure incl. flaps/ailerons (each side)', 82, 0.50, [0.65, b / 2], 0.0, 'rodY'],
      ['main gear + sponson (each, retracted)', 24, 0.75, 0.75, 1.15, 'pt'],
      ['nose gear', 12, -2.15, 0, 1.15, 'pt'],
      ['forward fuselage + cabin structure', 125, [-2.6, 1.5], 0, 0.75, 'rodX'],
      ['tail cone', 40, [1.5, 5.6], 0, 0.55, 'rodX'],
      ['empennage (stabilator + fin)', 35, 5.4, 0, 0.20, 'pt'],
      ['avionics, interior, systems (balance)', 0, 0.0, 0, 0.75, 'pt'],
    ];
    const per = x => (x[5] === 'rodY' || (x[5] === 'pt' && x[3] !== 0) ? 2 : 1), xc = x => (Array.isArray(x[2]) ? 0.5 * (x[2][0] + x[2][1]) : x[2]);
    const fixed = it.slice(0, -1).reduce((s, x) => s + per(x) * x[1], 0), mom = it.slice(0, -1).reduce((s, x) => s + per(x) * x[1] * xc(x), 0);
    it.at(-1)[1] = empty - fixed; it.at(-1)[2] = (EMPTY_CG * empty - mom) / it.at(-1)[1];
    return [...it, ['crew (front seats)', crew, -0.05, 0, 0.85, 'pt'], ['rear passengers', rear, 0.85, 0, 0.85, 'pt'], ['fuel (each wing)', fl * 0.72 / 2, 0.45, 2.30, 0.05, 'pt']];
  };
  const inertia = items => {
    const pts = [];
    for (const [, m, x, y, z, k] of items) { if (!(m > 0)) continue; const sides = (k === 'rodY' || (k === 'pt' && y !== 0)) ? [1, -1] : [0];
      for (const s of sides) { if (k === 'rodY') { for (let i = 0; i < 20; i++) pts.push([m / 20, x, s * (y[0] + (y[1] - y[0]) * (i + 0.5) / 20), z]); }
        else if (k === 'rodX') { for (let i = 0; i < 20; i++) pts.push([m / 20, x[0] + (x[1] - x[0]) * (i + 0.5) / 20, 0, z]); } else pts.push([m, x, s * y, z]); } }
    const M = pts.reduce((s, p) => s + p[0], 0), cx = pts.reduce((s, p) => s + p[0] * p[1], 0) / M, cz = pts.reduce((s, p) => s + p[0] * p[3], 0) / M;
    let Ixx = 0, Iyy = 0, Izz = 0, Ixz = 0;
    for (const [m, x, y, z] of pts) { const dx = cx - x, dz = z - cz; Ixx += m * (y * y + dz * dz); Iyy += m * (dx * dx + dz * dz); Izz += m * (dx * dx + y * y); Ixz += m * dx * dz; }
    return { m: M, x_cg: cx, z_cg: cz, Ixx, Iyy: Iyy * 1.03, Izz: Izz * 1.03, Ixz };
  };
  const cases = { training: { crew: 160, fuelL: 150 }, mtow: { crew: 160, fuelL: 194.4, rear: F.MTOW - 860 - 160 - 194.4 * 0.72 }, empty: { crew: 0, fuelL: 0 } };
  out.inertia = {};
  for (const [k, c] of Object.entries(cases)) {
    const I = inertia(build(c)), R = radiiOf({ m: I.m, Ixx: I.Ixx, Iyy: I.Iyy, Izz: I.Izz, b, L: F.L });
    out.inertia[k] = { m: r(I.m, 5), x_cg: r(I.x_cg, 3), cg_pct: r(pct(I.x_cg), 3), z_cg: r(I.z_cg, 3), Ixx: r(I.Ixx), Iyy: r(I.Iyy), Izz: r(I.Izz), Ixz: r(I.Ixz, 3), radii: { Rx: r(R.Rx, 3), Ry: r(R.Ry, 3), Rz: r(R.Rz, 3) } };
  }
  const mT = out.inertia.training.m;
  out.inertia.class_single_prop = Object.fromEntries(Object.entries(inertiaFromRadii({ m: mT, b, L: F.L, ...RADII.single_prop })).map(([k, v]) => [k, r(v)]));
  out.inertia.class_twin_C310 = Object.fromEntries(Object.entries(inertiaFromRadii({ m: mT, b, L: F.L, ...RADII.twin_prop })).map(([k, v]) => [k, r(v)]));
  out.inertia.items_training = build(cases.training).map(([n, m, x, y, z, k]) => ({ n, m: r(m, 4), x: Array.isArray(x) ? x : r(x, 3), y, z, k }));

  // CLmax from AFM stall speeds (KCAS, MTOW 1180 kg, minimum speed of a 1 kt/s entry → 1 g with nz 0.95)
  const cl = v => clmaxFromStall({ mass: F.MTOW, S, vs_kcas: v, kind: 'min' });
  const VS1_kcas = 65;   // 66 KIAS → 65 KCAS by extrapolating the flaps-0 IAS–CAS points 75→74, 93→92 (slope 1, offset −1 kt) ค่าประมาณ
  out.clmax = { '0': { vs_kias: 66, vs_kcas: VS1_kcas, ...cl(VS1_kcas) }, '15': { vs_kias: 56, vs_kcas: 56, ...cl(56) }, '40': { vs_kias: 53, vs_kcas: 54, ...cl(54) } };
  for (const k of Object.keys(out.clmax)) for (const q of ['CLmax_1g', 'CLapparent', 'V1g_kcas']) out.clmax[k][q] = r(out.clmax[k][q], 4);
  out.clmax.ft_static_clean = { CLmax: F.ft.CLmax_static, vs_1g_kcas_1180: r(Math.sqrt(2 * F.MTOW * G0 / (RHO0 * S * F.ft.CLmax_static)) / KT, 4) };
  out.clmax.check1230 = { TO_kcas: r(56 * Math.sqrt(1230 / 1180), 4), FULL_kcas: r(54 * Math.sqrt(1230 / 1180), 4), afm: { TO: 57, FULL: 55 } };
  out.clmax.bankCheck = F.stall.TO.map(([, c], i) => r(c / F.stall.TO[0][1] / Math.sqrt(1 / Math.cos([0, 15, 30, 45, 60][i] * Math.PI / 180)), 4));
  const dCLmax = { '15': out.clmax['15'].CLmax_1g - out.clmax['0'].CLmax_1g, '40': out.clmax['40'].CLmax_1g - out.clmax['0'].CLmax_1g };
  out.flaps = { dCLmax: { '15': r(dCLmax['15'], 3), '40': r(dCLmax['40'], 3) }, dCL0: { '15': r(dCLmax['15'] / 0.85, 3), '40': r(dCLmax['40'] / 0.85, 3) }, ratioNote: 'ΔCL0 = ΔCLmax/0.85 (slotted flap, ค่าประมาณ)' };

  // polars: flight-test (EWADE) and glide estimate
  const K_ft = 1 / (Math.PI * F.AR * F.ft.e_winglet), K_icas = 1 / (Math.PI * F.AR * F.icas.polarWinglet.e);
  const Vbg_kcas = 82;   // best glide = VY 83 KIAS (AFM S3-56/57); −1 kt IAS→CAS (ค่าประมาณ จากแนวโน้ม VNO 135/134, VA 119/117)
  const CLbg = 2 * F.MTOW * G0 / (RHO0 * S * (Vbg_kcas * KT) ** 2);
  const CD_ft = F.ft.CD0 + K_ft * CLbg * CLbg, dCDidle = 0.008;   // two idling constant-speed props at fine pitch (ค่าประมาณ ±0.004)
  const E_aero = CLbg / CD_ft, E_idle = CLbg / (CD_ft + dCDidle);
  out.polar = { K_ft: r(K_ft, 4), K_icas: r(K_icas, 4), Emax_ft: r(1 / (2 * Math.sqrt(F.ft.CD0 * K_ft)), 4), Emax_icas: r(1 / (2 * Math.sqrt(F.icas.polarWinglet.CD0 * K_icas)), 4),
    CLstar_ft: r(Math.sqrt(F.ft.CD0 / K_ft), 4), Vbg_kcas, CLbg: r(CLbg, 4), E_aero_at_Vbg: r(E_aero, 4), dCDidle, E_idle_at_Vbg: r(E_idle, 3),
    E_range: [r(CLbg / (CD_ft + 0.012), 3), r(CLbg / (CD_ft + 0.004), 3)], simFromFt: toSimPolar({ CD0: F.ft.CD0, K: K_ft }) };
  const gl = polarFromGlide({ mass: F.MTOW, S, v_kcas: Vbg_kcas, E: +E_idle.toFixed(1) });
  out.polar.fromGlide = { CD0: r(gl.CD0, 4), K: r(gl.K, 4), e: r(gl.e ?? 1 / (Math.PI * F.AR * gl.K), 3), sim: toSimPolar(gl) };
  for (const k of ['simFromFt']) for (const q of Object.keys(out.polar[k])) out.polar[k][q] = r(out.polar[k][q], 4);
  for (const q of Object.keys(out.polar.fromGlide.sim)) out.polar.fromGlide.sim[q] = r(out.polar.fromGlide.sim[q], 4);

  // climb: AFM en-route table first row → ISA SL (15 °C) and VTBD 35 °C (linear extrapolation, ค่าประมาณ)
  const lin = (t, tab) => { const [a, b2] = t <= tab[1][0] ? [tab[0], tab[1]] : [tab[1], tab[2]]; return a[1] + (t - a[0]) * (b2[1] - a[1]) / (b2[0] - a[0]); };
  out.climb = { enroute_15C: r(lin(15, F.rocEnroute), 4), enroute_35C: r(lin(35, F.rocEnroute), 4), takeoff_15C: r(lin(15, F.rocTakeoff), 4), takeoff_35C: r(lin(35, F.rocTakeoff), 4),
    slope_fpm_per_C: r((F.rocEnroute[2][1] - F.rocEnroute[1][1]) / 25, 3), brochure_1230: F.bro.roc, flying: F.fly.roc, aopa: F.aopa.roc };

  // engine: gear ratio, torque, lapse at VTBD (ind_friction f 0.10, methods §01.6)
  out.engine = { gear_from_rpm: r(F.rpmEngTO / F.rpmPropTO, 4), gear_mcp: r(F.rpmEngMCP / F.rpmPropMCP, 4), Q_prop_TO_Nm: r(F.P_TO_kW * 1000 / (F.rpmPropTO * 2 * Math.PI / 60), 4),
    Q_eng_TO_Nm: r(F.P_TO_kW * 1000 / (F.rpmEngTO * 2 * Math.PI / 60), 4), lapse_VTBD_35C: r(lapse('ind_friction', 9 * FT, 20), 4), lapse_VTBD_35C_gf: r(lapse('gagg_ferrar', 9 * FT, 20), 4),
    lapse_8000ft: r(lapse('ind_friction', 8000 * FT, 0), 4), bsfc_from_icas: r(F.icas.ffPerEng_lph * 0.72 * 1000 / (0.75 * F.P_TO_kW), 4),
    bsfc_from_aopa75: r(F.aopa.gph75 * 3.785 * 0.72 * 1000 / (0.75 * F.P_TO_kW), 4) };

  // propeller BEM: MT 2-blade constant speed 1.78 m (geometry ค่าประมาณ: GA planform, helical twist J 1.0)
  const P2 = { ...PROPS.cs3_190, B: 2, D: F.D_prop, Jd: 1.0, cD: PROPS.cs3_190.cD.map(c => c / 0.85), note: 'MT MTV-21 class 2-blade CS 1.78 m (geometry est)' };
  const n = F.rpmPropTO / 60, st = betaForPower(P2, 0.0001, { P_W: F.P_TO_kW * 1000, rpm: F.rpmPropTO });
  const T0e = st.CT * RHO0 * n * n * P2.D ** 4;
  const pt = (Vkt, P_W, rpm, h = 0, dT = 0) => { const rho = rhoISA(h, dT), nn = rpm / 60, J = Vkt * KT / (nn * P2.D); const s = betaForPower(P2, J, { P_W, rpm, rho }); return { V_kt: Vkt, J: r(J, 3), beta75: r(s.beta75_deg, 3), eta: r(s.eta, 3), T_N: r(s.CT * rho * nn * nn * P2.D ** 4, 4) }; };
  out.prop = { static: { beta75: r(st.beta75_deg, 3), CT: r(st.CT, 4), CP: r(st.CP, 4), T_each_N: r(T0e, 4), T_total_N: r(2 * T0e, 4), FM: r(figureOfMerit(T0e, F.P_TO_kW * 1000, RHO0, P2.D), 3) },
    climb80: pt(80, F.P_MCP_kW * 1000, F.rpmPropMCP), climb80_TO: pt(80, F.P_TO_kW * 1000, F.rpmPropTO),
    cruise75: pt(142, 0.75 * F.P_TO_kW * 1000, 2250, 3500 * FT, -8 - (15 - 0.0065 * 3500 * FT)),
    tip_mach_TO: r(Math.PI * P2.D * n / 340.3, 3) };
  out.prop.thrustCurve = [0, 20, 40, 60, 80, 100, 120, 140].map(V => (V === 0 ? { V_kt: 0, T_total_N: r(2 * T0e, 4) } : { V_kt: V, T_total_N: r(2 * pt(V, F.P_TO_kW * 1000, F.rpmPropTO).T_N, 4) }));
  return out;
}

if (isMainModule(import.meta.url)) {
  const out = compute();
  fs.mkdirSync(path.join(HERE, 'out'), { recursive: true });
  fs.writeFileSync(path.join(HERE, 'out', 'lg_calc.json'), JSON.stringify(out, null, 1));
  if (process.argv.includes('--print')) console.log(JSON.stringify(out, null, 1));
  else console.log('wrote out/lg_calc.json');
}
