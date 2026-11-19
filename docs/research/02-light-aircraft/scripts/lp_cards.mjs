#!/usr/bin/env node
// lp_cards.mjs — LP (07-turboprop-trainers.md): build the data cards pc9m (main), pc7mk2 (_inherits pc9m),
// t6a (main), t6c (_inherits t6a) and trainer_r2 (proposed changes to the round-1 fictional trainer) as leaf
// objects (schema-ext-r2 §1), compute every derived value with the LM tools, and write the ```json blocks.
//   node scripts/lp_cards.mjs                 → prints a summary of the derived numbers
//   node scripts/lp_cards.mjs --md <file>     → writes the JSON blocks (one block per type and category)
//   node scripts/lp_cards.mjs --calc <file>   → writes the derived numbers (lp_calc.json)
// Pure Node >= 18, no dependencies. Run from the repo root (AIRFIELDLAB_ROOT). Round-1 parameters are read from the repo
// layout first (../../01-flight-physics/params-trainer.json relative to this scripts/ folder, i.e.
// docs/research/01-flight-physics/), then R1_PARAMS / AIRFIELDLAB_R1_PARAMS, then the /home/user/r1 worktree fallback
// (completeness check 19 Nov 2026, gap 26).
import fs from 'node:fs';
import path from 'node:path';
import { HERE, isObj, isMainModule } from './lm_lib.mjs';
import { clmaxFromStall, polarFromGlide, toSimPolar, stallSpeed, rhoISA } from './lm_polar.mjs';
import { inertiaFromRadii, RADII } from './lm_inertia.mjs';
import { estimate } from './lm_derivs.mjs';

export const KT = 0.514444, FT = 0.3048, LB = 0.45359237, HP = 745.69987, G0 = 9.80665, IN = 0.0254, DEG = Math.PI / 180;
const r = (x, n = 3) => (typeof x === 'number' ? +x.toFixed(n) : x);

// ───────── round-1 parameters (adopted as class estimates where round 1 already modelled this class) ─────────
const R1_CANDS = [new URL('../../01-flight-physics/params-trainer.json', import.meta.url).pathname, process.env.R1_PARAMS, process.env.AIRFIELDLAB_R1_PARAMS,
  new URL('../../01-flight-physics/params-trainer.json', import.meta.url).pathname].filter(Boolean);
const R1F = R1_CANDS.find(f => fs.existsSync(f));
export const R1 = R1F ? JSON.parse(fs.readFileSync(R1F, 'utf8')) : null;
export const R1_FILE = R1F ?? null;
if (!R1) throw new Error('lp_cards: round-1 params-trainer.json not found (tried ' + R1_CANDS.join(', ') + ')');
export function r1leaf(p) { let o = R1; for (const k of p.split('.')) { if (!o || typeof o !== 'object') return undefined; o = o[k]; } return o && 'v' in o ? o : undefined; }

// ───────── leaf helpers ─────────
export function L(v, u, src, { conf = 'กลาง', est = false, note = '', scope = 'aircraft' } = {}) { return { v, u, scope, src, conf, est, note }; }
const E = (v, u, src, note, o = {}) => L(v, u, src, { conf: 'ต่ำ', est: true, note: 'ค่าประมาณ: ' + note, ...o });
export function setp(obj, p, leaf) { const ks = p.split('.'); let o = obj; for (const k of ks.slice(0, -1)) o = o[k] ??= {}; o[ks.at(-1)] = leaf; }
/** adopt a round-1 class value as an estimate for this type (src R1:<codes>) */
function adopt(card, p, why = '', o = {}) {
  const l = r1leaf(p); if (!l) throw new Error('no R1 leaf ' + p);
  setp(card, p, { v: o.v ?? l.v, u: o.u ?? l.u, scope: o.scope ?? l.scope, src: [...(l.src || []).map(s => 'R1:' + s), ...(o.src || [])], conf: o.conf ?? 'ต่ำ', est: true,
    note: `ค่าประมาณ: รับค่าคลาสจากเครื่องฝึกรอบที่ 1 (${p}) ${why}`.trim() });
}

