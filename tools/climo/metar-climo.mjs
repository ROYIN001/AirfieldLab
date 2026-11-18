#!/usr/bin/env node
// VTBD surface climatology from the METAR archive (Iowa Environmental Mesonet).
// Node >= 18, no dependencies. Used for docs/research/04-weather.md (round 4).
//
//   node tools/climo/metar-climo.mjs --from 2016 --to 2025 --out docs/research/data/vtbd-metar-climo.json
//   node tools/climo/metar-climo.mjs --test          # parser self-test, no network
//
// Source: IEM ASOS/METAR download service
//   https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py  (METARs are WMO essential data, Res. 40)
// Only routine half-hourly reports (minute 00 or 30) enter the frequency statistics, because SPECIs
// cluster in bad weather; SPECIs are used only for "days with" counts.

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const STATION = 'VTBD';
const UTC_OFFSET_H = 7;              // Asia/Bangkok, no DST
const ELEV_M = 2.65;                 // AIP ARP elevation (src/15-geo.js)
// Runway true bearing from the AIP threshold coordinates of 03L and 21R (src/15-geo.js)
const dms = (d, m, s) => d + m / 60 + s / 3600;
const RWY03_TRUE = (() => {
  const toR = Math.PI / 180;
  const [la1, lo1] = [dms(13, 53, 49.24) * toR, dms(100, 35, 45.38) * toR];
  const [la2, lo2] = [dms(13, 55, 34.87) * toR, dms(100, 36, 44.62) * toR];
  const y = Math.sin(lo2 - lo1) * Math.cos(la2);
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(lo2 - lo1);
  return ((Math.atan2(y, x) / toR) + 360) % 360;
})();

