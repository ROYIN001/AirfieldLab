// ───────────────────────── Don Mueang (VTBD): geodesy and AIP runway data (pure) ─────────────────────────
// Local frame: origin at the aerodrome reference point (ARP), n north / e east in metres, ground at d = 0.
// Source: AIP Thailand AD 2 VTBD (CAAT, AIRAC 29 OCT 2026, AMDT 11/26) — AD 2.2, 2.12–2.15, 2.19. Runway, lighting and
// ILS values are unchanged since AIRAC 14 MAY 2026, and AIRAC 26 NOV and 24 DEC 2026 change nothing for VTBD (research
// round 5 §1 and 5D). The ARP keeps the 14 MAY 2026 value 135451.74N 1003620.49E (elevation 2.65 m) because AMDT 11/26
// rounds it to 135452N 1003620E (3 m). test/aip.test.mjs checks RWY_DATA against test/fixtures/aip_vtbd_current.json.

const dms = (d, m, s) => d + m / 60 + s / 3600;
const ARP = { lat: dms(13, 54, 51.74), lon: dms(100, 36, 20.49), elev: 2.65 };
const GEO = (() => {
  const a = 6378137, f = 1 / 298.257223563, e2 = f * (2 - f), p = ARP.lat * DEG, s2 = Math.sin(p) ** 2;
  return { M: a * (1 - e2) / Math.pow(1 - e2 * s2, 1.5), N: a / Math.sqrt(1 - e2 * s2), cosp: Math.cos(p) };
})();
function llToNE(lat, lon) { return [(lat - ARP.lat) * DEG * GEO.M, (lon - ARP.lon) * DEG * GEO.N * GEO.cosp]; }
function neToLL(n, e) { return [ARP.lat + n / GEO.M * RAD, ARP.lon + e / (GEO.N * GEO.cosp) * RAD]; }

// PAPI (ICAO Annex 14 §5.3.5, 3° setting): four units on the left of each landing threshold, the inner one 15 m outside
// the runway edge and 9 m apart, light centre PAPI_GEOM.h above the ground (the light sprites in 60-lights.js use it).
// Settings from the inner unit outward: 3°30′, 3°10′, 2°50′, 2°30′.
const PAPI_GEOM = { h: 0.64, off: [15, 24, 33, 42], ang: [3.5, 3 + 10 / 60, 2 + 50 / 60, 2.5] };
// AIP AD 2.14 publishes MEHT but not the PAPI distance, so the distance is an estimate solved from MEHT in the same
// geometry the sim draws and colours: an eye on the centre line at MEHT over the threshold sits exactly on the lower
// edge of the on-slope signal, i.e. sees the 2°50′ unit (33 m outside the edge, light at h) at 2°50′.
function papiFromMEHT(ft, w) {
  const r = (ft * FT - PAPI_GEOM.h) / Math.tan(PAPI_GEOM.ang[2] * DEG), t = w / 2 + PAPI_GEOM.off[2];
  return Math.round(Math.sqrt(r * r - t * t) * 10) / 10;
}

const RWY_DATA = [
  {
    id: '03L/21R', w: 60, cl: true, conc: [217, 122],
    ends: [
      { id: '03L', thr: [dms(13, 53, 49.24), dms(100, 35, 45.38)], als: 'SALS420', tdz: false, mehtFt: 71.85,
        appr: { kind: 'ILS', ident: 'IBKD', freq: '109.7', cat: 'I', loc: [dms(13, 55, 43.8), dms(100, 36, 49.7)], gp: [dms(13, 53, 56.4), dms(100, 35, 54.0)], rdhFt: 55 } },
      { id: '21R', thr: [dms(13, 55, 34.87), dms(100, 36, 44.62)], als: 'CAT2', tdz: true, mehtFt: 65.42,
        appr: { kind: 'ILS', ident: 'IBKK', freq: '109.3', cat: 'II', loc: [dms(13, 53, 40.6), dms(100, 35, 40.6)], rdhFt: 54 } },
    ],
  },
  {
    id: '03R/21L', w: 45, cl: false, conc: [0, 0],
    ends: [
      { id: '03R', thr: [dms(13, 53, 58.45), dms(100, 36, 5.50)], als: 'SALS300', tdz: false, mehtFt: 63.35,
        appr: { kind: 'RNP', ident: 'RNP 03R', tchFt: 50 } },   // AD 2.24 chart RNAV/RNP RWY 03R: VPA 3.00°, TCH 50 ft
      { id: '21L', thr: [dms(13, 55, 28.33), dms(100, 36, 55.97)], disp: 350, als: 'CAT1', tdz: false, mehtFt: 63.81,
        appr: { kind: 'ILS', ident: 'IDMG', freq: '110.3', cat: 'I', loc: [dms(13, 53, 51.8), dms(100, 36, 1.8)], rdhFt: 53 } },
    ],
  },
];

// Derived geometry per runway and per landing direction.
const RUNWAYS = RWY_DATA.map((r) => {
  const [A, B] = r.ends;
  const tA = llToNE(...A.thr), tB = llToNE(...B.thr);
  const dn = tB[0] - tA[0], de = tB[1] - tA[1], L = Math.hypot(dn, de), u = [dn / L, de / L];
  const dispA = A.disp || 0, dispB = B.disp || 0;
  // physical pavement ends (s measured from the low end along u)
  const p0 = [tA[0] - u[0] * dispA, tA[1] - u[1] * dispA], len = L + dispA + dispB;
  return { id: r.id, w: r.w, cl: r.cl, conc: r.conc, p0, u, r: [-u[1], u[0]], len, hdg: wrap360(Math.atan2(u[1], u[0]) * RAD), ends: [A.id, B.id], sThr: [dispA, dispA + L] };
});

const RWY_END = {};
RWY_DATA.forEach((r, ri) => r.ends.forEach((E, k) => {
  const R = RUNWAYS[ri];
  const sgn = k === 0 ? 1 : -1;
  const u = [R.u[0] * sgn, R.u[1] * sgn];
  const thr = llToNE(...E.thr);
  const far = k === 0 ? [R.p0[0] + R.u[0] * R.len, R.p0[1] + R.u[1] * R.len] : R.p0.slice();
  const lda = Math.hypot(far[0] - thr[0], far[1] - thr[1]);
  const along = (p) => (p[0] - thr[0]) * u[0] + (p[1] - thr[1]) * u[1];
  const a = E.appr;
  let aim, locDist;
  if (a.kind === 'ILS') {
    aim = (a.rdhFt * FT) / Math.tan(3 * DEG);
    locDist = along(llToNE(...a.loc));
  } else {
    aim = (a.tchFt * FT) / Math.tan(3 * DEG);
    locDist = lda + 300;   // virtual lateral reference for the RNP final segment
  }
  RWY_END[E.id] = {
    id: E.id, rwy: R, ri, k, u, r: [-u[1], u[0]], thr, far, lda, w: R.w, hdg: wrap360(Math.atan2(u[1], u[0]) * RAD),
    disp: E.disp || 0, als: E.als, tdz: E.tdz, papi: papiFromMEHT(E.mehtFt, R.w), meht: E.mehtFt * FT, appr: a, aim, locDist,
    gpAntenna: a.gp ? along(llToNE(...a.gp)) : null,
  };
}));
