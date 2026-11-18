// Section 4: time to 95 % rated power from different starting points (ground idle, flight idle, approach power), VTBD 31 C static.
import { M } from 'test/harness.mjs';
import { makeEngine, ENG } from './e4_engine.mjs';
const a = M.atmosphere(2.65, 16); const r = {};
function from(Ng0, label) {
  const E = makeEngine({ ...ENG, Ng_FI: Math.min(ENG.Ng_FI, Ng0) }); E.st.Ng = Ng0; E.st.ITT = null; let t = 0, t95 = null, t50 = null; const P0 = E.fMap(Ng0 / Math.sqrt(a.T / 288.15)) * Math.sqrt(a.T / 288.15) * a.p / 101325;
  while (t < 15) { E.step(1 / 240, { pla: 1, T_K: a.T, p_Pa: a.p }); t += 1 / 240; const f = E.st.P / ENG.P_rated; if (t50 == null && f >= 0.5) t50 = +t.toFixed(2); if (t95 == null && f >= 0.95) t95 = +t.toFixed(2); }
  r[label] = { Ng0, P0_pct: +(P0 / ENG.P_rated * 100).toFixed(1), t50, t95 };
}
from(52, 'groundIdle'); from(68, 'flightIdle');
// approach power ~ 25 % rated: find Ng
{ const th = a.T / 288.15, de = a.p / 101325; const E = makeEngine(); const Ng = E.fInv(0.25 * ENG.P_rated / (de * Math.sqrt(th))) * Math.sqrt(th); from(Ng, 'approach25pct'); }
console.log(JSON.stringify(r));
