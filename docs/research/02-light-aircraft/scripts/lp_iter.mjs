#!/usr/bin/env node
// lp_iter.mjs — LP: sensitivity of the ESTIMATED static thrust T0 (momentum FM 0.55 by default) on the PC-7 MkII takeoff over
// 50 ft (fact sheet 415 m [LP9]); for each T0 the climb is refitted (lm_legacy_fit static, ROC 2,840 fpm) so ROC stays on target.
//   node scripts/lp_iter.mjs  → scripts/out/lp_iter.json      (run from the repo root; Node >= 18)
import fs from 'node:fs';
import { buildAll } from './lp_build.mjs';
import { resolveType } from './lm_lib.mjs';
import { legacyFit } from './lm_legacy_fit.mjs';
import { loadSim, applyAC, cardInfo, takeoffTest } from './lm_card.mjs';
const DEG = Math.PI / 180;
// D2 (19 Nov 2026): lm_card.buildAC reads the TCDS travel from controls.surfaces.<s>.v.travel_deg; the AC_R1 travel patch is removed
const M = await loadSim();
const { cards } = buildAll();
const rows = [];
for (const id of ['pc7mk2', 't6a']) {
  const card = structuredClone(resolveType(cards, id));
  card.validation = { takeoff_test: { v: { flap: 'TO', VR_kt: id === 't6a' ? 85 : 76, theta_deg: id === 't6a' ? 8.5 : 10 }, u: '-', scope: 'sim', src: [], conf: 'ต่ำ', est: true, note: 'x' } };

  for (const FM of [0.55, 0.65, 0.75, 0.85]) {
    const P = id === 't6a' ? 820300 : 522000, D = id === 't6a' ? 2.4638 : 2.44, A = Math.PI * D * D / 4;
    const T0 = Math.pow(FM * P * Math.sqrt(2 * 1.225 * A), 2 / 3);
    const fit = legacyFit(card, { mode: 'static', T0 });
    const rs = applyAC(M, fit.ac); const info = cardInfo(card, fit.ac);
    for (const th of [10, 12]) {
      const to = takeoffTest(M, { f: info.takeoff.f, VR: info.takeoff.VR, theta: th });
      rows.push({ id, FM, T0: Math.round(T0), eta: +fit.ac.eta.toFixed(3), theta: th, groundRoll_m: Math.round(to.groundRoll_m), V_LOF_kt: +to.V_LOF_kt.toFixed(1), dist50ft_m: Math.round(to.dist50ft_m), V50_kt: +to.V50_kt.toFixed(1) });
    }
    rs();
  }
}
fs.writeFileSync(new URL('./out/lp_iter.json', import.meta.url), JSON.stringify(rows, null, 1));
for (const r of rows) console.log(JSON.stringify(r));
