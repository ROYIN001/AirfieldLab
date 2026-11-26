// The stall-recovery robot pilot (research round 2 task item 23, plan C2): a test pilot, not a page feature.
// It enters a wings-level 1-g stall at idle, decelerating 1 kt/s with the control laws of lm_card.stallTest (research
// 02-light-aircraft/01-methods.md, the same entry the V_SR tests use), and at the break recovers by the research's
// "standard method" (task list item 23; 05-da40.md and 06-da42.md §06.6.5, 12-p2006t.md: reduce the angle of attack,
// full power, wings level, then pull back to level and climb away; the steps of FAA AC 61-67C). It measures the height
// lost from the break to the first instant the sink rate is zero again, the number the research compares with
// speeds.stall_altitude_loss_ft (T-LD-41, T-LT-33, T-LP-62…65, T-LG-26).
//
// What "the break" and "reduce the angle of attack" mean is this pilot's own choice (ค่าประมาณ), because the sim gives a
// pilot no break to see:
//  - break: the first step at which CL has fallen 1 % below the largest CL of the entry (the Beard–McLain blend in
//    src/20-flight.js has passed the lift peak);
//  - recovery α: the α at which the sim's own stall warning goes off, aWarn(flaps) − aWarnHyst (Evaluator, plan A5): the
//    pilot reduces the angle of attack until the warning stops. On every card that is about 5° under the α of the lift
//    peak (the 7 kt margin of T-A-07). The elevator holds it with a PI loop and q damping; the throttle goes to 1 at the
//    break, thrust following TAS only. The height lost grows steeply with this choice (c172s at 1,156.66 kg: 26 ft for
//    2° under the peak, 94 ft for 6°, 325 ft for 10°), which is why it is tied to a number of the card and not tuned to
//    a research value.
// What this pilot exercises (review of C2): it goes through the lift peak and the first part of the break, no further.
// It recovers when CL is 1 % under its peak, so α stays about 2.7–2.9° under the blend centre AC.aStall and the stall
// blend fraction `a.stall` reaches only about 0.11–0.12 (measured on the nine rows of types.test.mjs; `stallMax_frac` and
// `alphaMax_deg` below return them). The post-stall part of the model (the post-stall drag and the −0.25·σ·(α − α₀) pitch
// term in src/20-flight.js) is therefore NOT exercised by this robot, and its pins do not cover it; types.test.mjs asserts
// that the entry reached the lift peak and the break (α at the peak against `simCLmax`, CL under 0.99 of its peak, the
// blend fraction above 0.05). A pilot that holds the pull until α passes AC.aStall is plan F6's and G4's to add.
// The result is a regression value for today's Beard–McLain stall (blend M 55, no wing drop, no engine or propeller
// effects), not a measurement of the type: the research expectation is a class value, h = c·VS1², c 0.0426–0.0819
// ft/kt², from POH figures of three other trainers. Plans F6 and G4 re-baseline this pilot and its expected values.
// The recovery of PR #1 (branch claude/youthful-darwin-30uzwx,
// test/stall.test.mjs `stallRun` mode 'prompt': release at the break, wings level, α hold at α_stall − 7° with an
// integrator, height loss from the break to the first climb) is the model for the pull-out loop; here the entry is the
// research's 1 kt/s one.
import { startTrimmed, simCLmax } from '../../docs/research/02-light-aircraft/scripts/lm_card.mjs';

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const DT = 1 / 240;

export function stallRecovery(M, { flaps = 0, gear = 1, h = 3000 * 0.3048, alphaBackoffDeg = null, startFactor = 1.35, rate = 1.0 } = {}) {
  const { AC, DEG, RAD, KT, G0, FT } = M;
  const cl1 = simCLmax(AC, flaps).CL, rho0 = 1.225;
  const ias0 = Math.round(startFactor * Math.sqrt(2 * AC.m * G0 / (rho0 * AC.S * cl1)) / KT);
  const { ac, T } = startTrimmed(M, { ias: ias0, h, flaps, gear, gammaDeg: 0 }), a = ac.air;
  const t0 = ac.t, i0 = a.ias / KT;
  let thC = a.theta, deI = T.de, clMax = 0, aPeak = 0, vPeak = 0, nzPeak = 0;
  const aWarn = (AC.aWarn + AC.aWarnFlap * flaps) * DEG - AC.aWarnHyst * DEG;
  const alphaRec = () => (alphaBackoffDeg == null ? aWarn : aPeak - alphaBackoffDeg * DEG);
  let stallMax = 0, aMax = 0, clBreak = null;
  let phase = 'entry', tBreak = null, hBreak = null, vBreak = null, aI = 0, hMin = Infinity, tMin = null, maxPhi = 0, recovered = false;
  ac.cmd.thr = 0;
  for (let i = 0; i < 240 * 160; i++) {
    const wingsLevel = () => { ac.cmd.da = clamp(1.25 * (0 - a.phi) - 0.28 * a.p, -AC.daMax, AC.daMax); ac.cmd.dr = clamp(-1.6 * a.beta, -AC.drMax, AC.drMax); };
    aMax = Math.max(aMax, a.alpha);
    if (phase === 'entry') {
      const tgt = i0 - (ac.t - t0) * rate, err = a.ias / KT - tgt;
      thC += (0.25 * DEG * err + 0.6 * DEG * rate) * DT;
      const e = thC - a.theta; deI = clamp(deI - 0.6 * e * DT, -AC.deUp, AC.deDn);
      ac.cmd.de = clamp(deI - 2.0 * e + 0.85 * a.q, -AC.deUp, AC.deDn);
      wingsLevel();
      if (a.CL > clMax) { clMax = a.CL; aPeak = a.alpha; vPeak = a.ias / KT; nzPeak = a.CL * a.qbar * AC.S / (AC.m * G0); }
      if (clMax > 0 && a.CL < 0.99 * clMax && a.alpha > aPeak) {
        phase = 'recover'; clBreak = a.CL; tBreak = ac.t; hBreak = a.h; vBreak = a.ias / KT; aI = ac.de; ac.cmd.thr = 1;
      } else if (ac.t - t0 > 100 || a.alpha > 30 * DEG) break;
    } else {
      // reduce α to aRec, full power (set at the break), wings level
      const aRec = alphaRec(), e = a.alpha - aRec;
      aI = clamp(aI + 1.5 * e * DT, -AC.deUp, AC.deDn);
      ac.cmd.de = clamp(aI + 1.2 * e + 0.6 * a.q, -AC.deUp, AC.deDn);
      wingsLevel();
      stallMax = Math.max(stallMax, a.stall);
      if (a.h < hMin) { hMin = a.h; tMin = ac.t - tBreak; }
      maxPhi = Math.max(maxPhi, Math.abs(a.phi));
      if (ac.t - tBreak > 1 && a.vs >= 0 && a.stall < 0.05) { recovered = true; break; }
      if (ac.t - tBreak > 60) break;
    }
    ac.step(DT);
  }
  const loss = recovered ? hBreak - hMin : null;
  return {
    recovered, loss_m: loss, loss_ft: loss == null ? null : loss / FT, t_recover_s: recovered ? tMin : null,
    alphaPeak_deg: aPeak * RAD, alphaMax_deg: aMax * RAD, stallMax_frac: stallMax, CLbreak: clBreak, alphaRec_deg: alphaRec() * RAD, V_CLmax_eas: vPeak, nz_CLmax: nzPeak,
    V_break_eas: vBreak, VSR_eas: vPeak / Math.sqrt(nzPeak), CLmax: clMax, maxPhi_deg: maxPhi * RAD, thrAtBreak: 1, ias0,
  };
}
