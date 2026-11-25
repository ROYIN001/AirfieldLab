// Dynamic modes of the current model, locked before any physics change (owner's research round 1,
// docs/research/01-flight-physics/10-validation.md §10.9, tests T-V-01 … T-V-06): MIL-F-8785C Class I Level 1
// limits, then a regression lock on every mode value at both conditions so an unintended change shows up.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { M } from './harness.mjs';
import { f9, trim, linearise, coupling, modes, within, levelOf, APPROACH, CRUISE } from './lib/fstd.mjs';
const { Aircraft, Flight, SCENARIOS } = M;
const fmt = (v, d = 3) => (Number.isFinite(v) ? v.toFixed(d) : String(v));

const app = (() => { const ac = new Aircraft(), T = trim(ac, APPROACH); return { ac, T, m: modes(ac, T) }; })();
const cru = (() => { const ac = new Aircraft(), T = trim(ac, CRUISE); return { ac, T, m: modes(ac, T) }; })();

test('T-V-01: trim balances and the longitudinal and lateral blocks are uncoupled', () => {
  for (const [name, c] of [['approach', app], ['cruise', cru]]) {
    const f = f9(c.ac, c.T.y0, c.T.h);
    const worst = Math.max(Math.abs(f[0]), Math.abs(f[2]), Math.abs(f[4]));
    assert.ok(worst < 1e-9, `${name}: max |u̇, ẇ, q̇| ${worst.toExponential(2)}`);
    assert.ok(coupling(linearise(c.ac, c.T)) < 1e-9, `${name}: coupling ${c.m.coupling.toExponential(2)}`);
  }
  // the approach trim the app starts from (setApproach; Newton since plan B2, closed-form before)
  const fl = new Flight({ wind: SCENARIOS.calm, dist: 5500 }), d = new Float64Array(13);
  fl.ac.deriv(fl.ac.x, d);
  const aNED = Math.hypot(d[3], d[4], d[5]), wdot = Math.hypot(d[10], d[11], d[12]);
  assert.ok(aNED < 0.05 && wdot < 1e-6, `setApproach: |a_NED| ${fmt(aNED, 4)} m/s², |ω̇| ${wdot.toExponential(2)} rad/s²`);
});

test('T-V-02: short period at approach, Category C Level 1 (and regression ωsp 2.22 ± 0.11 rad/s)', () => {
  const { sp, cap } = app.m;
  assert.ok(within(sp.zeta, 0.35, 1.30), `ζsp ${fmt(sp.zeta)}`);
  assert.ok(cap >= 0.16, `CAP ${fmt(cap)}`);
  assert.ok(within(sp.wn, 2.22 - 0.11, 2.22 + 0.11), `ωsp ${fmt(sp.wn)} rad/s`);
  assert.equal(levelOf(sp.zeta, [[0.35, 1.30], [0.25, 2.00], [0.15, Infinity]]), 1);
});

test('T-V-03: phugoid damping ζ ≥ 0.04 at approach and cruise', () => {
  assert.ok(app.m.ph.zeta >= 0.04, `approach ζp ${fmt(app.m.ph.zeta)}${app.m.ph.reals ? ' real roots ' + app.m.ph.reals.map((v) => fmt(v, 4)) : ''}`);
  assert.ok(cru.m.ph.zeta >= 0.04, `cruise ζp ${fmt(cru.m.ph.zeta)}${cru.m.ph.reals ? ' real roots ' + cru.m.ph.reals.map((v) => fmt(v, 4)) : ''}`);
  // regression on the research's values (0.115 / 0.073)
  assert.ok(within(app.m.ph.zeta, 0.115 - 0.02, 0.115 + 0.02), `approach ζp ${fmt(app.m.ph.zeta)} vs 0.115`);
  assert.ok(within(cru.m.ph.zeta, 0.073 - 0.02, 0.073 + 0.02), `cruise ζp ${fmt(cru.m.ph.zeta)} vs 0.073`);
});

