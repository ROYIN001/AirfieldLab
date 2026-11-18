// Section 4: isolate torque reaction on the ground (thrust zero, torque applied), compare main-gear loads.
import fs from 'fs';
const dir = 'src/';
let src = ['10-atmo.js', '15-geo.js', '20-flight.js'].map(f => fs.readFileSync(dir + f, 'utf8')).join('\n');
const anchor = 'const Mb = [qbar * AC.S * AC.b * Cl, qbar * AC.S * AC.c * Cm, qbar * AC.S * AC.b * Cn];';
src = src.replace(anchor, anchor + '\n    Mb[0] -= (this.spin ?? 1) * (this.Qeng || 0);');
src = src.replace('const T = this.thr * thrustAvail(V);', 'const T = this.noThrust ? 0 : this.thr * thrustAvail(V);');
const M = new Function(src + '\nreturn { AC, Aircraft, Flight, DEG, RAD };')();
const { Flight, DEG, RAD } = M;
const Q = 700e3 / (2000 * 2 * Math.PI / 60); const r = {};
for (const [name, q, spin] of [['none', 0, 1], ['CW_from_behind', Q, 1], ['CCW_from_behind', Q, -1]]) {
  const f = new Flight({ oatC: 31 }); const ac = f.ac; ac.setParked(0, 0, 30 * DEG);
  ac.noThrust = true; ac.Qeng = q; ac.spin = spin; ac.cmd.brake = ac.brake = 1; ac.cmd.thr = ac.thr = 0;
  for (let i = 0; i < 240 * 8; i++) ac.step(1 / 240);
  const a = ac.air; r[name] = { loads_N: a.load.map(v => +v.toFixed(0)), dLminusR_N: +(a.load[1] - a.load[2]).toFixed(0), phi_deg: +(a.phi * RAD).toFixed(3), gs: +a.gs.toFixed(4) };
}
r.expected_dLminusR = +(2 * Q / 3.10).toFixed(0);
console.log(JSON.stringify(r));
