#!/usr/bin/env node
// ld_geom.mjs — derived geometry of the Diamond DA40 family for 05-da40.md (LD). Node >= 18, no dependencies.
//   node scripts/ld_geom.mjs [--json]      -> prints the table used in 05-da40.md §05.2 and writes scripts/out/ld_geom.json
// Inputs are published numbers (source codes of 05-da40.md in comments); everything computed here is an ESTIMATE
// (ค่าประมาณ) unless it is a pure unit conversion. Method: straight-tapered wing equivalent with the AFM's S, b, MAC;
// leading edge from the TCDS datum definition; tail arms from a side-view estimate (no public drawing with stations).
import fs from 'node:fs';
const OUT = new URL('./out/ld_geom.json', import.meta.url);
const DEG = Math.PI / 180, IN = 0.0254, KT = 0.514444;

// ---- published inputs ----
const NG = { S: 13.244, b: 11.63, MAC: 1.171, AR: 10.223, L: 8.06, H: 1.97 };        // [LD2] AFM NG p.1-5
const CL = { S: 13.54, b: 11.94, MAC: 1.121, AR: 10.53, L: 8.01, H: 1.97 };          // [LD6] AFM DA40 p.1-6
const DATUM_TO_STUB_LE = 2.194;            // m, datum 2.194 m ahead of stub-wing LE at root rib [LD1] p.29, [LD2] p.2-18
const LE_SWEEP = 1.0;                       // deg, approx. [LD6] p.1-6
const Y_ROOT_RIB = 0.60;                    // m, stub-wing root rib half-breadth (ค่าประมาณ: half cabin width ~0.59 m)
const CG = { fwd_lo: 2.40, fwd_hi_m: 1310, fwd_hi: 2.469, fwd_1280: 2.46, aft: 2.53, m_lo: 1080 };   // [LD1] p.29
const CG180 = { fwd_lo: 2.40, m_lo: 980, fwd_hi: 2.48, fwd_hi_m: 1200, aft: 2.59, aft_lr: 2.55 };   // [LD1] p.6
const HT = { S: 2.34, AR_est: 4.9, xc4_est: 7.30 };   // S [LD2] p.1-6; AR and c/4 station ค่าประมาณ (side view)
const VT = { S: 1.60, b_est: 1.30, xc4_est: 6.90 };   // S [LD2] p.1-6; height and c/4 station ค่าประมาณ
const GEAR = { track: 2.97, wheelbase: 1.68, wheelbase_574: 1.85, x_main_est: 2.80 };  // [LD2] p.1-6; x_main from FG check [LB19]

