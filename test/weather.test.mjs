// Humid air and QNH (plan item A8; owner's research round 4, docs/research/04-weather.md §6.1, §10.1 tests ATM-1…ATM-10,
// §13 item 1). Expected values and tolerances are the research's table; ATM-8's were computed with QNH as the station
// pressure (elevation 0, see the note there). Then the atmosphere()/Aircraft/Flight wiring and the default weather from
// the VTBD METAR statistics 2016–2025 of the Iowa Environmental Mesonet archive (https://mesonet.agron.iastate.edu, summary
// numbers only, 04-weather.md §2.1 and §11) in docs/research/data/vtbd-metar-climo.json (04-weather.md §13 item 15;
// owner's decision OD-WX-DEFAULTS).
// Then the wind (plan item A9; 04-weather.md §6.3, §6.4, §10.2 tests WND-4…WND-6 and WND-8…WND-10, §13 item 3; round 1
// 01-flight-physics/08-wind.md §8.3, §8.7, T-W-08): log-law mean wind with z0 0.05 m and the turbulence intensity W20
// set apart from it. WND-7 tests the 3 s gust-factor table (`GUST_FACTOR_3S`); nothing reads it before B10/B11's METAR gusts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { M } from './harness.mjs';
const { satVap, relHumidity, dewPoint, fieldPressure, airDensity, densityAltitudeFt, densityAltitudeDryFt, pressureAltitudeFt,
  atmosphere, Flight, Aircraft, SCENARIOS, FIELD, FT, KT, AC, WX_DEFAULT, Wind, logLaw, WIND_PROFILE, W20_PER_KT_LEGACY, windW20, GUST_FACTOR_3S } = M;
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

