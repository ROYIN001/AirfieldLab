// The six light-aircraft cards of plan C1 (data/aircraft/<id>.json), the reader that loads them (acFromCard in
// src/20-flight.js) and the page's type selector: the generator's up-to-date check, the file set, kt IAS → kt CAS
// through speeds.ias_cas on the landing detent, the derivative configuration, the cards against round 2's buildAC, what
// a card may hold, the stall-warning margin of each type (the T-A-07 method of test/stall.test.mjs), the trim at Vapp,
// the Thai fleet (research round 2 T-LS-03, T-LS-11), inertia from radii of gyration (T-LM-13), the Thai text and model
// fit of src/22-types.js (evaluated alone, DOM-free, as test/keys.test.mjs does 18-keys.js), loadCards of
// src/48-data.js with a stub fetch, the owner's rule on military users, and the wiring in src/90-app.js. T-S-12 (leaf
// format, sources, ค่าประมาณ) runs on every card in test/aircraft.test.mjs. This file sets cards on the shared AC and
// puts the trainer back at the end; node --test runs it in its own process.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { M, AIRCRAFT_CARD } from './harness.mjs';
import { TYPE_IDS, prepare, inertiaLeaves } from '../tools/aircraft/build_cards.mjs';
import { buildAC, AC_FIELDS } from '../docs/research/02-light-aircraft/scripts/lm_card.mjs';
import { inertiaFromRadii, RADII, tests as inertiaTests } from '../docs/research/02-light-aircraft/scripts/lm_inertia.mjs';

const { AC, acFromCard, setAircraft, Aircraft, aWarnAt, DEG, RAD, KT, G0 } = M;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'data', 'aircraft');
const card = (id) => JSON.parse(fs.readFileSync(path.join(DIR, `${id}.json`), 'utf8'));
const trainer = () => JSON.parse(fs.readFileSync(AIRCRAFT_CARD, 'utf8'));
after(() => setAircraft(trainer()));
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const TY = new Function('"use strict";\n' + read('src/22-types.js') + '\nreturn { AIRCRAFT_TYPES, AIRLINER_TYPES, typeInfo, modelSpec, MODEL_WHEEL_Z, SCENARIO_NOTE };')();
const APP = read('src/90-app.js'), HUD = read('src/80-hud.js'), TPL = read('src/template.html');
const infoOf = (id) => { const c = card(id); return TY.typeInfo(id, c, acFromCard(c)); };

// ───────────────────────── generator and file set ─────────────────────────
test('tools/aircraft/build_cards.mjs --check: every card is what the generator writes', () => {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'aircraft', 'build_cards.mjs'), '--check'], { encoding: 'utf8' });
  assert.equal(r.status, 0, `--check exit ${r.status}\n${r.stdout}\n${r.stderr}`);
});

test('data/aircraft holds the trainer, the six types and the seven experimental airliners of plan C4; the selector (AIRCRAFT_TYPES) lists the light types in the order of owner decision OD-TYPES', () => {
  // OD-TYPES (plan C1): the selector lists the trainer, then these six
  assert.deepEqual(TYPE_IDS, ['c172s', 'c172r', 'da42ng', 'da42_tae125', 'da40d', 'da40_180']);
  assert.ok(!TYPE_IDS.includes('trainer'), 'the generator never writes the trainer card');
  assert.deepEqual(TY.AIRCRAFT_TYPES, ['trainer', ...TYPE_IDS]);
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();
  // plan C4: the airliners (test/r3cards.test.mjs) are listed apart, behind the switch รุ่นทดลอง
  assert.deepEqual(files, [...TY.AIRCRAFT_TYPES, ...TY.AIRLINER_TYPES].sort());
  assert.ok(TY.AIRLINER_TYPES.every((id) => !TY.AIRCRAFT_TYPES.includes(id)));
});

// ───────────────────────── reader: speeds ─────────────────────────
// the landing detent (largest flap_deg) row of speeds.ias_cas, linear between points and held at the ends
const lerpRow = (pairs, x) => {
  if (x <= pairs[0][0]) return pairs[0][1];
  for (let i = 1; i < pairs.length; i++) if (x <= pairs[i][0]) {
    const [x0, y0] = pairs[i - 1], [x1, y1] = pairs[i];
    return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
  }
  return pairs[pairs.length - 1][1];
};
const throwsAt = (c, re, where) => assert.throws(() => acFromCard(c), (e) => {
  assert.match(e.message, re); assert.equal(e.path, where, e.message); assert.ok(e.message.includes(e.path)); return true;
});

test('reader: kt CAS is taken as written, kt IAS goes to kt CAS on the landing row of speeds.ias_cas', () => {
  const s = acFromCard(card('c172s'));
  assert.equal(s.Vs0, 48);                                  // kt CAS in the card
  assert.ok(Math.abs(s.Vref - 63.9) < 1e-9, `c172s Vref ${s.Vref}`);   // 61 KIAS, flaps 30: 60 → 63, 70 → 72
  assert.ok(Math.abs(s.Vapp - 67.5) < 1e-9, `c172s Vapp ${s.Vapp}`);   // 65 KIAS
  const dc = card('da42ng'), d = acFromCard(dc);
  assert.ok(Math.abs(d.Vref - (62 + 48 * 20 / 49)) < 1e-9 && Math.abs(d.Vref - 81.59) < 0.005, `da42ng Vref ${d.Vref}`);   // 84 KIAS, LDG
  assert.equal(d.Vs0, 60);                                  // 62 KIAS, the first point of LDG
  // every type: the reader's speeds are the landing row read independently
  for (const id of TYPE_IDS) {
    const c = card(id), ac = acFromCard(c);
    const land = c.aero.flaps.detents.v.reduce((a, x) => (x.flap_deg > a.flap_deg ? x : a)).name;
    for (const [k, p] of [['Vs0', 'VS0_kt'], ['Vref', 'VREF_kt'], ['Vapp', 'VAPP_kt']]) {
      const l = c.speeds[p], want = l.u === 'kt CAS' ? l.v : lerpRow(c.speeds.ias_cas.v[land], l.v);
      assert.ok(['kt CAS', 'kt IAS'].includes(l.u), `${id} ${p} ${l.u}`);
      assert.ok(Math.abs(ac[k] - want) < 1e-9, `${id} ${k} ${ac[k]} against ${want}`);
    }
  }
  // the table is held at both ends
  const lo = card('da42ng'); lo.speeds.VREF_kt.v = 40;
  assert.equal(acFromCard(lo).Vref, 60);
  const hi = card('da42ng'); hi.speeds.VREF_kt.v = 200;
  assert.equal(acFromCard(hi).Vref, 110);
});

