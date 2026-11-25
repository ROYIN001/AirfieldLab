// Humid air and QNH (plan item A8; owner's research round 4, docs/research/04-weather.md §6.1, §10.1 tests ATM-1…ATM-10,
// §13 item 1). Expected values and tolerances are the research's table; ATM-8's were computed with QNH as the station
// pressure (elevation 0, see the note there). Then the atmosphere()/Aircraft/Flight wiring and the default weather from
// the VTBD METAR statistics 2016–2025 of the Iowa Environmental Mesonet archive (https://mesonet.agron.iastate.edu, summary
// numbers only, 04-weather.md §2.1 and §11) in docs/research/data/vtbd-metar-climo.json (04-weather.md §13 item 15;
// owner's decision OD-WX-DEFAULTS).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { M } from './harness.mjs';
const { satVap, relHumidity, dewPoint, fieldPressure, airDensity, densityAltitudeFt, densityAltitudeDryFt, pressureAltitudeFt,
  atmosphere, Flight, Aircraft, SCENARIOS, FIELD, FT, KT, AC, WX_DEFAULT } = M;
const near = (got, exp, tol, what) => assert.ok(Math.abs(got - exp) <= tol, `${what}: ${got} (expect ${exp} ± ${tol})`);
const daAt = (qnh, elev, T, Td) => densityAltitudeFt(airDensity(fieldPressure(qnh, elev), T, Td));

test('ATM-1 e_s(30 °C) = 42.367 hPa ± 0.005 (Alduchov & Eskridge 1996)', () => near(satVap(30), 42.367, 0.005, 'e_s'));
test('ATM-2 RH at 33 °C, Td 23 °C = 55.81 % ± 0.05', () => near(relHumidity(33, 23), 55.81, 0.05, 'RH'));
test('ATM-3 ρ at 1008 hPa, 35 °C, RH 60 % (Td 26.08 °C) = 1.1252 ± 0.0005; dry 1.1396, −1.26 %', () => {
  const td = dewPoint(35, 60), wet = airDensity(1008, 35, td), dry = airDensity(1008, 35);
  near(td, 26.08, 0.005, 'Td'); near(wet, 1.1252, 0.0005, 'ρ humid'); near(dry, 1.1396, 0.0005, 'ρ dry');
  near((wet / dry - 1) * 100, -1.26, 0.01, 'Δρ %');
});
// CIPM-2007 (Picard et al. 2008) gives 1.12542 here (Z and enhancement factor): the simple formula is −0.025 % (8 ft of DA)
test('ATM-4 ρ at p_fld 1008.00 hPa, 35 °C, Td 26.1 °C = 1.12514 ± 0.0001 (CIPM-2007 1.12542)', () => near(airDensity(1008, 35, 26.1), 1.12514, 0.0001, 'ρ'));
test('ATM-5 DA at 35.8 °C, Td 24.2 °C, QNH 1008.8, elev 2.65 m = 2,902 ft ± 5 (ρ 1.1243)', () => {
  const rho = airDensity(fieldPressure(1008.8, 2.65), 35.8, 24.2);
  near(rho, 1.1243, 0.00005, 'ρ'); near(densityAltitudeFt(rho), 2902, 5, 'DA ft');
});
test('ATM-6 the same in dry air (e = 0) = 2,521 ft ± 5', () => near(daAt(1008.8, 2.65, 35.8, null), 2521, 5, 'DA ft'));
test('ATM-7 regression of the old rule: densityAltitudeDryFt(2.65, 35.8) = 2,481.8 ft ± 0.5, 420 ft under ATM-5', () => {
  near(densityAltitudeDryFt(2.65, 35.8), 2481.8, 0.5, 'old DA ft');
  near(daAt(1008.8, 2.65, 35.8, 24.2) - densityAltitudeDryFt(2.65, 35.8), 420, 5, 'ATM-5 − ATM-7');
});
test('ATM-8 DA 30 °C RH 80 % QNH 1010 · 24 °C RH 95 % QNH 1013 · 38 °C RH 40 % QNH 1006 = 2,262 · 1,415 · 3,176 ft ± 5', () => {
  // the research computed these with QNH as the station pressure (elevation 0); at 2.65 m each reads 10.7 ft higher
  for (const [T, rh, q, exp] of [[30, 80, 1010, 2262], [24, 95, 1013, 1415], [38, 40, 1006, 3176]]) near(daAt(q, 0, T, dewPoint(T, rh)), exp, 5, `${T} °C RH ${rh} % Q${q}`);
});
test('ATM-9 PA at QNH 1008.8 elev 2.65 m · QNH 1005 elev 9 ft = 130.4 · 235.1 ft ± 1', () => {
  near(pressureAltitudeFt(fieldPressure(1008.8, 2.65)), 130.4, 1, 'PA ft'); near(pressureAltitudeFt(fieldPressure(1005, 9 * FT)), 235.1, 1, 'PA ft');
});
test('ATM-10 DA in January at 32.1 °C, Td 19.8 °C, QNH 1012.5 = 2,283 ft ± 5', () => near(daAt(1012.5, 2.65, 32.1, 19.8), 2283, 5, 'DA ft'));
test('Td above T reads as saturated: airDensity and relHumidity cap e at e_s(T) as atmosphere() does', () => {
  const p = fieldPressure(1009.3, FIELD.elev), isa = 25 - (15 - 0.0065 * FIELD.elev);
  assert.equal(airDensity(p, 25, 27), airDensity(p, 25, 25)); assert.equal(relHumidity(25, 27), 100);
  near(atmosphere(FIELD.elev, isa, 1009.3, 27, FIELD.elev).rho / airDensity(p, 25, 27), 1, 1e-9, 'aircraft ρ / briefing ρ');
});
test('§2.2 DERIVED rows: DA and ρ at Tmax for all 12 months (dew point and MSLP of the WMO normals)', () => {
  const tmax = [32.1, 33.6, 34.9, 35.8, 35.0, 34.1, 33.5, 33.3, 33.1, 32.6, 32.3, 31.6], dew = [19.8, 21.4, 23.1, 24.2, 24.4, 24.2, 23.9, 24.0, 24.2, 23.8, 21.6, 19.4];
  const mslp = [1012.5, 1011.6, 1010.1, 1008.8, 1007.4, 1006.8, 1006.8, 1007.0, 1008.2, 1010.0, 1011.4, 1012.7];
  const da = [2283, 2509, 2736, 2902, 2867, 2784, 2712, 2686, 2628, 2503, 2377, 2214], rho = [1.1452, 1.1376, 1.1299, 1.1243, 1.1255, 1.1283, 1.1307, 1.1316, 1.1335, 1.1377, 1.1420, 1.1476];
  for (let i = 0; i < 12; i++) { const r = airDensity(fieldPressure(mslp[i], 2.65), tmax[i], dew[i]); near(densityAltitudeFt(r), da[i], 1, `month ${i + 1} DA`); near(r, rho[i], 0.00005, `month ${i + 1} ρ`); }
});

