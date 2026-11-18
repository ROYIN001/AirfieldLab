// d_vtbd_papi.mjs — round 3 topic 3.5 (prefix D)
// ILS / PAPI / MEHT geometry at Don Mueang (VTBD) for each airliner type.
// Inputs: AIP Thailand AD 2 VTBD (RDH, MEHT; see report refs D23/D24), Boeing "Visual Landing Aids Data" Rev A 2026 (D3),
// Airbus "Aircraft Data for Visual Aids Calibration" 2023 (D4), ATR values are estimates (est).
// Definitions (Airbus D4 wording): H = ILS-beam-to-wheel-path height, H1 = eye-path-to-wheel-path height (EWPH),
// H4 = pilot's eye above wheels height. Boeing D3 also gives H2 = eye path to ILS beam, H3 = ILS antenna above wheels.
// Run: node d_vtbd_papi.mjs
const FT = 0.3048, D2R = Math.PI / 180;
const dm = (d, m) => (d + m / 60) * D2R;
const GP = 3 * D2R, TAN3 = Math.tan(GP);
const ANG = { B: dm(2, 50), M: dm(2, 48), C: dm(3, 10) }; // lower on-slope boundary, ICAO/TC angle M = B − 2′, upper boundary
// PAPI unit settings used by the repo (outer→inner 2°30′, 2°50′, 3°10′, 3°30′)
const UNITS = [dm(2, 30), dm(2, 50), dm(3, 10), dm(3, 30)];

// Runway ends (AIP AD 2.14/2.19 via round 5; 03R TCH 50 ft is the repo's assumption, RNP)
const RWY = {
  '03L': { rdh: 55 * FT, meht: 71.85 * FT, gpAnt: 317.3 },
  '21R': { rdh: 54 * FT, meht: 65.42 * FT, gpAnt: 335.4 },
  '03R': { rdh: 50 * FT, meht: 63.35 * FT, gpAnt: null },
  '21L': { rdh: 53 * FT, meht: 63.81 * FT, gpAnt: 315.9 },
};
// repo formula (src/15-geo.js): PAPI distance = round5(MEHT / tan 2°50′)
const papiRepo = (meht) => Math.round(meht / Math.tan(ANG.B) / 5) * 5;
const papiM = (meht) => meht / Math.tan(ANG.M);

// Type data at 3° (H, H1, H4 in m). Boeing in ft converted (more digits than its metric table).
const TYPES = {
  b737_800W: { H: 13.9 * FT, H1: 18.6 * FT, H4: 15.7 * FT, H3: 10.8 * FT, pitch: 3.2, src: 'D3 VREF F30 w/Winglets' },
  b737_800: { H: 14.2 * FT, H1: 18.8 * FT, H4: 15.9 * FT, H3: 11.0 * FT, pitch: 3.4, src: 'D3 VREF F30' },
  b737_800W_F40: { H: 3.5, H1: 5.0, H4: 4.1, H3: 2.5, pitch: 0.9, src: 'D3 VREF+5 F40 w/Winglets (m table)' },
  a320ceo: { H: 4.88, H1: 6.74, H4: 5.96, src: 'D4 2023' },
  a320neo: { H: 4.97, H1: 6.82, H4: 6.04, src: 'D4 2023' },
  a321ceo: { H: 4.99, H1: 6.88, H4: 5.87, src: 'D4 2023' },
  a321neo: { H: 4.81, H1: 6.71, H4: 5.70, src: 'D4 2023' },
  a330_300: { H: 8.56, H1: 11.34, H4: 9.77, src: 'D4 2023' },
  atr72_600_est: { H: 2.3, H1: 3.2, H4: 2.65, src: 'est (no public data): eye STA ~2.6, MG STA ~13.7, B_ext ~2.65, pitch ~0' },
};
// ICAO Annex 14 Table 5-2 structure (via STAC D22 / TC D21): [upper bound of EWH group, desired, minimum] in m
const ICAO = [[3, 6, 3], [5, 9, 4], [8, 9, 5], [14, 9, 6]];
const icaoGroup = (ewh) => ICAO.find(([u]) => ewh < u) || [Infinity, NaN, NaN];
const papiShows = (ang) => UNITS.filter((u) => ang > u).length; // number of white units

