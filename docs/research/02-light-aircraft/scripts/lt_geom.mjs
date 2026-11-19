#!/usr/bin/env node
// lt_geom.mjs — DA42 (06-da42.md, code LT): geometry, CG in %MAC, inertia by component build-up, propeller (BEM) thrust,
// IAS→CAS pairs derived from TCDS (KEAS) vs AFM (KIAS), CLmax per flap from stall speeds.  Run from the repo root:
//   node <dir>/scripts/lt_geom.mjs            -> prints a summary and writes scripts/out/lt_geom.json
// Every number tagged "est" below is a ค่าประมาณ (estimate) documented in 06-da42.md §06.2/§06.5/§06.6.
// Published inputs: EASA TCDS A.005 [LT1], DA 42 NG AFM 7.01.15 Rev 1 ch.1–2 [LT2], DA 42 AFM 7.01.05 [LT3][LT5].
import fs from 'node:fs';
import { RADII, radiiOf } from './lm_inertia.mjs';
import { PROPS, betaForPower, bem, figureOfMerit } from './lm_prop.mjs';
import { clmaxFromStall } from './lm_polar.mjs';
const KT = 0.514444, G0 = 9.80665, DEG = Math.PI / 180, RHO0 = 1.225;
const r = (x, n = 4) => +(+x).toPrecision(n);
const out = {};

// ── 1. wing: equivalent straight-tapered planform with S, b, MAC of the AFM [LT2 p.1-5] ──
const S = 16.29, b = 13.42, MAC = 1.271, AR = b * b / S;
const macRatio = lam => (4 / 3) * (1 + lam + lam * lam) / (1 + lam) ** 2;   // MAC / (S/b)
let lo = 0.1, hi = 1; for (let k = 0; k < 60; k++) { const m = 0.5 * (lo + hi); if (macRatio(m) > MAC / (S / b)) lo = m; else hi = m; }
const lam = 0.5 * (lo + hi), cr = 2 * S / b / (1 + lam), ct = lam * cr, yMAC = b / 6 * (1 + 2 * lam) / (1 + lam);
const LEsweep = 1;                                   // deg [LT2 p.1-5]
const DATUM_LE_ROOT = 2.196;                         // m: datum is 2.196 m forward of the stub-wing root-rib leading edge [LT1][LT2 p.2-18]
const LEMAC = DATUM_LE_ROOT + yMAC * Math.tan(LEsweep * DEG);   // est: LE line from the centreline (trapezoid model)
const sweepC4 = Math.atan(Math.tan(LEsweep * DEG) - (1 - lam) / (AR * (1 + lam))) / DEG;
const pct = x => (x - LEMAC) / MAC * 100;
out.wing = { S, b, MAC, AR: r(AR), taper: r(lam, 3), c_root: r(cr), c_tip: r(ct), y_MAC: r(yMAC), LEMAC_mDAT: r(LEMAC), x_c4MAC_mDAT: r(LEMAC + 0.25 * MAC), sweep_c4_deg: r(sweepC4, 2) };

// ── 2. CG envelope (DA 42 NG, AFM p.2-18 / TCDS C.III.14) and %MAC ──
const ng = { fwd: [[1510, 2.357], [1900, 2.418], [1999, 2.434]], aft: [[1510, 2.460], [1700, 2.480], [1999, 2.480]] };
const tdi = { fwd: [[1250, 2.35], [1468, 2.35], [1785, 2.40]], aft: [[1250, 2.42], [1600, 2.49], [1785, 2.49]] };
const lin = (t, m) => { if (m <= t[0][0]) return t[0][1]; for (let i = 1; i < t.length; i++) if (m <= t[i][0]) return t[i - 1][1] + (m - t[i - 1][0]) / (t[i][0] - t[i - 1][0]) * (t[i][1] - t[i - 1][1]); return t.at(-1)[1]; };
out.cg = {
  ng: [1510, 1700, 1750, 1900].map(m => ({ m, fwd: r(lin(ng.fwd, m)), aft: r(lin(ng.aft, m)), fwd_pct: r(pct(lin(ng.fwd, m)), 3), aft_pct: r(pct(lin(ng.aft, m)), 3) })),
  tdi: [1250, 1468, 1600, 1785].map(m => ({ m, fwd: r(lin(tdi.fwd, m)), aft: r(lin(tdi.aft, m)), fwd_pct: r(pct(lin(tdi.fwd, m)), 3), aft_pct: r(pct(lin(tdi.aft, m)), 3) })),
};