test('atmosphere(): QNH scales the ISA pressure, the dew point is read at hDew, old calls are unchanged', () => {
  const isa = 31 - (15 - 0.0065 * FIELD.elev), A = atmosphere(FIELD.elev, isa, 1009.3, 22.8, FIELD.elev);
  near(A.p / 100 / fieldPressure(1009.3, FIELD.elev), 1, 1e-9, 'p / p_fld'); near(A.rho / airDensity(fieldPressure(1009.3, FIELD.elev), 31, 22.8), 1, 1e-9, 'ρ / airDensity');
  for (const h of [0, 2.65, 300, 3000, 12000]) for (const d of [0, 16]) {
    const a = atmosphere(h, d), b = atmosphere(h, d, 1013.25, null);
    assert.equal(a.rho, b.rho); assert.equal(a.p, b.p); assert.equal(a.e, 0);
  }
  assert.equal(atmosphere(0).rho, 101325 / (287.05287 * 288.15), 'pre-A8 sea-level ISA ρ');
  const lo = atmosphere(FIELD.elev + 300, isa, 1009.3, 22.8, FIELD.elev), hi = atmosphere(FIELD.elev + 3000, isa, 1009.3, 22.8, FIELD.elev);
  near(lo.e / lo.p, A.e / A.p, 1e-12, 'constant mixing ratio below the cloud base');
  near(hi.e, satVap(hi.T - 273.15) * 100, 1e-6, 'capped at saturation above it');
});

