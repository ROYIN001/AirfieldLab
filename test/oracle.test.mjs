// JSBSim oracle (research round 1 §12.8, tests T-S-02, T-S-03 and the recorded T-S-01 / T-S-05 results; plan item B1).
// test/fixtures/jsbsim_trainer_doublet.json holds what JSBSim 1.3.3 flew with a model built from our own AC numbers
// (tools/jsbsim/, offline, Python). Here our model flies the same doublets from the same state, at the same field
// elevation, with the same numbers, so the α̇-free case (T-S-02) checks the equations of motion, axes, inertia and
// force summation, not the aero data, and the α̇ case (T-S-03) mostly checks our α̇ estimate in Aircraft.updateAir
// against JSBSim's α̇. Tuning AC does not need a new fixture; a change to the terms of Aircraft.deriv does (mirrored
// in tools/jsbsim/make_model.py, then python tools/jsbsim/run_cases.py; tools/jsbsim/README.md). Ground effect and the stall blend are inactive at 230–305 m and α ≈ 2°, so the
// oracle does not cover them; a separate test checks that Aircraft.step converges as RK4 does.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { M } from './harness.mjs';
import { AC_NOT_IN_DERIV, CASES, COLS, DT, T_END, acParams, approachIC, inertiaInverse, limits, runCase, maxAbsErr, startProblems } from './lib/oracle.mjs';

// the inverse inertia src/20-flight.js built, taken before any case swaps AC's numbers
const SRC = { Iinv: [...M.AC.Iinv], params: acParams(), elev: M.FIELD.elev };
const FX = JSON.parse(fs.readFileSync(new URL('./fixtures/jsbsim_trainer_doublet.json', import.meta.url), 'utf8')).jsbsim_trainer_doublet;
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(new URL('../' + p, import.meta.url))).digest('hex');
const fmt = (err) => Object.entries(err).map(([k, v]) => `${k} ${v.toPrecision(3)}`).join(', ');
// files whose change can move the comparison (INPUTS in tools/jsbsim/run_cases.py)
const INPUTS = ['src/10-atmo.js', 'src/15-geo.js', 'src/20-flight.js', 'test/harness.mjs', 'test/lib/oracle.mjs', 'tools/jsbsim/js_case.mjs', 'tools/jsbsim/make_model.py', 'tools/jsbsim/run_cases.py'];

test('oracle fixture: JSBSim 1.3.3, AB3 at 240 Hz, 25 s at 10 Hz, both cases, made from a committed tree', (t) => {
  const m = FX.meta;
  // what changed since the fixture was made: useful when a comparison below fails
  for (const [p, h] of Object.entries(m.inputs_sha256 || {})) if (fs.existsSync(new URL('../' + p, import.meta.url)) && sha(p) !== h) t.diagnostic(`${p} changed since the fixture was generated`);
  // the α̇ case flies every AC number as the fixture recorded it (its CLadot and Cmadot are AC's own unless tuned since)
  const fx = FX.cases.adot.params, diff = Object.keys(fx).filter((k) => k in SRC.params && SRC.params[k] !== fx[k]);
  if (diff.length) t.diagnostic(`AC differs from the fixture's numbers in ${diff.join(', ')} (the comparison flies the fixture's)`);
  if (SRC.elev !== FX.cases.noadot.ic.elev_m) t.diagnostic(`FIELD.elev is ${SRC.elev} m, the fixture flew at ${FX.cases.noadot.ic.elev_m} m (the comparison uses the fixture's)`);
  assert.equal(m.jsbsim, '1.3.3');
  assert.match(m.integrator, /^Adams-Bashforth 3/);
  assert.equal(m.dt_s, DT);
  assert.deepEqual(m.cols, COLS);
  assert.match(m.repo_commit, /^[0-9a-f]{40}$/, 'regenerate from a clean commit (tools/jsbsim/README.md)');
  assert.deepEqual(Object.keys(m.inputs_sha256 || {}).sort(), [...INPUTS].sort(), 'the fixture records the hashes of its inputs');
  assert.deepEqual(Object.keys(FX.cases).sort(), Object.keys(CASES).sort());
  for (const [name, c] of Object.entries(FX.cases)) {
    assert.equal(c.test, CASES[name].gen, `${name}: made as ${CASES[name].gen}`);
    assert.equal(c.rows.length, Math.round(T_END * 10) + 1, name);
    assert.ok(c.rows.every((r, i) => r.length === COLS.length && Math.abs(r[0] - i / 10) < 1e-6), `${name}: rows at 0, 0.1, … ${T_END} s`);
    assert.deepEqual(c.tol, CASES[name].tol, `${name}: tolerances as in test/lib/oracle.mjs`);
    assert.deepEqual(c.extra, CASES[name].extra, `${name}: extra limits as in test/lib/oracle.mjs`);
    for (const [k, v] of Object.entries(CASES[name].adot)) assert.equal(c.params[k], v, `${name}: ${k}`);
  }
});

