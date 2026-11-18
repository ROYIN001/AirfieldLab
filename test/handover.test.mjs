// Hand-over between the autopilot and the pilot, and how the result is scored: the autopilot re-arms a fresh
// approach when given control in the air, takes the pilot's trims (and gives back its own) without a jump, configures
// gear and flaps only as the speed allows, never flies with a brake held, and a crash scores nothing.
import { M } from './harness.mjs';
import { check, within, f1, done } from './lib/check.mjs';
const { Flight, SCENARIOS, AC, KT, DEG, RAD, FIELD, wrapPi, clamp } = M;
const DT = 1 / 240;
const tick = (f, secs, ctl) => { for (let i = 0; i < Math.round(secs / DT) && !f.crashed; i++) { if (ctl) ctl(f, f.ac.air); f.tick(DT); } };
const crs = () => FIELD.rwyHdg * DEG;
// a simple DIRECT pilot for a touch-and-go or go-around: full power, TO flaps, wings level, climb at about 10° nose up
const goAround = (f, a) => {
  f.input.thr = 1; f.input.flaps = 1; f.input.brake = 0; f.input.brakeL = f.input.brakeR = 0;
  f.input.x = clamp(-2 * a.phi - 0.5 * a.p + 0.5 * wrapPi(crs() - a.psi), -1, 1);
  f.input.y = clamp((10 * DEG - a.theta) * 3 - a.q * 0.8, -1, 1);
  f.input.rud = clamp(3 * a.beta, -1, 1);   // ball centred: sideslip from the right (β > 0) takes right pedal
};