test('Flight: default weather from the METAR statistics; qnh 1013.25 and dewC null give the old dry ISA air bit for bit', () => {
  const f = new Flight({ wind: SCENARIOS.calm }), g = new Flight({ wind: SCENARIOS.calm, qnh: 1013.25, dewC: null }), h = f.ac.air.h;
  assert.deepEqual([f.qnh, f.dewC, f.oatC, f.ac.qnh, f.ac.dewC], [WX_DEFAULT.qnh, WX_DEFAULT.dewC, 31, 1009.3, 22.8]);
  assert.equal(g.ac.air.rho, atmosphere(FIELD.elev + h, g.ac.isaDev).rho, 'dry ISA');
  assert.equal(f.ac.air.rho, f.ac.atm(h).rho, 'aircraft air data from the weather');
  const a0 = f.ac.atm(0);   // the dew point is read at the field (hDew = FIELD.elev), not at MSL
  near(a0.e / 100, satVap(WX_DEFAULT.dewC), 1e-6, 'e at the field = e_s(Td)');
  near(a0.rho / airDensity(fieldPressure(WX_DEFAULT.qnh, FIELD.elev), WX_DEFAULT.oatC, WX_DEFAULT.dewC), 1, 1e-9, 'aircraft ρ at the field = airDensity');
  for (const x of [f, g]) near(x.ac.air.ias / KT, AC.Vapp, 0.5, 'trim IAS');
  near(f.ac.air.V / g.ac.air.V, Math.sqrt(g.ac.air.rho / f.ac.air.rho), 1e-6, 'TAS ∝ 1/√ρ at the same IAS');
  near(f.ac.air.rho / g.ac.air.rho, 0.9857, 0.0005, 'humid air at QNH 1009.3 is 1.4 % thinner');
  const n = new Flight({ wind: SCENARIOS.calm, qnh: null }), s = new Flight({ wind: SCENARIOS.calm, qnh: 1013.25 });   // null QNH = standard
  assert.ok(Number.isFinite(n.ac.air.rho)); assert.equal(n.qnh, 1013.25); assert.equal(n.ac.air.rho, s.ac.air.rho);
  assert.equal(new Aircraft().dewC, null); assert.equal(new Aircraft().qnh, 1013.25);   // bare Aircraft (modes, stall tests): ISA, dry
});

test('WX_DEFAULT is the n-weighted annual mean QNH and the 11 LT dew point of vtbd-metar-climo.json', () => {
  const c = JSON.parse(fs.readFileSync(new URL('../docs/research/data/vtbd-metar-climo.json', import.meta.url), 'utf8'));
  const n = c.monthly.map((m) => m.n), N = n.reduce((s, v) => s + v, 0), wmean = (f) => c.monthly.reduce((s, m, i) => s + n[i] * f(m, i), 0) / N;
  assert.equal(N, 174872);
  near(wmean((m) => m.qnh_mean), WX_DEFAULT.qnh, 0.05, 'annual mean QNH');
  near(wmean((m, i) => c.hourly.Td_mean[i][11]), WX_DEFAULT.dewC, 0.05, 'annual mean Td at 11 LT');
  near(wmean((m, i) => c.hourly.T_mean[i][11]), 31.4, 0.05, 'annual mean T at 11 LT');
});

test('src/90-app.js: the briefing uses the humid density altitude and the flights get the weather', () => {
  const app = fs.readFileSync(new URL('../src/90-app.js', import.meta.url), 'utf8');
  assert.match(app, /qnh = wx\.qnh \?\? P0_HPA/, 'no QNH = 1013.25 hPa in the briefing too');
  assert.match(app, /densityAltitudeFt\(airDensity\(fieldPressure\(qnh, FIELD\.elev\), wx\.oatC, wx\.dewC\)\)/);
  assert.match(app, /\['QNH', `\$\{Math\.floor\(qnh\)\} hPa`\]/);
  assert.match(app, /oatC: app\.wx\.oatC, qnh: app\.wx\.qnh, dewC: app\.wx\.dewC/);
  assert.match(app, /function newDemo\(\)[\s\S]*?new Flight\(\{[^\n]*\.\.\.app\.wx \}\)/, 'demo flights get the weather');
  assert.doesNotMatch(app, /densityAltitudeFt\(FIELD\.elev/);
});
