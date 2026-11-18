// Cost of BEM per call vs table lookup (Node 22, this machine)
import { bem as bemSlow } from './p3_bem.mjs';
import { bem as bemFast } from './p3_bem_fast.mjs';
import fs from 'fs';
const t = JSON.parse(fs.readFileSync(new URL('./p3_bem_table.json', import.meta.url)));
for (const [nm, f] of [['scan300+bisect60', bemSlow], ['scan24+bisect30', bemFast]]) {
  let t0 = performance.now(), s = 0; for (let i = 0; i < 300; i++) s += f(0.4 + i * 1e-3, 20 + i * 0.01, { N: 20 }).CT; const dt = (performance.now() - t0) / 300;
  console.log(`${nm}: ${dt.toFixed(3)} ms/call -> at 960 calls per simulated second: ${(dt * 960).toFixed(0)} ms CPU per simulated second`);
}
const a = bemSlow(0.55, 27.5, { N: 20 }), b = bemFast(0.55, 27.5, { N: 20 }); console.log('fast vs slow CT diff', (b.CT - a.CT).toExponential(2));
function lut(T, J, bb) { const i = Math.min(Math.floor(J / 0.1), t.J.length - 2), k = Math.min(Math.floor((bb - 10) / 5), t.beta75.length - 2); const u = (J - t.J[i]) / 0.1, v = (bb - t.beta75[k]) / 5; return (1 - u) * ((1 - v) * T[i][k] + v * T[i][k + 1]) + u * ((1 - v) * T[i + 1][k] + v * T[i + 1][k + 1]); }
let t0 = performance.now(), s = 0; for (let i = 0; i < 1e6; i++) s += lut(t.CT, 0.4 + (i % 1000) * 1e-3, 20 + (i % 700) * 0.01); const dt = (performance.now() - t0) / 1e6;
console.log(`table bilinear: ${(dt * 1e6).toFixed(1)} ns/call -> ${(dt * 960 * 1e3).toFixed(3)} ms per simulated second (${s > 0})`);
