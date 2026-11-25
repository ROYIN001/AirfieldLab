// AIP Thailand AD 2 VTBD against the simulator (research round 5 §1, tests T-A01…T-A19, T-A21, T-A22, T-A24, T-A25;
// plan item A3). test/fixtures/aip_vtbd_current.json holds the values published in the cycle it names (meta, AIRAC
// 29 OCT 2026, numbers only, © CAAT): this file checks that RWY_DATA in src/15-geo.js, the geometry derived from it and
// the AIP facts quoted in the Thai UI text still match it. A new AIRAC cycle updates the fixture first; a value that
// changed then fails here, and test/licenses.test.mjs (T-K05) asks for the new cycle in the footer and comments.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { M } from './harness.mjs';
const { RWY_END, RUNWAYS, llToNE, FT, DEG, setActiveRunway, gpHeight } = M;
const NM = 1852;   // m, international nautical mile (ICAO Annex 5)

const AIP = JSON.parse(fs.readFileSync(new URL('./fixtures/aip_vtbd_current.json', import.meta.url), 'utf8')).aip_vtbd_current;
const ENDS = ['03L', '21R', '03R', '21L'];
const ILS = ENDS.filter((id) => AIP.ends[id].approach.kind === 'ILS');
const rwyOf = (id) => RUNWAYS.find((r) => r.ends.includes(id));
const rwyAIP = (id) => AIP.runways[rwyOf(id).id];
// (s, t) of a point in a runway end's frame: s along the landing direction from the threshold, t to the right
const st = (id, p) => { const E = RWY_END[id], dn = p[0] - E.thr[0], de = p[1] - E.thr[1]; return [dn * E.u[0] + de * E.u[1], dn * E.r[0] + de * E.r[1]]; };
const stLL = (id, o) => st(id, llToNE(o.lat, o.lon));
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const fx = (v, n = 1) => v.toFixed(n);

test('fixture: AIP cycle, units and the published values the tests below read', () => {
  assert.match(AIP.meta.airac_effective, /^\d{4}-\d{2}-\d{2}$/);
  assert.deepEqual(Object.keys(AIP.ends).sort(), [...ENDS].sort());
  for (const id of ENDS) {
    const E = AIP.ends[id];
    assert.ok(Number.isFinite(E.thr.lat) && Number.isFinite(E.thr.lon) && Number.isFinite(E.papi.meht_ft), id);
    assert.ok(Number.isFinite(E.declared.tora) && Number.isFinite(E.declared.lda), id);
  }
});

test('RWY_DATA matches the fixture: thresholds, widths, MEHT, ILS idents, frequencies, LOC and GP positions, RDH', () => {
  for (const id of ENDS) {
    const E = RWY_END[id], A = AIP.ends[id], a = E.appr, R = rwyAIP(id);
    const [n, e] = llToNE(A.thr.lat, A.thr.lon);   // fixture lat/lon carry 8 decimals (≈ 1 mm)
    assert.ok(near(E.thr[0], n, 0.01) && near(E.thr[1], e, 0.01), `${id} threshold off by ${fx(Math.hypot(E.thr[0] - n, E.thr[1] - e), 3)} m`);
    assert.equal(E.w, R.wid_m, `${id} width`);
    assert.equal(E.disp, A.disp_m, `${id} displaced threshold`);
    assert.ok(near(E.meht, A.papi.meht_ft * FT, 1e-9), `${id} MEHT ${fx(E.meht / FT, 2)} ft, AIP ${A.papi.meht_ft} ft`);
    assert.equal(a.kind, A.approach.kind, `${id} approach kind`);
    if (a.kind === 'ILS') {
      const P = A.approach;
      assert.equal(a.ident, P.ident, `${id} ident`);
      assert.equal(a.cat, P.cat, `${id} ILS category`);
      assert.equal(Number(a.freq), P.loc_mhz, `${id} LOC frequency`);
      assert.equal(a.rdhFt, P.rdh_ft, `${id} RDH`);
      const loc = llToNE(...a.loc), L = llToNE(P.loc.lat, P.loc.lon);
      assert.ok(Math.hypot(loc[0] - L[0], loc[1] - L[1]) < 0.01, `${id} LOC antenna position`);
      if (a.gp) {
        const g = llToNE(...a.gp), G = llToNE(P.gp.lat, P.gp.lon);
        assert.ok(Math.hypot(g[0] - G[0], g[1] - G[1]) < 0.01, `${id} GP antenna position`);
      }
    } else {
      assert.equal(a.tchFt, A.approach.tch_ft_assumed, `${id} RNP TCH (not published in AD 2.19; the research keeps 50 ft)`);
    }
  }
});

