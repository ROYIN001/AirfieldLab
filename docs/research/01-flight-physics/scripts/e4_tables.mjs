// Section 4: tables for the JSON block (corrected power map, ITT map, P_avail grid) from the proposed model.
import { M } from 'test/harness.mjs';
import { makeEngine, ENG } from './e4_engine.mjs';
const E = makeEngine(); const FT = M.FT;
const Ngc = [52, 60, 68, 76, 84, 90, 95, 100, 104];
console.log('PcFrac', JSON.stringify(Ngc.map(n => +(E.fMap(n) / ENG.P_rated).toFixed(3))));
const pcf = [0, 0.05, 0.25, 0.5, 0.75, 0.964, 1.0];
console.log('ITTc_K vs Pc/P_rated', JSON.stringify(pcf.map(f => +E.ITTc(f * ENG.P_rated).toFixed(0))), 'slope K/kW', (E.slope * 1e3).toFixed(4));
const alts = [0, 2500, 5000, 7500, 10000, 15000, 20000]; const dIsa = [0, 10, 20, 25];
const grid = alts.map(ft => dIsa.map(d => { const a = M.atmosphere(ft * FT, d); return +(E.limits(a.T / 288.15, a.p / 101325, 2000).P / 1e3).toFixed(0); }));
console.log('Pavail_static kW rows=alt_ft cols=ISAdev', JSON.stringify(grid));
console.log('shp of 700 kW', (700 / 0.745700).toFixed(1), '708 kW', (708 / 0.7457).toFixed(1), '932 kW', (932 / 0.7457).toFixed(1));
console.log('Qlim lbft 708kW@2000', (708e3 / (2000 * Math.PI / 30) / 1.355818).toFixed(0), 'Nm', (708e3 / (2000 * Math.PI / 30)).toFixed(0));
console.log('Qlim PT6A-68 932kW@2000', (932e3 / (2000 * Math.PI / 30)).toFixed(0), 'Nm', (932e3 / (2000 * Math.PI / 30) / 1.355818).toFixed(0), 'lbft');
console.log('gear ratio -62', (30145 / 2000).toFixed(2), ' Ngmax pct', (39000 / 37468 * 100).toFixed(2));
console.log('H_gg 0.12 kg m2 @37468 rpm', (0.12 * 37468 * Math.PI / 30).toFixed(0), 'N m s');
