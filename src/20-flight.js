// ───────────────────────── Flight model (pure, no DOM / three.js) ─────────────────────────
// Frames: world NED (north, east, down) with origin at the runway centre on the ground;
// body FRD (x nose, y right wing, z down). Quaternion q = [w,x,y,z] maps body → NED.
// RK4 at 240 Hz, the same integration scheme Orbitlab uses for its rigid-body ascent.

const FIELD = {
  name: 'ท่าอากาศยานดอนเมือง (VTBD)', lat: ARP.lat, lon: ARP.lon, tzH: 7, elev: ARP.elev,
  rwy: '21R', rwyHdg: 209, rwyLen: 3700, rwyWid: 60,
  aim: 314,          // glide-path origin: RDH / tan 3°, metres past the landing threshold
  gs: 3.0,           // glide slope, degrees
  locBeyond: 300,    // localizer array beyond the stop end (derived per runway from AIP coordinates)
  locDot: 0.91,      // degrees per dot (2 dots full scale)
  gsDot: 0.35,       // degrees per dot
  appr: 'ILS', ident: 'IBKK',
};
// Active landing runway frame (NED): unit vector along the landing direction, right normal, threshold.
const RWY_U = [1, 0, 0];
const RWY_R = [0, 1, 0];
const THR03 = [0, 0, 0];
// PAPI on both sides of the landing threshold, inner unit 15 m from the edge, 9 m apart.
// Setting angles from the inner unit outward: 3°30′, 3°10′, 2°50′, 2°30′ (the left bank drives the cockpit widget).
const PAPI = { s: 400, h: 0.9, units: [] };
function setActiveRunway(id) {
  const E = RWY_END[id] || RWY_END['21R'];
  FIELD.rwy = E.id; FIELD.rwyHdg = E.hdg; FIELD.rwyLen = E.lda; FIELD.rwyWid = E.w;
  FIELD.aim = E.aim; FIELD.locBeyond = E.locDist - E.lda; FIELD.appr = E.appr.kind; FIELD.ident = E.appr.ident;
  FIELD.locDot = E.appr.kind === 'ILS' ? 0.91 : 0.8;
  RWY_U[0] = E.u[0]; RWY_U[1] = E.u[1]; RWY_R[0] = -E.u[1]; RWY_R[1] = E.u[0];
  THR03[0] = E.thr[0]; THR03[1] = E.thr[1];
  PAPI.s = E.papi;
  const W2 = E.w / 2;
  PAPI.units = [[15, 3.5], [24, 3 + 10 / 60], [33, 2 + 50 / 60], [42, 2.5]].map(([o, ang]) => ({ t: -(W2 + o), ang }));
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

// Fraction of white for each PAPI unit as seen from an eye point (1 white, 0 red), left→right as
// the pilot sees them on approach to 03: outer (2°30′) … inner (3°30′).
function papiSeen(n, e, h) {
  const [s, t] = rwyLocal(n, e);
  const out = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    const u = PAPI.units[3 - i];
    const d = Math.hypot(PAPI.s - s, u.t - t);
    const ang = Math.atan2(h - PAPI.h, d) * RAD;
    out[i] = (s > PAPI.s) ? -1 : smoothstep(u.ang - 0.03, u.ang + 0.03, ang);
  }
  return out;
}

// ── Seeded random numbers (mulberry32) and Gaussian noise ──
function makeRng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function gauss(r) { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }

