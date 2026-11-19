#!/usr/bin/env node
// lh_attitude.mjs — AirfieldLab research round 2, topic 08 (LH): pitch-attitude estimates per flight phase.
// ค่าประมาณ: theta = alpha_body + gamma, alpha_body = (CL_req - CL0[flap]) / CLalpha, CL_req = n m g cos(gamma) / (q S),
// q = 0.5 rho V_TAS^2 (sea level ISA, rho 1.225 -> TAS = CAS). Ground effect, thrust-line lift and downwash lag ignored.
// Aero inputs are a snapshot of the data cards (04-c172s, 05-da40, 06-da42, 07-turboprop) aero.static_long / aero.ref /
// airframe.weights as merged on 2026-11-18; speeds and flight-path angles come from the operating sources [LH..] listed
// per phase. Output: scripts/out/lh_attitude.json and a table on stdout. Pure Node >= 18, no dependencies.
//   node lh_attitude.mjs            (run from anywhere; writes next to this script in out/)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const G0 = 9.80665, RHO0 = 1.225, KT = 0.514444, FPM = 0.00508, DEG = Math.PI / 180;

// ---- aero snapshot (card path in comment) ----
export const TYPES = {
  c172s: { // 04-c172s.md: aero.ref.S, aero.static_long.CL0/CLalpha, speeds.ias_cas, airframe.weights.training_mass
    S: 16.165, CLa: 5.17, CL0: { 0: 0.25, 10: 0.367, 20: 0.503, 30: 0.571 }, mass: 1009.6,
    iasCas: { 0: [[50, 56], [60, 62], [70, 70], [80, 78], [90, 87], [100, 97], [110, 107], [120, 117]],
      10: [[40, 51], [50, 57], [60, 63], [70, 71], [80, 80], [90, 89]], 20: [[40, 50.5], [50, 56.5], [60, 63], [70, 71.5], [80, 80.5], [85, 85.5]],
      30: [[40, 50], [50, 56], [60, 63], [70, 72], [80, 81], [85, 86]] },
    VS0cas: 48,
  },
  da40ng: { // 05-da40.md
    S: 13.244, CLa: 5.45, CL0: { UP: 0.34, TO: 0.86, LDG: 1.09 }, mass: 1150,
    iasCas: { UP: [[60, 58.6], [66, 64.6], [99, 99], [172, 172]], TO: [[56, 54.7], [62, 60.7], [93, 93], [110, 110]], LDG: [[54, 52], [60, 58], [90, 90], [98, 98]] },
    VS0cas: 55,
  },
  da42ng: { // 06-da42.md
    S: 16.29, CLa: 5.511, CL0: { UP: 0.35, APP: 0.65, LDG: 0.95 }, mass: 1750,
    iasCas: { UP: [[68, 67], [76, 75], [151, 155], [188, 192]], APP: [[65, 65], [133, 135]], LDG: [[62, 60], [64, 62], [113, 110]] },
    VS0cas: 58,
  },
  t6a: { // 07-turboprop-trainers.md (IAS ~ CAS assumed: no public calibration table)
    S: 16.28, CLa: 4.988, CL0: { UP: 0.25, TO: 0.55, LDG: 0.8 }, mass: 2574.6, iasCas: null, VS0cas: 77.3,
  },
  pc9m: { S: 16.29, CLa: 4.987, CL0: { UP: 0.25, TO: 0.55, LDG: 0.8 }, mass: 2123.8, iasCas: null, VS0cas: 69 },
  pc7mk2: { S: 16.6, CLa: 4.987, CL0: { UP: 0.25, TO: 0.55, LDG: 0.8 }, mass: 2068.8, iasCas: null, VS0cas: 67 },
};

