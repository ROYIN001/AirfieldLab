// lc_cardfix.mjs — shared post-processing for the C172-family card generators (lc_json, le_json, lf_json), added for the
// completeness review of 19 Nov 2026 (gaps 16, 18, 20; decision D4). Pure functions; data paths are relative to this folder.
//   normaliseScopes(card)        D4: scope by category through lm_lib.expectedScope (same rule as lm_lib.validate)
//   testsLeaf(rows, opts)        gap 16: performance.tests leaf with the same rows as the markdown test table
//   stickForceBand(opts)         gap 18: MIL-F-8785C Level 1 wheel Fs/g band from the card's n/α, plus the 14 CFR 23.155 floor
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultR1Paths, expectedScope, isLeaf } from './lm_lib.mjs';

export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const LBF = 4.4482216;

/** Set every per-type leaf's scope to lm_lib.expectedScope(path) (gear → gear, piston/engine → engine, propeller →
 *  propeller, airframe/aero/speeds/performance/controls/validation/ops/procedures → aircraft, other categories as round 1).
 *  Returns the list of changes. */
export function normaliseScopes(card) {
  const p = defaultR1Paths().find(x => fs.existsSync(x));
  const r1 = p ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
  if (!r1) console.warn('lc_cardfix: r1-pertype-paths.json not found; only the category rule of lm_lib.SCOPE_BY_CAT is applied');
  const changed = [];
  (function rec(o, pa) {
    if (isLeaf(o)) {
      const ps = pa.join('.'), e = expectedScope(ps, r1);
      if (e && o.scope !== e) { changed.push(`${ps}: ${o.scope} → ${e}`); o.scope = e; }
      return;
    }
    if (o && typeof o === 'object' && !Array.isArray(o)) for (const k of Object.keys(o)) rec(o[k], [...pa, k]);
  })(card, []);
  return changed;
}

/** Read a test-script output (scripts/out/<name>.json) if it exists. */
export function readOut(name) {
  const p = path.join(HERE, 'out', name);
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
}

/** performance.tests leaf (schema-ext-r2 §5: {case, conditions, quantity, expected, tolerance}) from the rows of an
 *  lc/le/lf test script. Row keys differ between the scripts (id/cond/qty/expected/tol/current or exp/cur), so both are read. */
export function testsLeaf(rows, { src, note, conf = 'กลาง' }) {
  const v = rows.map(t => ({
    case: t.id, conditions: t.cond, quantity: t.qty,
    expected: t.expected ?? t.exp, tolerance: t.tol, unit: t.unit ?? null, origin: t.origin,
    current_model: t.current ?? t.cur, pass: t.pass ?? null,
  }));
  return { v, u: 'ตามช่อง unit ของแต่ละแถว', scope: 'aircraft', src, conf, est: false, note };
}

/** Stick force per g targets for a wheel (yoke) aircraft.
 *  MIL-F-8785C Level 1, wheel controller (round-1 leaf controls.requirements.mil8785c_fs_per_g_wheel_L1 [R1:C12]):
 *  max = min(500/(n/α), 120) but not less than 120/(nL − 1); min = max(35/(nL − 1), 6)   (lbf/g)
 *  14 CFR 23.155 (round-1 controls.requirements.part23_maneuver_force_min): force to reach nL ≥ max(W/100, 20) lbf
 *  (need not exceed 50 lbf), i.e. a gradient floor of that force / (nL − 1). */
export function stickForceBand({ nAlpha, nL, W_lb }) {
  const dn = nL - 1;
  const milMax = Math.max(Math.min(500 / nAlpha, 120), 120 / dn), milMin = Math.max(35 / dn, 6);
  const p23Force = Math.min(Math.max(W_lb / 100, 20), 50), p23Min = p23Force / dn;
  const lo = Math.max(milMin, p23Min), hi = milMax;
  const r = (x, n = 1) => +x.toFixed(n);
  return {
    fs_per_g_lbf: { min: r(lo), max: r(hi) }, fs_per_g_N: { min: r(lo * LBF, 0), max: r(hi * LBF, 0) },
    nAlpha_cruise_g_per_rad: r(nAlpha, 2), nL, mil_L1_wheel_lbf: { min: r(milMin), max: r(milMax) },
    part23_155_force_lbf: r(p23Force), part23_155_min_gradient_lbf: r(p23Min),
    fs_per_kt_min_lbf: 0.167, fs_per_kt_min_N: r(0.167 * LBF, 2),
  };
}