test('reader: a broken speed table or unit throws with error.path', () => {
  let c = card('c172s'); delete c.speeds.ias_cas;
  throwsAt(c, /speeds\.ias_cas is missing/, 'speeds.ias_cas');
  c = card('c172s'); delete c.speeds.ias_cas.v['30'];
  throwsAt(c, /speeds\.ias_cas\.30 is missing/, 'speeds.ias_cas.30');
  c = card('c172s'); c.speeds.ias_cas.v['30'].reverse();
  throwsAt(c, /speeds\.ias_cas\.30 is not a row .*KIAS strictly ascending/, 'speeds.ias_cas.30');
  c = card('c172s'); c.speeds.ias_cas.v['30'] = [[60, 63]];
  throwsAt(c, /speeds\.ias_cas\.30 is not a row/, 'speeds.ias_cas.30');
  c = card('c172s'); c.speeds.VREF_kt.u = 'kt TAS';
  throwsAt(c, /speeds\.VREF_kt is in "kt TAS", not kt CAS or kt IAS/, 'speeds.VREF_kt');
  c = card('c172s'); delete c.aero.flaps.detents.v[3].flap_deg;
  throwsAt(c, /aero\.flaps\.detents has no list of detents with flap_deg/, 'aero.flaps.detents');
  // a card whose speeds are all kt CAS needs no table (the trainer)
  c = card('c172s'); delete c.speeds.ias_cas;
  for (const p of ['VREF_kt', 'VAPP_kt']) { c.speeds[p].u = 'kt CAS'; }
  assert.equal(acFromCard(c).Vref, 61);
});

test('reader: speeds.ias_cas also in lm_lib\'s { axes: { flap, KIAS }, data } form', () => {
  const keyed = acFromCard(card('c172s'));
  // two rows on one KIAS axis
  let c = card('c172s');
  c.speeds.ias_cas.v = { axes: { flap: ['10', '30'], KIAS: [40, 50, 60, 70, 80] }, data: [[51, 57, 63, 71, 80], [50, 56, 63, 72, 81]] };
  let ac = acFromCard(c);
  for (const k of ['Vref', 'Vapp', 'Vs0']) assert.equal(ac[k], keyed[k], k);
  // one row, data flat; numeric flap names match the detent name
  c = card('c172s');
  c.speeds.ias_cas.v = { axes: { flaps: [30], kias: [40, 50, 60, 70, 80, 85] }, data: [50, 56, 63, 72, 81, 86] };
  ac = acFromCard(c);
  for (const k of ['Vref', 'Vapp', 'Vs0']) assert.equal(ac[k], keyed[k], k);
  // the landing detent is not on the axis
  c = card('c172s');
  c.speeds.ias_cas.v = { axes: { flap: ['10'], KIAS: [40, 50] }, data: [[51, 57]] };
  throwsAt(c, /speeds\.ias_cas\.30 is missing/, 'speeds.ias_cas.30');
});

// ───────────────────────── reader: derivative configuration ─────────────────────────
test('reader: a derivative given per configuration is read at approach unless opts.config names another', () => {
  const c = card('c172s'), d = c.aero.derivatives;
  assert.equal(acFromCard(c).CLq, d.CLq.v.approach);
  assert.equal(acFromCard(c, { config: 'cruise' }).CLq, d.CLq.v.cruise);
  assert.equal(acFromCard(c, { config: 'cruise' }).Clb, d.Clb.v);   // a plain number is the same in every configuration
  // a missing configuration falls through [config, approach, landing, cruise, clean], then the first numeric key
  assert.equal(acFromCard(c, { config: 'takeoff' }).CLq, d.CLq.v.approach);
  let x = card('c172s'); delete x.aero.derivatives.CLq.v.approach;
  assert.equal(acFromCard(x).CLq, d.CLq.v.cruise);
  x = card('c172s'); x.aero.derivatives.CLq.v = { approach: 'x', other: 4.4, clean: 5.5 };
  assert.equal(acFromCard(x).CLq, 5.5);
  x = card('c172s'); x.aero.derivatives.CLq.v = { a: null, other: 4.4 };
  assert.equal(acFromCard(x).CLq, 4.4);
  x = card('c172s'); x.aero.derivatives.CLq.v = { approach: '5.98', cruise: null };
  throwsAt(x, /aero\.derivatives\.CLq has no numeric configuration/, 'aero.derivatives.CLq');
  // setAircraft hands its options to acFromCard
  try {
    setAircraft(card('c172s'), { config: 'cruise' });
    assert.equal(AC.CLq, d.CLq.v.cruise); assert.equal(AC.Cnp, d.Cnp.v.cruise);
    setAircraft(card('c172s'));
    assert.equal(AC.CLq, d.CLq.v.approach); assert.equal(AC.Cnp, d.Cnp.v.approach);
  } finally { setAircraft(trainer()); }
});

// ───────────────────────── the cards against round 2's buildAC ─────────────────────────
test('acFromCard(card) equals buildAC(prepare(id)) of round 2 on the 51 AC_FIELDS (speeds: buildAC rounds to whole kt)', () => {
  assert.equal(AC_FIELDS.length, 51);
  for (const id of TYPE_IDS) {
    const a = acFromCard(card(id)), b = buildAC(prepare(id));
    for (const k of AC_FIELDS) {
      if (['Vref', 'Vapp', 'Vs0'].includes(k)) assert.ok(Math.abs(a[k] - b[k]) <= 0.5, `${id} ${k}: ${a[k]} against ${b[k]}`);
      else assert.deepEqual(a[k], b[k], `${id} ${k}`);
    }
  }
});

