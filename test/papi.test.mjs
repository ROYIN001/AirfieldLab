// PAPI and ILS geometry (research round 3, topic 3.5 and 3.9): PAPI distance solved from the AIP MEHT in the sim's
// own light geometry, PAPI seen from the pilot's eye, ILS flown and displayed at the glide-slope antenna, and the
// localizer dot scaled per runway. Expected values come from an independent calculation (Python, same formulas).
// Plan C7 (research round 3 task item 6, R3-6; 03-airliners/05-airport-geometry.md §3.5.6–§3.5.9): every type's eye,
// glide-slope antenna and wheel contact points from its card (tools/aircraft/build_airliners.mjs eyeAntenna; owner
// decisions OD-A320-PITCH and OD-A330-VISUAL), T-D-03, T-D-06, T-D-09, T-D-10, T-D-18, T-D-19, T-D-21, T-D-27, and P-03,
// P-05, P-06 on every type. The geometry here is worked again by hand (pathUp, the ideal PAPI), not taken from the
// generator.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { M, AIRCRAFT_CARD } from './harness.mjs';
const { FIELD, AC, Flight, SCENARIOS, FT, DEG, RAD, papiSeen, ilsAt, gpHeight, setActiveRunway, RWY_END, rwyToNED, rwyLocal, eulerToQ, qToR, mulR,
  setAircraft, PAPI, PAPI_GEOM } = M;
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const whites = (pw) => pw.filter((v) => v > 0.5).length;
const MEHT_FT = { '03L': 71.85, '21R': 65.42, '03R': 63.35, '21L': 63.81 };   // AIP AD 2.14

test('P-01 PAPI distance solved from MEHT (estimate: light 0.64 m high, 2°50′ unit 33 m outside the edge)', () => {
  for (const [id, d] of [['03L', 424.9], ['21R', 384.8], ['03R', 373.1], ['21L', 376.0]]) {
    assert.ok(near(RWY_END[id].papi, d, 0.1), `${id} papi ${RWY_END[id].papi} m (expect ${d})`);
  }
});

test('P-02 MEHT holds: over the threshold just above MEHT the eye sees 2 white, just below 1', () => {
  for (const id of Object.keys(MEHT_FT)) {
    setActiveRunway(id);
    const [n, e] = rwyToNED(0, 0), h = MEHT_FT[id] * FT;
    const up = whites(papiSeen(n, e, h + 0.06)), dn = whites(papiSeen(n, e, h - 0.06));
    assert.ok(up === 2 && dn === 1, `${id} MEHT ${h.toFixed(2)} m: +6 cm ${up} white, −6 cm ${dn} white`);
  }
});

test('P-03 colour bands over the 21R threshold (edges 17.73 / 19.94 / 22.14 / 24.34 m): 0 to 4 white', () => {
  setActiveRunway('21R');
  const [n, e] = rwyToNED(0, 0);
  const got = [17.0, 18.8, 21.0, 23.2, 25.3].map((h) => whites(papiSeen(n, e, h)));
  assert.equal(got.join(), '0,1,2,3,4', `21R eye 17.0/18.8/21.0/23.2/25.3 m → ${got.join('/')} white`);
});

test('P-04 localizer and glide-slope dots (T-O-01): LOC 1 dot = atan(105 m / localizer distance) / 2, G/S 0.36°', () => {
  for (const [id, d, tol] of [['21R', 0.751, 0.005], ['03L', 0.749, 0.005], ['21L', 0.889, 0.01]]) {
    setActiveRunway(id);
    assert.ok(near(FIELD.locDot, d, tol), `${id} LOC 1 dot ${FIELD.locDot.toFixed(4)}° (expect ${d}°)`);
  }
  assert.equal(FIELD.gsDot, 0.36);
});

test('P-05 eye and antenna follow the attitude; the displayed G/S deviation is the antenna\'s', () => {
  setActiveRunway('21R');
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'ap', seed: 1 });
  const ac = f.ac, q = eulerToQ(0, 5 * DEG, FIELD.rwyHdg * DEG);   // pitch 5°, wings level, heading down the runway
  ac.x[6] = q[0]; ac.x[7] = q[1]; ac.x[8] = q[2]; ac.x[9] = q[3]; ac.updateAir();
  const a = ac.air, h = -ac.x[2];
  const eyeUp = AC.eye[0] * Math.sin(5 * DEG) - AC.eye[2] * Math.cos(5 * DEG);
  const antUp = AC.gsAnt[0] * Math.sin(5 * DEG) - AC.gsAnt[2] * Math.cos(5 * DEG);
  assert.ok(near(a.eye[2] - h, 1.079, 0.002) && near(eyeUp, 1.079, 0.002), `eye ${(a.eye[2] - h).toFixed(3)} m above CG (expect 1.079)`);
  assert.ok(near(a.antH - h, -0.072, 0.002) && near(antUp, -0.072, 0.002), `antenna ${(a.antH - h).toFixed(3)} m above CG (expect −0.072)`);
  // put the antenna exactly on the beam: the dots read zero, while a CG-based reading would not
  const dh = gpHeight(a.antS) - a.antH; ac.x[2] -= dh; ac.updateAir();
  assert.ok(Math.abs(ac.air.gsDots) < 0.01, `antenna on the beam → G/S ${ac.air.gsDots.toFixed(3)} dots (CG-based ${ilsAt(ac.x[0], ac.x[1], -ac.x[2]).gsDots.toFixed(3)})`);
});

