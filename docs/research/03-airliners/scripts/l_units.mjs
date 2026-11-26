// l_units.mjs — หัวข้อ 3.3: ตัวเลขแปลงหน่วยและค่าที่ได้จากสูตรง่าย ๆ ที่ใช้ในบล็อก JSON (ทุกค่าพิมพ์จาก Node)
const KT = 0.514444, FT = 0.3048, LB = 0.45359237, D2R = Math.PI / 180, f = (x, d = 3) => +x.toFixed(d);
// α_CLmax แบบเส้นตรง = α* - 0.10/CLα (นิยามใน l_aero_modes.mjs: CL_lin(α*) = CLmax + 0.10)
const CLa_deg = { a320: 5.302 * D2R, a321: 5.317 * D2R };
const astar = { a320: { CONF0: 14.0, CONF1: 19.5, 'CONF1+F': 19.0, CONF2: 18.5, CONF3: 17.5, FULL: 17.6 }, a321ceo: { FULL: 17.4 }, a321neo: { FULL: 18.3 } };
console.log('alpha_CLmax a320', Object.fromEntries(Object.entries(astar.a320).map(([k, v]) => [k, f(v - 0.10 / CLa_deg.a320, 1)])));
console.log('alpha_CLmax a321ceo FULL', f(17.4 - 0.10 / CLa_deg.a321, 1), ' a321neo FULL', f(18.3 - 0.10 / CLa_deg.a321, 1));
// K ต่อ CONF = 1/(π A e)
const A = 34.10 ** 2 / 122.6, e = { CONF1: 0.78, 'CONF1+F': 0.75, CONF2: 0.72, CONF3: 0.72, FULL: 0.70 };
console.log('A', f(A), ' A sharklet geometric', f(35.80 ** 2 / 122.6), ' K', Object.fromEntries(Object.entries(e).map(([k, v]) => [k, f(1 / (Math.PI * A * v), 4)])), ' e_clean from k 0.0386:', f(1 / (Math.PI * A * 0.0386), 3));
console.log('induced factor (34.10/35.80)^2 =', f((34.10 / 35.80) ** 2, 3));
// เชื้อเพลิง (ความหนาแน่น 0.785 kg/L ตาม Airbus Getting to Grips W&B)
for (const [n, L] of [['A320ceo CFM', 24209], ['A320ceo IAE', 23859], ['A320neo', 23740], ['A321ceo CFM', 24050], ['A321ceo IAE', 23700], ['A321neo', 23490], ['A321neo ACF max (ACT)', 32943], ['A321XLR', 39748]]) console.log(n, L, 'L =', f(L * 0.785, 0), 'kg');
// ความเร็ว/ระยะ
for (const kt of [20, 40, 72, 80, 130, 133.5, 195, 350]) console.log(kt, 'kt =', f(kt * KT, 2), 'm/s');
for (const ft of [39100, 39800, 41000, 39000, 20000, 25000, 50]) console.log(ft, 'ft =', f(ft * FT, 0), 'm');
for (const fpm of [2500, 708]) console.log(fpm, 'fpm =', f(fpm * FT / 60, 2), 'm/s');
console.log('3500 NM =', f(3500 * 1.852, 0), 'km; 151510 lb =', f(151510 * LB, 0), 'kg; TCDS LEMAC 700.85 in =', f(700.85 * 0.0254, 4), 'm DAT, nose STA', f(600.85 * 0.0254, 3), 'm; MAC 165.10 in =', f(165.10 * 0.0254, 4), 'm');
console.log('H-arm check: CG% = (H - 17.8016)/0.041935 -> 25% at H =', f(17.8016 + 25 * 0.041935, 3), 'm DAT');
console.log('A321 LEMAC STA est = 15.262 + 4.27 =', f(15.262 + 4.27, 2), 'm');
// แรงขับ approach ต่อเครื่อง เป็น lbf
console.log('25.6 kN =', f(25600 / 4.44822, 0), 'lbf; 28.8 kN =', f(28800 / 4.44822, 0), 'lbf');
// FBW static_cg_height 8.89 ft, ส่วนสูง; spring FG units
console.log('8.89 ft =', f(8.89 * FT, 2), 'm');
// speedbrake ประมาณ: FBW spoiler drag 0.05775 × (3/5 แผง) × (40/50 องศา)
console.log('speedbrake flight dCD est =', f(0.05775 * 0.6 * 0.8, 4));
// MTW = MTOW + 400 kg (รูปแบบเดียวกันทุก WV ใน AC และสำเนา limitations)
for (const m of [79000, 97000, 93500]) console.log('MTW est', m + 400);
// ค่าที่พิมพ์ในบทสรุป
console.log('60500 kg =', f(60500 / LB, 0), 'lb; 1440 m =', f(1440 / FT, 0), 'ft; 122.6 m2 =', f(122.6 / 0.09290304, 1), 'ft2; FG 0.044/deg =', f(0.044 * 180 / Math.PI, 2), '/rad');
