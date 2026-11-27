// ───────────────────────── METAR / SPECI decoder (pure, no DOM) ─────────────────────────
// Our own decoder (research round 4, docs/research/04-weather.md §3.4, decision OD-METAR: no npm dependency; TAF is
// out of scope). Moved from tools/climo/metar-climo.mjs and extended with RVR, directional visibility, recent weather,
// wind shear, runway state and the TREND part.
// Sources:
//   - Group layout: WMO-No. 306, Manual on Codes, FM 15 METAR / FM 16 SPECI.
//   - Reporting rules: ICAO Annex 3, App. 3, as summarised in research §3.3 (the 21st-edition wording is not read
//     yet, open item R4-G3, so the research's wording is used).
//   - VTBD habits (research §3.2): RVR as `R21`/`R03` without L/R (the number names the measuring point at that end),
//     two RVR groups in one report with different values, the same group written twice.
//   - US forms (statute miles, `A` altimeter in inHg, RVR in feet): not in the research; US form, FMH-1. Kept so that a
//     pasted foreign METAR still decodes.
// parseMetar never throws on a string; a token it cannot place goes to `unknown`, never silently away (except the
// sea-state group and RE//, recognised and not stored). A group that may appear once (wind, its variation, the
// prevailing visibility, the directional minimum, a sky keyword, VV, temperature, pressure; FM/TL/AT, wind and
// visibility per TREND block) goes to `unknown` the second time, and so does a group that contradicts one already
// taken (a cloud, weather or RVR group with CAVOK, a variation without a wind to attach to, an impossible time).

const METAR_KT_PER_MPS = 1 / 0.514444;   // 1 kt = 0.514444 m/s
const METAR_KT_PER_KMH = 1 / 1.852;      // 1 kt = 1.852 km/h
const METAR_SM_M = 1609.344;             // statute mile (US form, FMH-1)
const METAR_FT_M = 0.3048;
const METAR_HPA_PER_INHG = 33.8639;      // altimeter setting A2992 = 29.92 inHg (US form, FMH-1)

// Present weather, WMO-No. 306 code table 4678: intensity or proximity, one descriptor, then phenomena.
const METAR_DESC = '(MI|BC|PR|DR|BL|SH|TS|FZ)';
const METAR_PH = '(?:DZ|RA|SN|SG|PL|GR|GS|UP|BR|FG|FU|VA|DU|SA|HZ|PO|SQ|FC|SS|DS)';
const METAR_RX = {
  station: /^[A-Z][A-Z0-9]{3}$/,
  time: /^(\d{2})(\d{2})(\d{2})Z$/,
  wind: /^(\d{3}|VRB|\/\/\/)(P?\d{2,3}|\/\/)(?:G(P?\d{2,3}))?(KT|MPS|KMH)$/,
  windVar: /^(\d{3})V(\d{3})$/,
  vis: /^(\d{4})(NDV)?$/,
  visDir: /^(\d{4})(N|NE|E|SE|S|SW|W|NW)$/,
  visSm: /^(P|M)?(\d{1,2})SM$/,                 // 10SM, P6SM (US form, FMH-1)
  visSmFrac: /^(P|M)?(\d)\/(\d{1,2})SM$/,       // 1/2SM, M1/4SM (US form, FMH-1)
  rvr: /^R(\d{2}[LCR]?)\/(P|M)?(\d{4})(?:V(P|M)?(\d{4}))?(FT)?\/?(U|D|N)?$/,
  rvrMissing: /^R(\d{2}[LCR]?)\/{5,6}$/,
  rwyState: /^(?:R\d{2}[LCR]?\/(?:[0-9/]{6}|CLRD[0-9/]{2})|\d{8})$/,   // WMO-No. 306 runway state, kept raw
  wx: new RegExp(`^(\\+|-|VC)?${METAR_DESC}?(${METAR_PH}*)$`),
  recent: new RegExp(`^RE${METAR_DESC}?(${METAR_PH}*)$`),
  cloud: /^(FEW|SCT|BKN|OVC|\/\/\/)(\d{3}|\/\/\/)(CB|TCU|\/\/\/)?$/,
  vv: /^VV(\d{3}|\/\/\/)$/,
  temp: /^(M?\d{2}|\/\/)\/(M?\d{2}|\/\/)?$/,
  qnh: /^([QA])(\d{4}|\/\/\/\/)$/,
  wsRwy: /^(?:R|RWY)(\d{2}[LCR]?)$/,
  sea: /^W(M?\d{2}|\/\/)\/(S\d|H\d{1,3})$/,   // sea surface temperature and state: recognised, not stored
  trendTime: /^(FM|TL|AT)(\d{2})(\d{2})$/,
};
const METAR_SKY_WORDS = new Set(['NSC', 'NCD', 'SKC', 'CLR']);   // SKC, CLR: US form, FMH-1
// Which phenomena each descriptor takes, and which ones VC takes, WMO-No. 306 code table 4678 (research §3.3 does not
// summarise it).
const METAR_PRECIP = ['DZ', 'RA', 'SN', 'SG', 'PL', 'GR', 'GS', 'UP'];
const METAR_DESC_PH = { MI: ['FG'], BC: ['FG'], PR: ['FG'], FZ: ['FG', 'DZ', 'RA', 'UP'], DR: ['DU', 'SA', 'SN'], BL: ['DU', 'SA', 'SN'],
  SH: METAR_PRECIP, TS: METAR_PRECIP };
