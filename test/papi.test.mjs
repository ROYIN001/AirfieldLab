// PAPI and ILS geometry (research round 3, topic 3.5 and 3.9): PAPI distance solved from the AIP MEHT in the sim's
// own light geometry, PAPI seen from the pilot's eye, ILS flown and displayed at the glide-slope antenna, and the
// localizer dot scaled per runway. Expected values come from an independent calculation (Python, same formulas).
// P-07…P-12: the PAPI siting choice (research round 3 §3.5.8, task R3-7, tests T-D-01, T-D-02, T-D-07, T-D-26):
// `aip` (MEHT at 2°50′, the default), `tc` (MEHT at 2°48′, Transport Canada AC 302-009: the research's conflict 2, which
// angle sets the distance from MEHT) and `ils` (the PAPI's 3° line on the trainer's eye path, the eye-to-antenna
// harmonisation of TC AC 302-009). T-D-07 (P-11) is a separate check, not the tc siting: the PAPI distance stays and
// only the lower edge of the on-slope moves from 2°50′ to 2°48′. P-12 reads the wiring of src/90-app.js. Every test
// that changes the siting puts back 'aip' and 21R.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { M } from './harness.mjs';
const { FIELD, AC, Flight, SCENARIOS, FT, DEG, RAD, papiSeen, ilsAt, gpHeight, setActiveRunway, RWY_END, rwyToNED, rwyLocal, eulerToQ,
  PAPI, PAPI_GEOM, PAPI_MEHT_ANG, PAPI_SITINGS, papiFromMEHT, eyeAboveBeam, setPapiSiting } = M;
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const whites = (pw) => pw.filter((v) => v > 0.5).length;
const MEHT_FT = { '03L': 71.85, '21R': 65.42, '03R': 63.35, '21L': 63.81 };   // AIP AD 2.14
const ENDS = Object.keys(MEHT_FT);
const reset = () => { setPapiSiting('aip'); setActiveRunway('21R'); };

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

