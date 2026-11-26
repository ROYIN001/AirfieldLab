// d_geometry.mjs — round 3 topic 3.5 (prefix D): airframe/gear geometry, eye point, back-solved approach geometry,
// FRD conversion, ADG / ICAO code letter checks, consistency checks between independent sources.
// Run: node d_geometry.mjs
const FT = 0.3048, IN = 0.0254, D2R = Math.PI / 180, TAN3 = Math.tan(3 * D2R);
const f = (x, n = 3) => (Number.isFinite(x) ? x.toFixed(n) : '-');

// ---------- 1. Back-solve body-axis eye→wheel distances from manufacturer path data ----------
// Airbus D4 formulas: H4 = B cosρ + A sinρ ; H1 = H4 + (A cosρ − B sinρ) tanθ  ⇒  X = (H1 − H4)/tanθ = A cosρ − B sinρ
// Inverse: A = X cosρ + H4 sinρ ; B = H4 cosρ − X sinρ   (ρ = pitch attitude, θ = 3°)
const inv = (H1, H4, rhoDeg) => { const r = rhoDeg * D2R, X = (H1 - H4) / TAN3; return { X, A: X * Math.cos(r) + H4 * Math.sin(r), B: H4 * Math.cos(r) - X * Math.sin(r) }; };
console.log('1) eye→lowest main wheel, ground-frame horizontal X and body-axis A (horizontal) / B (vertical)');
const cases = [
  ['b737_800W F30 3° (ft data)', 18.6 * FT, 15.7 * FT, 3.2], ['b737_800W F30 2.5° (ft)', (18.6) * FT, 16.2 * FT, 3.7, Math.tan(2.5 * D2R)],
  ['b737_800 F30 3° (ft)', 18.8 * FT, 15.9 * FT, 3.4], ['b737_800W F40 V+5 3° (m)', 5.0, 4.1, 0.9],
  ['a320ceo ρ=3.0 (est)', 6.74, 5.96, 3.0], ['a320neo ρ=3.0', 6.82, 6.04, 3.0], ['a321ceo ρ=2.5', 6.88, 5.87, 2.5], ['a321neo ρ=2.5', 6.71, 5.70, 2.5],
  ['a330_300 ρ=3.0', 11.34, 9.77, 3.0], ['a330_300 ρ=4.0', 11.34, 9.77, 4.0], ['a320ceo 2021 ρ=3', 6.84, 6.06, 3.0], ['a330_300 2021 ρ=3', 10.82, 9.24, 3.0],
];
for (const [n, H1, H4, rho, tg] of cases) {
  const t = tg || TAN3, r = rho * D2R, X = (H1 - H4) / t;
  const A = X * Math.cos(r) + H4 * Math.sin(r), B = H4 * Math.cos(r) - X * Math.sin(r);
  console.log(`  ${n.padEnd(28)} X ${f(X, 2)}  A ${f(A, 2)}  B ${f(B, 2)} m`);
}
// Boeing GS antenna position from H (beam→wheel path) and H3 (antenna above wheels): Xa = (H − H3)/tanθ
const xa = (13.9 - 10.8) * FT / TAN3, xa2 = (14.2 - 11.0) * FT / TAN3, xa25 = (13.9 - 11.3) * FT / Math.tan(2.5 * D2R);
console.log(`  737-800W GS antenna ahead of lowest main wheel: ${f(xa, 2)} m (3°), ${f(xa25, 2)} m (2.5°); 737-800: ${f(xa2, 2)} m; eye↔antenna point vertical H4−H3 = ${f((15.7 - 10.8) * FT, 2)} m, path H2 = ${f(4.7 * FT, 2)} m`);

// ---------- 2. Positions (STA = m aft of nose) ----------
// 737-800: FlightGear 737-800YV (in from nose); 25% MAC = AERORP 734 in; MAC 155.81 in (TCDS)
const b738 = { NG: 161 * IN, MG: 775 * IN, eye: 98 * IN, mac25: 734 * IN, MAC: 155.81 * IN, tailSkid: 1417.05 * IN, L: 39.47,
  y_mg: 112.5 * IN, y_eye: -20 * IN, z_ng: 110.83 * IN, z_mg: 113.99 * IN, z_eye_model: -56.18 * IN };