// ── Wind: mean wind with a 1/7-power profile (shear on final) + Dryden turbulence,
//    MIL-F-8785C low-altitude form (σw = 0.1·W20, length scales from height). ──
class Wind {
  constructor({ fromDeg = 0, kt = 0, turb = 0, seed = 7 } = {}) {
    this.fromDeg = fromDeg; this.kt = kt; this.turb = turb;
    this.rng = makeRng(seed); this.g = [0, 0, 0];
  }
  speedAt(h) { const W10 = this.kt * KT; return W10 * Math.pow(clamp(h, 0.3, 300) / 10, 1 / 7); }
  mean(h) { const w = this.speedAt(h), a = this.fromDeg * DEG; return [-w * Math.cos(a), -w * Math.sin(a), 0]; }
  update(dt, h, V, hdg) {
    if (this.turb <= 0 || this.kt <= 0) { this.g[0] = this.g[1] = this.g[2] = 0; return; }
    const hft = clamp(h / FT, 10, 1000);
    const W20 = this.speedAt(6.1) / FT;
    const sw = 0.1 * W20 * this.turb, su = sw / Math.pow(0.177 + 0.000823 * hft, 0.4);
    const Lw = hft * FT, Lu = (hft / Math.pow(0.177 + 0.000823 * hft, 1.2)) * FT;
    const Vt = Math.max(V, 10);
    const step = (x, sig, L) => { const a = Math.exp(-Vt * dt / L); return x * a + sig * FT * Math.sqrt(1 - a * a) * gauss(this.rng); };
    this.g[0] = step(this.g[0], su, Lu); this.g[1] = step(this.g[1], su, Lu); this.g[2] = step(this.g[2], sw, Lw);
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
//    typical of the class. A fictional aircraft, not any manufacturer's type: speed limits, trim range,
//    stick forces and tyre data below are design values / estimates for this sim. ──
const AC = {
  m: 2250, Ixx: 2600, Iyy: 7300, Izz: 9200, Ixz: 120,
  S: 16.3, b: 10.2, c: 1.65,
  CL0: 0.25, CLa: 4.8, CLq: 7.5, CLadot: 1.6, CLde: 0.35, CLflap: 0.55,
  CD0: 0.024, K: 0.062, CDflap: 0.050, CDgear: 0.020,
  CYb: -0.60, CYdr: 0.15, CYr: 0.20,
  Clb: -0.085, Clp: -0.47, Clr: 0.11, Clda: 0.16, Cldr: 0.012,
  Cm0: 0.045, Cma: -0.72, Cmq: -12.5, Cmadot: -4.5, Cmde: -1.15, Cmflap: -0.04,   // flaps: camber nose-down partly offset by tail downwash → balloon
  Cnb: 0.075, Cnp: -0.055, Cnr: -0.14, Cnda: -0.010, Cndr: -0.072,
  aStall: 17.0, aStallFlap: -2.5,   // blend centre; effective CLmax ≈ 3° below it
  deUp: 22 * DEG, deDn: 15 * DEG, daMax: 20 * DEG, drMax: 25 * DEG,
  // stall per half span: strip station of the stall loss, wing dihedral, built-in left/right difference
  // kAsym: share of the stall loss that differs between the halves (washout keeps the inboard stall symmetric)
  yS: 2.3, dihedral: 6 * DEG, stallAsym: 0.4 * DEG, kAsym: 0.4,
  // power effects. prop hub (body FRD, m) from the 3D model; shares of the tail and wing inside the slipstream;
  // fin share of the sideslip derivatives (for the swirl sidewash); fin offset that cancels the swirl near cruise;
  // P-factor gain (blade-element estimate: thrust centre moves kPf·w/Ω toward the descending blade);
  // kWing: share of the swirl torque that the wing turns back into roll (opposes the torque reaction)
  prop: [3.94, 0, -0.06], fH: 0.40, fV: 0.35, fW: 0.08,
  finCYb: -0.40, finClb: -0.020, finCnb: 0.11, finOffset: 0.8 * DEG, kPf: 2.5, kWing: 0.5,
  // reversible controls: surface deflection per unit pilot force [rad at q = 0, dynamic pressure (Pa) that halves it]
  stickE: [0.80, 1385], stickA: [0.59, 2000], stickR: [0.70, 2500],
  trimMin: -14 * DEG, trimMax: 6 * DEG, trimRate: 2.0 * DEG,   // elevator trim range (elevator-equivalent) and rate
  // configuration: flap notches UP / TO / LDG (38° on the model), electric flaps ≈ 9 s full travel, gear 6 s
  flapNotch: [0, 0.45, 1], flapName: ['UP', 'TO', 'LDG'], flapDeg: [0, 17, 38], flapRate: 1 / 9, gearTime: 6,
  VFE: [999, 150, 125], VLE: 150, VLO: 150,          // KIAS, design limits of this fictional trainer
  flapLoad: 2790,                                     // Pa: actuator limit q·δf (full flaps at ≈ 131 KEAS, then blow-back)
  gear: [
    { b: [2.30, 0, 1.36], k: 5.2e4, c: 5.0e3, stroke: 0.22, steer: true },
    { b: [-0.35, -1.55, 1.38], k: 1.25e5, c: 1.25e4, stroke: 0.25, brake: 'L' },
    { b: [-0.35, 1.55, 1.38], k: 1.25e5, c: 1.25e4, stroke: 0.25, brake: 'R' },
  ],
  // structure that can touch the ground (body FRD, m, from the 3D model)
  hard: [
    { id: 'tail', b: [-5.40, 0, -0.06] }, { id: 'prop', b: [3.94, 0, 1.07] },
    { id: 'wingL', b: [-0.25, -5.10, -0.12] }, { id: 'wingR', b: [-0.25, 5.10, -0.12] },
    { id: 'belly', b: [1.50, 0, 0.58] }, { id: 'belly', b: [-1.00, 0, 0.50] }, { id: 'belly', b: [-3.40, 0, 0.20] },
  ],
  // tyres: Pacejka-style side force vs slip angle; brake torque limit per main wheel (N at the tyre); pressure (est.)
  tyreB: 9, tyreC: 1.6, brakeF: 7000, tyrePsi: 90, wheelR: 0.29, wheelI: 0.6,
  anchorK: 2.0e5, anchorC: 2.0e4,   // tyre patch stiffness / damping while a brake holds the wheel at rest
  Vref: 88, Vapp: 95, Vs0: 71,   // knots IAS, landing flaps
  gustAdd: 0.2,                  // approach speed additive: kt per (wind kt × turbulence level), about half the gust factor
};
(() => { // inverse inertia tensor (FRD, Ixz product)
  const { Ixx, Iyy, Izz, Ixz } = AC, G = Ixx * Izz - Ixz * Ixz;
  AC.Iinv = [Izz / G, 0, Ixz / G, 0, 1 / Iyy, 0, Ixz / G, 0, Ixx / G];
})();

// ── Runway surface. Wet: 14 CFR 25.109(c)(1) maximum tyre-to-ground braking coefficient of a smooth wet runway
//    (rows for 50 and 100 psi, interpolated linearly as the rule allows). Standing water: dynamic hydroplaning
//    above ≈ 9·√p knots (NASA TN D-2056, Horne & Dreher 1963). Dry peak μ ≈ 0.8 is a typical value (estimate). ──
const SURFACES = { dry: 'แห้ง', wet: 'เปียก', flooded: 'น้ำขัง' };
function wetMu(vkt, psi = AC.tyrePsi) {
  const x = clamp(vkt, 0, 200) / 100;
  const m50 = ((-0.0350 * x + 0.306) * x - 0.851) * x + 0.883;
  const m100 = ((-0.0437 * x + 0.320) * x - 0.805) * x + 0.804;
  return lerp(m50, m100, clamp((psi - 50) / 50, 0, 1));
}
function surfaceMu(kind, vkt) {
  if (kind === 'wet' || kind === 'flooded') {
    let pk = wetMu(vkt);
    if (kind === 'flooded') { const vp = 9 * Math.sqrt(AC.tyrePsi); pk *= 1 - 0.85 * smoothstep(0.8 * vp, vp, vkt); }
    return { pk, sl: 0.6 * pk, roll: kind === 'flooded' ? 0.035 : 0.025 };
  }
  return { pk: 0.80 - 0.001 * clamp(vkt, 0, 200), sl: 0.60, roll: 0.020 };
}
// nose-wheel steering authority falls with ground speed (m/s)
const nwsMax = (gs) => lerp(20, 7, smoothstep(4, 22, gs)) * DEG;
// reversible controls: deflection for a full pilot force at dynamic pressure q
const stickGain = (g, q) => g[0] / (1 + Math.max(q, 0) / g[1]);
// α where separation starts to shake the airframe (buffet = the natural stall warning, ≈ 6–9 kt above Vs at 1 g)
const buffetAlpha = (f) => (AC.aStall + AC.aStallFlap * f - 6 - 1.5 * f) * DEG;
const vfeFor = (f) => (f > AC.flapNotch[1] + 0.02 ? AC.VFE[2] : f > 0.02 ? AC.VFE[1] : AC.VFE[0]);
const flapIndex = (f) => AC.flapNotch.reduce((best, v, i) => (Math.abs(v - f) < Math.abs(AC.flapNotch[best] - f) ? i : best), 0);

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
function solveLin(A, b) {   // Gaussian elimination with partial pivoting (small dense systems)
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    const d = M[c][c] || 1e-12;
    for (let r = c + 1; r < n; r++) { const k = M[r][c] / d; for (let j = c; j <= n; j++) M[r][j] -= k * M[c][j]; }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) { let s = M[r][n]; for (let j = r + 1; j < n; j++) s -= M[r][j] * x[j]; x[r] = s / (M[r][r] || 1e-12); }
  return x;
}

function stallBlend(a, a0) { // Beard & McLain blending: 0 attached flow, 1 separated
  const M = 55, e1 = Math.exp(-M * (a - a0)), e2 = Math.exp(M * (a + a0));
  return (1 + e1 + e2) / ((1 + e1) * (1 + e2));
}

// ── The vehicle ──
class Aircraft {
  constructor() {
    this.x = new Float64Array(13);   // n e d | vn ve vd | qw qx qy qz | p q r
    this.R = new Array(9);
    this.de = 0; this.da = 0; this.dr = 0; this.flaps = 1; this.gearPos = 1; this.steer = 0;
    this.brake = 0; this.brakeL = 0; this.brakeR = 0; this.trim = 0;
    this.eng = new Turboprop().set(0.3); this.thr = this.eng.frac;
    this.cmd = { de: 0, da: 0, dr: 0, flaps: 1, gear: 1, thr: 0.3, brake: 0, brakeL: 0, brakeR: 0 };
    this.adot = 0; this.aPrev = null; this.t = 0;
    this.lock = [false, false, false]; this.slipV = [0, 0, 0]; this.anchor = [null, null, null]; this.skids = 0; this.surface = 'dry';
    this.bufI = 0; this.bufN = [0, 0, 0];
    this.isaDev = 0; this.wind = new Wind();
    this.seed(1);
    this.k = [0, 1, 2, 3].map(() => new Float64Array(13)); this.tmp = new Float64Array(13);
    this.air = {};
  }
  // per-flight randomness: buffet noise and which wing stalls first
  seed(s) { this.rng = makeRng((s * 2654435761) >>> 0); this.asym = (this.rng() < 0.5 ? -1 : 1) * AC.stallAsym * (0.6 + 0.8 * this.rng()); }
  get pcl() { return this.eng.pcl; }

