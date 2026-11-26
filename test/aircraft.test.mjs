// Aircraft data files (plan B3; research round 1 task list item 8, 01-flight-physics/12-other-sims.md §12.14 task 3 and
// 05-turbofan.md task 1): the trainer's numbers live in data/aircraft/trainer.json and setAircraft (src/20-flight.js)
// loads them into AC. T-S-07 (table lookup clamped at the ends), T-S-12 (schema of every data/aircraft/*.json), the card
// reader acFromCard and setAircraft, T-S-10 (CPU per step), T-F-15 (engineLoads against the engine-out Vmc numbers of
// 05-turbofan.md §5.8), the wiring of AC.engines into Aircraft.deriv, and the page's loading of the card (loadData of
// src/48-data.js, its failure path included). That the move changed nothing is checked by the
// tests that were there before it (flight, runways, modes, … unchanged) and by ORACLE_AC_FROZEN=1 test/oracle.test.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { M, AIRCRAFT_CARD } from './harness.mjs';
const { AC, Aircraft, Flight, SCENARIOS, DEG, KT, setAircraft, acFromCard, table1, table2, inertiaInverse, engineLoads } = M;

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DIR = path.join(ROOT, 'data', 'aircraft');
const CARD = JSON.parse(fs.readFileSync(AIRCRAFT_CARD, 'utf8'));
const card = () => structuredClone(CARD);
const isLeaf = (o) => o !== null && typeof o === 'object' && !Array.isArray(o) && 'v' in o && 'u' in o;

// T-S-10 first: the tests below that change AC run after it (research 12-other-sims.md §12.11 and its script
// s12_current_misc.mjs: the trimmed approach from 9 km, still above 200 m after the 26,000 steps; budget 20 µs per step
// so that 240 Hz takes under 0.5 % of a CPU)
test('T-S-10 Aircraft.step costs at most 20 µs at 240 Hz from the trimmed approach (2,000 steps warm-up, 24,000 timed)', (t) => {
  const ac = new Aircraft();
  ac.setApproach({ dist: 9000 });
  for (let i = 0; i < 2000; i++) ac.step(1 / 240);
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < 24000; i++) ac.step(1 / 240);
  const us = Number(process.hrtime.bigint() - t0) / 1e3 / 24000;
  t.diagnostic(`${us.toFixed(2)} µs per step`);
  assert.ok(us <= 20, `${us.toFixed(2)} µs per step`);
  assert.ok(ac.air.h > 100 && Number.isFinite(ac.air.V), 'still flying');
});

test('T-S-07 table1 and table2: linear inside, clamped at the ends (no extrapolation), as s12_table_expected.mjs', () => {
  const X = [0, 10, 20], Y = [0, 1, 4], R = [0, 1], C = [0, 10], D = [[0, 1], [2, 3]];
  const t1 = [-5, 5, 15, 25].map((x) => table1(X, Y, x)), t2 = [table2(R, C, D, 0.5, 5), table2(R, C, D, 2, 20), table2(R, C, D, -1, -3)];
  [0, 0.5, 2.5, 4].forEach((v, i) => assert.ok(Math.abs(t1[i] - v) <= 1e-12, `table1 at ${[-5, 5, 15, 25][i]}: ${t1[i]}`));
  [1.5, 3, 0].forEach((v, i) => assert.ok(Math.abs(t2[i] - v) <= 1e-12, `table2 case ${i}: ${t2[i]}`));
  // the research script's own functions give the same numbers, bit for bit
  const script = path.join(ROOT, 'docs/research/01-flight-physics/scripts/s12/s12_table_expected.mjs');
  const ref = JSON.parse(execFileSync(process.execPath, [script], { encoding: 'utf8' }));
  assert.deepEqual({ t1, t2 }, ref);
  // the points themselves, and a table of one point
  X.forEach((x, i) => assert.equal(table1(X, Y, x), Y[i]));
  assert.equal(table1([3], [7], -1), 7); assert.equal(table1([3], [7], 9), 7);
  assert.equal(table2(R, C, D, 1, 10), 3); assert.equal(table2(R, C, D, 0, 0), 0);
});