// ---- phases: [phase, KIAS, flap, gamma source: {fpm} or {deg}, power text, source codes] ----
// KIAS / power / flap come from operating documents; rate_fpm marked est where it is ours.
export const PHASES = {
  c172s: [
    ['rotation', 55, 0, { fpm: 0 }, 'เต็ม (2,300–2,400 rpm static)', 'LH11 LH8; rpm LC'],
    ['initial_climb', 74, 0, { fpm: 730 }, 'เต็ม', 'LH11; ROC 730 fpm MTOW SL (04-c172s)'],
    ['cruise_climb', 80, 0, { fpm: 600, est: true }, 'เต็ม/2,500 rpm', 'LH11 (70–85 KIAS)'],
    ['cruise', 105, 0, { fpm: 0 }, '2,200–2,500 rpm (55–75 %)', 'LH12 (60–80 %)'],
    ['descent', 100, 0, { fpm: -500, est: true }, '≈2,000 rpm', 'LH9 est'],
    ['downwind', 90, 0, { fpm: 0 }, '2,000–2,200 rpm', 'LH11 LH9'],
    ['base', 75, 20, { fpm: -500, est: true }, '≈1,500 rpm', 'LH11 LH8'],
    ['final', 65, 30, { deg: -3 }, '≈1,500 rpm → idle ที่ TD', 'LH11 LH9 LH1'],
    ['touchdown', null, 30, { deg: -0.5 }, 'idle', 'LH1 (power-off stall attitude)'],
    ['go_around', 60, 20, { fpm: 300, est: true }, 'เต็ม', 'LH11 LH12'],
  ],
  da40ng: [
    ['rotation', 60, 'TO', { fpm: 0 }, 'MAX 100 % load', 'LH17 (VR 58–61 ที่ 1,000–1,100 kg)'],
    ['initial_climb', 72, 'TO', { fpm: 650 }, 'MAX 100 %', 'LH17; ROC 651 fpm MTOM (05-da40)'],
    ['cruise_climb', 88, 'UP', { fpm: 500, est: true }, '≈92 % (sim SOP)', 'LH17 LH18'],
    ['cruise', 115, 'UP', { fpm: 0 }, '60–75 % load', 'LD cruise_table est'],
    ['descent', 110, 'UP', { fpm: -500, est: true }, '≈35–45 %', 'est'],
    ['downwind', 90, 'UP', { fpm: 0 }, '30–40 %', 'LH18 (sim SOP, ต่ำ)'],
    ['base', 80, 'TO', { fpm: -500, est: true }, '≈25–30 %', 'est'],
    ['final', 74, 'LDG', { deg: -3 }, '≈20–30 % → idle', 'LH17 (VREF LDG 72–76)'],
    ['touchdown', null, 'LDG', { deg: -0.5 }, 'idle', 'LH1'],
    ['go_around', 72, 'TO', { fpm: 400, est: true }, 'MAX', 'LH17 (min GA 72 flaps T/O)'],
  ],
  da42ng: [
    ['rotation', 76, 'UP', { fpm: 0 }, 'MAX 2×100 %', '06-da42 VR'],
    ['initial_climb', 90, 'UP', { fpm: 1100 }, 'MAX', '06-da42 VY; ROC 1,180 MTOM'],
    ['cruise_climb', 100, 'UP', { fpm: 900, est: true }, '≈92 %', 'LH29 (L360: 100 KIAS)'],
    ['cruise', 140, 'UP', { fpm: 0 }, '60–75 %', '06-da42 cruise_table est'],
    ['descent', 130, 'UP', { fpm: -500 }, '≈35–40 %', 'LH29 (130–140 KIAS 500 fpm)'],
    ['downwind', 100, 'UP', { fpm: 0 }, '≈35 %', 'LH29 est'],
    ['base', 95, 'APP', { fpm: -500, est: true }, '≈25–30 % ล้อลง', 'LH29'],
    ['final', 84, 'LDG', { deg: -3 }, '≈20–30 %', '06-da42 VREF (LT9)'],
    ['touchdown', null, 'LDG', { deg: -0.5 }, 'idle', 'LH1'],
    ['go_around', 90, 'APP', { fpm: 500, est: true }, 'MAX', 'LH29'],
  ],
  t6a: [
    ['rotation', 85, 'TO', { fpm: 0 }, 'MAX', 'LH14 (7–10° NH) LH15'],
    ['initial_climb', 140, 'UP', { fpm: 3000, est: true }, 'MAX', 'LH14 (tech climb 140 KIAS 15° NH)'],
    ['cruise_climb', 160, 'UP', { fpm: 2500, est: true }, 'MAX', 'LH14 (160 KIAS 12.5° NH)'],
    ['cruise', 200, 'UP', { fpm: 0 }, '≈50 % + 1 %/1,000 ft', 'LH14'],
    ['descent', 200, 'UP', { fpm: -1500, est: true }, '≈10–20 %', 'LH15 est'],
    ['downwind', 120, 'UP', { fpm: 0 }, '≈31 %', 'LH15'],
    ['base', 110, 'LDG', { fpm: -800, est: true }, '≈15 % (abeam)', 'LH15 (90 position 110–120 KIAS)'],
    ['final', 100, 'LDG', { deg: -3 }, 'ตามต้อง (on-speed AOA)', 'LH15'],
    ['touchdown', null, 'LDG', { deg: -0.5 }, 'idle (flare 5–10 ft)', 'LH15'],
    ['go_around', 110, 'TO', { fpm: 1500, est: true }, 'MAX', 'LH15 est'],
  ],
};
// C172R (review 2026-11-18): same airframe/flaps as the 172S, so the 172S aero snapshot and training mass are reused
// (ค่าประมาณ); speeds from the 172R Information Manual [LH12 p.ii, 4-5, 4-17]: Vy SL 79 KIAS, ROC 720 fpm at 2,450 lb,
// enroute climb 75–85 KIAS, balked landing 55 KIAS flaps 20.
TYPES.c172r = { ...TYPES.c172s };
PHASES.c172r = PHASES.c172s.map(r => {
  if (r[0] === 'initial_climb') return ['initial_climb', 79, 0, { fpm: 720 }, 'เต็ม', 'LH12 p.4-5 (Vy SL 79); ROC 720 fpm p.ii'];
  if (r[0] === 'go_around') return ['go_around', 55, 20, { fpm: 300, est: true }, 'เต็ม', 'LH12 p.4-5, 4-17 (balked landing 55 KIAS flaps 20)'];
  return r;
});
// PC-9 M and PC-7 MkII: T-6 class technique with low-speed phases scaled by VS0 ratio (ค่าประมาณ)
for (const id of ['pc9m', 'pc7mk2']) {
  const k = TYPES[id].VS0cas / TYPES.t6a.VS0cas;
  PHASES[id] = PHASES.t6a.map(([ph, v, fl, g, pw, src]) => {
    const low = ['rotation', 'downwind', 'base', 'final', 'go_around'].includes(ph);
    return [ph, v == null ? null : Math.round(low ? v * k : v), fl, g, pw + ' (คลาส T-6)', `scaled T-6 ×${k.toFixed(3)} (est) ${src}`];
  });
}