// ── 3. tail and fuselage (est from TCDS length 8.56 m / height 2.49 m and AFM areas; positions are ค่าประมาณ) ──
const xNose = -0.10;                                  // est: nose tip relative to datum
const tail = { S_h: 2.35, AR_h: 4.6, S_v: 2.43, b_v: 1.45, x_c4h: 7.65, x_c4v: 7.25, z_v: 0.80, h_h: 1.75 };
tail.b_h = Math.sqrt(tail.S_h * tail.AR_h);
tail.l_h = tail.x_c4h - (LEMAC + 0.25 * MAC); tail.l_v = tail.x_c4v - (LEMAC + 0.25 * MAC);
tail.VH = tail.S_h * tail.l_h / (S * MAC); tail.VV = tail.S_v * tail.l_v / (S * b);
out.tail = Object.fromEntries(Object.entries(tail).map(([k, v]) => [k, r(v)]));
out.fus = { x_nose_mDAT: xNose, L: 8.56, W: 1.20, H: 1.30, x_c4_root_from_nose: r(DATUM_LE_ROOT + 0.25 * cr - xNose) };
out.surfaces = {
  elevator: { area_m2: 0.66, area_ratio: r(0.66 / 2.35, 3) }, rudder: { area_m2: 0.78, area_ratio: r(0.78 / 2.43, 3) },
  aileron: { area_m2: 0.66, span_fraction: [0.75, 0.97], chord_ratio: 0.25 }, flap: { area_m2: 2.18 },
};
// aileron: 0.33 m2 per side at chord ratio 0.25 → span per side
{ const yi = 0.75 * b / 2, yo = 0.97 * b / 2, c = y => cr * (1 - (1 - lam) * y / (b / 2)); const A = 0.25 * (c(yi) + c(yo)) / 2 * (yo - yi); out.surfaces.aileron.area_check_m2 = r(2 * A, 3); }

// ── 4. inertia by component build-up (Roskam Part V ch.10 method; masses and positions are ค่าประมาณ) ──
// item: [name, mass kg, x m DAT, y m (±: both sides, mass per side), z m (down, from wing chord plane), kind, extra]
// kinds: 'pt' point mass; 'rodY' uniform along y from y0 to y1 (per side); 'rodX' uniform along x from x0 to x1
const EMPTY_CG = 2.42;   // est: empty-mass CG (m DAT) assumed inside the AFM envelope; real value is in each aircraft's mass & balance report
function buildItems({ empty = 1450, crew = 170, fuelL = 180 } = {}) {
  const items = [
    ['engine+gearbox+prop+mount+cowl (each)', 245, 1.55, 1.70, 0.05, 'pt'],          // E4 dry 185 kg [LT12] + MTV-6 ~17.5 kg [LT14] + mount/cowl/coolant/oil (est; lumped 245 kg unchanged by the reviewer)
    ['main gear leg (each, extended)', 32, 2.62, 1.475, 0.60, 'pt'],                // track 2.95 m [LT2]
    ['nose gear', 20, 0.75, 0, 0.75, 'pt'],
    ['wing structure incl. flaps/ailerons (each side)', 112, 2.75, [0.60, b / 2], 0.0, 'rodY'],
    ['forward fuselage + cabin structure', 170, [xNose + 0.1, 4.2], 0, -0.15, 'rodX'],
    ['tail cone', 55, [4.2, 8.2], 0, -0.35, 'rodX'],
    ['empennage (T-tail)', 55, 7.55, 0, -1.25, 'pt'],
    ['avionics, interior, systems, nose bay', 0, 1.80, 0, -0.25, 'pt'],              // balance mass so that empty = target
  ];
  const per = it => (it[5] === 'rodY' || (it[5] === 'pt' && it[3] !== 0) ? 2 : 1);
  const xc = it => (Array.isArray(it[2]) ? 0.5 * (it[2][0] + it[2][1]) : it[2]);
  const fixed = items.slice(0, -1).reduce((s, it) => s + per(it) * it[1], 0), mom = items.slice(0, -1).reduce((s, it) => s + per(it) * it[1] * xc(it), 0);
  items.at(-1)[1] = empty - fixed;
  items.at(-1)[2] = (EMPTY_CG * empty - mom) / items.at(-1)[1];   // remainder placed so that the empty CG = EMPTY_CG (est)
  const payload = [
    ['crew (front seats)', crew, 2.30, 0, -0.35, 'pt'],                              // front seat arm est (DA40 2.30 m class)
    ['fuel main tanks (each side, Jet A-1 0.80 kg/l)', fuelL * 0.80 / 2, 2.63, 2.60, 0.0, 'pt'],
  ];
  return [...items, ...payload];
}
function inertia(items) {
  const pts = [];   // expand to points (rods discretised)
  for (const [name, m, x, y, z, kind] of items) {
    if (!(m > 0)) continue;
    const sides = (kind === 'rodY' || (kind === 'pt' && y !== 0)) ? [1, -1] : [0];
    for (const s of sides) {
      if (kind === 'rodY') { const N = 20; for (let i = 0; i < N; i++) { const yy = y[0] + (y[1] - y[0]) * (i + 0.5) / N; pts.push([m / N, x, s * yy, z]); } }
      else if (kind === 'rodX') { const N = 20; for (let i = 0; i < N; i++) { const xx = x[0] + (x[1] - x[0]) * (i + 0.5) / N; pts.push([m / N, xx, 0, z]); } }
      else pts.push([m, x, s * y, z]);
    }
  }
  const M = pts.reduce((s, p) => s + p[0], 0), cx = pts.reduce((s, p) => s + p[0] * p[1], 0) / M, cz = pts.reduce((s, p) => s + p[0] * p[3], 0) / M;
  let Ixx = 0, Iyy = 0, Izz = 0, Ixz = 0;
  for (const [m, x, y, z] of pts) { const dx = cx - x, dz = z - cz; Ixx += m * (y * y + dz * dz); Iyy += m * (dx * dx + dz * dz); Izz += m * (dx * dx + y * y); Ixz += m * dx * dz; }
  // distributed-component self inertia not captured by points: wing chordwise & fuselage cross-section (small, add 3 % to Iyy/Izz est)
  return { m: M, x_cg: cx, z_cg: cz, Ixx, Iyy: Iyy * 1.03, Izz: Izz * 1.03, Ixz };
}
const L = 8.56;
const cases = { training: { empty: 1450, crew: 170, fuelL: 165 }, mtow_ng: { empty: 1450, crew: 255, fuelL: 245 }, empty: { empty: 1450, crew: 0, fuelL: 0 }, tdi_mtow: { empty: 1280, crew: 255, fuelL: 315 } };
out.inertia = {};
for (const [k, c] of Object.entries(cases)) {
  const I = inertia(buildItems(c)), R = radiiOf({ m: I.m, Ixx: I.Ixx, Iyy: I.Iyy, Izz: I.Izz, b, L });
  out.inertia[k] = { ...Object.fromEntries(Object.entries(I).map(([q, v]) => [q, r(v)])), cg_pct: r(pct(I.x_cg), 3), radii: { Rx: r(R.Rx, 3), Ry: r(R.Ry, 3), Rz: r(R.Rz, 3) } };
}
// Compare: class radii (lm_inertia §01.4) at the training mass
const mT = out.inertia.training.m;
const fromR = R => ({ Ixx: r(mT * (b * R.Rx / 2) ** 2), Iyy: r(mT * (L * R.Ry / 2) ** 2), Izz: r(mT * ((b + L) / 2 * R.Rz / 2) ** 2) });
out.inertia.compare_class = { single_prop: fromR(RADII.single_prop), twin_prop_C310: fromR(RADII.twin_prop) };
out.inertia.items_training = buildItems(cases.training).map(([n, m, x, y, z, k]) => ({ n, m: r(m), x, y, z, k }));

