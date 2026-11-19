// PAPI and ILS geometry (research round 3, topic 3.5 and 3.9): PAPI distance solved from the AIP MEHT in the sim's
// own light geometry, PAPI seen from the pilot's eye, ILS flown and displayed at the glide-slope antenna, and the
// localizer dot scaled per runway. Expected values come from an independent calculation (Python, same formulas).
import { M } from './harness.mjs';
const { FIELD, AC, Flight, SCENARIOS, FT, DEG, RAD, papiSeen, ilsAt, gpHeight, setActiveRunway, RWY_END, PAPI_GEOM, rwyToNED, eulerToQ } = M;
let fails = 0;
const ok = (id, cond, msg) => { console.log(`${cond ? 'PASS' : 'FAIL'} ${id} ${msg}`); if (!cond) fails++; };
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const whites = (pw) => pw.filter((v) => v > 0.5).length;
const MEHT_FT = { '03L': 71.85, '21R': 65.42, '03R': 63.35, '21L': 63.81 };   // AIP AD 2.14

// P-01 PAPI distance (estimate solved from MEHT, light 0.64 m high, 2°50′ unit 33 m outside the edge)
for (const [id, d] of [['03L', 424.9], ['21R', 384.8], ['03R', 373.1], ['21L', 376.0]]) ok('P-01', near(RWY_END[id].papi, d, 0.1), `${id} papi ${RWY_END[id].papi} m (expect ${d})`);

// P-02 MEHT holds in the sim: an eye on the centre line over the threshold just above MEHT sees 2 white, just below sees 1
for (const id of Object.keys(MEHT_FT)) {
  setActiveRunway(id);
  const [n, e] = rwyToNED(0, 0), h = MEHT_FT[id] * FT;
  const up = whites(papiSeen(n, e, h + 0.06)), dn = whites(papiSeen(n, e, h - 0.06));
  ok('P-02', up === 2 && dn === 1, `${id} MEHT ${h.toFixed(2)} m: +6 cm ${up} white, −6 cm ${dn} white`);
}

// P-03 colour bands over the 21R threshold (edges 17.73 / 19.94 / 22.14 / 24.34 m): 0 to 4 white
setActiveRunway('21R');
{
  const [n, e] = rwyToNED(0, 0);
  const got = [17.0, 18.8, 21.0, 23.2, 25.3].map((h) => whites(papiSeen(n, e, h)));
  ok('P-03', got.join() === '0,1,2,3,4', `21R eye 17.0/18.8/21.0/23.2/25.3 m → ${got.join('/')} white`);
}

// P-04 localizer and glide-slope dots (T-O-01): 1 dot = atan(105 m / localizer distance) / 2
for (const [id, d, tol] of [['21R', 0.751, 0.005], ['03L', 0.749, 0.005], ['21L', 0.889, 0.01]]) {
  setActiveRunway(id); ok('P-04', near(FIELD.locDot, d, tol), `${id} LOC 1 dot ${FIELD.locDot.toFixed(4)}° (expect ${d}°)`);
}
ok('P-04', FIELD.gsDot === 0.36, `G/S 1 dot ${FIELD.gsDot}°`);

// P-05 body points: eye and antenna follow the attitude (pitch 5°, wings level, heading down the runway)
setActiveRunway('21R');
{
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'ap', seed: 1 });
  const ac = f.ac, q = eulerToQ(0, 5 * DEG, FIELD.rwyHdg * DEG);
  ac.x[6] = q[0]; ac.x[7] = q[1]; ac.x[8] = q[2]; ac.x[9] = q[3]; ac.updateAir();
  const a = ac.air, h = -ac.x[2];
  const eyeUp = AC.eye[0] * Math.sin(5 * DEG) - AC.eye[2] * Math.cos(5 * DEG);
  const antUp = AC.gsAnt[0] * Math.sin(5 * DEG) - AC.gsAnt[2] * Math.cos(5 * DEG);
  ok('P-05', near(a.eye[2] - h, 1.079, 0.002) && near(eyeUp, 1.079, 0.002), `eye ${(a.eye[2] - h).toFixed(3)} m above CG (expect 1.079)`);
  ok('P-05', near(a.antH - h, -0.072, 0.002) && near(antUp, -0.072, 0.002), `antenna ${(a.antH - h).toFixed(3)} m above CG (expect −0.072)`);
  // the displayed deviation is the antenna's: put the antenna exactly on the beam and the dots read zero
  const dh = gpHeight(a.antS) - a.antH; ac.x[2] -= dh; ac.updateAir();
  ok('P-05', Math.abs(ac.air.gsDots) < 0.01, `antenna on the beam → G/S ${ac.air.gsDots.toFixed(3)} dots (CG-based would read ${ilsAt(ac.x[0], ac.x[1], -ac.x[2]).gsDots.toFixed(3)})`);
}

// P-06 autoland on every runway in calm air still lands in the touchdown zone; record what the pilot sees on 21R
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
  ok('P-06', !f.crashed && td && td.s > 250 && td.s < 400 && sc && sc.total >= 93, `${id} autoland td ${td && td.s.toFixed(0)} m score ${sc && sc.total}`);
  if (FIELD.appr === 'ILS') console.log(`     ${id} on the ILS: PAPI ${at2nm} white at 2 NM, drops below 2 white at s ${drop === null ? '—' : drop.toFixed(0)} m, ${atThr} white over the threshold`);
  if (id === '21R') ok('P-06', at2nm === 2 && drop !== null && near(drop, -740, 80), `21R trainer on the ILS sees 2 white at 2 NM and 1 white from ${drop && drop.toFixed(0)} m (expect −740 ± 80 m: eye 1.3 m above the antenna, while MEHT over the threshold is 3.5 m above the beam)`);
}

console.log(fails ? `${fails} failed` : 'all passed');
if (fails) process.exit(1);
