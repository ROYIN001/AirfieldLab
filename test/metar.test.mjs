// METAR/SPECI decoder src/21-metar.js (research round 4, docs/research/04-weather.md §3, §6.7, §8, tests MET-1…MET-8
// in §10.5). Checks the research's test reports with exact values, every real METAR quoted in §3.2, the edge cases
// of each group, the derived helpers (ceiling, RVR per runway end, gust σu, rain rate, runway state, issue time, a null
// report), what goes to unknown (a second once-only group, an impossible time or direction, a group that clashes with
// CAVOK, a weather combination outside WMO code table 4678, a header keyword in the station slot), 2,000 seeded random
// reports (never throw, every key present, the first group of each kind never unknown, junk always), that the file is
// DOM-free and that the harness exports the same functions. MET-6 runs the self-test of tools/climo, which decodes with this file. Only reports
// printed in the research or synthetic ones appear here (the IEM archive itself is not copied).
// Run: node --test test/metar.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { M as H } from './harness.mjs';

const src = fs.readFileSync(new URL('../src/21-metar.js', import.meta.url), 'utf8');
const NAMES = ['parseMetar', 'metarCeilingFt', 'metarRvrFor', 'metarGustSigmaKt', 'metarRainMmh', 'metarRunway', 'metarIssuedMs'];
const X = new Function('"use strict";\n' + src + `\nreturn { ${NAMES.join(', ')} };`)();
const { parseMetar: P, metarCeilingFt, metarRvrFor, metarGustSigmaKt, metarRainMmh, metarRunway, metarIssuedMs } = X;
const KEYS = ['raw', 'type', 'station', 'time', 'nil', 'auto', 'cor', 'wind', 'visibility_m', 'visibilityOp', 'visibilityNdv',
  'visMin', 'rvr', 'wx', 'sky', 'cavok', 'clouds', 'vv_ft', 'obscured', 'oat_C', 'dew_C', 'qnh_hPa', 'recent', 'windshear',
  'rwyState', 'trend', 'rmk', 'missing', 'unknown'];
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ''} ${a} vs ${b}`);
const body = (s) => P('VTBD 010000Z ' + s);   // a synthetic report around a few groups
const wx = (code, int, desc, ph) => ({ code, int, desc, ph });
const rvr = (rwy, m, trend = null, o = {}) => ({ rwy, m, op: '', maxM: null, maxOp: '', trend, ...o });
const wind = (o) => ({ fromDeg: null, kt: null, gustKt: null, vrb: false, varFrom: null, varTo: null, calm: false, above: false, unit: 'KT', ...o });
const blk = (o) => ({ kind: 'TEMPO', from: null, until: null, at: null, wind: null, visibility_m: null, visibilityOp: '', wx: [], nsw: false,
  sky: null, cavok: false, clouds: [], vv_ft: null, obscured: false, ...o });

test('MET-1: fog with RVR R21 and a BECMG trend that does not change the current fields', () => {
  const m = P('VTBD 022330Z 11003KT 0500 R21/0400N FG SCT003 23/23 Q1010 BECMG TL0030 1500 BR');
  assert.equal(m.station, 'VTBD'); assert.equal(m.type, 'METAR');
  assert.deepEqual(m.time, { day: 2, hour: 23, minute: 30 });
  assert.deepEqual(m.wind, wind({ fromDeg: 110, kt: 3 }));
  assert.equal(m.visibility_m, 500); assert.equal(m.visibilityOp, '');
  assert.deepEqual(m.wx, [wx('FG', '', '', ['FG'])]);
  assert.deepEqual(m.clouds, [{ amt: 'SCT', base_ft: 300, type: null }]);
  assert.equal(m.oat_C, 23); assert.equal(m.dew_C, 23); assert.equal(m.qnh_hPa, 1010);
  assert.deepEqual(m.rvr, [rvr('21', 400, 'N')]);
  assert.deepEqual(m.trend, [blk({ kind: 'BECMG', until: 30, visibility_m: 1500, wx: [wx('BR', '', '', ['BR'])] })]);
  assert.deepEqual([m.missing, m.unknown, m.rmk], [[], [], null]);
});

test('MET-2: directional minimum visibility 4000S, four layers with CB, TEMPO until 15:30', () => {
  const m = P('VTBD 011430Z 25015KT 9000 4000S -RA FEW007 FEW018CB SCT040 BKN080 27/25 Q1006 TEMPO TL1530 3000 TSRA');
  assert.deepEqual(m.wind, wind({ fromDeg: 250, kt: 15 }));
  assert.equal(m.visibility_m, 9000);
  assert.deepEqual(m.visMin, { m: 4000, dir: 'S' });
  assert.deepEqual(m.wx, [wx('-RA', '-', '', ['RA'])]);
  assert.deepEqual(m.clouds, [{ amt: 'FEW', base_ft: 700, type: null }, { amt: 'FEW', base_ft: 1800, type: 'CB' },
    { amt: 'SCT', base_ft: 4000, type: null }, { amt: 'BKN', base_ft: 8000, type: null }]);
  assert.equal(metarCeilingFt(m), 8000);
  assert.deepEqual(m.trend, [blk({ until: 930, visibility_m: 3000, wx: [wx('TSRA', '', 'TS', ['RA'])] })]);
  assert.deepEqual(m.unknown, []);
});

test('MET-3: variation 360V080, recent TS, wet runway, NOSIG', () => {
  const t = 'VTBD 011630Z 05006KT 360V080 9000 -RA FEW007 FEW020CB SCT035 BKN080 25/24 Q1009 RETS NOSIG';
  const m = P(t);
  assert.equal(m.wind.fromDeg, 50); assert.equal(m.wind.kt, 6);
  assert.equal(m.wind.varFrom, 360); assert.equal(m.wind.varTo, 80);
  assert.deepEqual(m.recent, [wx('TS', '', 'TS', [])]);
  assert.deepEqual(metarRunway(m), { wet: true, rwycc: 5, cause: 'precip' });
  assert.deepEqual(metarRunway(P(t.replace(' -RA', ''))), { wet: true, rwycc: 5, cause: 'recent' });
  assert.equal(metarRainMmh(P(t.replace(' -RA', ''))), 0, 'recent weather is not rain falling');
  assert.deepEqual(m.trend, [blk({ kind: 'NOSIG' })]);
  assert.deepEqual(m.unknown, []);
});

test('MET-4: VRB05G16KT gives σu ≈ 3.67 kt; 9999 is 10 km or more', () => {
  const m = P('VTBD 010500Z VRB05G16KT 9999 FEW020 33/23 Q1007 NOSIG');
  assert.deepEqual(m.wind, wind({ vrb: true, kt: 5, gustKt: 16 }));
  near(metarGustSigmaKt(m), 3.6667, 0.01, 'σu');
  assert.equal(m.visibility_m, 10000); assert.equal(m.visibilityOp, 'P');
  assert.equal(metarGustSigmaKt(P('VTBD 010500Z 05005KT 9999')), null, 'no gust');
  assert.equal(metarGustSigmaKt(P('VTBD 010500Z 9999')), null, 'no wind');
});

test('MET-6: tools/climo decodes with this file and still passes its self-test (10 ok)', () => {
  const tool = fileURLToPath(new URL('../tools/climo/metar-climo.mjs', import.meta.url));
  const code = fs.readFileSync(tool, 'utf8');
  assert.match(code, /new URL\('\.\.\/\.\.\/src\/21-metar\.js'/, 'the tool loads the page decoder');
  assert.doesNotMatch(code, /function parseMetar\(raw\) \{\s*const out = \{/, 'no tool-local parser left');
  assert.doesNotMatch(code, /WX_RE|\(FEW\|SCT\|BKN\|OVC\)/, 'no tool-local group regexes left');
  const out = execFileSync(process.execPath, [tool, '--test'], { encoding: 'utf8' });   // throws on a non-zero exit
  assert.equal(out.split('\n').filter((l) => l.startsWith('ok')).length, 10);
});

test('MET-7: thick fog with VV001 and RVR R21 = 175 m on both 21 runways', () => {
  const m = P('VTBD 020000Z 11005KT 0150 R21/0175N FG VV001 22/22 Q1010 BECMG TL0100 0550 FG');
  assert.equal(m.visibility_m, 150);
  assert.deepEqual(m.wx, [wx('FG', '', '', ['FG'])]);
  assert.equal(m.vv_ft, 100); assert.equal(m.obscured, true);
  assert.equal(metarCeilingFt(m), 100);
  assert.deepEqual(m.rvr, [rvr('21', 175, 'N')]);
  assert.equal(metarRvrFor(m, '21L').m, 175);
  assert.equal(metarRvrFor(m, '21R').m, 175);
  assert.equal(metarRvrFor(m, '03L'), null, 'R21 is never used for the other end');
  assert.deepEqual(m.trend, [blk({ kind: 'BECMG', until: 60, visibility_m: 550, wx: [wx('FG', '', '', ['FG'])] })]);
});

test('MET-8: two RVR groups, one per runway end', () => {
  const m = P('VTBD 130030Z 11005KT 0800 R21/0650 R03/1800 FG SCT010 24/24 Q1012 TEMPO 0500 FG');
  assert.equal(m.visibility_m, 800);
  assert.deepEqual(m.wx, [wx('FG', '', '', ['FG'])]);
  assert.deepEqual(m.rvr, [rvr('21', 650), rvr('03', 1800)]);
  assert.equal(metarRvrFor(m, '21R').m, 650);
  assert.equal(metarRvrFor(m, '03L').m, 1800);
  assert.equal(metarRvrFor(m, '03R').m, 1800);
  // an exact L/R group wins over the bare end number; the first match is returned
  const e = body('0800 R21/0650 R21R/0500 R21/0700 FG');
  assert.equal(metarRvrFor(e, '21R').m, 500);
  assert.equal(metarRvrFor(e, '21L').m, 650);
  assert.equal(metarRvrFor(e, '21').m, 650);
});

test('every real METAR quoted in research §3.2 (and MET-7 of §10.5) decodes with nothing unknown or missing', () => {
  const R = [
    'VTBD 011330Z 20011KT 9999 FEW020CB SCT040 30/25 Q1006 NOSIG',
    'VTBD 011400Z 23015KT 9000 -RA FEW018CB SCT040 BKN080 27/25 Q1006 TEMPO TL1450 4000 TSRA',
    'VTBD 011430Z 25015KT 9000 4000S -RA FEW007 FEW018CB SCT040 BKN080 27/25 Q1006 TEMPO TL1530 3000 TSRA',
    'VTBD 011500Z 30009KT 8000 -TSRA FEW008 SCT018CB BKN040 BKN070 27/25 Q1008 TEMPO TL1540 3000 TSRA',
    'VTBD 011530Z 30011KT 8000 -TSRA FEW008 SCT018CB BKN030 BKN070 25/24 Q1008 RERA BECMG TL1630 NSW',
    'VTBD 011630Z 05006KT 360V080 9000 -RA FEW007 FEW020CB SCT035 BKN080 25/24 Q1009 RETS NOSIG',
    'VTBD 021900Z 27005KT 9999 TS FEW020CB SCT035 27/25 Q1007 TEMPO FM1930 TL2030 18015G25KT 4000 TSRA',
    'VTBD 010500Z VRB05G16KT 9999 FEW020 33/23 Q1007 NOSIG',
    'VTBD 012330Z 10004KT 070V150 3000 BR FEW008 23/22 Q1010 BECMG TL2400 1500 BR',
    'VTBD 022230Z 11004KT 5000 BR NSC 24/23 Q1009 BECMG TL2330 3000 BR',
    'VTBD 022300Z 10005KT 0800 R21/0500D FG FEW005 24/23 Q1009 BECMG TL2400 3000 BR',
    'VTBD 022330Z 11003KT 0500 R21/0400N FG SCT003 23/23 Q1010 BECMG TL0030 1500 BR',
    'VTBD 020000Z 11005KT 0150 R21/0175N FG VV001 22/22 Q1010 BECMG TL0100 0550 FG',
  ];
  for (const t of R) {
    const m = P(t);
    assert.deepEqual([m.unknown, m.missing], [[], []], t);
    assert.equal(m.raw, t);
    assert.ok(m.wind && m.visibility_m !== null && m.oat_C !== null && m.qnh_hPa !== null && m.trend.length > 0, t);
  }
  // §3.2 ข.: the TEMPO with FM/TL and a gusty wind; §3.2 ก. line 5: RERA, BECMG NSW; line 2: TL1450
  const b = P(R[6]);
  assert.deepEqual(b.trend, [blk({ from: 1170, until: 1230, wind: wind({ fromDeg: 180, kt: 15, gustKt: 25 }), visibility_m: 4000,
    wx: [wx('TSRA', '', 'TS', ['RA'])] })]);
  assert.deepEqual(b.wx, [wx('TS', '', 'TS', [])]);
  const g5 = P(R[4]);
  assert.deepEqual(g5.recent, [wx('RA', '', '', ['RA'])]);
  assert.deepEqual(g5.trend, [blk({ kind: 'BECMG', until: 990, nsw: true })]);
  assert.equal(P(R[1]).trend[0].until, 890);
  assert.equal(P(R[8]).trend[0].until, 1440, 'TL2400');
  assert.deepEqual(P(R[10]).rvr, [rvr('21', 500, 'D')]);
});

test('visibility: CAVOK, 0000, 9999NDV, directional minimum, ////', () => {
  let m = P('VTBD 031000Z VRB02KT CAVOK 34/20 Q1009 NOSIG');
  assert.deepEqual([m.visibility_m, m.visibilityOp, m.cavok, m.sky, m.clouds], [10000, 'P', true, 'CAVOK', []]);
  assert.equal(metarCeilingFt(m), Infinity);
  m = body('0000 FG');
  assert.deepEqual([m.visibility_m, m.visibilityOp], [0, '']);
  m = body('9999NDV');
  assert.deepEqual([m.visibility_m, m.visibilityOp, m.visibilityNdv], [10000, 'P', true]);
  m = body('3000 1500NE 1200SW');
  assert.deepEqual(m.visMin, { m: 1500, dir: 'NE' });
  assert.deepEqual(m.unknown, ['1200SW'], 'a second directional minimum');
  m = body('//// 25/20');
  assert.deepEqual([m.visibility_m, m.missing], [null, ['visibility']]);
  assert.deepEqual(body('9000 8000').unknown, ['8000'], 'a second prevailing visibility');
});

test('visibility in statute miles (US form): 10SM, P6SM, 1/2SM, 3/4SM, M1/4SM, 1 1/2SM', () => {
  const v = (s) => { const m = body(s); assert.deepEqual(m.unknown, [], s); return [m.visibility_m, m.visibilityOp]; };
  const SM = 1609.344;
  assert.deepEqual(v('10SM'), [10 * SM, '']);
  assert.deepEqual(v('P6SM'), [6 * SM, 'P']);
  assert.deepEqual(v('1/2SM'), [0.5 * SM, '']);
  assert.deepEqual(v('3/4SM'), [0.75 * SM, '']);
  assert.deepEqual(v('M1/4SM'), [0.25 * SM, 'M']);
  assert.deepEqual(v('1 1/2SM BR'), [1.5 * SM, '']);
  assert.deepEqual(body('1 BR').unknown, ['1'], 'a lone digit without a fraction');
});

test('wind: calm, MPS and KMH (not rounded), P99KT, /////KT, a second wind group', () => {
  assert.deepEqual(body('00000KT').wind, wind({ fromDeg: 0, kt: 0, calm: true }));
  assert.equal(body('00000MPS').wind.calm, true);
  let w = body('05005G10MPS').wind;
  assert.equal(w.unit, 'MPS'); assert.equal(w.kt, 5 / 0.514444); assert.equal(w.gustKt, 10 / 0.514444);
  near(w.kt, 9.719, 0.001);
  w = body('05018KMH').wind;
  assert.equal(w.unit, 'KMH'); assert.equal(w.kt, 18 / 1.852);
  w = body('270P99KT').wind;
  assert.deepEqual([w.fromDeg, w.kt, w.above], [270, 99, true]);
  assert.deepEqual([body('270P49MPS').wind.above, body('27030G45KT').wind.above], [true, false]);
  let m = body('/////KT 9999');
  assert.deepEqual([m.wind, m.missing], [null, ['wind']]);
  m = body('23015KT 25010KT 9999');
  assert.deepEqual([m.wind.fromDeg, m.unknown], [230, ['25010KT']]);
  // the variation is also taken before the wind group; a second one is unknown
  m = body('200V280 24015KT 180V300');
  assert.deepEqual([m.wind.varFrom, m.wind.varTo, m.unknown], [200, 280, ['180V300']]);
});

test('RVR: P, M, variable, feet, slashes, no trend; runway state groups', () => {
  let m = body('0300 R21L/P2000N R03/M0050D R21/0600V1000U R21R/0400VP1500 R28L/2400FT R28R/1000V2000FT/D R21///// R03////// FG');
  assert.deepEqual(m.rvr, [
    rvr('21L', 2000, 'N', { op: 'P' }), rvr('03', 50, 'D', { op: 'M' }), rvr('21', 600, 'U', { maxM: 1000 }),
    rvr('21R', 400, null, { maxM: 1500, maxOp: 'P' }), rvr('28L', 2400 * 0.3048), rvr('28R', 1000 * 0.3048, 'D', { maxM: 2000 * 0.3048 }),
    rvr('21', null), rvr('03', null),
  ]);
  assert.deepEqual([m.missing, m.unknown], [['rvr'], []]);
  m = body('9999 R21/290050 R21L/CLRD// 88290050');
  assert.deepEqual([m.rwyState, m.rvr, m.unknown], [['R21/290050', 'R21L/CLRD//', '88290050'], [], []]);
});

test('present and recent weather: //, FZFG, VCSH, +FC, TS alone, RE//, RETSRA, NSW in the body', () => {
  let m = body('9999 // 25/20');
  assert.deepEqual([m.wx, m.missing], [[], ['wx']]);
  m = body('0300 FZFG VCSH +FC TS');
  assert.deepEqual(m.wx, [wx('FZFG', '', 'FZ', ['FG']), wx('VCSH', 'VC', 'SH', []), wx('+FC', '+', '', ['FC']), wx('TS', '', 'TS', [])]);
  m = body('9999 RE// RETSRA RESHRA REDZ');
  assert.deepEqual(m.recent, [wx('TSRA', '', 'TS', ['RA']), wx('SHRA', '', 'SH', ['RA']), wx('DZ', '', '', ['DZ'])]);
  assert.deepEqual([m.unknown, m.missing], [[], []]);
  assert.deepEqual(body('9999 NSW VC + RE').unknown, ['NSW', 'VC', '+', 'RE']);
  assert.deepEqual(body('9999 +SHRASN').wx, [wx('+SHRASN', '+', 'SH', ['RA', 'SN'])]);
});

test('sky: NSC, NCD, SKC, CLR, FEW020///, //////CB, VV///', () => {
  for (const k of ['NSC', 'NCD', 'SKC', 'CLR']) {
    const m = body('9999 ' + k);
    assert.deepEqual([m.sky, m.clouds, m.unknown], [k, [], []], k);
  }
  let m = body('9999 FEW020/// //////CB ////// BKN/// 25/20');
  assert.deepEqual(m.clouds, [{ amt: 'FEW', base_ft: 2000, type: null }, { amt: null, base_ft: null, type: 'CB' },
    { amt: null, base_ft: null, type: null }, { amt: 'BKN', base_ft: null, type: null }]);
  assert.deepEqual([m.missing, m.unknown], [['clouds'], []]);
  assert.equal(metarCeilingFt(m), Infinity, 'a layer without a base is ignored');
  m = body('0100 FG VV///');
  assert.deepEqual([m.obscured, m.vv_ft, metarCeilingFt(m)], [true, null, 0]);
  assert.equal(metarCeilingFt(body('9999 FEW010 SCT012 OVC030 BKN025')), 2500);
});

test('temperature and pressure: M temps, 25/, /////, A2992, Q////, a second group', () => {
  let m = body('M05/M10 Q1030');
  assert.deepEqual([m.oat_C, m.dew_C, m.qnh_hPa], [-5, -10, 1030]);
  assert.deepEqual([body('25/').oat_C, body('25/').dew_C, body('25///').dew_C], [25, null, null]);
  m = body('/////');
  assert.deepEqual([m.oat_C, m.dew_C, m.missing], [null, null, ['temperature']]);
  near(body('A2992').qnh_hPa, 1013.2, 0.05, 'A2992');
  m = body('Q////');
  assert.deepEqual([m.qnh_hPa, m.missing], [null, ['qnh']]);
  m = body('27/25 26/24 Q1006 Q1007');
  assert.deepEqual([m.oat_C, m.qnh_hPa, m.unknown], [27, 1006, ['26/24', 'Q1007']]);
  assert.deepEqual(body('W25/S3 W///H12').unknown, [], 'sea state is recognised and not stored');
});

test('wind shear: WS R21L, WS RWY03R and WS ALL RWY merge; a lone WS is unknown', () => {
  assert.deepEqual(body('9999 WS R21L WS RWY03R').windshear, { all: false, rwys: ['21L', '03R'] });
  let m = body('9999 WS ALL RWY');
  assert.deepEqual([m.windshear, m.unknown], [{ all: true, rwys: [] }, []]);
  m = body('9999 WS IN APCH');
  assert.deepEqual([m.windshear, m.unknown], [null, ['WS', 'IN', 'APCH']]);
  assert.deepEqual(body('9999 WS').unknown, ['WS']);
});

test('header: NIL, COR AUTO in either order, leading COR, SPECI, no station', () => {
  let m = P('VTBD 010000Z NIL');
  assert.deepEqual([m.nil, m.station, m.unknown, m.wind], [true, 'VTBD', [], null]);
  assert.deepEqual(P('METAR VTBD 010000Z NIL 9999 Q1010').unknown, ['9999', 'Q1010']);
  m = P('VTBD 010000Z COR AUTO 00000KT 9999NDV NCD 25/20 Q1010');
  assert.deepEqual([m.cor, m.auto, m.unknown], [true, true, []]);
  m = P('METAR VTBD 010000Z AUTO COR 00000KT');
  assert.deepEqual([m.type, m.cor, m.auto, m.unknown], ['METAR', true, true, []]);
  m = P('COR VTBD 150600Z 18005KT 9999 FEW030 30/24 Q1008 NOSIG');   // synthetic; IEM keeps COR in front
  assert.deepEqual([m.cor, m.station, m.time.day, m.unknown], [true, 'VTBD', 15, []]);
  m = P('SPECI VTBD 011515Z 30020G35KT 2000 +TSRA');
  assert.deepEqual([m.type, m.wind.gustKt, m.visibility_m], ['SPECI', 35, 2000]);
  m = P('23015KT 9000 TSRA');
  assert.deepEqual([m.station, m.time, m.wind.kt, m.unknown], [null, null, 15, []]);
  assert.equal(P('VTBD 010000Z 9999 TSRA').station, 'VTBD', 'TSRA later is never a station');
});

test('normalisation: = terminator, lowercase, newlines and tabs; RMK kept raw', () => {
  const m = P('  vtbd 011400z\n23015kt\t9000  -ra\r\n27/25 q1006 rmk ts  ovhd= trailing junk');
  assert.equal(m.raw, 'VTBD 011400Z 23015KT 9000 -RA 27/25 Q1006 RMK TS OVHD');
  assert.deepEqual([m.wind.kt, m.visibility_m, m.qnh_hPa, m.rmk, m.unknown], [15, 9000, 1006, 'TS OVHD', []]);
  assert.equal(P('VTBD 010000Z 9999 RMK').rmk, '');
  assert.equal(P('VTBD 010000Z 9999').rmk, null);
});

test('TREND: FM/TL/AT, NSW, two blocks, NOSIG ends it, garbage is unknown', () => {
  let m = body('9999 FEW020 TEMPO FM1200 TL1400 VRB15G30KT 3000 TSRA FEW018CB BECMG AT1500 CAVOK NSW RMK X');
  assert.deepEqual(m.trend, [
    blk({ from: 720, until: 840, wind: wind({ vrb: true, kt: 15, gustKt: 30 }), visibility_m: 3000, wx: [wx('TSRA', '', 'TS', ['RA'])],
      clouds: [{ amt: 'FEW', base_ft: 1800, type: 'CB' }] }),
    blk({ kind: 'BECMG', at: 900, visibility_m: 10000, visibilityOp: 'P', cavok: true, sky: 'CAVOK', nsw: true }),
  ]);
  assert.deepEqual([m.visibility_m, m.wx, m.clouds.length, m.rmk, m.unknown], [10000, [], 1, 'X', []]);
  m = body('9999 BECMG 1 1/2SM BR NSC VV002');
  assert.equal(m.trend[0].visibility_m, 1.5 * 1609.344);
  assert.deepEqual([m.trend[0].sky, m.trend[0].vv_ft, m.trend[0].obscured, m.unknown], ['NSC', 200, true, []]);
  m = body('9999 NOSIG RESHRA TEMPO TL0430 5000 RMK Y');
  assert.deepEqual([m.trend.length, m.unknown, m.rmk], [1, ['RESHRA', 'TEMPO', 'TL0430', '5000'], 'Y']);
  m = body('9999 TEMPO 4000 3000 R21/0500 QQ12 2000/TSRA');
  assert.deepEqual([m.trend[0].visibility_m, m.unknown], [4000, ['3000', 'R21/0500', 'QQ12', '2000/TSRA']]);
});

test('garbage tokens go to unknown; empty, M and non-strings give null', () => {
  assert.deepEqual(body('9999 QQ12 FEW20 SCT0100 BKB100 11002T 13003 FEW020CU').unknown,
    ['QQ12', 'FEW20', 'SCT0100', 'BKB100', '11002T', '13003', 'FEW020CU']);
  for (const v of ['', '   ', 'M', ' m\n', '=', null, undefined, 42, {}]) assert.equal(P(v), null, String(v));
  assert.deepEqual(Object.keys(P('X')), KEYS);
  assert.deepEqual(P('X').unknown, ['X']);
});

test('robustness: 2,000 seeded random reports never throw and keep every key; groups are never lost', () => {
  let s = 12345;
  const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32);   // LCG (Numerical Recipes)
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  // groups taken once per report, by kind (CAVOK is left out: it clashes with half of the others, tested on its own)
  const ONCE = { wind: ['23015KT', 'VRB05G16KT', '/////KT'], var: ['360V080'], vis: ['9999', '0800', '1/2SM', '1 1/2SM'],
    visMin: ['4000S'], sky: ['NSC'], vv: ['VV001'], temp: ['27/25', 'M01/M03'], qnh: ['Q1006', 'A2992'] };
  const KIND = new Map(Object.entries(ONCE).flatMap(([k, a]) => a.map((g) => [g, k])));
  const MANY = ['R21/0400N', 'R03/1800', 'R21/////', 'R21/290050', '-RA', 'TSRA', 'VCSH', 'FG', '//', 'FEW018CB', 'BKN080',
    '//////CB', 'RETS', 'RE//', 'W25/S3'];
  const JUNK = ['QQ12', 'ZZZZZ', '12/34/56', 'KT', 'FEWX', 'A12', 'Q10', 'VVV', '+', 'RE', '1/SM', 'SCT0100', 'R2X/12', '%$#', 'Ω',
    'FZ', '-FG', '+BR', 'VCRA', 'REFZ', '999V999', '37015KT', '05010G08KT'];
  const TREND = ['TEMPO', 'BECMG', 'NOSIG', 'FM1200', 'TL1330', 'AT0100', 'NSW', '3000', 'TSRA', 'SCT020', '18015G25KT'];
  const CHARS = 'VTBD0123456789/ KTRAMPSGFEWNOSCBQ+-=\n';
  const count = (a, t) => a.filter((x) => x === t).length;
  for (let n = 0; n < 2000; n++) {
    let text;
    if (n % 10 === 9) {   // raw character soup
      text = Array.from({ length: Math.floor(rnd() * 60) }, () => pick(CHARS)).join('');
    } else {
      const t = [];
      if (rnd() < 0.3) t.push(pick(['METAR', 'SPECI']));
      t.push('VTBD', '010000Z');
      if (rnd() < 0.2) t.push(pick(['AUTO', 'COR']));
      const groups = Array.from({ length: Math.floor(rnd() * 14) },
        () => (rnd() < 0.3 ? pick(pick(Object.values(ONCE))) : rnd() < 0.7 ? pick(MANY) : pick(JUNK)));
      const trend = rnd() < 0.5 ? [pick(['TEMPO', 'BECMG', 'NOSIG']), ...Array.from({ length: Math.floor(rnd() * 6) }, () => pick(TREND))] : [];
      if (rnd() < 0.2) trend.push('RMK', pick(JUNK));
      text = [...t, ...groups, ...trend].join(' ');
      const m = P(text);
      assert.deepEqual(Object.keys(m), KEYS, text);
      // tokens of the body: the first group of each kind and every repeatable group are never unknown (a token may
      // be unknown only as often as it is a later group of its kind or a token of the TREND part), junk always is
      const first = new Map();
      for (const g of groups) if (KIND.has(g) && !first.has(KIND.get(g))) first.set(KIND.get(g), g);
      const w = first.get('wind');
      if (!w || w !== '23015KT') first.delete('var');   // a variation needs a wind with a direction
      const body = groups.join(' ').split(' '), firstToks = [...first.values()].join(' ').split(' ');
      for (const tok of new Set(body)) {
        if (count(JUNK, tok) && !count(trend, tok)) { assert.ok(m.unknown.includes(tok), `${tok} in ${text}`); continue; }
        if (!KIND.has(tok) && !MANY.includes(tok) && tok !== '1') continue;
        const allowed = count(body, tok) - count(firstToks, tok) - (MANY.includes(tok) ? count(body, tok) : 0) + count(trend, tok)
          + (KIND.get(tok) === 'var' && !first.has('var') ? 1 : 0);
        assert.ok(count(m.unknown, tok) <= allowed, `${tok} in ${text}`);
      }
    }
    const m = P(text);
    if (m !== null) assert.deepEqual(Object.keys(m), KEYS, JSON.stringify(text));
    else assert.equal(text.split('=')[0].trim().toUpperCase().replace(/^M$/, ''), '', JSON.stringify(text));
  }
});

test('metarIssuedMs: day and time resolved against a reference time', () => {
  const at = (iso) => Date.parse(iso);
  const tm = (day, hour, minute) => ({ time: { day, hour, minute } });
  assert.equal(metarIssuedMs(tm(1, 14, 0), at('2024-09-01T15:00Z')), at('2024-09-01T14:00Z'));
  assert.equal(metarIssuedMs(tm(31, 23, 30), at('2024-09-01T00:30Z')), at('2024-08-31T23:30Z'));
  assert.equal(metarIssuedMs(tm(30, 12, 0), at('2024-03-01T01:00Z')), at('2024-01-30T12:00Z'), 'February has no 30th');
  assert.equal(metarIssuedMs(tm(1, 15, 50), at('2024-09-01T15:00Z')), at('2024-09-01T15:50Z'), '50 min ahead: clock skew');
  assert.equal(metarIssuedMs(tm(1, 16, 30), at('2024-09-01T15:00Z')), at('2024-08-01T16:30Z'), '90 min ahead: last month');
  assert.equal(metarIssuedMs(tm(31, 0, 0), at('2024-07-15T00:00Z')), at('2024-05-31T00:00Z'), 'June has no 31st');
  assert.equal(metarIssuedMs({ time: null }, at('2024-09-01T15:00Z')), null);
  assert.equal(metarIssuedMs(P('VTBD 9999'), at('2024-09-01T15:00Z')), null);
  assert.equal(metarIssuedMs(tm(32, 0, 0), at('2024-09-01T15:00Z')), null);
  assert.equal(metarIssuedMs(P('VTBD 011400Z 9999'), at('2024-09-01T15:00Z')), at('2024-09-01T14:00Z'));
  assert.equal(metarIssuedMs(tm(31, 23, 0), at('2025-01-01T00:10Z')), at('2024-12-31T23:00Z'), 'across a new year');
  // a report up to 1 h ahead on the 1st while the clock is still in the last hour of the month (or year) before
  assert.equal(metarIssuedMs(tm(1, 0, 10), at('2024-09-30T23:30Z')), at('2024-10-01T00:10Z'), 'skew across a month end');
  assert.equal(metarIssuedMs(tm(1, 0, 10), at('2024-12-31T23:30Z')), at('2025-01-01T00:10Z'), 'skew across a year end');
  assert.equal(metarIssuedMs(tm(29, 0, 20), at('2024-02-28T23:30Z')), at('2024-02-29T00:20Z'), 'leap day ahead');
  assert.equal(metarIssuedMs(tm(1, 24, 0), at('2024-09-01T15:00Z')), null, 'hour 24 is not an issue time');
});

test('metarRainMmh and metarRunway (research §6.7, §5.5, §8.2)', () => {
  const rain = (s) => metarRainMmh(body('9999 ' + s));
  assert.deepEqual(['-RA', 'RA', '+RA', '+TSRA', '-TSRA', '+SHRA', 'VCSH', 'DZ', '', '-RA +TSRA'].map(rain), [1, 5, 20, 50, 1, 20, 0, 0, 0, 50]);
  const rwy = (s) => metarRunway(body('9999 ' + s));
  assert.deepEqual(rwy('FEW020'), { wet: false, rwycc: 6, cause: 'dry' });
  assert.deepEqual(rwy('-RA'), { wet: true, rwycc: 5, cause: 'precip' });
  assert.deepEqual(rwy('DZ'), { wet: true, rwycc: 5, cause: 'precip' });
  assert.deepEqual(rwy('RERA'), { wet: true, rwycc: 5, cause: 'recent' });
  assert.deepEqual(rwy('RESHRA'), { wet: true, rwycc: 5, cause: 'recent' });
  assert.deepEqual(rwy('VCSH'), { wet: false, rwycc: 6, cause: 'dry' });
  assert.deepEqual(rwy('BR'), { wet: false, rwycc: 6, cause: 'dry' });
});

test('src/21-metar.js is DOM-free and the harness exports the same functions', () => {
  for (const bad of ['document', 'window', 'fetch(', 'Date.now', 'Math.random', 'new Date()', 'import ', 'export ']) {
    assert.ok(!src.includes(bad), bad);
  }
  for (const n of NAMES) assert.equal(typeof H[n], 'function', n);
  const t = 'VTBD 011430Z 25015KT 9000 4000S -RA FEW007 FEW018CB 27/25 Q1006 TEMPO TL1530 3000 TSRA';
  assert.deepEqual(H.parseMetar(t), X.parseMetar(t));
  // every top-level name carries the metar prefix (one script with every other src file)
  const names = [...src.matchAll(/^(?:const|let|function|class)\s+([A-Za-z_$][\w$]*)/gm)].map((g) => g[1]);
  assert.ok(names.length >= 10);
  for (const n of names) assert.match(n, /^(parseMetar|metar[A-Z]\w*|METAR_\w+)$/, n);
});

test('header: the station slot never takes AUTO, NIL or a body group; impossible times are not taken', () => {
  let m = P('METAR AUTO 011400Z 9999');
  assert.deepEqual([m.station, m.auto, m.time, m.unknown], [null, true, { day: 1, hour: 14, minute: 0 }, []]);
  m = P('TSRA 9999 25/24 Q1010');
  assert.deepEqual([m.station, m.wx, m.unknown], [null, [wx('TSRA', '', 'TS', ['RA'])], []]);
  assert.deepEqual([P('RETS 9999').station, P('P6SM BR').visibility_m], [null, 6 * 1609.344]);
  assert.deepEqual([P('METAR NIL').station, P('METAR NIL').nil], [null, true]);
  assert.equal(P('SASA 011200Z 9999').station, 'SASA', 'a station that reads as weather, followed by its time');
  m = P('VTBD 999999Z 9999');
  assert.deepEqual([m.time, m.unknown], [null, ['999999Z']]);
  assert.deepEqual([P('VTBD 012400Z 9999').time, P('VTBD 320000Z 9999').time, P('VTBD 001200Z 9999').time], [null, null, null]);
  m = body('9999 TEMPO TL9999 FM2460 FM1200 TL2410 TL1300 AT0100 AT0200');
  assert.deepEqual([m.trend[0].from, m.trend[0].until, m.trend[0].at, m.unknown], [720, 1450, 60, ['TL9999', 'FM2460', 'TL1300', 'AT0200']]);
});

test('wind: impossible direction, gust not above the mean, a variation without a wind to attach to', () => {
  let m = body('99015KT 9999');
  assert.deepEqual([m.wind, m.unknown], [null, ['99015KT']]);
  m = body('23015KT 999V999 370V010');
  assert.deepEqual([m.wind.varFrom, m.unknown], [null, ['999V999', '370V010']]);
  assert.deepEqual(body('05010G08KT 05010G10KT').unknown, ['05010G08KT', '05010G10KT'], 'a gust is above the mean');
  for (const w of ['00000KT', 'VRB05KT', '/////KT', '']) {
    m = body(`${w} 360V080 9999`.trim());
    assert.deepEqual([m.wind && m.wind.varFrom, m.unknown], [null, ['360V080']], w);
  }
  m = P('VTBD 150900Z 24012T 200V280 9999');   // synthetic typo of KT: the variation is kept in unknown, not dropped
  assert.deepEqual([m.wind, m.unknown], [null, ['24012T', '200V280']]);
  // reported against the observer's thresholds, kept as reported (the VTBD archive has both forms)
  assert.deepEqual([body('00000G12KT').wind.gustKt, body('00000G12KT').wind.calm, body('00002KT').wind.kt], [12, true, 2]);
  assert.equal(body('03002KT 360V080').wind.varTo, 80);
});

test('CAVOK replaces visibility, RVR, weather and cloud groups: a clash goes to unknown', () => {
  let m = body('9999 CAVOK');
  assert.deepEqual([m.visibility_m, m.cavok, m.sky, m.unknown], [10000, false, null, ['CAVOK']]);
  m = body('CAVOK FEW020 NSC -RA // R21/0600 R21///// 4000S VV001 RERA WS R21L');
  assert.deepEqual([m.cavok, m.sky, m.clouds, m.wx, m.rvr, m.visMin, m.vv_ft, m.missing],
    [true, 'CAVOK', [], [], [], null, null, []]);
  assert.deepEqual(m.unknown, ['FEW020', 'NSC', '-RA', '//', 'R21/0600', 'R21/////', '4000S', 'VV001']);
  assert.deepEqual([m.recent.length, m.windshear], [1, { all: false, rwys: ['21L'] }], 'recent weather and wind shear stay');
  for (const g of ['NSC', 'FEW020', '-RA', 'R21/0600', '////', '4000S']) {
    m = body(g + ' CAVOK');
    assert.deepEqual([m.cavok, m.unknown], [false, ['CAVOK']], g);
  }
  m = body('9999 BECMG CAVOK FEW020 TSRA TEMPO FEW020 CAVOK');
  assert.deepEqual([m.trend[0].cavok, m.trend[0].clouds, m.trend[0].wx, m.trend[1].cavok, m.unknown],
    [true, [], [], false, ['FEW020', 'TSRA', 'CAVOK']]);
});

test('a second sky keyword or VV goes to unknown; a TREND block takes no slashes; M00 is 0', () => {
  let m = body('9999 NSC NCD');
  assert.deepEqual([m.sky, m.unknown], ['NSC', ['NCD']]);
  m = body('0100 FG VV001 VV005');
  assert.deepEqual([m.vv_ft, m.unknown], [100, ['VV005']]);
  m = body('9999 BECMG // ////// /////KT NSC SKC VV002 VV003');
  assert.deepEqual([m.trend[0].clouds, m.trend[0].wind, m.trend[0].sky, m.trend[0].vv_ft], [[], null, 'NSC', 200]);
  assert.deepEqual(m.unknown, ['//', '//////', '/////KT', 'SKC', 'VV003']);
  m = body('M00/M00');
  assert.ok(Object.is(m.oat_C, 0) && Object.is(m.dew_C, 0), 'not -0');
});

test('present weather: only the combinations of WMO code table 4678', () => {
  const bad = ['FZ', 'MI', 'BC', 'PR', 'BL', 'DR', 'SH', '-FG', '+BR', 'VCRA', '-TS', '+TS', 'VCSHRA', 'MIBR', 'FZSN', 'BLRA', 'TSFG', 'VCFZFG', '-FC'];
  let m = body('9999 ' + bad.join(' '));
  assert.deepEqual([m.wx, m.unknown], [[], bad]);
  m = body('9999 REFZ REMI RESH');
  assert.deepEqual([m.recent, m.unknown], [[], ['REFZ', 'REMI', 'RESH']]);
  const good = ['VCTS', 'VCSH', 'VCFG', 'BCFG', 'PRFG', 'MIFG', 'FZFG', 'FZRA', '-FZDZ', 'BLSN', 'VCBLDU', 'DRSA', '+SS', 'DS', '-SHGS',
    '+TSGR', 'TS', '+FC', 'VCPO', 'HZ', 'FU', 'BR', 'RASN', 'UP', 'SQ'];
  m = body('0500 ' + good.join(' '));
  assert.deepEqual([m.wx.map((w) => w.code), m.unknown], [good, []]);
  m = body('9999 RETS RESHRA REFZRA REBLSN RETSGR');
  assert.deepEqual([m.recent.length, m.unknown], [5, []]);
});

test('derived helpers: a null report, a missing RVR beside a value, a very long report', () => {
  for (const f of [metarCeilingFt, metarGustSigmaKt, metarRainMmh, metarRunway]) assert.equal(f(P('')), null, f.name);
  assert.equal(metarRvrFor(null, '21L'), null);
  assert.equal(metarIssuedMs(null, 0), null);
  let m = body('0300 R21L///// R21/0600');
  assert.equal(metarRvrFor(m, '21L').m, 600, 'a missing exact group does not hide R21');
  assert.deepEqual(metarRvrFor(m, '21R'), rvr('21', 600));
  m = body('0300 R21L///// R03/0500');
  assert.deepEqual(metarRvrFor(m, '21L'), rvr('21L', null), 'the missing group when nothing else');
  assert.equal(metarRvrFor(m, '21R'), null);
  m = body('BKN010 '.repeat(200000) + 'OVC008');
  assert.equal(metarCeilingFt(m), 800);
});