function taper(S, b, MAC) {             // solve MAC/c_avg = 4/3 (1+l+l^2)/(1+l)^2 for l (straight-tapered equivalent)
  const r = MAC / (S / b); let lo = 0.2, hi = 1.0;
  for (let i = 0; i < 60; i++) { const l = (lo + hi) / 2, f = 4 / 3 * (1 + l + l * l) / ((1 + l) ** 2); if (f > r) lo = l; else hi = l; }
  const l = (lo + hi) / 2, cr = 2 * S / (b * (1 + l)), ct = l * cr, yMAC = b / 6 * (1 + 2 * l) / (1 + l);
  return { taper: l, c_root: cr, c_tip: ct, y_MAC: yMAC };
}
function wing(g) {
  const t = taper(g.S, g.b, g.MAC);
  const x_le_cl = DATUM_TO_STUB_LE - Y_ROOT_RIB * Math.tan(LE_SWEEP * DEG);
  const LEMAC = x_le_cl + t.y_MAC * Math.tan(LE_SWEEP * DEG);
  const xc4 = LEMAC + 0.25 * g.MAC;
  const sweep_c4 = Math.atan(Math.tan(LE_SWEEP * DEG) - (t.c_root - t.c_tip) / (4 * g.b / 2)) / DEG;
  return { ...t, LEMAC, x_c4_MAC: xc4, sweep_c4_deg: sweep_c4 };
}
const pct = (x, w, mac) => 100 * (x - w.LEMAC) / mac;
const wNG = wing(NG), wCL = wing(CL);
const b_h = Math.sqrt(HT.AR_est * HT.S), l_h = HT.xc4_est - wNG.x_c4_MAC, l_v = VT.xc4_est - wNG.x_c4_MAC;
const Vh = HT.S * l_h / (NG.S * NG.MAC), Vv = VT.S * l_v / (NG.S * NG.b);
const cgRef = 2.47;                         // m DAT, mid envelope at the training mass (ค่าประมาณ)
const res = {
  ng: { ...wNG, cg_pct: { fwd_lo: pct(CG.fwd_lo, wNG, NG.MAC), fwd_1310: pct(CG.fwd_hi, wNG, NG.MAC), aft: pct(CG.aft, wNG, NG.MAC), ref: pct(cgRef, wNG, NG.MAC) } },
  classic: { ...wCL, cg_pct: { fwd_lo: pct(CG180.fwd_lo, wCL, CL.MAC), fwd_1200: pct(CG180.fwd_hi, wCL, CL.MAC), aft: pct(CG180.aft, wCL, CL.MAC), aft_lr: pct(CG180.aft_lr, wCL, CL.MAC) } },
  tail: { b_h, l_h, l_v, Vh, Vv, b_v: VT.b_est },
  gear: {
    x_main_DAT: GEAR.x_main_est, x_nose_DAT: GEAR.x_main_est - GEAR.wheelbase,
    main_FRD_x: cgRef - GEAR.x_main_est, nose_FRD_x: cgRef - (GEAR.x_main_est - GEAR.wheelbase),
    nose_load_frac_at_ref: (GEAR.x_main_est - cgRef) / GEAR.wheelbase,
  },
  cgRef_DAT: cgRef,
};
// weights in other units (pure conversions)
const lb = kg => kg / 0.45359237;
res.conv = { MTOW_1310_lb: lb(1310), MTOW_1280_lb: lb(1280), MLW_1280_lb: lb(1280), MLW_1216_lb: lb(1216) };
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
if (process.argv.includes('--json')) console.log(JSON.stringify(res, null, 1));
else {
  const f = (x, n = 3) => (+x).toFixed(n);
  console.log(`DA40 NG wing: taper ${f(wNG.taper)} c_root ${f(wNG.c_root)} c_tip ${f(wNG.c_tip)} y_MAC ${f(wNG.y_MAC)} LEMAC ${f(wNG.LEMAC)} m DAT, c/4 MAC ${f(wNG.x_c4_MAC)}, sweep c/4 ${f(wNG.sweep_c4_deg, 2)} deg`);
  console.log(`  CG %MAC: fwd(<=1080) ${f(res.ng.cg_pct.fwd_lo, 1)} fwd(1310) ${f(res.ng.cg_pct.fwd_1310, 1)} aft ${f(res.ng.cg_pct.aft, 1)} ref(2.47) ${f(res.ng.cg_pct.ref, 1)}`);
  console.log(`DA40 classic wing: taper ${f(wCL.taper)} LEMAC ${f(wCL.LEMAC)}; CG %MAC fwd ${f(res.classic.cg_pct.fwd_lo, 1)} fwd(1200) ${f(res.classic.cg_pct.fwd_1200, 1)} aft ${f(res.classic.cg_pct.aft, 1)} aft LR ${f(res.classic.cg_pct.aft_lr, 1)}`);
  console.log(`tail: b_h ${f(b_h, 2)} l_h ${f(l_h, 2)} l_v ${f(l_v, 2)} V_H ${f(Vh)} V_V ${f(Vv, 4)}`);
  console.log(`gear: main ${f(res.gear.x_main_DAT, 2)} nose ${f(res.gear.x_nose_DAT, 2)} m DAT; FRD x main ${f(res.gear.main_FRD_x)} nose ${f(res.gear.nose_FRD_x)}; nose load ${f(100 * res.gear.nose_load_frac_at_ref, 1)} %`);
  console.log('conv', JSON.stringify(res.conv));
}
