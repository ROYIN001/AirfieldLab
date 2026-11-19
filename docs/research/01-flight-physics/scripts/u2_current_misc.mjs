// u2_current_misc.mjs — current-model numbers: parked wing height, power-step pitch response, static elevator moment
import { M } from 'test/harness.mjs';
const { Aircraft, AC, DEG, FIELD } = M;
const ac = new Aircraft(); ac.isaDev = 31 - (15 - 0.0065 * FIELD.elev);
ac.setParked(0, 0, 0);
for (let i = 0; i < 240 * 5; i++) ac.step(1 / 240);
const h = -ac.x[2];
console.log(`parked: CG height ${h.toFixed(3)} m, repo wing height ${(h - 0.35).toFixed(3)} m (h/b ${((h - 0.35) / AC.b).toFixed(3)}), phiGE ${ac.air.phiGE.toFixed(3)}; MAC c/4 (z +0.15 FRD) height ${(h - 0.15).toFixed(3)} m (h/b ${((h - 0.15) / AC.b).toFixed(3)})`);
// static full power + full up elevator: pitch moment from elevator (qbar ~ 0)
ac.thr = ac.cmd.thr = 1; ac.de = ac.cmd.de = -AC.deUp; ac.brake = ac.cmd.brake = 1;
const d = { wow: [0, 0, 0], load: [0, 0, 0] }; const k = new Float64Array(13); ac.deriv(ac.x, k, d);
console.log(`static full power: qbar ${d.qbar.toExponential(2)} Pa, elevator moment ${(d.qbar * AC.S * AC.c * AC.Cmde * ac.de).toExponential(2)} N·m, nose load ${d.load[0].toFixed(0)} N, T ${d.T.toFixed(0)} N`);
// approach: instantaneous power step to full, elevator fixed -> initial qdot
const b = new Aircraft(); b.isaDev = ac.isaDev; b.setApproach({ dist: 5500 });
const k0 = new Float64Array(13), d0 = { wow: [0, 0, 0], load: [0, 0, 0] }; b.deriv(b.x, k0, d0);
b.thr = 1; const k1 = new Float64Array(13), d1 = { wow: [0, 0, 0], load: [0, 0, 0] }; b.deriv(b.x, k1, d1);
console.log(`approach power step: T ${d0.T.toFixed(0)} -> ${d1.T.toFixed(0)} N; qdot ${(k0[11] / DEG).toFixed(3)} -> ${(k1[11] / DEG).toFixed(3)} deg/s2; rdot ${(k1[12] / DEG).toFixed(3)}; pdot ${(k1[10] / DEG).toFixed(3)}`);
// 3 s after the power step (elevator fixed): pitch change
b.cmd.thr = 1; const th0 = b.air.theta; let maxdq = 0; for (let i = 0; i < 240 * 3; i++) { b.step(1 / 240); maxdq = Math.max(maxdq, b.air.q); }
console.log(`after 3 s: dtheta ${((b.air.theta - th0) / DEG).toFixed(2)} deg, max q ${(maxdq / DEG).toFixed(2)} deg/s, beta ${(b.air.beta / DEG).toFixed(2)} deg, phi ${(b.air.phi / DEG).toFixed(2)} deg`);
