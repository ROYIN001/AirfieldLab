#!/usr/bin/env node
// lt_oei_ceiling.mjs — gap 22 of the completeness review (19 Nov 2026), 06-da42.md §06.4.1: can the two published OEI numbers
// both hold?  (a) DA42 NG OEI rate of climb 210 fpm at SL ISA, MTOM 1,900 kg [LT10]; (b) DA42-VI OEI service ceiling
// 16,000 ft (50 fpm) / absolute 17,500 ft under the brochure heading "MTOM, ISA" [LT6 p.19], whose mass basis is not stated.
// Analytic point-mass model, not the simulator (today's sim has no OEI and no density term in thrust):
//   ROC = (η·P(h) − D·V)/W  maximised over TAS,  D = q S (CD0 + ΔCD_feather + ΔCD_trim + K CL²)
//   P(h) = P (turbo flat-rated) up to h_c, then × (ρ/ρ_c)^1.1; η from the BEM curves of lt_geom.json × k_η (installation factor)
//   ISA deviation ΔT changes ρ at the same pressure altitude: ρ = p_ISA(h)/(R (T_ISA(h) + ΔT)).
// Every number here is ค่าประมาณ (polar of lt_polar.mjs, BEM of lm_prop, flat rating to 16,000 ft from [LT6]).
//   node scripts/lt_oei_ceiling.mjs   -> scripts/out/lt_oei_ceiling.json
import fs from 'node:fs';
const OUT = new URL('./out/', import.meta.url);
const rd = f => JSON.parse(fs.readFileSync(new URL(f, OUT), 'utf8'));
const geom = rd('lt_geom.json'), pol = rd('lt_polar.json');
const KT = 0.514444, FT = 0.3048, G0 = 9.80665, S = 16.29, R = 287.053;
const r = (x, n = 4) => (x == null || !isFinite(x) ? null : +(+x).toPrecision(n));
const interp = (c, ktas, key) => { let i = 1; while (i < c.length - 1 && c[i].KTAS < ktas) i++; const a = c[i - 1], b = c[i]; return a[key] + (ktas - a.KTAS) / (b.KTAS - a.KTAS) * (b[key] - a[key]); };
const curve = { ng: geom.prop.ng_e4_187, vi: geom.prop.vi_e4_190 };
const dCDf = geom.prop.drag.dCD_feathered_onS + 0.002;                // feathered prop + trim drag (as lt_oei.mjs)
const isa = (h, dT = 0) => { const T = 288.15 - 0.0065 * h, p = 101325 * (T / 288.15) ** 5.25588; return { rho: p / (R * (T + dT)), p }; };
const HC = 16000 * FT;
function roc(h, { mass, P = 114e3, crv = curve.ng, kEta = 1, cd0 = pol.CD0_mean, dT = 0, n = 1, dcd = dCDf }) {   // n engines running; dcd = extra ΔCD (feather + trim for OEI, 0 for both engines)
  const rho = isa(h, dT).rho, rhoC = isa(HC, dT).rho, Ph = h <= HC ? P : P * (rho / rhoC) ** 1.1;
  let best = -1e9, vb = 0;
  for (let kt = 60; kt <= 150; kt += 0.5) {
    const V = kt * KT, q = 0.5 * rho * V * V, CL = mass * G0 / (q * S), CD = cd0 + dcd + pol.oswald.K * CL * CL;
    const ro = (n * kEta * interp(crv, kt, 'eta') * Ph / V - q * S * CD) * V / (mass * G0);
    if (ro > best) { best = ro; vb = kt * Math.sqrt(rho / 1.225); }
  }
  return { fpm: best / FT * 60, keas: vb };
}
const ceiling = (o, target = 50) => { let lo = 0, hi = 9000; for (let i = 0; i < 40; i++) { const m = 0.5 * (lo + hi); if (roc(m, o).fpm > target) lo = m; else hi = m; } return Math.round(lo / FT / 10) * 10; };
const bisect = (f, lo, hi, n = 40) => { const s = Math.sign(f(lo)); for (let i = 0; i < n; i++) { const m = 0.5 * (lo + hi); if (Math.sign(f(m)) === s) lo = m; else hi = m; } return 0.5 * (lo + hi); };

// 1) installation factor k_η that makes NG 1,900 kg SL ISA, live engine MAX 123.5 kW (5 min), feathered = 210 fpm [LT10]
const kCal = bisect(k => roc(0, { mass: 1900, P: 123.5e3, kEta: k }).fpm - 210, 0.6, 1.1);
const base = { kEta: kCal, crv: curve.vi };   // VI propeller 1.90 m (BEM), same polar and the same k_η
// 2) VI ceiling (MCP 114 kW) with the calibrated model, by mass and ISA deviation
const masses = [1999, 1900, 1800, 1700, 1600, 1500], dTs = [-10, 0, 10, 20];
const table = masses.map(m => ({ mass_kg: m, ...Object.fromEntries(dTs.map(d => [`isa${d >= 0 ? '+' : ''}${d}_ft`, ceiling({ ...base, mass: m, dT: d })])),
  abs_isa_ft: ceiling({ ...base, mass: m }, 0), SL_MAX_fpm: Math.round(roc(0, { ...base, mass: m, P: 123.5e3 }).fpm) }));