export function interp(tab, x) {
  if (!tab) return x;
  if (x <= tab[0][0]) return tab[0][1] + (x - tab[0][0]) * (tab[1][1] - tab[0][1]) / (tab[1][0] - tab[0][0]);
  for (let i = 1; i < tab.length; i++) if (x <= tab[i][0]) {
    const [x0, y0] = tab[i - 1], [x1, y1] = tab[i]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
  }
  const n = tab.length; return tab[n - 1][1] + (x - tab[n - 1][0]) * (tab[n - 1][1] - tab[n - 2][1]) / (tab[n - 1][0] - tab[n - 2][0]);
}
export function iasToCas(t, flap, ias) { return t.iasCas ? interp(t.iasCas[flap] || t.iasCas[Object.keys(t.iasCas)[0]], ias) : ias; }

/** steady flight: alpha_body (deg) and theta (deg) at CAS (kt), flap key, gamma (rad), load factor n */
export function attitude(t, flap, vcas, gamma, n = 1) {
  const V = vcas * KT, q = 0.5 * RHO0 * V * V;
  const CL = n * t.mass * G0 * Math.cos(gamma) / (q * t.S);
  const a = (CL - t.CL0[flap]) / t.CLa;
  return { CL, alpha: a / DEG, theta: (a + gamma) / DEG };
}
/** instantaneous load-factor increment when flaps move f1 -> f2 at KIAS v and the pilot holds alpha (balloon tendency) */
export function balloon(t, f1, f2, kias) {
  const v = iasToCas(t, f2, kias) * KT, q = 0.5 * RHO0 * v * v;
  return (t.CL0[f2] - t.CL0[f1]) * q * t.S / (t.mass * G0);
}
/** flight-path angle from rate (fpm) and TAS (kt) */
export const gammaOf = (fpm, vkt) => Math.asin((fpm * FPM) / (vkt * KT));
/** fpm change per degree of pitch at constant speed (rule of thumb check) */
export const fpmPerDeg = vkt => vkt * KT * Math.sin(DEG) / FPM;
/** descent rate on a glide path of angle g (deg) at ground speed gs (kt) */
export const vsOnPath = (gs, gdeg = 3) => gs * KT * Math.tan(gdeg * DEG) / FPM;

