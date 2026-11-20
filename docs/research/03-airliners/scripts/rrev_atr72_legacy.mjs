// rrev_atr72_legacy.mjs — ผู้ตรวจทาน: ตรวจ T-R-23..25 ด้วยสูตรเดียวกับ src/20-flight.js (stallBlend M 55, CLlin, Cm, thrustAvail)
const DEG = Math.PI / 180, KT = 1852 / 3600, G = 9.80665;
const L = { CL0: 0.229, CLa: 5.6, CLflap: 1.273, CDflap: 0.0754, CDgear: 0.02, Cm0: 0.074, Cma: -1.74, Cmflap: -0.0311, aStall: 16.77, aStallFlap: -0.36, CD0: 0.03, K: 0.0313, P: 3692000, eta: 0.957, T0: 76955 };
const blend = (a, a0) => { const M = 55, e1 = Math.exp(-M * (a - a0)), e2 = Math.exp(M * (a + a0)); return (1 + e1 + e2) / ((1 + e1) * (1 + e2)); };
const CL = (a, f) => { const s = blend(a, (L.aStall + L.aStallFlap * f) * DEG); const lin = L.CL0 + L.CLflap * f + L.CLa * a; return (1 - s) * lin + s * 2 * Math.sign(a) * Math.sin(a) ** 2 * Math.cos(a); };
const out = { CLmax: {} };
for (const f of [0, 0.584, 1]) { let m = 0, am = 0; for (let a = 0; a <= 25; a += 0.005) { const c = CL(a * DEG, f); if (c > m) { m = c; am = a; } } out.CLmax[f] = { CLmax: +m.toFixed(3), alpha: +am.toFixed(2) }; }
const Vc = L.eta * L.P / L.T0; const Tav = V => L.T0 * Vc / Math.hypot(V, Vc);
// approach 20.4 t 111 kt γ −3°, flaps 1, gear down; offset 0 and 0.15
const m = 20400, V = 111 * KT, q = 0.5 * 1.225 * V * V, W = m * G, cl = W * Math.cos(3 * DEG) / (q * 61);
for (const off of [0, 0.15]) { const CD = L.CD0 + L.CDflap + L.CDgear + L.K * (cl - off) ** 2; const T = q * 61 * CD - W * Math.sin(3 * DEG); out['thr_offset_' + off] = { CL: +cl.toFixed(3), CD: +CD.toFixed(4), T: Math.round(T), thr: +(T / Tav(V)).toFixed(3) }; }
out.Vc = +Vc.toFixed(2);
// trims δe = 0
const aCru = (0.467 - L.CL0) / L.CLa, aApp = (cl - L.CL0 - L.CLflap) / L.CLa;
out.trim = { cruise: { alpha_deg: +(aCru / DEG).toFixed(2), Cm: +(L.Cm0 + L.Cma * aCru).toFixed(4) }, approach: { alpha_deg: +(aApp / DEG).toFixed(2), Cm: +(L.Cm0 + L.Cmflap + L.Cma * aApp).toFixed(4) } };
console.log(JSON.stringify(out));
