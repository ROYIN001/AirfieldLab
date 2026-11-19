#!/usr/bin/env node
// lp_check.mjs — LP (07-turboprop-trainers.md §07.9–07.12): legacy fit (lm_legacy_fit 'static'), current-sim check (lm_card
// runCard) for pc9m, pc7mk2, t6a, t6c; the trainer_r2 proposal; the T-LP test table; the final ```json blocks.
//   node scripts/lp_check.mjs          (run from the repo root; ~20 s)
//   → scripts/out/lp_check.json, lp_tests.json, lp_tests.md, lp_cards.json, lp_json_blocks.md
// Only estimated leaves are fitted (aero.legacy, propulsion.legacy, trainer_r2 proposals); public numbers are targets.
// Node >= 18, no dependencies.
import fs from 'node:fs';
import { buildAll, naLeaf, blocksMd } from './lp_build.mjs';
import { L, setp, r1leaf, KT, FT, G0, LB } from './lp_cards.mjs';
import { resolveType, loadType, val, isObj, isLeaf } from './lm_lib.mjs';
import { legacyFit } from './lm_legacy_fit.mjs';
import { loadSim, applyAC, buildAC, cardInfo, runCard, simCLmax, trim, AC_R1 } from './lm_card.mjs';
import { polarFromGlide, toSimPolar, rhoISA } from './lm_polar.mjs';

const DEG = Math.PI / 180, RHO0 = 1.225;
const r = (x, n = 4) => (x == null || !Number.isFinite(+x) ? null : +(+x).toPrecision(n));
const out = f => new URL('./out/' + f, import.meta.url);
const E = (v, u, src, note = '', o = {}) => L(v, u, src, { conf: 'ต่ำ', est: true, note: ('ค่าประมาณ: ' + note).trim(), ...o });
const C = 'LP27';

// ── WORKAROUND (lm_card bug, also met by topics 04/05/06): buildAC reads controls.surfaces.<s>.travel_deg as a LEAF, but the schema
// puts the leaf at controls.surfaces.<s> (angles in v.travel_deg), so buildAC falls back to AC_R1. We set the fallback to the TCDS
// travel of the type before each buildAC: Pilatus [LP1][LP2] elevator up 18.5 / down 16, aileron ½(20+11) = 15.5, rudder 24;
// T-6 [LP5] elevator up 18 / down 16, aileron 15.5, rudder 24. trainer_r1 keeps the round-1 values 22/15/20/25.
const TRAVEL = {
  pilatus: { deUp: 18.5 * DEG, deDn: 16 * DEG, daMax: 15.5 * DEG, drMax: 24 * DEG },
  t6: { deUp: 18 * DEG, deDn: 16 * DEG, daMax: 15.5 * DEG, drMax: 24 * DEG },
  r1: { deUp: 22 * DEG, deDn: 15 * DEG, daMax: 20 * DEG, drMax: 25 * DEG },
};
const fam = id => (id.startsWith('t6') ? 't6' : id.startsWith('trainer_r1') ? 'r1' : id === 'trainer_r2' ? 'pilatus' : 'pilatus');
const R1SAVE = { ...AC_R1 };
const withTravel = (id, fn) => { Object.assign(AC_R1, TRAVEL[fam(id)]); try { return fn(); } finally { Object.assign(AC_R1, R1SAVE); } };

const M = await loadSim();
const { d, cards } = buildAll();
const MTOW = { pc9m: 2350, pc7mk2: 2250, t6a: r(6500 * LB, 6), t6c: r(6900 * LB, 6) };
const TM = { pc9m: d.pc9m.training_mass, pc7mk2: d.pc7mk2.training_mass, t6a: d.t6a.training_mass, t6c: d.t6c.training_mass };

// ── 1. validation targets, flap notches, sub-variant extras (all ค่าประมาณ except where a source gives them) ──
for (const id of ['pc9m', 't6a']) {
  const T6 = id === 't6a', c = cards[id], s = (p, l) => setp(c, p, l);
  s('validation.trim_targets.cruise', E({ ias_kt: 200, h_ft: 3000, power: T6 ? '≈53 % torque, pitch 0°' : 'ไม่มีข้อมูล' }, 'kt, ft', T6 ? ['LP15', C] : [C],
    T6 ? 'บินระดับ 200 KIAS ที่ 3,000 ft: torque 50 % + 1 %/1,000 ft, pitch 0° ตามตารางของคู่มือฝึก [LP15]' : 'cruise 200 kt 3,000 ft (จุดเดียวกับ T-6 เพื่อเทียบกัน)'));
  s('validation.trim_targets.approach', E({ ias_kt: T6 ? 100 : 95, h_m: 300, gamma_deg: -3, flap: 'LDG', gear: 'down' }, 'kt, m, deg', T6 ? ['LP20', C] : [C],
    T6 ? 'final แฟลป LDG 100 KIAS [LP20] γ −3° 300 m' : 'VAPP 95 kt แฟลป LDG ล้อลง γ −3° 300 m'));
  s('validation.takeoff_test', E({ flap: 'TO', VR_kt: T6 ? 85 : 78, theta_deg: T6 ? 8.5 : 10 }, 'kt, deg', T6 ? ['LP15'] : [C], T6 ? 'takeoff 85 KIAS แฟลป TO pitch 7–10° [LP15]' : 'แฟลป TO; VR ค่าประมาณ (speeds.VR_kt)'));
  s('input.keyboard.flap_notches', E([0, r(0.30 / 0.55, 4), 1], '-', [C], 'AC.flaps ของขั้น UP/TO/LDG แบบ lift (dCL0 0/0.30/0.55) ⇒ 0, 0.545, 1; มุมจริง 0/23/50° [LP1][LP2][LP5]', { scope: 'sim' }));
}
setp(cards.pc7mk2, 'validation.trim_targets.approach', E({ ias_kt: 92, h_m: 300, gamma_deg: -3, flap: 'LDG', gear: 'down' }, 'kt, m, deg', [C], 'VAPP 92 kt (ค่าประมาณ) แฟลป LDG ล้อลง γ −3° 300 m'));
setp(cards.pc7mk2, 'validation.takeoff_test', E({ flap: 'TO', VR_kt: 76, theta_deg: 10 }, 'kt, deg', [C], 'แฟลป TO สมมติ; VR ค่าประมาณ'));
setp(cards.t6c, 'performance.glide', E({ speed_kt: r(d.t6a.glideV_MTOW * Math.sqrt(6900 / 6500), 4), ratio: d.t6a.glideLD.central }, 'kt IAS', ['LP16', 'LP19', C], 'polar ของ T-6A; ความเร็วสเกล √(6,900/6,500)'));