b738.LEMAC = b738.mac25 - 0.25 * b738.MAC;
// A320: FlyByWire flight_model.cfg/cameras.cfg (ft rel. datum; datum vertical = CG height, nose at +44.07)
const a320 = { nose: 44.07, NG: 27.44, MG: -14.03, eyeLon: 43.72074 - 2.274 / FT, eyeVert: 4.355627 + 0.77 / FT, eyeLat: -1.723061 * FT - 0.045,
  zNG: 9.55, zMG: 9.83, tail: -79.20, tipLon: -26.0 };
const s = (lon) => (a320.nose - lon) * FT; // ft-from-datum → STA m
const A320 = { NG: s(a320.NG), MG: s(a320.MG), eye: s(a320.eyeLon), tip: s(a320.tipLon), tail: s(a320.tail), LEMAC: 700.85 * IN - 100 * IN, MAC: 165.10 * IN };
A320.mac25 = A320.LEMAC + 0.25 * A320.MAC;
console.log('\n2) positions (m STA)');
console.log(`  737-800 (FG YV): NG ${f(b738.NG)} MG ${f(b738.MG)} WB ${f(b738.MG - b738.NG)} track ${f(2 * b738.y_mg)} eye ${f(b738.eye)} LEMAC ${f(b738.LEMAC)} 25%MAC ${f(b738.mac25)} MG at ${f((b738.MG - b738.LEMAC) / b738.MAC * 100, 1)} %MAC; tail skid ${f(b738.tailSkid)} (skid−MG ${f(b738.tailSkid - b738.MG)})`);
console.log(`  737-800 eye→MG (model) ${f(b738.MG - b738.eye, 2)} m; model eye above extended main contact ${f(b738.z_mg - b738.z_eye_model, 2)} m`);
console.log(`  A320 (FBW): NG ${f(A320.NG)} MG ${f(A320.MG)} WB ${f(A320.MG - A320.NG)} eye ${f(A320.eye)} eyeY ${f(a320.eyeLat)} tip ${f(A320.tip)} tail ${f(A320.tail)}; LEMAC(TCDS) ${f(A320.LEMAC)} 25%MAC ${f(A320.mac25)}; FBW empty CG ${f(s(-9.42))}; MG at ${f((A320.MG - A320.LEMAC) / A320.MAC * 100, 1)} %MAC`);
const Bfbw = (a320.eyeVert + a320.zMG) * FT;
console.log(`  A320 eye→MG body A ${f(A320.MG - A320.eye, 2)} m; eye above extended main contact (FBW) B ${f(Bfbw, 2)} m; static eye height ≈ ${f((a320.eyeVert + 8.89) * FT, 2)} m (static CG height 8.89 ft)`);
for (const rho of [2.5, 3.0, 3.5]) { const r = rho * D2R, A = A320.MG - A320.eye; console.log(`    ρ ${rho}°: predicted H4 ${f(Bfbw * Math.cos(r) + A * Math.sin(r), 2)} (D4 5.96), X ${f(A * Math.cos(r) - Bfbw * Math.sin(r), 2)} (D4 14.88), H1 ${f(Bfbw * Math.cos(r) + A * Math.sin(r) + (A * Math.cos(r) - Bfbw * Math.sin(r)) * TAN3, 2)} (D4 6.74)`); }
// A321: forward plug 4.27 m (หัวข้อ 3.3 [L8]) inserted aft of the nose gear
const plugF = 4.27; const A321 = { NG: A320.NG, MG: A320.MG + plugF, eye: A320.eye };
console.log(`  A321 (A320 + ${plugF} m fwd plug): NG ${f(A321.NG)} MG ${f(A321.MG)} WB ${f(A321.MG - A321.NG)} (published 16.90); eye→MG ${f(A321.MG - A321.eye, 2)}`);
for (const rho of [2.0, 2.5, 3.0]) { const r = rho * D2R, A = A321.MG - A321.eye; console.log(`    ρ ${rho}°: X ${f(A * Math.cos(r) - Bfbw * Math.sin(r), 2)} (D4 19.27), H4 ${f(Bfbw * Math.cos(r) + A * Math.sin(r), 2)} (D4 5.87)`); }
// Airbus line-up document: ASDA − TODA correction (90° turn) ≈ wheelbase
const lu = { A318: [10.8, 21.1, 10.27], A319: [11.1, 22.1, 11.04], A320: [11.6, 24.3, 12.64], A321: [13.9, 30.8, 16.90], 'A330-300(1)': [23.7, 49.1, 25.40] };
console.log('  Airbus line-up ASDA−TODA vs wheelbase:', Object.entries(lu).map(([k, [t, a, wb]]) => `${k} ${f(a - t, 1)}/${wb}`).join('; '));

