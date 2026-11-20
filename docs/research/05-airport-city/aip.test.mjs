// Prototype of test/aip.test.mjs (section 1, T-A tests). Run: node aip.test.mjs
import { M } from '../../../test/harness.mjs';
const { RWY_END, RUNWAYS, llToNE, FT, DEG, setActiveRunway, gpHeight } = M;
let fail = 0; const ok = (id, c, msg) => { console.log((c ? 'PASS ' : 'FAIL ') + id + ' ' + msg); if (!c) fail++; };
const sT = (E, lat, lon) => { const p = llToNE(lat, lon), dn = p[0] - E.thr[0], de = p[1] - E.thr[1]; return [dn * E.u[0] + de * E.u[1], dn * E.r[0] + de * E.r[1]]; };
ok('T-A01', Math.abs(RUNWAYS[0].len - 3700) <= 3, 'len03L/21R ' + RUNWAYS[0].len.toFixed(1));
ok('T-A02', Math.abs(RUNWAYS[1].len - 3500) <= 3, 'len03R/21L ' + RUNWAYS[1].len.toFixed(1));
ok('T-A03', Math.abs(RWY_END['21L'].lda - 3150) <= 3 && RWY_END['21L'].disp === 350, '21L lda ' + RWY_END['21L'].lda.toFixed(1));
for (const [id, v] of [['03L', 3700], ['21R', 3700], ['03R', 3500]]) ok('T-A04', Math.abs(RWY_END[id].lda - v) <= 3, id + ' lda ' + RWY_END[id].lda.toFixed(1));
const DD = { '03L': [3700, 3850, 3700, 3700], '21R': [3700, 3850, 3700, 3700], '03R': [3500, 3650, 3500, 3500], '21L': [3500, 3650, 3500, 3150] };
for (const [id, [tora, toda, asda]] of Object.entries(DD)) ok('T-A05', toda - tora === 150 && asda === tora, id);
for (const [id, rdh] of [['21R', 54], ['21L', 53], ['03L', 55], ['03R', 50]]) { setActiveRunway(id); ok('T-A06', Math.abs(gpHeight(0) - rdh * FT) <= 0.01, id + ' gp(0) ' + gpHeight(0).toFixed(3)); }
setActiveRunway('21R');
// 19 Nov 2026: papiFromMEHT now solves the distance in the sim's light geometry (light 0.64 m high, 2°50′ unit 33 m
// outside the edge) instead of round5(MEHT / tan 2°50′) = 440 / 405 / 390 / 395 m; see test/papi.test.mjs.
for (const [id, d, meht] of [['03L', 424.9, 71.85], ['21R', 384.8, 65.42], ['03R', 373.1, 63.35], ['21L', 376.0, 63.81]]) {
  const E = RWY_END[id], eye = 0.64 + Math.hypot(E.papi, E.w / 2 + 33) * Math.tan((2 + 50 / 60) * DEG);
  ok('T-A07', Math.abs(E.papi - d) <= 0.1 && Math.abs(eye - meht * FT) <= 0.01, id + ' papi ' + E.papi);
}
for (const id of ['03L', '21R', '21L']) ok('T-A08', RWY_END[id].papi > RWY_END[id].aim, id + ' papi-aim ' + (RWY_END[id].papi - RWY_END[id].aim).toFixed(1));
ok('T-A09', Math.abs(RWY_END['03L'].hdg - 29) <= 0.5 && Math.abs(RWY_END['21R'].hdg - 209) <= 0.5, 'hdg ' + RWY_END['03L'].hdg.toFixed(3));
ok('T-A10', Math.abs(RWY_END['03R'].hdg - 28.75) <= 0.05, 'hdg03R ' + RWY_END['03R'].hdg.toFixed(3));
{ const E = RWY_END['21R']; const dn = -E.thr[0], de = -E.thr[1]; const s = dn * E.u[0] + de * E.u[1], t = dn * E.r[0] + de * E.r[1]; ok('T-A11', Math.abs(s - 1510) <= 3 && Math.abs(t) <= 3, `ARP s ${s.toFixed(1)} t ${t.toFixed(1)}`); }
{ const p = llToNE(13 + 54 / 60 + 52 / 3600, 100 + 36 / 60 + 20 / 3600); ok('T-A12', Math.hypot(...p) <= 22 && Math.abs(p[0] - 8.0) <= 0.2 && Math.abs(p[1] + 14.7) <= 0.2, `ARPpub n ${p[0].toFixed(2)} e ${p[1].toFixed(2)}`); }
ok('T-A13', Math.abs(RWY_END['21R'].locDist - RWY_END['21R'].lda - 300) <= 5, 'loc21R beyond ' + (RWY_END['21R'].locDist - RWY_END['21R'].lda).toFixed(1));
const dms = (d, m, s) => d + m / 60 + s / 3600;
{ const [s, t] = sT(RWY_END['21R'], dms(13, 55, 23.4), dms(100, 36, 42.8)); ok('T-A14', Math.abs(s - 333) <= 4 && Math.abs(Math.abs(t) - 120) <= 3 && t < 0, `gp21R s ${s.toFixed(1)} t ${t.toFixed(1)}`); }
{ const [s, t] = sT(RWY_END['21L'], dms(13, 55, 21.2), dms(100, 36, 47.4)); ok('T-A15', Math.abs(s - 320) <= 5 && Math.abs(Math.abs(t) - 120) <= 3 && t > 0, `gp21L s ${s.toFixed(1)} t ${t.toFixed(1)}`); }
{ const v = RWY_END['21L'].locDist - RWY_END['21L'].lda; ok('T-A16', v >= 222 && v <= 236, 'loc21L beyond ' + v.toFixed(1)); }
{ const E = RWY_END['03L']; const [s, t] = sT(E, dms(13, 53, 56.4), dms(100, 35, 54.0)); ok('T-A17', Math.abs(E.gpAntenna - E.aim) <= 5 && Math.abs(Math.abs(t) - 121.2) <= 3, `gp03L ${E.gpAntenna.toFixed(1)} aim ${E.aim.toFixed(1)} t ${t.toFixed(1)}`); }
{ const p = llToNE(dms(13, 53, 36.7), dms(100, 35, 46.3)); const [s, t] = sT(RWY_END['03L'], dms(13, 53, 36.7), dms(100, 35, 46.3)); ok('T-A18', Math.abs(p[0] + 2306.2) <= 1 && Math.abs(p[1] + 1026.4) <= 1 && Math.abs(s + 324.7) <= 1 && Math.abs(t - 209.4) <= 1, `vor n ${p[0].toFixed(1)} e ${p[1].toFixed(1)} s ${s.toFixed(1)} t ${t.toFixed(1)}`); }
const ch = (f) => (f <= 112.25 ? Math.round(17 + 10 * (f - 108.0)) : Math.round(70 + 10 * (f - 112.3))) + 'X';
ok('T-A19', ch(109.3) === '30X' && ch(110.3) === '40X' && ch(109.7) === '34X' && ch(117.7) === '124X', [109.3, 110.3, 109.7, 117.7].map(ch).join(','));
{ const a = RUNWAYS[0], b = RUNWAYS[1]; const q = [b.p0[0] - a.p0[0], b.p0[1] - a.p0[1]]; const sep = q[0] * a.r[0] + q[1] * a.r[1]; ok('T-A21', sep >= 390 && sep <= 398, 'sep ' + sep.toFixed(1)); }
for (const [id, m, ft] of [['03L', 2.0, 7], ['21R', 2.0, 7], ['03R', 1.49, 5], ['21L', 1.92, 6.3]]) ok('T-A22', Math.abs(m - ft * FT) <= 0.2, id);
ok('T-A22b', !(Math.abs(1.0 - 5 * FT) <= 0.2), '03R current 1 m vs 5 ft fails as expected');
{ const [s, t] = sT(RWY_END['03R'], dms(13, 54, 53.0), dms(100, 37, 9.8)); ok('T-A24', Math.abs(t) > 80, `mast61 s ${s.toFixed(1)} t ${t.toFixed(1)}`); }
ok('T-A25', 5 * 1852 === 9260, 'ATZ');
console.log(fail ? `${fail} FAILED` : 'all passed'); process.exit(fail ? 1 : 0);