test('P-06 calm autoland on every runway lands in the touchdown zone; on the 21R ILS the PAPI reads low from about −740 m', (t) => {
  for (const id of ['21R', '21L', '03L', '03R']) {
    setActiveRunway(id);
    const f = new Flight({ wind: SCENARIOS.calm, pilot: 'ap', seed: 5 });
    let drop = null, at2nm = null, atThr = null;
    while (f.ac.t < 260 && !f.ev.done && !f.crashed) {
      f.tick(f.dt);
      const a = f.ac.air;
      if (a.s > 0 || a.onGround) continue;
      const nW = whites(papiSeen(...a.eye));
      if (at2nm === null && a.s > -3704) at2nm = nW;
      if (drop === null && a.s > -2000 && nW < 2) drop = a.s;
      atThr = nW;
    }
    const td = f.ev.td, sc = f.ev.score();
    assert.ok(!f.crashed && td && td.s > 250 && td.s < 400 && sc && sc.total >= 93, `${id} autoland td ${td && td.s.toFixed(0)} m score ${sc && sc.total}`);
    if (FIELD.appr === 'ILS') t.diagnostic(`${id} on the ILS: PAPI ${at2nm} white at 2 NM, below 2 white from s ${drop === null ? '—' : drop.toFixed(0)} m, ${atThr} white over the threshold`);
    // eye 1.3 m above the antenna, while MEHT over the 21R threshold is 3.5 m above the beam
    if (id === '21R') assert.ok(at2nm === 2 && drop !== null && near(drop, -740, 80), `21R: ${at2nm} white at 2 NM, below 2 white from ${drop && drop.toFixed(0)} m (expect −740 ± 80 m)`);
  }
});

// ───────────────────────── plan C7: every type (research round 3 task item 6, R3-6) ─────────────────────────
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const card = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'aircraft', `${id}.json`), 'utf8'));
const trainer = () => JSON.parse(fs.readFileSync(AIRCRAFT_CARD, 'utf8'));
// the round 3 research card (read only), to compare what the generator copied or changed
const research = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'research', '03-airliners', `params-${id.replace(/_/g, '-')}.json`), 'utf8'));
after(() => { setAircraft(trainer()); setActiveRunway('21R'); });
const LIGHT = ['c172s', 'c172r', 'da42ng', 'da42_tae125', 'da40d', 'da40_180'];
const AIRLINERS = ['a320ceo', 'b737_800', 'a320neo', 'a330_300', 'a321neo', 'atr72_600', 'a321ceo'];
const AIRBUS = ['a320ceo', 'a320neo', 'a321ceo', 'a321neo', 'a330_300'];
const ALL = ['trainer', ...LIGHT, ...AIRLINERS];
const cardOf = (id) => (id === 'trainer' ? trainer() : card(id));
const geo = (c) => c.airframe.geometry;
const RWYS = ['03L', '21R', '03R', '21L'];
// AIP AD 2.14 [D35]: ILS RDH 03L 55 ft, 21R 54 ft, 21L 53 ft; 03R is RNP and the repo's synthetic path crosses at 50 ft
const RDH_FT = { '03L': 55, '21R': 54, '03R': 50, '21L': 53 };
// The reference approach attitude (05-airport-geometry.md §3.5.6): the research's approach_visual.pitch_deg where it
// has one (737 FD pitch 3.2° [D3], ATR 0° [D19]); OD-A320-PITCH: 2.5° for the A320 family (a temporary estimate); the A330
// 3.0°, the research's own estimate for its back-solve. Set here again, apart from the generator's REF_PITCH.
const OD_A320_PITCH = 2.5, A330_PITCH = 3.0;
const refPitch = (id, c) => geo(c).approach_visual?.v.pitch_deg ?? (id === 'a330_300' ? A330_PITCH : OD_A320_PITCH);
const tan = (d) => Math.tan(d * DEG);
// path height of a body point p (FRD) above the CG's path on a θ = 3° descent at pitch ρ, wings level (§3.5.8 eq. 1):
// its height above the CG plus the rise of the path over its distance ahead
const pathUp = (p, rho, th = 3) => (p[0] * Math.cos(rho * DEG) + p[2] * Math.sin(rho * DEG)) * tan(th) + p[0] * Math.sin(rho * DEG) - p[2] * Math.cos(rho * DEG);
const upOf = (p, rho) => p[0] * Math.sin(rho * DEG) - p[2] * Math.cos(rho * DEG);   // height above the CG, point to point
const mains = (c) => c.gear.legacy.v[1].b;
// Ideal PAPI of the research (lights 0 m high on the centre line, settings 2°30′/2°50′/3°10′/3°30′, D = MEHT/tan 2°50′
// rounded to 5 m, as the old papiFromMEHT): the angle from the eye at height h, x m before the threshold, and the whites
const SET = [2.5, 2 + 50 / 60, 3 + 10 / 60, 3.5];
const D_IDEAL = Object.fromEntries(RWYS.map((r) => [r, Math.round(MEHT_FT[r] * FT / tan(2 + 50 / 60) / 5) * 5]));
const idealAng = (h, D, x = 0) => Math.atan2(h, x + D) * RAD;
const idealWhites = (ang) => SET.filter((a) => ang > a).length;
// The sim's PAPI worked again (15-geo.js PAPI_GEOM: units 15, 24, 33, 42 m outside the left edge, light centre 0.64 m;
// distance RWY_END[id].papi): the whites an eye at runway station s, offset t (right +), height h sees
const simWhites = (id, s, t, h) => PAPI_GEOM.off.filter((o, i) => {
  const d = Math.hypot(RWY_END[id].papi - s, -(RWY_END[id].w / 2 + o) - t);
  return Math.atan2(h - PAPI_GEOM.h, d) * RAD > PAPI_GEOM.ang[i];
}).length;
// Put an aircraft at attitude (0, θ, runway heading) with its glide-slope antenna on the beam and the body point p at
// runway station s (iterated: the antenna's station follows the point's); returns the air data
function onBeamAt(ac, thDeg, p, s) {
  const q = eulerToQ(0, thDeg * DEG, FIELD.rwyHdg * DEG), R = qToR(q, new Array(9)), pa = mulR(R, AC.gsAnt), pp = mulR(R, p);
  let sa = s;
  for (let it = 0; it < 4; it++) {
    const [n, e] = rwyToNED(sa, 0);
    const cn = n - pa[0], ce = e - pa[1];
    sa += s - rwyLocal(cn + pp[0], ce + pp[1])[0];
  }
  const [n, e] = rwyToNED(sa, 0), [as] = rwyLocal(n, e);
  ac.x.set([n - pa[0], e - pa[1], -gpHeight(as) - pa[2], 0, 0, 0, q[0], q[1], q[2], q[3], 0, 0, 0]);
  ac.updateAir(0);
  return ac.air;
}
function withType(id, fn) { try { setAircraft(cardOf(id)); return fn(cardOf(id)); } finally { setAircraft(trainer()); setActiveRunway('21R'); } }

