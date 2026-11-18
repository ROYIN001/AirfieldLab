// U1: geometry-based downwash-lag derivatives for the AirfieldLab trainer (ค่าประมาณ)
// Geometry read from src/70-aircraft.js (procedural 3D model, model axes +X nose, +Y up, origin = CG).
import { M } from 'test/harness.mjs';
const { AC } = M;
const lerp = (a, b, t) => a + (b - a) * t;
// trapezoid helper: semi-span s, root chord cr, tip chord ct
function trap(s, cr, ct) {
  const lam = ct / cr, S2 = s * (cr + ct) / 2;               // one side
  const cmac = (2 / 3) * cr * (1 + lam + lam * lam) / (1 + lam);
  const ymac = (s / 3) * (1 + 2 * lam) / (1 + lam);
  return { lam, S2, cmac, ymac };
}
// Wing: chord 2.2 at z=0.5 -> 1.0 at z=5.1, LE x = 0.55 - (z-0.5)*tan4deg, y = -0.36 (+dihedral)
const W = trap(4.6, 2.2, 1.0);
const Sw_exposed = 2 * W.S2, Sw_gross = Sw_exposed + 2 * 0.5 * 2.2;
const Aw = AC.b ** 2 / AC.S;
const xLEmac_w = 0.55 - W.ymac * Math.tan(4 * Math.PI / 180);
const xQC_w = xLEmac_w - 0.25 * W.cmac;               // wing MAC quarter chord (x, +nose)
// Horizontal tail: chord 1.25 at z=0 -> 0.72 at z=1.85, LE x = -4.70 - |z|*0.18, y=0.30, hinge 0.65c
const H = trap(1.85, 1.25, 0.72);
const St = 2 * H.S2, bt = 3.7, At = bt * bt / St;
const xLEmac_t = -4.70 - H.ymac * 0.18, xQC_t = xLEmac_t - 0.25 * H.cmac;
const lt = xQC_w - xQC_t;                                  // wing ac -> tail ac
const lt_cg = -xQC_t;                                      // CG -> tail ac
const hH = 0.30 - (-0.36);                                 // tail above wing root chord plane
// Vertical fin: chord 1.55 at h=0 -> 0.8 at h=1.75, LE x=-4.45-0.62h, root y=0.34
const V = trap(1.75, 1.55, 0.8);
const Sv = V.S2, bv = 1.75, Av = bv * bv / Sv;
const xQC_v = -4.45 - 0.62 * V.ymac - 0.25 * V.cmac, zv_up = 0.34 + V.ymac;
// Lift-curve slope (Helmbold / DATCOM low-speed form, as in Aeromatic++ Controls.cpp): a = 2piA/(2+sqrt(4+A^2(1+tan^2 L)/k^2)), k=0.95
const helm = (A, Lc2 = 0, k = 0.95) => 2 * Math.PI * A / (2 + Math.sqrt(4 + (A * A / (k * k)) * (1 + Math.tan(Lc2) ** 2)));
const at = helm(At), aw = helm(Aw);
// Downwash gradient: (1) DATCOM empirical, (2) Aeromatic 4/(A+2), (3) elliptic far-field 2 CLa/(pi A)
const KA = 1 / Aw - 1 / (1 + Math.pow(Aw, 1.7));
const Kl = (10 - 3 * W.lam) / 7;
const KH = (1 - Math.abs(hH / AC.b)) / Math.cbrt(2 * lt / AC.b);
const deda_datcom = 4.44 * Math.pow(KA * Kl * KH * Math.sqrt(Math.cos(0)), 1.19);
const deda_aero = 4 / (Aw + 2);
const deda_ell = 2 * AC.CLa / (Math.PI * Aw);
const VH = St * lt / (AC.S * AC.c);
const out = { wing: { Sw_exposed: +Sw_exposed.toFixed(2), Sw_gross: +Sw_gross.toFixed(2), S_AC: AC.S, Aw: +Aw.toFixed(3), lam: +W.lam.toFixed(3), cmac: +W.cmac.toFixed(3), xQC: +xQC_w.toFixed(3), a_helmbold: +aw.toFixed(3) },
  htail: { St: +St.toFixed(3), bt, At: +At.toFixed(3), lam: +H.lam.toFixed(3), cmac: +H.cmac.toFixed(3), xQC: +xQC_t.toFixed(3), lt_wing: +lt.toFixed(3), lt_cg: +lt_cg.toFixed(3), hH: +hH.toFixed(2), VH: +VH.toFixed(3), a_t: +at.toFixed(3) },
  fin: { Sv: +Sv.toFixed(3), bv, Av_geom: +Av.toFixed(3), xQC: +xQC_v.toFixed(3), z_up: +zv_up.toFixed(3) },
  deda: { datcom: +deda_datcom.toFixed(3), KA: +KA.toFixed(4), Klam: +Kl.toFixed(4), KH: +KH.toFixed(4), aeromatic_4_over_A2: +deda_aero.toFixed(3), elliptic_2CLa_piA: +deda_ell.toFixed(3) } };
const res = [];
for (const eta of [0.9, 1.0]) for (const [k, de] of Object.entries({ datcom: deda_datcom, aeromatic: deda_aero, elliptic: deda_ell })) {
  const CLq_t = 2 * eta * at * VH, CLad = CLq_t * de, Cmad = -CLad * lt_cg / AC.c, Cmq_t = -CLq_t * lt_cg / AC.c;
  res.push({ eta, deda: k, CLadot: +CLad.toFixed(2), Cmadot: +Cmad.toFixed(2), CLq_tail: +CLq_t.toFixed(2), Cmq_tail: +Cmq_t.toFixed(2) });
}
out.derivs = res;
out.current = { CLadot: AC.CLadot, Cmadot: AC.Cmadot, CLq: AC.CLq, Cmq: AC.Cmq, ratio_Cmadot_CLadot: +(AC.Cmadot / AC.CLadot).toFixed(3), implied_lt_m: +(-AC.Cmadot / AC.CLadot * AC.c).toFixed(2) };
// transport delay
out.tau = [80, 88, 95, 120].map(kt => ({ kt, tau_s: +(lt / (kt * 0.514444)).toFixed(3) }));
// propeller position from the model
out.prop = { x: 3.94, y_up: 0.06, disc_r_model: 1.15, D_assumed: 2.44, x_prop_to_tail: +(3.94 - xQC_t).toFixed(2) };
console.log(JSON.stringify(out, null, 1));