// ── 5. propellers: MT 3-blade 1.87 m (NG std, TDI) and 1.90 m (DA42-VI), BEM of lm_prop (geometry ค่าประมาณ) ──
const prop = D => ({ ...PROPS.cs3_190, D, note: `MT MTV-6 class 3-blade constant speed D ${D} m (geometry est)` });
function thrustCurve(P, P_W, rpm, Vs = [0, 15, 25, 35, 40, 45, 50, 60, 70, 80, 90]) {
  const n = rpm / 60;
  return Vs.map(V => { const J = V / (n * P.D), s = betaForPower(P, J, { P_W, rpm }); return { V_ms: V, KTAS: r(V / KT, 3), J: r(J, 3), beta75: r(s.beta75_deg, 3), T_N: Math.round(s.CT * RHO0 * n * n * P.D ** 4), eta: r(s.eta, 3) }; });
}
const P187 = prop(1.87), P190 = prop(1.90);
out.prop = {
  ng_e4_187: thrustCurve(P187, 123.5e3, 2300), tdi_99kW_187: thrustCurve(P187, 99e3, 2300), vi_e4_190: thrustCurve(P190, 123.5e3, 2300),
  mcp_ng_2100: thrustCurve(P187, 114e3, 2100, [0, 45, 90]),
};
for (const k of ['ng_e4_187', 'tdi_99kW_187', 'vi_e4_190']) { const s = out.prop[k][0]; const Pw = k.startsWith('tdi') ? 99e3 : 123.5e3; s.FM = r(figureOfMerit(s.T_N, Pw, RHO0, k.startsWith('vi') ? 1.90 : 1.87), 3); }
// solidity and feathered / windmilling drag (Raymer: D/q ≈ 0.1 σ A feathered, 0.8 σ A windmilling; ค่าประมาณ)
{ const P = P187, N = 40; let Ab = 0; for (let i = 0; i < N; i++) { const x = P.xh + (1 - P.xh) * (i + 0.5) / N; Ab += P.cx ? (P.cD[Math.min(P.cD.length - 1, Math.round(x * 8))] ?? 0.06) * P.D * (1 - P.xh) * P.D / 2 / N : 0; }
  const A = Math.PI * P.D * P.D / 4, sigma = 3 * Ab / A;
  out.prop.drag = { solidity: r(sigma, 3), disk_m2: r(A, 4), DoverQ_feathered_m2: r(0.1 * sigma * A, 3), DoverQ_windmill_m2: r(0.8 * sigma * A, 3),
    dCD_feathered_onS: r(0.1 * sigma * A / S, 3), dCD_windmill_onS: r(0.8 * sigma * A / S, 3) };
}
// legacy T0 (both engines, static) and AC-law check
out.prop.T0_total = { ng: 2 * out.prop.ng_e4_187[0].T_N, tdi: 2 * out.prop.tdi_99kW_187[0].T_N, vi: 2 * out.prop.vi_e4_190[0].T_N };