test("the fixture's AC fields are the ones AC has now (a new field needs a new fixture or AC_NOT_IN_DERIV, a renamed one a new fixture)", () => {
  const fx = Object.keys(FX.cases.noadot.params), now = Object.keys(SRC.params);
  const added = now.filter((k) => !fx.includes(k) && !AC_NOT_IN_DERIV.includes(k)), gone = fx.filter((k) => !now.includes(k));
  assert.deepEqual(added, [], 'numeric AC fields the fixture lacks: mirror the term in tools/jsbsim/make_model.py and regenerate, or list the field in AC_NOT_IN_DERIV');
  assert.deepEqual(gone, [], 'fixture fields AC no longer has (renamed?): regenerate the fixture');
});

test('AC.Iinv in src/20-flight.js inverts the inertia tensor, as the oracle builds it for the fixture numbers', () => {
  const { Ixx, Iyy, Izz, Ixz } = SRC.params, I = [Ixx, 0, -Ixz, 0, Iyy, 0, -Ixz, 0, Izz], A = SRC.Iinv;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const v = A[3 * i] * I[j] + A[3 * i + 1] * I[3 + j] + A[3 * i + 2] * I[6 + j];
    assert.ok(Math.abs(v - (i === j ? 1 : 0)) < 1e-12, `AC.Iinv × I [${i}][${j}] = ${v}`);
  }
  // the copy the oracle flies (withParams) agrees with src to rounding
  const B = inertiaInverse(SRC.params);
  assert.equal(A.length, B.length);
  A.forEach((a, k) => assert.ok(Math.abs(a - B[k]) <= 1e-12 * Math.max(Math.abs(a), Math.abs(B[k])), `test/lib/oracle.mjs inertiaInverse and src/20-flight.js agree: [${k}] ${a} vs ${B[k]}`));
});

test('T-S-05 the JSBSim install that made the fixture flew its own c172x as the research measured', () => {
  const e = FX.env_check;
  assert.equal(e.model, 'c172x');
  assert.equal(e.pass, true);
  for (const [k, [v, tol]] of Object.entries(e.expect)) assert.ok(Math.abs(e.got[k] - v) <= tol, `${k} ${e.got[k]} (${v} ± ${tol})`);
  assert.deepEqual(e.expect, { vc_kts: [100, 0.1], alpha_deg: [0.796, 0.05], elevator_deg: [5.14, 0.1], throttle: [0.769, 0.01], dh_ft_10s: [0, 1] });
});

for (const [name, C] of Object.entries(CASES)) {
  const lim = limits(name), what = C.adot.CLadot || C.adot.Cmadot ? `α̇ (CLadot ${C.adot.CLadot}, Cmadot ${C.adot.Cmadot})` : 'α̇-free';
  test(`${C.test} our model flies the ${what} doublets as JSBSim did: ${Object.entries(CASES[name].tol).map(([k, v]) => `${k} ${v}`).join(', ')} (research), ${Object.entries(CASES[name].extra).map(([k, v]) => `${k} ${v}`).join(', ')} (added)`, (t) => {
    const c = FX.cases[name], rows = runCase({ params: c.params, ic: c.ic }), err = maxAbsErr(rows, c.rows);
    t.diagnostic(`max |ours − JSBSim|: ${fmt(err)}`);
    for (const [k, tol] of Object.entries(lim)) assert.ok(err[k] <= tol, `${k}: ${err[k].toPrecision(3)} > ${tol} (${fmt(err)})`);
    // the comparison is not loose: the error it allows is a small part of what the doublets move
    const span = (k) => { const i = COLS.indexOf(k), v = c.rows.map((r) => r[i]); return Math.max(...v) - Math.min(...v); };
    for (const k of ['theta_deg', 'phi_deg', 'q_dps']) if (k in lim) assert.ok(lim[k] < span(k) / 20, `${k} tolerance ${lim[k]} vs span ${span(k).toFixed(2)}`);
  });
}

test('T-S-01 at generation: JSBSim and our model agreed within the research tolerances and the added limits', () => {
  for (const [name, c] of Object.entries(FX.cases))
    for (const [k, tol] of Object.entries(limits(name))) assert.ok(c.max_abs_err_at_generation[k] <= tol, `${name} ${k} ${c.max_abs_err_at_generation[k]}`);
});