// ───────────── METAR parser (main body only) ─────────────
const WX_RE = /^(\+|-|VC)?(MI|BC|PR|DR|BL|SH|TS|FZ)?((?:DZ|RA|SN|SG|PL|GR|GS|UP|BR|FG|FU|VA|DU|SA|HZ|PO|SQ|FC|SS|DS)*)$/;
export function parseMetar(raw) {
  const out = { wind: null, varFrom: null, varTo: null, vis: null, cavok: false, wx: [], clouds: [], nsc: false, vv: null, T: null, Td: null, qnh: null };
  if (!raw || raw === 'M') return null;
  let toks = raw.trim().split(/\s+/);
  const cut = toks.findIndex((t) => t === 'RMK' || t === 'NOSIG' || t === 'TEMPO' || t === 'BECMG');
  if (cut >= 0) toks = toks.slice(0, cut);
  let i = 0;
  if (toks[i] === 'METAR' || toks[i] === 'SPECI') i++;
  if (/^[A-Z]{4}$/.test(toks[i])) i++;
  if (/^\d{6}Z$/.test(toks[i])) i++;
  if (toks[i] === 'AUTO' || toks[i] === 'COR') i++;
  for (; i < toks.length; i++) {
    const t = toks[i];
    let m;
    if (!out.wind && (m = /^(\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?(KT|MPS)$/.exec(t))) {
      const k = m[4] === 'MPS' ? 1 / 0.514444 : 1;
      out.wind = { dir: m[1] === 'VRB' ? null : +m[1], vrb: m[1] === 'VRB', kt: Math.round(+m[2] * k), gust: m[3] ? Math.round(+m[3] * k) : null };
      continue;
    }
    if ((m = /^(\d{3})V(\d{3})$/.exec(t))) { out.varFrom = +m[1]; out.varTo = +m[2]; continue; }
    if (t === 'CAVOK') { out.cavok = true; out.vis = 10000; continue; }
    if (out.vis === null && (m = /^(\d{4})(NDV)?$/.exec(t))) { out.vis = +m[1] === 9999 ? 10000 : +m[1]; continue; }
    if (/^\d{4}(N|NE|E|SE|S|SW|W|NW)$/.test(t)) continue;               // directional minimum visibility
    if (/^R\d{2}[LCR]?\//.test(t)) continue;                            // RVR
    if (/^RE[A-Z]+$/.test(t)) continue;                                 // recent weather
    if (/^WS$/.test(t) || /^(R\d{2}[LCR]?|ALL)$/.test(t) || t === 'RWY') continue;
    if (t === 'NSC' || t === 'NCD' || t === 'SKC' || t === 'CLR') { out.nsc = true; continue; }
    if ((m = /^VV(\d{3}|\/\/\/)$/.exec(t))) { out.vv = m[1] === '///' ? 0 : +m[1] * 100; continue; }
    if ((m = /^(FEW|SCT|BKN|OVC)(\d{3}|\/\/\/)(CB|TCU|\/\/\/)?$/.exec(t))) {
      if (m[2] !== '///') out.clouds.push({ amt: m[1], ft: +m[2] * 100, type: m[3] && m[3] !== '///' ? m[3] : null });
      continue;
    }
    if ((m = /^(M?\d{2})\/(M?\d{2})?$/.exec(t))) {
      const f = (s) => (s ? (s[0] === 'M' ? -+s.slice(1) : +s) : null);
      out.T = f(m[1]); out.Td = f(m[2]); continue;
    }
    if ((m = /^Q(\d{4})$/.exec(t))) { out.qnh = +m[1]; continue; }
    if ((m = /^A(\d{4})$/.exec(t))) { out.qnh = Math.round(+m[1] / 100 * 33.8639); continue; }
    if (t.length >= 2 && t !== 'NSW' && (m = WX_RE.exec(t)) && (m[2] || m[3])) {
      out.wx.push({ int: m[1] || '', desc: m[2] || '', ph: m[3] || '', code: t });
      continue;
    }
  }
  return out;
}

const hasPh = (o, ph) => o.wx.some((w) => w.int !== 'VC' && w.ph.includes(ph));
const isTS = (o) => o.wx.some((w) => w.int !== 'VC' && w.desc === 'TS');
const isVCTS = (o) => o.wx.some((w) => w.int === 'VC' && w.desc === 'TS');
const isRain = (o) => hasPh(o, 'RA');
const isHeavyRain = (o) => o.wx.some((w) => w.int === '+' && w.ph.includes('RA'));
const isShower = (o) => o.wx.some((w) => w.int !== 'VC' && w.desc === 'SH');
const ceilingFt = (o) => {
  if (o.vv !== null) return o.vv;
  const c = o.clouds.filter((l) => l.amt === 'BKN' || l.amt === 'OVC').map((l) => l.ft);
  return c.length ? Math.min(...c) : Infinity;
};

// ───────────── thermodynamics (same equations as the report) ─────────────
const es_hPa = (tC) => 6.1094 * Math.exp((17.625 * tC) / (tC + 243.04));   // Magnus, Alduchov & Eskridge 1996
const rh = (T, Td) => 100 * es_hPa(Td) / es_hPa(T);
const RD = 287.05, RV = 461.5, G0 = 9.80665, T0 = 288.15, P0 = 101325, LAPSE = 0.0065, RHO0 = 1.225;
function densityAltitudeFt(T, Td, qnh) {
  const p = qnh * 100 * Math.pow(1 - LAPSE * ELEV_M / T0, G0 / (RD * LAPSE));   // station pressure from QNH (ISA)
  const e = es_hPa(Td) * 100;
  const rho = (p - e) / (RD * (T + 273.15)) + e / (RV * (T + 273.15));
  const n = G0 / (RD * LAPSE) - 1;                                               // 4.2559
  const h = (T0 / LAPSE) * (1 - Math.pow(rho / RHO0, 1 / n));
  return h / 0.3048;
}

// ───────────── statistics helpers ─────────────
const quant = (arr, q) => { if (!arr.length) return null; const a = [...arr].sort((x, y) => x - y); const i = (a.length - 1) * q; const lo = Math.floor(i), hi = Math.ceil(i); return a[lo] + (a[hi] - a[lo]) * (i - lo); };
const mean = (arr) => (arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : null);
const r1 = (x) => (x === null || x === undefined || !isFinite(x) ? null : Math.round(x * 10) / 10);
const r2 = (x) => (x === null || x === undefined || !isFinite(x) ? null : Math.round(x * 100) / 100);
const pct = (k, n) => (n ? r2((100 * k) / n) : null);

const SPD_BINS = [[1, 3], [4, 6], [7, 10], [11, 16], [17, 21], [22, 999]];
const binOf = (kt) => SPD_BINS.findIndex(([a, b]) => kt >= a && kt <= b);
const sector12 = (dir) => Math.floor(((dir % 360) + 15) / 30) % 12;    // 0 = 345–015 (N), 1 = 015–045 ...

async function fetchYear(y, cacheDir) {
  const f = path.join(cacheDir, `${STATION}-${y}.csv`);
  if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8');
  const base = 'https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py';
  const q = `station=${STATION}&data=metar&year1=${y}&month1=1&day1=1&year2=${y + 1}&month2=1&day2=1&tz=Etc/UTC&format=onlycomma&latlon=no&missing=M&trace=T&direct=no&report_type=3&report_type=4`;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const r = await fetch(`${base}?${q}`, { headers: { 'User-Agent': 'AirfieldLab-climo (github.com/ROYIN001/AirfieldLab)' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const txt = await r.text();
      if (!txt.startsWith('station,valid')) throw new Error('unexpected body: ' + txt.slice(0, 120));
      fs.mkdirSync(cacheDir, { recursive: true });
      fs.writeFileSync(f, txt);
      return txt;
    } catch (e) {
      console.error(`year ${y} attempt ${attempt}: ${e.message}`);
      await new Promise((res) => setTimeout(res, 5000 * attempt));
    }
  }
  throw new Error(`could not download ${y}`);
}

function emptyMonth() {
  return {
    n: 0, T: [], Td: [], RH: [], qnh: [], spd: [], calm: 0, vrb: 0, gust: 0, gustKt: [], gustExcess: [],
    rose: Array.from({ length: 12 }, () => new Array(SPD_BINS.length).fill(0)), nDir: 0,
    head03: 0, head21: 0, xw: { 10: 0, 15: 0, 20: 0 }, xwg: { 15: 0, 20: 0, 25: 0 }, tail03_5: 0, tail21_5: 0,
    vis: [], vlt: { 5000: 0, 3000: 0, 1500: 0, 1000: 0, 800: 0, 550: 0 },
    wx: { TS: 0, VCTS: 0, RA: 0, plusRA: 0, SH: 0, VCSH: 0, BR: 0, HZ: 0, FU: 0, FG: 0, DZ: 0, any: 0 },
    noCloud: 0, ceil: { 1500: 0, 1000: 0, 500: 0, 200: 0 }, lowBase: [], cb: 0, tcu: 0, DA: [],
    days: {}, monthYears: new Set(),
  };
}

function analyse(rows, years) {
  const M = Array.from({ length: 12 }, emptyMonth);
  const H = Array.from({ length: 12 }, () => Array.from({ length: 24 }, () => ({ n: 0, T: [], Td: [], spd: [], u: 0, v: 0, ts: 0, ra: 0, v5: 0, br: 0, hz: 0, fu: 0, sectors: new Array(12).fill(0) })));
  const phen = { BR: [], HZ: [], FU: [], FG: [], RA: [], plusRA: [], TS: [], none: [] };
  const phenRH = { BR: [], HZ: [], FU: [], FG: [] };
  const lcl = [];
  const daily = new Map();   // local date -> {T:[], m, n}
  const perYear = {};
  const ext = { Tmax: -99, Tmin: 99, gustMax: 0, visMin: 99999, qnhMin: 9999, qnhMax: 0, daMax: -9e9 };
  const extAt = {};
  let nRoutine = 0, nSpeci = 0, nBad = 0;
  const toRad = Math.PI / 180;

  for (const { valid, metar } of rows) {
    const utc = new Date(valid.replace(' ', 'T') + ':00Z');
    if (isNaN(utc)) { nBad++; continue; }
    const o = parseMetar(metar);
    if (!o) { nBad++; continue; }
    const loc = new Date(utc.getTime() + UTC_OFFSET_H * 3600e3);
    const mo = loc.getUTCMonth(), hr = loc.getUTCHours(), mi = utc.getUTCMinutes();
    const dkey = loc.toISOString().slice(0, 10);
    const routine = mi === 0 || mi === 30;
    const yr = loc.getUTCFullYear();
    // The archive is requested in UTC years; keep only whole local (UTC+7) years so that
    // the last 7 h of 31 Dec do not add a partial extra January.
    if (yr < years[0] || yr > years[1]) { continue; }
    perYear[yr] = perYear[yr] || { routine: 0, speci: 0 };
    const m = M[mo];
    m.monthYears.add(`${yr}-${mo}`);
    const dd = (m.days[dkey] = m.days[dkey] || { TS: false, TSVC: false, FG: false, v1000: false, RA: false });
    if (isTS(o)) dd.TS = true;
    if (isTS(o) || isVCTS(o)) dd.TSVC = true;
    if (hasPh(o, 'FG')) dd.FG = true;
    if (o.vis !== null && o.vis < 1000) dd.v1000 = true;
    if (isRain(o)) dd.RA = true;
    if (o.wind && o.wind.gust && o.wind.gust > ext.gustMax) { ext.gustMax = o.wind.gust; extAt.gustMax = metar; }
    if (!routine) { nSpeci++; perYear[yr].speci++; continue; }
    nRoutine++; perYear[yr].routine++;
    m.n++;
    const h = H[mo][hr]; h.n++;
    if (o.T !== null) {
      m.T.push(o.T); h.T.push(o.T);
      const day = daily.get(dkey) || { T: [], mo, n: 0 }; day.T.push(o.T); day.n++; daily.set(dkey, day);
      if (o.T > ext.Tmax) { ext.Tmax = o.T; extAt.Tmax = metar; }
      if (o.T < ext.Tmin) { ext.Tmin = o.T; extAt.Tmin = metar; }
    }
    if (o.T !== null && o.Td !== null) {
      m.Td.push(o.Td); h.Td.push(o.Td); m.RH.push(rh(o.T, o.Td));
      if (o.qnh) {
        const da = densityAltitudeFt(o.T, o.Td, o.qnh); m.DA.push(da);
        if (da > ext.daMax) { ext.daMax = da; extAt.daMax = metar; }
      }
    }
    if (o.qnh) {
      m.qnh.push(o.qnh);
      if (o.qnh < ext.qnhMin) { ext.qnhMin = o.qnh; extAt.qnhMin = metar; }
      if (o.qnh > ext.qnhMax) { ext.qnhMax = o.qnh; extAt.qnhMax = metar; }
    }
    if (o.wind) {
      const w = o.wind;
      m.spd.push(w.kt); h.spd.push(w.kt);
      if (w.kt === 0) m.calm++;
      else if (w.vrb) m.vrb++;
      else {
        m.nDir++;
        const s = sector12(w.dir), b = binOf(w.kt);
        if (b >= 0) m.rose[s][b]++;
        h.sectors[s]++;
        h.u += -w.kt * Math.sin(w.dir * toRad); h.v += -w.kt * Math.cos(w.dir * toRad);
        const rel03 = (w.dir - RWY03_TRUE) * toRad;
        const head03 = w.kt * Math.cos(rel03), xw = Math.abs(w.kt * Math.sin(rel03));
        if (head03 > 0) m.head03++; else if (head03 < 0) m.head21++;
        if (-head03 >= 5) m.tail03_5++;
        if (head03 >= 5) m.tail21_5++;
        for (const k of [10, 15, 20]) if (xw >= k) m.xw[k]++;
        const g = w.gust || w.kt, xwg = Math.abs(g * Math.sin(rel03));
        for (const k of [15, 20, 25]) if (xwg >= k) m.xwg[k]++;
      }
      if (w.gust) { m.gust++; m.gustKt.push(w.gust); m.gustExcess.push(w.gust - w.kt); }
    }
    if (o.vis !== null) {
      m.vis.push(o.vis);
      for (const k of Object.keys(m.vlt)) if (o.vis < +k) m.vlt[k]++;
      if (o.vis < 5000) h.v5++;
      if (o.vis < ext.visMin) { ext.visMin = o.vis; extAt.visMin = metar; }
    }
    const ts = isTS(o), ra = isRain(o);
    if (ts) { m.wx.TS++; h.ts++; }
    if (isVCTS(o)) m.wx.VCTS++;
    if (ra) { m.wx.RA++; h.ra++; }
    if (isHeavyRain(o)) m.wx.plusRA++;
    if (isShower(o)) m.wx.SH++;
    if (o.wx.some((x) => x.int === 'VC' && x.desc === 'SH')) m.wx.VCSH++;
    for (const k of ['BR', 'HZ', 'FU', 'FG', 'DZ']) if (hasPh(o, k)) m.wx[k]++;
    if (hasPh(o, 'BR')) h.br++;
    if (hasPh(o, 'HZ')) h.hz++;
    if (hasPh(o, 'FU')) h.fu++;
    if (o.wx.some((x) => x.int !== 'VC')) m.wx.any++;
    // visibility by phenomenon
    if (o.vis !== null) {
      const tag = ts ? 'TS' : isHeavyRain(o) ? 'plusRA' : ra ? 'RA' : hasPh(o, 'FG') ? 'FG' : hasPh(o, 'FU') ? 'FU' : hasPh(o, 'HZ') ? 'HZ' : hasPh(o, 'BR') ? 'BR' : (o.wx.length ? null : 'none');
      if (tag) phen[tag].push(o.vis);
      if (tag && phenRH[tag] && o.T !== null && o.Td !== null) phenRH[tag].push(rh(o.T, o.Td));
    }
    // clouds
    const anyCloud = o.clouds.length > 0 || o.vv !== null;
    if (!anyCloud) m.noCloud++;
    const c = ceilingFt(o);
    for (const k of Object.keys(m.ceil)) if (c < +k) m.ceil[k]++;
    if (o.clouds.length) {
      const low = Math.min(...o.clouds.map((l) => l.ft));
      m.lowBase.push(low);
      if (o.clouds.some((l) => l.type === 'CB')) m.cb++;
      if (o.clouds.some((l) => l.type === 'TCU')) m.tcu++;
      // LCL check: daytime (11–16 local), no precipitation, lowest layer FEW/SCT cumuliform-like
      const L0 = o.clouds[0];
      if (hr >= 11 && hr <= 16 && !ra && !ts && (L0.amt === 'FEW' || L0.amt === 'SCT') && o.T !== null && o.Td !== null && o.T - o.Td >= 3) lcl.push({ base: L0.ft, spread: o.T - o.Td });
    }
  }

  // daily max/min (local day, >= 40 of 48 routine reports)
  const dmax = Array.from({ length: 12 }, () => []), dmin = Array.from({ length: 12 }, () => []);
  for (const d of daily.values()) if (d.n >= 40) { dmax[d.mo].push(Math.max(...d.T)); dmin[d.mo].push(Math.min(...d.T)); }

  const SECT = ['N', '030', '060', 'E', '120', '150', 'S', '210', '240', 'W', '300', '330'];
  const monthly = M.map((m, i) => {
    const nMY = [...m.monthYears].length || 1;
    const dvals = Object.values(m.days);
    const cnt = (k) => dvals.filter((d) => d[k]).length;
    return {
      month: i + 1, n: m.n, monthYears: nMY,
      T_mean: r1(mean(m.T)), Tmax_mean: r1(mean(dmax[i])), Tmin_mean: r1(mean(dmin[i])), Tmax_p95: r1(quant(dmax[i], 0.95)),
      Td_mean: r1(mean(m.Td)), RH_mean: r1(mean(m.RH)),
      qnh_mean: r1(mean(m.qnh)), qnh_p05: r1(quant(m.qnh, 0.05)), qnh_p95: r1(quant(m.qnh, 0.95)),
      wind: {
        mean_kt: r1(mean(m.spd)), p90_kt: r1(quant(m.spd, 0.9)), calm_pct: pct(m.calm, m.spd.length), vrb_pct: pct(m.vrb, m.spd.length),
        gust_pct: pct(m.gust, m.spd.length), gust_p95_kt: r1(quant(m.gustKt, 0.95)), gust_excess_median_kt: r1(quant(m.gustExcess, 0.5)),
        rose12_pct: Object.fromEntries(m.rose.map((row, s) => [SECT[s], row.map((x) => pct(x, m.spd.length))])),
        sector12_total_pct: Object.fromEntries(m.rose.map((row, s) => [SECT[s], pct(row.reduce((a, b) => a + b, 0), m.spd.length)])),
      },
      runway: {
        headwind_on_03_pct: pct(m.head03, m.nDir), headwind_on_21_pct: pct(m.head21, m.nDir),
        tailwind_ge5_on_03_pct: pct(m.tail03_5, m.nDir), tailwind_ge5_on_21_pct: pct(m.tail21_5, m.nDir),
        xw_mean_ge10_pct: pct(m.xw[10], m.spd.length), xw_mean_ge15_pct: pct(m.xw[15], m.spd.length), xw_mean_ge20_pct: pct(m.xw[20], m.spd.length),
        xw_gust_ge15_pct: pct(m.xwg[15], m.spd.length), xw_gust_ge20_pct: pct(m.xwg[20], m.spd.length), xw_gust_ge25_pct: pct(m.xwg[25], m.spd.length),
      },
      vis: { median_m: quant(m.vis, 0.5), lt5000_pct: pct(m.vlt[5000], m.vis.length), lt3000_pct: pct(m.vlt[3000], m.vis.length), lt1500_pct: pct(m.vlt[1500], m.vis.length), lt1000_pct: pct(m.vlt[1000], m.vis.length), lt800_pct: pct(m.vlt[800], m.vis.length), lt550_pct: pct(m.vlt[550], m.vis.length) },
      wx_pct: Object.fromEntries(Object.entries(m.wx).map(([k, v]) => [k, pct(v, m.n)])),
      days_per_month: { TS: r1(cnt('TS') / nMY), TS_or_VCTS: r1(cnt('TSVC') / nMY), FG: r1(cnt('FG') / nMY), vis_lt1000: r1(cnt('v1000') / nMY), RA: r1(cnt('RA') / nMY) },
      cloud: {
        no_cloud_reported_pct: pct(m.noCloud, m.n), ceiling_lt1500_pct: pct(m.ceil[1500], m.n), ceiling_lt1000_pct: pct(m.ceil[1000], m.n), ceiling_lt500_pct: pct(m.ceil[500], m.n), ceiling_lt200_pct: pct(m.ceil[200], m.n),
        lowest_base_ft: { p25: quant(m.lowBase, 0.25), median: quant(m.lowBase, 0.5), p75: quant(m.lowBase, 0.75) },
        CB_pct: pct(m.cb, m.n), TCU_pct: pct(m.tcu, m.n),
      },
      density_alt_ft: { mean: Math.round(mean(m.DA) ?? NaN), p95: Math.round(quant(m.DA, 0.95) ?? NaN), max: Math.round(Math.max(...m.DA)) },
    };
  });

  const grid = (f) => H.map((row) => row.map(f));
  const hourly = {
    note: 'rows = month 1..12, columns = local hour 00..23 (UTC+7)',
    T_mean: grid((h) => r1(mean(h.T))), Td_mean: grid((h) => r1(mean(h.Td))), wind_mean_kt: grid((h) => r1(mean(h.spd))),
    wind_vector_from_deg: grid((h) => (h.u || h.v ? Math.round((Math.atan2(-h.u, -h.v) * 180 / Math.PI + 360) % 360) : null)),
    wind_vector_steadiness: grid((h) => (h.spd.length ? r2(Math.hypot(h.u, h.v) / h.spd.reduce((a, b) => a + b, 0) || 0) : null)),
    TS_pct: grid((h) => pct(h.ts, h.n)), RA_pct: grid((h) => pct(h.ra, h.n)), vis_lt5000_pct: grid((h) => pct(h.v5, h.n)),
    BR_pct: grid((h) => pct(h.br, h.n)), HZ_pct: grid((h) => pct(h.hz, h.n)), FU_pct: grid((h) => pct(h.fu, h.n)),
  };
  const vstat = (a) => ({ n: a.length, p10: quant(a, 0.1), median: quant(a, 0.5), p90: quant(a, 0.9) });
  const lclRatio = lcl.map((x) => x.base / x.spread);
  return {
    meta: {
      station: STATION, source: 'Iowa Environmental Mesonet ASOS/METAR archive', url: 'https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py',
      years, n_routine: nRoutine, n_speci_or_offtime: nSpeci, n_unparsed: nBad, per_year: perYear,
      rwy03_true_bearing_deg: r2(RWY03_TRUE), utc_offset_h: UTC_OFFSET_H, elevation_m: ELEV_M,
      method: 'Routine reports at minute 00/30 only for frequencies; SPECIs counted only for days-with. Wind 12 sectors of 30 deg centred on 000, 030 ...; speed bins kt [1-3,4-6,7-10,11-16,17-21,22+]. Calm = 00000KT. Crosswind/headwind from mean wind (and from gust where noted) vs runway true bearing; VRB and calm excluded from headwind fractions. Visibility = prevailing visibility, 9999/CAVOK = 10000 m. Ceiling = lowest BKN/OVC/VV. Density altitude: humid air, station pressure from QNH via ISA, Magnus (Alduchov-Eskridge) vapour pressure.',
    },
    monthly, hourly,
    vis_by_phenomenon_m: Object.fromEntries(Object.entries(phen).map(([k, a]) => [k, vstat(a)])),
    rh_by_phenomenon_pct: Object.fromEntries(Object.entries(phenRH).map(([k, a]) => [k, { n: a.length, median: r1(quant(a, 0.5)), p10: r1(quant(a, 0.1)), p90: r1(quant(a, 0.9)) }])),
    lcl_check: { n: lcl.length, ft_per_degC_median: r1(quant(lclRatio, 0.5)), ft_per_degC_p25: r1(quant(lclRatio, 0.25)), ft_per_degC_p75: r1(quant(lclRatio, 0.75)), note: 'Lowest FEW/SCT base / (T-Td), 11-16 local, no precipitation, spread >= 3 C. Espy rule ~ 400 ft/C (125 m/C).' },
    extremes: { ...ext, daMax: Math.round(ext.daMax), at: extAt },
  };
}

function parseCsv(txt) {
  const rows = [];
  const lines = txt.split('\n');
  for (let k = 1; k < lines.length; k++) {
    const L = lines[k]; if (!L) continue;
    const a = L.indexOf(','), b = L.indexOf(',', a + 1);
    if (a < 0 || b < 0) continue;
    rows.push({ valid: L.slice(a + 1, b), metar: L.slice(b + 1) });
  }
  // de-duplicate identical timestamps (keep the last)
  const seen = new Map(); for (const r of rows) seen.set(r.valid + '|' + r.metar.slice(0, 18), r);
  return [...seen.values()];
}

function selfTest() {
  const ok = (c, msg) => { if (!c) { console.error('FAIL', msg); process.exitCode = 1; } else console.log('ok  ', msg); };
  let o = parseMetar('VTBD 010130Z 04003KT 360V120 9000 NSC 25/16 Q1014 NOSIG');
  ok(o.wind.dir === 40 && o.wind.kt === 3 && o.varFrom === 360 && o.varTo === 120 && o.vis === 9000 && o.nsc && o.T === 25 && o.Td === 16 && o.qnh === 1014, 'basic + variation + NSC');
  o = parseMetar('VTBD 010230Z VRB03KT CAVOK 26/16 Q1014 NOSIG');
  ok(o.wind.vrb && o.wind.kt === 3 && o.cavok && o.vis === 10000, 'VRB + CAVOK');
  o = parseMetar('VTBD 151030Z 24015G28KT 200V280 2000 +TSRA FEW018CB SCT020 BKN080 27/24 Q1008 TEMPO 1000 TSRA');
  ok(o.wind.dir === 240 && o.wind.gust === 28 && o.vis === 2000 && isTS(o) && isRain(o) && isHeavyRain(o) && o.clouds[0].type === 'CB' && ceilingFt(o) === 8000, 'gusty +TSRA with CB, TEMPO cut');
  o = parseMetar('VTBD 042300Z 00000KT 0800 FG VV002 22/22 Q1013');
  ok(o.wind.kt === 0 && o.vis === 800 && hasPh(o, 'FG') && ceilingFt(o) === 200, 'fog + VV');
  o = parseMetar('VTBD 120700Z 18008KT 4000 HZ FEW030 35/22 Q1007 NOSIG');
  ok(hasPh(o, 'HZ') && o.vis === 4000 && !isRain(o), 'haze');
  o = parseMetar('VTBD 120700Z 21010KT 9999 VCTS SCT025CB 33/25 Q1006');
  ok(isVCTS(o) && !isTS(o) && o.clouds[0].type === 'CB', 'VCTS');
  o = parseMetar('VTBD 120700Z 21010KT 9999 -SHRA BR FEW020 SCT025TCU 30/25 Q1006 RMK X');
  ok(isShower(o) && isRain(o) && hasPh(o, 'BR') && o.clouds[1].type === 'TCU', 'SHRA + BR + TCU');
  const da = densityAltitudeFt(35, 24, 1008);
  ok(da > 2800 && da < 3400, `density altitude 35/24 Q1008 = ${da.toFixed(0)} ft`);
  ok(Math.abs(RWY03_TRUE - 28.7) < 0.3, `runway true bearing ${RWY03_TRUE.toFixed(2)}`);
  ok(sector12(355) === 0 && sector12(15) === 1 && sector12(30) === 1 && sector12(210) === 7, 'sectors');
}

async function main() {
  const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => { if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]); return acc; }, []));
  if (args.test) return selfTest();
  const y1 = +(args.from || 2016), y2 = +(args.to || 2025);
  const cache = args.cache || path.join('.cache', 'climo');
  let rows = [];
  for (let y = y1; y <= y2; y++) {
    const txt = await fetchYear(y, cache);
    const r = parseCsv(txt);
    console.error(`${y}: ${r.length} reports`);
    rows = rows.concat(r);
    await new Promise((res) => setTimeout(res, 1500));
  }
  const res = analyse(rows, [y1, y2]);
  const out = args.out || 'vtbd-metar-climo.json';
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(res, null, 1));
  console.error(`wrote ${out}: ${res.meta.n_routine} routine + ${res.meta.n_speci_or_offtime} other reports`);
}

// Run only when executed directly, so the parser can be imported by tests without network access.
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
