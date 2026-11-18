// Section 11: checks for key latch (T-I-09) and rumble scheduler (T-I-14)
import * as I from './i11_input.mjs';
const ks = I.keyLatch(); I.onKeyDown(ks, 'KeyS'); I.onKeyUp(ks, 'KeyS');
const keys = I.frameKeys(ks); const dir = I.keyDir(keys, ['KeyW'], ['KeyS']);
const v = I.keyRamp(0, dir, 1 / 60, { up: 0.5, back: 2.5, cap: 1 });
const next = I.frameKeys(ks);
console.log('tap', dir, +v.toFixed(5), 'next frame keys', next.size);
const rs = new I.RumbleScheduler(); let calls = 0;
for (let i = 0; i < 600; i++) { const t = i / 240; const e = rs.next(t, I.hapticMix({ buffet: 0.5 + 0.3 * Math.sin(t * 20) })); if (e) calls++; }
console.log('calls in 2.5 s', calls, 'per s', calls / 2.5);
let quiet = 0; const rs2 = new I.RumbleScheduler(); for (let i = 0; i < 240; i++) if (rs2.next(i / 240, I.hapticMix({}))) quiet++;
console.log('quiet calls', quiet);