// ───────── public facts (every number cites an LP source; see 07-turboprop-trainers.md §07.14) ─────────
export const PUB = {
  pc9m: { // FOCA TCDS F 56-32 Issue 4 [LP2]; PC-9 TCDS F 56-22 [LP3]; Pilatus plan [LP10]; Jane's via Wikipedia [LP13]; brochure text [LP12]
    MTOW: 2350, MLW: 2350, MRW: 2360, MZFW: 2000, BEW: 1725, fuel_L: 518, fuel_rho: 0.806, MAC: 1.65, LEMAC: 3.8725,
    S: 16.29, b: 10.19, L: 10.14, H: 3.26, wheelbase: 2.31, track: 2.54, fusW: 0.97, b_h: 3.66,
    seats: [4.061, 5.486], P_kW: 708, P_shp: 950, Np: 2000, NpT: 2205, Q_ftlb: 2495, ITT: 800, propD: 2.438, minPitch30: 14, feather30: 86,
    VS1: 77, VS0: 69, VA: 205, VMO: 320, VFE: 150, ROC: 4090, cg: [[2250, 22, 30], [2350, 25, 30]],
    travel: { elevator: { up: 18.5, down: 16 }, aileron: { up: 20, down: 11 }, rudder: { left: 24, right: 24 }, flap: { TO: 23, LDG: 50 }, elevator_tab: { up: 15, down: 20 }, rudder_tab: { right: 3.5, left: 11.5 }, aileron_tab_fixed: 5, airbrake: 70 },
  },
  pc7mk2: { // FOCA TCDS F 56-25 Issue 10 [LP1]; Pilatus fact sheet [LP9]
    MTOW: 2250, MLW: 2250, MRW: 2260, MZFW: 1900, BEW: 1670, P_kW: 522, P_shp: 700, Np: 2040, ITT: 790, propD: 2.438, minPitch30: 16, feather30: 86,
    VS1: 75, VS0: 67, VA: 210, VMO: 300, VFE: 150, ROC: 2840, TO50: 415, LD50: 674, S: 16.283,
  },
  t6a: { // EASA TCDS IM.A.636 [LP5]; Textron [LP7][LP8]; USAF/Navy public training material [LP15–LP23]
    MTOW: 6500 * LB, MRW: 6550 * LB, MZFW: 5500 * LB, BEW: 4707 * LB, fuel_usable_lb: 1100, S: 16.28, b: 10.19, L: 10.16, H: 3.25, wheelbase: 2.31, track: 2.54, fusW: 0.96,
    P_shp: 1100, Np: 2000, NpT: 2200, ITT: 820, propD: 2.4638,
    VMO: 316, VA: 227, VFE: 150, VLE: 150, VY: 140, VR: 85, VG: 125, glide_sink: [1100, 1350], ROC_avg: 3100, ROC_init: 4500, TOD_ft: 1775, VAPP: 100,
    // AOPA Pilot spec table, Aug 1997 [LP29]: manufacturer's calculations, SL ISA, gross weight 6,300 lb, KIAS
    aopa: { m_lb: 6300, VS1: 82, VS0: 74, ROC: 4000, VY: 140, VR: 85, TO_gr_ft: 1400, TO50_ft: 2000, LD_gr_ft: 1900, LD50_ft: 2400, xwind: 24, Vmax_SL_kt: 310, ceiling_ft: 35000, BEW_lb: 4600 },
    cgFS_in: { fwd: [[5850, 164.67], [6900, 165.45], [6950, 165.45]], aft: [[6950, 169.35], [5850, 169.35]], zeroFuel: { fwd: 164.80, aft: 169.22, upTo_lb: 5850 } }, firewallFS_in: 118.1,
    travel: { elevator: { up: 18, down: 16 }, aileron: { up: 20, down: 11 }, rudder: { left: 24, right: 24 }, flap: { TO: 23, LDG: 50 }, elevator_tab: { up: 5.5, down: 22 }, rudder_tab: { right: 6, left: 11 }, speedbrake: 67.5 },
  },
  t6c: { MTOW: 6900 * LB, MLW: 6900 * LB, MRW: 6950 * LB, MZFW: 5850 * LB, BEW: 5150 * LB, MTOW_stores: 8300 * LB },
};

