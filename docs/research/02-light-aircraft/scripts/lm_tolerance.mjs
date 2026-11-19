#!/usr/bin/env node
// lm_tolerance.mjs — tolerance guidance for lateral-directional mode tests when the card's derivatives come from lm_derivs
// (01-methods.md §01.3.4, review 19 Nov 2026, gap 17). Node >= 18, no dependencies. Run from the repo root:
//   node scripts/lm_tolerance.mjs [--json]      -> scripts/out/lm_tolerance.json
// Method (ค่าประมาณ): lm_derivs was checked only against a high-wing C172-class aircraft (NASA TM-80163) and the low-wing
// Navion (TN D-6643), both single piston with a conventional tail. Its observed error e on each lateral derivative (out of
// lm_derivs.validate(), flight sets and reference columns) gives the ratio true/estimate = 1/(1+e). Inertia error comes from
// the single_prop leave-one-out of lm_inertia. For each test card the approach-condition Dutch roll, roll and spiral modes
// are recomputed in today's sim (lm_card.modes) at all 2^5 corners of {Cnb, Cnr, Clp, Izz, Ixx}; the spread of the mode
// values relative to the card's own value is the tolerance a test needs. For configurations outside the validation set
// (T-tail, twin, turboprop single) every half-range is widened by K_UNVALIDATED = 1.5 about its centre (author's choice).
import fs from 'node:fs';
import path from 'node:path';
import { HERE, loadType, isMainModule } from './lm_lib.mjs';
import { loadSim, buildAC, applyAC, cardInfo, modes } from './lm_card.mjs';
import { validate as derivValidate } from './lm_derivs.mjs';
import { leaveOneOut } from './lm_inertia.mjs';

export const K_UNVALIDATED = 1.5;
export const FACTORS = ['Cnb', 'Cnr', 'Clp', 'Izz', 'Ixx'];
export const CARDS = [
  { id: 'c172s', cls: 'validated', note: 'ปีกสูง หางธรรมดา ลูกสูบเครื่องเดียว (คลาสเดียวกับชุดตรวจ)' },
  { id: 'da40ng', cls: 'unvalidated', note: 'ปีกต่ำ หาง T' },
  { id: 'pc9m', cls: 'unvalidated', note: 'turboprop เครื่องเดียว ปีกต่ำ' },
];

/** observed error ranges (fraction) of lm_derivs per derivative and of the single_prop inertia LOO */
export function errorRanges() {
  const rows = derivValidate().filter(r => Number.isFinite(r.err_pct));
  const rng = n => { const e = rows.filter(r => r.name === n).map(r => r.err_pct / 100); return [Math.min(...e), Math.max(...e)]; };
  const loo = leaveOneOut().filter(r => r.cls === 'single_prop' && r.err_pct);
  const irng = k => { const e = loo.map(r => r.err_pct[k] / 100); return [Math.min(...e), Math.max(...e)]; };
  return { Cnb: rng('Cnb'), Cnr: rng('Cnr'), Clp: rng('Clp'), Izz: irng('Izz'), Ixx: irng('Ixx') };
}
/** true/estimate ratio interval from an error interval [e0, e1], optionally widened by k about its centre */
export function ratioRange([e0, e1], k = 1) {
  const c = (e0 + e1) / 2, h = (e1 - e0) / 2 * k, lo = c - h, hi = c + h;
  return [1 / (1 + hi), 1 / (1 + Math.max(lo, -0.9))];
}

export async function run() {
  const M = await loadSim(), E = errorRanges(), out = { K_UNVALIDATED, errors: E, cards: [] };
  for (const c of CARDS) {
    const card = loadType(c.id), ac0 = buildAC(card, {}), info = cardInfo(card, ac0);
    const cond = { ias: info.approach.ias, h: info.approach.h, flaps: 1, gear: 1, gammaDeg: info.approach.gammaDeg };
    const one = ac => { const restore = applyAC(M, ac); try { const m = modes(M, cond, { adot: true }); return { dr_wn: m.dr?.wn, dr_zeta: m.dr?.zeta, tauR: m.roll?.tau, spiral_t2: m.spiral ? (m.spiral.grows ? 1 : -1) * m.spiral.t2 : null }; } finally { restore(); } };
    const base = one(ac0);
    const res = {};
    for (const k of [1, K_UNVALIDATED]) {
      const R = Object.fromEntries(FACTORS.map(f => [f, ratioRange(E[f], k)]));
      const acc = { dr_wn: [], dr_zeta: [], tauR: [], spiral_t2: [] };
      for (let i = 0; i < 1 << FACTORS.length; i++) {
        const ac = { ...ac0 };
        FACTORS.forEach((f, j) => { ac[f] = ac0[f] * R[f][(i >> j) & 1]; });
        const m = one(ac);
        for (const q of Object.keys(acc)) if (Number.isFinite(m[q]) && Number.isFinite(base[q])) acc[q].push(q === 'spiral_t2' ? m[q] : m[q] / base[q]);
      }
      res[k === 1 ? 'validated' : 'unvalidated'] = Object.fromEntries(Object.entries(acc).map(([q, a]) => [q, a.length ? [Math.min(...a), Math.max(...a)] : null]));
    }
    out.cards.push({ id: c.id, cls: c.cls, note: c.note, cond, base, range: res });
  }
  return out;
}

if (isMainModule(import.meta.url)) {
  const r = await run();
  const s = JSON.stringify(r, (k, v) => (typeof v === 'number' ? +v.toPrecision(4) : v), 1);
  fs.writeFileSync(path.join(HERE, 'out', 'lm_tolerance.json'), s + '\n');
  if (process.argv.includes('--json')) console.log(s);
  else {
    const p = a => (a ? `${a[0].toFixed(2)}–${a[1].toFixed(2)}` : '–');
    console.log('error ranges (fraction):', JSON.stringify(r.errors, (k, v) => (typeof v === 'number' ? +v.toFixed(3) : v)));
    for (const c of r.cards) for (const [cls, x] of Object.entries(c.range))
      console.log(`${c.id.padEnd(7)} ${cls.padEnd(11)} DR wn ×${p(x.dr_wn)}  DR zeta ×${p(x.dr_zeta)}  tauR ×${p(x.tauR)}  spiral t2 (s, − = convergent) ${p(x.spiral_t2)}  [base wn ${c.base.dr_wn.toFixed(3)} z ${c.base.dr_zeta.toFixed(3)} tauR ${c.base.tauR?.toFixed(3)} t2 ${c.base.spiral_t2?.toFixed(1)}]`);
  }
}
