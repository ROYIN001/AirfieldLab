// ───────────────────────── Atmosphere, sun and sky radiance (pure) ─────────────────────────
// atmosphere(): US Standard Atmosphere 1976, ported from Orbitlab src/physics/atmosphere.ts
// (same layer table, geopotential altitude, R and gamma), with an ISA temperature deviation
// so a hot Thai afternoon changes density, true airspeed and landing roll.

const KT = 0.514444, FT = 0.3048, NM = 1852, G0 = 9.80665;
const DEG = Math.PI / 180, RAD = 180 / Math.PI;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
const wrapPi = (a) => { a = (a + Math.PI) % (2 * Math.PI); if (a < 0) a += 2 * Math.PI; return a - Math.PI; };
const wrap360 = (a) => ((a % 360) + 360) % 360;

const R_AIR = 287.05287, GAMMA_AIR = 1.4, R_EARTH_USSA = 6356766;
const USSA_LAYERS = [
  { hb: 0, Tb: 288.15, L: -0.0065, Pb: 101325 },
  { hb: 11000, Tb: 216.65, L: 0, Pb: 22632.06 },
  { hb: 20000, Tb: 216.65, L: 0.001, Pb: 5474.889 },
  { hb: 32000, Tb: 228.65, L: 0.0028, Pb: 868.0187 },
  { hb: 47000, Tb: 270.65, L: 0, Pb: 110.9063 },
  { hb: 51000, Tb: 270.65, L: -0.0028, Pb: 66.93887 },
  { hb: 71000, Tb: 214.65, L: -0.002, Pb: 3.95642 },
];

function atmosphere(hIn, isaDev = 0) {
  const h = clamp(hIn, 0, 86000);
  const hg = (R_EARTH_USSA * h) / (R_EARTH_USSA + h);
  let layer = USSA_LAYERS[0];
  for (let i = USSA_LAYERS.length - 1; i >= 0; i--) if (hg >= USSA_LAYERS[i].hb) { layer = USSA_LAYERS[i]; break; }
  const dh = hg - layer.hb;
  const Tstd = layer.Tb + layer.L * dh;
  const p = Math.abs(layer.L) < 1e-12
    ? layer.Pb * Math.exp((-G0 * dh) / (R_AIR * layer.Tb))
    : layer.Pb * Math.pow(layer.Tb / Tstd, G0 / (R_AIR * layer.L));
  const T = Tstd + isaDev;           // non-standard day: same pressure, different temperature
  const rho = p / (R_AIR * T);
  return { T, p, rho, a: Math.sqrt(GAMMA_AIR * R_AIR * T) };
}
const RHO0 = 1.225;

// Density altitude (ft) for a pressure altitude and temperature — shown in the briefing
function densityAltitudeFt(elevM, oatC) {
  const isaT = 15 - 0.0065 * elevM;
  return (elevM / FT) + 118.8 * (oatC - isaT);
}

// ── Sun position: NOAA solar calculator (refraction included) ──
function sunPosition(date, lat, lon) {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;
  const L0 = (((280.46646 + T * (36000.76983 + T * 0.0003032)) % 360) + 360) % 360;
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  const C = Math.sin(M * DEG) * (1.914602 - T * (0.004817 + 0.000014 * T)) + Math.sin(2 * M * DEG) * (0.019993 - 0.000101 * T) + Math.sin(3 * M * DEG) * 0.000289;
  const omega = 125.04 - 1934.136 * T;
  const lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(omega * DEG);
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos(omega * DEG);
  const decl = Math.asin(Math.sin(eps * DEG) * Math.sin(lambda * DEG));
  const y = Math.tan((eps * DEG) / 2) ** 2;
  const eqTime = (4 / DEG) * (y * Math.sin(2 * L0 * DEG) - 2 * e * Math.sin(M * DEG) + 4 * e * y * Math.sin(M * DEG) * Math.cos(2 * L0 * DEG) - 0.5 * y * y * Math.sin(4 * L0 * DEG) - 1.25 * e * e * Math.sin(2 * M * DEG));
  const minutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  let tst = (minutes + eqTime + 4 * lon) % 1440;
  if (tst < 0) tst += 1440;
  let ha = tst / 4 - 180;
  if (ha < -180) ha += 360;
  const latR = lat * DEG, haR = ha * DEG;
  const cosZ = clamp(Math.sin(latR) * Math.sin(decl) + Math.cos(latR) * Math.cos(decl) * Math.cos(haR), -1, 1);
  let elev = 90 - Math.acos(cosZ) / DEG;
  if (elev > -0.575) {
    const te = Math.tan(elev * DEG);
    const corr = elev > 5 ? 58.1 / te - 0.07 / te ** 3 + 0.000086 / te ** 5
      : 1735 + elev * (-518.2 + elev * (103.4 + elev * (-12.79 + elev * 0.711)));
    elev += corr / 3600;
  }
  let az = Math.atan2(Math.sin(haR), Math.cos(haR) * Math.sin(latR) - Math.tan(decl) * Math.cos(latR)) / DEG + 180;
  return { elev, az: wrap360(az), decl: decl / DEG };
}

