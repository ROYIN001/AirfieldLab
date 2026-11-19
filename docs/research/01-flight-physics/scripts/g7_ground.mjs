// Section 7: wet-runway friction, hydroplaning, tyre side-force curves, stopping distances. Run: node g7_ground.mjs
export const KT = 0.514444;
// 14 CFR 25.109(c)(1) smooth wet runway max tyre-to-ground braking coefficient (V = ground speed kt)
const C109 = { 50: [-0.0350, 0.306, -0.851, 0.883], 100: [-0.0437, 0.320, -0.805, 0.804], 200: [-0.0331, 0.252, -0.658, 0.692], 300: [-0.0401, 0.263, -0.611, 0.614] };
export function mu109max(Vkt, psi) {
  const ps = [50, 100, 200, 300]; const p = Math.min(300, Math.max(50, psi));
  let i = 0; while (i < 2 && p > ps[i + 1]) i++;
  const f = (c, x) => c[0] * x ** 3 + c[1] * x ** 2 + c[2] * x + c[3], x = Math.max(0, Vkt) / 100;
  const a = f(C109[ps[i]], x), b = f(C109[ps[i + 1]], x), u = (p - ps[i]) / (ps[i + 1] - ps[i]);
  return a + (b - a) * u;
}
export const VP = (psi) => 9 * Math.sqrt(psi);       // TN D-2056 / AC 25-32: rolling tyre, kt
export const VPnr = (psi) => 7.7 * Math.sqrt(psi);   // TM X-72650: non-rotating tyre, kt
// achieved wheel braking coefficient with a fully modulating antiskid (AC 25-32 Table 2 / AMC 25.1592)
export function muBrake(Vkt, rwycc, psi, eff = 0.8, dryMu = 0.8) {
  switch (rwycc) {
    case 6: return 0.9 * dryMu * (eff / 0.8);          // 90% of certified dry; here dryMu*eff/0.8 scaling (est)
    case 5: return mu109max(Vkt, psi) * eff;
    case 4: return 0.20 * eff / 0.8;
    case 3: return 0.16 * eff / 0.8;
    case 2: return Vkt < 0.85 * VP(psi) ? Math.min(0.16, 0.5 * mu109max(Vkt, psi) * eff) * (eff / 0.8 > 1 ? 1 : 1) : 0.05;
    case 1: return 0.08 * eff / 0.8;
    default: return 0.02;
  }
}
// Pacejka MF lateral (JSBSim FGLGear form, slip in degrees) and a tanh alternative
export const mfJSB = (aDeg, B = 0.06, C = 2.8, D = 0.8, E = 1.03) => { const x = B * aDeg; return D * Math.sin(C * Math.atan(x - E * (x - Math.atan(x)))); };
export const tanhLat = (aRad, k = 3.2, mu = 0.8) => mu * Math.tanh(k * aRad / mu);
if (process.argv[1].endsWith('g7_ground.mjs')) {
  console.log('25.109(c) mu_max (x0.8 = achieved, fully modulating):');
  for (const p of [50, 60, 100, 200]) console.log(`  ${p} psi:`, [0, 20, 40, 60, 80, 100, 120, 140].map(v => `${v}kt ${mu109max(v, p).toFixed(3)}/${(0.8 * mu109max(v, p)).toFixed(3)}`).join('  '));
  for (const p of [45, 60, 75, 140, 200]) console.log(`  hydroplaning p=${p} psi: VP=${VP(p).toFixed(1)} kt, 0.85VP=${(0.85 * VP(p)).toFixed(1)} kt, non-rotating ${VPnr(p).toFixed(1)} kt`);
  // JSBSim MF: slope at 0 and peak
  let pk = 0, ap = 0; for (let a = 0; a <= 40; a += 0.01) { const f = mfJSB(a); if (f > pk) { pk = f; ap = a; } }
  console.log(`JSBSim MF default: slope ${(mfJSB(0.01) / 0.01).toFixed(4)} /deg = ${(mfJSB(0.01) / 0.01 * 57.2958).toFixed(2)} /rad, peak ${pk.toFixed(3)} at ${ap.toFixed(1)} deg, at 20deg ${mfJSB(20).toFixed(3)}, 40deg ${mfJSB(40).toFixed(3)}`);
  // fit B for slope 3.2/rad with C=2.8,E=1.03 (keep JSBSim shape)
  const Bfit = 3.2 / 57.2958 / (2.8 * 0.8);
  pk = 0; ap = 0; for (let a = 0; a <= 60; a += 0.01) { const f = mfJSB(a, Bfit); if (f > pk) { pk = f; ap = a; } }
  console.log(`MF with slope 3.2/rad (B=${Bfit.toFixed(4)}/deg, C 2.8, D 0.8, E 1.03): peak ${pk.toFixed(3)} at ${ap.toFixed(1)} deg; at 5deg ${mfJSB(5, Bfit).toFixed(3)}, 10deg ${mfJSB(10, Bfit).toFixed(3)}`);
  console.log(`tanh model k=3.2: 2deg ${tanhLat(2 / 57.3).toFixed(3)} 5deg ${tanhLat(5 / 57.3).toFixed(3)} 10deg ${tanhLat(10 / 57.3).toFixed(3)} 20deg ${tanhLat(20 / 57.3).toFixed(3)}`);
  // current model lateral: Fs/N = 0.65 tanh(V sin(a)/0.35)
  for (const V of [2, 5, 15, 30, 45]) console.log(`  current side coeff @${V} m/s: 1deg ${(0.65 * Math.tanh(V * Math.sin(1 / 57.3) / 0.35)).toFixed(3)} 3deg ${(0.65 * Math.tanh(V * Math.sin(3 / 57.3) / 0.35)).toFixed(3)} slope ${(0.65 * V / 0.35).toFixed(1)} /rad`);
  // TN 4110 cornering power for 6.50-8 at 60 psi (rated 75 psi), delta 30 mm, d 19.5 in, w 6.6 in
  const dd = 0.030 / (19.5 * 0.0254), Cc = dd <= 0.0875 ? 1.2 * dd - 8.8 * dd * dd : 0.0674 - 0.34 * dd;
  const Nlbdeg = Cc * (60 + 0.1 * 75) * 6.6 ** 2;
  console.log(`TN4110 cornering power main tyre: d/d ${dd.toFixed(3)} Cc ${Cc.toFixed(4)} -> ${Nlbdeg.toFixed(0)} lb/deg = ${(Nlbdeg * 4.44822).toFixed(0)} N/deg = ${(Nlbdeg * 4.44822 * 57.2958 / 1000).toFixed(1)} kN/rad; /Fz(9.5kN) = ${(Nlbdeg * 4.44822 / 9500).toFixed(4)} /deg = ${(Nlbdeg * 4.44822 * 57.2958 / 9500).toFixed(2)} /rad`);
  // relaxation length TN4110 eq 43 (c uncertain 0.55 or 5.5)
  for (const c of [0.55, 5.5]) console.log(`  relaxation L_s (c=${c}): ${((2.8 - 0.8 * 60 / 75) * (1 - c * dd) * 6.6 * 0.0254).toFixed(3)} m`);
}