// ── 2. legacy fit on the resolved cards (before any legacy leaf exists, so sub-variants do not inherit the parent's fit) ──
const resolved = id => structuredClone(resolveType(cards, id));
const fits = {};
for (const id of ['pc9m', 'pc7mk2', 't6a', 't6c']) {
  const card = resolved(id);
  fits[id] = withTravel(id, () => legacyFit(card, { mode: 'static' }));
}
const legacyLeaves = (id, fit) => {
  const la = fit.legacy.aero, lp = fit.legacy.propulsion;
  setp(cards[id], 'aero.legacy', E(Object.fromEntries(Object.entries(la).map(([k, v]) => [k, r(v, 5)])), '-, 1/rad, deg', ['LM1', 'LM0', C, ...(id.startsWith('t6') ? ['LP16', 'LP19'] : ['LP2'])],
    `lm_legacy_fit โหมด static ที่ MTOW: polar ของซิม CD = CD0 + K(CL − 0.15)² จากการร่อน (L/D ${fit.targets.glide?.ratio} ที่ ${r(fit.targets.glide?.speed_kt, 4)} kt); aStall/aStallFlap แก้ให้ CLmax 1 g ตรง CLmax_target; ค่าอื่นจาก aero.static_long/flaps; ${fit.notes.join('; ')}`));
  setp(cards[id], 'propulsion.legacy', E({ P: r(lp.P, 6), eta: r(lp.eta, 4), T0: lp.T0, idle: lp.idle }, 'W, -, N, -', ['LM0', C], `T0 จากทฤษฎีโมเมนตัม FM 0.55 (lm_card); eta = Vc·T0/P ฟิตให้ ROC ของซิมที่ MTOW = ${fit.targets.roc} fpm ที่ VY ${r(fit.targets.Vy, 4)} kt; idle 0 เพราะ polar มาจากการร่อนแรงขับศูนย์${lp.eta > 0.95 ? '; WARNING eta > 0.95' : ''}`, { scope: 'engine' }));
};
for (const id of Object.keys(fits)) legacyLeaves(id, fits[id]);

// ── 3. run the sim with the fitted cards ──
function alphaInfo(card, ac) {   // same convention as 06-da42 (lt_run.mjs): α* ≈ legacy blend centre; warnings from the linear CL at VS + margin
  const info = cardInfo(card, ac), dU = info.dets[0], dL = info.dets.at(-1);
  const mU = simCLmax(ac, dU.f), mL = simCLmax(ac, dL.f);
  const vs = CL => Math.sqrt(2 * ac.m * G0 / (RHO0 * ac.S * CL)) / KT;
  const aAt = (CLmax, f, m) => { const v = vs(CLmax), CLw = CLmax * (v / (v + m)) ** 2; return (CLw - ac.CL0 - ac.CLflap * f) / ac.CLa / DEG; };
  return { alpha_star: { clean: r(ac.aStall, 4), landing: r(ac.aStall + ac.aStallFlap, 4) }, alpha_CLmax: { clean: r(mU.alpha, 4), landing: r(mL.alpha, 4) },
    CLmax_sim: { clean: r(mU.CL, 4), landing: r(mL.CL, 4) },
    alpha_warn_5kt: { clean: r(aAt(mU.CL, dU.f, 5), 4), landing: r(aAt(mL.CL, dL.f, 5), 4) }, alpha_warn_design: { clean: r(aAt(mU.CL, dU.f, 7), 4), landing: r(aAt(mL.CL, dL.f, 7), 4) } };
}
function excessTW(ac, Vapp) {   // R1 wind.fFactor.trainerExcessTW: (Tmax − D)/W at Vapp, flaps full, gear down, ISA+16 at SL, sim thrust law
  const rho = rhoISA(0, 16), V = Vapp * KT * Math.sqrt(RHO0 / rho), q = 0.5 * rho * V * V, W = ac.m * G0, CL = W / (q * ac.S);
  const D = q * ac.S * (ac.CD0 + ac.CDflap + ac.CDgear + ac.K * (CL - 0.15) ** 2), Vc = ac.eta * ac.P / ac.T0, T = ac.T0 * Vc / Math.sqrt(V * V + Vc * Vc);
  return (T - D) / W;
}
function rollPerf(ac, mode, Vkt, phiDeg) {   // first-order roll: p_ss = −Clda·δa/Clp · 2V/b ; φ(t) = p_ss (t − τ(1 − e^{−t/τ}))
  const V = Vkt * KT, pss = -ac.Clda * ac.daMax / ac.Clp * 2 * V / ac.b, tau = mode.roll_tau ?? 0.3;
  let t = 0; while (pss * (t - tau * (1 - Math.exp(-t / tau))) < phiDeg * DEG && t < 10) t += 0.001;
  return { pss_dps: pss / DEG, pb2V: pss * ac.b / (2 * V), t: t, tau };
}
function runOne(id, card, mass) {
  return withTravel(id, () => {
    const ac = buildAC(card, { mass }); const restore = applyAC(M, ac);
    try {
      const info = cardInfo(card, ac); const res = runCard(M, ac, info);
      const al = alphaInfo(card, ac);
      const xs = excessTW(ac, ac.Vapp);
      const rp = { approach: rollPerf(ac, res.modes.approach, info.approach.ias, 30), cruise: rollPerf(ac, res.modes.cruise, info.cruise.ias, 60) };
      return { ac, info: { cruise: info.cruise, approach: info.approach, takeoff: info.takeoff, VS1: info.VS1, VS0: info.VS0, Vy: info.Vy }, res, al, xs, rp };
    } finally { restore(); }
  });
}
function levelTrims(id, card, mass, list) {   // T-6 level-flight table of the training manual [LP15]
  return withTravel(id, () => {
    const ac = buildAC(card, { mass }); const restore = applyAC(M, ac);
    try { return list.map(ias => { const a = new M.Aircraft(); const t = trim(M, a, { ias, h: 3000 * FT, flaps: 0, gear: 0 }); return { ias, thr: r(t.thr, 4), theta_deg: r(t.theta / DEG, 4), alpha_deg: r(t.alpha / DEG, 4), de_deg: r(t.de / DEG, 4) }; }); }
    finally { restore(); }
  });
}
const RES = {};
for (const id of ['pc9m', 'pc7mk2', 't6a', 't6c']) {
  const card = resolved(id);
  RES[id] = runOne(id, card, MTOW[id]);
  RES[id].climbTM = withTravel(id, () => { const ac = buildAC(card, { mass: TM[id] }); const rs = applyAC(M, ac); try { return runCard(M, ac, cardInfo(card, ac), { noGround: true }).climb; } finally { rs(); } });
  if (id === 't6a') RES[id].level = levelTrims(id, card, TM[id], [150, 200, 250]);
}
// round-1 trainer (fixture = today's AC) for the class comparison
const fx = loadType('trainer_r1');
RES.trainer_r1 = runOne('trainer_r1', fx, null);

