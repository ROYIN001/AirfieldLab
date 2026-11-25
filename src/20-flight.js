// ───────────────────────── Flight model (pure, no DOM / three.js) ─────────────────────────
// Frames: world NED (north, east, down) with origin at the runway centre on the ground;
// body FRD (x nose, y right wing, z down). Quaternion q = [w,x,y,z] maps body → NED.
// RK4 at 240 Hz, the same integration scheme Orbitlab uses for its rigid-body ascent.

// Ground: physics keeps flat ground at d = 0 at FIELD.elev 2.65 m (AIP AD 2.2, AIRAC 14 MAY 2026; AIRAC 29 OCT 2026
// prints 3 m, kept). The real ground inside the aerodrome is 1.5–2.0 m above MSL (EGM2008; Copernicus DEM GLO-30,
// airport-edited zone median 1.50 m, ARP 1.95 m). The aerodrome elevation is the highest point of the landing area,
// not the ground at the ARP, and relief within 10 km is smaller than the DEM's accuracy (LE90 1.69–1.91 m) [I2][I12],
// so no DEM mesh (research round 5, 05-airport-city/5c-city.md §9 "สิ่งที่ Claude Code ควรทำ" item 7).
const FIELD = {
  name: 'ท่าอากาศยานดอนเมือง (VTBD)', lat: ARP.lat, lon: ARP.lon, tzH: 7, elev: ARP.elev,
  rwy: '21R', rwyHdg: 209, rwyLen: 3700, rwyWid: 60,
  aim: 314,          // glide-path origin: RDH / tan 3°, metres past the landing threshold
  gs: 3.0,           // glide slope, degrees
  locBeyond: 300,    // localizer array beyond the stop end (derived per runway from AIP coordinates)
  locDot: 0.75,      // degrees per dot (2 dots full scale), set per runway from the localizer distance
  gsDot: 0.36,       // degrees per dot: 0.12 θ for θ = 3° (ICAO Annex 10 glide-path sensitivity, 2 dots full scale)
  appr: 'ILS', ident: 'IBKK',
};
// Default weather of a Flight when nothing else sets it (B10 WeatherState will): VTBD METAR statistics 2016–2025 from
// the Iowa Environmental Mesonet METAR archive (https://mesonet.agron.iastate.edu, summary numbers only, 04-weather.md
// §2.1 and §11), in docs/research/data/vtbd-metar-climo.json (04-weather.md §13 item 15; owner's decision
// OD-WX-DEFAULTS in the development plan). OAT 31 °C is the earlier code default (04-weather.md §5.6). ค่าประมาณ:
// a typical day, not a measured one. QNH = annual mean of the 174,872 routine reports (monthly qnh_mean weighted by
// n: 1009.3 hPa; monthly 1006.6–1012.4); dew point = annual mean at 11 LT (hourly.Td_mean weighted by n: 22.8 °C),
// the hour whose annual mean temperature (31.4 °C) is nearest the default OAT 31 °C (04-weather.md §5.6) and the
// training's "กลางวัน" time. new Flight({ qnh: 1013.25, dewC: null }) gives the old dry ISA air; qnh null
// = 1013.25 hPa (e.g. a METAR without a Q group), dewC null = dry air; a left-out option takes WX_DEFAULT.
const WX_DEFAULT = { oatC: 31, qnh: 1009.3, dewC: 22.8 };
// Active landing runway frame (NED): unit vector along the landing direction, right normal, threshold.
const RWY_U = [1, 0, 0];
const RWY_R = [0, 1, 0];
const THR03 = [0, 0, 0];
// PAPI on both sides of the landing threshold (geometry PAPI_GEOM in 15-geo.js; the left bank drives the widget).
const PAPI = { s: 400, h: PAPI_GEOM.h, units: [] };
function setActiveRunway(id) {
  const E = RWY_END[id] || RWY_END['21R'];
  FIELD.rwy = E.id; FIELD.rwyHdg = E.hdg; FIELD.rwyLen = E.lda; FIELD.rwyWid = E.w;
  FIELD.aim = E.aim; FIELD.locBeyond = E.locDist - E.lda; FIELD.appr = E.appr.kind; FIELD.ident = E.appr.ident;
  // ILS course sector 210 m wide at the threshold (ICAO Annex 10 §3.1.3.7; AIP course widths 3.0°/3.0°/3.6° match):
  // full scale (2 dots) is atan(105 m / threshold-to-localizer distance), so 1 dot is 0.75° on 21R/03L and 0.89° on 21L.
  FIELD.locDot = E.appr.kind === 'ILS' ? Math.atan(105 / E.locDist) * RAD / 2 : 0.8;
  RWY_U[0] = E.u[0]; RWY_U[1] = E.u[1]; RWY_R[0] = -E.u[1]; RWY_R[1] = E.u[0];
  THR03[0] = E.thr[0]; THR03[1] = E.thr[1];
  PAPI.s = E.papi;
  const W2 = E.w / 2;
  PAPI.units = PAPI_GEOM.off.map((o, i) => ({ t: -(W2 + o), ang: PAPI_GEOM.ang[i] }));
  if (typeof globalThis !== 'undefined' && typeof globalThis.__onRwy === 'function') globalThis.__onRwy(E);
  return E;
}
setActiveRunway('21R');

function rwyLocal(n, e) { const dn = n - THR03[0], de = e - THR03[1]; return [dn * RWY_U[0] + de * RWY_U[1], dn * RWY_R[0] + de * RWY_R[1]]; }
function rwyToNED(s, t) { return [THR03[0] + RWY_U[0] * s + RWY_R[0] * t, THR03[1] + RWY_U[1] * s + RWY_R[1] * t]; }
function gpHeight(s) { return (FIELD.aim - s) * Math.tan(FIELD.gs * DEG); }

function ilsAt(n, e, h) {
  const [s, t] = rwyLocal(n, e);
  const gsAng = Math.atan2(h, Math.max(FIELD.aim - s, 1)) * RAD;
  const locAng = Math.atan2(t, FIELD.rwyLen + FIELD.locBeyond - s) * RAD;
  return { s, t, gsDev: gsAng - FIELD.gs, gsDots: (gsAng - FIELD.gs) / FIELD.gsDot, locAng, locDots: locAng / FIELD.locDot };
}

// Fraction of white for each PAPI unit as seen from the pilot's eye (n, e, height), left→right as the pilot sees
// them: outer (2°30′) … inner (3°30′). The colour edge (±0.025°) matches the light shader in 60-lights.js.
function papiSeen(n, e, h) {
  const [s, t] = rwyLocal(n, e);
  const out = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    const u = PAPI.units[3 - i];
    const d = Math.hypot(PAPI.s - s, u.t - t);
    const ang = Math.atan2(h - PAPI.h, d) * RAD;
    out[i] = (s > PAPI.s) ? -1 : smoothstep(u.ang - 0.025, u.ang + 0.025, ang);
  }
  return out;
}

// ── Seeded random numbers (mulberry32) and Gaussian noise ──
function makeRng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function gauss(r) { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }

