// Section 8: measure the current AirfieldLab Wind class (src/20-flight.js) statistics.
import { M } from 'test/harness.mjs';
const { Aircraft, KT, FT } = M;
const Wind = new Aircraft().wind.constructor;
const dt = 1 / 240, V = 95 * KT;
const sd = (x) => { let m = 0; for (const v of x) m += v; m /= x.length; let s = 0; for (const v of x) s += (v - m) ** 2; return Math.sqrt(s / x.length); };
const ac = (x, lag) => { let m = 0; for (const v of x) m += v; m /= x.length; let s = 0, s0 = 0; for (let i = 0; i + lag < x.length; i++) s += (x[i] - m) * (x[i + lag] - m); for (const v of x) s0 += (v - m) ** 2; return (s / (x.length - lag)) / (s0 / x.length); };
for (const [hft, kt, turb] of [[100, 15, 1], [300, 15, 1], [100, 15, 1.6], [50, 10, 0.6], [30, 15, 1]]) {
  const w = new Wind({ fromDeg: 0, kt, turb, seed: 3 });
  const h = hft * FT, N = 240 * 2000, xs = [new Float64Array(N), new Float64Array(N), new Float64Array(N)];
  for (let i = 0; i < 2400; i++) w.update(dt, h, V, 0);
  for (let i = 0; i < N; i++) { w.update(dt, h, V, Math.PI); const a = w.at(h), m = w.mean(h); for (let k = 0; k < 3; k++) xs[k][i] = a[k] - m[k]; }
  const W20 = w.speedAt(6.1);
  const hc = Math.min(Math.max(hft, 10), 1000);
  const swT = 0.1 * W20 * turb, suT = swT / Math.pow(0.177 + 0.000823 * hc, 0.4);
  const Lw = hc * FT, Lu = hc / Math.pow(0.177 + 0.000823 * hc, 1.2) * FT;
  const taper = Math.min(1, h / 15);
  console.log(`h=${hft} ft W10=${kt} kt turb=${turb}: W20(code)=${(W20 / KT).toFixed(2)} kt; spec(8785C with turb factor) su=${suT.toFixed(3)} sw=${swT.toFixed(3)} m/s, Lu=${Lu.toFixed(1)} Lw=${Lw.toFixed(1)} m`);
  console.log(`   measured sigma n=${sd(xs[0]).toFixed(3)} e=${sd(xs[1]).toFixed(3)} d=${sd(xs[2]).toFixed(3)} (taper ${taper.toFixed(2)} -> expected d ${(swT * taper).toFixed(3)})`);
  for (const xi of [0.5, 1, 2]) {
    const lagw = Math.round(xi * Lw / V / dt), lagu = Math.round(xi * Lu / V / dt);
    console.log(`   R(xi=${xi}L): w meas ${ac(xs[2], lagw).toFixed(3)} [code e^-xi=${Math.exp(-xi).toFixed(3)}, Dryden8785C (1-xi/2)e^-xi=${((1 - xi / 2) * Math.exp(-xi)).toFixed(3)}]; u meas ${ac(xs[0], lagu).toFixed(3)} [e^-xi ${Math.exp(-xi).toFixed(3)}]`);
  }
}
// default app demo turbulence: turb = kt>12 ? 1.1 : 0.5
