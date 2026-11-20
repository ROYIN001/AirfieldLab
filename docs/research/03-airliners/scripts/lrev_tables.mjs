// Reviewer (หัวข้อ 3.3): compare every JSON speed table cell with NXSpeeds v0.8.0 (A320) or with sqrt(2mg/(rho S CLmax)) (A321)
import fs from 'fs';
const t = fs.readFileSync('03-a320-a321.md', 'utf8');
const blocks = [...t.matchAll(/```json\n([\s\S]*?)```/g)].map(m => JSON.parse(m[1]));
const get = (type, path) => { for (const b of blocks) { let o = b[type]; if (!o) continue; for (const k of path) o = o && o[k]; if (o) return o; } };
const idx = m => Math.ceil(((m > 80 ? 80 : m) - 40) / 5);
const T = { // NXSpeeds v0.8.0 (typos fixed as the report says)
  C0: [m=>124,m=>124+1.4*(m-40),m=>131+1.4*(m-45),m=>138+1.4*(m-50),m=>145+m-55,m=>150+1.2*(m-60),m=>155+1.2*(m-65),m=>161+m-70,m=>166+1.2*(m-75),m=>172],
  C1: [m=>102,m=>102+m-40,m=>107+m-45,m=>112+m-50,m=>117+1.2*(m-55),m=>123+.8*(m-60),m=>127+m-65,m=>132+m-70,m=>137+.8*(m-75),m=>141],
  C1F:[m=>93,m=>93+m-40,m=>98+m-45,m=>103+m-50,m=>108+.8*(m-55),m=>112+m-60,m=>117+.8*(m-65),m=>121+.8*(m-70),m=>125+m-75,m=>130],
  C2: [m=>91,m=>91+m-40,m=>96+m-45,m=>101+.8*(m-50),m=>105+m-55,m=>110+.8*(m-60),m=>114+m-65,m=>119+.6*(m-70),m=>122+.8*(m-75),m=>126],
  F:  [m=>84,m=>84+.8*(m-40),m=>88+m-45,m=>93+.8*(m-50),m=>97+.8*(m-55),m=>101+.8*(m-60),m=>105+.8*(m-65),m=>109+.8*(m-70),m=>113+.6*(m-75),m=>116],
  L0: [m=>159,m=>159+1.8*(m-40),m=>168+1.8*(m-45),m=>177+1.8*(m-50),m=>186+1.2*(m-55),m=>192+1.2*(m-60),m=>198+1.6*(m-65),m=>206+1.2*(m-70),m=>212+1.6*(m-75),m=>220],
  L1: [m=>125,m=>125+1.4*(m-40),m=>132+1.2*(m-45),m=>138+1.2*(m-50),m=>144+1.4*(m-55),m=>151+m-60,m=>156+1.2*(m-65),m=>162+1.4*(m-70),m=>169+.8*(m-75),m=>173],
  L1F:[m=>114,m=>114+1.4*(m-40),m=>121+1.2*(m-45),m=>127+1.2*(m-50),m=>133+m-55,m=>138+1.2*(m-60),m=>144+m-65,m=>149+m-70,m=>154+1.2*(m-75),m=>160],
  L2: [m=>110,m=>110+1.8*(m-40),m=>119+1.2*(m-45),m=>125+1.2*(m-50),m=>131+1.2*(m-55),m=>137+m-60,m=>142+.6*(m-65),m=>145+.8*(m-70),m=>149+m-75,m=>154],
  L3lo:[m=>117,m=>117+.4*(m-40),m=>119+1.2*(m-45),m=>125+1.2*(m-50),m=>131+1.2*(m-55),m=>137+m-60,m=>142+m-65,m=>147+m-70,m=>152+.8*(m-75),m=>156],
  L3hi:[m=>117,m=>117,m=>117+1.4*(m-45),m=>124+1.2*(m-50),m=>130+m-55,m=>135+1.2*(m-60),m=>141+m-65,m=>146+m-70,m=>151+m-75,m=>156],
  LFlo:[m=>116,m=>116,m=>116,m=>116+.8*(m-50),m=>120+m-55,m=>125+m-60,m=>130+m-65,m=>135+.8*(m-70),m=>139+.8*(m-75),m=>143],
  LFhi:[m=>116,m=>116,m=>116,m=>116+.6*(m-50),m=>119+m-55,m=>124+m-60,m=>129+m-65,m=>134+m-70,m=>139+.8*(m-75),m=>143],
  V2a:[m=>126,m=>126,m=>126,m=>126+.2*(m-50),m=>127+m-55,m=>132+m-60,m=>137+m-65,m=>142+m-70,m=>147+m-75,m=>151],
  V2b:[m=>126,m=>126,m=>126,m=>126,m=>126+.2*(m-55),m=>127+m-60,m=>132+m-65,m=>137+.8*(m-70),m=>141+m-75,m=>146],
  V2c:[m=>125,m=>125,m=>125,m=>125,m=>125,m=>125+.6*(m-60),m=>128+.8*(m-65),m=>132+m-70,m=>137+.8*(m-75),m=>141],
  Fs: [m=>131,m=>131,m=>131,m=>131+1.2*(m-50),m=>137+1.4*(m-55),m=>144+m-60,m=>149+1.2*(m-65),m=>155+m-70,m=>160+1.2*(m-75),m=>166],
  Ss: [m=>152,m=>152+1.8*(m-40),m=>161+1.6*(m-45),m=>169+1.8*(m-50),m=>178+1.6*(m-55),m=>186+1.4*(m-60),m=>193+1.4*(m-65),m=>200+1.4*(m-70),m=>207+1.4*(m-75),m=>214],
};
const ev = (k, m) => T[k][idx(m)](m);
let bad = 0, n = 0; const cmp = (lab, a, b) => { n++; if (Math.abs(a - b) > 0.51) { bad++; console.log('MISMATCH', lab, 'report', a, 'expected', +b.toFixed(2)); } };
const vs = get('a320ceo', ['speeds', 'VS1g']).v; vs.axes.mass_kg.forEach((mk, i) => ['C0', 'C1', 'C1F', 'C2', 'C2', 'F'].forEach((k, j) => cmp(`VS1g ${mk} ${vs.axes.flap[j]}`, vs.data[i][j], ev(k, mk / 1000))));
const vl = get('a320ceo', ['speeds', 'VLS']).v; vl.cg_below_25.axes.mass_kg.forEach((mk, i) => ['L0', 'L1', 'L1F', 'L2', 'L3lo', 'LFlo'].forEach((k, j) => cmp(`VLS<25 ${mk} ${j}`, vl.cg_below_25.data[i][j], ev(k, mk / 1000))));
vl.cg_25_and_above.axes.mass_kg.forEach((mk, i) => ['L3hi', 'LFhi'].forEach((k, j) => cmp(`VLS>=25 ${mk} ${j}`, vl.cg_25_and_above.data[i][j], ev(k, mk / 1000))));
const v2 = get('a320ceo', ['speeds', 'V2_kt']).v; v2.axes.mass_kg.forEach((mk, i) => ['V2a', 'V2b', 'V2c'].forEach((k, j) => cmp(`V2 ${mk} ${j}`, v2.data[i][j], ev(k, mk / 1000))));
const ms = get('a320ceo', ['speeds', 'manoeuvre_speeds']).v; ms.axes.mass_kg.forEach((mk, i) => { cmp(`F ${mk}`, ms.data.F[i], ev('Fs', mk / 1000)); cmp(`S ${mk}`, ms.data.S[i], ev('Ss', mk / 1000)); cmp(`GD ${mk}`, ms.data.GD[i], 2 * mk / 1000 + 85); });
// A321 tables from CLmax
const KT = 0.514444, VSf = (m, c) => Math.sqrt(2 * m * 9.80665 / (1.225 * 122.6 * c)) / KT;
for (const [type, full] of [['a321neo', 3.05], ['a321ceo', 2.85]]) {
  const t1 = get(type, ['speeds', 'VS1g']).v, cl = [1.316, 1.957, 2.36, 2.447, 2.447, full];
  t1.axes.mass_kg.forEach((mk, i) => cl.forEach((c, j) => cmp(`${type} VS1g ${mk} ${j}`, t1.data[i][j], VSf(mk, c))));
  const t2 = get(type, ['speeds', 'VLS']).v.all_cg; t2.axes.mass_kg.forEach((mk, i) => cmp(`${type} VLS ${mk}`, t2.data[i][0], 1.23 * VSf(mk, full)));
}
console.log('cells checked', n, 'mismatches', bad);