// ── Wind: mean wind with a log-law profile (shear on final) + Dryden turbulence, MIL-F-8785C low-altitude form
//    (σw = 0.1·W20, length scales from height), its intensity W20 set apart from the mean wind. ──
// Mean wind (plan A9; research round 4, 04-weather.md §6.3, §9.1, §13 item 3; round 1 R1-19, 01-flight-physics/08-wind.md
// §8.7, §8.13 wind.meanProfile): neutral log law U(h) = U10·ln(h/z0)/ln(10/z0) from the reported wind at 10 m (zRef,
// WMO-No. 8 §5.9, conf. low), clipped to z0 … 300 m (profileTop_m, ค่าประมาณ). z0 = 0.05 m (ค่าประมาณ, round 1
// z0_default_VTBD_m; 04-weather.md §9.1 keeps it so there is one value; MIL-F-8785C Cat. C 0.046 m, WMO class 3 grass
// 0.03 m). The old 1/7-power rule (law 'power', 1/7 ≡ log law at z0 = 10·e⁻⁷ = 0.009 m, §8.7) stays for WND-5.
const WIND_PROFILE = { z0: 0.05, zRef: 10, top: 300 };
function logLaw(h, z0, d = 0, zRef = WIND_PROFILE.zRef) { return Math.log((h - d) / z0) / Math.log((zRef - d) / z0); }
// Turbulence intensity W20 (kt): the MIL-F-8785C wind at 20 ft, light 15 · moderate 30 · severe 45 kt (04-weather.md §6.4,
// 08-wind.md §8.3), given apart from the mean wind so calm air can be turbulent (WND-10; round 1 §8.17 item 1). A wind
// with no W20 keeps the old coupling, turb × the 1/7-law wind at 6.1 m = turb·0.932·kt (08-wind.md §8.1).
const W20_PER_KT_LEGACY = Math.pow(0.61, 1 / 7);
// the W20 a wind spec stands for: its own W20 (0 included; null or absent = none given), else the old coupling
const windW20 = ({ W20 = null, turb = 0, kt = 0 } = {}) => W20 ?? (turb || 0) * (kt || 0) * W20_PER_KT_LEGACY;
// 3 s gust over the 10 min mean at 10 m by exposure (04-weather.md §6.4 and §9 wind.gustFactor_3s_10min, Harper, Kepert &
// Ginger AMS 2008 draft, later WMO/TD-1555; conf. medium, a draft; WND-7). Nothing reads it yet: for B10/B11's METAR gusts.
const GUST_FACTOR_3S = { inLand: 1.66, offLand: 1.52, offSea: 1.38, atSea: 1.23 };
class Wind {
  constructor({ fromDeg = 0, kt = 0, W20 = null, turb = 0, seed = 7, z0 = null, law = 'log' } = {}) {
    // z0 null or absent = the default (as qnh and W20); outside 0 < z0 < zRef the log law gives NaN, ∞ or a negative wind
    this.z0 = z0 ?? WIND_PROFILE.z0;
    if (!(this.z0 > 0 && this.z0 < WIND_PROFILE.zRef)) throw new RangeError(`Wind z0 ${z0} m outside (0, ${WIND_PROFILE.zRef})`);
    this.fromDeg = fromDeg; this.kt = kt; this.law = law;
    this.W20 = windW20({ W20, turb, kt });
    // the old turb that gives this W20 (0 with no mean wind), kept only for scripts that rebuild a Wind from w.turb
    // (01-flight-physics/scripts/s9_turbclock.mjs); nothing in src reads it
    this.turb = kt > 0 ? this.W20 / (kt * W20_PER_KT_LEGACY) : 0;
    this.rng = makeRng(seed); this.g = [0, 0, 0];
  }
  speedAt(h) {
    const W10 = this.kt * KT;
    return this.law === 'power' ? W10 * Math.pow(clamp(h, 0.3, 300) / 10, 1 / 7) : W10 * logLaw(clamp(h, this.z0, WIND_PROFILE.top), this.z0);
  }
  mean(h) { const w = this.speedAt(h), a = this.fromDeg * DEG; return [-w * Math.cos(a), -w * Math.sin(a), 0]; }
  // MIL-F-8785C low altitude (08-wind.md §8.3; WND-8, WND-9): h in ft clipped to 10…1000, W20 in kt → σ m/s, L m
  static lowAlt(hft, W20) {
    const h = clamp(hft, 10, 1000), k = 0.177 + 0.000823 * h, sw = 0.1 * W20 * KT;
    return { sw, su: sw / Math.pow(k, 0.4), Lw: h * FT, Lu: h / Math.pow(k, 1.2) * FT };
  }
  update(dt, h, V, hdg) {
    if (!(this.W20 > 0)) { this.g[0] = this.g[1] = this.g[2] = 0; return; }
    const P = Wind.lowAlt(h / FT, this.W20), Vt = Math.max(V, 10);
    const step = (x, sig, L) => { const a = Math.exp(-Vt * dt / L); return x * a + sig * Math.sqrt(1 - a * a) * gauss(this.rng); };
    this.g[0] = step(this.g[0], P.su, P.Lu); this.g[1] = step(this.g[1], P.su, P.Lu); this.g[2] = step(this.g[2], P.sw, P.Lw);
    this.hdg = hdg;
  }
  at(h) {
    const m = this.mean(h);
    const c = Math.cos(this.hdg || 0), s = Math.sin(this.hdg || 0);
    return [m[0] + this.g[0] * c - this.g[1] * s, m[1] + this.g[0] * s + this.g[1] * c, this.g[2] * Math.min(1, h / 15)];
  }
}

// ── Generic two-seat turboprop trainer. Non-dimensional derivatives follow textbook light-aircraft
//    data (Nelson, Flight Stability and Automatic Control, App. B, scaled); mass and engine are
//    typical of the class. A fictional aircraft, not any manufacturer's type. ──
const AC = {
  m: 2250, Ixx: 2600, Iyy: 7300, Izz: 9200, Ixz: 120,
  S: 16.3, b: 10.2, c: 1.65,
  CL0: 0.25, CLa: 4.8, CLq: 7.5, CLadot: 1.6, CLde: 0.35, CLflap: 0.55,
  CD0: 0.024, K: 0.062, CDflap: 0.050, CDgear: 0.020,
  CYb: -0.60, CYdr: 0.15, CYr: 0.20,
  Clb: -0.085, Clp: -0.47, Clr: 0.11, Clda: 0.16, Cldr: 0.012,
  Cm0: 0.045, Cma: -0.72, Cmq: -12.5, Cmadot: -4.5, Cmde: -1.15, Cmflap: -0.10,
  Cnb: 0.075, Cnp: -0.055, Cnr: -0.14, Cnda: -0.010, Cndr: -0.072,
  aStall: 17.0, aStallFlap: -2.5,   // blend centre; effective CLmax ≈ 3° below it
  // Stall warning (horn + HUD) set by α, linear in flap like aStall: 10.71° clean, 6.87° landing flaps. Research
  // round 1 design values (docs/research/01-flight-physics/01-aero.md §1.6 and T-A-07, scripts/expected.mjs), about
  // 7 kt above the 1-g stall (6.8–7.3 kt trimmed in this model, test/stall.test.mjs). 14 CFR 23.207(c) [A22] asks
  // for at least 5 kt. Set by α, so V_warn/Vs is the same at any weight and load factor; the knot margin scales
  // with √(n·W) (below about 0.54 W clean or 0.47 W with flaps it would drop under 5 kt; J1 re-checks per type).
  // Release only 0.5° below it and after 0.5 s on (A5 design choice, no source), so a gust spike sounds as a short
  // chirp instead of a click. Onset is immediate, so the margin and the lead time in a fast pull are kept.
  // Estimates (ค่าประมาณ) for this fictional type; per-type values come in plan item J1, D2 re-checks T-A-07.
  aWarn: 10.71, aWarnFlap: -3.84, aWarnHyst: 0.5, aWarnMinOn: 0.5,   // deg, deg per unit flap, deg, s
  P: 700e3, eta: 0.80, T0: 11500, idle: 0.045,
  deUp: 22 * DEG, deDn: 15 * DEG, daMax: 20 * DEG, drMax: 25 * DEG,
  gear: [
    { b: [2.30, 0, 1.36], k: 5.2e4, c: 5.0e3, stroke: 0.22, steer: true },
    { b: [-0.35, -1.55, 1.38], k: 1.25e5, c: 1.25e4, stroke: 0.25, brake: true },
    { b: [-0.35, 1.55, 1.38], k: 1.25e5, c: 1.25e4, stroke: 0.25, brake: true },
  ],
  Vref: 88, Vapp: 95, Vs0: 71,   // knots IAS, landing flaps
  // Body points (FRD, m from the CG). The eye matches the cockpit camera; the glide-slope antenna sits in the lower
  // nose. Both are estimates for this fictional type. ILS deviations use the antenna and PAPI uses the eye
  // (research round 3, topic 3.5): eye 1.3 m above the antenna, close to the ATR 72 (0.9 m) and 737-800 (1.4 m).
  eye: [0.95, 0, -1.0], gsAnt: [2.6, 0, 0.3],
};
(() => { // inverse inertia tensor (FRD, Ixz product)
  const { Ixx, Iyy, Izz, Ixz } = AC, G = Ixx * Izz - Ixz * Ixz;
  AC.Iinv = [Izz / G, 0, Ixz / G, 0, 1 / Iyy, 0, Ixz / G, 0, Ixx / G];
})();

// ── small vector / quaternion helpers ──
function qToR(q, R) {
  const [w, x, y, z] = q;
  R[0] = 1 - 2 * (y * y + z * z); R[1] = 2 * (x * y - w * z); R[2] = 2 * (x * z + w * y);
  R[3] = 2 * (x * y + w * z); R[4] = 1 - 2 * (x * x + z * z); R[5] = 2 * (y * z - w * x);
  R[6] = 2 * (x * z - w * y); R[7] = 2 * (y * z + w * x); R[8] = 1 - 2 * (x * x + y * y);
  return R;
}
const mulR = (R, v) => [R[0] * v[0] + R[1] * v[1] + R[2] * v[2], R[3] * v[0] + R[4] * v[1] + R[5] * v[2], R[6] * v[0] + R[7] * v[1] + R[8] * v[2]];
const mulRT = (R, v) => [R[0] * v[0] + R[3] * v[1] + R[6] * v[2], R[1] * v[0] + R[4] * v[1] + R[7] * v[2], R[2] * v[0] + R[5] * v[1] + R[8] * v[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function eulerToQ(phi, th, psi) {
  const cr = Math.cos(phi / 2), sr = Math.sin(phi / 2), cp = Math.cos(th / 2), sp = Math.sin(th / 2), cy = Math.cos(psi / 2), sy = Math.sin(psi / 2);
  return [cr * cp * cy + sr * sp * sy, sr * cp * cy - cr * sp * sy, cr * sp * cy + sr * cp * sy, cr * cp * sy - sr * sp * cy];
}
function qToEuler(q) {
  const R = qToR(q, new Array(9));
  return [Math.atan2(R[7], R[8]), -Math.asin(clamp(R[6], -1, 1)), Math.atan2(R[3], R[0])];
}
const qMul = (a, b) => [a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3], a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
  a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1], a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0]];

