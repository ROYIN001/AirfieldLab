// ───────────────────────── Aircraft types of the training pane (plan C1) ─────────────────────────
// Pure (no DOM): test/cards.test.mjs evaluates this file alone with new Function, as test/keys.test.mjs does 18-keys.js.
// It holds the selector order, the Thai sentence frames and type names, and how the generic 3D model of 70-aircraft.js
// is fitted to a type. Research round 2 task item 10 (docs/research/02-light-aircraft.md) and 02-thai-schools.md
// (T-LS-03, T-LS-11). Schools, counts, bases and the register date come from the card's thai_fleet leaf (built by
// tools/aircraft/build_cards.mjs from common_light.thai_fleet: civil schools and clubs only), speeds and gear from
// acFromCard (20-flight.js), so no number of a card is copied into code. No AIP fact lives here.

// Owner decision OD-TYPES (plan C1): the fictional trainer first (the default, and the only aircraft of the explore
// mode), then the C172S, the type most Thai civil schools fly (T-LS-03, T-LS-11 (ก)), and the other five round 2 cards.
// There is no DA40 NG: no Thai civil school has one (02-thai-schools.md §02.5.3, T-LS-11 (ข)).
const AIRCRAFT_TYPES = ['trainer', 'c172s', 'c172r', 'da42ng', 'da42_tae125', 'da40d', 'da40_180'];

