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

// ── The aircraft being flown (plan B3; research round 1 task list item 8, 01-flight-physics/12-other-sims.md §12.14
//    task 3, 05-turbofan.md task 1; round 3 conflict C8 names the folder). Its numbers are data, not code: one card per
//    type in data/aircraft/<id>.json, today data/aircraft/trainer.json, the fictional two-seat turboprop trainer (not any
//    manufacturer's type; every value an estimate, each leaf {v, u, scope, src, conf, est, note} with its sources, as in
//    01-flight-physics/schema.md and 02-light-aircraft/schema-ext.md). setAircraft(card) fills AC from a card: the page
//    loads the file with the other data (48-data.js) and calls it before any Aircraft exists, test/harness.mjs reads it
//    from disk. AC is empty until then and stays the same object for the life of the page (the harness and the oracle
//    hold it). Fields: m, Ixx…Ixz, S, b, c, the linear aero derivatives (CL0 … Cndr), the stall blend centre aStall +
//    aStallFlap·f (deg; effective CLmax ≈ 3° below it), the stall warning (aWarn + aWarnFlap·f deg, released aWarnHyst
//    deg below it after aWarnMinOn s; research T-A-07 and plan A5), P, eta, T0, idle, control travel deUp, deDn, daMax,
//    drMax (rad), gear (3 struts), Vref, Vapp, Vs0 (kt), the body points eye and gsAnt (FRD, m from the CG), engines
//    [{ pos, dir }] (FRD) and Iinv. acFromCard says which card path each comes from.
const AC = {};

// Tables in the manner of JSBSim's FGTable: linear between the points, clamped at the ends, never extrapolated
// (12-other-sims.md §12.2 [S3], T-S-07; the same functions as scripts/s12/s12_table_expected.mjs). X, R and C ascend;
// table2 interpolates each row of D (D[i] belongs to R[i], D[i][j] to C[j]) in c, then between the rows in r.
function table1(X, Y, x) {
  const n = X.length; if (x <= X[0]) return Y[0]; if (x >= X[n - 1]) return Y[n - 1];
  let i = 1; while (X[i] < x) i++;
  const f = (x - X[i - 1]) / (X[i] - X[i - 1]); return Y[i - 1] + f * (Y[i] - Y[i - 1]);
}
function table2(R, C, D, r, c) {
  const row = (i) => table1(C, D[i], c); const n = R.length; if (r <= R[0]) return row(0); if (r >= R[n - 1]) return row(n - 1);
  let i = 1; while (R[i] < r) i++;
  const f = (r - R[i - 1]) / (R[i] - R[i - 1]); return row(i - 1) + f * (row(i) - row(i - 1));
}

// ── KIAS from the card's IAS–CAS table (plan C3, research round 2 task item 12) ──
// The sim flies and tests in CAS (its `air.ias` is EAS, equal to CAS to within 0.1 % below 3,000 ft and 200 kt, the
// round 2 reading of the POH's "KCAS"); a real airspeed indicator reads KIAS, which differs by the position error that
// each type's calibration table speeds.ias_cas gives per flap detent (POH Fig 5-1 for the Cessnas, the AFM for the
// DA40 and DA42). A card with the table has AC.kias = { Vref, Vapp, Vs0 (KIAS), rows: [{ f, kias[], kcas[] }] }, one
// row per detent of the table at its flap position f (the lift increment over the landing detent's, flapMap of the
// research's lm_card.mjs; the deflection ratio when the detents carry no dCL0). AC.kias is null on a card with no
// table (the fictional trainer): KIAS = KCAS there, and every function below returns its argument unchanged.
// Inside a row the table is read linearly. Outside it, estimates (ค่าประมาณ, no source): below the first point KIAS
// and KCAS stay in proportion to the origin (a stopped aircraft reads zero), above the last the difference stays that of
// the last point (slope 1); the POH gives the table only between its points. Between two rows (flaps moving) the
// CAS of the two rows is mixed linearly in f, the same rule as the research's iasCas (R2-07), which mixes in flap angle.
// Rows are read for any f, clamped to the first and last row.
function rowCas(R, x) {
  const K = R.kias, C = R.kcas, n = K.length;
  if (x <= K[0]) return C[0] * x / K[0];
  if (x >= K[n - 1]) return C[n - 1] + (x - K[n - 1]);
  return table1(K, C, x);
}
function rowIas(R, y) {   // the inverse of rowCas (KCAS ascending, equal values allowed: the first KIAS that reads y)
  const K = R.kias, C = R.kcas, n = K.length;
  if (y <= C[0]) return K[0] * y / C[0];
  if (y >= C[n - 1]) return K[n - 1] + (y - C[n - 1]);
  let i = 1; while (C[i] < y) i++;   // C[i - 1] < y <= C[i], so C[i] > C[i - 1]
  return K[i - 1] + (y - C[i - 1]) / (C[i] - C[i - 1]) * (K[i] - K[i - 1]);
}
// the two rows around flap position f and the weight of the upper one, or the one row when f is at one (or past an end)
function rowsAt(T, f) {
  const R = T.rows, n = R.length;
  if (f <= R[0].f) return [R[0], R[0], 0];
  if (f >= R[n - 1].f) return [R[n - 1], R[n - 1], 0];
  let i = 1; while (R[i].f < f) i++;
  const w = (f - R[i - 1].f) / (R[i].f - R[i - 1].f);
  return w < 1e-9 ? [R[i - 1], R[i - 1], 0] : w > 1 - 1e-9 ? [R[i], R[i], 0] : [R[i - 1], R[i], w];
}
// T is AC.kias; kt in, kt out
function iasToCas(T, f, kias) {
  if (!T) return kias;
  const [A, B, w] = rowsAt(T, f);
  return w === 0 ? rowCas(A, kias) : (1 - w) * rowCas(A, kias) + w * rowCas(B, kias);
}
function casToIas(T, f, kcas) {
  if (!T) return kcas;
  const [A, B, w] = rowsAt(T, f);
  if (w === 0) return rowIas(A, kcas);
  let lo = 0, hi = 2 * kcas + 20;   // a mix of two rows: bisection on the (increasing) forward function, only while the flaps move
  for (let k = 0; k < 60; k++) { const mid = 0.5 * (lo + hi); if ((1 - w) * rowCas(A, mid) + w * rowCas(B, mid) < kcas) lo = mid; else hi = mid; }
  return 0.5 * (lo + hi);
}
// Vref, Vapp and Vs0 in the unit of the HUD: KIAS from the card's table, or the card's own kt (CAS = IAS) with no table
const speedsKias = () => AC.kias || AC;
// The KIAS of an aircraft state: anything with `flaps` and `air.ias` (EAS, m/s), so the research scripts' stand-ins for
// an Aircraft work too (Aircraft.kias, the Evaluator and the Recorder all call it)
const kiasOf = (ac) => casToIas(AC.kias, ac.flaps, ac.air.ias / KT);

