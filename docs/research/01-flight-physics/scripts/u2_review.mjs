// u2_review.mjs — adversarial review checks for section 2 (recomputations)
import { M } from 'test/harness.mjs';
import { slip } from './u2_slip.mjs';
const { Aircraft, AC, DEG, KT, atmosphere, FIELD } = M;
const isaDev = 31 - (15 - 0.0065 * FIELD.elev), rho0 = atmosphere(FIELD.elev, isaDev).rho;
const thrustAvail = (V) => { const Vc = AC.eta * AC.P / AC.T0; return AC.T0 * Vc / Math.sqrt(V * V + Vc * Vc); };
const D = 2.44;
// (a) 110 kt full-power row
{ const V = 110 * KT, T = thrustAvail(V), s = slip({ V, T, P: AC.P, rho: rho0 });
  const Tc = T / (rho0 * V * V * D * D), dr = -s.Nsw / (s.qEffV * AC.S * AC.b * AC.Cndr);
  console.log(`110kt: T ${T.toFixed(0)} Tc ${Tc.toFixed(3)} vi ${s.vi.toFixed(1)} Vs ${s.Vs.toFixed(1)} rs ${s.rs.toFixed(2)} qs/q ${(s.qs/s.q).toFixed(2)} kH ${s.kH.toFixed(2)} kV ${s.kV.toFixed(2)} qEffH/q ${(s.qEffH/s.q).toFixed(2)} swirl ${s.swirlDeg.toFixed(1)} Nsw ${s.Nsw.toFixed(0)} rudder ${(dr/DEG).toFixed(1)} deg`); }
// (b) static full-up elevator moment with the proposed code (qH = qbar + kappa kH (qs - qbar), derivatives already contain eta_t)
{ const s = slip({ V: 0, T: AC.T0, P: AC.P, rho: rho0 });
  console.log(`static: qH ${s.qEffH.toFixed(0)} Pa (EAS ${(Math.sqrt(2*s.qEffH/1.225)/KT).toFixed(1)} kt, TAS@rho0 ${(Math.sqrt(2*s.qEffH/rho0)/KT).toFixed(1)} kt); elevator moment (code) ${(s.qEffH*AC.S*AC.c*Math.abs(AC.Cmde)*AC.deUp).toFixed(0)} N·m; old script (/0.9) ${(s.qEffH*AC.S*AC.c*Math.abs(AC.Cmde)/0.9*AC.deUp).toFixed(0)}`); }