const METAR_VC_PH = ['FG', 'DS', 'SS', 'FC', 'PO', 'VA'];

// Hour and minute in range (WMO-No. 306 FM 15: GG 00–23, gg 00–59). A TREND time may run past midnight as hour 24
// (research §3.2 TL2400; the VTBD archive also has TL2410). Returns minutes after 00:00 UTC, or null.
function metarHhmm(hh, mm, trend) {
  return mm < 60 && hh < (trend ? 25 : 24) ? hh * 60 + mm : null;
}

// Wind group dddffGfmfmKT (Annex 3 App. 3, research §3.3): true direction, 10-min mean, gust. Speeds in knots, not
// rounded. Returns { wind, missing } (wind null when the whole group is slashes) or null when `t` is not a wind group.
function metarWindGroup(t) {
  const g = METAR_RX.wind.exec(t);
  if (!g) return null;
  const k = g[4] === 'MPS' ? METAR_KT_PER_MPS : g[4] === 'KMH' ? METAR_KT_PER_KMH : 1;
  const spd = (s) => (s === undefined || s === '//' ? null : +s.replace('P', '') * k);
  const dir = g[1] === 'VRB' || g[1] === '///' ? null : +g[1];
  const kt = spd(g[2]), gust = spd(g[3]);
  // Not a wind group (goes to unknown): a direction beyond 360° or a gust not above the mean (FM 15; Annex 3 App. 3
  // as summarised in research §3.3: true direction, gust above the mean). The observer's thresholds are not checked
  // (gust 10 kt above the mean, VRB below 3 kt): the VTBD archive breaks them and has 00000G11KT and 00002KT, kept.
  if (dir > 360 || (gust !== null && kt !== null && gust <= kt)) return null;
  if (dir === null && kt === null && g[1] !== 'VRB') return { wind: null, missing: true };
  return {
    missing: g[1] === '///' || kt === null,
    wind: {
      fromDeg: dir, kt, gustKt: gust, vrb: g[1] === 'VRB', varFrom: null, varTo: null,
      calm: dir === 0 && kt === 0,
      above: g[2][0] === 'P' || (g[3] || '')[0] === 'P',   // "more than" (P99KT, P49MPS; also a P gust)
      unit: g[4],
    },
  };
}