  // all forces / moments for state vector s; fills out with derivatives
  deriv(s, out, diag) {
    const q = [s[6], s[7], s[8], s[9]], R = qToR(q, this.R);
    const w = [s[10], s[11], s[12]];
    const h = -s[2];
    const wind = this.wind.at(h);
    const vab = mulRT(R, [s[3] - wind[0], s[4] - wind[1], s[5] - wind[2]]);
    const V = Math.max(Math.hypot(vab[0], vab[1], vab[2]), 0.1);
    const alpha = Math.atan2(vab[2], vab[0]), beta = Math.asin(clamp(vab[1] / V, -1, 1));
    const atm = atmosphere(FIELD.elev + h, this.isaDev), rho = atm.rho;
    const qbar = 0.5 * rho * V * V;
    const f = this.flaps;
    const hw = Math.max(0.2, h - 0.35);                       // wing height above ground
    const ge = (16 * hw / AC.b) ** 2; const phiGE = ge / (1 + ge);
    const Vr = Math.max(V, 5);   // rate terms need a real airspeed; below walking pace they are meaningless
    const ph = w[0] * AC.b / (2 * Vr), qh = w[1] * AC.c / (2 * Vr), rh = w[2] * AC.b / (2 * Vr);
    const adh = this.adot * AC.c / (2 * Vr);

    // propeller: thrust, slipstream dynamic pressure on the tail and wing root, swirl angle at the fin
    const pr = AC.prop;
    const prop = propeller(this.eng.P, vab[0] + w[1] * pr[2], rho);
    const qs = 0.5 * rho * prop.Vs * prop.Vs;
    const qH = qbar * (1 - AC.fH) + qs * AC.fH, qV = qbar * (1 - AC.fV) + qs * AC.fV;
    const mdot = rho * PROP.A * Math.max(prop.Va + prop.vi, 0.5);
    const swirl = Math.atan2(prop.Q / (mdot * 0.7 * PROP.R), Math.max(prop.Vs, 1));

    // wing: linear lift plus the stall loss of each half span at its own local α (roll rate, yaw rate, dihedral
    // with sideslip, a small built-in difference) — the stalled half drops and drags (wing drop, autorotation)
    const a0 = (AC.aStall + AC.aStallFlap * f) * DEG;
    const CLa = AC.CLa * (1 + 0.12 * (1 - phiGE));
    const CLlin = AC.CL0 + AC.CLflap * f + CLa * alpha + AC.CLq * qh + AC.CLadot * adh + AC.CLde * this.de;
    const CDlin = AC.CD0 + AC.CDflap * Math.pow(f, 1.5) + AC.CDgear * this.gearPos + AC.K * phiGE * (CLlin - 0.15) ** 2 + 0.25 * beta * beta;
    const cG = Math.cos(AC.dihedral), sG = Math.sin(AC.dihedral), ky = 0.5 * AC.yS / AC.b;
    const aRef = Math.atan2(vab[2] * cG, vab[0]);
    let dCL = 0, dCD = 0, dCl = 0, dCn = 0, sig = 0, aMax = -Math.PI;
    for (let side = -1; side <= 1; side += 2) {
      // local α as a bounded perturbation of the centre α (stays sane at large sideslip and in reverse flow)
      const y = side * AC.yS;
      const uh = vab[0] - w[2] * y, wn = (vab[2] + w[0] * y) * cG + side * vab[1] * sG;
      const ah = alpha + clamp(wrapPi(Math.atan2(wn, uh) - aRef), -0.4, 0.4), sg = stallBlend(ah, a0 + side * this.asym);
      const sa = Math.sin(ah), ca = Math.cos(ah);
      const dL = sg * (2 * Math.sign(ah) * sa * sa * ca - (CLlin + CLa * (ah - alpha)));
      const dD = sg * (AC.CD0 + 1.6 * sa * sa - CDlin);
      dCL += 0.5 * dL; dCD += 0.5 * dD;
      // the stalled half drops (lift loss) and drags (pressure drag of separated flow), so it yaws toward itself
      dCl -= side * ky * AC.kAsym * dL; dCn += side * ky * AC.kAsym * sg * 1.6 * sa * sa;
      sig += 0.5 * sg; aMax = Math.max(aMax, ah);
    }
    const CL = CLlin + dCL, CD = CDlin + dCD;
    const CY = AC.CYb * beta + AC.CYr * rh;
    const Cl = AC.Clb * beta + AC.Clp * ph + AC.Clr * rh + AC.Clda * this.da * (1 - 0.6 * sig) + dCl;
    const Cm = AC.Cm0 + AC.Cmflap * f + AC.Cma * alpha + AC.Cmq * qh + AC.Cmadot * adh
      - 0.06 * (1 - phiGE) - sig * 0.25 * Math.max(0, alpha - a0);
    const Cn = AC.Cnb * beta + AC.Cnp * ph + AC.Cnr * rh + AC.Cnda * this.da + dCn;

    // lift ⟂ relative wind in the symmetry plane, drag along it, side force along body y
    const wh = [vab[0] / V, vab[1] / V, vab[2] / V];
    let lv = cross([0, 1, 0], wh); const ll = Math.hypot(lv[0], lv[1], lv[2]) || 1; lv = [lv[0] / ll, lv[1] / ll, lv[2] / ll];
    const qS = qbar * AC.S;
    const L = qbar * (1 - AC.fW) * AC.S * CL, D = qS * CD;
    // wing root in the propeller wash: its own angle of attack in the wash, static lift (no rate terms), at right
    // angles to the wash flow — well defined at standstill, where the free-stream angle of attack is not
    const vsx = Math.max(vab[0] + 2 * prop.vi, 0.1), as = Math.atan2(vab[2], vsx), sgs = stallBlend(as, a0), ssa = Math.sin(as);
    const CLs = (1 - sgs) * (AC.CL0 + AC.CLflap * f + CLa * as + AC.CLde * this.de) + sgs * 2 * Math.sign(as) * ssa * ssa * Math.cos(as);
    const Vw = Math.hypot(vsx, vab[1], vab[2]);
    let lw = cross([0, 1, 0], [vsx / Vw, vab[1] / Vw, vab[2] / Vw]); const lwl = Math.hypot(lw[0], lw[1], lw[2]) || 1; lw = [lw[0] / lwl, lw[1] / lwl, lw[2] / lwl];
    const Ls = qs * AC.fW * AC.S * CLs;
    // fin: rudder works at the fin dynamic pressure; swirl acts like sideslip from the left on the immersed part
    const finB = -qs * AC.fV * swirl + qV * AC.finOffset;
    const Y = qS * CY + qV * AC.S * AC.CYdr * this.dr + AC.S * AC.finCYb * finB;
    const T = prop.T;
    const Fb = [L * lv[0] + Ls * lw[0] - D * wh[0] + T, L * lv[1] + Ls * lw[1] - D * wh[1] + Y, L * lv[2] + Ls * lw[2] - D * wh[2]];
    const Mb = [
      qS * AC.b * Cl + qV * AC.S * AC.b * AC.Cldr * this.dr + AC.S * AC.b * AC.finClb * finB,
      qS * AC.c * Cm + qH * AC.S * AC.c * AC.Cmde * this.de * (1 - 0.5 * sig),   // stalled wing wake blankets the tail
      qS * AC.b * Cn + qV * AC.S * AC.b * AC.Cndr * this.dr + AC.S * AC.b * AC.finCnb * finB,
    ];
    // thrust at the hub, its centre moved toward the descending blade (P-factor); torque reaction rolls left
    const vy = vab[1] + w[2] * pr[0] - w[0] * pr[2], wz = vab[2] - w[1] * pr[0];
    const dy = AC.kPf * wz / PROP.Om, dz = -AC.kPf * vy / PROP.Om;
    Mb[1] += (pr[2] + dz) * T; Mb[2] -= (pr[1] + dy) * T;
    Mb[0] -= (1 - AC.kWing) * prop.Q;
    // stall buffet: separated flow shaking the airframe (noise held for the whole RK4 step)
    if (this.bufI > 0) {
      Fb[2] -= qS * 0.06 * this.bufI * this.bufN[0];
      Mb[1] += qS * AC.c * 0.010 * this.bufI * this.bufN[1]; Mb[0] += qS * AC.b * 0.003 * this.bufI * this.bufN[2];
    }

    let Fn = mulR(R, Fb);
    // landing gear: spring-damper struts; tyres with rolling resistance, torque-limited brakes, slip-angle side
    // force inside the friction circle, and sliding friction when a wheel is locked
    for (let i = 0; i < 3; i++) {
      const g = AC.gear[i];
      if (this.gearPos < 0.98) continue;
      const cn = mulR(R, g.b);
      const pen = s[2] + cn[2];
      if (pen <= 0) continue;
      const vrel = cross(w, g.b), vc0 = mulR(R, vrel);
      const vc = [s[3] + vc0[0], s[4] + vc0[1], s[5] + vc0[2]];
      const xs = Math.min(pen, g.stroke);   // oleo-pneumatic strut: the air spring stiffens as it compresses
      let N = g.k * xs * (1 + 3 * (xs / g.stroke) ** 2) + (pen > g.stroke ? 48 * g.k * (pen - g.stroke) : 0) + g.c * vc[2];
      N = Math.max(0, N);
      const st = g.steer ? this.steer : 0;
      const fw = mulR(R, [Math.cos(st), Math.sin(st), 0]);
      const fl = Math.hypot(fw[0], fw[1]) || 1, fh = [fw[0] / fl, fw[1] / fl], lh = [-fh[1], fh[0]];
      const vl = vc[0] * fh[0] + vc[1] * fh[1], vs = vc[0] * lh[0] + vc[1] * lh[1];
      const mu = surfaceMu(this.surface, Math.abs(vl) / KT), muN = mu.pk * N;
      let Fl, Fs;
      if (this.lock[i]) {
        const k = mu.sl * N / Math.max(Math.hypot(vl, vs), 0.3);
        Fl = -k * vl; Fs = -k * vs;
      } else {
        const brk = g.brake ? (g.brake === 'L' ? this.brakeL : this.brakeR) * AC.brakeF : 0;
        const flMax = Math.min(mu.roll * N + brk, muN), an = this.anchor[i];
        if (an) {
          // held by the brake at rest: the tyre patch is pinned to the runway (static friction) up to the grip
          const dn = s[0] + cn[0] - an[0], de = s[1] + cn[1] - an[1];
          Fl = clamp(-AC.anchorK * (dn * fh[0] + de * fh[1]) - AC.anchorC * vl, -flMax, flMax);
          const smax = Math.sqrt(Math.max(0, muN * muN - Fl * Fl));
          Fs = clamp(-AC.anchorK * (dn * lh[0] + de * lh[1]) - AC.anchorC * vs, -smax, smax);
        } else {
          Fl = -flMax * Math.tanh(vl / 0.25);
          const slip = Math.atan2(vs, Math.max(Math.abs(vl), 1.0));
          const side = muN * Math.sin(AC.tyreC * Math.atan(AC.tyreB * slip));
          const smax = Math.sqrt(Math.max(0, muN * muN - Fl * Fl));
          Fs = -clamp(side, -smax, smax);
        }
      }
      const Fg = [Fl * fh[0] + Fs * lh[0], Fl * fh[1] + Fs * lh[1], -N];
      Fn = [Fn[0] + Fg[0], Fn[1] + Fg[1], Fn[2] + Fg[2]];
      const arm = [g.b[0], g.b[1], g.b[2] - Math.min(pen, g.stroke)];
      const Mg = cross(arm, mulRT(R, Fg));
      Mb[0] += Mg[0]; Mb[1] += Mg[1]; Mb[2] += Mg[2];
      if (diag) { diag.wow[i] = true; diag.load[i] = N; diag.vl[i] = vl; diag.vw[i] = vs; diag.mu[i] = mu.pk; }
    }
    // structure on the ground (tail, propeller, wing tips, belly): stiff contact with scraping friction
    for (const hp of AC.hard) {
      const cn = mulR(R, hp.b), pen = s[2] + cn[2];
      if (pen <= 0) continue;
      const vc0 = mulR(R, cross(w, hp.b)), vc = [s[3] + vc0[0], s[4] + vc0[1], s[5] + vc0[2]];
      const N = Math.max(0, 2.5e5 * pen + 2.0e4 * vc[2]);
      const k = 0.45 * N / Math.max(Math.hypot(vc[0], vc[1]), 0.3);
      const Fg = [-k * vc[0], -k * vc[1], -N];
      Fn = [Fn[0] + Fg[0], Fn[1] + Fg[1], Fn[2] + Fg[2]];
      const Mg = cross(hp.b, mulRT(R, Fg));
      Mb[0] += Mg[0]; Mb[1] += Mg[1]; Mb[2] += Mg[2];
      if (diag) diag.hard[hp.id] = true;
    }
    const m = AC.m;
    out[0] = s[3]; out[1] = s[4]; out[2] = s[5];
    out[3] = Fn[0] / m; out[4] = Fn[1] / m; out[5] = Fn[2] / m + G0;
    // Euler's equations with the propeller's angular momentum (gyroscopic precession)
    const Iw = [AC.Ixx * w[0] - AC.Ixz * w[2] + PROP.H, AC.Iyy * w[1], AC.Izz * w[2] - AC.Ixz * w[0]];
    const wxIw = cross(w, Iw);
    const rhs = [Mb[0] - wxIw[0], Mb[1] - wxIw[1], Mb[2] - wxIw[2]];
    const Ii = AC.Iinv;
    out[10] = Ii[0] * rhs[0] + Ii[2] * rhs[2]; out[11] = Ii[4] * rhs[1]; out[12] = Ii[6] * rhs[0] + Ii[8] * rhs[2];
    out[6] = 0.5 * (-q[1] * w[0] - q[2] * w[1] - q[3] * w[2]);
    out[7] = 0.5 * (q[0] * w[0] + q[2] * w[2] - q[3] * w[1]);
    out[8] = 0.5 * (q[0] * w[1] + q[3] * w[0] - q[1] * w[2]);
    out[9] = 0.5 * (q[0] * w[2] + q[1] * w[1] - q[2] * w[0]);
    if (diag) Object.assign(diag, { V, alpha, beta, qbar, rho, T, L: L + Ls, D, CL, sig, phiGE, wind, prop, qs, qH, qV, swirl, aMax, a0 });
  }