test('T-V-04: Dutch roll ζ ≥ 0.08, ζωn ≥ 0.15; ωn ≥ 1.0 (approach, Cat C) and ≥ 0.4 rad/s (cruise, Cat B)', () => {
  for (const [name, c, wmin] of [['approach', app, 1.0], ['cruise', cru, 0.4]]) {
    const { dr } = c.m;
    assert.ok(dr.zeta >= 0.08 && dr.zeta * dr.wn >= 0.15 && dr.wn >= wmin, `${name}: ζ ${fmt(dr.zeta)}, ζωn ${fmt(dr.zeta * dr.wn)}, ωn ${fmt(dr.wn)}`);
  }
});

test('T-V-05: roll mode τR ≤ 1.0 s at approach', () => {
  assert.ok(app.m.roll.tau > 0 && app.m.roll.tau <= 1.0, `τR ${fmt(app.m.roll.tau)} s`);
});

test('T-V-06: spiral stable, or doubling time ≥ 12 s, at approach and cruise', () => {
  for (const [name, c] of [['approach', app], ['cruise', cru]]) {
    const s = c.m.spiral;
    assert.ok(s.re <= 0 || s.t2 >= 12, `${name}: λs ${fmt(s.re, 4)} 1/s`);
  }
});

// Regression lock (research §10.7, second tier): every mode value at both conditions, as measured on 2026-11-19 (the
// same numbers as the research's §10.1 table). ±5 % on frequencies, damping ratios, CAP and τR; the spiral root keeps
// its sign and stays within ±25 %. An intended physics change updates REF in the same PR.
const REF = {
  approach: { wsp: 2.2207, zsp: 0.5779, cap: 0.9507, wph: 0.2477, zph: 0.1151, wdr: 1.6114, zdr: 0.1395, tauR: 0.2180, ls: -0.01916 },
  cruise: { wsp: 3.5929, zsp: 0.5597, cap: 0.9348, wph: 0.1483, zph: 0.0730, wdr: 2.5246, zdr: 0.1449, tauR: 0.1383, ls: -0.00800 },
};
test('regression lock: every mode value within ±5 % (spiral ±25 %, same sign) of the measured reference', () => {
  for (const [name, c] of [['approach', app], ['cruise', cru]]) {
    const m = c.m, r = REF[name];
    const got = { wsp: m.sp.wn, zsp: m.sp.zeta, cap: m.cap, wph: m.ph.wn, zph: m.ph.zeta, wdr: m.dr.wn, zdr: m.dr.zeta, tauR: m.roll.tau };
    for (const [k, v] of Object.entries(got)) assert.ok(Math.abs(v / r[k] - 1) <= 0.05, `${name} ${k}: ${fmt(v, 4)} vs ${r[k]} (±5 %)`);
    assert.ok(Math.sign(m.spiral.re) === Math.sign(r.ls) && Math.abs(m.spiral.re / r.ls - 1) <= 0.25, `${name} spiral λ ${fmt(m.spiral.re, 5)} vs ${r.ls} (±25 %)`);
  }
});

test('modes summary (printed for the log)', () => {
  for (const [name, c] of [['approach', app], ['cruise', cru]]) {
    const m = c.m;
    console.log(`${name}: trim α ${fmt(c.T.alpha * 57.29578, 2)}° δe ${fmt(c.T.de * 57.29578, 2)}° thr ${fmt(c.T.thr)}; short period ωn ${fmt(m.sp.wn)} ζ ${fmt(m.sp.zeta)} CAP ${fmt(m.cap)}; phugoid ωn ${fmt(m.ph.wn)} ζ ${fmt(m.ph.zeta)}; Dutch roll ωn ${fmt(m.dr.wn)} ζ ${fmt(m.dr.zeta)}; roll τ ${fmt(m.roll.tau)} s; spiral λ ${fmt(m.spiral.re, 4)}`);
  }
});