// T-S-12 (12-other-sims.md §12.11) and the owner's rules: every number has its sources (listed with a link in _meta)
// and a confidence, an estimate says ค่าประมาณ, the file states its source and licence
const SCOPES = new Set(['aircraft', 'engine', 'propeller', 'gear', 'environment', 'sim']);
const CONF = new Set(['สูง', 'กลาง', 'ต่ำ']);
const FIELDS = ['v', 'u', 'scope', 'src', 'conf', 'est', 'note'];
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();
test(`T-S-12 every data/aircraft/*.json (${files.join(', ')}): leaves {v, u, scope, src, conf, est, note}, sources listed, licence stated`, () => {
  assert.ok(files.includes('trainer.json'), files.join());
  for (const f of files) {
    const doc = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')), meta = doc._meta;
    assert.ok(meta && meta.id === f.replace(/\.json$/, ''), `${f}: _meta.id names the file`);
    for (const k of ['source', 'license', 'note']) assert.ok(typeof meta[k] === 'string' && meta[k].trim(), `${f}: _meta.${k}`);
    assert.ok(meta.note.includes('ค่าประมาณ'), `${f}: _meta.note says what is estimated (ค่าประมาณ)`);
    const sources = meta.sources || {}, used = new Set(), leaves = [];
    for (const [code, s] of Object.entries(sources)) {
      assert.ok(typeof s.what === 'string' && s.what.trim() && typeof s.link === 'string' && s.link.trim(), `${f}: _meta.sources.${code} needs what and link`);
      // a link is a web address or a file of the repository (the research report that defines the code)
      if (!/^https:\/\//.test(s.link)) assert.ok(fs.existsSync(path.join(ROOT, s.link)), `${f}: _meta.sources.${code}.link ${s.link} is not a repo file`);
    }
    (function walk(o, p) {
      for (const [k, v] of Object.entries(o)) {
        const at = p ? `${p}.${k}` : k;
        if (at === '_meta') continue;
        if (isLeaf(v)) leaves.push([at, v]);
        else if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, at);
        else assert.fail(`${f}: ${at} is neither a branch nor a leaf {v, u, …}`);
      }
    })(doc, '');
    assert.ok(leaves.length >= 40, `${f}: ${leaves.length} leaves`);
    for (const [at, l] of leaves) {
      const w = `${f}: ${at}`;
      assert.deepEqual(Object.keys(l).filter((k) => !FIELDS.includes(k)), [], `${w}: fields outside {${FIELDS.join(', ')}}`);
      assert.ok(typeof l.u === 'string' && l.u, `${w}: u`);
      assert.ok(SCOPES.has(l.scope), `${w}: scope ${l.scope}`);
      assert.ok(Array.isArray(l.src) && l.src.length > 0 && l.src.every((s) => typeof s === 'string' && s), `${w}: src ${JSON.stringify(l.src)}`);
      assert.ok(CONF.has(l.conf), `${w}: conf ${l.conf}`);
      assert.equal(typeof l.est, 'boolean', `${w}: est`);
      assert.ok(typeof l.note === 'string' && l.note.trim(), `${w}: note`);
      if (l.est) assert.ok(l.note.includes('ค่าประมาณ'), `${w}: an estimate says ค่าประมาณ in its note`);
      for (const s of l.src) { assert.ok(Object.hasOwn(sources, s), `${w}: src ${s} is not in _meta.sources`); used.add(s); }
    }
    assert.deepEqual(Object.keys(sources).filter((s) => !used.has(s)), [], `${f}: _meta.sources lists codes no leaf uses`);
    acFromCard(doc);   // and the simulator can read it
  }
});

