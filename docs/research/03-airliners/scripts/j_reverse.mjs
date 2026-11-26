// j_reverse.mjs — reverser state machine timing and reverse force per type (topic 3.6).
// Force model = round 1 section 5.7: Frev = F00*(c0 + c1*M)*[rho_i + (1-rho_i)*phi], c0 0.30, c1 1.0, rho_i 0.10 (all est).
// Deploy/stow times and indication thresholds: est (REV amber 10 %, green 90 % from 737NG operator notes).
import { isa, ENG, fmt, KT } from './j_lib.mjs';
const c0 = 0.30, c1 = 1.0, rhoI = 0.10, uMax = 0.70, phiMax = rhoI + (1 - rhoI) * uMax; // phi = uMax at max reverse (spool settles at u)
const TYPES = [ // [type, engine class, nEng, landing mass kg (MLW from type cards, rounded), cancel kt, deploy s, stow s]
  ['b737_800', 'CFM56_7B26_class', 2, 66360, 60, 2.0, 2.5],
  ['a320ceo', 'CFM56_5B6_class', 2, 64500, 70, 2.0, 2.5],
  ['a320neo', 'LEAP_1A26_class', 2, 67400, 70, 2.0, 2.5],
  ['a321neo', 'LEAP_1A32_class', 2, 79200, 70, 2.0, 2.5],
  ['a330_300', 'TRENT_772B_class', 2, 187000, 70, 2.5, 3.0],
];
const amb = isa(0, 20);                  // VTBD-like 35 C
for (const [t, k, n, m, vc, tdep] of TYPES) {
  const E = ENG[k], row = [];
  for (const kt of [130, 100, vc]) {
    const M = kt * KT / amb.a, Fmax = E.F00 * (c0 + c1 * M) * phiMax, Fidle = E.F00 * (c0 + c1 * M) * rhoI;
    row.push(`${kt} kt: max ${fmt(n * Fmax / 1000, 1)} kN (${fmt(n * Fmax / (m * 9.80665), 3)} g), idle ${fmt(n * Fidle / 1000, 1)} kN`);
  }
  console.log(`${t} (${k}, m ${m} kg): ` + row.join(' | ') + ` | REV green at ${fmt(0.9 * tdep, 2)} s, amber at ${fmt(0.1 * tdep, 2)} s`);
}
// state machine check: command at t=0 (on ground, levers idle), V = 130 kt decelerating 2 m/s^2; report when power allowed and when cancelled
function sm(tdep, tstow, vCancelKt) {
  let s = 0, V = 130 * KT, t = 0, tGreen = null, tCancel = null; const dt = 1 / 240;
  while (V > 20 * KT) { s = Math.min(1, s + dt / tdep); const power = s >= 0.9 && V > vCancelKt * KT;
    if (power && tGreen === null) tGreen = t; if (!power && tGreen !== null && tCancel === null) tCancel = t;
    V -= 2.0 * dt; t += dt; }
  return { tGreen, tCancel, stowAfterCancel: tstow };
}
for (const [lbl, vc] of [['737 (60 kt)', 60], ['Airbus (70 kt)', 70]]) { const r = sm(2.0, 2.5, vc); console.log(`${lbl}: power allowed at ${fmt(r.tGreen, 3)} s, back to reverse idle at ${fmt(r.tCancel, 2)} s (V0 130 kt, decel 2.0 m/s^2)`); }
// ratio max-reverse force at 130 kt vs 60 kt
const M130 = 130 * KT / amb.a, M60 = 60 * KT / amb.a;
console.log(`ratio Frev(130 kt)/Frev(60 kt) = ${fmt((c0 + c1 * M130) / (c0 + c1 * M60), 3)}; Frev/F00 max at 130 kt ${fmt((c0 + c1 * M130) * phiMax, 3)}, at 60 kt ${fmt((c0 + c1 * M60) * phiMax, 3)}; phiMax ${phiMax}`);
