// ───────────────────────── Siting (pure): where something tall may stand ─────────────────────────
// Trees and generated buildings are placed from land-use classes, which know nothing about the airport. This file
// holds the rules that keep them out of places where they cannot be:
//   1. the obstacle limitation surfaces around the runways (ICAO Annex 14 Vol I, Chapter 4, Tables 4-1 and 4-2, for a
//      code 4 instrument runway; Thailand files no difference to Annex 14 in AIP Thailand GEN 1.7),
//   2. the lane of each approach lighting system (Annex 14, 5.3.4: nothing but an ILS antenna may stand above the
//      plane of the lights within 60 m of their centre line; the page keeps the whole lane clear),
//   3. buildings, pavements, viaducts, stations and water (SiteIndex), with the clearances of Annex 14 Table 3-1 for
//      taxiways; a generated building also keeps off the water and the roads of the land-use map.
// The ground is flat at the aerodrome level (d = 0), so every surface starts at height 0.

// runway-local coordinates for every runway (s along the low→high direction from the paved start, t to the right)
function rwyST(R, e, n) { const dn = n - R.p0[0], de = e - R.p0[1]; return [dn * R.u[0] + de * R.u[1], dn * R.r[0] + de * R.r[1]]; }
function rwyEN(R, s, t) { return [R.p0[1] + R.u[1] * s + R.r[1] * t, R.p0[0] + R.u[0] * s + R.r[0] * t]; }   // → [e, n]
function onAnyRunway(e, n, margin = 0) {
  for (const R of RUNWAYS) { const [s, t] = rwyST(R, e, n); if (s > -margin && s < R.len + margin && Math.abs(t) < R.w / 2 + margin) return R; }
  return null;
}
function pointInPoly(p, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function distToSeg(p, a, b) {
  const de = b[0] - a[0], dn = b[1] - a[1], l2 = de * de + dn * dn;
  const t = l2 ? clamp(((p[0] - a[0]) * de + (p[1] - a[1]) * dn) / l2, 0, 1) : 0;
  return Math.hypot(p[0] - a[0] - de * t, p[1] - a[1] - dn * t);
}

// ── obstacle limitation surfaces (metres and slopes; Annex 14 Tables 4-1 and 4-2, code number 4) ──
const OLS = {
  // approach: inner edge 280 m long, 60 m before the threshold, sides diverging 15 %; 3,000 m at 2 %, 3,600 m at 2.5 %,
  // then level for 8,400 m (15 km in all)
  appr: { inner: 280, dist: 60, div: 0.15, sec: [[3000, 0.02], [3600, 0.025], [8400, 0]] },
  trans: 0.143,                                             // transitional: 14.3 % up from the strip and the approach sides
  innerH: { h: 45, r: 4000 },                               // inner horizontal: 45 m up, out to 4,000 m
  conical: { slope: 0.05, h: 100 },                         // conical: 5 % up from its edge, to 100 m above it
  // take-off climb: inner edge 180 m long, 60 m beyond the runway end or at the end of a longer clearway, sides
  // diverging 12.5 % to a width of 1,200 m, 2 % for 15 km
  takeoff: { inner: 180, dist: 60, div: 0.125, final: 1200, len: 15000, slope: 0.02 },
};
const CWY = { len: 150, w: 150 };                           // clearway at all four runway ends (AIP AD 2.12)
// The runway mesh (50-airfield.js) draws this much pavement beyond each paved end, the pad before a threshold. It is
// part of the picture, not of the AIP (which declares no stopway): approach lights over it are inset (60-lights.js).
const RWY_PAD = 60;
// Approach lighting systems (AIP AD 2.14): length, and the spacing of the barrettes along it (30 m for the precision
// systems, Annex 14, 5.3.4; 30 m is an estimate for the 420 m simple system of 03L, which may have 60 m; the 300 m
// system of 03R is published with five barrettes, so 60 m). ALS_LANE is the half-width of the lane kept clear.
const ALS = { CAT2: { len: 900, step: 30 }, CAT1: { len: 900, step: 30 }, SALS420: { len: 420, step: 30 }, SALS300: { len: 300, step: 60 } };
const ALS_LANE = 60;

const APPR_LEN = OLS.appr.sec.reduce((a, s) => a + s[0], 0);
function apprHeight(x) {                                    // approach surface height, x metres out from its inner edge
  let h = 0;
  for (const [len, slope] of OLS.appr.sec) { if (x <= len) return h + slope * x; h += slope * len; x -= len; }
  return Infinity;
}
// the transitional surface climbs sideways from height z0, d metres away; it ends where it meets the inner horizontal
const transHeight = (z0, d) => { const z = z0 + OLS.trans * d; return z <= OLS.innerH.h ? z : Infinity; };
// Height of the lowest obstacle limitation surface over the point (e, n): 0 on the strips and clearways, Infinity
// where no surface reaches. A runway strip is taken as wide as the approach inner edge (the declared strips of AIP
// AD 2.12, 260 m and 160 m, are narrower and lie inside it).
function olsHeight(e, n) {
  const A = OLS.appr, T = OLS.takeoff;
  let h = Infinity, dMin = Infinity;
  for (const R of RUNWAYS) {
    const [s, t] = rwyST(R, e, n), at = Math.abs(t);
    dMin = Math.min(dMin, Math.hypot(s < 0 ? s : s > R.len ? s - R.len : 0, t));
    // the strip, 60 m beyond each paved end, and the transitional surface beside it
    if (s >= -A.dist && s <= R.len + A.dist) h = Math.min(h, transHeight(0, Math.max(0, at - A.inner / 2)));
    for (let k = 0; k < 2; k++) {                           // the low end (k = 0) and the high end of the runway
      // approach surface of this threshold, and the transitional surface along its sides
      const out = k ? 1 : -1, x = out * (s - R.sThr[k]) - A.dist;
      if (x >= 0 && x <= APPR_LEN) { const z = apprHeight(x), half = A.inner / 2 + A.div * x; h = Math.min(h, at <= half ? z : transHeight(z, at - half)); }
      // beyond this paved end: the clearway, then the take-off climb surface of the opposite direction
      const xp = out * (s - (k ? R.len : 0)), xt = xp - Math.max(T.dist, CWY.len);
      if (xp >= 0 && xt < 0 && at <= CWY.w / 2) h = 0;
      if (xt >= 0 && xt <= T.len && at <= Math.min(T.inner / 2 + T.div * xt, T.final / 2)) h = Math.min(h, T.slope * xt);
    }
  }
  if (dMin <= OLS.innerH.r) h = Math.min(h, OLS.innerH.h);
  else if (dMin <= OLS.innerH.r + OLS.conical.h / OLS.conical.slope) h = Math.min(h, OLS.innerH.h + OLS.conical.slope * (dMin - OLS.innerH.r));
  return h;
}
// the runway end whose approach lights run past (e, n), or null
const ENDS = Object.values(RWY_END);
function alsLaneOf(e, n) {
  for (const E of ENDS) {
    const dn = n - E.thr[0], de = e - E.thr[1], s = dn * E.u[0] + de * E.u[1], t = dn * E.r[0] + de * E.r[1];
    if (s <= 0 && s >= -ALS[E.als].len && Math.abs(t) <= ALS_LANE) return E.id;
  }
  return null;
}

// ── things on the ground that a tree must keep clear of ──
// Sizes of the two tree meshes at scale 1 (makeTreeGeos in 55-city.js): height of the top, radius of the crown.
const TREE = { broad: { top: 5.0 + 2.5 * 1.18, crown: 3.4 * 1.18 }, palm: { top: 9.0, crown: 4.6 } };
const TREE_SCALE = [0.75, 1.35];
// Clearance from the trunk to each kind of thing: [metres, share of the crown radius].
//   building  half a crown: a crown may hang over a roof edge, a trunk never stands in or against a wall (our choice)
//   deck      a whole crown from the edge of a viaduct deck, a station or a footbridge
//   apron     7.5 m, the clearance between an aircraft on a stand and an object (Annex 14, 3.13.6), beyond the crown
//   taxiway   43.5 m from the centre line of a taxiway and 40 m from that of a stand taxilane to an object
//             (Annex 14 Table 3-1, code letter E; AIP AD 2.8 gives taxiways of 23 to 50 m). Which line is which is
//             read from the tag of the vectors (`twy` or `lane`), which does not follow the published names (research
//             round 5, tw_names.json: most of TWY C is tagged `lane`, Taxilane T `twy`); the 3.5 m between the two
//             moves one tree
//   water     one cell of the land-use map (2.5 m) beyond the crown, since the drawn shoreline is only that sharp
const SITE_GAP = { building: [0, 0.5], deck: [0, 1], apron: [7.5, 1], taxiway: [43.5, 0], taxilane: [40, 0], water: [2.5, 1] };
// Every taxiway and stand taxilane is drawn this wide: the narrowest width of AIP AD 2.8 (23 to 50 m; which taxiway
// has which width is on the ground movement chart, not read), so an estimate for the wider ones (ค่าประมาณ).
const TWY_W = 23;
const WATER_CLASS = 12;                                     // class ids of the land-use map (tools/landclass.py)
const ROAD_CLASSES = [13, 18];                              // road, secondary, primary, trunk, motorway, rail

class SiteIndex {
  constructor(cell = 50) { this.cell = cell; this.map = new Map(); this.n = {}; this.raster = null; }
  // a closed ring [[e, n], ...] (with optional holes) or, with half ≥ 0, a line of that half-width
  add(kind, ring, { holes = [], half = -1 } = {}) {
    if (!SITE_GAP[kind]) throw new Error(`SiteIndex: unknown kind "${kind}"`);
    if (ring.length < 2) return;
    // the widest clearance: the largest crown there is (a palm at full scale)
    const [fix, share] = SITE_GAP[kind], pad = fix + share * TREE.palm.crown * TREE_SCALE[1] + Math.max(half, 0), c = this.cell;
    // a line goes in span by span, so that a viaduct across the whole map is tried only against the points beside it
    for (const part of half >= 0 ? ring.slice(1).map((b, i) => [ring[i], b]) : [ring]) {
      let e0 = Infinity, e1 = -Infinity, n0 = Infinity, n1 = -Infinity;
      for (const [e, n] of part) { e0 = Math.min(e0, e); e1 = Math.max(e1, e); n0 = Math.min(n0, n); n1 = Math.max(n1, n); }
      const it = { kind, ring: part, holes, half, box: [e0 - pad, e1 + pad, n0 - pad, n1 + pad] };
      const put = (i, j, entry) => { const k = SiteIndex.key(i, j), a = this.map.get(k); if (a) a.push(entry); else this.map.set(k, [entry]); };
      const i0 = Math.floor(it.box[0] / c), i1 = Math.floor(it.box[1] / c), j0 = Math.floor(it.box[2] / c), j1 = Math.floor(it.box[3] / c);
      const rings = [part, ...holes];
      if (half >= 0 || rings.reduce((a, r) => a + r.length, 0) <= SiteIndex.LONG) {
        for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) put(i, j, it);
        continue;
      }
      // A long outline (an apron, a canal) is costly to try, so it is entered only in the cells its edges come near
      // (centre closer to an edge than the cell's half-diagonal plus the clearance). Every other cell lies wholly
      // inside the thing (entered as `all`: each of its points is in the thing) or wholly outside and clear of it
      // (not entered); which one, the row's crossings of the outline tell, as in pointInPoly.
      const lim = c * Math.SQRT1_2 + pad, edge = new Set();
      for (const r of rings) for (let a = 0, b = r.length - 1; a < r.length; b = a++) {
        const A = r[a], B = r[b];
        for (let i = Math.floor((Math.min(A[0], B[0]) - lim) / c); i <= Math.floor((Math.max(A[0], B[0]) + lim) / c); i++) {
          for (let j = Math.floor((Math.min(A[1], B[1]) - lim) / c); j <= Math.floor((Math.max(A[1], B[1]) + lim) / c); j++) {
            if (distToSeg([(i + 0.5) * c, (j + 0.5) * c], A, B) < lim) edge.add(SiteIndex.key(i, j));
          }
        }
      }
      for (let j = j0; j <= j1; j++) {
        const y = (j + 0.5) * c;
        const xs = rings.map((r) => { const x = []; for (let a = 0, b = r.length - 1; a < r.length; b = a++) if ((r[a][1] > y) !== (r[b][1] > y)) x.push(r[a][0] + (y - r[a][1]) * (r[b][0] - r[a][0]) / (r[b][1] - r[a][1])); return x; });
        for (let i = i0; i <= i1; i++) {
          if (edge.has(SiteIndex.key(i, j))) { put(i, j, it); continue; }
          const odd = (x) => x.filter((v) => v > (i + 0.5) * c).length % 2 === 1;
          if (odd(xs[0]) && !xs.slice(1).some(odd)) put(i, j, { kind, all: true });
        }
      }
    }
    this.n[kind] = (this.n[kind] || 0) + 1;
  }
  // a rectangle centred at (e, n): len along (cos yaw, sin yaw) in (e, n), which is a three.js box turned by yaw about y
  box(kind, e, n, len, wid, yaw) {
    const c = Math.cos(yaw), s = Math.sin(yaw), a = [c * len / 2, s * len / 2], b = [s * wid / 2, -c * wid / 2];
    this.add(kind, [[e + a[0] + b[0], n + a[1] + b[1]], [e + a[0] - b[0], n + a[1] - b[1]], [e - a[0] - b[0], n - a[1] - b[1]], [e - a[0] + b[0], n - a[1] + b[1]]]);
  }
  // the land-use classes (one byte per cell, row 0 at the north edge) in which class 12 is water
  setRaster(cls, land) { this.raster = { cls, land }; }
  // distance from p to an item: 0 inside a ring (holes are outside it) or on a line's width
  static dist(p, it) {
    const edges = (r, closed) => { let d = Infinity; for (let i = closed ? 0 : 1, j = closed ? r.length - 1 : 0; i < r.length; j = i++) d = Math.min(d, distToSeg(p, r[j], r[i])); return d; };
    if (it.half >= 0) return Math.max(0, edges(it.ring, false) - it.half);
    if (pointInPoly(p, it.ring) && !it.holes.some((h) => pointInPoly(p, h))) return 0;
    return Math.min(edges(it.ring, true), ...it.holes.map((h) => edges(h, true)));
  }
  // The land-use class at (e, n), 0 outside the map or without one: calls fn(class, share) for each cell that touches
  // the point. That is one cell with share 1, or the two or four that meet there, in equal shares, when the point is
  // on a cell border. A border is a micrometre wide: wide enough for the rounding of the arithmetic, and narrow enough
  // that the answer is that of four points a micrometre around the point, a quarter each (with a millimetre, one
  // sample in 650 that lies inside a cell was read as a border sample). Given to one cell, a border would go to the
  // one east or south of it, and the answer would depend on which side of a road or a bank a house stands.
  eachClassAt(e, n, fn) {
    if (!this.raster) return fn(0, 1);
    const { cls, land: L } = this.raster, fx = (e - L.e0) / L.res, fy = (L.n1 - n) / L.res, rx = Math.round(fx), ry = Math.round(fy);
    const onX = Math.abs(fx - rx) * L.res < 1e-6, onY = Math.abs(fy - ry) * L.res < 1e-6;
    const x0 = onX ? rx - 1 : Math.floor(fx), x1 = onX ? rx : x0, y0 = onY ? ry - 1 : Math.floor(fy), y1 = onY ? ry : y0, share = 1 / ((x1 - x0 + 1) * (y1 - y0 + 1));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) fn(x >= 0 && x < L.w && y >= 0 && y < L.h ? cls[y * L.w + x] : 0, share);
  }
  // is (e, n) in a water cell, or on the border of one?
  waterAt(e, n) { let wet = false; this.eachClassAt(e, n, (k) => { if (k === WATER_CLASS) wet = true; }); return wet; }
  waterWithin(e, n, r) {
    if (!this.raster) return false;
    const { cls, land: L } = this.raster, k = Math.ceil(r / L.res), x0 = Math.floor((e - L.e0) / L.res), y0 = Math.floor((L.n1 - n) / L.res);
    for (let y = Math.max(0, y0 - k); y <= Math.min(L.h - 1, y0 + k); y++) for (let x = Math.max(0, x0 - k); x <= Math.min(L.w - 1, x0 + k); x++) {
      if (cls[y * L.w + x] !== WATER_CLASS) continue;
      // nearest point of the cell to (e, n)
      const ce = clamp(e, L.e0 + x * L.res, L.e0 + (x + 1) * L.res), cn = clamp(n, L.n1 - (y + 1) * L.res, L.n1 - y * L.res);
      if (Math.hypot(ce - e, cn - n) < r) return true;
    }
    return false;
  }
  // the kind of the first mapped thing that is closer to (e, n) than its clearance for a crown of this radius (a
  // thing with no clearance counts when the point is inside it), or null
  near(e, n, crown, skip = null) {
    const p = [e, n];
    for (const it of this.map.get(SiteIndex.key(Math.floor(e / this.cell), Math.floor(n / this.cell))) || []) {
      if (it.kind === skip) continue;
      if (it.all) return it.kind;
      if (e < it.box[0] || e > it.box[1] || n < it.box[2] || n > it.box[3]) continue;
      const [fix, share] = SITE_GAP[it.kind], gap = fix + share * crown, d = SiteIndex.dist(p, it);
      if (gap > 0 ? d < gap : d === 0) return it.kind;
    }
    return null;
  }
  // the same for a tree, which also keeps off the water of the land-use map
  hit(e, n, crown) {
    const [fix, share] = SITE_GAP.water;
    return this.near(e, n, crown) || (this.waterWithin(e, n, fix + share * crown) ? 'water' : null);
  }
}
SiteIndex.LONG = 24;                                        // an outline of more points than this is settled cell by cell
SiteIndex.key = (i, j) => (i + 32768) * 65536 + (j + 32768);   // one number per cell (the map is a few hundred cells wide)