test('P-06 calm autoland on every runway lands in the touchdown zone; on the 21R ILS the PAPI reads low from about −740 m (aip), earlier with tc; with ils 2 white from 2 NM to 200 m out', (t) => {
  // one flight per end; the siting only moves the PAPI (papiSeen), not the flight, so each tick reads all three
  try {
    for (const id of ['21R', '21L', '03L', '03R']) {
      setActiveRunway(id);
      const f = new Flight({ wind: SCENARIOS.calm, pilot: 'ap', seed: 5 });
      const R = Object.fromEntries(PAPI_SITINGS.map((m) => [m, { drop: null, at2nm: null, atThr: null, far: 4, antLow: -Infinity }]));
      let eye2k = null, th2k = null;
      while (f.ac.t < 260 && !f.ev.done && !f.crashed) {
        f.tick(f.dt);
        const a = f.ac.air;
        if (a.s > 0 || a.onGround) continue;
        for (const m of PAPI_SITINGS) {
          setPapiSiting(m);
          const nW = whites(papiSeen(...a.eye)), r = R[m];
          if (r.at2nm === null && a.s > -3704) r.at2nm = nW;
          if (r.drop === null && a.s > -2000 && nW < 2) r.drop = a.s;
          if (a.s > -3704 && a.s < -200) r.far = Math.min(r.far, nW);                         // 2 NM to 200 m out
          if (a.s > -3704 && nW < 2) r.antLow = Math.max(r.antLow, a.antH - gpHeight(a.antS));  // antenna vs beam then
          r.atThr = nW;
        }
        // the eye above the path at its own place along the track, 2 km out (antenna on the beam)
        if (eye2k === null && a.s > -2000) { eye2k = a.eye[2] - gpHeight(rwyLocal(a.eye[0], a.eye[1])[0]); th2k = a.theta * RAD; }
      }
      setPapiSiting('aip');
      const td = f.ev.td, sc = f.ev.score(), { aip, tc, ils } = R, fx = (v) => (v === null ? '—' : v.toFixed(0));
      assert.ok(!f.crashed && td && td.s > 250 && td.s < 400 && sc && sc.total >= 93, `${id} autoland td ${td && td.s.toFixed(0)} m score ${sc && sc.total}`);
      t.diagnostic(`${id} on the ${FIELD.appr}: PAPI 2 NM / below 2 white from / over the threshold: aip ${aip.at2nm}/${fx(aip.drop)} m/${aip.atThr}, tc ${tc.at2nm}/${fx(tc.drop)} m/${tc.atThr}, ils ${ils.at2nm}/${fx(ils.drop)} m/${ils.atThr} (antenna ≤ ${ils.antLow.toFixed(2)} m from the beam meanwhile); eye ${eye2k.toFixed(3)} m above the path 2 km out at pitch ${th2k.toFixed(2)}°`);
      // eye 1.3 m above the antenna, while MEHT over the 21R threshold is 3.5 m above the beam
      if (id === '21R') assert.ok(aip.at2nm === 2 && aip.drop !== null && near(aip.drop, -740, 80), `21R: ${aip.at2nm} white at 2 NM, below 2 white from ${aip.drop && aip.drop.toFixed(0)} m (expect −740 ± 80 m)`);
      // tc stands 4.6 to 5.2 m farther away, so the PAPI reads low earlier on every end. 21R: −788 m measured on
      // 2026-11-26 (regression band ± 80 m)
      assert.ok(tc.at2nm === 2 && tc.drop !== null && aip.drop !== null && tc.drop < aip.drop, `${id}: tc below 2 white from ${fx(tc.drop)} m, aip from ${fx(aip.drop)} m`);
      if (id === '21R') assert.ok(near(tc.drop, -788, 80), `21R tc: below 2 white from ${tc.drop.toFixed(0)} m (expect −788 ± 80 m)`);
      // ils: 2 white from 2 NM to 200 m out on every end, and whenever it shows fewer than 2 white the antenna is
      // more than 0.9 m under the beam: the PAPI then says what the ILS says, and an eye on its path sees 2 white all
      // the way (P-09). How the autopilot flies the last 200 m is not pinned here. Measured on 2026-11-26: it slows
      // from Vapp to Vref below 61 m and sinks 1.06 to 1.09 m under the beam by the time the PAPI shows 1 white, 111
      // to 132 m out, and 1.3 to 1.4 m over the threshold, where the PAPI shows 1 white (the diagnostic above). On the
      // physics stack (PR #21: humid air and QNH, log-law wind; merged 2026-11-27) 110 to 132 m out, 1.06 to 1.08 m under.
      assert.ok(ils.at2nm === 2 && ils.far === 2 && (ils.drop === null || ils.drop > -200) && ils.antLow < -0.9,
        `${id} ils: ${ils.at2nm} white at 2 NM, at least ${ils.far} white to 200 m out, below 2 white from ${fx(ils.drop)} m with the antenna ${ils.antLow.toFixed(2)} m from the beam`);
      // the eye's height above the path is the H2 the ils siting is built on (pitch 0), within the pitch effect
      assert.ok(near(eye2k, eyeAboveBeam(AC, 0), 0.06) && near(eye2k, eyeAboveBeam(AC, th2k), 0.002), `${id}: eye ${eye2k.toFixed(4)} m above the path 2 km out, H2(0°) ${eyeAboveBeam(AC, 0).toFixed(4)} m, H2(${th2k.toFixed(2)}°) ${eyeAboveBeam(AC, th2k).toFixed(4)} m`);
    }
  } finally { reset(); }
});

// Independent values (Python, the same formulas; brief of lane B7, 2026-11-26)
const TC = { '03L': 430.1, '21R': 389.6, '03R': 377.7, '21L': 380.6 };              // MEHT at 2°48′ in the drawn geometry
const ILS_D = { '03L': 330.8, '21R': 325.0, '03R': 301.7, '21L': 319.2 };           // aim + (H2(0) − h) / tan 3°
const AIM = { '03L': 319.9, '21R': 314.1, '03R': 290.8, '21L': 308.2 };             // RDH (03R: TCH) / tan 3°
const ANG = { aip: { '03L': 2.8335, '21R': 2.8337, '03R': 2.8334, '21L': 2.8332 }, tc: { '03L': 2.8000, '21R': 2.7997, '03R': 2.7997, '21L': 2.7997 } };
// eye heights over the threshold where the 2°50′ unit (tc siting) is seen at 2°48′30″ (red below), 2°50′, 2°51′30″ (white above)
const EDGE_TC = { '03L': [21.963, 22.153, 22.343], '21R': [19.999, 20.172, 20.345], '03R': [19.366, 19.533, 19.700], '21L': [19.507, 19.675, 19.844] };
const H2_REQ = { aip: { '03L': 6.144, '21R': 4.347, '03R': 4.953, '21L': 4.191 }, tc: { '03L': 6.416, '21R': 4.599, '03R': 5.194, '21L': 4.432 } };