// Render world axes: +X east, +Y up, +Z south (so north is -Z). Azimuth from north, clockwise.
function dirFromElevAz(elev, az) {
  const e = elev * DEG, a = az * DEG;
  return [Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e)];
}

// ── Sky radiance: Preetham-style analytic sky + twilight and night terms. ──
// The same maths runs in GLSL (40-sky.js); here it drives light colours and the fog palette.
const SKY = { turb: 2.6, ray: 1.15, mie: 0.0055, mieG: 0.8, gain: 0.62 };
const SUN_I = 17.0;
const TOTAL_RAYLEIGH = [5.804542996261093e-6, 1.3562911419845635e-5, 3.0265902468824876e-5];
const MIE_CONST = [1.8399918514433978e14, 2.7798023919660528e14, 4.0790479543861094e14];
const SKY_ADD = [0, 0.0003, 0.00075];

function v3dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function v3norm(a) { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }

function skyRad(d, sun) {
  const zc = clamp(sun[1], -1, 1);
  const sunE = 1000 * Math.max(0, 1 - Math.exp(-((1.6110731556870734 - Math.acos(zc)) / 1.5)));
  const sunfade = 1 - clamp(1 - Math.exp(zc), 0, 1);
  const rc = SKY.ray - (1 - sunfade);
  const c = 0.2 * SKY.turb * 10e-18;
  const zen = Math.acos(Math.max(0, d[1]));
  const inv = 1 / (Math.cos(zen) + 0.15 * Math.pow(93.885 - (zen * 180) / Math.PI, -1.253));
  const sR = 8400 * inv, sM = 1250 * inv;
  const ct = v3dot(d, sun);
  const rx = ct * 0.5 + 0.5;
  const rP = 0.05968310365946075 * (1 + rx * rx);
  const g = SKY.mieG, g2 = g * g;
  const mP = 0.07957747154594767 * ((1 - g2) / Math.pow(1 - 2 * g * ct + g2, 1.5));
  const hm = clamp(Math.pow(1 - zc, 5), 0, 1);
  const out = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    const bR = TOTAL_RAYLEIGH[i] * rc, bM = 0.434 * c * MIE_CONST[i] * SKY.mie;
    const Fex = Math.exp(-(bR * sR + bM * sM));
    const ratio = (bR * rP + bM * mP) / (bR + bM);
    let Lin = Math.pow(sunE * ratio * (1 - Fex), 1.5);
    Lin *= 1 + (Math.pow(sunE * ratio * Fex, 0.5) - 1) * hm;
    const tex = (Lin + 0.1 * Fex) * 0.04 + SKY_ADD[i];
    out[i] = Math.pow(tex, 1 / (1.2 + 1.2 * sunfade)) * SKY.gain;
  }
  return out;
}

function skyFull(dIn, sun) {
  const d = [dIn[0], Math.max(dIn[1], 0.0), dIn[2]];
  const dn = v3norm(d);
  const sy = sun[1];
  const L = skyRad(dn, sun);
  const day = smoothstep(-0.12, -0.035, sy);
  const tw = smoothstep(-0.30, -0.02, sy) * (1 - smoothstep(-0.02, 0.07, sy));
  const dy = Math.max(dn[1], 0);
  const hb = 1 + 2.5 * Math.pow(1 - dy, 3);
  const sl = Math.hypot(sun[0], sun[2]) || 1, dl = Math.hypot(dn[0], dn[2]) || 1;
  const ca = Math.max(0, (sun[0] * dn[0] + sun[2] * dn[2]) / (sl * dl));
  const glow = Math.pow(ca, 4) * Math.exp(-dy * 7);
  const base = [0.010, 0.022, 0.060], gc = [0.22, 0.09, 0.03], nb = [0.0016, 0.0024, 0.0048];
  return [0, 1, 2].map((k) => L[k] * day + (base[k] * hb + gc[k] * glow) * tw + nb[k]);
}

