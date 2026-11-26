// KIAS: the speed the pilot reads (plan C3, research round 2 task item 12). The functions iasToCas and casToIas of
// src/20-flight.js read a card's speeds.ias_cas per flap row; Aircraft.kias() is what the HUD, the debrief and the
// Evaluator use; AC.kias holds the table and the card's Vref, Vapp and Vs0 in KIAS. The research rows (T-LC-03, T-LC-05,
// T-LE-04, T-LF-07) are flown in test/types.test.mjs; this file holds the properties of the functions, the card reader's
// part, the stall end the generator adds (anchorStallRows) and the Evaluator's use. The trainer has no table: KIAS = KCAS,
// bit for bit.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { M, AIRCRAFT_CARD } from './harness.mjs';
import { TYPE_IDS, anchorStallRows } from '../tools/aircraft/build_cards.mjs';
import { loadType, leaf } from '../docs/research/02-light-aircraft/scripts/lm_lib.mjs';

const { AC, setAircraft, acFromCard, iasToCas, casToIas, speedsKias, Flight, SCENARIOS, setActiveRunway, KT } = M;
const card = (id) => JSON.parse(fs.readFileSync(new URL(`../data/aircraft/${id}.json`, import.meta.url), 'utf8'));
const trainer = () => JSON.parse(fs.readFileSync(AIRCRAFT_CARD, 'utf8'));
after(() => { setActiveRunway('21R'); setAircraft(trainer()); });
const near = (x, e, tol, what) => assert.ok(Math.abs(x - e) <= tol, `${what}: ${x} against ${e} ± ${tol}`);

test('trainer: no table, KIAS = KCAS bit for bit, AC lists no kias field', () => {
  setAircraft(trainer());
  assert.equal(AC.kias, null);
  for (const x of [0, 17.3, 88, 95.000000001, 250]) { assert.ok(Object.is(iasToCas(AC.kias, 0.4, x), x)); assert.ok(Object.is(casToIas(AC.kias, 1, x), x)); }
  assert.equal(speedsKias(), AC);
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'ap', seed: 5 });
  for (let i = 0; i < 2000; i++) f.tick(f.dt);
  assert.ok(Object.is(f.ac.kias(), f.ac.air.ias / KT));
  assert.ok(!Object.keys(AC).includes('kias') && !JSON.stringify(AC).includes('kias'), 'AC.kias is not enumerable');
});

test('every light card: AC.kias is kept out of Object.keys and JSON, set and cleared by setAircraft, and holds the KIAS figures', () => {
  const want = { c172s: [61, 65, 40], c172r: [62, 65, 33], da42ng: [84, 84, 62], da42_tae125: [76, 82, 57], da40d: [66, 66, 49], da40_180: [65, 65, 52] };
  for (const id of TYPE_IDS) {
    const c = card(id); setAircraft(c);
    assert.ok(AC.kias && Array.isArray(AC.kias.rows) && AC.kias.rows.length >= 3, id);
    assert.ok(!Object.keys(AC).includes('kias') && !JSON.stringify(AC).includes('kias'), id);
    near(AC.kias.Vref, want[id][0], 1e-9, `${id} Vref`); near(AC.kias.Vapp, want[id][1], 1e-9, `${id} Vapp`); near(AC.kias.Vs0, want[id][2], 0.01, `${id} Vs0`);
    assert.equal(speedsKias(), AC.kias);
    // a kt IAS leaf is carried as written, and the landing row takes the KIAS figure back to the CAS the sim flies
    const land = AC.kias.rows.at(-1); assert.equal(land.f, 1, id);
    near(iasToCas(AC.kias, 1, AC.kias.Vref), AC.Vref, 1e-9, `${id} Vref in CAS`); near(iasToCas(AC.kias, 1, AC.kias.Vapp), AC.Vapp, 1e-9, `${id} Vapp in CAS`);
    near(iasToCas(AC.kias, 1, AC.kias.Vs0), AC.Vs0, 0.01, `${id} Vs0 in CAS`);
  }
  setAircraft(trainer());
  assert.equal(AC.kias, null);
});

