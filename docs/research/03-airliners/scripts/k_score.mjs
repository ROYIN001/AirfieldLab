// k_score.mjs — proposed per-type touchdown score + event detectors (topic 3.10, prefix K). Pure JS, DOM-free.
// Weights keep today's Evaluator (sink 40, position 25, centreline 15, speed 10, attitude 10); thresholds come from
// the per-type `ops` JSON of this topic. All thresholds marked est in the report.
const lerp = (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t));
export const PROFILES = {
  // hardNz: Boeing AMM 2.2 g (ATSB AO-2023-010 [K58]); Airbus LOAD<15> 2.6 g or RALR -9 ft/s (AAIB 6/2009 [K57]);
  // ATR: no public AMM g threshold found -> sink 600 fpm gear design (ATSB AO-2017-111 [K23]), nz 2.0 est.
  b737_800: { refName: 'Vref', tdSpd: [-8, 5], pitchTD: [3.5, 7.0], pitchCall: 8.0, tailComp: 9.0, tailExt: 11.0, bankLim: 10, hardNz: 2.2, hardSinkFps: 10 },
  a320ceo: { refName: 'VREF(VLS FULL)', tdSpd: [-8, 5], pitchTD: [4.5, 8.0], pitchCall: 10.0, tailComp: 11.7, tailExt: 13.5, bankLim: 10, hardNz: 2.6, hardSinkFps: 9 },
  a321neo: { refName: 'VREF(VLS FULL)', tdSpd: [-8, 5], pitchTD: [4.5, 7.5], pitchCall: 7.5, tailComp: 9.7, tailExt: 11.2, bankLim: 10, hardNz: 2.6, hardSinkFps: 9 },
  a330_300: { refName: 'VREF(VLS FULL)', tdSpd: [-8, 5], pitchTD: [3.5, 7.5], pitchCall: 8.5, tailComp: 10.4, tailExt: 13.7, bankLim: 10, hardNz: 2.6, hardSinkFps: 9 },
  atr72_600: { refName: 'VAPP', tdSpd: [-12, -2], pitchTD: [2.0, 5.5], pitchCall: 5.5, tailComp: 5.9, tailExt: 8.0, bankLim: 8, hardNz: 2.0, hardSinkFps: 10 },
};
// hard-landing classifier (maintenance-report style): flag if peak nz > hardNz or sink > hardSinkFps
export function hardLanding(p, nzPeak, sinkFps) {
  const r = [];
  if (nzPeak > p.hardNz) r.push('nz');
  if (sinkFps > p.hardSinkFps) r.push('sink');
  return { flag: r.length > 0, reasons: r };
}
export function tailLimit(p, comp) { return p.tailExt - (p.tailExt - p.tailComp) * Math.max(0, Math.min(1, comp)); }
export function score(td, ev, p) {
  const parts = [];
  const sink = td.sinkFpm;
  // sink: full to 240 fpm (4 ft/s), 30 at 360 fpm (6 ft/s, 25.473 at MTOW), 10 at 600 fpm (10 ft/s, 25.473 at MLW), 0 above
  const pS = sink <= 240 ? 40 : sink <= 360 ? lerp(40, 30, (sink - 240) / 120) : sink <= 600 ? lerp(30, 10, (sink - 360) / 240) : 0;
  parts.push(['sink', pS, 40]);
  const d = td.dist; // m from threshold
  const pP = d < 0 || d > 900 ? 0 : (d >= 300 && d <= 600) ? 25 : (d >= 220 && d <= 750) ? 18 : 10;
  parts.push(['pos', pP, 25]);
  const cl = Math.abs(td.cl);
  parts.push(['cl', cl <= 2 ? 15 : cl <= 5 ? 12 : cl <= 10 ? 6 : 0, 15]);
  const dv = td.ias - td.vref;
  parts.push(['spd', dv >= p.tdSpd[0] && dv <= p.tdSpd[1] ? 10 : dv >= p.tdSpd[0] - 5 && dv <= p.tdSpd[1] + 7 ? 6 : 2, 10]);
  const pit = td.pitch >= p.pitchTD[0] && td.pitch <= p.pitchTD[1] ? 3 : 1;
  const bank = Math.abs(td.bank) <= 2 ? 3 : Math.abs(td.bank) <= 5 ? 1.5 : 0;
  const crab = Math.abs(td.crab) <= 2 ? 2 : Math.abs(td.crab) <= 5 ? 1 : 0;
  const drift = Math.abs(td.drift) <= 0.8 ? 2 : Math.abs(td.drift) <= 1.6 ? 1 : 0;
  parts.push(['att', pit + bank + crab + drift - (td.noseFirst ? 5 : 0), 10]);
  let total = parts.reduce((s, x) => s + Math.max(0, x[1]), 0);
  const caps = [];
  const cap = (k, c) => { caps.push(k); total = Math.min(total, c); };
  if (ev.tailstrike) cap('tailstrike', 25);
  if (ev.podstrike) cap('pod/wingtip', 30);
  if (sink > 600 || (ev.nzPeak ?? 1) > p.hardNz) cap('hard', 35);
  if (ev.bounceHigh) cap('high bounce', 40);
  else if (ev.bounce) total -= 10;
  if (d > 900) cap('long', 50);
  if (ev.unstable) total -= 10;
  if (ev.duckUnder) total -= 5;
  if (ev.float) total -= 5;
  if (ev.pitchCall) total -= 5;
  total = Math.max(0, Math.round(total));
  return { total, parts, caps };
}
// --- event detectors on a time series of samples {t, hw (wheel height m), wow (bool), theta (deg), comp (0..1), gsDots, h (ft)}
export function detect(samples, p, { flareFt = 20, floatMax = 8 } = {}) {
  const ev = { bounce: false, bounceHigh: false, tailstrike: false, float: false, duckUnder: false, pitchCall: false };
  let firstWow = null, airAfter = 0, maxHairAfter = 0, flareStart = null, at200 = null;
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i], dt = i ? s.t - samples[i - 1].t : 0;
    if (flareStart === null && s.hw < flareFt * 0.3048) flareStart = s.t;
    if (at200 === null && s.h < 200) at200 = s.gsDots;
    if (s.h < 200 && at200 !== null && Math.abs(at200) <= 0.5 && s.gsDots > 1 && !firstWow) ev.duckUnder = true; // +dots = below path
    if (s.h < 100 && !firstWow && s.theta > p.pitchCall) ev.pitchCall = true;
    if (s.wow && firstWow === null) firstWow = s.t;
    if (firstWow !== null && !s.wow) { airAfter += dt; maxHairAfter = Math.max(maxHairAfter, s.hw); }
    if (s.wow && s.theta >= tailLimit(p, s.comp)) ev.tailstrike = true;
  }
  if (airAfter > 0.5 && maxHairAfter > 0.3) ev.bounce = true;
  if (maxHairAfter > 1.5) ev.bounceHigh = true;
  if (flareStart !== null && firstWow !== null && firstWow - flareStart > floatMax) ev.float = true;
  return ev;
}
// ---------------- tests (expected values quoted in the report) ----------------
const P = PROFILES, res = [];
const nominal = score({ sinkFpm: 150, dist: 450, cl: 1, ias: 132, vref: 134, pitch: 5.0, bank: 1, crab: 1, drift: 0.2 }, {}, P.b737_800);
res.push(`T1 737 nominal: ${nominal.total}`);
const ja = score({ sinkFpm: 100, dist: 420, cl: 1, ias: 135, vref: 134, pitch: 6.0, bank: 0.5, crab: 0.5, drift: 0.1 }, { bounce: true, tailstrike: true, nzPeak: 2.4 }, P.b737_800);
res.push(`T2 JA56AN-like: ${ja.total} caps ${ja.caps}`);
const af = score({ sinkFpm: 400, dist: 500, cl: 2, ias: 130, vref: 136, pitch: 8.4, bank: 1, crab: 2, drift: 0.5 }, { bounce: true, nzPeak: 1.9, pitchCall: true }, P.a321neo);
res.push(`T3 F-GTAT-like A321: ${af.total} caps ${af.caps}`);
const fvz = score({ sinkFpm: 928, dist: 400, cl: 1, ias: 105, vref: 113, pitch: 6.0, bank: 0, crab: 0, drift: 0 }, { nzPeak: 2.97 }, P.atr72_600);
res.push(`T4 VH-FVZ-like ATR: ${fvz.total} caps ${fvz.caps}`);
const long = score({ sinkFpm: 150, dist: 1000, cl: 1, ias: 131, vref: 134, pitch: 5, bank: 0, crab: 0, drift: 0 }, {}, P.b737_800);
res.push(`T5 long landing 1000 m: ${long.total} caps ${long.caps}`);
const xw = score({ sinkFpm: 200, dist: 450, cl: 1, ias: 136, vref: 134, pitch: 5, bank: 6, crab: 7, drift: 1.0 }, {}, P.a320ceo);
res.push(`T6 crosswind bank 6 crab 7: ${xw.total} att ${xw.parts[4][1]}`);
// detectors: synthetic series
const ser = [];
for (let t = 0; t <= 14; t += 0.1) { // 3 s approach, flare starting 20 ft at t=3, wheels touch at t=12 (9 s float)
  const hw = t < 3 ? 6.1 + (3 - t) * 3.8 : t < 12 ? Math.max(0, 6.1 * (1 - (t - 3) / 9)) : 0;
  ser.push({ t, hw, wow: t >= 12, theta: 5, comp: t >= 12 ? 0.6 : 0, gsDots: 0, h: hw / 0.3048 + 10 });
}
res.push(`T7 float detector: ${JSON.stringify(detect(ser, P.b737_800))}`);
const ser2 = ser.map((s) => ({ ...s, theta: s.wow ? 10.5 : s.theta, comp: s.wow ? 1 : 0 }));
res.push(`T8 tailstrike 10.5° compressed 737: ${detect(ser2, P.b737_800).tailstrike}; limit at comp 0.5 = ${tailLimit(P.b737_800, 0.5)}`);
const ser3 = []; // bounce: touch at 5 s, airborne 5.2-6.4 s up to 0.6 m
for (let t = 0; t <= 8; t += 0.1) { const air = t > 5.15 && t < 6.4; const hw = t < 5 ? (5 - t) * 0.8 : air ? 0.6 * Math.sin(Math.PI * (t - 5.15) / 1.25) : 0; ser3.push({ t, hw, wow: !air && t >= 5, theta: 5, comp: 0.5, gsDots: 0, h: 50 }); }
res.push(`T9 bounce: ${JSON.stringify(detect(ser3, P.b737_800))}`);
const ser4 = []; // duck-under: on path at 200 ft, then 1.4 dots low at 80 ft
for (let h = 260; h >= 0; h -= 5) ser4.push({ t: (260 - h) / 12, hw: h * 0.3048 - 3, wow: h === 0, theta: 3, comp: 0, gsDots: h > 120 ? 0.1 : 1.4, h });
res.push(`T10 duck-under: ${detect(ser4, P.b737_800).duckUnder}`);
const HL = [
  ['G-DHJH A321 LOAD15 2.65 g -11.5 ft/s', P.a321neo, 2.65, 11.5],
  ['F-GTAT A321 1st TD 1.9 g 400 fpm', P.a321neo, 1.9, 400 / 60],
  ['VH-YQR 737-8 2nd TD 2.96 g', P.b737_800, 2.96, 8],
  ['VH-YQR comparison flight 1.94 g', P.b737_800, 1.94, 6],
  ['JA56AN 737-800 2.4 g', P.b737_800, 2.4, 9],
  ['VT-JTD 737-800 2.79 g', P.b737_800, 2.79, 9],
  ['VH-FVZ ATR 2.97 g 928 fpm', P.atr72_600, 2.97, 928 / 60],
];
for (const [n, p, nz, fps] of HL) { const h = hardLanding(p, nz, fps); res.push(`T11 ${n}: hard=${h.flag} (${h.reasons})`); }
const a330 = score({ sinkFpm: 180, dist: 480, cl: 1.5, ias: 136, vref: 138, pitch: 5.0, bank: 1, crab: 1, drift: 0.3 }, {}, P.a330_300);
res.push(`T12 A330 nominal: ${a330.total}`);
console.log(res.join('\n'));
