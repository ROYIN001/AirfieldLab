// Section 5: what the current AirfieldLab engine model does (no turbofan exists; measure the generic thrust path)
import { M } from 'test/harness.mjs';
const { Aircraft, AC, KT, FT, atmosphere } = M;
const out = {};
function thrustAt(hft, kt, thr, isaDev = 0) {
  const ac = new Aircraft(); ac.isaDev = isaDev; const s = ac.x; s.fill(0); s[2] = -hft * FT; s[3] = kt * KT; s[6] = 1; ac.thr = thr; ac.gearPos = 0;
  const d = new Float64Array(13), diag = { wow: [], load: [] }; ac.deriv(s, d, diag); return diag.T;
}
out.T_full = { SL_0kt: thrustAt(0, 0, 1), SL_95kt: thrustAt(0, 95, 1), ft10000_95kt: thrustAt(10000, 95, 1), SL_0kt_ISA20: thrustAt(0, 0, 1, 20) };
out.lapse_ratio_10000ft = +(out.T_full.ft10000_95kt / out.T_full.SL_95kt).toFixed(3);
out.T_idle = { SL_0kt: +thrustAt(0, 0, AC.idle).toFixed(0), SL_95kt: +thrustAt(0, 95, AC.idle).toFixed(0), idleFrac_of_static: AC.idle };
// can the command go below idle (reverse)? actuators clamp to [AC.idle, 1]
{ const ac = new Aircraft(); ac.thr = 0.5; ac.cmd.thr = -1; for (let i = 0; i < 2400; i++) ac.actuators(1 / 240); out.thr_after_neg_cmd = +ac.thr.toFixed(4); }
// relative density at VTBD ISA+20 (what a sigma-based lapse would remove)
out.sigma_ISA20_SL = +(atmosphere(0, 20).rho / atmosphere(0, 0).rho).toFixed(4);
console.log(JSON.stringify(out, null, 1));
