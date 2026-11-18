// Sweep the CURRENT AirfieldLab model coefficients over alpha -180..180 and beta, using deriv() diag
import { M } from 'test/harness.mjs';
const { Aircraft, AC, DEG, RAD, KT, G0, atmosphere, FIELD } = M;
const ac = new Aircraft();
// state: level attitude, airflow set by body-frame velocity so alpha/beta are exact; h = 1000 m (no ground effect); no rotation
function coeffs(aDeg, bDeg, flaps = 0, gear = 1, w = [0,0,0], de = 0) {
  ac.flaps = flaps; ac.gearPos = gear; ac.de = de; ac.da = 0; ac.dr = 0; ac.thr = 0; ac.adot = 0;
  const V = 40, a = aDeg*DEG, b = bDeg*DEG;
  const u = V*Math.cos(a)*Math.cos(b), v = V*Math.sin(b), ww = V*Math.sin(a)*Math.cos(b);
  // identity attitude -> body = NED
  ac.x.set([0,0,-1000, u, v, ww, 1,0,0,0, w[0], w[1], w[2]]);
  const d = { wow:[0,0,0], load:[0,0,0] }; const out = new Float64Array(13);
  ac.deriv(ac.x, out, d);
  // recover body moments from angular accelerations: M = I*wdot + w x Iw (w=0 => M = I*wdot)
  const qS = d.qbar*AC.S;
  const Lm = AC.Ixx*out[10] - AC.Ixz*out[12], Mm = AC.Iyy*out[11], Nm = AC.Izz*out[12] - AC.Ixz*out[10];
  // body forces = m*acc (identity attitude, subtract gravity)
  const Fx = AC.m*out[3], Fy = AC.m*out[4], Fz = AC.m*(out[5]-G0);
  return { alpha: d.alpha*RAD, beta: d.beta*RAD, CL: d.CL, sig: d.sig, CX: Fx/qS, CY: Fy/qS, CZ: Fz/qS,
    Cl: Lm/(qS*AC.b), Cm: Mm/(qS*AC.c), Cn: Nm/(qS*AC.b), CD: d.D/qS };
}
const f2 = (v) => (v>=0?' ':'') + v.toFixed(3);
console.log('alpha sweep, beta 0, flaps 0, gear down');
console.log('  a     CL     CD     Cm    sig    CN');
for (const a of [-180,-170,-150,-120,-90,-60,-40,-30,-20,-15,-10,0,10,12,14,16,18,20,25,30,40,45,60,90,120,150,170,179,-179]) {
  const c = coeffs(a,0,0,1);
  const CN = -c.CZ;
  console.log(String(a).padStart(5), f2(c.CL), f2(c.CD), f2(c.Cm), c.sig.toFixed(2), f2(CN));
}
console.log('\nCm jump at +-180: ', coeffs(179.9,0).Cm.toFixed(3), coeffs(-179.9,0).Cm.toFixed(3));
console.log('\nbeta sweep, alpha 5, flaps 0');
console.log('  b     CY     Cl     Cn     CD');
for (const b of [0,5,10,20,30,45,60,80,89]) { const c = coeffs(5,b); console.log(String(b).padStart(4), f2(c.CY), f2(c.Cl), f2(c.Cn), f2(c.CD)); }
// roll damping vs alpha: Clp effective
console.log('\neffective Clp (per p*b/2V) vs alpha (flaps 0): pb/2V = 0.05');
for (const a of [0,10,14,16,18,20,25,30,40]) {
  const V = 40, pb = 0.05, p = pb*2*V/AC.b;
  const c1 = coeffs(a,0,0,1,[p,0,0]), c0 = coeffs(a,0,0,1,[0,0,0]);
  console.log(String(a).padStart(3), ((c1.Cl-c0.Cl)/pb).toFixed(3));
}
