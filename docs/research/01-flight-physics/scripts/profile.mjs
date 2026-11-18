// Mean wind profile: MIL-F-8785C log law vs the current 1/7 power law; equivalent power exponents.
const FT = 0.3048, KT = 0.514444;
const logLaw = (Wref, zref, z0) => (z) => Wref * Math.log(Math.max(z, z0 * 1.0001) / z0) / Math.log(zref / z0);
const pow7 = (W10) => (z) => W10 * Math.pow(Math.min(Math.max(z, 0.3), 300) / 10, 1 / 7);
const W10 = 15 * KT;
const cases = [['MIL-F-8785C Cat C z0=0.15 ft', 0.15 * FT], ['open/airfield z0=0.03 m', 0.03], ['MIL other phases z0=2.0 ft', 2.0 * FT], ['urban upwind z0=1.0 m', 1.0]];
const hs = [3, 6.1, 10, 15, 30, 50, 100, 150, 300];
console.log('h[m]   ' + hs.map(h => String(h).padStart(6)).join(''));
console.log('pow1/7 ' + hs.map(h => (pow7(W10)(h) / KT).toFixed(1).padStart(6)).join(''));
for (const [lbl, z0] of cases) {
  const f = logLaw(W10, 10, z0);
  console.log(lbl.padEnd(32) + hs.map(h => (f(h) / KT).toFixed(1).padStart(6)).join(''));
  const alpha = Math.log(f(100) / f(10)) / Math.log(10);
  console.log('   equivalent power exponent 10-100 m:', alpha.toFixed(3), ' ratio u(100 ft)/u(20 ft)=', (f(100 * FT) / f(20 * FT)).toFixed(3));
}
console.log('pow 1/7 ratio u(100 ft)/u(20 ft)=', Math.pow(5, 1 / 7).toFixed(3));
// Headwind change from 300 ft to 50 ft on final (kt) - what a pilot feels
for (const [lbl, z0] of cases) { const f = logLaw(W10, 10, z0); console.log(lbl, 'dW 300->50 ft', ((f(300 * FT) - f(50 * FT)) / KT).toFixed(1), 'kt'); }
console.log('pow1/7 dW 300->50 ft', ((pow7(W10)(300 * FT) - pow7(W10)(50 * FT)) / KT).toFixed(1), 'kt');
