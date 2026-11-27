// ───────────────────────── HUD, ILS / PAPI widget and debrief charts (2D canvas) ─────────────────────────
const HUD_GREEN = 'rgba(126,255,158,0.95)';
const _pv = new THREE.Vector3();
function projectDir(cam, dir, w, h) {           // world direction from the camera → screen px (null if behind)
  _pv.copy(cam.position).addScaledVector(dir, 2000).project(cam);
  if (_pv.z > 1) return null;
  return [(_pv.x + 1) / 2 * w, (1 - _pv.y) / 2 * h];
}
function projectPt(cam, p, w, h) {
  _pv.copy(p).project(cam);
  if (_pv.z > 1 || _pv.z < -1) return null;
  return [(_pv.x + 1) / 2 * w, (1 - _pv.y) / 2 * h];
}
const dirAzEl = (az, el) => new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el));
const fmt = (v, d = 0) => (Number.isFinite(v) ? v.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d }) : '—');

function drawHUD(ctx, w, h, dpr, cam, fl, guide) {
  const ac = fl.ac, a = ac.air;
  ctx.save();
  ctx.strokeStyle = HUD_GREEN; ctx.fillStyle = HUD_GREEN; ctx.lineWidth = 1.6 * dpr;
  ctx.shadowColor = 'rgba(80,255,120,0.55)'; ctx.shadowBlur = 4 * dpr;
  const fs = Math.round(13 * dpr);
  ctx.font = `${fs}px "B612 Mono", ui-monospace, monospace`; ctx.textBaseline = 'middle';
  const psi = a.psi;
  // horizon and pitch ladder (conformal)
  const line = (p, q, dash) => { if (!p || !q) return; ctx.setLineDash(dash ? [6 * dpr, 5 * dpr] : []); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); };
  line(projectDir(cam, dirAzEl(psi - 0.6, 0), w, h), projectDir(cam, dirAzEl(psi + 0.6, 0), w, h));
  for (let el = -15; el <= 20; el += 5) {
    if (el === 0) continue;
    const e = el * DEG, g1 = 0.022, g2 = 0.075;
    for (const sg of [-1, 1]) {
      const p = projectDir(cam, dirAzEl(psi + sg * g1, e), w, h), q = projectDir(cam, dirAzEl(psi + sg * g2, e), w, h);
      line(p, q, el < 0);
      if (q) { ctx.textAlign = sg < 0 ? 'right' : 'left'; ctx.fillText(String(Math.abs(el)), q[0] + sg * 6 * dpr, q[1]); }
    }
  }
  // −3° glide-path reference
  ctx.globalAlpha = 0.75;
  line(projectDir(cam, dirAzEl(psi - 0.09, -FIELD.gs * DEG), w, h), projectDir(cam, dirAzEl(psi + 0.09, -FIELD.gs * DEG), w, h), true);
  ctx.globalAlpha = 1; ctx.setLineDash([]);
  // synthetic runway outline
  const W2 = FIELD.rwyWid / 2; const c = [[0, -W2], [FIELD.rwyLen, -W2], [FIELD.rwyLen, W2], [0, W2]].map(([s, t]) => projectPt(cam, rw(s, t, 0), w, h));
  if (c.every(Boolean)) { ctx.globalAlpha = 0.55; ctx.beginPath(); c.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.stroke(); ctx.globalAlpha = 1; }
  // flight path marker
  const v = new THREE.Vector3(ac.x[4], -ac.x[5], -ac.x[3]);
  if (v.length() > 5) {
    const p = projectDir(cam, v.normalize(), w, h);
    if (p) {
      const r = 7 * dpr;
      ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2); ctx.stroke();
      line([p[0] - r, p[1]], [p[0] - r * 2.6, p[1]]); line([p[0] + r, p[1]], [p[0] + r * 2.6, p[1]]); line([p[0], p[1] - r], [p[0], p[1] - r * 1.9]);
      // guidance cue (flight director)
      if (guide && a.hWheel > 2) {
        const crs = FIELD.rwyHdg * DEG;
        const gq = projectDir(cam, dirAzEl(crs + guide.dTrackCmd, guide.gammaCmd), w, h);
        if (gq) { ctx.save(); ctx.strokeStyle = 'rgba(255,120,220,0.95)'; ctx.shadowColor = 'rgba(255,90,200,0.6)'; ctx.beginPath(); ctx.arc(gq[0], gq[1], 5 * dpr, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
      }
      if (a.hWheel / FT < 500 && a.hWheel > 0) { ctx.textAlign = 'center'; ctx.fillText(`R ${fmt(a.hWheel / FT)}`, p[0], p[1] + 30 * dpr); }
    }
  }
  // speed and altitude boxes
  const box = (x, y, txt, align) => { ctx.strokeRect(x - 38 * dpr, y - 12 * dpr, 76 * dpr, 24 * dpr); ctx.textAlign = 'center'; ctx.fillText(txt, x, y); };
  const ias = a.ias / KT;
  box(w * 0.24, h * 0.5, fmt(ias));
  ctx.textAlign = 'center'; ctx.fillText(`Vref ${fmt(AC.Vref)}`, w * 0.24, h * 0.5 + 26 * dpr);
  const trend = clamp((ias - (fl._iasPrev || ias)) * 10, -30, 30); fl._iasPrev = lerp(fl._iasPrev || ias, ias, 0.1);
  line([w * 0.24 + 44 * dpr, h * 0.5], [w * 0.24 + 44 * dpr, h * 0.5 - trend * 2 * dpr]);
  box(w * 0.76, h * 0.5, fmt(a.h / FT));
  ctx.fillText(`${a.vs >= 0 ? '+' : ''}${fmt(a.vs / FT * 60)}`, w * 0.76, h * 0.5 + 26 * dpr);
  // heading tape
  const hdg = wrap360(a.psi * RAD);
  const hy = h * 0.12, sc = 7 * dpr;
  ctx.textAlign = 'center';
  for (let d = Math.floor(hdg / 5) * 5 - 25; d <= hdg + 25; d += 5) {
    const x = w / 2 + (d - hdg) * sc;
    line([x, hy], [x, hy + (d % 10 === 0 ? 9 : 5) * dpr]);
    if (d % 10 === 0) ctx.fillText(String(wrap360(d) / 10 | 0).padStart(2, '0'), x, hy - 10 * dpr);
  }
  line([w / 2, hy + 12 * dpr], [w / 2 - 5 * dpr, hy + 20 * dpr]); line([w / 2, hy + 12 * dpr], [w / 2 + 5 * dpr, hy + 20 * dpr]);
  // ILS deviation scales
  if (a.s < FIELD.aim - 50) {
    const gx = w * 0.68, gy = h * 0.5, gd = 18 * dpr;
    for (let k = -2; k <= 2; k++) if (k) { ctx.beginPath(); ctx.arc(gx, gy + k * gd, 2.5 * dpr, 0, Math.PI * 2); ctx.stroke(); }
    const gs = clamp(-a.gsDots, -2.5, 2.5);
    diamond(ctx, gx, gy + gs * gd, 6 * dpr, true);
    const lx = w / 2, ly = h * 0.82;
    for (let k = -2; k <= 2; k++) if (k) { ctx.beginPath(); ctx.arc(lx + k * gd, ly, 2.5 * dpr, 0, Math.PI * 2); ctx.stroke(); }
    diamond(ctx, lx + clamp(-a.locDots, -2.5, 2.5) * gd, ly, 6 * dpr, false);
  }
  ctx.restore();
}
function diamond(ctx, x, y, r, vert) {
  ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r * (vert ? 0.8 : 1.2), y); ctx.lineTo(x, y + r); ctx.lineTo(x - r * (vert ? 0.8 : 1.2), y); ctx.closePath(); ctx.stroke();
}

