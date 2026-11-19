#!/usr/bin/env node
// lt_review.mjs — independent reviewer checks for 06-da42.md (code LT). Written by the reviewer, separate from the author's
// lt_oei.mjs, so that VMCA is recomputed from the CARD values only (merged JSON via lm_lib.loadType), with its own solver.
//   node <dir>/scripts/lt_review.mjs      (run from the repo root) -> scripts/out/lt_review.json
// Checks: (1) static VMCA from card derivatives + BEM thrust (lt_geom.json) + Raymer windmill drag, at the reference CG and
// at the aft CG limit; KCAS → KIAS with the card's ias_cas table; (2) propulsion.layout position, rotation sense and the
// critical-engine argument (P-factor arm); (3) arithmetic quoted in the text (unit conversions, hot-day factor, BSFC).
// Everything here is a ค่าประมาณ (estimate) built on the card's estimated derivatives; nothing is copied from a manual.
import fs from 'node:fs';
import { loadType, val } from './lm_lib.mjs';
const KT = 0.514444, FT = 0.3048, G0 = 9.80665, RHO0 = 1.225, D2R = Math.PI / 180, R2D = 180 / Math.PI;
const r = (x, n = 4) => +(+x).toPrecision(n);
const geom = JSON.parse(fs.readFileSync(new URL('./out/lt_geom.json', import.meta.url), 'utf8'));
const out = {};

// ── (1) VMCA from the card ──
const card = loadType('da42ng');
const d = n => val(card, `aero.derivatives.${n}`).cruise;          // flaps UP set (VMCA is defined flaps/gear as for take-off; DA42 take-off flap UP)
const S = val(card, 'aero.ref.S'), b = val(card, 'aero.ref.b');
const lay = val(card, 'propulsion.layout');
const yE = Math.abs(lay[0].pos[1]);
const rud = val(card, 'controls.surfaces.rudder').travel_deg;      // {left, right}
const cnda_per_CL = d('Cnda') / (2 * 1752 * G0 / (RHO0 * S * (135 * KT) ** 2));   // Cnδa / CL at the cruise derivative point
const dq = geom.prop.drag, curve = geom.prop.ng_e4_187;
const thrust = kt => { let i = 1; while (i < curve.length - 1 && curve[i].KTAS < kt) i++; const a = curve[i - 1], c = curve[i]; return a.T_N + (kt - a.KTAS) / (c.KTAS - a.KTAS) * (c.T_N - a.T_N); };
const det3 = m => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
const cramer = (A, rhs) => { const D = det3(A); return [0, 1, 2].map(j => det3(A.map((row, i) => row.map((x, k) => (k === j ? rhs[i] : x)))) / D); };
// steady straight flight, left engine dead (windmilling), right engine max, bank φ toward the live engine; unknowns β, δa, δr
function oei(kcas, { mass = 1900, phi = 5, arm = 1, roll = true } = {}) {
  const V = kcas * KT, q = 0.5 * RHO0 * V * V, CW = mass * G0 / (q * S), T = thrust(kcas), Dd = q * dq.DoverQ_windmill_m2;
  const Cn_eng = -yE * (T + Dd) / (q * S * b);
  const Q = 123.5e3 / (2300 * 2 * Math.PI / 60);                   // live-engine reaction torque (CW prop ⇒ roll left)
  const a = 0.5 * (Math.sqrt(1 + T / (q * dq.disk_m2)) - 1), dL = 0.6 * CW * q * (1.87 * 0.93 * 1.45) * ((1 + 1.6 * a) ** 2 - 1);
  const Cl_eng = roll ? -(Q + yE * dL) / (q * S * b) : 0;
  // aft-CG sensitivity: the fin/rudder arm shrinks by Δx; Cnβ (fin part ≈ all of the positive Cnβ) and Cnδr scale with the arm
  const A = [[d('CYb'), 0, d('CYdr')], [d('Clb'), d('Clda'), d('Cldr')], [d('Cnb') * arm, cnda_per_CL * CW, d('Cndr') * arm]];
  const [be, da, dr] = cramer(A, [-CW * Math.sin(phi * D2R), -Cl_eng, -Cn_eng]);
  return { kcas, beta: be * R2D, da: da * R2D, dr: dr * R2D };
}
function vmca(opt, lim = rud.right) { let lo = 45, hi = 120; for (let i = 0; i < 60; i++) { const m = 0.5 * (lo + hi); if (-oei(m, opt).dr > lim) lo = m; else hi = m; } return hi; }
// IAS from CAS with the card table (flaps UP): inverse piecewise-linear
const tab = val(card, 'speeds.ias_cas').UP.slice().sort((p, q) => p[0] - q[0]);
const cas2ias = c => { let i = 0; while (i < tab.length - 2 && c > tab[i + 1][1]) i++; const [i0, c0] = tab[i], [i1, c1] = tab[i + 1]; return i0 + (c - c0) * (i1 - i0) / (c1 - c0); };
const lv = val(card, 'airframe.tail.l_v'), cgRef = val(card, 'airframe.cg.ref').m_DAT, armAft = (lv - (2.480 - cgRef)) / lv;
const v = {
  ref_cg_1900: vmca({}), ref_cg_1510: vmca({ mass: 1510 }), aft_cg_1510: vmca({ mass: 1510, arm: armAft }),
  ref_cg_1900_wingsLevel: vmca({ phi: 0 }), ref_cg_1900_yawOnly: vmca({ roll: false }),
};
out.vmca = Object.fromEntries(Object.entries(v).map(([k, c]) => [k, { kcas: r(c, 3), kias: r(cas2ias(c), 3) }]));
out.vmca.inputs = { yE, rudder_right_deg: rud.right, Cnda_per_CL: r(cnda_per_CL, 3), armAft: r(armAft, 4), CYb: d('CYb'), CYdr: d('CYdr'), Clb: d('Clb'), Clda: d('Clda'), Cldr: d('Cldr'), Cnb: d('Cnb'), Cndr: d('Cndr') };
out.vmca.at_1900 = oei(v.ref_cg_1900);
out.vmca.bank_sensitivity_kt_per_deg = r((v.ref_cg_1900_wingsLevel - v.ref_cg_1900) / 5, 3);
out.vmca.afm = { TCDS_KEAS: 75, AFM_KIAS: 76 };