// ── Approach speeds by mass, configuration and wind (plan C5, research round 3 task item 3, R3-3; topics 3.1–3.4, 3.10) ──
// AC.Vref, AC.Vapp and AC.Vs0 (above) are one number each: the landing detent at the mass flown, in calm air, with the
// autothrottle on. The functions of SPD give the speeds the page needs for any mass and configuration the card has
// tables for, and the wind additive of the type, from what the card holds (acFromCard builds AC.spd from it):
//  - speeds.VREF_kt, speeds.VS0_kt and speeds.VAPP_kt as mass tables { axes: { mass_kg, flap? }, data } in kt CAS, one
//    column per flap detent the research gives (the 737's Vref30 and Vref40, the Airbus VLS columns of the CG ≥ 25 %
//    table, the stall speed of every detent), read at a mass with table1 (linear, clamped at the ends, never extrapolated);
//  - speeds.approach_rule: the wind rule in knots (kind 'boeing', 'airbus' or 'atr'), transcribed by
//    tools/aircraft/build_airliners.mjs from research topic 3.10 (ported here from the research's k_speeds.mjs);
//  - ops.gs_mini: the ground speed mini factors of the Airbus cards; aero.flaps.detents: the VFE of each detent.
// A card with no approach_rule (the trainer and the six light cards: their POH figures stand for the training mass, the
// page offers no other) is kind 'fixed': Vref, Vapp and Vs0 are AC's own numbers whatever the mass, so nothing moves
// for them (the bit-identity check of plan C5 flies them again). Boeing's wind additive: A/T engaged Vref + 5 kt; A/T
// off Vref + max(5, ½ steady headwind + full gust), commanded at most Vref + cap (cap 20 kt, FCTM 2013, the default)
// and VFE − 5 kt; the steady part is bled off in the flare, the gust part kept to touchdown (`keep`). Owner decision
// OD-WIND-ADDITIVE: the cap of 15 kt that Boeing's 2018 study proposed (no revised FCTM seen: unconfirmed) is the
// option `cap: SPD.capOption(S)`. Airbus: VAPP = VLS + APPR COR, APPR COR = ⅓ of the tower headwind between 5 and 15 kt,
// gust left to the ground speed mini (target = VAPP + k·max(0, headwind now − tower headwind), k from ops.gs_mini; the
// A330's k falls from 1 to 0.33 within 25 s below 400 ft, a linear blend that is an estimate). ATR: VAPP = max(VmHB30 +
// WF, VMCL), WF = min(15, max(⅓ headwind, gust)). The ICAO approach category from Vat (1.23 VS1g or Vref). Speeds in kt.
const VLS_K = 1.23;   // VLS/VS1g where a card has no VLS column for a configuration: Airbus 1.23 ≤ k ≤ 1.28 (research 03-a320-a321.md [L9]), the low end; ค่าประมาณ
const ATR_VREF_K = 1.23;   // ATR VREF = max(1.23 VSR30, VMCL) (research 01-atr72-600.md, r_speeds_clmax.mjs line 30: [R14][R16][R31])
const V2_K = 1.13;    // 14 CFR 25.107(b)(1) V2min = 1.13 VS1g (research 04-a330-300.md T-H-04 [H22])
const SPD = {
  // the column of table T for configuration `conf` (a detent name, the landing detent when omitted) read at mass m; null
  // when the table has no such column. A table with no flap axis is the landing detent's.
  col(T, m, conf, land) {
    if (!T) return null;
    const c = conf === undefined || conf === null ? land : String(conf);
    const col = T.cols[c] ?? (T.noFlap && c === land ? T.cols[''] : undefined);
    return col ? table1(T.ms, col, m) : null;
  },
  // 1-g stall speed (VS1g of the Airbus cards, VSR of the 737 and ATR), kt CAS
  vs1g(S, m, conf) { return S.kind === 'fixed' ? AC.Vs0 : SPD.col(S.stall, m, conf, S.land); },
  // Vref: the research's own table (737 flap 30 and 40, ATR flap 30) or VLS CONF FULL (Airbus: the VLS column)
  // ATR: the table is the research's own, but its VMCL floor ends at 17,124 kg, between the table's rows at 16,000 and 18,000
  // kg, where a straight line would run up to 1.4 kt above max(1.23 VSR30, VMCL); below the first row that is above the floor
  // the research's definition is used itself (T-R-29: 98 ± 0.5 kt below 17,124 kg). The rows at and above that mass stay the table.
  vref(S, m, conf) {
    if (S.kind === 'fixed') return AC.Vref;
    const t = SPD.col(S.ref, m, conf, S.land);
    if (S.kind === 'atr' && t !== null) {
      const col = S.ref.noFlap ? S.ref.cols[''] : S.ref.cols[conf === undefined || conf === null ? S.land : String(conf)];
      const i = col.findIndex((v) => v > S.rule.vmcl_kt + 1e-9);
      const vs = SPD.vs1g(S, m, conf);
      if (i > 0 && m < S.ref.ms[i] && vs !== null) return Math.max(S.rule.vmcl_kt, ATR_VREF_K * vs);
    }
    return t;
  },
  // VLS of an Airbus card: the card's VLS column, or VLS_K × VS1g where the card has none; null for the other kinds
  vls(S, m, conf) {
    if (S.kind !== 'airbus') return null;
    const t = SPD.col(S.ref, m, conf, S.land);
    if (t !== null) return t;
    const vs = SPD.vs1g(S, m, conf);
    return vs === null ? null : VLS_K * vs;
  },
  // V2min = 1.13 VS1g (takeoff, 14 CFR 25.107(b)(1)), the 1.1 VMCA floor not applied
  v2min: (vs1g) => V2_K * vs1g,
  // the rules, on numbers: R is a card's speeds.approach_rule, w the wind in kt (hw tower headwind, negative for a tail
  // wind; gust the reported gust increment). Each returns the approach speed and what it added.
  boeing(R, vref, { atOn = true, hw = 0, gust = 0, cap = R.max_kt, vfe = null } = {}) {
    if (atOn) return { vapp: vref + R.at_kt, add: R.at_kt, keep: 0 };
    let add = Math.min(cap, Math.max(R.min_kt, R.headwind_factor * Math.max(0, hw) + R.gust_factor * Math.max(0, gust)));
    if (vfe !== null) add = Math.min(add, Math.max(0, vfe - R.vfe_margin_kt - vref));
    return { vapp: vref + add, add, keep: Math.min(add, Math.max(0, gust)) };
  },
  airbus(R, vls, { hw = 0 } = {}) {
    const add = Math.min(R.max_kt, Math.max(R.min_kt, Math.max(0, hw) / R.headwind_div));
    return { vapp: vls + add, add, keep: 0 };
  },
  atr(R, vmhb30, { hw = 0, gust = 0, vmcl = R.vmcl_kt } = {}) {
    const wf = Math.min(R.max_kt, Math.max(Math.max(0, hw) / R.headwind_div, R.gust_factor * Math.max(0, gust)));
    return { vapp: Math.max(vmhb30 + wf, vmcl), add: wf, keep: 0 };
  },
  // the cap of the unconfirmed option (OD-WIND-ADDITIVE), null for a type with none
  capOption: (S) => (S.rule && S.rule.max_option_kt !== undefined ? S.rule.max_option_kt : null),
  // the ground speed mini: the IAS target is VAPP + k·max(0, headwind now − tower headwind) (Airbus FOBN, research [K7]);
  // the part added, kt. A330: k = kAbove above 400 ft, falling linearly to kBelow within blendS seconds below it.
  gsMini: (k, hwTower, hwNow) => k * Math.max(0, hwNow - Math.max(0, hwTower)),
  gsK(g, hFt, tBelow) {
    if (hFt >= 400 || !(g.blendS > 0)) return hFt >= 400 ? g.kAbove : g.kBelow;
    return g.kAbove - (g.kAbove - g.kBelow) * Math.min(1, tBelow / g.blendS);
  },
  // the wind additive of a type at mass m: { vref, vapp, add, keep } in kt CAS
  vapp(S, m, w = {}, conf) {
    if (S.kind === 'fixed') return { vref: AC.Vref, vapp: AC.Vapp, add: AC.Vapp - AC.Vref, keep: 0 };
    const c = conf === undefined || conf === null ? S.land : String(conf);
    if (S.kind === 'airbus') {
      const vls = SPD.vls(S, m, c), r = SPD.airbus(S.rule, vls, w);
      return { vref: vls, ...r };
    }
    const vref = SPD.vref(S, m, c);
    if (S.kind === 'atr') return { vref, ...SPD.atr(S.rule, vref, w) };
    return { vref, ...SPD.boeing(S.rule, vref, { ...w, vfe: S.vfe[c] ?? null }) };
  },
  // ICAO approach category from Vat in kt (Doc 8168 Vol I; 14 CFR 97.3): A below 91, B 91 to below 121, C 121 to below
  // 141, D 141 to below 166, E 166 to below 211. Vat = 1.3 VS0 or 1.23 VS1g, the landing Vref of the cards.
  category: (vat) => (vat < 91 ? 'A' : vat < 121 ? 'B' : vat < 141 ? 'C' : vat < 166 ? 'D' : vat < 211 ? 'E' : null),
};

