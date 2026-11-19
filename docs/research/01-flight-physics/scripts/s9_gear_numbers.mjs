// Analytic characteristic numbers of the current gear (AC.gear) and tanh friction; max stable dt per mode for several integrators.
import { M } from './s9_harness.mjs';
const { AC, G0, Aircraft, DEG } = M;
const ac = new Aircraft(); ac.setParked(0, 0, 0); for (let i = 0; i < 24000; i++) ac.step(1 / 2000);
const Nst = ac.air.load.slice(); const W = AC.m * G0;
console.log('static loads N:', Nst.map((v) => v.toFixed(0)).join('/'), ' share:', Nst.map((v) => (v / W).toFixed(3)).join('/'));
const amp = { RK4: [1, 1, 1 / 2, 1 / 6, 1 / 24], RK2: [1, 1, 1 / 2], Euler: [1, 1] };
const absR = (c, re, im) => { let sr = 0, si = 0, pr = 1, pi = 0; for (const k of c) { sr += k * pr; si += k * pi; const nr = pr * re - pi * im, ni = pr * im + pi * re; pr = nr; pi = ni; } return Math.hypot(sr, si); };
function dtMax(lre, lim, c) { let lo = 0, hi = 1; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (absR(c, lre * m, lim * m) <= 1) lo = m; else hi = m; } return lo; }
// semi-implicit (symplectic) Euler for x'' + 2ζω x' + ω² x = 0: v+ = v + dt(-ω²x - 2ζωv); x+ = x + dt v+  → spectral radius of the 2×2 map
function dtMaxSIE(w, z) { const rho = (dt) => { const a = 1 - 2 * z * w * dt, b = -w * w * dt; // [v;x]+ = [[a, b],[dt*a, 1+dt*b]] [v;x]
  const tr = a + 1 + dt * b, det = a * (1 + dt * b) - b * dt * a; const disc = tr * tr / 4 - det; return disc >= 0 ? Math.max(Math.abs(tr / 2 + Math.sqrt(disc)), Math.abs(tr / 2 - Math.sqrt(disc))) : Math.sqrt(det); };
  let lo = 0, hi = 1; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (rho(m) <= 1 + 1e-12) lo = m; else hi = m; } return lo; }
const rows = [];
const strut = (name, k, c, m) => { const w = Math.sqrt(k / m), z = c / (2 * Math.sqrt(k * m)); const re = -z * w, im = w * Math.sqrt(Math.max(0, 1 - z * z));
  rows.push({ mode: name, 'k N/m': k, 'c Ns/m': c, 'm kg': +m.toFixed(1), 'ω rad/s': +w.toFixed(2), 'f Hz': +(w / 2 / Math.PI).toFixed(2), 'ζ': +z.toFixed(3), 'RK4 dtmax ms': +(dtMax(re, im, amp.RK4) * 1e3).toFixed(1), 'RK2 dtmax ms': +(dtMax(re, im, amp.RK2) * 1e3).toFixed(1), 'Euler dtmax ms': +(dtMax(re, im, amp.Euler) * 1e3).toFixed(1), 'SI-Euler dtmax ms': +(dtMaxSIE(w, z) * 1e3).toFixed(1) }); };
const gN = AC.gear[0], gM = AC.gear[1];
strut('nose strut (corner mass)', gN.k, gN.c, Nst[0] / G0);
strut('main strut (corner mass)', gM.k, gM.c, Nst[1] / G0);
strut('heave, whole aircraft', gN.k + 2 * gM.k, gN.c + 2 * gM.c, AC.m);
strut('roll on mains (Ixx)', 2 * gM.k * 1.55 ** 2, 2 * gM.c * 1.55 ** 2, AC.Ixx);
strut('main bottomed (13k), corner', 13 * gM.k, gM.c, Nst[1] / G0);
strut('roll, mains bottomed', 2 * 13 * gM.k * 1.55 ** 2, 2 * gM.c * 1.55 ** 2, AC.Ixx);
console.table(rows);
console.log('static compression: nose', (Nst[0] / gN.k).toFixed(4), 'm of', gN.stroke, '; main', (Nst[1] / gM.k).toFixed(4), 'm of', gM.stroke);
// tanh friction slopes at v = 0 (effective viscous damping) and time constants
const sumN = Nst.reduce((a, b) => a + b, 0);
const cLongBr = (Nst[1] + Nst[2]) * 0.572 / 0.25 + Nst[0] * 0.022 / 0.25, cLongFree = sumN * 0.022 / 0.25, cLat = sumN * 0.65 / 0.35;
console.log(`dF/dv at v=0: longitudinal braked ${cLongBr.toFixed(0)} N·s/m (τ = m/c = ${(AC.m / cLongBr * 1e3).toFixed(1)} ms); unbraked ${cLongFree.toFixed(0)} (τ = ${(AC.m / cLongFree).toFixed(2)} s); lateral ${cLat.toFixed(0)} (τ = ${(AC.m / cLat * 1e3).toFixed(1)} ms)`);
const Fhold = (Nst[1] + Nst[2]) * 0.572 + Nst[0] * 0.022, Tidle = AC.idle * AC.T0;
console.log(`idle thrust ${Tidle.toFixed(0)} N; braked friction capacity ${Fhold.toFixed(0)} N; predicted creep v = 0.25·atanh(T/F) = ${(0.25 * Math.atanh(Tidle / Fhold)).toFixed(4)} m/s = ${(0.25 * Math.atanh(Tidle / Fhold) * 3600).toFixed(0)} m/h`);
console.log(`creep at full static thrust ${AC.T0} N: v = ${(0.25 * Math.atanh(AC.T0 / Fhold)).toFixed(3)} m/s`);
