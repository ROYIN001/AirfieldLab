// Step 1 — pilot input: proportional key ramps with self-centring, axis dead zone / expo / sensitivity,
// gamepad mapping (standard and generic devices), and how the pilot laws use trim, flaps, gear and toe brakes.
import { M } from './harness.mjs';
import { check, within, f1, done } from './lib/check.mjs';
const { KeyAxis, shapeAxis, readPad, pickInput, INPUT_DEFAULTS, Flight, SCENARIOS, AC, DEG, RAD } = M;
const DT = 1 / 60;
const hold = (ax, secs, dir, gain = 1) => { for (let t = 0; t < secs - 1e-9; t += DT) ax.update(DT, dir, gain); return ax.v; };

// keyboard ramps
{
  const tap = hold(new KeyAxis(1.2), 0.1, 1);
  check('a key tap gives a small input', within(tap, 0.02, 0.15), f1(tap, 3));
  const k = new KeyAxis(1.2), h05 = hold(k, 0.5, 1), h1 = hold(k, 0.5, 1);
  check('holding the key builds the input proportionally', h05 > 0.3 && h1 > h05 && within(h1, 0.85, 1), `${f1(h05, 2)} after 0.5 s, ${f1(h1, 2)} after 1 s`);
  const back = hold(k, 0.35, 0);
  check('released: the input re-centres within 0.35 s', Math.abs(back) < 0.06, f1(back, 3));
  hold(k, 1, 1); const rev = hold(k, 0.15, -1);
  check('the opposite key cancels the old input first', rev <= 0.05, f1(rev, 3));
  const lo = hold(new KeyAxis(1.2), 0.5, 1, 0.5), hi = hold(new KeyAxis(1.2), 0.5, 1, 1.5);
  check('sensitivity scales the ramp', hi > lo * 2, `${f1(lo, 2)} vs ${f1(hi, 2)}`);
}
// analog shaping
{
  const c = { dead: 0.1, expo: 0.4, sens: 1 };
  check('dead zone', shapeAxis(0.09, c) === 0 && shapeAxis(-0.1, c) === 0);
  check('full deflection stays full', Math.abs(shapeAxis(1, c) - 1) < 1e-12 && Math.abs(shapeAxis(-1, c) + 1) < 1e-12);
  check('expo softens the centre', shapeAxis(0.5, c) < shapeAxis(0.5, { ...c, expo: 0 }), `${f1(shapeAxis(0.5, c), 3)} vs ${f1(shapeAxis(0.5, { ...c, expo: 0 }), 3)}`);
  check('symmetric', Math.abs(shapeAxis(0.6, c) + shapeAxis(-0.6, c)) < 1e-12);
  check('sensitivity scales and saturates', shapeAxis(0.5, { ...c, sens: 1.5 }) > shapeAxis(0.5, c) && shapeAxis(0.95, { ...c, sens: 1.5 }) === 1);
  let mono = true, prev = -1; for (let v = -1; v <= 1.0001; v += 0.01) { const y = shapeAxis(v, c); if (y < prev - 1e-12) mono = false; prev = y; }
  check('shaping is monotonic', mono);
}
// gamepads
{
  const btn = (n, on = []) => Array.from({ length: n }, (_, i) => ({ pressed: on.includes(i), value: on.includes(i) ? 1 : 0 }));
  const pad = (axes, on = [], extra = {}) => ({ id: 'Test pad', mapping: 'standard', axes, buttons: btn(17, on), ...extra });
  const cfg = { ...INPUT_DEFAULTS, expo: 0 };
  const r = readPad(pad([0.5, -1, 0.8, -1]), cfg);
  check('standard pad: left stick roll right / pushed forward = nose down', r.x > 0.4 && r.y === -1);
  check('standard pad: right stick X = rudder, up = more power', r.rud > 0.7 && r.thrRate > 0.9);
  const t = readPad({ ...pad([0, 0, 0, 0]), buttons: btn(17, [13]).map((b, i) => (i === 6 ? { pressed: true, value: 0.4 } : b)) }, cfg);
  check('standard pad: analog left trigger = left toe brake, D-pad down = trim nose up', within(t.brakeL, 0.39, 0.41) && t.brakeR === 0 && t.trim === 1);
  const first = readPad(pad([0, 0, 0, 0], [3]), cfg);
  check('no button events on the first poll (a held button does not fire)', first.events.length === 0);
  const e1 = readPad(pad([0, 0, 0, 0], [3, 5]), cfg, first.pressed), e2 = readPad(pad([0, 0, 0, 0], [3, 5]), cfg, e1.pressed);
  check('rising edge fires once: RB flaps down', e1.events.join() === 'flapDn' && e2.events.length === 0, e1.events.join());
  const gen = { id: 'Stick', mapping: '', axes: [0, 0, -1, 0.5, 0, 0.9], buttons: btn(8, [0]) };
  const g = readPad(gen, { ...cfg, thrAxis: 2, rudAxis: 5 });
  check('joystick: chosen throttle axis forward = full power, chosen rudder axis', g.thrAbs === 1 && g.rud > 0.8 && g.brakeL === 1 && g.brakeR === 1);
  const gi = readPad(gen, { ...cfg, thrAxis: 2, thrInv: true });
  check('joystick: throttle axis can be inverted', gi.thrAbs === 0);
  check('larger input wins when sources are mixed', pickInput(0.2, -0.6, 0.1) === -0.6 && pickInput(0, 0) === 0);
}
// pilot laws: selectors, trim and toe brakes reach the aircraft
{
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'man', assist: false, autoTrim: false, dist: 9000 });
  const trim0 = f.laws.trimDe;
  f.input.trim = 1; for (let i = 0; i < 240; i++) f.tick(1 / 240); f.input.trim = 0;
  check('trim key: nose-up trim at the published rate', Math.abs((trim0 - f.laws.trimDe) - AC.trimRate * 1) < 0.02 * DEG, `${f1((trim0 - f.laws.trimDe) * RAD, 2)}° in 1 s`);
  f.input.flaps = 1; f.input.gear = 0; f.tick(1 / 240);
  check('flap selector and gear lever reach the aircraft', f.ac.cmd.flaps === AC.flapNotch[1] && f.ac.cmd.gear === 0);
  f.input.brakeL = 1; f.input.brakeR = 0; f.tick(1 / 240);
  check('toe brakes are independent', f.ac.cmd.brakeL === 1 && f.ac.cmd.brakeR === 0);
  f.setPilot('ap'); f.tick(1 / 240);
  check('the autopilot configures for landing (gear down, landing flaps)', f.ac.cmd.gear === 1 && f.ac.cmd.flaps === 1);
  f.setPilot('man');
  check('taking over keeps the selectors where the aircraft is', f.input.gear === 1 && f.input.flaps === 2);
}
done();