// Direct sunlight after the atmosphere (Kasten–Young air mass, per-channel optical depth)
function sunColor(sunY) {
  const el = Math.asin(clamp(sunY, -1, 1)) / DEG;
  const z = Math.min(90, 90 - el);
  const am = 1 / (Math.cos(z * DEG) + 0.50572 * Math.pow(96.07995 - z, -1.6364));
  const vis = smoothstep(-0.9, 0.5, el);
  return [0.115, 0.165, 0.30].map((t) => SUN_I * Math.exp(-t * am) * vis);
}

// Irradiance on an up-facing surface from the sky dome (numerical, 24×8 samples). With extra haze (extinction beta at
// the ground, 1/m, scale height H), each direction keeps exp(−hazeDepthUp) of the sky, as the sky dome draws it from
// the ground, and takes the rest from fog(az): the colour the haze shows at azimuth az (radians, north through east).
function skyIrradianceUp(sun, beta = 0, H, fog) {
  const s = [0, 0, 0];
  const NA = 24, NE = 8;
  for (let j = 0; j < NE; j++) {
    const el = ((j + 0.5) / NE) * (Math.PI / 2);
    const dO = Math.cos(el) * (Math.PI / 2 / NE) * (2 * Math.PI / NA);
    const t = beta > 0 ? Math.exp(-hazeDepthUp(beta, 0, Math.sin(el), H)) : 1;
    for (let i = 0; i < NA; i++) {
      const az = ((i + 0.5) / NA) * 2 * Math.PI;
      const d = [Math.cos(el) * Math.sin(az), Math.sin(el), -Math.cos(el) * Math.cos(az)];
      let L = skyFull(d, sun);
      if (t < 1) { const F = fog(az); L = [0, 1, 2].map((k) => L[k] * t + F[k] * (1 - t)); }
      const w = Math.sin(el) * dO;
      s[0] += L[0] * w; s[1] += L[1] * w; s[2] += L[2] * w;
    }
  }
  return s;
}

const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

// ── Visibility as MOR (owner's research round 4, docs/research/04-weather.md §6.8; WMO-No. 8, ch. 9) ──
// The meteorological optical range V is the path over which a beam keeps 5% of its light, so the extinction
// coefficient at the ground is β = ln20 / V and the transmittance over s metres is exp(−β·s) (Beer–Lambert).
// ln50 / V is Koschmieder's 2% contrast threshold, which the page used before (FogExp2 density 1.98 / V, squared).
const LN20 = Math.log(20), LN50 = Math.log(50);
const morBeta = (visM) => LN20 / visM;
// Optical depth from height h0 along the world vector v = [x, y, z] (m), for extinction beta at the ground that falls
// off as exp(−h / H): beta · |v| · exp(−h0 / H) · (1 − e^−k) / k with k = v.y / H, the exact mean of exp(−h / H) over
// the straight path. H is the haze scale height (SU.uHazeH, 1,600 m: an estimate with no source yet, research §7.4).
// hazeDepth in HAZE_GLSL (30-render.js) is the same formula for the shaders.
function hazeDepth(beta, h0, v, H) {
  const k = v[1] / H;
  const m = Math.abs(k) < 1e-3 ? 1 - k / 2 + (k * k) / 6 : (1 - Math.exp(-k)) / k;
  return beta * Math.hypot(v[0], v[1], v[2]) * Math.exp(-Math.max(h0, 0) / H) * m;
}
// The same haze from height h0 out of the atmosphere along a direction whose vertical component is dy > 0: the limit of
// hazeDepth for an endless path, beta · H · exp(−h0 / H) / dy, with dy held at 0.02 or more near the horizon. The sky
// dome uses it (hazeDepthUp in HAZE_GLSL), and so does the direct sunlight (SkySystem.applySunHaze).
const hazeDepthUp = (beta, h0, dy, H) => (beta * H * Math.exp(-Math.max(h0, 0) / H)) / Math.max(dy, 0.02);
// The sky dome and the clouds come from their own scattering model, which looks like a clear day of about 20 km
// (the page's default visibility; an estimate). Only the extinction beyond that greys them, so low visibility hides
// the sky, the clouds and the direct sunlight while 20 km and 40 km leave them as they were.
const SKY_VIS_M = 20000;
const skyHazeBeta = (visM) => Math.max(0, morBeta(visM) - morBeta(SKY_VIS_M));
// The share of the direct sunlight that crosses that extra haze from the ground towards the sun (sunY = sine of its
// elevation): 1 at 20 km and above, and 0 once the sun is more than 0.02 below the horizon, where sunColor is already 0.
const sunHazeT = (visM, sunY, H) => (sunY > -0.02 ? Math.exp(-hazeDepthUp(skyHazeBeta(visM), 0, sunY, H)) : 0);