test('P-07 (T-D-02) the tc siting: MEHT seen at 2°48′ (Transport Canada AC 302-009), 4.6 to 5.2 m beyond the aip siting', () => {
  assert.deepEqual(PAPI_SITINGS, ['aip', 'tc', 'ils']);
  assert.ok(near(PAPI_MEHT_ANG.aip, 2 + 50 / 60, 1e-12) && near(PAPI_MEHT_ANG.tc, 2.8, 1e-12) && PAPI_MEHT_ANG.aip === PAPI_GEOM.ang[2], 'B = 2°50′, M = B − 2′');
  // the research's ideal distances, MEHT / tan 2°48′ (no light height, no lateral offset), from MEHT alone
  for (const [id, d] of [['03L', 447.8], ['21R', 407.7], ['03R', 394.8], ['21L', 397.7]]) {
    const ideal = MEHT_FT[id] * FT / Math.tan(PAPI_MEHT_ANG.tc * DEG);
    assert.ok(near(ideal, d, 0.1), `${id} MEHT / tan 2°48′ = ${ideal.toFixed(2)} m (expect ${d})`);
  }
  try {
    for (const id of ENDS) {
      const E = RWY_END[id], t = E.w / 2 + PAPI_GEOM.off[2], h = MEHT_FT[id] * FT;
      assert.ok(near(E.papiSites.tc, TC[id], 0.1) && E.papiSites.tc === papiFromMEHT(MEHT_FT[id], E.w, PAPI_MEHT_ANG.tc), `${id} tc ${E.papiSites.tc} m (expect ${TC[id]})`);
      assert.ok(E.papiSites.tc - E.papiSites.aip >= 4.55 && E.papiSites.tc - E.papiSites.aip <= 5.25, `${id} tc − aip ${(E.papiSites.tc - E.papiSites.aip).toFixed(1)} m`);
      // the eye at MEHT on the centre line over the threshold sees the 2°50′ unit at 2°50′ (aip) and 2°48′ (tc)
      for (const m of ['aip', 'tc']) {
        const a = Math.atan2(h - PAPI_GEOM.h, Math.hypot(E.papiSites[m], t)) * RAD;
        assert.ok(near(a, ANG[m][id], 0.0002) && near(a, PAPI_MEHT_ANG[m], 0.0005), `${id} ${m}: the 2°50′ unit at ${a.toFixed(4)}° from MEHT (expect ${ANG[m][id]}°)`);
      }
      // what papiSeen shows (pw[1] is the 2°50′ unit): tc puts MEHT 2′ under the unit, beyond its ±1.5′ colour edge, so
      // 1 white; the eye needs to be 1.5′ above 2°50′ for 2 white
      setPapiSiting('tc'); setActiveRunway(id);
      const [n, e] = rwyToNED(0, 0), [lo, mid, hi] = EDGE_TC[id], seen = (y) => papiSeen(n, e, y);
      assert.ok(PAPI.s === E.papiSites.tc && whites(seen(h)) === 1 && seen(h)[1] === 0, `${id} tc: MEHT ${h.toFixed(2)} m → ${whites(seen(h))} white, 2°50′ unit ${seen(h)[1]}`);
      assert.ok(seen(lo - 0.005)[1] === 0 && near(seen(mid)[1], 0.5, 0.02) && seen(hi + 0.005)[1] === 1 && whites(seen(hi + 0.005)) === 2, `${id} tc: the 2°50′ unit red under ${lo} m, half at ${mid} m, white over ${hi} m`);
      setPapiSiting('aip');
      assert.ok(PAPI.s === E.papiSites.aip && near(seen(h)[1], 0.5, 0.02), `${id} aip: the 2°50′ unit at MEHT ${seen(h)[1].toFixed(3)} (half white: 2°50′)`);
    }
  } finally { reset(); }
});

