// Section 5: landing roll with/without reversers (point mass) to size reverse effectiveness against AC 91-79B LDF ratios.
// Test-fixture airframe numbers are ASSUMED (ค่าสมมติ) for an A320neo-class twin; engine rating from EEDB (LEAP-1A26 120.6 kN).
process.env.QUIET = '1';
const { CORE } = await import('./f5_spool.mjs');
const KT = 0.514444, g = 9.80665, rho = 1.225, a0 = 340.29;
const BY = (M, bpr = 11.1) => { const G = 0.0606 * bpr + 0.6337; return 1 - 0.377 * (1 + bpr) / Math.sqrt((1 + 0.82 * bpr) * G) * M + (0.23 + 0.19 * Math.sqrt(bpr)) * M * M; };
const FIX = { m: 62000, S: 122.6, CDg: 0.10, nEng: 2, Frated: 120600, Vapp: 135, Vtd: 0.96 * 135, airS: 7, tPilot: 1.0, tTransit: 2.0, tSpoiler: 1.0, Vcancel: 60 };
function roll(opt) {
  const p = { ...FIX, ...opt }; const eng = CORE.LEAP_1A; const span = eng.N2max - eng.N2gi;
  let V = p.Vtd * KT, x = 0, t = 0, n2 = eng.N2gi, revPos = 0; const dt = 1 / 120; let maxRevDecel = 0;
  while (V > 0.5 && t < 200) {
    const Mach = V / a0;
    const wantRev = p.rev !== 'none' && t >= p.tPilot;
    if (wantRev) revPos = Math.min(1, revPos + dt / p.tTransit);
    const deployed = revPos >= 0.9;                                  // interlock: power above reverse idle only when sleeves ≥ 90 %
    const revDemand = (p.rev === 'max' && deployed && V > p.Vcancel * KT) ? p.revN : 0;
    const n2cmd = eng.N2gi + span * Math.sqrt(revDemand);
    const n = Math.max(0, (n2 - eng.N2gi) / span), nn = Math.min(1, n + 0.1);
    n2 += Math.max(-eng.Rdec0, Math.min(eng.Racc0 / (1 + eng.a * (1 - nn) ** 3), (n2cmd - n2) / eng.tau)) * dt;
    const phi = Math.max(0, (n2 - eng.N2gi) / span) ** 2;            // spool fraction above idle
    // forward idle residual thrust (per engine, fraction of rated) and reverse retarding force model r(M) = c0 + c1*M at full reverse N1
    const Fidle = eng.idleFrac * p.Frated * BY(Mach);
    let Fx;
    if (revPos < 0.05) Fx = p.nEng * Fidle;                           // stowed: residual forward idle thrust
    else { const r = (p.c0 + p.c1 * Mach); const Frev = p.Frated * r * (p.revIdleFrac + (1 - p.revIdleFrac) * phi);  // retarding magnitude
           Fx = p.nEng * (Fidle * (1 - revPos) - Frev * revPos); }
    const q = 0.5 * rho * V * V, D = q * p.S * (t >= p.tSpoiler ? p.CDg : 0.06);
    const Wn = p.m * g * (t >= p.tSpoiler ? 1 : 0.6);
    const Fb = (t >= p.tPilot ? p.mu : 0.02) * Wn;
    const acc = (Fx - D - Fb) / p.m;
    if (p.rev !== 'none') maxRevDecel = Math.max(maxRevDecel, -Math.min(0, Fx) / p.m / g);
    V += acc * dt; x += V * dt; t += dt;
  }
  const air = p.airS * 0.98 * p.Vapp * KT;
  return { ground: +x.toFixed(0), total: +(x + air).toFixed(0), t: +t.toFixed(1), maxRevDecel_g: +maxRevDecel.toFixed(3) };
}
const out = {}; const LDF = { RCC5_grooved: [2.3, 1.92], RCC3: [3.2, 2.5], RCC2: [4.0, 2.9], RCC1: [5.1, 3.4] };
const MU = { dry: 0.40, RCC5_grooved: 0.25, RCC3: 0.163, RCC2: 0.12, RCC1: 0.083 };
for (const [c0, c1] of [[0.25, 1.0], [0.30, 1.0], [0.20, 0.8], [0.35, 1.3]]) {
  const key = `c0=${c0},c1=${c1}`; out[key] = {};
  for (const [rc, mu] of Object.entries(MU)) {
    const base = { mu, c0, c1, revN: 0.70, revIdleFrac: 0.10 };
    const none = roll({ ...base, rev: 'none' }), idle = roll({ ...base, rev: 'idle' }), max = roll({ ...base, rev: 'max' });
    out[key][rc] = { none: none.total, revIdle: idle.total, revMax: max.total, ratioMax: +(max.total / none.total).toFixed(3), ratioIdle: +(idle.total / none.total).toFixed(3), ACratio: LDF[rc] ? +(LDF[rc][1] / LDF[rc][0]).toFixed(3) : null, maxRevDecel_g: max.maxRevDecel_g };
  }
}
// sensitivity: delay of reverse selection by 15 s on RCC3 (Midway-type) for default c0/c1
out.delay15s_RCC3 = { onTime: roll({ mu: 0.163, c0: 0.25, c1: 1.0, revN: 0.7, revIdleFrac: 0.1, rev: 'max' }).total, delayed: roll({ mu: 0.163, c0: 0.25, c1: 1.0, revN: 0.7, revIdleFrac: 0.1, rev: 'max', tPilot: 15 }).total };
console.log(JSON.stringify(out, null, 1));