test('C7: each airliner\'s eye and antenna from its card (H1, H2 at the reference attitude; OD-A320-PITCH, OD-A330-VISUAL); the light cards keep the antenna at the eye', () => {
  for (const id of AIRLINERS) {
    const c = card(id), g = geo(c), av = g.approach_visual.v, eye = g.eye_pos_FRD.v, ant = g.gsAntenna_pos_FRD.v, w = mains(c), rho = refPitch(id, c);
    // the antenna's path runs H2 under the eye's (05-airport-geometry.md §3.5.9 item 1), on the centre line
    const h2 = pathUp(eye, rho) - pathUp(ant, rho);
    assert.ok(Math.abs(h2 - g.eye_to_gsAntenna_vertical.v) < 1e-3, `${id}: eye path ${h2.toFixed(4)} m above the antenna path (H2 ${g.eye_to_gsAntenna_vertical.v})`);
    assert.equal(ant[1], 0, `${id}: antenna on the centre line`);
    for (const l of [g.eye_pos_FRD, g.gsAntenna_pos_FRD]) assert.ok(l.src.includes('AL:C7') || l === g.eye_pos_FRD, `${id}: AL:C7`);
    assert.ok(c._meta.sources['AL:C7'] && /plan C7/.test(c._meta.sources['AL:C7'].what), `${id}: AL:C7 in _meta.sources`);
    const r = research(id).airframe.geometry.eye_pos_FRD.v;
    if (AIRBUS.includes(id)) {
      // Airbus: x_ant = x_eye; the eye's x and y are the research's, its z refitted to the 2023 H1 at the reference attitude
      assert.equal(ant[0], eye[0], `${id}: x_ant = x_eye`);
      assert.deepEqual(eye.slice(0, 2), r.slice(0, 2), `${id}: eye x, y as the research`);
      const H1 = pathUp(eye, rho) - pathUp(w, rho), H4 = upOf(eye, rho) - upOf(w, rho);
      assert.ok(Math.abs(H1 - av.H1) < 0.005, `${id}: H1 ${H1.toFixed(3)} m at ${rho}° (Airbus 2023 ${av.H1})`);
      assert.ok(Math.abs(H4 - av.H4) < 0.06, `${id}: H4 ${H4.toFixed(3)} m at ${rho}° (Airbus 2023 ${av.H4})`);
      assert.ok(/OD-A320-PITCH/.test(g.eye_pos_FRD.note) === (rho === OD_A320_PITCH), `${id}: the eye note names OD-A320-PITCH`);
    } else assert.deepEqual(eye, r, `${id}: eye as the research`);
  }
  // OD-A330-VISUAL: the 2023 issue (H1 11.34 m), not the 2021 one (10.82 m)
  const a330 = card('a330_300'), g = geo(a330);
  assert.equal(g.approach_visual.v.H1, 11.34); assert.match(g.eye_pos_FRD.note, /OD-A330-VISUAL/);
  // T-D-23 and the 737's station: the antenna 0.989 m ahead of the eye (STA 1.5 against 2.489 m) is 18.03 ± 0.05 m ahead
  // of the main wheels on the ground at the FD pitch 3.2° (Boeing: (H − H3)/tan 3°, 13.9 − 10.8 ft)
  const b = card('b737_800'), ba = geo(b).gsAntenna_pos_FRD.v, bw = mains(b), r32 = 3.2 * DEG;
  assert.ok(Math.abs(ba[0] - geo(b).eye_pos_FRD.v[0] - 0.989) < 1e-9, '737: antenna 0.989 m ahead of the eye');
  const ahead = (ba[0] - bw[0]) * Math.cos(r32) + (ba[2] - bw[2]) * Math.sin(r32);
  assert.ok(Math.abs(ahead - (13.9 - 10.8) * FT / tan(3)) < 0.05, `T-D-23: antenna ${ahead.toFixed(3)} m ahead of the main wheels (Boeing ${((13.9 - 10.8) * FT / tan(3)).toFixed(2)} m)`);
  // the ATR: the research's assumption, 1.0 m under and 2.1 m ahead of the eye (H2 0.89 m at ρ 0)
  const atr = geo(card('atr72_600'));
  assert.ok(Math.abs(atr.gsAntenna_pos_FRD.v[0] - atr.eye_pos_FRD.v[0] - 2.1) < 1e-9 && Math.abs(atr.gsAntenna_pos_FRD.v[2] - atr.eye_pos_FRD.v[2] - 1.0) < 1e-3, 'ATR antenna 2.1 m ahead, 1.0 m under the eye');
  // no source gives a light aircraft's antenna (round 2): it stays at the eye, and the trainer's is its own
  for (const id of LIGHT) assert.deepEqual(geo(card(id)).gsAntenna_pos_FRD.v, geo(card(id)).eye_pos_FRD.v, `${id}: antenna at the eye`);
  assert.deepEqual([geo(trainer()).eye_pos_FRD.v, geo(trainer()).gsAntenna_pos_FRD.v], [[0.95, 0, -1], [2.6, 0, 0.3]]);
});

