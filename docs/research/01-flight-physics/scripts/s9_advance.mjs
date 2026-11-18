// Flight.advance as used by the frame loop: steps per call at 60/120/144 Hz frame times and after a 30 s background-tab gap.
import { M } from './s9_harness.mjs';
const { Flight, SCENARIOS } = M;
for (const hz of [60, 120, 144]) {
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'ap' }); const h = {}; let last = 0;
  for (let k = 1; k <= 2000; k++) { const now = k * 1000 / hz; const dt = Math.min(0.1, (now - last) / 1000); last = now; // exactly as frame(): ms timestamps
    const t0 = f.ac.t; f.advance(dt); const n = Math.round((f.ac.t - t0) * 240); h[n] = (h[n] || 0) + 1; }
  console.log(`${hz} Hz frames: steps-per-frame histogram ${JSON.stringify(h)}; sim time ${f.ac.t.toFixed(4)} s vs wall ${(2000 / hz).toFixed(4)} s`);
}
{ const f = new Flight({ wind: SCENARIOS.calm, pilot: 'ap' }); const t0 = f.ac.t; f.advance(30); console.log(`advance(30 s gap): sim advanced ${(f.ac.t - t0).toFixed(4)} s in ${Math.round((f.ac.t - t0) * 240)} steps (cap 60 never reached: 0.1 s / (1/240) = 24)`); }