// ── 4. lm_card-derived leaves on the type cards ──
const summ = R => ({
  VSR_clean_kt: r(R.res.stall[Object.keys(R.res.stall)[0]].VSR_eas, 4), Vmin_clean_kt: r(R.res.stall[Object.keys(R.res.stall)[0]].Vmin_eas, 4),
  VSR_full_kt: r(R.res.stall[Object.keys(R.res.stall).at(-1)].VSR_eas, 4), Vmin_full_kt: r(R.res.stall[Object.keys(R.res.stall).at(-1)].Vmin_eas, 4),
  Vy_SL_kt: r(R.res.climb.Vy_kt, 4), ROCmax_SL_fpm: Math.round(R.res.climb.ROCmax_fpm), glideLD_zeroThrust: r(R.res.glide.zeroThrust.LD, 4), Vbg_kt: r(R.res.glide.zeroThrust.Vbg_kt, 4),
  glideLD_idle: r(R.res.glide.idle.LD, 4), TO_groundRoll_m: Math.round(R.res.takeoff?.groundRoll_m ?? NaN), TO_50ft_m: Math.round(R.res.takeoff?.dist50ft_m ?? NaN),
  LDG_50ft_maxBrake_m: Math.round(R.res.landing?.maxBrake?.total_m ?? NaN), LDG_50ft_asIs_m: Math.round(R.res.landing?.asIs?.total_m ?? NaN) });
const modeSumm = (m, t) => ({ sp_wn: r(m.sp?.wn, 4), sp_zeta: r(m.sp?.zeta, 4), CAP: r(m.CAP, 4), nAlpha: r(m.nAlpha, 4), ph_T_s: r(m.ph?.T, 4), ph_zeta: r(m.ph?.zeta, 4), dr_wn: r(m.dr?.wn, 4), dr_zeta: r(m.dr?.zeta, 4),
  dr_zetaWn: r((m.dr?.wn ?? NaN) * (m.dr?.zeta ?? NaN), 4), tauR_s: r(m.roll_tau, 4), spiral_t2_s: m.spiral ? r(m.spiral.t2, 4) : null, spiral_divergent: m.spiral ? m.spiral.grows : null,
  trim_alpha_deg: r(t.alpha_deg, 4), trim_theta_deg: r(t.theta_deg, 4), trim_de_deg: r(t.de_deg, 4), trim_thr: r(t.thr, 4) });
for (const id of ['pc9m', 'pc7mk2', 't6a', 't6c']) {
  const R = RES[id], c = cards[id], s = (p, l) => setp(c, p, l), m = r(R.ac.m, 5);
  s('validation.currentModel.performance', E(summ(R), 'kt, fpm, -, m', ['LM0', C], `โมเดลวันนี้ (src/ @ cabf0f0) + aero.legacy/propulsion.legacy ของบัตรนี้ ที่ ${m} kg ISA ลมสงบ (lm_card runCard); ความเร็ว KEAS ของซิม; ใช้เป็น regression ไม่ใช่ค่าจริง`, { conf: 'สูง' }));
  s('validation.currentModel.approach', E(modeSumm(R.res.modes.approach, R.res.trim.approach), 'rad/s, -, s, deg', ['LM0', C], `IAS ${R.info.approach.ias} kt แฟลปสุด ล้อลง 300 m γ −3° ที่ ${m} kg`, { conf: 'สูง' }));
  s('validation.currentModel.cruise', E(modeSumm(R.res.modes.cruise, R.res.trim.cruise), 'rad/s, -, s, deg', ['LM0', C], `IAS ${R.info.cruise.ias} kt clean 3,000 ft ระดับ ที่ ${m} kg`, { conf: 'สูง' }));
  if (id === 'pc9m' || id === 't6a' || id === 'pc7mk2' || id === 't6c') {
    s('aero.static_long.alpha_star', E(R.al.alpha_star, 'deg', ['LM0', C], 'โค้ดปัจจุบัน: ศูนย์กลาง blending (aStall, aStall + aStallFlap) ที่ legacy fit แก้ไว้ ใช้แทน α* ของรอบที่ 1 (ยังไม่ได้ปรับจุด X0 ของโมเดล Viterna)'));
    s('aero.static_long.alpha_CLmax', E(R.al.alpha_CLmax, 'deg', ['LM0', C], `α ที่ CL ของซิม (trim, นอก ground effect) สูงสุด; CLmax ${R.al.CLmax_sim.clean}/${R.al.CLmax_sim.landing}`));
    s('aero.stall_warning.alpha_warn_5kt', E(R.al.alpha_warn_5kt, 'deg', ['LM0', C], 'α ของ CL เชิงเส้นที่ VS + 5 kt (1 g, ISA SL, MTOW); วิธีเดียวกับ 06-da42'));
    s('aero.stall_warning.alpha_warn_design', E(R.al.alpha_warn_design, 'deg', ['LM0', C], 'margin 7 kt เผื่อ gust (ตามรอบที่ 1)' + (id.startsWith('t6') ? '; T-6 จริง: shaker 5–10 kt เหนือ stall [LP19]' : '')));
    s('wind.fFactor.trainerExcessTW', E(r(R.xs, 4), '-', ['LM0', C], `(Tmax − D)/W ที่ Vapp ${R.ac.Vapp} kt แฟลปสุด ล้อลง ISA+16 ระดับน้ำทะเล ด้วยกฎแรงขับของซิมและ legacy ของบัตรนี้ (นิยามรอบที่ 1)`));
  }
}
// _na leaves (main cards only; sub-variants inherit)
const NA_FILLED = new Set(['aero.stall_warning.alpha_warn_design', 'aero.static_long.alpha_CLmax', 'aero.static_long.alpha_star', 'aero.stall_warning.alpha_warn_5kt', 'wind.fFactor.trainerExcessTW']);
for (const id of ['pc9m', 't6a']) {
  const list = naLeaf(id).filter(p => !NA_FILLED.has(p));
  cards[id]._na = { v: list, u: '-', scope: 'aircraft', src: [], conf: 'สูง', est: false,
    note: 'ไม่ใช้กับแบบนี้: turbofan.* (เครื่องเทอร์โบพร็อป); part25_* และ cfr25_* (ใบรับรอง FAR 23); controls.reference_types/typicalModes/wake.leaders (ค่าอ้างอิงรวมของรอบที่ 1 ไม่ใช่ค่ารายแบบ); numerics.contact.* (ของซิม); table_clean และ pitch.derived_check (ผลคำนวณของเครื่องฝึกรอบที่ 1); betaReverse/beta_reverse และ antiskid (ไม่มีระบบนี้); currentModel.approach95/cruise155 (เงื่อนไขของรอบที่ 1; ใช้ validation.currentModel.approach/cruise แทน); otherSims.* (หัวข้อ 03 เป็นเจ้าของ ส่วนที่เหลือเป็นค่าของ C172/โมเดลอื่น); reference_engines ของเครื่องยนต์ที่แบบนี้ไม่ใช้' };
}