// Prevailing visibility at toks[i] (WMO-No. 306; Annex 3 App. 3 4.2.4.1: 9999 = 10 km or more). Returns
// { m, op, ndv, n } (n = tokens used, 2 for `1 1/2SM`), { missing } for `////`, or null.
function metarVisGroup(toks, i) {
  const t = toks[i];
  let g;
  if (t === 'CAVOK') return { m: 10000, op: 'P', ndv: false, n: 1, cavok: true };
  if (t === '////') return { missing: true, n: 1 };
  if ((g = METAR_RX.vis.exec(t))) return { m: g[1] === '9999' ? 10000 : +g[1], op: g[1] === '9999' ? 'P' : '', ndv: !!g[2], n: 1 };
  if ((g = METAR_RX.visSm.exec(t))) return { m: +g[2] * METAR_SM_M, op: g[1] || '', ndv: false, n: 1 };
  if ((g = METAR_RX.visSmFrac.exec(t)) && +g[3] > 0) return { m: (+g[2] / +g[3]) * METAR_SM_M, op: g[1] || '', ndv: false, n: 1 };
  // two-token form `1 1/2SM`: a lone whole-mile digit followed by a plain fraction
  if (/^\d$/.test(t) && i + 1 < toks.length && (g = /^(\d)\/(\d{1,2})SM$/.exec(toks[i + 1])) && +g[2] > 0) {
    return { m: (+t + +g[1] / +g[2]) * METAR_SM_M, op: '', ndv: false, n: 2 };
  }
  return null;
}

// Present weather (code table 4678) with METAR_RX.wx, or recent weather with METAR_RX.recent (REww, no intensity).
function metarWxGroup(code, rx) {
  const g = rx.exec(code);
  if (!g) return null;
  const int = rx === METAR_RX.wx ? g[1] || '' : '';
  const desc = g[g.length - 2] || '', ph = g[g.length - 1] ? g[g.length - 1].match(/../g) : [];
  return metarWxOk(int, desc, ph) ? { code, int, desc, ph } : null;
}

// Only the combinations of code table 4678 are weather (anything else goes to unknown): a descriptor stands alone
// only as TS, or as SH in the vicinity (VCSH); MI/BC/PR go with FG, FZ with FG/DZ/RA/UP, DR/BL with DU/SA/SN, SH and
// TS with precipitation; '-' and '+' mark precipitation, DS and SS (and +FC); VC goes with TS, SH, FG, DS, SS, FC, PO,
// VA and BLDU/BLSA/BLSN. So FZ, SH, -FG, +BR, VCRA and REFZ are not groups.
function metarWxOk(int, desc, ph) {
  if (!ph.length) return int === 'VC' ? desc === 'TS' || desc === 'SH' : int === '' && desc === 'TS';
  if (desc && !ph.every((p) => METAR_DESC_PH[desc].includes(p))) return false;
  if (int === 'VC') return desc === 'BL' || (!desc && ph.length === 1 && METAR_VC_PH.includes(ph[0]));
  if (int) return ph.some((p) => METAR_PRECIP.includes(p)) || ph.every((p) => p === 'DS' || p === 'SS') || (int === '+' && ph.join('') === 'FC');
  return true;
}

// Sky groups shared by the body and the TREND blocks: NSC/NCD/SKC/CLR, cloud layers (FEW/SCT/BKN/OVC = 1–2 / 3–4 /
// 5–7 / 8 oktas, base in hundreds of feet, CB/TCU suffix, research §3.3), vertical visibility VVhhh. Writes into `s`;
// returns false (not a sky group), true, or 'missing' (a layer whose amount or base is slashes, automatic stations).
// After CAVOK nothing is a sky group (CAVOK replaces them, research §3.3), nor a second sky keyword or VV.
function metarSkyGroup(t, s) {
  let g;
  if (s.cavok) return false;
  if (METAR_SKY_WORDS.has(t)) { if (s.sky !== null) return false; s.sky = t; return true; }
  if ((g = METAR_RX.cloud.exec(t))) {
    const amt = g[1] === '///' ? null : g[1], base = g[2] === '///' ? null : +g[2] * 100;
    s.clouds.push({ amt, base_ft: base, type: g[3] && g[3] !== '///' ? g[3] : null });
    return amt === null || base === null ? 'missing' : true;
  }
  if ((g = METAR_RX.vv.exec(t)) && !s.obscured) { s.obscured = true; s.vv_ft = g[1] === '///' ? null : +g[1] * 100; return true; }
  return false;
}

