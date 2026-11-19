// Section 4: autoland regression with the proposed gas-generator lag in the loop (bridge: thrust fraction = P/P_rated).
// Scratch copy only; the repo is not modified.
import fs from 'fs';
import { makeEngine, ENG } from './e4_engine.mjs';
const dir = 'src/';
let src = ['10-atmo.js', '15-geo.js', '20-flight.js'].map(f => fs.readFileSync(dir + f, 'utf8')).join('\n');
const lag = 'this.thr += (Math.max(AC.idle, clamp(c.thr, 0, 1)) - this.thr) * (1 - Math.exp(-dt / 1.0));';
if (!src.includes(lag)) throw new Error('anchor');
src = src.replace(lag, 'if (this.engine) { this.thr = this.engine(dt, c.thr, this); } else { ' + lag + ' }');
const M = new Function(src + '\nreturn { AC, Aircraft, Flight, SCENARIOS, KT, FT, DEG, RAD, G0, atmosphere, FIELD };')();
const { Flight, SCENARIOS, AC, atmosphere, FIELD } = M;
function attach(f, mode) {
  const E = makeEngine({ ...ENG, limiter: true }); const ac = f.ac;
  // power-demand lever: PLA 0..1 maps linearly to power between flight idle and max available
  let init = false;
  ac.engine = (dt, thrCmd, a) => {
    const h = -a.x[2]; const atm = atmosphere(FIELD.elev + h, a.isaDev);
    const th = atm.T / 288.15, de = atm.p / 101325; const L = E.limits(th, de, 2000);
    const PFI = de * Math.sqrt(th) * E.fMap(ENG.Ng_FI / Math.sqrt(th));
    const pla = Math.max(0, Math.min(1, (thrCmd - AC.idle) / (1 - AC.idle)));
    const Pdem = PFI + pla * (L.P - PFI);
    const NgCmdEq = E.fInv(Pdem / (de * Math.sqrt(th))) * Math.sqrt(th);
    // drive the engine's Ng loop toward NgCmdEq by converting to an equivalent physical-Ng PLA
    const plaNg = (NgCmdEq - ENG.Ng_FI) / (ENG.Ng_max - ENG.Ng_FI);
    if (!init) { E.st.Ng = NgCmdEq; init = true; }
    E.step(dt, { pla: plaNg, T_K: atm.T, p_Pa: atm.p });
    return Math.max(0, E.st.P / ENG.P_rated);
  };
  return E;
}
const res = {};
for (const mode of ['current', 'engine']) for (const [key, sc] of Object.entries(SCENARIOS)) {
  const f = new Flight({ wind: sc, pilot: 'ap', seed: 5 });
  if (mode === 'engine') attach(f);
  let maxGs = 0, minIas = 1e9, maxIas = 0;
  while (f.ac.t < 260 && !f.ev.done && !f.crashed) { f.tick(f.dt); const a = f.ac.air; if (a.h > 20) { maxGs = Math.max(maxGs, Math.abs(a.gsDots)); minIas = Math.min(minIas, a.ias); maxIas = Math.max(maxIas, a.ias); } }
  const s = f.ev.score();
  res[mode + '_' + key] = { crashed: f.crashed, score: s && s.total, maxGsDots: +maxGs.toFixed(2), iasRange_kt: [+(minIas / 0.514444).toFixed(1), +(maxIas / 0.514444).toFixed(1)] };
}
console.log(JSON.stringify(res, null, 0).replace(/},/g, '},\n'));
