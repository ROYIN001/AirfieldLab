// p3rev: T-P-15 (ค) timing with the step() law of section 3.11: rate = clamp(5*(cmd-beta), +-20 deg/s), dt = 1/240
const dt = 1 / 240; let b = 10, t = 0; const cmd = -15, rmax = 20; const hit = {};
while (t < 3) { const r = Math.max(-rmax, Math.min(rmax, (cmd - b) * 5)); b += r * dt; t += dt;
  for (const tol of [0.5, 0.1, 0.05]) if (hit[tol] == null && b <= cmd + tol) hit[tol] = t; }
console.log('time to within 0.5/0.1/0.05 deg of -15:', Object.entries(hit).map(([k, v]) => `${k}:${v.toFixed(2)}s`).join(' '), 'beta(2s)=');
b = 10; for (let i = 0; i < 480; i++) { const r = Math.max(-rmax, Math.min(rmax, (cmd - b) * 5)); b += r * dt; } console.log('beta at t=2 s:', b.toFixed(3));
const T = -0.088 * 1.1602 * (1825 / 60) ** 2 * 2.44 ** 4; console.log('T from reverseCTstatic at 1825 rpm, rho 1.1602:', T.toFixed(0), 'N');