// The approach speeds of one flight: what the HUD shows, what the Autopilot and the autothrottle fly and what the
// Evaluator judges the approach and the touchdown by. Built from AC.spd at the mass flown and the wind of the flight
// (`wind` is its wind spec, as Flight takes it; `gust` the reported gust increment, kt, which no scenario gives yet).
// Vref and Vapp are in the unit of the HUD (KIAS from the card's table, else KCAS, as speedsKias), vref and vapp in kt CAS.
// `keep` is the gust allowance kept to touchdown (Boeing), `extra` the ground speed mini part of the target (Airbus),
// updated every tick. For a 'fixed' card every number is AC's own, so the trainer and the light types fly and score
// as before plan C5.
// a wind component the cosine of a right angle leaves at 1e-15 kt is no wind: a crosswind adds nothing to the speed
const snapZero = (x) => (Math.abs(x) < 1e-9 ? 0 : x);
class Approach {
  constructor({ wind = null, gust = 0, atOn = true, cap = null } = {}) {
    this.S = AC.spd || { kind: 'fixed' }; this.m = AC.m; this.gust = gust; this.cap = cap;
    this.kind = this.S.kind; this.label = this.kind === 'airbus' ? 'VLS' : 'Vref';
    this.hwTower = 0; this.gs = this.kind === 'airbus' && this.S.gs ? this.S.gs : null; this.extra = 0; this.tBelow = 0;
    // the headwind of the reported (tower) wind, kt, along the landing direction (negative: tail wind)
    if (wind && this.kind !== 'fixed') this.hwTower = snapZero(wind.kt * Math.cos((windFrom(wind) - FIELD.rwyHdg) * DEG));
    this.setAt(atOn);
  }
  alongRwy(w) { const crs = FIELD.rwyHdg * DEG; return snapZero(-(w[0] * Math.cos(crs) + w[1] * Math.sin(crs)) / KT); }
  // autothrottle on or off (Boeing's additive depends on it); recomputes the speeds, a no-op when unchanged
  setAt(atOn) {
    if (this.atOn === atOn && this.vref !== undefined) return;
    this.atOn = atOn;
    const S = this.S, r = SPD.vapp(S, this.m, { hw: this.hwTower, gust: this.gust, atOn, cap: this.cap ?? undefined });
    this.vref = r.vref; this.vapp = r.vapp; this.add = r.add; this.keep = r.keep;
    const fixed = this.kind === 'fixed', K = speedsKias();
    // HUD unit: a fixed card's own KIAS figures; a rule card's CAS through its IAS–CAS table when it has one
    this.Vref = fixed ? K.Vref : AC.kias ? casToIas(AC.kias, 1, r.vref) : r.vref;
    this.Vapp = fixed ? K.Vapp : AC.kias ? casToIas(AC.kias, 1, r.vapp) : r.vapp;
    this.Keep = fixed ? 0 : AC.kias ? casToIas(AC.kias, 1, r.vref + r.keep) - this.Vref : r.keep;
    if (!atOn) { this.extra = 0; this.tBelow = 0; }
  }
  // the ground speed mini of the flight, once a tick before the autopilot: the headwind of the mean wind at the aircraft
  // against the tower's. Only the Airbus cards carry it; for every other kind this does nothing. Simplification (known gap):
  // it reads the mean wind (shear profile) only, not the Dryden gusts, so the ground speed mini compensates for the change of
  // the steady headwind with height but not for gusts, which research 10-fctm-technique.md gives it to do ("gust ไม่บวกใน VAPP
  // แต่ชดเชยด้วย GS mini"); a filtered instantaneous headwind waits for the A/THR of phase M (plan M5; plan C6 only trims).
  update(ac, dt) {
    const g = this.gs;
    if (!g) return;
    const a = ac.air;
    this.tBelow = a.h / FT < 400 ? this.tBelow + dt : 0;
    const hwNow = this.alongRwy(ac.wind.mean(Math.max(a.h, 1)));
    this.extra = this.atOn ? SPD.gsMini(SPD.gsK(g, a.h / FT, this.tBelow), this.hwTower, hwNow) : 0;
  }
  // the speed commanded at wheel height h (m), kt CAS: the approach speed (with the ground speed mini) far out, Vref plus
  // the gust allowance at the threshold (the steady additive is bled off between 61 and 15 m)
  target(hWheel) { return lerp(this.vref + this.keep, this.vapp + this.extra, smoothstep(15, 61, hWheel)); }
  // the approach speed commanded now, in the HUD's unit (the FMA's SPD)
  get cmd() { return this.Vapp + this.extra; }
}

// ── Units and balance arms of the research cards (plan C4, research round 3 task item 1, R3-1) ──
// Round 3 writes each value in the unit its source gives (03-airliners.md, "แกนและหน่วย"): lb and lbf from the TCDS and
// the engine sheets, in from the Boeing balance arms, slug ft² from the JSBSim inertias. toSI(x, u) turns a number in one
// of these units into SI (exact factors: lb 0.45359237 kg and in 0.0254 m by definition, ft 0.3048 m, lbf = lb·g0,
// slug ft² = 14.593903 kg·0.3048² m² (slug = lbf s²/ft); kt is KT of 10-atmo.js, 0.514444 m/s as everywhere in the sim)
// and throws on a unit it does not know. pctMAC(x, lemac, mac): the %MAC of a balance arm x, with LEMAC and MAC in the
// same length unit as x (research T-B-22, BA 658.26 in = 20 %MAC of the 737-800); armAtPctMAC its inverse.
const UNIT_SI = { kg: 1, lb: 0.45359237, m: 1, in: 0.0254, ft: FT, N: 1, lbf: 0.45359237 * G0, 'kg m2': 1, 'slug ft2': 14.593902937206364 * FT * FT, 'm/s': 1, kt: KT };
function toSI(x, u) {
  if (!Object.hasOwn(UNIT_SI, u)) throw new Error(`toSI: unknown unit ${JSON.stringify(u)} (known: ${Object.keys(UNIT_SI).join(', ')})`);
  return x * UNIT_SI[u];
}
const pctMAC = (x, lemac, mac) => 100 * (x - lemac) / mac;
const armAtPctMAC = (pct, lemac, mac) => lemac + pct / 100 * mac;

