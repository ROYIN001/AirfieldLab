// Section 5 review: model rise-time ratio at 3,000 ft M 0.2 vs a linear interpolation of NASA's SL->10,000 ft ratio (check of the "<5%" claim)
process.env.QUIET = '1';
const { CORE, stepResp } = await import('./f5_spool.mjs');
const p = CORE.CFM56_7B; const sl = stepResp(p, 0.40, 1, { hft: 0, Mach: 0 }), h3 = stepResp(p, 0.40, 1, { hft: 3000, Mach: 0.2 });
const model = (h3.t90 - h3.t10) / (sl.t90 - sl.t10), nasa = 1 + (1.25 / 1.13 - 1) * 0.3;
console.log(JSON.stringify({ model: +model.toFixed(3), nasaInterp: +nasa.toFixed(3), diffPct: +(100 * (model / nasa - 1)).toFixed(1) }));
