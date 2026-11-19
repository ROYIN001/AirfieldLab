// Benchmark: Aircraft.deriv, Aircraft.step, Flight.tick (AP and MAN/assist), Node 22, single thread.
import { M } from './s9_harness.mjs';
const { Aircraft, Flight, SCENARIOS, DEG } = M;
const now = () => Number(process.hrtime.bigint()) / 1e3; // µs
function bench(name, fn, n) { for (let i = 0; i < Math.min(n, 20000); i++) fn(); const runs = []; for (let r = 0; r < 5; r++) { const t0 = now(); for (let i = 0; i < n; i++) fn(); runs.push((now() - t0) / n); } runs.sort((a, b) => a - b); return { name, 'median µs/call': +runs[2].toFixed(3), 'min µs/call': +runs[0].toFixed(3), 'calls/s (median)': Math.round(1e6 / runs[2]) }; }
const rows = [];
{ const ac = new Aircraft(); ac.setApproach({ dist: 5500 }); const out = new Float64Array(13); rows.push(bench('Aircraft.deriv (airborne)', () => ac.deriv(ac.x, out), 200000)); }
{ const ac = new Aircraft(); ac.setParked(0, 0, 30 * DEG); for (let i = 0; i < 2400; i++) ac.step(1 / 240); const out = new Float64Array(13); rows.push(bench('Aircraft.deriv (3 wheels in contact)', () => ac.deriv(ac.x, out), 200000)); }
{ const ac = new Aircraft(); ac.setApproach({ dist: 5500 }); const x0 = Float64Array.from(ac.x); let k = 0; rows.push(bench('Aircraft.step (airborne, 240 Hz)', () => { ac.step(1 / 240); if (++k % 2400 === 0) ac.x.set(x0); }, 100000)); }
{ const ac = new Aircraft(); ac.setParked(0, 0, 30 * DEG); rows.push(bench('Aircraft.step (parked)', () => ac.step(1 / 240), 100000)); }
{ const f = new Flight({ wind: SCENARIOS.xl, pilot: 'ap', seed: 5 }); const snap = () => new Flight({ wind: SCENARIOS.xl, pilot: 'ap', seed: 5 }); let F = f; rows.push(bench('Flight.tick (AP, xl turbulence)', () => { F.tick(F.dt); if (F.ev.done || F.crashed) F = snap(); }, 60000)); }
{ let F = new Flight({ wind: SCENARIOS.xl, pilot: 'man', assist: true, seed: 5 }); rows.push(bench('Flight.tick (MAN assist, xl)', () => { F.tick(F.dt); if (F.ev.done || F.crashed || F.ac.t > 200) F = new Flight({ wind: SCENARIOS.xl, pilot: 'man', assist: true, seed: 5 }); }, 60000)); }
console.table(rows);
const tick = rows.find((r) => r.name.startsWith('Flight.tick (AP')); const us = tick['median µs/call'];
console.log(`physics load at 240 Hz: ${(us * 240 / 1000).toFixed(2)} ms per real second = ${(us * 240 / 1e4).toFixed(3)} % of one core; per 60 Hz frame (4 ticks): ${(us * 4 / 1000).toFixed(3)} ms of 16.67 ms`);
console.log(`ticks affordable in 2 ms/frame budget: ${Math.floor(2000 / us)}  → equivalent max physics rate at 60 fps: ${Math.floor(2000 / us) * 60} Hz`);
