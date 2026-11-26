// ───────────────────────── App: modes, cameras, input, panels and the render loop ─────────────────────────
const $ = (s) => document.querySelector(s);
const isTouch = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
const reduceMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } } };
const QUALITY = { balanced: { pr: 1.25, shadow: 2048 }, high: { pr: 2, shadow: 4096 } };
const TZ = FIELD.tzH * 3600e3;
const localParts = (date) => { const d = new Date(date.getTime() + TZ); return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), min: d.getUTCHours() * 60 + d.getUTCMinutes() }; };
const makeDate = (y, m, d, min) => new Date(Date.UTC(y, m, d, 0, 0) - TZ + min * 60e3);
const hhmm = (min) => `${String(Math.floor(min / 60) % 24).padStart(2, '0')}:${String(Math.floor(min % 60)).padStart(2, '0')}`;
const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// position relative to a runway end: s metres past its landing threshold (negative = on the approach), t metres right
function RE(id, s, t, y) { const E = RWY_END[id]; return [E.thr[1] + E.u[1] * s + E.r[1] * t, E.thr[0] + E.u[0] * s + E.r[0] * t, y]; }
// runway in use from the surface wind: 03 when the north-easterly gives a headwind on 03, otherwise 21 (AIP preferential)
const inUse = () => (app.wind.kt * Math.cos((app.wind.fromDeg - RWY_END['03L'].hdg) * DEG) > 3 ? '03L' : '21R');
const PTS = {};   // filled from the scene data in main()
const PRESETS = {
  overview: { name: 'ภาพรวมสนาม', p: () => RE('03L', -1500, -1250, 820), t: () => RE('03L', 1750, 120, 0), fov: 46 },
  approach: { name: 'บนแนวร่อน 3°', p: () => { const id = inUse(); return RE(id, -2600, 0, (2600 + RWY_END[id].aim) * Math.tan(3 * DEG) + 2); }, t: () => RE(inUse(), 450, 0, 0), fov: 36 },
  runway: { name: 'หัวทางวิ่ง 21R', p: () => RE('21R', -240, -14, 11), t: () => RE('21R', 900, 0, 0), fov: 46 },
  disp: { name: 'หัวทางวิ่ง 21L ที่เลื่อนเข้ามา', p: () => RE('21L', -520, 30, 30), t: () => RE('21L', 60, 0, 0), fov: 46 },
  papi: { name: 'ไฟ PAPI ทาง 21R', p: () => RE('21R', RWY_END['21R'].papi - 110, -50, 7), t: () => RE('21R', RWY_END['21R'].papi, -58, 0.6), fov: 42 },
  terminal: { name: 'อาคารผู้โดยสาร', p: () => RE('03L', 1180, -170, 160), t: () => RE('03L', 1760, -560, 8), fov: 50 },
  golf: { name: 'สนามกอล์ฟระหว่างทางวิ่ง', p: () => RE('03L', 380, 197, 75), t: () => RE('03L', 1700, 197, 0), fov: 50 },
  rail: { name: 'สถานีดอนเมืองและโทลล์เวย์', p: () => [PTS.station[0] - 330, PTS.station[1] - 160, 95], t: () => [PTS.station[0] + 40, PTS.station[1] + 40, 10], fov: 50 },
  tower: { name: 'หอบังคับการบิน TWR-S', p: () => [PTS.tower[0] + 190, PTS.tower[1] - 40, 62], t: () => [PTS.tower[0], PTS.tower[1], 36], fov: 46 },
  ils: { name: 'สายอากาศ Localizer 21R', p: () => RE('21R', RWY_END['21R'].locDist - 170, 60, 22), t: () => RE('21R', RWY_END['21R'].locDist, 0, 2), fov: 46 },
  als: { name: 'ไฟนำร่อน CAT II ทาง 21R', p: () => RE('21R', -1150, -70, 26), t: () => RE('21R', -150, 0, 0), fov: 48 },
  gs: { name: 'เสา Glide path ทาง 21R', p: () => RE('21R', 230, -190, 16), t: () => RE('21R', 333, -120, 8), fov: 50 },
  sock: { name: 'ถุงลม', p: () => [PTS.sock[0] - 26, PTS.sock[1] - 22, 9], t: () => [PTS.sock[0], PTS.sock[1], 5.5], fov: 46 },
  hold: { name: 'จุดรอก่อนเข้าทางวิ่ง', p: () => [PTS.hold[0] - 40, PTS.hold[1] - 30, 14], t: () => [PTS.hold[0], PTS.hold[1], 0], fov: 48 },
  north: { name: 'บ่อน้ำด้านเหนือ', p: () => RE('21R', -300, -300, 260), t: () => [1150, 1900, 0], fov: 50 },
  mil: { name: 'ลานจอดฝั่งตะวันออก', p: () => RE('03R', 1300, 60, 110), t: () => RE('03R', 1800, 260, 5), fov: 50 },
  cargo: { name: 'คลังสินค้าด้านใต้', p: () => RE('03L', 80, -140, 90), t: () => RE('03L', 480, -430, 6), fov: 50 },
  bts: { name: 'รถไฟฟ้าบนถนนพหลโยธิน', p: () => [PTS.bts[0] - 250, PTS.bts[1] - 200, 80], t: () => [PTS.bts[0], PTS.bts[1], 12], fov: 50 },
};
const SPOTS = [
  { id: 'rwyL', n: 'ทางวิ่ง 03L/21R', p: () => RE('03L', 1850, 0, 0.5), v: 'overview', t: 'ทางวิ่งฝั่งตะวันตกติดอาคารผู้โดยสาร ยาว 3,700 ม. กว้าง 60 ม. ทิศจริง 029° และ 209° มีไฟกึ่งกลางทุก 30 ม. ตลอดความยาว ปลายทั้งสองด้านเป็นผิวคอนกรีต (217 ม. ด้าน 03L และ 122 ม. ด้าน 21R) ส่วนกลางเป็นแอสฟัลต์', f: ['3,700 × 60 ม.', 'ILS CAT II ทาง 21R', 'ILS CAT I ทาง 03L'] },
  { id: 'rwyR', n: 'ทางวิ่ง 03R/21L', p: () => RE('03R', 1750, 0, 0.5), v: 'overview', t: 'ทางวิ่งฝั่งตะวันออก ยาว 3,500 ม. กว้าง 45 ม. แนวกลางห่างจากทางวิ่ง 03L/21R ราว 394 ม. (คำนวณจากพิกัดหัวทางวิ่ง) ทาง 21L มี ILS CAT I ส่วนทาง 03R ใช้การร่อนแบบ RNP ทางวิ่งนี้ไม่มีไฟกึ่งกลาง', f: ['3,500 × 45 ม.', 'ILS ทาง 21L', 'RNP ทาง 03R'] },
  { id: 'disp', n: 'หัวทางวิ่ง 21L ที่เลื่อนเข้ามา', p: () => RE('21L', -175, 0, 0.5), v: 'disp', t: 'หัวทางวิ่ง 21L อยู่ลึกจากปลายผิวทาง 350 ม. เครื่องที่ลงทาง 21L จึงมีระยะลงจอด 3,150 ม. ช่วงก่อนหัวทางวิ่งใช้วิ่งขึ้นได้แต่ห้ามแตะพื้น ทาสีลูกศรชี้ไปยังเส้นหัวทางวิ่ง และไฟขอบช่วงนี้เป็นสีแดงเมื่อมองจากทิศที่ร่อนเข้า', f: ['เลื่อน 350 ม.', 'ระยะลงจอด 3,150 ม.', 'ไฟขอบสีแดง'] },
  { id: 'thr', n: 'เครื่องหมายหัวทางวิ่ง 21R', p: () => RE('21R', 25, 0, 0.5), v: 'runway', t: 'ทางวิ่งกว้าง 60 ม. ใช้แถบหัวทางวิ่ง 16 แถบ (ทางวิ่งกว้าง 45 ม. ใช้ 12 แถบ) ถัดมาเป็นตัวอักษร R ที่บอกว่าเป็นทางวิ่งด้านขวาของคู่ขนาน แล้วจึงเป็นเลข 21 ที่มาจากทิศ 209°', f: ['16 แถบ', 'R = ด้านขวา', 'เลขสูง 9 ม.'] },
  { id: 'aim', n: 'จุดเล็งและพื้นที่แตะพื้น', p: () => RE('21R', 425, -13, 0.5), v: 'runway', t: 'แถบใหญ่สองแถบเริ่มที่ 400 ม. จากหัวทางวิ่ง แถบคู่ทุก 150 ม. ลดจำนวนลง 3-3-2-2-1-1 จนถึง 1,050 ม. ทาง 21R ยังมีไฟฝังพื้นในพื้นที่แตะพื้นยาว 900 ม. ตาม AIP', f: ['จุดเล็ง 400 ม.', '3-3-2-2-1-1', 'ไฟ TDZ 900 ม.'] },
  { id: 'papi', n: 'ไฟ PAPI', p: () => RE('21R', RWY_END['21R'].papi, -58, 1.6), v: 'papi', t: 'ไฟ 4 ดวงทั้งสองข้างทางวิ่ง ตั้งมุม 2°30′ 2°50′ 3°10′ 3°30′ เห็นขาวสองแดงสองแปลว่าอยู่บนแนวร่อน 3° ระยะจากหัวทางวิ่งคำนวณจากความสูงตาเหนือหัวทางวิ่ง (MEHT) ใน AIP ซึ่งตั้งไว้สำหรับเครื่องบินใหญ่ที่ตานักบินอยู่สูงกว่าสายอากาศ ILS หลายเมตร เครื่องฝึกที่บินตาม ILS จึงเห็น PAPI ต่ำกว่าเล็กน้อย สีในภาพคำนวณจากมุมที่กล้องมองจริง', f: ['สองข้างทางวิ่ง', 'แนวร่อน 3°', 'MEHT 65.42 ft (21R)'] },
  { id: 'als', n: 'ไฟนำร่อน CAT II', p: () => RE('21R', -450, 0, 6), v: 'als', t: 'ทาง 21R มีไฟนำร่อนยาว 900 ม. แถบไฟขวางที่ 150 และ 300 ม. แถวไฟแดงสองข้างช่วงใกล้หัวทางวิ่ง และไฟกะพริบวิ่งเข้าหาทางวิ่ง ทาง 21L ยาว 900 ม. แบบ CAT I ส่วน 03L และ 03R เป็นแบบสั้น 420 และ 300 ม. ลองตั้งเวลาเป็นกลางคืนเพื่อดู', f: ['900 ม. (21R/21L)', 'ไฟกะพริบนำทาง', 'SALS 420/300 ม.'] },
  { id: 'loc', n: 'Localizer IBKK', p: () => { const l = llToNE(...RWY_END['21R'].appr.loc); return [l[1], l[0], 4]; }, v: 'ils', t: 'แถวสายอากาศ Localizer ของ ILS ทาง 21R ตั้งเลยปลายทางวิ่งด้าน 03L ออกไปราว 300 ม. ส่งสัญญาณแนวกลางทางวิ่งที่ความถี่ 109.3 MHz', f: ['IBKK 109.3 MHz', 'ILS CAT II'] },
  { id: 'gs', n: 'เสา Glide path 21R', p: () => RE('21R', 333, -120, 15.5), v: 'gs', t: 'เสาสายอากาศแนวร่อน 3° ห่างหัวทางวิ่ง 21R 333 ม. และเยื้องจากแนวกลาง 120 ม. ตาม AIP ความสูงของแนวร่อนเมื่อผ่านหัวทางวิ่ง (RDH) 54 ฟุต', f: ['GP 332.0 MHz', 'RDH 54 ft'] },
  { id: 'term', n: 'อาคารผู้โดยสาร 1 และ 2', p: () => [PTS.term[0], PTS.term[1], 26], v: 'terminal', t: 'อาคาร 1 (ระหว่างประเทศ) อยู่ด้านเหนือ อาคาร 2 (ในประเทศ) อยู่ด้านใต้ ต่อกันเป็นแนวยาวขนานทางวิ่ง มีอาคารเทียบเครื่องบินยื่นออกไปหาลานจอด เลขหลุมจอดตามเลข pier เช่น 21–26 และ 31–36 ความสูงอาคารในฉากเป็นค่าประมาณ เครื่องบินที่จอดเป็นแบบทั่วไปไม่มีลายสายการบิน', f: ['อาคาร 1 ระหว่างประเทศ', 'อาคาร 2 ในประเทศ'] },
  { id: 'golf', n: 'สนามกอล์ฟกานตรัตน์', p: () => RE('03L', 1500, 197, 2), v: 'golf', t: 'สนามกอล์ฟ 18 หลุมในแถบหญ้าระหว่างทางวิ่งทั้งสอง แฟร์เวย์เรียงยาวขนานทางวิ่ง และไม่มีต้นไม้สูงเพื่อไม่ให้บังสายตาหรือดึงดูดนก', f: ['18 หลุม', 'ระหว่างทางวิ่ง'] },
  { id: 'station', n: 'สถานีดอนเมือง (สายสีแดง)', p: () => [PTS.station[0], PTS.station[1], 26], v: 'rail', t: 'สถานียกระดับยาวเกือบ 600 ม. ชั้นล่างเป็นชานชาลารถไฟทางไกล ชั้นบนเป็นรถไฟฟ้าสายสีแดง มีทางเดินลอยฟ้าข้ามถนนวิภาวดีรังสิตไปอาคารผู้โดยสาร 1', f: ['ยาว ≈ 600 ม.', '8 ชานชาลา'] },
  { id: 'toll', n: 'ทางยกระดับอุตราภิมุข', p: () => [PTS.toll[0], PTS.toll[1], 17], v: 'rail', t: 'ดอนเมืองโทลล์เวย์ยกสูงราว 15 ม. เหนือถนนวิภาวดีรังสิต วิ่งขนานไปตามหน้าอาคารผู้โดยสาร ใต้ทางยกระดับเป็นถนนระดับพื้น', f: ['สูง ≈ 15 ม.', '6–8 ช่องจราจร'] },
  { id: 'twr', n: 'หอบังคับการบิน', p: () => [PTS.tower[0], PTS.tower[1], 52], v: 'tower', t: 'แผนผังสนามบินใน AIP มีหอบังคับการบินสองจุด คือ TWR-S ด้านใต้ และ TWR-N บนอาคาร AIS/MET ด้านเหนือ ไฟสัญญาณสนามบินอยู่บนยอด TWR-S กะพริบขาวสลับเขียวทุก 3 วินาที ความสูงของหอในฉากเป็นค่าประมาณ', f: ['หอ 118.1 MHz', 'ภาคพื้น 121.9 MHz', 'TWR-S · TWR-N'] },
  { id: 'north', n: 'บ่อน้ำด้านเหนือ', p: () => [1150, 1900, 3], v: 'north', t: 'บ่อน้ำขนาดใหญ่สามบ่อทางเหนือของปลายทางวิ่ง 21 ตามแผนที่ OpenStreetMap ทางซ้ายมือเป็นพื้นที่ซ่อมบำรุงอากาศยาน', f: ['3 บ่อ'] },
  { id: 'mil', n: 'ลานจอดฝั่งตะวันออก', p: () => RE('03R', 1800, 240, 6), v: 'mil', t: 'แผนผัง AIP ระบุพื้นที่ทางตะวันออกของทางวิ่ง 03R/21L เป็นลานจอดและอาคารของฝ่ายทหาร ในฉากนี้แสดงเป็นอาคารและลานจอดแบบทั่วไปเท่านั้น', f: ['แสดงแบบทั่วไป'] },
  { id: 'sock', n: 'ถุงลม', p: () => [PTS.sock[0], PTS.sock[1], 7], v: 'sock', t: 'AIP ระบุถุงลมห่างหัวทางวิ่ง 21R 375 ม. และห่างแนวกลาง 179 ม. อยู่ระหว่างทางวิ่งสองเส้น มีไฟส่องตอนกลางคืน ในฉากถุงลมหันตามลมที่ตั้งไว้ในแผงด้านข้าง', f: ['375 ม. จาก THR 21R', 'กางเต็ม ≈ 15 kt'] },
  { id: 'hold', n: 'จุดรอก่อนเข้าทางวิ่ง', p: () => [PTS.hold[0], PTS.hold[1], 0.6], v: 'hold', t: 'เส้นเหลืองทึบสองเส้นอยู่ฝั่งทางขับ เส้นประสองเส้นอยู่ฝั่งทางวิ่ง ในฉากวางห่างแนวกลางทางวิ่ง 90 ม. ตามมาตรฐาน ICAO ห้ามล้ำเส้นทึบจนกว่าหอบังคับการบินอนุญาต', f: ['90 ม. (ICAO)', 'Pattern A'] },
  { id: 'cargo', n: 'คลังสินค้า', p: () => RE('03L', 480, -430, 12), v: 'cargo', t: 'อาคารคลังสินค้าและโรงเก็บอยู่ทางใต้ของอาคาร 2 ตามแผนผังสนามบินใน AIP ความสูงอาคารในฉากเป็นค่าประมาณจากขนาดฐาน', f: ['ด้านใต้ของสนาม'] },
  { id: 'bts', n: 'รถไฟฟ้าบนถนนพหลโยธิน', p: () => [PTS.bts[0], PTS.bts[1], 21], v: 'bts', t: 'ทางยกระดับรถไฟฟ้าสายสีเขียววิ่งบนถนนพหลโยธินทางตะวันออกของสนามบิน ในฉากมีสองสถานีใกล้สนาม', f: ['ทางยกระดับ', '2 สถานีในฉาก'] },
];