// ---------- 3. FRD positions from CG at 25% MAC ----------
console.log('\n3) FRD (x fwd, y right, z down) from CG ref at 25% MAC');
const frd = (sta, ref, y, z) => [ref - sta, y, z];
const b738frd = { NG: frd(b738.NG, b738.mac25, 0, b738.z_ng), MGL: frd(b738.MG, b738.mac25, -b738.y_mg, b738.z_mg), eyeModel: frd(b738.eye, b738.mac25, b738.y_eye, b738.z_eye_model) };
const Bb = 3.83; b738frd.eyeCal = frd(b738.eye, b738.mac25, b738.y_eye, b738.z_mg - Bb);
console.log('  737-800', JSON.stringify(Object.fromEntries(Object.entries(b738frd).map(([k, v]) => [k, v.map((x) => +x.toFixed(3))]))));
const a320frd = { NG: frd(A320.NG, A320.mac25, 0, a320.zNG * FT), MGL: frd(A320.MG, A320.mac25, -3.80, a320.zMG * FT), eye: frd(A320.eye, A320.mac25, a320.eyeLat, -a320.eyeVert * FT) };
console.log('  A320   ', JSON.stringify(Object.fromEntries(Object.entries(a320frd).map(([k, v]) => [k, v.map((x) => +x.toFixed(3))]))));
const A321mac25 = 19.53 + 0.25 * A320.MAC; // LEMAC A321 est (หัวข้อ 3.3 [L3][L8])
const a321frd = { NG: frd(A321.NG, A321mac25, 0, a320.zNG * FT), MGL: frd(A321.MG, A321mac25, -3.80, a320.zMG * FT), eye: frd(A321.eye, A321mac25, a320.eyeLat, -a320.eyeVert * FT) };
console.log('  A321   ', JSON.stringify(Object.fromEntries(Object.entries(a321frd).map(([k, v]) => [k, v.map((x) => +x.toFixed(3))]))), 'mac25', f(A321mac25));

// ---------- 4. ADG (FAA AC 150/5300-13B Table 1-2) and ICAO code letter (span) ----------
const adgSpan = [[14.9, 'I'], [24.1, 'II'], [36.0, 'III'], [52.1, 'IV'], [65.2, 'V'], [79.9, 'VI']];
const adgTail = [[6.1, 'I'], [9.1, 'II'], [13.7, 'III'], [18.3, 'IV'], [20.1, 'V'], [24.4, 'VI']];
const roman = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const grp = (tab, v) => (tab.find(([u]) => v < u) || [0, 'VII'])[1];
const letter = (b) => (b < 15 ? 'A' : b < 24 ? 'B' : b < 36 ? 'C' : b < 52 ? 'D' : b < 65 ? 'E' : 'F');
console.log('\n4) ADG / ICAO code letter');
for (const [n, b, h] of [['b737_800W', 35.79, 12.62], ['b737_800', 34.32, 12.62], ['a320 sharklet', 35.80, 11.76], ['a321', 35.80, 11.76], ['a330_300', 60.30, 16.79], ['atr72_600', 27.05, 7.65]]) {
  const a = grp(adgSpan, b), t = grp(adgTail, h), adg = roman[Math.max(roman.indexOf(a), roman.indexOf(t))];
  console.log(`  ${n.padEnd(14)} span ${b} → ${a}, tail ${h} → ${t} ⇒ ADG ${adg}; ICAO letter ${letter(b)}`);
}
export { b738, A320, A321 };

// ---------- 5. Estimated FRD for A330-300 and ATR 72-600 (no public LEMAC; est) ----------
// CG ref assumed so that the nose gear carries 8 % at 25 % MAC: x_MG = −0.08·WB; x_NG = x_MG + WB; x_eye = x_MG + A
console.log('\n5) estimated FRD (A330-300, ATR 72-600)');
for (const [n, WB, T, A, zMG, zNG, B, eyeY] of [['a330_300', 25.40, 10.70, 29.4, 4.1, 4.0, 8.0, -0.8], ['atr72_600', 10.77, 4.10, 11.1, 1.80, 1.75, 2.65, -0.45]]) {
  const xMG = -0.08 * WB, xNG = xMG + WB, xEye = xMG + A;
  console.log(`  ${n}: NG [${f(xNG, 2)}, 0, ${zNG}]  MGL [${f(xMG, 2)}, ${f(-T / 2, 2)}, ${zMG}]  eye [${f(xEye, 2)}, ${eyeY}, ${f(zMG - B, 2)}]`);
}
