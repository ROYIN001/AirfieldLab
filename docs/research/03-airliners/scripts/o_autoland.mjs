// o_autoland.mjs — topic 3.9 (AFCS / autoland) expected values for tests.
// Run: node o_autoland.mjs   (Node >= 18, no dependencies)
// All inputs are cited in 09-afcs-autoland.md; anything chosen here is an estimate (est).
const FT = 0.3048, KT = 1852 / 3600, DEG = Math.PI / 180, G0 = 9.80665;
const tan3 = Math.tan(3 * DEG);
const r = (x, n = 1) => Number(x.toFixed(n));

// ---------- 1. Runway / ILS geometry at DMK (AIP via round-5 context) ----------
// RDH (m), runway length from THR to far end (m), LOC antenna beyond far end (m)
const RWY = {
  '21R': { rdh: 54 * FT, toFar: 3700, locBeyond: 301.8, cw_aip: 3.0 },
  '03L': { rdh: 55 * FT, toFar: 3700, locBeyond: 314.0, cw_aip: 3.0 },
  '21L': { rdh: 53 * FT, toFar: 3150, locBeyond: 232.6, cw_aip: 3.6 },
};
console.log('== 1. ILS geometry (GP origin, LOC sector from 210 m at THR) ==');
for (const [id, R] of Object.entries(RWY)) {
  R.aim = R.rdh / tan3;                    // GP origin (beam intercept with runway plane), m past THR
  R.locDist = R.toFar + R.locBeyond;       // LOC antenna to THR, m
  const halfW = Math.atan(105 / R.locDist) / DEG;   // half course width (0.155 DDM, 150 uA) at 105 m
  R.locDot = halfW / 2;                    // 2-dot PFD: full scale = 2 dots
  console.log(`${id}: RDH ${r(R.rdh, 2)} m, GP origin ${r(R.aim)} m, LOC dist ${r(R.locDist)} m, ` +
    `course width ${r(2 * halfW, 2)} deg (AIP ${R.cw_aip}), 1 dot = ${r(R.locDot, 3)} deg = 75 uA, ` +
    `uA/deg = ${r(150 / halfW, 1)}; 1/4 dot at THR = ${r(Math.tan(R.locDot / 4 * DEG) * R.locDist, 1)} m`);
}
const gsHalf = 0.12 * 3 * 2;  // full scale 0.24*theta (0.175 DDM) -> 0.72 deg ; 1 dot = 0.12 theta
console.log(`GS: 1 dot = 0.12*theta = ${r(0.12 * 3, 2)} deg; full scale ${r(gsHalf, 2)} deg`);

// ---------- 2. Wheel path and callout positions ----------
// H = vertical distance ILS beam to main-wheel path on approach (topic 5, airframe.geometry.approach_visual)
const TYPES = {
  b737_800: { H: 4.237, vapp: 142.1, track: 5.715, note: '737-800W F30, 60 t: VREF30+5 (T-B-08)' },
  a320ceo:  { H: 4.88,  vapp: 133.6, track: 7.6,   note: 'A320ceo FULL 64.5 t VAPP (T-L-05)' },
  a330_300: { H: 8.56,  vapp: 140.0, track: 10.7,  note: 'A330-300 VAPP 140 kt (est, no topic-4 value yet)' },
  atr72_600:{ H: 2.3,   vapp: 117.0, track: 4.1,   note: 'ATR 72-600 VREF 112 + 5 kt (est)' },
};
const rw = RWY['21R'];
const calls = [1500, 1000, 800, 700, 500, 400, 350, 200, 160, 100, 80, 50, 40, 30, 27, 20, 10];
console.log('\n== 2. 21R: along-runway position s (m from THR, negative = before THR) where wheel height = callout ==');
for (const [k, T] of Object.entries(TYPES)) {
  T.sw = rw.aim - T.H / tan3;              // wheel-path intercept with runway (m past THR)
  T.tch = rw.rdh - T.H;                    // wheel crossing height at THR
  const row = calls.map((h) => `${h}:${r(T.sw - h * FT / tan3, 0)}`).join(' ');
  console.log(`${k}: wheel GPI ${r(T.sw)} m, wheels over THR ${r(T.tch, 2)} m (${r(T.tch / FT)} ft)`);
  console.log('   ' + row);
}

