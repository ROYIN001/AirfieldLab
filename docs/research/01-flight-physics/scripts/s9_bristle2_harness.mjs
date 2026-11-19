// PROTOTYPE B (scratch only): bristle deflection z per wheel held constant inside RK4 and advanced AFTER the step with the exact
// exponential update for constant contact velocity:  z ← s·z0 + (z − s·z0)·exp(−|v|·dt/z0), s = sign(v)   (unconditionally stable).
// Force inside RK stages: F = −μN·clamp((z + τ·v)/z0, −1, 1)  (Coulomb-limited spring + damper). Repo untouched.
import fs from 'fs';
const root = 'src/';
let fl = fs.readFileSync(root + '20-flight.js', 'utf8');
const rep = (a, b) => { if (!fl.includes(a)) throw new Error('patch miss: ' + a.slice(0, 60)); fl = fl.replace(a, b); };
rep('this.wow = [false, false, false];', 'this.zb = [0, 0, 0, 0, 0, 0]; this.vc = [0, 0, 0, 0, 0, 0]; this.wow = [false, false, false];');
rep('const Fl = -N * mux * Math.tanh(vl / 0.25), Fs = -N * 0.65 * Math.tanh(vs / 0.35);',
  `const Z0 = BR.z0, TB = BR.tau, zl = this.zb[2 * i], zs = this.zb[2 * i + 1];
      if (diag) { this.vc[2 * i] = vl; this.vc[2 * i + 1] = vs; }
      const mub = g.brake ? this.brake * 0.55 : 0, cl1 = (x) => Math.max(-1, Math.min(1, x));
      const Fl = -N * 0.022 * Math.tanh(vl / 0.25) - N * mub * cl1((zl + TB * vl) / Z0), Fs = -N * 0.65 * cl1((zs + TB * vs) / Z0);`);
rep('if (pen <= 0) { if (diag) { diag.wow[i] = false; diag.load[i] = 0; } continue; }', 'if (pen <= 0) { if (diag) { diag.wow[i] = false; diag.load[i] = 0; this.vc[2 * i] = this.vc[2 * i + 1] = NaN; } continue; }');
// after the RK4 step: updateAir(dt) evaluates deriv with diag → contact velocities are known; advance z exactly
rep('    this.t += dt;\n    this.updateAir(dt);', `    this.t += dt;
    this.updateAir(dt);
    for (let j = 0; j < 6; j++) { const v = this.vc[j];
      if (Number.isNaN(v)) { this.zb[j] = 0; continue; }
      const s = Math.sign(v), Z0 = BR.z0; this.zb[j] = s * Z0 + (this.zb[j] - s * Z0) * Math.exp(-Math.abs(v) * dt / Z0); }`);
const src = ['10-atmo.js', '15-geo.js'].map(f => fs.readFileSync(root + f, 'utf8')).join('\n') + '\nconst BR = globalThis.__BR || { z0: 0.005, tau: 0.02 };\n' + fl;
export const MB2 = new Function(src + '\nreturn { FIELD, AC, Aircraft, Flight, SCENARIOS, KT, FT, DEG, RAD, G0, eulerToQ, qToR };')();
