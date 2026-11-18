// Section 4 review: run the literal §4.7 Turboprop sketch (extracted from the md) against the T-E test settings.
import fs from 'fs';
import { M } from 'test/harness.mjs';
const md = fs.readFileSync('docs/research/01-flight-physics/sec-04-turboprop.md', 'utf8');
const code = md.match(/```js\n([\s\S]*?)```/)[1];
const { Turboprop, ENGINE_PT6 } = new Function('clamp', code + '\nreturn { Turboprop, ENGINE_PT6 };')((x, a, b) => Math.min(b, Math.max(a, x)));
const elev = 2.65, dt = 1 / 240, r = {};
const atmAt = (oat, h = elev) => M.atmosphere(h, oat - (15 - 0.0065 * h));
const Qlim = 700e3 / (2000 * Math.PI / 30);
// T-E-01..04
for (const oat of [15, 31, 37, 38, 45]) { const e = new Turboprop(); const a = atmAt(oat); const P = e.pMax(a.T / 288.15, a.p / 101325, 2000 * Math.PI / 30); r['pMax_' + oat] = [+(P / 1e3).toFixed(1), e.limitBy]; }
{ const e = new Turboprop(); const a = M.atmosphere(10000 * M.FT, 0); r.pMax_10kft_ISA = +(e.pMax(a.T / 288.15, a.p / 101325, 2000 * Math.PI / 30) / 1e3).toFixed(1); }
function run(oat, { Ng0, plaFrom, plaTo, mode = 'power', limiter = true, T = 15, Np = 2000, p = {} }) {
  const e = new Turboprop({ ...ENGINE_PT6, ...p }); const a = atmAt(oat); const o = { mode, limiter, groundIdle: false };
  if (Ng0 != null) e.Ng = Ng0; else for (let i = 0; i < 240 * 40; i++) e.update(dt, plaFrom, a, 0, Np, o);
  e.over = { trq: 0, itt: 0 };
  const res = { P0: e.P }; let t = 0, ittMax = -1e9, Qmax = 0;
  while (t < T - 1e-9) { e.update(dt, plaTo, a, 0, Np, o); t += dt; const f = e.P / 700e3; ittMax = Math.max(ittMax, e.ITT); Qmax = Math.max(Qmax, e.Q);
    if (Math.abs(t - 1) < dt / 2) res.f1 = +f.toFixed(3);
    for (const q of [0.5, 0.95]) if (plaTo > plaFrom && res['t' + q] == null && f >= q) res['t' + q] = +t.toFixed(2);
    if (plaTo < plaFrom && res.t10 == null && f <= 0.1) res.t10 = +t.toFixed(2);
    if (res.ng935 == null && e.Ng >= 93.5) res.ng935 = +t.toFixed(2); }
  return { ...res, P0: +(res.P0 / 1e3).toFixed(1), Pend_kW: +(e.P / 1e3).toFixed(1), Ngend: +e.Ng.toFixed(2), ittMax: +ittMax.toFixed(0), ittEnd: +e.ITT.toFixed(0), Qmax_pct: +(Qmax / Qlim * 100).toFixed(1), overTrq: +e.over.trq.toFixed(2), overItt: +e.over.itt.toFixed(2), limitBy: e.limitBy };
}
r.TE05_15 = run(15, { plaFrom: 0, plaTo: 1 });
r.TE05_31 = run(31, { plaFrom: 0, plaTo: 1 });
r.TE05_38 = run(38, { plaFrom: 0, plaTo: 1 });
r.TE07 = run(15, { plaFrom: 0, plaTo: 1, p: { Ng_FI: 64 } });
r.TE08 = run(31, { plaFrom: 1, plaTo: 0 });
r.TE09_GI = run(31, { Ng0: 52, plaFrom: 0, plaTo: 1, p: { Ng_FI: 52 } });
r.TE09_FI = run(31, { Ng0: 68, plaFrom: 0, plaTo: 1 });
r.TE10_on = run(-10, { plaFrom: 0, plaTo: 1, mode: 'ng', limiter: true, T: 20 });
r.TE10_off = run(-10, { plaFrom: 0, plaTo: 1, mode: 'ng', limiter: false, T: 20 });
r.TE11_off40 = run(40, { plaFrom: 0, plaTo: 1, mode: 'ng', limiter: false, T: 20 });
r.TE11_on38 = run(38, { plaFrom: 0, plaTo: 1, mode: 'ng', limiter: true, T: 20 });
r.TE15 = run(15, { plaFrom: 0, plaTo: 1, Np: 1700, T: 20 });
console.log(JSON.stringify(r).replace(/},"/g, '},\n"'));
