// Section 6: equivalent time delay of the control path in the CURRENT model, and rate-limiter describing function.
import { M } from 'test/harness.mjs';
const { Flight, SCENARIOS, AC, KT, DEG, RAD } = M;
function runCase(kind, dDe = -4 * DEG, T = 2.5) {
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'man', assist: false, autoThr: false, dist: 14000, seed: 1 });
  const tr = f.ac.setApproach({ dist: 14000, ias: 120, flaps: 0, gearDown: false }); f.input.thr = tr.thr;
  const de0 = f.ac.de; let y = 0; const yT = -dDe / AC.deUp; const q = [];
  f.laws.update = function (dt) {
    const ac = f.ac, c = ac.cmd; c.thr = tr.thr; c.da = 0; c.dr = 0; c.brake = 0;
    const t = ac.t, on = t >= 0.2;
    if (kind === 'ideal') { const tgt = on ? de0 + dDe : de0; c.de = tgt; ac.de = tgt; }          // bypass actuator
    else if (kind === 'actuator') c.de = on ? de0 + dDe : de0;                                     // 70°/s rate limit only
    else if (kind === 'keyboard') { y += Math.max(-2.0 * dt, Math.min(2.0 * dt, (on ? yT : 0) - y)); c.de = de0 - y * AC.deUp; } // 90-app.js ramp 2.0/s (+ actuator)
    else if (kind === 'keyboard60Hz') { if (Math.abs((t / (1 / 60)) - Math.round(t / (1 / 60))) < 1e-6 || f._yh === undefined) { y += Math.max(-2.0 / 60, Math.min(2.0 / 60, (on ? yT : 0) - y)); f._yh = y; } c.de = de0 - f._yh * AC.deUp; }
    return c;
  };
  while (f.ac.t < T) { f.tick(f.dt); q.push(f.ac.air.q); }
  return q;
}
const dt = 1 / 240, ideal = runCase('ideal');
function fitDelay(qc) { let best = [1e9, 0]; for (let k = 0; k <= 120; k++) { let e = 0; for (let i = 0; i < qc.length; i++) { const j = i - k; const qi = j >= 0 ? ideal[j] : ideal[0]; e += (qc[i] - qi) ** 2; } if (e < best[0]) best = [e, k]; } return +(best[1] * dt).toFixed(3); }
const res = {};
for (const k of ['actuator', 'keyboard', 'keyboard60Hz']) res[k] = { tau_e_s: fitDelay(runCase(k)) };
// keyboard ramp time to full deflection and to 1 g at 120 kt (stick 0.27)
res.keyboard_time_to_full_s = 1 / 2.0; res.keyboard_time_to_1g_120kt_s = +(0.27 / 2.0).toFixed(3);
// rate-limiter describing function (fundamental), sinusoid amplitude A, rate limit R
function rl(A, w, R) { const N = 4000, Tp = 2 * Math.PI / w, h = Tp / N; let y = 0, a = 0, b = 0; for (let cyc = 0; cyc < 3; cyc++) for (let i = 0; i < N; i++) { const t = i * h, u = A * Math.sin(w * t); y += Math.max(-R * h, Math.min(R * h, u - y)); if (cyc === 2) { a += y * Math.sin(w * t) * h; b += y * Math.cos(w * t) * h; } } a *= 2 / Tp; b *= 2 / Tp; return { gain: +(Math.hypot(a, b) / A).toFixed(3), phase_deg: +(Math.atan2(b, a) * RAD).toFixed(1) }; }
res.rateLimiter = [];
for (const [A, R] of [[5, 70], [10, 70], [22, 70], [10, 33], [10, 66]]) { const won = R / A * DEG / DEG; for (const m of [1, 1.5, 2, 3]) { const w = (R / A) * m; res.rateLimiter.push({ A_deg: A, R_dps: R, w_onset_rad_s: +(R / A).toFixed(2), w: +w.toFixed(2), ...rl(A, w, R), phase_equiv_delay_s: null }); } }
for (const r of res.rateLimiter) r.phase_equiv_delay_s = +((-r.phase_deg * DEG) / r.w).toFixed(3);
console.log(JSON.stringify(res, null, 1));
