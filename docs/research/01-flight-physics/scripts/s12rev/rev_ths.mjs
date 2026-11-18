// rev_ths.mjs - expected values for T-S-13 (THS trim) and T-S-08 (tab trim as rest position), formula of sec 12.9
const DEG = Math.PI / 180, up = 22, dn = 15;               // AC.deUp, AC.deDn (deg)
const tab = (dt, s) => (s >= 0 ? dt + s * (dn - dt) : dt + s * (dt + up));   // delta_min = -22
for (const dt of [-5, 5]) console.log('tab trim', dt, 'push', tab(dt, 1), 'pull', tab(dt, -1), 'release', tab(dt, 0));
const Cmih = -2.0;                                           // placeholder test value (1/rad), not an aircraft value
console.log('THS dCm for dih=-1deg, Cmih=-2.0/rad:', (Cmih * -1 * DEG).toFixed(9));
console.log('cpu share at 20 us/step, 240 Hz:', (20e-6 * 240 * 100).toFixed(2), '%');
