// Runway and approach lights (`airfieldLights` in src/60-lights.js): which systems each end has comes from AIP Thailand
// AD 2.14 for VTBD, how each is laid out from ICAO Annex 14 Vol I, 5.3. The tests read the lights back by where they
// are and by what a pilot sees of them (the colour and direction rules of the light shader, repeated in `seen`).
// Run: node --test test/lights.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');
const strip = (t) => t.replace(/\/\*(?! glsl \*\/)[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');
const live = (f) => strip(read(f));
// 60-lights.js on top of the pure files; plSample (50-airfield.js) walks the roads and the railway for their lamps and
// is left empty here (the taxiway edge lights have their own walk, pointAlong)
const PURE = ['10-atmo.js', '15-geo.js', '17-siting.js', '20-flight.js', '48-data.js', '60-lights.js'].map(read).join('\n');
// LightSet.build only fills typed arrays and hands them to three.js: these stand-ins keep what it was given
const THREE_STUB = {
  BufferGeometry: class { constructor() { this.attributes = {}; } setAttribute(k, v) { this.attributes[k] = v; } },
  BufferAttribute: class { constructor(array, itemSize) { this.array = array; this.itemSize = itemSize; } },
  Points: class { constructor(geometry, material) { this.geometry = geometry; this.material = material; } },
};
const NAMES = 'RUNWAYS, RWY_END, rwyST, rwyEN, ALS, ALS_LANE, RWY_PAD, TWY_W, SITE_GAP, SiteIndex, TDZ_T, EDGE_OUT, TWY_EDGE, APRON_EDGE, SFL_FLASH, alsArms, alsStandH, alsLightY, alsStands, taxiEdgeLights, decodeLights, LC, airfieldLights, LightSet, buildAirfieldLights';
const M = new Function('plSample', 'THREE', `"use strict";\n${PURE}\nreturn { ${NAMES} };`)(() => {}, THREE_STUB);
const SET = M.airfieldLights({ papiPos: [], towerTop: null, masts: [], sockPos: [] }, { af: { tw: [], tollway: [], rail: [], phahon: [] }, lights: new ArrayBuffer(0) });
const { LC } = M, ENDS = Object.values(M.RWY_END);
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b} (±${tol})`);
const name = (c) => Object.keys(LC).find((k) => LC[k].join() === c.join()) || (c.join() === '1,1,1' ? 'flash' : c.join());

// the directional lights, each with its place in the coordinates of a runway end: s metres along the landing
// direction from the threshold, t metres to the right of the centre line, y above the ground
const DIR = SET.L.filter((l) => l.kind === 1 || l.kind === 2 || l.kind === 4);
const at = (E, l) => { const dn = -l.p[2] - E.thr[0], de = l.p[0] - E.thr[1]; return { l, s: dn * E.u[0] + de * E.u[1], t: dn * E.r[0] + de * E.r[1], y: l.p[1] }; };
const eye = (E, s, t, y) => [E.thr[1] + E.u[1] * s + E.r[1] * t, y, -(E.thr[0] + E.u[0] * s + E.r[0] * t)];
// what the vertex shader shows of a light from a camera: its colour and the share of its intensity sent that way
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function seen(l, cam) {
  const dx = cam[0] - l.p[0], dz = cam[2] - l.p[2], len = Math.max(Math.hypot(dx, dz), 1e-3), s = (dx * l.axis[0] + dz * l.axis[1]) / len;
  if (l.kind === 1) return { col: name(s < 0 ? l.a : l.b), f: 0.3 + 0.7 * smooth(0.05, 0.5, Math.abs(s)) };
  return { col: name(l.a), f: smooth(0.05, 0.45, -s) };
}
const onApproach = (E) => eye(E, -3000, 0, 157);        // on a 3° path, 3 km before the threshold
const onRunway = (E) => eye(E, 1200, 0, 3);             // rolling out, 1.2 km past the threshold
const beyondEnd = (E) => eye(E, E.lda + 3000, 0, 157);  // looking back from beyond the far end
const AIP = { '03L': { als: 'SALS420', len: 420, step: 30, w: 60 }, '21R': { als: 'CAT2', len: 900, step: 30, w: 60 }, '03R': { als: 'SALS300', len: 300, step: 60, w: 45 }, '21L': { als: 'CAT1', len: 900, step: 30, w: 45 } };
const r6 = (v) => Math.round(v * 1e6) / 1e6 || 0;       // to the micrometre, and never −0
const sorted = (a) => [...a].map(r6).sort((x, y) => x - y);
const steps = (a) => sorted(a).slice(1).map((v, i) => r6(v - sorted(a)[i]));

test('the shader rules that `seen` repeats are the ones in the light shader', () => {
  const src = live('60-lights.js');
  assert.ok(src.includes('vec2 h = toCam.xz / max(length(toCam.xz), 1e-3);') && src.includes('float s = dot(h, aAxis);'), 'side of the light the camera is on');
  assert.ok(src.includes('if (kind == 1) { col = s < 0.0 ? aColA : aColB; I *= mix(0.3, 1.0, smoothstep(0.05, 0.5, abs(s))); }'), 'two-way');
  assert.ok(src.includes('else if (kind == 2) { I *= smoothstep(0.05, 0.45, -s); }'), 'one-way');
  assert.ok(src.includes('else if (kind == 4) { float ph = fract(uTime * 2.0 - aP.y); I *= smoothstep(0.05, 0.45, -s) * (1.0 - smoothstep(${SFL_FLASH[0].toFixed(3)}, ${SFL_FLASH[1].toFixed(3)}, ph)); }'), 'flasher: twice a second, later with a larger phase, lit for SFL_FLASH of the cycle');
  assert.ok(src.includes('col = mix(vec3(1.0, 0.04, 0.02), vec3(1.0, 0.96, 0.9), smoothstep(aP.y - 0.025, aP.y + 0.025, el));') && src.includes('float el = degrees(atan(toCam.y, length(toCam.xz)));'), 'PAPI: red below the angle of the unit, white above it');
  assert.ok(src.includes('I *= smoothstep(0.80, 0.92, -s);'), 'PAPI: toward the approach only');
  assert.ok(src.includes('vec3 col = aColA; float I = aP.x;') && src.includes('float cat = aP.z;') && src.includes('I *= on * mix(1.0, aP.w, uDay);'), 'aP holds intensity, phase or angle, category, day factor');
  assert.ok(src.includes('float on = cat < 0.5 ? uOnAF : (cat < 1.5 ? 1.0 : (cat < 2.5 ? uNightF : uOnAC));'), 'category 0 airfield lighting, 1 always on, 2 at night');
  assert.deepEqual(ENDS.map((E) => [E.id, E.als, E.w, E.disp, E.tdz]), [['03L', 'SALS420', 60, 0, false], ['21R', 'CAT2', 60, 0, true], ['03R', 'SALS300', 45, 0, false], ['21L', 'CAT1', 45, 350, false]], 'AIP AD 2.12 and 2.14');
});

test('every runway and approach light is airfield lighting, lit, and low or on its stand', () => {
  // category 0 is on at night and in low visibility by day (the shader's uOnAF); intensity and day factor above 0
  assert.equal(DIR.length, 420 + 623 + 37, 'two-way, one-way and flashing lights');
  for (const l of DIR) assert.ok(l.cat === 0 && l.I >= 0.2 && l.day > 0, `a ${name(l.a)} light of kind ${l.kind} at ${l.p.map((v) => v.toFixed(0))}: category ${l.cat}, intensity ${l.I}`);
  // lights of the runway itself are inset or a foot high; only approach lights stand higher
  for (const l of DIR) {
    const R = M.RUNWAYS.find((r) => { const [s, t] = M.rwyST(r, l.p[0], -l.p[2]); return s >= -1.5 && s <= r.len + 1.5 && Math.abs(t) <= r.w / 2 + 11; });
    if (R) assert.ok(l.p[1] > 0 && l.p[1] <= 0.36, `a light on ${R.id} is ${l.p[1]} m above the ground`);
    else assert.ok(l.kind !== 1 && l.p[1] >= 0.25 && l.p[1] <= 11.5, `an approach light ${l.p[1].toFixed(2)} m above the ground`);
  }
});

test('how bright each system is, by night and by day (values set by eye: regression pins)', () => {
  // kind, colour toward the approach or along the runway (two-way: both), intensity, day factor: how many
  const table = {};
  for (const l of DIR) { const k = `${l.kind} ${name(l.a)}${l.kind === 1 ? '/' + name(l.b) : ''} ${l.I} ${l.day}`; table[k] = (table[k] || 0) + 1; }
  assert.deepEqual(table, {
    '1 white/white 0.32 0.6': 162, '1 white/yellow 0.32 0.6': 40, '1 yellow/white 0.32 0.6': 28, '1 yellow/red 0.32 0.6': 12,   // runway edge
    '1 green/red 0.38 0.6': 35, '1 red/green 0.38 0.6': 20,                                                                     // threshold and end
    '1 white/white 0.22 0.3': 83, '1 white/red 0.22 0.3': 20, '1 red/white 0.22 0.3': 20,                                       // centre line
    '2 white 0.2 0.3': 90,                                                                                                      // touchdown zone
    '2 green 0.38 0.6': 25, '2 red 0.38 0.6': 15,                                                                               // THR 21L with wing bars, end of 03R
    '2 white 0.42 1.6': 439, '2 red 0.36 1.4': 54,                                                                              // approach lights, CAT II side rows
    '4 flash 4 1.2': 37,                                                                                                        // flashing lights
  });
});

test('LightSet.build hands every light to the shader in the slots it reads', () => {
  const pts = SET.build('the material'), g = pts.geometry.attributes, n = SET.L.length;
  assert.equal(pts.material, 'the material');
  assert.deepEqual(Object.keys(g).sort().map((k) => [k, g[k].itemSize, g[k].array.length / n]), [['aAxis', 2, 2], ['aColA', 3, 3], ['aColB', 3, 3], ['aKind', 1, 1], ['aP', 4, 4], ['position', 3, 3]]);
  const f = (a) => a.map(Math.fround), cut = (k, i) => [...g[k].array.slice(i * g[k].itemSize, (i + 1) * g[k].itemSize)];
  SET.L.forEach((l, i) => {
    assert.deepEqual(cut('position', i), f(l.p)); assert.deepEqual(cut('aColA', i), f(l.a)); assert.deepEqual(cut('aColB', i), f(l.b)); assert.deepEqual(cut('aAxis', i), f(l.axis));
    assert.deepEqual([cut('aKind', i), cut('aP', i)], [[l.kind], f([l.I, l.param, l.cat, l.day])], 'kind; then intensity, phase or angle, category, day factor (aP.x … aP.w in the shader)');
  });
});

// is (e, n) inside a polygon (crossing number), the distance from (e, n) to a polyline, the length of a polyline and
// the point s metres along it, all worked here on their own
function inside(P, e, n) {
  let c = 0;
  for (let i = 0; i < P.length; i++) {
    const [ax, ay] = P[i], [bx, by] = P[(i + 1) % P.length];
    if ((ay <= n && by > n) || (by <= n && ay > n)) { if (ax + (n - ay) / (by - ay) * (bx - ax) > e) c++; }
  }
  return c % 2 === 1;
}
function lineDist(P, e, n) {
  let best = Infinity;
  for (let i = 1; i < P.length; i++) {
    const [ax, ay] = P[i - 1], [bx, by] = P[i], dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
    const k = L2 ? Math.min(1, Math.max(0, ((e - ax) * dx + (n - ay) * dy) / L2)) : 0;
    best = Math.min(best, Math.hypot(e - ax - k * dx, n - ay - k * dy));
  }
  return best;
}
const segs = (P) => P.slice(1).map((b, i) => [P[i], b, Math.hypot(b[0] - P[i][0], b[1] - P[i][1])]);
const lineLen = (P) => segs(P).reduce((a, g) => a + g[2], 0);
function alongLine(P, s) {
  const G = segs(P); let left = Math.min(Math.max(s, 0), lineLen(P));
  for (const [a, b, l] of G) { if (left <= l && l > 0) return [a[0] + (b[0] - a[0]) * left / l, a[1] + (b[1] - a[1]) * left / l]; left -= l; }
  return P[P.length - 1];
}

// The whole layout on the real data: the airfield vectors, the street-light records, and a field with one of each
// thing buildAirfield hands over (the PAPI of 21R at 400 m, a tower, two masts, a windsock).
const REAL = (() => {
  const af = JSON.parse(fs.readFileSync(new URL('../data/vtbd_af.json', import.meta.url)));
  const b = Buffer.from(JSON.parse(fs.readFileSync(new URL('../data/city.json', import.meta.url))).lights, 'base64'), lights = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
  // the real polyline sampler of 50-airfield.js, for the lamps along the roads
  const plSample = new Function(/\nfunction plSample\(P, step, fn\) \{[\s\S]*?\n\}\n/.exec(read('50-airfield.js'))[0] + 'return plSample;')();
  const W = new Function('plSample', 'THREE', `"use strict";\n${PURE}\nreturn { ${NAMES} };`)(plSample, THREE_STUB);
  const E = W.RWY_END['21R'], papi = [0, 1, 2, 3].map((i) => ({ e: E.thr[1] + E.u[1] * 400 + E.r[1] * (45 + 9 * i), n: E.thr[0] + E.u[0] * 400 + E.r[0] * (45 + 9 * i), u: [E.u[1], E.u[0]], ang: 2.5 + i / 3 }));
  const field = { papiPos: papi, towerTop: { x: 100, y: 60, z: -200 }, towerCab: { x: 100, y: 50, z: -200 }, masts: [[300, 900], [400, 1000]], sockPos: [[0, 0]] };
  const set = W.airfieldLights(field, { af, lights });
  return { af, lights, W, field, set, all: set.L };
})();

test('the whole layout runs on the real data: PAPI, beacon, obstruction, road and street lights too', () => {
  const { af, lights, W, field, all } = REAL, E = W.RWY_END['21R'];
  assert.ok(all.every((l) => l.p.length === 3 && l.p.every(Number.isFinite) && Number.isFinite(l.I) && l.I > 0 && l.a.every(Number.isFinite) && l.axis.every(Number.isFinite) && Number.isFinite(l.param)), 'every light has a place, a colour and an intensity');
  const kinds = {}; for (const l of all) kinds[l.kind] = (kinds[l.kind] || 0) + 1;
  // the runway and approach lights are the same as without the data; then four PAPI units, a beacon, a blinking
  // light per mast
  assert.deepEqual([kinds[1], kinds[2], kinds[4], kinds[3], kinds[5], kinds[6]], [420, 623, 37, 4, 1, 2]);
  assert.deepEqual(Object.keys(kinds).sort(), ['0', '1', '2', '3', '4', '5', '6'], 'no other kind of light in the airfield layout');
  const street = W.decodeLights(lights).length;
  assert.ok(street > 30000 && all.length > street + 6000, `${street} street lights in city.json, ${all.length} lights in all`);
  // PAPI: a unit shows toward the approach only, red below its angle and white above it, by day too
  const units = all.filter((l) => l.kind === 3);
  units.forEach((l, i) => {
    const pp = field.papiPos[i];
    assert.deepEqual([l.cat, l.I, l.day, l.param], [1, 0.5, 8, pp.ang], 'always on, bright by day, its own angle');
    near(Math.hypot(l.p[0] - (pp.e - pp.u[0] * 0.55), -l.p[2] - (pp.n - pp.u[1] * 0.55)), 0, 1e-9, 'just before its unit'); near(l.p[1], 0.64, 1e-9, 'at the height of the unit');
    const toward = (cam) => { const dx = cam[0] - l.p[0], dz = cam[2] - l.p[2], len = Math.hypot(dx, dz); return smooth(0.80, 0.92, -(dx * l.axis[0] + dz * l.axis[1]) / len); };
    assert.equal(toward(onApproach(E)), 1, 'seen from the approach'); assert.equal(toward(onRunway(E)), 0, 'not from the runway');
    for (const [el, col] of [[pp.ang - 0.2, 'red'], [pp.ang + 0.2, 'white']]) assert.equal(smooth(l.param - 0.025, l.param + 0.025, el) > 0.5 ? 'white' : 'red', col, `unit ${i} at ${el.toFixed(2)}°`);
  });
  assert.deepEqual(units.map((l) => (3 > l.param ? 'white' : 'red')), ['white', 'white', 'red', 'red'], 'on the 3° path: two white, two red');
  // aerodrome beacon above the tower cab, a red light on the tower top and a blinking one on each mast
  const beacon = all.find((l) => l.kind === 5), top = all.find((l) => l.kind === 0 && l.p[0] === 100 && l.p[1] === 60);
  assert.deepEqual([beacon.p, beacon.cat], [[100, 50 + 4.4, -200], 2], 'the beacon, at night');
  assert.deepEqual([name(top.a), top.cat, top.p], ['red', 1, [100, 60, -200]], 'obstruction light on the tower');
  assert.deepEqual(all.filter((l) => l.kind === 6).map((l) => [l.p[0], l.p[1], -l.p[2], name(l.a), l.cat]), field.masts.map(([e, n]) => [e, 31.4, n, 'red', 1]), 'a red light on each mast');
  // the only steady lights in the airfield category are the taxiway edge lights (next test)
  assert.ok(all.filter((l) => l.kind === 0 && l.cat === 0).every((l) => l.a === W.LC.blue), 'steady airfield lights are blue');
  // Every steady light, the beacon and the mast lights: kind, colour, category, day factor and height, then how many
  // and how bright (set by eye: regression pins, measured on 2026-11-26). The lamps of the tollway, the railway and
  // Phahonyothin road, the street lights of city.json and the far suburbs are lit at night only (category 2).
  const groups = {};
  for (const l of all) if (l.kind === 0 || l.kind === 5 || l.kind === 6) {
    const k = `${l.kind} ${name(l.a)} cat ${l.cat} day ${l.day} y ${l.p[1]}`, g = groups[k] || (groups[k] = [0, l.I, l.I]);
    g[0]++; g[1] = Math.min(g[1], l.I); g[2] = Math.max(g[2], l.I);
  }
  assert.deepEqual(Object.fromEntries(Object.entries(groups).map(([k, [n, lo, hi]]) => [k, lo === hi ? [n, lo] : [n, Math.round(lo * 100) / 100, Math.round(hi * 100) / 100]])), {
    '0 blue cat 0 day 0.4 y 0.3': [401, 0.13],                                             // taxiway edge
    '0 red cat 1 day 1.4 y 60': [1, 0.25], '5 flash cat 2 day 0.5 y 54.4': [1, 3],         // tower top; the beacon (plain white, as the flashers)
    '6 red cat 1 day 1.4 y 31.4': [2, 0.2], '0 led cat 2 day 0.2 y 29.6': [6, 1.4],        // masts: obstruction light, three floodlights each
    '0 warm cat 2 day 0.1 y 6.6': [1, 0.12],                                               // windsock
    '0 led cat 2 day 0.05 y 24': [510, 0.32], '0 sodium cat 2 day 0.05 y 10': [374, 0.3],  // tollway deck and the road beside it
    '0 led cat 2 day 0.05 y 19': [217, 0.16], '0 sodium cat 2 day 0.05 y 9': [466, 0.28],  // railway viaduct, Phahonyothin road
    '0 sodium cat 2 day 0.02 y 9': [7244, 0.26],                                           // street lights of city.json: main roads
    '0 warm cat 2 day 0.02 y 6': [36224, 0.1], '0 led cat 2 day 0.02 y 6': [18046, 0.1],   //   and the others, one in three of them LED
    '0 warm cat 2 day 0.02 y 5': [2080, 0.12, 0.24], '0 sodium cat 2 day 0.02 y 5': [3139, 0.12, 0.24],  // far suburbs, each cluster at its own brightness
  });
  assert.equal(7244 + 36224 + 18046, street, 'one light per street-light record');
  // the lights are drawn whatever the camera frames (no bounds are worked out for them), late in the frame
  assert.ok(live('60-lights.js').includes('const pts = new THREE.Points(g, mat); pts.frustumCulled = false; pts.renderOrder = 20;'));
});

test('taxiway edge lights: on every taxiway (AIP AD 2.15), at the edge, never on pavement, none missing without a cause', () => {
  const { af, W, all } = REAL;
  assert.deepEqual([M.TWY_W, M.EDGE_OUT, M.TWY_EDGE, M.APRON_EDGE], [23, 0.6, { step: 45, chord: 25, gap: 7.5 }, 3]);
  assert.equal(live('50-airfield.js').split('ribbonGeo(t.p, TWY_W)').length - 1, 2, 'the page draws taxiways and taxilanes that wide');
  assert.ok(live('50-airfield.js').includes('const hw = TWY_W / 2;'), 'and the holding position bars across them');
  const blue = all.filter((l) => l.kind === 0 && l.a === W.LC.blue), at2 = blue.map((l) => [l.p[0], -l.p[2]]);
  assert.deepEqual(at2, W.taxiEdgeLights(af), 'the places of taxiEdgeLights');
  for (const l of blue) assert.deepEqual([l.p[1], l.cat, l.I, l.day], [0.3, 0, 0.13, 0.4], 'low, airfield lighting');
  const lines = af.tw.filter((t) => t.p.length > 1), off = M.TWY_W / 2 + M.EDGE_OUT;
  const rings = af.apron.flatMap((a) => [a.o, ...(a.h || [])].map((r) => [...r, r[0]]));
  const onApron = (e, n) => af.apron.some((a) => inside(a.o, e, n) && !(a.h || []).some((h) => inside(h, e, n)));
  const apronEdge = (e, n) => Math.min(...rings.map((r) => lineDist(r, e, n)));
  // Sound: every light stands at the edge of a taxiway and on no pavement (the regression: of the 248 lights the
  // page had, 87 stood on the pavement of a joining taxiway, a taxilane or an apron and 14 on that of their own
  // taxiway, at jogs of the line).
  at2.forEach(([e, n], i) => {
    const d = Math.min(...lines.map((t) => lineDist(t.p, e, n))), what = `the light at ${e.toFixed(0)}, ${n.toFixed(0)}`;
    assert.ok(d >= M.TWY_W / 2, `${what}: ${d.toFixed(1)} m from a taxiway centre line, on the pavement`);
    assert.ok(d <= off + 1e-6, `${what}: ${d.toFixed(1)} m from the nearest centre line, not at an edge`);
    assert.ok(!onApron(e, n) && apronEdge(e, n) >= M.APRON_EDGE - 1e-9, `${what}: on an apron or within ${M.APRON_EDGE} m of one`);
    for (const R of W.RUNWAYS) { const [s, t] = W.rwyST(R, e, n); assert.ok(!(s > -M.RWY_PAD && s < R.len + M.RWY_PAD && Math.abs(t) < R.w / 2 + 20), `${what}: ${Math.abs(t).toFixed(0)} m from the centre line of ${R.id}`); }
    for (let j = 0; j < i; j++) assert.ok(Math.hypot(at2[j][0] - e, at2[j][1] - n) >= M.TWY_EDGE.gap, `${what}: another light within ${M.TWY_EDGE.gap} m`);
  });
  // Complete: at every station of every line (45 m apart and centred on the line, our own walk along it), on both
  // sides, there is a light within 5 m of the place 12.1 m square to the line, or a cause for none: the pavement of
  // another line or an apron (within a metre of the rule's limits), a light of another line within the 7.5 m gap, or
  // the inside of a tight bend, where the place falls on the line's own pavement. (The regressions: jogs of a few
  // metres in the vector lines left holes of 90 to 135 m in straight rows, lights came and went by centimetres along
  // an apron, with the stations counted from the first point of a line, which is a junction on 129 of the 137
  // lines, seven connectors shorter than 45 m had no light at all, and with a gap of 15 m a light across a junction,
  // 9 to 11 m away on the edge of another taxiway, stood in for the light of three straight edges, dark over 62 to
  // 67 m.)
  let places = 0, lit = 0; const why = { other: 0, apron: 0, gap: 0, bend: 0 };
  for (const t of lines) {
    // the whole steps in the length, taken to a micrometre: the sum of the pieces is not exact
    const len = lineLen(t.p), steps45 = Math.floor(Math.round(len * 1e6) / 45e6);
    for (let j = 0; j <= steps45; j++) {
      const s = Math.min(len, Math.max(0, len / 2 + (j - steps45 / 2) * 45)), p = alongLine(t.p, s);
      if (W.RUNWAYS.some((R) => { const [rs, rt] = W.rwyST(R, p[0], p[1]); return rs > -40 && rs < R.len + 40 && Math.abs(rt) < R.w / 2 + 40; })) continue;
      const a = alongLine(t.p, s - 12.5), b = alongLine(t.p, s + 12.5), l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      for (const sd of [-1, 1]) {
        const e = p[0] + (b[1] - a[1]) / l * sd * off, n = p[1] - (b[0] - a[0]) / l * sd * off, nearest = Math.min(...at2.map((q) => Math.hypot(q[0] - e, q[1] - n)));
        places++;
        if (nearest <= 5) { lit++; continue; }
        const cause = lines.some((q) => q !== t && lineDist(q.p, e, n) < M.TWY_W / 2 + 1) ? 'other' : onApron(e, n) || apronEdge(e, n) < M.APRON_EDGE + 1 ? 'apron'
          : nearest < M.TWY_EDGE.gap ? 'gap' : lineDist(t.p, e, n) < M.TWY_W / 2 - 0.5 ? 'bend' : null;
        assert.ok(cause, `no light ${s.toFixed(1)} m along the ${t.k} line from ${t.p[0].map((v) => v.toFixed(0))}, side ${sd}, and no cause (nearest light ${nearest.toFixed(0)} m)`);
        why[cause]++;
      }
    }
  }
  // measured on 2026-11-26 (regression pins): lights of both kinds of line, and TWY C beside the main runway
  assert.deepEqual([blue.length, places, lit, why], PINS.edge);
  // with every line drawn the other way round, the same places to a micrometre (the stations are centred on a line)
  const turned = W.taxiEdgeLights({ ...af, tw: af.tw.map((t) => ({ ...t, p: [...t.p].reverse() })) }), key = (q) => q.map(r6).join();
  assert.deepEqual(turned.map(key).sort(), at2.map(key).sort(), 'the layout does not depend on the direction a line was drawn in');
  const [R0] = W.RUNWAYS, laneLit = at2.filter(([e, n]) => { const d = lines.map((t) => lineDist(t.p, e, n)); return lines[d.indexOf(Math.min(...d))].k === 'lane'; }).length;
  assert.equal(R0.ends.join('/'), '03L/21R');
  // TWY C runs 183 m west of the centre line of 03L/21R (research round 5, 5a-aip.md; the vector line is 2 m nearer):
  // a row of lights on each side of it, where no apron or joining taxiway is in the way
  const twyC = at2.map(([e, n]) => W.rwyST(R0, e, n)).filter(([s, t]) => s > 0 && s < R0.len && Math.abs(t + 183) < 16);
  const sides = [twyC.filter(([, t]) => t < -182).length, twyC.filter(([, t]) => t > -182).length];
  assert.ok(laneLit > 150 && sides[0] > 40 && sides[1] > 40, `${laneLit} lights on lines tagged lane, ${sides} on the two sides of TWY C`);
});
const PINS = { edge: [401, 942, 406, { other: 147, apron: 384, gap: 5, bend: 0 }] };

test('taxiway edge lights on a made-up field: a junction, an apron with a hole, short and parallel lines, a jog, a corner', () => {
  // far from the runways: a taxiway A along e at n 9000, a taxiway B that crosses its east end, a solid apron south
  // of A whose east side ends 2.5 m short of a light, and a ring-shaped apron north of it
  const e0 = 9000, n0 = 9000, P = (pts) => pts.map(([e, n]) => [e0 + e, n0 + n]);
  const af = {
    tw: [{ k: 'lane', p: P([[0, 0], [180, 0]]) }, { k: 'twy', p: P([[180, -100], [180, 100]]) }],
    apron: [{ o: P([[30, -40], [132.5, -40], [132.5, -5], [30, -5]]) }, { o: P([[60, 0], [120, 0], [120, 65], [60, 65]]), h: [P([[70, 8], [110, 8], [110, 60], [70, 60]])] }],
  };
  const places = (f) => M.taxiEdgeLights({ apron: [], ...f }).map(([e, n]) => [r6(e - e0), r6(n - n0)]);
  const got = places(af), has = (e, n) => got.some((g) => g[0] === e && g[1] === n);
  // A is 180 m long: stations at 0, 45, 90, 135 and 180 m, a light 12.1 m to each side
  assert.ok(has(0, 12.1) && has(0, -12.1), 'the west end of A: both sides');
  assert.ok(has(45, 12.1) && !has(45, -12.1), '45 m: the south light would stand on the solid apron');
  assert.ok(has(90, 12.1), '90 m: the north light stands in the hole of the ring-shaped apron, 4.1 m from its edge');
  assert.ok(!has(90, -12.1), '90 m: south, on the apron');
  assert.ok(has(135, 12.1) && !has(135, -12.1), '135 m: the south light would be 2.5 m beside the apron, under the 3 m');
  assert.ok(!has(180, 12.1) && !has(180, -12.1), '180 m: on the centre line of B');
  // B is 200 m long: its five stations are centred on it, 10 m in from each end. Where A ends on it the west light
  // would stand on A's pavement; the east one is clear
  assert.ok(!has(167.9, 0) && has(192.1, 0), 'B where A ends on it');
  for (const n of [-90, -45, 45, 90]) assert.ok(has(167.9, n) && has(192.1, n), `B at ${n} m: both sides`);
  assert.equal(got.length, 5 + 9, 'five lights along A, nine along B, and no other');
  // with the hole filled in, the light at 90 m north goes too
  assert.equal(M.taxiEdgeLights({ ...af, apron: af.apron.map((a) => ({ o: a.o })) }).length, got.length - 1);
  // and with the edge of the hole 2.1 m from that light: in the hole still, but under the 3 m beside the apron
  const tight = [af.apron[0], { o: af.apron[1].o, h: [P([[70, 10], [110, 10], [110, 60], [70, 60]])] }];
  const gotTight = places({ ...af, apron: tight });
  assert.ok(gotTight.length === got.length - 1 && !gotTight.some((g) => g[0] === 90 && g[1] === 12.1), 'the 3 m count from the edge of a hole too');
  // The stations are centred on a line, whichever way it was drawn: a connector shorter than the 45 m has a pair in
  // its middle (counted from its first point it had one pair, at the junction it starts from), a 100 m one has
  // three pairs 5 m in from its ends
  const line = (...pts) => ({ k: 'twy', p: P(pts) });
  assert.deepEqual(places({ tw: [line([0, 0], [30, 0])] }), [[15, 12.1], [15, -12.1]]);
  assert.deepEqual(places({ tw: [line([0, 0], [44.99, 0])] }), [[22.495, 12.1], [22.495, -12.1]], 'a centimetre short of a step: still one pair');
  assert.deepEqual(places({ tw: [line([0, 0], [100, 0])] }), [[5, 12.1], [5, -12.1], [50, 12.1], [50, -12.1], [95, 12.1], [95, -12.1]]);
  assert.deepEqual(places({ tw: [line([100, 0], [0, 0])] }), [[95, -12.1], [95, 12.1], [50, -12.1], [50, 12.1], [5, -12.1], [5, 12.1]], 'the same six places');
  // Two taxiways side by side. 22 m apart, the lights between them would stand 9.9 m from the other centre line, on
  // its pavement: none there. 24 m apart they are clear of it by 0.4 m, and one row serves both (the second row
  // would stand 0.2 m from the first). 40 m apart, a row each.
  const beside = (gap) => places({ tw: [line([0, 0], [90, 0]), { k: 'lane', p: P([[0, gap], [90, gap]]) }] }).map(([, n]) => n).filter((n, i, a) => a.indexOf(n) === i).sort((x, y) => x - y);
  assert.deepEqual([beside(22), beside(24), beside(40)], [[-12.1, 34.1], [-12.1, 12.1, 36.1], [-12.1, 12.1, 27.9, 52.1]]);
  // A jog of 2 m in a straight line (the vector lines have them): the lights at the jog still stand square to the
  // run of the taxiway, 12.1 m from the line, one on each side. Square to the 2.8 m piece under the station they
  // would stand 9.8 and 7.3 m from it, on the pavement.
  const jog = { tw: [line([0, 0], [87, 0], [89, 2], [91, 0], [180, 0])] }, jogP = jog.tw[0].p;
  const lit = M.taxiEdgeLights({ apron: [], ...jog }).map(([e, n]) => [e - e0, n - n0]);
  assert.equal(lit.length, 10, 'both sides of all five stations');
  for (const [e, n] of lit) near(lineDist(jogP, e0 + e, n0 + n), 12.1, 1e-9, `the light at ${e.toFixed(1)}, ${n.toFixed(1)}`);
  const at90 = lit.filter(([e]) => Math.abs(e - 90) < 6);
  assert.ok(at90.length === 2 && at90.some(([, n]) => n > 11) && at90.some(([, n]) => n < -11), 'the two lights at the jog');
  // A right-angle turn with a station on the corner: the light outside the corner stands 12.1 m from it, square to
  // the run through the corner; the place inside it is on the pavement of the line itself, whichever way it is
  // pushed out, and stays dark
  const turn = [[0, 0], [180, 0], [180, 180]], round = places({ tw: [line(...turn)] });
  assert.equal(round.length, 2 * 9 - 1, 'a pair at each of the nine stations but the inside of the corner');
  for (const [e, n] of round) near(lineDist(P(turn), e0 + e, n0 + n), 12.1, 1e-6, `the light at ${e}, ${n}`);
  const corner = round.filter(([e, n]) => Math.hypot(e - 180, n) < 30);
  assert.equal(corner.length, 1); near(corner[0][0], 180 + 12.1 * Math.SQRT1_2, 1e-6, 'east of the corner'); near(corner[0][1], -12.1 * Math.SQRT1_2, 1e-6, 'and south of it');
  assert.deepEqual(places({ tw: [line(...[...turn].reverse())] }).map(String).sort(), round.map(String).sort(), 'the same drawn the other way');
  // two lines that meet end to end: the lights of the second at the joint would stand on those of the first
  assert.equal(places({ tw: [line([0, 0], [90, 0]), line([90, 0], [180, 0])] }).length, 10, 'one pair at the joint, not two');
  // and with their last stations 7 m apart across the joint, the pair of the second line is left out (under the
  // 7.5 m gap: two lights that close read as one doubled light); 7.5 m and 10 m apart, both pairs stand
  const joined = (len) => places({ tw: [line([0, 0], [len, 0]), line([len, 0], [2 * len, 0])] }).filter(([, n]) => n > 0).map(([e]) => e);
  assert.deepEqual([joined(97), joined(97.5), joined(100)], [[3.5, 48.5, 93.5, 145.5, 190.5], [3.75, 48.75, 93.75, 101.25, 146.25, 191.25], [5, 50, 95, 105, 150, 195]]);
  // The gap is not wide enough for a light on the edge of one taxiway to stand in for the light of another. B leaves
  // A to the north at 65 m; its first pair stands 20 m up, and the west one of them is 11.2 m from A's light at 45 m.
  // (With the gap of 15 m it was left out, and the west edge of B was dark for its first 65 m: three straight edges
  // of the real taxiways were dark over 62 to 67 m that way, more than the 60 m of Annex 14, 5.3.18.)
  const tee = places({ tw: [line([0, 0], [90, 0]), line([65, 0], [65, 130])] });
  assert.deepEqual(tee, [[0, 12.1], [0, -12.1], [45, 12.1], [45, -12.1], [90, 12.1], [90, -12.1], [52.9, 20], [77.1, 20], [52.9, 65], [77.1, 65], [52.9, 110], [77.1, 110]]);
  near(Math.hypot(52.9 - 45, 20 - 12.1), 11.17, 0.01, 'the two lights at the west corner of the junction');
  // A line whose length is a whole number of steps but for the rounding of the sum of its pieces has its stations at
  // its ends, whichever way it was drawn. (The length of this one is 90 m; summed from one end it comes to a hair
  // under, and counted with a plain floor the line then had two stations 22.5 m in from its ends, and four lights
  // one way round against six the other.)
  const hair = [[0, 0], [11.37, 15.16], [39.42, 52.56], [54, 72]], hairLen = (pts) => lineLen(P(pts));
  assert.ok(hairLen(hair) !== hairLen([...hair].reverse()) && Math.abs(hairLen(hair) - 90) < 1e-9, 'the two sums differ in their last digits');
  const fwd = places({ tw: [line(...hair)] }), back = places({ tw: [line(...[...hair].reverse())] });
  assert.equal(fwd.length, 6, 'a pair at each end and one in the middle');
  assert.deepEqual(back.map((q) => q.map((v) => Math.round(v * 1e6) / 1e6).join()).sort(), fwd.map((q) => q.map((v) => Math.round(v * 1e6) / 1e6).join()).sort(), 'the same places drawn the other way');
});

test('threshold lights: a green row 3 m apart at every threshold, green only toward the approach', () => {
  for (const E of ENDS) {
    const row = DIR.map((l) => at(E, l)).filter((p) => Math.abs(p.s + 1) < 0.01 && Math.abs(p.t) <= E.w / 2);
    assert.equal(row.length, E.w / 3, `${E.id}: one light every 3 m across ${E.w} m`);
    assert.deepEqual(steps(row.map((p) => p.t)), Array(row.length - 1).fill(3), `${E.id}: 3 m apart`);
    near(Math.max(...row.map((p) => p.t)) + Math.min(...row.map((p) => p.t)), 0, 1e-6, `${E.id}: about the centre line`);
    for (const p of row) {
      // the regression: THR 21L showed red to the pilot on the approach
      assert.deepEqual(seen(p.l, onApproach(E)), { col: 'green', f: 1 }, `${E.id}: green at full strength from the approach (t ${p.t.toFixed(1)})`);
      const back = seen(p.l, onRunway(E));
      // a threshold that is not displaced is also the end of the runway for the other direction; a displaced one
      // is not, and shows nothing that way
      assert.deepEqual(back, E.disp ? { col: 'green', f: 0 } : { col: 'red', f: 1 }, `${E.id}: from the runway`);
    }
  }
});

test('runway end lights: at least six, red toward the runway, at the end of the pavement', () => {
  for (const E of ENDS) {
    const row = DIR.map((l) => at(E, l)).filter((p) => Math.abs(p.s - E.lda) < 1.6 && Math.abs(p.t) <= E.w / 2);
    const red = row.filter((p) => { const v = seen(p.l, onRunway(E)); return v.col === 'red' && v.f === 1; });
    assert.ok(red.length >= 6, `${E.id}: ${red.length} red lights at the far end (Annex 14, 5.3.11: at least six)`);
    assert.equal(red.length, row.length, `${E.id}: every light at the far end is red from the runway`);
    near(Math.max(...red.map((p) => Math.abs(p.t))), E.w / 2 - 1.5, 1e-6, `${E.id}: across the runway`);
    for (const p of red) assert.notEqual(JSON.stringify(seen(p.l, beyondEnd(E))), JSON.stringify({ col: 'red', f: 1 }), `${E.id}: not red from beyond the end`);
  }
  // 03R ends at the pavement end, 350 m past THR 21L: its red row is there, apart from the green row of 21L
  const E = M.RWY_END['03R'], T = M.RWY_END['21L'];
  near(E.lda - T.lda, 350, 1e-6, 'pavement beyond THR 21L');
  const endRow = DIR.map((l) => at(T, l)).filter((p) => Math.abs(p.s + 349.5) < 0.01);
  assert.equal(endRow.length, 15);
  for (const p of endRow) { assert.equal(p.l.kind, 2); assert.equal(seen(p.l, onApproach(T)).f, 0, 'dark from the 21L approach'); }
});

test('wing bars at the displaced threshold of 21L: five green lights each side, from the line of the edge lights 10 m outward', () => {
  for (const E of ENDS) {
    const wing = DIR.map((l) => at(E, l)).filter((p) => p.l.kind === 2 && Math.abs(p.s + 1) < 0.01 && Math.abs(p.t) > E.w / 2);
    if (!E.disp) { assert.equal(wing.length, 0, `${E.id}: no wing bars`); continue; }
    assert.equal(E.id, '21L');
    for (const side of [-1, 1]) {
      const bar = sorted(wing.filter((p) => Math.sign(p.t) === side).map((p) => Math.abs(p.t)));
      assert.equal(bar.length, 5, 'Annex 14, 5.3.10: at least five lights');
      near(bar[0], E.w / 2 + M.EDGE_OUT, 1e-6, 'the innermost light is in the line of the edge lights');
      near(bar[4] - bar[0], 10, 1e-6, 'reaching 10 m outward');
      assert.deepEqual(steps(bar), [2.5, 2.5, 2.5, 2.5]);
    }
    for (const p of wing) { assert.deepEqual(seen(p.l, onApproach(E)), { col: 'green', f: 1 }); assert.equal(seen(p.l, onRunway(E)).f, 0); }
  }
});

test('runway edge lights: 60 m apart, red before the displaced threshold of 21L, yellow over the last 600 m', () => {
  assert.ok(M.EDGE_OUT > 0 && M.EDGE_OUT <= 3, 'Annex 14, 5.3.9: not more than 3 m outside the runway edge');
  for (const R of M.RUNWAYS) {
    const E0 = M.RWY_END[R.ends[0]];
    const edge = DIR.map((l) => at(E0, l)).filter((p) => p.l.kind === 1 && Math.abs(Math.abs(p.t) - (R.w / 2 + M.EDGE_OUT)) < 0.01);
    for (const side of [-1, 1]) {
      const s = sorted(edge.filter((p) => Math.sign(p.t) === side).map((p) => p.s + E0.disp));       // from the paved start
      assert.equal(s.length, Math.floor(R.len / 60) + 1, `${R.id}: along all ${R.len.toFixed(0)} m of pavement`);
      near(s[0], 0, 1e-6, 'from the paved start');
      assert.ok(steps(s).every((d) => Math.abs(d - 60) < 1e-6), `${R.id}: 60 m apart (AIP AD 2.14)`);
    }
    for (const id of R.ends) {
      const E = M.RWY_END[id], count = { red: 0, yellow: 0, white: 0 };
      for (const p0 of edge) {
        const p = at(E, p0.l), v = seen(p.l, onApproach(E));
        const want = p.s < -1e-6 ? 'red' : E.lda - p.s < 600 - 1e-6 ? 'yellow' : 'white';     // the light at 600 m is still white
        assert.deepEqual(v, { col: want, f: 1 }, `${id}: edge light ${p.s.toFixed(0)} m past the threshold`);
        count[want]++;
      }
      assert.equal(count.red, id === '21L' ? 12 : 0, `${id}: red edge lights before the threshold (21L: six a side over 350 m)`);
      assert.equal(count.yellow, 20, `${id}: ten a side over the last 600 m`);
    }
  }
});

test('runway centre line lights: on 03L/21R only, 30 m apart, red and white over the last 900 m, red over the last 300 m', () => {
  for (const R of M.RUNWAYS) {
    const E0 = M.RWY_END[R.ends[0]];
    // two-way lights on the pavement within 1 m of the centre line (the threshold rows lie 1 m outside the pavement)
    const cl = DIR.map((l) => at(E0, l)).filter((p) => p.l.kind === 1 && Math.abs(p.t) < 1 && p.s + E0.disp > 0 && p.s + E0.disp < R.len);
    if (!R.cl) { assert.equal(cl.length, 0, `${R.id}: none (AIP AD 2.14)`); continue; }
    assert.equal(R.id, '03L/21R');
    assert.equal(cl.length, Math.floor((R.len - 15) / 30) + 1);
    assert.ok(steps(cl.map((p) => p.s)).every((d) => Math.abs(d - 30) < 1e-6), '30 m apart');
    assert.ok(cl.every((p) => Math.abs(p.t) <= 0.6 + 1e-9), 'Annex 14, 5.3.12: not more than 0.6 m off the centre line');
    for (const id of R.ends) {
      const E = M.RWY_END[id], row = cl.map((p) => at(E, p.l)).sort((a, b) => a.s - b.s).map((p) => [E.lda - p.s, seen(p.l, onApproach(E))]);
      assert.ok(row.every(([, v]) => v.f === 1));
      assert.ok(row.filter(([left]) => left > 900).every(([, v]) => v.col === 'white'), `${id}: white to 900 m from the end`);
      assert.ok(row.filter(([left]) => left < 300).every(([, v]) => v.col === 'red'), `${id}: red over the last 300 m`);
      const mid = row.filter(([left]) => left < 900 && left > 300).map(([, v]) => v.col);
      assert.equal(mid.length, 20);
      assert.ok(mid.every((c, i) => (c === 'red' || c === 'white') && (i === 0 || c !== mid[i - 1])), `${id}: red and white in turn from 900 m to 300 m (${mid.join(' ')})`);
    }
  }
});

test('touchdown zone lights: on 21R only, 900 m of barrettes of three, 18 m between the two rows', () => {
  assert.deepEqual(M.TDZ_T, [9, 10.5, 12]);
  for (const E of ENDS) {
    const tdz = DIR.map((l) => at(E, l)).filter((p) => p.l.kind === 2 && p.s > 5 && p.s <= 900.5 && Math.abs(p.t) < E.w / 2);
    if (!E.tdz) { assert.equal(tdz.length, 0, `${E.id}: none (AIP AD 2.14)`); continue; }
    assert.equal(E.id, '21R');
    const rows = new Map(); for (const p of tdz) { const k = Math.round(p.s); if (!rows.has(k)) rows.set(k, []); rows.get(k).push(p); }
    assert.deepEqual([...rows.keys()], Array.from({ length: 15 }, (_, i) => 60 * (i + 1)), 'a pair of barrettes every 60 m to 900 m');
    for (const row of rows.values()) {
      assert.deepEqual(sorted(row.map((p) => p.t)), [-12, -10.5, -9, 9, 10.5, 12], 'three lights 1.5 m apart each side, the innermost 18 m apart');
      for (const p of row) { assert.deepEqual(seen(p.l, onApproach(E)), { col: 'white', f: 1 }); assert.equal(seen(p.l, beyondEnd(E)).f, 0, 'one-way'); assert.ok(p.y < 0.2, 'inset'); }
    }
  }
});

// the approach lights of an end: one-way lights and flashers before the threshold, within 15 m of the centre line,
// at the stations of the system (the red row at the end of the 21L pavement is not at a station)
const approach = (E) => DIR.map((l) => at(E, l)).filter((p) => p.l.kind !== 1 && p.s < -29 && Math.abs(p.t) <= 15.01 && Math.abs(-p.s - 30 * Math.round(-p.s / 30)) < 0.35);
const stations = (E) => { const m = new Map(); for (const p of approach(E)) { const k = 30 * Math.round(-p.s / 30); if (!m.has(k)) m.set(k, []); m.get(k).push(p); } return m; };

test('approach lights: the length and spacing of each system (AIP AD 2.14)', () => {
  for (const E of ENDS) {
    const A = AIP[E.id], st = stations(E);
    assert.deepEqual([E.als, M.ALS[E.als].len, M.ALS[E.als].step], [A.als, A.len, A.step], `${E.id}: the system`);
    assert.deepEqual(sorted(st.keys()), Array.from({ length: A.len / A.step }, (_, i) => A.step * (i + 1)), `${E.id}: a barrette every ${A.step} m to ${A.len} m`);
    for (const p of approach(E)) {
      assert.equal(seen(p.l, onApproach(E)).f, 1, `${E.id}: toward the approach`);
      assert.equal(seen(p.l, onRunway(E)).f, 0, `${E.id}: dark from the runway`);
    }
    // every one-way or flashing light at a station before this threshold, however far off the centre line (the other
    // runway is more than 300 m away), is one of them: none stands outside the 15 m of the widest crossbar, which is
    // well inside the lane the siting rules keep clear, and none further out than the system is long
    const wide = DIR.map((l) => at(E, l)).filter((p) => p.l.kind !== 1 && p.s < -29 && Math.abs(p.t) < 200 && Math.abs(-p.s - 30 * Math.round(-p.s / 30)) < 0.35);
    assert.equal(wide.length, approach(E).length, `${E.id}: no approach light further than 15 m from the centre line`);
    assert.ok(M.ALS_LANE >= 4 * 15 && wide.every((p) => -p.s <= A.len + 0.31), `${E.id}: inside the lane, within ${A.len} m`);
  }
  assert.equal(stations(M.RWY_END['03R']).size, 5, 'AIP: SALS (5 BAR) on 03R');
});

test('approach lights: centre line barrettes, crossbars, the red side rows of CAT II', () => {
  for (const E of ENDS) {
    const cat2 = E.als === 'CAT2';
    for (const [s, all] of stations(E)) {
      const steady = all.filter((p) => p.l.kind === 2), white = sorted(steady.filter((p) => name(p.l.a) === 'white').map((p) => p.t)), red = sorted(steady.filter((p) => name(p.l.a) === 'red').map((p) => p.t));
      assert.equal(white.length + red.length, steady.length, `${E.id} ${s} m: white and red only`);
      // the barrette on the centre line: at least 3 m long on a simple system, 4 m with lights 1 m apart on a
      // precision one (Annex 14, 5.3.4: lights not more than 1.5 m apart)
      const bar = white.filter((t) => Math.abs(t) <= 2.01);
      assert.deepEqual(bar, E.als === 'SALS420' ? [-1.5, 0, 1.5] : [-2, -1, 0, 1, 2], `${E.id} ${s} m: barrette`);
      const beside = white.filter((t) => t > 2.01);
      assert.deepEqual(white.filter((t) => t < -2.01).map((t) => -t).reverse(), beside, `${E.id} ${s} m: the same on both sides`);
      if (s === 300) {
        // the crossbar: 30 m long, lights 1.5 m apart, the gap beside the centre line not more than 6 m
        assert.deepEqual(beside, [4.5, 6, 7.5, 9, 10.5, 12, 13.5, 15], `${E.id}: crossbar 300 m from the threshold`);
        assert.ok(beside[0] - bar[bar.length - 1] <= 6);
      } else if (cat2 && s === 150) {
        // CAT II: a crossbar that fills the gaps between the centre line and the red rows, lights not over 2.7 m apart
        assert.deepEqual(beside, [3.4, 4.8, 6.2, 7.6], '21R: crossbar 150 m from the threshold');
        assert.ok(steps([2, ...beside, M.TDZ_T[0]]).every((d) => d <= 2.7), 'no gap over 2.7 m from the barrette to the red row');
      } else assert.deepEqual(beside, [], `${E.id} ${s} m: no crossbar`);
      // CAT II: red rows each side over the first 270 m, in line with the touchdown zone lights
      assert.deepEqual(red, cat2 && s <= 270 ? [-12, -10.5, -9, 9, 10.5, 12] : [], `${E.id} ${s} m: red side row`);
      // the cross-arms of the stands (alsArms): every light is on one, and each arm ends at its outermost lights
      const arms = M.alsArms(E.als, s), on = arms.map(() => []);
      for (const p of steady) {
        const k = arms.findIndex(([tc, half]) => Math.abs(p.t - tc) <= half + 1e-9);
        assert.ok(k >= 0, `${E.id} ${s} m: the light ${p.t.toFixed(1)} m off the centre line has an arm under it`);
        on[k].push(p.t);
      }
      arms.forEach(([tc, half], k) => { near(Math.min(...on[k]), tc - half, 1e-9, `${E.id} ${s} m: arm ${k} from its first light`); near(Math.max(...on[k]), tc + half, 1e-9, `${E.id} ${s} m: arm ${k} to its last light`); });
      assert.ok(arms.every(([tc, half], k) => arms.every(([tc2, half2], j) => j === k || Math.abs(tc - tc2) > half + half2)), `${E.id} ${s} m: the arms do not overlap`);
    }
  }
  assert.equal(2 * M.TDZ_T[0], 18, 'the red rows are as far apart as the touchdown zone lights (18 m, Annex 14: 18 to 22.5 m)');
  assert.deepEqual(M.alsArms('CAT2', 30), [[0, 2], [-10.5, 1.5], [10.5, 1.5]], 'CAT II near the threshold: a white barrette and a red one each side');
  assert.deepEqual([M.alsArms('CAT2', 150), M.alsArms('CAT1', 300), M.alsArms('CAT1', 30), M.alsArms('SALS420', 60)], [[[0, 12]], [[0, 15]], [[0, 2]], [[0, 1.5]]]);
});

test('approach lights: flashing lights run inward twice a second on the two precision systems', () => {
  for (const E of ENDS) {
    const fl = approach(E).filter((p) => p.l.kind === 4).sort((a, b) => a.s - b.s);          // outermost first
    const want = E.als === 'CAT2' ? [330, 900] : E.als === 'CAT1' ? [E.disp + M.RWY_PAD + 10, 900] : null;
    if (!want) { assert.equal(fl.length, 0, `${E.id}: no flashing lights on a simple system`); continue; }
    const s = fl.map((p) => 30 * Math.round(-p.s / 30));
    assert.deepEqual(s, Array.from({ length: (want[1] - want[0]) / 30 + 1 }, (_, i) => want[1] - 30 * i), `${E.id}: one on every barrette from ${want[1]} m in to ${want[0]} m`);
    assert.ok(fl.every((p) => Math.abs(p.t) < 1e-9 && p.l.param >= 0 && p.l.param < 1), 'on the centre line, each with a phase inside one cycle');
    assert.equal(fl[0].l.param, 0, 'the outermost flashes first');
    assert.ok(fl.every((p, i) => i === 0 || p.l.param > fl[i - 1].l.param), `${E.id}: then each one inward, later`);
    assert.ok(fl.every((p, i) => i === 0 || Math.abs(p.l.param - fl[i - 1].l.param - 0.03) < 1e-9), `${E.id}: 0.03 of the half-second cycle (15 ms) after the one before`);
    assert.ok(fl[fl.length - 1].l.param <= 0.6, `${E.id}: the run is over in ${(fl[fl.length - 1].l.param * 500).toFixed(0)} ms, well inside the half second`);
    // CAT II: beyond the 300 m crossbar; CAT I: on every barrette on a stand (THR 21L is 350 m in, then the pad)
    assert.ok(Math.min(...s) > (E.als === 'CAT2' ? 300 : E.disp + M.RWY_PAD), `${E.id}: innermost flashing light`);
    assert.ok(fl.every((p) => M.alsStandH(E, 30 * Math.round(-p.s / 30)) > 0), `${E.id}: every flashing light is on a stand`);
  }
});

test('approach lights: every flash is seen at 20, 30 and 60 frames a second, and still reads as one running flash', () => {
  // the shader's flash: full for SFL_FLASH[0] of the half-second cycle, out by SFL_FLASH[1]; uTime moves once a frame
  const [a, b] = M.SFL_FLASH, flash = (ph) => 1 - smooth(a, b, ph), cycle = 0.5;
  assert.ok(a * cycle > 1 / 30 && b * cycle <= 0.07, 'full for longer than a frame at 30 frames a second, out within 70 ms');
  assert.deepEqual([a * cycle * 1000, b * cycle * 1000], [40, 65], 'full for 40 ms, out by 65 ms');
  for (const E of ENDS) {
    const fl = approach(E).filter((p) => p.l.kind === 4).sort((p, q) => p.l.param - q.l.param);
    if (!fl.length) continue;
    for (const [fps, floor] of [[60, 1], [30, 1], [20, 0.6]]) {
      for (let k = 0; k < 40; k++) {
        const t0 = (k / 40) / fps, best = fl.map(() => 0);                 // 40 offsets of the frames against the cycle
        let most = 0;
        for (let t = t0; t < t0 + 3; t += 1 / fps) {
          const lit = fl.map((p) => flash((((t * 2 - p.l.param) % 1) + 1) % 1));
          lit.forEach((v, i) => { best[i] = Math.max(best[i], v); });
          const on = lit.map((v, i) => (v > 0.5 ? i : -1)).filter((i) => i >= 0);
          most = Math.max(most, on.length);
          assert.ok(on.every((i, j) => j === 0 || i === on[j - 1] + 1), `${E.id} at ${fps} fps: the lights that are lit together are neighbours`);
        }
        assert.ok(Math.min(...best) >= floor, `${E.id} at ${fps} fps, offset ${k}: the dimmest flash reaches ${Math.min(...best).toFixed(2)} (floor ${floor})`);
        assert.ok(most <= 4, `${E.id} at ${fps} fps: no more than four of ${fl.length} lit at once (${most})`);
      }
    }
  }
});

test('approach lights: inset over pavement (a displaced threshold, the pad beyond each paved end), on stands beyond it', () => {
  assert.equal(M.RWY_PAD, 60);
  assert.ok(live('50-airfield.js').includes('const c0 = rwyEN(R, -RWY_PAD, 0), c1 = rwyEN(R, R.len + RWY_PAD, 0);'), 'the runway mesh draws that pad');
  for (const E of ENDS) {
    const stands = new Map(M.alsStands(E).map((st) => [st.s, st]));
    let last = 0;
    for (const [s, all] of [...stations(E)].sort((p, q) => p[0] - q[0])) {
      const paved = s <= E.disp + M.RWY_PAD, st = stands.get(s);
      assert.equal(!!st, !paved, `${E.id} ${s} m: a stand only beyond the pavement`);
      assert.equal(M.alsStandH(E, s), paved ? 0 : st.hgt);
      for (const p of all) {
        if (paved) { near(p.y, 0.25, 1e-9, `${E.id} ${s} m: inset`); assert.equal(p.l.kind, 2, `${E.id} ${s} m: no flashing light in pavement`); continue; }
        near(p.y, st.hgt + 0.12 + (p.l.kind === 4 ? 0.35 : 0), 1e-9, `${E.id} ${s} m: on its stand`);
        // the stand under it: an arm that reaches its place, on poles under that arm
        const arm = st.arms.find((a) => Math.abs(p.t - a.tc) <= a.half + 1e-9);
        assert.ok(arm, `${E.id} ${s} m: the light ${p.t.toFixed(1)} m off the centre line has an arm under it`);
        assert.ok(arm.poles.length === (arm.half > 4 ? 3 : 1) && arm.poles.every((t) => Math.abs(t - arm.tc) < arm.half), `${E.id} ${s} m: poles under the arm`);
      }
      if (!paved) {
        // the light plane starts low at the end of the pad and rises evenly: no step like the 5 m one 21L had
        near(st.hgt, 0.9 + (s - E.disp - M.RWY_PAD) * 0.012, 1e-9, `${E.id} ${s} m: 0.9 m rising 1.2 %`);
        assert.ok(st.hgt - (last || 0.9) <= M.ALS[E.als].step * 0.012 + 1e-9 && st.hgt >= last, `${E.id} ${s} m: no step up from ${last} m`);
        assert.deepEqual(st.arms.map((a) => [a.tc, a.half]), M.alsArms(E.als, s), `${E.id} ${s} m: one arm per group of lights`);
        last = st.hgt;
      }
    }
    assert.equal(stands.size + [...stations(E).keys()].filter((s) => s <= E.disp + M.RWY_PAD).length, stations(E).size, `${E.id}: no stand without lights`);
  }
  assert.deepEqual(ENDS.map((E) => [E.id, M.alsStands(E)[0].s, M.alsStands(E).length]), [['03L', 90, 12], ['21R', 90, 28], ['03R', 120, 4], ['21L', 420, 17]], 'first stand and number of stands');
  near(Math.max(...ENDS.flatMap((E) => M.alsStands(E).map((st) => st.hgt))), 0.9 + 840 * 0.012, 1e-9, 'the tallest stand, 900 m before THR 21R');
  // 50-airfield.js draws exactly these stands, and the lights sit at alsLightY
  const src = live('50-airfield.js');
  // the pavement under the inset lights is the runway mesh: from the pad before one end to the pad beyond the other,
  // 7.5 m wider than the runway on each side; every inset approach light lies on it
  assert.ok(src.includes('const c0 = rwyEN(R, -RWY_PAD, 0), c1 = rwyEN(R, R.len + RWY_PAD, 0);') && src.includes('const geo = ribbonGeo([c0, c1], R.w + 15, { caps: false });'), 'the runway mesh');
  let inset = 0;
  for (const E of ENDS) for (const p of approach(E)) {
    if (p.y > 0.25 + 1e-9) continue;
    inset++;
    assert.ok(-p.s <= E.disp + M.RWY_PAD + 1e-9 && Math.abs(p.t) <= (E.w + 15) / 2, `${E.id}: the inset light ${(-p.s).toFixed(0)} m before the threshold, ${p.t.toFixed(1)} m off the centre line, is on the runway mesh`);
  }
  assert.ok(inset > 60, `${inset} inset approach lights`);
  assert.ok(src.includes('for (const { s, hgt, arms } of alsStands(E)) for (const { tc, half, poles } of arms) {'), 'every arm of every stand');
  assert.ok(src.includes('for (const t of poles) put(M.grey, cylGeo(0.08, 0.1, hgt, 6, 0, hgt / 2, 0), -s, t);'), 'its poles');
  assert.ok(src.includes('put(M.grey, boxGeo(0.12, 0.12, 2 * half + 0.6, 0, hgt, 0), -s, tc);'), 'the arm, as wide as the group, on top');
  assert.ok(live('60-lights.js').includes('const y = alsLightY(E, s);'), 'the lights sit on the stands');
});

// (The roads of the land-use map are not tried: outside the fence the 900 m system of 21R crosses public roads, and
// three of its centre poles stand on road cells.)
test('approach light stands on the real map: none on the runway mesh, on an apron or inside the clearance of a taxiway', () => {
  const af = JSON.parse(fs.readFileSync(new URL('../data/vtbd_af.json', import.meta.url)));
  const site = new M.SiteIndex();
  for (const a of af.apron) site.add('apron', a.o, { holes: a.h || [] });
  for (const t of af.tw) site.add(t.k === 'twy' ? 'taxiway' : 'taxilane', t.p, { half: 0 });
  let poles = 0;
  for (const E of ENDS) for (const { s, arms } of M.alsStands(E)) for (const { poles: at } of arms) for (const t of at) {
    const e = E.thr[1] - E.u[1] * s + E.r[1] * t, n = E.thr[0] - E.u[0] * s + E.r[0] * t;
    poles++;
    for (const R of M.RUNWAYS) {
      const [rs, rt] = M.rwyST(R, e, n);
      assert.ok(!(rs >= -M.RWY_PAD && rs <= R.len + M.RWY_PAD && Math.abs(rt) <= (R.w + 15) / 2), `${E.id} ${s} m: a pole on the runway mesh of ${R.ends.join('/')}`);
    }
    // crown 0: the fixed clearances alone (Annex 14 Table 3-1 for taxiways, 3.13.6 for aprons)
    assert.equal(site.near(e, n, 0), null, `${E.id} ${s} m, ${t.toFixed(1)} m off the centre line: a pole too close to pavement`);
  }
  assert.equal(poles, (12 + 2) + (28 + 6 * 2 + 2 * 2) + (4 + 2) + 17, 'a pole per group and two more under each crossbar (the 300 m crossbar of 21L is inset)');
});

test('the page draws exactly these lights', () => {
  const src = live('60-lights.js');
  assert.ok(/function buildAirfieldLights\(scene, field, city, data\) \{\s*const S = airfieldLights\(field, data\);\s*const mat = makeLightMaterial\(\);\s*const pts = S\.build\(mat\);/.test(src));
  assert.ok(SET.L.every((l) => l.p.length === 3 && l.p.every(Number.isFinite) && l.axis.length === 2), 'every light has a place and an axis');
  // nothing directional is left over: every one-way or two-way light or flasher belongs to a system tested above
  const count = { 1: 0, 2: 0, 4: 0 }; for (const l of DIR) count[l.kind]++;
  const R0 = M.RUNWAYS[0], R1 = M.RUNWAYS[1];
  const edge = 2 * (Math.floor(R0.len / 60) + 1) + 2 * (Math.floor(R1.len / 60) + 1), cl = Math.floor((R0.len - 15) / 30) + 1;
  assert.equal(count[1], edge + cl + 20 + 20 + 15, 'two-way: edge, centre line, and the three thresholds that are not displaced');
  const als = (white, red) => white + red;
  assert.equal(count[2], 15 + 15 + 10 + 90 + als(14 * 3 + 16, 0) + als(30 * 5 + 16 + 8, 54) + als(5 * 5 + 16, 0) + als(30 * 5 + 16, 0), 'one-way: THR 21L, the end of 03R, wing bars, touchdown zone, approach lights');
  assert.equal(count[4], 20 + 17, 'flashing lights of 21R and 21L');
});