test('RWY_DATA matches the fixture: approach lights, TDZ lights, centre line lights, concrete runway ends', () => {
  for (const id of ENDS) {
    const E = RWY_END[id], A = AIP.ends[id];
    const m = /^(SALS|CAT)(\d+)$/.exec(E.als);
    assert.ok(m, `${id} ALS code ${E.als}`);
    if (m[1] === 'SALS') assert.ok(A.als.type.startsWith('SALS') && A.als.len_m === Number(m[2]), `${id} ${E.als} vs AIP ${A.als.type} ${A.als.len_m} m`);
    else assert.ok(A.als.type === 'CAT ' + 'I'.repeat(Number(m[2])) && A.als.len_m === 900, `${id} ${E.als} vs AIP ${A.als.type} ${A.als.len_m} m`);
    assert.equal(E.tdz, A.tdz_lgt_m > 0, `${id} TDZ lights (AIP ${A.tdz_lgt_m} m)`);
  }
  for (const R of RUNWAYS) {
    const A = AIP.runways[R.id];
    assert.equal(R.cl, A.rcl !== 'NIL', `${R.id} centre line lights`);
    const c = /concrete (\d+) m from THR 03L end and (\d+) m from THR 21R end/.exec(A.surface);
    assert.deepEqual(R.conc, c ? [Number(c[1]), Number(c[2])] : [0, 0], `${R.id} concrete ends`);
  }
});

test('T-A01 T-A02 runway lengths from the threshold coordinates match AD 2.12 (±3 m)', () => {
  for (const R of RUNWAYS) {
    const L = AIP.runways[R.id].len_m;
    assert.ok(near(R.len, L, 3), `${R.id} ${fx(R.len)} m, AIP ${L} m`);
  }
});

test('T-A03 T-A04 landing distance available on each end matches the declared LDA (±3 m); 21L displaced 350 m', () => {
  for (const id of ENDS) assert.ok(near(RWY_END[id].lda, AIP.ends[id].declared.lda, 3), `${id} LDA ${fx(RWY_END[id].lda)} m, AIP ${AIP.ends[id].declared.lda} m`);
  assert.equal(RWY_END['21L'].disp, 350);
});

test('T-A05 declared distances: TODA − TORA = the 150 m clearway, ASDA = TORA, TORA = runway length', () => {
  for (const id of ENDS) {
    const D = AIP.ends[id].declared, R = rwyAIP(id), k = rwyOf(id).ends.indexOf(id);
    assert.equal(D.toda - D.tora, R.cwy_m[k], `${id} TODA ${D.toda} − TORA ${D.tora}`);
    assert.equal(D.asda, D.tora, `${id} ASDA`);
    assert.equal(D.tora, R.len_m, `${id} TORA`);
  }
});

test('T-A06 glide path crosses each threshold at the published RDH (03R: the assumed 50 ft TCH) ±0.01 m', () => {
  try {
    for (const id of ENDS) {
      const P = AIP.ends[id].approach, ft = P.kind === 'ILS' ? P.rdh_ft : P.tch_ft_assumed;
      setActiveRunway(id);
      assert.ok(near(gpHeight(0), ft * FT, 0.01), `${id} gp(0) ${fx(gpHeight(0), 3)} m, AIP ${ft} ft`);
    }
  } finally { setActiveRunway('21R'); }
});

test('T-A07 PAPI distance solved from the AIP MEHT in the drawn geometry (PR #5 values 424.9/384.8/373.1/376.0 m)', () => {
  // estimate: AD 2.14 publishes MEHT but no distance; light 0.64 m high, 2°50′ unit 33 m outside the edge (PAPI_GEOM)
  const G = M.PAPI_GEOM;
  for (const [id, d] of [['03L', 424.9], ['21R', 384.8], ['03R', 373.1], ['21L', 376.0]]) {
    const E = RWY_END[id], eye = G.h + Math.hypot(E.papi, E.w / 2 + G.off[2]) * Math.tan(G.ang[2] * DEG);
    assert.ok(near(E.papi, d, 0.1), `${id} PAPI ${E.papi} m (expect ${d})`);
    assert.ok(near(eye, AIP.ends[id].papi.meht_ft * FT, 0.01), `${id} eye at MEHT ${fx(eye, 3)} m vs ${fx(AIP.ends[id].papi.meht_ft * FT, 3)} m`);
  }
});

test('T-A08 the PAPI stands beyond the ILS glide-path origin on every ILS end', () => {
  for (const id of ILS) {
    const E = RWY_END[id];
    assert.ok(E.papi > E.aim, `${id} PAPI ${E.papi} m, GP origin ${fx(E.aim)} m`);
  }
});