// ───────────────────────── what a card holds ─────────────────────────
// the leaves acFromCard reads, the speed table and the detents (design §1.3), and the generated ones (§1.4)
const DERIVS = ['CLq', 'CLadot', 'CLde', 'CYb', 'CYdr', 'CYr', 'Clb', 'Clp', 'Clr', 'Clda', 'Cldr', 'Cmq', 'Cmadot', 'Cmde', 'Cnb', 'Cnp', 'Cnr', 'Cnda', 'Cndr'];
const WHITELIST = [
  'airframe.identity', 'airframe.weights.training_mass', 'airframe.weights.MTOW',
  'airframe.inertia.Ixx', 'airframe.inertia.Iyy', 'airframe.inertia.Izz', 'airframe.inertia.Ixz', 'airframe.inertia.ref_mass',
  'airframe.geometry.eye_pos_FRD', 'airframe.geometry.length', 'aero.ref.S', 'aero.ref.b', 'aero.ref.c', 'aero.legacy',
  'aero.flaps.detents', ...DERIVS.map((k) => 'aero.derivatives.' + k), 'propulsion.legacy', 'propulsion.layout',
  'controls.surfaces.elevator', 'controls.surfaces.aileron', 'controls.surfaces.rudder', 'gear.layout', 'gear.legacy',
  'speeds.VS0_kt', 'speeds.VREF_kt', 'speeds.VAPP_kt', 'speeds.ias_cas',
];
const GENERATED = ['gear.legacy', 'airframe.geometry.gsAntenna_pos_FRD', 'thai_fleet'];
const isLeaf = (o) => o && typeof o === 'object' && !Array.isArray(o) && Object.hasOwn(o, 'v') && Object.hasOwn(o, 'src');
function leaves(o, pre = '', out = []) {
  for (const [k, v] of Object.entries(o)) {
    if (k === '_meta' && !pre) continue;
    const p = pre ? `${pre}.${k}` : k;
    if (isLeaf(v)) out.push([p, v]);
    else if (v && typeof v === 'object' && !Array.isArray(v)) leaves(v, p, out);
    else assert.fail(`${p} is neither a leaf nor a branch`);
  }
  return out;
}
const MILITARY = /royal[\s_-]*thai|air[\s_-]*force|\bnavy\b|\barmy\b|military|กองทัพ|ทหาร|กองบิน|ฝูงบิน|squadron|นายเรืออากาศ|T-41/i;

test('every card holds exactly the copied and generated leaves, with clean provenance', () => {
  assert.equal(WHITELIST.length, 45);
  const want = [...new Set([...WHITELIST, ...GENERATED])].sort();
  for (const id of TYPE_IDS) {
    const text = fs.readFileSync(path.join(DIR, `${id}.json`), 'utf8'), c = JSON.parse(text), ls = leaves(c);
    assert.deepEqual(ls.map(([p]) => p).sort(), want, `${id}: leaf paths`);
    // 03-open-models.md §03.6: no number from a GPL model (the FlightGear DA40 is LB19)
    assert.ok(!/LB19/.test(text) && !/FlightGear/i.test(text), `${id} names LB19 or FlightGear`);
    // 01-methods.md LM8 (numbers read from the JSBSim bundle) stays only where no other source exists: the DA40 inertia
    for (const [p, l] of ls) if (l.src.includes('LM8')) assert.ok(p.startsWith('airframe.inertia.'), `${id} ${p} cites LM8`);
    // licence traps of test/licenses.test.mjs: the cards are the repository's own data (MIT), not ODbL
    const { source, license } = c._meta;
    for (const s of [source, license]) {
      assert.ok(typeof s === 'string' && s.trim(), `${id} _meta.source / license`);
      assert.ok(!/OpenStreetMap|\bOSM\b/i.test(s) && !/ODbL|Open\s*Database\s*Licen[cs]e/i.test(s), `${id}: ${s}`);
    }
    assert.match(license, /MIT/);
    // owner rule: no military unit, academy, institution or user, not even generically (design §3.2)
    const hit = text.match(MILITARY);
    assert.equal(hit, null, `${id}: "${hit?.[0]}"`);
  }
});

// ───────────────────────── stall warning per type (T-A-07 method) ─────────────────────────
// as test/stall.test.mjs: CL with the elevator trimmed for q̇ = 0 (q = 0, no α̇, h 1,000 m, throttle 0, gear down);
// 1-g EAS at the card's training mass, ρ 1.225; CLmax the peak over α 0…25° in 0.01°
function clTrim(flaps, aDeg) {
  const ac = new Aircraft(); ac.flaps = flaps; ac.gearPos = 1; ac.thr = 0;
  const th = aDeg * DEG, d = { wow: [0, 0, 0], load: [0, 0, 0] }, o = new Float64Array(13);
  ac.x.set([0, 0, -1000, 45, 0, 0, Math.cos(th / 2), 0, Math.sin(th / 2), 0, 0, 0, 0]);
  const qd = (de) => { ac.de = de; ac.deriv(ac.x, o, d); return o[11]; };
  const q0 = qd(0), q1 = qd(-0.01); qd(-0.01 * q0 / (q0 - q1));
  return d.CL;
}
const v1g = (CL) => Math.sqrt(2 * AC.m * G0 / (1.225 * AC.S * CL)) / KT;

for (const id of TYPE_IDS) {
  test(`${id}: the stall warning sits 7 ± 0.25 kt above the 1-g stall at every detent, below α_CLmax − 2°`, () => {
    const c = card(id);
    try {
      setAircraft(c);
      // the sim's flap position f of a detent is its lift increment over the landing detent's (CLflap·f)
      const dets = c.aero.flaps.detents.v, full = dets.reduce((a, x) => (x.flap_deg > a.flap_deg ? x : a));
      assert.equal(c.aero.legacy.v.CLflap, full.dCL0);
      for (const det of dets) {
        const f = det.dCL0 / full.dCL0;
        let pk = { CL: 0, a: 0 };
        for (let i = 0; i <= 2500; i++) { const a = i * 0.01, CL = clTrim(f, a); if (CL > pk.CL) pk = { CL, a }; }
        const aw = aWarnAt(f) * RAD, vs = v1g(pk.CL), dv = v1g(clTrim(f, aw)) - vs;
        const info = `${id} flaps ${det.name} (f ${f.toFixed(3)}): α_warn ${aw.toFixed(2)}°, α_CLmax ${pk.a.toFixed(2)}°, Vs ${vs.toFixed(2)} kt, margin ${dv.toFixed(2)} kt`;
        assert.ok(Math.abs(dv - 7) <= 0.25, info);
        assert.ok(aw < pk.a - 2, info);
      }
    } finally { setAircraft(trainer()); }
  });
}

