// Step 5 — stall: CLmax and stall speeds, buffet margin, wing drop (which wing, how far), departure with
// pro-spin controls, elevator authority in the stall, and recovery.
import { M, trimmed, DT } from './lib/sim.mjs';
import { check, within, f1, done } from './lib/check.mjs';
const { Aircraft, AC, DEG, RAD, KT, G0, clamp } = M;

// CL(α) sweep for clean and landing flaps; 1 g stall speed (ISA sea level)
const ac0 = new Aircraft();
for (const f of [0, 1]) {
  ac0.flaps = f; let best = { CL: 0 };
  const row = [];
  for (let a = 0; a <= 22; a += 0.5) {
    const th = a * DEG, V = 45, qq = [Math.cos(th / 2), 0, Math.sin(th / 2), 0];
    ac0.x.set([0, 0, -500, V, 0, 0, qq[0], qq[1], qq[2], qq[3], 0, 0, 0]);
    const d = { wow: [0, 0, 0], load: [0, 0, 0], vl: [0, 0, 0], vw: [0, 0, 0], mu: [0, 0, 0], hard: {} }; ac0.deriv(ac0.x, new Float64Array(13), d);
    if (d.CL > best.CL) best = { CL: d.CL, a };
    if (a % 2 === 0) row.push(`${a}°:${d.CL.toFixed(2)}`);
  }
  const vs = Math.sqrt(2 * AC.m * G0 / (1.225 * AC.S * best.CL)) / KT;
  console.log(`  flaps ${f}: ${row.join(' ')}`);
  check(`CLmax ${f ? 'landing flaps' : 'clean'}`, f ? within(best.CL, 1.55, 1.8) : within(best.CL, 1.25, 1.45), `${f1(best.CL, 2)} at ${best.a}° → 1 g Vs ${f1(vs)} kt`);
  // buffet onset at 1 g: 5–10 kt above the stall, the band 14 CFR 23.207 sets for a stall warning
  const ab = M.buffetAlpha(f), th = ab, qq = [Math.cos(th / 2), 0, Math.sin(th / 2), 0];
  ac0.x.set([0, 0, -500, 45, 0, 0, qq[0], qq[1], qq[2], qq[3], 0, 0, 0]);
  const d = { wow: [0, 0, 0], load: [0, 0, 0], vl: [0, 0, 0], vw: [0, 0, 0], mu: [0, 0, 0], hard: {} }; ac0.deriv(ac0.x, new Float64Array(13), d);
  const vw = Math.sqrt(2 * AC.m * G0 / (1.225 * AC.S * d.CL)) / KT;
  check(`buffet (stall warning) margin at 1 g, ${f ? 'landing flaps' : 'clean'}`, within(vw - vs, 5, 10), `from α ${f1(ab * RAD)}°, ${f1(vw)} kt (+${f1(vw - vs)} kt)`);
}

// Stall manoeuvre: power idle, ball centred, α raised 0.3°/s (≈ 1 kt/s near the stall), wings held level.
// mode: 'prompt' (recover at the break), 'pull' (keep full aft stick 2 s), 'spin' (full aft stick + full rudder 6 s)
function stallRun({ flaps = 0, seed = 1, mode = 'prompt', rud = 1 }) {
  const { ac, tr } = trimmed({ ias: 100, flaps, gear: flaps ? 1 : 0, h: 1500, seed, pcl: 0.2 });
  ac.cmd.thr = 0;
  const aS = (AC.aStall + AC.aStallFlap * flaps) * DEG;
  let aCmd = ac.air.alpha, tBreak = null, vBuf = null, vMin = 1e9, h0 = 0, hMin = 1e9, maxPhi = 0, phiAtMax = 0, maxR = 0;
  let alphas = [], phase = 'entry', aI = tr.de, recovered = false, rSum = 0;
  const track = (a) => { if (Math.abs(a.phi) > maxPhi) { maxPhi = Math.abs(a.phi); phiAtMax = a.phi; } maxR = Math.max(maxR, Math.abs(a.r)); rSum += a.r; };
  for (let i = 0; i < 240 * 120; i++) {
    const a = ac.air, t = i * DT, ias = a.ias / KT;
    if (phase === 'entry') {
      // raise α by 0.3°/s with an α-hold loop (≈ 1 kt/s deceleration near the stall); wings level, ball centred
      aCmd += 0.3 * DEG * DT;
      const e = aCmd - a.alpha; aI = clamp(aI - 1.5 * e * DT, -AC.deUp, AC.deDn);
      ac.cmd.de = clamp(aI - 1.2 * e + 0.6 * a.q, -AC.deUp, AC.deDn);
      ac.cmd.da = clamp(-1.0 * a.phi - 0.3 * a.p, -AC.daMax, AC.daMax); ac.cmd.dr = clamp(-1.2 * a.beta, -AC.drMax, AC.drMax);
      if (vBuf == null && a.buffet > 0.1) vBuf = ias;
      vMin = Math.min(vMin, ias);
      if (a.stall > 0.3 || (a.q < -2 * DEG && a.alpha > aS - 4 * DEG) || ac.de <= -AC.deUp + 1e-4) { tBreak = t; h0 = a.h; phase = mode === 'prompt' ? 'recover' : 'hold'; }
    } else if (phase === 'hold') {
      ac.cmd.de = -AC.deUp; ac.cmd.da = 0;
      ac.cmd.dr = mode === 'spin' ? -rud * AC.drMax : clamp(-1.2 * a.beta, -AC.drMax, AC.drMax);
      alphas.push(a.alpha); track(a);
      if (t - tBreak > (mode === 'spin' ? 6 : 2)) phase = 'recover';
    } else if (phase === 'recover') {
      // release the back pressure, stop the yaw with rudder, keep the wings level; power once flying again
      ac.cmd.de = tr.de;
      ac.cmd.dr = clamp(2.5 * a.r - 1.2 * a.beta, -AC.drMax, AC.drMax);
      const unst = a.aMax < aS - 5 * DEG;
      ac.cmd.da = mode === 'prompt' || unst ? clamp(-1.2 * a.phi - 0.3 * a.p, -AC.daMax, AC.daMax) : 0;
      if (mode === 'prompt') track(a);
      if (unst && Math.abs(a.phi) < 45 * DEG) { phase = 'pullout'; aI = ac.de; ac.cmd.thr = 1; }
    } else {
      // pull out at a safe α (no secondary stall) with wings level, then climb away
      const aCmd = aS - 7 * DEG, e = a.alpha - aCmd;
      aI = clamp(aI + 1.5 * e * DT, -AC.deUp, AC.deDn);
      ac.cmd.de = clamp(aI + 1.2 * e + 0.6 * a.q, -AC.deUp, AC.deDn);
      ac.cmd.da = clamp(-1.2 * a.phi - 0.3 * a.p, -AC.daMax, AC.daMax); ac.cmd.dr = clamp(-1.2 * a.beta, -AC.drMax, AC.drMax);
      if (a.vs > 0 && a.stall < 0.05) { recovered = true; break; }
    }
    if (tBreak != null) hMin = Math.min(hMin, a.h);
    ac.step(DT);
  }
  const aHold = alphas.length ? alphas.slice(-240).reduce((s, v) => s + v, 0) / Math.min(240, alphas.length) : 0;
  return { vBuf, vMin, maxPhi, phiAtMax, maxR, loss: h0 - hMin, aHold, asym: ac.asym, recovered, yawDir: Math.sign(rSum) };
}