test('T-D-09 Boeing 737-800W F30 θ 3°, H1 18.6 ft, H4 15.7 ft, pitch 3.2° → X 16.87, A 17.11, B 3.84 m (± 0.02); B of every row 3.81–3.85 m; the card\'s B 3.84 m', () => {
  const solve = (H1, H4, th, rho) => { const X = (H1 - H4) / tan(th), r = rho * DEG; return { X, A: X * Math.cos(r) + H4 * Math.sin(r), B: H4 * Math.cos(r) - X * Math.sin(r) }; };
  const w = solve(18.6 * FT, 15.7 * FT, 3, 3.2);
  for (const [k, v] of [['X', 16.87], ['A', 17.11], ['B', 3.84]]) assert.ok(Math.abs(w[k] - v) <= 0.02, `${k} ${w[k].toFixed(3)} (want ${v})`);
  // the rows of Table A6-1 [D3] (ft for flaps 30, m for flaps 40): 737-800 θ 2.5°/3°, 737-800W θ 2.5°/3°, F40 VREF+5 both
  const rows = [[18.8 * FT, 16.4 * FT, 2.5, 3.9], [18.8 * FT, 15.9 * FT, 3, 3.4], [18.6 * FT, 16.2 * FT, 2.5, 3.7], [18.6 * FT, 15.7 * FT, 3, 3.2], [5.1, 4.2, 3, 1.3], [5.0, 4.1, 3, 0.9]];
  for (const r of rows) { const { B } = solve(...r); assert.ok(B >= 3.805 && B <= 3.855, `B ${B.toFixed(3)} m for ${r.map((x) => x.toFixed(2)).join('/')}`); }
  const c = card('b737_800'), B = mains(c)[2] - geo(c).eye_pos_FRD.v[2];
  assert.ok(Math.abs(B - 3.84) < 0.005, `card: eye ${B.toFixed(3)} m above the main wheels along the body (research 3.84)`);
});