// small ILS + PAPI widget for the outside views
function drawILSWidget(ctx, x0, y0, dpr, fl, papi) {
  const a = fl.ac.air, W = 170 * dpr, H = 92 * dpr;
  ctx.save();
  ctx.fillStyle = 'rgba(8,13,20,0.62)'; ctx.strokeStyle = 'rgba(160,190,220,0.18)'; ctx.lineWidth = 1 * dpr;
  roundRect(ctx, x0, y0, W, H, 10 * dpr); ctx.fill(); ctx.stroke();
  ctx.font = `${Math.round(10.5 * dpr)}px "B612 Mono", ui-monospace, monospace`; ctx.fillStyle = 'rgba(200,215,230,0.75)'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.fillText(`${FIELD.appr} ${FIELD.rwy}`, x0 + 10 * dpr, y0 + 13 * dpr);
  ctx.textAlign = 'right'; ctx.fillText('PAPI', x0 + W - 10 * dpr, y0 + 13 * dpr);
  const cx = x0 + 52 * dpr, cy = y0 + 54 * dpr, d = 9 * dpr;
  ctx.strokeStyle = 'rgba(220,230,240,0.7)';
  for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.arc(cx + k * d, y0 + 82 * dpr, 2 * dpr, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(x0 + 100 * dpr, cy + k * d * 0.95, 2 * dpr, 0, Math.PI * 2); ctx.stroke(); }
  const valid = a.s < FIELD.aim - 50;
  ctx.strokeStyle = valid ? '#ff5cc4' : 'rgba(255,92,196,0.25)'; ctx.lineWidth = 2 * dpr;
  if (valid) { diamond(ctx, cx + clamp(-a.locDots, -2.4, 2.4) * d, y0 + 82 * dpr, 5 * dpr, false); diamond(ctx, x0 + 100 * dpr, cy + clamp(-a.gsDots, -2.4, 2.4) * d * 0.95, 5 * dpr, true); }
  // attitude sketch
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy - 6 * dpr, 24 * dpr, 0, Math.PI * 2); ctx.clip();
  ctx.translate(cx, cy - 6 * dpr); ctx.rotate(-a.phi); const py = a.theta * RAD * 1.6 * dpr;
  ctx.fillStyle = '#2b6fb3'; ctx.fillRect(-40 * dpr, -60 * dpr + py, 80 * dpr, 60 * dpr); ctx.fillStyle = '#7a5530'; ctx.fillRect(-40 * dpr, py, 80 * dpr, 60 * dpr);
  ctx.restore();
  ctx.strokeStyle = '#ffd24a'; ctx.lineWidth = 2 * dpr; ctx.beginPath(); ctx.moveTo(cx - 14 * dpr, cy - 6 * dpr); ctx.lineTo(cx - 5 * dpr, cy - 6 * dpr); ctx.moveTo(cx + 5 * dpr, cy - 6 * dpr); ctx.lineTo(cx + 14 * dpr, cy - 6 * dpr); ctx.stroke();
  // PAPI as the pilot sees it
  for (let i = 0; i < 4; i++) {
    const w = papi[i];
    const x = x0 + (122 + i * 12) * dpr, y = cy;
    ctx.beginPath(); ctx.arc(x, y, 4.6 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = w < 0 ? 'rgba(90,90,90,0.5)' : `rgb(255,${Math.round(40 + 215 * w)},${Math.round(30 + 215 * w)})`;
    ctx.fill();
  }
  ctx.restore();
}
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