// ── Newton–Raphson for n equations in n unknowns (plan B2; research round 1 task list item 11,
// 01-flight-physics/12-other-sims.md §12.14 task 6 and scripts/s12/s12_solver_proto.mjs; JSBSim's FGTrim and YASim's
// solver also drive the derivatives to zero numerically). Forward-difference Jacobian (step h·max(1, |x_j|)), Gaussian
// elimination with partial pivoting, and the step halved (at most 7 times) while the largest residual does not drop.
// Returns { x, r, rn: max |r_i|, it, ok: rn ≤ tol }. Aircraft.trim uses it, and so can a solver for new types (T-S-06).
function solveLin(A, b) {
  const n = b.length, W = A.map((row, i) => [...row, b[i]]);
  for (let k = 0; k < n; k++) {
    let p = k; for (let i = k + 1; i < n; i++) if (Math.abs(W[i][k]) > Math.abs(W[p][k])) p = i;
    if (!(Math.abs(W[p][k]) > 1e-300)) return null;
    [W[k], W[p]] = [W[p], W[k]];
    for (let i = k + 1; i < n; i++) { const f = W[i][k] / W[k][k]; for (let j = k; j <= n; j++) W[i][j] -= f * W[k][j]; }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = W[i][n]; for (let j = i + 1; j < n; j++) s -= W[i][j] * x[j]; x[i] = s / W[i][i]; }
  return x;
}
function newtonSolve(f, x0, { tol = 1e-9, maxIt = 40, h = 1e-6 } = {}) {
  const n = x0.length, norm = (r) => r.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  let x = x0.slice(), r = f(x), rn = norm(r), it = 0;
  for (; it < maxIt && rn > tol; it++) {
    const J = Array.from({ length: n }, () => new Array(n));
    for (let j = 0; j < n; j++) {
      const xp = x.slice(), d = h * Math.max(1, Math.abs(x[j])); xp[j] += d;
      const rp = f(xp); for (let i = 0; i < n; i++) J[i][j] = (rp[i] - r[i]) / d;
    }
    const dx = solveLin(J, r.map((v) => -v));
    if (!dx || !dx.every(Number.isFinite)) break;
    let lam = 1, xn = x, rnew = r, nn = Infinity;
    for (let k = 0; k < 8; k++, lam /= 2) { xn = x.map((v, i) => v + lam * dx[i]); rnew = f(xn); nn = norm(rnew); if (nn < rn) break; }
    if (!(nn < rn)) break;   // no descent along the Newton step: stop (ok false unless already within tol)
    x = xn; r = rnew; rn = nn;
  }
  return { x, r, rn, it, ok: rn <= tol };
}

// Thrust from TAS only, so humid air and QNH (A8) reach it through V at a given IAS. No ρ term yet: shaft power is flat
// rated to 37 °C (01-flight-physics/04-turboprop.md), and the static term (AC.T0 is the BEM value at ρ 1.160, dry 31 °C;
// ≈ρ^(1/3) by momentum theory, steeper in the BEM of 03-propeller.md §3.2 and T-P-02: −0.5 % to −1.8 % in WX_DEFAULT)
// waits for the propeller model (01-flight-physics.md task list), which takes its air from Aircraft.atm(h).
function thrustAvail(V) { const Vc = AC.eta * AC.P / AC.T0; return AC.T0 * Vc / Math.sqrt(V * V + Vc * Vc); }
function stallBlend(a, a0) { // Beard & McLain blending: 0 attached flow, 1 separated
  const M = 55, e1 = Math.exp(-M * (a - a0)), e2 = Math.exp(M * (a + a0));
  return (1 + e1 + e2) / ((1 + e1) * (1 + e2));
}

// ── The vehicle ──
class Aircraft {
  constructor() {
    this.x = new Float64Array(13);   // n e d | vn ve vd | qw qx qy qz | p q r
    this.R = new Array(9);
    this.de = 0; this.da = 0; this.dr = 0; this.flaps = 1; this.gearPos = 1; this.thr = 0.3; this.steer = 0; this.brake = 0;
    this.cmd = { de: 0, da: 0, dr: 0, flaps: 1, gear: 1, thr: 0.3, brake: 0, steer: 0 };
    this.adot = 0; this.aPrev = null; this.t = 0;
    this.wow = [false, false, false]; this.gearLoad = [0, 0, 0];
    this.isaDev = 0; this.qnh = P0_HPA; this.dewC = null; this.wind = new Wind();   // ISA, dry, until a Flight sets the weather
    this.k = [0, 1, 2, 3].map(() => new Float64Array(13)); this.tmp = new Float64Array(13);
    this.air = {};
  }

  // air at height h above the field: QNH, ISA lapse + isaDev, dew point measured at the field (04-weather.md §6.1–6.2)
  atm(h) { return atmosphere(FIELD.elev + h, this.isaDev, this.qnh, this.dewC, FIELD.elev); }

  // all forces / moments for state vector s; fills out with derivatives
  deriv(s, out, diag) {
    const q = [s[6], s[7], s[8], s[9]], R = qToR(q, this.R);
    const w = [s[10], s[11], s[12]];
    const h = -s[2];
    const wind = this.wind.at(h);
    const vab = mulRT(R, [s[3] - wind[0], s[4] - wind[1], s[5] - wind[2]]);
    const V = Math.max(Math.hypot(vab[0], vab[1], vab[2]), 0.1);
    const alpha = Math.atan2(vab[2], vab[0]), beta = Math.asin(clamp(vab[1] / V, -1, 1));
    const atm = this.atm(h);
    const qbar = 0.5 * atm.rho * V * V;
    const f = this.flaps;
    const hw = Math.max(0.2, h - 0.35);                       // wing height above ground
    const ge = (16 * hw / AC.b) ** 2; const phiGE = ge / (1 + ge);
    const a0 = (AC.aStall + AC.aStallFlap * f) * DEG;
    const sig = stallBlend(alpha, a0);
    const ph = w[0] * AC.b / (2 * V), qh = w[1] * AC.c / (2 * V), rh = w[2] * AC.b / (2 * V);
    const adh = this.adot * AC.c / (2 * V);
    const CLlin = AC.CL0 + AC.CLflap * f + AC.CLa * (1 + 0.12 * (1 - phiGE)) * alpha + AC.CLq * qh + AC.CLadot * adh + AC.CLde * this.de;
    const sa = Math.sin(alpha), ca = Math.cos(alpha);
    const CL = (1 - sig) * CLlin + sig * 2 * Math.sign(alpha) * sa * sa * ca;
    const CDlin = AC.CD0 + AC.CDflap * Math.pow(f, 1.5) + AC.CDgear * this.gearPos + AC.K * phiGE * (CLlin - 0.15) ** 2 + 0.25 * beta * beta;
    const CD = (1 - sig) * CDlin + sig * (AC.CD0 + 1.6 * sa * sa);
    const CY = AC.CYb * beta + AC.CYdr * this.dr + AC.CYr * rh;
    const Cl = AC.Clb * beta + AC.Clp * ph + AC.Clr * rh + AC.Clda * this.da + AC.Cldr * this.dr;
    const Cm = AC.Cm0 + AC.Cmflap * f + AC.Cma * alpha + AC.Cmq * qh + AC.Cmadot * adh + AC.Cmde * this.de
      - 0.06 * (1 - phiGE) - sig * 0.25 * Math.max(0, alpha - a0);
    const Cn = AC.Cnb * beta + AC.Cnp * ph + AC.Cnr * rh + AC.Cnda * this.da + AC.Cndr * this.dr;

    // lift ⟂ relative wind in the symmetry plane, drag along it, side force along body y
    const wh = [vab[0] / V, vab[1] / V, vab[2] / V];
    let lv = cross([0, 1, 0], wh); const ll = Math.hypot(lv[0], lv[1], lv[2]) || 1; lv = [lv[0] / ll, lv[1] / ll, lv[2] / ll];
    const L = qbar * AC.S * CL, D = qbar * AC.S * CD, Y = qbar * AC.S * CY;
    const T = this.thr * thrustAvail(V);
    const Fb = [L * lv[0] - D * wh[0] + T, L * lv[1] - D * wh[1] + Y, L * lv[2] - D * wh[2]];
    const Mb = [qbar * AC.S * AC.b * Cl, qbar * AC.S * AC.c * Cm, qbar * AC.S * AC.b * Cn];

    let Fn = mulR(R, Fb);
    // landing gear: spring-damper struts with rolling, braking and side friction
    for (let i = 0; i < 3; i++) {
      const g = AC.gear[i];
      if (this.gearPos < 0.98) { if (diag) { diag.wow[i] = false; diag.load[i] = 0; } continue; }
      const cn = mulR(R, g.b);
      const pen = s[2] + cn[2];
      if (pen <= 0) { if (diag) { diag.wow[i] = false; diag.load[i] = 0; } continue; }
      const vrel = cross(w, g.b), vc0 = mulR(R, vrel);
      const vc = [s[3] + vc0[0], s[4] + vc0[1], s[5] + vc0[2]];
      let N = g.k * Math.min(pen, g.stroke) + (pen > g.stroke ? 12 * g.k * (pen - g.stroke) : 0) + g.c * vc[2];
      N = Math.max(0, N);
      const st = g.steer ? this.steer : 0;
      const fw = mulR(R, [Math.cos(st), Math.sin(st), 0]);
      const fl = Math.hypot(fw[0], fw[1]) || 1, fh = [fw[0] / fl, fw[1] / fl], lh = [-fh[1], fh[0]];
      const vl = vc[0] * fh[0] + vc[1] * fh[1], vs = vc[0] * lh[0] + vc[1] * lh[1];
      const mux = 0.022 + (g.brake ? this.brake * 0.55 : 0);
      const Fl = -N * mux * Math.tanh(vl / 0.25), Fs = -N * 0.65 * Math.tanh(vs / 0.35);
      const Fg = [Fl * fh[0] + Fs * lh[0], Fl * fh[1] + Fs * lh[1], -N];
      Fn = [Fn[0] + Fg[0], Fn[1] + Fg[1], Fn[2] + Fg[2]];
      const arm = [g.b[0], g.b[1], g.b[2] - Math.min(pen, g.stroke)];
      const Mg = cross(arm, mulRT(R, Fg));
      Mb[0] += Mg[0]; Mb[1] += Mg[1]; Mb[2] += Mg[2];
      if (diag) { diag.wow[i] = true; diag.load[i] = N; }
    }
    const m = AC.m;
    out[0] = s[3]; out[1] = s[4]; out[2] = s[5];
    out[3] = Fn[0] / m; out[4] = Fn[1] / m; out[5] = Fn[2] / m + G0;
    const Iw = [AC.Ixx * w[0] - AC.Ixz * w[2], AC.Iyy * w[1], AC.Izz * w[2] - AC.Ixz * w[0]];
    const wxIw = cross(w, Iw);
    const rhs = [Mb[0] - wxIw[0], Mb[1] - wxIw[1], Mb[2] - wxIw[2]];
    const Ii = AC.Iinv;
    out[10] = Ii[0] * rhs[0] + Ii[2] * rhs[2]; out[11] = Ii[4] * rhs[1]; out[12] = Ii[6] * rhs[0] + Ii[8] * rhs[2];
    out[6] = 0.5 * (-q[1] * w[0] - q[2] * w[1] - q[3] * w[2]);
    out[7] = 0.5 * (q[0] * w[0] + q[2] * w[2] - q[3] * w[1]);
    out[8] = 0.5 * (q[0] * w[1] + q[3] * w[0] - q[1] * w[2]);
    out[9] = 0.5 * (q[0] * w[2] + q[1] * w[1] - q[2] * w[0]);
    if (diag) Object.assign(diag, { V, alpha, beta, qbar, rho: atm.rho, T, L, D, CL, sig, phiGE, wind });
  }