for (const [flaps, name, lo, hi] of [[0, 'clean (Vs1)', 73, 80], [1, 'landing flaps (Vs0)', 63, 71]]) {
  const r = stallRun({ flaps, mode: 'prompt' });
  check(`stall speed ${name}, 1 kt/s entry, idle`, within(r.vMin, lo, hi), `${f1(r.vMin)} KIAS`);
  check(`buffet felt before the stall in the manoeuvre, ${name}`, within(r.vBuf - r.vMin, 3, 12), `buffet from ${f1(r.vBuf)} kt (${f1(r.vBuf - r.vMin)} kt margin)`);
  check(`coordinated stall, prompt recovery: wings stay nearly level, ${name}`, r.maxPhi < 12 * DEG, `max bank ${f1(r.maxPhi * RAD)}°`);
  check(`prompt recovery height loss, ${name}`, r.loss < 110, `${f1(r.loss, 0)} m (${f1(r.loss / 0.3048, 0)} ft)`);
}
for (const seed of [1, 2]) {
  const r = stallRun({ seed, mode: 'pull' });
  const toward = Math.sign(r.phiAtMax) === -Math.sign(r.asym);   // asym > 0: the left half stalls first
  check(`stick held back: a wing drops (seed ${seed})`, within(r.maxPhi * RAD, 8, 70) && toward, `${f1(r.phiAtMax * RAD)}° (${r.asym > 0 ? 'left' : 'right'} half stalls first)`);
  check(`stick held back: elevator can only hold a mushing stall (seed ${seed})`, within(r.aHold * RAD, 16, 30), `mean α ${f1(r.aHold * RAD)}°`);
}
// landing flaps, stick held back, feet off: the nose yaws toward the dropping (stalled) wing
{
  const { ac, tr } = trimmed({ ias: 95, flaps: 1, gear: 1, h: 1500, seed: 1, pcl: 0.2 });
  ac.cmd.thr = 0; let aCmd = ac.air.alpha, aI = tr.de, tB = null, rSum = 0, n = 0;
  const aS = (AC.aStall + AC.aStallFlap) * DEG;
  for (let i = 0; i < 240 * 60; i++) {
    const a = ac.air;
    if (tB == null) {
      aCmd += 0.3 * DEG * DT; const e = aCmd - a.alpha; aI = clamp(aI - 1.5 * e * DT, -AC.deUp, AC.deDn);
      ac.cmd.de = clamp(aI - 1.2 * e + 0.6 * a.q, -AC.deUp, AC.deDn); ac.cmd.da = clamp(-a.phi - 0.3 * a.p, -AC.daMax, AC.daMax); ac.cmd.dr = 0;
      if (a.stall > 0.3 || (a.q < -2 * DEG && a.alpha > aS - 4 * DEG)) tB = i * DT;
    } else { ac.cmd.de = -AC.deUp; ac.cmd.da = 0; ac.cmd.dr = 0; rSum += a.r; n++; if (i * DT - tB > 0.75) break; }
    ac.step(DT);
  }
  const drop = Math.sign(ac.air.phi), yaw = Math.sign(rSum);
  check('wing drop with landing flaps: the nose yaws toward the low wing', n > 0 && drop !== 0 && yaw === drop, `bank ${f1(ac.air.phi * RAD)}°, mean yaw rate ${f1(rSum / Math.max(n, 1) * RAD, 2)}°/s`);
}
for (const rud of [1, -1]) {
  const r = stallRun({ seed: 1, mode: 'spin', rud });
  check(`pro-spin controls depart ${rud > 0 ? 'right' : 'left'}`, r.maxR > 15 * DEG && r.maxPhi > 60 * DEG && r.yawDir === rud, `yaw rate ${f1(r.maxR * RAD)}°/s, bank ${f1(r.phiAtMax * RAD)}°`);
  check(`recovery from the departure`, r.recovered && r.loss < 900, `height loss ${f1(r.loss, 0)} m`);
}
done();