// ───────── derived numbers ─────────
export function derive() {
  const d = {};
  // wing taper from S, b and MAC (trapezoid): MAC/mean = (4/3)(1+λ+λ²)/(1+λ)²
  const taperFrom = (S, b, mac) => { const ratio = mac / (S / b); let lo = 0.2, hi = 1; for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2, f = (4 / 3) * (1 + m + m * m) / (1 + m) ** 2; if (f > ratio) lo = m; else hi = m; } return (lo + hi) / 2; };
  for (const id of ['pc9m', 't6a']) {
    const p = { ...PUB.pc9m, ...(id === 't6a' ? PUB.t6a : {}) };
    const S = p.S, b = p.b, mac = PUB.pc9m.MAC;
    const lam = taperFrom(S, b, mac), cr = 2 * S / (b * (1 + lam));
    const yMAC = (b / 6) * (1 + 2 * lam) / (1 + lam);
    d[id] = { S, b, AR: b * b / S, taper: lam, c_root: cr, c_tip: lam * cr, yMAC };
  }
  // CG reference (m DAT): pc9m 25 % MAC; t6a 23 % MAC (mid of the PM-series envelope, LEMAC assumed = PC-9)
  const P9 = PUB.pc9m;
  const dat = pct => P9.LEMAC + pct / 100 * P9.MAC;
  d.pc9m.cgref = { pct: 25, x: dat(25) };
  d.t6a.cgref = { pct: 23, x: dat(23) };
  d.pc9m.cg_env = P9.cg.map(([m, f, a]) => [m, r(dat(f), 4), r(dat(a), 4)]);
  const T = PUB.t6a, fs2m = x => x * IN;              // datum = FS 0 = 118.1 in (3.000 m) forward of the firewall
  d.t6a.cg_env = [[r(5850 * LB, 1), r(fs2m(164.67), 4), r(fs2m(169.35), 4)], [r(6900 * LB, 1), r(fs2m(165.45), 4), r(fs2m(169.35), 4)], [r(6950 * LB, 1), r(fs2m(165.45), 4), r(fs2m(169.35), 4)]];
  d.t6a.cg_env_pct = d.t6a.cg_env.map(([m, f, a]) => [m, r((f - P9.LEMAC) / P9.MAC * 100, 1), r((a - P9.LEMAC) / P9.MAC * 100, 1)]);
  d.t6a.datum_check_m = r(T.firewallFS_in * IN, 4);
  // fuel
  d.pc9m.fuel_kg = r(P9.fuel_L * P9.fuel_rho, 1);
  d.t6a.fuel_kg = r(T.fuel_usable_lb * LB, 1);
  // training mass (D3 object): BEW + 2 crew × 95 kg (incl. parachute/flight equipment, est) + 50 % usable fuel
  const tmObj = (bew, fuelKg, fuelL) => { const o = { kg: 0, empty_kg: r(bew, 1), crew_kg: 190, fuel_kg: r(0.5 * fuelKg, 1), fuel_l: r(0.5 * fuelL, 0) }; o.kg = r(o.empty_kg + o.crew_kg + o.fuel_kg, 1); return o; };
  d.pc9m.tm = tmObj(P9.BEW, d.pc9m.fuel_kg, P9.fuel_L);
  d.pc7mk2 = { tm: tmObj(PUB.pc7mk2.BEW, d.pc9m.fuel_kg, P9.fuel_L) };
  d.t6a.tm = tmObj(T.BEW, d.t6a.fuel_kg, d.t6a.fuel_kg / 0.80);          // Jet A 0.80 kg/L (est)
  d.t6c = { tm: tmObj(PUB.t6c.BEW, d.t6a.fuel_kg, d.t6a.fuel_kg / 0.80) };
  for (const k of ['pc9m', 'pc7mk2', 't6a', 't6c']) d[k].training_mass = d[k].tm.kg;
  // inertia: Roskam radii, class trainer_turboprop (lm_inertia, 01-methods §01.4) at MTOW
  const rad = RADII.trainer_turboprop;
  d.radii = rad;
  d.pc9m.I = inertiaFromRadii({ m: P9.MTOW, b: P9.b, L: P9.L, ...rad });
  d.t6a.I = inertiaFromRadii({ m: T.MTOW, b: T.b, L: T.L, ...rad });
  // component build-up cross-check (pc9m at MTOW, full fuel) — every mass/position is an estimate (see §07.2)
  const comp = [ // [kg, x DAT m, y_rms m (spanwise), z m, own Iyy kg m2]
    ['engine+prop+mount', 335, 1.6, 0.25, 0, 30], ['crew', 200, 4.77, 0, -0.1, 0], ['fuel', d.pc9m.fuel_kg, 4.19, Math.sqrt((3.6 ** 3 - 0.6 ** 3) / (3 * 3.0)), 0.25, 0],
    ['wing', 290, 4.30, 0.39 * P9.b / 2, 0.25, 50], ['tail', 70, 9.2, 0.9, -0.6, 0]];
  const mRest = P9.MTOW - comp.reduce((s, c) => s + c[1], 0);
  const xRest = (P9.MTOW * d.pc9m.cgref.x - comp.reduce((s, c) => s + c[1] * c[2], 0)) / mRest;
  comp.push(['fuselage+systems+seats', mRest, xRest, 0.35, 0, 0.6 * mRest * 9 ** 2 / 12]);
  let Ixx = 0, Iyy = 0, Izz = 0; const xc = d.pc9m.cgref.x;
  for (const [, m, x, y, z, own] of comp) { const dx = x - xc; Ixx += m * (y * y + z * z); Iyy += m * (dx * dx + z * z) + own; Izz += m * (dx * dx + y * y) + own; }
  d.pc9m.I_buildup = { Ixx: Math.round(Ixx), Iyy: Math.round(Iyy), Izz: Math.round(Izz), comp: comp.map(c => [c[0], r(c[1], 0), r(c[2], 2), r(c[3], 2)]) };
  // round-1 trainer radii for comparison (L = 10.14 m assumed, the PC-9 length)
  d.r1_radii = { Rx: r(2 / 10.2 * Math.sqrt(2600 / 2250), 3), Ry: r(2 / 10.14 * Math.sqrt(7300 / 2250), 3), Rz: r(2 / ((10.2 + 10.14) / 2) * Math.sqrt(9200 / 2250), 3) };
  // stall CL (01-methods §01.5: POH Vs = minimum speed, nz 0.95)
  const cl = (mass, S, v) => clmaxFromStall({ mass, S, vs_kcas: v, kind: 'min' });
  d.stallCL = {
    pc9m_UP: cl(2350, P9.S, 77), pc9m_LDG: cl(2350, P9.S, 69), pc9m_util_UP: cl(3200, P9.S, 93), pc9m_util_LDG: cl(3200, P9.S, 85),
    pc9_UP: cl(2250, P9.S, 79), pc9_LDG: cl(2250, P9.S, 70), pc7mk2_UP: cl(2250, 16.283, 75), pc7mk2_LDG: cl(2250, 16.283, 67),
    t6a_UP: cl(PUB.t6a.aopa.m_lb * LB, PUB.t6a.S, PUB.t6a.aopa.VS1), t6a_LDG: cl(PUB.t6a.aopa.m_lb * LB, PUB.t6a.S, PUB.t6a.aopa.VS0),
  };
  for (const k of Object.keys(d.stallCL)) d.stallCL[k] = { CLapp: r(d.stallCL[k].CLapparent, 4), CLmax_1g: r(d.stallCL[k].CLmax_1g, 4), V1g: r(d.stallCL[k].V1g_kcas, 2) };
  // T-6A / T-6C stall speeds: AOPA spec table [LP29] 82 / 74 KIAS at 6,300 lb (manufacturer's calc, 1997), KIAS taken
  // = KCAS (speeds.ias_cas identity, est; no public PEC table). Other masses scaled with √W (est). Completeness check 19 Nov
  // 2026: replaces the earlier estimate from the PC-9 M CL (86.3 / 77.3 KCAS at 6,500 lb, 3.6 % / 2.8 % higher).
  const A = T.aopa, mA = A.m_lb * LB;
  const vsScale = (v, m1, S1, m2, S2) => v * Math.sqrt((m2 / S2) / (m1 / S1));
  d.t6a.VS1_pub = A.VS1; d.t6a.VS0_pub = A.VS0; d.t6a.m_pub = r(mA, 1);
  d.t6a.VS1 = r(vsScale(A.VS1, mA, T.S, T.MTOW, T.S), 1); d.t6a.VS0 = r(vsScale(A.VS0, mA, T.S, T.MTOW, T.S), 1);
  d.t6c.VS1 = r(vsScale(A.VS1, mA, T.S, PUB.t6c.MTOW, T.S), 1); d.t6c.VS0 = r(vsScale(A.VS0, mA, T.S, PUB.t6c.MTOW, T.S), 1);
  d.t6a.VS0_6000 = r(vsScale(A.VS0, mA, T.S, 6000 * LB, T.S), 1);
  d.t6a.pc9mCL_check = { VS1_6300: r(vsScale(77, 2350, 16.29, mA, T.S), 1), VS0_6300: r(vsScale(69, 2350, 16.29, mA, T.S), 1), note: 'PC-9 M CL at 6,300 lb (old estimate) vs AOPA 82/74 KIAS' };
  d.t6a.onspeed = { MTOW: r(1.3 * d.t6a.VS0, 1), at6000: r(1.3 * d.t6a.VS0_6000, 1), note: 'on-speed AOA = 1.3 Vs [LP21]' };
  // T-6 glide (est): 125 KIAS clean, sink 1100–1350 fpm [LP16][LP19][LP20]; IAS ≈ EAS; altitude 3,000–9,000 ft
  const sig = h => rhoISA(h * FT) / 1.225;
  const LDof = (h, sink) => 125 / Math.sqrt(sig(h)) * KT * 60 / FT / sink;
  d.t6a.glideLD = { central: r(LDof(6000, 1225), 2), low: r(LDof(3000, 1350), 2), high: r(LDof(9000, 1100), 2), note: 'L/D = V_TAS/sink, h 6,000 ft & 1,225 fpm (central); 3,000 ft & 1,350; 9,000 ft & 1,100' };
  d.t6a.glideV_MTOW = r(125 * Math.sqrt(6500 / 6000), 1);      // 125 KIAS assumed at ≈ 6,000 lb
  d.t6a.polar = polarFromGlide({ mass: T.MTOW, S: T.S, v_kcas: d.t6a.glideV_MTOW, E: d.t6a.glideLD.central, AR: d.t6a.AR });
  d.t6a.simPolar = toSimPolar(d.t6a.polar);
  // pc9m: same polar coefficients (class estimate) → best glide speed at 2350 kg
  d.pc9m.polar = { CD0: d.t6a.polar.CD0, K: d.t6a.polar.K };
  const CLs = Math.sqrt(d.pc9m.polar.CD0 / d.pc9m.polar.K);
  d.pc9m.glideV = r(Math.sqrt(2 * 2350 * G0 / (1.225 * P9.S * CLs)) / KT, 1);
  d.pc7mk2.glideV = r(Math.sqrt(2 * 2250 * G0 / (1.225 * 16.283 * CLs)) / KT, 1);
  // cruise check of the clean (no-prop) polar: PC-9M 276 KTAS @ 2,000 ft, η 0.85, 708 kW, mass 2,100 kg (est)
  const cruiseCD = (ktas, hft, PkW, eta, m, S) => { const rho = rhoISA(hft * FT), V = ktas * KT, q = 0.5 * rho * V * V; const CL = m * G0 / (q * S), CD = eta * PkW * 1e3 / V / (q * S); return { CL: r(CL, 4), CD: r(CD, 5) }; };
  d.cruise = {
    pc9m_276_2000ft: cruiseCD(276, 2000, 708, 0.85, 2100, P9.S), pc7mk2_242_SL: cruiseCD(242, 0, 522, 0.85, 2100, 16.283),
    t6a_270_1000ft: cruiseCD(270, 1000, 820.3, 0.85, 6000 * LB, T.S),
  };
  for (const k of Object.keys(d.cruise)) { const c = d.cruise[k]; c.CD0_clean = r(c.CD - d.t6a.polar.K * c.CL * c.CL, 5); }
  // propeller: blade angle at 0.75 R from the TCDS 30-in station (helical pitch: tan β ∝ 1/r)
  const R_in = 48; const b75 = b30 => Math.atan(Math.tan(b30 * DEG) * 30 / (0.75 * R_in)) / DEG;
  d.prop = { beta75_minPitch_pc9m: r(b75(14), 2), beta75_minPitch_pc7mk2: r(b75(16), 2), beta75_feather: r(b75(86), 2) };
  // torque limits
  const omega = rpm => rpm * 2 * Math.PI / 60;
  d.Q = { pc9m_TCDS_Nm: r(2495 * 1.355818, 0), pc9m_fromP_Nm: r(708e3 / omega(2000), 0), t6a_fromP_Nm: r(1100 * HP / omega(2000), 0), pc7mk2_fromP_Nm: r(522e3 / omega(2040), 0) };
  // momentum-theory static thrust (FM 0.55 as lm_card; ideal FM 1)
  const T0 = (P, D, FM) => Math.pow(FM * P * Math.sqrt(2 * 1.225 * Math.PI * D * D / 4), 2 / 3);
  d.T0 = { pc9m_FM055: r(T0(708e3, 2.438, 0.55), 0), pc9m_ideal: r(T0(708e3, 2.438, 1), 0), pc7mk2_FM055: r(T0(522e3, 2.438, 0.55), 0), t6a_FM055: r(T0(1100 * HP, 2.4638, 0.55), 0), t6a_ideal: r(T0(1100 * HP, 2.4638, 1), 0), r1_check_FM: r(Math.pow(11500, 1.5) / (700e3 * Math.sqrt(2 * 1.225 * Math.PI * 2.44 ** 2 / 4)), 3) };
  // spin (T-6A, public training material [LP19][LP20]): 2–3 s/turn, 400–500 ft/turn, 120–135 KIAS at entry altitude ~15,000 ft
  const sig15 = sig(15000);
  d.spin = { turn_rate_dps: [r(360 / 3, 0), r(360 / 2, 0)], descent_fpm: [r(400 / 3 * 60, 0), r(500 / 2 * 60, 0)],
    omega_hat: [r((2 * Math.PI / 3) * PUB.t6a.b / (2 * 135 / Math.sqrt(sig15) * KT), 3), r((2 * Math.PI / 2) * PUB.t6a.b / (2 * 120 / Math.sqrt(sig15) * KT), 3)] };
  // ICAO approach category from 1.3 VS0 at max landing mass (ICAO Doc 8168: A < 91, B 91–120 kt)
  d.icao = { pc9m: r(1.3 * 69, 1), pc7mk2: r(1.3 * 67, 1), t6a: r(1.3 * d.t6a.VS0, 1), t6c: r(1.3 * d.t6c.VS0, 1) };
  // D1 (19 Nov 2026): VREF = 1.3 VS0 and VAPP at the card's training_mass (V ∝ √m from the VS0 of the source mass)
  //   pc9m 69 KCAS @2,350 kg [LP2]; pc7mk2 67 KCAS @2,250 kg [LP9]; t6a/t6c 74 KIAS @6,300 lb [LP29].
  //   VAPP: Pilatus VREF + 5 kt (est); T-6A published final 100 KIAS flap LDG [LP20][LP29]; T-6C = 100 × √(m_t6c/m_t6a) (est).
  const vs0At = (vs0, m0, m) => vs0 * Math.sqrt(m / m0);
  const ap = (vs0, m0, m) => { const v = vs0At(vs0, m0, m); return { VS0_tm: r(v, 2), VREF_exact: r(1.3 * v, 2), VREF: Math.round(1.3 * v) }; };
  d.vref = { pc9m: ap(69, 2350, d.pc9m.training_mass), pc7mk2: ap(67, 2250, d.pc7mk2.training_mass), t6a: ap(PUB.t6a.aopa.VS0, mA, d.t6a.training_mass), t6c: ap(PUB.t6a.aopa.VS0, mA, d.t6c.training_mass) };
  d.vref.pc9m.VAPP = d.vref.pc9m.VREF + 5; d.vref.pc7mk2.VAPP = d.vref.pc7mk2.VREF + 5; d.vref.t6a.VAPP = 100;
  d.vref.t6c.VAPP_exact = r(100 * Math.sqrt(d.t6c.training_mass / d.t6a.training_mass), 2); d.vref.t6c.VAPP = Math.round(d.vref.t6c.VAPP_exact);
  // the same speeds at MTOW (test condition of lp_check, which runs at MTOW for the TCDS comparisons)
  for (const [k, m] of [['pc9m', 2350], ['pc7mk2', 2250], ['t6a', T.MTOW], ['t6c', PUB.t6c.MTOW]]) d.vref[k].VAPP_at_MTOW = r(d.vref[k].VAPP * Math.sqrt(m / d[k].training_mass), 1);
  // loadings
  d.loading = {};
  for (const [k, m, S, P] of [['r1_trainer', 2250, 16.3, 700], ['pc7mk2', 2250, 16.283, 522], ['pc9m', 2350, 16.29, 708], ['t6a', T.MTOW, T.S, 1100 * HP / 1e3], ['t6c', PUB.t6c.MTOW, T.S, 1100 * HP / 1e3]])
    d.loading[k] = { m: r(m, 1), WS_kg_m2: r(m / S, 1), WS_lb_ft2: r(m / LB / (S / FT / FT), 2), PL_kg_kW: r(m / P, 3), PL_lb_shp: r(m / LB / (P * 1e3 / HP), 2) };
  // FAR 23.473(d) limit descent velocity V = 4.4 (W/S)^0.25 fps, 7..10 fps
  d.drop = Object.fromEntries(Object.entries(d.loading).map(([k, o]) => [k, r(Math.min(10, Math.max(7, 4.4 * o.WS_lb_ft2 ** 0.25)), 2)]));
  return d;
}