// Present weather into the report or a block `s` (none after CAVOK); '//' (not observable) returns 'missing'.
function metarAddWx(t, s) {
  if (s.cavok) return false;
  if (t === '//') return 'missing';
  const w = metarWxGroup(t, METAR_RX.wx);
  if (!w) return false;
  s.wx.push(w);
  return true;
}

// CAVOK replaces the visibility, RVR, weather and cloud groups (Annex 3 as summarised in research §3.3), so it is
// refused (unknown) after one of them, as they are after it.
function metarCavokClash(s) {
  return s.visibility_m !== null || s.wx.length > 0 || s.sky !== null || s.clouds.length > 0 || s.obscured ||
    (s.rvr || []).length > 0 || !!s.visMin || (s.missing || []).includes('wx');
}

// One TREND block (Annex 3 App. 3: NOSIG, TEMPO, BECMG, valid 2 h; research §3.3). Times are minutes after 00:00 UTC.
function metarTrendBlock(kind) {
  return { kind, from: null, until: null, at: null, wind: null, visibility_m: null, visibilityOp: '', wx: [], nsw: false,
    sky: null, cavok: false, clouds: [], vv_ft: null, obscured: false };
}

// Decodes one METAR or SPECI. Returns null only for a non-string, an empty text or IEM's missing marker `M`.
function parseMetar(text) {
  if (typeof text !== 'string') return null;
  const raw = text.split('=')[0].toUpperCase().replace(/\s+/g, ' ').trim();
  if (raw === '' || raw === 'M') return null;
  const m = {
    raw, type: 'METAR', station: null, time: null, nil: false, auto: false, cor: false,
    wind: null, visibility_m: null, visibilityOp: '', visibilityNdv: false, visMin: null, rvr: [], wx: [],
    sky: null, cavok: false, clouds: [], vv_ft: null, obscured: false, oat_C: null, dew_C: null, qnh_hPa: null,
    recent: [], windshear: null, rwyState: [], trend: [], rmk: null, missing: [], unknown: [],
  };
  const miss = (f) => { if (!m.missing.includes(f)) m.missing.push(f); };
  const toks = raw.split(' ');
  let i = 0;

  // Header (WMO-No. 306 FM 15: METAR/SPECI, COR, CCCC, YYGGggZ, NIL, AUTO). COR is accepted right after the type,
  // the WMO place (IEM keeps it as a leading `COR VTBD …`), and after the time, where many centres put it.
  if (toks[i] === 'METAR' || toks[i] === 'SPECI') m.type = toks[i++];
  if (toks[i] === 'COR') { m.cor = true; i++; }
  // The station slot never takes AUTO or NIL, and takes a token that is itself a body group (TSRA, RETS, P6SM) only
  // when a time group follows it (CCCC comes before YYGGggZ), so a report pasted without its station keeps its weather.
  const st = toks[i] || '', timeNext = METAR_RX.time.test(toks[i + 1] || '');
  if (METAR_RX.station.test(st) && st !== 'AUTO' && st !== 'NIL' &&
      (timeNext || !(metarWxGroup(st, METAR_RX.wx) || metarWxGroup(st, METAR_RX.recent) || metarVisGroup(toks, i)))) {
    m.station = st; i++;
  }
  // An impossible time (day 32, hour 25) is not taken: the token goes on to the body and lands in unknown.
  const time = () => {
    const g = METAR_RX.time.exec(toks[i] || '');
    if (g && +g[1] >= 1 && +g[1] <= 31 && metarHhmm(+g[2], +g[3], false) !== null) { m.time = { day: +g[1], hour: +g[2], minute: +g[3] }; i++; }
  };
  time();
  if (toks[i] === 'NIL') { m.nil = true; m.unknown = toks.slice(i + 1); return m; }
  for (let k = 0; k < 2; k++) {
    if (toks[i] === 'AUTO' && !m.auto) { m.auto = true; i++; } else if (toks[i] === 'COR' && !m.cor) { m.cor = true; i++; }
  }
  if (!m.time) time();   // `METAR AUTO 011400Z`: AUTO out of its place, the time after it

  // RMK ends the report's coded part; NOSIG/TEMPO/BECMG start the TREND.
  let rmkAt = toks.indexOf('RMK', i);
  if (rmkAt >= 0) { m.rmk = toks.slice(rmkAt + 1).join(' '); } else rmkAt = toks.length;
  let end = i;
  while (end < rmkAt && !/^(NOSIG|TEMPO|BECMG)$/.test(toks[end])) end++;

  // Main body: recognised by form, in any order; wind, its variation, the prevailing visibility, the temperature
  // and the pressure are taken once (a second one goes to `unknown`).
  let varTok = null, visTaken = false, tempTaken = false, qnhTaken = false, windTaken = false, g;
  for (; i < end; i++) {
    const t = toks[i];
    let r;
    if ((r = metarWindGroup(t))) {
      if (windTaken) { m.unknown.push(t); continue; }
      windTaken = true; m.wind = r.wind;
      if (r.missing) miss('wind');
    } else if ((g = METAR_RX.windVar.exec(t)) && +g[1] <= 360 && +g[2] <= 360) {
      // dddVddd: direction varying by 60° or more and less than 180° at 3 kt or more (research §3.3); only the
      // directions are checked, not the thresholds (the VTBD archive has a variation at 2 kt)
      if (varTok) m.unknown.push(t); else varTok = t;
    } else if ((r = metarVisGroup(toks, i))) {
      if (visTaken || (r.cavok && metarCavokClash(m))) { m.unknown.push(t); continue; }
      visTaken = true; i += r.n - 1;
      if (r.missing) { miss('visibility'); continue; }
      m.visibility_m = r.m; m.visibilityOp = r.op; m.visibilityNdv = r.ndv;
      if (r.cavok) { m.cavok = true; m.sky = 'CAVOK'; }
    } else if ((g = METAR_RX.visDir.exec(t)) && !m.cavok) {
      if (m.visMin) m.unknown.push(t); else m.visMin = { m: +g[1], dir: g[2] };
    } else if ((g = METAR_RX.rvr.exec(t)) && !m.cavok) {
      // RDD/VVVVi (Annex 3, research §3.3); every group kept in order, duplicates too (VTBD habit, §3.2)
      const f = g[6] ? METAR_FT_M : 1;
      m.rvr.push({ rwy: g[1], m: +g[3] * f, op: g[2] || '', maxM: g[5] ? +g[5] * f : null, maxOp: g[4] || '', trend: g[7] || null });
    } else if ((g = METAR_RX.rvrMissing.exec(t)) && !m.cavok) {
      m.rvr.push({ rwy: g[1], m: null, op: '', maxM: null, maxOp: '', trend: null }); miss('rvr');
    } else if (METAR_RX.rwyState.test(t)) {
      m.rwyState.push(t);
    } else if (t === 'RE//') {
      // recent weather not observable: recognised, nothing stored (the `missing` fields have no recent-weather name)
    } else if ((r = metarWxGroup(t, METAR_RX.recent))) {
      r.code = t.slice(2); m.recent.push(r);
    } else if ((r = metarAddWx(t, m))) {
      if (r === 'missing') miss('wx');
    } else if ((r = metarSkyGroup(t, m))) {
      if (r === 'missing') miss('clouds');
    } else if ((g = METAR_RX.temp.exec(t))) {
      if (tempTaken) { m.unknown.push(t); continue; }
      tempTaken = true;
      const c = (s) => (s === undefined || s === '//' ? null : s[0] === 'M' ? -s.slice(1) || 0 : +s);   // M00 → 0, not -0
      m.oat_C = c(g[1]); m.dew_C = c(g[2]);
      if (m.oat_C === null) miss('temperature');
    } else if ((g = METAR_RX.qnh.exec(t))) {
      if (qnhTaken) { m.unknown.push(t); continue; }
      qnhTaken = true;
      if (g[2] === '////') miss('qnh');
      else m.qnh_hPa = g[1] === 'Q' ? +g[2] : (+g[2] / 100) * METAR_HPA_PER_INHG;
    } else if (t === 'WS' && (g = METAR_RX.wsRwy.exec(toks[i + 1] || '')) && i + 1 < end) {
      // wind shear in the lower layers: WS R21L, WS RWY21L, WS ALL RWY (group layout WMO-No. 306 FM 15; not in research
      // §3.3); several groups merge
      m.windshear = m.windshear || { all: false, rwys: [] };
      if (!m.windshear.rwys.includes(g[1])) m.windshear.rwys.push(g[1]);
      i++;
    } else if (t === 'WS' && toks[i + 1] === 'ALL' && toks[i + 2] === 'RWY' && i + 2 < end) {
      m.windshear = m.windshear || { all: false, rwys: [] };
      m.windshear.all = true; i += 2;
    } else if (!METAR_RX.sea.test(t)) {
      m.unknown.push(t);
    }
  }
  // The variation belongs to a wind with a direction: without a wind group, with calm or with VRB (VRB is reported
  // instead of a range, research §3.3) it goes to unknown.
  if (varTok && m.wind && m.wind.fromDeg !== null && !m.wind.calm) { m.wind.varFrom = +varTok.slice(0, 3); m.wind.varTo = +varTok.slice(4); }
  else if (varTok) m.unknown.push(varTok);

  // TREND: NOSIG ends it; each TEMPO/BECMG starts a block holding FM/TL/AT times and the groups that change.
  let blk = null, blkWind = false, blkVis = false, done = false;
  for (i = end; i < rmkAt; i++) {
    const t = toks[i];
    let r;
    if (done) { m.unknown.push(t); continue; }
    if (t === 'NOSIG') { m.trend.push(metarTrendBlock('NOSIG')); done = true; continue; }
    if (t === 'TEMPO' || t === 'BECMG') { blk = metarTrendBlock(t); m.trend.push(blk); blkWind = blkVis = false; continue; }
    const key = (g = METAR_RX.trendTime.exec(t)) && { FM: 'from', TL: 'until', AT: 'at' }[g[1]];
    const hm = key && metarHhmm(+g[2], +g[3], true);
    if (key && blk[key] === null && hm !== null) {
      blk[key] = hm;   // one FM, one TL and one AT per block, each a possible time
    } else if ((r = metarWindGroup(t)) && !r.missing && !blkWind) {
      blkWind = true; blk.wind = r.wind;
    } else if ((r = metarVisGroup(toks, i)) && !blkVis && !r.missing && !(r.cavok && metarCavokClash(blk))) {
      blkVis = true; i += r.n - 1;
      blk.visibility_m = r.m; blk.visibilityOp = r.op;
      if (r.cavok) { blk.cavok = true; blk.sky = 'CAVOK'; }
    } else if (t === 'NSW') {
      blk.nsw = true;   // nil significant weather: the weather ends
    } else if (!t.includes('/') && (metarAddWx(t, blk) || metarSkyGroup(t, blk))) {
      // weather or sky group stored in the block (a forecast has no `//` or slashed layers: those go to unknown)
    } else {
      m.unknown.push(t);
    }
  }
  return m;
}

