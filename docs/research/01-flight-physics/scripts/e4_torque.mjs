// Section 4: effect of adding engine torque reaction (rolling moment -spin*Q about body x) to a scratch copy of the model.
import fs from 'fs';
const dir = 'src/';
let src = ['10-atmo.js', '15-geo.js', '20-flight.js'].map(f => fs.readFileSync(dir + f, 'utf8')).join('\n');
const anchor = 'const Mb = [qbar * AC.S * AC.b * Cl, qbar * AC.S * AC.c * Cm, qbar * AC.S * AC.b * Cn];';
if (!src.includes(anchor)) throw new Error('anchor not found');
src = src.replace(anchor, anchor + '\n    Mb[0] -= (this.spin ?? 1) * (this.Qeng || 0);');
const M = new Function(src + '\nreturn { AC, Aircraft, Flight, SCENARIOS, KT, FT, DEG, RAD, G0, atmosphere, FIELD };')();
const { AC, Aircraft, Flight, KT, DEG, RAD, G0, atmosphere, FIELD } = M;
const Q = 700e3 / (2000 * 2 * Math.PI / 60);
const res = {};
// 1) Parked, brakes on, full torque (thrust set to full too), settle 6 s, compare main-gear loads
for (const q of [0, Q]) {
  const f = new Flight({ oatC: 31 }); const ac = f.ac; ac.setParked(0, 0, 30 * DEG);
  ac.Qeng = q; ac.cmd.thr = ac.thr = 1; ac.cmd.brake = ac.brake = 1;
  for (let i = 0; i < 240 * 8; i++) ac.step(1 / 240);
  const a = ac.air; res[q ? 'parked_fullTorque' : 'parked_noTorque'] = { loads_N: a.load.map(v => +v.toFixed(0)), dLR_N: +(a.load[1] - a.load[2]).toFixed(0), phi_deg: +(a.phi * RAD).toFixed(3), gs: +a.gs.toFixed(3) };
}
res.expected_dLR_simple = +(Q / 3.10).toFixed(0);
// 2) In flight: aileron needed to hold zero roll acceleration with full torque at given IAS (wings level, beta 0, rudder 0)
const atm = atmosphere(FIELD.elev, 16);
for (const kt of [80, 100, 130]) { const V = kt * KT / Math.sqrt(atm.rho / 1.225); const qb = 0.5 * atm.rho * V * V;
  const da = Q / (qb * AC.S * AC.b * AC.Clda); res['da_trim_deg_' + kt + 'kias'] = +(da * RAD).toFixed(2); }
// 3) Open-loop: approach trim at 95 kt, then apply full torque step (no pilot), bank after 3 s
for (const q of [0, Q]) {
  const f = new Flight({ oatC: 31 }); const ac = f.ac; ac.Qeng = q;
  for (let i = 0; i < 240 * 3; i++) ac.step(1 / 240);
  res['openloop_bank3s_' + (q ? 'Q' : '0')] = +(ac.air.phi * RAD).toFixed(2);
}
console.log(JSON.stringify(res, null, 1));