  actuators(dt) {
    const c = this.cmd, rate = (cur, tgt, r) => cur + clamp(tgt - cur, -r * dt, r * dt);
    this.de = rate(this.de, clamp(c.de, -AC.deUp, AC.deDn), 70 * DEG);
    this.da = rate(this.da, clamp(c.da, -AC.daMax, AC.daMax), 80 * DEG);
    this.dr = rate(this.dr, clamp(c.dr, -AC.drMax, AC.drMax), 60 * DEG);
    this.flaps = rate(this.flaps, clamp(c.flaps, 0, 1), 0.15);
    this.gearPos = rate(this.gearPos, c.gear ? 1 : 0, 1 / 6);
    this.thr += (Math.max(AC.idle, clamp(c.thr, 0, 1)) - this.thr) * (1 - Math.exp(-dt / 1.0));
    this.brake = rate(this.brake, clamp(c.brake, 0, 1), 2.5);
    this.steer = rate(this.steer, clamp(c.steer, -40 * DEG, 40 * DEG), 50 * DEG);
  }

  step(dt) {
    const x = this.x, k = this.k, tmp = this.tmp;
    const h = -x[2];
    this.wind.update(dt, h, this.air.V || 50, Math.atan2(x[4], x[3]));
    this.actuators(dt);
    this.deriv(x, k[0]);
    for (let i = 0; i < 13; i++) tmp[i] = x[i] + 0.5 * dt * k[0][i];
    this.deriv(tmp, k[1]);
    for (let i = 0; i < 13; i++) tmp[i] = x[i] + 0.5 * dt * k[1][i];
    this.deriv(tmp, k[2]);
    for (let i = 0; i < 13; i++) tmp[i] = x[i] + dt * k[2][i];
    this.deriv(tmp, k[3]);
    for (let i = 0; i < 13; i++) x[i] += (dt / 6) * (k[0][i] + 2 * k[1][i] + 2 * k[2][i] + k[3][i]);
    const qn = Math.hypot(x[6], x[7], x[8], x[9]);
    for (let i = 6; i < 10; i++) x[i] /= qn;
    this.t += dt;
    this.updateAir(dt);
  }

  updateAir(dt = 0) {
    const d = { wow: [false, false, false], load: [0, 0, 0] };
    this.deriv(this.x, this.tmp, d);
    if (this.aPrev !== null && dt > 0) this.adot += (clamp((d.alpha - this.aPrev) / dt, -2, 2) - this.adot) * Math.min(1, dt / 0.05);
    this.aPrev = d.alpha;
    const x = this.x, [phi, th, psi] = qToEuler([x[6], x[7], x[8], x[9]]);
    const vg = Math.hypot(x[3], x[4]);
    const R = qToR([x[6], x[7], x[8], x[9]], new Array(9));
    let hWheel = Infinity;
    for (const g of AC.gear) { const c = mulR(R, g.b); hWheel = Math.min(hWheel, -(x[2] + c[2])); }
    const ils = ilsAt(x[0], x[1], -x[2]);
    const pAnt = mulR(R, AC.gsAnt), pEye = mulR(R, AC.eye);
    const ant = ilsAt(x[0] + pAnt[0], x[1] + pAnt[1], -(x[2] + pAnt[2]));
    const a = this.air;
    a.V = d.V; a.ias = d.V * Math.sqrt(d.rho / RHO0); a.alpha = d.alpha; a.beta = d.beta; a.qbar = d.qbar;
    a.phi = phi; a.theta = th; a.psi = psi; a.vs = -x[5]; a.gs = vg; a.track = Math.atan2(x[4], x[3]);
    a.gamma = Math.atan2(-x[5], Math.max(vg, 0.1)); a.h = -x[2]; a.hWheel = hWheel; a.stall = d.sig;
    a.T = d.T; a.CL = d.CL; a.wind = d.wind; a.phiGE = d.phiGE; a.rho = d.rho;
    a.wow = d.wow; a.load = d.load; a.onGround = d.wow[1] || d.wow[2] || d.wow[0];
    a.s = ils.s; a.t = ils.t; a.gsDots = ant.gsDots; a.locDots = ant.locDots;
    a.antS = ant.s; a.antH = -(x[2] + pAnt[2]);
    a.eye = [x[0] + pEye[0], x[1] + pEye[1], -(x[2] + pEye[2])];   // n, e, height of the pilot's eye
    a.p = x[10]; a.q = x[11]; a.r = x[12];
    // Load factor from the specific force in body axes (aero + thrust + gear, no gravity): f_NED = v̇ − [0, 0, g]
    // from the derivative just computed, nz = −(Rᵀf)_z / g (cos θ cos φ in unaccelerated flight, ≈ 1 near level;
    // 1 parked), ny = (Rᵀf)_y / g (+ = to the right, the ball goes left). Research round 1 task list item 5,
    // 06-controls.md §6.7.4 note 4, T-C-01. On the ground both carry gear-model artefacts: the linear gear damper
    // makes nz peak at first contact (07-gear.md §7.0, T-G-06), so it is not yet a hard-landing measure, and ny
    // carries the velocity-based tyre side force (07-gear.md §7.0, §7.12 task 3), 0.2–0.4 g at a crosswind
    // touchdown, so a HUD ball or side-load use on the ground waits for that tyre model too.
    const fb = mulRT(R, [this.tmp[3], this.tmp[4], this.tmp[5] - G0]);
    a.nz = -fb[2] / G0; a.ny = fb[1] / G0;
  }

