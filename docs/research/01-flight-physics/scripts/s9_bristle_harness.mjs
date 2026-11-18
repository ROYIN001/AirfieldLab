// PROTOTYPE (scratch only): the current model with a Dahl-type bristle friction state per wheel (longitudinal brake + lateral),
// integrated inside RK4 as 6 extra states. Built by text-patching a copy of src/20-flight.js in memory; the repo is not modified.
import fs from 'fs';
const root = 'src/';
let fl = fs.readFileSync(root + '20-flight.js', 'utf8');
const rep = (a, b, all = false) => { if (!fl.includes(a)) throw new Error('patch miss: ' + a.slice(0, 60)); fl = all ? fl.split(a).join(b) : fl.replace(a, b); };
rep('this.x = new Float64Array(13);', 'this.x = new Float64Array(19);');
rep('this.k = [0, 1, 2, 3].map(() => new Float64Array(13)); this.tmp = new Float64Array(13);', 'this.k = [0, 1, 2, 3].map(() => new Float64Array(19)); this.tmp = new Float64Array(19);');
rep('for (let i = 0; i < 13; i++)', 'for (let i = 0; i < 19; i++)', true);
rep('    for (let i = 0; i < 3; i++) {\n      const g = AC.gear[i];', '    for (let j = 13; j < 19; j++) out[j] = -s[j] / 0.02;   // bristles relax when the wheel is off the ground\n    for (let i = 0; i < 3; i++) {\n      const g = AC.gear[i];');
rep('const Fl = -N * mux * Math.tanh(vl / 0.25), Fs = -N * 0.65 * Math.tanh(vs / 0.35);',
  `const Z0 = BR.z0, TB = BR.tau, zl = s[13 + 2 * i], zs = s[14 + 2 * i];
      const zdl = vl * (1 - Math.sign(vl) * zl / Z0), zds = vs * (1 - Math.sign(vs) * zs / Z0);
      out[13 + 2 * i] = zdl; out[14 + 2 * i] = zds;
      const mub = g.brake ? this.brake * 0.55 : 0;
      const Fl = -N * 0.022 * Math.tanh(vl / 0.25) - N * mub * (zl + TB * zdl) / Z0, Fs = -N * 0.65 * (zs + TB * zds) / Z0;`);
const src = ['10-atmo.js', '15-geo.js'].map(f => fs.readFileSync(root + f, 'utf8')).join('\n') + '\nconst BR = globalThis.__BR || { z0: 0.005, tau: 0.02 };\n' + fl;
export const MB = new Function(src + '\nreturn { FIELD, AC, Aircraft, Flight, SCENARIOS, KT, FT, DEG, RAD, G0, eulerToQ, qToR };')();