test('T-A09 T-A10 true bearings from the coordinates: 03L/21R within 0.5° of 029°/209°, 03R/21L 28.75° (published 028°)', () => {
  for (const id of ['03L', '21R']) assert.ok(near(RWY_END[id].hdg, AIP.ends[id].true_brg_pub, 0.5), `${id} ${fx(RWY_END[id].hdg, 3)}°`);
  // AD 2.12 rounds 03R/21L to 028°/208°, 0.74° off its own coordinates; the sim follows the coordinates
  for (const id of ['03R', '21L']) assert.ok(near(RWY_END[id].hdg, AIP.ends[id].true_brg_from_coords, 0.05), `${id} ${fx(RWY_END[id].hdg, 3)}°`);
  assert.ok(!near(RWY_END['03R'].hdg, AIP.ends['03R'].true_brg_pub, 0.5), '03R must not be forced to the rounded 028°');
});

test('T-A11 the ARP (origin) is on the 03L/21R centre line, 1,510 m from THR 21R (AD 2.2) ±3 m', () => {
  const [s, t] = st('21R', [0, 0]);
  assert.ok(near(s, 1510, 3) && near(t, 0, 3), `s ${fx(s)} m, t ${fx(t)} m`);
});

test('T-A12 the ARP published in this cycle (rounded to whole seconds) is 8.0 m north and 14.7 m west of the origin', () => {
  const P = AIP.arp.published_current, [n, e] = llToNE(P.lat, P.lon);
  assert.ok(Math.hypot(n, e) <= 22 && near(n, 8.0, 0.2) && near(e, -14.7, 0.2), `n ${fx(n, 2)} m, e ${fx(e, 2)} m`);
  assert.ok(near(n, P.en[1], 0.2) && near(e, P.en[0], 0.2), 'fixture [e, n]');
});

test('T-A13 T-A16 localizers beyond the far threshold: 21R 300 m (±5), 21L between the published 225 m and the coordinates', () => {
  const v21R = RWY_END['21R'].locDist - RWY_END['21R'].lda, v21L = RWY_END['21L'].locDist - RWY_END['21L'].lda;
  assert.ok(near(v21R, AIP.ends['21R'].approach.pub_loc_from_opp_thr_m, 5), `21R ${fx(v21R)} m`);
  assert.ok(near(st('21R', llToNE(...RWY_END['21R'].appr.loc))[1], 0, 3), '21R LOC on the centre line');
  assert.ok(v21L >= 222 && v21L <= 236, `21L ${fx(v21L)} m (AIP text 225 m, coordinates 232.6 m)`);
});

test('T-A14 T-A15 GP/DME 21R and 21L from AD 2.19 coordinates: ≈333/320 m in, 120 m off the centre line, between the runways', () => {
  for (const [id, side] of [['21R', -1], ['21L', 1]]) {
    const P = AIP.ends[id].approach, [s, t] = stLL(id, P.gp);
    assert.ok(near(s, P.pub_gp_from_thr_m, 5) && near(Math.abs(t), P.pub_gp_offset_m, 3) && Math.sign(t) === side, `${id} GP s ${fx(s)} m, t ${fx(t)} m`);
  }
});

test('T-A17 GP 03L sits abeam the glide-path origin of its 55 ft RDH (±5 m), 121.2 m off the centre line', () => {
  const E = RWY_END['03L'], [, t] = stLL('03L', AIP.ends['03L'].approach.gp);
  assert.ok(near(E.gpAntenna, E.aim, 5) && near(Math.abs(t), 121.2, 3), `GP ${fx(E.gpAntenna)} m, origin ${fx(E.aim)} m, t ${fx(t)} m`);
});

test('T-A18 DVOR/DME BKK: n −2,306.2 m, e −1,026.4 m; 324.7 m before THR 03L, 209.4 m right of the centre line (±1 m)', () => {
  const V = AIP.navaids['DVOR/DME BKK'], [n, e] = llToNE(V.lat, V.lon), [s, t] = stLL('03L', V);
  assert.ok(near(n, -2306.2, 1) && near(e, -1026.4, 1) && near(s, -324.7, 1) && near(t, 209.4, 1), `n ${fx(n)} e ${fx(e)} s ${fx(s)} t ${fx(t)}`);
});