  // Trimmed, wings-level state on the extended centre line of runway 03
  setApproach({ dist = 5500, ias = AC.Vapp, dh = 0, dt = 0, gearDown = true, flaps = 1 }) {
    const s = -dist, h = Math.max(30, gpHeight(s) + dh);
    const [n, e] = rwyToNED(s, dt);
    this.flaps = this.cmd.flaps = flaps; this.gearPos = gearDown ? 1 : 0; this.cmd.gear = gearDown ? 1 : 0;
    const atm = this.atm(h);
    const tas = ias * KT / Math.sqrt(atm.rho / RHO0);
    const wind = this.wind.mean(h);
    const crs = FIELD.rwyHdg * DEG;
    const wAlong = wind[0] * Math.cos(crs) + wind[1] * Math.sin(crs);
    const wCross = -wind[0] * Math.sin(crs) + wind[1] * Math.cos(crs);
    let gammaA = -FIELD.gs * DEG, psi = crs, vg = tas;
    for (let it = 0; it < 4; it++) {
      const vh = tas * Math.cos(gammaA);
      psi = crs - Math.asin(clamp(wCross / vh, -0.6, 0.6));
      vg = vh * Math.cos(psi - crs) + wAlong;
      gammaA = -Math.asin(clamp(vg * Math.tan(FIELD.gs * DEG) / tas, -0.5, 0.5));
    }
    // the kinematics above (crab into the mean wind, air-path angle for a 3° path over the ground) stay analytic;
    // the force and moment balance is the numerical trim (plan B2), which replaced the linear formula here
    this.brake = this.cmd.brake = 0; this.steer = 0; this.t = 0;
    return this.trim({ h, n, e, tas, gammaA, chi: psi });
  }

  // Numerical trim (plan B2; research round 1 task list item 11, 12-other-sims.md §12.14 task 6, T-S-04): Newton
  // (newtonSolve) on the body-axis accelerations u̇, ẇ and q̇ with unknowns α, δe and throttle, at TAS `tas`, air-path
  // angle `gammaA` and air heading `chi`, wings level with β = 0 and no rotation, so whatever deriv() holds (stall
  // blend, ground effect, thrust along the body axis, and later tables and the propeller) is in balance, not only a
  // linear formula (the old one in setApproach left |a| 0.027 m/s² at the default start, the lift of T·sin α). If the
  // throttle needed is outside idle…1 it is held at that limit and γa becomes the unknown (`limited` 'idle' or 'max';
  // the path then leaves the requested angle). If v̇, ṗ or ṙ are not zero there (asymmetric thrust: propeller torque,
  // P-factor, slipstream, plan F3), a second Newton adds the bank about the velocity μ, aileron and rudder with β held
  // at 0 (a design choice: no source says which of β or bank a trimmed propeller aircraft holds), and the throttle
  // limits are checked again after it; today v̇, ṗ, ṙ are zero by symmetry and that solve is skipped, so the trim stays
  // exactly symmetric. Trims in the mean wind (the Dryden gust state is set aside for the solve and put back). Sets the
  // state, surfaces and throttle and bumps gen (a jump: Flight.renderPose restarts its interpolation, §9.7); flaps and
  // gear are taken as they are. ok is false (why names the reasons) when no root is found, or the root is outside the
  // surface limits, on the wheels or past CLmax; limited and gammaA mean something only when ok. it counts the Newton
  // iterations of every solve.
  trim({ h, n = this.x[0], e = this.x[1], tas, gammaA = 0, chi = 0 }) {
    const wind = this.wind.mean(h), gSave = this.wind.g.slice(), out = new Float64Array(13), R = new Array(9);
    const s = new Float64Array(13);
    // x = [α, δe, thr or γa, μ, δa, δr]; with the throttle held, x[2] is γa
    const thrFix = { v: null };
    const setState = (x) => {
      const al = x[0], gam = thrFix.v == null ? gammaA : x[2], mu = x[3] || 0;
      const q = qMul(eulerToQ(mu, gam, chi), [Math.cos(al / 2), 0, Math.sin(al / 2), 0]);   // wind axes, then α up
      const cg = Math.cos(gam);
      s.set([n, e, -h, tas * cg * Math.cos(chi) + wind[0], tas * cg * Math.sin(chi) + wind[1], -tas * Math.sin(gam) + wind[2], q[0], q[1], q[2], q[3], 0, 0, 0]);
      this.de = x[1]; this.thr = thrFix.v == null ? x[2] : thrFix.v; this.da = x[4] || 0; this.dr = x[5] || 0;
      return q;
    };
    const resid = (x) => {
      const q = setState(x); this.deriv(s, out); qToR(q, R);
      const ab = mulRT(R, [out[3], out[4], out[5]]);   // body accelerations (ω = 0)
      return [ab[0], ab[2], out[11], ab[1], out[10], out[12]];
    };
    // start on the attached-flow branch: linear lift and pitch balance, throttle 0.3
    const atm = this.atm(h), qS = 0.5 * atm.rho * tas * tas * AC.S, f = this.flaps;
    const a0 = (AC.m * G0 * Math.cos(gammaA) / qS - AC.CL0 - AC.CLflap * f) / AC.CLa;
    const x0 = [a0, -(AC.Cm0 + AC.Cmflap * f + AC.Cma * a0) / AC.Cmde, 0.3];
    const lon = (x) => resid(x).slice(0, 3), latOff = (r) => Math.max(Math.abs(r[3]), Math.abs(r[4]), Math.abs(r[5])) > 1e-12;
    const outOfRange = (t) => t < AC.idle || t > 1;
    const holdThrottle = (t) => { limited = t < AC.idle ? 'idle' : 'max'; thrFix.v = limited === 'idle' ? AC.idle : 1; };
    let limited = null, it = 0, sol, x, r;
    const run = (fn, start) => { sol = newtonSolve(fn, start); it += sol.it; return sol.x; };
    this.wind.g[0] = this.wind.g[1] = this.wind.g[2] = 0; this.adot = 0; this.aPrev = null;
    // a converged root is a trim only inside the control limits, with the wheels clear of the ground and on the
    // attached side of the lift curve (dCL/dα > 0): below the stall Newton can otherwise land on a post-stall root
    // or one held up by the nose wheel (review of B2). why lists what failed; [] when ok.
    const why = [], diag = { wow: [], load: [] };
    let q;
    try {
      x = run(lon, x0);
      if (outOfRange(x[2])) { holdThrottle(x[2]); x = run(lon, [x[0], x[1], gammaA]); }
      x = [...x, 0, 0, 0]; r = resid(x);
      if (latOff(r)) {
        x = run(resid, x);
        // the lateral solve moves the throttle too (asymmetric thrust scales with it): check the limits again
        if (thrFix.v == null && outOfRange(x[2])) { holdThrottle(x[2]); x[2] = gammaA; x = run(resid, x); }
        r = resid(x);
      }
      const cl = (d) => { setState([x[0] + d, ...x.slice(1)]); this.deriv(s, out, diag); return diag.CL; };
      const slope = cl(1e-4) - cl(-1e-4);
      q = setState(x); this.deriv(s, out, diag);
      if (!sol.ok) why.push('residual');
      if (this.de < -AC.deUp || this.de > AC.deDn) why.push('elevator');
      if (Math.abs(this.da) > AC.daMax) why.push('aileron');
      if (Math.abs(this.dr) > AC.drMax) why.push('rudder');
      if (diag.wow.some(Boolean)) why.push('ground');
      if (!(slope > 0)) why.push('stalled');
    } finally { this.wind.g[0] = gSave[0]; this.wind.g[1] = gSave[1]; this.wind.g[2] = gSave[2]; }
    this.x.set(s);
    this.cmd.de = this.de; this.cmd.da = this.da; this.cmd.dr = this.dr; this.cmd.thr = this.thr;
    this.updateAir(0); this.gen = (this.gen || 0) + 1;
    const [phi, th, psiE] = qToEuler(q), psi = chi + wrapPi(psiE - chi);   // heading on chi's branch, as before B2
    return { alpha: x[0], de: this.de, thr: this.thr, th, psi, phi, mu: x[3], da: this.da, dr: this.dr,
      gammaA: thrFix.v == null ? gammaA : x[2], limited, residual: Math.max(...r.map(Math.abs)), it, ok: why.length === 0, why };
  }

  // Parked on the ground (used for apron aircraft and resets)
  setParked(n, e, psi) {
    const x = this.x; const q = eulerToQ(0, 0.5 * DEG, psi);
    x.set([n, e, -1.30, 0, 0, 0, q[0], q[1], q[2], q[3], 0, 0, 0]);
    this.thr = this.cmd.thr = 0; this.brake = this.cmd.brake = 1; this.updateAir(0); this.gen = (this.gen || 0) + 1;
  }
}

