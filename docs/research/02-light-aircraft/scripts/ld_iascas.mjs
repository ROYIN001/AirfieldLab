#!/usr/bin/env node
// ld_iascas.mjs — ESTIMATED KIAS -> KCAS tables for the DA40 family (05-da40.md §05.3). Node >= 18, no dependencies.
// The AFM airspeed-calibration charts (AFM §5.3.1) are images we could not read, so the tables here are ค่าประมาณ:
//  classic DA40 / DA40 D (same airframe and pitot):  stall in a 60° bank happens at a speed where the position error is
//    assumed small (KIAS ≈ KCAS at ~76–83 kt), so KCAS(0°) = KIAS(60°)/√2; the other bank angles give more points
//    KCAS(φ) = KCAS(0°)/√cosφ paired with the AFM's KIAS(φ). Cross-check: VREF = 1.3 VS (CAS) with the handout VREF.
//  DA40 NG: Diamond's spec page gives the landing-configuration stall at MTOM as 58 KCAS [LD4]; the checklist gives
//    60 KIAS [LD3]; UP and T/O offsets from VREF/1.3 (CS-23 / 14 CFR 23.73 minimum) against the checklist stall speeds.
//   node scripts/ld_iascas.mjs [--json]   -> writes scripts/out/ld_iascas.json
import fs from 'node:fs';
const OUT = new URL('./out/ld_iascas.json', import.meta.url);
const BANK = [0, 30, 45, 60], s = BANK.map(p => 1 / Math.sqrt(Math.cos(p * Math.PI / 180)));
// AFM DA40 (IO-360) §5.3.4 p.5-8, KIAS, rows read from the page text [LD6]; 1150 kg row matches the DA40 D handout [LD8]
const STALL_CLASSIC = {
  1150: { UP: [52, 57, 66, 79], 'T/O': [51, 55, 64, 78], LDG: [49, 55, 62, 76] },
  1200: { UP: [53, 58, 68, 83], 'T/O': [52, 57, 67, 81], LDG: [52, 57, 66, 80] },
};
const VMAX = { UP: 178, 'T/O': 108, LDG: 91 };   // VNE / VFE KIAS [LD1] p.6: identity assumed at high speed
const VREF_CLASSIC_1150 = { UP: 73, LDG: 71 };   // KIAS, DA40 D handout [LD8]
// DA40 NG checklist [LD3]: stall KIAS at 1310 kg, approach (VREF) KIAS at 1280 kg; Diamond spec page 58 KCAS LDG @ MTOM [LD4]
const NG = { stall1310: { UP: 66, 'T/O': 62, LDG: 60 }, vref1280: { UP: 83, 'T/O': 78, LDG: 77 }, webLDG_kcas: 58 };

const out = { classic: {}, ng: {} };
for (const det of ['UP', 'T/O', 'LDG']) {
  const pts = [];
  for (const m of [1150, 1200]) {
    const r = STALL_CLASSIC[m][det], v0 = r[3] / s[3];
    BANK.forEach((p, i) => pts.push([r[i], +(v0 * s[i]).toFixed(1), m, p]));
  }
  // average KCAS per KIAS (duplicates), sort
  const byK = {};
  for (const [ki, kc] of pts) (byK[ki] ??= []).push(kc);
  const table = Object.keys(byK).map(Number).sort((a, b) => a - b).map(k => [k, +(byK[k].reduce((a, b) => a + b, 0) / byK[k].length).toFixed(1)]);
  const vs0_1150 = STALL_CLASSIC[1150][det][3] / s[3];
  const r1150 = STALL_CLASSIC[1150][det], v1150 = r1150[3] / s[3];
  const table1150 = [...BANK.map((p, i) => [r1150[i], +(v1150 * s[i]).toFixed(1)]), [VMAX[det], VMAX[det]]];
  out.classic[det] = { points: pts, table, table1150, VS_kcas_1150: +vs0_1150.toFixed(1), VS_kias_1150: STALL_CLASSIC[1150][det][0],
    offset_at_stall_1150: +(STALL_CLASSIC[1150][det][0] - vs0_1150).toFixed(1),
    vref_check: VREF_CLASSIC_1150[det] ? +(VREF_CLASSIC_1150[det] / 1.3).toFixed(1) : null };
}
const r = Math.sqrt(1280 / 1310);
for (const det of ['UP', 'T/O', 'LDG']) {
  const vsK1280 = NG.stall1310[det] * r, vsC_vref = NG.vref1280[det] / 1.3;
  const offVref = vsC_vref - vsK1280;
  const offWeb = det === 'LDG' ? NG.webLDG_kcas - NG.stall1310.LDG : null;
  const off = offWeb ?? offVref;
  const VSk = NG.stall1310[det], vmax = { UP: 172, 'T/O': 110, LDG: 98 }[det];
  const tableNG = [[VSk - 6, +(VSk - 6 + off).toFixed(1)], [VSk, +(VSk + off).toFixed(1)], [Math.round(1.5 * VSk), Math.round(1.5 * VSk)], [vmax, vmax]];
  out.ng[det] = { table: tableNG, VS_kias_1310: NG.stall1310[det], VS_kias_1280: +vsK1280.toFixed(1), VS_kcas_from_vref_1280: +vsC_vref.toFixed(1), offset_vref: +offVref.toFixed(1), offset_web: offWeb, offset_used: +off.toFixed(1) };
}
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
if (process.argv.includes('--json')) console.log(JSON.stringify(out, null, 1));
else {
  for (const d of Object.keys(out.classic)) { const c = out.classic[d]; console.log(`classic ${d}: VS(1150) ${c.VS_kias_1150} KIAS -> ${c.VS_kcas_1150} KCAS (offset ${c.offset_at_stall_1150}); VREF/1.3 check ${c.vref_check}; table(1150) ${JSON.stringify(c.table1150)}`); }
  for (const d of Object.keys(out.ng)) { const n = out.ng[d]; console.log(`NG ${d}: VS 1310 ${n.VS_kias_1310} KIAS; 1280 ${n.VS_kias_1280} KIAS; VREF/1.3 ${n.VS_kcas_from_vref_1280} KCAS; offset vref ${n.offset_vref} web ${n.offset_web} used ${n.offset_used}; table ${JSON.stringify(n.table)}`); }
}