test('T-D-10 Airbus formula with the FBW A320 (A 15.33 m, B 5.09 m), pitch 3.3°, θ 3°: H4 5.96, H1 6.75 m (± 0.05); the cards at OD-A320-PITCH 2.5° refit to the Airbus 2023 H1', (t) => {
  const r = 3.3 * DEG, A = 15.33, B = 5.09, H4 = A * Math.sin(r) + B * Math.cos(r), X = A * Math.cos(r) - B * Math.sin(r), H1 = H4 + X * tan(3);
  assert.ok(Math.abs(H4 - 5.96) <= 0.05 && Math.abs(H1 - 6.75) <= 0.05, `H4 ${H4.toFixed(3)}, H1 ${H1.toFixed(3)}`);
  // the research's eye z (FBW) at OD-A320-PITCH's 2.5° gives the A320ceo only 6.55 m: the card's z is refitted (known
  // consequence of OD-A320-PITCH; with topic 3.5's 3.3° the FBW eye matched)
  const rc = research('a320ceo'), w = rc.gear.geometry.main_contact_body_extended.v[0];
  const old = pathUp(rc.airframe.geometry.eye_pos_FRD.v, OD_A320_PITCH) - pathUp(w, OD_A320_PITCH);
  const cur = pathUp(geo(card('a320ceo')).eye_pos_FRD.v, OD_A320_PITCH) - pathUp(mains(card('a320ceo')), OD_A320_PITCH);
  assert.ok(Math.abs(old - 6.55) < 0.01 && Math.abs(cur - 6.74) < 0.005, `A320ceo H1 at 2.5°: research eye ${old.toFixed(3)}, card ${cur.toFixed(3)} m`);
  t.diagnostic(`A320ceo eye z: research ${rc.airframe.geometry.eye_pos_FRD.v[2]} m, card ${geo(card('a320ceo')).eye_pos_FRD.v[2]} m (OD-A320-PITCH)`);
});

test('T-D-18 the 737-800 contact points (FRD from the 25 % MAC reference, STA 18.644 m): nose [14.554, 0, 2.815], left main [−1.041, −2.857, 2.895] (± 0.005), as the sim reads them', () => {
  const c = card('b737_800'), rc = research('b737_800').gear.geometry.ref_cg.v;
  assert.ok(Math.abs(rc.LEMAC_STA + 0.25 * rc.MAC - 18.644) < 0.001, `LEMAC ${rc.LEMAC_STA} + 25 % of MAC ${rc.MAC} = STA ${rc.STA}`);
  const want = [[14.554, 0, 2.815], [-1.041, -2.857, 2.895], [-1.041, 2.857, 2.895]];
  withType('b737_800', () => AC.gear.forEach((g, i) => g.b.forEach((v, k) => assert.ok(Math.abs(v - want[i][k]) <= 0.005, `strut ${i} ${k}: ${v}`))));
  assert.deepEqual(c.gear.legacy.v.map((g) => g.b), want);
});

test('T-D-19 the nose-wheel share at the 25 % MAC reference, x_MG / (x_MG − x_NG): 737-800 6.67 %, A320 11.07 %, A321 8.28 % (± 0.05 %); the A330 and the ATR 8 % (the research\'s rule)', () => {
  const share = (id) => { const g = card(id).gear.legacy.v; return 100 * Math.abs(g[1].b[0] / (g[1].b[0] - g[0].b[0])); };
  for (const [id, want] of [['b737_800', 6.67], ['a320ceo', 11.07], ['a320neo', 11.07], ['a321ceo', 8.28], ['a321neo', 8.28], ['a330_300', 8], ['atr72_600', 8]]) {
    assert.ok(Math.abs(share(id) - want) <= 0.05, `${id}: ${share(id).toFixed(3)} % (want ${want})`);
  }
});

// research table "ผลที่ 1" (§3.5.8): the main wheels over the threshold with the antenna on the beam, RDH − H (m)
const WHEEL_THR = {
  b737_800: [12.53, 12.22, 11.00, 11.92], a320ceo: [11.88, 11.58, 10.36, 11.27], a320neo: [11.79, 11.49, 10.27, 11.18],
  a321ceo: [11.77, 11.47, 10.25, 11.16], a321neo: [11.95, 11.65, 10.43, 11.34], a330_300: [8.20, 7.90, 6.68, 7.59], atr72_600: [14.46, 14.16, 12.94, 13.85],
};
test('T-D-03 ILS 3° at the AIP RDH: the main wheels cross each threshold at RDH − H (737-800W 12.22, A320ceo 11.58, A330-300 7.90 m on 21R; ± 0.05 m), flown in the sim at the reference attitude', (t) => {
  for (const id of AIRLINERS) withType(id, (c) => {
    const rho = refPitch(id, c), H = pathUp(AC.gsAnt, rho) - pathUp(AC.gear[1].b, rho);
    RWYS.forEach((rw, i) => {
      setActiveRunway(rw);
      assert.ok(Math.abs(gpHeight(0) - RDH_FT[rw] * FT) < 0.01, `${rw}: the beam crosses the threshold at ${gpHeight(0).toFixed(3)} m`);
      const a = onBeamAt(new Flight({ wind: SCENARIOS.calm }).ac, rho, AC.gear[1].b, 0);
      assert.ok(Math.abs(a.antH - gpHeight(a.antS)) < 1e-6 && Math.abs(a.gsDots) < 1e-6, `${id} ${rw}: antenna on the beam`);
      assert.ok(Math.abs(a.hWheel - (RDH_FT[rw] * FT - H)) < 0.01, `${id} ${rw}: wheels ${a.hWheel.toFixed(3)} m, RDH − H ${(RDH_FT[rw] * FT - H).toFixed(3)} m`);
      assert.ok(Math.abs(a.hWheel - WHEEL_THR[id][i]) <= 0.05, `${id} ${rw}: wheels ${a.hWheel.toFixed(3)} m over the threshold (research ${WHEEL_THR[id][i]})`);
    });
    t.diagnostic(`${id}: H ${H.toFixed(3)} m at ρ ${rho}°`);
  });
});

