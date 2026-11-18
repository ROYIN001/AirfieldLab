// Section 6: hands-off speed stability of the CURRENT DIRECT mode (auto-trim on q) vs trim frozen
import { M } from 'test/harness.mjs';
const { Flight, SCENARIOS, KT, FT, DEG, RAD } = M;
function run({ freeze, pull = 0.15, tPull = 4, T = 120, disturb = 'pull' }) {
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'man', assist: false, autoThr: false, dist: 12000, seed: 1 });
  f.input.thr = f.trim.thr; const td0 = f.laws.trimDe; const v0 = f.ac.air.ias / KT;
  const log = []; let vmin = 1e9, vmax = 0;
  while (f.ac.t < T && !f.crashed) {
    const t = f.ac.t;
    f.input.y = disturb === 'pull' ? (t < tPull ? pull : 0) : (t < tPull ? -pull : 0);
    f.tick(f.dt);
    if (freeze) f.laws.trimDe = td0;
    const v = f.ac.air.ias / KT; if (t > tPull) { vmin = Math.min(vmin, v); vmax = Math.max(vmax, v); }
    if (Math.abs((t % 10)) < f.dt) log.push([Math.round(t), +v.toFixed(1), +(f.ac.de * RAD).toFixed(2), +(f.ac.air.theta * RAD).toFixed(1), +(-f.ac.x[2]).toFixed(0)]);
  }
  const vEnd = f.ac.air.ias / KT;
  return { freeze, disturb, v0: +v0.toFixed(1), vmin: +vmin.toFixed(1), vmax: +vmax.toFixed(1), vEnd: +vEnd.toFixed(1), trimDeStart: +(td0 * RAD).toFixed(2), trimDeEnd: +(f.laws.trimDe * RAD).toFixed(2), crashed: f.crashed, log };
}
for (const d of ['pull', 'push']) for (const freeze of [false, true]) { const r = run({ freeze, disturb: d }); console.log(JSON.stringify({ ...r, log: undefined })); console.log('  t,ias,de,theta,h: ' + r.log.map((x) => x.join('/')).join(' ')); }