// the length of a polyline, and the point s metres along it (held at its ends)
function lineLength(P) {
  let l = 0;
  for (let i = 1; i < P.length; i++) l += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
  return l;
}
function pointAlong(P, s) {
  for (let i = 1; i < P.length; i++) {
    const a = P[i - 1], b = P[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (s <= l || i === P.length - 1) { const k = l > 0 ? clamp(s / l, 0, 1) : 0; return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; }
    s -= l;
  }
  return P[0];
}
// the nearest point of a polyline to x, with the direction of the line there
function nearestOnLine(P, x) {
  let best = null;
  for (let i = 0; i + 1 < P.length; i++) {
    const a = P[i], b = P[i + 1], de = b[0] - a[0], dn = b[1] - a[1], l2 = de * de + dn * dn || 1;
    const t = clamp(((x[0] - a[0]) * de + (x[1] - a[1]) * dn) / l2, 0, 1), pe = a[0] + de * t, pn = a[1] + dn * t, d = Math.hypot(x[0] - pe, x[1] - pn);
    if (!best || d < best.d) { const l = Math.sqrt(l2); best = { d, p: [pe, pn], dir: [de / l, dn / l] }; }
  }
  return best;
}
// Stations on the viaducts, drawn as generic boxes under a vaulted roof (55-city.js; every size is an estimate): the
// railway station beside Terminal 1, with a footbridge to the terminal, and two stations of the line on Phahonyothin
// Road. `at` is [lat, lon]; each station sits on the nearest point of its line (a key of the airfield vectors). The
// positions came with the first drawing of the stations and no source was recorded for them: estimates (ค่าประมาณ)
// until they are checked against OpenStreetMap.
const STATIONS = [
  { line: 'rail', at: [13.919727, 100.601072], len: 600, wid: 40, y0: 9.0, h: 10, vault: 0.55, bridge: true },
  { line: 'phahon', at: [13.9180, 100.6217], len: 150, wid: 24, y0: 13.5, h: 7, vault: 0.3 },
  { line: 'phahon', at: [13.9249, 100.6259], len: 150, wid: 24, y0: 13.5, h: 7, vault: 0.3 },
];
const STATION_ROOF = [6, 3];                                // the roof is this much longer and wider than the box
const WALK_W = 6.6;                                         // width of the footbridge roof
// Where each station stands: its centre `p` [e, n], the direction `dir` and `yaw` of its line there, the plan of its
// roof [length, width], and for the railway station the footbridge `walk` [from, to]: square to the line, from 24 m
// off its centre to the first point inside the terminal hall (null if it finds none within 600 m). A station whose
// line has fewer than two points is left out (the page itself needs all three lines: it draws their viaducts).
function stationSites(af) {
  return STATIONS.filter((S) => (af[S.line] || []).length > 1).map((S) => {
    const [n, e] = llToNE(...S.at), { p, dir } = nearestOnLine(af[S.line], [e, n]);
    let walk = null;
    if (S.bridge) {
      const at = (d) => [p[0] + dir[1] * d, p[1] - dir[0] * d];
      for (let d = 30; d < 600 && !walk; d += 2) if ((af.hall || []).some((h) => pointInPoly(at(d), h.o))) walk = [at(24), at(d)];
    }
    return { ...S, p, dir, yaw: Math.atan2(dir[1], dir[0]), roof: [S.len + STATION_ROOF[0], S.wid + STATION_ROOF[1]], walk };
  });
}

// The index of everything mapped in the airfield vectors (vtbd_af.json): buildings, aprons, taxiways, water, the
// viaduct decks given as [[polyline, width], ...] and the stations of stationSites with the footbridge; `cls` and
// `land` are the land-use classes of the inner map.
function mappedSite(af, cls, land, decks, stations = []) {
  const site = new SiteIndex();
  site.setRaster(cls, land);
  for (const b of [...af.cbld, ...af.bld, ...af.hall, ...af.pier]) site.add('building', b.o);
  for (const a of af.apron) site.add('apron', a.o, { holes: a.h || [] });
  for (const t of af.tw) site.add(t.k === 'twy' ? 'taxiway' : 'taxilane', t.p, { half: 0 });
  for (const w of af.water) site.add('water', w.o, { holes: w.h || [] });
  for (const [P, w] of decks) site.add('deck', P, { half: w / 2 });
  for (const st of stations) {
    site.box('deck', st.p[0], st.p[1], st.roof[0], st.roof[1], st.yaw);
    if (st.walk) site.add('deck', st.walk, { half: WALK_W / 2 });
  }
  return site;
}

// why a tree with its trunk at (e, n) cannot stand there, or null: 'lane' (approach lights), 'ols' (it would rise
// through an obstacle limitation surface) or the kind of thing it would touch
function treeProblem(site, e, n, top, crown) {
  if (alsLaneOf(e, n)) return 'lane';
  if (top >= olsHeight(e, n)) return 'ols';
  return site.hit(e, n, crown);
}

// Trees from the land-use classes (parks, temples, yards, canal banks): one candidate per grid cell, kept with the
// chance of its class. Returns { broad, palm } as [e, n, scale, turn, height factor] and the count dropped per reason.
// The random stream is used exactly as before the siting rules existed (the draws of a dropped tree are still made),
// so the trees that stay are the same trees.
const TREE_CHANCE = { 8: 0.6, 10: 0.75, 24: 0.3, 26: 0.35, 23: 0.15, 2: 0.05, 1: 0.07, 5: 0.07, 7: 0.04, 11: 0.05, 3: 0.02 };
function placeTrees(cls, L, quality, rnd, site) {
  const out = { broad: [], palm: [], dropped: {} };
  const step = quality === 'high' ? 13 : 17, rMax = quality === 'high' ? 4200 : 3000;
  let nb = 0, np = 0;
  for (let nN = L.n1 - step / 2; nN > L.n1 - L.h * L.res; nN -= step) {
    for (let e = L.e0 + step / 2; e < L.e0 + L.w * L.res; e += step) {
      const ee = e + (rnd() - 0.5) * step * 0.9, nn = nN + (rnd() - 0.5) * step * 0.9;
      const x = Math.floor((ee - L.e0) / L.res), y = Math.floor((L.n1 - nn) / L.res);
      const pr = TREE_CHANCE[cls[y * L.w + x]] || 0;
      if (!pr || rnd() > pr) continue;
      if (onAnyRunway(ee, nn, 160)) continue;
      if (Math.hypot(ee * 0.9, nn * 0.55) > rMax) continue;
      const palm = rnd() < 0.28, s = 0.75 + rnd() * 0.6, turn = rnd() * Math.PI * 2;
      const k = palm ? np++ : nb++, hk = 0.9 + 0.2 * ((k * 7919) % 11) / 11, T = palm ? TREE.palm : TREE.broad;
      const why = treeProblem(site, ee, nn, T.top * s * hk, T.crown * s);
      if (why) { out.dropped[why] = (out.dropped[why] || 0) + 1; continue; }
      (palm ? out.palm : out.broad).push([ee, nn, s, turn, hk]);
    }
  }
  return out;
}

const isRoad = (k) => k >= ROAD_CLASSES[0] && k <= ROAD_CLASSES[1];
// The shares of a building's footprint that lie on water cells and on road or rail cells of the land-use map, from
// a grid of sample points no further apart than half a cell, and at least eight along each side (b: centre e, n;
// sides w along (cos yaw, sin yaw) and d across; yaw). A sample on a cell border counts half for each side (the
// samples of a house square to the map often are): the share is the same on either side of a road.
function groundShare(site, b) {
  const c = Math.cos(b.yaw), s = Math.sin(b.yaw), res = site.raster ? site.raster.land.res / 2 : 1;
  const nu = Math.max(8, Math.ceil(b.w / res)), nv = Math.max(8, Math.ceil(b.d / res));
  let wet = 0, road = 0;
  const add = (k, share) => { if (k === WATER_CLASS) wet += share; else if (isRoad(k)) road += share; };
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const u = ((i + 0.5) / nu - 0.5) * b.w, v = ((j + 0.5) / nv - 0.5) * b.d;
    site.eachClassAt(b.e + u * c + v * s, b.n + u * s - v * c, add);
  }
  return { water: wet / (nu * nv), road: road / (nu * nv) };
}
// A generated building may have a side on a bank, but not this share of its footprint on water, nor its centre in
// water or on a bank line (a house astride a canal one cell wide). The share is our choice: the city data put houses
// along the canals, and the drawn shoreline is only a cell sharp. On the data of 2026-11-26 the centre alone drops
// one house (on a bank line, an eighth of it on water); every other house with its centre in water has the share too.
const WET_MAX = 0.2;
// It may reach into a road, which the map draws wider than it is, but not with a third of its footprint (our choice).
// Measured on 2026-11-26 in the balanced quality: a third drops 2,334 of 57,895 buildings (4 %), nearly all of them
// shophouses; 1,898 stand alone and no group of them (linked at 25 m) is larger than five, so no row of houses goes.
// A half would drop 812 and leave houses that a road cuts in two: 4 in the balanced quality and 11 in the high one.
// At a third none is left in balanced and one in high, where two lanes meet corner to corner under it
// (test/siting.test.mjs looks at every kept building).
// The centre is not asked: the city data never puts one inside a road cell, only on a cell border, and a house with
// its centre on the kerb line is not in the road.
const ROAD_MAX = 1 / 3;
// Why a generated (not mapped) building cannot stand where the city data puts it, or null. Nine points are tried, the
// centre, the corners and the middles of the sides: none may be in an approach light lane ('lane'), under a surface the
// building would rise through ('ols'), inside a mapped building, a viaduct deck or a station, or closer to a pavement
// than its clearance. Then the ground of the land-use map: 'water' when the centre is in water or on a bank line or
// WET_MAX of the footprint is on water, 'road' when ROAD_MAX of it is on a road or a railway.
function buildingProblem(site, b) {
  const c = Math.cos(b.yaw), s = Math.sin(b.yaw);
  for (const i of [0, -1, 1]) for (const j of [0, -1, 1]) {
    const e = b.e + i * c * b.w / 2 + j * s * b.d / 2, n = b.n + i * s * b.w / 2 - j * c * b.d / 2;
    if (alsLaneOf(e, n)) return 'lane';
    if (b.h >= olsHeight(e, n)) return 'ols';
    const k = site.near(e, n, 0, 'water');
    if (k) return k;
  }
  const on = groundShare(site, b);
  if (site.waterAt(b.e, b.n) || on.water >= WET_MAX) return 'water';
  return on.road >= ROAD_MAX ? 'road' : null;
}
// Drops the generated buildings that cannot stand, enters the others in the index, and returns them with the count
// dropped per reason.
function siteBuildings(site, list) {
  const dropped = {};
  const kept = list.filter((b) => { const why = buildingProblem(site, b); if (why) dropped[why] = (dropped[why] || 0) + 1; return !why; });
  for (const b of kept) site.box('building', b.e, b.n, b.w, b.d, b.yaw);
  return { kept, dropped };
}
