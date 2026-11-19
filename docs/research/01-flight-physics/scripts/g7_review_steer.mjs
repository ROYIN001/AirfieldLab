// Review: steady-state turn of the proposed pedal steering (12 deg) with the proposed tyre law
// F_y = -mu N tanh(C' alpha / mu), C' = 3.2 /rad, mu = 0.8, static axle loads (no lateral load transfer).
// Bicycle model, solved by time-marching the planar dynamics to steady state. Geometry from AC.gear.
const g = 9.80665, m = 2250, Izz = 4000 /* rough, only affects transient */, a = 2.30, b = 0.35, wb = a + b;
const Nf = m * g * b / wb, Nr = m * g * a / wb, Cp = 3.2, mu = 0.8;
const Fy = (N, al) => -mu * N * Math.tanh(Cp * al / mu);
function turn(U, delta) {
  let vy = 0, r = 0; const dt = 1e-3;
  for (let t = 0; t < 30; t += dt) {
    const af = Math.atan2(vy + a * r, U) - delta, ar = Math.atan2(vy - b * r, U);   // slip angle = velocity angle minus wheel heading
    const Ff = Fy(Nf, af), Fr = Fy(Nr, ar);
    const vyd = (Ff * Math.cos(delta) + Fr) / m - U * r, rd = (a * Ff * Math.cos(delta) - b * Fr) / Izz;
    vy += vyd * dt; r += rd * dt;
  }
  const ay = U * r;
  return { U, deltaDeg: delta * 180 / Math.PI, R_m: +(U / r).toFixed(2), ay_g: +(ay / g).toFixed(3), kinematicR: +(wb / Math.tan(delta)).toFixed(2) };
}
for (const U of [3, 5, 7.5, 10]) console.log(JSON.stringify(turn(U, 12 * Math.PI / 180)));
for (const U of [10]) for (const d of [6, 8]) console.log(JSON.stringify(turn(U, d * Math.PI / 180)));