test('acFromCard: the trainer card gives AC as setAircraft built it; travel, flap and engine fields as before plan B3', () => {
  const a = acFromCard(CARD), { Iinv, ...rest } = AC;
  assert.deepEqual(a, rest);
  assert.deepEqual(Iinv, inertiaInverse(a));
  // control travel deg → rad as the literals were (22 * DEG …), and the warning numbers exactly as written
  assert.equal(a.deUp, 22 * DEG); assert.equal(a.deDn, 15 * DEG); assert.equal(a.daMax, 20 * DEG); assert.equal(a.drMax, 25 * DEG);
  assert.equal(a.aWarnFlap, -3.84); assert.equal(a.aWarn + a.aWarnFlap, 10.71 - 3.84);
  assert.deepEqual(a.engines, [{ pos: [3.5, 0, 0], dir: [1, 0, 0] }]);
  assert.deepEqual([a.eye, a.gsAnt, a.gear.length, a.gear[0].steer, a.gear[1].brake], [[0.95, 0, -1], [2.6, 0, 0.3], 3, true, true]);
  // a fresh object every time: changing it does not reach AC
  a.gear[0].b[0] = 99; a.eye[0] = 99; assert.equal(AC.gear[0].b[0], 2.3); assert.equal(AC.eye[0], 0.95);
});

test('acFromCard: a missing or non-numeric value throws an Error that names its path', () => {
  // the message names the path, and error.path holds it alone (the page shows only that, in Thai)
  const throwsAt = (edit, re) => {
    const c = card(); edit(c);
    assert.throws(() => acFromCard(c), (e) => { assert.match(e.message, re); assert.ok(e.message.includes(e.path), `${e.message} / path ${e.path}`); return true; });
  };
  throwsAt((c) => delete c.aero.derivatives.Cmq, /aero\.derivatives\.Cmq is missing/);
  throwsAt((c) => delete c.aero.legacy.v.aWarn, /aero\.legacy\.aWarn is missing/);
  throwsAt((c) => delete c.airframe.weights.training_mass, /airframe\.weights\.training_mass is missing/);
  throwsAt((c) => delete c.airframe.geometry.gsAntenna_pos_FRD, /airframe\.geometry\.gsAntenna_pos_FRD is missing/);
  throwsAt((c) => { c.aero.ref.S.v = '16.3'; }, /aero\.ref\.S is not a number \("16\.3"\)/);
  throwsAt((c) => { c.propulsion.legacy.v.T0 = null; }, /propulsion\.legacy\.T0 is not a number/);
  throwsAt((c) => { c.airframe.weights.training_mass.v = { kg: 'x' }; }, /airframe\.weights\.training_mass\.kg is not a number/);
  throwsAt((c) => { c.controls.surfaces.rudder.v.travel_deg = { left: 25 }; }, /controls\.surfaces\.rudder\.travel_deg\.right is missing/);
  throwsAt((c) => { c.gear.legacy.v[1].k = '125000'; }, /gear\.legacy\.1\.k is not a number/);
  throwsAt((c) => { c.gear.legacy.v.pop(); }, /gear\.legacy has 2 struts/);
  throwsAt((c) => { c.airframe.geometry.eye_pos_FRD.v = [1, 2]; }, /airframe\.geometry\.eye_pos_FRD is not a vector of 3 numbers/);
  throwsAt((c) => { c.propulsion.layout.v[0].axis = [0, 0, 0]; }, /propulsion\.layout\.0\.axis has no direction/);
  throwsAt((c) => { c.propulsion.layout.v = []; }, /propulsion\.layout is not a list/);
  throwsAt((c) => { c.aero.derivatives = { v: {}, u: '-' }; }, /aero\.derivatives\.CLq is missing/);
  // a branch where a leaf should be
  throwsAt((c) => { c.speeds.VREF_kt = { kt: 88 }; }, /speeds\.VREF_kt is not a leaf/);
  // a speed in any unit but kt CAS (most round 2 cards give kt IAS, which buildAC converts with speeds.ias_cas; C1)
  throwsAt((c) => { c.speeds.VAPP_kt.u = 'kt IAS'; }, /speeds\.VAPP_kt is in "kt IAS", not kt CAS/);
  throwsAt((c) => { delete c.speeds.VS0_kt.u; }, /speeds\.VS0_kt is in undefined, not kt CAS/);
  const c = card(); delete c.aero.ref.b;
  assert.throws(() => acFromCard(c), (e) => e.path === 'aero.ref.b');
});