// 3) what each published number needs, all else equal
const massFor16k = bisect(m => ceiling({ ...base, mass: m }) - 16000, 1000, 2100, 30);
const cd0For16k = bisect(c => ceiling({ ...base, mass: 1999, cd0: c }) - 16000, 0.015, pol.CD0_mean, 30);
const kFor16k = bisect(k => ceiling({ ...base, mass: 1999, kEta: k }) - 16000, kCal, 1.2, 30);
const need = {
  mass_for_16000ft_kg: Math.round(massFor16k),
  cd0_for_16000ft_at_1999kg: r(cd0For16k, 4), cd0_reduction_pct: r(100 * (1 - cd0For16k / pol.CD0_mean), 3),
  kEta_for_16000ft_at_1999kg: r(kFor16k, 4),
  VI_SL_OEI_fpm_implied_by_16000ft: Math.round(roc(0, { ...base, mass: 1999, kEta: kFor16k, P: 123.5e3 }).fpm),
  VI_SL_OEI_fpm_implied_drag_route: Math.round(roc(0, { ...base, mass: 1999, cd0: cd0For16k, P: 123.5e3 }).fpm),
  NG_SL_OEI_fpm_uncalibrated: Math.round(roc(0, { mass: 1900, P: 123.5e3 }).fpm),
  VI_ceiling_uncalibrated_1999_ft: ceiling({ crv: curve.vi, mass: 1999 }),
};
// 4) the same calibrated model for NG (1.87 m propeller): ceilings at MTOM and at the training mass
const ng = { ng_1900_ft: ceiling({ kEta: kCal, mass: 1900 }), ng_1752_ft: ceiling({ kEta: kCal, mass: 1752 }), ng_1752_SL_MAX_fpm: Math.round(roc(0, { kEta: kCal, mass: 1752, P: 123.5e3 }).fpm),
  ng_1900_SL_MAX_isa20_fpm: Math.round(roc(0, { kEta: kCal, mass: 1900, P: 123.5e3, dT: 20 }).fpm) };
// 5) both engines (gap 16, performance.ROC_table): no feather/trim drag, both engines MAX 123.5 kW, k_η calibrated so that
//    NG 1,900 kg SL ISA = 1,180 fpm [LT10]; then the hot day at VTBD (SL, 35 °C = ISA+20) and the DA42-VI 1,999 kg check (1,114 fpm [LT6])
const aeo = o => roc(0, { n: 2, dcd: 0, P: 123.5e3, ...o }).fpm;
const kAEO = bisect(k => aeo({ mass: 1900, kEta: k }) - 1180, 0.5, 1.2);
const aeoOut = { kEta_cal_1180fpm: r(kAEO, 4),
  ng_1900: { isa_fpm: Math.round(aeo({ mass: 1900, kEta: kAEO })), isa20_fpm: Math.round(aeo({ mass: 1900, kEta: kAEO, dT: 20 })), isa10_fpm: Math.round(aeo({ mass: 1900, kEta: kAEO, dT: 10 })) },
  ng_1752: { isa_fpm: Math.round(aeo({ mass: 1752, kEta: kAEO })), isa20_fpm: Math.round(aeo({ mass: 1752, kEta: kAEO, dT: 20 })) },
  vi_1999_check: { isa_fpm: Math.round(aeo({ mass: 1999, kEta: kAEO, crv: curve.vi })), published_fpm: 1114, isa20_fpm: Math.round(aeo({ mass: 1999, kEta: kAEO, crv: curve.vi, dT: 20 })) },
  ng_1900_oei_isa20_fpm: ng.ng_1900_SL_MAX_isa20_fpm };
const out = {
  note: 'ค่าประมาณ (point mass, polar ของ lt_polar + ΔCD feather 0.0014 + trim 0.002, η ของ BEM × k_η, กำลังคงที่ถึง 16,000 ft แล้วลด ∝ σ^1.1, ไม่ใช่ซิม)',
  kEta_cal_210fpm: r(kCal, 4), vi_ceiling_by_mass_isa: table, needed_for_16000ft: need, ng: ng, aeo: aeoOut,
};
fs.writeFileSync(new URL('lt_oei_ceiling.json', OUT), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
console.log('wrote scripts/out/lt_oei_ceiling.json');
