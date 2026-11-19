#!/usr/bin/env node
// Topic 09 (LO): place the generic training circuit on AirfieldLab's VTBD runways for every type and write
// scripts/out/lo_circuits.json + lo_circuits.md. Run from the repo root:  node <this folder>/lo_run.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { makeCircuit, toNE, windLeg, TYPES, FT, NM, SM, KT, defaultOffset, turnRadius } from './lo_lib.mjs';

// Repo root: relative to this folder first (docs/research/02-light-aircraft/scripts -> four levels up), then
// $AIRFIELDLAB_ROOT, then the default of lm_card.mjs (same convention as the shared tools).
const HERE = path.dirname(fileURLToPath(import.meta.url));
const IN_REPO = path.resolve(HERE, '..', '..', '..', '..');
const ROOT = fs.existsSync(path.join(IN_REPO, 'test', 'harness.mjs')) ? IN_REPO : (process.env.AIRFIELDLAB_ROOT || decodeURIComponent(new URL('../../../../', import.meta.url).pathname).replace(/\/$/, ''));
const { M } = await import(pathToFileURL(path.join(ROOT, 'test', 'harness.mjs')).href);
const OUT = new URL('./out/', import.meta.url);

// Circuit side per landing runway. 03R/21L: AIP VTBD AD 2.20 4.2 puts the circuit EAST of the runway [LO13][LO39]:
// 03R lands on 028.75 deg, east = right -> 'R'; 21L lands on 208.75 deg, east = left -> 'L'.
// 03L/21R: no AIP circuit (it is the main airliner runway); the sim proposal uses the WEST side so the two
// circuits never overlap (fictional, labelled as such): 03L -> 'L', 21R -> 'R'.
const SIDES = { '03R': 'R', '21L': 'L', '03L': 'L', '21R': 'R' };
const HP = (id) => (TYPES[id].features.turboprop ? 1000 : 800);   // AIP join heights: light 800, conventional 1000 [LO39 AD 2.20 4.2.2, AD 2.22 8.6.2]; turboprop = 1000 is an estimate
const ATZ_R = 5 * NM, ATZ_TOP_FT = 2000;                          // AIP AD 2.17 [LO39]

const res = { note: 'LO0 circuits on VTBD; runway frame x along landing direction from threshold, y right; h AGL m', runs: [] };
for (const rwy of ['21L', '03R', '03L', '21R']) {
  const E = M.RWY_END[rwy];
  const L = E.lda;                                    // departure end (x) for a touch-and-go on the same runway
  const other = rwy[2] === 'L' ? M.RWY_END[rwy.slice(0, 2) + 'R'] : M.RWY_END[rwy.slice(0, 2) + 'L'];
  for (const [id, T] of Object.entries(TYPES)) {
    const c = makeCircuit({ L, aim: E.aim, side: SIDES[rwy], hP_ft: HP(id), V: T.V, roc_fpm: T.roc_fpm, xLiftoff: T.features.turboprop ? 700 : 400 });
    const c45 = makeCircuit({ L, aim: E.aim, side: SIDES[rwy], hP_ft: HP(id), V: T.V, roc_fpm: T.roc_fpm, baseRule: '45' });
    const ne = toNE(c, E);
    const rMax = Math.max(...ne.map((w) => Math.hypot(w.n, w.e)));
    // lateral distance of the downwind track from the OTHER runway's centreline (positive = clear on the far side)
    const dw = ne.find((w) => w.k === 'abeam_threshold');
    const lat = (dw.n - other.thr[0]) * other.r[0] + (dw.e - other.thr[1]) * other.r[1];
    const latOwn = (dw.n - E.thr[0]) * E.r[0] + (dw.e - E.thr[1]) * E.r[1];
    res.runs.push({
      rwy, id, side: SIDES[rwy], hP_ft: HP(id), D_m: +c.D.toFixed(0), F_m: +c.F.toFixed(0), rollout_ft: +c.hRollFt.toFixed(0),
      baseAngle_deg: +c.baseAngleDeg.toFixed(1), descent_deg: +c.descentDeg.toFixed(2), vsBase_fpm: +c.vsBase.toFixed(0), vsFinal_fpm: +c.vsFinal.toFixed(0),
      xCw_m: +c.xCw.toFixed(0), hCw_ft: +(c.hCw / FT).toFixed(0), time_min: +(c.timeS / 60).toFixed(2), Rb_m: +c.Rb.toFixed(0), Rf_m: +c.Rf.toFixed(0),
      rMax_NM: +(rMax / NM).toFixed(2), inATZ: rMax <= ATZ_R && HP(id) <= ATZ_TOP_FT, dwFromOwnCL_m: +latOwn.toFixed(0), dwFromOtherCL_m: +lat.toFixed(0),
      rule45: { F_m: +c45.F.toFixed(0), rollout_ft: +c45.hRollFt.toFixed(0), finalOK: c45.finalOK },
      wp: ne.map((w) => ({ k: w.k, n: +w.n.toFixed(0), e: +w.e.toFixed(0), h_ft: +(w.h / FT).toFixed(0) })),
    });
  }
}
// wind example: 21L, C172S, wind 090/10 (from the east, i.e. from the circuit side)
const trk21L = M.RWY_END['21L'].hdg;
const legsTrk = { upwind: trk21L, crosswind: trk21L + 90, downwind: trk21L + 180, base: trk21L - 90, final: trk21L };
res.windExample = { rwy: '21L', type: 'c172s', wind: '090/10', legs: Object.fromEntries(Object.entries(legsTrk).map(([k, trk]) => {
  const V = { upwind: 74, crosswind: 74, downwind: 90, base: 75, final: 65 }[k];
  const w = windLeg(((trk % 360) + 360) % 360, V, 90, 10);
  return [k, { trk: +(((trk % 360) + 360) % 360).toFixed(1), crab_deg: +w.crab.toFixed(1), gs_kt: +w.gs.toFixed(1) }];
})) };
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(new URL('lo_circuits.json', OUT), JSON.stringify(res, null, 1));
const rows = ['| ทางวิ่ง | แบบ | ด้าน | สูง (ft) | D (m) | final (m) | roll-out (ft) | มุม base (°) | ลด (°) | vs base / final (fpm) | เลี้ยว crosswind x (m) | เวลา (นาที) | r สูงสุด (NM) | ใน ATZ | downwind ห่าง CL อีกทางวิ่ง (m) | กฎ 45°: final / roll-out |', '|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|'];
for (const r of res.runs) rows.push(`| ${r.rwy} | ${r.id} | ${r.side} | ${r.hP_ft} | ${r.D_m} | ${r.F_m} | ${r.rollout_ft} | ${r.baseAngle_deg} | ${r.descent_deg} | ${r.vsBase_fpm} / ${r.vsFinal_fpm} | ${r.xCw_m} | ${r.time_min} | ${r.rMax_NM} | ${r.inATZ ? 'ใช่' : 'ไม่'} | ${r.dwFromOtherCL_m} | ${r.rule45.F_m} m / ${r.rule45.rollout_ft} ft |`);
fs.writeFileSync(new URL('lo_circuits.md', OUT), rows.join('\n') + '\n\nwind example ' + JSON.stringify(res.windExample) + '\n');
console.log(rows.filter((r) => /21L|03R|ทางวิ่ง|---/.test(r)).join('\n'));
console.log(JSON.stringify(res.windExample));
