import { P, coeffs, DEG, RAD, KT, G0 } from './proto_aero.mjs';
import { wingPanels, stripLoads, WING } from './strip.mjs';
const W = P.m * G0, vs = (CL) => Math.sqrt(2 * W / (1.225 * P.S * CL)) / KT;
// JSBSim-style impending stall: starts at alpha > 0.85*alphaCLmax (FGAerodynamics.cpp) -> speed margin on our proposed curve
for (const f of [0, 1]) { let b = -9, ab = 0; for (let a = 0; a < 30; a += 0.01) { const c = coeffs(a * DEG, f).CL; if (c > b) { b = c; ab = a; } }
  const a85 = 0.85 * ab, c85 = coeffs(a85 * DEG, f).CL; console.log(`flaps ${f}: 0.85*aCLmax = ${a85.toFixed(2)} deg, CL ${c85.toFixed(3)}, margin ${(vs(c85) - vs(b)).toFixed(1)} kt`); }
// CPU cost of strip loads (16 panels) per call
WING.kp = 0.661; WING.gammaDeg = 4; const pan = wingPanels(); const N = 200000; let s = 0; const t0 = process.hrtime.bigint();
for (let i = 0; i < N; i++) { const a = (i % 400) * 0.1 * DEG; s += stripLoads([Math.cos(a), 0.01, Math.sin(a)], [0.1, 0.02, 0.05], 0, pan, { kp: 0.661 }).L; }
const us = Number(process.hrtime.bigint() - t0) / 1e3 / N;
console.log(`strip loads (16 panels, incl. object churn in prototype): ${us.toFixed(2)} us/call -> 960 calls/s (RK4x240Hz) = ${(us * 960 / 1000).toFixed(2)} ms per simulated second`);
// static coefficient evaluation cost
const t1 = process.hrtime.bigint(); for (let i = 0; i < N; i++) s += coeffs((i % 3600) * 0.1 * DEG, i & 1).CL; console.log(`coeffs(): ${(Number(process.hrtime.bigint() - t1) / 1e3 / N).toFixed(3)} us/call`, s > 0 ? '' : '');
// induced roll: strip vs textbook rectangular-wing strip estimate Clp = -(a/12)(1+3l)/(1+l)
const a3 = 4.8, l = 0.6; console.log('textbook strip Clp (a=4.8, taper 0.6) =', (-(a3 / 12) * (1 + 3 * l) / (1 + l)).toFixed(3));