test('acFromCard: training_mass as {kg}, inertia scaled by m/ref_mass, symmetric travel, unit engine axes, other leaves ignored', () => {
  const leaf = (v, u) => ({ v, u, scope: 'aircraft', src: ['test'], conf: 'ต่ำ', est: true, note: 'ค่าประมาณ (test)' });
  let c = card();
  c.airframe.weights.training_mass.v = { kg: 2400, empty_kg: 1700, crew_kg: 180, fuel_kg: 520 };
  assert.equal(acFromCard(c).m, 2400);
  c = card(); c.airframe.inertia.ref_mass = leaf(2000, 'kg');
  const a = acFromCard(c);
  for (const k of ['Ixx', 'Iyy', 'Izz', 'Ixz']) assert.equal(a[k], CARD.airframe.inertia[k].v * (2250 / 2000), k);
  c = card(); c.controls.surfaces.elevator.v.travel_deg = 18;
  assert.deepEqual([acFromCard(c).deUp, acFromCard(c).deDn], [18 * DEG, 18 * DEG]);
  // speeds in kt CAS as written: no rounding to whole knots (round 2's buildAC rounds them)
  c = card(); c.speeds.VREF_kt.v = 87.6; c.speeds.VS0_kt.v = 70.6;
  assert.deepEqual([acFromCard(c).Vref, acFromCard(c).Vs0], [87.6, 70.6]);
  c = card(); c.propulsion.layout.v = [{ id: 1, pos: [1, -2, 0.5], axis: [2, 0, 0] }, { id: 2, pos: [1, 2, 0.5], axis: [0, 3, 4] }];
  assert.deepEqual(acFromCard(c).engines, [{ pos: [1, -2, 0.5], dir: [1, 0, 0] }, { pos: [1, 2, 0.5], dir: [0, 0.6, 0.8] }]);
  // leaves of rounds 2 and 3 that the reader does not use (yet) change nothing
  c = card();
  c.aero.static_long = { CL0: leaf({ clean: 0.3, landing: 0.9 }, '-'), CLmax_target: leaf({ clean: 1.4 }, '-') };
  c.turboprop = { ratings: { P_rated: leaf(500000, 'W') } };
  c.aero.derivatives.CXu = leaf(-0.05, '-'); c.speeds.VS1_kt = leaf(80, 'kt CAS'); c.airframe.weights.MTOW.v = 9999;
  assert.deepEqual(acFromCard(c), acFromCard(CARD));
});

test('setAircraft keeps the AC object, drops fields the card does not give, rebuilds Iinv; a Flight after it flies the new mass', () => {
  const before = structuredClone(AC), same = AC;
  try {
    const c = card();
    c.airframe.weights.training_mass.v = 2500; c.airframe.inertia.Ixx.v = 3000;
    AC.stale = 1;
    assert.equal(setAircraft(c), same, 'returns AC itself');
    assert.equal(M.AC, same, 'the harness still holds it');
    assert.ok(!('stale' in AC), 'a field from before is gone');
    assert.deepEqual(Object.keys(AC).sort(), Object.keys(before).sort());
    assert.equal(AC.m, 2500); assert.equal(AC.Ixx, 3000);
    assert.deepEqual(AC.Iinv, inertiaInverse({ Ixx: 3000, Iyy: 7300, Izz: 9200, Ixz: 120 }));
    assert.notDeepEqual(AC.Iinv, before.Iinv);
    // a heavier trainer needs more lift on the same approach: a higher trimmed α and more throttle, and it flies on
    const heavy = new Flight({ wind: SCENARIOS.calm, seed: 5 });
    setAircraft(CARD);
    const light = new Flight({ wind: SCENARIOS.calm, seed: 5 });
    assert.ok(heavy.trim.ok && light.trim.ok);
    assert.ok(heavy.trim.alpha > light.trim.alpha + 0.2 * DEG && heavy.trim.thr > light.trim.thr, `α ${heavy.trim.alpha / DEG} vs ${light.trim.alpha / DEG}°`);
    // a bad card throws and leaves AC as it was
    const bad = card(); delete bad.aero.ref.c;
    assert.throws(() => setAircraft(bad), /aero\.ref\.c is missing/);
    assert.deepEqual(AC, before);
  } finally {
    setAircraft(CARD);
    delete AC.stale;
  }
  assert.equal(AC, same);
  assert.deepEqual(AC, before, 'the trainer is back, Iinv included');
});

