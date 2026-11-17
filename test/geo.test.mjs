import { M } from './harness.mjs';
const { RWY_END, RUNWAYS, llToNE, neToLL, ARP, FT, DEG } = M;
for (const r of RUNWAYS) console.log(r.id, 'len', r.len.toFixed(1), 'hdg', r.hdg.toFixed(2), 'p0', r.p0.map(v => v.toFixed(1)).join(','), 'sThr', r.sThr.map(v => v.toFixed(1)).join(','));
for (const [id, E] of Object.entries(RWY_END)) console.log(id, 'hdg', E.hdg.toFixed(2), 'lda', E.lda.toFixed(0), 'aim', E.aim.toFixed(0), 'papi', E.papi, 'locDist', E.locDist.toFixed(0), 'gpAnt', E.gpAntenna && E.gpAntenna.toFixed(0), 'thr', E.thr.map(v => v.toFixed(1)).join(','));
// ARP check: on 03L/21R centre line 1510 m from THR 21R
const E = RWY_END['21R']; const d = Math.hypot(E.thr[0], E.thr[1]); console.log('ARP distance from THR 21R', d.toFixed(1));
const [la, lo] = neToLL(...llToNE(13.9, 100.6)); console.log('roundtrip', la.toFixed(8), lo.toFixed(8));
// separation of runway centre lines
const a = RUNWAYS[0], b = RUNWAYS[1]; const q = [b.p0[0] - a.p0[0], b.p0[1] - a.p0[1]]; console.log('CL separation', (q[0] * a.r[0] + q[1] * a.r[1]).toFixed(1));