const f = (x, n = 2) => (Number.isFinite(x) ? x.toFixed(n) : '-');
const rows = [];
console.log('Runway PAPI distances (m): repo round5(MEHT/tan2°50′) | MEHT/tan2°48′ (TC/ICAO angle M) | GP origin RDH/tan3°');
for (const [id, r] of Object.entries(RWY)) {
  r.dRepo = papiRepo(r.meht); r.dM = papiM(r.meht); r.aim = r.rdh / TAN3;
  console.log(`${id}: MEHT ${f(r.meht)} m, RDH ${f(r.rdh)} m, D_repo ${r.dRepo}, D_M ${f(r.dM, 1)}, aim ${f(r.aim, 1)}, PAPI−aim ${f(r.dRepo - r.aim, 1)} m, needed H2 for harmony ${f((r.dRepo - r.aim) * TAN3)} m`);
}
console.log('\nPer type and runway (eye/wheel heights in m over threshold elevation; distances in m, + = past threshold)');
for (const [t, T] of Object.entries(TYPES)) {
  const H2 = T.H1 - T.H; const [, des, min] = icaoGroup(T.H1);
  for (const [id, r] of Object.entries(RWY)) {
    const D = r.dRepo;
    const wheelILS = r.rdh - T.H;                  // antenna on GP over threshold
    const eyeILS = r.rdh + H2;
    const tdILS = wheelILS / TAN3;                 // no-flare wheel path ground intercept past THR
    const eyePapi3 = D * TAN3, wheelPapi3 = eyePapi3 - T.H1, tdPapi3 = D - T.H1 / TAN3;
    const wheelMEHT = r.meht - T.H1;
    const eyeOnB = D * Math.tan(ANG.B), eyeOnC = D * Math.tan(ANG.C);
    const angThrILS = Math.atan2(eyeILS, D);       // eye elevation angle seen from PAPI when over THR on ILS
    // where along the ILS approach the eye drops below B (2°50′) and M (2°48′): (x+aim)tan3 + H2 = (x+D) tanB
    const exitB = (D * Math.tan(ANG.B) - r.aim * TAN3 - H2) / (TAN3 - Math.tan(ANG.B));
    const exitM = (D * Math.tan(ANG.M) - r.aim * TAN3 - H2) / (TAN3 - Math.tan(ANG.M));
    const pass = wheelMEHT >= des ? 'desired' : wheelMEHT >= min ? 'min-only' : 'FAIL';
    rows.push({ t, id, H2, wheelILS, eyeILS, tdILS, eyePapi3, wheelPapi3, tdPapi3, wheelMEHT, des, min, pass, angThrILS, exitB, exitM, eyeOnB, eyeOnC });
    console.log(`${t.padEnd(14)} ${id} | ILS: eye ${f(eyeILS)} wheel ${f(wheelILS)} (${f(wheelILS / FT, 1)} ft) TD ${f(tdILS, 0)} | PAPI3°: eye ${f(eyePapi3)} wheel ${f(wheelPapi3)} TD ${f(tdPapi3, 0)} | MEHT-H1 ${f(wheelMEHT)} vs ICAO ${des}/${min} → ${pass} | at THR on ILS PAPI sees ${f(angThrILS / D2R, 3)}° (${papiShows(angThrILS)}W) | 2W2R ends ${f(exitB, 0)} m (B) / ${f(exitM, 0)} m (M) before THR`);
  }
}
// Validation against Transport Canada AC 302-009 example (TCH 15.24 m, PAPI 408.9 m, MEHT 20 m, M = 2°48′)
console.log('\nTC AC 302-009 check: GP origin 15.24/tan3 =', f(15.24 / TAN3, 1), 'm; PAPI D = 20/tan(2°48′) =', f(20 / Math.tan(ANG.M), 1), 'm');
for (const eah of [0, 1]) {
  const aim = 15.24 / TAN3, D = 408.9;
  const x = (D * Math.tan(ANG.M) - aim * TAN3 - eah) / (TAN3 - Math.tan(ANG.M));
  console.log(`  EAH ${eah} m: eye leaves corridor ${f(x, 1)} m before THR (TC: ${eah ? '~1074' : '1359.8'})`);
}
export { rows, RWY, TYPES };
