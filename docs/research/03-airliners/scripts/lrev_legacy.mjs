// Reviewer (หัวข้อ 3.3): check aero.legacy of a320ceo against the CURRENT AirfieldLab blend (src/20-flight.js stallBlend, M = 55)
const D = Math.PI / 180, g = 9.80665, KT = 0.514444;
const L = { CL0: 0.12, CLa: 5.302, CLflap: 1.249, aStall: 16.6, aStallFlap: 4.49, CD0: 0.0215, K: 0.0515, CDflap: 0.0618, CDgear: 0.017, Cm0: 0.1012, Cmflap: 0.0071, Cma: -1.38 };
const blend = (a, a0) => { const M = 55, e1 = Math.exp(-M * (a - a0)), e2 = Math.exp(M * (a + a0)); return (1 + e1 + e2) / ((1 + e1) * (1 + e2)); };
function maxCL(f) { const a0 = (L.aStall + L.aStallFlap * f) * D; let best = [0, 0]; for (let ad = 0; ad <= 35; ad += 0.01) { const a = ad * D, s = blend(a, a0); const CL = (1 - s) * (L.CL0 + L.CLflap * f + L.CLa * a) + s * 2 * Math.sin(a) ** 2 * Math.cos(a); if (CL > best[0]) best = [CL, ad]; } return best.map(x => +x.toFixed(3)); }
for (const f of [0, 0.106, 0.466, 0.572, 0.647, 1]) console.log('flaps', f, 'maxCL, alpha', maxCL(f));
// polar match
const rec = (CL, conf) => conf === 'clean' ? 0.0182 + 0.0386 * CL * CL : 0.0182 + 0.05 + 0.017 + (1 / (Math.PI * 9.485 * 0.7)) * CL * CL;
const leg = (CL, f, gear) => L.CD0 + L.CDflap * f ** 1.5 + L.CDgear * gear + L.K * (CL - 0.15) ** 2;
for (const CL of [0.3, 0.5, 0.7, 0.9]) console.log('clean CL', CL, 'rec', rec(CL, 'clean').toFixed(4), 'legacy', leg(CL, 0, 0).toFixed(4));
for (const CL of [1.2, 1.5, 1.786, 2.0, 2.2]) console.log('FULL+gear CL', CL, 'rec', rec(CL, 'full').toFixed(4), 'legacy', leg(CL, 1, 1).toFixed(4));
// Cm = 0 checks
const CLc = 2 * 64500 * g / (1.225 * 122.6 * (250 * KT) ** 2), ac = (CLc - L.CL0) / L.CLa;
console.log('clean 250 kt CL', CLc.toFixed(4), 'alpha', (ac / D).toFixed(2), 'Cm', (L.Cm0 + L.Cma * ac).toFixed(4));
console.log('FULL alpha 4.5 Cm', (L.Cm0 + L.Cmflap + L.Cma * 4.5 * D).toFixed(4), ' CL0 FULL', (L.CL0 + L.CLflap).toFixed(3));
