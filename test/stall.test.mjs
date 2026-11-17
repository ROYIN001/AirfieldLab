import { M } from './harness.mjs';
const { Aircraft, AC, DEG, RAD, KT, G0 } = M;
// CL(alpha) sweep for clean and landing flaps; stall speed
const ac = new Aircraft();
for (const f of [0, 1]) {
  ac.flaps = f; let best = { CL: 0 };
  for (let a = 0; a <= 22; a += 0.5) {
    const x = ac.x; const q = M.Aircraft ? null : null;
    // evaluate CL directly from the model's formula via deriv on a synthetic state
    const th = a * DEG, V = 45;
    const qq = [Math.cos(th/2), 0, Math.sin(th/2), 0];
    x.set([0, 0, -500, V, 0, 0, qq[0], qq[1], qq[2], qq[3], 0, 0, 0]);
    const d = { wow: [0,0,0], load: [0,0,0] }; ac.deriv(x, new Float64Array(13), d);
    if (d.CL > best.CL) best = { CL: d.CL, a };
    if (a % 2 === 0) process.stdout.write(`f${f} a${a}:${d.CL.toFixed(2)}(${d.sig.toFixed(2)}) `);
  }
  const vs = Math.sqrt(2 * AC.m * G0 / (1.225 * AC.S * best.CL)) / KT;
  console.log(`\nflaps ${f}: CLmax ${best.CL.toFixed(2)} at ${best.a}° → Vs ${vs.toFixed(1)} kt`);
}