// T-F-15 (05-turbofan.md §5.8 and §5.11; scripts/f5_vmc.mjs and f5_vmc_out.json): one engine out on a twin, yaw moment
// from r × F through engineLoads, and the minimum control speed where full rudder balances it. The numbers are those of
// the JSBSim 737 model as research round 1 quotes them [F19] (its author calls them public data and guesses): a check
// of the formula and the summation only, not the Vmc of a real 737. Wings level, β = 0, no windmilling drag (the
// conservative case adds 10 % to the moment and takes 0.85 of the rudder), ISA sea level.
// Bartel & Young take-off thrust lapse F/F00 at Mach `mach`, pressure ratio dP = p/p0, bypass ratio bpr: M. Bartel,
// T. M. Young, "Simplified Thrust and Fuel Consumption Models for Modern Two-Shaft Turbofan Engines", Journal of Aircraft
// 45(4):1450–1456, 2008, doi:10.2514/1.35589, eq. 11–14 [F11]. The research could read only the paper's abstract: the
// coefficients, and G0 = 0.0606·bpr + 0.6337 (OpenAP's fit to the paper's Fig. 5), are as the OpenAP code writes them
// [F10] (05-turbofan.md §5.3 (ก) and §5.12 item 1; written as in f5_vmc.mjs).
const lapseBY = (mach, dP, bpr) => {
  const G = 0.0606 * bpr + 0.6337;
  const A = -0.4327 * dP * dP + 1.3855 * dP + 0.0472, Z = 0.9106 * dP ** 3 - 1.7736 * dP * dP + 1.8697 * dP, X = 0.1377 * dP ** 3 - 0.4374 * dP * dP + 1.3003 * dP;
  return A - 0.377 * (1 + bpr) / Math.sqrt((1 + 0.82 * bpr) * G) * Z * mach + (0.23 + 0.19 * Math.sqrt(bpr)) * X * mach * mach;
};
const J737 = { S: 1171 * 0.09290304, b: 94.7 * 0.3048, Cndr: 0.20, drMax: 0.35, ye: 193 * 0.0254, F0: 20000 * 4.4482216, bpr: 5.9 };
const RHO0 = 1.225, A0 = 340.29;
// the engines at y = ±193 in (4.9022 m), thrust along body +x; x and z are placeholders (they do not enter the yaw moment)
const TWIN = [{ pos: [2.0, -J737.ye, 1.2], dir: [1, 0, 0] }, { pos: [2.0, J737.ye, 1.2], dir: [1, 0, 0] }];
function vmc({ moment = 1, rudder = 1 } = {}) {
  let V = 50;
  for (let i = 0; i < 50; i++) {
    const F = J737.F0 * lapseBY(V / A0, 1, J737.bpr), N = engineLoads(TWIN, [0, F]).M[2] * moment;   // left engine out
    V = Math.sqrt(2 * Math.abs(N) / (RHO0 * J737.S * J737.b * J737.Cndr * rudder * J737.drMax));
  }
  return V;
}
test('T-F-15 engine out through engineLoads: yaw moment 370 ± 5 kN·m at 75.5 kN, Vmc 101.9 ± 1 kt, conservative 114.8 ± 1 kt', (t) => {
  assert.ok(Math.abs(J737.ye - 4.9022) < 1e-9);
  const out = engineLoads(TWIN, [0, 75.5e3]);
  assert.ok(Math.abs(Math.abs(out.M[2]) - 370e3) <= 5e3, `yaw moment ${out.M[2] / 1e3} kN·m`);
  // the right engine alone pushes the right wing forward: nose left, N < 0 in FRD; the left engine alone the other way
  assert.ok(out.M[2] < 0, `N ${out.M[2]}`);
  assert.ok(engineLoads(TWIN, [75.5e3, 0]).M[2] > 0);
  assert.deepEqual(out.F, [75.5e3, 0, 0]);
  assert.equal(out.M[0], 0, 'no roll moment from a thrust along x');
  assert.ok(Math.abs(out.M[1] - 1.2 * 75.5e3) < 1e-6, 'pitch moment of a thrust line 1.2 m below the CG');
  // both engines: the yaw moments cancel exactly
  assert.equal(engineLoads(TWIN, [75.5e3, 75.5e3]).M[2], 0);
  const v1 = vmc() / KT, v2 = vmc({ moment: 1.10, rudder: 0.85 }) / KT;
  t.diagnostic(`Vmc ${v1.toFixed(2)} kt, with 10 % windmilling and 0.85 rudder ${v2.toFixed(2)} kt`);
  assert.ok(Math.abs(v1 - 101.9) <= 1, `Vmc ${v1}`);
  assert.ok(Math.abs(v2 - 114.8) <= 1, `conservative Vmc ${v2}`);
  // thrust at that Vmc about 75.5 kN (f5_vmc_out.json)
  assert.ok(Math.abs(J737.F0 * lapseBY(vmc() / A0, 1, J737.bpr) / 1e3 - 75.5) <= 0.1);
});

