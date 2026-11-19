// U6: downwash lag — (a) phase/amplitude of the current alpha-dot estimator (numeric difference + 50 ms first-order filter,
// src/20-flight.js:275), (b) transport-delay form vs derivative form, (c) short-period sensitivity to Cm_alphadot.
import { M } from 'test/harness.mjs';
const { AC, KT, DEG, RAD, atmosphere } = M;
const dt = 1 / 240;
// (a) feed a sinusoidal alpha into the same update law the code uses and fit amplitude/phase at steady state
function estimator(w, amp = 2 * DEG, tauF = 0.05) {
  const P = 2 * Math.PI / w, T = 2 * Math.ceil(10 / P) * P;   // fit over an integer number of periods
  let adot = 0, aPrev = null, sx = 0, sy = 0, n = 0;
  for (let t = 0; t < T; t += dt) {
    const a = amp * Math.sin(w * t);
    if (aPrev !== null) adot += (Math.max(-2, Math.min(2, (a - aPrev) / dt)) - adot) * Math.min(1, dt / tauF);
    aPrev = a;
    if (t > T / 2) { sx += adot * Math.sin(w * t); sy += adot * Math.cos(w * t); n++; }
  }
  const re = 2 * sy / n, im = 2 * sx / n; // adot ~ A cos(wt + phi)
  const ampOut = Math.hypot(re, im), truth = amp * w;
  const phase = Math.atan2(-im, re) * RAD; // lag positive
  return { w, gain: +(ampOut / truth).toFixed(3), lag_deg: +(-phase).toFixed(1), lag_ms: +((-phase * DEG) / w * 1000).toFixed(1) };
}
console.log('(a) current alpha-dot estimator vs truth (sinusoid):');
for (const w of [1, 2.2, 5, 10, 20]) console.log(JSON.stringify(estimator(w)));
// (b) tail downwash with a pure transport delay vs the derivative form, sinusoidal alpha at w
const deda = 0.40, V = 95 * KT, lt = 5.10, tau = lt / V;
console.log('(b) tau = lt/V =', tau.toFixed(4), 's at 95 kt');
for (const w of [0.5, 2.2, 5, 10, 30]) {
  // lag correction term d(alpha) = alpha(t) - alpha(t - tau): exact amplitude 2 sin(w tau/2), phase lead 90 - w tau/2
  const exactAmp = 2 * Math.sin(w * tau / 2), derivAmp = w * tau;
  console.log(JSON.stringify({ w, exact_amp_per_alpha: +exactAmp.toFixed(4), derivative_amp_per_alpha: +derivAmp.toFixed(4), ratio: +(derivAmp / exactAmp).toFixed(4), exact_phase_lead_deg: +(90 - w * tau / 2 * RAD).toFixed(1), derivative_phase_lead_deg: 90 }));
}
// (c) short-period approximation at 95 kt IAS, 31 C, sea level (Nelson/Etkin form): wn^2 = Za*Mq/u0 - Ma ; 2 zeta wn = -(Mq + Madot + Za/u0)
function sp(Cmadot, Cmq = AC.Cmq, ias = 95) {
  const rho = atmosphere(3, 16).rho, u0 = ias * KT / Math.sqrt(rho / 1.225), q = 0.5 * rho * u0 * u0;
  const k = q * AC.S * AC.c / AC.Iyy, c2u = AC.c / (2 * u0);
  const Ma = k * AC.Cma, Mq = k * Cmq * c2u, Mad = k * Cmadot * c2u, Za = -q * AC.S * (AC.CLa + 0.10) / AC.m;
  const wn2 = Za * Mq / u0 - Ma, wn = Math.sqrt(wn2), zeta = -(Mq + Mad + Za / u0) / (2 * wn);
  return { Cmadot, Cmq, wn: +wn.toFixed(3), zeta: +zeta.toFixed(3), Mq: +Mq.toFixed(3), Madot: +Mad.toFixed(3), ZaOverU0: +(Za / u0).toFixed(3) };
}
console.log('(c) short-period approximation:');
for (const c of [0, -4.5, -5.7, -6.7]) console.log(JSON.stringify(sp(c)));
console.log(JSON.stringify(sp(-5.7, -14.1)));
