#!/usr/bin/env node
// 19 Nov 2026 (D6): flap labels follow the AFM (UP / T/O / LDG); earlier outputs used 'TO'.
// ld_flaps.mjs — DA40 flap lift increment estimate (05-da40.md §05.6, leaf aero.static.CL0 / aero.flaps.detents).
// 1) DATCOM plain-flap method (R1 methods / LM10): section Δcl = clα·τ·η_δ·δf, wing ΔCL0 = Δcl·(CLαw/clα)·K_b.
//    τ from thin-airfoil theory for cf/c = 0.25; η_δ (empirical efficiency at large deflection) 0.80 at 20°, 0.55 at 42°;
//    K_b 0.62 = flap span fraction (inboard flap to aileron break, AFM 3-view [LD6]); CLαw 5.0, clα 6.0 per rad.
// 2) cross-check with pilot-reported attitudes and descent rates (forum, conf ต่ำ [LD13]): α_body = θ − γ,
//    CL = W/(qS) at an assumed mass (1,100–1,300 kg, mass not reported), CL0 = CL − CLα·α.
// Output: out/ld_flaps.json.  No inputs needed.
import fs from 'node:fs';
const D = Math.PI / 180, S = 13.244, g = 9.80665, rho = 1.225, KT = 0.514444, FPM = 0.3048 / 60, CLa = 5.45;
const cfc = 0.25, thf = Math.acos(2 * cfc - 1), tau = 1 - (thf - Math.sin(thf)) / Math.PI;
const cla = 6.0, CLaw = 5.0, Kb = 0.62;
const datcom = Object.fromEntries([['T/O', 20, 0.80], ['LDG', 42, 0.55]].map(([n, df, eta]) => {
  const dcl = cla * tau * eta * df * D; return [n, { flap_deg: df, eta_delta: eta, dcl: +dcl.toFixed(3), dCL0: +(dcl * CLaw / cla * Kb).toFixed(3) }];
}));
// forum points: [name, flap, KIAS, pitch deg, vertical speed fpm]  (KIAS taken as EAS near sea level, conf ต่ำ)
// Review 2026-11-18: in [LD13] posts 17 and 20 give real DA40 NG observations; posts 16 and 20 also quote a flight-test
// video of a DA 40 TDI (diesel, lighter, different prop). The first version used two TDI points as if they were NG.
// NG points (post 17: clean idle, T/O full power; post 20, 0 % load: T/O idle, LDG idle) and TDI points are now separate.
const pts = [['clean idle (NG p17/p20)', 'UP', 88, -2.5, -900], ['T/O full power (NG p17)', 'T/O', 73, 7.5, 850],
  ['T/O idle (NG p20)', 'T/O', 84, -6.0, -600], ['T/O idle 88 kt (NG p20)', 'T/O', 88, -7.5, -900],
  ['LDG idle 88 kt (NG p20)', 'LDG', 88, -12.5, -1300], ['LDG idle 84 kt (NG p20)', 'LDG', 84, -6.5, -500],
  ['T/O idle (TDI video p16/p20)', 'T/O', 84, -7.5, -950], ['LDG idle (TDI video p16/p20)', 'LDG', 73, -6.5, -1050]];
const forum = pts.map(([name, flap, kias, th, vs]) => {
  const V = kias * KT, gam = Math.asin(vs * FPM / V) / D, a = th - gam, q = 0.5 * rho * V * V;
  const CL0 = m => +(m * g * Math.cos(gam * D) / (q * S) - CLa * a * D).toFixed(3);
  return { name, flap, kias, theta_deg: th, gamma_deg: +gam.toFixed(2), alpha_deg: +a.toFixed(2), CL0_1100: CL0(1100), CL0_1200: CL0(1200), CL0_1300: CL0(1300) };
});
const up = forum[0], d = i => +(forum[i].CL0_1200 - up.CL0_1200).toFixed(3);
const LoD = ([, , kias, , vs]) => +(kias * KT / (-vs * FPM)).toFixed(2);   // glide ratio ≈ V/|Vz| (ground distance per height)
const out = { tau: +tau.toFixed(3), cfc, datcom, forum,
  forum_dCL0_1200: { TO_power_NG: d(1), TO_idle_NG_84: d(2), TO_idle_NG_88: d(3), LDG_idle_NG_88: d(4), LDG_idle_NG_84: d(5),
    TO_idle_TDI: d(6), LDG_idle_TDI: d(7) },
  glide_ratio: Object.fromEntries(pts.map(p => [p[0], LoD(p)])) };
fs.writeFileSync(new URL('./out/ld_flaps.json', import.meta.url), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
