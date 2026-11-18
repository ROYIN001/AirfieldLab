// Section 4: compute expected values for tests T-E-xx from the proposed model.
import { M } from 'test/harness.mjs';
import { makeEngine, ENG } from './e4_engine.mjs';
const { atmosphere, FT } = M;
const r = {};
const E = makeEngine();
r.consts = { thF: E.thF.toFixed(4), PcR_kW: (E.PcR / 1e3).toFixed(1), ITTcR_K: E.ITTcR.toFixed(1), PcI_kW: (E.PcI / 1e3).toFixed(1), Qlim_Nm: (ENG.P_rated / (2000 * 2 * Math.PI / 60)).toFixed(0), Qlim_lbft: (ENG.P_rated / (2000 * 2 * Math.PI / 60) / 1.355818).toFixed(0) };
// Fit check of kMap to JSBSim engtm601 EnginePowerRPM_N1 at 2000 rpm (N1 idle 60): P/700 hp
const tbl = [[86, 225], [94, 450], [95, 495], [96, 525], [97, 565], [98, 610], [99, 650], [100, 700]];
r.kFit = tbl.map(([n, hp]) => [n, +(Math.log(hp / 700) / Math.log((n - 60) / 40)).toFixed(2)]);
// Power available vs OAT at VTBD (elev 2.65 m), static
const elev = 2.65;
r.vtbd = {};
for (const oat of [15, 25, 31, 34, 37, 38, 40, 45]) {
  const isa = oat - (15 - 0.0065 * elev); const a = atmosphere(elev, isa);
  const L = E.limits(a.T / 288.15, a.p / 101325, 2000);
  // ITT at the limited power
  const th = a.T / 288.15, de = a.p / 101325; const Pc = L.P / (de * Math.sqrt(th));
  r.vtbd[oat] = { isaDev: +isa.toFixed(1), P_kW: +(L.P / 1e3).toFixed(1), by: L.by, ITT_C: +(th * E.ITTc(Pc) - 273.15).toFixed(0), Ng: +(E.fInv(Pc) * Math.sqrt(th)).toFixed(1), sigma: +(a.rho / 1.225).toFixed(4) };
}
// Lapse slope above flat rating (per degC) for n = 2.08, 3.0, 3.63
r.slope = {};
for (const n of [2.08, 3.0, 3.63]) { const En = makeEngine({ ...ENG, nITT: n }); const a37 = atmosphere(elev, 37 - 15 + 0.0065 * elev), a38 = atmosphere(elev, 38 - 15 + 0.0065 * elev), a45 = atmosphere(elev, 45 - 15 + 0.0065 * elev);
  const P = (a) => En.limits(a.T / 288.15, a.p / 101325, 2000).P; r.slope['n' + n] = { P38: +(P(a38) / 1e3).toFixed(1), P45: +(P(a45) / 1e3).toFixed(1), pctPerC_38: +((P(a38) / P(a37) - 1) * 100).toFixed(2) }; }