  actuators(dt) {
    const c = this.cmd, a = this.air, rate = (cur, tgt, r) => cur + clamp(tgt - cur, -r * dt, r * dt);
    this.de = rate(this.de, clamp(c.de, -AC.deUp, AC.deDn), 70 * DEG);
    this.da = rate(this.da, clamp(c.da, -AC.daMax, AC.daMax), 80 * DEG);
    this.dr = rate(this.dr, clamp(c.dr, -AC.drMax, AC.drMax), 60 * DEG);
    // flaps: electric actuator; above the limit speed the air load blows them back (hinge load ∝ q·δf)
    const qe = 0.5 * RHO0 * (a.ias || 0) ** 2;
    this.flaps = rate(this.flaps, Math.min(clamp(c.flaps, 0, 1), qe > 1 ? AC.flapLoad / qe : 1), AC.flapRate);
    // gear: the squat switch keeps it down while a wheel carries weight; a leg cannot extend into the runway, so
    // with the airframe on the ground (or the extended wheels below it) an extending gear stalls part-way
    const wow = !!(a.wow && (a.wow[0] || a.wow[1] || a.wow[2])), gearTgt = c.gear || wow ? 1 : 0;
    const jammed = gearTgt > this.gearPos && this.gearPos < 0.98 && (a.contact || (a.hWheel != null && a.hWheel < 0.05));
    if (!jammed) this.gearPos = rate(this.gearPos, gearTgt, 1 / AC.gearTime);
    this.eng.update(dt, c.thr); this.thr = this.eng.frac;
    this.brakeL = rate(this.brakeL, clamp(Math.max(c.brake || 0, c.brakeL || 0), 0, 1), 2.5);
    this.brakeR = rate(this.brakeR, clamp(Math.max(c.brake || 0, c.brakeR || 0), 0, 1), 2.5);
    this.brake = Math.max(this.brakeL, this.brakeR);
    // nose-wheel steering from the pedals, only with the nose strut compressed (centring cam in the air)
    const gs = Math.hypot(this.x[3], this.x[4]);
    this.steer = rate(this.steer, a.wow && a.wow[0] ? clamp(-this.dr / AC.drMax, -1, 1) * nwsMax(gs) : 0, 40 * DEG);
  }

  step(dt) {
    const x = this.x, k = this.k, tmp = this.tmp;
    const h = -x[2];
    this.wind.update(dt, h, this.air.V || 50, Math.atan2(x[4], x[3]));
    if (this.bufI > 0) {   // band-limited (~10 Hz) unit noise for the buffet
      const a = Math.exp(-2 * Math.PI * 10 * dt), b = Math.sqrt(1 - a * a);
      for (let i = 0; i < 3; i++) this.bufN[i] = a * this.bufN[i] + b * gauss(this.rng);
    }
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
    this.updateLocks(dt);
  }

  // Brake torque beyond what the tyre can grip spins the wheel down (wheel, brake and tyre inertia); when its
  // surface speed reaches zero the wheel is locked and slides. It frees once the brake drops below the sliding
  // friction. No anti-skid on this trainer.
  // A braked wheel at rest is pinned to the runway (static friction) until the brake is released; if the force
  // needed exceeds the grip, the pin slides with the tyre.
  updateLocks(dt) {
    const a = this.air, k = AC.wheelR * AC.wheelR / AC.wheelI, x = this.x;
    const R = qToR([x[6], x[7], x[8], x[9]], new Array(9));
    const fl = Math.hypot(R[0], R[3]) || 1, fh = [R[0] / fl, R[3] / fl], lh = [-fh[1], fh[0]];   // main wheels: body x on the ground
    for (let i = 1; i < 3; i++) {
      const N = a.load[i], vl = Math.abs(a.vl[i]);
      if (!(N > 0)) { this.lock[i] = false; this.slipV[i] = 0; this.anchor[i] = null; continue; }
      const mu = surfaceMu(this.surface, vl / KT), Fb = (i === 1 ? this.brakeL : this.brakeR) * AC.brakeF, muN = mu.pk * N;
      const cn = mulR(R, AC.gear[i].b), cp = [x[0] + cn[0], x[1] + cn[1]];
      if (this.anchor[i]) {
        if (Fb < 300 || this.lock[i]) this.anchor[i] = null;
        else {
          const an = this.anchor[i], dl = (cp[0] - an[0]) * fh[0] + (cp[1] - an[1]) * fh[1], ds = (cp[0] - an[0]) * lh[0] + (cp[1] - an[1]) * lh[1];
          const lmL = Math.min(mu.roll * N + Fb, muN) / AC.anchorK, lmS = Math.sqrt(Math.max(0, muN * muN - (AC.anchorK * Math.min(Math.abs(dl), lmL)) ** 2)) / AC.anchorK;
          const dl2 = clamp(dl, -lmL, lmL), ds2 = clamp(ds, -lmS, lmS);
          if (dl2 !== dl || ds2 !== ds) this.anchor[i] = [cp[0] - dl2 * fh[0] - ds2 * lh[0], cp[1] - dl2 * fh[1] - ds2 * lh[1]];
        }
      } else if (!this.lock[i] && Fb > 500 && vl < 0.05 && Math.abs(a.vw[i]) < 0.05) this.anchor[i] = cp;
      if (!this.lock[i]) {
        this.slipV[i] = clamp(this.slipV[i] + k * (Fb - muN) * dt, 0, vl);   // the tyre surface cannot run backwards
        if (vl > 1.0 && this.slipV[i] >= vl) { this.lock[i] = true; this.skids++; this.anchor[i] = null; }
      } else if (vl < 0.3 || Fb < mu.sl * N) { this.lock[i] = false; this.slipV[i] = 0; }
    }
  }