// ── Autopilot: coupled ILS approach, flare, decrab and rollout ──
class Autopilot {
  constructor(ac, trim) {
    this.ac = ac; this.mode = 'APP';
    this.thrI = trim.thr; this.thBias = trim.th; this.deI = trim.de; this.thCmd = trim.th;
    this.hFlare = 7; this.tTd = null; this.tFlare = null; this.thTd = 0;
    this.out = { phiCmd: 0, gammaCmd: -FIELD.gs * DEG, thCmd: trim.th };
  }
  guidance() {
    const a = this.ac.air, crs = FIELD.rwyHdg * DEG;
    const dTrack = wrapPi(a.track - crs), vg = Math.max(a.gs, 15);
    const tdotCmd = clamp(-a.t / 8, -0.3 * vg, 0.3 * vg);
    const dTrackCmd = Math.asin(clamp(tdotCmd / vg, -0.35, 0.35));
    const eTrk = wrapPi(dTrackCmd - dTrack);
    const lim = a.hWheel < 60 ? 12 : 22;
    const phiCmd = clamp(Math.atan(a.V * eTrk / (G0 * 3.0)), -lim * DEG, lim * DEG);
    const hErr = a.antH - gpHeight(a.antS);   // the receiver flies the beam at the glide-slope antenna
    let gammaCmd = -FIELD.gs * DEG - clamp(0.0028 * hErr, -0.05, 0.05);
    return { phiCmd, gammaCmd, eTrk, dTrackCmd };
  }
  update(dt) {
    const ac = this.ac, a = ac.air, c = ac.cmd, crs = FIELD.rwyHdg * DEG;
    const g = this.guidance();
    let gammaCmd = g.gammaCmd, phiCmd = g.phiCmd;
    const mainsDown = a.wow[1] || a.wow[2];
    if (this.mode === 'APP') {
      this.hFlare = clamp(2.4 * Math.max(a.vs < 0 ? -a.vs : 1.5, 1.5), 4.5, 9);
      if (a.hWheel < this.hFlare && a.s > -600) { this.mode = 'FLARE'; this.tFlare = ac.t; }
    }
    if (this.mode === 'FLARE') {
      const vsCmd = -(0.22 + Math.max(a.hWheel, 0) / 2.4);
      gammaCmd = Math.asin(clamp(vsCmd / Math.max(a.V, 20), -0.2, 0.2));
      if (mainsDown) { this.mode = 'ROLLOUT'; this.tTd = ac.t; this.thTd = a.theta; this.thCmd = a.theta; }
    }
    // lateral
    if (this.mode === 'ROLLOUT' || this.mode === 'STOP') {
      const psiCmd = crs - clamp(0.025 * a.t, -5 * DEG, 5 * DEG);
      const e = wrapPi(a.psi - psiCmd);
      c.dr = clamp(1.4 * e + 0.6 * a.r, -AC.drMax, AC.drMax);
      c.da = clamp(1.2 * (0 - a.phi) - 0.25 * a.p, -AC.daMax, AC.daMax);
    } else {
      c.da = clamp(1.25 * (phiCmd - a.phi) - 0.28 * a.p, -AC.daMax, AC.daMax);
      if (a.hWheel < 11) {
        const e = wrapPi(a.psi - crs);
        const blend = smoothstep(11, 4.5, a.hWheel);
        c.dr = clamp(lerp(-1.6 * a.beta, 1.5 * e + 0.6 * a.r, blend), -AC.drMax, AC.drMax);
      } else c.dr = clamp(-1.6 * a.beta, -AC.drMax, AC.drMax);
    }
    c.steer = (a.wow[0] ? 1 : 0) * clamp(-c.dr / AC.drMax, -1, 1) * lerp(35, 6, clamp(a.gs / 30, 0, 1)) * DEG;
    // longitudinal
    if (this.mode === 'APP' || this.mode === 'FLARE') {
      const kg = this.mode === 'FLARE' ? 2.6 : 1.4;
      this.thBias += (gammaCmd - a.gamma) * (this.mode === 'FLARE' ? 1.4 : 0.55) * dt;
      this.thBias = clamp(this.thBias, -8 * DEG, 14 * DEG);
      this.thCmd = clamp(this.thBias + kg * (gammaCmd - a.gamma), -10 * DEG, 14 * DEG);
      if (a.alpha > (AC.aStall + AC.aStallFlap * ac.flaps - 4) * DEG) this.thCmd = Math.min(this.thCmd, a.theta);
      const e = this.thCmd - a.theta;
      this.deI = clamp(this.deI - 0.6 * e * dt, -AC.deUp, AC.deDn);
      c.de = this.deI - 2.0 * e + 0.85 * a.q;
      if (this.mode === 'APP') {
        const vTgt = lerp(AC.Vref, AC.Vapp, smoothstep(15, 61, a.hWheel));   // cross the threshold at Vref
        const err = vTgt - a.ias / KT;
        this.thrI = clamp(this.thrI + 0.0045 * err * dt, AC.idle, 1);
        c.thr = clamp(this.thrI + 0.035 * err, AC.idle, 1);
      } else {
        c.thr = Math.max(0, c.thr - dt / 2.5);
      }
    } else if (this.mode === 'ROLLOUT' || this.mode === 'STOP') {
      c.thr = 0;
      const tSince = ac.t - this.tTd;
      if (!a.wow[0]) {
        this.thCmd = this.thTd - 1.6 * DEG * tSince;
        const e = this.thCmd - a.theta;
        this.deI = clamp(this.deI - 0.6 * e * dt, -AC.deUp, AC.deDn);
        c.de = this.deI - 2.0 * e + 0.85 * a.q;
      } else c.de += (0 - c.de) * Math.min(1, dt / 1.5);
      c.brake = a.wow[0] && tSince > 2.5 ? (a.gs > 3 ? 0.42 : 1) : 0;
      if (a.gs < 0.6 && a.wow[0]) this.mode = 'STOP';
    }
    this.out = { phiCmd, gammaCmd, thCmd: this.thCmd };
    return c;
  }
}

// ── Pilot assist (attitude command) and direct control for manual flying ──
class PilotLaws {
  constructor(ac, trim) { this.ac = ac; this.thHold = trim.th; this.deI = trim.de; this.trimDe = trim.de; this.spdI = trim.thr; }
  // inp: x roll (+right), y pitch (+pull), rud (+right), thr 0..1, brake 0..1; opts.assist, opts.autoThr
  update(dt, inp, opts, apOut) {
    const ac = this.ac, a = ac.air, c = ac.cmd, crs = FIELD.rwyHdg * DEG;
    const onG = a.onGround, mainsDown = a.wow[1] || a.wow[2];
    if (opts.assist) {
      const phiCmd = (Math.abs(inp.x) > 0.04 ? inp.x : 0) * 33 * DEG;
      c.da = clamp(1.25 * (phiCmd - a.phi) - 0.28 * a.p, -AC.daMax, AC.daMax);
      if (onG) c.da = clamp(1.2 * (0 - a.phi) - 0.25 * a.p + inp.x * 0.5 * AC.daMax, -AC.daMax, AC.daMax);
      const qCmd = (Math.abs(inp.y) > 0.04 ? inp.y : 0) * 7 * DEG;
      this.thHold = clamp(this.thHold + qCmd * dt, -15 * DEG, 18 * DEG);
      const aLim = (AC.aStall + AC.aStallFlap * ac.flaps - 3.5) * DEG;
      if (!onG && a.alpha > aLim) this.thHold = Math.min(this.thHold, a.theta - (a.alpha - aLim));
      if (onG && !a.wow[0]) this.thHold = Math.min(this.thHold, a.theta);
      if (a.wow[0] && Math.abs(inp.y) < 0.04) this.thHold = a.theta;
      const e = this.thHold - a.theta;
      this.deI = clamp(this.deI - 0.6 * e * dt, -AC.deUp, AC.deDn);
      c.de = this.deI - 2.0 * e + 0.85 * a.q;
      if (a.wow[0] && Math.abs(inp.y) < 0.04) { c.de += (0 - c.de) * Math.min(1, dt / 1.2); this.deI = c.de; }
      const rudUser = inp.rud * AC.drMax;
      if (onG) {
        const psiCmd = crs - clamp(0.025 * a.t, -5 * DEG, 5 * DEG);
        const auto = Math.abs(inp.rud) < 0.05 && Math.abs(wrapPi(a.psi - crs)) < 25 * DEG ? clamp(1.4 * wrapPi(a.psi - psiCmd) + 0.6 * a.r, -AC.drMax, AC.drMax) : 0;
        c.dr = clamp(-rudUser + auto, -AC.drMax, AC.drMax);
      } else if (a.hWheel < 9 && Math.abs(inp.rud) < 0.05) {
        const blend = smoothstep(9, 4, a.hWheel);
        c.dr = clamp(lerp(-1.6 * a.beta, 1.5 * wrapPi(a.psi - crs) + 0.6 * a.r, blend), -AC.drMax, AC.drMax);
      } else c.dr = clamp(-1.6 * a.beta - rudUser, -AC.drMax, AC.drMax);
      if (opts.autoThr && !onG && a.hWheel > 6) {
        const err = lerp(AC.Vref, AC.Vapp, smoothstep(15, 61, a.hWheel)) - a.ias / KT;
        this.spdI = clamp(this.spdI + 0.0045 * err * dt, AC.idle, 1);
        c.thr = clamp(this.spdI + 0.035 * err, AC.idle, 1);
      } else if (opts.autoThr && !onG) c.thr = Math.max(0, c.thr - dt / 2.5);
      else c.thr = onG ? Math.min(inp.thr, c.thr) : inp.thr;
      if (opts.autoThr) inp.thr = c.thr;
      const tdAge = this.tdAt != null ? ac.t - this.tdAt : 0;
      if (mainsDown && this.tdAt == null) this.tdAt = ac.t;
      c.brake = Math.max(inp.brake, a.wow[0] && tdAge > 2.5 ? (a.gs > 3 ? 0.42 : 1) : 0);
    } else {
      const y = inp.y;
      c.de = (y >= 0 ? -y * AC.deUp : -y * AC.deDn) + this.trimDe;
      if (Math.abs(y) < 0.05 && !onG) this.trimDe = clamp(this.trimDe + 0.25 * a.q * dt, -AC.deUp, AC.deDn);
      c.da = inp.x * AC.daMax;
      c.dr = -inp.rud * AC.drMax;
      c.thr = inp.thr; c.brake = inp.brake;
    }
    c.steer = (a.wow[0] ? 1 : 0) * clamp(-c.dr / AC.drMax, -1, 1) * lerp(35, 6, clamp(a.gs / 30, 0, 1)) * DEG;
    return c;
  }
}

