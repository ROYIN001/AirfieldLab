#!/usr/bin/env node
// 19 Nov 2026 (D6): detent names follow the AFM (UP / T/O / LDG); earlier outputs used 'TO'.
// ld_review.mjs — reviewer's checks for 05-da40.md (round-2 review, 2026-11-18). Node >= 18, no dependencies.
// 1) Idle glides of the da40ng card in today's sim (via lm_card buildAC/applyAC + trimThr, no code change) at the
//    speeds and flap settings that DA40 NG pilots report in [LD13] post 17/20 (mass not reported: full fuel + one
//    150 lb person ≈ 1,100 kg, ค่าประมาณ), compared with the reported glide ratio V/|Vz| and pitch attitude.
// 2) Small recomputations used in the review notes: TAE 125 vs AE300 dry mass, MTV-12 propeller data, hot-day factors.
// Run from the repo root:  node <this folder>/ld_review.mjs   -> scripts/out/ld_review.json
import fs from 'node:fs';
import { loadType } from './lm_lib.mjs';
import { loadSim, buildAC, applyAC, cardInfo, trimThr } from './lm_card.mjs';
const OUT = new URL('./out/ld_review.json', import.meta.url);
const KT = 0.514444, FPM = 0.3048 / 60, FT = 0.3048;
const M = await loadSim();
const card = loadType('da40ng');
// [LD13] DA40 NG points (post 17 clean; post 20 at 0 % load): [label, detent, KIAS, pitch deg, Vz fpm]
const PTS = [['clean idle', 'UP', 88, -2.5, -900], ['T/O idle', 'T/O', 88, -7.5, -900], ['T/O idle', 'T/O', 84, -6.0, -600],
  ['LDG idle', 'LDG', 88, -12.5, -1300], ['LDG idle', 'LDG', 84, -6.5, -500], ['LDG idle (TDI video)', 'LDG', 73, -6.5, -1050]];
const out = { note: 'sim = da40ng card in AirfieldLab physics at commit cabf0f0 (lm_card), h 1,000 ft ISA, thr 0', rows: [] };
for (const mass of [1100, 1310]) {
  const ac = buildAC(card, { mass }), restore = applyAC(M, ac), info = cardInfo(card, ac);
  try {
    for (const [label, det, kias, th, vz] of PTS) {
      const f = info.dets.find(d => d.name === det).f;
      const t = trimThr(M, kias, 0, f, 1, 1000 * FT);
      out.rows.push({ mass, label, det, kias, reported: { theta_deg: th, LoD: +(kias * KT / (-vz * FPM)).toFixed(2) },
        sim: { theta_deg: +t.theta.toFixed(1), alpha_deg: +t.alpha.toFixed(1), LoD: +t.LoverD.toFixed(2), vz_fpm: Math.round(t.roc_fpm) } });
    }
  } finally { restore(); }
}
// TCDS cross-checks (pure arithmetic on published numbers)
out.engines = {
  AE300_E4: { dry_kg: 185, P_kW: 123.5, crank_rpm: 3880, gear: 1.69, prop_rpm: +(3880 / 1.69).toFixed(0), src: 'EASA E.200 Issue 12 p.5 [LD10]' },
  TAE125_01: { dry_kg: 134, disp_cm3: 1689, P_kW: 99, crank_rpm: 3900, gear: 1.689, prop_rpm: +(3900 / 1.689).toFixed(0), src: 'EASA E.055 Issue 16 p.6 [LD11]' },
  TAE125_02_99: { dry_kg: 153, disp_cm3: 1991, P_kW: 99, crank_rpm: 3900, gear: 1.689, prop_rpm: +(3900 / 1.689).toFixed(0), src: 'EASA E.055 Issue 16 p.6 [LD11]' },
};
out.propellers = {
  'MTV-6-R/190-69': { D_m: 1.90, blades: 3, mass_kg: 14, P_max_kW: 125, rpm_max: 2500, src: 'EASA P.094 Issue 04 p.7–8 [LD9]' },
  'MTV-6-A/187-129': { D_m: 1.87, blades: 3, mass_kg: 14, P_max_kW: 125, rpm_max: 2500, src: 'EASA P.094 Issue 04 p.7–8 [LD9]' },
  'MTV-12-B/180-17': { D_m: 1.80, blades: 3, mass_kg: 20, P_max_kW: 168, rpm_max: 2800, src: 'EASA P.013 Issue 02 p.6–7 [LD16]' },
};
const sig = 288.15 / 308.15, lapse = 1.132 * sig - 0.132;
out.hot_day = { sigma: +sig.toFixed(4), flat: +(1 / (sig * Math.cbrt(sig))).toFixed(4), gagg_ferrar: +(1 / (sig * Math.cbrt(lapse ** 2 * sig))).toFixed(4) };
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
for (const r of out.rows) console.log(`${r.mass} kg ${r.label} ${r.det} ${r.kias} KIAS: reported θ ${r.reported.theta_deg}° L/D ${r.reported.LoD} | sim θ ${r.sim.theta_deg}° α ${r.sim.alpha_deg}° L/D ${r.sim.LoD} Vz ${r.sim.vz_fpm} fpm`);
console.log(JSON.stringify({ engines: out.engines, hot_day: out.hot_day }));