  updateAir(dt = 0) {
    const d = { wow: [false, false, false], load: [0, 0, 0], vl: [0, 0, 0], vw: [0, 0, 0], mu: [0, 0, 0], hard: {} };
    this.deriv(this.x, this.tmp, d);
    // α̇ only means something with real airflow; at a standstill α is the angle of a creep velocity (noise)
    if (this.aPrev !== null && dt > 0) this.adot += ((d.V > 5 ? clamp((d.alpha - this.aPrev) / dt, -2, 2) : 0) - this.adot) * Math.min(1, dt / 0.05);
    this.aPrev = d.alpha;
    const x = this.x, [phi, th, psi] = qToEuler([x[6], x[7], x[8], x[9]]);
    const vg = Math.hypot(x[3], x[4]);
    const R = qToR([x[6], x[7], x[8], x[9]], new Array(9));
    let hWheel = Infinity;
    for (const g of AC.gear) { const c = mulR(R, g.b); hWheel = Math.min(hWheel, -(x[2] + c[2])); }
    const ils = ilsAt(x[0], x[1], -x[2]);
    const a = this.air;
    const wow = d.wow[0] || d.wow[1] || d.wow[2];
    // buffet from about 4° below CLmax (≈ 6–8 kt above the stall), harder at higher dynamic pressure
    this.bufI = !wow && d.V > 15 ? smoothstep(buffetAlpha(this.flaps), d.a0 - 2 * DEG, d.aMax) * clamp(0.6 + 0.4 * d.qbar / 1400, 0.6, 1.4) : 0;
    a.V = d.V; a.ias = d.V * Math.sqrt(d.rho / RHO0); a.alpha = d.alpha; a.beta = d.beta; a.qbar = d.qbar;
    a.phi = phi; a.theta = th; a.psi = psi; a.vs = -x[5]; a.gs = vg; a.track = Math.atan2(x[4], x[3]);
    a.gamma = Math.atan2(-x[5], Math.max(vg, 0.1)); a.h = -x[2]; a.hWheel = hWheel; a.stall = d.sig; a.aMax = d.aMax; a.aStall = d.a0;
    a.buffet = this.bufI;
    a.T = d.T; a.CL = d.CL; a.wind = d.wind; a.phiGE = d.phiGE; a.rho = d.rho;
    a.prop = d.prop; a.qs = d.qs; a.qH = d.qH; a.qV = d.qV; a.swirl = d.swirl; a.ng = this.eng.ng; a.trq = this.eng.frac;
    a.wow = d.wow; a.load = d.load; a.vl = d.vl; a.vw = d.vw; a.mu = d.mu; a.hard = d.hard; a.lock = this.lock;
    a.contact = Object.keys(d.hard).length > 0;
    a.onGround = wow || a.contact;
    a.s = ils.s; a.t = ils.t; a.gsDots = ils.gsDots; a.locDots = ils.locDots;
    a.p = x[10]; a.q = x[11]; a.r = x[12];
    const fb = mulRT(R, [this.tmp[3], this.tmp[4], this.tmp[5] - G0]);   // specific force in body axes
    a.nz = -fb[2] / G0; a.ny = fb[1] / G0;
  }

  // Steady wings-level flight at true airspeed tas and air-relative flight-path angle gamma on air track psiAir:
  // Newton iteration on α, δe, power lever (or γ when pcl is given), β, δa, δr until the six body accelerations
  // vanish. Thrust, slipstream, swirl, P-factor and ground effect are all included through deriv().
  trimFlight({ tas, gamma = 0, h = 300, psiAir = 0, n = 0, e = 0, pcl = null }) {
    const fixP = pcl != null;
    const apply = (u) => {
      const [al, de, g3, be, da, dr] = u, gam = fixP ? g3 : gamma;
      this.de = this.cmd.de = de; this.da = this.cmd.da = da; this.dr = this.cmd.dr = dr;
      this.eng.set(fixP ? pcl : g3); this.thr = this.eng.frac; this.cmd.thr = this.eng.pcl;
      const vb = [tas * Math.cos(al) * Math.cos(be), tas * Math.sin(be), tas * Math.sin(al) * Math.cos(be)];
      const th = al + Math.asin(clamp(Math.sin(gam) / Math.cos(be), -1, 1));
      const psi = psiAir - Math.atan2(vb[1], Math.cos(th) * vb[0] + Math.sin(th) * vb[2]);
      const qq = eulerToQ(0, th, psi), R = qToR(qq, new Array(9)), vn = mulR(R, vb), wm = this.wind.mean(h);
      this.x.set([n, e, -h, vn[0] + wm[0], vn[1] + wm[1], vn[2] + wm[2], qq[0], qq[1], qq[2], qq[3], 0, 0, 0]);
      return { R, th, psi, gam };
    };
    const resid = (u) => {
      const { R } = apply(u), d = new Float64Array(13);
      this.deriv(this.x, d);
      const ab = mulRT(R, [d[3], d[4], d[5]]);
      return [ab[0], ab[1], ab[2], d[10], d[11], d[12]];
    };
    this.adot = 0; this.bufI = 0; this.lock = [false, false, false];
    let u = [3 * DEG, -3 * DEG, fixP ? gamma : 0.3, 0, 0, 0];
    const lo = [-10 * DEG, -AC.deUp, fixP ? -0.6 : 0, -20 * DEG, -AC.daMax, -AC.drMax], hi = [25 * DEG, AC.deDn, fixP ? 0.6 : 1, 20 * DEG, AC.daMax, AC.drMax];
    const maxStep = [3 * DEG, 3 * DEG, fixP ? 2 * DEG : 0.15, 3 * DEG, 4 * DEG, 4 * DEG];
    let r = resid(u), err = Math.hypot(...r), best = u.slice(), bestErr = err;
    for (let it = 0; it < 60 && err > 1e-7; it++) {
      const J = r.map(() => new Array(6).fill(0));
      for (let j = 0; j < 6; j++) {
        const h = u[j] + 1e-6 > hi[j] ? -1e-6 : 1e-6;   // step inward at an upper bound, or the column is zero
        const up = u.slice(); up[j] += h;
        const rj = resid(up);
        for (let i = 0; i < 6; i++) J[i][j] = (rj[i] - r[i]) / h;
      }
      const du = solveLin(J, r.map((v) => -v));
      let lam = 1; for (let j = 0; j < 6; j++) lam = Math.min(lam, maxStep[j] / Math.max(Math.abs(du[j]), 1e-12));
      let nu, nr, ne;
      for (let k = 0; k < 8; k++) {   // backtracking keeps the iteration safe far from the solution
        nu = u.map((v, j) => clamp(v + lam * du[j], lo[j], hi[j])); nr = resid(nu); ne = Math.hypot(...nr);
        if (ne < err || k === 7) break;
        lam *= 0.5;
      }
      u = nu; r = nr; err = ne;
      if (err < bestErr) { best = u.slice(); bestErr = err; }
    }
    u = best; err = bestErr;
    const res = apply(u);
    this.updateAir(0);
    return { alpha: u[0], de: u[1], thr: this.eng.pcl, gamma: res.gam, beta: u[3], da: u[4], dr: u[5], th: res.th, psi: res.psi, err };
  }

