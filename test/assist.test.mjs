// Robot pilot that follows the flight director through the pilot laws (like a player on a phone or keyboard):
// ASSIST (attitude command, auto-rudder, auto-throttle) and DIRECT (reversible controls with auto-trim).
import { M } from './harness.mjs';
import { check, done } from './lib/check.mjs';
const { Flight, SCENARIOS, KT, FT, DEG, RAD, FIELD, wrapPi } = M;
const clamp1 = (v) => Math.max(-1, Math.min(1, v));
for (const [key, sc] of Object.entries({ calm: SCENARIOS.calm, xl: SCENARIOS.xl })) for (const assist of [true, false]) {
  const f = new Flight({ wind: sc, pilot: 'man', assist, autoThr: assist, seed: 3, dh: 25, dtl: 60 });
  let maxPhi = 0;
  const crs = FIELD.rwyHdg * DEG;
  while (f.ac.t < 260 && !f.ev.done && !f.crashed) {
    const a = f.ac.air, g = f.ap.guidance();
    if (assist) {
      f.input.x = clamp1(g.phiCmd / (33 * DEG));
      // pitch: steer flight path toward the FD (proportional), flare by hand below 6 m
      let gCmd = g.gammaCmd; if (a.hWheel < 6) gCmd = Math.asin(-(0.25 + a.hWheel / 2.4) / a.V);
      f.input.y = clamp1((gCmd - a.gamma) * 6 - a.q * 0.5);
    } else {
      f.input.x = clamp1((g.phiCmd - a.phi) * 2.5 - a.p * 0.6);
      let gCmd = g.gammaCmd; if (a.hWheel < 6) gCmd = Math.asin(-(0.25 + a.hWheel / 2.4) / a.V);
      const thCmd = a.theta + (gCmd - a.gamma) * 1.5;
      f.input.y = clamp1((thCmd - a.theta) * 3 - a.q * 1.2);
      f.input.rud = clamp1(a.beta * 2.0);
      const err = (a.hWheel > 15 ? 95 : 88) - a.ias / KT; f.input.thr = Math.max(0, Math.min(1, 0.15 + err * 0.04));
      if (a.hWheel < 5) f.input.thr = 0;
      if (a.onGround) {
        // rollout: pedals keep the nose on the runway heading; brake gently once the nose wheel is down
        f.input.y = 0; f.input.x = clamp1(-a.phi * 2);
        f.input.rud = clamp1(-3 * wrapPi(a.psi - crs) - 1.0 * a.r);
        f.input.brake = a.wow[0] && a.gs < 35 ? 0.3 : 0;
      }
    }
    f.tick(f.dt);
    maxPhi = Math.max(maxPhi, Math.abs(f.ac.air.phi));
  }
  const td = f.ev.td, s2 = f.ev.score();
  console.log(`${key} assist=${assist} crashed=${f.crashed} t=${f.ac.t.toFixed(0)} maxPhi=${(maxPhi*RAD).toFixed(1)} TD s=${td?.s.toFixed(0)} tl=${td?.tl.toFixed(1)} vs=${td?.vsFpm.toFixed(0)} ias=${td?.ias.toFixed(1)} pitch=${td?.pitch.toFixed(1)} crab=${td?.crab.toFixed(1)} score=${s2?.total} stop=${f.ev.stopS?.toFixed(0)} events=${JSON.stringify(f.ev.events.map(e=>e.k))}`);
  const stopped = f.ev.done && f.ev.stopS != null && f.ev.stopS <= FIELD.rwyLen;   // the excursion event is lateral only
  check(`${key} ${assist ? 'ASSIST' : 'DIRECT'}: robot lands on the runway and stops on it`, !f.crashed && td && td.onRunway && stopped && !f.ev.has('excursion') && !f.ev.has('skid'), `stopped ${stopped ? Math.round(f.ev.stopS) + ' m from the threshold' : 'no'} of ${Math.round(FIELD.rwyLen)} m`);
}
// pitch attitude at touchdown for the autopilot
for (const key of ['calm', 'xr']) {
  const f = new Flight({ wind: SCENARIOS[key], pilot: 'ap', seed: 5 });
  while (f.ac.t < 260 && !f.ev.done && !f.crashed) f.tick(f.dt);
  const td = f.ev.td; console.log(`AP ${key}: TD s=${td.s.toFixed(0)} vs=${td.vsFpm.toFixed(0)} ias=${td.ias.toFixed(1)} pitch=${td.pitch.toFixed(1)} score=${f.ev.score().total} stop=${f.ev.stopS.toFixed(0)}`);
  check(`AP ${key}: nose-high touchdown (no nose-first)`, td.pitch > 2 && !td.noseFirst && f.ev.done, `pitch ${td.pitch.toFixed(1)}°`);
}
done();