// Stall-warning angle of attack (rad) at flap position f (0…1), from AC.aWarn / AC.aWarnFlap. The one definition the
// Evaluator uses and test/stall.test.mjs checks (T-A-07, 14 CFR 23.207 [A22]).
const aWarnAt = (f) => (AC.aWarn + AC.aWarnFlap * f) * DEG;

// ── Landing evaluation: stabilized-approach gates, touchdown, rollout ──
class Evaluator {
  constructor() {
    this.gates = {}; this.td = null; this.events = []; this.maxT = 0; this.stopS = null; this.callouts = []; this.done = false;
    this.lastH = Infinity; this.stallWarn = false; this.unstable = false;
    this.stallHorn = false; this.hornOnT = 0;   // stall warning, every step (horn + HUD); stallWarn latches the debrief stall event
  }
  gateCheck(ac, name) {
    const a = ac.air;
    const ias = a.ias / KT, vsFpm = a.vs / FT * 60;
    const items = {
      loc: Math.abs(a.locDots) <= 1, gs: Math.abs(a.gsDots) <= 1,
      spd: ias >= AC.Vref - 5 && ias <= AC.Vref + 20, vs: vsFpm >= -1000,
      cfg: ac.gearPos > 0.98 && ac.flaps > 0.95,
    };
    this.gates[name] = { ok: Object.values(items).every(Boolean), items, ias, vsFpm, loc: a.locDots, gs: a.gsDots };
  }
  update(ac, ap) {
    const a = ac.air, hft = a.h / FT;
    if (this.lastH >= 500 * FT / FT && hft < 500 && a.s < FIELD.aim && !this.gates.g500) this.gateCheck(ac, 'g500');
    if (this.lastH >= 200 && hft < 200 && a.s < FIELD.aim && !this.gates.g200) this.gateCheck(ac, 'g200');
    for (const c of [1000, 500, 400, 300, 200, 100, 50, 40, 30, 20, 10]) {
      const ra = a.hWheel / FT;
      if (!this.callouts.includes(c) && ra < c && this.lastRa >= c) { this.callouts.push(c); this.lastCallout = { v: c, t: ac.t }; }
    }
    this.lastRa = a.hWheel / FT;
    this.lastH = hft;
    // Stall warning for the horn and the HUD (14 CFR 23.207 [A22]): on at once at α ≥ α_warn(flaps); off only below
    // α_warn − aWarnHyst and after aWarnMinOn s; off on the ground and at 40 kt or less. Not latched and not logged:
    // the debrief 'stall' event below keeps its own criterion (about 1 kt above the stall).
    const aW = aWarnAt(ac.flaps);
    if (a.onGround || a.ias <= 40 * KT) this.stallHorn = false;
    else if (a.alpha >= aW) { if (!this.stallHorn) this.hornOnT = ac.t; this.stallHorn = true; }
    else if (this.stallHorn && a.alpha < aW - AC.aWarnHyst * DEG && ac.t - this.hornOnT >= AC.aWarnMinOn) this.stallHorn = false;
    if (!a.onGround && a.ias > 40 * KT && (a.stall > 0.25 || a.alpha > (AC.aStall + AC.aStallFlap * ac.flaps - 4) * DEG)) { if (!this.stallWarn) this.events.push({ t: ac.t, k: 'stall' }); this.stallWarn = true; }
    if (!this.td && (a.wow[1] || a.wow[2] || a.wow[0])) {
      const crs = FIELD.rwyHdg * DEG;
      const vLat = -a.wind[0] * 0 + (ac.x[3] * RWY_R[0] + ac.x[4] * RWY_R[1]);
      this.td = {
        t: ac.t, s: a.s, tl: a.t, vsFpm: a.vs / FT * 60, ias: a.ias / KT, gs: a.gs / KT,
        bank: a.phi * RAD, pitch: a.theta * RAD, crab: wrapPi(a.psi - crs) * RAD, drift: vLat,
        noseFirst: a.wow[0] && !(a.wow[1] || a.wow[2]),
        onRunway: a.s >= 0 && a.s <= FIELD.rwyLen && Math.abs(a.t) <= FIELD.rwyWid / 2,
      };
    }
    if (this.td && a.onGround) this.maxT = Math.max(this.maxT, Math.abs(a.t));
    if (this.td && !this.done && a.gs < 0.6 && a.onGround) { this.stopS = a.s; this.done = true; }
    if (this.td && !this.done && Math.abs(a.t) > FIELD.rwyWid / 2 + 8 && a.onGround) { this.events.push({ t: ac.t, k: 'excursion' }); this.done = true; this.stopS = a.s; }
  }
  score() {
    const td = this.td; if (!td) return null;
    const parts = [];
    const sink = -td.vsFpm;
    const pSink = sink <= 180 ? 40 : sink <= 360 ? lerp(40, 30, (sink - 180) / 180) : sink <= 600 ? lerp(30, 10, (sink - 360) / 240) : 0;
    parts.push({ k: 'sink', pts: pSink, max: 40 });
    const d = td.s;
    const pPos = d < 0 || d > 900 ? 0 : (d >= 300 && d <= 600) ? 25 : (d >= 220 && d <= 750) ? 18 : 10;
    parts.push({ k: 'pos', pts: pPos, max: 25 });
    const cl = Math.abs(td.tl);
    parts.push({ k: 'cl', pts: cl <= 2 ? 15 : cl <= 5 ? 12 : cl <= 10 ? 6 : 0, max: 15 });
    const dv = td.ias - AC.Vref;
    parts.push({ k: 'spd', pts: dv >= -8 && dv <= 5 ? 10 : dv >= -12 && dv <= 12 ? 6 : 2, max: 10 });
    const att = (Math.abs(td.bank) <= 3 ? 4 : Math.abs(td.bank) <= 6 ? 2 : 0) + (Math.abs(td.crab) <= 3 ? 3 : Math.abs(td.crab) <= 6 ? 1.5 : 0) + (Math.abs(td.drift) <= 0.8 ? 3 : Math.abs(td.drift) <= 1.6 ? 1.5 : 0);
    parts.push({ k: 'att', pts: att - (td.noseFirst ? 5 : 0), max: 10 });
    let total = parts.reduce((s, p) => s + Math.max(0, p.pts), 0);
    if (!td.onRunway) total = Math.min(total, 20);
    if (this.events.some((e) => e.k === 'excursion')) total = Math.min(total, 15);
    if (sink > 600) total = Math.min(total, 35);
    if (this.events.some((e) => e.k === 'wingtip')) total = Math.min(total, 30);
    total = Math.round(total);
    const grade = total >= 90 ? 'ดีเยี่ยม' : total >= 75 ? 'ดี' : total >= 60 ? 'ผ่าน' : 'ต้องฝึกเพิ่ม';
    return { total, grade, parts };
  }
}

// Quaternion nlerp on the shorter arc: a[ia..ia+3] → b[ib..ib+3] at u, into out (replay and render interpolation)
const qNlerp = (a, ia, b, ib, u, out) => {
  const s = a[ia] * b[ib] + a[ia + 1] * b[ib + 1] + a[ia + 2] * b[ib + 2] + a[ia + 3] * b[ib + 3] < 0 ? -1 : 1;
  for (let i = 0; i < 4; i++) out[i] = a[ia + i] + (s * b[ib + i] - a[ia + i]) * u;
  const l = Math.hypot(out[0], out[1], out[2], out[3]); for (let i = 0; i < 4; i++) out[i] /= l;
  return out;
};
// ── Recorder for replay and the debrief charts (10 Hz) ──
class Recorder {
  constructor() { this.f = []; this.next = 0; }
  sample(ac, extra = {}) {
    if (ac.t < this.next) return;
    this.next = ac.t + 0.1;
    const x = ac.x, a = ac.air;
    this.f.push({
      t: ac.t, n: x[0], e: x[1], d: x[2], q: [x[6], x[7], x[8], x[9]], de: ac.de, da: ac.da, dr: ac.dr, fl: ac.flaps, gr: ac.gearPos,
      thr: ac.thr, ias: a.ias / KT, vs: a.vs / FT * 60, s: a.s, tl: a.t, h: a.h, hw: a.hWheel, gsd: a.gsDots, locd: a.locDots, brake: ac.brake, ...extra,
    });
  }
  at(t) {
    const f = this.f; if (!f.length) return null;
    if (t <= f[0].t) return f[0];
    if (t >= f[f.length - 1].t) return f[f.length - 1];
    let lo = 0, hi = f.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (f[m].t <= t) lo = m; else hi = m; }
    const A = f[lo], B = f[hi], u = (t - A.t) / (B.t - A.t);
    const o = {};
    for (const k in A) if (typeof A[k] === 'number') o[k] = lerp(A[k], B[k], u);
    o.q = qNlerp(A.q, 0, B.q, 0, u, [0, 0, 0, 0]);
    return o;
  }
}

