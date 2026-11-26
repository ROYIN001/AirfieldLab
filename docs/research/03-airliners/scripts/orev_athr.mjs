// orev_athr.mjs — independent reviewer (topic 3.9): re-check T-O-20 (pole-placement A/THR gains,
// +10 kt headwind step on a 3 deg approach, first-order engine lag) with RK4 and overshoot tracking.
const KT = 1852 / 3600, G0 = 9.80665, DEG = Math.PI / 180, LBF = 4.4482216152605;
const T = { b737: [60000, 2 * 26300 * LBF, 142.1, 8], a320: [64500, 2 * 27000 * LBF, 133.6, 8], a330: [185000, 2 * 71100 * LBF, 140, 9] };
const w = 0.15, z = 0.8, tauE = 1.5;
for (const [k, [m, Tmax, vapp, LD]] of Object.entries(T)) {
  const Kp = 2 * z * w * m, Ki = w * w * m, V0 = vapp * KT, gam = -3 * DEG, D0 = m * G0 / LD, dDdV = 2 * D0 / V0;
  const T0 = D0 + m * G0 * Math.sin(gam);
  // state: V, I (integral of error), Ta (actual thrust)
  const f = ([V, I, Ta]) => { const e = V0 - V; const Tc = Math.max(0.05 * Tmax, Math.min(Tmax, T0 + Kp * e + I));
    return [(Ta - (D0 + dDdV * (V - V0)) - m * G0 * Math.sin(gam)) / m, Ki * e, (Tc - Ta) / tauE]; };
  let x = [V0 + 10 * KT, 0, T0], t = 0, dt = 0.005, tIn = null, minDev = 0, sat = false;
  while (t < 150) {
    const k1 = f(x), k2 = f(x.map((v, i) => v + k1[i] * dt / 2)), k3 = f(x.map((v, i) => v + k2[i] * dt / 2)), k4 = f(x.map((v, i) => v + k3[i] * dt));
    x = x.map((v, i) => v + (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) * dt / 6); t += dt;
    const dev = (x[0] - V0) / KT; minDev = Math.min(minDev, dev);
    if (T0 + Kp * (V0 - x[0]) + x[1] <= 0.05 * Tmax) sat = true;
    if (Math.abs(dev) < 2) { if (tIn === null) tIn = t; } else tIn = null;
  }
  console.log(`${k}: Tmax ${(Tmax / 1000).toFixed(1)} kN, T0 ${(T0 / 1000).toFixed(1)} kN (${(T0 / Tmax * 100).toFixed(1)} %), Kp ${(Kp * KT / Tmax).toFixed(4)} Tmax/kt, Ki ${(Ki * KT / Tmax).toFixed(5)} Tmax/(kt s), ` +
    `within 2 kt after ${tIn.toFixed(1)} s, max undershoot ${minDev.toFixed(2)} kt, idle-limited ${sat}`);
}
console.log(`95 % of first-order step: ${(-tauE * Math.log(0.05)).toFixed(2)} s`);
// variant: conditional-integration anti-windup (integrator frozen while the command is clamped)
for (const [k, [m, Tmax, vapp, LD]] of Object.entries(T)) {
  const Kp = 2 * z * w * m, Ki = w * w * m, V0 = vapp * KT, gam = -3 * DEG, D0 = m * G0 / LD, dDdV = 2 * D0 / V0, T0 = D0 + m * G0 * Math.sin(gam);
  let V = V0 + 10 * KT, I = 0, Ta = T0, t = 0, dt = 0.001, tIn = null, minDev = 0, tMin = 0;
  while (t < 150) {
    const e = V0 - V, raw = T0 + Kp * e + I, Tc = Math.max(0.05 * Tmax, Math.min(Tmax, raw));
    if (raw === Tc) I += Ki * e * dt;
    Ta += (Tc - Ta) * dt / tauE; V += ((Ta - (D0 + dDdV * (V - V0)) - m * G0 * Math.sin(gam)) / m) * dt; t += dt;
    const dev = (V - V0) / KT; if (dev < minDev) { minDev = dev; tMin = t; }
    if (Math.abs(dev) < 2) { if (tIn === null) tIn = t; } else tIn = null;
  }
  console.log(`anti-windup ${k}: within 2 kt after ${tIn.toFixed(1)} s, max undershoot ${minDev.toFixed(2)} kt at ${tMin.toFixed(1)} s`);
}
