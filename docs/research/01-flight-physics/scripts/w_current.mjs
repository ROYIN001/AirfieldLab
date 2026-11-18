// Measure the current Wind class: sigma, autocorrelation, axes, ground fade.
import fs from 'fs';
const src = ['10-atmo.js', '15-geo.js', '20-flight.js'].map(f => fs.readFileSync('src/' + f, 'utf8')).join('\n');
const M = new Function(src + '\nreturn { Wind, KT, FT, DEG, RAD };')();
const { Wind, KT, FT, DEG } = M;
function run({ kt = 15, turb = 1.6, h = 100 * FT, V = 95 * KT, hdg = 0, fromDeg = 270, N = 240 * 3600, dt = 1 / 240, seed = 3 }) {
  const w = new Wind({ fromDeg, kt, turb, seed });
  const xs = [[], [], []];
  for (let i = 0; i < N; i++) { w.update(dt, h, V, hdg); const a = w.at(h), m = w.mean(h); xs[0].push(a[0] - m[0]); xs[1].push(a[1] - m[1]); xs[2].push(a[2] - m[2]); }
  const st = xs.map(x => { const mu = x.reduce((s, v) => s + v, 0) / x.length; const sd = Math.sqrt(x.reduce((s, v) => s + (v - mu) ** 2, 0) / x.length); return { mu, sd }; });
  // autocorrelation at lags
  const ac = (x, lag) => { const n = x.length - lag; let s = 0, s0 = 0; const mu = x.reduce((a, b) => a + b, 0) / x.length; for (let i = 0; i < n; i++) s += (x[i] - mu) * (x[i + lag] - mu); for (let i = 0; i < x.length; i++) s0 += (x[i] - mu) ** 2; return (s / n) / (s0 / x.length); };
  return { st, ac, xs };
}
const h = 100 * FT, V = 95 * KT, hft = 100;
const W10 = 15 * KT, W20 = W10 * Math.pow(6.1 / 10, 1 / 7) / FT;
const sw = 0.1 * W20 * 1.6 * FT, su = sw / Math.pow(0.177 + 0.000823 * hft, 0.4);
const Lw = hft * FT, Lu = hft / Math.pow(0.177 + 0.000823 * hft, 1.2) * FT;
console.log('expected (current formula) sigma_u=sigma_v', su.toFixed(3), 'm/s sigma_w', sw.toFixed(3), 'm/s  Lu', Lu.toFixed(1), 'm Lw', Lw.toFixed(1), 'm; W20', (W20 * FT / KT).toFixed(2), 'kt');
const r = run({ h, V });
console.log('measured sd N,E,D', r.st.map(s => s.sd.toFixed(3)).join(' '), 'means', r.st.map(s => s.mu.toFixed(3)).join(' '));
// autocorr of along-track (N since hdg=0) at lag tau: expected first-order exp(-V tau / L)
for (const tau of [0.5, 1, 2, 5]) {
  const lag = Math.round(tau * 240);
  console.log(`tau ${tau}s: R_u meas ${r.ac(r.xs[0], lag).toFixed(3)} exp(-V t/Lu) ${Math.exp(-V * tau / Lu).toFixed(3)} | R_w meas ${r.ac(r.xs[2], lag).toFixed(3)} 1st-order ${Math.exp(-V * tau / Lw).toFixed(3)} Dryden2nd ${((1 - V * tau / (2 * Lw)) * Math.exp(-V * tau / Lw)).toFixed(3)}`);
}
// axes: with hdg=0 (track north) and wind from 270 (west), u_g should be along the mean wind (east-west) per spec; current applies along track
console.log('axis check: track north, wind from west -> current puts sigma_u on N (track) =', r.st[0].sd.toFixed(3), 'and sigma_v on E =', r.st[1].sd.toFixed(3), '(identical sigmas, so only the length-scale/axis assignment differs)');
// ground fade
const w2 = new Wind({ fromDeg: 270, kt: 15, turb: 1.6, seed: 1 });
let sdw5 = 0, n5 = 0; for (let i = 0; i < 240 * 600; i++) { w2.update(1 / 240, 5 * FT, V, 0); const a = w2.at(5 * FT); sdw5 += a[2] ** 2; n5++; }
console.log('h=5 ft: sd_w measured', Math.sqrt(sdw5 / n5).toFixed(3), 'm/s (fade factor min(1,h/15m)=', Math.min(1, 5 * FT / 15).toFixed(3), ')');
// calm wind -> no turbulence even if turb>0
const w3 = new Wind({ fromDeg: 270, kt: 0, turb: 2, seed: 1 }); w3.update(1 / 240, 100, 50, 0); console.log('kt=0, turb=2 ->', w3.at(100));
// dt independence check: sd at dt 1/60 vs 1/240
const r60 = run({ h, V, dt: 1 / 60, N: 60 * 3600 });
console.log('dt=1/60 sd', r60.st.map(s => s.sd.toFixed(3)).join(' '));
// mean wind profile
for (const hh of [0.3, 2, 6.1, 10, 30, 100, 300]) console.log('h', hh, 'm  speed kt', (w2.speedAt(hh) / KT).toFixed(2));