// The comparison with JSBSim cannot see our integrator: RK4 at 240 Hz is within about 1e-8 of the exact solution
// here, against tolerances of 0.05. So check its order directly: the α̇-free case flown at 240 Hz and with each step
// split in four (960 Hz, same controls) must agree to 1e-6 in every column. Measured on 2026-11-26: RK4 1.2e-8 at
// most (p), RK3 3e-6, a midpoint step 6e-4, forward Euler 0.09. The α̇ case is left out: its α̇ filter depends on dt.
const CONV = 1e-6;
const convErr = () => { const c = FX.cases.noadot, run = { params: c.params, ic: c.ic }; return maxAbsErr(runCase(run), runCase(run, 4)); };
test('Aircraft.step converges as RK4 does: the α̇-free case at 240 Hz and at 960 Hz agrees to 1e-6 (a midpoint step fails)', (t) => {
  const err = convErr();
  t.diagnostic(`max |240 Hz − 960 Hz|: ${fmt(err)}`);
  for (const [k, v] of Object.entries(err)) assert.ok(v < CONV, `${k}: ${v.toExponential(2)} (Aircraft.step converges more slowly than RK4)`);
  // control: the real step's side effects (wind, actuators, clock), then a second-order midpoint update of the state
  const P = M.Aircraft.prototype, rk4 = P.step;
  P.step = function midpoint(dt) {
    const x0 = Float64Array.from(this.x), f = new Float64Array(13), mid = new Float64Array(13);
    rk4.call(this, dt);
    this.deriv(x0, f);
    for (let i = 0; i < 13; i++) mid[i] = x0[i] + 0.5 * dt * f[i];
    this.deriv(mid, f);
    for (let i = 0; i < 13; i++) this.x[i] = x0[i] + dt * f[i];
    this.updateAir(0);
  };
  let ctl;
  try { ctl = convErr(); } finally { P.step = rk4; }
  t.diagnostic(`midpoint control: ${fmt(ctl)}`);
  assert.ok(Object.values(ctl).some((v) => v >= CONV), 'a midpoint step passes the check');
});

test('the oracle catches what it is there for: an Ixz sign, thrust 2 % high, no Cmadot, CLadot 10 times too large', () => {
  const c = FX.cases.noadot, a = FX.cases.adot;
  const fails = (ref, params) => { const err = maxAbsErr(runCase({ params, ic: ref.ic }), ref.rows); return Object.entries({ ...ref.tol, ...ref.extra }).some(([k, tol]) => err[k] > tol); };
  assert.ok(fails(c, { ...c.params, Ixz: -c.params.Ixz }), 'Ixz with the wrong sign passes');
  assert.ok(fails(c, { ...c.params, T0: c.params.T0 * 1.02 }), 'thrust 2 % high passes');
  assert.ok(fails(a, { ...a.params, Cmadot: 0 }), 'the α̇ case passes without Cmadot');
  // this doublet resolves CLadot only to an order of magnitude: 0 or 2 times its value pass, 10 times fails
  assert.ok(fails(a, { ...a.params, CLadot: 10 * a.params.CLadot }), 'the α̇ case passes with CLadot 10 times too large');
  // and after all these runs, AC and FIELD are as src/20-flight.js left them
  assert.deepEqual(acParams(), SRC.params); assert.deepEqual(M.AC.Iinv, SRC.Iinv); assert.equal(M.FIELD.elev, SRC.elev);
});

test("the fixture's start is the trimmed approach of research §12.8: 95 KIAS, flaps 1, gear down, 5,500 m before 21R", (t) => {
  // the same check run_cases.py --check makes (startProblems in test/lib/oracle.mjs)
  for (const [name, c] of Object.entries(FX.cases)) assert.deepEqual(startProblems(c.ic), [], `${name}: the recorded start`);
  // today's setApproach against the recorded start (a retrim such as plan item B2 moves it; the comparison above
  // starts from the recorded state, so it does not depend on this)
  const now = approachIC(FX.cases.noadot.params), d = Math.max(...now.x.map((v, i) => Math.abs(v - FX.cases.noadot.ic.x[i])));
  if (d > 1e-9) t.diagnostic(`setApproach now starts ${d.toExponential(2)} away from the recorded state`);
});

// Research round 1 task list item 8 (AC moves to data/aircraft/trainer.json) asks that T-S-01/T-S-02 pass before and
// after the move, unchanged. T-S-02 flies the fixture's numbers, so run this check too: ORACLE_AC_FROZEN=1.
test('AC still holds the numbers the fixture was flown with (ORACLE_AC_FROZEN=1, for a move of AC that must change nothing)', { skip: !process.env.ORACLE_AC_FROZEN && 'set ORACLE_AC_FROZEN=1 to run' }, () => {
  // the α̇ case flew AC's own numbers (its CLadot 1.6 and Cmadot −4.5 are AC's too); the α̇-free case zeroes those two.
  // Fields in AC_NOT_IN_DERIV came after the fixture (the test above allows only those as extras)
  const fx = FX.cases.adot.params;
  assert.deepEqual(Object.fromEntries(Object.keys(SRC.params).filter((k) => !AC_NOT_IN_DERIV.includes(k)).map((k) => [k, SRC.params[k]])), fx);
  assert.equal(M.FIELD.elev, FX.cases.noadot.ic.elev_m);
});
