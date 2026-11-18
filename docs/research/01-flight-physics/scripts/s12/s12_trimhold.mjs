// s12_trimhold.mjs - how well does Aircraft.setApproach() trim hold with fixed controls (no wind)? 20 s open loop.
import { M } from 'test/harness.mjs';
const { Aircraft, RAD, KT, FT } = M;
for (const dist of [5500, 9000]) {
  const ac = new Aircraft(); const tr = ac.setApproach({ dist });
  const a0 = { ...ac.air }; const de = ac.de, thr = ac.thr;
  let maxQ = 0;
  for (let i = 0; i < 240 * 20; i++) { ac.cmd.de = de; ac.cmd.thr = thr; ac.step(1 / 240); maxQ = Math.max(maxQ, Math.abs(ac.air.q)); }
  const a = ac.air;
  console.log(JSON.stringify({ dist, h0_m: +a0.h.toFixed(1), alpha_deg: +(tr.alpha * RAD).toFixed(3), de_deg: +(tr.de * RAD).toFixed(3), thr: +tr.thr.toFixed(4),
    dTheta_deg_20s: +((a.theta - a0.theta) * RAD).toFixed(3), dIAS_kt_20s: +((a.ias - a0.ias) / KT).toFixed(3),
    vs0_fpm: +(a0.vs / FT * 60).toFixed(1), vs20_fpm: +(a.vs / FT * 60).toFixed(1), maxQ_dps: +(maxQ * RAD).toFixed(3) }));
}