// ───────────────────────── trim at Vapp ─────────────────────────
test('every type trims on the 3° path at Vapp, 5,500 m out, with the throttle between idle and full', () => {
  try {
    for (const id of TYPE_IDS) {
      setAircraft(card(id));
      const r = new Aircraft().setApproach({ dist: 5500 });
      assert.ok(r.ok && !r.limited && r.thr > AC.idle && r.thr < 1, `${id}: ok ${r.ok}, limited ${r.limited}, throttle ${r.thr}, why ${JSON.stringify(r.why)}`);
    }
  } finally { setAircraft(trainer()); }
});

// ───────────────────────── Thai fleet (02-thai-schools.md) ─────────────────────────
test('T-LS-03: the C172S is the type most Thai civil schools fly, 34 of their 78 trainers (43.6 %)', () => {
  const fleet = Object.fromEntries(TYPE_IDS.map((id) => [id, card(id).thai_fleet.v]));
  const ato = (id) => fleet[id].users.filter((u) => u.kind === 'ato').reduce((s, u) => s + u.n, 0);
  const f = fleet.c172s;
  assert.equal(ato('c172s'), 34);
  assert.equal(f.ato_aircraft, 78);
  assert.ok(Math.abs(100 * ato('c172s') / f.ato_aircraft - 43.6) <= 0.1);
  assert.equal(f.default_thai_type, 'c172s');
  for (const id of TYPE_IDS) {
    assert.equal(fleet[id].default_thai_type, 'c172s', id);
    assert.equal(fleet[id].ato_aircraft, 78, id);
    assert.ok(ato(id) <= ato('c172s'), `${id} ${ato(id)}`);
    for (const u of fleet[id].users) assert.ok(['ato', 'club'].includes(u.kind) && u.n > 0, `${id} ${u.name}`);
  }
});

test('T-LS-11 (data): no DA40 NG card; the DA40 types are the DA40 D and the DA40 (IO-360)', () => {
  assert.ok(!TYPE_IDS.includes('da40ng'));
  assert.ok(!fs.existsSync(path.join(DIR, 'da40ng.json')));
  assert.deepEqual(TYPE_IDS.filter((id) => id.startsWith('da40')), ['da40d', 'da40_180']);
});

// ───────────────────────── inertia from radii (T-LM-13) ─────────────────────────
test('T-LM-13: radii of gyration round trip and leave-one-out; the generator\'s inertia leaves load', () => {
  // both rows of lm_inertia.tests(), by name, so an empty or renamed result cannot pass
  const rows = inertiaTests();
  assert.deepEqual(rows.map((r) => [r.id, r.what]), [['T-LM-13', 'radii round trip Ixx (TM-80163) kg m2'], ['T-LM-13', 'single_prop LOO |err| max(Ixx,Iyy,Izz) %']]);
  assert.deepEqual(rows.map((r) => [r.exp, r.tol]), [[1395, 0.5], [0, 35]]);
  for (const r of rows) assert.ok(Math.abs(r.got - r.exp) <= r.tol, `${r.id} ${r.what}: ${r.got} against ${r.exp} ± ${r.tol}`);
  const c = card('c172s'), kg = c.airframe.weights.training_mass.v.kg;
  delete c.airframe.inertia;
  const L = inertiaLeaves(c), R = RADII.single_prop;
  const I = inertiaFromRadii({ m: kg, b: c.aero.ref.b.v, L: c.airframe.geometry.length.v, Rx: R.Rx, Ry: R.Ry, Rz: R.Rz });
  assert.deepEqual([L.Ixx.v, L.Iyy.v, L.Izz.v, L.Ixz.v, L.ref_mass.v], [I.Ixx, I.Iyy, I.Izz, 0, kg]);
  for (const l of Object.values(L)) {
    assert.deepEqual(l.src, ['LM15', 'LM0', 'AL:C1']);
    assert.equal(l.est, true);
    assert.ok(l.note.includes('ค่าประมาณ'), l.note);
  }
  c.airframe.inertia = L;
  const ac = acFromCard(c);
  assert.deepEqual([ac.Ixx, ac.Iyy, ac.Izz, ac.Ixz], [I.Ixx, I.Iyy, I.Izz, 0]);
});

// ───────────────────────── the selector's Thai text (src/22-types.js, design §3.2) ─────────────────────────
// plan C3: Vref and Vapp are the KIAS of the HUD (the card's figure, or its kt CAS read back through speeds.ias_cas)
test('typeInfo: the name, speeds (KIAS, whole knots) and Thai civil-school line of each type card', () => {
  const want = {
    trainer: ['เครื่องฝึกสมมติ', `Vref ${Math.round(acFromCard(trainer()).Vref)} · Vapp ${Math.round(acFromCard(trainer()).Vapp)} KIAS`, 'แบบสมมติ ค่าทุกตัวเป็นค่าประมาณ'],
    c172s: ['Cessna 172S Skyhawk SP', 'Vref 61 · Vapp 65 KIAS', 'โรงเรียนการบินพลเรือนในไทย 34 ลำ 6 แห่ง · ใช้มากที่สุด'],
    c172r: ['Cessna 172R Skyhawk', 'Vref 62 · Vapp 65 KIAS', 'โรงเรียนการบินพลเรือนในไทย 10 ลำ 4 แห่ง'],
    da42ng: ['Diamond DA42 NG', 'Vref 84 · Vapp 84 KIAS', 'โรงเรียนการบินพลเรือนในไทย 5 ลำ 4 แห่ง'],
    da42_tae125: ['Diamond DA42 (TAE 125)', 'Vref 76 · Vapp 82 KIAS', 'โรงเรียนการบินพลเรือนในไทย 5 ลำ 2 แห่ง'],
    da40d: ['Diamond DA40 D', 'Vref 66 · Vapp 66 KIAS', 'โรงเรียนการบินพลเรือนในไทย 9 ลำ 2 แห่ง'],
    da40_180: ['Diamond DA40 (IO-360)', 'Vref 65 · Vapp 65 KIAS', 'โรงเรียนการบินพลเรือนในไทย 7 ลำ 1 แห่ง'],
  };
  assert.deepEqual(Object.keys(want), TY.AIRCRAFT_TYPES);
  for (const id of TY.AIRCRAFT_TYPES) {
    const c = id === 'trainer' ? trainer() : card(id), i = TY.typeInfo(id, c, acFromCard(c));
    assert.deepEqual([i.name, i.em, i.span], want[id], id);
    assert.equal(i.real, id !== 'trainer', id);
  }
  // a card that failed to load: the name only (the page shows the error in its place)
  // (exp: plan C4's experimental airliners set it; a light type is not one)
  assert.deepEqual(TY.typeInfo('da42ng', null, null), { name: 'Diamond DA42 NG', em: '', span: '', lede: '', notes: [], links: [], real: true, exp: false });
});