// Inverse of the inertia tensor [[Ixx, 0, −Ixz], [0, Iyy, 0], [−Ixz, 0, Izz]] (FRD, Ixz product), as deriv uses it
function inertiaInverse({ Ixx, Iyy, Izz, Ixz }) {
  const G = Ixx * Izz - Ixz * Ixz;
  return [Izz / G, 0, Ixz / G, 0, 1 / Iyy, 0, Ixz / G, 0, Ixx / G];
}

// Every AC field (Iinv aside) from an aircraft card, read from the card's direct paths: airframe.weights.training_mass
// (kg, or {kg}), airframe.inertia.Ixx/Iyy/Izz/Ixz (× m/ref_mass when the card gives ref_mass), aero.ref.S/b/c,
// aero.legacy (CL0, CLa, CLflap, CD0, K, CDflap, CDgear, Cm0, Cma, Cmflap, aStall, aStallFlap, aWarn, aWarnFlap,
// aWarnHyst, aWarnMinOn), aero.derivatives.*, propulsion.legacy (P, eta, T0, idle),
// controls.surfaces.<elevator|aileron|rudder>.travel_deg (deUp = up, deDn = down, daMax = ½(up + down),
// drMax = min(left, right), deg → rad), gear.legacy (3 struts), speeds.VS0_kt/VREF_kt/VAPP_kt (kt CAS, see below),
// airframe.geometry.eye_pos_FRD and gsAntenna_pos_FRD, and propulsion.layout (each engine's pos and axis, the axis made
// a unit vector dir). A path runs through the card's branches to a leaf (an object with v) and on into its value:
// 'aero.legacy.CL0' is CL0 in the v of the leaf aero.legacy. A missing or non-numeric value throws an Error that names
// its path (also as error.path); every other leaf is ignored (the round 2–3 cards carry many more; plan C4 extends this
// reader for the airliners).
// Plan C1 (research round 2 task item 10) reads the light-aircraft cards as the research writes them:
//  - Speeds: a 'kt CAS' speed is taken as written (no rounding). A 'kt IAS' speed (the POH figure) goes to kt CAS
//    through the landing detent's row of speeds.ias_cas with table1 (linear, clamped at the row's ends, never
//    extrapolated): VS0, VREF and VAPP are all landing-configuration speeds, and the landing detent is the entry of
//    aero.flaps.detents with the largest flap_deg. speeds.ias_cas is { <detent name>: [[KIAS, KCAS], …] } or round 2
//    lm_lib's { axes: { flap: [names], KIAS: [kt] }, data: [[KCAS per KIAS] per flap] }; the row needs 2 pairs or more
//    with KIAS strictly ascending (plan C3: every row is checked, positive, KCAS not descending, named after a detent).
//    Any other unit throws. The card's KIAS figures and the whole table also go to AC.kias (see iasToCas).
//  - Derivatives: aero.derivatives.<name> is a number or an object of numbers per configuration; the first numeric
//    entry of [opts.config, 'approach', 'landing', 'cruise', 'clean'], else the first numeric key, is taken (with no
//    opts, the same pick as buildAC's).
// Against round 2's lm_card.mjs buildAC: the same numbers on the paths it reads directly (its 'ตรง' rule), so every
// card in data/aircraft gives the same fields as buildAC(prepare(id)), its research card after the generator's
// provenance fixes (tools/aircraft/build_cards.mjs; they move the DA40 eye and wheels), but not buildAC's other
// rules. buildAC rounds the speeds to whole knots and converts kt IAS with lm_lib.iasCas, which extrapolates past a
// row's ends and falls back to the first row for an unknown detent; acFromCard does neither. buildAC takes a missing
// Ixz as 0; here it is required.
// Plan C4 (research round 3 task items 1, 2 and 39: R3-1, R3-2, R3-39) reads the airliner cards of
// tools/aircraft/build_airliners.mjs in legacy mode, on today's equations (aero.legacy and propulsion.legacy):
//  - K_CL_offset: the CL of minimum drag in the polar K·(CL − K_CL_offset)², aero.legacy.K_CL_offset when the card gives
//    it, else 0.15, the number the code held before (03-airliners.md item 2: the ATR and the 737 set 0, the A320 family
//    and the A330 fit their legacy polar with 0.15). The trainer and the six light cards have none, so they keep 0.15.
//  - _na: a path the card's _na leaf marks not applicable ("turbofan.*", or a path and everything under it) is read as
//    absent; a path the reader needs then throws "marked not applicable".
//  - opts.mass (kg): the mass flown instead of airframe.weights.training_mass (the inertia follows it by m/ref_mass, as
//    for every card). A kt CAS speed may be a mass table { axes: { mass_kg: [...], flap?: [names] }, data }, read at that
//    mass with table1 (linear, clamped at the ends, never extrapolated), in the landing detent's column when the table
//    has a flap axis (round 3's table form; the airliner cards' VREF_kt, VAPP_kt and VS0_kt).
//  - opts.rating: an engine class of turbofan.engines (the UI's rating choice, owner decision OD-RATINGS). The legacy
//    thrust was fitted for turbofan.engine_default, so T0 and P are scaled by F00(rating)/F00(default): the same lapse
//    shape (Vc = eta·P/T0 unchanged), a different static thrust. Without opts.rating no turbofan path is read.
function acFromCard(card, opts = {}) {
  const isObj = (o) => o !== null && typeof o === 'object' && !Array.isArray(o);
  const NONE = {};
  const fail = (path, what) => Object.assign(new Error(`aircraft card: ${path} ${what}`), { path });
  // the card's _na patterns (plan C4): "a.b.*" or "a.b" mark a.b and every path under it not applicable
  const naList = isObj(card) && isObj(card._na) && Array.isArray(card._na.v) ? card._na.v.filter((x) => typeof x === 'string') : [];
  const isNA = (path) => naList.some((p) => { const q = p.endsWith('.*') ? p.slice(0, -2) : p; return path === q || path.startsWith(q + '.'); });
  // { v, leaf }: the value at path and the leaf it is in (undefined when absent and not needed)
  const walk = (path, need = true) => {
    if (isNA(path)) { if (need) throw fail(path, 'is marked not applicable (_na)'); return undefined; }
    let o = card, leaf = null;
    for (const k of path.split('.')) {
      if (!leaf && isObj(o) && 'v' in o) { leaf = o; o = o.v; }   // a leaf before the path ends: go on in its value
      o = o !== null && typeof o === 'object' && Object.hasOwn(o, k) ? o[k] : NONE;
      if (o === NONE) { if (need) throw fail(path, 'is missing'); return undefined; }
    }
    if (!leaf && isObj(o) && 'v' in o) { leaf = o; o = o.v; }
    if (!leaf) throw fail(path, 'is not a leaf {v, u, scope, src, conf, est, note}');
    return { v: o, leaf };
  };
  const get = (path, need = true) => { const r = walk(path, need); return r && r.v; };
  const num = (path, v = get(path)) => {
    if (typeof v !== 'number' || !Number.isFinite(v)) throw fail(path, `is not a number (${JSON.stringify(v)})`);
    return v;
  };
  const vec3 = (path) => {
    const v = get(path);
    if (!Array.isArray(v) || v.length !== 3) throw fail(path, `is not a vector of 3 numbers (${JSON.stringify(v)})`);
    return v.map((x, i) => num(`${path}.${i}`, x));
  };
  const list = (path) => {
    const v = get(path);
    if (!Array.isArray(v) || !v.length) throw fail(path, `is not a list (${JSON.stringify(v)})`);
    return v;
  };
  // speeds.ias_cas: every row as [[KIAS, KCAS], …] by detent name, checked once at the first need. A row needs 2 pairs or
  // more, positive, with KIAS strictly ascending and KCAS not descending (plan C3: the inverse needs it).
  let iasRows = null;
  const tableRows = () => {
    if (iasRows) return iasRows;
    const tab = get('speeds.ias_cas'), rows = {};
    if (isObj(tab) && isObj(tab.axes) && Array.isArray(tab.data)) {   // lm_lib's { axes: { flap, KIAS }, data } form
      const fl = tab.axes.flap || tab.axes.flaps, ki = tab.axes.KIAS || tab.axes.kias || tab.axes.ias;
      if (Array.isArray(fl) && Array.isArray(ki)) fl.forEach((nm, j) => {
        const row = Array.isArray(tab.data[0]) ? tab.data[j] : fl.length === 1 ? tab.data : undefined;
        if (Array.isArray(row) && row.length === ki.length) rows[String(nm)] = ki.map((k, i) => [k, row[i]]);
      });
    } else if (isObj(tab)) for (const k of Object.keys(tab)) if (Array.isArray(tab[k])) rows[k] = tab[k];
    for (const [name, pairs] of Object.entries(rows)) {
      const ok = pairs.length >= 2 && pairs.every((q, i) => Array.isArray(q) && q.length === 2 && q.every((x) => typeof x === 'number' && Number.isFinite(x) && x > 0)
        && (i === 0 || (q[0] > pairs[i - 1][0] && q[1] >= pairs[i - 1][1])));
      if (!ok) throw fail(`speeds.ias_cas.${name}`, `is not a row of 2 or more [KIAS, KCAS] pairs, above 0, with KIAS strictly ascending and KCAS not descending (${JSON.stringify(pairs)})`);
    }
    return (iasRows = rows);
  };
  // the detents with their flap position f (lift increment over the landing detent's, as the research's flapMap), the
  // landing detent (the largest flap_deg) first
  const detentsF = () => {
    const dets = get('aero.flaps.detents');
    if (!Array.isArray(dets) || !dets.length || !dets.every((d) => isObj(d) && typeof d.flap_deg === 'number' && Number.isFinite(d.flap_deg))) {
      throw fail('aero.flaps.detents', `has no list of detents with flap_deg (${JSON.stringify(dets)})`);
    }
    const full = dets.reduce((a, d) => (d.flap_deg > a.flap_deg ? d : a));
    const lift = dets.every((d) => typeof d.dCL0 === 'number' && Number.isFinite(d.dCL0)) && full.dCL0 > 0;
    return { full, f: (d) => (lift ? d.dCL0 / full.dCL0 : full.flap_deg > 0 ? d.flap_deg / full.flap_deg : 0), dets };
  };
  const landingRow = () => {
    const name = String(detentsF().full.name), pairs = tableRows()[name];
    if (!pairs) throw fail(`speeds.ias_cas.${name}`, 'is missing (the landing detent\'s row of KIAS → KCAS)');
    return [pairs.map((q) => q[0]), pairs.map((q) => q[1])];
  };
  let iasRow = null;   // the landing detent's [KIAS[], KCAS[]], read at the first kt IAS speed
  // a round 3 mass table { axes: { mass_kg, flap? }, data } at ac.m, in the landing detent's column (plan C4)
  const massAxes = (path, v) => {
    const ms = v.axes.mass_kg, D = v.data;
    const okAxis = Array.isArray(ms) && ms.length >= 2 && ms.every((x, i) => typeof x === 'number' && Number.isFinite(x) && (i === 0 || x > ms[i - 1]));
    if (!okAxis || !Array.isArray(D) || D.length !== ms.length) throw fail(path, `is not a mass table { axes: { mass_kg: [ascending] }, data } (${JSON.stringify(v).slice(0, 200)})`);
    return { ms, fl: v.axes.flap, D };
  };
  const atMass = (path, v) => {
    const { ms, fl, D } = massAxes(path, v);
    let col = D;
    if (fl !== undefined) {
      const name = String(detentsF().full.name), j = Array.isArray(fl) ? fl.map(String).indexOf(name) : -1;
      if (j < 0) throw fail(`${path}.axes.flap`, `has no column for the landing detent ${name} (${JSON.stringify(fl)})`);
      col = D.map((row) => (Array.isArray(row) ? row[j] : NaN));
    }
    col.forEach((x, i) => num(`${path}.data.${i}`, x));
    return table1(ms, col, ac.m);
  };
  // the same table with every flap column checked, for AC.spd (plan C5): { ms, noFlap, cols: { <flap name>: [kt…] } },
  // the one column of a table with no flap axis under ''
  const massCols = (path) => {
    const { v } = walk(path);
    if (!isObj(v) || !isObj(v.axes)) throw fail(path, `is not a mass table { axes: { mass_kg: [ascending] }, data } (${JSON.stringify(v).slice(0, 200)})`);
    const { ms, fl, D } = massAxes(path, v), cols = {};
    if (fl === undefined) cols[''] = D;
    else if (!Array.isArray(fl) || !fl.length) throw fail(`${path}.axes.flap`, `is not a list of flap names (${JSON.stringify(fl)})`);
    else fl.forEach((name, j) => { cols[String(name)] = D.map((row) => (Array.isArray(row) ? row[j] : NaN)); });
    for (const [name, col] of Object.entries(cols)) col.forEach((x, i) => num(`${path}.data.${i}${name ? `.${name}` : ''}`, x));
    return { ms, noFlap: fl === undefined, cols };
  };
  const kcas = (path) => {   // the sim's IAS is EAS ≈ CAS below 200 kt: a speed in any other unit would be misread
    const { v, leaf } = walk(path);
    if (leaf.u === 'kt CAS') return isObj(v) && isObj(v.axes) ? atMass(path, v) : num(path, v);
    if (leaf.u !== 'kt IAS') throw fail(path, `is in ${JSON.stringify(leaf.u)}, not kt CAS or kt IAS`);
    const kias = num(path, v);
    iasRow = iasRow || landingRow();
    return table1(iasRow[0], iasRow[1], kias);
  };
  const CFG = [opts.config, 'approach', 'landing', 'cruise', 'clean'];
  const deriv = (path) => {   // a number, or one number per configuration (the first of CFG, else the first numeric key)
    const v = get(path);
    if (!isObj(v)) return num(path, v);
    const isNum = (x) => typeof x === 'number' && Number.isFinite(x);
    const k = CFG.find((c) => c != null && Object.hasOwn(v, c) && isNum(v[c])) ?? Object.keys(v).find((c) => isNum(v[c]));
    if (k === undefined) throw fail(path, `has no numeric configuration (${JSON.stringify(v)})`);
    return v[k];
  };
  const travel = (s, a, b) => {   // deg; a plain number is a symmetric travel (schema-ext D2)
    const p = `controls.surfaces.${s}.travel_deg`, t = get(p);
    return typeof t === 'number' ? [num(p), num(p)] : [num(`${p}.${a}`), num(`${p}.${b}`)];
  };
  const ac = {};
  ac.m = isObj(get('airframe.weights.training_mass')) ? num('airframe.weights.training_mass.kg') : num('airframe.weights.training_mass');
  if (opts.mass !== undefined) {
    if (typeof opts.mass !== 'number' || !(opts.mass > 0) || !Number.isFinite(opts.mass)) throw fail('opts.mass', `is not a mass in kg (${JSON.stringify(opts.mass)})`);
    ac.m = opts.mass;
  }
  const refMass = get('airframe.inertia.ref_mass', false);
  const inertia = (k) => (refMass === undefined ? num('airframe.inertia.' + k) : num('airframe.inertia.' + k) * (ac.m / num('airframe.inertia.ref_mass')));
  for (const k of ['Ixx', 'Iyy', 'Izz', 'Ixz']) ac[k] = inertia(k);
  for (const k of ['S', 'b', 'c']) ac[k] = num('aero.ref.' + k);
  const LEG = ['CL0', 'CLa', 'CLflap', 'CD0', 'K', 'CDflap', 'CDgear', 'Cm0', 'Cma', 'Cmflap', 'aStall', 'aStallFlap', 'aWarn', 'aWarnFlap', 'aWarnHyst', 'aWarnMinOn'];
  const DER = ['CLq', 'CLadot', 'CLde', 'CYb', 'CYdr', 'CYr', 'Clb', 'Clp', 'Clr', 'Clda', 'Cldr', 'Cmq', 'Cmadot', 'Cmde', 'Cnb', 'Cnp', 'Cnr', 'Cnda', 'Cndr'];
  for (const k of LEG) ac[k] = num('aero.legacy.' + k);
  const off = get('aero.legacy.K_CL_offset', false);
  ac.K_CL_offset = off === undefined ? 0.15 : num('aero.legacy.K_CL_offset', off);
  for (const k of DER) ac[k] = deriv('aero.derivatives.' + k);
  for (const k of ['P', 'eta', 'T0', 'idle']) ac[k] = num('propulsion.legacy.' + k);
  if (opts.rating !== undefined) {   // OD-RATINGS: another engine rating of the same legacy thrust curve
    const def = get('turbofan.engine_default'), F00 = (c) => num(`turbofan.engines.${c}.F00`);
    if (typeof def !== 'string') throw fail('turbofan.engine_default', `is not an engine class name (${JSON.stringify(def)})`);
    if (typeof opts.rating !== 'string' || get(`turbofan.engines.${opts.rating}.F00`, false) === undefined) throw fail(`turbofan.engines.${opts.rating}.F00`, 'is missing (opts.rating names no engine class of the card)');
    const r = F00(opts.rating) / F00(def);
    ac.T0 *= r; ac.P *= r;
  }
  const [eUp, eDn] = travel('elevator', 'up', 'down'), [aUp, aDn] = travel('aileron', 'up', 'down'), [rL, rR] = travel('rudder', 'left', 'right');
  ac.deUp = eUp * DEG; ac.deDn = eDn * DEG; ac.daMax = 0.5 * (aUp + aDn) * DEG; ac.drMax = Math.min(rL, rR) * DEG;
  const struts = list('gear.legacy');
  if (struts.length !== 3) throw fail('gear.legacy', `has ${struts.length} struts, the gear model needs 3 (nose, left main, right main)`);
  ac.gear = struts.map((g, i) => {
    const p = `gear.legacy.${i}`, o = { b: vec3(p + '.b'), k: num(p + '.k'), c: num(p + '.c'), stroke: num(p + '.stroke') };
    if (g.steer) o.steer = true;
    if (g.brake) o.brake = true;
    return o;
  });
  ac.Vref = kcas('speeds.VREF_kt'); ac.Vapp = kcas('speeds.VAPP_kt'); ac.Vs0 = kcas('speeds.VS0_kt');
  ac.eye = vec3('airframe.geometry.eye_pos_FRD'); ac.gsAnt = vec3('airframe.geometry.gsAntenna_pos_FRD');
  ac.engines = list('propulsion.layout').map((e, i) => {
    const pos = vec3(`propulsion.layout.${i}.pos`), ax = vec3(`propulsion.layout.${i}.axis`), n = Math.hypot(ax[0], ax[1], ax[2]);
    if (!(n > 0)) throw fail(`propulsion.layout.${i}.axis`, 'has no direction');
    return { pos, dir: [ax[0] / n, ax[1] / n, ax[2] / n] };
  });
  // Plan C3: the card's table as AC.kias (see iasToCas), with Vref, Vapp and Vs0 as the HUD shows them, in KIAS: the
  // card's figure when it is a kt IAS one, else its kt CAS read back through the landing row. A property that
  // Object.keys, JSON and the spread of AC do not list (setAircraft keeps it, null without a table).
  let kias = null;
  if (get('speeds.ias_cas', false) !== undefined) {
    const { full, f, dets } = detentsF(), rows = tableRows(), land = landingRow(), landR = { kias: land[0], kcas: land[1] };
    const list = Object.entries(rows).map(([name, pairs]) => {
      const d = dets.find((x) => String(x.name) === name);
      if (!d) throw fail(`speeds.ias_cas.${name}`, `names no detent of aero.flaps.detents (${dets.map((x) => x.name).join(', ')})`);
      return { f: d === full ? 1 : f(d), kias: pairs.map((q) => q[0]), kcas: pairs.map((q) => q[1]) };
    }).sort((a, b) => a.f - b.f);
    const speed = (path) => { const { v, leaf } = walk(path); return leaf.u === 'kt IAS' ? num(path, v) : rowIas(landR, num(path, v)); };
    kias = { Vref: speed('speeds.VREF_kt'), Vapp: speed('speeds.VAPP_kt'), Vs0: speed('speeds.VS0_kt'), rows: list };
  }
  Object.defineProperty(ac, 'kias', { value: kias, writable: true, enumerable: false, configurable: true });
  // Plan C5: the card's speed model for SPD (see there): kind 'fixed' with no speeds.approach_rule, else the tables, the
  // rule, the VFE of each detent and the ground speed mini. Not enumerable, like AC.kias.
  let spd = { kind: 'fixed' };
  const rl = get('speeds.approach_rule', false);
  if (rl !== undefined) {
    const kind = isObj(rl) ? rl.kind : undefined, P = (k) => num(`speeds.approach_rule.${k}`, isObj(rl) ? rl[k] : undefined);
    const need = { boeing: ['at_kt', 'min_kt', 'max_kt', 'headwind_factor', 'gust_factor', 'vfe_margin_kt'], airbus: ['min_kt', 'max_kt', 'headwind_div'], atr: ['max_kt', 'headwind_div', 'gust_factor', 'vmcl_kt'] }[kind];
    if (!need) throw fail('speeds.approach_rule', `has no kind of boeing, airbus or atr (${JSON.stringify(kind)})`);
    for (const k of need) P(k);
    if (rl.max_option_kt !== undefined) P('max_option_kt');
    const vfe = {};
    for (const d of detentsF().dets) if (typeof d.VFE_kt === 'number' && Number.isFinite(d.VFE_kt)) vfe[String(d.name)] = d.VFE_kt;
    let gs = null;
    const g = get('ops.gs_mini', false);
    if (isObj(g)) {
      const k0 = g.k !== undefined ? num('ops.gs_mini.k', g.k) : null;
      gs = { kAbove: k0 ?? num('ops.gs_mini.k_above_400ft', g.k_above_400ft), kBelow: k0 ?? num('ops.gs_mini.k_below_400ft', g.k_below_400ft), blendS: k0 !== null ? 0 : num('ops.gs_mini.blend_s', g.blend_s) };
    }
    spd = { kind, land: String(detentsF().full.name), rule: { ...rl }, ref: massCols('speeds.VREF_kt'), stall: massCols('speeds.VS0_kt'), app: massCols('speeds.VAPP_kt'), vfe, gs };
  }
  Object.defineProperty(ac, 'spd', { value: spd, writable: true, enumerable: false, configurable: true });
  return ac;
}

