// Trainer's available climb gradient (excess thrust over weight) at Vapp, landing config, VTBD 31 C -> F-factor tolerance
import { M } from 'test/harness.mjs';
const { Flight, SCENARIOS, KT, FT, DEG, RAD, AC, G0 } = M;
const f = new Flight({ wind: SCENARIOS.calm });
const ac = f.ac, a = ac.air;
const W = AC.m * G0;
const Tmax = a.T / ac.thr; // thrustAvail(V) at current TAS
console.log('trim thr', ac.thr.toFixed(3), 'T trim N', a.T.toFixed(0), 'Tmax N', Tmax.toFixed(0), 'TAS', (a.V / KT).toFixed(1), 'kt IAS', (a.ias / KT).toFixed(1), 'alpha', (a.alpha * RAD).toFixed(2), 'gamma', (a.gamma * RAD).toFixed(2));
// along-path: T - D - W sin(gamma_air) = 0 at trim with gamma=-3 deg. Available gradient with full power: (Tmax - D)/W
const D = a.T + W * Math.sin(-3 * DEG); // T = D + W sin(gamma) => D = T - W sin(gamma) with gamma=-3deg -> D = T + W sin(3deg)
const Dtrue = a.T - W * Math.sin(a.gamma);
console.log('D (from trim) N', Dtrue.toFixed(0), ' (T-D)/W at full power =', ((Tmax - Dtrue) / W).toFixed(3), ' => F-factor the trainer can just hold level/climb against');
// clean config at 120 kt