test('P-08 (T-D-26) the eye height above the path each siting needs; the trainer\'s is H2 = 1.2135 m', () => {
  const tg = Math.tan(3 * DEG);
  for (const id of ENDS) {
    const E = RWY_END[id];
    assert.ok(near(E.aim, AIM[id], 0.1), `${id} aim ${E.aim.toFixed(2)} m (expect ${AIM[id]})`);
    for (const m of ['aip', 'tc']) {
      const req = PAPI_GEOM.h + (E.papiSites[m] - E.aim) * tg;   // the eye path parallel to the beam that is the PAPI's 3° line
      assert.ok(near(req, H2_REQ[m][id], 0.002), `${id} ${m}: H2 needed ${req.toFixed(3)} m (expect ${H2_REQ[m][id]})`);
      assert.ok(req > eyeAboveBeam(AC, 0) + 2.9, `${id} ${m}: the trainer's eye is ${(req - eyeAboveBeam(AC, 0)).toFixed(2)} m too low for it`);
    }
  }
  // H2 = up + along · tan 3° for d = eye − antenna = (−1.65, 0, −1.3) m in body axes, wings level at pitch θ
  for (const [th, v] of [[0, 1.2135], [-1.3, 1.2522], [3, 1.1219], [5, 1.0592]]) assert.ok(near(eyeAboveBeam(AC, th), v, 0.001), `H2(${th}°) ${eyeAboveBeam(AC, th).toFixed(4)} m (expect ${v})`);
  assert.equal(eyeAboveBeam(), eyeAboveBeam(AC, 0, 3), 'defaults: AC, pitch 0, 3° path');
  assert.ok(near(eyeAboveBeam({ eye: [0, 0, -2], gsAnt: [0, 0, 0] }, 0), 2, 1e-12) && near(eyeAboveBeam({ eye: [-1, 0, 0], gsAnt: [0, 0, 0] }, 0, 3), -Math.tan(3 * DEG), 1e-12), 'straight above: up; behind: lower, since the path climbs back');
});

test('P-09 the ils siting: the PAPI\'s 3° line on the trainer\'s eye path, 2 white from 2 NM to the threshold on the path; back to aip', () => {
  try {
    assert.equal(setPapiSiting('ils'), 'ils'); assert.equal(FIELD.papiSiting, 'ils');
    const H2 = eyeAboveBeam(AC, 0);
    for (const id of ENDS) {
      const E = RWY_END[id];
      assert.deepEqual(Object.keys(E.papiSites), ['aip', 'tc', 'ils']);
      assert.ok(near(E.papi, ILS_D[id], 0.1) && E.papi === E.papiSites.ils, `${id} ils ${E.papi} m (expect ${ILS_D[id]})`);
      assert.ok(E.papi > E.aim, `${id} (T-A08) PAPI ${E.papi} m beyond the glide-path origin ${E.aim.toFixed(1)} m`);
      setActiveRunway(id);
      assert.equal(PAPI.s, ILS_D[id], `${id}: setActiveRunway takes the siting in use`);
      // an eye H2 above the path (antenna on it): white on the 2°30′ and 2°50′ units, red on the others, all the way in
      const at = (s) => { const [n, e] = rwyToNED(s, 0); return papiSeen(n, e, gpHeight(s) + H2); };
      assert.deepEqual(at(-3704), [1, 1, 0, 0], `${id}: 2 NM out`); assert.deepEqual(at(0), [1, 1, 0, 0], `${id}: over the threshold`);
      for (let s = -3704; s <= 0; s += 25) assert.equal(whites(at(s)), 2, `${id}: ${s} m`);
    }
    // the active runway follows, in either order
    setActiveRunway('03L'); assert.equal(PAPI.s, 330.8);
    setPapiSiting('tc'); assert.equal(PAPI.s, TC['03L']);
    setActiveRunway('21L'); assert.equal(PAPI.s, TC['21L']);
    // anything else is aip, and aip gives the P-01 values again
    for (const bad of ['xyz', undefined, null, 'AIP']) {
      setPapiSiting('ils');
      assert.equal(setPapiSiting(bad), 'aip', String(bad)); assert.equal(FIELD.papiSiting, 'aip');
      assert.deepEqual(ENDS.map((id) => RWY_END[id].papi), [424.9, 384.8, 373.1, 376.0]);
    }
    assert.equal(PAPI.s, 376.0, '21L aip');
  } finally { reset(); }
});