// Makes the card's aircraft the one flown: AC keeps no field of the old one and takes the card's (acFromCard throws
// before AC changes), with Iinv rebuilt. Returns AC (the same object as before). An Aircraft built before keeps its
// state but flies the new numbers from its next step. A field the card does not give is deleted, one AC has is
// overwritten and a new one defined: V8 turns an object with more than a few fields added by computed key
// (Object.assign, obj[k] = v) into a slow dictionary, and a deleted field does the same, which made Aircraft.step
// about 40 % slower; defined this way AC keeps fast properties, as the object literal it was before plan B3 did. opts
// goes to acFromCard (opts.config picks the derivatives' configuration; the page passes none).
function setAircraft(card, opts = {}) {
  const next = acFromCard(card, opts);
  next.Iinv = inertiaInverse(next);
  for (const k of Object.keys(AC)) if (!Object.hasOwn(next, k)) delete AC[k];
  for (const k of Object.keys(next)) {
    if (Object.hasOwn(AC, k)) AC[k] = next[k];
    else Object.defineProperty(AC, k, { value: next[k], writable: true, enumerable: true, configurable: true });
  }
  // AC.kias (plan C3) is not enumerable: it stays through the delete loop above, and AC's field list and JSON stay as before
  if (Object.hasOwn(AC, 'kias')) AC.kias = next.kias;
  else Object.defineProperty(AC, 'kias', { value: next.kias, writable: true, enumerable: false, configurable: true });
  // AC.spd (plan C5), the same way
  if (Object.hasOwn(AC, 'spd')) AC.spd = next.spd;
  else Object.defineProperty(AC, 'spd', { value: next.spd, writable: true, enumerable: false, configurable: true });
  return AC;
}