test('iasToCas and casToIas: monotone, inverse of each other, equal to the table at its points, estimates outside it', () => {
  for (const id of TYPE_IDS) {
    setAircraft(card(id));
    const T = AC.kias;
    for (const row of T.rows) {
      row.kias.forEach((k, i) => near(iasToCas(T, row.f, k), row.kcas[i], 1e-9, `${id} f ${row.f} at ${k} KIAS`));
      // below the first point in proportion to the origin, above the last by a constant difference
      near(iasToCas(T, row.f, 0), 0, 1e-12, `${id} zero`);
      near(iasToCas(T, row.f, row.kias[0] / 2), row.kcas[0] / 2, 1e-9, `${id} half the first point`);
      const n = row.kias.length - 1;
      near(iasToCas(T, row.f, row.kias[n] + 30), row.kcas[n] + 30, 1e-9, `${id} above the last point`);
    }
    for (const f of [-1, 0, 0.2, 0.3645, 0.5, 0.69, 0.9, 1, 2]) {
      let prev = -Infinity;
      for (let c = 0; c <= 220; c += 0.5) {
        const k = casToIas(T, f, c);
        assert.ok(k >= prev - 1e-9, `${id} f ${f}: KIAS falls at ${c} KCAS`); prev = k;
        near(iasToCas(T, f, k), c, 1e-6, `${id} f ${f}: ${c} KCAS through KIAS ${k}`);
      }
    }
  }
  setAircraft(trainer());
});

test('flaps between two rows mix the two rows\' CAS by flap position, continuously, and clamp outside the first and last row', () => {
  setAircraft(card('c172s'));
  const T = AC.kias, [r0, r1, r2] = T.rows;
  assert.deepEqual(T.rows.map((r) => r.f.toFixed(4)), ['0.0000', '0.3645', '1.0000']);
  const f = 0.6, w = (f - r1.f) / (r2.f - r1.f);
  near(iasToCas(T, f, 65), (1 - w) * iasToCas(T, r1.f, 65) + w * iasToCas(T, r2.f, 65), 1e-12, 'mix at f 0.6');
  // continuous at each row
  for (const r of [r0, r1, r2]) for (const k of [45, 65, 80]) {
    near(iasToCas(T, r.f + 1e-7, k), iasToCas(T, r.f, k), 1e-5, `f ${r.f} +`); near(iasToCas(T, r.f - 1e-7, k), iasToCas(T, r.f, k), 1e-5, `f ${r.f} −`);
    near(casToIas(T, r.f + 1e-7, iasToCas(T, r.f, k)), k, 1e-4, `inverse near f ${r.f}`);
  }
  assert.equal(iasToCas(T, -0.5, 70), iasToCas(T, 0, 70)); assert.equal(iasToCas(T, 1.5, 70), iasToCas(T, 1, 70));
  // the C172S flaps 20 has no row of its own: its f (0.788) sits between the 10 and 30 rows
  setAircraft(trainer());
});

test('reader: the table is checked row by row, a row must name a detent, KIAS strictly ascending and KCAS not descending', () => {
  const throwsAt = (c, re, where) => assert.throws(() => acFromCard(c), (e) => { assert.match(e.message, re); assert.equal(e.path, where, e.message); return true; });
  let c = card('c172s'); c.speeds.ias_cas.v['10'].reverse();
  throwsAt(c, /speeds\.ias_cas\.10 is not a row .*KIAS strictly ascending and KCAS not descending/, 'speeds.ias_cas.10');
  c = card('c172s'); c.speeds.ias_cas.v['10'][2][1] = 40;   // a row other than the landing one: checked too
  throwsAt(c, /speeds\.ias_cas\.10 is not a row/, 'speeds.ias_cas.10');
  c = card('c172s'); c.speeds.ias_cas.v['15'] = [[40, 50], [50, 56]];
  throwsAt(c, /speeds\.ias_cas\.15 names no detent of aero\.flaps\.detents \(0, 10, 20, 30\)/, 'speeds.ias_cas.15');
  c = card('c172s'); c.speeds.ias_cas.v['10'][0][0] = 0;
  throwsAt(c, /speeds\.ias_cas\.10 is not a row/, 'speeds.ias_cas.10');
  // a card with a table but speeds all in kt CAS: the KIAS figures come back through the landing row
  c = card('c172s'); for (const p of ['VREF_kt', 'VAPP_kt']) c.speeds[p] = { ...c.speeds[p], v: 64, u: 'kt CAS' };
  const ac = acFromCard(c);
  near(ac.kias.Vref, casToIas(ac.kias, 1, 64), 1e-12, 'Vref'); assert.ok(ac.kias.Vref < 64 && ac.kias.Vref > 60);
  // lift increments make f; without dCL0 the flap angles do (30° is f 1, 10° is 1/3)
  c = card('c172s'); for (const d of c.aero.flaps.detents.v) delete d.dCL0;
  assert.deepEqual(acFromCard(c).kias.rows.map((r) => +r.f.toFixed(4)), [0, 0.3333, 1]);
  // a card with no table has none
  c = card('c172s'); delete c.speeds.ias_cas; for (const p of ['VREF_kt', 'VAPP_kt']) c.speeds[p].u = 'kt CAS';
  assert.equal(acFromCard(c).kias, null);
});

