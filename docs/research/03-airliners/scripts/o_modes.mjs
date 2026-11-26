// o_modes.mjs — topic 3.9: expected values for mode-logic tests (A320 flare height, LAND timing,
// 737 RETARD trigger, capture thresholds in dots, wind-limit gating, minima/LVP gating).
// Run: node o_modes.mjs
const FT = 0.3048, KT = 1852 / 3600, DEG = Math.PI / 180;
const r = (x, n = 2) => Number(x.toFixed(n));
const tan3 = Math.tan(3 * DEG);

// 1. A320 (FBW A32NX v0.10.0 logic) flare height vs vertical speed: h = clamp(|VS|/15, 45, 60) ft
console.log('== 1. A320 flare height (ft) vs V/S (fpm) ==');
for (const vs of [400, 500, 600, 675, 709, 750, 800, 900, 1000]) {
  const h = Math.min(60, Math.max(45, vs / 15));
  console.log(`VS ${vs} fpm -> flare ${r(h, 1)} ft (${r(h * FT)} m); time-to-go h/VS = ${r(h / (vs / 60), 2)} s`);
}
// VS on a 3 deg path for ground speeds
for (const gs of [120, 133.6, 140, 150]) console.log(`GS ${gs} kt on 3 deg: VS ${r(gs * 101.2686 * tan3, 0)} fpm`);

// 2. LAND engage: 1.2 s after RA < 400 ft (FBW); height reached at engagement for VS
console.log('\n== 2. LAND engagement height (ft) = 400 - VS*1.2/60 ==');
for (const vs of [600, 709, 800, 1000]) console.log(`VS ${vs}: LAND at ${r(400 - vs * 1.2 / 60, 1)} ft (FBW docs: must show before 350 ft)`);

// 3. 737 RETARD: min(RA <= 27 ft, 2.5 s after FLARE engage at 50 ft) with ideal exponential flare
console.log('\n== 3. 737 RETARD trigger (ideal L1v flare, hB = 12 ft) ==');
for (const kt of [130, 142.1, 155]) {
  const vg = kt * KT, hB = 12 * FT, hf = 50 * FT, tau = (hf + hB) / (vg * tan3);
  const tAt27 = tau * Math.log((hf + hB) / (27 * FT + hB));
  const trig = tAt27 <= 2.5 ? `27 ft at ${r(tAt27)} s` : `2.5 s at ${r(((hf + hB) * Math.exp(-2.5 / tau) - hB) / FT, 1)} ft`;
  console.log(`GS ${kt} kt: tau ${r(tau)} s, RA 27 ft reached ${r(tAt27)} s after flare -> RETARD by ${trig}`);
}

// 4. Capture thresholds expressed in dots on DMK 21R (LOC 0.751 deg/dot) and GS 0.36 deg/dot
console.log('\n== 4. Capture thresholds in dots (21R LOC 0.751 deg/dot, GS 0.36 deg/dot) ==');
const locDot = 0.751, gsDot = 0.36;
console.log(`FBW LOC* |e|<1.92 deg = ${r(1.92 / locDot)} dot; LOC track 0.16 deg = ${r(0.16 / locDot)} dot; G/S* 0.1333 deg = ${r(0.1333 / gsDot)} dot`);
console.log(`737 LOC capture 1/2 dot = ${r(0.5 * locDot, 3)} deg; G/S capture 2/5 dot = ${r(0.4 * gsDot, 3)} deg`);
console.log(`Airbus AUTOLAND warning LOC 1/4 dot = ${r(0.25 * locDot, 3)} deg = ${r(0.25 * 75, 1)} uA; GS 1 dot = ${r(gsDot, 2)} deg; Safety First 20 uA = ${r(20 / 75, 3)} dot`);

// 5. Autoland wind-limit gating on DMK runways (heading true from AIP context: 21R 208.72 deg)
console.log('\n== 5. Wind components on RWY 21R (true course 208.72 deg) ==');
const crs = 208.72;
function comps(dirFrom, spd) { const a = (dirFrom - crs) * DEG; return { hw: spd * Math.cos(a), xw: spd * Math.sin(a) }; }
const LIM = { a320ceo: { hw: 30, xw: 20, tw: 10 }, b737_800: { hw: 25, xw: 20, tw: 15 }, b737_800_xw25: { hw: 25, xw: 25, tw: 15 }, a330_300: { hw: 35, xw: 20, tw: 10 } };
for (const [d, s] of [[209, 20], [250, 25], [270, 24], [30, 9], [30, 12], [180, 40]]) {
  const c = comps(d, s); const ok = {};
  for (const [k, L] of Object.entries(LIM)) ok[k] = (c.hw >= 0 ? c.hw <= L.hw : -c.hw <= L.tw) && Math.abs(c.xw) <= L.xw;
  console.log(`wind ${d}/${s} kt: HW ${r(c.hw, 1)} XW ${r(c.xw, 1)} -> autoland allowed ${JSON.stringify(ok)}`);
}

// 6. DMK LVP and minima gating (AIP AD 2.20 via round-5 context; EASA/ICAO tables)
console.log('\n== 6. Minima gating ==');
function allowed({ rvr, ceilFt }, ac) {
  const lvp = rvr < 550 || ceilFt < 200;
  const rwys = lvp ? ['21R'] : ['21R', '21L', '03L', '03R'];
  // lowest operation the type/runway pair supports at DMK: 21R CAT II (DH 100 ft, RVR 300 m)
  let op = null;
  if (rvr >= 550) op = 'CAT I (DA 200 ft)';
  else if (rvr >= 300 && ac !== 'none') op = 'CAT II 21R (DH 100 ft)';
  else op = 'below DMK minima -> divert/hold';
  return { lvp, rwys, op };
}
for (const w of [{ rvr: 2000, ceilFt: 1000 }, { rvr: 600, ceilFt: 150 }, { rvr: 400, ceilFt: 100 }, { rvr: 250, ceilFt: 50 }]) console.log(JSON.stringify(w), JSON.stringify(allowed(w, 'a320ceo')));
// CAT II RVR vs DH (Uganda CAA Table 3 / EASA): DH 100-120 -> 300 m, 121-140 -> 400 m, 141-199 -> 450 m
const cat2rvr = (dh) => (dh <= 120 ? 300 : dh <= 140 ? 400 : 450);
for (const dh of [100, 113, 120, 130, 143]) console.log(`CAT II DH ${dh} ft -> RVR ${cat2rvr(dh)} m (Cat A-C)`);