export function run() {
  const out = {};
  for (const id of Object.keys(PHASES)) {
    const t = TYPES[id]; out[id] = {};
    for (const [ph, kias, flap, g, power, src] of PHASES[id]) {
      let vcas = kias == null ? 1.05 * t.VS0cas : iasToCas(t, flap, kias);
      const ias = kias == null ? null : kias;
      const gamma = g.deg != null ? g.deg * DEG : gammaOf(g.fpm, vcas);
      const r = attitude(t, flap, vcas, gamma);
      const rate = Math.round(Math.sin(gamma) * vcas * KT / FPM);
      out[id][ph] = { ias_kt: ias, cas_kt: +vcas.toFixed(1), flap, rate_fpm: rate, gamma_deg: +(gamma / DEG).toFixed(2),
        CL: +r.CL.toFixed(3), alpha_deg: +r.alpha.toFixed(1), pitch_deg: +r.theta.toFixed(1), power, src, rate_est: !!g.est };
    }
  }
  return out;
}

const real = f => { try { return fs.realpathSync(f); } catch { return path.resolve(f); } };
const isMain = !!process.argv[1] && real(process.argv[1]) === real(fileURLToPath(import.meta.url));
if (isMain) {
  const out = run();
  const checks = {
    fpm_per_deg_65kt: +fpmPerDeg(65).toFixed(1), fpm_per_deg_90kt: +fpmPerDeg(90).toFixed(1), fpm_per_deg_120kt: +fpmPerDeg(120).toFixed(1),
    vs_3deg_gs65: +vsOnPath(65).toFixed(0), vs_3deg_gs74: +vsOnPath(74).toFixed(0), vs_3deg_gs84: +vsOnPath(84).toFixed(0), vs_3deg_gs100: +vsOnPath(100).toFixed(0),
    t6_150kias_flapsUP_level: +attitude(TYPES.t6a, 'UP', 150, 0).theta.toFixed(1),
    t6_250kias_level: +attitude(TYPES.t6a, 'UP', 250, 0).theta.toFixed(1),
    c172_alpha_flap0_65kias_level: +attitude(TYPES.c172s, 0, iasToCas(TYPES.c172s, 0, 65), 0).alpha.toFixed(2),
    c172_alpha_flap30_65kias_3deg: +attitude(TYPES.c172s, 30, iasToCas(TYPES.c172s, 30, 65), -3 * DEG).alpha.toFixed(2),
    c172_balloon_dn_flap0to10_85kias: +balloon(TYPES.c172s, 0, 10, 85).toFixed(3),
    c172_balloon_dn_flap10to20_80kias: +balloon(TYPES.c172s, 10, 20, 80).toFixed(3),
    c172_balloon_dn_flap20to30_70kias: +balloon(TYPES.c172s, 20, 30, 70).toFixed(3),
    da40_balloon_dn_UPtoTO_100kias: +balloon(TYPES.da40ng, 'UP', 'TO', 100).toFixed(3),
  };
  fs.mkdirSync(path.join(HERE, 'out'), { recursive: true });
  fs.writeFileSync(path.join(HERE, 'out', 'lh_attitude.json'), JSON.stringify({ generated: 'lh_attitude.mjs', note: 'ค่าประมาณ: theta = alpha + gamma (SL ISA, no ground effect)', checks, types: out }, null, 1) + '\n');
  for (const id of Object.keys(out)) {
    console.log(`\n${id}`);
    for (const [ph, r] of Object.entries(out[id])) console.log(`  ${ph.padEnd(14)} ${String(r.ias_kt ?? '-').padStart(4)} KIAS ${String(r.cas_kt).padStart(6)} KCAS flap ${String(r.flap).padEnd(3)} ${String(r.rate_fpm).padStart(6)} fpm  CL ${r.CL.toFixed(2)}  α ${String(r.alpha_deg).padStart(5)}°  θ ${String(r.pitch_deg).padStart(5)}°`);
  }
  console.log('\nchecks', JSON.stringify(checks));
}
