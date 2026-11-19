// Geodesy and runway geometry from the AIP threshold coordinates (AIP Thailand AD 2 VTBD, AD 2.2 and 2.12–2.14).
// RUNWAYS and RWY_END place the rendered runways, lights and approach paths, so a sign or coordinate slip here
// moves them off the OpenStreetMap layout: these checks pin the geometry.
import { M } from './harness.mjs';
import { check, f1, done } from './lib/check.mjs';
const { RWY_END, RUNWAYS, llToNE, neToLL } = M;
for (const r of RUNWAYS) console.log(' ', r.id, 'len', f1(r.len), 'hdg', f1(r.hdg, 2), 'p0', r.p0.map((v) => f1(v)).join(','), 'sThr', r.sThr.map((v) => f1(v)).join(','));
for (const [id, E] of Object.entries(RWY_END)) console.log(' ', id, 'hdg', f1(E.hdg, 2), 'lda', f1(E.lda, 0), 'aim', f1(E.aim, 0), 'papi', E.papi, 'locDist', f1(E.locDist, 0), 'thr', E.thr.map((v) => f1(v)).join(','));
const R1 = RUNWAYS.find((r) => r.id === '03L/21R'), R2 = RUNWAYS.find((r) => r.id === '03R/21L');

// projection: a round trip is exact, north and east have the right signs and scale (1′ of latitude ≈ 1,843 m here)
let worst = 0;
for (const [la, lo] of [[13.9, 100.6], [13.95, 100.65], [13.85, 100.55]]) { const [a, b] = neToLL(...llToNE(la, lo)); worst = Math.max(worst, Math.abs(a - la), Math.abs(b - lo)); }
check('llToNE / neToLL round trip', worst < 1e-9, `worst ${worst.toExponential(1)}°`);
const dn = llToNE(13.9 + 1 / 60, 100.6)[0] - llToNE(13.9, 100.6)[0], de = llToNE(13.9, 100.6 + 1 / 60)[1] - llToNE(13.9, 100.6)[1];
check('one minute of latitude / longitude at 13.9° N', Math.abs(dn - 1843) < 3 && Math.abs(de - 1800) < 3, `north ${f1(dn)} m, east ${f1(de)} m`);

// runways: lengths and widths as published (3,700 × 60 m and 3,500 × 45 m), the 21L displaced threshold (350 m)
check('03L/21R 3,700 m × 60 m', Math.abs(R1.len - 3700) < 5 && R1.w === 60, `${f1(R1.len)} m`);
check('03R/21L 3,500 m × 45 m, 21L threshold displaced 350 m', Math.abs(R2.len - 3500) < 5 && R2.w === 45 && RWY_END['21L'].disp === 350 && Math.abs(RWY_END['21L'].lda - 3150) < 5, `${f1(R2.len)} m, LDA 21L ${f1(RWY_END['21L'].lda, 0)} m`);
// true bearings from the threshold coordinates (≈ 028.7° / 208.7°); reciprocal ends agree
check('true bearings 03L 028.7°, 03R 028.8°, reciprocals 180° apart', Math.abs(RWY_END['03L'].hdg - 28.72) < 0.05 && Math.abs(RWY_END['03R'].hdg - 28.75) < 0.05 && Math.abs(RWY_END['21R'].hdg - RWY_END['03L'].hdg - 180) < 1e-6 && Math.abs(RWY_END['21L'].hdg - RWY_END['03R'].hdg - 180) < 1e-6, `03L ${f1(RWY_END['03L'].hdg, 2)}°, 03R ${f1(RWY_END['03R'].hdg, 2)}°, 21R ${f1(RWY_END['21R'].hdg, 2)}°, 21L ${f1(RWY_END['21L'].hdg, 2)}°`);
// the aerodrome reference point: on the 03L/21R centre line, 1,510 m from THR 21R (AD 2.2)
const E = RWY_END['21R'], dArp = Math.hypot(E.thr[0], E.thr[1]), offArp = -(R1.p0[0] * R1.r[0] + R1.p0[1] * R1.r[1]);
check('ARP 1,510 m from THR 21R on the 03L/21R centre line', Math.abs(dArp - 1510) < 5 && Math.abs(offArp) < 5, `${f1(dArp)} m, ${f1(offArp, 2)} m off the centre line`);
// the parallel runways: 03R/21L lies east of 03L/21R, about 394 m centre line to centre line
const q = [R2.p0[0] - R1.p0[0], R2.p0[1] - R1.p0[1]], sep = q[0] * R1.r[0] + q[1] * R1.r[1];
check('03R/21L parallel to and 394 m right of 03L/21R', Math.abs(sep - 393.7) < 1 && Math.abs(R2.hdg - R1.hdg) < 0.1, `${f1(sep)} m, ${f1(R2.hdg - R1.hdg, 3)}° apart`);
// landing frames: u points along the landing direction from each threshold, r to its right
for (const id of ['03L', '21R', '03R', '21L']) {
  const X = RWY_END[id], far = [X.far[0] - X.thr[0], X.far[1] - X.thr[1]], along = far[0] * X.u[0] + far[1] * X.u[1];
  check(`${id}: landing direction points down the runway, right normal to the right`, Math.abs(along - X.lda) < 1e-6 && Math.abs(X.r[0] + X.u[1]) < 1e-12 && Math.abs(X.r[1] - X.u[0]) < 1e-12, `LDA ${f1(X.lda, 0)} m`);
}
done();