// debrief: vertical profile + centre-line track over the last 6 km
function drawDebrief(canvas, fl) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = canvas.clientWidth || 320, H = canvas.clientHeight || 220;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
  const css = getComputedStyle(document.documentElement);
  const C = (n, d) => (css.getPropertyValue(n).trim() || d);
  const text = C('--muted', '#93a3b5'), grid = C('--line', 'rgba(160,190,220,.14)'), accent = C('--accent', '#e451a8'), cyan = C('--cyan', '#4fd1e8'), good = C('--good', '#57d98a');
  ctx.clearRect(0, 0, W, H);
  ctx.font = '11px "B612 Mono", ui-monospace, monospace'; ctx.textBaseline = 'middle';
  const f = fl.rec.f; if (!f.length) return;
  const s0 = -5600, s1 = 1300, hMax = 330;
  const pad = { l: 40, r: 10, t: 12 }, h1 = H * 0.62, h2top = h1 + 26, h2 = H - 18;
  const X = (s) => pad.l + (s - s0) / (s1 - s0) * (W - pad.l - pad.r);
  const Y = (h) => pad.t + (1 - h / hMax) * (h1 - pad.t);
  const Y2 = (t) => (h2top + h2) / 2 + clamp(t, -40, 40) / 40 * ((h2 - h2top) / 2);   // right of track drawn below, as on a map
  ctx.strokeStyle = grid; ctx.lineWidth = 1; ctx.fillStyle = text;
  for (const ft of [0, 250, 500, 750, 1000]) { const hh = ft * FT; ctx.beginPath(); ctx.moveTo(pad.l, Y(hh)); ctx.lineTo(W - pad.r, Y(hh)); ctx.stroke(); ctx.textAlign = 'right'; ctx.fillText(String(ft), pad.l - 6, Y(hh)); }
  ctx.textAlign = 'left'; ctx.fillText('ft', 4, pad.t + 2);
  for (let nm = -3; nm <= 0; nm++) { const x = X(nm * NM); ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, h1); ctx.stroke(); ctx.textAlign = 'center'; ctx.fillText(nm ? `${-nm} nm` : 'THR', x, h1 + 11); }
  // runway, TDZ, aiming point
  ctx.fillStyle = 'rgba(200,210,220,0.28)'; ctx.fillRect(X(0), Y(0) - 3, X(s1) - X(0), 3);
  ctx.fillStyle = 'rgba(87,217,138,0.25)'; ctx.fillRect(X(350), Y(0) - 6, X(600) - X(350), 6);
  // glide path
  ctx.strokeStyle = accent; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(X(s0), Y(gpHeight(s0))); ctx.lineTo(X(FIELD.aim), Y(0)); ctx.stroke(); ctx.setLineDash([]);
  // flown path
  ctx.strokeStyle = cyan; ctx.lineWidth = 2; ctx.beginPath();
  let started = false;
  for (const p of f) { if (p.s < s0 || p.s > s1) continue; const x = X(p.s), y = Y(Math.max(0, p.hw)); if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y); }
  ctx.stroke();
  const td = fl.ev.td;
  if (td) { ctx.fillStyle = good; ctx.beginPath(); ctx.arc(X(td.s), Y(0), 4, 0, Math.PI * 2); ctx.fill(); ctx.textAlign = 'center'; ctx.fillText(`แตะพื้น ${fmt(td.s)} ม.`, clamp(X(td.s), 60, W - 60), Y(0) - 14); }
  // lateral track
  ctx.strokeStyle = grid; ctx.lineWidth = 1;
  for (const t of [-20, 0, 20]) { ctx.beginPath(); ctx.moveTo(pad.l, Y2(t)); ctx.lineTo(W - pad.r, Y2(t)); ctx.stroke(); }
  ctx.fillStyle = text; ctx.textAlign = 'right'; ctx.fillText('ซ้าย', pad.l - 6, Y2(-20)); ctx.fillText('ขวา', pad.l - 6, Y2(20));
  ctx.fillStyle = 'rgba(200,210,220,0.18)'; ctx.fillRect(X(0), Y2(-FIELD.rwyWid / 2), X(s1) - X(0), Y2(FIELD.rwyWid / 2) - Y2(-FIELD.rwyWid / 2));
  ctx.strokeStyle = cyan; ctx.lineWidth = 2; ctx.beginPath(); started = false;
  for (const p of f) { if (p.s < s0 || p.s > s1) continue; const x = X(p.s), y = Y2(p.tl); if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y); }
  ctx.stroke();
}
