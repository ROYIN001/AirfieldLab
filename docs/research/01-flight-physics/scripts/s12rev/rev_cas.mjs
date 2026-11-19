// rev_cas.mjs - KCAS (compressible) for the s12 cruise point, vs EAS that the solver script printed
import { M } from 'test/harness.mjs';
const { atmosphere, KT, FT, FIELD } = M;
const h = 5000 * FT, V = 240.3621797057351 * KT;
for (const [lbl, H] of [['h=5000ft AGL (script)', FIELD.elev + h], ['5000 ft MSL', h]]) {
  const a = atmosphere(H); const p0 = 101325, a0 = 340.294;
  const Mach = V / a.a; const qc = a.p * ((1 + 0.2 * Mach * Mach) ** 3.5 - 1);
  const cas = a0 * Math.sqrt(5 * ((qc / p0 + 1) ** (2 / 7) - 1));
  console.log(lbl, 'elev', FIELD.elev, 'Mach', Mach.toFixed(4), 'EAS kt', (V * Math.sqrt(a.rho / 1.225) / KT).toFixed(2), 'CAS kt', (cas / KT).toFixed(2));
}
console.log('BM half-width deg', (Math.log(19) / 55 * 180 / Math.PI).toFixed(3), 'MSFS 0.9-1.1 of 14.5 deg half-width', (0.1 * 14.5).toFixed(3), 'of 17', (0.1*17).toFixed(2));
console.log('Vc', (0.8 * 700e3 / 11500).toFixed(3), 'lambdaPeak', 5 ** -0.25, 'lag', 0.3 + 0.7 * (1 - Math.exp(-1)));