// Force and moment of the engines on the airframe, body axes (FRD) about the CG: F = Σ Tᵢ·dirᵢ, M = Σ posᵢ × (Tᵢ·dirᵢ),
// thrusts[i] the thrust of engine i in N (0 for an engine out, negative in reverse). With the right engine alone
// (pos y > 0) the yaw moment N = M[2] is negative, nose left (T-F-15). The sums start at −0, the additive identity of
// floating point (x + (−0) is x for every x), so one engine along body +x gives F[0] exactly its thrust, F[1] = F[2] = 0
// and, with its thrust line through the CG (pos y = z = 0), M exactly 0. out is reused when given (deriv runs it 5 times
// a step).
function engineLoads(engines, thrusts, out = { F: [0, 0, 0], M: [0, 0, 0] }) {
  const F = out.F, Mo = out.M;
  F[0] = F[1] = F[2] = Mo[0] = Mo[1] = Mo[2] = -0;
  for (let i = 0; i < engines.length; i++) {
    const p = engines[i].pos, d = engines[i].dir, t = thrusts[i];
    const fx = t * d[0], fy = t * d[1], fz = t * d[2];
    F[0] += fx; F[1] += fy; F[2] += fz;
    Mo[0] += p[1] * fz - p[2] * fy; Mo[1] += p[2] * fx - p[0] * fz; Mo[2] += p[0] * fy - p[1] * fx;
  }
  return out;
}

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
    this.engT = []; this.engLoads = { F: [0, 0, 0], M: [0, 0, 0] };   // per-engine thrust and engine loads (deriv scratch)
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
    const CDlin = AC.CD0 + AC.CDflap * Math.pow(f, 1.5) + AC.CDgear * this.gearPos + AC.K * phiGE * (CLlin - AC.K_CL_offset) ** 2 + 0.25 * beta * beta;
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
    // thrust: thr·thrustAvail(V) shared equally among AC.engines (per-engine models come with plans F3, I2, K3), each
    // along its axis from its point (engineLoads); the trainer's one engine adds exactly T to the x force, no moment
    const T = this.thr * thrustAvail(V), eng = AC.engines, th = this.engT;
    const ne = eng.length; for (let i = 0; i < ne; i++) th[i] = T / ne;   // th may keep stale entries past ne: unused
    const E = engineLoads(eng, th, this.engLoads);
    const Fb = [L * lv[0] - D * wh[0] + E.F[0], L * lv[1] - D * wh[1] + Y + E.F[1], L * lv[2] - D * wh[2] + E.F[2]];
    const Mb = [qbar * AC.S * AC.b * Cl + E.M[0], qbar * AC.S * AC.c * Cm + E.M[1], qbar * AC.S * AC.b * Cn + E.M[2]];

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
  // The speed the pilot reads (plan C3): KIAS from the card's table at the flap position now, else the CAS (KIAS = KCAS)
  kias() { return kiasOf(this); }
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

  // Parked on the ground (resets and tests; the page's apron aircraft are drawn, not flown), gear down, idle, brakes on.
  // Plan C7 (research round 3 task item 6, R3-6: each type stands on its own wheel contact points): the CG height and
  // the pitch are the static equilibrium of the card's gear (AC.gear), solved with newtonSolve for zero vertical and
  // pitch acceleration in deriv() at rest, wings level (the throttle then spools to idle against the brakes, as before).
  // Before, every type started at d −1.30 m and θ 0.5° (the trainer's numbers): the trainer 3 mm above and 0.49° nose up
  // of its rest (d −1.303 m, θ 0.01°), the DA40s 0.45 m above theirs, and the airliners' struts up to 2.8 m into the
  // ground, which threw them over (test/flight.test.mjs). Start of the solve: the main wheels deflected by the weight over
  // the sum of the spring rates, θ 0. If the solve fails (no contact, a stroke run out) that start is kept.
  setParked(n, e, psi) {
    const x = this.x, g = AC.gear;
    this.thr = this.cmd.thr = 0; this.brake = this.cmd.brake = 1; this.gearPos = 1; this.cmd.gear = 1;
    const put = (d, th) => { const q = eulerToQ(0, th, psi); x.set([n, e, d, 0, 0, 0, q[0], q[1], q[2], q[3], 0, 0, 0]); };
    // |q| made 1 to the last bit, so renderPose's normalising nlerp draws this state exactly (§9.7): divide by |q|, and
    // where that cycles about 1 by a rounding, step the largest component one unit in the last place toward |q| = 1
    const unit = () => {
      for (let k = 0; k < 12; k++) {
        const l = Math.hypot(x[6], x[7], x[8], x[9]); if (l === 1) return;
        if (k < 2) { for (let i = 6; i < 10; i++) x[i] /= l; continue; }
        let j = 6; for (let i = 7; i < 10; i++) if (Math.abs(x[i]) > Math.abs(x[j])) j = i;
        x[j] -= Math.sign(x[j]) * Math.sign(l - 1) * Number.EPSILON * 2 ** Math.floor(Math.log2(Math.abs(x[j])));
      }
    };
    const res = (v) => { put(v[0], v[1]); this.deriv(x, this.tmp); return [this.tmp[5], this.tmp[11]]; };
    const zMain = Math.max(g[1].b[2], g[2].b[2]), defl = AC.m * G0 / (g[0].k + g[1].k + g[2].k);
    const sol = newtonSolve(res, [-(zMain - defl), 0], { tol: 1e-9 });
    put(...(sol.ok ? sol.x : [-(zMain - defl), 0])); unit();
    this.updateAir(0); this.gen = (this.gen || 0) + 1;
  }
}