test('engineLoads: no engines add nothing, thrusts along the axis, the moment is pos × force', () => {
  const none = engineLoads([], []);
  for (const v of [...none.F, ...none.M]) assert.ok(Object.is(v, -0), 'the empty sum is −0, the additive identity');
  const L = engineLoads([{ pos: [1, 2, 3], dir: [0, 0.6, 0.8] }], [10]);
  assert.deepEqual(L.F, [0, 6, 8]);
  assert.deepEqual(L.M, [2 * 8 - 3 * 6, 3 * 0 - 1 * 8, 1 * 6 - 2 * 0]);
  const reuse = { F: [9, 9, 9], M: [9, 9, 9] };
  assert.equal(engineLoads(TWIN, [1, 1], reuse), reuse, 'out is filled in place');
  assert.deepEqual(reuse.F, [2, 0, 0]);
});

test('Aircraft.deriv sums AC.engines: a thrust line 0.5 m below the CG pitches the nose up by T·0.5/Iyy, nothing else moves', () => {
  const ac = new Aircraft();
  ac.setApproach({ dist: 5500 });
  const run = () => { const out = new Float64Array(13), d = { wow: [], load: [] }; ac.deriv(ac.x, out, d); return { out, T: d.T }; };
  const engines = AC.engines, base = run();
  let low;
  try {
    AC.engines = [{ pos: [3.5, 0, 0.5], dir: [1, 0, 0] }];
    low = run();
  } finally { AC.engines = engines; }
  assert.deepEqual(run().out, base.out, 'the trainer is back');
  assert.ok(base.T > 1000, `thrust ${base.T} N`);
  const dq = low.out[11] - base.out[11], want = base.T * 0.5 / AC.Iyy;
  assert.ok(dq > 0 && Math.abs(dq - want) <= 1e-9 * Math.max(1, want), `q̇ change ${dq} rad/s², T·0.5/Iyy ${want}`);
  for (let i = 0; i < 13; i++) if (i !== 11) assert.equal(low.out[i], base.out[i], `out[${i}]`);
  // two engines sharing the thrust at the same point give the same force as one
  try {
    AC.engines = [{ pos: [3.5, 0, 0], dir: [1, 0, 0] }, { pos: [3.5, 0, 0], dir: [1, 0, 0] }];
    const two = run().out;
    for (let i = 0; i < 13; i++) assert.ok(Math.abs(two[i] - base.out[i]) <= 1e-12 * Math.max(1, Math.abs(base.out[i])), `two engines out[${i}]`);
  } finally { AC.engines = engines; }
  // back to one engine, the second thrust left over in the aircraft's scratch array is not read
  assert.deepEqual(run().out, base.out);
});