// name: the selector and the brief; desc: the start of the setup lede; note: the type's own line in the notes
const TYPE_TEXT = {
  trainer: { name: 'เครื่องฝึกสมมติ' },
  c172s: { name: 'Cessna 172S Skyhawk SP', desc: 'Cessna 172S เครื่องยนต์ลูกสูบหนึ่งเครื่อง ปีกสูง' },
  c172r: { name: 'Cessna 172R Skyhawk', desc: 'Cessna 172R เครื่องยนต์ลูกสูบหนึ่งเครื่อง ปีกสูง' },
  da42ng: { name: 'Diamond DA42 NG', desc: 'Diamond DA42 NG เครื่องยนต์ดีเซลสองเครื่อง', note: 'ซิมยังไม่จำลองเครื่องยนต์ดับข้างเดียว' },
  da42_tae125: { name: 'Diamond DA42 (TAE 125)', desc: 'Diamond DA42 (TAE 125) เครื่องยนต์ดีเซลสองเครื่อง', note: 'ซิมยังไม่จำลองเครื่องยนต์ดับข้างเดียว' },
  da40d: { name: 'Diamond DA40 D', desc: 'Diamond DA40 D เครื่องยนต์ดีเซลหนึ่งเครื่อง ปีกต่ำ', note: 'โรงเรียนการบินพลเรือนไทยไม่มี DA40 NG' },
  da40_180: { name: 'Diamond DA40 (IO-360)', desc: 'Diamond DA40 (IO-360) เครื่องยนต์ลูกสูบหนึ่งเครื่อง ปีกต่ำ', note: 'โรงเรียนการบินพลเรือนไทยไม่มี DA40 NG' },
};
// The experimental airliners of research round 3 (plan C4), behind the Thai switch "รุ่นทดลอง" and labelled as estimates
// until phase K gives them engines and tables (owner decisions OD-SOURCES, OD-RATINGS). Cards by
// tools/aircraft/build_airliners.mjs, in its order: by the number of each type based at Don Mueang (03-airliners.md).
// The explore mode always flies the trainer.
const AIRLINER_TYPES = ['a320ceo', 'b737_800', 'a320neo', 'a330_300', 'a321neo', 'atr72_600', 'a321ceo'];
// ap: what the trainer's Autopilot does with the type (measured, test/r3cards.test.mjs AIRLINER_AUTOLAND; plans C5/C6 tune it)
const AP_CALM = 'ออโต้ไพลอตของเครื่องฝึกพาแบบนี้กระแทกพื้นแรงเกินไปแม้ลมสงบ ทุกทางวิ่ง ให้บินเอง';
const AP_WIND = 'ออโต้ไพลอตของเครื่องฝึกพาแบบนี้กระแทกพื้นแรงเกินไปในลมบางแบบ';
const AIRLINER_TEXT = {
  a320ceo: { name: 'Airbus A320ceo', desc: 'Airbus A320ceo เจ็ตลำตัวแคบสองเครื่องยนต์ (CFM56-5B)' },
  b737_800: { name: 'Boeing 737-800', desc: 'Boeing 737-800 เจ็ตลำตัวแคบสองเครื่องยนต์ (CFM56-7B)', note: 'flat rating ของ CFM56-7B 30 °C ทุก rating (ซิมยังไม่ลดแรงขับตามอุณหภูมิอากาศ)', ap: AP_CALM },
  a320neo: { name: 'Airbus A320neo', desc: 'Airbus A320neo เจ็ตลำตัวแคบสองเครื่องยนต์ (LEAP-1A)', ap: AP_WIND },
  a330_300: { name: 'Airbus A330-300', desc: 'Airbus A330-300 เจ็ตลำตัวกว้างสองเครื่องยนต์ (Trent 772B)', note: 'derivative ด้านข้างของ A330 แปลงจากแกน stability เป็นแกนตัวเครื่อง (ค่าประมาณ) ระยะ aileron และ rudder ยังไม่พบในแหล่งสาธารณะ', ap: 'ออโต้ไพลอตของเครื่องฝึกพาแบบนี้ stall ระหว่างร่อน (ราววินาทีที่ 29) ทุกทางวิ่งและทุกลม ให้บินเอง' },
  a321neo: { name: 'Airbus A321neo', desc: 'Airbus A321neo เจ็ตลำตัวแคบสองเครื่องยนต์ (LEAP-1A)', note: 'LEMAC ของ A321 จาก FAA TCDS A28NM ความเชื่อมั่นต่ำ', ap: AP_WIND },
  atr72_600: { name: 'ATR 72-600', desc: 'ATR 72-600 ใบพัดเทอร์โบสองเครื่องยนต์ ปีกสูง', note: 'ซิมยังไม่จำลองใบพัดสองข้าง แรงบิด และ governor ของ ATR', ap: AP_WIND },
  a321ceo: { name: 'Airbus A321ceo', desc: 'Airbus A321ceo เจ็ตลำตัวแคบสองเครื่องยนต์ (CFM56-5B)', note: 'LEMAC ของ A321 จาก FAA TCDS A28NM ความเชื่อมั่นต่ำ', ap: AP_CALM },
};
for (const [id, t] of Object.entries(AIRLINER_TEXT)) TYPE_TEXT[id] = { ...t, exp: true };
const EXP_SWITCH = 'รุ่นทดลอง';
const EXP_NOTES = [
  'รุ่นทดลอง: ซิมบินเครื่องบินโดยสารด้วยสมการเดิมของเครื่องฝึก (โหมด legacy) ค่าทุกตัวเป็นค่าประมาณจากงานวิจัยรอบที่ 3 ยังไม่มีแบบจำลองเครื่องยนต์ ระบบบังคับ และตารางอากาศพลศาสตร์ของแบบนี้',
  'แฟลปตำแหน่งกลางเป็นค่าประมาณ (CLmax ในโหมดนี้ต่ำกว่าของจริง) เที่ยวบินเริ่มที่แฟลปลงจอด',
  'สายการบินไม่เผยแพร่มวลและ rating เครื่องยนต์จริงของแต่ละลำ มวลและ rating ข้างบนจึงเป็นค่าตั้งต้นของบัตร เปลี่ยนได้ (สปริงและแดมเปอร์ของขาล้อคิดที่มวลตั้งต้นของบัตร ไม่เปลี่ยนตามมวลที่เลือก)',
  'ออโต้ไพลอตและระบบช่วยบังคับยังตั้งไว้สำหรับเครื่องฝึก อาจลงจอดแข็งหรือเสียการทรงตัวกับเครื่องบินโดยสาร จนกว่าจะปรับรายแบบ',
];
const TRAINER_LEDE = 'เครื่องฝึกใบพัดเทอร์โบสองที่นั่ง (แบบสมมติ) เริ่มบนแนวร่อน 3° ใส่ล้อและแฟลปลงจอดแล้ว';
const TRAINER_NOTES = [
  'เครื่องฝึกเทอร์โบพร็อปสองที่นั่งแบบสมมติของ AirfieldLab ไม่ใช่เครื่องบินของผู้ผลิตจริง ค่าทุกตัวเป็นค่าประมาณ',
  'โรงเรียนการบินพลเรือนในไทยไม่มีเครื่องฝึกเทอร์โบพร็อป',
];
// T-LS-11 (ค): a light aircraft on the Don Mueang approach is a made-up scene (02-thai-schools.md §02.4.2: Thai schools
// train at regional fields; the AIP names no school that trains at VTBD)
const SCENARIO_NOTE = 'สถานการณ์สมมติ: โรงเรียนการบินในไทยฝึกที่สนามภูมิภาค ไม่ได้ฝึกวงจรที่ดอนเมืองเป็นประจำ';
const MODEL_NOTE = 'ภาพเครื่องบินในฉากเป็นแบบทั่วไป ไม่ใช่รูปทรงจริงของแบบนี้';
const TH_MONTH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const thaiDate = (iso) => { const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(String(iso)); return m ? `${+m[3]} ${TH_MONTH[+m[2] - 1]} ${m[1]}` : String(iso); };
// the landing detent: the entry of aero.flaps.detents with the largest flap_deg (as acFromCard reads it)
const landingDetent = (card) => card.aero.flaps.detents.v.reduce((a, d) => (d.flap_deg > a.flap_deg ? d : a));

