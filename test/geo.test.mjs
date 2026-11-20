// Geodesy and runway geometry from the AIP threshold coordinates (AIP Thailand AD 2 VTBD, AD 2.2 and 2.12–2.14).
// RUNWAYS and RWY_END place the rendered runways, lights and approach paths, so a sign or coordinate slip here moves
// them off the OpenStreetMap layout.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { M } from './harness.mjs';
const { RWY_END, RUNWAYS, llToNE, neToLL } = M;
const R1 = RUNWAYS.find((r) => r.id === '03L/21R'), R2 = RUNWAYS.find((r) => r.id === '03R/21L');

test('projection: exact round trip, right signs and scale (1′ of latitude ≈ 1,844 m here)', () => {
  for (const [la, lo] of [[13.9, 100.6], [13.95, 100.65], [13.85, 100.55]]) {
    const [a, b] = neToLL(...llToNE(la, lo));
    assert.ok(Math.abs(a - la) < 1e-9 && Math.abs(b - lo) < 1e-9, `${la}, ${lo} → ${a}, ${b}`);
  }
  const dn = llToNE(13.9 + 1 / 60, 100.6)[0] - llToNE(13.9, 100.6)[0], de = llToNE(13.9, 100.6 + 1 / 60)[1] - llToNE(13.9, 100.6)[1];
  assert.ok(Math.abs(dn - 1844) < 3 && Math.abs(de - 1801) < 3, `north ${dn.toFixed(1)} m, east ${de.toFixed(1)} m`);
});

test('runways: 3,700 m × 60 m and 3,500 m × 45 m, 21L threshold displaced 350 m', () => {
  assert.ok(Math.abs(R1.len - 3700) < 5 && R1.w === 60, `03L/21R ${R1.len.toFixed(1)} m × ${R1.w}`);
  assert.ok(Math.abs(R2.len - 3500) < 5 && R2.w === 45, `03R/21L ${R2.len.toFixed(1)} m × ${R2.w}`);
  assert.equal(RWY_END['21L'].disp, 350);
  assert.ok(Math.abs(RWY_END['21L'].lda - 3150) < 5, `LDA 21L ${RWY_END['21L'].lda.toFixed(0)} m`);
});

test('true bearings ≈ 028.7° / 208.7°, reciprocal ends 180° apart, runways parallel', () => {
  assert.ok(Math.abs(RWY_END['03L'].hdg - 28.72) < 0.05, `03L ${RWY_END['03L'].hdg.toFixed(2)}°`);
  assert.ok(Math.abs(RWY_END['03R'].hdg - 28.75) < 0.05, `03R ${RWY_END['03R'].hdg.toFixed(2)}°`);
  assert.ok(Math.abs(RWY_END['21R'].hdg - RWY_END['03L'].hdg - 180) < 1e-6 && Math.abs(RWY_END['21L'].hdg - RWY_END['03R'].hdg - 180) < 1e-6);
  assert.ok(Math.abs(R2.hdg - R1.hdg) < 0.1, `${(R2.hdg - R1.hdg).toFixed(3)}° apart`);
});

test('ARP on the 03L/21R centre line, 1,510 m from THR 21R (AD 2.2); 03R/21L 394 m to its right', () => {
  const E = RWY_END['21R'], d = Math.hypot(E.thr[0], E.thr[1]), off = -(R1.p0[0] * R1.r[0] + R1.p0[1] * R1.r[1]);
  assert.ok(Math.abs(d - 1510) < 5 && Math.abs(off) < 5, `${d.toFixed(1)} m from THR 21R, ${off.toFixed(2)} m off the centre line`);
  const q = [R2.p0[0] - R1.p0[0], R2.p0[1] - R1.p0[1]], sep = q[0] * R1.r[0] + q[1] * R1.r[1];
  assert.ok(Math.abs(sep - 393.7) < 1, `separation ${sep.toFixed(1)} m`);
});

test('landing frames: u points down the runway from each threshold, r to its right', () => {
  for (const id of ['03L', '21R', '03R', '21L']) {
    const X = RWY_END[id], far = [X.far[0] - X.thr[0], X.far[1] - X.thr[1]], along = far[0] * X.u[0] + far[1] * X.u[1];
    assert.ok(Math.abs(along - X.lda) < 1e-6, `${id}: ${along} vs LDA ${X.lda}`);
    assert.ok(Math.abs(X.r[0] + X.u[1]) < 1e-12 && Math.abs(X.r[1] - X.u[0]) < 1e-12, `${id}: r = [−u_e, u_n]`);
  }
});
