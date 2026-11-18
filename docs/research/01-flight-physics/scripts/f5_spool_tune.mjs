// grid-tune the proposed spool parameters to the target set (all targets are ค่าประมาณ except 33.73(b) ceiling)
process.env.QUIET = '1';
const { stepResp, CORE } = await import('./f5_spool.mjs');
const SLS = { hft: 0, Mach: 0 };
function score(p) {
  const gi = stepResp(p, 0, 1, SLS)['tAbs0.95'];
  const fi = stepResp(p, 0, 1, { ...SLS, floorN2: p.N2fi })['tAbs0.95'];
  const ai = stepResp(p, 0, 1, { hft: 1000, Mach: 0.2, floorN2: p.N2ai })['tAbs0.95'];
  const m = stepResp(p, 0.4, 1, SLS); const rise = m.t90 - m.t10;
  const r42 = stepResp(p, 0.4, 1, { hft: 42000, Mach: 0.84 }); const r25 = stepResp(p, 0.4, 1, { hft: 25000, Mach: 0.62 }); const r10 = stepResp(p, 0.4, 1, { hft: 10000, Mach: 0.25 });
  const q42 = (r42.t90 - r42.t10) / rise, q25 = (r25.t90 - r25.t10) / rise, q10 = (r10.t90 - r10.t10) / rise;
  const J = ((gi - 5.5) / 0.5) ** 2 + ((fi - 4.5) / 0.25) ** 2 + ((ai - 3.5) / 0.4) ** 2 + ((m.t50 - 0.72) / 0.3) ** 2 + ((rise - 1.13) / 0.3) ** 2 + ((m.t98 - 2.02) / 0.5) ** 2 + ((q42 - 3.24) / 0.6) ** 2 + ((q25 - 1.73) / 0.3) ** 2 + ((q10 - 1.11) / 0.2) ** 2 + (fi > 5 ? 1e3 : 0);
  return { J, gi, fi, ai, t50: m.t50, rise, t98: m.t98, q10, q25, q42 };
}
let best = null;
for (const base of ['CFM56_7B', 'LEAP_1A']) { best = null;
  for (const Racc0 of [16, 18, 20, 22, 24]) for (const a of [6, 8, 10, 12]) for (const tau of [0.3, 0.35, 0.45]) for (const altExp of [0.8, 1.0, 1.1]) {
    const p = { ...CORE[base], Racc0, a, tau, altExp }; const s = score(p);
    if (!best || s.J < best.s.J) best = { p: { Racc0, a, tau, altExp }, s };
  }
  for (const k in best.s) best.s[k] = +best.s[k].toFixed(2);
  console.log(base, JSON.stringify(best));
}
