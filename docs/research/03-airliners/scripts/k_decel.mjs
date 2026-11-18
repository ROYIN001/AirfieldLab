// k_decel.mjs — autobrake / reverse stopping distances for topic 3.10 (prefix K). Node >= 18.
// Autobrake is a deceleration-command system: brake pressure is modulated so that total decel = target
// (reverse thrust then reduces brake work, not distance, unless friction-limited) [K29][K30][K32].
// Distance from touchdown: s = V0*tDelay + piecewise V^2/(2a). Spin-up/spoiler time folded into tDelay.
const KT = 0.514444, FT = 0.3048;
const r = (x, n = 0) => Math.round(x * 10 ** n) / 10 ** n;
// 737NG targets (ft/s^2): AB1 4, AB2 5, AB3 7.2, MAX 14 above 80 kt / 12 below 80 kt [K29][K30]
const B737 = { AB1: [4], AB2: [5], AB3: [7.2], MAX: [14, 12] };
// A320: LO 1.7 m/s^2 delay 4 s (Flying Engineer, topic 3 [L15]) or 2.0 m/s^2 delay 2 s (FBW/avistory [K32][K33]); MED 3.0, 2 s
function stop(V0kt, a1, a2 = a1, vSplitKt = 80, tDelay = 1) {
  const V0 = V0kt * KT, Vs = Math.min(V0, vSplitKt * KT);
  return V0 * tDelay + (V0 ** 2 - Vs ** 2) / (2 * a1) + Vs ** 2 / (2 * a2);
}
const out = [];
for (const [k, v] of Object.entries(B737)) {
  const a1 = v[0] * FT, a2 = (v[1] ?? v[0]) * FT;
  out.push(`737 ${k}: ${r(a1, 2)} m/s^2${v[1] ? ` (>80 kt), ${r(a2, 2)} (<80 kt)` : ''}; from 135 kt GS, 1 s delay: ${r(stop(135, a1, a2))} m; time ${r((135 * KT) / a1, 1)} s (single-rate approx)`);
}
for (const [k, a, d] of [['A320 LO (1.7, 4 s)', 1.7, 4], ['A320 LO (2.0, 2 s)', 2.0, 2], ['A320 MED (3.0, 2 s)', 3.0, 2]]) {
  out.push(`${k}: from 130 kt GS: ${r(stop(130, a, a, 80, d))} m; from 120 kt: ${r(stop(120, a, a, 80, d))} m`);
}
// Max manual braking on dry runway, mu_eff ~ 0.35-0.45 incl. aero drag (est) -> ~3.5-4.4 m/s^2
for (const mu of [0.35, 0.45]) out.push(`manual max braking mu_eff ${mu}: decel ${r(mu * 9.80665, 2)} m/s^2; from 135 kt ${r(stop(135, mu * 9.80665, mu * 9.80665, 80, 1))} m`);
// Reverse contribution (topic 6 J values): 737-800 66.4 t: 83.7 kN at 130 kt (0.129 g) ; 66.2 kN at 60 kt
const m = 66360, frev130 = 83.7e3, frev60 = 66.2e3;
out.push(`737 max reverse decel at 130 kt ${r(frev130 / m, 2)} m/s^2, at 60 kt ${r(frev60 / m, 2)} m/s^2`);
// With AB2 (1.52 m/s^2): reverse alone exceeds target above ~? -> brakes nearly unloaded
out.push(`AB2 target ${r(5 * FT, 2)} m/s^2 vs reverse ${r(frev130 / m, 2)} m/s^2 + aero/rolling drag: brakes do ~${r(Math.max(0, 1 - (frev130 / m) / (5 * FT)) * 100)} % of decel at 130 kt (rest from reverse)`);
// Reverse-idle speeds
out.push(`reverse to idle: Boeing 60 kt = ${r(60 * KT, 2)} m/s ; Airbus 70 kt = ${r(70 * KT, 2)} m/s ; ATR ~40 kt = ${r(40 * KT, 2)} m/s`);
// time at constant decel between 130 kt and cancel speed
for (const [lab, a, vc] of [['737 AB3', 7.2 * FT, 60], ['A320 MED', 3.0, 70]]) out.push(`${lab}: 130 -> ${vc} kt in ${r(((130 - vc) * KT) / a, 1)} s`);
// 14 CFR 121.195 / AC 91-79B factors: dispatch dry LDA >= LD/0.6 ; wet 1.15x ; TALPA 15 % margin
out.push(`LDA needed for 1,000 m certified LD: dry dispatch ${r(1000 / 0.6)} m, wet ${r(1.15 * 1000 / 0.6)} m; time-of-arrival actual LD x1.15 = ${r(1150)} m`);
console.log(out.join('\n'));