// TCDS cross-model exponent estimates
const cm = (P1, T1, I1, P2, T2, I2) => { const t1 = (T1 + 273.15) / 288.15, t2 = (T2 + 273.15) / 288.15; const pc1 = P1 / Math.sqrt(t1), pc2 = P2 / Math.sqrt(t2); const i1 = (I1 + 273.15) / t1, i2 = (I2 + 273.15) / t2; return +(Math.log(pc1 / pc2) / Math.log(i1 / i2)).toFixed(2); };
r.n_60A_62 = cm(783, 25, 820, 708, 37, 800);
r.n_68B_68 = cm(1194, 30.8, 860, 932, 42.4, 820);
// Altitude, ISA and ISA+20, static and 160 KTAS
r.alt = {};
for (const ft of [0, 5000, 10000, 15000, 20000, 25000]) for (const dIsa of [0, 20]) {
  const a = atmosphere(ft * FT, dIsa);
  const L0 = E.limits(a.T / 288.15, a.p / 101325, 2000);
  const Mach = 160 * 0.514444 / a.a; const am = E.amb(a.T, a.p, Mach); const L1 = E.limits(am.th, am.de, 2000);
  r.alt[ft + 'ft_ISA+' + dIsa] = { P0_kW: +(L0.P / 1e3).toFixed(0), by0: L0.by, P160_kW: +(L1.P / 1e3).toFixed(0), by160: L1.by };
}
// Critical altitude (ISA, static) where ITT starts to limit
{ let lo = 0, hi = 30000; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; const a = atmosphere(m * FT, 0); const L = E.limits(a.T / 288.15, a.p / 101325, 2000); if (L.by === 'TRQ') lo = m; else hi = m; } r.critAlt_ISA_ft = Math.round(lo); }
{ let lo = 0, hi = 30000; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; const a = atmosphere(m * FT, 20); const L = E.limits(a.T / 288.15, a.p / 101325, 2000); if (L.by === 'TRQ') lo = m; else hi = m; } r.critAlt_ISA20_ft = Math.round(lo); }
// Transients at VTBD 31 C static: flight idle -> max (PLA step) and back
function transient(oat, from, to, tEnd = 12, opts = {}) {
  const En = makeEngine({ ...ENG, ...opts }); const isa = oat - (15 - 0.0065 * elev); const a = atmosphere(elev, isa);
  const cond = (pla) => ({ pla, T_K: a.T, p_Pa: a.p });
  En.settle(cond(from), 40); const P0 = En.st.P; const Prat = ENG.P_rated; const marks = {}; let t = 0; let ittMax = -1e9;
  const Ng0 = En.st.Ng; const out = { P_start_kW: +(P0 / 1e3).toFixed(1), Ng_start: +Ng0.toFixed(1), ITT_start: +En.st.ITT.toFixed(0) };
  const dt = 1 / 240; const trace = [];
  while (t < tEnd) { En.step(dt, cond(to)); t += dt; ittMax = Math.max(ittMax, En.st.ITT); const f = En.st.P / Prat;
    if (to > from) { for (const q of [0.25, 0.5, 0.9, 0.95]) if (marks['t' + q] == null && f >= q) marks['t' + q] = +t.toFixed(2);
      if (marks.ngt935 == null && En.st.Ng >= 93.5) marks.ngt935 = +t.toFixed(2); }
    else { for (const q of [0.5, 0.25, 0.1]) if (marks['t' + q] == null && f <= q) marks['t' + q] = +t.toFixed(2); }
    if (Math.abs(t - 1) < dt / 2) out.P_at_1s_frac = +f.toFixed(3);
    if (Math.abs(t - 2) < dt / 2) out.P_at_2s_frac = +f.toFixed(3);
    if (Math.round(t * 240) % 120 === 0) trace.push([+t.toFixed(1), +En.st.Ng.toFixed(1), +(f * 100).toFixed(1), +En.st.ITT.toFixed(0)]);
  }
  return { ...out, ...marks, ittMax: +ittMax.toFixed(0), end_P_kW: +(En.st.P / 1e3).toFixed(1), end_Ng: +En.st.Ng.toFixed(1), end_ITT: +En.st.ITT.toFixed(0), trace };
}
r.accel31 = transient(31, 0, 1);
r.accel38 = transient(38, 0, 1);
r.accel15 = transient(15, 0, 1);
r.decel31 = transient(31, 1, 0);
// TM-style check: Ng 64 % -> 93.5 % : start with a PLA giving Ng 64? (below FI); emulate with Ng_FI=64 for this check
r.ng64to935 = transient(15, 0, 1, 8, { Ng_FI: 64 });
// Limiter off on a cold day: overtorque?
{ const En = makeEngine({ ...ENG, limiter: false }); const a = atmosphere(elev, -10 - 15); const c = { pla: 1, T_K: a.T, p_Pa: a.p }; En.settle({ ...c, pla: 0 }, 30); En.settle(c, 20);
  r.cold_nolimiter = { Q_Nm: +En.st.Q.toFixed(0), Q_pct: +(En.st.Q / (ENG.P_rated / (2000 * 2 * Math.PI / 60)) * 100).toFixed(0), P_kW: +(En.st.P / 1e3).toFixed(0), Ng: +En.st.Ng.toFixed(1), overT_s: +En.st.over.trq.toFixed(1) }; }
{ const En = makeEngine({ ...ENG, limiter: true }); const a = atmosphere(elev, -10 - 15); const c = { pla: 1, T_K: a.T, p_Pa: a.p }; En.settle({ ...c, pla: 0 }, 30); En.settle(c, 20);
  r.cold_limiter = { Q_Nm: +En.st.Q.toFixed(0), P_kW: +(En.st.P / 1e3).toFixed(0), Ng: +En.st.Ng.toFixed(1), overT_s: +En.st.over.trq.toFixed(2) }; }
// Hot day no limiter: overtemp?
{ const En = makeEngine({ ...ENG, limiter: false }); const a = atmosphere(elev, 40 - 15 + 0.0065 * elev); const c = { pla: 1, T_K: a.T, p_Pa: a.p }; En.settle({ ...c, pla: 0 }, 30); En.settle(c, 20);
  r.hot40_nolimiter = { ITT: +En.st.ITT.toFixed(0), P_kW: +(En.st.P / 1e3).toFixed(0), Ng: +En.st.Ng.toFixed(1), overITT_s: +En.st.over.itt.toFixed(1) }; }
// Flight idle ITT at 31 C
r.FI_31 = transient(31, 0, 0, 1);
console.log(JSON.stringify(r, (k, v) => (k === 'trace' ? v.filter((_, i) => i % 2 === 0).slice(0, 12) : v), 1));
