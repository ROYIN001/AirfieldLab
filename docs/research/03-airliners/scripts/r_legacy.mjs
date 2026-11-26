// r_legacy.mjs — หัวข้อ 3.1 ATR 72-600: ค่า aero.legacy / propulsion.legacy สำหรับ AC ปัจจุบันใน src/20-flight.js
// ใช้สูตรเดียวกับโค้ด (CLlin, stallBlend Beard–McLain M = 55, CDlin, Cm, thrustAvail) เพื่อหา
// Cm0/Cmflap ที่ trim ได้ที่ δe = 0, CDflap/CDgear ที่ให้แรงขับ approach ตรงกับ r_perf_wake.mjs,
// และ CLmax ที่ "เห็นจริง" จากการผสม stall ของโค้ด เทียบกับเป้า [R4][R9] (ผ่าน r_speeds_clmax.mjs)
// ทุกค่าเป็นค่าประมาณ (est)
const D2R = Math.PI / 180, g = 9.80665, KT = 0.514444, S = 61.0;
const f = (x, d = 4) => Number(x.toFixed(d));
const L = { CL0: 0.229, CLa: 5.6, CLflap: 1.273, flapMap: { '0': 0, '15': 0.584, '30': 1 }, aStall: 16, aStallFlap: -1,
  CD0: 0.030, K: 0.0313, K_CL_offset: 0, Cma: -1.74 };
function stallBlend(a, a0) { const M = 55, e1 = Math.exp(-M * (a - a0)), e2 = Math.exp(M * (a + a0)); return (1 + e1 + e2) / ((1 + e1) * (1 + e2)); }
const CLcode = (alpha, fl) => { const a0 = (L.aStall + L.aStallFlap * fl) * D2R; const s = stallBlend(alpha, a0);
  const lin = L.CL0 + L.CLflap * fl + L.CLa * alpha; const sa = Math.sin(alpha), ca = Math.cos(alpha); return (1 - s) * lin + s * 2 * Math.sign(alpha) * sa * sa * ca; };
const out = {};
// 1) CLmax ที่โค้ดให้จริง
out.CLmax_code = {};
for (const [k, fl] of Object.entries(L.flapMap)) { let best = { CL: 0, a: 0 }; for (let a = 0; a <= 25; a += 0.05) { const c = CLcode(a * D2R, fl); if (c > best.CL) best = { CL: c, a }; } out.CLmax_code[k] = { CLmax: f(best.CL, 3), alpha_deg: f(best.a, 2) }; }
out.CLmax_target = { '0': 1.50, '15': 2.146, '30': 2.675 };
// 1b) ปรับ aStall/aStallFlap ให้ CLmax ของโค้ดตรงเป้า clean และ flaps 30 (bisection บน a0)
const clmaxAt = (a0deg, fl) => { let m = 0; for (let a = 0; a <= 28; a += 0.02) { const al = a * D2R, s = stallBlend(al, a0deg * D2R);
  const lin = L.CL0 + L.CLflap * fl + L.CLa * al, sa = Math.sin(al), ca = Math.cos(al); m = Math.max(m, (1 - s) * lin + s * 2 * sa * sa * ca); } return m; };
const solveA0 = (fl, tgt) => { let lo = 10, hi = 24; for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (clmaxAt(mid, fl) < tgt) lo = mid; else hi = mid; } return (lo + hi) / 2; };
const a0c = solveA0(0, 1.50), a030 = solveA0(1, 2.675);
L.aStall = Number(a0c.toFixed(2)); L.aStallFlap = Number((a030 - a0c).toFixed(2));
out.solved = { aStall: L.aStall, aStallFlap: L.aStallFlap, CLmax15_code: f(clmaxAt(L.aStall + L.aStallFlap * L.flapMap['15'], L.flapMap['15']), 3) };
// 2) Cm0 / Cmflap ให้ trim ที่ δe = 0: cruise (275 KTAS FL170, 21 t, CL 0.467) และ approach (111 kt, 20.4 t, flaps 30, CL 1.64)
const aCr = (0.467 - L.CL0) / L.CLa, aAp = (1.64 - L.CL0 - L.CLflap) / L.CLa;
const Cm0 = -L.Cma * aCr, Cmflap = -L.Cma * aAp - Cm0;
out.trim = { alpha_cruise_deg: f(aCr / D2R, 2), alpha_approach_deg: f(aAp / D2R, 2), Cm0: f(Cm0, 4), Cmflap: f(Cmflap, 4) };
// 3) CDflap/CDgear: ต้องได้ CD รวม 0.2096 ที่ CL 1.64 (r_perf_wake.mjs) ด้วยเทอม K(CL−offset)² ของโค้ด
const CDtarget = 0.2096, CDind = L.K * (1.64 - L.K_CL_offset) ** 2, CDgear = 0.020;
const CDflap = CDtarget - L.CD0 - CDind - CDgear;
out.drag = { CDind_code: f(CDind), CDgear, CDflap: f(CDflap), CDflap15_equiv: f(CDflap * Math.pow(L.flapMap['15'], 1.5)) };
// 4) thrustAvail ของโค้ด (P, eta, T0 จาก r_engine_prop.mjs) และ throttle ที่ต้องใช้ตอน approach
const P = 3.692e6, eta = 0.957, T0 = 76955, Vc = eta * P / T0;
const thrustAvail = V => T0 * Vc / Math.sqrt(V * V + Vc * Vc);
const Vap = 111 * KT, q = 0.5 * 1.225 * Vap * Vap, W = 20400 * g;
const Treq = q * S * CDtarget - W * Math.sin(3 * D2R);
out.approachThrottle = { Treq_N: f(Treq, 0), Tavail_N: f(thrustAvail(Vap), 0), thr: f(Treq / thrustAvail(Vap), 3) };
out.legacy = { ...L, Cm0: f(Cm0, 4), Cmflap: f(Cmflap, 4), CDflap: f(CDflap, 4), CDgear, P, eta, T0, idle: 0.02 };
console.log(JSON.stringify(out, null, 1));