// ── 5. trainer_r2: proposals for the fictional trainer (only leaves that change; note = round-1 path + old value) ──
const fxLeg = val(fx, 'aero.legacy'), fxProp = val(fx, 'propulsion.legacy');
const P9 = d.stallCL;
const CLT = { UP: P9.pc9m_UP.CLmax_1g, LDG: P9.pc9m_LDG.CLmax_1g };            // PC-9 M TCDS 77/69 KCAS at 2,350 kg [LP2] → CLmax 1 g
const Vs1g = CL => Math.sqrt(2 * 2250 * G0 / (RHO0 * 16.3 * CL)) / KT;            // 1-g stall CAS of the trainer (2,250 kg, S 16.3)
const VS1t = r(Vs1g(CLT.UP), 4), VS0t = r(Vs1g(CLT.LDG), 4);
const LDclass = d.t6a.glideLD.central;                                          // T-6 public glide [LP16][LP19]
const pol = polarFromGlide({ mass: 6000 * LB, S: d.t6a.S ?? 16.28, v_kcas: 125, E: LDclass });   // physical polar of the class
const CLstar = Math.sqrt(pol.CD0 / pol.K), Vbg2250 = Math.sqrt(2 * 2250 * G0 / (RHO0 * 16.3 * CLstar)) / KT;
const ROCt = 4000;   // ค่าประมาณ: class band 3,900–4,200 fpm at 2,250 kg / 700 kW (see §07.10)
const tmp = structuredClone(fx);
const legNoStall = { ...fxLeg }; delete legNoStall.aStall; delete legNoStall.aStallFlap; delete legNoStall.CD0; delete legNoStall.K;
tmp.aero.legacy = { ...tmp.aero.legacy, v: legNoStall };
setp(tmp, 'aero.static_long.CLmax_target', E(CLT, '-', ['LP2'], ''));
setp(tmp, 'performance.glide', E({ speed_kt: r(Vbg2250, 4), ratio: LDclass }, 'kt CAS', [C], ''));
setp(tmp, 'performance.ROC_SL_fpm', E(ROCt, 'fpm', [C], ''));
setp(tmp, 'speeds.VY_kt', E(125, 'kt CAS', [C], ''));
setp(tmp, 'speeds.VS1_kt', E(VS1t, 'kt CAS', [C], '')); setp(tmp, 'speeds.VS0_kt', E(VS0t, 'kt CAS', [C], ''));
const fit2 = withTravel('trainer_r2', () => legacyFit(tmp, { mode: 'static' }));
const leg2 = Object.fromEntries(Object.entries(fit2.legacy.aero).map(([k, v]) => [k, r(v, 5)]));
const prop2 = { P: fxProp.P, eta: r(fit2.legacy.propulsion.eta, 4), T0: fxProp.T0, idle: 0 };
const old = (p, v) => `รอบที่ 1: ${p} = ${JSON.stringify(v)}`;
const T2 = {};
const t2 = (p, l) => setp(T2, p, l);
t2('_inherits', { v: 'trainer_r1', u: '-', scope: 'aircraft', src: [], conf: 'สูง', est: false, note: 'ข้อเสนอรอบที่ 2 = เครื่องฝึกรอบที่ 1 (fixture scripts/lm_fixture_trainer_r1.json = AC ของ commit cabf0f0) + leaf ข้างล่างเท่านั้น; lm_card โหลดได้ด้วย loadType("trainer_r2")' });
t2('aero.legacy', E(leg2, '-, 1/rad, deg', ['LM0', 'LP2', 'LP16', 'LP19', C],
  `${old('AC.{CD0,K,aStall,aStallFlap} (src/20-flight.js)', { CD0: fxLeg.CD0, K: fxLeg.K, aStall: fxLeg.aStall, aStallFlap: fxLeg.aStallFlap })}; เปลี่ยน CD0/K ให้ L/D ร่อนแรงขับศูนย์ = ${LDclass} (คลาส T-6 จากการร่อน 125 KIAS sink 1,100–1,350 fpm) ที่ ${r(Vbg2250, 3)} KCAS; aStall/aStallFlap แก้ให้ CLmax 1 g = ${CLT.UP}/${CLT.LDG} ของ PC-9 M (TCDS 77/69 KCAS); ค่าอื่นเท่าเดิม`));
