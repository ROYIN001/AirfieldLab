#!/usr/bin/env node
// lg_iter.mjs — iterate the ESTIMATED tail geometry of the p2006t card against published derivatives, then check the
// linear modes of the current sim against the flight-test modes of [LG7]. Writes scripts/out/lg_iter.json.
//   step 1: S_h (est) so that lm_derivs Cmde (cruise 110 kt) = −1.811 /rad (flight) ≈ −1.830 (wind tunnel)
//   step 2: S_v (est) so that lm_derivs Cnb (cruise) = 0.050 /rad (wind tunnel [LG7]; semi-empirical 0.096, flight PE 0.0135)
//   step 3: modes of the sim at 110 kt / 3,000 ft with the card as built (lm_card), versus SP 3.41/0.40, DR 2.00/0.26, phugoid 0.234/0.09
// Run from the repo root: node <this folder>/lg_iter.mjs [--modes]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadType, isMainModule, val } from './lm_lib.mjs';
import { geoFromCard, estimate } from './lm_derivs.mjs';
import { buildAC, applyAC, loadSim, modes, cardInfo } from './lm_card.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const KT = 0.514444, G0 = 9.80665;
const r = (x, n = 4) => +(+x).toPrecision(n);

function derivsAt(geo, card, Vkt) {
  const m = val(card, 'airframe.weights.training_mass'), V = Vkt * KT, CL = 2 * m * G0 / (1.225 * geo.S * V * V);
  return estimate(geo, { CL, M: V / 340, alpha: (CL - 0.25) / 5 });
}
function solve(fn, lo, hi, target, n = 40) { // monotone bisection
  const flo = fn(lo) - target; for (let k = 0; k < n; k++) { const m = 0.5 * (lo + hi), f = fn(m) - target; if (Math.sign(f) === Math.sign(flo)) lo = m; else hi = m; } return 0.5 * (lo + hi);
}

export async function run({ withModes = true } = {}) {
  const card = loadType('p2006t');
  const geo0 = geoFromCard(card, []);
  const out = { start: { S_h: geo0.tail.S_h, S_v: geo0.tail.S_v } };
  const withTail = (dh = {}) => ({ ...geo0, tail: { ...geo0.tail, ...dh }, surf: geo0.surf });
  const Sh = solve(s => derivsAt(withTail({ S_h: s }), card, 110).body.Cmde, 1.5, 4.0, -1.811);
  const Sv = solve(s => derivsAt(withTail({ S_h: Sh, S_v: s }), card, 110).body.Cnb, 1.0, 3.5, 0.050);
  out.tail = { S_h: r(Sh, 3), S_v: r(Sv, 3) };
  const dC = derivsAt(withTail(out.tail), card, 110), dA = derivsAt(withTail(out.tail), card, 70);
  out.check = { Cmde: r(dC.body.Cmde), Cnb: r(dC.body.Cnb), Cmq: r(dC.body.Cmq), Cma: r(dC.static.Cmalpha), h_n: r(dC.static.h_n, 3), CLalpha: r(dC.static.CLalpha), deda: r(dC.static.deda, 3) };
  out.deriv = {};
  for (const n of ['CLq', 'CLadot', 'CLde', 'CYb', 'CYdr', 'CYr', 'Clb', 'Clp', 'Clr', 'Clda', 'Cldr', 'Cmadot', 'Cnb', 'Cnp', 'Cnr', 'Cnda', 'Cndr'])
    out.deriv[n] = { cruise: r(dC.body[n]), approach: r(dA.body[n]), why: `หาง S_h ${out.tail.S_h} m² (Cmde −1.811) และ S_v ${out.tail.S_v} m² (Cnb 0.050 ของอุโมงค์ลม)` };
  if (withModes) {
    const M = await loadSim(), ac = buildAC(card, {});
    applyAC(M, ac);
    const cr = modes(M, { ias: 110, h: 3000 * 0.3048, flaps: 0, gear: 0, gammaDeg: 0 }, { adot: true });
    const pick = o => (o && o.wn ? { wn: r(o.wn), zeta: r(o.zeta), T: o.T ? r(o.T) : undefined } : null);
    out.modes_110kt = { sp: pick(cr.sp), ph: pick(cr.ph), dr: pick(cr.dr), roll_tau: cr.roll?.tau ? r(cr.roll.tau) : null, spiral_t2: cr.spiral?.t2 ? r(cr.spiral.t2) : null, CAP: cr.CAP ? r(cr.CAP) : null,
      Iyy: r(ac.Iyy), Izz: r(ac.Izz), Ixx: r(ac.Ixx), m: ac.m };
    out.ref_110kt = { sp: { wn: 3.41, zeta: 0.40 }, ph: { wn: 0.234, zeta: 0.09 }, dr: { wn: 2.00, zeta: 0.26 } };
    // inertia needed to match the flight frequencies at fixed derivatives (ωn ∝ 1/√I)
    if (out.modes_110kt.sp && out.modes_110kt.dr) out.inertia_to_match = { Iyy: r(ac.Iyy * (out.modes_110kt.sp.wn / 3.41) ** 2), Izz: r(ac.Izz * (out.modes_110kt.dr.wn / 2.00) ** 2) };
  }
  return out;
}

if (isMainModule(import.meta.url)) {
  const out = await run({ withModes: process.argv.includes('--modes') });
  const prev = (() => { try { return JSON.parse(fs.readFileSync(path.join(HERE, 'out', 'lg_iter.json'), 'utf8')); } catch { return {}; } })();
  const merged = { ...prev, ...out };
  fs.writeFileSync(path.join(HERE, 'out', 'lg_iter.json'), JSON.stringify(merged, null, 1));
  console.log(JSON.stringify(out, null, 1));
}