// research table "ผลที่ 3" (§3.5.8): the eye on the ILS over the threshold (RDH + H2), angle to the ideal PAPI and whites
const EYE_THR = {
  b737_800: [[2.368, 0], [2.530, 1], [2.448, 0], [2.549, 1]], a320ceo: [[2.424, 0], [2.590, 1], [2.511, 1], [2.611, 1]],
  a321ceo: [[2.428, 0], [2.594, 1], [2.515, 1], [2.616, 1]], a330_300: [[2.543, 1], [2.720, 1], [2.645, 1], [2.744, 1]],
  atr72_600: [[2.299, 0], [2.454, 0], [2.370, 0], [2.472, 0]],
};
test('T-D-06 the eye on the ILS over the threshold (RDH + H2): angle to the ideal PAPI 737-800W 03L 2.368° (0 white), 21R 2.530° (1), A330-300 21R 2.720° (1) ± 0.005°; the sim\'s eye there and its own PAPI', (t) => {
  for (const id of AIRLINERS) withType(id, (c) => {
    const rho = refPitch(id, c), h2 = geo(c).eye_to_gsAntenna_vertical.v, out = [];
    RWYS.forEach((rw, i) => {
      setActiveRunway(rw);
      const ang = idealAng(RDH_FT[rw] * FT + h2, D_IDEAL[rw]);
      if (EYE_THR[id]) {
        assert.ok(Math.abs(ang - EYE_THR[id][i][0]) <= 0.005, `${id} ${rw}: ${ang.toFixed(4)}° (research ${EYE_THR[id][i][0]}°)`);
        assert.equal(idealWhites(ang), EYE_THR[id][i][1], `${id} ${rw}: ideal whites`);
      }
      // in the sim: the eye over the threshold with the antenna on the beam sits H2 above the beam
      const a = onBeamAt(new Flight({ wind: SCENARIOS.calm }).ac, rho, AC.eye, 0), [s, tt] = rwyLocal(a.eye[0], a.eye[1]);
      assert.ok(Math.abs(s) < 1e-6 && Math.abs(a.eye[2] - (gpHeight(0) + h2)) < 0.002, `${id} ${rw}: eye ${a.eye[2].toFixed(3)} m (RDH + H2 ${(gpHeight(0) + h2).toFixed(3)})`);
      const nW = whites(papiSeen(...a.eye));
      assert.equal(nW, simWhites(rw, s, tt, a.eye[2]), `${id} ${rw}: the sim's PAPI from the eye`);
      out.push(`${rw} ${ang.toFixed(3)}° ideal ${idealWhites(ang)} W, sim ${nW} W`);
    });
    t.diagnostic(`${id}: ${out.join('; ')}`);
  });
});

test('T-D-21 eye over the 21R threshold at 17, 19, 21.23, 23.5, 25.5 m: ideal PAPI at 405 m 0…4 white (2.404°, 2.686°, 3.001°, 3.321°, 3.603° ± 0.002°); the sim\'s PAPI the same (edges 17.73/19.94/22.14/24.34 m)', () => {
  const H = [17, 19, 21.23, 23.5, 25.5], ANG = [2.404, 2.686, 3.001, 3.321, 3.603];
  assert.equal(D_IDEAL['21R'], 405);
  H.forEach((h, i) => { const a = idealAng(h, 405); assert.ok(Math.abs(a - ANG[i]) <= 0.002 && idealWhites(a) === i, `${h} m: ${a.toFixed(4)}°, ${idealWhites(a)} white`); });
  setActiveRunway('21R');
  const [n, e] = rwyToNED(0, 0);
  assert.equal(H.map((h) => whites(papiSeen(n, e, h))).join(), '0,1,2,3,4');
});