// ---------- 3. Flare laws (kinematic, constant ground speed, optional first-order lag on hdot) ----------
// law(h, st) returns hdot command (m/s, negative down); st holds law state fixed at flare entry.
function simulate({ vg, gamma = 3, H, sw, hFlareFn, lawInit, law, lag = 0, dt = 0.001, retardFt = null, retardDt = null }) {
  const hd0 = -vg * Math.tan(gamma * DEG);
  // start 150 ft above the wheels on the glide path
  let h = 150 * FT, s = sw - h / Math.tan(gamma * DEG), hd = hd0, t = 0, mode = 'APP', st = null;
  let sF = null, hF = null, tF = null, sRet = null, tRet = null;
  while (h > 0 && t < 120) {
    let cmd = hd0;
    if (mode === 'APP' && h <= hFlareFn(hd)) { mode = 'FLARE'; st = lawInit(h, hd); sF = s; hF = h; tF = t; }
    if (mode === 'FLARE') cmd = law(h, st);
    hd = lag > 0 ? hd + (cmd - hd) * (dt / lag) : cmd;
    if (sRet === null && mode === 'FLARE' && ((retardFt !== null && h <= retardFt * FT) || (retardDt !== null && t - tF >= retardDt))) { sRet = s; tRet = t - tF; }
    h += hd * dt; s += vg * dt; t += dt;
  }
  return { hF_ft: hF / FT, sF, sTD: s, tFlare: t - tF, sinkTD: -hd, sinkTD_fpm: -hd / FT * 60, sRet, tRet };
}
// L1: Boeing patent 4,354,237 prior-art exponential law, K = 0.205 1/s, hB = 12 ft (interpretation)
const L1 = (K = 0.205, hB = 12 * FT) => ({
  hFlareFn: (hd) => -hd / K - hB, lawInit: () => ({}), law: (h) => -K * (h + hB) });
// L1v: patent invention: V_G * tau constant, chosen so flare height = hf ft at any V_G
const L1v = (vg, hfFt = 50, hB = 12 * FT, gamma = 3) => { const tau = (hfFt * FT + hB) / (vg * Math.tan(gamma * DEG)); return L1(1 / tau, hB); };
// L2: FBW A32NX-style: flare at h = clamp(|VS fpm|/15, 45, 60) ft; tau = H/(R-2.5); hdot = -h/tau - 2.5 ft/s
const L2 = () => ({
  hFlareFn: (hd) => Math.min(60, Math.max(45, (-hd / FT * 60) / 15)) * FT,
  lawInit: (h, hd) => { const R = -hd / FT; const tau = (h / FT) / (R - 2.5); return { tau }; },
  law: (h, st) => -((h / FT) / st.tau + 2.5) * FT });
// L3: current AirfieldLab Autopilot (src/20-flight.js lines 368-373)
const L3 = () => ({
  hFlareFn: (hd) => Math.min(9, Math.max(4.5, 2.4 * Math.max(-hd, 1.5))),
  lawInit: () => ({}), law: (h) => -(0.22 + Math.max(h, 0) / 2.4) });

console.log('\n== 3. Flare law results on 21R (ideal tracking = lag 0; lag 1.0 s = est. path response) ==');
const out = {};
function report(tag, res) {
  out[tag] = res;
  console.log(`${tag}: flare ${r(res.hF_ft)} ft at s=${r(res.sF, 0)} m; TD s=${r(res.sTD, 0)} m (${r(res.sTD / FT, 0)} ft); ` +
    `flare ${r(res.tFlare, 2)} s; sink TD ${r(res.sinkTD, 2)} m/s (${r(res.sinkTD_fpm, 0)} fpm)` +
    (res.sRet !== null ? `; RETARD at s=${r(res.sRet, 0)} m, ${r(res.tRet, 2)} s after flare` : ''));
}
const B = TYPES.b737_800, A = TYPES.a320ceo, H3 = TYPES.a330_300;
for (const lag of [0, 1.0]) {
  report(`737 L1v(50ft) lag${lag}`, simulate({ vg: B.vapp * KT, H: B.H, sw: B.sw, ...L1v(B.vapp * KT), lag, retardFt: 27, retardDt: 2.5 }));
  report(`737 L1(K.205) lag${lag}`, simulate({ vg: B.vapp * KT, H: B.H, sw: B.sw, ...L1(), lag }));
  report(`A320 L2 lag${lag}`, simulate({ vg: A.vapp * KT, H: A.H, sw: A.sw, ...L2(), lag, retardFt: 10 }));
  report(`A330 L2 lag${lag}`, simulate({ vg: H3.vapp * KT, H: H3.H, sw: H3.sw, ...L2(), lag, retardFt: 10 }));
  report(`trainer L3 lag${lag}`, simulate({ vg: 75 * KT, H: 1.0, sw: rw.aim - 1.0 / tan3, ...L3(), lag }));
}

