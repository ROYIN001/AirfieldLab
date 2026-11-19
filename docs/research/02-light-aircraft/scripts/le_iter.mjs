// le_iter.mjs — iterate the ESTIMATED values of the c172r card in today's sim (topic 10, code LE):
//  (1) takeoff-test technique (VR, pitch target θ) — only a test-procedure estimate, never a POH number;
//  (2) sensitivity of Vy / ROC / glide / Vmax to the polar (glide polar vs clean polar vs blends) — shows why one
//      polar cannot match both glide and climb/cruise in today's code;
//  (3) landing technique: POH short-field speed 62 KIAS (62.8 KCAS) at 50 ft vs the card's normal approach speed.
// Run from the repo root:  node <this folder>/le_iter.mjs   → scripts/out/le_iter.json (and stores the chosen VR/θ
// into scripts/out/le_legacy.json so le_json.mjs writes validation.takeoff_test)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadType, val, isMainModule } from './lm_lib.mjs';
import { loadSim, buildAC, applyAC, cardInfo, trimThr, climbSweep, glideSweep, takeoffTest, landingTest } from './lm_card.mjs';
import { toSimPolar } from './lm_polar.mjs';
import { compute } from './le_calc.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEG = Math.PI / 180, FT = 0.3048, RHO0 = 1.225;
const r = (x, n = 1) => (x == null || Number.isNaN(x) ? null : Math.round(x * 10 ** n) / 10 ** n);
const MTOW = 1111.3;
const POH = { roll: 288, d50: 514, vlof_kcas: 55.7, v50_kcas: 59.9 };

export async function iterate() {
  const C = compute();
  const card = loadType('c172r');
  const ac = buildAC(card, { mass: MTOW });
  const trv = s => val(card, `controls.surfaces.${s}`)?.travel_deg;          // lm_card path workaround (see lc_tests.mjs)
  const el = trv('elevator'), ai = trv('aileron'), ru = trv('rudder');
  Object.assign(ac, { deUp: el.up * DEG, deDn: el.down * DEG, daMax: 0.5 * (ai.up + ai.down) * DEG, drMax: Math.min(ru.left, ru.right) * DEG });
  const M = await loadSim();
  const restore = applyAC(M, ac);
  const info = cardInfo(card, ac);
  const out = { takeoff: [], polar: [], landing: {} };

  // (1) takeoff technique sweep, flaps 10
  for (const VR of [47, 49, 51, 53]) for (const theta of [10, 12, 14]) {
    const t = takeoffTest(M, { f: info.takeoff.f, VR, theta });
    const e = Math.abs(t.groundRoll_m / POH.roll - 1) + Math.abs(t.dist50ft_m / POH.d50 - 1) + Math.abs(t.V_LOF_kt / POH.vlof_kcas - 1);
    out.takeoff.push({ VR, theta, roll: r(t.groundRoll_m, 0), d50: r(t.dist50ft_m, 0), vlof: r(t.V_LOF_kt), v50: r(t.V50_kt), score: r(e, 3) });
  }
  out.takeoff.sort((a, b) => a.score - b.score);
  out.takeoffBest = out.takeoff[0];

  // (2) polar blend sweep: w = 0 glide polar (card), 1 = clean polar from the POH cruise point
  const keep = { CD0: M.AC.CD0, K: M.AC.K };
  const gp = { CD0: C.glide.CD0, K: C.glide.K }, cp = { CD0: C.cleanPolar.CD0, K: C.cleanPolar.K };
  for (const w of [0, 0.25, 0.5, 0.75, 1]) {
    const sp = toSimPolar({ CD0: gp.CD0 + w * (cp.CD0 - gp.CD0), K: gp.K + w * (cp.K - gp.K) });
    M.AC.CD0 = sp.CD0; M.AC.K = sp.K;
    const c = climbSweep(M, { h: 30, v0: 50, v1: 100, step: 1, flaps: 0, gear: 1 });
    const g = glideSweep(M, { h: 3000 * FT, v0: 50, v1: 100, step: 1, thr: 0 });
    let lo = 60, hi = 170; const gm = v => trimThr(M, v, 1, 0, 1, 30).gamma;
    let vmax = null; if (gm(lo) > 0) { for (let i = 0; i < 40; i++) { const m = 0.5 * (lo + hi); if (gm(m) > 0) lo = m; else hi = m; } vmax = 0.5 * (lo + hi); }
    out.polar.push({ w, CD0s: r(sp.CD0, 4), Ks: r(sp.K, 4), Vy: r(c.Vy_kt), ROC: r(c.ROCmax_fpm, 0), Vbg: r(g.Vbg_kt), LD: r(g.LD, 2), vmaxSL_keas: r(vmax) });
  }
  Object.assign(M.AC, keep);

  // (3) landing: card Vapp/Vref vs POH short-field 62 KIAS = 62.8 KCAS at 50 ft, max braking
  out.landing.card = (({ total_m, air_m, ground_m, ias50_kt, vtd_kt, sinkTD_fpm }) => ({ total_m: r(total_m, 0), air_m: r(air_m, 0), ground_m: r(ground_m, 0), ias50_kt: r(ias50_kt), vtd_kt: r(vtd_kt), sinkTD_fpm: r(sinkTD_fpm, 0) }))(landingTest(M, { maxBrake: true }));
  { const k = { Vapp: M.AC.Vapp, Vref: M.AC.Vref }; M.AC.Vapp = 63; M.AC.Vref = 63;
    const l = landingTest(M, { maxBrake: true }); out.landing.short63 = { total_m: r(l.total_m, 0), air_m: r(l.air_m, 0), ground_m: r(l.ground_m, 0), ias50_kt: r(l.ias50_kt), vtd_kt: r(l.vtd_kt), failed: !!l.failed };
    Object.assign(M.AC, k); }
  restore();
  return out;
}

if (isMainModule(import.meta.url)) {
  const o = await iterate();
  fs.writeFileSync(path.join(HERE, 'out', 'le_iter.json'), JSON.stringify(o, null, 1));
  const fp = path.join(HERE, 'out', 'le_legacy.json');
  try { const L = JSON.parse(fs.readFileSync(fp, 'utf8')); L.takeoff_VR_kcas = o.takeoffBest.VR; L.takeoff_theta_deg = o.takeoffBest.theta; fs.writeFileSync(fp, JSON.stringify(L, null, 1)); } catch (e) { console.log('no le_legacy.json yet:', e.message); }
  console.log('takeoff (best 5):'); o.takeoff.slice(0, 5).forEach(t => console.log(' ', JSON.stringify(t)));
  console.log('polar blend:'); o.polar.forEach(p => console.log(' ', JSON.stringify(p)));
  console.log('landing:', JSON.stringify(o.landing));
}
