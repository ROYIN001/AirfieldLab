// Step 7 — validation of the fictional trainer against public reference numbers for its class and against the
// MIL-F-8785C handling-qualities levels. ISA sea level, 2,250 kg unless stated.
// Public references (class comparisons; the sim aircraft is not any of these types):
//  [1] Pilatus PC-9 M type certificate data sheet, Swiss FOCA (BAZL) TCDS F56-32: stall 77 KCAS flaps up and
//      69 KCAS flaps down at 2,350 kg → scaled by √(2250/2350) to this trainer's weight: 75.3 / 67.5 KCAS.
//  [2] Pilatus PC-9 (950 shp) specifications as published (e.g. Wikipedia "Pilatus PC-9"): rate of climb
//      4,090 ft/min; take-off distance over 50 ft 391 m; landing distance over 50 ft 700 m, sea level.
//  [3] T-6A Texan II (1,100 shp, ≈ 2,900 kg): initial climb 3,100 ft/min (US Air Force fact sheet);
//      best rate-of-climb speed 140 KIAS (US Navy flight manual).
//  [4] MIL-F-8785C, Military Specification: Flying Qualities of Piloted Airplanes (US DoD, 1980), Class I,
//      Flight Phase Categories B (cruise) and C (approach), Level 1 limits.
//  No public glide ratio was found for the class; the glide band below is a design estimate.
import { M, trimmed, onRunway, run, DT } from './lib/sim.mjs';
import { linearModes } from './lib/linear.mjs';
import { check, within, f1, done } from './lib/check.mjs';
const { AC, KT, FT, DEG, RAD, G0, FIELD, Flight, SCENARIOS, clamp, wrapPi, setActiveRunway } = M;
setActiveRunway('21R');

// ── stall speeds: α raised 0.3°/s (≈ 1 kt/s), power idle, minimum speed reached ──
function stallSpeed(flaps) {
  const { ac, tr } = trimmed({ ias: 100, flaps, gear: flaps ? 1 : 0, h: 300, pcl: 0.2 });
  ac.cmd.thr = 0; let aCmd = ac.air.alpha, aI = tr.de, vMin = 1e9;
  const aS = (AC.aStall + AC.aStallFlap * flaps) * DEG;
  for (let i = 0; i < 240 * 90; i++) {
    const a = ac.air; aCmd += 0.3 * DEG * DT;
    const e = aCmd - a.alpha; aI = clamp(aI - 1.5 * e * DT, -AC.deUp, AC.deDn);
    ac.cmd.de = clamp(aI - 1.2 * e + 0.6 * a.q, -AC.deUp, AC.deDn);
    ac.cmd.da = clamp(-a.phi - 0.3 * a.p, -AC.daMax, AC.daMax); ac.cmd.dr = clamp(-1.2 * a.beta, -AC.drMax, AC.drMax);
    vMin = Math.min(vMin, a.ias / KT);
    if (a.stall > 0.3 || (a.q < -2 * DEG && a.alpha > aS - 4 * DEG)) break;
    ac.step(DT);
  }
  return vMin;
}
const vs1 = stallSpeed(0), vs0 = stallSpeed(1);
check('Vs1 (clean, idle) vs PC-9 M 75.3 KCAS [1]', Math.abs(vs1 - 75.3) <= 4, `${f1(vs1)} KIAS`);
check('Vs0 (landing flaps, idle) vs PC-9 M 67.5 KCAS [1]', Math.abs(vs0 - 67.5) <= 4, `${f1(vs0)} KIAS`);
check('Vref = 1.23–1.35 Vs0', within(AC.Vref / vs0, 1.23, 1.35), `Vref ${AC.Vref} kt = ${f1(AC.Vref / vs0, 2)} Vs0`);

// ── best rate of climb: clean, maximum power ──
let best = { roc: 0 };
for (let ias = 90; ias <= 190; ias += 5) {
  const { tr, tas } = trimmed({ ias, pcl: 1, h: 50 });
  const roc = tas * Math.sin(tr.gamma) / FT * 60;
  if (roc > best.roc) best = { roc, ias, dr: tr.dr };
}
check('best rate of climb between T-6A 3,100 [3] and PC-9 4,090 ft/min [2] (+5 %)', within(best.roc, 3100, 4300), `${f1(best.roc, 0)} ft/min at ${best.ias} KIAS`);
check('best-rate-of-climb speed near T-6A 140 KIAS [3]', within(best.ias, 120, 150), `${best.ias} KIAS (rudder ${f1(best.dr * RAD)}°)`);

// ── glide at flight idle (propeller windmilling on the fine-pitch stop), clean ──
let bg = { ld: 0 };
for (let ias = 75; ias <= 150; ias += 5) { const { tr } = trimmed({ ias, pcl: 0, h: 600 }); const ld = 1 / Math.tan(-tr.gamma); if (ld > bg.ld) bg = { ld, ias }; }
check('best glide ratio at flight idle (design estimate 10–14)', within(bg.ld, 10, 14), `${f1(bg.ld)} : 1 at ${bg.ias} KIAS`);

