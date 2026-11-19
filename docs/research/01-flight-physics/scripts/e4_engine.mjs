// Section 4 prototype: PT6A-class free-turbine turboprop gas-generator model (pure JS, no DOM).
// Corrected-parameter form: Pc = P/(delta*sqrt(theta)), Ngc = Ng/sqrt(theta), ITTc = ITT_K/theta.
export const ENG = {
  P_rated: 700e3,        // W, flat-rated shaft power (est.; PT6A-62 TCDS: 708 kW)
  Np_max: 2000,          // rpm propeller (TCDS PT6A-62)
  T_flat_C: 37,          // degC at SL: flat rating corner (TCDS PT6A-62)
  ITT_lim_C: 800,        // degC take-off / MCP (TCDS PT6A-62)
  ITT_start_C: 1000,
  Ng_max: 104.0,         // % (39000/37468 rpm, TCDS)
  Ng_GI: 52, Ng_FI: 68,  // % ground idle / flight idle (NAL paper ranges 50-54 / 67-71)
  kMap: 2.7,             // Pc/Pref = x^k, x=(Ngc-Ng0)/(100-Ng0); k fitted to JSBSim engtm601 table
  Ng0: 52,
  nITT: 3.0,             // d ln Pc / d ln ITTc at the ITT-limited corner (est., range 2.1-3.6)
  tauAcc: 0.6, rAcc: 10, // s, %/s acceleration (est.)
  tauDec: 0.8, rDec: 12, // s, %/s deceleration (est.)
  tauITT: 1.5, kITTacc: 4.0, // s; K per (%/s) of dNg/dt (est.)
  limiter: true,
};
const T0 = 288.15, P0 = 101325;
export function makeEngine(p = ENG) {
  const thF = (273.15 + p.T_flat_C) / T0;
  const PcR = p.P_rated / Math.sqrt(thF);               // corrected power at the corner
  const ITTcR = (273.15 + p.ITT_lim_C) / thF;          // corrected ITT at the corner
  const xFI = (p.Ng_FI - p.Ng0) / (100 - p.Ng0);
  const PcI = p.P_rated * Math.pow(xFI, p.kMap);       // corrected power at flight idle
  // linear ITTc(Pc) through the corner with slope giving local exponent nITT there:
  // n = (ITTcR/PcR) * dPc/dITTc  =>  dITTc/dPc = ITTcR/(n*PcR)
  const slope = ITTcR / (p.nITT * PcR);
  const ITTc = (Pc) => ITTcR + slope * (Pc - PcR);
  const PcAtITT = (ittc) => PcR + (ittc - ITTcR) / slope;
  const fMap = (Ngc) => { const x = Math.max(0, (Ngc - p.Ng0) / (100 - p.Ng0)); return p.P_rated * Math.pow(x, p.kMap); };
  const fInv = (Pc) => p.Ng0 + (100 - p.Ng0) * Math.pow(Math.max(Pc, 0) / p.P_rated, 1 / p.kMap);
  const amb = (T_K, p_Pa, M = 0) => { const Tt = T_K * (1 + 0.2 * M * M), pt = p_Pa * Math.pow(1 + 0.2 * M * M, 3.5); return { th: Tt / T0, de: pt / P0 }; };
  function limits(th, de, Np) {
    const w = Np * 2 * Math.PI / 60, Qlim = p.P_rated / (p.Np_max * 2 * Math.PI / 60);
    const P_trq = Qlim * w;
    const P_itt = de * Math.sqrt(th) * PcAtITT((273.15 + p.ITT_lim_C) / th);
    const P_ng = de * Math.sqrt(th) * fMap(p.Ng_max / Math.sqrt(th));
    const P = Math.min(P_trq, P_itt, P_ng);
    const by = P === P_trq ? 'TRQ' : P === P_itt ? 'ITT' : 'NG';
    return { P, by, P_trq, P_itt, P_ng, Qlim };
  }
  const st = { Ng: p.Ng_FI, ITT: null, P: 0, Q: 0, limitBy: '', over: { trq: 0, itt: 0 } };
  function steadyNgFor(P, th, de) { return fInv(P / (de * Math.sqrt(th))) * Math.sqrt(th); }
  function step(dt, { pla, T_K, p_Pa, M = 0, Np = p.Np_max }) {
    const { th, de } = amb(T_K, p_Pa, M);
    // PLA 0 = flight idle, 1 = max. Hydromechanical: lever schedules physical Ng.
    let NgCmd = p.Ng_FI + Math.max(0, Math.min(1, pla)) * (p.Ng_max - p.Ng_FI);
    if (p.limiter) { const L = limits(th, de, Np); NgCmd = Math.min(NgCmd, steadyNgFor(L.P, th, de)); st.limitBy = L.by; }
    const e = NgCmd - st.Ng;
    const rate = e > 0 ? Math.min(e / p.tauAcc, p.rAcc) : Math.max(e / p.tauDec, -p.rDec);
    st.Ng += rate * dt;
    const Pc = fMap(st.Ng / Math.sqrt(th));
    st.P = de * Math.sqrt(th) * Pc;
    const w = Np * 2 * Math.PI / 60; st.Q = st.P / w;
    const ITTss = th * ITTc(Pc) - 273.15 + p.kITTacc * Math.max(0, rate);
    st.ITT = st.ITT == null ? ITTss : st.ITT + (ITTss - st.ITT) * (1 - Math.exp(-dt / p.tauITT));
    const Qlim = p.P_rated / (p.Np_max * 2 * Math.PI / 60);
    if (st.Q > Qlim * 1.0 + 1) st.over.trq += dt; if (st.ITT > p.ITT_lim_C + 0.5) st.over.itt += dt;
    return st;
  }
  function settle(cond, t = 30) { for (let i = 0; i < t * 240; i++) step(1 / 240, cond); return st; }
  return { p, st, step, settle, limits, amb, fMap, fInv, ITTc, PcAtITT, thF, PcR, ITTcR, PcI, slope };
}