test('P-10 (T-D-01) papiSeen reproduces the Transport Canada AC 302-009 example: on-slope lost 1359.7 m (EAH 0) and 1074.0 m (EAH 1 m) out', () => {
  // an ideal PAPI: light 0 m high on the centre line, 408.9 m past the threshold (D = 20 m / tan 2°48′), the unit set at
  // M = 2°48′; the eye path parallel to a 3° path crossing the threshold at 15.24 m (50 ft), EAH metres above it
  const tg = Math.tan(3 * DEG), aim = 15.24 / tg;
  try {
    setActiveRunway('21R');
    PAPI.s = 408.9; PAPI.h = 0; PAPI.units = [0, 1, 2, 3].map(() => ({ t: 0, ang: PAPI_MEHT_ANG.tc }));
    assert.ok(near(PAPI.s * Math.tan(PAPI_MEHT_ANG.tc * DEG), 20, 0.01), 'D tan M = EWH + WTH = 20 m');
    const unit = (x, eah) => { const [n, e] = rwyToNED(-x, 0); return papiSeen(n, e, (x + aim) * tg + eah)[0]; };
    for (const [eah, want, doc] of [[0, 1359.7, 1359.8], [1, 1074.0, 1074]]) {
      let lo = 500, hi = 3000;
      assert.ok(unit(lo, eah) === 0 && unit(hi, eah) === 1, 'red near, white far');
      for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (unit(m, eah) < 0.5) lo = m; else hi = m; }
      assert.ok(near(lo, want, 0.1) && near(lo, doc, 1), `EAH ${eah} m: the unit turns red ${lo.toFixed(2)} m before the threshold (expect ${want}; the document ${doc})`);
    }
  } finally { PAPI.h = PAPI_GEOM.h; reset(); }
});

test('P-11 (T-D-07) on the 21R ILS a 737-800W eye leaves the on-slope 738 m (lower edge 2°50′) and 548 m (2°48′) before the threshold', () => {
  // the research's case: the PAPI fixed at D = 405 m (MEHT / tan 2°50′ rounded to 5 m, T-D-02), only the lower edge of
  // the on-slope moves from 2°50′ to 2°48′ (the tc siting moves the PAPI instead: P-07). An ideal PAPI: light 0 m high
  // on the centre line, every unit set at the edge B; the eye path parallel to the 3° path through the 21R aim point
  // (RDH 54 ft / tan 3°), H2 = 1.433 m above it (737-800W, VREF flaps 30 with winglets, research 3.5.2 approach_visual)
  const tg = Math.tan(3 * DEG), aim = 54 * FT / tg, D = 405, H2 = 1.433;
  try {
    setActiveRunway('21R');
    assert.ok(near(aim, RWY_END['21R'].aim, 1e-9), `aim ${aim.toFixed(2)} m is the sim's 21R aim point`);
    for (const [B, doc, at] of [[2 + 50 / 60, 738, 'lower edge 2°50′'], [2 + 48 / 60, 548, 'lower edge 2°48′']]) {
      PAPI.s = D; PAPI.h = 0; PAPI.units = [0, 1, 2, 3].map(() => ({ t: 0, ang: B }));
      // research §3.5.8 equation 4: (x + aim) tan 3° + H2 = (x + D) tan B
      const tb = Math.tan(B * DEG), x = (D * tb - aim * tg - H2) / (tg - tb);
      const unit = (x) => { const [n, e] = rwyToNED(-x, 0); return papiSeen(n, e, (x + aim) * tg + H2)[0]; };
      let lo = 100, hi = 3000;
      assert.ok(unit(lo) === 0 && unit(hi) === 1, 'red near, white far');
      for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (unit(m) < 0.5) lo = m; else hi = m; }
      assert.ok(near(x, doc, 2), `${at}: the formula gives ${x.toFixed(1)} m (the research ${doc} m)`);
      assert.ok(near(lo, x, 0.2) && near(lo, doc, 2), `${at}: papiSeen loses the on-slope ${lo.toFixed(2)} m before the threshold (formula ${x.toFixed(2)} m, research ${doc} ± 2 m)`);
    }
  } finally { PAPI.h = PAPI_GEOM.h; reset(); }
});

