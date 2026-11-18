import { P, coeffs, DEG } from './proto_aero.mjs';
import { Cl_at, WING } from './strip.mjs';
WING.kp = 0.661; WING.gammaDeg = 4;
const clp = (a, f = 0) => (Cl_at(a, 0.01, f).Cl - Cl_at(a, -0.01, f).Cl) / 0.02;
for (const cls of [0.95, 0.85, 0.75, 0.65]) {
  P.cfg[0].CLs = cls;
  let cm = -9; for (let a = 5; a < 25; a += 0.02) cm = Math.max(cm, coeffs(a * DEG, 0).CL);
  let a1 = null, a2 = null; for (let a = 10; a < 60; a += 0.1) { const v = clp(a); if (a1 == null && v > 0) a1 = a; if (a1 != null && a2 == null && v < 0) a2 = a; }
  const cn = [16, 20, 25, 30, 35, 45].map(a => coeffs(a * DEG, 0).CN.toFixed(2)).join(' ');
  const cl = [20, 25, 30, 45].map(a => coeffs(a * DEG, 0).CL.toFixed(2)).join(' ');
  console.log(`CLs ${cls}: CLmax ${cm.toFixed(3)}  autorotation alpha ${a1?.toFixed(1)}..${a2?.toFixed(1)}  CN(16,20,25,30,35,45) ${cn}  CL(20,25,30,45) ${cl}`);
}
