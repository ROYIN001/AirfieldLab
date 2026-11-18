// Temporal aliasing of the current loop (render the latest physics state) vs render-state interpolation.
// Physics 240 Hz accumulator exactly as Flight.advance; display refresh f with optional timestamp jitter.
import { M } from './s9_harness.mjs';
const V = 95 * M.KT; // ground speed on final, calm
const dt = 1 / 240;
function run(fHz, jitterMs = 0, interp = false, seed = 1) {
  const rng = M.makeRng(seed); let acc = 0, tSim = 0, last = 0; const errs = [], steps = [];
  let prevDisp = null; const inc = [];
  for (let k = 1; k <= 3000; k++) {
    const now = k / fHz + (jitterMs ? (rng() - 0.5) * 2 * jitterMs / 1000 : 0);
    const realDt = Math.min(0.1, now - last); last = now;
    acc += Math.min(realDt, 0.1); let n = 0;
    while (acc >= dt && n < 60) { tSim += dt; acc -= dt; n++; }
    steps.push(n);
    const tDisp = interp ? tSim - dt + (acc / dt) * dt : tSim; // interpolate between previous and current state
    if (prevDisp !== null) inc.push(V * (tDisp - prevDisp) - V / fHz);
    prevDisp = tDisp;
  }
  const s = inc.slice(100); const rms = Math.sqrt(s.reduce((a, b) => a + b * b, 0) / s.length); const pk = Math.max(...s.map(Math.abs));
  const hist = {}; for (const n of steps.slice(100)) hist[n] = (hist[n] || 0) + 1;
  return { refresh_Hz: fHz, jitter_ms: jitterMs, interp, 'steps/frame': Object.keys(hist).join('/'), 'RMS frame-step error (mm)': +(rms * 1000).toFixed(1), 'peak (mm)': +(pk * 1000).toFixed(1) };
}
const rows = [];
for (const f of [60, 75, 90, 120, 144, 165, 240]) { rows.push(run(f, 0, false)); rows.push(run(f, 0.5, false)); rows.push(run(f, 0.5, true)); }
console.table(rows);
// angular size of 1 frame-step error seen from the chase camera (24 m behind) and pixels on a 1080-px-high view with 50° FOV
const px = (mm) => (Math.atan2(mm / 1000, 24) * 180 / Math.PI) * 1080 / 50;
console.log('pixels per mm at 24 m, 1080 px / 50° vfov:', px(1).toFixed(4), '→ 69 mm =', px(69).toFixed(1), 'px; 104 mm =', px(104).toFixed(1), 'px');