// What the page does with the siting, read from src/90-app.js with its comments left out (like test/keys.test.mjs)
test('P-12 the page applies the siting: the stored choice before the airfield is built; a siting button moves housings, lights and pin; the hint follows the setup runway; the live ILS hint only off ils', () => {
  const app = fs.readFileSync(new URL('../src/90-app.js', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');
  const block = (from, to) => { const i = app.indexOf(from), j = app.indexOf(to, i); assert.ok(i >= 0 && j > i, `found: ${from}`); return app.slice(i, j + to.length); };
  // the trainee's last choice is applied before buildAirfield places the housings and buildAirfieldLights the lights
  const set = app.indexOf("setPapiSiting(store.get('afl-papi', 'aip'));"), build = app.indexOf('buildAirfield(');
  assert.ok(set >= 0 && build > set && app.lastIndexOf('buildAirfield(') === build, 'the stored siting is applied before buildAirfield(');
  // a siting button: store and apply it, move the housings and the lights, the PAPI pin, the open card, then the setup
  const click = block("for (const b of $('#segPapi').querySelectorAll('button')) b.onclick = () => {", '\n  };');
  let k = -1;
  for (const c of ["store.set('afl-papi', setPapiSiting(b.dataset.papi));", 'field.placePapi(); lights.placePapi();',
    "const sp = SPOTS.find((x) => x.id === 'papi'), P = sp.p(); sp.w = W3(P[0], P[1], P[2]);", "if (app.spot === 'papi') $('#cardP').textContent = spotText(sp);", 'refreshSetup();']) {
    const i = click.indexOf(c); assert.ok(i > k, `the siting buttons, in this order: ${c}`); k = i;
  }
  // the setup shows the siting in use and its distance on the runway picked there
  const refresh = block('function refreshSetup() {', '\n  }\n');
  assert.ok(refresh.includes("for (const b of $('#segPapi').children) b.setAttribute('aria-pressed', String(b.dataset.papi === FIELD.papiSiting));"), 'the pressed button is the siting in use');
  assert.ok(refresh.includes("$('#papiSiteTxt').textContent = papiSiteText(app.train.rwy);"), 'the hint is about the runway picked in the setup');
  // the live hint that the PAPI reads low on the ILS: never with the ils siting
  assert.match(app, /const onIls = FIELD\.papiSiting !== 'ils' && FIELD\.appr === 'ILS' && /, 'onIls is false with the ils siting');
  assert.ok(app.includes("(onIls ? ' · บน ILS ช่วงท้าย PAPI แสดงต่ำได้ ให้ยึด ILS' : '')"), 'the live hint shows only with onIls');
});

// Merge of the PAPI siting (PR #22) into the aircraft cards (PR #21, plan B3): AC is empty until setAircraft, so
// 20-flight.js has no top-level setPapiSiting; setAircraft calls it, and the ils siting follows the type flown.
test('P-13 setAircraft re-solves the siting in use for the new eye and antenna: ils moves with the type, aip and tc do not', () => {
  const trainer = JSON.parse(fs.readFileSync(new URL('../data/aircraft/trainer.json', import.meta.url), 'utf8'));
  const c172s = JSON.parse(fs.readFileSync(new URL('../data/aircraft/c172s.json', import.meta.url), 'utf8'));
  const src = fs.readFileSync(new URL('../src/20-flight.js', import.meta.url), 'utf8');
  assert.equal(src.match(/^setPapiSiting\(/gm), null, 'no top-level setPapiSiting in 20-flight.js (AC is empty there)');
  const before = Object.fromEntries(ENDS.map((id) => [id, { ...RWY_END[id].papiSites }]));
  try {
    setPapiSiting('ils');
    M.setAircraft(c172s);
    assert.equal(FIELD.papiSiting, 'ils', 'the siting in use stays');
    assert.ok(near(eyeAboveBeam(AC, 0), 0, 1e-12), `C172S eye at its antenna: H2 ${eyeAboveBeam(AC, 0)}`);
    for (const id of ENDS) {
      const E = RWY_END[id], want = Math.round((E.aim - PAPI_GEOM.h / Math.tan(3 * DEG)) * 10) / 10;
      assert.ok(near(E.papiSites.ils, want, 1e-9) && E.papi === E.papiSites.ils, `${id} ils with the C172S ${E.papiSites.ils} m (expect ${want})`);
      assert.ok(E.papiSites.aip === before[id].aip && E.papiSites.tc === before[id].tc, `${id} aip and tc do not move`);
    }
    assert.equal(PAPI.s, RWY_END[FIELD.rwy].papi);
    M.setAircraft(trainer);
    for (const id of ENDS) assert.deepEqual(RWY_END[id].papiSites, before[id], `${id} back with the trainer`);
  } finally { M.setAircraft(trainer); reset(); }
});