test('the page loads aircraft/trainer.json with the other data and calls setAircraft before any Flight', () => {
  const data = fs.readFileSync(path.join(ROOT, 'src/48-data.js'), 'utf8'), app = fs.readFileSync(path.join(ROOT, 'src/90-app.js'), 'utf8');
  assert.match(data, /const DATA_FILES = \[[^\]]*'aircraft\/trainer\.json'/);
  assert.match(data, /get\('aircraft\/trainer\.json', 'json'\)/);
  const load = app.indexOf('await loadData('), set = app.indexOf('setAircraft(data.aircraft)'), flight = app.indexOf('new Flight(');
  assert.ok(load > 0 && set > load && set < flight, 'setAircraft(data.aircraft) after loadData and before the first new Flight');
  assert.ok(!/new Aircraft\(/.test(app), 'the app makes no Aircraft of its own');
  // a bad card: the Thai message names the card path only (error.path), acFromCard's English goes to the console
  assert.match(app, /catch \(e\) \{\s*console\.error\(e\);\s*throw new Error\(`ข้อมูลเครื่องบินใน aircraft\/trainer\.json ใช้ไม่ได้\$\{e\.path \?/);
});

// src/48-data.js run in Node with a stub fetch: when one file fails, the files still arriving do not report progress,
// which would overwrite the error in #loadMsg (the page showed a stale "80%"); the error names the file in Thai
test('loadData: progress stops at the first failed file, and the error names it in Thai', async () => {
  const src = fs.readFileSync(path.join(ROOT, 'src/48-data.js'), 'utf8');
  const body = { 'vtbd_af.json': {}, 'city.json': { bld: '', lights: '' }, 'aircraft/trainer.json': CARD };
  const run = async (failing) => {
    const later = [], progress = [];
    const fetch = (name) => {
      const ok = { ok: true, status: 200, json: async () => body[name], blob: async () => ({}) };
      if (name === 'aircraft/trainer.json' && failing) return failing(ok);   // the small card fails first
      return new Promise((res) => later.push(() => res(ok)));                 // the others arrive after it
    };
    const { loadData } = new Function('fetch', 'createImageBitmap', `${src}\nreturn { loadData };`)(fetch, async () => ({}));
    const p = loadData((f) => progress.push(f));
    let err = null;
    if (failing) {
      await p.catch((e) => { err = e; });
      for (const f of later) f();
      await new Promise((r) => setTimeout(r, 10));
    } else {
      await new Promise((r) => setTimeout(r, 0));
      for (const f of later) f();
      await p;
    }
    return { err, progress };
  };
  const good = await run(null);
  assert.deepEqual(good.progress, [0.2, 0.4, 0.6, 0.8, 1]);
  const cases = [
    [(ok) => Promise.resolve({ ...ok, ok: false, status: 404 }), 'โหลด aircraft/trainer.json ไม่ได้ (404)'],
    [() => Promise.reject(new TypeError('Failed to fetch')), 'โหลด aircraft/trainer.json ไม่ได้ (เชื่อมต่อไม่ได้)'],
    [(ok) => Promise.resolve({ ...ok, json: async () => JSON.parse('<html>') }), 'โหลด aircraft/trainer.json ไม่ได้ (อ่านข้อมูลในไฟล์ไม่ได้)'],
  ];
  for (const [failing, msg] of cases) {
    const { err, progress } = await run(failing);
    assert.equal(err && err.message, msg);
    assert.deepEqual(progress, [], 'no progress after the failure');
  }
});