// ── take-off: TO flaps, run up against the brakes, rotate at 78 KIAS to 10° nose up ──
{
  const ac = onRunway(0, { flaps: AC.flapNotch[1] });
  ac.cmd.thr = 1; run(ac, 5);
  const s0 = ac.air.s, hdg = FIELD.rwyHdg * DEG; let roll = null, d50 = null, thI = 0, vLof = 0;
  ac.cmd.brake = 0;
  for (let i = 0; i < 240 * 60 && d50 == null; i++) {
    const a = ac.air;
    ac.cmd.dr = clamp(1.4 * wrapPi(a.psi - hdg) + 0.6 * a.r + 0.02 * a.t, -AC.drMax, AC.drMax);
    ac.cmd.da = clamp(-1.2 * a.phi - 0.3 * a.p, -AC.daMax, AC.daMax);
    if (a.ias / KT < 78 && a.onGround) ac.cmd.de = 0;
    else { const e = 10 * DEG - a.theta; thI = clamp(thI - 0.6 * e * DT, -AC.deUp, AC.deDn); ac.cmd.de = clamp(thI - 2 * e + 0.85 * a.q, -AC.deUp, AC.deDn); }
    if (roll == null && !a.onGround) { roll = a.s - s0; vLof = a.ias / KT; }
    if (a.hWheel > 50 * FT) d50 = a.s - s0;
    ac.step(DT);
  }
  check('take-off ground roll (PC-9 class: 230–250 m published run)', within(roll, 180, 350), `${f1(roll, 0)} m, lift-off at ${f1(vLof, 0)} KIAS`);
  check('take-off distance over 50 ft vs PC-9 391 m [2]', within(d50, 300, 520), `${f1(d50, 0)} m`);
  check('no tail strike on rotation', !ac.air.hard.tail);
}

// ── landing: autopilot approach, Vref over the threshold, maximum braking without a skid ──
{
  const f = new Flight({ wind: SCENARIOS.calm, oatC: 15, pilot: 'ap', seed: 2, dist: 3000 });
  const upd = f.ap.update.bind(f.ap), st = { grip: 0, relief: 0 };
  f.ap.update = (dt) => {   // the pilot brakes as hard as the tyres allow once the nose wheel is down
    const c = upd(dt), a = f.ac.air;
    if (f.ap.tTd != null) c.brake = a.wow[0] && f.ac.t - f.ap.tTd > 1 ? M.brakeLikeAPilot(st, a, dt, 1) : 0;
    return c;
  };
  let s50 = null, v50 = 0;
  while (!f.ev.done && f.ac.t < 300) { f.tick(DT); const a = f.ac.air; if (s50 == null && a.hWheel < 50 * FT) { s50 = a.s; v50 = a.ias / KT; } }
  const td = f.ev.td, total = f.ev.stopS - s50, gr = f.ev.stopS - td.s;
  check('landing distance from 50 ft vs PC-9 700 m [2]', within(total, 450, 800), `${f1(total, 0)} m (50 ft at ${f1(v50, 0)} KIAS)`);
  check('landing ground roll with maximum braking', within(gr, 200, 450) && f.ac.skids === 0, `${f1(gr, 0)} m, touchdown ${f1(td.ias, 0)} KIAS`);
}

// ── linearised modes vs MIL-F-8785C Class I, Level 1 [4] ──
for (const [cat, o] of [['C (approach 95 KIAS, LDG flaps, gear down)', { ias: 95, gamma: -3, flaps: 1, gear: 1, h: 300 }], ['B (cruise 160 KIAS, clean)', { ias: 160, flaps: 0, gear: 0, h: 1500 }]]) {
  const C = cat[0] === 'C';
  const { ac } = trimmed(o);
  const m = linearModes(M, ac);
  const nAlpha = ac.air.qbar * AC.S * AC.CLa / (AC.m * G0), cap = m.sp.wn ** 2 / nAlpha;
  console.log(`  Cat ${cat}: short period ω ${f1(m.sp.wn, 2)} rad/s ζ ${f1(m.sp.zeta, 2)}, phugoid ω ${f1(m.ph.wn, 3)} ζ ${f1(m.ph.zeta, 3)}, Dutch roll ω ${f1(m.dr.wn, 2)} ζ ${f1(m.dr.zeta, 3)}, roll τ ${f1(m.roll.tau, 2)} s, spiral ${m.spiral.re < 0 ? 'stable, τ ' + f1(m.spiral.tau, 0) + ' s' : 'doubles in ' + f1(m.spiral.t2, 0) + ' s'}`);
  check(`Cat ${cat[0]}: short-period damping`, C ? within(m.sp.zeta, 0.35, 1.30) : within(m.sp.zeta, 0.30, 2.0), f1(m.sp.zeta, 2));
  check(`Cat ${cat[0]}: control anticipation parameter`, C ? within(cap, 0.16, 3.6) : within(cap, 0.085, 3.6), `${f1(cap, 2)} (rad/s)²/g`);
  check(`Cat ${cat[0]}: phugoid damping ≥ 0.04`, m.ph.zeta >= 0.04, f1(m.ph.zeta, 3));
  check(`Cat ${cat[0]}: Dutch roll ζ ≥ 0.08, ζω ≥ 0.15, ω ≥ ${C ? '1.0' : '0.4'}`, m.dr.zeta >= 0.08 && m.dr.zeta * m.dr.wn >= 0.15 && m.dr.wn >= (C ? 1.0 : 0.4), `ζ ${f1(m.dr.zeta, 3)}, ζω ${f1(m.dr.zeta * m.dr.wn, 3)}, ω ${f1(m.dr.wn, 2)}`);
  check(`Cat ${cat[0]}: roll-mode time constant ≤ ${C ? '1.0' : '1.4'} s`, m.roll.tau > 0 && m.roll.tau <= (C ? 1.0 : 1.4), `${f1(m.roll.tau, 2)} s`);
  check(`Cat ${cat[0]}: spiral time to double ≥ ${C ? 12 : 20} s`, m.spiral.re < 0 || m.spiral.t2 >= (C ? 12 : 20), m.spiral.re < 0 ? 'stable' : `${f1(m.spiral.t2, 0)} s`);
}
done();