  // Trimmed, wings-level state on the extended centre line of the active runway
  setApproach({ dist = 5500, ias = AC.Vapp, dh = 0, dt = 0, gearDown = true, flaps = 1 }) {
    const s = -dist, h = Math.max(30, gpHeight(s) + dh);
    const [n, e] = rwyToNED(s, dt);
    this.flaps = this.cmd.flaps = flaps; this.gearPos = gearDown ? 1 : 0; this.cmd.gear = gearDown ? 1 : 0;
    const atm = atmosphere(FIELD.elev + h, this.isaDev);
    const tas = ias * KT / Math.sqrt(atm.rho / RHO0);
    const wind = this.wind.mean(h);
    const crs = FIELD.rwyHdg * DEG;
    const wAlong = wind[0] * Math.cos(crs) + wind[1] * Math.sin(crs);
    const wCross = -wind[0] * Math.sin(crs) + wind[1] * Math.cos(crs);
    let gammaA = -FIELD.gs * DEG, psiAir = crs;
    for (let it = 0; it < 4; it++) {   // air-relative track and flight path that keep the ground path on the 3° glide path
      const vh = tas * Math.cos(gammaA);
      psiAir = crs - Math.asin(clamp(wCross / vh, -0.6, 0.6));
      const vg = vh * Math.cos(psiAir - crs) + wAlong;
      gammaA = -Math.asin(clamp(vg * Math.tan(FIELD.gs * DEG) / tas, -0.5, 0.5));
    }
    this.brake = this.brakeL = this.brakeR = this.cmd.brake = this.cmd.brakeL = this.cmd.brakeR = 0; this.steer = 0;
    const tr = this.trimFlight({ tas, gamma: gammaA, h, psiAir, n, e });
    this.trim = tr.de;
    this.adot = 0; this.aPrev = null; this.t = 0;
    this.updateAir(0);
    return tr;
  }