// ── 6. IAS → CAS pairs derived from TCDS (KEAS ≈ KCAS at low altitude) vs AFM (KIAS) ──
out.ias_cas = {
  ng: { UP: [[76, 75], [151, 155], [152, 155], [188, 192]], APP: [[133, 135]], LDG: [[64, 62], [113, 110]],
    note: 'UP: VMCA 76→75, VNO 151→155, VLO(retr) 152→155, VNE 188→192; APP: VFE 133→135; LDG: VFE 113→110 and DA42-VI VS0 64 KIAS [LT11] ≈ 62 KCAS [LT6]' },
  tdi: { UP: [[68, 68], [155, 155], [156, 155], [194, 192]], APP: [[137, 135]], LDG: [[111, 110]], note: 'TCDS A [LT1] vs AFM 7.01.05 [LT3]' },
};
const lerp = (pairs, x) => { const p = pairs.slice().sort((a, b2) => a[0] - b2[0]); if (p.length === 1) return x + (p[0][1] - p[0][0]); let i = 0; while (i < p.length - 2 && x > p[i + 1][0]) i++; const t = (x - p[i][0]) / (p[i + 1][0] - p[i][0]); return p[i][1] + t * (p[i + 1][1] - p[i][1]); };

// ── 7. CLmax per flap from stall speeds (lm_polar.clmaxFromStall: min speed, nz 0.95, MTOM) ──
const st = (mass, kias, pairs, src) => { const kcas = lerp(pairs, kias), c = clmaxFromStall({ mass, S, vs_kcas: kcas, kind: 'min' }); return { mass, kias, kcas: r(kcas, 3), CLmax_1g: r(c.CLmax_1g, 3), V1g_kcas: r(c.V1g_kcas, 3), src }; };
out.clmax = {
  ng_1900: { UP: st(1900, 69, out.ias_cas.ng.UP, 'AFM green arc 69 [LT2]'), UP_table: st(1900, 68, out.ias_cas.ng.UP, 'stall table 68 [LT11]'),
    APP: st(1900, 65, [[65, 65], [133, 135]], 'stall table 65 [LT11]; KCAS≈KIAS at 65 (est)'), LDG: st(1900, 62, out.ias_cas.ng.LDG, 'AFM white arc 62 [LT2][LT11]') },
  vi_1999: { LDG_brochure: (() => { const c = clmaxFromStall({ mass: 1999, S, vs_kcas: 62, kind: 'min' }); return { kcas: 62, CLmax_1g: r(c.CLmax_1g, 3), src: 'VS0 62 KCAS [LT6]' }; })() },
  tdi_1700: { UP: st(1700, 62, out.ias_cas.tdi.UP, '[LT5] p.5-8'), APP: st(1700, 59, [[59, 59], [137, 135]], '[LT5]'), LDG: st(1700, 55, [[55, 55], [111, 110]], '[LT5]') },
  tdi_1785: { UP: st(1785, 64, out.ias_cas.tdi.UP, '[LT5]'), APP: st(1785, 61, [[61, 61], [137, 135]], '[LT5]'), LDG: st(1785, 57, [[57, 57], [111, 110]], '[LT5]') },
};

fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('./out/lt_geom.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(JSON.stringify({ wing: out.wing, tail: out.tail, cg_ng: out.cg.ng, inertia: Object.fromEntries(Object.entries(out.inertia).filter(([k]) => k !== 'items_training')), prop0: { ng: out.prop.ng_e4_187.slice(0, 6), tdi: out.prop.tdi_99kW_187[0], vi: out.prop.vi_e4_190[0], drag: out.prop.drag, T0: out.prop.T0_total }, clmax: out.clmax }, null, 1));
console.log('wrote scripts/out/lt_geom.json');