test('T-A19 DME channels pair with the published VHF frequencies (ICAO Annex 10 Vol I, Table A)', () => {
  // X channels: 108.00–112.25 MHz → 17X–59X, 112.30–117.95 MHz → 70X–126X, in 0.1 MHz steps
  const ch = (f) => (f <= 112.25 ? Math.round(17 + 10 * (f - 108.0)) : Math.round(70 + 10 * (f - 112.3))) + 'X';
  const pairs = ILS.map((id) => [id, AIP.ends[id].approach.loc_mhz, AIP.ends[id].approach.dme_ch]);
  pairs.push(['BKK', AIP.navaids['DVOR/DME BKK'].vor_mhz, AIP.navaids['DVOR/DME BKK'].dme_ch]);
  for (const [id, f, c] of pairs) assert.equal(ch(f), c, `${id} ${f} MHz`);
  assert.deepEqual(pairs.map((p) => p[2]), ['34X', '30X', '40X', '124X']);
});

test('T-A21 runway centre lines 390–398 m apart (393.7 m at THR 03R): no simultaneous parallel approaches', () => {
  const [a, b] = RUNWAYS, q = [b.p0[0] - a.p0[0], b.p0[1] - a.p0[1]], sep = q[0] * a.r[0] + q[1] * a.r[1];
  assert.ok(sep >= 390 && sep <= 398, `${fx(sep)} m`);
});

test('T-A22 threshold elevations: metres agree with feet (±0.2 m), except 03R in this cycle (1.0 m vs 5 ft)', () => {
  // AMDT 11/26 rounds THR 03R to 1.0 m but keeps 5 ft (1.52 m); the research keeps the 14 MAY 2026 value 1.49 m
  for (const id of ENDS) {
    const A = AIP.ends[id], m = id === '03R' ? A.thr_elev_m_20260514 : A.thr_elev_m;
    assert.ok(near(m, A.thr_elev_ft * FT, 0.2), `${id} ${m} m vs ${A.thr_elev_ft} ft`);
  }
  const A = AIP.ends['03R'];
  assert.ok(!near(A.thr_elev_m, A.thr_elev_ft * FT, 0.2), `03R published ${A.thr_elev_m} m now agrees with ${A.thr_elev_ft} ft: drop the 14 MAY value`);
});

test('T-A24 the 61 m radio mast (AD 2.10) is outside the 03R/21L strip: 886 m right of the centre line', () => {
  const mast = AIP.obstacles_ad2_10.find((o) => o.type === 'radio mast' && o.hgt_m === 61), [s, t] = stLL('03R', mast);
  const half = AIP.runways['03R/21L'].strip_m[1] / 2;
  assert.ok(Math.abs(t) > half && near(s, 2398.2, 1) && near(t, 886.2, 1), `s ${fx(s)} m, t ${fx(t)} m (strip half width ${half} m)`);
});

test('T-A25 ATZ radius 5 NM = 9,260 m around the published ARP', () => {
  assert.equal(AIP.atz.radius_nm * NM, AIP.atz.radius_m);
  assert.equal(AIP.atz.radius_m, 9260);
  assert.equal(AIP.atz.centre, AIP.arp.published_current.dms);
});

test('the AIP facts quoted in the Thai UI text match the fixture (frequencies, MEHT, RDH, runway sizes)', () => {
  const app = fs.readFileSync(new URL('../src/90-app.js', import.meta.url), 'utf8');
  const tpl = fs.readFileSync(new URL('../src/template.html', import.meta.url), 'utf8');
  const freqs = new Set([
    ...ILS.flatMap((id) => [AIP.ends[id].approach.loc_mhz, AIP.ends[id].approach.gp_mhz]),
    AIP.navaids['DVOR/DME BKK'].vor_mhz, ...Object.values(AIP.comms_ad2_18).flat().filter(Number.isFinite),
  ]);
  const quoted = [...app.matchAll(/(\d{3}\.\d{1,2}) MHz/g)].map((m) => Number(m[1]));
  assert.ok(quoted.length >= 4, `found ${quoted.length} frequencies`);
  for (const f of quoted) assert.ok(freqs.has(f), `${f} MHz is not in AD 2.18/2.19`);
  for (const m of app.matchAll(/MEHT (\d+\.\d+) ft \((\w+)\)/g)) assert.equal(Number(m[1]), AIP.ends[m[2]].papi.meht_ft, m[0]);
  assert.match(app, new RegExp(`RDH ${AIP.ends['21R'].approach.rdh_ft} ft`));
  const size = (id) => { const R = AIP.runways[id]; return `${R.len_m.toLocaleString('en-US')} × ${R.wid_m} ม.`; };
  assert.ok(app.includes(size('03L/21R')) && app.includes(size('03R/21L')), 'runway sizes in the hotspot facts');
  for (const id of ['03L/21R', '03R/21L']) assert.ok(tpl.includes(`${id} ยาว ${AIP.runways[id].len_m.toLocaleString('en-US')} ม.`), `${id} length in the welcome text`);
});