t2('propulsion.legacy', E(prop2, 'W, -, N, -', ['LM0', C], `${old('AC.{eta,idle}', { eta: fxProp.eta, idle: fxProp.idle })}; eta (= Vc·T0/P ของกฎแรงขับวันนี้) ฟิตให้ ROC ที่ 2,250 kg = ${ROCt} fpm (ค่าประมาณของคลาส 3,900–4,200); idle 0.045 → 0 เพราะแรงขับ idle บวกทำให้ร่อนได้ L/D 21.7 (เทอร์โบพร็อปจริงที่ flight idle ให้แรงขับศูนย์ถึงลบ); P และ T0 เท่าเดิม`, { scope: 'engine' }));
t2('aero.static_long.CLmax_target', M2({ clean: CLT.UP, landing: CLT.LDG }, '-', ['LP2', 'LM1', C], `${old('aero.static_long.CLmax_target', r1leaf('aero.static_long.CLmax_target').v)}; ใช้ CLmax 1 g ของ PC-9 M จาก TCDS (ปีกและพื้นที่ปีกเท่ากัน) ⇒ VS1/VS0 1 g ที่ 2,250 kg = ${VS1t}/${VS0t} KCAS; คีย์ clean/landing ตามรอบที่ 1 (แฟลปต่อเนื่อง)`));
const VS0poh = r(VS0t * Math.sqrt(0.95), 3);   // POH/TCDS definition (minimum speed of the 1 kt/s test) = V_SR·√0.95 (01-methods §01.5)
t2('speeds.VS0_kt', E(VS0poh, 'kt CAS', ['LP2', 'LM1', C], `${old('AC.Vs0', 71)}; VS0 ตามนิยาม POH/TCDS (ความเร็วต่ำสุดของการทดสอบ 1 kt/s, 14 CFR 23.49 เดิม) ที่ 2,250 kg = V_SR 1 g ${VS0t} × √0.95 จาก CLmax ของ PC-9 M (= 69 KCAS ของ PC-9 M สเกล √(2,250/2,350); PC-7 MkII 67 KCAS [LP9]); speeds.VREF_kt 88 kt ของรอบที่ 1 คงเดิม เพราะ 1.3 × ${VS0poh} = ${r(1.3 * VS0poh, 3)} kt (ตรวจทาน: ข้อเสนอเดิม 90 kt ใช้ V_SR 1 g ผิดนิยาม)`));
t2('airframe.inertia.Ixx', E(3700, 'kg m2', ['LM15', C], `${old('AC.Ixx', 2600)}; Rx คลาส 0.261 ให้ 3,980 และ component build-up ของ PC-9 M (ปีกมีเชื้อเพลิง 418 kg) ให้ 3,420 ที่ 2,250 kg ⇒ ค่ากลาง 3,700 (±20 %); ค่าเดิมเท่ากับ Rx 0.211 ต่ำกว่าคลาส`));
t2('controls.surfaces.elevator', H2({ travel_deg: { up: 18.5, down: 16 } }, 'deg', ['LP1', 'LP2'], `${old('AC.deUp/deDn', '22/15 deg')}; ระยะจาก TCDS ของ PC-7 MkII/PC-9 M (T-6: 18/16 [LP5])`));
t2('controls.surfaces.aileron', H2({ travel_deg: { up: 20, down: 11 } }, 'deg', ['LP1', 'LP2', 'LP5'], `${old('AC.daMax', '20 deg (สมมาตร)')}; differential 20/11 ⇒ da เฉลี่ย 15.5° ในซิม; ต้องเพิ่ม Clda คู่กัน (ดู aero.derivatives.Clda)`));
t2('controls.surfaces.rudder', H2({ travel_deg: { left: 24, right: 24 } }, 'deg', ['LP1', 'LP2', 'LP5'], `${old('AC.drMax', '25 deg')}`));
t2('aero.derivatives.Clda', E(0.21, '1/rad', ['LM10', C], `${old('AC.Clda', 0.16)}; คู่กับ da เฉลี่ย 15.5° ให้ Cl สูงสุด 0.057 ≈ เดิม 0.056 (0.16 × 20°) อัตราม้วนเท่าเดิม; lm_derivs ของ PC-9 M ให้ 0.227 (ความเชื่อมั่นต่ำ)`));
t2('gear.legacy', E([{ b: [2.03, 0, 1.36], k: 5.2e4, c: 5.0e3, stroke: 0.22, steer: true }, { b: [-0.28, -1.27, 1.38], k: 1.25e5, c: 1.25e4, stroke: 0.25, brake: true }, { b: [-0.28, 1.27, 1.38], k: 1.25e5, c: 1.25e4, stroke: 0.25, brake: true }],
  'm FRD, N/m, N s/m, m', ['LP5', 'LP10', C], `${old('AC.gear', 'nose x 2.30, main x −0.35, y ±1.55 (track 3.10 m, wheelbase 2.65 m)')}; track 2.54 m และ wheelbase 2.31 m ของคลาส (T-6 TCDS, แผ่นแบบ PC-9 M); สัดส่วนโหลดล้อหน้า 12 % เท่าเดิม; k, c, stroke เท่าเดิม`, { scope: 'gear' }));
t2('propeller.governor.betaFlightIdle', H2(d.prop.beta75_minPitch_pc9m, 'deg @0.75R', ['LP2', C], `${old('propeller.governor.betaFlightIdle', r1leaf('propeller.governor.betaFlightIdle').v)}; min pitch 14° ที่สถานี 30 in ของ HC-D4N/D9512 (ใบพัดเดียวกับรอบที่ 1) แปลงเป็น 0.75R`, { scope: 'propeller' }));
t2('performance.glide', E({ speed_kt: r(Vbg2250, 4), ratio: LDclass }, 'kt CAS', ['LP16', 'LP19', C], 'เป้าใหม่ (รอบที่ 1 ไม่มี path นี้; ซิมวันนี้ให้ L/D 16.5 ที่ 105 kt) จาก polar ของ T-6 ที่ 2,250 kg'));
t2('performance.ROC_SL_fpm', E(ROCt, 'fpm', ['LP9', 'LP12', C], `เป้าใหม่ (ซิมวันนี้ 3,225 fpm) จาก PC-7 MkII 2,840 fpm ที่ 522 kW และ PC-9 4,090 fpm สเกลด้วยกำลังส่วนเกินที่ 2,250 kg 700 kW ⇒ 3,900–4,200`));
t2('speeds.VY_kt', E(125, 'kt CAS', [C], 'เป้าใหม่ (ซิมวันนี้ 128.8 kt)'));
function M2(v, u, src, note) { return L(v, u, src, { conf: 'กลาง', est: false, note }); }
function H2(v, u, src, note, o = {}) { return L(v, u, src, { conf: 'สูง', est: false, note, ...o }); }
cards.trainer_r2 = T2;
// run trainer_r2 through loadType-style resolution (fixture + T2)
const r2card = structuredClone(resolveType({ trainer_r1: fx, trainer_r2: T2 }, 'trainer_r2'));

RES.trainer_r2 = runOne('trainer_r2', r2card, null);
setp(T2, 'validation.currentModel.performance', E(summ(RES.trainer_r2), 'kt, fpm, -, m', ['LM0', C], `${old('validation.currentModel.performance', r1leaf('validation.currentModel.performance').v)}; ผลของโมเดลวันนี้กับข้อเสนอนี้ที่ 2,250 kg (regression)`, { conf: 'สูง' }));
setp(T2, 'validation.currentModel.approach', E(modeSumm(RES.trainer_r2.res.modes.approach, RES.trainer_r2.res.trim.approach), 'rad/s, -, s, deg', ['LM0', C], `เทียบ ${old('validation.currentModel.approach95', 'sp 2.221/0.578, DR 1.611/0.139, τR 0.218 s')}`, { conf: 'สูง' }));

