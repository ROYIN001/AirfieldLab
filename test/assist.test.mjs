// A robot pilot that follows the flight director through the pilot laws, like a player on a phone or keyboard:
// ASSIST (attitude command, auto-rudder, auto-throttle) and DIRECT (raw controls), calm and 15 kt gusty crosswind.
// On the runway the DIRECT robot steers with the pedals (before this it held the sideslip rudder law on the ground
// and ran off the side in the crosswind). Then the autopilot's touchdown attitude.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { M } from './harness.mjs';
const { Flight, SCENARIOS, KT, DEG, RAD, FIELD, wrapPi } = M;
const cl = (v) => Math.max(-1, Math.min(1, v));

function robot(sc, assist) {
  const f = new Flight({ wind: sc, pilot: 'man', assist, autoThr: assist, seed: 3, dh: 25, dtl: 60 });
  const crs = FIELD.rwyHdg * DEG;
  let maxPhi = 0;
  while (f.ac.t < 260 && !f.ev.done && !f.crashed) {
    const a = f.ac.air, g = f.ap.guidance();
    if (assist) {
      f.input.x = cl(g.phiCmd / (33 * DEG));
      // pitch: steer flight path toward the FD (proportional), flare by hand below 6 m
      let gCmd = g.gammaCmd; if (a.hWheel < 6) gCmd = Math.asin(-(0.25 + a.hWheel / 2.4) / a.V);
      f.input.y = cl((gCmd - a.gamma) * 6 - a.q * 0.5);
    } else {
      f.input.x = cl((g.phiCmd - a.phi) * 2.5 - a.p * 0.6);
      let gCmd = g.gammaCmd; if (a.hWheel < 6) gCmd = Math.asin(-(0.25 + a.hWheel / 2.4) / a.V);
      const thCmd = a.theta + (gCmd - a.gamma) * 1.5;
      f.input.y = cl((thCmd - a.theta) * 3 - a.q * 1.2);
      f.input.rud = cl(a.beta * 2.0);
      const err = (a.hWheel > 15 ? 95 : 88) - a.ias / KT; f.input.thr = Math.max(0.05, Math.min(1, 0.25 + err * 0.04));
      if (a.hWheel < 5) f.input.thr = 0.05;
      if (a.onGround) {   // rollout: wings level, pedals keep the nose on the runway heading, steady braking
        f.input.brake = 0.4; f.input.y = 0; f.input.x = cl(-a.phi * 2);
        f.input.rud = cl(-3 * wrapPi(a.psi - crs) - 1.0 * a.r);
      }
    }
    f.tick(f.dt);
    maxPhi = Math.max(maxPhi, Math.abs(f.ac.air.phi));
  }
  return { f, maxPhi };
}

for (const [key, sc] of Object.entries({ calm: SCENARIOS.calm, xl: SCENARIOS.xl })) for (const assist of [true, false]) {
  test(`${key} ${assist ? 'ASSIST' : 'DIRECT'}: the robot lands on the runway and stops on it`, () => {
    const { f, maxPhi } = robot(sc, assist), td = f.ev.td, s = f.ev.score();
    const info = `touchdown ${td ? td.s.toFixed(0) + ' m, ' + td.tl.toFixed(1) + ' m off the centre line, ' + td.vsFpm.toFixed(0) + ' fpm' : 'none'}, stop ${f.ev.stopS != null ? f.ev.stopS.toFixed(0) + ' m' : 'none'}, score ${s && s.total}, max bank ${(maxPhi * RAD).toFixed(1)}°, events ${JSON.stringify(f.ev.events.map((e) => e.k))}`;
    assert.ok(!f.crashed && td && td.onRunway, info);
    assert.ok(f.ev.done && f.ev.stopS <= FIELD.rwyLen, info);   // the excursion event is lateral only
    assert.ok(!f.ev.events.some((e) => e.k === 'excursion' || e.k === 'skid'), info);
    assert.ok(maxPhi < 25 * DEG && s.total >= 50, info);
  });
}

// the autopilot touches down nose high (no nose-first landing)
for (const key of ['calm', 'xr']) {
  test(`AP ${key}: nose-high touchdown, score ≥ 95`, () => {
    const f = new Flight({ wind: SCENARIOS[key], pilot: 'ap', seed: 5 });
    while (f.ac.t < 260 && !f.ev.done && !f.crashed) f.tick(f.dt);
    const td = f.ev.td, s = f.ev.score();
    assert.ok(td && td.pitch > 2 && !td.noseFirst && s.total >= 95, `pitch ${td && td.pitch.toFixed(1)}°, nose first ${td && td.noseFirst}, score ${s && s.total}`);
  });
}
