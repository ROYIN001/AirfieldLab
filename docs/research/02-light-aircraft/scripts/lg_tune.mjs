#!/usr/bin/env node
// lg_tune.mjs — sensitivity sweeps of ESTIMATED p2006t values in the current sim (lm_card numerics, control travel from the card):
//   (a) take-off rotation attitude θ (validation.takeoff_test.theta_deg, est) → ground roll, 50 ft distance, V_LOF at 1,180 / 1,230 kg
//   (b) Iyy scale (inertia est ±30 %) → short-period ωn, ζ at 110 kt / 3,000 ft vs flight test 3.41 rad/s, 0.40 [LG7]
//   (c) CDgear and CDflap (est) → approach throttle and landing distance
//   (d) Cmadot (est) and the Cmq/Cmadot split → short-period ζ (can the flight ζ 0.40 [LG7] be reached with estimated values?)
// Writes scripts/out/lg_tune.json. Run from the repo root: node <this folder>/lg_tune.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadType, isMainModule } from './lm_lib.mjs';
import { buildAC, applyAC, loadSim, modes, takeoffTest, landingTest, trim, cardInfo } from './lm_card.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const r = (x, n = 4) => (x == null ? null : +(+x).toPrecision(n));

export async function tune() {
  const card = loadType('p2006t', { dir: path.join(HERE, '..') }), M = await loadSim(), out = { takeoff: [], sp: [], approach: [], spDamping: [] };
  for (const mass of [1180, 1230]) {
    const ac = buildAC(card, { mass }); applyAC(M, ac);
    const info = cardInfo(card, ac);
    for (const theta of [8, 10, 12, 14]) {
      const t = takeoffTest(M, { f: info.takeoff.f, VR: info.takeoff.VR, theta });
      out.takeoff.push({ mass, theta, VR: info.takeoff.VR, f: r(info.takeoff.f), GR_m: r(t.groundRoll_m), d50_m: r(t.dist50ft_m), VLOF_kt: r(t.V_LOF_kt), V50_kt: r(t.V50_kt) });
    }
  }
  const ac0 = buildAC(card, {});
  for (const s of [1.0, 1.15, 1.3, 1.5, 1.65]) {
    const ac = { ...ac0, Iyy: ac0.Iyy * s }; applyAC(M, ac);
    const m = modes(M, { ias: 110, h: 3000 * 0.3048, flaps: 0, gear: 0, gammaDeg: 0 }, { adot: true });
    out.sp.push({ IyyScale: s, Iyy: r(ac.Iyy), sp_wn: r(m.sp?.wn), sp_zeta: r(m.sp?.zeta), ph_T: r(m.ph?.T), ph_zeta: r(m.ph?.zeta), CAP: r(m.CAP) });
  }
  for (const [cg, cf] of [[0.012, 0.05], [0.012, 0.035], [0.012, 0.065], [0.02, 0.05]]) {
    const ac = { ...buildAC(card, { mass: 1180 }), CDgear: cg, CDflap: cf }; applyAC(M, ac);
    const t = trim(M, new M.Aircraft(), { ias: 69, h: 300, flaps: 1, gear: 1, gammaDeg: -3 });
    t.theta *= 180 / Math.PI; t.alpha *= 180 / Math.PI;
    const l = landingTest(M, { maxBrake: true });
    out.approach.push({ CDgear: cg, CDflap: cf, thr: r(t.thr), theta: r(t.theta), alpha: r(t.alpha), land50_m: r(l.total_m), air_m: r(l.air_m), ground_m: r(l.ground_m) });
  }
  for (const [lab, d] of [['card', {}], ['Cmadot 0 (flight Cmq taken as Cmq+Cmadot)', { Cmadot: 0 }], ['Cmadot 0, Iyy x1.27', { Cmadot: 0, Iyy: ac0.Iyy * 1.27 }],
    ['Cmq -10', { Cmq: -10 }], ['Cmq -10.6 + Cmadot -4.2 (sum = flight Cmq)', { Cmq: -10.6, Cmadot: -4.2 }]]) {
    const ac = { ...ac0, ...d }; applyAC(M, ac);
    const m = modes(M, { ias: 110, h: 3000 * 0.3048, flaps: 0, gear: 0, gammaDeg: 0 }, { adot: true });
    out.spDamping.push({ case: lab, Cmq: r(ac.Cmq), Cmadot: r(ac.Cmadot), Iyy: r(ac.Iyy), sp_wn: r(m.sp?.wn), sp_zeta: r(m.sp?.zeta), ph_T: r(m.ph?.T) });
  }
  return out;
}

if (isMainModule(import.meta.url)) {
  const out = await tune();
  fs.writeFileSync(path.join(HERE, 'out', 'lg_tune.json'), JSON.stringify(out, null, 1));
  for (const k of Object.keys(out)) { console.log('##', k); for (const row of out[k]) console.log(JSON.stringify(row)); }
}