// (c) thrust-line height above ground when parked (CG height from u2_current_misc 1.304 m, thrust line 0.06 m above CG)
{ const hT = 1.304 + 0.06; console.log(`thrust height ${hT.toFixed(3)} m, moment ${(AC.T0*hT).toFixed(0)} N·m; nose-load relief by 5.52 kN·m: ${(5523/2.65).toFixed(0)} N`); }
// (d) closed-form alpha-dot check against Aircraft.deriv
{ const ac = new Aircraft(); ac.isaDev = isaDev; ac.setApproach({ dist: 5500 });
  ac.x[11] = 3 * DEG; ac.de = -2 * DEG;      // non-trim state so alpha-dot is not zero
  const R = new Array(9), out = new Float64Array(13), d = { wow: [0,0,0], load: [0,0,0] };
  const adotOf = (A) => { ac.adot = A; ac.deriv(ac.x, out, d);
    const x = ac.x, Rm = ac.R, w = [x[10], x[11], x[12]];
    const v = [Rm[0]*x[3]+Rm[3]*x[4]+Rm[6]*x[5], Rm[1]*x[3]+Rm[4]*x[4]+Rm[7]*x[5], Rm[2]*x[3]+Rm[5]*x[4]+Rm[8]*x[5]];
    const a = [Rm[0]*out[3]+Rm[3]*out[4]+Rm[6]*out[5], Rm[1]*out[3]+Rm[4]*out[4]+Rm[7]*out[5], Rm[2]*out[3]+Rm[5]*out[4]+Rm[8]*out[5]];
    const wxv = [w[1]*v[2]-w[2]*v[1], w[2]*v[0]-w[0]*v[2], w[0]*v[1]-w[1]*v[0]];
    const ud = a[0]-wxv[0], wd = a[2]-wxv[2];
    return { val: (v[0]*wd - v[2]*ud)/(v[0]**2+v[2]**2), u: v[0], w: v[2], ud, wd, qbar: d.qbar, sig: d.sig, beta: d.beta, alpha: d.alpha, V: d.V }; };
  const f0 = adotOf(0), f1 = adotOf(0.1);
  const slope = (f1.val - f0.val) / 0.1, exact = f0.val / (1 - slope);
  const K = f0.qbar * AC.S / AC.m * AC.CLadot * AC.c / (2 * f0.V);
  const Zad = -K * Math.cos(f0.alpha);
  const sec = (f0.u*f0.wd - f0.w*f0.ud) / (f0.u**2 + f0.w**2 - f0.u*Zad);
  const fix = (f0.u*f0.wd - f0.w*f0.ud) / (f0.u**2 + f0.w**2 + f0.qbar*AC.S*AC.c/(2*AC.m)*AC.CLadot*Math.cos(f0.beta)*(1-f0.sig));
  console.log(`alpha-dot fixed point (deriv): ${(exact/DEG).toFixed(4)} deg/s; section formula ${(sec/DEG).toFixed(4)}; corrected formula ${(fix/DEG).toFixed(4)}; alpha ${(f0.alpha/DEG).toFixed(2)} deg; denominator ratio K*V/(u^2+w^2) ${(K*f0.V/(f0.u**2+f0.w**2)).toFixed(4)}`);
  // larger alpha case (go-around-like, alpha ~ 12 deg) to show the cos^2 alpha term
  ac.setApproach({ dist: 5500, ias: 72 }); ac.x[11] = 5 * DEG; ac.de = -4 * DEG;
  const g0 = adotOf(0), g1 = adotOf(0.1), gs = (g1.val - g0.val) / 0.1, gex = g0.val / (1 - gs);
  const K2 = g0.qbar * AC.S / AC.m * AC.CLadot * AC.c / (2 * g0.V), Z2 = -K2 * Math.cos(g0.alpha);
  const sec2 = (g0.u*g0.wd - g0.w*g0.ud) / (g0.u**2 + g0.w**2 - g0.u*Z2);
  const fix2 = (g0.u*g0.wd - g0.w*g0.ud) / (g0.u**2 + g0.w**2 + g0.qbar*AC.S*AC.c/(2*AC.m)*AC.CLadot*Math.cos(g0.beta)*(1-g0.sig));
  console.log(`72 kt: alpha ${(g0.alpha/DEG).toFixed(2)} deg, sig ${g0.sig.toFixed(3)}; fixed point ${(gex/DEG).toFixed(4)}; section ${(sec2/DEG).toFixed(4)}; corrected ${(fix2/DEG).toFixed(4)}`);
}
// (e) Jones & Fehlner n (radians per half-chord) for the trainer short period
{ const w = 2.231, V = 51.0, n = w * (AC.c / 2) / V; console.log(`TN771 n = ${n.toFixed(4)} rad/half-chord, wavelength ${(2*Math.PI/n).toFixed(0)} half-chords (limit n<0.35 = 18 half-chords)`); }
// (f) TR 690 uses Tc' = T/(q S_wing); trainer values
{ const q80 = 0.5 * rho0 * (80*KT)**2, T80 = thrustAvail(80*KT); console.log(`Tc' 80kt full ${(T80/(q80*AC.S)).toFixed(3)}; approach ${(1973/(1464*AC.S)).toFixed(3)}`); }
// (g) current model: lift ratio at alpha 4 deg, flaps up, repo wing height h/b 0.1 vs 3.0
{ const CL = (hw) => { const g = (16*hw/AC.b)**2, phi = g/(1+g); return AC.CL0 + AC.CLa*(1+0.12*(1-phi))*4*DEG; };
  console.log(`current CL ratio alpha 4 flaps up: ${(CL(1.02)/CL(30.6)).toFixed(4)}; alpha-term only ${(1+0.12*(1-(16*0.1)**2/(1+(16*0.1)**2))).toFixed(4)}`); }
// (h) JSBSim c172p kCDge vs Tani; kCLge at 0.4
{ const hb = [0.1,0.15,0.2,0.3,0.4,0.5], js = [0.515,0.629,0.709,0.815,0.882,0.928];
  const tani = (h) => 1 - Math.exp(-2.48 * (2*h)**0.768);
  console.log('kCDge - Tani:', hb.map((h,i) => (js[i]-tani(h)).toFixed(3)).join(' '));
  const s4 = Math.exp(-2.48*(0.8)**0.768); console.log(`kL Katzoff at 0.4: ${(1/(1-s4*4.4/(Math.PI*AC.b**2/AC.S))).toFixed(3)} vs JSBSim 1.055`);
  for (const h of [0.6, 0.63, 0.65]) console.log(`Tani kD(${h}) = ${tani(h).toFixed(3)}`); }
// (i) fin check: eta_v Vv a_v and tau_r needed for Cndr
{ const Vv = 2.06*5.25/(AC.S*AC.b), base = 0.9*Vv*2.8; console.log(`eta_v Vv a_v = ${base.toFixed(4)} /rad; tau_r for Cndr -0.072: ${(0.072/base).toFixed(3)}; Cndr with tau 0.5: ${(-base*0.5).toFixed(4)}`); }
// (j) elevator for +0.08 at 80 kt full power
console.log(`go-around elevator: ${(0.078/(Math.abs(AC.Cmde)*1.48)/DEG).toFixed(2)} deg`);