// ── (2) propulsion.layout ──
const xDAT = cgRef - lay[0].pos[0];                                 // FRD x (fwd +) back to m DAT (aft +)
const lt = { hub_mDAT: r(xDAT, 3), left_y: lay[0].pos[1], right_y: lay[1].pos[1], z_down: lay[0].pos[2], sense: lay.map(e => e.prop_sense), side: lay.map(e => e.side) };
// prop_sense +1 = CW seen from behind: at α > 0 the descending blade is on the +y side of each disc, so each thrust centre moves
// by +Δy. Yaw moment of the live engine about the CG: N = −y·T. Left dead (right live): |N| = (yE + Δy)T; right dead: (yE − Δy)T.
const Dy = 0.075, T1 = 2400;
lt.critical = { N_left_dead: r(-(yE + Dy) * T1), N_right_dead: r((yE - Dy) * T1), critical: Math.abs(-(yE + Dy) * T1) > Math.abs((yE - Dy) * T1) ? 'left' : 'right' };
lt.checks = { left_is_negative_y: lay[0].side === 'left' && lay[0].pos[1] < 0, both_CW: lay.every(e => e.prop_sense === 1), below_cg: lay[0].pos[2] > 0 };
out.layout = lt;

// ── (3) arithmetic in the text ──
const ftm = x => r(x * FT, 4);
out.arith = {
  ft_to_m: { 1503: ftm(1503), 2405: ftm(2405), 1200: ftm(1200), 1950: ftm(1950), 1401: ftm(1401), 2267: ftm(2267), 1302: ftm(1302), 2329: ftm(2329) },
  hot_day: { sigma: r(288.15 / 308.15, 4), factor: r((288.15 / 308.15) ** -1.33, 4), roll_m: r(458 * (288.15 / 308.15) ** -1.33, 4), d50_m: r(733 * (288.15 / 308.15) ** -1.33, 4) },
  hp: { kW_to_hp_SAE: r(123.5 / 0.745700, 4), kW_to_PS: r(123.5 / 0.735499, 4), TAE_99kW_PS: r(99 / 0.735499, 4) },
  ff_92pct_lph: { rho080: r(0.92 * 123.5 * 0.227 / 0.80, 3), rho0815: r(0.92 * 123.5 * 0.227 / 0.815, 3), rho084: r(0.92 * 123.5 * 0.227 / 0.84, 3), measured_8p2gph: r(8.2 * 3.785411784, 3) },
  bsfc_from_flight_test_g_kWh: r(8.2 * 3.785411784 * 0.80 / (0.92 * 123.5) * 1000, 3),
  bsfc_VI_60pct_g_kWh: r(39.4 / 2 * 0.80 / (0.6 * 123.5) * 1000, 3),
  oei_loss_pct: r((1 - 210 / 1180) * 100, 3),
  vat_cat: { VS0_kcas: 60, Vat: 1.3 * 60 },
};
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('./out/lt_review.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
