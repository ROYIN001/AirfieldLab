import { MB } from './s9_bristle_harness.mjs';
const ac = new MB.Aircraft(); ac.setParked(0, 0, 30 * MB.DEG);
for (let i = 1; i <= 240 * 60; i++) { ac.step(1 / 240); if (i % (240 * 10) === 0) { const x = ac.x; console.log(`t${ac.t.toFixed(0)} n ${x[0].toFixed(5)} e ${x[1].toFixed(5)} vn ${x[3].toExponential(2)} ve ${x[4].toExponential(2)} r ${x[12].toExponential(2)} psi ${(ac.air.psi * 180 / Math.PI).toFixed(5)} z: ${Array.from(x.slice(13)).map((v) => (v * 1000).toFixed(3)).join(' ')} mm  brake ${ac.brake} loads ${ac.air.load.map((v) => v.toFixed(0)).join('/')}`); } }
