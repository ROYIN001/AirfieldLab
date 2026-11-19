// Section 11: default 'standard' gamepad profile applied to a mock Gamepad snapshot (expected values for T-I-12)
import * as I from './i11_input.mjs';
const r4 = (v) => Math.round(v * 1e4) / 1e4;
export function readStandard(gp, st, dt, P = { dz: 0.08, expo: 0.5, rudDz: 0.05, rudExpo: 0.3, thrDz: 0.15, thrRate: 0.5 }) {
  const [sx, sy] = I.dzRadial(gp.axes[0], gp.axes[1], P.dz);       // left stick, scaled radial
  const roll = I.expo(sx, P.expo), pitch = I.expo(sy, P.expo);      // axes[1] +down = pull = +y (no inversion)
  const rud = I.expo(I.dzAxial(gp.buttons[7].value - gp.buttons[6].value, P.rudDz), P.rudExpo);
  const thrRate = -I.dzAxial(gp.axes[3], P.thrDz) * P.thrRate;      // right stick forward (-1) = more power
  return { x: roll, y: pitch, rud, thr: I.clamp(st.thr + thrRate * dt, 0, 1) };
}
const btn = (v) => ({ pressed: v > 0.5, touched: v > 0, value: v });
const gp = { mapping: 'standard', axes: [0.5, 0.6, 0, -0.4], buttons: Array.from({ length: 17 }, (_, i) => btn(i === 6 ? 0.2 : i === 7 ? 0.7 : 0)) };
const o = readStandard(gp, { thr: 0.3 }, 1);
console.log(JSON.stringify(Object.fromEntries(Object.entries(o).map(([k, v]) => [k, r4(v)]))));
const rest = readStandard({ axes: [0.05, -0.04, 0, 0.1], buttons: gp.buttons.map(() => btn(0)) }, { thr: 0.3 }, 1);
console.log('rest', JSON.stringify(rest));
// arbitration: most-recently-active source wins
export function arbitrate(sources, now, hold = 0.5) {
  let best = null;
  for (const s of sources) if (Math.abs(s.v) > 0 && (!best || s.tActive > best.tActive)) best = s;
  if (!best) { for (const s of sources) if (now - s.tActive < hold && (!best || s.tActive > best.tActive)) best = s; }
  return best ? best.v : 0;
}
console.log('arb', arbitrate([{ v: 0, tActive: 10 }, { v: 0.4, tActive: 12 }], 12.1), arbitrate([{ v: 0.2, tActive: 12 }, { v: 0.4, tActive: 11 }], 12.1), arbitrate([{ v: 0, tActive: 1 }, { v: 0, tActive: 2 }], 12));
