import { M } from './s9_harness.mjs';
for (const dt of [1 / 240, 1 / 2000]) { const ac = new M.Aircraft(); ac.setParked(0, 0, 0); for (let i = 0; i < 2400; i++) ac.step(1 / 240);
  ac.x[3] = 15; ac.cmd.brake = 1; ac.brake = 1; ac.cmd.thr = 0; const N = Math.round(15 / dt); let t5 = null;
  for (let i = 0; i < N; i++) { ac.step(dt); if (t5 === null && ac.air.gs < 0.05) t5 = ac.t; }
  console.log(`tanh dt 1/${Math.round(1 / dt)}: x after 15 s ${ac.x[0].toFixed(3)} m, gs ${ac.air.gs.toExponential(2)}, t(gs<0.05) ${t5 && t5.toFixed(2)} s`); }