const app = {
  mode: 'explore', q: store.get('afl-quality', isTouch ? 'balanced' : 'high'),
  view: 'overview', trainCam: 'chase', spot: null,
  wind: { fromDeg: 40, kt: 9 }, visIdx: 5, cloudIdx: 1,
  train: { state: 'setup', scn: 'xr', dist: 5556, pilot: 'ap', assist: true, autoThr: true, warp: 1, rwy: '03L' },
  input: { x: 0, y: 0, rud: 0, thr: 0.25, brake: 0 }, keys: new KeyState(), pin: new PilotInput(), padIndex: null,
};
if (!QUALITY[app.q]) app.q = 'balanced';
// visibility (MOR, m); 500 m to 3 km are the morning fog and haze of research round 4 (§1, §5.7)
const VIS = [500, 1500, 3000, 5000, 10000, 20000, 40000], VIS_T = ['500 ม.', '1.5 กม.', '3 กม.', '5 กม.', '10 กม.', '20 กม.', '40 กม.'];
const CLOUD = [0, 0.32, 0.5, 0.68], CLOUD_T = ['ไม่มี', 'บางส่วน', 'มาก', 'ครึ้ม'];

async function main() {
  patchShaderChunks();
  const viewport = $('#viewport'), canvas = $('#gl'), hud = $('#hud'), hctx = hud.getContext('2d');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch (e) { throw new Error('เบราว์เซอร์นี้เปิด WebGL2 ไม่ได้ ลองเปิดด้วย Safari หรือ Chrome รุ่นใหม่'); }
  const Q = QUALITY[app.q];
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, Q.pr));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.6;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.5, 80000);
  SU.uNoise.value = makeNoiseTexture(256);
  const sky = new SkySystem(renderer, scene);
  sky.sun.shadow.mapSize.set(Q.shadow, Q.shadow);
  const setMsg = (t) => { const m = $('#loadMsg'); if (m) m.textContent = t; };
  const data = await loadData((f) => setMsg(`กำลังโหลดข้อมูลสนามบินดอนเมือง… ${Math.round(f * 100)}%`));
  setMsg('กำลังสร้างสนามบินและเมืองรอบสนาม…');
  await new Promise((r) => requestAnimationFrame(r));
  const field = buildAirfield(scene, renderer, data, app.q);
  const city = buildCity(scene, data, field, app.q);
  const lights = buildAirfieldLights(scene, field, city, data);
  const ac3 = buildAircraft(); scene.add(ac3.group);
  // points of interest from the scene data
  {
    const hv = data.af.hall.flatMap((h) => h.o); PTS.term = [hv.reduce((s, p) => s + p[0], 0) / hv.length, hv.reduce((s, p) => s + p[1], 0) / hv.length];
    PTS.station = city.station; PTS.tower = [field.towerTop.x, -field.towerTop.z]; PTS.sock = field.sockPos[0];
    const holds = (field.holds || []).filter((h) => h.rwy === '03L/21R' && h.s > 1200 && h.s < 2800);
    const R = RUNWAYS[0], west = holds.filter((h) => rwyST(R, h.e, h.n)[1] < 0);
    const hp = (west[0] || holds[0] || (field.holds || [])[0] || { e: 0, n: 0 }); PTS.hold = [hp.e, hp.n];
    let best = null; for (const p of data.af.tollway) { const d = Math.hypot(p[0] - PTS.term[0], p[1] - PTS.term[1]); if (!best || d < best.d) best = { d, p }; } PTS.toll = best.p;
    const b = llToNE(13.9180, 100.6217); PTS.bts = [b[1], b[0]];
  }
  // apron flood lights (real lights on at night) on four masts mid-apron
  const nightAmb = new THREE.HemisphereLight(0x9fb3ff, 0x262320, 0); scene.add(nightAmb);
  const R0 = RUNWAYS[0];
  const floods = field.masts.slice(Math.max(0, Math.floor(field.masts.length / 2) - 2)).slice(0, 4).map(([e, n]) => {
    const L = new THREE.SpotLight(0xf3f1ff, 0, 0, 62 * DEG, 0.6, 2);
    L.position.set(e, 29.4, -n); L.target.position.set(e + R0.r[1] * 90, 0, -(n + R0.r[0] * 90)); scene.add(L, L.target); return L;
  });
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.08; controls.maxPolarAngle = 89 * DEG; controls.minDistance = 4; controls.maxDistance = 30000;
  controls.zoomSpeed = 0.9; controls.rotateSpeed = 0.55;

  // ── time, weather ──
  const today = localParts(new Date());
  app.date = makeDate(today.y, today.m, today.d, 16 * 60 + 40);
  function applyTime() {
    sky.setTime(app.date); sky.updateEnv(true);
    const lp = localParts(app.date);
    $('#inTime').value = lp.min; $('#outTime').textContent = hhmm(lp.min); $('#clkTime').textContent = hhmm(lp.min);
    $('#inDate').value = `${lp.y}-${String(lp.m + 1).padStart(2, '0')}-${String(lp.d).padStart(2, '0')}`;
    const sp = sky.sunPos; $('#roElev').textContent = `${sp.elev.toFixed(1)}°`; $('#roAz').textContent = `${sp.az.toFixed(0)}°`;
    $('#clkSun').textContent = `${sp.elev.toFixed(0)}° · ${sp.az.toFixed(0)}°`;
  }
  function applyWeather() {
    sky.setWeather({ cloud: CLOUD[app.cloudIdx], visibility: VIS[app.visIdx] });
    $('#outVis').textContent = VIS_T[app.visIdx]; $('#outCloud').textContent = CLOUD_T[app.cloudIdx];
    $('#outWdir').textContent = `${String(app.wind.fromDeg).padStart(3, '0')}°`; $('#outWkt').textContent = `${app.wind.kt} kt`;
    const ru = inUse(); $('#roRwy').textContent = `${ru} · ${ru === '03L' ? 'ลมตะวันออกเฉียงเหนือ' : 'ทิศหลัก'}`;
  }
  const lightsOnF = () => (sky.state.night > 0.22 || VIS[app.visIdx] <= LIGHTS_DAY_VIS_M ? 1 : 0);

  // ── camera handling ──
  const tween = { on: false };
  const tmpV = new THREE.Vector3(), tmpV2 = new THREE.Vector3();
  function flyTo(pr, instant = false) {
    const P = typeof pr.p === 'function' ? pr.p() : pr.p, Tg = typeof pr.t === 'function' ? pr.t() : pr.t;
    const p = W3(P[0], P[1], P[2]), t = W3(Tg[0], Tg[1], Tg[2]);
    if (instant || reduceMotion) { camera.position.copy(p); controls.target.copy(t); camera.fov = pr.fov; camera.updateProjectionMatrix(); tween.on = false; return; }
    Object.assign(tween, { on: true, k: 0, dur: 1.6, p0: camera.position.clone(), t0: controls.target.clone(), f0: camera.fov, p1: p, t1: t, f1: pr.fov });
  }
  function setView(name, instant) {
    app.view = name; const pr = PRESETS[name]; if (!pr) return;
    $('#viewName').textContent = pr.name; flyTo(pr, instant); renderDock();
  }
  function renderDock() {
    const dock = $('#dock'); dock.innerHTML = '';
    const list = app.mode === 'explore'
      ? [['overview', 'ภาพรวม'], ['approach', 'แนวร่อน'], ['terminal', 'อาคารผู้โดยสาร'], ['runway', 'หัวทางวิ่ง'], ['golf', 'สนามกอล์ฟ'], ['rail', 'สถานี/โทลล์เวย์'], ['als', 'ไฟนำร่อน']]
      : [['chase', 'ไล่หลัง'], ['cockpit', 'ห้องนักบิน + HUD'], ['tower', 'จากหอบังคับการบิน'], ['side', 'ข้างทางวิ่ง'], ['free', 'หมุนรอบเครื่อง']];
    for (const [id, label] of list) {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = label;
      b.setAttribute('aria-pressed', String(app.mode === 'explore' ? app.view === id : app.trainCam === id));
      b.onclick = () => { if (app.mode === 'explore') { setView(id); selectSpot(null); } else setTrainCam(id); };
      dock.appendChild(b);
    }
  }
  const TRAIN_CAM_NAMES = { chase: 'กล้องไล่หลัง', cockpit: 'ห้องนักบินหน้า · HUD', tower: 'มองจากหอบังคับการบิน', side: 'ข้างทางวิ่ง ใกล้จุดแตะพื้น', free: 'หมุนรอบเครื่อง' };
  function setTrainCam(id) {
    app.trainCam = id; $('#viewName').textContent = TRAIN_CAM_NAMES[id]; renderDock();
    controls.enabled = id === 'free';
    if (id === 'free') { controls.target.copy(ac3.group.position); camera.position.copy(ac3.group.position).add(tmpV.set(-18, 7, 14)); }
    chase.init = false;
  }
  const chase = { pos: new THREE.Vector3(), init: false };

  // ── hotspots: pins in the view + list in the panel + floating card ──
  const pinEls = SPOTS.map((sp, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'pin'; b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `<span><i>${i + 1}</i><b>${sp.n}</b></span>`; b.onclick = () => selectSpot(sp.id, true);
    $('#pins').appendChild(b); const P = sp.p(); sp.w = W3(P[0], P[1], P[2]); return b;
  });
  SPOTS.forEach((sp, i) => { const b = document.createElement('button'); b.type = 'button'; b.innerHTML = `<i>${String(i + 1).padStart(2, '0')}</i>${sp.n}`; b.setAttribute('aria-pressed', 'false'); b.onclick = () => selectSpot(sp.id, true); $('#spotList').appendChild(b); sp.li = b; });
  function selectSpot(id, fly) {
    app.spot = id;
    SPOTS.forEach((sp, i) => { const on = sp.id === id; pinEls[i].setAttribute('aria-pressed', String(on)); sp.li.setAttribute('aria-pressed', String(on)); });
    const sp = SPOTS.find((x) => x.id === id);
    const card = $('#card');
    if (!sp) { card.hidden = true; return; }
    $('#cardT').textContent = sp.n; $('#cardP').textContent = sp.t;
    $('#cardF').innerHTML = sp.f.map((x) => `<span>${x}</span>`).join('');
    card.hidden = false;
    if (fly) setView(sp.v);
  }
  $('#cardX').onclick = () => selectSpot(null);

  // ── panels: explore controls ──
  const segTime = $('#segTime');
  for (const [lab, min] of [['เช้า', 6 * 60 + 35], ['กลางวัน', 12 * 60], ['เย็น', 17 * 60 + 35], ['กลางคืน', 19 * 60 + 40], ['ตอนนี้', -1]]) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = lab;
    b.onclick = () => { const lp = localParts(app.date); if (min < 0) app.date = new Date(); else app.date = makeDate(lp.y, lp.m, lp.d, min); applyTime(); };
    segTime.appendChild(b);
  }
  $('#inTime').oninput = (e) => { const lp = localParts(app.date); app.date = makeDate(lp.y, lp.m, lp.d, +e.target.value); applyTime(); };
  $('#inDate').onchange = (e) => { const [y, m, d] = e.target.value.split('-').map(Number); if (!y) return; app.date = makeDate(y, m - 1, d, localParts(app.date).min); applyTime(); };
  $('#inWdir').value = app.wind.fromDeg; $('#inWkt').value = app.wind.kt; $('#inVis').value = app.visIdx; $('#inCloud').value = app.cloudIdx;
  $('#inWdir').oninput = (e) => { const was = inUse(); app.wind.fromDeg = +e.target.value; applyWeather(); if (app.mode === 'explore' && inUse() !== was) app.demo = null; };
  $('#inWkt').oninput = (e) => { const was = inUse(); app.wind.kt = +e.target.value; applyWeather(); if (app.mode === 'explore' && inUse() !== was) app.demo = null; };
  $('#inVis').oninput = (e) => { app.visIdx = +e.target.value; applyWeather(); };
  $('#inCloud').oninput = (e) => { app.cloudIdx = +e.target.value; applyWeather(); };
  for (const b of $('#segQ').querySelectorAll('button')) {
    b.setAttribute('aria-pressed', String(b.dataset.q === app.q));
    b.onclick = () => { if (b.dataset.q === app.q) return; store.set('afl-quality', b.dataset.q); toast('กำลังโหลดใหม่ตามคุณภาพที่เลือก…'); setTimeout(() => location.reload(), 300); };
  }
  // snapshot via the downloads capability (button appears only where saving is possible)
  (async () => {
    try {
      if (!window.claude || typeof window.claude.use !== 'function') return;
      const dl = await window.claude.use('downloads'); if (!dl) return;
      const btn = $('#btnShot'); btn.hidden = false;
      btn.onclick = () => {
        renderer.render(scene, camera);
        renderer.domElement.toBlob(async (blob) => {
          if (!blob) return;
          try { await dl.save({ filename: `airfield-lab-${hhmm(localParts(app.date).min).replace(':', '')}.png`, data: blob }); toast('บันทึกภาพแล้ว'); }
          catch (err) { if (err && err.code !== 'declined') toast('บันทึกภาพไม่ได้ในหน้านี้'); }
        }, 'image/png');
      };
    } catch (e) { /* no capability */ }
  })();

  // ── panels: training ──
  const RWY_INFO = {
    '21R': ['ILS CAT II · IBKK 109.3', '3,700 × 60 ม. · ไฟกึ่งกลางและ TDZ'],
    '21L': ['ILS CAT I · IDMG 110.3', 'หัวทางวิ่งเลื่อน 350 ม. · ระยะลงจอด 3,150 ม.'],
    '03L': ['ILS CAT I · IBKD 109.7', '3,700 × 60 ม. · ไฟนำร่อน 420 ม.'],
    '03R': ['RNP · แนวร่อนสังเคราะห์ 3°', '3,500 × 45 ม. · ไม่มีไฟกึ่งกลาง'],
  };
  for (const id of ['21R', '21L', '03L', '03R']) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.r = id;
    b.innerHTML = `<b>ทางวิ่ง ${id}</b><em>${RWY_INFO[id][0]}</em><span>${RWY_INFO[id][1]}</span>`;
    b.onclick = () => { app.train.rwy = id; setActiveRunway(id); buildScnCards(); refreshSetup(); previewFlight(); };
    $('#rwyList').appendChild(b);
  }
  const scnKeys = Object.keys(SCENARIOS);
  function buildScnCards() {
    $('#scnList').innerHTML = '';
    for (const k of scnKeys) {
      const sc = SCENARIOS[k], from = windFrom(sc); const b = document.createElement('button'); b.type = 'button'; b.dataset.k = k;
      const xw = sc.kt * Math.sin((from - FIELD.rwyHdg) * DEG), hw = sc.kt * Math.cos((from - FIELD.rwyHdg) * DEG);
      b.innerHTML = `<b>${sc.label}</b><em>${sc.kt ? `${String(from).padStart(3, '0')}°/${sc.kt} kt` : 'สงบ'}</em><span>${sc.kt ? `ลมปะทะหน้า ${Math.round(hw)} kt · ลมขวาง ${Math.abs(Math.round(xw))} kt${sc.turb > 1 ? ' · ปั่นป่วนปานกลาง' : sc.turb > 0 ? ' · ปั่นป่วนเล็กน้อย' : ''}` : 'ไม่มีลม ไม่มีความปั่นป่วน'}</span>`;
      b.onclick = () => { app.train.scn = k; refreshSetup(); previewFlight(); };
      $('#scnList').appendChild(b);
    }
  }
  buildScnCards();
  for (const b of $('#segDist').querySelectorAll('button')) b.onclick = () => { app.train.dist = +b.dataset.d; refreshSetup(); previewFlight(); };
  for (const b of $('#segPilot').querySelectorAll('button')) b.onclick = () => { app.train.pilot = b.dataset.p; refreshSetup(); };
  $('#chkAssist').onchange = (e) => { app.train.assist = e.target.checked; if (!app.train.assist) { app.train.autoThr = false; $('#chkAt').checked = false; } refreshSetup(); };
  $('#chkAt').onchange = (e) => { app.train.autoThr = e.target.checked; refreshSetup(); };
  for (const b of $('#segWarp').querySelectorAll('button')) b.onclick = () => { app.train.warp = +b.dataset.w; refreshLive(); };
  const TR_TIMES = [['กลางวัน', 11 * 60], ['เย็น', 17 * 60 + 35], ['กลางคืน', 19 * 60 + 40]];
  for (const [lab, min] of TR_TIMES) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = lab; b.dataset.min = min;
    b.onclick = () => { const lp = localParts(app.date); app.date = makeDate(lp.y, lp.m, lp.d, min); applyTime(); refreshSetup(); };
    $('#segTrTime').appendChild(b);
  }
  function refreshSetup() {
    for (const b of $('#scnList').children) b.setAttribute('aria-pressed', String(b.dataset.k === app.train.scn));
    for (const b of $('#rwyList').children) b.setAttribute('aria-pressed', String(b.dataset.r === app.train.rwy));
    $('#trEyebrow').textContent = `ฝึกร่อนลงจอด · ${FIELD.appr} ทางวิ่ง ${FIELD.rwy} ดอนเมือง`;
    for (const b of $('#segDist').children) b.setAttribute('aria-pressed', String(+b.dataset.d === app.train.dist));
    for (const b of $('#segPilot').children) b.setAttribute('aria-pressed', String(b.dataset.p === app.train.pilot));
    const curMin = localParts(app.date).min;
    for (const b of $('#segTrTime').children) b.setAttribute('aria-pressed', String(Math.abs(+b.dataset.min - curMin) < 1));
    const man = app.train.pilot === 'man';
    $('#chkAssist').disabled = !man; $('#chkAt').disabled = !man || !app.train.assist;
    const sc = SCENARIOS[app.train.scn], oat = 31;
    const da = densityAltitudeFt(FIELD.elev, oat);
    $('#brief').innerHTML = [['Vref', `${AC.Vref} kt`], ['Vapp', `${AC.Vapp} kt`], ['แนวร่อน', `${FIELD.gs.toFixed(1)}°`], ['ลมผิวพื้น', sc.kt ? `${String(windFrom(sc)).padStart(3, '0')}°/${sc.kt}` : 'สงบ'], ['อุณหภูมิ', `${oat}°C`], ['ความสูงความหนาแน่น', `${fmt(Math.round(da / 100) * 100)} ft`]]
      .map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join('');
  }
  function refreshLive() { for (const b of $('#segWarp').children) b.setAttribute('aria-pressed', String(+b.dataset.w === app.train.warp)); $('#btnTake').textContent = app.flight && app.flight.pilot === 'ap' ? 'รับช่วงบังคับเอง' : 'ให้ออโต้ไพลอตบิน'; }
  function showTrainPane(which) { $('#trSetup').hidden = which !== 'setup'; $('#trLive').hidden = which !== 'fly'; $('#trResult').hidden = which !== 'result'; }

  // ── flights ──
  let demoFirst = true;
  function newDemo() {
    setActiveRunway(inUse());
    const f = new Flight({ wind: { fromDeg: app.wind.fromDeg, kt: app.wind.kt, turb: app.wind.kt > 12 ? 1.1 : 0.5 }, pilot: 'ap', dist: demoFirst ? 1700 : 5600, seed: Math.floor(Math.random() * 1e6) });
    demoFirst = false; return f;
  }
  function flightOpts() { const sc = SCENARIOS[app.train.scn]; return { wind: sc, dist: app.train.dist, pilot: app.train.pilot, assist: app.train.assist, autoThr: app.train.autoThr, seed: 7 + Math.floor(Math.random() * 1000), oatC: 31, dh: app.train.pilot === 'man' ? 12 : 0, dtl: app.train.pilot === 'man' ? 40 : 0 }; }
  function previewFlight() { setActiveRunway(app.train.rwy); app.flight = new Flight(flightOpts()); app.train.state = 'setup'; chase.init = false; }
  function startFlight() {
    if (app.tilt.want && !app.tilt.on) enableTilt();   // the option was kept from an earlier visit; this is a tap
    setActiveRunway(app.train.rwy);
    app.flight = new Flight(flightOpts());
    Object.assign(app.input, { x: 0, y: 0, rud: 0, thr: app.flight.ac.thr, brake: 0 }); app.pin.reset(); centreTilt(false);
    app.train.state = 'fly'; app.train.warp = 1; app.resultShown = false;
    showTrainPane('fly'); refreshLive(); chase.init = false;
    $('#liveEyebrow').textContent = app.flight.pilot === 'ap' ? 'ออโต้ไพลอตกำลังบิน' : (app.flight.opts.assist ? 'บินเอง · มีระบบช่วย' : 'บินเอง · ควบคุมตรง');
    if (app.trainCam === 'free') setTrainCam('chase');
    updateCtlVisibility();
  }
  function updateCtlVisibility() {
    const man = app.mode === 'train' && app.train.state === 'fly' && app.flight && app.flight.pilot === 'man';
    $('#stick').classList.toggle('on', man); $('#brk').classList.toggle('on', man);
    $('#thr').classList.toggle('on', man && !(app.flight.opts.assist && app.flight.opts.autoThr));
    viewport.classList.toggle('manual', man);
  }
  $('#btnStart').onclick = startFlight;
  $('#btnAgain').onclick = startFlight;
  $('#btnRestart').onclick = startFlight;
  $('#btnSetup').onclick = () => { showTrainPane('setup'); previewFlight(); updateCtlVisibility(); };
  $('#btnTake').onclick = () => { if (!app.flight) return; const toMan = app.flight.pilot === 'ap'; if (toMan) { app.flight.opts.assist = app.train.assist; app.flight.opts.autoThr = app.train.assist && app.train.autoThr; } app.flight.setPilot(toMan ? 'man' : 'ap'); app.input.thr = app.flight.ac.thr; if (toMan) centreTilt(false); refreshLive(); updateCtlVisibility(); toast(toMan ? 'คุณบังคับเองแล้ว ตามวงกลมสีชมพูบน HUD เพื่อบินตามแนวร่อน' : 'ออโต้ไพลอตรับช่วงต่อ'); };
  $('#btnReplay').onclick = () => {
    const f = app.flight; if (!f || !f.rec.f.length) return;
    app.train.state = 'replay'; app.replayT = Math.max(0, (f.ev.td ? f.ev.td.t : f.ac.t) - 28); app.replayEnd = f.rec.f[f.rec.f.length - 1].t;
    if (app.trainCam === 'cockpit' || app.trainCam === 'free') setTrainCam('side'); toast('กำลังเล่นซ้ำ 28 วินาทีสุดท้ายก่อนแตะพื้น');
  };

  // ── mode switching ──
  function setMode(m) {
    app.mode = m; $('#app').dataset.mode = m;
    $('#tabExplore').setAttribute('aria-selected', String(m === 'explore')); $('#tabTrain').setAttribute('aria-selected', String(m === 'train'));
    $('#paneExplore').hidden = m !== 'explore'; $('#paneTrain').hidden = m !== 'train';
    $('#pins').hidden = m !== 'explore'; $('#card').hidden = m !== 'explore' || !app.spot;
    $('#fma').hidden = m !== 'train'; $('#instr').hidden = m !== 'train';
    if (m === 'explore') { controls.enabled = true; ac3.helmets[0].visible = true; setView(app.view === 'overview' || PRESETS[app.view] ? app.view : 'overview'); }
    else { setActiveRunway(app.train.rwy); buildScnCards(); showTrainPane('setup'); refreshSetup(); previewFlight(); setTrainCam(app.trainCam === 'free' ? 'chase' : app.trainCam); }
    renderDock(); updateCtlVisibility();
  }
  $('#tabExplore').onclick = () => setMode('explore');
  $('#tabTrain').onclick = () => setMode('train');
  $('#btnFs').onclick = () => { viewport.classList.toggle('fs'); $('#btnFs').textContent = viewport.classList.contains('fs') ? 'ออกจากเต็มจอ' : 'เต็มจอ'; };

  // ── input: keyboard (map and rules in 18-keys.js), gamepad and touch stick (shaped in 25-input.js), throttle, brake ──
  function doAction(act) {   // toggles from a key or a gamepad button
    if (act === 'cam') { const order = ['chase', 'cockpit', 'tower', 'side', 'free']; setTrainCam(order[(order.indexOf(app.trainCam) + 1) % order.length]); }
    if (act === 'take' && app.train.state === 'fly') $('#btnTake').click();
    if (act === 'pause' && app.train.state === 'fly') { app.train.warp = app.train.warp ? 0 : 1; refreshLive(); }
    if (act === 'restart' && app.train.state !== 'setup') startFlight();
  }
  window.addEventListener('keydown', (e) => {
    if (e.target && /input|select|textarea/i.test(e.target.tagName)) return;
    const k = app.keys.down(e, { train: app.mode === 'train', flying: app.mode === 'train' && app.train.state === 'fly' });
    if (k.prevent) e.preventDefault();   // arrows, PageUp/PageDown must not scroll the page while flying
    if (!k.fire) return;                 // held keys are tracked by app.keys; toggles fire once per press
    doAction(k.act);
  });
  window.addEventListener('keyup', (e) => app.keys.up(e));
  window.addEventListener('blur', () => app.keys.clear());
  document.addEventListener('visibilitychange', () => { if (document.hidden) app.keys.clear(); });
  // Gamepads (W3C Gamepad): the browser lists none until a button is pressed (anti-fingerprinting), and getGamepads()
  // throws when the host page turns the "gamepad" permissions policy off. Only the standard layout drives the aircraft;
  // flight sticks, pedals and HOTAS report their axes in no fixed order and wait for a binding page.
  function listPads() {   // connected gamepads, or null when this page may not use them
    let pads;
    try { pads = navigator.getGamepads ? navigator.getGamepads() : []; } catch (e) { return null; }
    return Array.from(pads || []).filter((gp) => gp && gp.connected !== false);
  }
  const firstPad = () => { const l = listPads(); return (l && l.find((gp) => gp.mapping === 'standard')) || null; };
  const padName = (gp) => padLabel(gp.id) || 'จอยเกม';
  function refreshPadTxt() {
    const l = listPads(), std = l && l.find((gp) => gp.mapping === 'standard');
    $('#padTxt').textContent = !navigator.getGamepads ? 'จอยเกม: เบราว์เซอร์นี้ไม่รองรับ'
      : !l ? 'จอยเกม: หน้านี้ใช้จอยไม่ได้ เพราะเบราว์เซอร์หรือหน้าที่ฝังหน้านี้ไว้ไม่อนุญาต'
      : std ? `จอยเกม: ${padName(std)} พร้อมใช้`
      : l.length ? `จอยเกม: พบ ${padName(l[0])} แต่ยังใช้ไม่ได้ ตอนนี้รองรับเฉพาะจอยเกมผังมาตรฐาน`
      : 'จอยเกม: ต่อจอยแล้วกดปุ่มใดก็ได้บนจอยเพื่อเริ่มใช้';
  }
  window.addEventListener('gamepadconnected', (e) => {
    const gp = e.gamepad, used = firstPad(); refreshPadTxt();
    toast(gp.mapping !== 'standard' ? `พบ ${padName(gp)} แต่ยังใช้ไม่ได้ ตอนนี้รองรับเฉพาะจอยเกมผังมาตรฐาน`
      : used && used.index !== gp.index ? `พบจอย ${padName(gp)} แต่ตอนนี้ใช้ ${padName(used)} อยู่ ถอดจอยนั้นออกก่อนถ้าต้องการใช้จอยใหม่`
      : `พบจอย ${padName(gp)} · ก้านซ้ายบังคับเครื่อง ไกซ้าย/ขวาเป็นหางเสือ ก้านขวาเป็นคันเร่ง`, 4200);
  });
  window.addEventListener('gamepaddisconnected', (e) => {
    refreshPadTxt();
    if (e.gamepad.index !== app.padIndex) return;
    app.padIndex = null;   // its last reading is gone with it, so no deflection stays behind
    if (app.mode === 'train' && app.train.state === 'fly' && app.flight.pilot === 'man' && app.pin.padUsed && app.train.warp) {
      app.train.warp = 0; refreshLive(); toast('จอยหลุดการเชื่อมต่อ หยุดเวลาไว้ก่อน กด P เพื่อบินต่อด้วยคีย์บอร์ด', 5000);
    } else toast('จอยหลุดการเชื่อมต่อ');
  });
  refreshPadTxt();
  const stick = $('#stick'), knob = $('#stickKnob'); const touchStick = { on: false, x: 0, y: 0 };
  const stickMove = (e) => { const r = stick.getBoundingClientRect(); const R = r.width / 2 - 20; let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2); const l = Math.hypot(dx, dy); if (l > R) { dx *= R / l; dy *= R / l; } touchStick.x = dx / R; touchStick.y = dy / R; knob.style.transform = `translate(${dx}px, ${dy}px)`; };
  // tilt mode: holding the circle still for 0.6 s re-centres (a quick touch, or a finger dragging it as if it were the
  // touch stick, could otherwise do it by accident mid-bank)
  let holdT = 0, holdAt = null;
  const holdEnd = () => { clearTimeout(holdT); holdAt = null; };
  stick.addEventListener('pointerdown', (e) => { if (app.tilt.on) { holdEnd(); holdAt = [e.clientX, e.clientY]; holdT = setTimeout(() => { holdAt = null; centreTilt(true); }, 600); return; } touchStick.on = true; stick.setPointerCapture(e.pointerId); stickMove(e); });
  stick.addEventListener('pointermove', (e) => { if (holdAt && Math.hypot(e.clientX - holdAt[0], e.clientY - holdAt[1]) > 12) holdEnd(); if (touchStick.on) stickMove(e); });
  const stickUp = () => { holdEnd(); touchStick.on = false; touchStick.x = touchStick.y = 0; knob.style.transform = ''; };
  stick.addEventListener('pointerup', stickUp); stick.addEventListener('pointercancel', stickUp); stick.addEventListener('pointerleave', holdEnd);
  // Phone tilt (W3C DeviceOrientation Event), an option in place of the touch stick: readings go to TiltStick
  // (25-input.js), and the pose when a flight starts, when control is taken over or when the circle is held becomes the
  // centre. The interface exists only in a secure context (https). requestPermission() must come from a tap: iOS 13+
  // asks there, Chrome 151+ answers at once while its default stays "allow". A cross-origin frame gets readings only
  // when its host delegates the sensors (allow="accelerometer; gyroscope; magnetometer"; Firefox never), so enabling
  // waits 2 s for a reading before giving up.
  const tilt = new TiltStick(), TILT_HELP = $('#tiltTxt').textContent;
  app.tilt = { on: false, want: store.get('afl-tilt', '0') === '1', stick: tilt, watch: 0 };
  // isSecureContext too: WebKit keeps the interface over http, where requestPermission() only ever answers "denied"
  const tiltCapable = window.isSecureContext === true && typeof DeviceOrientationEvent !== 'undefined' && (navigator.maxTouchPoints > 0 || matchMedia('(pointer: coarse)').matches);
  const framed = (() => { try { return window.top !== window.self; } catch (e) { return true; } })();
  const fpol = document.featurePolicy;   // Chromium only
  const sensorsBlocked = () => !!(fpol && fpol.allowsFeature && (!fpol.allowsFeature('accelerometer') || !fpol.allowsFeature('gyroscope')));
  const TILT_FRAMED = 'หน้านี้เปิดอยู่ในกรอบของอีกเว็บหนึ่งที่ไม่อนุญาตให้อ่านการเอียงโทรศัพท์ ลองเปิดหน้านี้โดยตรงในเบราว์เซอร์';
  // window.orientation first: on iOS it counts from portrait on iPad too, like the DeviceOrientation frame (WebKit
  // makes the iPad's screen.orientation count from landscape); TiltStick checks the angle against gravity anyway.
  // Not the viewport's shape: a tablet whose natural orientation is landscape reports 0 when held in landscape.
  function screenNow() {
    const so = screen.orientation, wo = window.orientation;
    return Number.isFinite(wo) ? { angle: wo, sure: true } : { angle: so && Number.isFinite(so.angle) ? so.angle : 0, sure: false };
  }
  // how to bank in the grip picked at the last centring (TiltStick.grip)
  const TILT_BANK = { wheel: 'หมุนโทรศัพท์แบบหมุนพวงมาลัยเพื่อเอียงเครื่อง', tray: 'กดขอบซ้ายหรือขวาลงเพื่อเอียงเครื่อง', under: 'กดขอบซ้ายหรือขวาลงเพื่อเอียงเครื่อง' };
  const onOrient = (e) => { tilt.sample(e.beta, e.gamma, performance.now() / 1000); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) tilt.lost(); });   // readings stop while hidden
  // Screen Wake Lock: flying by tilt needs few touches, so keep the screen from dimming while a tilt flight runs
  let wakeLock = null, wakeBusy = false;
  async function keepAwake(want) {
    if (wakeBusy || !navigator.wakeLock || want === !!wakeLock) return;
    wakeBusy = true;
    try {
      if (want && document.visibilityState === 'visible') { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); }
      else if (!want) { const w = wakeLock; wakeLock = null; await w.release(); }
    } catch (e) { wakeLock = null; }
    wakeBusy = false;
  }
  setInterval(() => keepAwake(app.tilt.on && app.mode === 'train' && app.train.state === 'fly'), 1000);
  function refreshTilt() {
    $('#tiltRow').hidden = !tiltCapable; $('#chkTilt').checked = app.tilt.want;
    if (app.tilt.want) { $('#tiltTxt').textContent = TILT_HELP; $('#tiltTxt').hidden = false; } else if ($('#tiltTxt').textContent === TILT_HELP) $('#tiltTxt').hidden = true;
    stick.classList.toggle('tilt', app.tilt.on); stick.setAttribute('aria-label', app.tilt.on ? 'การเอียงโทรศัพท์ กดค้างเพื่อตั้งศูนย์' : 'คันบังคับ');
    if (!app.tilt.on) knob.style.transform = '';
  }
  function tiltFail(msg) {
    disableTilt(); app.tilt.want = false; store.set('afl-tilt', '0'); refreshTilt();
    $('#tiltTxt').textContent = msg; $('#tiltTxt').hidden = false; toast(msg, 6000);
    return false;
  }
  async function enableTilt() {   // call from a tap
    if (app.tilt.on) return true;
    const D = window.DeviceOrientationEvent;
    if (sensorsBlocked()) return tiltFail(TILT_FRAMED);
    try {
      if (D && typeof D.requestPermission === 'function' && (await D.requestPermission()) !== 'granted') return tiltFail(framed ? TILT_FRAMED : 'ไม่ได้รับอนุญาตให้อ่านการเอียง ถ้ากดไม่อนุญาตไปแล้ว เบราว์เซอร์จะจำไว้ ให้ปิดเบราว์เซอร์ให้สนิท (ปัดทิ้งในหน้าสลับแอป) แล้วเปิดหน้านี้ใหม่ แตะตัวเลือกนี้อีกครั้งและกดอนุญาต');
    } catch (e) { return tiltFail('ขออนุญาตอ่านการเอียงไม่สำเร็จ แตะตัวเลือกนี้อีกครั้ง'); }
    tilt.reset(); tilt.centre(screenNow());
    window.addEventListener('deviceorientation', onOrient);
    app.tilt.on = true; refreshTilt();
    clearTimeout(app.tilt.watch);
    app.tilt.watch = setTimeout(() => { if (app.tilt.on && !tilt.n) tiltFail(framed ? TILT_FRAMED : 'ไม่ได้รับค่าการเอียงจากเครื่อง เครื่องนี้อาจไม่มีเซนเซอร์ หรือปิดการเข้าถึงเซนเซอร์ไว้ในการตั้งค่าเว็บไซต์ของเบราว์เซอร์'); }, 2000);
    return true;
  }
  function disableTilt() { window.removeEventListener('deviceorientation', onOrient); clearTimeout(app.tilt.watch); app.tilt.on = false; tilt.reset(); refreshTilt(); keepAwake(false); }
  function centreTilt(byTap) { if (!app.tilt.on) return; tilt.centre(screenNow()); if (byTap) toast('ตั้งศูนย์การเอียงแล้ว ท่าที่ถืออยู่ตอนนี้คือคันอยู่กลาง' + (tilt.centred ? ' ' + TILT_BANK[tilt.grip] : ''), 3000); }
  $('#chkTilt').addEventListener('click', (e) => {
    app.tilt.want = e.target.checked; store.set('afl-tilt', app.tilt.want ? '1' : '0');
    if (app.tilt.want) enableTilt(); else disableTilt();
    refreshTilt();
  });
  refreshTilt();
  const rail = $('#thrRail'), tknob = $('#thrKnob'); let thrDrag = false;
  const thrSet = (e) => { const r = rail.getBoundingClientRect(); app.input.thr = clamp(1 - (e.clientY - r.top - 13) / (r.height - 26), 0, 1); };
  rail.addEventListener('pointerdown', (e) => { thrDrag = true; rail.setPointerCapture(e.pointerId); thrSet(e); });
  rail.addEventListener('pointermove', (e) => { if (thrDrag) thrSet(e); });
  rail.addEventListener('pointerup', () => (thrDrag = false)); rail.addEventListener('pointercancel', () => (thrDrag = false));
  const bb = $('#btnBrake'); let brakeHeld = false;
  bb.addEventListener('pointerdown', (e) => { brakeHeld = true; bb.classList.add('on'); bb.setPointerCapture(e.pointerId); });
  const brUp = () => { brakeHeld = false; bb.classList.remove('on'); }; bb.addEventListener('pointerup', brUp); bb.addEventListener('pointercancel', brUp);
  // between flights (setup, replay, result) the gamepad's buttons still act, as C does on the keyboard
  function padButtons() {
    const gp = firstPad(); app.padIndex = gp ? gp.index : null;
    for (const ev of app.pin.buttons(gp)) doAction(ev);
  }
  // keys: held key actions this frame (app.keys.frame()); now: the frame time in ms
  function readInputs(dt, now, keys) {
    const I = app.input, gp = firstPad();
    app.padIndex = gp ? gp.index : null;
    const g = app.tilt.on ? tilt.read(dt) : null;
    const r = app.pin.update(dt, now / 1000, { keys, pad: gp, touch: touchStick.on ? touchStick : null, tilt: g, thr: I.thr, brake: brakeHeld });
    if (g) { const R = stick.clientWidth / 2 - 20; knob.style.transform = `translate(${g.x * R}px, ${g.y * R}px)`; }   // the circle shows the tilt
    I.x = r.x; I.y = r.y; I.rud = r.rud; I.thr = r.thr; I.brake = r.brake;
    for (const ev of r.events) doAction(ev);   // gamepad buttons: take control, camera, pause (gear and flaps wait for the model)
    tknob.style.top = `${(1 - I.thr) * (rail.clientHeight - 26)}px`; $('#thrTxt').textContent = `THR ${Math.round(I.thr * 100)}%`;
  }

  // ── per-frame aircraft pose from the simulation ──
  const Rm = new Array(9), basis = new THREE.Matrix4(), fwdV = new THREE.Vector3(), upV = new THREE.Vector3(), rtV = new THREE.Vector3();
  let propAngle = 0;
  function poseFrom(x, q, surf, dt, running) {
    ned2w(x[0], x[1], x[2], ac3.group.position);
    qToR(q, Rm);
    fwdV.set(Rm[3], -Rm[6], -Rm[0]); upV.set(-Rm[5], Rm[8], Rm[2]); rtV.set(Rm[4], -Rm[7], -Rm[1]);
    basis.makeBasis(fwdV, upV, rtV); ac3.group.quaternion.setFromRotationMatrix(basis);
    ac3.pose(surf);
    propAngle += dt * (running ? 31 : 0); ac3.spin(propAngle, running);
  }

  // ── HUD helpers ──
  function toast(msg, ms = 2600) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast._h); toast._h = setTimeout(() => t.classList.remove('on'), ms); }
  let calloutUntil = 0;
  function callout(txt, warn = false, ms = 1100) { const c = $('#callout'); c.textContent = txt; c.classList.toggle('warn', warn); c.classList.add('on'); calloutUntil = performance.now() + ms; }
  const CALL_TXT = { 1000: '1000', 500: '500', 400: '400', 300: '300', 200: 'MINIMUMS', 100: '100', 50: '50', 40: '40', 30: '30', 20: '20', 10: '10' };
  function gateRows(el, f, live) {
    const a = f.ac.air, rows = [];
    const g5 = f.ev.gates.g500, g2 = f.ev.gates.g200;
    const st = (g) => (g ? (g.ok ? 'ok' : 'bad') : '');
    if (live) {
      rows.push(['ล้อลงและแฟลปลงจอด', f.ac.gearPos > 0.98 && f.ac.flaps > 0.95 ? 'ok' : 'bad', 'ครบ']);
      rows.push(['แนวกลาง (LOC)', Math.abs(a.locDots) <= 1 ? 'ok' : 'bad', `${a.locDots >= 0 ? '+' : ''}${a.locDots.toFixed(1)} จุด`]);
      rows.push(['แนวร่อน (G/S)', a.s > FIELD.aim - 50 ? '' : Math.abs(a.gsDots) <= 1 ? 'ok' : 'bad', a.s > FIELD.aim - 50 ? '—' : `${a.gsDots >= 0 ? '+' : ''}${a.gsDots.toFixed(1)} จุด`]);
      rows.push(['ความเร็ว Vref −5/+20', Math.abs(a.ias / KT - AC.Vref - 7.5) <= 12.5 ? 'ok' : 'bad', `${fmt(a.ias / KT)} kt`]);
      rows.push(['อัตราจม ≤ 1,000 fpm', a.vs / FT * 60 >= -1000 ? 'ok' : 'bad', `${fmt(a.vs / FT * 60)}`]);
    }
    rows.push(['ผ่าน 500 ft แบบเสถียร', st(g5), g5 ? (g5.ok ? 'ผ่าน' : 'ไม่ผ่าน') : 'ยังไม่ถึง']);
    rows.push(['ผ่าน 200 ft แบบเสถียร', st(g2), g2 ? (g2.ok ? 'ผ่าน' : 'ไม่ผ่าน') : 'ยังไม่ถึง']);
    el.innerHTML = rows.map(([n, s, v]) => `<div class="gate" data-s="${s}"><span class="dot"></span><span>${n}</span><em>${v}</em></div>`).join('');
  }
  function showResult() {
    const f = app.flight, sc = f.ev.score(), td = f.ev.td;
    app.train.state = 'result'; showTrainPane('result'); updateCtlVisibility();
    if (!sc || !td) {
      $('#scTotal').textContent = '—'; $('#scGrade').textContent = f.crashed ? 'เครื่องบินกระแทกพื้น' : 'ไม่ได้แตะทางวิ่ง'; $('#scRows').innerHTML = '';
    } else {
      $('#scTotal').textContent = sc.total; $('#scTotal').style.color = sc.total >= 75 ? 'var(--good)' : sc.total >= 60 ? 'var(--warn)' : 'var(--bad)';
      $('#scGrade').textContent = f.crashed ? 'เครื่องบินเสียหาย' : sc.grade;
      $('#scSub').textContent = `จาก 100 คะแนน · ${f.pilot === 'ap' && !f._everMan ? 'ออโต้ไพลอต' : 'บินเอง'} · ${SCENARIOS[app.train.scn].label}`;
      const P = Object.fromEntries(sc.parts.map((p) => [p.k, p]));
      const stop = f.ev.stopS != null ? f.ev.stopS - td.s : null;
      const rows = [
        ['อัตราจมตอนแตะพื้น', `${fmt(-td.vsFpm)} fpm`, P.sink],
        ['จุดแตะพื้นจากหัวทางวิ่ง', `${fmt(td.s)} ม.`, P.pos],
        ['ห่างเส้นกลาง', `${Math.abs(td.tl).toFixed(1)} ม. ${td.tl > 0.3 ? 'ขวา' : td.tl < -0.3 ? 'ซ้าย' : ''}`, P.cl],
        ['ความเร็วตอนแตะพื้น', `${fmt(td.ias)} kt`, P.spd],
        ['เอียง / ปัดหัว / ลอยข้าง', `${Math.abs(td.bank).toFixed(1)}° / ${Math.abs(td.crab).toFixed(1)}° / ${Math.abs(td.drift).toFixed(1)} ม./วิ`, P.att],
      ];
      $('#scRows').innerHTML = rows.map(([n, v, p]) => `<span>${n}</span><em>${v}</em><i>${Math.max(0, p.pts).toFixed(0)}/${p.max}</i><div class="bar"><div style="width:${Math.max(0, p.pts) / p.max * 100}%"></div></div>`).join('')
        + (stop != null ? `<span>ระยะวิ่งจนหยุด</span><em>${fmt(stop)} ม.</em><i></i>` : '')
        + f.ev.events.map((e) => `<span style="color:var(--warn)">${{ stall: 'มีสัญญาณเตือนสตอล', excursion: 'ออกนอกทางวิ่ง', wingtip: 'ปลายปีกแตะพื้น', crash: 'กระแทกพื้นแรงเกินไป' }[e.k] || e.k}</span><em></em><i></i>`).join('');
    }
    gateRows($('#gatesR'), f, false);
    requestAnimationFrame(() => drawDebrief($('#chart'), f));
  }

  // ── resize ──
  let dpr = 1, W = 1, H = 1;
  function resize() {
    const r = viewport.getBoundingClientRect(); W = Math.max(1, Math.floor(r.width)); H = Math.max(1, Math.floor(r.height));
    renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
    dpr = Math.min(window.devicePixelRatio || 1, 2); hud.width = W * dpr; hud.height = H * dpr;
  }
  new ResizeObserver(resize).observe(viewport); resize();

  // ── initial state ──
  applyWeather(); applyTime();
  setMode('explore'); setView('overview', true);
  app.demo = newDemo();

  // ── the loop ──
  let last = performance.now(), t0 = last, frames = 0, uiT = 0, firstFrame = true;
  const shadowFocus = new THREE.Vector3();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    const T = (now - t0) / 1000;
    SU.uTime.value = T;
    const keys = app.keys.frame();   // held keys and taps since the last frame, read every frame so no tap goes stale
    let fl = null, running = true, recF = null;
    if (app.mode === 'explore') {
      const d = app.demo;
      if (!d || d.crashed || (d.finishedAt != null && d.ac.t - d.finishedAt > 7)) app.demo = newDemo();
      app.demo.advance(dt); fl = app.demo;
    } else {
      fl = app.flight;
      if (app.train.state !== 'fly') padButtons();
      if (app.train.state === 'fly') {
        readInputs(dt, now, keys);
        if (fl.pilot === 'man') Object.assign(fl.input, app.input);
        const prevTd = !!fl.ev.td, prevCall = fl.ev.lastCallout;
        fl.advance(dt * app.train.warp);
        if (fl.pilot === 'man') { fl._everMan = true; if (fl.opts.autoThr) app.input.thr = fl.input.thr; }
        if (!prevTd && fl.ev.td) { const td = fl.ev.td; toast(`แตะพื้น ${fmt(-td.vsFpm)} fpm · ห่างหัวทางวิ่ง ${fmt(td.s)} ม.`, 3800); }
        if (fl.ev.lastCallout && fl.ev.lastCallout !== prevCall && app.trainCam !== 'free') callout(CALL_TXT[fl.ev.lastCallout.v] || fl.ev.lastCallout.v, false, 900);
        const a = fl.ac.air;
        if (!a.onGround && a.ias > 40 * KT && a.alpha > (AC.aStall + AC.aStallFlap * fl.ac.flaps - 4) * DEG) callout('STALL', true, 400);
        else if (!a.onGround && a.h < 300 && a.vs / FT * 60 < -1200) callout('SINK RATE', true, 400);
        else if (!a.onGround && a.h < 300 && a.h > 15 && a.gsDots < -1.6 && a.s < 0) callout('GLIDESLOPE', true, 400);
        if ((fl.finishedAt != null && fl.ac.t - fl.finishedAt > 2.5) || (fl.crashed && !app.resultShown)) { if (!app.resultShown) { app.resultShown = true; showResult(); } }
      } else if (app.train.state === 'replay') {
        app.replayT += dt; recF = fl.rec.at(app.replayT);
        if (app.replayT > app.replayEnd + 1.5) { app.train.state = 'result'; toast('จบการเล่นซ้ำ'); }
      }
      running = !fl.ev.done || fl.ac.thr > 0.06;
    }
    // aircraft pose
    if (recF) poseFrom([recF.n, recF.e, recF.d], recF.q, { de: recF.de, da: recF.da, dr: recF.dr, flaps: recF.fl, gearPos: recF.gr, steer: 0 }, dt, true);
    else if (fl) { const ac = fl.ac; poseFrom(ac.x, [ac.x[6], ac.x[7], ac.x[8], ac.x[9]], { de: ac.de, da: ac.da, dr: ac.dr, flaps: ac.flaps, gearPos: ac.gearPos, steer: ac.steer }, dt, running); }
    ac3.group.updateMatrixWorld(true);
    const acPos = ac3.group.position;
    // camera
    camera.near = 0.5;
    ac3.helmets[0].visible = true;
    ac3.discMat.uniforms.uA.value = app.mode === 'train' && app.trainCam === 'cockpit' ? 0.12 : 1;
    if (app.mode === 'explore' || (app.mode === 'train' && app.trainCam === 'free')) {
      if (tween.on) {
        tween.k = Math.min(1, tween.k + dt / tween.dur); const e = easeIO(tween.k);
        camera.position.lerpVectors(tween.p0, tween.p1, e); controls.target.lerpVectors(tween.t0, tween.t1, e); camera.fov = lerp(tween.f0, tween.f1, e); camera.updateProjectionMatrix();
        if (tween.k >= 1) tween.on = false;
      }
      if (app.mode === 'train') { const d = tmpV.copy(acPos).sub(controls.target); controls.target.add(d); camera.position.add(d); }
      controls.update();
      if (camera.position.y < 1.5) camera.position.y = 1.5;
    } else {
      const fwdH = new THREE.Vector3(fwdV.x, 0, fwdV.z).normalize();
      const cam = app.trainCam;
      if (cam === 'chase') {
        const want = new THREE.Vector3().copy(acPos).addScaledVector(fwdH, -24).add(new THREE.Vector3(0, 6.5, 0));
        if (!chase.init) { chase.pos.copy(want); chase.init = true; }
        chase.pos.lerp(want, 1 - Math.exp(-dt * 2.6));
        camera.position.copy(chase.pos); camera.lookAt(new THREE.Vector3().copy(acPos).addScaledVector(fwdH, 14).add(new THREE.Vector3(0, 1.2, 0)));
        camera.fov = 50;
      } else if (cam === 'cockpit') {
        camera.near = 0.15;
        camera.position.set(0.95, 1.0, 0).applyMatrix4(ac3.group.matrixWorld);
        camera.quaternion.copy(ac3.group.quaternion).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0))).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-3 * DEG, 0, 0)));
        camera.fov = 58; ac3.helmets[0].visible = false;
      } else if (cam === 'tower') {
        const p = field.towerCab.clone(); p.y += 1.4; const dir = tmpV.copy(acPos).sub(p); const dist = dir.length(); p.addScaledVector(dir.normalize(), 6.5);
        camera.position.copy(p); camera.lookAt(acPos); camera.fov = clamp(2 * Math.atan(16 / Math.max(dist, 1)) * RAD, 2.2, 50);
      } else if (cam === 'side') {
        const p = rw(560, -78, 2.2); camera.position.copy(p); const dist = p.distanceTo(acPos);
        camera.lookAt(acPos); camera.fov = clamp(2 * Math.atan(20 / Math.max(dist, 1)) * RAD, 3, 55);
      }
      camera.updateProjectionMatrix();
    }
    // shadows around what the camera looks at
    let R;
    if (app.mode === 'explore') { shadowFocus.copy(controls.target); R = clamp(camera.position.distanceTo(controls.target) * 0.75, 60, 1500); }
    else if (app.trainCam === 'tower' || app.trainCam === 'side') { shadowFocus.copy(acPos).setY(0); R = 90; }
    else { shadowFocus.copy(acPos).setY(0); R = clamp(camera.position.distanceTo(acPos) * 1.2 + 25, 45, 600); }
    sky.frame(camera, shadowFocus, R, T);
    sky.updateEnv();
    renderer.toneMappingExposure = lerp(renderer.toneMappingExposure, sky.state.exposure, 1 - Math.exp(-dt * 2.5));
    // lights and emissive surfaces
    const night = sky.state.night;
    const onAF = lightsOnF();
    const pxScale = (renderer.domElement.height / 2) / Math.tan(camera.fov * DEG / 2);
    for (const m of [lights.mat, ac3.lightMat]) {
      const u = m.uniforms; u.uTime.value = T; u.uDay.value = sky.state.day; u.uPx.value = pxScale;
      u.uOnAF.value = lerp(u.uOnAF.value, onAF, 1 - Math.exp(-dt * 3)); u.uNightF.value = night; u.uOnAC.value = 1; u.uGlow.value = night;
    }
    field.mats.window.emissiveIntensity = 0.09 * night; field.mats.interior.emissiveIntensity = 0.16 * night; field.mats.glass.emissiveIntensity = 0.06 * night;
    ac3.land.intensity = 5200 * night * (fl && !fl.ev.done ? 1 : 0.2);
    for (const L of floods) L.intensity = 1100 * night;
    nightAmb.intensity = 0.11 * night;
    // windsocks and radar
    const wsSpec = app.mode === 'train' && app.flight ? app.flight.windSpec : app.wind;
    const yaw = yawFor(wsSpec.fromDeg + 180), ext = clamp(wsSpec.kt / 15, 0, 1);
    for (const s of field.dyn.socks) { s.grp.rotation.y = yaw + Math.sin(T * 1.3 + s.grp.position.x) * 0.06 * ext; s.pivot.rotation.z = -(1 - ext) * 72 * DEG + Math.sin(T * 7.0 + s.grp.position.z) * 0.035 * ext; }
    // pins
    if (app.mode === 'explore') {
      // declutter: nearest (and the selected one) first; skip any pin whose label would overlap a placed one
      const cand = [];
      for (let i = 0; i < SPOTS.length; i++) {
        const sp = SPOTS[i], d = camera.position.distanceTo(sp.w), p = projectPt(camera, sp.w, W, H);
        const ok = p && d < 6500 && p[0] > 8 && p[0] < W - 8 && p[1] > 30 && p[1] < H - 50;
        if (ok) cand.push({ i, d: sp.id === app.spot ? -1 : d, p, compact: d > 1400 && sp.id !== app.spot }); else pinEls[i].style.display = 'none';
      }
      cand.sort((a, b) => a.d - b.d);
      const placed = [];
      for (const c of cand) {
        const el = pinEls[c.i], w = c.compact ? 26 : 34 + SPOTS[c.i].n.length * 7.5, h = 26;
        const r = [c.p[0] - w / 2, c.p[1] - h - 8, c.p[0] + w / 2, c.p[1] - 8];
        if (placed.some((q) => r[0] < q[2] + 4 && r[2] > q[0] - 4 && r[1] < q[3] + 2 && r[3] > q[1] - 2)) { el.style.display = 'none'; continue; }
        placed.push(r); el.style.display = ''; el.classList.toggle('c', c.compact);
        el.style.left = `${c.p[0]}px`; el.style.top = `${c.p[1]}px`;
      }
      if (uiT > 0.09) $('#roLights').textContent = onAF ? 'เปิด' : 'ปิด (กลางวัน)';
    }
    renderer.render(scene, camera);
    // HUD layer
    hctx.clearRect(0, 0, hud.width, hud.height);
    if (app.mode === 'train' && fl) {
      const showAc = recF ? null : fl;
      if (showAc && app.trainCam === 'cockpit' && app.train.state !== 'setup') drawHUD(hctx, hud.width, hud.height, dpr, camera, fl, fl.pilot === 'man' ? fl.ap.guidance() : null);
      else if (showAc) { const e = new THREE.Vector3(0.95, 0.97, 0).applyMatrix4(ac3.group.matrixWorld); const ex = -e.z, ee = e.x; drawILSWidget(hctx, hud.width - 182 * dpr, 50 * dpr, dpr, fl, papiSeen(ex, ee, e.y)); }
    }
    if (performance.now() > calloutUntil) $('#callout').classList.remove('on');
    // DOM readouts at 10 Hz
    uiT += dt;
    if (uiT > 0.1 && app.mode === 'train' && fl) {
      uiT = 0;
      const a = fl.ac.air, ias = a.ias / KT;
      const iasEl = $('#iIas'); iasEl.textContent = fmt(ias); iasEl.className = Math.abs(ias - AC.Vapp) < 8 || (a.hWheel < 15 && ias > AC.Vref - 6) ? 'ok' : 'am';
      $('#iAlt').textContent = fmt(Math.max(0, a.hWheel / FT)); $('#iVs').textContent = `${a.vs >= 0 ? '+' : ''}${fmt(a.vs / FT * 60)}`;
      $('#iHdg').textContent = String(Math.round(wrap360(a.psi * RAD))).padStart(3, '0');
      $('#iDist').textContent = a.s < 0 ? `${(-a.s / NM).toFixed(1)} nm` : `+${fmt(a.s)} ม.`;
      const wm = fl.ac.wind.mean(Math.max(a.h, 1)); const wdir = wrap360(Math.atan2(-wm[1], -wm[0]) * RAD), wkt = Math.hypot(wm[0], wm[1]) / KT;
      $('#iWind').textContent = wkt < 0.5 ? 'สงบ' : `${String(Math.round(wdir / 10) * 10 % 360).padStart(3, '0')}/${fmt(wkt)}`;
      const ph = fl.phase();
      const fma = fl.pilot === 'ap'
        ? [['A/P', ''], ph === 'APP' ? ['LOC', ''] : ['', ''], ph === 'APP' ? ['G/S', ''] : ph === 'FLARE' ? ['FLARE', ''] : ['ROLLOUT', ''], ['SPD ' + AC.Vapp, 'c']]
        : [['MAN', 'w'], [fl.opts.assist ? 'ASSIST' : 'DIRECT', 'a'], [fl.opts.autoThr ? 'A/THR SPD ' + AC.Vapp : `THR ${Math.round(fl.ac.thr * 100)}%`, fl.opts.autoThr ? 'c' : 'w'], ['FD', 'c']];
      $('#fma').innerHTML = fma.filter(([t]) => t).map(([t, c]) => `<span class="${c}">${t}</span>`).join('');
      if (app.train.state === 'fly') {
        gateRows($('#gates'), fl, true);
        const pw = papiSeen(fl.ac.x[0], fl.ac.x[1], -fl.ac.x[2] + 1.0);
        const nW = pw.filter((v) => v > 0.5).length;
        $('#papiTxt').textContent = pw[0] < 0 ? 'ผ่านตำแหน่ง PAPI แล้ว' : `ขาว ${nW} แดง ${4 - nW} · ${['ต่ำมาก', 'ต่ำเล็กน้อย', 'อยู่บนแนวร่อน', 'สูงเล็กน้อย', 'สูงมาก'][nW]}`;
        $('#liveTitle').textContent = { APP: `ร่อนเข้าหาทางวิ่ง ${FIELD.rwy}`, FLARE: 'ถอนคันบังคับก่อนแตะพื้น', ROLLOUT: 'วิ่งบนทางวิ่งและเบรก', DONE: 'หยุดเรียบร้อย', STOP: 'หยุดเรียบร้อย', CRASH: 'เครื่องบินกระแทกพื้น' }[ph] || 'กำลังบิน';
        $('#liveLede').textContent = fl.pilot === 'ap' ? 'ออโต้ไพลอตบินตามสัญญาณ ILS ถอนคันบังคับที่ราว 20 ฟุต จัดหัวให้ตรงทางวิ่งก่อนแตะพื้น แล้วเบรกจนหยุด' : (app.tilt.on ? `บังคับด้วยการเอียงโทรศัพท์: ${TILT_BANK[app.tilt.stick.grip]} เอียงขอบบนเข้าหาตัวเพื่อเงยหัว ออกจากตัวเพื่อกดหัว กดค้างที่วงกลมเพื่อตั้งศูนย์ใหม่` : isTouch ? 'ลากคันบังคับซ้ายล่าง: ซ้าย/ขวาเพื่อเอียง ลงเพื่อเงยหัว ขึ้นเพื่อกดหัว' : 'ใช้ลูกศรบังคับ ↑ กดหัว ↓ เงยหัว ←/→ เอียง') + ' · พาวงกลมเส้นทางบินไปทับวงกลมสีชมพูในมุมห้องนักบิน';
      }
    }
    if (firstFrame) { firstFrame = false; $('#loading').classList.add('done'); }
    frames++;
  }
  requestAnimationFrame(frame);
  window.__app = { app, scene, camera, renderer, sky, field, city, setMode, setView, setTrainCam, startFlight, selectSpot, applyTime, applyWeather, makeDate, localParts, lights, ac3 };
}

main().catch((e) => { console.error(e); const m = $('#loadMsg'); if (m) { m.className = 'err'; m.textContent = `เปิดฉาก 3 มิติไม่ได้: ${e.message || e}`; } });
