#!/usr/bin/env node
// lm_inertia.mjs — moments of inertia from nondimensional radii of gyration (Roskam definition, schema-ext-r2 §5):
//   Ixx = m (b·Rx/2)²,  Iyy = m (L·Ry/2)²,  Izz = m (((b+L)/2)·Rz/2)²       (m kg, b span m, L overall length m)
// The class table RADII is DERIVED here from reference aircraft with published inertias (REF below, each cited in
// 01-methods.md §01.4), class value = mean of the members; spread = min/max. Leave-one-out validation is printed.
//   node scripts/lm_inertia.mjs                 -> radii of every reference aircraft, class table, leave-one-out errors
//   node scripts/lm_inertia.mjs <typeId> [--class single_prop|twin_prop|trainer_turboprop] [--mass kg]
//                                               -> inertia of a merged type (airframe.weights/geometry/wing)
//   node scripts/lm_inertia.mjs --json          -> machine output (used for common_light.methods.radii)
import path from 'node:path';
import { HERE, loadType, val, isMainModule, trainingMassKg } from './lm_lib.mjs';

const SLUGFT2 = 1.3558179483, LB = 0.45359237, FT = 0.3048;
// reference aircraft: m kg, I kg m2, b m, L m (overall length), src code in 01-methods.md
export const REF = [
  { id: 'c172class_tm80163', cls: 'single_prop', m: 837.93, Ixx: 1395, Iyy: 1480, Izz: 2563, Ixz: 123, b: 11.0, L: 8.2, src: ['LM5'], note: 'วัด/ใช้ในการบินทดสอบของ NASA (Table I) Iyy อ่านจาก OCR "lk80" จึงไม่แน่นอน L = ความยาวลำตัวตามตาราง' },
  { id: 'navion_rd716', cls: 'single_prop', m: 2948 * LB, Ixx: 1284 * SLUGFT2, Iyy: 2773 * SLUGFT2, Izz: 3235 * SLUGFT2, Ixz: 0, b: Math.sqrt(6.04 * 184) * FT, L: 27.5 * FT, src: ['LM6', 'LM7'], note: 'b = √(AR·S); L 27 ft 6 in จากข้อมูลจำเพาะทั่วไป (ค่าประมาณ)' },
  // JSBSim 1.3.3 bundled models: TOTAL inertia and weight the model flies with at its default loading
  // (structure + point masses + fuel), measured by scripts/lm_jsb_inertia.py -> out/lm_jsb_inertia.json. Model values, not measurements.
  { id: 'c172x_jsbsim', cls: 'single_prop', m: 2480 * LB, Ixx: 2095.73 * SLUGFT2, Iyy: 1505.01 * SLUGFT2, Izz: 3150.44 * SLUGFT2, Ixz: 13.55 * SLUGFT2, b: 36.0 * FT, L: 8.28, src: ['LM8'], note: 'โมเดล JSBSim c172x ที่ 2480 lb (ค่าในโมเดล ไม่ใช่ค่าวัด) L 27 ft 2 in' },
  { id: 'pa28_jsbsim', cls: 'single_prop', m: 1980 * LB, Ixx: 1073.26 * SLUGFT2, Iyy: 1250.75 * SLUGFT2, Izz: 2317.0 * SLUGFT2, Ixz: 0, b: 30 * FT, L: 7.25, src: ['LM8'], note: 'โมเดล JSBSim pa28 ที่ 1980 lb (ค่าในโมเดล)' },
  { id: 'c310_jsbsim', cls: 'twin_prop', m: 4350 * LB, Ixx: 13312.86 * SLUGFT2, Iyy: 2073.05 * SLUGFT2, Izz: 15454.35 * SLUGFT2, Ixz: 2.18 * SLUGFT2, b: 36.5 * FT, L: 8.23, src: ['LM8'], note: 'โมเดล JSBSim c310 ที่ 4350 lb (มีถังปลายปีก); Iyy/Ixx 0.16 ผิดปกติ จึงเป็นข้อมูลอ่อน' },
  { id: 'pc7_jsbsim', cls: 'trainer_turboprop', m: 4443.07 * LB, Ixx: 1932.45 * SLUGFT2, Iyy: 3038.07 * SLUGFT2, Izz: 4401.45 * SLUGFT2, Ixz: 0, b: 34.12 * FT, L: 9.78, src: ['LM8'], note: 'โมเดล JSBSim pc7 ที่ 4443 lb (inertia ไม่เพิ่มตามจุดมวล)' },
  { id: 't6_jsbsim', cls: 'trainer_turboprop', m: 6000 * LB, Ixx: 4781.8 * SLUGFT2, Iyy: 7634.16 * SLUGFT2, Izz: 10894.86 * SLUGFT2, Ixz: -997.41 * SLUGFT2, b: 33.4 * FT, L: 10.16, src: ['LM8'], note: 'โมเดล JSBSim t6texan2 ที่ 6000 lb' },
];