// ── Wind (plan A9). Expected values and tolerances are the research's table (04-weather.md §10.2); WND-4 uses z0 0.03 m
// only to test the formula (the default is round 1's 0.05 m, §9.1). ──
test('WND-4 log law z0 0.03 m: U(h)/U10 at 2, 5, 15, 30, 100 m = 0.7229, 0.8807, 1.0698, 1.1891, 1.3964 ± 1e-4', () => {
  const w = new Wind({ kt: 10, z0: 0.03 });
  [[2, 0.7229], [5, 0.8807], [15, 1.0698], [30, 1.1891], [100, 1.3964]].forEach(([h, r]) => {
    near(logLaw(h, 0.03), r, 1e-4, `logLaw ${h} m`); near(w.speedAt(h) / (10 * KT), r, 1e-4, `Wind ${h} m`);
  });
});
test('WND-5 the old 1/7 rule (law power): U(h)/U10 at 2, 15, 100 m = 0.7946, 1.0596, 1.3895 ± 1e-4', () => {
  const w = new Wind({ kt: 10, law: 'power' });
  [[2, 0.7946], [15, 1.0596], [100, 1.3895]].forEach(([h, r]) => near(w.speedAt(h) / (10 * KT), r, 1e-4, `${h} m`));
});
test('WND-6 town (H 15 m: d 10.5, z0 1.5) against the field (z0 0.03), same wind at 300 m, at 30 m: 0.650 ± 0.005', () => {
  near(logLaw(30, 1.5, 10.5, 300) / logLaw(30, 0.03, 0, 300), 0.650, 0.005, 'ratio');   // measured 0.6498
});
test('T-W-08 (round 1) z0 0.046 m, W10 15 kt: 18.1 kt at 100 ft, 11.7 at 10 ft ± 0.1, 15.0 at 10 m; the default: z0 0.05 m, 10 m reference, flat above 300 m, 0 at z0', () => {
  const w = new Wind({ kt: 15, z0: 0.15 * FT });
  near(w.speedAt(100 * FT) / KT, 18.1, 0.1, '100 ft'); near(w.speedAt(10 * FT) / KT, 11.7, 0.1, '10 ft'); near(w.speedAt(10) / KT, 15, 1e-12, '10 m');
  assert.deepEqual([WIND_PROFILE.z0, WIND_PROFILE.zRef, WIND_PROFILE.top], [0.05, 10, 300]);
  const d = new Wind({ kt: 10 });
  assert.equal(d.speedAt(500), d.speedAt(300)); assert.equal(d.speedAt(0.05), 0); assert.equal(d.speedAt(-1), 0);
  near(d.speedAt(50 * FT) / (10 * KT), 1.0795, 1e-4, '50 ft'); near(d.speedAt(10 * FT) / (10 * KT), 0.7758, 1e-4, '10 ft');
});
test('Wind z0: null or absent = the default 0.05 m; 0, negative, NaN or ≥ zRef 10 m throws (no NaN or negative wind)', () => {
  const d = new Wind({ kt: 10 });
  assert.equal(new Wind({ kt: 10, z0: null }).speedAt(30), d.speedAt(30)); assert.equal(new Wind({ kt: 10, z0: undefined }).z0, 0.05);
  for (const z0 of [0, -0.1, NaN, 10, 12]) assert.throws(() => new Wind({ kt: 10, z0 }), RangeError, `z0 ${z0}`);
  assert.ok(Number.isFinite(new Wind({ kt: 10, z0: 9.9 }).speedAt(30)));
});
// the Flight builds its Wind with the log law and z0 0.05 m (WND-4 and T-W-08 above test only a bare Wind; the A9
// touchdown bands alone would not catch a Flight left on the 1/7 rule, whose REF values sit inside the old band)
test('a Flight flies the log-law wind: xl mean wind at a height of 10 ft 11.636 kt (1/7 rule 12.66), at 50 ft 16.19 (15.93)', () => {
  const f = new Flight({ wind: SCENARIOS.xl, seed: 5 }), w = f.ac.wind;
  assert.equal(w.law, 'log'); assert.equal(w.z0, WIND_PROFILE.z0);
  near(Math.hypot(...w.mean(10 * FT)) / KT, 11.636, 0.002, 'Flight mean wind at 10 ft');
  near(Math.hypot(...w.mean(50 * FT)) / KT, 16.192, 0.002, 'Flight mean wind at 50 ft');
  const p = new Wind({ kt: 15, law: 'power' });
  near(p.speedAt(10 * FT) / KT, 12.66, 0.01, '1/7 rule at 10 ft'); near(p.speedAt(50 * FT) / KT, 15.93, 0.01, '1/7 rule at 50 ft');
});
test('WND-8 Dryden low altitude, h 100 ft, W20 15 kt: σw 1.5 kt, σu 2.574 kt ± 0.005, Lu 505.2 ft, Lw 100 ft ± 0.5', () => {
  const P = Wind.lowAlt(100, 15);
  near(P.sw / KT, 1.5, 0.005, 'σw'); near(P.su / KT, 2.574, 0.005, 'σu'); near(P.Lu / FT, 505.2, 0.5, 'Lu'); near(P.Lw / FT, 100, 0.5, 'Lw');
  // h clipped to 10…1000 ft (08-wind.md §8.3, JSBSim's 10 ft clip): no Lw → 0 or NaN at the ground, flat above 1000 ft
  for (const h of [-5, 0, 3]) assert.deepEqual(Wind.lowAlt(h, 15), Wind.lowAlt(10, 15), `clipped at 10 ft (h ${h})`);
  for (const h of [2000, 3000]) assert.deepEqual(Wind.lowAlt(h, 15), Wind.lowAlt(1000, 15), `clipped at 1000 ft (h ${h})`);
});
test('WND-9 Dryden low altitude, h 500 ft, W20 30 kt: σw 3.0, σu 3.709 kt ± 0.005, Lu 944.7 ft ± 0.5', () => {
  const P = Wind.lowAlt(500, 30);
  near(P.sw / KT, 3.0, 0.005, 'σw'); near(P.su / KT, 3.709, 0.005, 'σu'); near(P.Lu / FT, 944.7, 0.5, 'Lu');
});
test('WND-7 gust factor: U10 10 kt in-land gives a 3 s gust of 16.6 kt ± 0.05 (table 1.66 / 1.52 / 1.38 / 1.23)', () => {
  near(10 * GUST_FACTOR_3S.inLand, 16.6, 0.05, 'in-land 3 s gust');
  assert.deepEqual(GUST_FACTOR_3S, { inLand: 1.66, offLand: 1.52, offSea: 1.38, atSea: 1.23 });
});
// hot_apr_afternoon arrives with B10's WeatherState; its W20 15 kt is §6.4's "บ่ายร้อน (thermal)" and byRegime convective
// (ค่าประมาณ). A9 tests the mechanism: 600 s at 100 ft, 50 m/s, seed 7 gives RMS w 0.774 against σw 0.772 m/s.
test('WND-10 calm air can be turbulent: U10 0 with W20 15 kt gives RMS w ≈ σw 0.772 m/s ± 10 % (was 0), also in a Flight', () => {
  const w = new Wind({ kt: 0, W20: 15, seed: 7 }); let s2 = 0; const n = 240 * 600;
  for (let i = 0; i < n; i++) { w.update(1 / 240, 100 * FT, 50, 0); const g = w.at(100 * FT); s2 += g[2] * g[2]; }
  assert.equal(Math.hypot(...w.mean(100 * FT)), 0, 'no mean wind');
  near(Math.sqrt(s2 / n), Wind.lowAlt(100, 15).sw, 0.1 * 0.772, 'RMS w, 600 s');
  const f = new Flight({ wind: SCENARIOS.calm, W20: 15, seed: 5 });
  assert.equal(f.W20, 15); for (let i = 0; i < 240; i++) f.tick(f.dt);
  assert.ok(Math.hypot(...f.ac.wind.g) > 0, 'gusts in a calm Flight with W20');
  // σw = 0.1·W20 does not depend on height, so RMS w would not see metres passed as feet: check the unit directly
  const seen = [], orig = Wind.lowAlt; Wind.lowAlt = (h, W) => (seen.push([h, W]), orig(h, W));
  try { new Wind({ kt: 0, W20: 15 }).update(1 / 240, 100 * FT, 50, 0); } finally { Wind.lowAlt = orig; }
  near(seen[0][0], 100, 1e-9, 'update passes h in ft'); assert.equal(seen[0][1], 15, 'update passes W20 in kt');
});
test('W20 per scenario keeps the old turbulence (turb × 0.932·kt); calm has none; a wind with no W20 keeps the old rule', () => {
  near(W20_PER_KT_LEGACY, 0.9318, 1e-4, '0.61^(1/7)');
  const exp = { calm: 0, head: 5.591, xr: 7.455, xl: 22.364 };
  for (const [k, v] of Object.entries(exp)) { near(SCENARIOS[k].W20, v, 1e-3, k); near(new Flight({ wind: SCENARIOS[k] }).W20, v, 1e-3, `Flight ${k}`); }
  const c = new Flight({ wind: SCENARIOS.calm }); for (let i = 0; i < 240; i++) c.tick(c.dt);
  assert.deepEqual([...c.ac.wind.g], [0, 0, 0], 'calm stays turbulence-free');
  near(new Wind({ kt: 15, turb: 1.6 }).W20, 22.364, 1e-3, 'legacy turb (explore demo, research scripts)');
  assert.equal(new Wind({ kt: 0, turb: 2 }).W20, 0, 'legacy coupling: no wind, no turbulence');
  assert.equal(new Flight({ wind: SCENARIOS.xl, W20: 0 }).W20, 0, 'the Flight option overrides the scenario');
  // null or absent W20 means "the scenario's" (as qnh: null means the default); an explicit 0 overrides a legacy turb
  near(new Flight({ wind: SCENARIOS.xl, W20: null }).W20, 22.364, 1e-3, 'W20 null keeps the scenario');
  assert.equal(new Wind({ kt: 15, turb: 1.6, W20: 0 }).W20, 0, 'W20 0 overrides turb');
  assert.equal(new Flight({ wind: { fromDeg: 40, kt: 15, turb: 1.1 }, W20: 0 }).W20, 0, 'demo spec + W20 0');
  near(new Flight({ wind: { fromDeg: 40, kt: 15, turb: 1.1 } }).W20, 15.375, 1e-3, 'demo spec, legacy turb');
  near(windW20({ kt: 15, turb: 1.1 }), 15.375, 1e-3, 'windW20 legacy'); assert.equal(windW20(SCENARIOS.xr), SCENARIOS.xr.W20);
  // Wind.turb: the old turb equivalent, so a script that rebuilds a Wind from w.turb (s9_turbclock.mjs) keeps W20
  const x = new Flight({ wind: SCENARIOS.xl, seed: 5 }).ac.wind;
  near(x.turb, 1.6, 1e-12, 'xl turb'); near(new Wind({ kt: x.kt, turb: x.turb }).W20, x.W20, 1e-12, 'rebuilt from turb');
  assert.equal(new Wind({ kt: 0, W20: 15 }).turb, 0, 'no mean wind: turb 0');
});
test('src/90-app.js: the scenario card names the turbulence from W20 (light < 30 kt, moderate < 45, severe)', () => {
  const app = fs.readFileSync(new URL('../src/90-app.js', import.meta.url), 'utf8');
  assert.match(app, /const turbWord = \(w\) => \(w >= 45 \? 'ปั่นป่วนรุนแรง' : w >= 30 \? 'ปั่นป่วนปานกลาง' : w > 0 \? 'ปั่นป่วนเล็กน้อย' : ''\)/);
  assert.match(app, /const tw = turbWord\(windW20\(sc\)\)/, 'the same W20 rule as the Flight');
  assert.doesNotMatch(app, /sc\.turb/);
});
test('src/90-app.js: the windsocks follow the flight\'s resolved wind (a scenario has rel, not fromDeg)', () => {
  const app = fs.readFileSync(new URL('../src/90-app.js', import.meta.url), 'utf8');
  assert.match(app, /const sockWind = app\.mode === 'train' && app\.flight \? app\.flight\.ac\.wind : app\.wind;/);
  assert.match(app, /yawFor\(sockWind\.fromDeg \+ 180\), ext = clamp\(sockWind\.kt \/ 15, 0, 1\)/);
  assert.doesNotMatch(app, /windSpec/, 'Flight.windSpec is gone (the input spec may lack fromDeg)');
  for (const k of Object.keys(SCENARIOS)) assert.ok(Number.isFinite(new Flight({ wind: SCENARIOS[k] }).ac.wind.fromDeg), `${k}: fromDeg`);
  assert.equal(new Flight({ wind: SCENARIOS.xl }).windSpec, undefined, 'no Flight.windSpec');
});