// ───────────── derived values ─────────────

// Ceiling in feet: the vertical visibility when the sky is obscured (VV/// → 0), else the lowest base of a BKN or
// OVC layer (ICAO definition; same rule as ceilingFt in tools/climo), else Infinity.
// Every helper returns null for a null report (parseMetar of an empty paste).
function metarCeilingFt(m) {
  if (!m) return null;
  if (m.obscured) return m.vv_ft === null ? 0 : m.vv_ft;
  let b = Infinity;
  for (const c of m.clouds) if ((c.amt === 'BKN' || c.amt === 'OVC') && c.base_ft !== null && c.base_ft < b) b = c.base_ft;
  return b;
}

// The RVR group for one runway end ('21R'): an exact match wins, else the bare end number ('21' applies to 21L and
// 21R: VTBD reports R21/R03 at the measuring point of that end, research §3.2), else null. Never crosses ends. A group
// with a value wins over a missing one (R21L///// does not hide R21/0600; the spec does not say, this is our choice).
function metarRvrFor(m, rwyId) {
  if (!m) return null;
  const id = String(rwyId).toUpperCase();
  const hits = m.rvr.filter((r) => r.rwy === id).concat(m.rvr.filter((r) => r.rwy === id.slice(0, 2)));
  return hits.find((r) => r.m !== null) || hits[0] || null;
}