// ── Autopilot: coupled ILS approach, flare, decrab and rollout ──
class Autopilot {
  // appr: the flight's Approach (plan C5), the speeds it flies; none = the card's own AC.Vref and AC.Vapp
  constructor(ac, trim, appr = null) {
    this.ac = ac; this.appr = appr; this.mode = 'APP';
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
        const vTgt = this.appr ? this.appr.target(a.hWheel) : lerp(AC.Vref, AC.Vapp, smoothstep(15, 61, a.hWheel));   // cross the threshold at Vref (plus Boeing's gust allowance)
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
  constructor(ac, trim, appr = null) { this.ac = ac; this.appr = appr; this.thHold = trim.th; this.deI = trim.de; this.trimDe = trim.de; this.spdI = trim.thr; }
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
        const err = (this.appr ? this.appr.target(a.hWheel) : lerp(AC.Vref, AC.Vapp, smoothstep(15, 61, a.hWheel))) - a.ias / KT;
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
// Evaluator uses and test/stall.test.mjs checks (T-A-07, 14 CFR 23.207 [A22]). The trainer's 10.71° clean and 6.87°
// with landing flaps are the research round 1 design values (01-flight-physics/01-aero.md §1.6, scripts/expected.mjs),
// about 7 kt above the 1-g stall (6.8–7.3 kt trimmed in this model); §23.207(c) asks for at least 5 kt. Set by α, so
// V_warn/Vs is the same at any weight and load factor; the knot margin scales with √(n·W) (below about 0.54 W clean or
// 0.47 W with flaps it would drop under 5 kt; plan J1 re-checks per type). The Evaluator releases it only aWarnHyst
// below and after aWarnMinOn s on (plan A5 design choice, no source), so a gust spike sounds as a short chirp instead
// of a click; onset is immediate, so the margin and the lead time in a fast pull are kept.
const aWarnAt = (f) => (AC.aWarn + AC.aWarnFlap * f) * DEG;

// ── Landing evaluation: stabilized-approach gates, touchdown, rollout ──
// Speeds (plan C3): the gates, the touchdown record `td.ias` and the speed score read the KIAS of the HUD (Aircraft.kias,
// the card's table at the flap position of that moment) against the card's Vref in KIAS (speedsKias, the POH figure the
// HUD prints beside the speed): the pilot sees one scale, and the 61 KIAS of the C172S is compared as 61 KIAS, not as its
// 63.9 KCAS. The band widths (−5/+20 kt at the gates, −8/+5 kt in the score) are the same knots on that scale. The
// autopilot and the autothrottle (PilotLaws) fly CAS against the flight's Approach (plan C5; AC.Vref and AC.Vapp for a 'fixed' card), the stall
// horn and the stall event keep their 40 kt CAS cut-off, and the Recorder's `ias` is the KIAS shown. With no table
// (the trainer) KIAS = KCAS and every value is the same as before.
class Evaluator {
  // appr: the flight's Approach (plan C5): its Vref in the HUD's unit and the gust allowance kept to touchdown (Boeing);
  // none = the card's own KIAS figure (speedsKias), as before
  constructor(appr = null) {
    this.appr = appr; this.gates = {}; this.td = null; this.events = []; this.maxT = 0; this.stopS = null; this.callouts = []; this.done = false;
    this.lastH = Infinity; this.stallWarn = false; this.unstable = false;
    this.stallHorn = false; this.hornOnT = 0;   // stall warning, every step (horn + HUD); stallWarn latches the debrief stall event
  }
  gateCheck(ac, name) {
    const a = ac.air;
    const ias = kiasOf(ac), vsFpm = a.vs / FT * 60, V = this.appr || speedsKias();
    const items = {
      loc: Math.abs(a.locDots) <= 1, gs: Math.abs(a.gsDots) <= 1,
      spd: ias >= V.Vref - 5 && ias <= V.Vref + 20, vs: vsFpm >= -1000,
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
        t: ac.t, s: a.s, tl: a.t, vsFpm: a.vs / FT * 60, ias: kiasOf(ac), gs: a.gs / KT,
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
    const dv = td.ias - (this.appr ? this.appr.Vref + this.appr.Keep : speedsKias().Vref);
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
      thr: ac.thr, ias: kiasOf(ac), vs: a.vs / FT * 60, s: a.s, tl: a.t, h: a.h, hw: a.hWheel, gsd: a.gsDots, locd: a.locDots, brake: ac.brake, ...extra,
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
  // gust (plan C5): the reported gust increment, kt, for the wind additive of the 737 (SPD.boeing; no scenario gives one,
  // so 0); windCap: the cap of that additive in kt (null = the card's, Vref + 20; SPD.capOption(AC.spd) is the 15 kt of
  // OD-WIND-ADDITIVE, unconfirmed)
  constructor({ wind = SCENARIOS.calm, W20 = null, oatC = WX_DEFAULT.oatC, qnh = WX_DEFAULT.qnh, dewC = WX_DEFAULT.dewC, dist = 5500, pilot = 'ap', assist = true, autoThr = true, seed = 11, dh = 0, dtl = 0, gust = wind.gust ?? 0, windCap = null } = {}) {
    this.ac = new Aircraft();
    qnh = qnh ?? P0_HPA; this.ac.isaDev = oatC - (15 - 0.0065 * FIELD.elev); this.ac.qnh = qnh; this.ac.dewC = dewC;
    this.ac.wind = new Wind({ fromDeg: windFrom(wind), kt: wind.kt, W20: W20 ?? windW20(wind), seed }); this.W20 = this.ac.wind.W20;
    // the approach speeds of this flight (plan C5): the autopilot's autothrottle is always on, a hand flight has the
    // autothrottle only when autoThr is set (the 737's additive depends on it)
    this.appr = new Approach({ wind, gust, atOn: pilot === 'ap' || autoThr, cap: windCap });
    const trim = this.ac.setApproach({ dist, dh, dt: dtl, ias: this.appr.vapp });
    this.trim = trim;
    this.ap = new Autopilot(this.ac, trim, this.appr);
    this.laws = new PilotLaws(this.ac, trim, this.appr);
    this.ev = new Evaluator(this.appr);
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
    this.appr.setAt(this.pilot === 'ap' || this.opts.autoThr);
    this.appr.update(ac, dt);
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
