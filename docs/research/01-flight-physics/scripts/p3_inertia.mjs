// Propeller polar moment of inertia estimate (ค่าประมาณ) from the EASA TCDS IM.P.133 complete-propeller mass (68.9 kg).
const SLUGFT2 = 1.35582;  // kg m2 per slug ft2
const mTot = 68.9, mHub = 24, R = 1.22, r0 = 0.12, B = 4;   // hub+retention mass and blade start radius: estimates
const mBlade = (mTot - mHub) / B, L = R - r0;
for (const taper of [0.6, 0.8, 0.9]) {      // mass per length falls linearly by 'taper' from root to tip
  let m = 0, I = 0; const N = 1000;
  for (let i = 0; i < N; i++) { const s = (i + 0.5) / N, r = r0 + s * L, w = 1 - taper * s; m += w * L / N; I += w * r * r * L / N; }
  const Ib = mBlade * I / m, rg = Math.sqrt(I / m);
  const Ihub = mHub * 0.09 ** 2;            // hub radius of gyration ~0.09 m (estimate)
  console.log(`taper ${taper}: blade ${mBlade.toFixed(1)} kg, r_g=${rg.toFixed(3)} m (${(rg / R).toFixed(2)} R), I_blade=${Ib.toFixed(2)}, I_total=${(B * Ib + Ihub).toFixed(1)} kg m2`);
}
console.log(`JSBSim prop_PT6.xml ixx 7.9504 slug ft2 = ${(7.9504 * SLUGFT2).toFixed(2)} kg m2 (4 blades, 96 in)`);
console.log(`JSBSim pc7 Propeller.xml ixx 6.01793 slug ft2 = ${(6.01793 * SLUGFT2).toFixed(2)} kg m2 (3 blades, 95 in)`);
const Om = 2000 * 2 * Math.PI / 60;
console.log(`H at 2000 rpm for I=10.5: ${(10.5 * Om).toFixed(0)} kg m2/s; kinetic energy ${(0.5 * 10.5 * Om * Om / 1e3).toFixed(0)} kJ; time constant I*Om/Q (Q=3342) = ${(10.5 * Om / 3342).toFixed(2)} s`);