// Longitudinal turbulence intensity from the reported gust: σu ≈ (gust − mean) / 3 kt (research §6.4 table, row
// "มีกระโชกใน METAR"; the 3 is an estimated peak factor, estimate). null without a gust.
function metarGustSigmaKt(m) {
  const w = m && m.wind;
  return w && w.gustKt !== null && w.kt !== null ? (w.gustKt - w.kt) / 3 : null;
}

// Rain rate in mm/h from the present weather at the aerodrome (research §6.7, estimates, no threshold in Annex 3):
// -RA 1, RA 5, +RA 20, +TSRA 50 (lower end of 50–100 mm/h in a storm core); the largest over the groups. Drizzle and
// the other phenomena give 0 (the research gives them no rate). VC groups are not at the aerodrome.
function metarRainMmh(m) {
  if (!m) return null;
  let r = 0;
  for (const w of m.wx) {
    if (w.int === 'VC' || !w.ph.includes('RA')) continue;
    r = Math.max(r, w.int === '-' ? 1 : w.int === '+' ? (w.desc === 'TS' ? 50 : 20) : 5);
  }
  return r;
}

// Runway surface from the weather: wet ≤ 3 mm = RWYCC 5 (research §5.5); RA/SHRA/TSRA → RWYCC 5, RETS/RERA → wet
// runway with no rain falling (§8.2). Standing water (RWYCC 2, more than 3 mm) needs a water-depth model and belongs
// to the weather state (lane B10/E3), not to this decoder.
function metarRunway(m) {
  if (!m) return null;
  const wetPh = (w) => w.ph.includes('RA') || w.ph.includes('DZ');
  if (m.wx.some((w) => w.int !== 'VC' && wetPh(w))) return { wet: true, rwycc: 5, cause: 'precip' };
  if (m.recent.some((w) => wetPh(w) || w.desc === 'TS' || w.desc === 'SH')) return { wet: true, rwycc: 5, cause: 'recent' };
  return { wet: false, rwycc: 6, cause: 'dry' };
}

// Epoch ms of the report time. A METAR gives only day and time, so the date is the latest one with that day and
// hh:mm not later than refMs + 1 h (clock skew), looking back at most 3 months (a month without that day is skipped).
// null when the report has no time or no month fits. No clock is read: only refMs.
function metarIssuedMs(m, refMs) {
  if (!m || !m.time || !Number.isFinite(refMs)) return null;
  const { day, hour, minute } = m.time;
  if (day < 1 || day > 31 || metarHhmm(hour, minute, false) === null) return null;
  // The search starts in the month of refMs + 1 h (a report on the 1st at 00:10 with the clock still on the 30th at 23:30).
  const lim = refMs + 3600e3, at = new Date(lim), y = at.getUTCFullYear(), mo = at.getUTCMonth();
  for (let k = 0; k <= 3; k++) {
    const days = (Date.UTC(y, mo - k + 1, 1) - Date.UTC(y, mo - k, 1)) / 864e5;
    if (day > days) continue;
    const t = Date.UTC(y, mo - k, day, hour, minute);
    if (t <= lim) return t;
  }
  return null;
}