// ───────────────────────── the stall end of the table (the generator) ─────────────────────────
test('anchorStallRows: the stall pair starts a row when it is at or below the row\'s first KIAS, and the points it contradicts go', () => {
  const ias = { v: { 10: [[40, 49], [50, 55], [60, 62]], 30: [[40, 43], [50, 51]], 0: [[50, 56], [60, 62]], 20: [[40, 44], [50, 52]] }, u: 'KIAS → KCAS', scope: 'aircraft', src: ['X1'], conf: 'กลาง', est: false, note: 'n' };
  const stall = { v: { cg_fwd: { 10: [[37, 50], [40, 53]], 30: [[35, 43], [38, 46]], 0: [[48, 53], [52, 57]], 20: [[43, 50]] } }, src: ['X2'] };
  const { leaf: out, notes } = anchorStallRows(ias, stall);
  assert.deepEqual(out.v['10'], [[37, 50], [50, 55], [60, 62]]);   // (40, 49) is under 50 KCAS: dropped
  assert.deepEqual(out.v['30'], [[35, 43], [50, 51]]);              // (40, 43) has KCAS not above 43: dropped
  assert.deepEqual(out.v['0'], [[48, 53], [50, 56], [60, 62]]);     // prepended, nothing contradicted
  assert.deepEqual(out.v['20'], ias.v['20']);                        // stall pair at 43 KIAS is above the first point: unchanged
  assert.equal(notes.length, 3);
  assert.deepEqual(out.src, ['X1', 'X2', 'AL:C3']); assert.match(out.note, /ค่าประมาณ/);
  assert.equal(out.est, true, 'a leaf with an interpolated stall end is an estimate'); assert.equal(ias.est, false);
  assert.deepEqual(ias.v['30'], [[40, 43], [50, 51]], 'the input is not changed');
  // no [KIAS, KCAS] cells (the DA40 and DA42), or no stall table: the same leaf
  for (const st of [{ v: { axes: { flap: ['UP'] }, data: [[47]] }, src: ['X2'] }, undefined, { v: { cg_fwd: { 10: [[37]] } }, src: ['X2'] }]) {
    const r = anchorStallRows(ias, st); assert.deepEqual(r.leaf, ias); assert.deepEqual(r.notes, []);
  }
});

test('the cards hold the stall pairs the generator adds and nothing else changed in the table (every point of Fig 5-1 above the pair)', () => {
  const cardPairs = (id) => card(id).speeds.ias_cas.v, research = (id) => leaf(loadType(id), 'speeds.ias_cas').v;
  // C172S: flaps 0 gains (48, 53), flaps 30's first point 50 KCAS becomes the stall pair 48; flaps 10 is as the POH table
  assert.deepEqual(cardPairs('c172s')['0'], [[48, 53], ...research('c172s')['0']]);
  assert.deepEqual(cardPairs('c172s')['10'], research('c172s')['10']);
  assert.deepEqual(cardPairs('c172s')['30'], [[40, 48], ...research('c172s')['30'].slice(1)]);
  // C172R: the white arc bottoms 33 KIAS (flaps 30) and 37 (flaps 10)
  assert.deepEqual(cardPairs('c172r')['30'], [[33, 47], ...research('c172r')['30'].slice(1)]);
  assert.deepEqual(cardPairs('c172r')['10'], [[37, 50], ...research('c172r')['10'].slice(1)]);
  for (const id of ['c172s', 'c172r']) assert.equal(card(id).speeds.ias_cas.est, true, `${id}: est is set where the generator added a stall point`);
  for (const id of ['da42ng', 'da42_tae125', 'da40d', 'da40_180']) assert.deepEqual(cardPairs(id), research(id), `${id}: the table has no stall pair to add`);
  // every card point not replaced is still in the row
  for (const id of ['c172s', 'c172r']) for (const [n, row] of Object.entries(research(id))) {
    const have = cardPairs(id)[n]; for (const q of row.filter((q) => q[0] >= 50)) assert.ok(have.some((h) => h[0] === q[0] && h[1] === q[1]), `${id} row ${n} lost ${q}`);
  }
});

