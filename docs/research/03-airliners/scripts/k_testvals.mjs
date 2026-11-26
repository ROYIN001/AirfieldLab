// k_testvals.mjs — extra expected values for topic 3.10 tests (prefix K). Node >= 18, no deps.
// 1) bank-to-nacelle-contact with pitch, 2) FSF/SKYbrary decel conversions, 3) rotation timing,
// 4) landing-distance factors, 5) hard-landing classification thresholds.
const D = Math.PI / 180, KT = 0.514444, FT = 0.3048;
const r = (x, n = 1) => Math.round(x * 10 ** n) / 10 ** n;
const out = [];
// 1) 737-800 nacelle contact. Geometry from topic 5/6: nacelle min clearance 0.48 m (MTW) / 0.64 m (OEW) [D1],
//    engine y = 4.902 m, x = STA 16.485 m (topic 6 layout); main gear STA 19.685 m, track 5.715 m (topic 5).
//    Roll about the downwind main-wheel contact line; nose-down pitch theta lowers a point L ahead of the MG by L*sin(theta).
//    phi_contact = asin((h0 - L*sin(-theta) - dComp) / (y - track/2)), dComp = extra strut compression on that side.
export function nacelleContactBank({ h0, y, track, L, thetaDeg = 0, dComp = 0 }) {
  const h = h0 - L * Math.sin(Math.max(0, -thetaDeg) * D) - dComp;
  return Math.asin(Math.max(0, h) / (y - track / 2)) / D;
}
const g737 = { y: 4.902, track: 5.715 };
for (const [lab, h0] of [['MTW 0.48 m', 0.48], ['OEW 0.64 m', 0.64]])
  for (const [th, L] of [[0, 3.2], [-2.5, 3.2], [-2.5, 5.0]])
    out.push(`737-800 nacelle ${lab}, pitch ${th}°, lever ${L} m: bank to contact ${r(nacelleContactBank({ h0, ...g737, L, thetaDeg: th }))}°`);
out.push(`737-800 nacelle MTW, pitch 0, extra strut compression 0.10 m: ${r(nacelleContactBank({ h0: 0.48, ...g737, L: 3.2, dComp: 0.10 }))}°`);
out.push(`observed: VH-YIW 10.3° at pitch -2.5° (ATSB AO-2016-042); EI-DAL 11.4° right MLG compressed (AAIB 5/2010)`);
// 2) deceleration conversions (FSF ALAR BN 8.4 / 8.5, SKYbrary): kt/s -> m/s^2, ft/s^2 -> m/s^2
for (const [lab, kts] of [['autobrake low typ 3 kt/s', 3], ['autobrake medium typ 6 kt/s', 6], ['max pedal 8 kt/s', 8], ['max pedal 10 kt/s', 10]])
  out.push(`${lab}: ${r(kts * KT, 2)} m/s^2 (${r(kts * KT / FT, 1)} ft/s^2, ${r(kts * KT / 9.80665, 3)} g)`);
for (const [lab, a] of [['A320 LO 1.7', 1.7], ['A320 LO 2.0', 2.0], ['A320 MED 3.0', 3.0], ['A320 MAX cmd 6.0', 6.0]])
  out.push(`${lab} m/s^2 = ${r(a / KT, 2)} kt/s = ${r(a / FT, 1)} ft/s^2`);
for (const [lab, f] of [['737 AB1 4', 4], ['737 AB2 5', 5], ['737 AB3 7.2', 7.2], ['737 MAX 12', 12], ['737 MAX 14', 14]])
  out.push(`${lab} ft/s^2 = ${r(f * FT, 2)} m/s^2 = ${r(f * FT / KT, 2)} kt/s`);
// 3) rotation timing at constant pitch rate from ground attitude ~0°
for (const [lab, th, q] of [['737-800 F1 8.5° @2', 8.5, 2], ['737-800 F1 8.5° @2.5', 8.5, 2.5], ['737-800 F1 8.5° @3', 8.5, 3], ['737-800 F5 8° @2.5', 8, 2.5], ['A330 10° @3', 10, 3], ['A320 15° @3', 15, 3]])
  out.push(`${lab}°/s: t = ${r(th / q, 2)} s`);
// 4) landing distance: 121.195 dispatch and AC 91-79B
const LD = 1000;
out.push(`dispatch dry: LDA >= LD/0.6 = ${r(LD / 0.6, 0)} m; wet x1.15 = ${r(1.15 * LD / 0.6, 0)} m`);
out.push(`AC 91-79B Table 3-1 (with reverse) for actual LD 1000 m: dry ${r(1.67 * LD, 0)}, good ${r(1.92 * LD, 0)}, poor ${r(3.4 * LD, 0)} m`);
out.push(`FSF BN 8.5: 5 kt tailwind +10 % -> ${r(1.1 * LD, 0)} m; 5 kt headwind -2.5 % -> ${r(0.975 * LD, 0)} m; 1,000 ft elevation +5 % -> ${r(1.05 * LD, 0)} m`);
// DMK elevation ~9 ft: negligible; 10 kt tailwind FSF -> +20 %
out.push(`FSF tailwind 10 kt: x${r(1.1 ** 2, 3)} compounded or x1.20 linear; AC 91-79B 10 kt: x1.21`);
// 5) hard-landing thresholds (sink in ft/s and fpm)
for (const [lab, fps] of [['25.473 MLW', 10], ['25.473 MTOW', 6], ['Airbus LOAD15 RALR', 9], ['G-DHJH LOAD15', 11.5], ['G-DHJH FDR / severe', 14]])
  out.push(`${lab}: ${fps} ft/s = ${r(fps * 60, 0)} fpm = ${r(fps * FT, 3)} m/s`);
for (const [lab, fpm] of [['ATR gear design 600 fpm', 600], ['ATR reserve 720 fpm', 720], ['VH-FVZ 928 fpm', 928]])
  out.push(`${lab}: ${r(fpm / 60, 1)} ft/s = ${r(fpm * FT / 60, 3)} m/s`);
// 6) Vref/VAPP cap examples
out.push(`Boeing max command speed: min(Vref+20, VFE-5): Vref30 137.1 F30 VFE 175 -> ${r(Math.min(137.1 + 20, 175 - 5), 1)} kt`);
// 7) Airbus GS mini for A330 (k = 1 above 400 ft, blends to 0.33 below 400 ft over 25 s) [K7]
const gsk = (hFt, tBelow) => hFt >= 400 ? 1 : 1 - (1 - 0.33) * Math.min(1, tBelow / 25);
for (const [h, t] of [[800, 0], [300, 0], [300, 12.5], [300, 25], [200, 40]])
  out.push(`A330 GS mini dHW 15 kt, h ${h} ft, ${t} s below 400 ft: k ${r(gsk(h, t), 3)} -> +${r(15 * gsk(h, t), 2)} kt`);
console.log(out.join('\n'));