  // Parked on the ground (used for apron aircraft, resets and the take-off checks)
  setParked(n, e, psi) {
    const x = this.x; const q = eulerToQ(0, 0.5 * DEG, psi);
    x.set([n, e, -1.30, 0, 0, 0, q[0], q[1], q[2], q[3], 0, 0, 0]);
    this.eng.set(0); this.thr = this.eng.frac; this.cmd.thr = 0;
    this.gearPos = 1; this.cmd.gear = 1; this.lock = [false, false, false]; this.slipV = [0, 0, 0]; this.anchor = [null, null, null];
    this.brake = this.brakeL = this.brakeR = this.cmd.brake = 1; this.cmd.brakeL = this.cmd.brakeR = 0;
    this.de = this.da = this.dr = this.cmd.de = this.cmd.da = this.cmd.dr = 0; this.steer = 0;
    this.adot = 0; this.aPrev = null; this.updateAir(0);
  }
}

// Braking without anti-skid, the way a pilot does it: never ask for more than the tyres can grip (felt through
// the pedals as the load comes onto the wheels), and ease off for a moment if a wheel locks anyway.
function brakeLikeAPilot(st, a, dt, want) {
  const grip = Math.min(a.mu[1] * a.load[1], a.mu[2] * a.load[2]) / AC.brakeF;
  st.grip = grip < st.grip ? grip : st.grip + (grip - st.grip) * Math.min(1, dt / 0.3);   // back off at once, build up gently
  if (a.lock[1] || a.lock[2]) st.relief = 0.5;
  st.relief = Math.max(0, st.relief - dt);
  return want > 0 ? Math.min(want, 0.8 * st.grip) * (st.relief > 0 ? 0.3 : 1) : 0;
}

// Target airspeed on final: Vapp down to Vref over the threshold, plus half the gust factor in turbulence (the usual
// technique; here estimated from the reported wind and its turbulence level), at most 8 kt.
function approachSpeed(ac, a) {
  return lerp(AC.Vref, AC.Vapp, smoothstep(15, 61, a.hWheel)) + clamp(AC.gustAdd * ac.wind.kt * ac.wind.turb, 0, 8);
}

// Go-around (climb-out) when the autopilot is given control over or past the runway: climb on the centre line to
// GA_ALT and hold it at GA_SPEED (design values of this sim).
const GA_ALT = 300, GA_SPEED = 105;

// ── Autopilot: coupled ILS approach, flare, decrab and rollout (it also sets landing gear and flaps) ──
class Autopilot {
  constructor(ac, trim) {
    this.ac = ac; this.mode = 'APP';
    this.thrI = trim.thr; this.thBias = trim.th; this.deI = trim.de; this.thCmd = trim.th;
    this.hFlare = 7; this.tTd = null; this.tFlare = null; this.thTd = 0; this.relief = 0; this.grip = 0;
    this.daI = trim.da || 0; this.drI = trim.dr || 0;   // aileron and rudder trim held against torque and swirl
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
    const hErr = a.h - gpHeight(a.s);
    let gammaCmd = -FIELD.gs * DEG - clamp(0.0028 * hErr, -0.05, 0.05);
    return { phiCmd, gammaCmd, eTrk, dTrackCmd };
  }
  update(dt) {
    const ac = this.ac, a = ac.air, c = ac.cmd, crs = FIELD.rwyHdg * DEG;
    const g = this.guidance();
    let gammaCmd = g.gammaCmd, phiCmd = g.phiCmd;
    const mainsDown = a.wow[1] || a.wow[2];
    const ias = a.ias / KT;
    if (this.mode === 'GA') {
      // go-around / climb-out: take-off flaps once flying fast enough, gear up with a positive climb
      if (ias > 85) c.flaps = Math.min(c.flaps, AC.flapNotch[1]);
      if (a.vs > 2 && a.hWheel > 30) c.gear = 0;
    } else {
      // configure for landing as the speed allows (gear below VLO, each flap notch below its VFE)
      if (ias < AC.VLO - 5) c.gear = 1;
      c.flaps = Math.max(c.flaps, ias < AC.VFE[2] - 5 ? AC.flapNotch[2] : ias < AC.VFE[1] - 5 ? AC.flapNotch[1] : 0);
    }
    if (this.mode === 'GA') {   // climb straight ahead on the centre line to 300 m (≈ 1,000 ft), then hold it
      gammaCmd = a.h < 280 ? 6 * DEG : clamp(0.004 * (GA_ALT - a.h), -0.06, 0.06);
    }
    if (this.mode === 'APP') {
      this.hFlare = clamp(2.4 * Math.max(a.vs < 0 ? -a.vs : 1.5, 1.5), 4.5, 9);
      if (a.hWheel < this.hFlare && a.s > -600) { this.mode = 'FLARE'; this.tFlare = ac.t; }
    }
    if (this.mode === 'FLARE') {
      const vsCmd = -(0.22 + Math.max(a.hWheel, 0) / 2.7);
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
      const blend = smoothstep(11, 4.5, a.hWheel);
      if (blend > 0) {   // decrab: lower the upwind wing to stop the sideways drift while the rudder aligns the nose
        const vLat = this.ac.x[3] * RWY_R[0] + this.ac.x[4] * RWY_R[1];
        phiCmd = lerp(phiCmd, clamp(-2.5 * DEG * vLat - 0.4 * DEG * a.t, -8 * DEG, 8 * DEG), blend);
      }
      this.daI = clamp(this.daI + 0.4 * (phiCmd - a.phi) * dt, -6 * DEG, 6 * DEG);
      c.da = clamp(this.daI + 1.25 * (phiCmd - a.phi) - 0.28 * a.p, -AC.daMax, AC.daMax);
      if (blend <= 0) this.drI = clamp(this.drI - 1.0 * a.beta * dt, -10 * DEG, 10 * DEG);
      c.dr = clamp(this.drI + lerp(-1.6 * a.beta, 1.5 * wrapPi(a.psi - crs) + 0.6 * a.r, blend), -AC.drMax, AC.drMax);
    }
    // longitudinal
    if (this.mode === 'APP' || this.mode === 'FLARE' || this.mode === 'GA') {
      const kg = this.mode === 'FLARE' ? 2.6 : 1.4;
      this.thBias += (gammaCmd - a.gamma) * (this.mode === 'FLARE' ? 1.4 : 0.55) * dt;
      this.thBias = clamp(this.thBias, -8 * DEG, 14 * DEG);
      this.thCmd = clamp(this.thBias + kg * (gammaCmd - a.gamma), -10 * DEG, 14 * DEG);
      if (a.alpha > (AC.aStall + AC.aStallFlap * ac.flaps - 4) * DEG) this.thCmd = Math.min(this.thCmd, a.theta);
      const e = this.thCmd - a.theta;
      this.deI = clamp(this.deI - 0.6 * e * dt, -AC.deUp, AC.deDn);
      c.de = this.deI - 2.0 * e + 0.85 * a.q;
      c.brake = c.brakeL = c.brakeR = 0;
      if (this.mode === 'GA' && a.h < 280) { c.thr = 1; this.thrI = 0.6; }   // full power for the climb
      else if (this.mode === 'APP' || this.mode === 'GA') {
        const vTgt = this.mode === 'GA' ? GA_SPEED : approachSpeed(ac, a);   // cross the threshold at Vref plus half the gust factor
        const err = vTgt - a.ias / KT;
        this.thrI = clamp(this.thrI + 0.0045 * err * dt, 0, 1);
        c.thr = clamp(this.thrI + 0.035 * err, 0, 1);
      } else {
        c.thr = Math.max(0, c.thr - dt / 4);   // ease the power off through the flare (idle is draggy on a turboprop)
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
      c.brake = brakeLikeAPilot(this, a, dt, a.wow[0] && tSince > 2.5 ? (a.gs > 3 ? 0.42 : a.gs > 0.3 ? 0.55 : 1) : 0); c.brakeL = c.brakeR = 0;
      if (a.gs < 0.6 && a.wow[0]) this.mode = 'STOP';
    }
    ac.trim = this.deI;
    this.out = { phiCmd, gammaCmd, thCmd: this.thCmd };
    return c;
  }
}

// ── Pilot assist (attitude command) and direct control for manual flying ──
class PilotLaws {
  constructor(ac, trim) {
    this.ac = ac; this.thHold = trim.th; this.deI = trim.de; this.trimDe = trim.de; this.spdI = trim.thr; this.tdAt = null;
    this.daI = trim.da || 0; this.drI = trim.dr || 0; this.relief = 0; this.grip = 0;
    this.ailTrim = trim.da || 0; this.rudTrim = trim.dr || 0;   // DIRECT: aileron auto-trim and rudder trim aid
  }
  // inp: x roll (+right), y pitch (+pull), rud (+right), thr power lever 0..1, brake / brakeL / brakeR 0..1,
  // trim (+1 nose up … −1 nose down, held), flaps notch index, gear selector 1 down / 0 up
  // opts: assist (attitude command), autoThr (speed hold), autoTrim (DIRECT: hold attitude when released)
  update(dt, inp, opts, apOut) {
    const ac = this.ac, a = ac.air, c = ac.cmd, crs = FIELD.rwyHdg * DEG;
    const onG = a.onGround, mainsDown = a.wow[1] || a.wow[2];
    c.flaps = AC.flapNotch[clamp(Math.round(inp.flaps ?? 2), 0, AC.flapNotch.length - 1)];
    c.gear = (inp.gear ?? 1) ? 1 : 0;
    if (mainsDown && this.tdAt == null) this.tdAt = ac.t;
    let autoBrake = 0;
    if (opts.assist) {
      const phiCmd = (Math.abs(inp.x) > 0.04 ? inp.x : 0) * 33 * DEG;
      if (!onG) this.daI = clamp(this.daI + 0.4 * (phiCmd - a.phi) * dt, -6 * DEG, 6 * DEG);
      c.da = clamp(this.daI + 1.25 * (phiCmd - a.phi) - 0.28 * a.p, -AC.daMax, AC.daMax);
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
        c.dr = clamp(this.drI + lerp(-1.6 * a.beta, 1.5 * wrapPi(a.psi - crs) + 0.6 * a.r, blend), -AC.drMax, AC.drMax);
      } else {
        // turn coordinator: rudder keeps the ball centred, with an integrator for the propeller's yaw
        if (Math.abs(inp.rud) < 0.05) this.drI = clamp(this.drI - 1.0 * a.beta * dt, -10 * DEG, 10 * DEG);
        c.dr = clamp(this.drI - 1.6 * a.beta - rudUser, -AC.drMax, AC.drMax);
      }
      if (opts.autoThr && !onG && a.hWheel > 6) {
        const err = approachSpeed(ac, a) - a.ias / KT;
        this.spdI = clamp(this.spdI + 0.0045 * err * dt, 0, 1);
        c.thr = clamp(this.spdI + 0.035 * err, 0, 1);
      } else if (opts.autoThr && !onG) c.thr = Math.max(0, c.thr - dt / 2.5);
      else c.thr = onG ? Math.min(inp.thr, c.thr) : inp.thr;
      if (opts.autoThr) inp.thr = c.thr;
      // auto-brake once the nose wheel is down
      const tdAge = this.tdAt != null ? ac.t - this.tdAt : 0;
      autoBrake = brakeLikeAPilot(this, a, dt, a.wow[0] && tdAge > 2.5 ? (a.gs > 3 ? 0.42 : a.gs > 0.3 ? 0.55 : 1) : 0);
      ac.trim = this.deI;
    } else {
      // reversible controls: the input is a pilot force; the deflection it buys falls as dynamic pressure rises.
      // Elevator trim by hand (trim keys) or automatic: with the stick released the trim follows the pitch
      // attitude rate (θ̇, so a level turn does not trim the nose down) and, with auto-trim on, the aileron trim
      // stops a slow roll. A rudder trim aid (like the trim-aid device of modern turboprop trainers) centres the
      // ball against propeller yaw whenever the pedals are free.
      const thDot = a.q * Math.cos(a.phi) - a.r * Math.sin(a.phi), auto = opts.autoTrim !== false && !onG;
      if (inp.trim) this.trimDe = clamp(this.trimDe - inp.trim * AC.trimRate * dt, AC.trimMin, AC.trimMax);
      else if (auto && Math.abs(inp.y) < 0.05) this.trimDe = clamp(this.trimDe + 0.25 * thDot * dt, AC.trimMin, AC.trimMax);
      if (auto && Math.abs(inp.x) < 0.05) this.ailTrim = clamp(this.ailTrim - 0.3 * a.p * dt, -6 * DEG, 6 * DEG);
      if (!onG && Math.abs(inp.rud) < 0.05) this.rudTrim = clamp(this.rudTrim - 0.8 * a.beta * dt, -10 * DEG, 10 * DEG);
      c.de = this.trimDe - inp.y * stickGain(AC.stickE, a.qH);
      c.da = this.ailTrim + inp.x * stickGain(AC.stickA, a.qbar);
      c.dr = this.rudTrim - inp.rud * stickGain(AC.stickR, a.qV);
      c.thr = inp.thr;
      ac.trim = this.trimDe;
    }
    const bAll = inp.brake || 0;
    c.brake = 0;
    c.brakeL = Math.max(bAll, inp.brakeL || 0, autoBrake);
    c.brakeR = Math.max(bAll, inp.brakeR || 0, autoBrake);
    return c;
  }
}

// ── Landing evaluation: stabilized-approach gates, touchdown, rollout, limits and damage ──
const EVENT_TEXT = {
  stall: 'มีสัญญาณเตือนสตอล', excursion: 'ออกนอกทางวิ่ง', wingtip: 'ปลายปีกแตะพื้น', crash: 'กระแทกพื้นแรงเกินไป',
  tailstrike: 'หางครูดพื้น', propstrike: 'ใบพัดกระทบพื้น', belly: 'ลำตัวแตะพื้น (ล้อไม่ได้กาง)',
  flapOver: 'ความเร็วเกิน VFE ขณะกางแฟลป', gearOver: 'ความเร็วเกิน VLE ขณะล้อลง', skid: 'ล้อล็อกและลื่นไถล',
};
class Evaluator {
  constructor() {
    this.gates = {}; this.td = null; this.events = []; this.maxT = 0; this.stopS = null; this.callouts = []; this.done = false;
    this.lastH = Infinity; this.stallWarn = false; this.unstable = false;
  }
  has(k) { return this.events.some((e) => e.k === k); }
  once(t, k) { if (!this.has(k)) this.events.push({ t, k }); }
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
    if (!a.onGround && a.ias > 40 * KT && (a.stall > 0.25 || a.alpha > (AC.aStall + AC.aStallFlap * ac.flaps - 4) * DEG)) { if (!this.stallWarn) this.events.push({ t: ac.t, k: 'stall' }); this.stallWarn = true; }
    const ias = a.ias / KT;
    if (ac.flaps > 0.05 && ias > vfeFor(ac.flaps) + 3) this.once(ac.t, 'flapOver');
    if (ac.gearPos > 0.02 && ias > AC.VLE + 3) this.once(ac.t, 'gearOver');
    const H = a.hard || {};
    if (H.tail) this.once(ac.t, 'tailstrike');
    if (H.prop) this.once(ac.t, 'propstrike');
    if (H.wingL || H.wingR) this.once(ac.t, 'wingtip');
    if (H.belly) this.once(ac.t, 'belly');
    if (ac.skids > 0) this.once(ac.t, 'skid');
    if (!this.td && a.onGround) {
      const crs = FIELD.rwyHdg * DEG;
      const vLat = ac.x[3] * RWY_R[0] + ac.x[4] * RWY_R[1];
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
    // limits exceeded and handling faults cost points; damage caps the score
    if (this.has('flapOver')) total -= 8;
    if (this.has('gearOver')) total -= 8;
    if (this.has('skid')) total -= 4;
    if (!td.onRunway) total = Math.min(total, 20);
    if (this.has('excursion')) total = Math.min(total, 15);
    if (sink > 600) total = Math.min(total, 35);
    if (this.has('wingtip')) total = Math.min(total, 30);
    if (this.has('tailstrike')) total = Math.min(total, 45);
    if (this.has('propstrike')) total = Math.min(total, 25);
    if (this.has('belly')) total = Math.min(total, 10);
    if (this.has('crash')) total = 0;
    total = Math.max(0, Math.round(total));
    const grade = total >= 90 ? 'ดีเยี่ยม' : total >= 75 ? 'ดี' : total >= 60 ? 'ผ่าน' : 'ต้องฝึกเพิ่ม';
    return { total, grade, parts };
  }
}

// ── Recorder for replay and the debrief charts (10 Hz) ──
class Recorder {
  constructor() { this.f = []; this.next = 0; }
  sample(ac, extra = {}) {
    if (ac.t < this.next) return;
    this.next = ac.t + 0.1;
    const x = ac.x, a = ac.air;
    this.f.push({
      t: ac.t, n: x[0], e: x[1], d: x[2], q: [x[6], x[7], x[8], x[9]], de: ac.de, da: ac.da, dr: ac.dr, fl: ac.flaps, gr: ac.gearPos,
      thr: ac.thr, ias: a.ias / KT, vs: a.vs / FT * 60, s: a.s, tl: a.t, h: a.h, hw: a.hWheel, gsd: a.gsDots, locd: a.locDots, brake: ac.brake,
      st: ac.steer, trim: ac.trim, ng: ac.eng.ng, bL: ac.brakeL, bR: ac.brakeR, buf: a.buffet, ...extra,
    });
  }
  at(t) {
    const f = this.f; if (!f.length) return null;
    if (t <= f[0].t) return f[0];
    if (t >= f[f.length - 1].t) return f[f.length - 1];
    let lo = 0, hi = f.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (f[m].t <= t) lo = m; else hi = m; }
    const A = f[lo], B = f[hi], u = (t - A.t) / (B.t - A.t);
    let qb = B.q; if (A.q[0] * qb[0] + A.q[1] * qb[1] + A.q[2] * qb[2] + A.q[3] * qb[3] < 0) qb = qb.map((v) => -v);
    const q = A.q.map((v, i) => lerp(v, qb[i], u)); const ql = Math.hypot(...q);
    const o = {};
    for (const k in A) if (typeof A[k] === 'number') o[k] = lerp(A[k], B[k], u);
    o.q = q.map((v) => v / ql);
    return o;
  }
}