// ───────── geometry estimates for lm_derivs (all est; see §07.6) ─────────
export function geoFor(id, d) {
  const p = id.startsWith('t6') ? PUB.t6a : PUB.pc9m, dd = id.startsWith('t6') ? d.t6a : d.pc9m;
  return {
    S: p.S, b: p.b, c: PUB.pc9m.MAC, taper: dd.taper, sweep_c4_deg: 0, dihedral_deg: 6, wingPos: 'low', z_w: null,
    fus: { L: p.L, W: p.fusW, H: 1.5, x_c4_root: dd.cgref.x - (dd.cgref.pct - 25) / 100 * PUB.pc9m.MAC },
    tail: { S_h: 3.0, b_h: PUB.pc9m.b_h, l_h: 4.9, S_v: 2.0, b_v: 1.7, l_v: 4.7, z_v: 0.8, h_h: null },
    surf: { elevator: { chord_ratio: 0.40, span_fraction: 1 }, aileron: { chord_ratio: 0.25, eta_in: 0.55, eta_out: 0.97 }, rudder: { chord_ratio: 0.40, span_fraction: 1 } },
    cg_frac: dd.cgref.pct / 100,
  };
}
export function derivs(id, d, m, Vcr, Vapp) {
  const geo = geoFor(id, d), S = geo.S, out = {};
  for (const [k, Vkt] of [['cruise', Vcr], ['approach', Vapp]]) {
    const V = Vkt * KT, CL = 2 * m * G0 / (1.225 * S * V * V);
    out[k] = { V_kt: Vkt, CL: r(CL, 4), ...estimate(geo, { CL, M: V / 340, alpha: (CL - 0.25) / 5 }) };
  }
  return { geo, out };
}

if (isMainModule(import.meta.url)) {
  const args = process.argv.slice(2), opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
  const d = derive();
  d.derivs = { pc9m: derivs('pc9m', d, 2350, 200, 95), t6a: derivs('t6a', d, PUB.t6a.MTOW, 200, 105) };
  const out = opt('--calc');
  if (out) fs.writeFileSync(out, JSON.stringify(d, (k, v) => (typeof v === 'number' ? +v.toPrecision(6) : v), 1));
  else console.log(JSON.stringify(d, (k, v) => (typeof v === 'number' ? +v.toPrecision(5) : v), 1).slice(0, 12000));
}