// 1) touch-and-go after an autoland, hand back at 150 m: a new approach, no crash
{
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'ap', seed: 5 });
  while (!f.ev.td && f.ac.t < 200) f.tick(DT);
  tick(f, 3);
  f.setPilot('man'); f.opts.assist = false; f.opts.autoTrim = true;
  while (f.ac.air.h < 150 && f.ac.t < 400 && !f.crashed) tick(f, 0.1, goAround);
  f.setPilot('ap');
  const mode = f.ap.mode; let minTh = 99, minH = 1e9;
  tick(f, 60, (ff, a) => { minTh = Math.min(minTh, a.theta); minH = Math.min(minH, a.h); });
  const a = f.ac.air;
  const evs = f.ev.events.map((e) => e.k);
  check('touch-and-go, hand back at 150 m over the runway: the autopilot goes around and levels at 1,000 ft', mode === 'GA' && f.phase() === 'GA' && !f.crashed && minTh > -5 * DEG && minH > 120 && Math.abs(a.h - 300) < 25 && f.ac.gearPos < 0.02 && !evs.includes('flapOver') && !evs.includes('gearOver'), `mode ${mode}, shown as ${f.phase()}, min pitch ${f1(minTh * RAD)}°, min height ${f1(minH, 0)} m, now ${f1(a.h, 0)} m at ${f1(a.ias / KT, 0)} kt, gear ${f1(f.ac.gearPos, 2)}, flaps ${f1(f.ac.flaps, 2)}, events [${evs}]`);
}
// 2) go-around from the autopilot's flare, hand back at 150 m
{
  const f = new Flight({ wind: SCENARIOS.xr, pilot: 'ap', seed: 5 });
  while (f.ap.mode !== 'FLARE' && f.ac.t < 200) f.tick(DT);
  f.setPilot('man'); f.opts.assist = false;
  while (f.ac.air.h < 150 && f.ac.t < 400 && !f.crashed) tick(f, 0.1, goAround);
  f.setPilot('ap');
  const mode = f.ap.mode; let minVs = 0;
  tick(f, 20, (ff, a) => { minVs = Math.min(minVs, a.vs); });
  check('go-around from the flare, hand back: the autopilot keeps climbing', mode === 'GA' && !f.crashed && minVs > -2, `mode ${mode}, max sink ${f1(-minVs * 196.85, 0)} fpm`);
}
// 2b) hand back while still well before the threshold: a new approach that lands normally
{
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'ap', seed: 5, dist: 9000 });
  tick(f, 10); f.setPilot('man'); f.opts.assist = true; tick(f, 15); f.setPilot('ap');
  const mode = f.ap.mode; while (!f.ev.done && f.ac.t < 400 && !f.crashed) f.tick(DT);
  const sc = f.ev.score();
  check('hand back before the threshold: a new approach and a normal landing', mode === 'APP' && !f.crashed && sc && sc.total >= 85, `mode ${mode}, score ${sc && sc.total}`);
}
// 3) taking over in DIRECT (auto-trim off) mid-approach in gusty crosswind: the aileron trim is the autopilot's
//    steady part, so hands off the aircraft does not roll away
for (const seed of [5, 9]) {
  const f = new Flight({ wind: SCENARIOS.xl, pilot: 'ap', seed, dist: 9000 });
  tick(f, 25);
  f.setPilot('man'); f.opts.assist = false; f.opts.autoTrim = false;
  let maxPhi = 0; tick(f, 10, (ff, a) => { maxPhi = Math.max(maxPhi, Math.abs(a.phi)); });
  check(`DIRECT take-over in gusty crosswind (seed ${seed}): hands off for 10 s stays below 35° of bank`, maxPhi < 35 * DEG, `aileron trim ${f1(f.laws.ailTrim * RAD, 2)}°, max bank ${f1(maxPhi * RAD)}°`);
}
// 4) handing a fast clean aircraft to the autopilot: it slows before lowering gear and flaps (no limit-speed events)
for (const kt of [145, 158]) {
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'man', assist: false, dist: 12000 });
  f.ac.flaps = f.ac.cmd.flaps = 0; f.ac.gearPos = 0; f.ac.cmd.gear = 0; f.input.flaps = 0; f.input.gear = 0;
  const tr = f.ac.trimFlight({ tas: kt * KT * Math.sqrt(1.225 / f.ac.air.rho), gamma: 0, h: 600, psiAir: crs(), n: f.ac.x[0], e: f.ac.x[1] });
  f.laws.trimDe = tr.de; f.input.thr = tr.thr; tick(f, 1);
  f.setPilot('ap'); tick(f, 40);
  check(`hand to the autopilot clean at ${kt} kt: no flap or gear overspeed`, !f.ev.has('flapOver') && !f.ev.has('gearOver') && f.ac.gearPos > 0.98 && f.ac.flaps > 0.99, `events [${f.ev.events.map((e) => e.k)}], gear ${f1(f.ac.gearPos, 2)}, flaps ${f1(f.ac.flaps, 2)}, ${f1(f.ac.air.ias / KT)} kt`);
}
// 5) a brake held at the moment of hand-back is released for the approach
{
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'man', surface: 'wet', dist: 7000 });
  f.input.brake = 1; tick(f, 0.5); f.input.brake = 0;
  f.setPilot('ap');
  tick(f, 1);
  const b1 = f.ac.brake;
  while (!f.ev.done && f.ac.t < 300 && !f.crashed) f.tick(DT);
  check('brake held at hand-back: released in the air, no skid on the wet runway', b1 < 0.01 && !f.ev.has('skid'), `brake ${f1(b1, 2)} after 1 s, events [${f.ev.events.map((e) => e.k)}]`);
}
// 6) a crash scores nothing, even after a soft first touchdown
{
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'ap', seed: 5 });
  while (!f.ev.td && f.ac.t < 200) f.tick(DT);
  f.setPilot('man'); f.opts.assist = false;
  tick(f, 0.3, (ff) => { ff.input.thr = 1; ff.input.y = 1; });            // balloon
  tick(f, 8, (ff) => { ff.input.thr = 0; ff.input.y = -1; });             // shove it back onto the runway
  const sc = f.ev.score();
  check('a crash after a soft first touchdown scores 0', f.crashed && sc && sc.total === 0, `crashed ${f.crashed}, score ${sc && sc.total}`);
}
done();
