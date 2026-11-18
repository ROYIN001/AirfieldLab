// Section 6 (controls): measurements of the CURRENT AirfieldLab model
import { M } from 'test/harness.mjs';
const { Flight, Aircraft, AC, KT, FT, DEG, RAD, G0, SCENARIOS, atmosphere, FIELD } = M;
const out = {};
// 1) trim elevator from setApproach at several speeds / configs (ISA+? uses Flight default oatC 31)
for (const [ias, flaps] of [[95, 1], [88, 1], [110, 0], [130, 0], [160, 0]]) {
  const ac = new Aircraft(); ac.isaDev = 31 - (15 - 0.0065 * FIELD.elev);
  const tr = ac.setApproach({ ias, flaps, dist: 8000 });
  out[`trim_${ias}kt_f${flaps}`] = { de_deg: +(tr.de * RAD).toFixed(2), alpha_deg: +(tr.alpha * RAD).toFixed(2), thr: +tr.thr.toFixed(3) };
}
// 2) elevator per g (quasi-steady pull-up, constant speed) from AC derivatives
function dePerG(ias) {
  const atm = atmosphere(FIELD.elev + 300, 0); const V = ias * KT; // ISA, near sea level, IAS~TAS
  const qb = 0.5 * atm.rho * V * V, W = AC.m * G0;
  const dCL = W / (qb * AC.S);             // per g
  const qh = (G0 / V) * AC.c / (2 * V);    // q-hat per g
  // CLa*da + CLde*dde = dCL - CLq*qh ; Cma*da + Cmde*dde = -Cmq*qh
  const a11 = AC.CLa, a12 = AC.CLde, b1 = dCL - AC.CLq * qh, a21 = AC.Cma, a22 = AC.Cmde, b2 = -AC.Cmq * qh;
  const det = a11 * a22 - a12 * a21;
  const da = (b1 * a22 - a12 * b2) / det, dde = (a11 * b2 - a21 * b1) / det;
  return { ias, dAlpha_deg_per_g: +(da * RAD).toFixed(2), dDe_deg_per_g: +(dde * RAD).toFixed(2), stickY_per_g_DIRECT: +(-dde / AC.deUp).toFixed(3), n_per_alpha_g_per_rad: +(qb * AC.S * AC.CLa / W).toFixed(2) };
}
out.dePerG = [80, 95, 120, 160].map(dePerG);
// 3) ASSIST: full stick = 7 deg/s pitch-rate command -> incremental n at speed
out.assist_full_stick_dn = [80, 95, 120].map((v) => ({ ias: v, dn: +((v * KT) * 7 * DEG / G0).toFixed(2) }));
console.log(JSON.stringify(out, null, 1));