// ---------- 4. Patent check: flare height at 125 kt and sensitivity to +-15 kt ----------
console.log('\n== 4. Patent 4,354,237 prior-art law check (K=0.205, hB=12 ft, 3 deg) ==');
for (const kt of [110, 125, 140]) {
  const res = simulate({ vg: kt * KT, H: B.H, sw: B.sw, ...L1() });
  const resV = simulate({ vg: kt * KT, H: B.H, sw: B.sw, ...L1v(kt * KT, 42) });
  console.log(`VG ${kt} kt: prior-art flare ${r(res.hF_ft, 2)} ft, TD s=${r(res.sTD / FT, 0)} ft; V*tau-const (42 ft) flare ${r(resV.hF_ft, 2)} ft, TD ${r(resV.sTD / FT, 0)} ft`);
}

// ---------- 5. Statistics for certification-style tests ----------
// one-sided normal quantile for p (Acklam rational approximation; checked against known 1e-6 -> 4.753)
function zq(p) {
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const q = Math.sqrt(-2 * Math.log(p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}
console.log('\n== 5. Normal quantiles for certification probabilities (one-sided) ==');
for (const p of [0.05, 0.025, 1e-5, 1e-6, 1e-7, 1e-8]) console.log(`p=${p}: z=${r(zq(p), 3)}`);
// Envelope limits (CS-AWO 131 / AC 20-191): early 60 m, late 823 m, outboard gear 21.3 m, sink 10 ft/s
const z6 = zq(1e-6);
for (const [k, T] of Object.entries(TYPES)) {
  const latCG = 21.3 - T.track / 2 - 0.3;  // 0.3 m half tyre width (est)
  console.log(`${k}: max CG lateral offset so outboard tyre <= 21.3 m: ${r(latCG, 2)} m -> sigma_y(1e-6, mean 0) <= ${r(latCG / z6, 2)} m`);
}
const mid = (60 + 823) / 2, half = (823 - 60) / 2;
console.log(`Longitudinal: if mean centred at ${r(mid)} m, sigma_x <= ${r(half / z6, 1)} m for 1e-6 each side`);
console.log(`AC 20-57A 1500 ft total at 2 sigma -> sigma_x <= ${r(1500 * FT / 4, 1)} m; 27 ft at 2 sigma -> sigma_y <= ${r(27 * FT / 2, 2)} m`);
console.log(`Sink limit 10 ft/s = ${r(10 * FT, 3)} m/s; with mean 0.76 m/s -> sigma_sink <= ${r((10 * FT - 0.76) / z6, 3)} m/s`);
console.log(`DIALS 10 landings: mean 2.4 ft/s = ${r(2.4 * FT, 3)} m/s, SD 0.7 ft/s = ${r(0.7 * FT, 3)} m/s`);
console.log(`SRVSOP success: 150..750 m, 360 fpm = ${r(360 * FT / 60, 3)} m/s, bank 7 deg, rollout 8 m`);

// ---------- 6. Unit conversions used in JSON ----------
console.log('\n== 6. Height conversions (ft -> m) ==');
console.log([1500, 1000, 800, 700, 500, 400, 350, 300, 250, 200, 160, 150, 100, 80, 60, 50, 45, 40, 30, 27, 20, 15, 10, 2].map((h) => `${h} ft=${r(h * FT, 2)} m`).join(', '));
console.log(`2.5 ft/s = ${r(2.5 * FT, 3)} m/s; 64 kt = ${r(64 * KT, 2)} m/s; 84 kt=${r(84 * KT, 2)} m/s; 40 kt=${r(40 * KT, 2)} m/s; 30 kt=${r(30 * KT, 2)} m/s`);
console.log(`winds: 10 kt=${r(10 * KT, 2)}, 15 kt=${r(15 * KT, 2)}, 17 kt=${r(17 * KT, 2)}, 20 kt=${r(20 * KT, 2)}, 25 kt=${r(25 * KT, 2)}, 29 kt=${r(29 * KT, 2)}, 30 kt=${r(30 * KT, 2)}, 35 kt=${r(35 * KT, 2)} m/s`);

// ---------- 7. Position of thrust-idle (30 ft) during the ideal Airbus flare (added for table 3.9.8) ----------
console.log('\n== 7. Airbus thrust idle at 30 ft inside the flare (21R, lag 0 / lag 1 s) ==');
for (const lag of [0, 1.0]) {
  const a = simulate({ vg: A.vapp * KT, H: A.H, sw: A.sw, ...L2(), lag, retardFt: 30 });
  const b = simulate({ vg: H3.vapp * KT, H: H3.H, sw: H3.sw, ...L2(), lag, retardFt: 30 });
  console.log(`lag ${lag}: A320 30 ft at s=${r(a.sRet, 0)} m (${r(a.tRet, 2)} s after flare); A330 30 ft at s=${r(b.sRet, 0)} m (${r(b.tRet, 2)} s)`);
}