// ── A flight: aircraft + wind + autopilot / pilot laws + evaluation + recording ──
// Winds are given relative to the landing runway (rel 0 = straight down the runway, +90 from the right).
// W20 (kt, turbulence intensity, plan A9): the old turb 0 / 0.6 / 0.8 / 1.6 × the 1/7-law wind at 20 ft (calm 0, head
// 5.59, xr 7.45, xl 22.36 kt: all light, under 30; round 1 §8.1 and §8.17 item 3), so the turbulence is unchanged: σ
// matches the old ft/s path to rounding (≤ 1 ulp, the product is formed in another order), and with law 'power' the
// seed-5 autolands match the pre-A9 code to about 1e-12 with the same scores. Kept by choice, not because the research
// is silent: §6.4's daytime light-wind row (§9 byRegime_W20_kt_ESTIMATE.dayLightWind max(U10, 5), ค่าประมาณ) would give
// head and xr 10 kt; they stay at 5.59 and 7.45 kt so the scores stay comparable, and per-regime W20 waits for B10's
// weather (owner to choose). A Flight's own W20 option overrides it (null or absent = the scenario's).
const SCENARIOS = {
  calm: { label: 'ลมสงบ', rel: 0, kt: 0, W20: 0 },
  head: { label: 'ลมสวน 10 kt', rel: 0, kt: 10, W20: 0.6 * 10 * W20_PER_KT_LEGACY },
  xr: { label: 'ลมขวาง 10 kt จากขวา', rel: 90, kt: 10, W20: 0.8 * 10 * W20_PER_KT_LEGACY },
  xl: { label: 'ลมขวาง 15 kt จากซ้าย + กระโชก', rel: -90, kt: 15, W20: 1.6 * 15 * W20_PER_KT_LEGACY },
};
const windFrom = (sc) => (sc.fromDeg != null ? sc.fromDeg : Math.round(wrap360(FIELD.rwyHdg + sc.rel)));

class Flight {
  constructor({ wind = SCENARIOS.calm, W20 = null, oatC = WX_DEFAULT.oatC, qnh = WX_DEFAULT.qnh, dewC = WX_DEFAULT.dewC, dist = 5500, pilot = 'ap', assist = true, autoThr = true, seed = 11, dh = 0, dtl = 0 } = {}) {
    this.ac = new Aircraft();
    qnh = qnh ?? P0_HPA; this.ac.isaDev = oatC - (15 - 0.0065 * FIELD.elev); this.ac.qnh = qnh; this.ac.dewC = dewC;
    this.ac.wind = new Wind({ fromDeg: windFrom(wind), kt: wind.kt, W20: W20 ?? windW20(wind), seed }); this.W20 = this.ac.wind.W20;
    const trim = this.ac.setApproach({ dist, dh, dt: dtl });
    this.trim = trim;
    this.ap = new Autopilot(this.ac, trim);
    this.laws = new PilotLaws(this.ac, trim);
    this.ev = new Evaluator();
    this.rec = new Recorder();
    this.pilot = pilot; this.opts = { assist, autoThr };
    this.input = { x: 0, y: 0, rud: 0, thr: trim.thr, brake: 0 };
    this.acc = 0; this.dt = 1 / 240; this.finishedAt = null; this.oatC = oatC; this.qnh = qnh; this.dewC = dewC;
    this.crashed = false;
    this.xPrev = new Float64Array(13); this.sPrev = new Float64Array(6); this.keepPrev();   // state before the last tick (render interpolation)
  }
  setPilot(p) {
    if (p === this.pilot) return;
    if (p === 'ap') {           // hand back: re-seed the autopilot from the current state
      const a = this.ac.air;
      this.ap.thBias = a.theta - (a.alpha || 0) * 0; this.ap.thCmd = a.theta; this.ap.deI = this.ac.de; this.ap.thrI = this.ac.thr;
      if (this.ap.mode === 'STOP') this.ap.mode = 'ROLLOUT';
    } else {
      this.laws.thHold = this.ac.air.theta; this.laws.deI = this.ac.de; this.laws.trimDe = this.ac.de; this.laws.spdI = this.ac.thr;
      this.input.thr = this.ac.thr;
    }
    this.pilot = p;
  }
  // Fixed-step accumulator (research 01-flight-physics/09-numerics.md §9.4 and §9.12 task 1; round 1 task list item 6;
  // T-N-07, T-N-08): ε = 1e-9 s (ค่าประมาณ, §9.8 accumulatorEpsilon) snaps frame times that land one ulp under a whole
  // number of steps (ideal float ms timestamps k·1000/f at 120 Hz gave 1/2/3 steps; browser rAF times, rounded to
  // 0.1 ms, still mix 3/4/5 at 60 Hz and renderPose hides it), at most ceil(0.1/dt) = 24 steps per frame, any backlog
  // beyond one step dropped at the cap, a negative frame time ignored. Returns the number of steps taken.
  advance(realDt) {
    const h = this.dt, maxN = Math.ceil(0.1 / h);
    this.acc += Math.min(Math.max(realDt, 0), 0.1);
    let n = 0;
    while (this.acc >= h - 1e-9 && n < maxN) { this.tick(h); this.acc -= h; n++; }
    if (n === maxN) this.acc = Math.min(this.acc, h);
    if (this.acc < 0) this.acc = 0;
    return n;
  }
  // The constructor and tick() call it, and renderPose() too when ac.setApproach or ac.setParked has run since (ac.gen),
  // so a new Flight (start, R restart, a new demo) or a reset on a live one draws the new state at once, also with no
  // tick (paused, setup preview) (09-numerics.md §9.7: xPrev = x right after setApproach or setParked).
  keepPrev() {
    const a = this.ac, s = this.sPrev; this._gen = a.gen;
    this.xPrev.set(a.x); s[0] = a.de; s[1] = a.da; s[2] = a.dr; s[3] = a.flaps; s[4] = a.gearPos; s[5] = a.steer;
  }
  // Pose to draw (09-numerics.md §9.12 task 2; round 1 task list item 7; T-N-09): between the state before the last tick
  // and the current one at α = acc/dt, so the picture moves with the frame clock and lags the physics by at most one
  // step, 1/240 s (Fiedler [N8]). Position and surfaces by lerp, attitude by nlerp on the shorter arc (≤ 1° per step,
  // as Recorder.at; §9.7). The HUD keeps the latest state.
  renderPose(out = { p: [0, 0, 0], q: [1, 0, 0, 0], de: 0, da: 0, dr: 0, flaps: 0, gearPos: 0, steer: 0 }) {
    if (this.ac.gen !== this._gen) this.keepPrev();
    const u = clamp(this.acc / this.dt, 0, 1), A = this.xPrev, B = this.ac.x, S = this.sPrev, a = this.ac;
    for (let i = 0; i < 3; i++) out.p[i] = A[i] + (B[i] - A[i]) * u;
    qNlerp(A, 6, B, 6, u, out.q);
    out.de = lerp(S[0], a.de, u); out.da = lerp(S[1], a.da, u); out.dr = lerp(S[2], a.dr, u);
    out.flaps = lerp(S[3], a.flaps, u); out.gearPos = lerp(S[4], a.gearPos, u); out.steer = lerp(S[5], a.steer, u);
    return out;
  }
  tick(dt) {
    const ac = this.ac;
    this.keepPrev();             // before the crash check, so a frozen flight draws still; direct tick() callers too
    if (this.crashed) return;
    const apC = this.ap.guidance();
    if (this.pilot === 'ap') this.ap.update(dt);
    else {
      this.ap.out = { phiCmd: apC.phiCmd, gammaCmd: apC.gammaCmd };
      this.laws.update(dt, this.input, this.opts, apC);
    }
    ac.step(dt);
    const a = ac.air;
    if (a.onGround && (a.vs / FT * 60 < -900 || Math.abs(a.phi) > 40 * DEG || a.theta < -12 * DEG)) { this.crashed = true; this.ev.events.push({ t: ac.t, k: 'crash' }); }
    if (a.onGround && Math.abs(a.phi) > 15.5 * DEG && !this.ev.events.some((e) => e.k === 'wingtip')) this.ev.events.push({ t: ac.t, k: 'wingtip' });
    if (a.h < -0.5) { this.crashed = true; }
    this.ev.update(ac, this.ap);
    this.rec.sample(ac, { mode: this.pilot === 'ap' ? this.ap.mode : 'MAN' });
    if (this.ev.done && this.finishedAt == null) this.finishedAt = ac.t;
  }
  phase() {
    const a = this.ac.air;
    if (this.crashed) return 'CRASH';
    if (this.ev.done) return 'DONE';
    if (this.ev.td) return 'ROLLOUT';
    if (this.pilot === 'ap') return this.ap.mode;
    return a.hWheel < 10 ? 'FLARE' : 'APP';
  }
}