// ───────────────────────── the Evaluator reads KIAS ─────────────────────────
function autoland(id, key = 'calm', seed = 5, runway = '21R') {
  setActiveRunway(runway);
  const f = new Flight({ wind: SCENARIOS[key], pilot: 'ap', seed });
  const at = {};
  while (f.ac.t < 260 && !f.ev.done && !f.crashed) {
    const had = Object.keys(f.ev.gates).length, td = f.ev.td;
    f.tick(f.dt);
    if (Object.keys(f.ev.gates).length > had) at[Object.keys(f.ev.gates).at(-1)] = { kias: f.ac.kias(), cas: f.ac.air.ias / KT, flaps: f.ac.flaps };
    if (!td && f.ev.td) at.td = { kias: f.ac.kias(), cas: f.ac.air.ias / KT, flaps: f.ac.flaps };
  }
  setActiveRunway('21R');
  return { f, at };
}
const pointsSpd = (dv) => (dv >= -8 && dv <= 5 ? 10 : dv >= -12 && dv <= 12 ? 6 : 2);

test('Evaluator: gates, touchdown speed and the speed score are KIAS against the card\'s Vref in KIAS (C172S, C172R, DA42 NG autolands)', () => {
  for (const id of ['c172s', 'c172r', 'da42ng']) {
    try {
      setAircraft(card(id));
      const { f, at } = autoland(id), V = AC.kias, ev = f.ev;
      assert.ok(ev.td && ev.td.onRunway && ev.gates.g500 && ev.gates.g200, id);
      // what the evaluator recorded is the KIAS of that step, not the CAS the sim flies
      for (const g of ['g500', 'g200']) { assert.ok(Object.is(ev.gates[g].ias, at[g].kias), `${id} ${g}`); assert.ok(Math.abs(at[g].kias - at[g].cas) > 0.1, `${id} ${g}: KIAS and CAS differ`); }
      assert.ok(Object.is(ev.td.ias, at.td.kias), id); assert.ok(Math.abs(at.td.kias - at.td.cas) > 0.1, `${id} td`);
      // the gate's speed item is the band Vref −5…+20 on that KIAS
      for (const g of ['g500', 'g200']) assert.equal(ev.gates[g].items.spd, ev.gates[g].ias >= V.Vref - 5 && ev.gates[g].ias <= V.Vref + 20, `${id} ${g} spd item`);
      // the score: dv in KIAS
      const spd = ev.score().parts.find((p) => p.k === 'spd');
      assert.equal(spd.pts, pointsSpd(ev.td.ias - V.Vref), `${id} speed score at ${ev.td.ias} KIAS against Vref ${V.Vref} KIAS`);
      // the recorder keeps the KIAS too
      near(f.rec.at(ev.td.t).ias, ev.td.ias, 1.5, `${id} recorder at touchdown`);
    } finally { setAircraft(trainer()); }
  }
});

test('Evaluator: the same band in CAS would have scored differently where the table moves the knot (a stand-in Evaluator step)', () => {
  // C172S, flaps 30: Vref is 61 KIAS = 63.9 KCAS (AC.Vref). The table runs 70 KIAS = 72 KCAS at flaps 30 but 60 KIAS =
  // 63 KCAS, so the KIAS gap to Vref grows faster than the CAS gap. 63.9 KCAS is on Vref in both (10 points either way).
  // 68.5 KCAS is 66.11 KIAS, +5.11 over Vref 61 (outside the +5 of the full marks: 6 points), where the same CAS against
  // the CAS Vref gives +4.6 (10 points). 75 KCAS is 73.33 KIAS, +12.33 (outside the +12 of the middle band: 2 points),
  // where CAS gives +11.1 (6 points). The test would fail if the Evaluator still took the CAS.
  setAircraft(card('c172s'));
  try {
    const V = AC.kias, kias = (cas) => casToIas(V, 1, cas);
    near(kias(63.9), 61, 0.01, '63.9 KCAS'); assert.equal(pointsSpd(kias(63.9) - V.Vref), 10); assert.equal(pointsSpd(63.9 - AC.Vref), 10);
    near(kias(68.5), 66.11, 0.01, '68.5 KCAS'); assert.equal(pointsSpd(kias(68.5) - V.Vref), 6); assert.equal(pointsSpd(68.5 - AC.Vref), 10);
    near(kias(75), 73.33, 0.01, '75 KCAS'); assert.equal(pointsSpd(kias(75) - V.Vref), 2); assert.equal(pointsSpd(75 - AC.Vref), 6);
  } finally { setAircraft(trainer()); }
});

test('Evaluator: the trainer\'s touchdown record is the CAS of the step, exactly', () => {
  setAircraft(trainer());
  const { f, at } = autoland('trainer', 'xl', 5, '03L');
  assert.ok(Object.is(f.ev.td.ias, at.td.cas) && Object.is(f.ev.gates.g500.ias, at.g500.cas) && Object.is(f.ev.gates.g200.ias, at.g200.cas));
  assert.equal(f.ev.score().parts.find((p) => p.k === 'spd').pts, pointsSpd(f.ev.td.ias - AC.Vref));
});
