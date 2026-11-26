// Siting rules (src/17-siting.js): where a tree or a generated building may stand. The numbers are those of ICAO
// Annex 14 Vol I (Chapter 4 obstacle limitation surfaces for a code 4 instrument runway, Table 3-1 and 3.13.6
// clearances, 5.3.4 approach lights) and of AIP Thailand AD 2.12 and 2.14 for VTBD. The last tests place the trees and
// the buildings of the real data and check every one of them again with separate geometry code.
// Run: node --test test/siting.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readGray } from './lib/png.mjs';

const read = (f) => fs.readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');
const strip = (t) => t.replace(/\/\*(?! glsl \*\/)[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');
const live = (f) => strip(read(f));
const PURE = ['10-atmo.js', '15-geo.js', '17-siting.js', '20-flight.js', '48-data.js'].map(read).join('\n');
const NAMES = 'RUNWAYS, RWY_END, rwyST, rwyEN, onAnyRunway, pointInPoly, distToSeg, OLS, CWY, ALS, ALS_LANE, apprHeight, olsHeight, alsLaneOf, TREE, TREE_SCALE, SITE_GAP, WATER_CLASS, ROAD_CLASSES, SiteIndex, nearestOnLine, STATIONS, STATION_ROOF, WALK_W, stationSites, mappedSite, treeProblem, TREE_CHANCE, placeTrees, groundShare, WET_MAX, ROAD_MAX, buildingProblem, siteBuildings, makeRng, LAND, decodeBuildings, llToNE';
const world = (before = '') => new Function(`"use strict";\n${PURE}\n${before}\nreturn { ${NAMES} };`)();
const S = world();                                   // both runways, as in the page
const SA = world('RUNWAYS.splice(1);');              // 03L/21R alone (no displaced threshold)
const SB = world('RUNWAYS.splice(0, 1);');           // 03R/21L alone (21L displaced by 350 m)
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b} (±${tol})`);
// a point given in runway coordinates: s metres from the paved start, t metres to the right
const pt = (W, s, t) => W.rwyEN(W.RUNWAYS[0], s, t);
const ols = (W, s, t) => W.olsHeight(...pt(W, s, t));

test('the numbers of Annex 14 and of the AIP are the ones in use', () => {
  // Table 4-1, precision approach runway, code number 4
  assert.deepEqual(S.OLS.appr, { inner: 280, dist: 60, div: 0.15, sec: [[3000, 0.02], [3600, 0.025], [8400, 0]] });
  assert.equal(S.OLS.appr.sec.reduce((a, s) => a + s[0], 0), 15000, 'the approach surface is 15 km long');
  assert.equal(S.OLS.trans, 0.143);
  assert.deepEqual(S.OLS.innerH, { h: 45, r: 4000 });
  assert.deepEqual(S.OLS.conical, { slope: 0.05, h: 100 });
  // Table 4-2, code number 4
  assert.deepEqual(S.OLS.takeoff, { inner: 180, dist: 60, div: 0.125, final: 1200, len: 15000, slope: 0.02 });
  // AIP AD 2.12: clearway 150 × 150 m at all four ends; AD 2.14: the four approach lighting systems
  assert.deepEqual(S.CWY, { len: 150, w: 150 });
  assert.deepEqual(Object.fromEntries(Object.values(S.RWY_END).map((E) => [E.id, [E.als, S.ALS[E.als].len]])),
    { '03L': ['SALS420', 420], '21R': ['CAT2', 900], '03R': ['SALS300', 300], '21L': ['CAT1', 900] });
  assert.deepEqual([S.ALS.CAT2.step, S.ALS.CAT1.step, S.ALS.SALS420.step, S.ALS.SALS300.step], [30, 30, 30, 60]);
  assert.equal(S.ALS.SALS300.len / S.ALS.SALS300.step, 5, 'AIP: SALS (5 BAR) on 03R');
  assert.equal(S.ALS_LANE, 60);
  // Table 3-1, code letter E, and 3.13.6; a building and a deck have no fixed clearance, only a share of the crown
  assert.deepEqual(S.SITE_GAP, { building: [0, 0.5], deck: [0, 1], apron: [7.5, 1], taxiway: [43.5, 0], taxilane: [40, 0], water: [2.5, 1] });
  assert.equal(S.SITE_GAP.water[0], S.LAND.in.res, 'the water margin is one cell of the land-use map');
  assert.equal(S.WATER_CLASS, 12);
});

test('approach surface: 2 % for 3,000 m, 2.5 % for 3,600 m, then level to 15 km', () => {
  near(S.apprHeight(0), 0, 0, 'inner edge');
  near(S.apprHeight(1000), 20, 1e-12, '1 km');
  near(S.apprHeight(3000), 60, 1e-12, 'end of the first section');
  near(S.apprHeight(4000), 85, 1e-12, '1 km into the second');
  near(S.apprHeight(6600), 150, 1e-12, 'end of the second section');
  near(S.apprHeight(10000), 150, 1e-12, 'level section');
  near(S.apprHeight(15000), 150, 1e-12, 'outer edge');
  assert.equal(S.apprHeight(15000.1), Infinity);
});

test('lowest surface around one runway (03L/21R alone), from hand', () => {
  const L = SA.RUNWAYS[0].len, h = (s, t) => ols(SA, s, t);
  assert.deepEqual(SA.RUNWAYS[0].sThr, [0, L], 'no displaced threshold on this runway');
  // the strip (as wide as the approach inner edge, 140 m each side) and the transitional surface beside it
  assert.equal(h(1000, 0), 0); assert.equal(h(1000, -139.9), 0); assert.equal(h(L + 59, 100), 0); assert.equal(h(-59, -100), 0);
  near(h(1000, 240), 0.143 * 100, 1e-9, 'transitional, 100 m beyond the strip');
  near(h(1000, -240), 14.3, 1e-9, 'and on the left');
  near(h(1000, 454), 0.143 * 314, 1e-9, 'transitional just under the inner horizontal');
  near(h(1000, 460), 45, 1e-12, 'inner horizontal where the transitional would be 45.76 m');
  // beyond the paved end: the clearway (150 m long, 75 m each side) lies on the ground
  assert.equal(h(-100, 0), 0); assert.equal(h(-149, 74), 0); assert.equal(h(L + 100, -74), 0);
  near(h(-100, 80), 0.02 * 40, 1e-9, 'beside the clearway: approach surface 40 m from its inner edge');
  // on the centre line the take-off climb surface (2 % from the end of the clearway) is under the approach surface
  // (2 % from 60 m before the threshold): 1,060 m out, 0.02 × 910 = 18.2 m against 0.02 × 1,000 = 20 m
  near(h(-1060, 0), 18.2, 1e-9, 'take-off climb');
  near(h(L + 1060, 0), 18.2, 1e-9, 'take-off climb, other end');
  near(h(-1060, 203), 18.2, 1e-9, 'inside the take-off half-width, 90 + 0.125 × 910 = 203.75 m');
  near(h(-1060, 205), 20, 1e-9, 'outside it, inside the approach half-width, 140 + 0.15 × 1,000 = 290 m');
  near(h(-1060, -289), 20, 1e-9, 'approach surface near its edge');
  near(h(-560, 315), 10 + 0.143 * 100, 1e-9, 'transitional beside the approach surface (500 m out, 100 m off its edge)');
  near(h(-2060, 0), 38.2, 1e-9, 'take-off climb 1,910 m from its inner edge');
  near(h(-2060, 400), 40, 1e-9, 'approach surface 2,000 m from its inner edge');
  // the inner horizontal surface (45 m) cuts both off; beyond 4,000 m the conical surface climbs at 5 % to 145 m
  near(h(-3000, 0), 45, 1e-12, 'inner horizontal under the approach (58.8 m) and take-off (57 m) surfaces');
  near(h(-4060, 0), 45 + 0.05 * 60, 1e-9, 'conical');
  near(h(1000, 5000), 95, 1e-9, 'conical abeam');
  near(h(1000, -6000), 145, 1e-9, 'top of the conical surface');
  assert.equal(h(1000, 6001), Infinity, 'no surface beyond the conical one abeam the runway');
  // far out only the approach (level at 150 m) and the take-off climb (to 300 m at 15 km) remain
  near(h(-10000, 0), 150, 1e-9, 'approach, level section, under the take-off climb (197 m)');
  // the take-off climb surface stops widening at 1,200 m: 6,150 m out it is 120 m high and 600 m to each side (not
  // 90 + 0.125 × 6,000 = 840 m), and beyond that the approach surface is the lowest, 60 + 0.025 × 3,090 = 137.25 m
  near(h(-6150, 590), 120, 1e-9, 'take-off climb inside its final half-width of 600 m');
  near(h(-6150, 700), 137.25, 1e-9, 'beyond it the approach surface');
  assert.equal(h(-10000, 1700), Infinity, 'outside the approach surface (half-width 1,631 m)');
  near(h(-15100, 0), 0.02 * 14950, 1e-9, 'take-off climb beyond the end of the approach surface');
  assert.equal(h(-15200, 0), Infinity);
  // symmetric about the centre line and about the middle of the runway
  for (const [s, t] of [[-560, 315], [-1060, 205], [500, 300], [-4060, 100], [-9000, 500]]) {
    near(h(s, -t), h(s, t), 1e-9, `left and right at ${s}, ${t}`);
    near(h(L - s, t), h(s, t), 1e-9, `both ends at ${s}, ${t}`);
  }
});

test('lowest surface at a displaced threshold (03R/21L alone): 21L lies 350 m inside the pavement', () => {
  const R = SB.RUNWAYS[0], L = R.len, h = (s, t) => ols(SB, s, t);
  near(L - R.sThr[1], 350, 1e-9, 'AIP: THR 21L displaced 350 m');
  assert.equal(h(L - 100, 0), 0, 'the pavement before the threshold is still strip');
  assert.equal(h(L + 100, 0), 0, 'clearway from the paved end, not from the threshold');
  // 1,000 m beyond the paved end: approach surface 350 − 60 + 1,000 = 1,290 m from its inner edge (25.8 m); take-off
  // climb 850 m from its own (17 m, half-width 196.25 m)
  near(h(L + 1000, 0), 17, 1e-9, 'take-off climb');
  near(h(L + 1000, 250), 25.8, 1e-9, 'approach surface of the displaced threshold');
  near(h(-1000, 250), 0.02 * 940, 1e-9, 'approach surface of 03R, not displaced');
});

test('two runways: the lower surface of the two governs everywhere', () => {
  const rnd = S.makeRng(11);
  let finite = 0, differ = 0;
  for (let i = 0; i < 4000; i++) {
    const span = i % 2 ? 36000 : 5000;               // half of the points far out, half around the runways
    const e = (rnd() - 0.5) * span, n = (rnd() - 0.5) * span, a = SA.olsHeight(e, n), b = SB.olsHeight(e, n), both = S.olsHeight(e, n);
    assert.equal(both, Math.min(a, b), `at e ${e.toFixed(0)}, n ${n.toFixed(0)}`);
    if (both < Infinity) finite++;
    if (a !== b) differ++;
  }
  assert.ok(finite > 2000 && differ > 500, `the sample covers the surfaces (${finite} under one, ${differ} where the runways differ)`);
  assert.equal(S.olsHeight(...S.rwyEN(S.RUNWAYS[1], 1000, 0)), 0, 'the second runway is strip too');
});

test('approach light lanes: the AIP length of each system, 60 m each side, nothing may rise there', () => {
  const LEN = { '03L': 420, '21R': 900, '03R': 300, '21L': 900 };          // AIP AD 2.14
  for (const E of Object.values(S.RWY_END)) {
    const at = (s, t) => [E.thr[1] + E.u[1] * s + E.r[1] * t, E.thr[0] + E.u[0] * s + E.r[0] * t];   // s along the landing direction
    const len = LEN[E.id];
    for (const [s, t] of [[0, 0], [-1, 59.99], [-len + 0.01, 0], [-len + 0.01, -59.99], [-len / 2, 59.9]]) {
      assert.equal(S.alsLaneOf(...at(s, t)), E.id, `${E.id}: ${s}, ${t} is in the lane`);
      assert.equal(S.treeProblem(new S.SiteIndex(), ...at(s, t), 0.5, 0.3), 'lane', 'not even a sapling');
    }
    for (const [s, t] of [[0.01, 0], [-len - 0.01, 0], [-len / 2, 60.01], [-len / 2, -60.01]]) assert.equal(S.alsLaneOf(...at(s, t)), null, `${E.id}: ${s}, ${t} is outside`);
    // beside the lane the surfaces govern again: 61 m off the centre line a tree goes for its height, not for the lane
    const hOls = S.olsHeight(...at(-len / 2, 61));
    assert.ok(hOls < 12, `${E.id}: a low surface beside the lane (${hOls.toFixed(1)} m)`);
    assert.equal(S.treeProblem(new S.SiteIndex(), ...at(-len / 2, 61), hOls + 0.1, 3), 'ols', 'beside the lane, through the surface');
    assert.equal(S.treeProblem(new S.SiteIndex(), ...at(-len / 2, 30), 5, 3), 'lane');
  }
});

test('geometry helpers', () => {
  near(S.distToSeg([5, 3], [0, 0], [10, 0]), 3, 1e-12, 'beside a segment');
  near(S.distToSeg([13, 4], [0, 0], [10, 0]), 5, 1e-12, 'beyond its end');
  near(S.distToSeg([3, 4], [0, 0], [0, 0]), 5, 1e-12, 'a segment of no length');
  const sq = [[0, 0], [10, 0], [10, 10], [0, 10]];
  assert.ok(S.pointInPoly([5, 5], sq)); assert.ok(!S.pointInPoly([11, 5], sq)); assert.ok(!S.pointInPoly([5, -1], sq));
  const R = S.RUNWAYS[0], [e, n] = S.rwyEN(R, 1234, -56), [s, t] = S.rwyST(R, e, n);
  near(s, 1234, 1e-9, 'rwyST undoes rwyEN'); near(t, -56, 1e-9, 'rwyST undoes rwyEN');
  assert.equal(S.onAnyRunway(...S.rwyEN(R, 100, 29)), R); assert.equal(S.onAnyRunway(...S.rwyEN(R, 100, 31)), null);
  assert.equal(S.onAnyRunway(...S.rwyEN(R, -100, 150), 160), R); assert.equal(S.onAnyRunway(...S.rwyEN(R, -100, 195), 160), null);
});

test('SiteIndex: clearance of each kind of thing', () => {
  const I = () => new S.SiteIndex();
  // a building: a trunk never inside, and half a crown clear of the wall
  let site = I(); site.add('building', [[0, 0], [20, 0], [20, 10], [0, 10]]);
  assert.equal(site.near(10, 5, 0), 'building'); assert.equal(site.near(10, 5, 4), 'building');
  assert.equal(site.near(10, 10.1, 0), null, 'outside, no crown');
  assert.equal(site.near(10, 11.9, 4), 'building', 'half of a 4 m crown is 2 m'); assert.equal(site.near(10, 12.1, 4), null);
  assert.equal(site.near(-1.9, 5, 4), 'building'); assert.equal(site.near(-2.1, 5, 4), null);
  assert.equal(site.near(10, 5, 4, 'building'), null, 'a kind can be skipped');
  // an apron with a hole: 7.5 m (Annex 14, 3.13.6) beyond the crown, measured from the pavement edge
  site = I(); site.add('apron', [[0, 0], [100, 0], [100, 100], [0, 100]], { holes: [[[40, 40], [60, 40], [60, 60], [40, 60]]] });
  assert.equal(site.near(20, 20, 0), 'apron'); assert.equal(site.near(107.4, 50, 0), 'apron'); assert.equal(site.near(107.6, 50, 0), null);
  assert.equal(site.near(110.4, 50, 3), 'apron', 'crown of 3 m: 10.5 m'); assert.equal(site.near(110.6, 50, 3), null);
  assert.equal(site.near(50, 50, 0), null, 'the middle of the hole is 10 m from the pavement'); assert.equal(site.near(45, 50, 0), 'apron', '5 m from it');
  // a viaduct deck: a line with a half-width, a whole crown from its edge
  site = I(); site.add('deck', [[0, 0], [100, 0], [100, 80]], { half: 5 });
  assert.equal(site.near(50, 4.9, 0), 'deck'); assert.equal(site.near(50, 5.1, 0), null);
  assert.equal(site.near(50, -6.9, 2), 'deck'); assert.equal(site.near(50, -7.1, 2), null);
  assert.equal(site.near(104.9, 40, 0), 'deck', 'second span'); assert.equal(site.near(107.1, 40, 2), null);
  assert.equal(site.near(-4.9, 0, 0), 'deck', 'round end'); assert.equal(site.near(-5.1, 0, 0), null);
  // taxiway and stand taxilane centre lines: 43.5 m and 40 m to an object (Table 3-1, code letter E), crown or not
  site = I(); site.add('taxiway', [[0, 0], [300, 0]], { half: 0 }); site.add('taxilane', [[0, 500], [300, 500]], { half: 0 });
  assert.equal(site.near(150, 43.4, 0), 'taxiway'); assert.equal(site.near(150, 43.6, 0), null); assert.equal(site.near(150, 43.6, 6), null);
  assert.equal(site.near(150, 539.9, 0), 'taxilane'); assert.equal(site.near(150, 540.1, 6), null);
  // mapped water: one map cell (2.5 m) beyond the crown
  site = I(); site.add('water', [[0, 0], [30, 0], [30, 30], [0, 30]]);
  assert.equal(site.near(15, 15, 0), 'water'); assert.equal(site.near(32.4, 15, 0), 'water'); assert.equal(site.near(32.6, 15, 0), null);
  assert.equal(site.near(35.4, 15, 3), 'water'); assert.equal(site.near(35.6, 15, 3), null);
  assert.equal(site.hit(35.4, 15, 3), 'water', 'hit() is near() when there is no raster');
  assert.throws(() => site.add('lake', [[0, 0], [1, 1]]), /unknown kind/);
  assert.deepEqual(site.n, { water: 1 });
});

test('SiteIndex: a box turned by yaw lies along (cos yaw, sin yaw) in (e, n), as a three.js box turned about y', () => {
  for (const yaw of [0, 0.3, Math.PI / 2, 2.2, -1.1]) {
    const site = new S.SiteIndex(); site.box('building', 100, 200, 40, 10, yaw);
    const c = Math.cos(yaw), s = Math.sin(yaw);
    assert.equal(site.near(100 + 19 * c, 200 + 19 * s, 0), 'building', `along its length, yaw ${yaw}`);
    assert.equal(site.near(100 - 19 * c, 200 - 19 * s, 0), 'building');
    assert.equal(site.near(100 + 21 * c, 200 + 21 * s, 0), null, 'past its end');
    assert.equal(site.near(100 - 4 * s, 200 + 4 * c, 0), 'building', 'across');
    assert.equal(site.near(100 - 6 * s, 200 + 6 * c, 0), null, 'past its side');
    assert.equal(site.near(100 + 19 * c - 4 * s, 200 + 19 * s + 4 * c, 0), 'building', 'in a corner');
  }
});

test('SiteIndex: things longer than a cell, and things next to a cell border, are found from every cell they reach', () => {
  const site = new S.SiteIndex();
  assert.equal(site.cell, 50);
  site.add('taxiway', [[49, -400], [49, 400]], { half: 0 });        // 1 m from the border between two cells
  for (let n = -399; n < 400; n += 37) {
    assert.equal(site.near(49 + 43, n, 0), 'taxiway', `east of it at n ${n}`);
    assert.equal(site.near(49 - 43, n, 0), 'taxiway', `west of it at n ${n}`);
    assert.equal(site.near(49 + 44, n, 0), null); assert.equal(site.near(49 - 44, n, 0), null);
  }
  const big = new S.SiteIndex(); big.add('building', [[-10, -10], [260, -10], [260, 170], [-10, 170]]);
  for (let e = 0; e < 250; e += 23) for (let n = 0; n < 160; n += 19) assert.equal(big.near(e, n, 0), 'building', `inside at ${e}, ${n}`);
  assert.equal(big.near(261.9, 80, 4), 'building'); assert.equal(big.near(262.1, 80, 4), null); assert.equal(big.near(-300, 80, 4), null);
  // the largest crown there is still reaches a deck from the next cell
  const crown = S.TREE.palm.crown * S.TREE_SCALE[1], deck = new S.SiteIndex(); deck.add('deck', [[0, 0], [0, 40]], { half: 2 });
  assert.equal(deck.near(2 + crown - 0.01, 20, crown), 'deck'); assert.equal(deck.near(2 + crown + 0.01, 20, crown), null);
  assert.equal(deck.near(-(2 + crown - 0.01), 20, crown), 'deck', 'from the cell west of e = 0');
});

test('SiteIndex: a long outline is settled cell by cell and still answers as if every point were tried', () => {
  // a 48-sided pond 300 m across with a 30-sided island 140 m across (large enough to hold a whole cell), off the grid
  const round = (ce, cn, r, k) => Array.from({ length: k }, (_, i) => [ce + r * Math.cos(i * 2 * Math.PI / k), cn + r * Math.sin(i * 2 * Math.PI / k)]);
  const ring = round(213, -87, 150, 48), hole = round(230, -70, 70, 30);
  const fast = new S.SiteIndex(), slow = new S.SiteIndex();
  fast.add('water', ring, { holes: [hole] });
  const keep = S.SiteIndex.LONG; S.SiteIndex.LONG = Infinity;
  try { slow.add('water', ring, { holes: [hole] }); } finally { S.SiteIndex.LONG = keep; }
  assert.equal(keep, 24);
  const entries = (site) => [...site.map.values()].flat();
  assert.ok(entries(slow).every((it) => it.ring) && entries(slow).length === 49, 'without it, the outline is in all 7 × 7 cells of its box');
  const whole = entries(fast).filter((it) => it.all).length, full = entries(fast).filter((it) => it.ring).length;
  assert.ok(whole >= 1 && full >= 20 && whole + full < entries(slow).length, `${whole} cells wholly in the water, ${full} near its edge, fewer than ${entries(slow).length} in all`);
  assert.ok(!fast.map.has(S.SiteIndex.key(4, -2)) && slow.map.has(S.SiteIndex.key(4, -2)), 'the cell in the middle of the island is not entered');
  const it = { kind: 'water', ring, holes: [hole], half: -1 }, rnd = S.makeRng(5);
  let wet = 0, dry = 0;
  for (let i = 0; i < 20000; i++) {
    const e = 213 + (rnd() - 0.5) * 420, n = -87 + (rnd() - 0.5) * 420, crown = rnd() * 6.21, d = itemD([e, n], it);
    const want = d < 2.5 + crown ? 'water' : null;
    assert.equal(fast.near(e, n, crown), want, `at e ${e.toFixed(2)}, n ${n.toFixed(2)}, crown ${crown.toFixed(2)}: ${d.toFixed(2)} m from the water`);
    assert.equal(slow.near(e, n, crown), want);
    if (want) wet++; else dry++;
  }
  assert.ok(wet > 5000 && dry > 5000, `${wet} points at the water, ${dry} clear of it`);
  assert.equal(fast.near(230, -70, 0), null, 'the middle of the island is dry'); assert.equal(fast.near(140, -87, 0), 'water');
  assert.equal(fast.near(140, -87, 0, 'water'), null, 'a cell wholly in the water can be skipped by kind too');
  assert.deepEqual(fast.n, { water: 1 });
});

test('SiteIndex: water of the land-use map', () => {
  // 8 × 6 cells of 2.5 m, north-west corner at e 100, n 200; water in column 4, row 2: e 110…112.5, n 192.5…195
  const land = { e0: 100, n1: 200, res: 2.5, w: 8, h: 6 }, cls = new Uint8Array(48).fill(1); cls[2 * 8 + 4] = S.WATER_CLASS;
  const site = new S.SiteIndex(); site.setRaster(cls, land);
  assert.ok(site.waterAt(111, 194)); assert.ok(!site.waterAt(109.9, 194)); assert.ok(!site.waterAt(111, 195.1)); assert.ok(!site.waterAt(111, 192.4));
  assert.ok(!site.waterAt(50, 194) && !site.waterAt(111, 500), 'off the map is not water');
  // a point on a cell border touches the cells on both sides of it, in equal shares
  const cells = (e, n) => { const out = []; site.eachClassAt(e, n, (k, share) => out.push([k, share])); return out.sort((a, b) => a[0] - b[0]); };
  assert.deepEqual(cells(111, 194), [[S.WATER_CLASS, 1]], 'inside a cell: that cell alone');
  assert.deepEqual([cells(110, 194), cells(112.5, 194)], [[[1, 0.5], [S.WATER_CLASS, 0.5]], [[1, 0.5], [S.WATER_CLASS, 0.5]]], 'on its west and on its east border');
  assert.deepEqual([cells(111, 195), cells(111, 192.5)], [[[1, 0.5], [S.WATER_CLASS, 0.5]], [[1, 0.5], [S.WATER_CLASS, 0.5]]], 'on its north and on its south border');
  assert.deepEqual(cells(110, 195), [[1, 0.25], [1, 0.25], [1, 0.25], [S.WATER_CLASS, 0.25]], 'on its corner: four cells');
  assert.deepEqual([cells(110 + 5e-7, 194).length, cells(110 + 2e-6, 194), cells(110 - 2e-6, 194)], [2, [[S.WATER_CLASS, 1]], [[1, 1]]], 'a border reaches a micrometre to each side');
  assert.deepEqual([cells(111, 195 - 5e-7).length, cells(111, 195 - 2e-6), cells(111, 195 + 2e-6)], [2, [[S.WATER_CLASS, 1]], [[1, 1]]], 'north-south too');
  // so the answer is that of four points a micrometre around the point, a quarter each: on a lattice of an eighth of
  // a metre over the map and beyond it (every point is on a border or well inside a cell)
  const floorAt = (e, n) => { const x = Math.floor((e - land.e0) / land.res), y = Math.floor((land.n1 - n) / land.res); return x >= 0 && x < land.w && y >= 0 && y < land.h ? cls[y * land.w + x] : 0; };
  const sum = (list) => { const m = {}; for (const [k, share] of list) m[k] = (m[k] || 0) + share; return m; };
  let lattice = 0, onBorder = 0;
  for (let e = 95; e <= 125; e += 0.125) for (let n = 180; n <= 205; n += 0.125) {
    const got = cells(e, n), four = [[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => [floorAt(e + a * 1e-6, n + b * 1e-6), 0.25]);
    assert.deepEqual(sum(got), sum(four), `the cells at e ${e}, n ${n}`);
    lattice++; if (got.length > 1) onBorder++;
  }
  assert.deepEqual([lattice, onBorder], [241 * 201, 13 * 201 + 11 * 241 - 13 * 11], 'every point of the lattice, those on the 13 border lines north-south and the 11 east-west');
  assert.deepEqual([cells(100, 194), cells(51, 194)], [[[0, 0.5], [1, 0.5]], [[0, 1]]], 'on the edge of the map, and off it (class 0)');
  assert.ok(site.waterAt(110, 194) && site.waterAt(112.5, 194) && site.waterAt(110, 195) && !site.waterAt(109.99, 194) && !site.waterAt(112.51, 194), 'waterAt: in a water cell or on its border, whichever side');
  { const none = []; new S.SiteIndex().eachClassAt(111, 194, (k, share) => none.push([k, share])); assert.deepEqual(none, [[0, 1]], 'no map: class 0'); }
  assert.ok(site.waterWithin(115.4, 194, 3)); assert.ok(!site.waterWithin(115.6, 194, 3), '3 m east of the cell edge');
  assert.ok(site.waterWithin(111, 197.9, 3)); assert.ok(!site.waterWithin(111, 198.1, 3), '3 m north of it');
  assert.ok(site.waterWithin(114.4, 196.9, 3)); assert.ok(!site.waterWithin(114.7, 197.2, 3), 'off its corner (2.69 m and 3.11 m)');
  // a tree: one cell (2.5 m) beyond its crown
  assert.equal(site.hit(118.4, 194, 3.5), 'water'); assert.equal(site.hit(118.6, 194, 3.5), null);
  assert.equal(site.near(111, 194, 3.5), null, 'near() does not look at the map');
  assert.equal(new S.SiteIndex().waterAt(111, 194), false, 'no map, no water');
});

// ───────────────────────── the real data ─────────────────────────
const data = (f) => fs.readFileSync(new URL('../data/' + f, import.meta.url));
const af = JSON.parse(data('vtbd_af.json')), city = JSON.parse(data('city.json')), land = readGray(data('land_in.png'));
const VIADUCT = new Function('return ' + /\nconst VIADUCT = (\{[\s\S]*?\n\});/.exec(read('55-city.js'))[1])();
const L = S.LAND.in, cls = land.data;
const bldBuf = (() => { const b = Buffer.from(city.bld, 'base64'); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); })();

// every thing in an index, once (a line is there span by span; the `all` marks of whole cells are not things)
const itemsOf = (site) => [...new Set([...site.map.values()].flat())].filter((it) => it.ring);
// The random stream as the trees find it in the page: buildCity draws a wall and a roof colour for every mapped
// footprint before it places the trees (the test of 55-city.js below holds it to exactly these draws).
const DRAWS_BEFORE_TREES = 2 * (af.cbld.length + af.bld.filter((b) => b.k === 's' || b.k === 'b').length);
const pageRng = () => { const rnd = S.makeRng(4242); for (let i = 0; i < DRAWS_BEFORE_TREES; i++) rnd(); return rnd; };
// the page's steps (buildCity in 55-city.js) up to the trees: the same index, the same buildings, the same trees
const built = {};
function place(quality) {
  if (built[quality]) return built[quality];
  const stations = S.stationSites(af);
  const site = S.mappedSite(af, cls, L, Object.keys(VIADUCT).map((k) => [af[k], VIADUCT[k].w]), stations);
  const mapped = { ...site.n }, mappedItems = itemsOf(site);
  let list = S.decodeBuildings(bldBuf);
  if (quality !== 'high') list = list.filter((b, i) => Math.hypot(b.e * 0.9, b.n * 0.55) < 2200 || i % 3 === 0);
  const blds = S.siteBuildings(site, list);
  const rnd = pageRng(), trees = S.placeTrees(cls, L, quality, rnd, site);
  return (built[quality] = { site, stations, mapped, mappedItems, list, blds, trees, next: [rnd(), rnd(), rnd()], items: itemsOf(site) });
}
const keyOf = (b) => [b.e, b.n, b.w, b.d, b.h, b.yaw].join('/');
// the tree placement as it was before the siting rules (55-city.js at b33af91), with the height factor each tree got
// and the next three draws of the stream (the parked airliners use it after the trees)
function oldTrees(quality) {
  const rnd = pageRng(), P = { 8: 0.6, 10: 0.75, 24: 0.3, 26: 0.35, 23: 0.15, 2: 0.05, 1: 0.07, 5: 0.07, 7: 0.04, 11: 0.05, 3: 0.02 };
  const treesB = [], treesP = [];
  const step = quality === 'high' ? 13 : 17, rMax = quality === 'high' ? 4200 : 3000;
  for (let nN = L.n1 - step / 2; nN > L.n1 - L.h * L.res; nN -= step) {
    for (let e = L.e0 + step / 2; e < L.e0 + L.w * L.res; e += step) {
      const ee = e + (rnd() - 0.5) * step * 0.9, nn = nN + (rnd() - 0.5) * step * 0.9;
      const x = Math.floor((ee - L.e0) / L.res), y = Math.floor((L.n1 - nn) / L.res);
      const c = cls[y * L.w + x], pr = P[c] || 0;
      if (!pr || rnd() > pr) continue;
      if (S.onAnyRunway(ee, nn, 160)) continue;
      const d2 = Math.hypot(ee * 0.9, nn * 0.55); if (d2 > rMax) continue;
      (rnd() < 0.28 ? treesP : treesB).push([ee, nn, 0.75 + rnd() * 0.6, rnd() * Math.PI * 2]);
    }
  }
  const withHk = (arr) => arr.map((t, i) => [...t, 0.9 + 0.2 * ((i * 7919) % 11) / 11]);
  return { broad: withHk(treesB), palm: withHk(treesP), next: [rnd(), rnd(), rnd()] };
}

// ── separate geometry for the checks below: winding number, distances written out again, no grid ──
const segD = (p, a, b) => {
  const vx = b[0] - a[0], vy = b[1] - a[1], wx = p[0] - a[0], wy = p[1] - a[1], l2 = vx * vx + vy * vy;
  const u = l2 ? Math.max(0, Math.min(1, (wx * vx + wy * vy) / l2)) : 0;
  return Math.hypot(wx - u * vx, wy - u * vy);
};
const winds = (p, r) => {
  let wn = 0;
  for (let i = 0; i < r.length; i++) {
    const a = r[i], b = r[(i + 1) % r.length], cross = (b[0] - a[0]) * (p[1] - a[1]) - (p[0] - a[0]) * (b[1] - a[1]);
    if (a[1] <= p[1]) { if (b[1] > p[1] && cross > 0) wn++; } else if (b[1] <= p[1] && cross < 0) wn--;
  }
  return wn !== 0;
};
const edgeD = (p, r, closed) => { let d = Infinity; for (let i = closed ? 0 : 1; i < r.length; i++) d = Math.min(d, segD(p, r[(i + r.length - 1) % r.length], r[i])); return d; };
const itemD = (p, it) => {
  if (it.half >= 0) return Math.max(0, edgeD(p, it.ring, false) - it.half);
  if (winds(p, it.ring) && !it.holes.some((h) => winds(p, h))) return 0;
  return Math.min(edgeD(p, it.ring, true), ...it.holes.map((h) => edgeD(p, h, true)));
};
const GAP = { building: [0, 0.5], deck: [0, 1], apron: [7.5, 1], taxiway: [43.5, 0], taxilane: [40, 0], water: [2.5, 1] };
// Every thing with its bounding box, sorted into squares of 250 m by a margin wider than any clearance (43.5 m for a
// taxiway, plus the widest crown), so that one point is tried against all the things around it. This is not the grid
// of SiteIndex: other code, other cell size, and each thing whole.
const SQ = 250, MARGIN = 60;
function flat(items) {
  const boxes = items.map((it) => {
    let a = Infinity, b = -Infinity, c = Infinity, d = -Infinity;
    for (const r of [it.ring, ...it.holes]) for (const [e, nn] of r) { a = Math.min(a, e); b = Math.max(b, e); c = Math.min(c, nn); d = Math.max(d, nn); }
    const pad = Math.max(it.half, 0); return [a - pad, b + pad, c - pad, d + pad];
  });
  const sq = new Map();
  boxes.forEach((bx, k) => {
    for (let i = Math.floor((bx[0] - MARGIN) / SQ); i <= Math.floor((bx[1] + MARGIN) / SQ); i++) for (let j = Math.floor((bx[2] - MARGIN) / SQ); j <= Math.floor((bx[3] + MARGIN) / SQ); j++) {
      const key = i + '/' + j; if (!sq.has(key)) sq.set(key, []); sq.get(key).push(k);
    }
  });
  return { items, boxes, sq };
}
// the kinds of thing closer to (e, n) than their clearance for this crown
function touching(F, e, n, crown, skip = null) {
  const out = new Set(), p = [e, n];
  for (const k of F.sq.get(Math.floor(e / SQ) + '/' + Math.floor(n / SQ)) || []) {
    const it = F.items[k], bx = F.boxes[k], gap = GAP[it.kind][0] + GAP[it.kind][1] * crown;
    assert.ok(gap < MARGIN);
    if (it.kind === skip || out.has(it.kind) || e < bx[0] - gap || e > bx[1] + gap || n < bx[2] - gap || n > bx[3] + gap) continue;
    const d = itemD(p, it);
    if (gap > 0 ? d < gap : d === 0) out.add(it.kind);
  }
  return out;
}
const isWater = (x, y) => x >= 0 && x < L.w && y >= 0 && y < L.h && cls[y * L.w + x] === 12;
const waterAtPoint = (e, n) => isWater(Math.floor((e - L.e0) / L.res), Math.floor((L.n1 - n) / L.res));
const classAtPoint = (e, n) => { const x = Math.floor((e - L.e0) / L.res), y = Math.floor((L.n1 - n) / L.res); return x >= 0 && x < L.w && y >= 0 && y < L.h ? cls[y * L.w + x] : 0; };
// is (e, n) in a water cell or on the border of one: the four points a hundredth of a millimetre around it
const touchesWater = (e, n) => [[-1, -1], [-1, 1], [1, -1], [1, 1]].some(([a, b]) => waterAtPoint(e + a * 1e-5, n + b * 1e-5));
function waterCloserThan(e, n, r) {
  const k = Math.ceil(r / L.res) + 1, x0 = Math.floor((e - L.e0) / L.res), y0 = Math.floor((L.n1 - n) / L.res);
  for (let y = y0 - k; y <= y0 + k; y++) for (let x = x0 - k; x <= x0 + k; x++) {
    if (!isWater(x, y)) continue;
    const w = L.e0 + x * L.res, s = L.n1 - (y + 1) * L.res;          // the cell is [w, w + res] × [s, s + res]
    const de = Math.max(w - e, 0, e - (w + L.res)), dn = Math.max(s - n, 0, n - (s + L.res));
    if (Math.hypot(de, dn) < r) return true;
  }
  return false;
}
const LANE_LEN = { '03L': 420, '21R': 900, '03R': 300, '21L': 900 };
const inLane = (e, n) => Object.values(S.RWY_END).some((E) => {
  const dn = n - E.thr[0], de = e - E.thr[1], s = dn * E.u[0] + de * E.u[1], t = dn * E.r[0] + de * E.r[1];
  return s <= 0 && s >= -LANE_LEN[E.id] && Math.abs(t) <= 60;
});
// every reason why a tree cannot stand at (e, n), found without SiteIndex
function treeFaults(F, [e, n, s, , hk], T) {
  const out = touching(F, e, n, T.crown * s);
  if (inLane(e, n)) out.add('lane');
  if (T.top * s * hk >= S.olsHeight(e, n)) out.add('ols');
  if (waterCloserThan(e, n, 2.5 + T.crown * s)) out.add('water');
  return out;
}

test('the tree sizes used for the rules are those of the tree meshes', () => {
  const src = live('55-city.js');
  // broad-leaved: crown vertices at 3.4 m × k sideways and 2.5 m × k up, k up to 0.82 + 0.36, about a centre 5 m up
  assert.ok(src.includes('const k = 0.82 + r() * 0.36; cp.setXYZ(i, v.x * 3.4 * k, v.y * 2.5 * k, v.z * 3.4 * k);'), 'crown shape');
  assert.ok(src.includes('crown.translate(0, 5.0, 0);'), 'crown height');
  near(S.TREE.broad.top, 5 + 2.5 * 1.18, 1e-12, 'broad top'); near(S.TREE.broad.crown, 3.4 * 1.18, 1e-12, 'broad crown');
  // palm: fronds 4.6 m long drooping from the top of a 9 m trunk
  assert.ok(src.includes('new THREE.PlaneGeometry(4.6, 0.8, 3, 1)') && src.includes('f.translate(0, 9, 0);') && src.includes('cylGeo(0.14, 0.2, 9, 5, 0, 4.5, 0, true)'), 'palm shape');
  assert.deepEqual(S.TREE.palm, { top: 9, crown: 4.6 });
  // scale 0.75 … 1.35 and a height factor of 0.9 … 1.1 on top of it
  assert.deepEqual(S.TREE_SCALE, [0.75, 1.35]);
  assert.ok(live('17-siting.js').includes('s = 0.75 + rnd() * 0.6,'), 'scale drawn in placeTrees');
});

for (const [quality, floor] of [['balanced', 7000], ['high', 15000]]) {
  test(`trees on the real map (${quality}): the same trees as before, less those that could not stand`, () => {
    const { trees } = place(quality), old = oldTrees(quality);
    let kept = 0;
    for (const k of ['broad', 'palm']) {
      const now = new Map(trees[k].map((t) => [t[0] + ',' + t[1], t]));
      assert.equal(now.size, trees[k].length, 'no two trees share a place');
      let last = -1;
      for (const t of trees[k]) {
        const i = old[k].findIndex((o, j) => j > last && o[0] === t[0] && o[1] === t[1]);
        assert.ok(i > last, `${k} tree at ${t[0].toFixed(1)}, ${t[1].toFixed(1)} was there before, in the same order`);
        assert.deepEqual(t, old[k][i], 'same place, scale, turn and height factor');
        last = i;
      }
      kept += trees[k].length;
    }
    const before = old.broad.length + old.palm.length, dropped = Object.values(trees.dropped).reduce((a, b) => a + b, 0);
    assert.equal(kept + dropped, before, 'every tree of before is kept or counted as dropped');
    assert.deepEqual(place(quality).next, old.next, 'the stream goes on as before: the parked airliners do not move');
    // the page's own numbers (CLAUDE.md), which only a change of the rules or of the data moves
    assert.deepEqual([before, kept], quality === 'high' ? [24029, 16631] : [9911, 7393], 'trees before and now');
    assert.ok(kept >= floor, `${kept} trees remain (at least ${floor})`);
    assert.ok(dropped > 0.1 * before && dropped < 0.4 * before, `${dropped} of ${before} dropped`);
    for (const why of ['lane', 'ols', 'water', 'building']) assert.ok(trees.dropped[why] > 0, `some trees were dropped for "${why}"`);
  });

  test(`trees on the real map (${quality}): none in an approach light lane, through a surface, in water or against anything mapped`, () => {
    const { trees, items } = place(quality), old = oldTrees(quality), F = flat(items);
    const count = {};
    for (const k of ['broad', 'palm']) {
      const now = new Set(trees[k].map((t) => t[0] + ',' + t[1]));
      old[k].forEach((t) => {
        const faults = treeFaults(F, t, S.TREE[k]), stays = now.has(t[0] + ',' + t[1]);
        assert.equal(stays, faults.size === 0, `${k} tree at e ${t[0].toFixed(1)}, n ${t[1].toFixed(1)}: ${stays ? 'kept' : 'dropped'}, faults: ${[...faults].join(' ') || 'none'}`);
        for (const f of faults) count[f] = (count[f] || 0) + 1;
      });
    }
    for (const why of ['lane', 'ols', 'water', 'building', 'deck', 'apron']) assert.ok(count[why] > 0, `the check itself finds "${why}" among the old trees (${JSON.stringify(count)})`);
  });
}

test('trees on the real map: the approaches the owner saw (balanced)', () => {
  const { trees } = place('balanced'), old = oldTrees('balanced');
  const all = [...trees.broad.map((t) => [t, S.TREE.broad]), ...trees.palm.map((t) => [t, S.TREE.palm])];
  const was = [...old.broad, ...old.palm];
  for (const E of Object.values(S.RWY_END)) {
    const st = (e, n) => { const dn = n - E.thr[0], de = e - E.thr[1]; return [dn * E.u[0] + de * E.u[1], dn * E.r[0] + de * E.r[1]]; };
    // under the approach: nothing as high as a 2 % slope from 60 m before the threshold
    for (const [[e, n, s, , hk], T] of all) {
      const [x, t] = st(e, n), out = -x - 60;
      if (out < 0 || out > 3000 || Math.abs(t) > 140 + 0.15 * out) continue;
      assert.ok(T.top * s * hk < 0.02 * out, `${E.id}: a tree ${(T.top * s * hk).toFixed(1)} m high ${(-x).toFixed(0)} m before the threshold, ${t.toFixed(0)} m off the centre line`);
    }
    // within 60 m of the extended centre line there is no tree at all along the approach lights
    const inLaneNow = all.filter(([[e, n]]) => { const [x, t] = st(e, n); return x <= 0 && x >= -LANE_LEN[E.id] && Math.abs(t) <= 60; }).length;
    assert.equal(inLaneNow, 0, `${E.id}: trees among the approach lights`);
  }
  // the old placement did have trees in a lane and through the approach surfaces (what the owner reported)
  assert.ok(was.filter(([e, n]) => inLane(e, n)).length >= 10, 'trees stood among the approach lights before');
  // No tree has water under its crown or within one map cell of it. A tree never started on a water cell, but the
  // old placement put some two hundred at the water's edge, their crowns over it (what the owner saw as trees in water).
  assert.equal(all.filter(([[e, n, s], T]) => waterCloserThan(e, n, T.crown * s + 2.5)).length, 0, 'trees at the water');
  const wasAtWater = [...old.broad.map((t) => [t, S.TREE.broad]), ...old.palm.map((t) => [t, S.TREE.palm])].filter(([[e, n, s], T]) => waterCloserThan(e, n, T.crown * s)).length;
  assert.ok(wasAtWater >= 150, `${wasAtWater} trees had water under the crown before`);
  assert.equal(was.filter(([e, n]) => waterAtPoint(e, n)).length, 0, 'no trunk stood on a water cell even before');
});

test('SiteIndex finds on the real map what a search through every item finds', () => {
  const { site, items } = place('balanced'), F = flat(items), rnd = S.makeRng(99);
  const byKind = Object.keys(GAP).map((k) => items.filter((it) => it.kind === k)), kinds = {};
  for (let i = 0; i < 4200; i++) {
    // a point near a random thing of each kind in turn, with a random crown
    const of = byKind[i % byKind.length], it = of[Math.floor(rnd() * of.length)], v = it.ring[Math.floor(rnd() * it.ring.length)];
    const e = v[0] + (rnd() - 0.5) * 120, n = v[1] + (rnd() - 0.5) * 120, crown = rnd() * 6.2;
    const all = touching(F, e, n, crown), one = site.near(e, n, crown);
    assert.ok(one === null ? all.size === 0 : all.has(one), `at e ${e.toFixed(2)}, n ${n.toFixed(2)}, crown ${crown.toFixed(2)}: near() says ${one}, the search says ${[...all].join(' ') || 'nothing'}`);
    kinds[one] = (kinds[one] || 0) + 1;
    assert.equal(site.waterWithin(e, n, 2.5 + crown), waterCloserThan(e, n, 2.5 + crown), `water within ${(2.5 + crown).toFixed(2)} m of e ${e.toFixed(2)}, n ${n.toFixed(2)}`);
    assert.equal(site.waterAt(e, n), waterAtPoint(e, n));
  }
  for (const k of ['building', 'deck', 'apron', 'taxiway', 'taxilane', 'water', 'null']) assert.ok(kinds[k] > 0, `the sample meets "${k}" (${JSON.stringify(kinds)})`);
});

test('what is mapped: buildings, aprons, taxiways, water and the three viaducts are all in the index', () => {
  const { mapped } = place('balanced');
  assert.deepEqual(mapped, {
    building: af.cbld.length + af.bld.length + af.hall.length + af.pier.length, apron: af.apron.length,
    taxiway: af.tw.filter((t) => t.k === 'twy').length, taxilane: af.tw.filter((t) => t.k !== 'twy').length, water: af.water.length,
    deck: 3 + 3 + 1,                                 // three viaducts, three stations, the footbridge
  });
  assert.equal(S.mappedSite(af, cls, L, Object.keys(VIADUCT).map((k) => [af[k], VIADUCT[k].w])).n.deck, 3, 'without stations: the viaducts alone');
  assert.deepEqual(Object.keys(VIADUCT), ['tollway', 'rail', 'phahon']);
  for (const k of Object.keys(VIADUCT)) assert.ok(af[k].length > 1 && VIADUCT[k].w >= 10, `${k} is a line with a deck width`);
  // under the middle of each deck, and a crown beside it
  const { site, mappedItems } = place('balanced'), decks = flat(mappedItems.filter((it) => it.kind === 'deck'));
  for (const k of Object.keys(VIADUCT)) {
    const P = af[k], i = Math.floor(P.length / 2), a = P[i], b = P[i + 1], d = Math.hypot(b[0] - a[0], b[1] - a[1]), nrm = [(b[1] - a[1]) / d, -(b[0] - a[0]) / d];
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], off = (m) => [mid[0] + nrm[0] * m, mid[1] + nrm[1] * m], w2 = VIADUCT[k].w / 2;
    assert.ok(touching(decks, ...off(w2 - 0.5), 0).has('deck') && touching(decks, ...off(-(w2 - 0.5)), 0).has('deck'), `${k}: under the edge of the deck`);
    assert.ok(!touching(decks, ...off(w2 + 0.5), 0).has('deck'), `${k}: just beside the deck`);
    assert.ok(touching(decks, ...off(w2 + 2), 3).has('deck') && !touching(decks, ...off(w2 + 4), 3).has('deck'), `${k}: a 3 m crown 2 m and 4 m from the deck edge`);
    assert.equal(site.near(...off(w2 - 0.5), 0, 'building'), 'deck', `${k}: the index agrees`);
  }
});

// Does a road cut the footprint of a building in two: the share of the footprint that is ground (not road or rail)
// outside the largest part of its ground. A road along one side leaves one part; a road through under the house leaves
// ground beyond it, in one piece or in several. The ground is read at points of our own a quarter of a metre apart on
// the axes of the map, none of them on a cell border. A point is solid when it and the eight points around it are all
// ground of the footprint, and solid points that touch make a part: ground hangs together through a passage three
// quarters of a metre wide or wider, between two roads or between a road and a wall, and never through one under
// half a metre (between the two it follows where the points fall). So two pieces of ground that meet only at the
// corner of a cell, between two road cells that meet at that corner, are two parts, and so are two that a strip a
// few centimetres wide joins along a wall. The rest of the ground (beside a road or a wall, and in a narrow passage)
// goes with the part that reaches it first, east-west and north-south a step at a time; ground that no part reaches
// counts as outside the largest. (This measure first joined the points along the rows and columns of the house: the
// points of a turned house step through a corner between two road cells, and it missed a house of the high quality
// that stands with a quarter of its footprint beyond two lanes that meet corner to corner. Then it joined every
// point of ground east-west and north-south and took the second largest part: a house along such a lane, with a
// sixth of its footprint beyond it and joined to the rest by a neck of 13 cm, passed as whole, and so did one whose
// ground beyond the lane came in five pieces of 2 % each.)
function cutByRoad(b, classOf = classAtPoint) {
  const c = Math.cos(b.yaw), s = Math.sin(b.yaw), R = Math.hypot(b.w, b.d) / 2, P = 0.25;
  const i0 = Math.floor((b.e - R) / P), j0 = Math.floor((b.n - R) / P), nx = Math.ceil((b.e + R) / P) - i0, ny = Math.ceil((b.n + R) / P) - j0;
  const g = new Uint8Array(nx * ny), part = new Int32Array(nx * ny), sizes = [0];   // g: 0 outside the footprint, 1 ground, 2 road or rail
  let inside = 0, ground = 0;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const e = (i0 + i + 0.5) * P, n = (j0 + j + 0.5) * P, de = e - b.e, dn = n - b.n;
    if (Math.abs(de * c + dn * s) >= b.w / 2 || Math.abs(de * s - dn * c) >= b.d / 2) continue;
    inside++;
    const k = classOf(e, n);
    if (k >= 13 && k <= 18) g[j * nx + i] = 2; else { g[j * nx + i] = 1; ground++; }
  }
  const BESIDE = [[1, 0], [-1, 0], [0, 1], [0, -1]], AROUND = [...BESIDE, [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const at = (A, i, j) => (i >= 0 && i < nx && j >= 0 && j < ny ? A[j * nx + i] : 0);
  const solid = (i, j) => at(g, i, j) === 1 && AROUND.every(([di, dj]) => at(g, i + di, j + dj) === 1);
  // the parts of the solid ground (two solid points corner to corner have ground on both sides of that corner)
  let edge = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    if (part[j * nx + i] || !solid(i, j)) continue;
    const id = sizes.length, todo = [[i, j]]; part[j * nx + i] = id; sizes.push(0);
    while (todo.length) {
      const [x, y] = todo.pop(); sizes[id]++; edge.push([x, y]);
      for (const [di, dj] of AROUND) { const X = x + di, Y = y + dj; if (!at(part, X, Y) && solid(X, Y)) { part[Y * nx + X] = id; todo.push([X, Y]); } }
    }
  }
  // the rest of the ground, outward from the parts a step at a time
  while (edge.length) {
    const next = [];
    for (const [x, y] of edge) for (const [di, dj] of BESIDE) { const X = x + di, Y = y + dj, id = part[y * nx + x]; if (at(g, X, Y) === 1 && !part[Y * nx + X]) { part[Y * nx + X] = id; sizes[id]++; next.push([X, Y]); } }
    edge = next;
  }
  return inside ? (ground - Math.max(...sizes)) / inside : 0;
}
test('the measure of a road cutting a building in two, on made-up roads', () => {
  assert.ok([L.e0, L.n1, L.res].every((v) => Number.isInteger(v / 0.25)), 'no point of the measure lies on a cell border of the real map');
  // a road 5 m wide along n, at e 0 … 5 (class 13), and a railway at e 40 … 45 (class 18)
  const classOf = (e) => (e >= 0 && e < 5 ? 13 : e >= 40 && e < 45 ? 18 : 2);
  const b = (e, w = 20, yaw = 0) => ({ e, n: 0, w, d: 10, yaw });
  near(cutByRoad(b(2.5), classOf), 0.375, 1e-9, 'the road under the middle of a 20 m house: 7.5 m of it on each side');
  near(cutByRoad(b(-2.5), classOf), 0.125, 1e-9, 'the road under one end: 2.5 m beyond it');
  assert.equal(cutByRoad(b(10), classOf), 0, 'the road along one side: one part');
  assert.equal(cutByRoad(b(-20), classOf), 0, 'beside the road');
  assert.equal(cutByRoad(b(2.5, 4), classOf), 0, 'wholly on the road: no ground at all');
  near(cutByRoad(b(42.5), classOf), 0.375, 1e-9, 'a railway cuts as a road does');
  near(cutByRoad(b(2.5, 20, Math.PI / 2), classOf), 0.25, 1e-9, 'the house turned to lie along the road, 10 m wide over the 5 m road: a strip of 2.5 m on each side');
  near(cutByRoad(b(2.5, 20, 0.5), classOf), 0.3575, 0.005, 'turned half a radian across the road: the two ends, a little less than 0.375 each');
  // A passage of ground beside the road joins the two sides only if it is wide enough. The road under the middle of
  // the house stops short of its north wall: half a metre short, the two sides are two parts still (each takes half
  // of the strip, 0.375 + 0.00625 of the footprint); a metre short, they are one. The same for a gap in the road
  const short = (m) => (e, n) => (e >= 0 && e < 5 && n < 5 - m ? 13 : 2), gap = (m) => (e, n) => (e >= 0 && e < 5 && Math.abs(n) >= m / 2 ? 13 : 2);
  near(cutByRoad(b(2.5), short(0.5)), 0.38125, 1e-9, 'a strip of half a metre along the wall does not join the two sides');
  near(cutByRoad(b(2.5), gap(0.5)), 0.38125, 1e-9, 'nor does a gap of half a metre in the road');
  assert.deepEqual([cutByRoad(b(2.5), short(1)), cutByRoad(b(2.5), gap(1))], [0, 0], 'a passage of a metre does');
  // and for a passage that crosses the road at 45°: 0.85 m wide it joins the two sides, 0.42 m wide it does not
  const slit = (h) => (e, n) => (e >= 0 && e < 5 && Math.abs(e - 2.5 - n) >= h ? 13 : 2);
  assert.equal(cutByRoad(b(2.5), slit(0.6)), 0, 'a passage of 0.85 m across the road at 45°');
  near(cutByRoad(b(2.5), slit(0.3)), 0.384, 0.002, 'a passage of 0.42 m at 45°: two parts, and half of the passage');
  // Ground that touches a part only corner to corner is not of that part: a pocket of half a metre in the east kerb
  // of the road, with the road around it but for the corner where it meets the ground east of the road. The house
  // has 5 m of ground west of the road and 10 m east of it: the west side and the pocket are outside the largest part
  const pocket = (e, n) => ((e >= 0 && e < 5 && !(e >= 4.5 && n >= 0 && n < 0.5)) || (e >= 5 && e < 5.5 && n >= 0 && n < 0.5) ? 13 : 2);
  near(cutByRoad(b(5), pocket), 0.25 + 4 / 3200, 1e-9, 'the west side and the four points of the pocket');
  // A lane drawn as cells that meet corner to corner (cells of 2.5 m on the diagonal): a 10 m square house on it,
  // square to the map, has a quarter of its footprint on the lane and three eighths on each side. Turned, less of it
  // is on the lane and more on each side: at 45° a sixth and five twelfths. (At 10° it is 0.39 on each side; a corner
  // of the house, 1 % of it, lies past a cell of the lane and hangs on its side by a neck of half a metre: 0.4 in all)
  const stairs = (e, n) => (Math.floor(e / 2.5) === Math.floor(n / 2.5) ? 13 : 2), sq = (yaw) => ({ e: 5, n: 5, w: 10, d: 10, yaw });
  near(cutByRoad(sq(0), stairs), 0.375, 1e-9, 'square to the map');
  for (const [deg, share] of [[10, 0.4], [20, 0.401], [30, 0.41], [45, 5 / 12]]) near(cutByRoad(sq(deg * Math.PI / 180), stairs), share, 0.005, `turned ${deg}°: the share of the house beyond the lane`);
  // A house 6 × 20 m that lies along that lane, its centre line 1.1 m to one side: the lane runs under its whole
  // length, and the ground beyond it, a sixth of the footprint, hangs on the rest by necks of 13 cm between the
  // corners of the lane and the long wall. 1.4 m to the side the ground beyond comes in separate pieces of 2 % each,
  // an eighth of the footprint together. 3 m to the side only the corners of the lane reach under the wall
  const lying = (t) => ({ e: 20 + t * Math.SQRT1_2, n: 20 - t * Math.SQRT1_2, w: 20, d: 6, yaw: Math.PI / 4 });
  near(cutByRoad(lying(1.1), stairs), 0.16, 0.02, 'ground beyond the lane that hangs on by necks of 13 cm');
  near(cutByRoad(lying(1.4), stairs), 0.12, 0.02, 'ground beyond the lane in five pieces');
  assert.equal(cutByRoad(lying(3), stairs), 0, 'beside the lane: one part');
});

for (const quality of ['balanced', 'high']) {
  test(`generated buildings on the real map (${quality}): none in water, on a road, on a mapped building, under a deck or a station, in a lane or through a surface`, () => {
    const { list, blds, mappedItems } = place(quality), mappedOnly = flat(mappedItems);
    const keptSet = new Set(blds.kept), count = {};
    // Every building is tried once. The balanced list is part of the high one (buildCity thins it), and a building's
    // verdict does not depend on the others, so the high run tries the buildings that balanced does not have and
    // holds the shared ones to the verdict balanced gave them.
    const seen = new Map();
    if (quality === 'high') { const B = place('balanced'), k = new Set(B.blds.kept); for (const b of B.list) seen.set(keyOf(b), k.has(b)); }
    let tried = 0, shared = 0; const cut = [];
    list.forEach((b) => {
      if (seen.has(keyOf(b))) { shared++; assert.equal(keptSet.has(b), seen.get(keyOf(b)), `building at e ${b.e}, n ${b.n}: the same verdict in both qualities`); return; }
      tried++;
      const c = Math.cos(b.yaw), s = Math.sin(b.yaw), faults = new Set();
      for (const u of [-1, 0, 1]) for (const v of [-1, 0, 1]) {
        const e = b.e + u * c * b.w / 2 + v * s * b.d / 2, n = b.n + u * s * b.w / 2 - v * c * b.d / 2;
        if (inLane(e, n)) faults.add('lane');
        if (b.h >= S.olsHeight(e, n)) faults.add('ols');
        for (const k of touching(mappedOnly, e, n, 0, 'water')) faults.add(k);
      }
      // the shares of the footprint on water and on road or rail cells, from 31 × 31 points of our own; the rule's
      // coarser sampling may differ by up to 0.1, so within 0.1 of each limit either verdict is right
      let wet = 0, road = 0;
      for (let p = 0; p < 31; p++) for (let q = 0; q < 31; q++) {
        const u = ((p + 0.5) / 31 - 0.5) * b.w, v = ((q + 0.5) / 31 - 0.5) * b.d, k = classAtPoint(b.e + u * c + v * s, b.n + u * s - v * c);
        if (k === 12) wet++; else if (k >= 13 && k <= 18) road++;
      }
      const centreWet = touchesWater(b.e, b.n), kept = keptSet.has(b), over = 1 / 3 + 0.1, under = 1 / 3 - 0.1;
      const what = `building at e ${b.e}, n ${b.n} (${b.w} × ${b.d} × ${b.h} m), ${(100 * wet / 961).toFixed(0)} % on water, ${(100 * road / 961).toFixed(0)} % on road`;
      if (kept) {
        assert.equal(faults.size, 0, `${what}: kept, faults: ${[...faults].join(' ')}`);
        assert.ok(!centreWet && wet / 961 < 0.3, `${what}: kept`);
        assert.ok(road / 961 < over, `${what}: kept`);
        if (road > 0 && cutByRoad(b) >= 0.05) cut.push(`${b.e}, ${b.n}`);   // the 961 points are closer together than a cell: none on a road, no road
      } else assert.ok(faults.size > 0 || centreWet || wet / 961 >= 0.1 || road / 961 >= under, `${what}: dropped for no reason`);
      for (const f of faults) count[f] = (count[f] || 0) + 1;
      if (centreWet || wet / 961 >= 0.3) count.water = (count.water || 0) + 1;
      if (road / 961 >= over) count.road = (count.road || 0) + 1;
    });
    assert.deepEqual([tried, shared], quality === 'high' ? [94612 - 57895, 57895] : [57895, 0], 'every building of the data is tried once');
    const dropped = Object.values(blds.dropped).reduce((a, b) => a + b, 0);
    assert.equal(blds.kept.length + dropped, list.length);
    assert.ok(dropped > 0 && dropped < 0.06 * list.length, `${dropped} of ${list.length} generated buildings dropped (under 6 %)`);
    // Is a house that stays cut in two by a road (a twentieth of its footprint or more as ground outside the largest
    // part)? One of the balanced quality: 7.25 × 11 m with 32 % of it on a lane that turns under it, and 6 % beyond
    // the lane, joined to the rest by a passage about half a metre wide between the corner of the lane and a wall.
    // One more that only the high quality has: 5.75 × 15.25 m where two lanes meet corner to corner, 27 % of it on
    // them and a quarter beyond. With a half for ROAD_MAX it would be 10 of the balanced and 23 of the high
    // buildings (measured on 2026-11-26; the next after these two, at a third, have 4.9 and 4.8 % beyond a road).
    assert.deepEqual(cut, quality === 'high' ? ['-2831.5, 205'] : ['1468, -784.5'], 'kept buildings that a road cuts in two');
    for (const why of ['water', 'road', 'deck']) assert.ok(count[why] > 0, `the check itself finds "${why}" (${JSON.stringify(count)})`);
    // the page's own numbers (CLAUDE.md)
    assert.deepEqual([list.length, blds.kept.length, blds.dropped], quality === 'high'
      ? [94612, 89852, { road: 3538, water: 1108, deck: 106, building: 4, ols: 4 }] : [57895, 54773, { road: 2334, water: 684, deck: 101, ols: 1, building: 2 }]);
    // The verdict of the land-use map does not depend on the side: with the map and every building mirrored east to
    // west, and north to south, each building has the same shares and the same centre answer (a border sample used
    // to go to the cell east or south of it, and an axis-aligned house on the other kerb got another verdict)
    if (quality === 'balanced') {
      const { site } = place(quality);
      for (const [name, fe, fn] of [['east-west', 1, 0], ['north-south', 0, 1]]) {
        const m = new Uint8Array(cls.length);
        for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) m[(fn ? L.h - 1 - y : y) * L.w + (fe ? L.w - 1 - x : x)] = cls[y * L.w + x];
        const mirror = new S.SiteIndex(); mirror.setRaster(m, L);
        const E = 2 * L.e0 + L.w * L.res, N = 2 * L.n1 - L.h * L.res;
        let onBorder = 0;
        for (const b of list) {
          const mb = { ...b, e: fe ? E - b.e : b.e, n: fn ? N - b.n : b.n, yaw: -b.yaw };
          const a = S.groundShare(site, b), z = S.groundShare(mirror, mb);
          if (Math.abs(a.water - z.water) > 1e-9 || Math.abs(a.road - z.road) > 1e-9 || site.waterAt(b.e, b.n) !== mirror.waterAt(mb.e, mb.n)) assert.fail(`building at e ${b.e}, n ${b.n} mirrored ${name}: ${JSON.stringify(a)} against ${JSON.stringify(z)}`);
          if (b.yaw === 0 && (((b.e - b.w / 16 - L.e0) / L.res) % 1 === 0 || ((b.e - L.e0) / L.res) % 1 === 0)) onBorder++;
        }
        assert.ok(onBorder > 100, `the list has houses square to the map with samples or centres on cell borders (${onBorder})`);
      }
    }
  });
}

test('stations and the footbridge: where the page draws them, and nothing generated under their roofs', () => {
  const { stations, blds, trees } = place('balanced');
  assert.deepEqual(S.STATIONS.map((st) => [st.line, st.len, st.wid, !!st.bridge]), [['rail', 600, 40, true], ['phahon', 150, 24, false], ['phahon', 150, 24, false]]);
  assert.deepEqual([S.STATION_ROOF, S.WALK_W], [[6, 3], 6.6]);
  for (const [i, st] of stations.entries()) {
    // on its line, at the point of the line nearest to its published place, pointing along the line
    const [n, e] = S.llToNE(...S.STATIONS[i].at), P = af[st.line];
    const d = Math.min(...P.slice(1).map((b, k) => segD(st.p, P[k], b)));
    near(d, 0, 1e-6, `${st.line} station ${i}: on the line`);
    near(Math.hypot(st.p[0] - e, st.p[1] - n), Math.min(...P.slice(1).map((b, k) => segD([e, n], P[k], b))), 1e-6, `${st.line} station ${i}: the nearest point of the line`);
    near(Math.hypot(...st.dir), 1, 1e-12, 'a unit direction'); near(st.yaw, Math.atan2(st.dir[1], st.dir[0]), 1e-12, 'yaw');
    assert.deepEqual(st.roof, [st.len + 6, st.wid + 3], 'the plan of the roof');
    // the corners of the roof, worked out here: nothing generated stands inside, no tree within a crown of it
    const [c, s] = [Math.cos(st.yaw), Math.sin(st.yaw)], ring = [[1, 1], [1, -1], [-1, -1], [-1, 1]].map(([a, b]) => [st.p[0] + a * c * st.roof[0] / 2 + b * s * st.roof[1] / 2, st.p[1] + a * s * st.roof[0] / 2 - b * c * st.roof[1] / 2]);
    const roof = { kind: 'deck', ring, holes: [], half: -1 };
    for (const b of blds.kept) {
      if (Math.hypot(b.e - st.p[0], b.n - st.p[1]) > st.roof[0]) continue;
      const cb = Math.cos(b.yaw), sb = Math.sin(b.yaw);
      for (const u of [-1, 0, 1]) for (const v of [-1, 0, 1]) assert.ok(itemD([b.e + u * cb * b.w / 2 + v * sb * b.d / 2, b.n + u * sb * b.w / 2 - v * cb * b.d / 2], roof) > 0, `a generated building at e ${b.e}, n ${b.n} under the roof of ${st.line} station ${i}`);
    }
    for (const k of ['broad', 'palm']) for (const [te, tn, ts] of trees[k]) assert.ok(itemD([te, tn], roof) >= S.TREE[k].crown * ts, `a ${k} tree at e ${te.toFixed(0)}, n ${tn.toFixed(0)} against ${st.line} station ${i}`);
  }
  // the footbridge of the railway station: square to the line, from 24 m off its centre into the terminal hall
  const [rail, ...bts] = stations, [a, end] = rail.walk;
  // nothing generated under it either: a strip WALK_W wide, tried with our own distances
  const strip = { kind: 'deck', ring: rail.walk, holes: [], half: S.WALK_W / 2 };
  for (const b of blds.kept) {
    if (Math.hypot(b.e - a[0], b.n - a[1]) > 400) continue;
    const cb = Math.cos(b.yaw), sb = Math.sin(b.yaw);
    for (const u of [-1, 0, 1]) for (const v of [-1, 0, 1]) assert.ok(itemD([b.e + u * cb * b.w / 2 + v * sb * b.d / 2, b.n + u * sb * b.w / 2 - v * cb * b.d / 2], strip) > 0, `a generated building at e ${b.e}, n ${b.n} under the footbridge`);
  }
  for (const k of ['broad', 'palm']) for (const [te, tn, ts] of trees[k]) assert.ok(itemD([te, tn], strip) >= S.TREE[k].crown * ts, `a ${k} tree at e ${te.toFixed(0)}, n ${tn.toFixed(0)} against the footbridge`);
  // and the index has it at that width: a point 3.2 m beside its middle is under it, one 3.4 m beside is not
  {
    const { site } = place('balanced'), m = [(a[0] + end[0]) / 2, (a[1] + end[1]) / 2], l = Math.hypot(end[0] - a[0], end[1] - a[1]), nx = [(end[1] - a[1]) / l, -(end[0] - a[0]) / l];
    assert.equal(S.WALK_W, 6.6);
    const under = (d) => itemsOf(site).filter((it) => it.kind === 'deck' && it.half === 3.3).some((it) => S.SiteIndex.dist([m[0] + nx[0] * d, m[1] + nx[1] * d], it) === 0);
    assert.ok(under(3.2) && under(-3.2) && !under(3.4) && !under(-3.4), 'the footbridge strip in the index is 6.6 m wide');
  }
  assert.ok(bts.every((st) => st.walk === null), 'only the railway station has a footbridge');
  near((a[0] - rail.p[0]) * rail.dir[0] + (a[1] - rail.p[1]) * rail.dir[1], 0, 1e-9, 'square to the line');
  near(Math.hypot(a[0] - rail.p[0], a[1] - rail.p[1]), 24, 1e-9, 'from 24 m off the centre line');
  assert.ok(af.hall.some((h) => winds(end, h.o)), 'to a point inside the terminal hall');
  const len = Math.hypot(end[0] - a[0], end[1] - a[1]);
  assert.ok(len > 50 && len < 200, `the footbridge is ${len.toFixed(0)} m long`);
  assert.ok(!af.hall.some((h) => winds([end[0] - 2 * (end[0] - a[0]) / len, end[1] - 2 * (end[1] - a[1]) / len], h.o)), 'and no further than the first point inside');
  // a station on a line with no hall in reach has no footbridge, and the rest still stands
  const alone = S.stationSites({ ...af, hall: [] });
  assert.ok(alone[0].walk === null && alone[0].p[0] === rail.p[0], 'no hall: no footbridge');
  assert.equal(S.stationSites({ ...af, hall: undefined })[0].walk, null, 'no hall list at all');
  // a line with fewer than two points has no station; the others stay
  assert.deepEqual(S.stationSites({ ...af, phahon: [] }).map((st) => st.line), ['rail']);
  assert.deepEqual(S.stationSites({ ...af, phahon: [[0, 0]] }).map((st) => st.line), ['rail']);
  assert.deepEqual(S.stationSites({ ...af, rail: [[0, 0]] }).map((st) => st.line), ['phahon', 'phahon']);
  assert.equal(S.mappedSite({ cbld: [], bld: [], hall: [], pier: [], apron: [], tw: [], water: [] }, cls, L, [], S.stationSites({ ...af, rail: [] })).n.deck, 2);
  assert.deepEqual(S.nearestOnLine([[0, 0], [10, 0], [10, 10]], [12, 4]), { d: 2, p: [10, 4], dir: [0, 1] });
  assert.deepEqual(S.nearestOnLine([[0, 0], [10, 0], [10, 10]], [-3, -4]), { d: 5, p: [0, 0], dir: [1, 0] });
});

test('holes: a tree may stand on the island of a mapped pond and in the middle of a ring-shaped apron', () => {
  const sq = (c, r) => [[c[0] - r, c[1] - r], [c[0] + r, c[1] - r], [c[0] + r, c[1] + r], [c[0] - r, c[1] + r]];
  const none = { cbld: [], bld: [], hall: [], pier: [], tw: [] };
  const land = { e0: -500, n1: 4500, res: 2.5, w: 400, h: 400 }, dry = new Uint8Array(160000).fill(1);
  const site = S.mappedSite({ ...none, apron: [{ o: sq([0, 4000], 200), h: [sq([0, 4000], 100)] }], water: [{ o: sq([0, 4000], 30), h: [sq([0, 4000], 15)] }, { o: sq([300, 4000], 20) }] }, dry, land, []);
  assert.deepEqual(site.n, { apron: 1, water: 2 });
  assert.equal(site.hit(150, 4000, 4), 'apron', 'on the apron');
  assert.equal(site.hit(60, 4000, 4), null, 'in the hole of the apron, 40 m from its edge');
  assert.equal(site.hit(92, 4000, 4), 'apron', '8 m from the edge of the hole: within 7.5 m and a crown');
  assert.equal(site.hit(22, 4000, 4), 'water', 'in the pond');
  assert.equal(site.hit(0, 4000, 4), null, 'on the island, 15 m from the water');
  assert.equal(site.hit(10, 4000, 4), 'water', '5 m from the water: within a cell and a crown');
  assert.equal(site.hit(300, 4000, 4), 'water', 'a pond without holes');
});

test('a kept building is a box in the index: a tree keeps half a crown from its walls', () => {
  const site = new S.SiteIndex(), b = { e: 500, n: 4000, w: 20, d: 8, h: 12, yaw: 0.4, kind: 0, col: 0 };   // far from the airfield
  assert.equal(S.buildingProblem(site, b), null);
  const { kept, dropped } = S.siteBuildings(site, [b]);
  assert.deepEqual([kept, dropped, site.n], [[b], {}, { building: 1 }]);
  const c = Math.cos(0.4), s = Math.sin(0.4);
  assert.equal(S.treeProblem(site, 500 + 9 * c, 4000 + 9 * s, 6, 4), 'building', 'inside the long side');
  assert.equal(S.treeProblem(site, 500 + 11.9 * c, 4000 + 11.9 * s, 6, 4), 'building', '1.9 m beyond the end wall, crown 4 m');
  assert.equal(S.treeProblem(site, 500 + 12.1 * c, 4000 + 12.1 * s, 6, 4), null);
  // a building on the 21R approach lights, one through the transitional surface, one on a taxiway
  const E = S.RWY_END['21R'], at = (x, t) => [E.thr[1] + E.u[1] * x + E.r[1] * t, E.thr[0] + E.u[0] * x + E.r[0] * t];
  // (t = +240 m is the side away from the other runway). A 3 m shed 20 m long lies across the approach, 500 m out:
  // its middle is 68 m from the centre line, under the take-off climb surface (7 m there); its end is 58 m from it.
  const [le, ln] = at(-500, 68), [oe, on] = at(1000, 240), across = Math.atan2(E.r[0], E.r[1]);
  assert.equal(S.buildingProblem(site, { ...b, e: le, n: ln, h: 3, yaw: across }), 'lane', 'one end reaches into the lane');
  assert.equal(S.buildingProblem(site, { ...b, e: le, n: ln, h: 3, yaw: across + Math.PI / 2 }), null, 'turned along the approach it stays 64 m out');
  assert.equal(S.buildingProblem(site, { ...b, e: le, n: ln, h: 8, yaw: across + Math.PI / 2 }), 'ols', '8 m is through the take-off climb surface');
  assert.equal(S.buildingProblem(site, { ...b, e: oe, n: on, h: 16 }), 'ols', '16 m where the transitional surface is 14.3 m');
  assert.equal(S.buildingProblem(site, { ...b, e: oe, n: on, h: 12, w: 4, d: 4 }), null, '12 m is under it');
  const tw = new S.SiteIndex(); tw.add('taxiway', [[480, 3960], [520, 3960]], { half: 0 });
  assert.equal(S.buildingProblem(tw, b), 'taxiway');
});

test('a building with a side on a canal bank stays; one with its centre in water or on a bank line, or a fifth of its footprint on water, goes', () => {
  // cells of 2.5 m; water west of e = 0
  const land = { e0: -50, n1: 4050, res: 2.5, w: 40, h: 40 }, c = new Uint8Array(1600).fill(1);
  for (let y = 0; y < 40; y++) for (let x = 0; x < 20; x++) c[y * 40 + x] = S.WATER_CLASS;
  const site = new S.SiteIndex(); site.setRaster(c, land);
  const b = (e, yaw = 0) => ({ e, n: 4000, w: 10, d: 10, h: 6, yaw });
  assert.equal(S.WET_MAX, 0.2);
  // the share: points 1.25 m apart (half a cell) and at least eight along a side, so a 10 m side has eight columns
  const wetShare = (st, x) => S.groundShare(st, x).water;
  assert.deepEqual([10, 4.5, 4, 2.5, 0, -2.5, -20].map((e) => wetShare(site, b(e))), [0, 0, 0.125, 0.25, 0.5, 0.75, 1]);
  near(wetShare(site, b(0, Math.PI / 4)), 0.5, 1e-9, 'turned 45° about a point on the bank: half of it (the eight points on the bank line itself count half)');
  near(wetShare(site, { e: 1, n: 4000, w: 30, d: 4, h: 6, yaw: Math.PI / 2 }), 0.25, 1e-9, 'a long building along the bank, a metre of its 4 m in the water');
  assert.deepEqual(S.groundShare(new S.SiteIndex(), b(-20)), { water: 0, road: 0 }, 'no land-use map: neither water nor road');
  assert.equal(S.buildingProblem(site, b(10)), null, 'dry');
  assert.equal(S.buildingProblem(site, b(4)), null, 'a metre of its west side over the water');
  assert.equal(S.buildingProblem(site, b(2.5)), 'water', 'a quarter of it in the water, the centre and all nine points but three dry');
  assert.equal(S.buildingProblem(site, { e: 1, n: 4000, w: 30, d: 4, h: 6, yaw: Math.PI / 2 }), 'water', 'the long building: its centre is dry');
  assert.equal(S.buildingProblem(site, b(-20)), 'water');
  // a canal one cell wide under the middle of a 20 m building: an eighth of the footprint, but the centre is in it
  const canal = new Uint8Array(1600).fill(1); for (let y = 0; y < 40; y++) canal[y * 40 + 20] = S.WATER_CLASS;   // e 0 … 2.5
  const sc = new S.SiteIndex(); sc.setRaster(canal, land);
  near(wetShare(sc, { ...b(1), w: 20 }), 0.125, 1e-9, 'one cell of eight');
  assert.equal(S.buildingProblem(sc, { ...b(1), w: 20 }), 'water', 'astride the canal');
  // the centre on either bank line of that canal: the same house, the same eighth, the same verdict
  assert.deepEqual([wetShare(sc, { ...b(0), w: 20 }), wetShare(sc, { ...b(2.5), w: 20 })], [0.125, 0.125]);
  assert.deepEqual([S.buildingProblem(sc, { ...b(0), w: 20 }), S.buildingProblem(sc, { ...b(2.5), w: 20 })], ['water', 'water'], 'the centre on the west and on the east bank line');
  assert.deepEqual([S.buildingProblem(sc, { ...b(-0.01), w: 20 }), S.buildingProblem(sc, { ...b(2.51), w: 20 })], [null, null], 'a centimetre off the bank on either side: the share decides, an eighth');
  assert.equal(S.buildingProblem(sc, { ...b(8), w: 20 }), null, 'the same canal under one end of it');
  // a pond smaller than the building, missed by the centre and by every point on the outline
  const pond = new Uint8Array(1600).fill(1); for (let y = 16; y < 20; y++) for (let x = 21; x < 25; x++) pond[y * 40 + x] = S.WATER_CLASS;   // e 2.5 … 12.5, n 4000 … 4010
  const sp = new S.SiteIndex(); sp.setRaster(pond, land);
  const big = { e: 5, n: 3999, w: 28, d: 28, h: 6, yaw: 0 };
  near(wetShare(sp, big), 100 / 784, 0.03, 'a 10 m pond under a 28 m building');
  assert.equal(S.buildingProblem(sp, big), null, 'an eighth of the footprint');
  near(wetShare(sp, { ...big, w: 14, d: 24 }), 95 / 336, 0.03, 'the same pond under a 14 m × 24 m building');
  assert.equal(S.buildingProblem(sp, { ...big, w: 14, d: 24 }), 'water', 'over a quarter, though its centre and the nine points are dry');
});

test('a building may reach into a road, but not stand in it: a third of its footprint, whichever side of the road', () => {
  assert.deepEqual([S.ROAD_CLASSES, S.ROAD_MAX, S.WATER_CLASS], [[13, 18], 1 / 3, 12]);
  // cells of 2.5 m; a road 7.5 m wide along n at e 0 … 7.5, and a railway (class 18) at e 30 … 35
  const land = { e0: -50, n1: 4050, res: 2.5, w: 40, h: 40 }, c = new Uint8Array(1600).fill(2);
  for (let y = 0; y < 40; y++) { for (let x = 20; x < 23; x++) c[y * 40 + x] = 13; for (let x = 32; x < 34; x++) c[y * 40 + x] = 18; }
  const site = new S.SiteIndex(); site.setRaster(c, land);
  const b = (e, w = 10) => ({ e, n: 4000, w, d: 10, h: 6, yaw: 0 });
  const classes = (e) => { const o = new Set(); site.eachClassAt(e, 4000, (k) => o.add(k)); return [...o].sort((x, y) => x - y); };
  assert.deepEqual([1, -1, 31, 500].map(classes), [[13], [2], [18], [0]]);
  assert.deepEqual([-10, -3, -1.25, 10.5].map((e) => S.groundShare(site, b(e))), [{ water: 0, road: 0 }, { water: 0, road: 0.25 }, { water: 0, road: 0.375 }, { water: 0, road: 0.25 }]);
  assert.equal(S.buildingProblem(site, b(-3)), null, 'a quarter of it over the west edge of the road');
  assert.equal(S.buildingProblem(site, b(10.5)), null, 'and over the east edge');
  assert.equal(S.buildingProblem(site, b(-1.25)), 'road', 'three eighths of it on the road, from the west');
  assert.equal(S.buildingProblem(site, b(8.75)), 'road', 'and from the east');
  assert.equal(S.buildingProblem(site, b(3.75, 6)), 'road', 'a narrow house wholly in the road');
  assert.equal(S.groundShare(site, b(7.5, 15)).road, 0.5, 'a 15 m house from one kerb across the 7.5 m road and as far beyond');
  assert.equal(S.buildingProblem(site, b(7.5, 15)), 'road', 'half of it on the road');
  assert.equal(S.buildingProblem(site, b(11.25, 15)), null, 'moved a cell and a half further: a quarter');
  // The regression: the city data puts no centre inside a road cell, only on cell borders, and a border point was
  // read as the cell east or south of it. A long house with its centre on the west kerb used to go and the same house
  // on the east kerb to stay; with a quarter of the footprint on the road both stay.
  assert.deepEqual([classes(0), classes(7.5)], [[2, 13], [2, 13]], 'either kerb is a cell border: road on one side of it');
  assert.deepEqual([S.groundShare(site, b(0, 30)).road, S.groundShare(site, b(7.5, 30)).road], [0.25, 0.25]);
  assert.deepEqual([S.buildingProblem(site, b(0, 30)), S.buildingProblem(site, b(7.5, 30))], [null, null], 'the centre on either kerb: the share decides');
  // A house square to the map has whole columns of sample points on cell borders. An 8 m house 2.5 m into the road
  // from the west (e −5.5 … 2.5) and its mirror image from the east (e 5 … 13): 0.3125 each, under a third. With a
  // border given to one side they read 0.375 and 0.25, and only the western one went.
  near(S.groundShare(site, b(-1.5, 8)).road, 0.3125, 1e-12, 'from the west'); near(S.groundShare(site, b(9, 8)).road, 0.3125, 1e-12, 'from the east');
  assert.deepEqual([S.buildingProblem(site, b(-1.5, 8)), S.buildingProblem(site, b(9, 8))], [null, null]);
  // and 3 m into it from either side (0.375): both go
  assert.deepEqual([S.buildingProblem(site, b(-1, 8)), S.buildingProblem(site, b(8.5, 8))], ['road', 'road']);
  // the centre is not asked, wherever it is: a 30 m house with its centre inside a road cell (on no border of it) and
  // a quarter on the road
  const inRoad = { ...b(3.75, 30), n: 4001 }, under = []; site.eachClassAt(inRoad.e, inRoad.n, (k, share) => under.push([k, share]));
  assert.deepEqual(under, [[13, 1]], 'the centre lies in one road cell');
  assert.equal(S.groundShare(site, inRoad).road, 0.25); assert.equal(S.buildingProblem(site, inRoad), null, 'the centre in the road, a quarter of the house on it');
  // a long house lying along the road, three quarters of its 10 m on it: size does not excuse it
  assert.equal(S.buildingProblem(site, { e: 3.75, n: 4001, w: 34, d: 10, h: 6, yaw: Math.PI / 2 }), 'road');
  // which classes are road: a 7.5 m strip of each class from 11 to 20 under a narrow house
  for (let k = 11; k <= 20; k++) {
    const ck = new Uint8Array(1600).fill(2); for (let y = 0; y < 40; y++) for (let x = 20; x < 23; x++) ck[y * 40 + x] = k;
    const sk = new S.SiteIndex(); sk.setRaster(ck, land);
    assert.equal(S.buildingProblem(sk, b(3.75, 6)), k === 12 ? 'water' : k >= 13 && k <= 18 ? 'road' : null, `a strip of class ${k}`);
  }
  assert.equal(S.buildingProblem(site, b(31)), 'road', 'on the railway');
  assert.equal(S.buildingProblem(site, b(20)), null, 'between the road and the railway');
  // water comes first: a building with a quarter of it in a canal and three eighths on the road is reported as 'water'
  const c2 = c.slice(); for (let y = 0; y < 40; y++) for (let x = 14; x < 18; x++) c2[y * 40 + x] = 12;     // e −15 … −5
  const s2 = new S.SiteIndex(); s2.setRaster(c2, land);
  assert.deepEqual(S.groundShare(s2, b(0.5, 20)), { water: 0.25, road: 0.375 });
  assert.equal(S.buildingProblem(s2, b(0.5, 20)), 'water');
  assert.equal(S.buildingProblem(site, b(0.5, 20)), 'road', 'without the canal: the road');
});

test('a building is tried at nine points: the middle of a side alone can put it on a deck or in a lane', () => {
  // a deck 4 m wide runs into the middle of the long side of a 30 m building and stops 2 m inside it: the corners
  // are 15 m from it, the centre 3 m
  const site = new S.SiteIndex(), b = { e: 500, n: 4000, w: 30, d: 10, h: 6, yaw: 0 };
  site.add('deck', [[500, 3960], [500, 3995]], { half: 2 });
  assert.equal(S.buildingProblem(site, b), 'deck', 'the middle of the south side is under the deck');
  assert.equal(S.buildingProblem(site, { ...b, n: 4004 }), null, 'moved 4 m north it is clear of it');
  // a mapped building touching the middle of an end wall only
  const s2 = new S.SiteIndex(); s2.add('building', [[514, 3999], [530, 3999], [530, 4001], [514, 4001]]);
  assert.equal(S.buildingProblem(s2, b), 'building', 'the middle of the east end is inside it');
  assert.equal(S.buildingProblem(s2, { ...b, w: 26 }), null, 'a shorter one ends a metre before it');
});

test('55-city.js builds with the rules: index, buildings, trees, stations and the footbridge', () => {
  const src = live('55-city.js');
  assert.ok(src.includes('const af = data.af, cls = landClassArray(data.landIn), stations = stationSites(af);'), 'the stations, before anything is placed');
  assert.ok(src.includes('const site = mappedSite(af, cls, LAND.in, Object.keys(VIADUCT).map((k) => [af[k], VIADUCT[k].w]), stations);'), 'the index of what is mapped, with the deck widths and the stations');
  assert.ok(src.includes('({ kept: list, dropped: out.bldDropped } = siteBuildings(site, list));'), 'generated buildings pass the rules');
  // the list the rules see is the list that is drawn: thinned for the balanced quality first, as place() above does
  const thin = "if (quality !== 'high') list = list.filter((b, i) => Math.hypot(b.e * 0.9, b.n * 0.55) < 2200 || i % 3 === 0);";
  assert.ok(src.includes(thin) && src.indexOf(thin) < src.indexOf('siteBuildings(site, list)') && src.indexOf(thin) > src.indexOf('let list = decodeBuildings(data.bld);'), 'thinned before the rules');
  assert.ok(src.indexOf('siteBuildings(site, list)') < src.indexOf('new THREE.InstancedMesh(box, mats.inst, n)'), 'before they are drawn');
  // each is drawn as the footprint the rules judged: w along (cos yaw, sin yaw) in (e, n), d across, centre (e, n)
  // (the box test above shows that a three.js box turned by yaw about +y at (e, 0, −n) is that footprint)
  assert.ok(src.includes('q.setFromAxisAngle(up, b.yaw); sc.set(b.w, b.h, b.d); p.set(b.e, 0, -b.n);'), 'the drawn box is the judged footprint');
  for (const k of Object.keys(VIADUCT)) assert.ok(src.includes(`viaduct(af.${k}, VIADUCT.${k});`), `the ${k} deck is drawn with the width the index has`);
  // the stations and the footbridge are drawn from the list the index was given, in the sizes it has
  assert.ok(src.includes('for (const { p: center, yaw, len, wid, y0, h, vault, roof, bridge, walk } of stations) {'), 'stations');
  assert.ok(src.includes('const r = new THREE.CylinderGeometry(roof[1] / 2, roof[1] / 2, roof[0], 28, 1, false, 0, Math.PI);'), 'the roof the index knows');
  assert.ok(src.includes('segBox(a, end, 6, 4.4, 9.2, C.glass); segBox(a, end, WALK_W, 0.5, 11.6, C.roof); segBox(a, end, WALK_W, 0.5, 6.8, C.deck);'), 'the footbridge, as wide as the index has it');
  assert.ok(!/site\.(add|box)\(/.test(src), 'nothing enters the index behind the back of the rules');
  assert.ok(src.includes('const trees = placeTrees(cls, LAND.in, quality, rnd, site);'), 'trees pass the rules');
  assert.ok(src.indexOf('placeTrees(') > src.indexOf('siteBuildings(site, list)'), 'after the buildings are in the index');
  // the index is not kept: with every building in it, it holds tens of megabytes
  assert.ok(!/\bout\.site\b/.test(src) && !/\bsite\b/.test(src.slice(src.indexOf('placeTrees(cls, LAND.in, quality, rnd, site);') + 45)), 'the index is dropped after the trees');
  // The trees take the random stream after exactly two draws per mapped footprint (DRAWS_BEFORE_TREES above), and
  // nothing else draws from it before them.
  const before = src.slice(src.indexOf('const rnd = makeRng(4242);'), src.indexOf('placeTrees('));
  assert.ok(before.includes('for (const b of data.af.cbld) footprint(b.o, b.z, WALLS[Math.floor(rnd() * WALLS.length)], ROOFS[Math.floor(rnd() * ROOFS.length)]);'), 'a wall and a roof colour per city block');
  assert.ok(before.includes("for (const b of data.af.bld) if (b.k === 's' || b.k === 'b') footprint(b.o, b.z, WALLS[Math.floor(rnd() * WALLS.length)], ROOFS[Math.floor(rnd() * ROOFS.length)]);"), 'and per mapped building of kind s or b');
  assert.equal(before.split('rnd()').length - 1, 4, 'no other draw before the trees');
  assert.equal(DRAWS_BEFORE_TREES, 3414);
  assert.ok(src.includes('arr.forEach(([e, nn, s, r, hk], i) => { q.setFromAxisAngle(up, r); sc.set(s, s * hk, s); p.set(e, 0, -nn);'), 'each tree is drawn with the height the rules judged');
  assert.ok(!/\bfunction (pointInPoly|rwyST|rwyEN|onAnyRunway)\b/.test(live('50-airfield.js')), 'the helpers live in 17-siting.js only');
  // the pure file comes after the geometry and before the flight model, and touches no DOM
  const order = fs.readdirSync(new URL('../src/', import.meta.url)).filter((f) => f.endsWith('.js')).sort();
  assert.ok(order.indexOf('17-siting.js') === order.indexOf('15-geo.js') + 1, 'build order');
  assert.ok(!/\b(document|window|THREE|navigator)\b/.test(live('17-siting.js')), '17-siting.js stays DOM-free');
});
