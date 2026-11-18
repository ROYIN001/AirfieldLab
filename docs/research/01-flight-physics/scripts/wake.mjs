// Wake vortex of an A320ceo and a 737-800W on approach to VTBD; induced roll on the AirfieldLab trainer at 3/4/5 NM.
import { M } from 'test/harness.mjs';
const { KT, FT, G0, AC, atmosphere, FIELD } = M;
const NM = 1852;
const isaDev = 31 - (15 - 0.0065 * FIELD.elev);
const rho = atmosphere(FIELD.elev + 150, isaDev).rho; // ~500 ft AGL, OAT 31 C at field
console.log('field elev m', FIELD.elev.toFixed(1), 'rho(150 m AGL, OAT 31C)', rho.toFixed(4));
const gens = [
  { k: 'A320ceo', m: 66000, b: 35.80, Vkt: 135, note: 'MLW 66.0 t & span 35.80 m (Airbus); 135 kt = est. inside Cat C (121-140 kt)' },
  { k: 'B737-800W', m: 66361, b: 35.79, Vkt: 142, note: 'MLW 66,361 kg, span 35.79 m, approach 142 kt (Boeing ARC doc)' },
  { k: 'A320 typ. landing 58 t', m: 58000, b: 35.80, Vkt: 130, note: 'typical landing mass, est.' },
];
// Follower: our trainer
const bf = AC.b, Sf = AC.S, cf = Sf / bf, aw = AC.CLa, Vf = 95 * KT * Math.sqrt(1.225 / rho); // TAS
const ClAilMax = AC.Clda * AC.daMax;
console.log('trainer: b', bf, 'c', cf.toFixed(3), 'CLa', aw, 'V_TAS', (Vf / KT).toFixed(1), 'kt  Cl_ail,max =', ClAilMax.toFixed(4));
// strip theory rolling moment for one Burnham-Hallock vortex centred on the follower's fuselage (worst case),
// plus the opposite-sign partner at lateral distance b0. Returns Cl (magnitude) for circulation G.
function ClStrip(G, rc, b0, nStrip = 400) {
  const s = bf / 2; let Lsum = 0;
  const vt = (y) => (G / (2 * Math.PI)) * y / (y * y + rc * rc); // signed: upwash on +y side
  for (let i = 0; i < nStrip; i++) {
    const y = -s + (i + 0.5) * bf / nStrip, dy = bf / nStrip;
    const wup = vt(y) - vt(y - b0); // partner at y=b0 with opposite rotation
    Lsum += -0.5 * rho * Vf * Vf * cf * aw * (wup / Vf) * y * dy; // FRD roll moment (lift up on right wing -> negative)
  }
  return Lsum / (0.5 * rho * Vf * Vf * Sf * bf);
}
const ClSimple = (G) => aw * G / (2 * Math.PI * Vf * bf);
for (const g of gens) {
  const V = g.Vkt * KT, W = g.m * G0, b0 = Math.PI * g.b / 4;
  const G0v = W / (rho * V * b0), w0 = G0v / (2 * Math.PI * b0), t0 = b0 / w0;
  console.log(`\n${g.k}: ${g.note}\n  b0=${b0.toFixed(2)} m  Gamma0=${G0v.toFixed(0)} m^2/s  w0=${w0.toFixed(2)} m/s (${(w0 / FT * 60).toFixed(0)} fpm)  t0=${t0.toFixed(1)} s`);
  for (const d of [3, 4, 5]) {
    const age = d * NM / V, ts = age / t0;
    // decay assumptions: none; long-lived low-turbulence fit to Hallock & Burnham 1997 B-767 run (0.7 to t*=2.8, 0.33 at t*=7.6)
    const gLow = ts <= 2.8 ? 0.7 : 0.7 * Math.exp(-(ts - 2.8) / 6.4);
    const res = [];
    for (const [lbl, frac] of [['no decay', 1], ['HB97 low-turb fit', gLow]]) {
      const G = G0v * frac;
      const c1 = ClStrip(G, 0.01 * g.b, b0), c5 = ClStrip(G, 0.05 * g.b, b0);
      res.push(`${lbl}: G=${G.toFixed(0)} Cl(rc=1%b)=${Math.abs(c1).toFixed(3)} [x${(Math.abs(c1) / ClAilMax).toFixed(1)} aileron] Cl(rc=5%b)=${Math.abs(c5).toFixed(3)} [x${(Math.abs(c5) / ClAilMax).toFixed(1)}]`);
    }
    console.log(`  ${d} NM: age ${age.toFixed(0)} s (t*=${ts.toFixed(2)}), free descent if undecayed ${(w0 * age).toFixed(0)} m\n     ${res.join('\n     ')}`);
  }
  console.log(`  simple Cl=a*G/(2 pi V b_f) undecayed: ${ClSimple(G0v).toFixed(3)}`);
  // circulation at which roll ratio = 1 (rc=5%b): solve
  let lo = 0, hi = G0v; for (let i = 0; i < 50; i++) { const mid = (lo + hi) / 2; if (Math.abs(ClStrip(mid, 0.05 * g.b, b0)) > ClAilMax) hi = mid; else lo = mid; }
  console.log(`  circulation giving Cl = full-aileron Cl (rc=5%b): ${lo.toFixed(1)} m^2/s = ${(lo / G0v * 100).toFixed(1)} % of Gamma0`);
}

// ---- Clp-consistent estimate: equivalent rolling gust p_g = 12/b^3 * ∫ w_up(y) y dy, Cl = |Clp| * p_g * b/(2V)
console.log('\n--- Clp-consistent roll ratio (uses AC.Clp, accounts for 3-D span loading) ---');
function pgEq(G, rc, b0, n = 400) { const s = bf / 2; let I = 0; const vt = (y) => (G / (2 * Math.PI)) * y / (y * y + rc * rc); for (let i = 0; i < n; i++) { const y = -s + (i + 0.5) * bf / n; I += (vt(y) - vt(y - b0)) * y * bf / n; } return 12 * I / bf ** 3; }
console.log('strip-theory Clp for rectangular wing = -a/6 =', (-aw / 6).toFixed(3), ' vs AC.Clp', AC.Clp);
for (const g of gens.slice(0, 2)) {
  const V = g.Vkt * KT, b0 = Math.PI * g.b / 4, G0v = g.m * G0 / (rho * V * b0), t0 = b0 / (G0v / (2 * Math.PI * b0));
  for (const d of [3, 4, 5]) {
    const ts = d * NM / V / t0, gLow = ts <= 2.8 ? 0.7 : 0.7 * Math.exp(-(ts - 2.8) / 6.4);
    const row = [];
    for (const [lbl, frac] of [['no decay', 1], ['low-turb fit', gLow]]) for (const rcf of [0.01, 0.05]) {
      const pg = pgEq(G0v * frac, rcf * g.b, b0), Cl = Math.abs(AC.Clp) * pg * bf / (2 * Vf);
      row.push(`${lbl} rc=${rcf * 100}%b: pg=${pg.toFixed(2)} rad/s Cl=${Cl.toFixed(3)} ratio ${(Cl / ClAilMax).toFixed(2)}`);
    }
    console.log(`${g.k} ${d} NM: ` + row.join(' | '));
  }
}