test('T-D-27 the 2-white band over each threshold: ideal PAPI 03L 21.78–24.34, 21R 20.04–22.41, 03R 19.30–21.58, 21L 19.55–21.85 m (± 0.02); the sim\'s band starts at MEHT', (t) => {
  const WANT = { '03L': [21.78, 24.34], '21R': [20.04, 22.41], '03R': [19.30, 21.58], '21L': [19.55, 21.85] };
  for (const rw of RWYS) {
    const lo = D_IDEAL[rw] * tan(SET[1]), hi = D_IDEAL[rw] * tan(SET[2]);
    assert.ok(Math.abs(lo - WANT[rw][0]) <= 0.02 && Math.abs(hi - WANT[rw][1]) <= 0.02, `${rw}: ${lo.toFixed(3)}–${hi.toFixed(3)} m`);
    // the sim (15-geo.js: the distance solved from MEHT in the drawn geometry): bisect papiSeen over the threshold
    setActiveRunway(rw);
    const [n, e] = rwyToNED(0, 0), edge = (k) => { let a = 10, b = 40; for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (whites(papiSeen(n, e, m)) >= k) b = m; else a = m; } return b; };
    const sLo = edge(2), sHi = edge(3);
    assert.ok(Math.abs(sLo - MEHT_FT[rw] * FT) <= 0.02, `${rw}: the sim's band starts at ${sLo.toFixed(3)} m (MEHT ${(MEHT_FT[rw] * FT).toFixed(3)})`);
    // its top: the 3°10′ unit (24 m outside the edge) seen at 3°10′, worked by hand
    const top = PAPI_GEOM.h + Math.hypot(RWY_END[rw].papi, RWY_END[rw].w / 2 + PAPI_GEOM.off[1]) * tan(PAPI_GEOM.ang[1]);
    assert.ok(Math.abs(sHi - top) <= 0.02, `${rw}: the sim's band ends at ${sHi.toFixed(3)} m (by hand ${top.toFixed(3)})`);
    t.diagnostic(`${rw}: ideal ${lo.toFixed(2)}–${hi.toFixed(2)} m, sim ${sLo.toFixed(2)}–${sHi.toFixed(2)} m`);
  }
  setActiveRunway('21R');
});

test('P-03 on every type: its eye placed over the 21R threshold at 17.0/18.8/21.0/23.2/25.3 m sees 0 to 4 white', () => {
  for (const id of ALL) withType(id, (c) => {
    setActiveRunway('21R');
    const f = new Flight({ wind: SCENARIOS.calm }), ac = f.ac, th = AIRLINERS.includes(id) ? refPitch(id, c) : f.ac.air.theta / DEG;
    const q = eulerToQ(0, th * DEG, FIELD.rwyHdg * DEG), pe = mulR(qToR(q, new Array(9)), AC.eye), [n, e] = rwyToNED(0, 0);
    const got = [17.0, 18.8, 21.0, 23.2, 25.3].map((h) => {
      ac.x.set([n - pe[0], e - pe[1], -h - pe[2], 0, 0, 0, q[0], q[1], q[2], q[3], 0, 0, 0]); ac.updateAir(0);
      assert.ok(Math.abs(ac.air.eye[2] - h) < 1e-9 && Math.hypot(ac.air.eye[0] - n, ac.air.eye[1] - e) < 1e-9, `${id}: air.eye is the card's eye`);
      return whites(papiSeen(...ac.air.eye));
    });
    assert.equal(got.join(), '0,1,2,3,4', `${id}: ${got.join('/')} white`);
  });
});

test('P-05 on every type: eye and antenna follow the attitude (pitch 5°) from the card\'s points; the displayed G/S and LOC deviations are the antenna\'s', () => {
  for (const id of ALL) withType(id, (c) => {
    setActiveRunway('21R');
    const f = new Flight({ wind: SCENARIOS.calm, pilot: 'ap', seed: 1 }), ac = f.ac, q = eulerToQ(0, 5 * DEG, FIELD.rwyHdg * DEG);
    ac.x[6] = q[0]; ac.x[7] = q[1]; ac.x[8] = q[2]; ac.x[9] = q[3]; ac.updateAir();
    const a = ac.air, h = -ac.x[2], g = geo(c);
    const eyeUp = upOf(g.eye_pos_FRD.v, 5), antUp = upOf(g.gsAntenna_pos_FRD.v, 5);
    assert.ok(Math.abs(a.eye[2] - h - eyeUp) < 1e-9, `${id}: eye ${(a.eye[2] - h).toFixed(3)} m above the CG (card ${eyeUp.toFixed(3)})`);
    assert.ok(Math.abs(a.antH - h - antUp) < 1e-9, `${id}: antenna ${(a.antH - h).toFixed(3)} m above the CG (card ${antUp.toFixed(3)})`);
    const dh = gpHeight(a.antS) - a.antH; ac.x[2] -= dh; ac.updateAir();
    assert.ok(Math.abs(ac.air.gsDots) < 0.01, `${id}: antenna on the beam → G/S ${ac.air.gsDots.toFixed(3)} dots`);
    // a CG-based reading would see the beam from antUp lower and from the CG's station
    const cg = ilsAt(ac.x[0], ac.x[1], -ac.x[2]), want = (Math.atan2(ac.air.antH - antUp, FIELD.aim - cg.s) * RAD - FIELD.gs) / FIELD.gsDot;
    assert.ok(Math.abs(cg.gsDots - want) < 1e-9, `${id}: CG-based ${cg.gsDots.toFixed(5)} dots (by hand ${want.toFixed(5)})`);
    // the antenna on the localizer centre line (the airliners' sits on the aircraft's, the light cards' at the eye)
    const [s, tt] = rwyLocal(ac.x[0], ac.x[1]), R = qToR(q, new Array(9)), pa = mulR(R, AC.gsAnt), [, ta] = rwyLocal(ac.x[0] + pa[0], ac.x[1] + pa[1]);
    const [n2, e2] = rwyToNED(s, tt - ta); ac.x[0] = n2; ac.x[1] = e2; ac.updateAir();
    assert.ok(Math.abs(ac.air.locDots) < 1e-6, `${id}: antenna on the centre line → LOC ${ac.air.locDots.toExponential(2)} dots`);
  });
});

