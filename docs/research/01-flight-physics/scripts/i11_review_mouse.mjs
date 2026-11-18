// Section 11 review: T-I-16 expected values for the mouse-yoke formula (11.6.4)
import * as I from './i11_input.mjs';
let y = 0; const W = 1200, seq = [];
y = I.mouseYoke(y, 150, W); seq.push(y);   // +150 px -> 0.5
y = I.mouseYoke(y, 200, W); seq.push(y);   // +200 px -> 1.1667 clamped to 1
y = I.mouseYoke(y, -2400, W); seq.push(y); // -2400 px -> -1
y = I.mouseYoke(y, 0, W); seq.push(y);     // no movement -> stays (no self-centring)
console.log(JSON.stringify(seq.map((v) => Math.round(v * 1e4) / 1e4)));
