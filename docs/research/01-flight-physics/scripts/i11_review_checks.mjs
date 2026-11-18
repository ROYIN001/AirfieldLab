// Section 11 review: recompute T-I-02 variants, roll-rate estimate, trim-speed, g/s rates, e=0.7 warning point
import * as I from './i11_input.mjs';
const r4 = (v) => Math.round(v * 1e4) / 1e4;
const out = {};
out.T02_outer0 = { radial11: I.dzRadial(0.1, 0.1, 0.08).map(r4), axial01: r4(I.dzAxial(0.1, 0.08)), radial3: I.dzRadial(0.3, 0.05, 0.08).map(r4) };
out.T02_outer002 = { radial11: I.dzRadial(0.1, 0.1, 0.08, 0.02).map(r4), axial01: r4(I.dzAxial(0.1, 0.08, 0.02)), radial3: I.dzRadial(0.3, 0.05, 0.08, 0.02).map(r4), a097: r4(I.dzAxial(0.97, 0.08, 0.02)), a098: r4(I.dzAxial(0.98, 0.08, 0.02)) };
const V = 95 * 0.514444, b = 10.2, Clda = 0.16, Clp = -0.47, daMax = 20 * Math.PI / 180;
out.roll_rate_full_dps = r4((-(Clda / Clp) * (2 * V / b) * daMax) * 180 / Math.PI);
out.g_per_s = { prop: r4(0.5 / 0.431), cur: r4(2.0 / 0.431) };
out.trim_kt_per_s = r4(0.5 / ((5.04 - 3.84) / 7));
out.stall_margin_g = r4((95 / 71) ** 2 - 1);
// stick deflection where shaped command reaches the warning onset (command 0.267..0.276) for e = 0.7
const inv = (cmd, e, d) => { let lo = 0, hi = 1; for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; (I.shapeAxis(m, { dz: d, expo: e }) < cmd ? (lo = m) : (hi = m)); } return r4(lo); };
out.e07_x_at_cmd = { c0267: inv(0.2671, 0.7, 0.08), c0276: inv(0.276, 0.7, 0.08), c028: inv(0.28, 0.7, 0.08) };
out.e05_x_at_cmd = { c0267: inv(0.2671, 0.5, 0.08), c028: inv(0.28, 0.5, 0.08) };
out.hap_G07 = I.hapticMix({ buffet: 0.6 }, { gain: 0.7, buffet: 1, runway: 1, touchdown: 1 });
console.log(JSON.stringify(out));