// ── 6. tests ──
const T = [];
const st = (R, k) => R.res.stall[Object.keys(R.res.stall)[k === 'clean' ? 0 : Object.keys(R.res.stall).length - 1]];
const add = (id, cond, qty, exp, tol, src, cur, unit = '') => {
  const pass = typeof exp === 'number' && typeof cur === 'number' ? Math.abs(cur - exp) <= tol : null;
  T.push({ id: `T-LP-${String(T.length + 1).padStart(2, '0')}`, type: id, cond, qty, expected: exp, tol, unit, src, current: cur, pass });
};
const addBand = (id, cond, qty, lo, hi, src, cur, unit = '') => T.push({ id: `T-LP-${String(T.length + 1).padStart(2, '0')}`, type: id, cond, qty, expected: hi >= 1e8 ? `≥ ${lo}` : `${lo}–${hi}`, lo, hi, unit, src, current: cur, pass: typeof cur === 'number' ? cur >= lo && cur <= hi : null });
const R9 = RES.pc9m, R7 = RES.pc7mk2, R6 = RES.t6a, R6c = RES.t6c, R1r = RES.trainer_r1, R2r = RES.trainer_r2;
const kias = x => r(x, 4);
// PC-9 M
add('pc9m', 'MTOW 2,350 kg, 3,000 ft ISA, idle, แฟลป UP ล้อขึ้น, ลดความเร็ว 1 kt/s, ปีกระดับ', 'V_SR 1 g (KEAS ≈ KCAS) = VS ของ TCDS/√0.95', r(77 / Math.sqrt(0.95), 4), 1.5, '[LP2] TCDS F 56-32 77 KCAS; [LM1] nz 0.95', kias(st(R9, 'clean').VSR_eas), 'kt');
add('pc9m', 'เหมือนบน แฟลป LDG 50° ล้อลง', 'V_SR 1 g', r(69 / Math.sqrt(0.95), 4), 1.5, '[LP2] 69 KCAS', kias(st(R9, 'full').VSR_eas), 'kt');
add('pc9m', 'เหมือนบน แฟลป UP', 'Vmin/V_SR ของการทดสอบ 1 kt/s (สมมติฐาน POH → 1 g: √0.95 = 0.975)', 0.975, 0.01, '[LM1]', r(st(R9, 'clean').Vmin_eas / st(R9, 'clean').VSR_eas, 4));
add('pc9m', 'MTOW, SL ISA, กำลังเต็ม 708 kW, clean ล้อขึ้น', 'ROC สูงสุด', 4090, 410, '[LP12][LP13] (น้ำหนักไม่ระบุ; conf ต่ำ)', Math.round(R9.res.climb.ROCmax_fpm), 'fpm');
add('pc9m', 'MTOW, 3,000 ft, แรงขับศูนย์, clean', 'L/D ร่อนสูงสุด', LDclass, 1.0, '[LP16][LP19] polar คลาส T-6 (ค่าประมาณ)', r(R9.res.glide.zeroThrust.LD, 4));
add('pc9m', 'MTOW, approach 95 kt แฟลป LDG ล้อลง γ −3° 300 m', 'short-period ζ (MIL-F-8785C Class I Cat C Level 1: 0.35–1.30)', 0.825, 0.475, '[R1:C12]', r(R9.res.modes.approach.sp?.zeta, 4));
add('pc9m', 'เหมือนบน', 'CAP (Cat C Level 1: 0.16–3.6)', 1.88, 1.72, '[R1:C12]', r(R9.res.modes.approach.CAP, 4), '1/(g s²)');
add('pc9m', 'cruise 200 kt 3,000 ft clean', 'Dutch roll ζ (Class I Cat A Level 1 ≥ 0.19; Cat B/C ≥ 0.08)', 0.19, 0, '[R1:C12] (ผ่านเมื่อ ≥ 0.08)', r(R9.res.modes.cruise.dr?.zeta, 4));
T.at(-1).pass = (R9.res.modes.cruise.dr?.zeta ?? 0) >= 0.08; T.at(-1).expected = '≥ 0.08 (Cat A: ≥ 0.19)';
addBand('pc9m', 'approach 95 kt แฟลป LDG', 'roll mode τR (Level 1 ≤ 1.0 s)', 0.05, 1.0, '[R1:C12]', r(R9.res.modes.approach.roll_tau, 4), 's');
addBand('pc9m', 'approach 95 kt แฟลป LDG', 'spiral: เวลาเพิ่มสองเท่าถ้าลู่ออก (Cat C Level 1 ≥ 12 s; ลู่เข้า = ผ่าน)', 12, 1e9, '[R1:C12]', R9.res.modes.approach.spiral?.grows ? r(R9.res.modes.approach.spiral.t2, 4) : 1e9, 's');
add('pc9m', 'approach 95 kt แฟลป LDG', 'phugoid ζ (Level 1 ≥ 0.04)', 0.04, 0, '[R1:C12]', r(R9.res.modes.approach.ph?.zeta, 4));
T.at(-1).pass = (R9.res.modes.approach.ph?.zeta ?? 0) >= 0.04; T.at(-1).expected = '≥ 0.04';
addBand('pc9m', 'cruise 200 kt, aileron เต็ม (เฉลี่ย 15.5°) ม้วนจาก 0°', 'เวลาถึงมุมเอียง 60° (Class I Cat A Level 1 ≤ 1.3 s)', 0, 1.3, '[R1:C12][LP2]', r(R9.rp.cruise.t, 4), 's');
// PC-7 MkII
add('pc7mk2', 'MTOW 2,250 kg, 3,000 ft ISA, idle, แฟลป UP ล้อขึ้น, 1 kt/s', 'V_SR 1 g = VS/√0.95', r(75 / Math.sqrt(0.95), 4), 1.5, '[LP9] fact sheet 75 KCAS (น้ำหนักสมมติ)', kias(st(R7, 'clean').VSR_eas), 'kt');
add('pc7mk2', 'เหมือนบน แฟลป LDG ล้อลง', 'V_SR 1 g', r(67 / Math.sqrt(0.95), 4), 1.5, '[LP9] 67 KCAS', kias(st(R7, 'full').VSR_eas), 'kt');
add('pc7mk2', 'MTOW, SL ISA, 522 kW, clean', 'ROC สูงสุด', 2840, 284, '[LP9]', Math.round(R7.res.climb.ROCmax_fpm), 'fpm');
add('pc7mk2', 'MTOW, SL ISA ลมสงบ ผิวแห้ง, แฟลป TO, VR 76 kt (ค่าประมาณ), pitch 10°', 'ระยะวิ่งขึ้นถึง 50 ft', 415, 62, '[LP9] (±15 %)', Math.round(R7.res.takeoff?.dist50ft_m ?? NaN), 'm');
add('pc7mk2', 'MTOW, SL ISA ลมสงบ, autoland แฟลป LDG, เบรกเต็มหลังแตะพื้น', 'ระยะลงจอดจาก 50 ft', 674, 101, '[LP9] (±15 %)', Math.round(R7.res.landing?.maxBrake?.total_m ?? NaN), 'm');
// T-6A
add('t6a', 'MTOW 6,500 lb (2,948 kg), 3,000 ft ISA, idle, แฟลป UP ล้อขึ้น, 1 kt/s', 'V_SR 1 g (ตรวจความสอดคล้องของบัตร)', r(d.t6a.VS1 / Math.sqrt(0.95), 4), 1.5, '[LP27] ค่าประมาณจาก CL ของ PC-9 M', kias(st(R6, 'clean').VSR_eas), 'kt');
add('t6a', 'เหมือนบน แฟลป LDG ล้อลง', 'V_SR 1 g', r(d.t6a.VS0 / Math.sqrt(0.95), 4), 1.5, '[LP27]', kias(st(R6, 'full').VSR_eas), 'kt');
add('t6a', 'MTOW, 3,000 ft, แรงขับศูนย์ (ใบพัด feather จำลอง), clean', 'L/D ร่อนสูงสุด', LDclass, 1.5, '[LP16][LP19]', r(R6.res.glide.zeroThrust.LD, 4));
add('t6a', 'เหมือนบน', 'ความเร็วร่อนดีที่สุด Vbg', d.t6a.glideV_MTOW, 6, '[LP16][LP19] 125 KIAS ที่ ~6,000 lb สเกลเป็น MTOW', r(R6.res.glide.zeroThrust.Vbg_kt, 4), 'kt');
add('t6a', 'MTOW, SL ISA, 820 kW, clean', 'ROC สูงสุด', 3100, 465, '[LP23] (±15 %, conf ต่ำ)', Math.round(R6.res.climb.ROCmax_fpm), 'fpm');
for (const [ias, tq, th] of [[150, 0.32, 2], [200, 0.53, 0], [250, 0.93, -2]]) {
  const lv = R6.level.find(x => x.ias === ias);
  add('t6a', `น้ำหนักฝึก ${Math.round(TM.t6a)} kg (ค่าประมาณ), 3,000 ft, บินระดับ ${ias} KIAS clean`, 'thr ของซิม ≈ สัดส่วน torque', tq, 0.12, '[LP15] ตารางบินระดับ', lv.thr);
  add('t6a', 'เหมือนบน', 'pitch θ', th, 1.5, '[LP15]', lv.theta_deg, 'deg');
}
add('t6a', 'MTOW, แฟลป TO, VR 85 KIAS, pitch 8.5°, SL ISA', 'ระยะวิ่งขึ้นถึง 50 ft (เทียบ takeoff distance 1,775 ft = 541 m)', 541, 108, '[LP22] (นิยามไม่ชัด ±20 %, conf ต่ำ)', Math.round(R6.res.takeoff?.dist50ft_m ?? NaN), 'm');
// T-6C
add('t6c', 'MTOW 6,900 lb (3,130 kg), 3,000 ft, idle, แฟลป LDG ล้อลง, 1 kt/s', 'V_SR 1 g', r(d.t6c.VS0 / Math.sqrt(0.95), 4), 1.5, '[LP27] ค่าประมาณ', kias(st(R6c, 'full').VSR_eas), 'kt');
addBand('t6c', 'VREF = 1.3 VS0 ที่ MTOW', 'ICAO approach category B (91–120 kt)', 91, 120, '[LP27] ICAO Doc 8168', r(1.3 * d.t6c.VS0, 4), 'kt');
// round-1 trainer (today's sim) against the class
addBand('trainer_r1', 'AC ปัจจุบัน 2,250 kg, 3,000 ft, แรงขับศูนย์, clean', 'L/D ร่อนสูงสุด (คลาส 9.8–13.2)', d.t6a.glideLD.low, d.t6a.glideLD.high, '[LP16][LP19]', r(R1r.res.glide.zeroThrust.LD, 4));
addBand('trainer_r1', 'เหมือนบน แต่ thr = idle 0.045', 'L/D ร่อนที่ idle (คลาส ≤ 13.2)', 0, d.t6a.glideLD.high, '[LP16][LP19]', r(R1r.res.glide.idle.LD, 4));
addBand('trainer_r1', 'AC ปัจจุบัน 2,250 kg, SL ISA, 700 kW, clean', 'ROC สูงสุด (คลาสที่ 2,250 kg 700 kW: 3,600–4,300, ค่าประมาณจาก lp_review.mjs)', 3600, 4300, '[LP9][LP12] + สเกลกำลังส่วนเกิน η 0.75–0.85 (ค่าประมาณ)', Math.round(R1r.res.climb.ROCmax_fpm), 'fpm');
addBand('trainer_r1', 'AC ปัจจุบัน 2,250 kg, Vref 88 kt', 'Vref / VS0 แบบ POH (VS0 = V_SR แฟลปสุดของซิม × √0.95) (≥ 1.3)', 1.29, 1.40, '[LM25] AFH: VREF = 1.3 VS0; [LM1] VS0 = ความเร็วต่ำสุดของการทดสอบ 1 kt/s', r(88 / (st(R1r, 'full').VSR_eas * Math.sqrt(0.95)), 4));
addBand('trainer_r1', 'AC ปัจจุบัน 2,250 kg, แฟลปสุด idle 1 kt/s', 'VSR แฟลปสุด (คลาส 1 g ที่ 2,250 kg: PC-9 M 69.3, PC-7 MkII 68.7)', 67.5, 70.5, '[LP2][LP9]', r(st(R1r, 'full').VSR_eas, 4), 'kt');
addBand('trainer_r1', 'AC ปัจจุบัน', 'Rx = √(Ixx/m)/(b/2) (ช่วงของโมเดลคลาส JSBSim pc7/t6texan2 0.219–0.303)', 0.219, 0.303, '[LM15]', r(Math.sqrt(2600 / 2250) / 5.1, 4));
addBand('trainer_r1', 'AC ปัจจุบัน', 'ระยะ track ล้อหลัก (คลาส 2.54 m ± 0.10)', 2.44, 2.64, '[LP5][LP10]', 3.10, 'm');
addBand('trainer_r1', 'AC ปัจจุบัน', 'wing loading (คลาส 138–192 kg/m²)', 138, 192.5, '[LP1][LP2][LP5][LP8]', r(2250 / 16.3, 4), 'kg/m²');
addBand('trainer_r1', 'AC ปัจจุบัน approach 95 kt แฟลปสุด', 'เวลาถึงมุมเอียง 30° (Class I Cat C Level 1 ≤ 1.3 s)', 0, 1.3, '[R1:C12]', r(R1r.rp.approach.t, 4), 's');
// trainer_r2 proposal
addBand('trainer_r2', 'ข้อเสนอ 2,250 kg, 3,000 ft, แรงขับศูนย์', 'L/D ร่อนสูงสุด', d.t6a.glideLD.low, d.t6a.glideLD.high, '[LP16][LP19]', r(R2r.res.glide.zeroThrust.LD, 4));
add('trainer_r2', 'ข้อเสนอ 2,250 kg, SL ISA', 'ROC สูงสุด', ROCt, 200, '[LP27] เป้าคลาส', Math.round(R2r.res.climb.ROCmax_fpm), 'fpm');
add('trainer_r2', 'ข้อเสนอ 2,250 kg, แฟลปสุด idle 1 kt/s', 'VSR แฟลปสุด', VS0t, 1.0, '[LP2]', r(st(R2r, 'full').VSR_eas, 4), 'kt');
addBand('trainer_r2', 'ข้อเสนอ, Vref 88 kt (คงเดิม)', 'Vref / VS0 แบบ POH (VS0 = V_SR แฟลปสุดของซิม × √0.95) (≥ 1.3)', 1.29, 1.40, '[LM25][LM1]', r(R2r.ac.Vref / (st(R2r, 'full').VSR_eas * Math.sqrt(0.95)), 4));
addBand('trainer_r2', 'ข้อเสนอ approach 95 kt แฟลปสุด', 'roll mode τR (≤ 1.0 s)', 0.05, 1.0, '[R1:C12]', r(R2r.res.modes.approach.roll_tau, 4), 's');
addBand('trainer_r2', 'ข้อเสนอ แฟลปสุด ล้อลง ISA+16 ที่ Vapp', 'excess T/W (รอบที่ 1 = 0.218)', 0.15, 0.30, '[R1] นิยาม wind.fFactor.trainerExcessTW', r(RES.trainer_r2.xs, 4));
add('trainer_r2', 'ข้อเสนอ, SL ISA ลมสงบ, flap 0, VR ของ fixture', 'ระยะวิ่งขึ้นถึง 50 ft (คลาสที่ 700 kW: PC-7 MkII 415 m × (522/700)^(2/3) = 341 m, ค่าประมาณจาก lp_review.mjs)', 341, 68, '[LP9] + สเกลแรงขับสถิต (±20 %)', Math.round(R2r.res.takeoff?.dist50ft_m ?? NaN), 'm');
addBand('trainer_r2', 'ข้อเสนอ Ixx 3,700 kg m², 2,250 kg', 'Rx = √(Ixx/m)/(b/2) (ช่วงคลาส 0.219–0.303)', 0.219, 0.303, '[LM15]', r(Math.sqrt(val(r2card, 'airframe.inertia.Ixx') / 2250) / 5.1, 4));
addBand('trainer_r2', 'ข้อเสนอ gear.legacy', 'ระยะ track ล้อหลัก (คลาส 2.54 m ± 0.10)', 2.44, 2.64, '[LP5][LP10]', r(2 * Math.abs(val(r2card, 'gear.legacy')[1].b[1]), 4), 'm');

