// v10rev_expected.mjs: reviewer recomputation of derived/expected values quoted in sec-10
import { M } from 'test/harness.mjs';
const { AC, KT, FT, atmosphere, FIELD } = M; const r = (x, n = 3) => +x.toFixed(n); const o = {};
// L/D max of polar CD = CD0 + K (CL - 0.15)^2 and Oswald e
const CLs = Math.sqrt(0.15**2 + AC.CD0/AC.K), CDs = AC.CD0 + AC.K*(CLs - 0.15)**2, AR = AC.b**2/AC.S;
o.glide = { CLstar: r(CLs), LDmax: r(CLs/CDs, 2), AR: r(AR, 3), e: r(1/(Math.PI*AR*AC.K), 3) };
// Vbg at zero thrust, 3000 ft ISA, clean (IAS from TAS)
const rho = atmosphere(FIELD.elev + 3000*FT, 0).rho, W = AC.m*9.80665, Vt = Math.sqrt(2*W/(rho*AC.S*CLs));
o.Vbg_kt_IAS = r(Vt*Math.sqrt(rho/1.225)/KT, 1);
// Vc of thrustAvail and idle thrust at Vbg idle 111 kt IAS (3000 ft)
const Vc = AC.eta*AC.P/AC.T0, V111 = 111*KT/Math.sqrt(rho/1.225); o.Vc = r(Vc, 2); o.idleThrust_N = r(AC.idle*AC.T0*Vc/Math.hypot(V111, Vc), 0);
// stall: V_SR = VCLmax/sqrt(nz); Vs0 difference; V50 floor
o.VSR_flaps = r(69.99/Math.sqrt(0.95), 2); o.dVs0_pct = r((71.86/71 - 1)*100, 2); o.V50min_kt = r(1.2*79.59, 1); o.V50_over_VS1 = r(113.83/79.59, 2);
// climb gradient at Vy 128 kt IAS near SL
const rhoSL = atmosphere(FIELD.elev + 30, 0).rho, VyT = 128*KT/Math.sqrt(rhoSL/1.225); o.climbGradient_pct = r(3224.83*FT/60/VyT*100, 1);
// tolerances for T-V-14/15
o.TO50_band_m = r(0.05*589.99, 1); o.groundRoll_1e1_m = r(Math.min(0.10*376.09, 61), 1); o.total_band_m = r(0.05*714.06, 1);
o.avgDecel_g = r((82.56*KT)**2/(2*376.09)/9.80665, 3);
// 747 phugoid period from wn, zeta (MIT OCW lecture 7)
o.b747_phugoid_T_s = r(2*Math.PI/(0.0673*Math.sqrt(1 - 0.0489**2)), 1);
// spiral predictions phi(20) = phi0 exp(20 lambda)
o.spiral_appr = r(19.969*Math.exp(-0.0192*20), 2); o.spiral_cruise = r(19.988*Math.exp(-0.0080*20), 2);
// CAP and modal conversions (approach)
o.CAP_appr = r(2.221**2/5.19, 3); o.ph_T_appr = r(2*Math.PI/(0.248*Math.sqrt(1 - 0.115**2)), 1); o.dr_T_appr = r(2*Math.PI/(1.611*Math.sqrt(1 - 0.139**2)), 2);
// browser latency band (estimate): 0..1 frame wait + 1..3 frames render at 60 Hz
o.latency_ms = [r(1000/60*1, 1), r(1000/60*4, 1)];
console.log(JSON.stringify(o, null, 1));