// P-06 on every type, 21R ILS flown with the antenna exactly on the beam at the type's trimmed approach pitch: 2 white at
// 2 NM, then below 2 white from DROP (m from the threshold; worked again from the PAPI geometry, ± 2 m, and pinned ± 10 m).
// The light cards carry the antenna at the eye (no source), so the eye rides the beam: −1,128 m for each. Research
// T-D-07 (ideal PAPI at 405 m, the 2°50′ edge, ρ of its tables) for comparison: 737-800W 738, A320ceo 591, A330-300 276 m
// (no ATR or A321 row). The sim's drops come 106, 88 and 69 m nearer the threshold (later on the approach): its PAPI
// stands at 384.8 m (P-01), not 405 m, and each type flies its own trimmed pitch, not the tables' ρ.
const DROP = { trainer: -705, c172s: -1128, c172r: -1128, da42ng: -1128, da42_tae125: -1128, da40d: -1128, da40_180: -1128,
  a320ceo: -503, b737_800: -632, a320neo: -507, a330_300: -207, a321neo: -490, atr72_600: -822, a321ceo: -494 };
test('P-06 on every type: on the 21R ILS (antenna on the beam, trimmed pitch) the PAPI shows 2 white at 2 NM and reads low from DROP', (t) => {
  for (const id of ALL) withType(id, () => {
    setActiveRunway('21R');
    const f = new Flight({ wind: SCENARIOS.calm }), th = f.ac.air.theta / DEG;
    let at2 = null, drop = null, hand = null;
    for (let s = -3704; s <= 0; s++) {
      const a = onBeamAt(f.ac, th, AC.gsAnt, s), nW = whites(papiSeen(...a.eye));
      if (s === -3704) at2 = nW;
      if (drop === null && s > -2000 && nW < 2) drop = s;
      const [es, et] = rwyLocal(a.eye[0], a.eye[1]);
      if (hand === null && s > -2000 && simWhites('21R', es, et, a.eye[2]) < 2) hand = s;
    }
    t.diagnostic(`${id}: θ ${th.toFixed(2)}°, ${at2} white at 2 NM, below 2 white from ${drop} m`);
    assert.equal(at2, 2, `${id}: 2 white at 2 NM`);
    assert.ok(drop !== null && Math.abs(drop - hand) <= 2 && Math.abs(drop - DROP[id]) <= 10, `${id}: below 2 white from ${drop} m (by hand ${hand}, pinned ${DROP[id]} ± 10)`);
  });
  // a larger H2 holds the eye above the beam longer: the A330 (2.78 m) reads low last, the antenna-at-eye cards first
  assert.ok(DROP.a330_300 > DROP.a320ceo && DROP.a320ceo > DROP.b737_800 && DROP.b737_800 > DROP.atr72_600 && DROP.atr72_600 > DROP.c172s);
});

test('P-06 autoland on every light type: calm on every runway lands in the touchdown zone, and on the 21R ILS the PAPI reads low from about −1,130 m (antenna at the eye)', (t) => {
  for (const id of LIGHT) withType(id, () => {
    for (const rw of RWYS) {
      setActiveRunway(rw);
      const f = new Flight({ wind: SCENARIOS.calm, pilot: 'ap', seed: 5 });
      let drop = null, at2nm = null;
      while (f.ac.t < 260 && !f.ev.done && !f.crashed) {
        f.tick(f.dt);
        const a = f.ac.air;
        if (a.s > 0 || a.onGround) continue;
        const nW = whites(papiSeen(...a.eye));
        if (at2nm === null && a.s > -3704) at2nm = nW;
        if (drop === null && a.s > -2000 && nW < 2) drop = a.s;
      }
      const td = f.ev.td, sc = f.ev.score();
      assert.ok(!f.crashed && td && td.s > 250 && td.s < 400 && sc && sc.total >= 93, `${id} ${rw}: td ${td && td.s.toFixed(0)} m score ${sc && sc.total}`);
      if (rw === '21R') assert.ok(at2nm === 2 && drop !== null && Math.abs(drop + 1128) <= 80, `${id} 21R: ${at2nm} white at 2 NM, below 2 white from ${drop && drop.toFixed(0)} m`);
      t.diagnostic(`${id} ${rw}: td ${td.s.toFixed(0)} m, score ${sc.total}, below 2 white from ${drop && drop.toFixed(0)} m`);
    }
  });
});