// The Thai text of a type: { name, em, span, lede, notes, links: [{ text, href }], real }. card is the parsed
// data/aircraft/<id>.json and ac what acFromCard made of it; without them (a card that failed to load) only the name.
// em and the brief show Vref and Vapp in KIAS as the HUD does (plan C3: ac.kias, the card's own figures or its kt CAS read
// back through speeds.ias_cas), rounded for display; note 4 says what the HUD reads and what the sim flies. They are not
// all manual figures: the da42ng ones come from a school's deck, the C172 Vapp is the middle of the POH range.
function typeInfo(id, card, ac) {
  const T = TYPE_TEXT[id] || { name: String(id) }, real = id !== 'trainer';
  const out = { name: T.name, em: '', span: '', lede: '', notes: [], links: [], real, exp: !!T.exp };
  if (!card || !ac) return out;
  if (T.exp) return airlinerInfo(id, T, card, ac, out);
  const V = ac.kias || ac;
  out.em = `Vref ${Math.round(V.Vref)} · Vapp ${Math.round(V.Vapp)} KIAS`;
  if (!real) {
    out.span = 'แบบสมมติ ค่าทุกตัวเป็นค่าประมาณ'; out.lede = TRAINER_LEDE; out.notes = [...TRAINER_NOTES];
    return out;
  }
  const det = landingDetent(card), flap = /^\d+$/.test(String(det.name)) ? `${det.name}°` : String(det.name);
  const retract = card.gear && card.gear.layout && card.gear.layout.v === 'tricycle_retract';
  out.lede = `${T.desc || T.name} เริ่มบนแนวร่อน 3° ${retract ? 'ใส่ล้อและแฟลปลงจอด' : 'ล้อตายตัว แฟลปลงจอด'} (${flap}) แล้ว`;
  const tf = card.thai_fleet && card.thai_fleet.v;
  if (tf && Array.isArray(tf.users)) {
    const ato = tf.users.filter((u) => u.kind === 'ato'), club = tf.users.filter((u) => u.kind === 'club');
    const nAto = ato.reduce((s, u) => s + u.n, 0);
    out.span = `โรงเรียนการบินพลเรือนในไทย ${nAto} ลำ ${ato.length} แห่ง${id === tf.default_thai_type ? ' · ใช้มากที่สุด' : ''}`;
    const one = (u) => `${u.name} ${u.n} ลำ${u.variants && u.variants.length ? ` (รวมรุ่น ${u.variants.map((x) => x.variant).join(', ')})` : ''}`
      + (u.base ? ` ฐานฝึก${u.base}${u.base_est ? ' (ค่าประมาณ)' : ''}` : '');
    out.notes.push(`ใช้ฝึกที่ ${ato.map(one).join(', ')}${club.length ? ` และชมรมการบิน ${club.map(one).join(', ')}` : ''}`);
    out.notes.push(`จำนวนจากทะเบียนอากาศยานของ กพท. ณ ${thaiDate(tf.as_of)} นับเครื่องที่จดทะเบียน ไม่ใช่เครื่องที่บินได้วันนี้`);
  }
  if (T.note) out.notes.push(T.note);
  if (ac.kias) out.notes.push(`HUD แสดง KIAS ตามตาราง IAS–CAS ของบัตรที่แฟลปขณะนั้น ซิมบินด้วย KCAS (ลงจอดแฟลปเต็ม Vref ${Math.round(ac.kias.Vref)} KIAS = ${Math.round(ac.Vref)} KCAS, Vapp ${Math.round(ac.kias.Vapp)} KIAS = ${Math.round(ac.Vapp)} KCAS) และคะแนนวัดเป็น KIAS`);
  out.notes.push(`ตัวเลขการบินในซิมเป็นค่าประมาณจากเอกสารสาธารณะของผู้ผลิตและหน่วยงาน ดูที่มาทุกค่าใน aircraft/${id}.json`);
  out.notes.push(SCENARIO_NOTE, MODEL_NOTE);
  const reg = card._meta && card._meta.sources && card._meta.sources.LS1;
  if (reg && /^https:\/\//.test(reg.link)) out.links.push({ text: 'ทะเบียนอากาศยานของ กพท.', href: reg.link });
  out.links.push({ text: `aircraft/${id}.json`, href: `aircraft/${id}.json` });
  return out;
}

// An experimental airliner (plan C4): its speeds are kt CAS from the card's mass tables at the chosen mass (no IAS–CAS
// table, so the HUD shows KCAS), the mass and the engine rating are the ones chosen (ac.m, the rating name given)
function airlinerInfo(id, T, card, ac, out) {
  const det = landingDetent(card), flap = /^\d+$/.test(String(det.name)) ? `${det.name}°` : String(det.name);
  out.em = `Vref ${Math.round(ac.Vref)} · Vapp ${Math.round(ac.Vapp)} KCAS`;
  out.span = `${EXP_SWITCH} · ค่าประมาณ · มวล ${Math.round(ac.m).toLocaleString('en-US')} kg`;
  out.lede = `${T.desc} (${EXP_SWITCH}) เริ่มบนแนวร่อน 3° ใส่ล้อและแฟลปลงจอด (${flap}) แล้ว`;
  out.notes.push(...EXP_NOTES);
  if (T.note) out.notes.push(T.note);
  if (T.ap) out.notes.push(T.ap);
  out.notes.push(`HUD แสดงความเร็วเป็น KCAS เพราะบัตรไม่มีตาราง IAS–CAS ของแบบนี้ (Vref ${Math.round(ac.Vref)} KCAS ที่มวล ${Math.round(ac.m).toLocaleString('en-US')} kg)`);
  out.notes.push(`ตัวเลขทุกตัวพร้อมที่มาอยู่ใน aircraft/${id}.json`, MODEL_NOTE);
  out.links.push({ text: `aircraft/${id}.json`, href: `aircraft/${id}.json` });
  return out;
}
// The masses and engine ratings an airliner card offers (airframe.weights.mass_options, turbofan.ratings_offered, the
// card default first); [] for a type that offers none
const massOptions = (card) => (card && card.airframe && card.airframe.weights.mass_options ? card.airframe.weights.mass_options.v.slice() : []);
const ratingOptions = (card) => (card && card.turbofan && card.turbofan.ratings_offered ? card.turbofan.ratings_offered.v.slice() : []);
const ratingName = (cls) => String(cls).replace(/_class$/, '').replace(/^CFM56_/, 'CFM56-').replace(/^LEAP_/, 'LEAP-').replace(/^TRENT_/, 'Trent ');

// The generic model (70-aircraft.js) is the trainer's: its main wheels touch 1.38 m below its CG (leg y −0.36, wheel
// −0.73, radius 0.29 in model axes), the trainer card's main-gear contact z. For another type it is raised so the
// wheels sit at the card's deepest contact, the flaps drawn at the landing detent's angle, the retract animation kept
// only for a retractable gear, and engines given in model axes (FRD x, −z, y) for the twins' nacelles. The whole model
// hides in the cockpit view, where the trainer's canopy and helmets would stand around the card's eye point. null =
// the trainer as built.
const MODEL_WHEEL_Z = 1.38;
function modelSpec(id, card, ac) {
  if (id === 'trainer' || !card || !ac) return null;
  return {
    lift: MODEL_WHEEL_Z - Math.max(...ac.gear.map((g) => g.b[2])),
    flapDeg: landingDetent(card).flap_deg,
    retract: !!(card.gear && card.gear.layout && card.gear.layout.v === 'tricycle_retract'),
    engines: ac.engines.map((e) => [e.pos[0], -e.pos[2], e.pos[1]]),
    hideInCockpit: true,
  };
}