test('typeInfo: the setup lede and the notes of each type, from the card\'s thai_fleet', () => {
  // the trainer: the template's lede (the text before the script runs) and two notes, no links
  const t = TY.typeInfo('trainer', trainer(), acFromCard(trainer()));
  assert.equal(t.lede, TPL.match(/<p class="lede" id="trLede">([^<]*)<\/p>/)[1]);
  assert.deepEqual(t.notes, ['เครื่องฝึกเทอร์โบพร็อปสองที่นั่งแบบสมมติของ AirfieldLab ไม่ใช่เครื่องบินของผู้ผลิตจริง ค่าทุกตัวเป็นค่าประมาณ', 'โรงเรียนการบินพลเรือนในไทยไม่มีเครื่องฝึกเทอร์โบพร็อป']);
  assert.deepEqual(t.links, []);
  const s = infoOf('c172s');
  assert.equal(s.lede, 'Cessna 172S เครื่องยนต์ลูกสูบหนึ่งเครื่อง ปีกสูง เริ่มบนแนวร่อน 3° ล้อตายตัว แฟลปลงจอด (30°) แล้ว');
  assert.deepEqual(s.notes, [
    'ใช้ฝึกที่ Bangkok Aviation Center (BAC) 21 ลำ ฐานฝึกนครราชสีมา (ค่าประมาณ), Bangkok Air Aviation Training Center (BATC) 7 ลำ ฐานฝึกสุโขทัย (ค่าประมาณ), Asia Aviation and Technology (AAT) 2 ลำ ฐานฝึกชุมพร (ค่าประมาณ), Thai Inter Flying (TIF) 2 ลำ ฐานฝึกพิษณุโลก, Thai Aviation Co. (Thai Aviation Academy) 1 ลำ ฐานฝึกร้อยเอ็ด, D-0507 Flight Training 1 ลำ และชมรมการบิน Phoenix Aero Club 1 ลำ',
    'จำนวนจากทะเบียนอากาศยานของ กพท. ณ 9 ก.ค. 2026 นับเครื่องที่จดทะเบียน ไม่ใช่เครื่องที่บินได้วันนี้',
    'HUD แสดง KIAS ตามตาราง IAS–CAS ของบัตรที่แฟลปขณะนั้น ซิมบินด้วย KCAS (ลงจอดแฟลปเต็ม Vref 61 KIAS = 64 KCAS, Vapp 65 KIAS = 68 KCAS) และคะแนนวัดเป็น KIAS',
    'ตัวเลขการบินในซิมเป็นค่าประมาณจากเอกสารสาธารณะของผู้ผลิตและหน่วยงาน ดูที่มาทุกค่าใน aircraft/c172s.json',
    'สถานการณ์สมมติ: โรงเรียนการบินในไทยฝึกที่สนามภูมิภาค ไม่ได้ฝึกวงจรที่ดอนเมืองเป็นประจำ',
    'ภาพเครื่องบินในฉากเป็นแบบทั่วไป ไม่ใช่รูปทรงจริงของแบบนี้',
  ]);
  // the register is the card's LS1 source; the card itself sits beside the page
  assert.deepEqual(s.links, [{ text: 'ทะเบียนอากาศยานของ กพท.', href: card('c172s')._meta.sources.LS1.link }, { text: 'aircraft/c172s.json', href: 'aircraft/c172s.json' }]);
  assert.match(s.links[0].href, /^https:\/\/www\.caat\.or\.th\//);
  assert.equal(infoOf('c172r').notes[0], 'ใช้ฝึกที่ สถาบันการบินพลเรือน (CATC / CATI) 3 ลำ ฐานฝึกหัวหิน, Bangkok Aviation Center (BAC) 3 ลำ (รวมรุ่น 172P) ฐานฝึกนครราชสีมา (ค่าประมาณ), Asia Aviation and Technology (AAT) 2 ลำ (รวมรุ่น 172M, 172N) ฐานฝึกชุมพร (ค่าประมาณ), Thai Inter Flying (TIF) 2 ลำ (รวมรุ่น 172M, 172N) ฐานฝึกพิษณุโลก และชมรมการบิน Thai Flying Club 1 ลำ (รวมรุ่น 172M)');
  assert.equal(infoOf('da42ng').lede, 'Diamond DA42 NG เครื่องยนต์ดีเซลสองเครื่อง เริ่มบนแนวร่อน 3° ใส่ล้อและแฟลปลงจอด (LDG) แล้ว');
  assert.equal(infoOf('da40d').lede, 'Diamond DA40 D เครื่องยนต์ดีเซลหนึ่งเครื่อง ปีกต่ำ เริ่มบนแนวร่อน 3° ล้อตายตัว แฟลปลงจอด (LDG) แล้ว');
  for (const id of TYPE_IDS) {
    const i = infoOf(id), c = card(id), tf = c.thai_fleet.v;
    // every school of the card, its count and (when the card gives one) its base
    for (const u of tf.users) assert.ok(i.notes[0].includes(`${u.name} ${u.n} ลำ`) && (!u.base || i.notes[0].includes(`ฐานฝึก${u.base}`)), `${id} ${u.name}`);
    assert.equal(i.notes[1], 'จำนวนจากทะเบียนอากาศยานของ กพท. ณ 9 ก.ค. 2026 นับเครื่องที่จดทะเบียน ไม่ใช่เครื่องที่บินได้วันนี้', id);
    const own = id.startsWith('da42') ? ['ซิมยังไม่จำลองเครื่องยนต์ดับข้างเดียว'] : id.startsWith('da40') ? ['โรงเรียนการบินพลเรือนไทยไม่มี DA40 NG'] : [];
    assert.deepEqual(i.notes.slice(2, 2 + own.length), own, id);
    const ac = acFromCard(c), K = ac.kias;
    assert.equal(i.notes[2 + own.length], `HUD แสดง KIAS ตามตาราง IAS–CAS ของบัตรที่แฟลปขณะนั้น ซิมบินด้วย KCAS (ลงจอดแฟลปเต็ม Vref ${Math.round(K.Vref)} KIAS = ${Math.round(ac.Vref)} KCAS, Vapp ${Math.round(K.Vapp)} KIAS = ${Math.round(ac.Vapp)} KCAS) และคะแนนวัดเป็น KIAS`, id);
    assert.equal(i.notes.length, 7 + own.length - 1, id);
    assert.deepEqual(i.links.map((l) => l.href).slice(1), [`aircraft/${id}.json`], id);
  }
});

test('T-LS-11: c172s is the first real type; the DA40 entries are the DA40 D and DA40 (IO-360), never a DA40 NG; every real type is labelled สถานการณ์สมมติ', () => {
  // (ก) the first real type of the list
  assert.equal(TY.AIRCRAFT_TYPES[0], 'trainer');
  assert.equal(TY.AIRCRAFT_TYPES[1], 'c172s');
  // (ข) the DA40 that a Thai civil school flies
  assert.ok(!TY.AIRCRAFT_TYPES.includes('da40ng'));
  assert.deepEqual(TY.AIRCRAFT_TYPES.filter((id) => id.startsWith('da40')), ['da40d', 'da40_180']);
  for (const id of ['da40d', 'da40_180']) assert.ok(infoOf(id).notes.includes('โรงเรียนการบินพลเรือนไทยไม่มี DA40 NG'), id);
  // (ค) the Thai label of a light aircraft at VTBD, in the notes of every real type and on the flight's eyebrow
  assert.equal(TY.SCENARIO_NOTE, 'สถานการณ์สมมติ: โรงเรียนการบินในไทยฝึกที่สนามภูมิภาค ไม่ได้ฝึกวงจรที่ดอนเมืองเป็นประจำ');
  for (const id of TYPE_IDS) assert.ok(infoOf(id).notes.includes(TY.SCENARIO_NOTE), id);
  assert.ok(!TY.typeInfo('trainer', trainer(), acFromCard(trainer())).notes.includes(TY.SCENARIO_NOTE));
  assert.match(APP, /function writeTypeNote\(info\) \{\s*const el = \$\('#typeNote'\);[^\n]*\n\s*info\.notes\.forEach/);
  assert.match(APP, /function refreshSetup\(\) \{\s*const info = typeInfoOf\(app\.train\.type\);[\s\S]{0,200}writeTypeNote\(info\);/);
  // (plan C4: an experimental airliner is labelled รุ่นทดลอง instead; airliners do land at Don Mueang)
  assert.match(APP, /\$\('#liveEyebrow'\)\.textContent = [^\n]* · \$\{info\.name\}\$\{info\.exp \? ' · รุ่นทดลอง' : info\.real \? ' · สถานการณ์สมมติ' : ''\}`;/);
});

// ───────────────────────── owner rule: no military user (design §3.2) ─────────────────────────
test('no military unit, academy, institution or user, not even generically: 22-types.js, the selector lines of 90-app.js and the template, every typeInfo', () => {
  const hit = (t, where) => { const m = t.match(MILITARY); assert.equal(m, null, `${where}: "${m?.[0]}"`); };
  hit(read('src/22-types.js'), 'src/22-types.js');
  const SEL = /typeInfo|TYPES|useType|selectType|afl-type|typeList|typeNote|trLede|TypeNote|liveEyebrow|scSub|typeOk|cardsP|loadCards/;
  const lines = APP.split('\n').map((l, i) => [l, i + 1]).filter(([l]) => SEL.test(l));
  assert.ok(lines.length >= 20, `${lines.length} selector lines in src/90-app.js`);
  for (const [l, n] of lines) hit(l, `src/90-app.js:${n}`);
  hit(TPL.split('\n').filter((l) => /typeList|typeNote|trLede/.test(l)).join('\n'), 'src/template.html');
  const loader = read('src/48-data.js'); hit(loader.slice(loader.indexOf('async function loadCards')), 'loadCards');
  for (const id of TY.AIRCRAFT_TYPES) {
    const c = id === 'trainer' ? trainer() : card(id), i = TY.typeInfo(id, c, acFromCard(c));
    hit(JSON.stringify(i), `typeInfo(${id})`);
  }
});

// ───────────────────────── the generic model fitted to a type (modelSpec, 70-aircraft.js fit) ─────────────────────────
test('modelSpec: the trainer model raised to each card\'s wheels, landing flap angle, fixed or retracting gear, engines in model axes', () => {
  assert.equal(TY.modelSpec('trainer', trainer(), acFromCard(trainer())), null);
  // MODEL_WHEEL_Z is the bottom of the trainer model's main wheels (leg y, wheel offset and radius in 70-aircraft.js) and
  // the trainer card's deepest gear contact: the trainer would need no lift
  const model = read('src/70-aircraft.js');
  const leg = +model.match(/leg\.position\.set\(-?[\d.]+, (-[\d.]+), 1\.55 \* side\)/)[1];
  const off = +model.match(/const w = add\(wheel\(([\d.]+), [\d.]+\), M\.tire, leg\); w\.position\.set\(0, (-[\d.]+),/)[2];
  const rad = +model.match(/const w = add\(wheel\(([\d.]+), [\d.]+\), M\.tire, leg\)/)[1];
  assert.ok(Math.abs(-(leg + off - rad) - TY.MODEL_WHEEL_Z) < 1e-12, `model wheels at ${leg + off - rad}`);
  assert.equal(Math.max(...acFromCard(trainer()).gear.map((g) => g.b[2])), TY.MODEL_WHEEL_Z);
  const want = { c172s: [0.08, 30, false, 1], c172r: [0.08, 30, false, 1], da42ng: [0.30, 42, true, 2], da42_tae125: [0.30, 42, true, 2], da40d: [0.47, 42, false, 1], da40_180: [0.47, 42, false, 1] };
  for (const id of TYPE_IDS) {
    const c = card(id), ac = acFromCard(c), m = TY.modelSpec(id, c, ac), [lift, flapDeg, retract, n] = want[id];
    assert.ok(Math.abs(m.lift - lift) < 1e-9, `${id} lift ${m.lift}`);
    assert.deepEqual([m.flapDeg, m.retract, m.engines.length, m.hideInCockpit], [flapDeg, retract, n, true], id);
    assert.deepEqual(m.engines, ac.engines.map((e) => [e.pos[0], -e.pos[2], e.pos[1]]), id);
  }
  // the model side: fit(null) is the trainer as built (flaps 38°, retracting gear, no lift)
  assert.match(model, /fit\(spec\) \{[\s\S]*?body\.position\.y = spec \? spec\.lift : 0;\s*flapDeg = spec \? spec\.flapDeg : 38; retract = spec \? spec\.retract : true;/);
  assert.match(model, /let flapDeg = 38, retract = true, twin = null;/);
});

// ───────────────────────── loadCards (src/48-data.js) with a stub fetch ─────────────────────────
test('loadCards: { card, ac } for a good card; a Thai error that names the file (and the card path) for each failure; it never rejects', async () => {
  const src = read('src/48-data.js'), logged = [];
  const good = card('c172s'), broken = card('c172r'); delete broken.aero.ref.c;
  const ok = (body) => () => Promise.resolve({ ok: true, status: 200, json: async () => body });
  const reply = {
    c172s: ok(good), c172r: ok(broken), da40_180: ok(null),
    da42ng: () => Promise.resolve({ ok: false, status: 404, json: async () => ({}) }),
    da42_tae125: () => Promise.reject(new TypeError('Failed to fetch')),
    da40d: () => Promise.resolve({ ok: true, status: 200, json: async () => JSON.parse('<html>') }),
  };
  const fetch = (name) => reply[name.match(/^aircraft\/(\w+)\.json$/)[1]]();
  const { loadCards } = new Function('fetch', 'createImageBitmap', 'console', `${src}\nreturn { loadCards };`)(fetch, async () => ({}), { error: (e) => logged.push(e) });
  const r = await loadCards(TYPE_IDS, acFromCard);
  assert.deepEqual(Object.keys(r), TYPE_IDS);
  assert.equal(r.c172s.card, good);
  assert.deepEqual(r.c172s.ac, acFromCard(good));
  assert.deepEqual(r.c172r, { error: 'ข้อมูลเครื่องบินใน aircraft/c172r.json ใช้ไม่ได้ (ค่าที่ขาดหรือผิดรูปแบบ: aero.ref.c)' });
  assert.deepEqual(r.da40_180, { error: 'ข้อมูลเครื่องบินใน aircraft/da40_180.json ใช้ไม่ได้ (ค่าที่ขาดหรือผิดรูปแบบ: airframe.weights.training_mass)' });
  assert.deepEqual(r.da42ng, { error: 'โหลด aircraft/da42ng.json ไม่ได้ (404)' });
  assert.deepEqual(r.da42_tae125, { error: 'โหลด aircraft/da42_tae125.json ไม่ได้ (เชื่อมต่อไม่ได้)' });
  assert.deepEqual(r.da40d, { error: 'โหลด aircraft/da40d.json ไม่ได้ (อ่านข้อมูลในไฟล์ไม่ได้)' });
  // the reader's English message goes to the console, not into the Thai text
  assert.ok(logged.some((e) => /aircraft card: aero\.ref\.c is missing/.test(e.message)), 'the English message is logged');
  for (const v of Object.values(r)) if (v.error) assert.doesNotMatch(v.error, /aircraft card|is missing|Failed|JSON/);
  // a fetch that throws at once, or a check that is not a function: still an { error }, never a rejection
  const { loadCards: l2 } = new Function('fetch', 'createImageBitmap', 'console', `${src}\nreturn { loadCards };`)(() => { throw new Error('x'); }, null, { error() {} });
  assert.deepEqual(await l2(['c172s'], acFromCard), { c172s: { error: 'โหลด aircraft/c172s.json ไม่ได้ (เชื่อมต่อไม่ได้)' } });
  const { loadCards: l3 } = new Function('fetch', 'createImageBitmap', 'console', `${src}\nreturn { loadCards };`)(ok(good), null, { error() {} });
  assert.deepEqual(await l3(['c172s'], null), { c172s: { error: 'ข้อมูลเครื่องบินใน aircraft/c172s.json ใช้ไม่ได้' } });
});

// ───────────────────────── the page's wiring (src/90-app.js, src/80-hud.js) ─────────────────────────
test('page wiring: cards load with the scene data, AC is switched only by useType, explore flies the trainer, speeds shown through fmt', () => {
  const at = (s) => APP.indexOf(s);
  // eager: started before loadData is awaited, awaited after the trainer is set
  assert.ok(at('loadCards(') > 0 && at('loadCards(') < at('await loadData('), 'loadCards( before await loadData(');
  assert.match(APP, /const cardsP = loadCards\(AIRCRAFT_TYPES\.filter\(\(id\) => id !== 'trainer'\), acFromCard\);/);
  assert.equal(APP.search(/setAircraft\(/), at('setAircraft(data.aircraft)'), 'setAircraft(data.aircraft) is the first setAircraft');
  assert.ok(at('setAircraft(data.aircraft)') < at('await cardsP') && at('await cardsP') < at('new Flight('), 'the cards are awaited after the trainer is set and before any Flight');
  // one switch: the trainer at load and useType after it; useType fits the model too
  assert.equal(APP.match(/setAircraft\(/g).length, 2);
  // (plan C4: with the options of typeOpts, {} for every type but an airliner, whose mass and rating the viewer chose)
  assert.match(APP, /function useType\(id\) \{ const T = TYPES\[id\]; setAircraft\(T\.card, typeOpts\(id\)\); ac3\.fit\(modelSpec\(id, T\.card, AC\)\); \}/);
  assert.match(APP, /const typeOpts = \(id\) => \{\s*const o = \(isLiner\(id\) && app\.train\.opts\[id\]\) \|\| \{\};/);
  // the saved choice, kept only when its card is good
  assert.match(APP, /app\.train\.type = store\.get\('afl-type', 'trainer'\);\s*if \(!typeOk\(app\.train\.type\)\) app\.train\.type = 'trainer';/);
  // (plan C4: an airliner only while the switch รุ่นทดลอง is on)
  assert.match(APP, /const typeOk = \(id\) => Object\.hasOwn\(TYPES, id\) && !!TYPES\[id\]\.card && \(!isLiner\(id\) \|\| app\.train\.exp\);/);
  // modes: explore always flies the trainer; training sets the chosen type before its preview Flight
  const sm = APP.slice(at('function setMode('), at("$('#tabExplore').onclick"));
  assert.match(sm, /if \(m === 'explore'\) \{ useType\('trainer'\);/);
  assert.match(sm, /else \{ useType\(app\.train\.type\);[^\n]*refreshSetup\(\); previewFlight\(\);/);
  // a click chooses a type only in the setup pane, only on a good card; it saves the choice and rebuilds the preview
  assert.match(APP, /b\.onclick = \(\) => selectType\(id\);/);
  assert.match(APP, /function selectType\(id\) \{\s*if \(!typeOk\(id\) \|\| \(app\.mode === 'train' && app\.train\.state !== 'setup'\)\) return false;\s*app\.train\.type = id; store\.set\('afl-type', id\);\s*if \(app\.mode === 'train'\) \{ useType\(id\); refreshSetup\(\); previewFlight\(\); \$\('#viewName'\)\.textContent = trainCamName\(app\.trainCam\); \}/);
  // the cockpit camera's name: the trainer's front seat (tandem), plain cockpit for the side-by-side types
  assert.match(APP, /const trainCamName = \(id\) => \(id === 'cockpit' && app\.train\.type === 'trainer' \? 'ห้องนักบินหน้า · HUD' : TRAIN_CAM_NAMES\[id\]\);/);
  assert.match(APP, /cockpit: 'ห้องนักบิน · HUD'/);
  assert.match(APP, /function setTrainCam\(id\) \{\s*app\.trainCam = id; \$\('#viewName'\)\.textContent = trainCamName\(id\);/);
  assert.match(APP, /b\.disabled = !T\.card;/);
  assert.match(APP, /sp\.textContent = T\.card \? info\.span : T\.error;/);
  // the brief, the FMA and the HUD show the card's speeds in KIAS (plan C3: speedsKias, the HUD's speed is Aircraft.kias), rounded for display
  // (plan C4: an airliner has no IAS–CAS table, its speeds are KCAS and are labelled so. The C4 review moved the brief's
  // unit into spdUnit, which the live gate row and the debrief's touchdown speed use too: those two said KIAS on an
  // airliner. No speed on a training screen carries a unit of its own.)
  assert.match(APP, /const spdUnit = \(id = app\.train\.type\) => \(isLiner\(id\) \? 'KCAS' : 'KIAS'\);/);
  assert.match(APP, /\['แบบ', info\.name, 2\], \['มวล \(ค่าประมาณ\)', `\$\{fmt\(AC\.m\)\} kg`\], \['Vref', `\$\{fmt\(V\.Vref\)\} \$\{spdUnit\(\)\}`\], \['Vapp', `\$\{fmt\(V\.Vapp\)\} \$\{spdUnit\(\)\}`\]/);
  assert.match(APP, /\['ความเร็ว Vref −5\/\+20', [^\n]*`\$\{fmt\(f\.ac\.kias\(\)\)\} \$\{spdUnit\(\)\}`\]\);/);
  assert.match(APP, /\['ความเร็วตอนแตะพื้น', `\$\{fmt\(td\.ias\)\} \$\{spdUnit\(\)\}`, P\.spd\]/);
  assert.doesNotMatch(APP, /\} K[IC]AS`/, 'a speed shown with a fixed unit');
  assert.match(APP, /\['SPD ' \+ fmt\(V\.Vapp\), 'c'\]/);
  assert.match(APP, /'A\/THR SPD ' \+ fmt\(V\.Vapp\)/);
  assert.match(APP, /const V = speedsKias\(\);\s*\$\('#brief'\)/);
  assert.match(APP, /ias = fl\.ac\.kias\(\), V = speedsKias\(\)/);
  assert.match(HUD, /const ias = fl\.ac\.kias\(\);/);
  assert.match(HUD, /ctx\.fillText\(`Vref \$\{fmt\(speedsKias\(\)\.Vref\)\}`/);
  for (const [f, t] of [['src/90-app.js', APP], ['src/80-hud.js', HUD]]) assert.doesNotMatch(t, /a\.ias \/ KT|AC\.V(?:ref|app|s0)\b/, `${f} reads the CAS or the card's CAS speeds for display`);
  for (const [f, t] of [['src/90-app.js', APP], ['src/80-hud.js', HUD]]) assert.doesNotMatch(t, /\$\{AC\.V(?:ref|app|s0)\}|' \+ AC\.V(?:ref|app|s0)\b/, `${f} shows a speed without fmt`);
  // the result names the type; the cockpit view hides a fitted type's model; shots.mjs can pick a type
  assert.match(APP, /\$\('#scSub'\)\.textContent = `[^`]*\$\{typeInfoOf\(app\.train\.type\)\.name\}`;/);
  assert.match(APP, /ac3\.inCockpit\(false\);[\s\S]*cam === 'cockpit'[\s\S]*ac3\.inCockpit\(true\);/);
  assert.match(APP, /window\.__app = \{[^}]*setType: selectType/);
});
