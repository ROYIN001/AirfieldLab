// lb_compare.mjs - compare JSBSim 1.3.3 model measurements (scripts/out/lb_perf_<model>.json, lb_aero.json) with
// published figures of the real types, compute error % and a verdict, and write scripts/out/lb_compare.json.
// Run: node scripts/lb_compare.mjs   (Node >= 18, no dependencies). POH KIAS are converted to KCAS with the POH
// calibration table (C172P Fig 5-1) by linear interpolation; mph are converted with 1 mph = 0.868976 kt.
// Fix 2026-11-19 (gap 28): every C172-family stall speed is compared on the FORWARD-CG basis of POH Fig 5-3 (C172P
// 52/49/46 KCAS [LB9], C172R 52/47 KCAS [LE3]), the same basis as the 10-c172r card; the aft-CG / spec-page values
// (51/48/46, 51/47) are given in the note. Gap 14: FlightGear JSBSim models (fg_*) run with lb_perf.py are compared
// with the public figures used by the type cards of topics 05 (LD), 07 (LP) and 11 (LF); KIAS are converted with the
// card's own calibration table. Rows whose only reference is a card ESTIMATE get published = null (not judged).
import { readFileSync, writeFileSync } from 'node:fs';
const OUT = new URL('./out/', import.meta.url);
const rd = (f) => JSON.parse(readFileSync(new URL(f, OUT), 'utf8'));
export const MPH = 0.868976;
export const FG = ['fg_pc9m', 'fg_c152', 'fg_da40ng', 'fg_t6'];
export function interp(xs, ys, x) {
  if (x <= xs[0]) return ys[0] + (x - xs[0]) * (ys[1] - ys[0]) / (xs[1] - xs[0]);
  for (let i = 1; i < xs.length; i++) if (x <= xs[i]) return ys[i - 1] + (x - xs[i - 1]) * (ys[i] - ys[i - 1]) / (xs[i] - xs[i - 1]);
  const n = xs.length - 1; return ys[n] + (x - xs[n]) * (ys[n] - ys[n - 1]) / (xs[n] - xs[n - 1]);
}
// C172P POH (30 May 1980) Fig 5-1, normal static source [LB9]
export const CAL172P = {
  up: [[50, 60, 70, 80, 90, 100, 110, 120], [56, 62, 70, 79, 89, 98, 107, 117]],
  f10: [[40, 50, 60, 70, 80, 90, 100, 110], [49, 55, 62, 70, 79, 89, 98, 108]],
  f30: [[40, 50, 60, 70, 80, 85], [47, 53, 61, 70, 80, 84]],
};
export const kcas172p = (kias, cfg = 'up') => interp(CAL172P[cfg][0], CAL172P[cfg][1], kias);
export const pct = (model, ref) => 100 * (model - ref) / ref;
export const verdict = (e) => (Math.abs(e) <= 5 ? 'ตรง (≤5%)' : Math.abs(e) <= 15 ? 'ใกล้ (5–15%)' : 'ไม่ตรง (>15%)');
const r1 = (x, n = 1) => (x == null ? null : Math.round(x * 10 ** n) / 10 ** n);
// KTAS at a given brake power, interpolated between the measured cruise points at one altitude
function ktasAtHp(cruise, h, hp, modes = ['rpm']) {
  const pts = cruise.filter((c) => c.h_ft === h && modes.includes(c.mode) && c.hp != null).sort((a, b) => a.hp - b.hp);
  if (pts.length < 2) return null;
  return interp(pts.map((p) => p.hp), pts.map((p) => p.ktas), hp);
}
function rows() {
  const P = Object.fromEntries(['c172p', 'c172r', 'c172x', 'pa28', 'pc7', 't6texan2', ...FG].map((m) => [m, rd(`lb_perf_${m}.json`)]));
  const A = rd('lb_aero.json');
  const R = [];
  const add = (model, qty, unit, modelVal, refVal, src, note = '') => {
    const e = modelVal == null || refVal == null ? null : pct(modelVal, refVal);
    R.push({ model, qty, unit, model_value: r1(modelVal, unit === '-' ? 2 : 1), published: r1(refVal, unit === '-' ? 2 : 1), error_pct: r1(e, 1), verdict: e == null ? 'เทียบไม่ได้' : verdict(e), src, note });
  };
  // ---- c172p and c172x (both describe a 172P; c172x header: "Models a 1982 Cessna 172P") vs C172P POH, 2400 lb
  for (const m of ['c172p', 'c172x']) {
    const p = P[m];
    add(m, 'VS1 flaps up, power off', 'KCAS', p.stall['0'].vs_kcas, 52, 'LB9 Fig 5-3', 'POH CG หน้าสุด 52 KCAS (ฐานเดียวกับบัตร 10-c172r); CG หลังสุด 51 = หน้า spec [LB10]');
    add(m, 'VS flaps 10', 'KCAS', p.stall['10'].vs_kcas, 49, 'LB9 Fig 5-3', 'POH CG หน้าสุด 49; CG หลังสุด 48');
    add(m, 'VS0 flaps 30', 'KCAS', p.stall['30'].vs_kcas, 46, 'LB9 Fig 5-3, LB10', 'POH CG หน้าและหลังเท่ากัน 46');
    add(m, 'CLmax flaps up (static sweep)', '-', A[m]['0'].CLmax, null, 'lb_aero', 'model only');
    add(m, 'Vy SL', 'KCAS', p.climb.vy_kcas, kcas172p(76), 'LB9 Fig 5-5', 'POH 76 KIAS → 75.4 KCAS (Fig 5-1)');
    add(m, 'ROC max SL ISA', 'fpm', p.climb.roc_max_fpm, interp([0, 20], [745, 685], 15), 'LB9 Fig 5-5, LB10', 'POH 745 @0°C, 685 @20°C → 700 @15°C; spec page 700');
    add(m, 'best glide speed', 'KCAS', p.glide.best_kcas, kcas172p(65), 'LB9 Fig 3-1', 'POH 65 KIAS → 66.0 KCAS; model prop stopped');
    add(m, 'glide ratio (max)', '-', p.glide.best_ratio, null, '-', 'POH chart not machine-readable (ดู 03.8)');
    add(m, 'KTAS at 75% (120 hp), 8,000 ft', 'KTAS', ktasAtHp(p.cruise, 8000, 120), 120, 'LB10', 'model power from FGPiston power-hp');
    add(m, 'short-field ground roll, flaps 10, SL', 'ft', p.takeoff.ground_roll_ft, 890, 'LB10', `model lift-off ${p.takeoff.v_liftoff_kcas} KCAS`);
    add(m, 'short-field over 50 ft, flaps 10, SL', 'ft', p.takeoff.over50_ft, 1625, 'LB10', '');
    add(m, 'static full-throttle power', 'hp', p.static.hp, 160, 'LB10 (rating)', `${p.static.engine_rpm} rpm; rating 160 hp at 2700 rpm`);
  }
  // ---- c172r vs C172R spec page, 2450 lb
  { const p = P.c172r;
    add('c172r', 'VS1 flaps up, power off', 'KCAS', p.stall['0'].vs_kcas, 52, 'LE3 Fig 5-3', 'CG หน้าสุด 52 KCAS ตามบัตร 10-c172r; หน้า spec [LB11] 51 = CG หลังสุด');
    add('c172r', 'VS0 flaps 30', 'KCAS', p.stall['30'].vs_kcas, 47, 'LE3 Fig 5-3, LB11', 'CG หน้าและหลังเท่ากัน 47');
    add('c172r', 'ROC max SL ISA', 'fpm', p.climb.roc_max_fpm, 720, 'LB11', `model Vy ${p.climb.vy_kcas} KCAS`);
    add('c172r', 'KTAS at 80% (128 hp of 160), 8,000 ft', 'KTAS', ktasAtHp(p.cruise, 8000, 128), 122, 'LB11', 'model engine is 180 hp/2700 rpm, real 160 hp/2400 rpm');
    add('c172r', 'ground roll, SL', 'ft', p.takeoff.ground_roll_ft, 945, 'LB11', 'model flaps 10 short-field technique');
    add('c172r', 'over 50 ft, SL', 'ft', p.takeoff.over50_ft, 1685, 'LB11', '');
    add('c172r', 'static full-throttle power', 'hp', p.static.hp, 160, 'LB11 (rating)', `${p.static.engine_rpm} rpm; real rating 160 hp at 2400 rpm`); }
  // ---- pa28 vs PA-28-180 Owner's Handbook 1972/73, 2450 lb (mph converted; IAS taken as CAS where no table)
  { const p = P.pa28;
    add('pa28', 'VS flaps up, power off', 'KCAS', p.stall['0'].vs_kcas, 68 * MPH, 'LB13 p1, p24', `68 mph CAS; model limit: ${p.stall['0'].limit}`);
    add('pa28', 'VS0 flaps 40', 'KCAS', p.stall['40'].vs_kcas, 61 * MPH, 'LB13 p1, p24', `61 mph CAS; model limit: ${p.stall['40'].limit}`);
    add('pa28', 'Vy SL', 'kt', p.climb.vy_kcas, 85 * MPH, 'LB13 p1', '85 mph IAS ≈ CAS (ค่าประมาณ)');
    add('pa28', 'ROC max SL', 'fpm', p.climb.roc_max_fpm, 725, 'LB13 p1', '');
    add('pa28', 'best glide speed', 'kt', p.glide.best_kcas, 80 * MPH, 'LB13 sec IV p36', '80 mph IAS; model best at sweep edge');
    add('pa28', 'ground run, 25° flaps, SL', 'ft', p.takeoff.ground_roll_ft, 720, 'LB13 p1', 'model never lifted off (flaps 0, VR 60)');
    add('pa28', 'static full-throttle power', 'hp', p.static.hp, 180, 'LB13 sec II p5 (rating)', `${p.static.engine_rpm} rpm, constant-speed prop in model, fixed pitch on real type`); }
  // ---- pc7 vs public PC-7 data (Wikipedia/Jane's), 2,700 kg
  { const p = P.pc7; const c20 = (p.cruise || []).filter((c) => c.h_ft === 20000 && Math.abs(c.hdot_fpm) < 50).map((c) => c.ktas);
    add('pc7', 'VS0 flaps 30, gear down, power off', 'KCAS', p.stall['30'].vs_kcas, 64, 'LB14', `published 64 kt (IAS/CAS not stated); model limit: ${p.stall['30'].limit}`);
    add('pc7', 'ROC max SL', 'fpm', p.climb.roc_max_fpm, 2150, 'LB14', 'published weight not stated (likely aerobatic weight)');
    add('pc7', 'max level speed at 20,000 ft', 'KTAS', c20.length ? Math.max(...c20) : null, 222, 'LB14', c20.length ? '' : 'model could not hold 20,000 ft');
    add('pc7', 'static full-throttle power', 'hp', p.static.hp, 550, 'LB14 (rating)', ''); }
  // ---- t6texan2 vs T-6A fact sheets, model 6,000 lb (cannot load 6,500 lb)
  { const p = P.t6texan2; const c1 = (p.cruise || []).find((c) => c.h_ft === 1000);
    add('t6texan2', 'max level speed at 1,000 ft', 'KTAS', c1 ? c1.ktas : null, 270, 'LB16', 'Navy: 270 kt at 1,000 ft; USAF: 320 mph (278 kt), altitude not stated');
    add('t6texan2', 'VS1 flaps up, power off', 'KCAS', p.stall['0'].vs_kcas, null, '-', 'no public figure found');
    add('t6texan2', 'ROC max SL', 'fpm', p.climb.roc_max_fpm, 3100, 'LP23', 'climb rate ในคู่มือ ATC ของ Navy (ไม่ระบุน้ำหนักและความเร็ว; บัตร 07 conf ต่ำ); โมเดลเป็น jet thrust'); }
  // ---- FlightGear JSBSim models (gap 14), measured with lb_perf.py; references = the type cards' public figures
  { const p = P.fg_c152; const k0 = (kias) => interp([40, 50, 60, 70, 80, 90, 100], [46, 53, 60, 69, 78, 88, 97], kias);   // LF1 Fig 5-1 flaps 0
    add('fg_c152', 'VS1 flaps up, power off', 'KCAS', p.stall['0'].vs_kcas, 48, 'LF1 Fig 5-3', 'POH CG หน้าสุด 1,670 lb (CG หลังสุด 46)');
    add('fg_c152', 'VS flaps 10', 'KCAS', p.stall['10'].vs_kcas, 46, 'LF1 Fig 5-3', 'CG หน้าสุด (หลังสุด 43)');
    add('fg_c152', 'VS0 flaps 30', 'KCAS', p.stall['30'].vs_kcas, 43, 'LF1 Fig 5-3', 'CG หน้าสุด (หลังสุด 41)');
    add('fg_c152', 'Vy SL', 'KCAS', p.climb.vy_kcas, k0(67), 'LF1 Fig 5-5, Fig 5-1', `POH 67 KIAS → ${r1(k0(67))} KCAS; ใบพัดของโมเดลหมุนเกิน redline 2,550 rpm (${p.climb.points.find((x) => x.kcas === 95)?.rpm} rpm ที่ 95 KCAS)`);
    add('fg_c152', 'ROC max SL ISA', 'fpm', p.climb.roc_max_fpm, 715, 'LF1', '1,670 lb SL ISA');
    add('fg_c152', 'best glide speed', 'KCAS', p.glide.best_kcas, 60, 'LF1 p3-3', 'POH 60 KIAS ≈ 60 KCAS; ใบพัดของโมเดลหยุด 0 rpm');
    add('fg_c152', 'glide ratio (max)', '-', p.glide.best_ratio, 1.5 * 6076.12 / 1000, 'LF6', 'กฎหัวแม่มือ FAA 1.5 NM ต่อ 1,000 ft');
    add('fg_c152', 'KTAS at 75% (82.5 hp), 8,000 ft', 'KTAS', ktasAtHp(p.cruise, 8000, 82.5, ['rpm', 'full']), 107, 'LF1', 'interpolate ระหว่าง 2,500 rpm (54.5 hp) และคันเร่งสุด (100.6 hp) ของโมเดล');
    add('fg_c152', 'ground roll, flaps 10, SL', 'ft', p.takeoff.ground_roll_ft, 725, 'LF1', `model lift-off ${p.takeoff.v_liftoff_kcas} KCAS (VR 45 ของนักบินจำลองยกล้อไม่ขึ้นจนถึง ~61 KCAS)`);
    add('fg_c152', 'over 50 ft, flaps 10, SL', 'ft', p.takeoff.over50_ft, 1340, 'LF1', '');
    add('fg_c152', 'static full-throttle power', 'hp', p.static.hp, 110, 'LF2 (rating)', `${p.static.engine_rpm} rpm; rating 110 hp ที่ 2,550 rpm`); }
  { const p = P.fg_da40ng; const up = (kias) => interp([60, 66, 99, 172], [58.6, 64.6, 99, 172], kias);   // LD3/LD4 IAS→CAS flaps UP
    const cr16 = p.cruise.find((c) => c.h_ft === 16000 && c.mode === 'full'); const cr14 = p.cruise.find((c) => c.h_ft === 14000);
    add('fg_da40ng', 'VS1 flaps UP, 1,310 kg', 'KCAS', p.stall['0'].vs_kcas, up(66), 'LD3', `66 KIAS → 64.6 KCAS (ตาราง IAS→CAS ของบัตร 05); model limit: ${p.stall['0'].limit} ที่ α ${p.stall['0'].alpha_at_vs}°`);
    add('fg_da40ng', 'VS flaps T/O (model 15°)', 'KCAS', p.stall['15'].vs_kcas, interp([56, 62], [54.7, 60.7], 62), 'LD3', '62 KIAS → 60.7 KCAS');
    add('fg_da40ng', 'VS0 flaps LDG (model 30°)', 'KCAS', p.stall['30'].vs_kcas, interp([54, 60], [52, 58], 60), 'LD3', '60 KIAS → 58 KCAS');
    add('fg_da40ng', 'Vy SL', 'KCAS', p.climb.vy_kcas, up(72), 'LD3', `72 KIAS → ${r1(up(72))} KCAS (AFM ใช้แฟลป T/O; โมเดลวัดแฟลป 0)`);
    add('fg_da40ng', 'ROC max SL ISA', 'fpm', p.climb.roc_max_fpm, 651, 'LD4', 'MTOM ISA MSL (เว็บผู้ผลิต "approximate")');
    add('fg_da40ng', 'best glide speed', 'KCAS', p.glide.best_kcas, up(88), 'LD3', `88 KIAS → ${r1(up(88))} KCAS; ใบพัดของโมเดลหยุด 0 rpm`);
    add('fg_da40ng', 'glide ratio (max)', '-', p.glide.best_ratio, 9.7, 'LD3', 'ใบพัดหมุนฟรี มีครอบล้อ; มวลไม่ระบุ');
    add('fg_da40ng', 'KTAS full power, 16,000 ft', 'KTAS', cr16 ? cr16.ktas : null, 154, 'LD4', `อ้างอิง load 92 %; โมเดลคันเร่งสุดได้ ${cr16 ? cr16.hp : '–'} hp`);
    add('fg_da40ng', 'KTAS at 60% (100.8 hp), 14,000 ft', 'KTAS', cr14 ? cr14.ktas : null, 124, 'LD4', '');
    add('fg_da40ng', 'ground roll, flaps T/O, SL', 'ft', p.takeoff.ground_roll_ft, 1302, 'LD4', `model lift-off ${p.takeoff.v_liftoff_kcas} KCAS`);
    add('fg_da40ng', 'over 50 ft, flaps T/O, SL', 'ft', p.takeoff.over50_ft, 1935, 'LD4', '');
    add('fg_da40ng', 'static full-throttle power', 'hp', p.static.hp, 123.5 / 0.745699872, 'LD10, LD2 (rating)', `${p.static.prop_rpm} rpm ใบพัด; rating 123.5 kW ที่ 2,300 rpm`); }
  { const p = P.fg_pc9m; const c20 = p.cruise.find((c) => c.h_ft === 20000 && c.mode === 'full');
    add('fg_pc9m', 'VS1 flaps up, 2,350 kg', 'KCAS', p.stall['0'].vs_kcas, 77, 'LP2', `model limit: ${p.stall['0'].limit}`);
    add('fg_pc9m', 'VS0 flaps LDG, 2,350 kg', 'KCAS', p.stall['50'].vs_kcas, 69, 'LP2', `model limit: ${p.stall['50'].limit}`);
    add('fg_pc9m', 'Vy SL', 'KCAS', p.climb.vy_kcas, null, '-', 'ไม่มีค่าสาธารณะ (บัตร 07 ประมาณ 125 KCAS, est)');
    add('fg_pc9m', 'ROC max SL', 'fpm', p.climb.roc_max_fpm, 4090, 'LP12, LP13', 'ไม่ระบุน้ำหนัก; โมเดลใช้ PT6A-25 และใบพัด η > 1');
    add('fg_pc9m', 'max level speed at 20,000 ft', 'KTAS', c20 ? c20.ktas : null, 301, 'LP12', `โมเดลคันเร่งสุด ${c20 ? c20.hp : '–'} hp`);
    add('fg_pc9m', 'static full-throttle power', 'hp', p.static.hp, 950, 'LP2 (rating)', 'โมเดลใช้ PT6A-25 (550 shp ของ PC-7); PC-9M ใช้ PT6A-62 950 shp'); }
  { const p = P.fg_t6; const c1 = p.cruise.find((c) => c.h_ft === 1000);
    add('fg_t6', 'VS1 flaps up', 'KCAS', p.stall['0'].vs_kcas, null, '-', `ไม่มีค่าสาธารณะ (บัตร 07 ประมาณ 82.9 KCAS ที่ 6,000 lb, est); โมเดลใส่ได้ ${p.stall['0'].w_lb} lb`);
    add('fg_t6', 'ROC max SL', 'fpm', p.climb.roc_max_fpm, 3100, 'LP23', 'ไม่ระบุน้ำหนัก; โมเดลเป็น jet thrust (PT6A-68 + direct) ที่ 5,564 lb');
    add('fg_t6', 'max level speed at 1,000 ft', 'KTAS', c1 ? c1.ktas : null, 270, 'LB16', 'Navy 270 kt ที่ 1,000 ft');
    add('fg_t6', 'takeoff distance, SL', 'ft', p.takeoff.over50_ft, 1775, 'LP22', 'แหล่งไม่ระบุนิยาม (ถึง 50 ft หรือไม่) และน้ำหนัก; เทียบกับระยะถึง 50 ft ของโมเดล'); }
  return R;
}
import { pathToFileURL } from 'node:url';
import { realpathSync } from 'node:fs';
// CL implied by a published stall speed at 1 g: CL = W / (0.5 rho0 Vcas^2 S)  (SI; rho0 = 1.225 kg/m3). Review 2026-11-19:
// this is an UPPER bound of the CL reached at the minimum speed of a 1 kt/s entry, because the load factor there is < 1
// (JSBSim c172p: n = CL_measured / CL_implied = 0.89 flaps 0, 0.93 flaps 30, T-LB-19). Compare it with the same quantity
// computed from the minimum speed a model reaches in the same protocol, not with a 1-g CLmax table value.
export const clImplied = (wLb, sFt2, vKcas) => (wLb * 4.4482216) / (0.5 * 1.225 * (vKcas * 0.5144444) ** 2 * sFt2 * 0.09290304);
const isMain = (() => { try { return realpathSync(process.argv[1]) === realpathSync(new URL(import.meta.url).pathname); } catch { return false; } })();
if (isMain) {
const R = rows();
const implied = [
  { type: 'C172P POH (CG หลังสุด)', w_lb: 2400, s_ft2: 174, cfg: 'flaps 0', vs_kcas: 51 }, { type: 'C172P POH (CG หน้าสุด)', w_lb: 2400, s_ft2: 174, cfg: 'flaps 0', vs_kcas: 52 }, { type: 'C172P POH', w_lb: 2400, s_ft2: 174, cfg: 'flaps 30', vs_kcas: 46 },
  { type: 'jsbsim c172p', w_lb: 2400, s_ft2: 174, cfg: 'flaps 0', vs_kcas: 54.49 }, { type: 'jsbsim c172p', w_lb: 2400, s_ft2: 174, cfg: 'flaps 30', vs_kcas: 48.77 },
  { type: 'C172S manual', w_lb: 2550, s_ft2: 174, cfg: 'flaps 0', vs_kcas: 53 }, { type: 'C172S manual', w_lb: 2550, s_ft2: 174, cfg: 'flaps 30', vs_kcas: 48 },
  { type: 'PA-28-180 handbook', w_lb: 2450, s_ft2: 160, cfg: 'flaps 0', vs_kcas: 68 * MPH }, { type: 'PA-28-180 handbook', w_lb: 2450, s_ft2: 160, cfg: 'flaps 40', vs_kcas: 61 * MPH },
].map((x) => ({ ...x, vs_kcas: r1(x.vs_kcas, 2), cl: r1(clImplied(x.w_lb, x.s_ft2, x.vs_kcas), 3) }));
writeFileSync(new URL('lb_compare.json', OUT), JSON.stringify({ generated_by: 'lb_compare.mjs', thresholds: '≤5% ตรง, 5–15% ใกล้, >15% ไม่ตรง', rows: R, implied_cl: implied }, null, 1));
for (const x of implied) console.log(`implied CL ${x.type} ${x.cfg} ${x.w_lb} lb ${x.vs_kcas} KCAS -> ${x.cl}`);
for (const x of R) console.log(`| ${x.model} | ${x.qty} | ${x.unit} | ${x.model_value ?? '—'} | ${x.published ?? '—'} | ${x.error_pct ?? '—'} | ${x.verdict} | ${x.src} | ${x.note} |`);
}
