// z_testvals.mjs — AirfieldLab round 3, topic 3.8 (prefix Z): expected values for test cases that come from
// equations (not from the closed-loop prototype z_fbw_proto.mjs). Every number printed here is quoted in
// 08-fbw-laws.md. Run: node z_testvals.mjs   (Node >= 18, no dependencies).
const G = 9.80665, DEG = Math.PI / 180, RAD = 180 / Math.PI, KT = 0.514444, FT = 0.3048, LBF = 4.448222;
const f = (v, d = 3) => Number(v).toFixed(d);
const out = (k, ...v) => console.log(k.padEnd(34), ...v);

console.log('# unit conversions');
out('VMO 350 kt', f(350 * KT, 2), 'm/s'); out('VMO+6 = 356 kt', f(356 * KT, 2), 'm/s');
out('VMO+16 = 366 kt', f(366 * KT, 2), 'm/s'); out('6 kt / 15 kt / 16 kt offsets', f(6 * KT, 3), f(15 * KT, 3), f(16 * KT, 3), 'm/s'); out('5-10 kt above VSW', f(5 * KT, 2), f(10 * KT, 2), 'm/s');
out('C* Vco 400 ft/s', f(400 * FT, 2), 'm/s =', f(400 * FT / KT, 1), 'kt');
out('FBW A32NX Vm 100 m/s', f(100 / KT, 1), 'kt');
out('15 deg/s', f(15 * DEG, 4), 'rad/s'); out('50 ft / 30 ft / 100 ft', f(50 * FT, 2), f(30 * FT, 3), f(100 * FT, 2), 'm');

console.log('\n# sidestick (PPRuNe copy of an Airbus publication [Z27]; KNKT [Z1])');
const bo = 1.1 * LBF, fp = 22.5 * LBF, fro = 5.6 * LBF, fri = 7.8 * LBF;
out('breakout 1.1 lbf', f(bo, 2), 'N'); out('pitch 22.5 lbf @16 deg', f(fp, 1), 'N');
out('roll out 5.6 lbf / in 7.8 lbf @20', f(fro, 1), f(fri, 1), 'N');
out('gradient pitch', f((fp - bo) / 16, 3), 'N/deg'); out('gradient roll out/in', f((fro - bo) / 20, 3), f((fri - bo) / 20, 3), 'N/deg');
out('AP override 5 daN / 3.5 daN', 50, 35, 'N  (KNKT: AP engaged, solenoid detent)');
out('dual input 2 deg of 16 / 20', f(2 / 16, 4), f(2 / 20, 4), 'stick fraction');

console.log('\n# load factor and bank');
for (const p of [30, 33, 45, 67]) out(`level-turn nz at ${p} deg`, f(1 / Math.cos(p * DEG), 4), 'g');
out('max bank for level flight @2.5 g', f(Math.acos(1 / 2.5) * RAD, 2), 'deg');
out('max bank for level flight @2.0 g', f(Math.acos(1 / 2.0) * RAD, 2), 'deg');
const V = 133.5 * KT; out('turn rate 33 deg @133.5 kt', f(G * Math.tan(33 * DEG) / V * RAD, 3), 'deg/s');
out('stick->dnz clean +1/+0.5/-1', 1.5, 0.75, -2.0, 'g (from 1 g)'); out('stick->dnz FULL +1/-1', 1.0, -1.0, 'g');

console.log('\n# alpha / speed relations');
const r = (100 / 107) ** 2; out('CL(amax)/CLmax from D-AXLA', f(r, 4), '(VS1g = 123/1.23 = 100 kt, Vamax = 107 kt)');
out('Vamax/VS1g', f(107 / 100, 3)); out('if VLS = 1.28 VS1g', f((123 / 1.28 / 107) ** 2, 4), 'ratio; Vamax/VS1g', f(107 / (123 / 1.28), 3));
out('Habsheim amax-aprot, afloor-aprot', 17.5 - 14.5, 15 - 14.5, 'deg');
out('US1549 margin 17.5-13.5 / 17.5-14', 17.5 - 13.5, 17.5 - 14, 'deg');
out('ALT stall warning 1.03 VS1g -> CL ratio', f(1 / 1.03 ** 2, 4));
out('AF447 cruise: 1 deg AoA ~ 25 kt; 1.5 deg', 25 * 1.5, 'kt');

console.log('\n# flare (Habsheim [Z8], FBW code [Z19])');
for (const m of [2.5, 5, -1]) out(`theta memo ${m}: rate, t to -2`, f((Math.max(-2, m) + 2) / 8, 4), 'deg/s', f(m > -2 ? 8 : 0, 1), 's');
out('blend w at 40 ft (50->30 ft)', f((50 - 40) / 20, 2));
const sink = 133.5 * KT * Math.sin(3 * DEG); out('sink 3 deg @133.5 kt', f(sink, 3), 'm/s =', f(sink / FT * 60, 0), 'fpm');
out('time 50 ft -> 0 at that sink', f(50 * FT / sink, 2), 's'); out('time 30 ft -> 0', f(30 * FT / sink, 2), 's');

console.log('\n# roll law');
out('bank return at 50 deg (lim 67)', f(15 * (50 - 33) / (67 - 33), 3), 'deg/s');
out('bank return at 40 deg (lim 45)', f(15 * (40 - 33) / (45 - 33), 3), 'deg/s');
out('HSP return at 20 deg (lim 40)', f(15 * 20 / 40, 3), 'deg/s');
out('time 0->33 deg at 15 deg/s', f(33 / 15, 2), 's'); out('time 0->67 (ideal, ramp-down)', 'see z_fbw_proto');
const rho300 = 1.225 * Math.pow(1 - 2.25577e-5 * 300, 4.2559), qb = 0.5 * rho300 * V * V;
const Lp = qb * 122.6 * 34.1 * 34.1 * -0.509 / (2 * V * 1.749e6), Lu = qb * 122.6 * 34.1 * 0.05 / 1.749e6;
const wn = 2, z = 0.8; out('Lp, Lu @133.5 kt 300 m', f(Lp, 3), f(Lu, 3));
out('Kphi, Kp, Ki (pole placement)', f(wn * wn / Lu, 2), f((2 * z * wn + Lp) / Lu, 2), f(0.5 * wn * wn / Lu, 2));
out('steady p for full u', f(-Lu / Lp * RAD, 1), 'deg/s (open-loop authority, ClRollMax 0.05)');

console.log('\n# HSP (estimate law)');
for (const v of [350, 356, 361, 366, 370]) out(`Vpred ${v}: dnz_hsp, ND authority`, f(Math.min(0.75, Math.max(0, 0.075 * (v - 356))), 3), f(Math.min(1, Math.max(0, (366 - v) / 10)), 2));

console.log('\n# input shaping interaction (round 1 topic 11)');
const expo = (x, e) => (1 - e) * x + e * x ** 3;
for (const e of [0.3, 0.5]) out(`expo ${e}: x=0.5 -> out, dnz clean`, f(expo(0.5, e), 4), f(1.5 * expo(0.5, e), 4), 'g');
out('keyboard ramp 0.5/s: t to full', f(1 / 0.5, 1), 's ; centring 2.5/s:', f(1 / 2.5, 2), 's');
out('240 Hz step', f(1000 / 240, 3), 'ms ; 0.10 s budget =', f(0.10 * 240, 0), 'steps');
