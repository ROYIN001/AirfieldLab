// o_athr.mjs — topic 3.9: estimated autothrust speed-loop gains (pole placement) and a
// point-mass check with first-order engine lag. All numbers here are ESTIMATES (est: true).
// Run: node o_athr.mjs
const KT = 1852 / 3600, G0 = 9.80665, DEG = Math.PI / 180, LBF = 4.4482216;
const r = (x, n = 3) => Number(x.toFixed(n));
// mass at approach (kg), max static thrust both engines (N, class value; owner topic 6), approach speed (kt),
// approach drag ~ thrust for -3 deg trim: D = m g (L/D)^-1 with L/D approach (est)
const TYPES = {
  b737_800: { m: 60000, Tmax: 2 * 26300 * LBF, vapp: 142.1, LD: 8.0 },
  a320ceo:  { m: 64500, Tmax: 2 * 27000 * LBF, vapp: 133.6, LD: 8.0 },
  a330_300: { m: 185000, Tmax: 2 * 71100 * LBF, vapp: 140.0, LD: 9.0 },
};
const omega = 0.15, zeta = 0.8, tauE = 1.5;   // speed-loop bandwidth (rad/s), damping, engine lag (s) - est
console.log(`Design: omega ${omega} rad/s, zeta ${zeta}, engine lag ${tauE} s (omega*tauE = ${r(omega * tauE, 3)})`);
for (const [k, T] of Object.entries(TYPES)) {
  const Kp = 2 * zeta * omega * T.m;          // N per (m/s)
  const Ki = omega * omega * T.m;             // N per (m/s * s)
  const kpN = Kp / T.Tmax, kiN = Ki / T.Tmax; // fraction of Tmax
  // simulate: approach on -3 deg, step headwind +10 kt (airspeed jumps +10 kt) then constant
  const V0 = T.vapp * KT, gam = -3 * DEG;
  const dVdV = 2 * (T.m * G0 / T.LD) / V0;   // dD/dV at constant lift ~ 2D/V (est, parabolic polar near min drag ignored)
  let V = V0 + 10 * KT, I = 0, Tc = T.m * G0 / T.LD + T.m * G0 * Math.sin(gam), Tact = Tc, t = 0, dt = 0.01;
  const T0 = Tc; let peak = 0, tIn2 = null;
  while (t < 120) {
    const e = V0 - V;
    I += Ki * e * dt;
    Tc = Math.max(0.05 * T.Tmax, Math.min(T.Tmax, T0 + Kp * e + I));
    Tact += (Tc - Tact) * dt / tauE;
    const D = T.m * G0 / T.LD + dVdV * (V - V0);
    V += ((Tact - D - T.m * G0 * Math.sin(gam)) / T.m) * dt;
    peak = Math.max(peak, Math.abs(V - V0) / KT);
    if (tIn2 === null && Math.abs(V - V0) / KT < 2 && t > 1) tIn2 = t;
    if (tIn2 !== null && Math.abs(V - V0) / KT >= 2) tIn2 = null;
    t += dt;
  }
  console.log(`${k}: Kp ${r(Kp / 1000, 2)} kN/(m/s) = ${r(kpN, 4)} Tmax/(m/s) = ${r(kpN * KT, 4)} Tmax/kt; ` +
    `Ki ${r(Ki / 1000, 3)} kN/(m/s.s) = ${r(kiN * KT, 5)} Tmax/(kt.s); +10 kt step: peak ${r(peak, 2)} kt, within 2 kt after ${tIn2 === null ? 'n/a' : r(tIn2, 1)} s`);
}
console.log('AirfieldLab trainer today: 0.035 thr/kt proportional, 0.0045 thr/(kt.s) integral (src/20-flight.js line 404-405)');
// consistency with topic 6 (หัวข้อ 3.6): 14 CFR 33.73(b) flight idle -> 95 % thrust within 5 s.
// first-order lag tauE reaches 95 % of a step after -tauE*ln(0.05) = 3.0*tauE
const t95 = -tauE * Math.log(0.05);
console.log(`engine lag ${tauE} s: 95 % of a thrust step after ${r(t95, 2)} s (14 CFR 33.73(b) limit 5 s) -> ${t95 <= 5 ? 'OK' : 'TOO SLOW'}`);
// the same design expressed per kt and per kt.s does not depend on Tmax only through m/Tmax: gain ratio vs trainer
for (const [k, T] of Object.entries(TYPES)) {
  const kp = 2 * zeta * omega * T.m / T.Tmax * KT, ki = omega * omega * T.m / T.Tmax * KT;
  console.log(`${k}: Kp/Kp_trainer = ${r(kp / 0.035, 3)}, Ki/Ki_trainer = ${r(ki / 0.0045, 3)}, m g / Tmax = ${r(T.m * G0 / T.Tmax, 3)}`);
}