// ── A flight: aircraft + wind + autopilot / pilot laws + evaluation + recording ──
// Winds are given relative to the landing runway (rel 0 = straight down the runway, +90 from the right).
const SCENARIOS = {
  calm: { label: 'ลมสงบ', rel: 0, kt: 0, turb: 0 },
  head: { label: 'ลมสวน 10 kt', rel: 0, kt: 10, turb: 0.6 },
  xr: { label: 'ลมขวาง 10 kt จากขวา', rel: 90, kt: 10, turb: 0.8 },
  xl: { label: 'ลมขวาง 15 kt จากซ้าย + กระโชก', rel: -90, kt: 15, turb: 1.6 },
};
const windFrom = (sc) => (sc.fromDeg != null ? sc.fromDeg : Math.round(wrap360(FIELD.rwyHdg + sc.rel)));

class Flight {
  constructor({ wind = SCENARIOS.calm, oatC = 31, dist = 5500, pilot = 'ap', assist = true, autoThr = true, autoTrim = true, surface = 'dry', seed = 11, dh = 0, dtl = 0 } = {}) {
    this.ac = new Aircraft();
    this.ac.isaDev = oatC - (15 - 0.0065 * FIELD.elev);
    this.ac.wind = new Wind({ fromDeg: windFrom(wind), kt: wind.kt, turb: wind.turb, seed });
    this.ac.surface = SURFACES[surface] ? surface : 'dry';
    this.ac.seed(seed);
    const trim = this.ac.setApproach({ dist, dh, dt: dtl });
    this.trim = trim;
    this.ap = new Autopilot(this.ac, trim);
    this.laws = new PilotLaws(this.ac, trim);
    this.ev = new Evaluator();
    this.rec = new Recorder();
    this.pilot = pilot; this.opts = { assist, autoThr, autoTrim };
    this.input = { x: 0, y: 0, rud: 0, thr: trim.thr, brake: 0, brakeL: 0, brakeR: 0, trim: 0, flaps: 2, gear: 1 };
    this.acc = 0; this.dt = 1 / 240; this.finishedAt = null; this.oatC = oatC; this.windSpec = wind; this.surface = this.ac.surface;
    this.crashed = false;
  }
  setPilot(p) {
    if (p === this.pilot) return;
    const ac = this.ac;
    const a = ac.air, ap = this.ap, laws = this.laws;
    if (p === 'ap') {           // hand back: re-seed the autopilot from the current state and pick its mode afresh
      ap.thBias = a.theta; ap.thCmd = a.theta; ap.deI = ac.de; ap.thrI = ac.pcl;
      ap.daI = clamp(this.opts.assist ? laws.daI : laws.ailTrim, -6 * DEG, 6 * DEG);
      ap.drI = clamp(this.opts.assist ? laws.drI : laws.rudTrim, -10 * DEG, 10 * DEG);
      if (!a.onGround) {
        // airborne: keep a genuine flare (low and sinking); otherwise a new approach while the runway is still ahead,
        // or a go-around (climb straight ahead) once over or past the threshold
        if (!(ap.mode === 'FLARE' && a.hWheel < 10 && a.vs < 0)) { ap.mode = a.s < -300 ? 'APP' : 'GA'; ap.tFlare = null; ap.tTd = null; }
      } else if (ap.mode !== 'ROLLOUT') { ap.mode = 'ROLLOUT'; ap.tTd = ac.t; ap.thTd = a.theta; ap.thCmd = a.theta; }
    } else {
      // take over: the trims start from the autopilot's steady (integrator) parts, not its momentary corrections
      laws.thHold = a.theta; laws.deI = ac.de; laws.spdI = ac.pcl;
      laws.trimDe = clamp(ap.deI, AC.trimMin, AC.trimMax);
      laws.daI = laws.ailTrim = clamp(ap.daI, -6 * DEG, 6 * DEG); laws.drI = laws.rudTrim = clamp(ap.drI, -10 * DEG, 10 * DEG);
      Object.assign(this.input, { thr: ac.pcl, flaps: flapIndex(ac.cmd.flaps), gear: ac.cmd.gear ? 1 : 0, trim: 0 });
    }
    this.pilot = p;
  }
  advance(realDt) {
    this.acc += Math.min(realDt, 0.1);
    let n = 0;
    while (this.acc >= this.dt && n < 60) { this.tick(this.dt); this.acc -= this.dt; n++; }
  }
  tick(dt) {
    const ac = this.ac;
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
    if (a.h < -0.5) { this.crashed = true; }
    this.ev.update(ac, this.ap);
    this.rec.sample(ac, { mode: this.pilot === 'ap' ? this.ap.mode : 'MAN' });
    if (this.ev.done && this.finishedAt == null) this.finishedAt = ac.t;
  }
  phase() {
    const a = this.ac.air;
    if (this.crashed) return 'CRASH';
    if (this.ev.done) return 'DONE';
    if (this.pilot === 'ap' && this.ap.mode === 'GA') return 'GA';
    if (this.ev.td && a.hWheel < 10) return 'ROLLOUT';   // on the runway, or a bounce
    if (this.pilot === 'ap') return this.ap.mode;
    return a.hWheel < 10 ? 'FLARE' : this.ev.td ? 'GA' : 'APP';   // climbing away after a touch-and-go
  }
}
