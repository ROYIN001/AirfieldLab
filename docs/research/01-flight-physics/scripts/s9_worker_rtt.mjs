// Node worker_threads round-trip of a small state message (13 doubles + inputs), as a rough proxy for Web Worker postMessage cost.
import { Worker } from 'worker_threads';
const w = new Worker(`const { parentPort } = require('worker_threads'); parentPort.on('message', (m) => parentPort.postMessage(m));`, { eval: true });
const msg = () => ({ t: 0, x: new Float64Array(13), inp: { x: 0.1, y: -0.2, rud: 0, thr: 0.3, brake: 0 } });
const N = 20000; let i = 0; const lat = [];
await new Promise((res) => { let t0; const send = () => { t0 = process.hrtime.bigint(); w.postMessage(msg()); };
  w.on('message', () => { lat.push(Number(process.hrtime.bigint() - t0) / 1e3); if (++i < N) send(); else res(); }); send(); });
lat.sort((a, b) => a - b); console.log(`round trip µs: median ${lat[N >> 1].toFixed(1)}, p99 ${lat[Math.floor(N * 0.99)].toFixed(1)}, max ${lat[N - 1].toFixed(1)} (Node ${process.version})`);
await w.terminate();