export function radiiOf({ m, Ixx, Iyy, Izz, b, L }) {
  return { Rx: 2 * Math.sqrt(Ixx / m) / b, Ry: 2 * Math.sqrt(Iyy / m) / L, Rz: 2 * Math.sqrt(Izz / m) / ((b + L) / 2) };
}
export function inertiaFromRadii({ m, b, L, Rx, Ry, Rz }) {
  return { Ixx: m * (b * Rx / 2) ** 2, Iyy: m * (L * Ry / 2) ** 2, Izz: m * ((b + L) / 2 * Rz / 2) ** 2 };
}
function classTable(refs) {
  const out = {};
  for (const r of refs) (out[r.cls] ??= []).push(radiiOf(r));
  const T = {};
  for (const [c, rs] of Object.entries(out)) {
    const k = n => rs.map(r => r[n]);
    const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
    T[c] = { Rx: +mean(k('Rx')).toFixed(3), Ry: +mean(k('Ry')).toFixed(3), Rz: +mean(k('Rz')).toFixed(3), n: rs.length,
      range: { Rx: [Math.min(...k('Rx')), Math.max(...k('Rx'))].map(x => +x.toFixed(3)), Ry: [Math.min(...k('Ry')), Math.max(...k('Ry'))].map(x => +x.toFixed(3)), Rz: [Math.min(...k('Rz')), Math.max(...k('Rz'))].map(x => +x.toFixed(3)) } };
  }
  return T;
}
export const RADII = classTable(REF);

/** leave-one-out: predict each reference aircraft from the mean of the others in its class */
export function leaveOneOut() {
  return REF.map(r => {
    const others = REF.filter(o => o.cls === r.cls && o.id !== r.id);
    if (!others.length) return { id: r.id, cls: r.cls, note: 'สมาชิกเดียวในคลาส' };
    const R = classTable(others)[r.cls], I = inertiaFromRadii({ ...r, ...R });
    return { id: r.id, cls: r.cls, err_pct: { Ixx: 100 * (I.Ixx / r.Ixx - 1), Iyy: 100 * (I.Iyy / r.Iyy - 1), Izz: 100 * (I.Izz / r.Izz - 1) } };
  });
}

const isMain = isMainModule(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
  const id = args.find((a, i) => !a.startsWith('--') && !['--class', '--mass'].includes(args[i - 1]));
  const f = (x, n = 3) => (+x).toFixed(n);
  if (args.includes('--json')) { console.log(JSON.stringify({ RADII, refs: REF.map(r => ({ id: r.id, cls: r.cls, ...Object.fromEntries(Object.entries(radiiOf(r)).map(([k, v]) => [k, +v.toFixed(3)])) })), loo: leaveOneOut() }, null, 1)); }
  else if (!id) {
    console.log('id                   class              m kg    b m    L m    Rx     Ry     Rz');
    for (const r of REF) { const R = radiiOf(r); console.log(`${r.id.padEnd(20)} ${r.cls.padEnd(18)} ${f(r.m, 0).padEnd(7)} ${f(r.b, 2).padEnd(6)} ${f(r.L, 2).padEnd(6)} ${f(R.Rx)}  ${f(R.Ry)}  ${f(R.Rz)}`); }
    console.log('\nclass table (mean of members):'); for (const [c, t] of Object.entries(RADII)) console.log(`${c.padEnd(18)} Rx ${t.Rx} ${JSON.stringify(t.range.Rx)}  Ry ${t.Ry} ${JSON.stringify(t.range.Ry)}  Rz ${t.Rz} ${JSON.stringify(t.range.Rz)}  n=${t.n}`);
    console.log('\nleave-one-out error (%):'); for (const r of leaveOneOut()) console.log(`${r.id.padEnd(20)} ${r.err_pct ? `Ixx ${f(r.err_pct.Ixx, 1)}  Iyy ${f(r.err_pct.Iyy, 1)}  Izz ${f(r.err_pct.Izz, 1)}` : r.note}`);
  } else {
    const card = loadType(id);
    // 19 Nov 2026 (gap 2, D3): training_mass may be a number or {kg, empty_kg, crew_kg, fuel_kg}; '+{kg:…}' used to give NaN
    const m = +(opt('--mass') ?? trainingMassKg(card) ?? val(card, 'airframe.weights.MTOW'));
    const b = val(card, 'airframe.wing.b') ?? val(card, 'aero.ref.b') ?? val(card, 'airframe.geometry.span'), L = val(card, 'airframe.geometry.length');
    const cls = opt('--class', null); const R = val(card, 'airframe.inertia.radii') ?? RADII[cls ?? 'single_prop'];
    if (!(m && b && L)) { console.error(`need mass, span and length (got m ${m}, b ${b}, L ${L})`); process.exit(1); }
    const I = inertiaFromRadii({ m, b, L, ...R });
    console.log(`${id}: m ${f(m, 0)} kg b ${b} m L ${L} m radii ${JSON.stringify({ Rx: R.Rx, Ry: R.Ry, Rz: R.Rz })} -> Ixx ${f(I.Ixx, 0)} Iyy ${f(I.Iyy, 0)} Izz ${f(I.Izz, 0)} kg m2 (ค่าประมาณ)`);
  }
}

/** T-LM tests: leave-one-out prediction of the NASA-measured C172-class aircraft from the single_prop class */
export function tests() {
  const r = leaveOneOut().find(x => x.id === 'c172class_tm80163');
  const R = radiiOf(REF[0]), I = inertiaFromRadii({ ...REF[0], ...R });
  return [
    { id: 'T-LM-13', what: 'radii round trip Ixx (TM-80163) kg m2', got: I.Ixx, exp: 1395, tol: 0.5 },
    { id: 'T-LM-13', what: 'single_prop LOO |err| max(Ixx,Iyy,Izz) %', got: Math.max(...Object.values(r.err_pct).map(Math.abs)), exp: 0, tol: 35 },
  ];
}
