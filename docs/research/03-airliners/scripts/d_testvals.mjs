// d_testvals.mjs — extra expected values for topic 3.5 tests (prefix D)
const D2R = Math.PI / 180, FT = 0.3048, f = (x, n = 3) => x.toFixed(n);
const fwd = (A, B, rho, th) => { const r = rho * D2R, t = Math.tan(th * D2R); const H4 = B * Math.cos(r) + A * Math.sin(r); return { H4, X: A * Math.cos(r) - B * Math.sin(r), H1: H4 + (A * Math.cos(r) - B * Math.sin(r)) * t }; };
// T-D-08: path height invariance when pitch follows the glide angle (ρ = ρ0 − (θ − 3°))
for (const [th, rho] of [[3, 3.2], [2.5, 3.7], [3.5, 2.7]]) { const r = fwd(17.11, 3.84, rho, th); console.log(`737-800W θ ${th} ρ ${rho}: H4 ${f(r.H4)} H1 ${f(r.H1)} m (${f(r.H1 / FT, 2)} ft)`); }
// T-D-10: A320 forward model from FBW-derived A = 15.33, B = 5.09
for (const rho of [3.0, 3.3]) { const r = fwd(15.33, 5.09, rho, 3); console.log(`A320 ρ ${rho}: H4 ${f(r.H4)} X ${f(r.X)} H1 ${f(r.H1)}`); }
// T-D-20: tail strike geometry 737-800: lever MG→tail skid 16.308 m; extended strike 11.0° (D15)
const L = 16.308, hExt = L * Math.tan(11 * D2R), stroke = 16 * 0.0254;
console.log(`737-800 skid height above extended main-wheel plane at θ=0 for 11.0°: ${f(hExt)} m; compressed by full stroke ${f(stroke)} m → ${f(Math.atan((hExt - stroke) / L) / D2R, 2)}°`);
// A320: 13.5° extended / 11.7° compressed (L34): implied stroke-equivalent drop with MG→tail lever (FBW tail scrape point.7 z −68 ft)
const La = (-14.03 - -68.0) * FT; const dz = La * (Math.tan(13.5 * D2R) - Math.tan(11.7 * D2R));
console.log(`A320 MG→tail scrape lever ${f(La)} m; height change implied by 13.5°→11.7°: ${f(dz)} m`);
// T-D-21: PAPI units seen from the eye at the threshold, 21R, D = 405 m, light height 0
const units = [2.5, 2 + 50 / 60, 3 + 10 / 60, 3.5];
for (const h of [17.0, 19.0, 21.23, 23.5, 25.5]) { const a = Math.atan2(h, 405) / D2R; console.log(`eye ${h} m at THR 21R: ${f(a, 3)}° → ${units.filter((u) => a > u).length} white`); }
// on-slope band of eye height at THR for each runway (2°50′..3°10′)
for (const [id, D] of [['03L', 440], ['21R', 405], ['03R', 390], ['21L', 395]]) console.log(`${id} D ${D}: eye band at THR ${f(D * Math.tan((2 + 50 / 60) * D2R), 2)}–${f(D * Math.tan((3 + 10 / 60) * D2R), 2)} m; centre ${f(D * Math.tan(3 * D2R), 2)} m`);
// nose gear load fraction at 25% MAC (static, level): (x_MG − x_CG)/WB
console.log(`NG fraction 25%MAC: 737-800 ${f(1.041 / 15.596 * 100, 2)} %, A320 ${f(1.399 / 12.640 * 100, 2)} %, A321 ${f(1.40 / 16.91 * 100, 2)} %`);
