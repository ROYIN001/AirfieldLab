// Review checks for section 9: RK4 per-step error, |R|, eps, camera px, Dryden corner, cost numbers
const R4 = z => 1 + z + z*z/2 + z**3/6 + z**4/24;
for (const z of [-0.019, -0.04, -0.1, -0.25, -0.5, -0.54, -0.74, -0.739, -1]) console.log('z', z, '|R|', Math.abs(R4(z)).toFixed(4), 'relerr', (Math.abs(R4(z) - Math.exp(z)) / Math.exp(z)).toExponential(2));
console.log('|R| at -0.25 (table 0.779)', R4(-0.25), 'at -0.256', R4(-0.256), 'at -0.54', R4(-0.54));
// stability limits from text
console.log('2.785/60.07 s =', 2.7853/60.07, '1/', 60.07/2.7853, ' 2.785/177.3 =', 2.7853/177.3);
console.log('margin 2.785/0.739 =', 2.7853/0.739);
// cost: 5.1 us *240
console.log('ms per s at 240:', 5.11*240/1000, ' at 480 (2x tick):', 5.11*480/1000, ' 9us*240', 9*240/1000);
console.log('ticks per 2 ms', 2000/5.11, ' 2 ms/0.02 ms per frame', 2/(5.11*4/1000));
// camera: 24 m, 1080 px, vfov 50 deg: px per mm
const pxPerM = 1080 / (2 * 24 * Math.tan(25 * Math.PI / 180)); console.log('px per mm', pxPerM / 1000, ' 96 mm ->', 96 * pxPerM / 1000, 'px; 124 mm->', 124*pxPerM/1000);
// Dryden corner at 95 kt, 10 ft
const V = 95 * 0.514444, Lw = 10 * 0.3048; console.log('V', V, 'V/Lw', V / Lw, 'Hz', V / Lw / 2 / Math.PI, '120/f', 120 / (V / Lw / 2 / Math.PI));
// tanh scaling lambda ~ 1/v0
console.log('lambda at v0=0.025:', 60.1 * 10, ' *dt', 601 / 240);
// bristle tau: mu N tau / z0 = 4 mu N? slope of tanh(v/0.25)*muN = muN/0.25 = 4 muN ; bristle damping slope muN*tau/z0
console.log('tau/z0 =', 0.02/0.005, ' vs 1/0.25 =', 1/0.25, ' lateral tanh slope 1/0.35 =', 1/0.35);
// bristle explicit limit
console.log('|v| limit 2.785*z0/dt =', 2.7853*0.005*240, '  lambda at 15 m/s', -15/0.005, '*dt', 15/0.005/240);
// heave from eigen: -6.69 +- 9.48i
const re=-6.69, im=9.48, w=Math.hypot(re,im); console.log('heave w', w, 'zeta', -re/w, 'f', im/2/Math.PI, 'fn', w/2/Math.PI);
// creep
console.log('vc', 0.25*Math.atanh(517.5/10866), ' drift 60s', 0.25*Math.atanh(517.5/10866)*60);
// rolling resistance 0.022 * total load
console.log('rolling 0.022*W', 0.022*2250*9.80665, ' idle 517.5');
// eps snap vs ulp
console.log('ulp of 1/240', Number.EPSILON/240, ' ratio h/eps', (1/240)/1e-9);
// added in review: per-step error at the JSON thresholds, |λ|dt=1.48 error, pinhole px/mm, budget headroom
for (const z of [-0.75, -1.25, -1.48, -2.0]) console.log('z', z, 'relerr', (Math.abs(R4(z) - Math.exp(z)) / Math.exp(z)).toExponential(2), '|R|', Math.abs(R4(z)).toFixed(3));
const pxmm = 540 / Math.tan(25 * Math.PI / 180) / 24 / 1000; console.log('pinhole px/mm at screen centre', pxmm.toFixed(4), '96mm', (96 * pxmm).toFixed(1), '124mm', (124 * pxmm).toFixed(1), '145mm', (145*pxmm).toFixed(1), '20mm', (20*pxmm).toFixed(1));
const perFrame = 4 * 9.3e-3; console.log('future 9.3us x4 per 60Hz frame ms', perFrame, 'headroom vs 2ms', 2 / perFrame, 'on 5x slower', 2 / (5 * perFrame), 'on 10x slower', 2 / (10 * perFrame));
console.log('current per frame ms (4 ticks x 5.11/4.55us)', 4 * 5.11e-3, 4*4.55e-3, 'ratio 2ms/', 2 / (4 * 5.11e-3), 2/(4*4.55e-3));
