import { M } from './harness.mjs';
const { Flight, SCENARIOS, KT, FT, DEG, RAD, FIELD, wrapPi } = M;
// robot pilot that follows the flight director through the assist laws (like a player on a phone)
for (const [key, sc] of Object.entries({ calm: SCENARIOS.calm, xl: SCENARIOS.xl })) for (const assist of [true, false]) {
  const f = new Flight({ wind: sc, pilot: 'man', assist, autoThr: assist, seed: 3, dh: 25, dtl: 60 });
  let maxPhi = 0;
  while (f.ac.t < 260 && !f.ev.done && !f.crashed) {
    const a = f.ac.air, g = f.ap.guidance();
    if (assist) {
      f.input.x = Math.max(-1, Math.min(1, g.phiCmd / (33 * DEG)));
      // pitch: steer flight path toward the FD (proportional), flare by hand below 6 m
      let gCmd = g.gammaCmd; if (a.hWheel < 6) gCmd = Math.asin(-(0.25 + a.hWheel / 2.4) / a.V);
      f.input.y = Math.max(-1, Math.min(1, (gCmd - a.gamma) * 6 - a.q * 0.5));
    } else {
      f.input.x = Math.max(-1, Math.min(1, (g.phiCmd - a.phi) * 2.5 - a.p * 0.6));
      let gCmd = g.gammaCmd; if (a.hWheel < 6) gCmd = Math.asin(-(0.25 + a.hWheel / 2.4) / a.V);
      const thCmd = a.theta + (gCmd - a.gamma) * 1.5;
      f.input.y = Math.max(-1, Math.min(1, (thCmd - a.theta) * 3 - a.q * 1.2));
      f.input.rud = Math.max(-1, Math.min(1, a.beta * 2.0));
      const err = (a.hWheel > 15 ? 95 : 88) - a.ias / KT; f.input.thr = Math.max(0.05, Math.min(1, 0.25 + err * 0.04));
      if (a.hWheel < 5) f.input.thr = 0.05;
      if (a.onGround) { f.input.brake = 0.4; f.input.y = 0; }
    }
    f.tick(f.dt);
    maxPhi = Math.max(maxPhi, Math.abs(f.ac.air.phi));
  }
  const td = f.ev.td, s2 = f.ev.score();
  console.log(`${key} assist=${assist} crashed=${f.crashed} t=${f.ac.t.toFixed(0)} maxPhi=${(maxPhi*RAD).toFixed(1)} TD s=${td?.s.toFixed(0)} tl=${td?.tl.toFixed(1)} vs=${td?.vsFpm.toFixed(0)} ias=${td?.ias.toFixed(1)} pitch=${td?.pitch.toFixed(1)} crab=${td?.crab.toFixed(1)} score=${s2?.total} stop=${f.ev.stopS?.toFixed(0)} events=${JSON.stringify(f.ev.events.map(e=>e.k))}`);
}
// pitch attitude at touchdown for the autopilot after the speed schedule change
for (const key of ['calm', 'xr']) {
  const f = new Flight({ wind: SCENARIOS[key], pilot: 'ap', seed: 5 });
  while (f.ac.t < 260 && !f.ev.done && !f.crashed) f.tick(f.dt);
  const td = f.ev.td; console.log(`AP ${key}: TD s=${td.s.toFixed(0)} vs=${td.vsFpm.toFixed(0)} ias=${td.ias.toFixed(1)} pitch=${td.pitch.toFixed(1)} score=${f.ev.score().total} stop=${f.ev.stopS.toFixed(0)}`);
}
