// drev_geom.mjs — independent reviewer recomputation for หัวข้อ 3.5 (topic 3.5). Written from scratch, not importing d_*.mjs.
// Run: node drev_geom.mjs
const FT = 0.3048, IN = 0.0254, R = Math.PI / 180, t = (d) => Math.tan(d * R), dm = (d, m) => d + m / 60;
const p = (...a) => console.log(...a), f = (x, n = 2) => (+x).toFixed(n);
// --- unit conversions quoted in the report
p('conv: 129ft6in', f((129 * 12 + 6) * IN, 3), '| 117ft5in', f((117 * 12 + 5) * IN, 3), '| 112ft7in', f((112 * 12 + 7) * IN, 3), '| 41ft5in', f((41 * 12 + 5) * IN, 3), '| 40ft7in', f((40 * 12 + 7) * IN, 3));
p('conv: 2ft1in', f(25 * IN, 3), '1ft7in', f(19 * IN, 3), '12ft10in', f(154 * IN, 3), '12ft0in', f(144 * IN, 3), '| 13.9ft', f(13.9 * FT, 3), '18.6ft', f(18.6 * FT, 3), '15.7ft', f(15.7 * FT, 3), '4.7ft', f(4.7 * FT, 3), '10.8ft', f(10.8 * FT, 3));
p('conv: 35ft4in', f((35 * 12 + 4) * IN, 3), '13ft5in', f((13 * 12 + 5) * IN, 3), '89ft1.5in', f((89 * 12 + 1.5) * IN, 3), '88ft9in', f((88 * 12 + 9) * IN, 3), '25ft1in', f((25 * 12 + 1) * IN, 3), '2ft8.9in', f(32.9 * IN, 3));
p('conv: 123ft3in', f((123 * 12 + 3) * IN, 3), '111ft10in', f((111 * 12 + 10) * IN, 3), '38ft7in', f((38 * 12 + 7) * IN, 3), '146ft0in', f(146 * 12 * IN, 3), '208ft', f(208 * FT, 2), '197ft10in', f((197 * 12 + 10) * IN, 3), '55ft', f(55 * FT, 3));
p('conv: MEHT ft→m', [71.85, 65.42, 63.35, 63.81].map((x) => f(x * FT, 3)).join(' '), '| RDH', [55, 54, 53, 50].map((x) => f(x * FT, 3)).join(' '));
p('conv: FAA HG', [10, 15, 20, 25, 40, 45, 50, 75, 30, 300].map((x) => f(x * FT, 3)).join(' '), '| TSC pivot 46.8ft', f(46.8 * FT, 3), 'R 97.3ft', f(97.3 * FT, 3), 'dia 298.8ft', f(298.8 * FT, 2));
// --- 737-800YV model geometry (inches from nose; z up)
const yv = { NG: 161, MG: 775, yMG: 112.5, eye: 98, yEye: -20, zEye: 56.18, zNG: -110.83, zMG: -113.99, rp: 734, mac: 155.81, skid: 1417.05, zSkid: -13.5 };
p('737YV: WB', f((yv.MG - yv.NG) * IN, 3), 'track', f(2 * yv.yMG * IN, 3), 'LEMAC STA', f((yv.rp - yv.mac / 4) * IN, 3), 'eye→MG', f((yv.MG - yv.eye) * IN, 3), 'eye above MG', f((yv.zEye - yv.zMG) * IN, 3));
p('737YV FRD: NG', [(yv.rp - yv.NG) * IN, 0, -yv.zNG * IN].map((x) => f(x, 3)), 'MG', [(yv.rp - yv.MG) * IN, -yv.yMG * IN, -yv.zMG * IN].map((x) => f(x, 3)), 'skid x', f((yv.rp - yv.skid) * IN, 3), 'lever', f((yv.skid - yv.MG) * IN, 3));
const Lk = (yv.skid - yv.MG) * IN, hK = Lk * t(11);
p('737 tail: h(11°)', f(hK, 4), 'z', f(-yv.zMG * IN - hK, 3), 'compressed 16in →', f(Math.atan((hK - 16 * IN) / Lk) / R, 3), 'deg; model skid angle', f(Math.atan(((yv.zSkid - yv.zMG) * IN) / Lk) / R, 2), 'model h', f((yv.zSkid - yv.zMG) * IN, 3));
p('737 ground attitude', f(Math.atan((yv.zNG - yv.zMG) / (yv.MG - yv.NG)) / R, 3), 'deg; MG at %MAC', f(((yv.MG - (yv.rp - yv.mac / 4)) / yv.mac) * 100, 1));
// --- back-solve A,B from Boeing/Airbus path data
const inv = (H1, H4, rho, th = 3) => { const X = (H1 - H4) / t(th); return { X, A: X * Math.cos(rho * R) + H4 * Math.sin(rho * R), B: H4 * Math.cos(rho * R) - X * Math.sin(rho * R) }; };
for (const [n, H1, H4, rho, th] of [['738W F30 3°', 18.6 * FT, 15.7 * FT, 3.2, 3], ['738W F30 2.5°', 18.6 * FT, 16.2 * FT, 3.7, 2.5], ['738 F30 3°', 18.8 * FT, 15.9 * FT, 3.4, 3], ['738 F30 2.5°', 18.8 * FT, 16.4 * FT, 3.9, 2.5], ['738W F40', 5.0, 4.1, 0.9, 3], ['738 F40', 5.1, 4.2, 1.3, 3], ['A320ceo ρ3', 6.74, 5.96, 3], ['A321ceo ρ2.5', 6.88, 5.87, 2.5], ['A330 ρ3', 11.34, 9.77, 3], ['A330 ρ4', 11.34, 9.77, 4], ['A330 2021 ρ3', 10.82, 9.24, 3], ['A320 2021 ρ3', 6.84, 6.06, 3]]) {
  const r = inv(H1, H4, rho, th); p('inv', n.padEnd(14), 'X', f(r.X), 'A', f(r.A), 'B', f(r.B));
}
p('738W GS ant ahead of MG (H−H3)/tan3', f((13.9 - 10.8) * FT / t(3), 3), '2.5°', f((13.9 - 11.3) * FT / t(2.5), 3), 'H4−H3', f((15.7 - 10.8) * FT, 3));
// --- FBW A320 (ft rel datum; camera offset m)
const fb = { nose: 44.07, NG: 27.44, MG: -14.03, zNG: -9.55, zMG: -9.83, eyeL: 43.72074 * FT - 2.274, eyeV: 4.355627 * FT + 0.77, eyeY: -1.723061 * FT - 0.045, tail: -68, tailZ: 4.1 };
const sta = (lon) => fb.nose * FT - lon * FT;
const lemac = (700.85 - 100) * IN, mac = 165.1 * IN, ref = lemac + mac / 4;
p('A320: NG STA', f(sta(fb.NG), 3), 'MG STA', f(sta(fb.MG), 3), 'WB', f((fb.NG - fb.MG) * FT, 3), 'eye STA', f(fb.nose * FT - fb.eyeL, 3), 'eyeY', f(fb.eyeY, 3), 'eyeV', f(fb.eyeV, 3), 'LEMAC', f(lemac, 3), 'ref', f(ref, 3), 'MAC', f(mac, 4), 'FBW eCG', f(sta(-9.42), 3));
p('A320 FRD: NG', f(ref - sta(fb.NG), 3), f(-fb.zNG * FT, 3), 'MG', f(ref - sta(fb.MG), 3), f(-fb.zMG * FT, 3), 'eye', f(ref - (fb.nose * FT - fb.eyeL), 3), f(-fb.eyeV, 3), 'B', f(fb.eyeV - fb.zMG * FT, 3), 'A', f(fb.eyeL - fb.MG * FT, 3), 'static eye h', f(8.89 * FT + fb.eyeV, 3));
const La = (fb.MG - fb.tail) * FT, hA = La * t(13.5);
p('A320 tail lever', f(La, 3), 'h13.5', f(hA, 3), 'z', f(-fb.zMG * FT - hA, 3), 'FBW orig angle', f(Math.atan((fb.tailZ * FT - fb.zMG * FT) / La) / R, 2), 'dz13.5→11.7', f(La * (t(13.5) - t(11.7)), 3), 'x', f(ref - sta(fb.tail), 3));
for (const rho of [3.0, 3.3]) { const A = 15.33, B = 5.09, H4 = B * Math.cos(rho * R) + A * Math.sin(rho * R), X = A * Math.cos(rho * R) - B * Math.sin(rho * R); p('A320 fwd ρ', rho, 'H4', f(H4, 3), 'H1', f(H4 + X * t(3), 3)); }
for (const [th, rho] of [[2.5, 3.7], [3, 3.2], [3.5, 2.7]]) { const A = 17.11, B = 3.84, H4 = B * Math.cos(rho * R) + A * Math.sin(rho * R), X = A * Math.cos(rho * R) - B * Math.sin(rho * R); p('738W fwd θ', th, 'H1', f(H4 + X * t(th), 4)); }
// A321 tail (A320 tail + plugs 4.27 fwd, 2.67 aft), 11.4°
{ const L = La + 2.67, ref321 = 19.53 + mac / 4, h = L * t(11.4), xT = ref321 - (sta(fb.tail) + 4.27 + 2.67); p('A321 tail lever', f(L, 3), 'z', f(-fb.zMG * FT - h, 3), 'x', f(xT, 3), 'drop 11.4→9.7', f(L * (t(11.4) - t(9.7)), 3), 'ref', f(ref321, 3), 'WB', f((fb.NG - fb.MG) * FT + 4.27, 3), 'NG x', f(ref321 - sta(fb.NG), 3), 'MG x', f(ref321 - sta(fb.MG) - 4.27, 3), 'eye x', f(ref321 - (fb.nose * FT - fb.eyeL), 3)); }
// --- turning
const rad = (WB, T, b, th, Ln, Lt, dx) => { const d = WB / t(th); return { d, R1: d - T / 2, R2: d + T / 2, R3: WB / Math.sin(th * R), R4: Math.hypot(d + b / 2, dx), R5: Math.hypot(d, Ln), R6: Math.hypot(d, Lt) }; };
for (const [n, a] of [['738W', [15.6, 5.72, 35.79, 75, 19.69, 39.47 - 19.69, 5]], ['A320', [12.64, 7.6, 35.8, 71.8, 17.71, 37.57 - 17.71, 3.65]], ['A321 73.1', [16.9, 7.6, 35.8, 73.1, 21.98, 44.51 - 21.98, 3.65]], ['A321 69.2', [16.9, 7.6, 35.8, 69.2, 21.98, 44.51 - 21.98, 3.65]], ['A333 67.8', [25.4, 10.7, 60.3, 67.8, 32.8, 63.66 - 32.8, 10]], ['A333 62.1', [25.4, 10.7, 60.3, 62.1, 32.8, 63.66 - 32.8, 10]], ['ATR 57', [10.77, 4.1, 27.05, 57, 13.7, 27.17 - 13.7, 0]], ['unit 45', [10, 4, 20, 45, 12, 15, 0]]]) {
  const r = rad(...a); p('turn', n.padEnd(10), Object.entries(r).map(([k, v]) => `${k} ${f(v, 4)}`).join(' '), 'W180', f(r.R2 + Math.max(r.R2, r.R3), 2), '2R4', f(2 * r.R4, 2));
}
// --- VTBD PAPI/ILS
const RW = { '03L': [55, 71.85], '21R': [54, 65.42], '03R': [50, 63.35], '21L': [53, 63.81] };
const TY = { '738W': [13.9 * FT, 18.6 * FT], '738': [14.2 * FT, 18.8 * FT], '738W_F40': [3.5, 5.0], A320ceo: [4.88, 6.74], A320neo: [4.97, 6.82], A321ceo: [4.99, 6.88], A321neo: [4.81, 6.71], A333: [8.56, 11.34], ATR: [2.3, 3.2] };
const U = [2.5, dm(2, 50), dm(3, 10), 3.5], B = dm(2, 50), M = dm(2, 48), C = dm(3, 10);
const grp = (h) => [[3, 6, 3], [5, 9, 4], [8, 9, 5], [14, 9, 6]].find(([u]) => h < u);
for (const [id, [rdhft, mehtft]] of Object.entries(RW)) {
  const rdh = rdhft * FT, meht = mehtft * FT, D = Math.round(meht / t(B) / 5) * 5, aim = rdh / t(3);
  p(`${id}: D_repo ${D} D_M ${f(meht / t(M), 2)} D_B(unrounded) ${f(meht / t(B), 2)} aim ${f(aim, 2)} D−aim ${f(D - aim, 1)} H2need ${f((D - aim) * t(3), 3)} band ${f(D * t(B), 2)}–${f(D * t(C), 2)} ctr ${f(D * t(3), 2)}`);
  for (const [n, [H, H1]] of Object.entries(TY)) {
    const H2 = H1 - H, wh = rdh - H, td = wh / t(3), eye = rdh + H2, ang = Math.atan2(eye, D) / R, w = U.filter((u) => ang > u).length;
    const xB = (D * t(B) - aim * t(3) - H2) / (t(3) - t(B)), xM = (D * t(M) - aim * t(3) - H2) / (t(3) - t(M)), g = grp(H1);
    p(`  ${n.padEnd(9)} wheel ${f(wh)} (${f(wh / FT, 1)}ft) td ${f(td, 1)} | MEHT−H1 ${f(meht - H1)} [${g[1]}/${g[2]}] | ang ${f(ang, 3)} ${w}W | exitB ${f(xB, 1)} exitM ${f(xM, 1)} | PAPI3: wheel ${f(D * t(3) - H1)} td ${f(D - H1 / t(3), 1)}`);
  }
}
for (const h of [17, 19, 21.23, 23.5, 25.5]) { const a = Math.atan2(h, 405) / R; p('T-D-21 eye', h, f(a, 4), U.filter((u) => a > u).length); }
// Transport Canada AC 302-009 example
for (const eah of [0, 1]) { const aim = 15.24 / t(3), D = 408.9; p('TC ex EAH', eah, 'M:', f((D * t(M) - aim * t(3) - eah) / (t(3) - t(M)), 2), 'B(2°50′):', f((D * t(B) - aim * t(3) - eah) / (t(3) - t(B)), 2), 'aim', f(aim, 2), 'D from MEHT 20/tanM', f(20 / t(M), 2)); }
// NG load fractions, A330/ATR estimated FRD
p('NG frac', f(1.041 / (1.041 + 14.554) * 100, 3), f(1.399 / (1.399 + 11.241) * 100, 3), f(1.4 / (1.4 + 15.51) * 100, 3));
for (const [n, WB, A, zMG, Bv] of [['A333', 25.4, 29.4, 4.1, 8.0], ['ATR', 10.77, 11.1, 1.8, 2.65]]) p(n, 'xMG', f(-0.08 * WB, 3), 'xNG', f(0.92 * WB, 3), 'xEye', f(-0.08 * WB + A, 3), 'zEye', f(zMG - Bv, 2));
// ATR est: H1 ≈ B + A tan3 ; H2 ≈ 1.0 − 2.1 tan3
p('ATR H1', f(2.65 + 11.1 * t(3), 3), 'H2', f(1.0 - 2.1 * t(3), 3), 'H', f(2.65 + 11.1 * t(3) - (1.0 - 2.1 * t(3)), 3));
// A330 nose-to-MG est
p('A330 X 2023', f((11.34 - 9.77) / t(3), 3), '2021', f((10.82 - 9.24) / t(3), 3), 'nose→bogie', f(3.4 + (11.34 - 9.77) / t(3) - 1.0, 2), 'eye STA scaling', f(2.38 * 5.64 / 3.95, 3));