// ── 7. write ──
const strip = R => ({ ac: Object.fromEntries(Object.entries(R.ac).filter(([k]) => k !== 'gear').map(([k, v]) => [k, r(v, 5)])), gear: R.ac.gear, info: R.info, summ: summ(R),
  modes: { approach: modeSumm(R.res.modes.approach, R.res.trim.approach), cruise: modeSumm(R.res.modes.cruise, R.res.trim.cruise) }, stall: R.res.stall, climb: R.res.climb, glide: R.res.glide,
  takeoff: R.res.takeoff, landing: R.res.landing, alpha: R.al, excessTW: r(R.xs, 4), roll: R.rp, climbTM: R.climbTM ?? null, level: R.level ?? null });
const report = { fits: Object.fromEntries(Object.entries(fits).map(([k, f]) => [k, { legacy: f.legacy, notes: f.notes, targets: f.targets }])), trainer_r2_fit: { legacy: fit2.legacy, notes: fit2.notes, targets: fit2.targets },
  results: Object.fromEntries(Object.entries(RES).map(([k, R]) => [k, strip(R)])), class: { VS1t, VS0t, Vbg2250: r(Vbg2250, 4), CLstar: r(CLstar, 4), pol } };
fs.writeFileSync(out('lp_check.json'), JSON.stringify(report, (k, v) => (typeof v === 'number' ? +v.toPrecision(6) : v), 1));
fs.writeFileSync(out('lp_tests.json'), JSON.stringify(T, null, 1));
const fmtv = v => (typeof v === 'number' ? (Math.abs(v) >= 100 ? Math.round(v).toLocaleString('en-US') : String(+v.toFixed(3))) : String(v));
const md = ['| รหัส | เงื่อนไข | ปริมาณที่วัด | ผลคาดหวัง ± tolerance | ที่มา | โมเดลปัจจุบัน |', '|---|---|---|---|---|---|',
  ...T.map(t => `| ${t.id} | \`${t.type}\` ${t.cond} | ${t.qty} | ${typeof t.expected === 'number' ? `${fmtv(t.expected)} ± ${fmtv(t.tol)}` : t.expected} ${t.unit} | ${t.src} | ${fmtv(t.current)} ${t.unit} (${t.pass === true ? 'ผ่าน' : t.pass === false ? 'ไม่ผ่าน' : '–'}) |`)];
fs.writeFileSync(out('lp_tests.md'), md.join('\n') + '\n');
fs.writeFileSync(out('lp_cards.json'), JSON.stringify(cards, null, 1));
fs.writeFileSync(out('lp_json_blocks.md'), blocksMd(cards));
console.log(`tests ${T.length}: pass ${T.filter(t => t.pass === true).length}, fail ${T.filter(t => t.pass === false).length}`);
for (const t of T) console.log(t.id, t.type, '|', t.qty.slice(0, 50), '| exp', t.expected, t.tol ?? '', '| cur', t.current, t.pass);
for (const [k, f] of Object.entries(fits)) console.log(k, JSON.stringify(f.legacy.propulsion), f.notes.join(' | '));
console.log('trainer_r2', JSON.stringify(prop2), fit2.notes.join(' | '));
