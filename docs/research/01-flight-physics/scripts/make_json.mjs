// Generates the "wind" parameter JSON for section 8 and validates the leaf schema.
const P = (v, u, scope, src, conf, est, note) => ({ v, u, scope, src, conf, est, note });
const FT = 0.3048;
const json = { wind: {
  meanProfile: {
    law: P({ type: 'log', formula: 'u(h)=W20*ln(h/z0)/ln(20ft/z0)' }, '-', 'environment', ['W1', 'W6'], 'สูง', false, 'MIL-F-8785C 3.7.3 ใช้กฎลอการิทึม แทน 1/7 power law ปัจจุบัน'),
    zRef: P(6.096, 'm', 'environment', ['W1', 'W6'], 'สูง', false, 'ความสูงอ้างอิง 20 ft ของ W20'),
    z0_catC: P(0.0457, 'm', 'environment', ['W6'], 'สูง', false, '0.15 ft สำหรับ Category C flight phase (ขึ้น-ลง) ค่าเริ่มต้นของสนามบิน'),
    z0_other: P(0.6096, 'm', 'environment', ['W6'], 'สูง', false, '2.0 ft สำหรับ flight phase อื่น ใช้เป็นตัวแทนลมที่พัดผ่านเมืองก่อนถึงสนาม (การใช้แทนเมืองเป็นค่าประมาณ)'),
    hRange: P([0.914, 304.8], 'm', 'environment', ['W6'], 'สูง', false, 'ช่วงที่สมการใช้ได้ 3-1000 ft; ต่ำกว่า 3 ft ให้ clamp, สูงกว่า 1000 ft ให้คงที่หรือใช้ข้อมูลลมชั้นบน'),
    veer: P(0, 'deg', 'environment', [], 'ต่ำ', true, 'ยังไม่ใส่การหมุนทิศลมตามความสูง (Ekman) ในรอบนี้')
  },
  turbulence: {
    form: P({ spec: 'MIL-F-8785C', spectrum: 'Dryden' }, '-', 'sim', ['W1', 'W3', 'W8'], 'สูง', false, 'Dryden แบบ 8785C (Lw, Lv ไม่คูณ 2) ใช้ filter ตรรกยะได้แม่น; von Karman ต้องใช้ filter ประมาณ'),
    sigmaW_over_W20: P(0.1, '-', 'environment', ['W3'], 'สูง', false, 'low altitude: sigma_w = 0.1 W20'),
    lowAltLengthCoef: P([0.177, 0.000823, 1.2], '-', 'environment', ['W3', 'W7'], 'สูง', false, 'Lu = Lv = h/(0.177+0.000823h)^1.2, Lw = h (h เป็น ft)'),
    lowAltSigmaCoef: P([0.177, 0.000823, 0.4], '-', 'environment', ['W3', 'W7'], 'สูง', false, 'sigma_u/sigma_w = sigma_v/sigma_w = 1/(0.177+0.000823h)^0.4'),
    hClip: P([10, 1000], 'ft', 'environment', ['W3', 'W7'], 'สูง', false, 'low-altitude model ใช้ 10-1000 ft (clip ที่ 10 ft ตาม JSBSim)'),
    transition: P([1000, 2000], 'ft', 'environment', ['W3', 'W7'], 'สูง', false, 'ช่วงต่อ: interpolate เชิงเส้นระหว่าง low ที่ 1000 ft กับ high ที่ 2000 ft'),
    L_high_dryden: P(1750, 'ft', 'environment', ['W3', 'W7'], 'สูง', false, 'medium/high altitude Dryden: Lu = Lv = Lw = 1750 ft (533.4 m)'),
    L_high_vonKarman: P(2500, 'ft', 'environment', ['W4', 'W9'], 'สูง', false, 'von Karman และ 14 CFR 25.341(b): L = 2500 ft (762 m)'),
    W20_levels: P({ light: 15, moderate: 30, severe: 45 }, 'kt', 'environment', ['W3', 'W7'], 'สูง', false, 'ลมที่ 20 ft ที่ใช้นิยามระดับความปั่นป่วน low altitude'),
    poeHighAlt: P({ axes: { poe: [0.2, 0.1, 0.01, 0.001, 1e-4, 1e-5, 1e-6], h_ft: [500, 1750, 3750, 7500, 15000, 25000, 35000, 45000, 55000, 65000, 75000, 80000] },
      data: [[3.2, 2.2, 1.5, 0, 0, 0, 0, 0, 0, 0, 0, 0], [4.2, 3.6, 3.3, 1.6, 0, 0, 0, 0, 0, 0, 0, 0], [6.6, 6.9, 7.4, 6.7, 4.6, 2.7, 0.4, 0, 0, 0, 0, 0], [8.6, 9.6, 10.6, 10.1, 8.0, 6.6, 5.0, 4.2, 2.7, 0, 0, 0], [11.8, 13.0, 16.0, 15.1, 11.6, 9.7, 8.1, 8.2, 7.9, 4.9, 3.2, 2.1], [15.6, 17.6, 23.0, 23.6, 22.1, 20.0, 16.0, 15.1, 12.1, 7.9, 6.2, 5.1], [18.7, 21.5, 28.4, 30.2, 30.7, 31.0, 25.2, 23.1, 17.5, 10.7, 8.4, 7.2]] },
      'ft/s', 'environment', ['W7', 'W1'], 'กลาง', false, 'sigma_u=sigma_v=sigma_w (rms) ตามความน่าจะเป็นที่จะเกิน; อ่านจาก MIL-F-8785C Fig.7 ผ่านตารางใน JSBSim; light=1e-2, moderate=1e-3, severe=1e-5'),
    tauP_coef: P(4 / Math.PI, '-', 'sim', ['W3', 'W8'], 'สูง', false, 'tau_p = tau_q = 4b/(pi V)'),
    tauR_coef: P(3 / Math.PI, '-', 'sim', ['W3', 'W8'], 'สูง', false, 'tau_r = 3b/(pi V)'),
    pgSpectrumCoef: P(0.8, '-', 'environment', ['W3'], 'สูง', false, 'Phi_p = sigma_w^2/(V Lw) * 0.8 (pi Lw/4b)^(1/3)/(1+(4b w/(pi V))^2)'),
    rateSigns: P({ qg: -1, rg: 1 }, '-', 'sim', ['W3'], 'กลาง', true, 'นิยามของ repo: อัตราเทียบอากาศ = body rate - gust rate; q_g = -(s/V)/(1+tau_q s) w_g, r_g = +(s/V)/(1+tau_r s) v_g (สอดคล้องตัวเลือก -q +r ของ MathWorks)'),
    axesLowAlt: P({ u: 'mean-wind direction (horizontal)', v: 'horizontal, 90 deg right of u', w: 'vertical (down +)' }, '-', 'sim', ['W3', 'W7'], 'สูง', false, 'ปัจจุบันใช้ ground track ซึ่งผิดสเปก'),
    discretisation: P({ u: 'exact AR(1)', vw: 'exact 2-state (Cholesky of Q)', p: 'exact AR(1)', qr: 'first-order on derivative' }, '-', 'sim', ['W8'], 'สูง', true, 'ทดสอบแล้วว่าความแปรปรวนไม่ขึ้นกับ dt (1/30 ถึง 1/1000 s)'),
    seed: P(11, '-', 'sim', [], 'สูง', true, 'ตัวเลขสุ่มแบบกำหนด seed เพื่อให้เทสต์ซ้ำได้')
  },
  discreteGust: {
    milShape: P({ formula: 'v=0 (x<0); vm/2(1-cos(pi x/dm)) (0<=x<=dm); vm (x>dm)' }, '-', 'sim', ['W5', 'W2'], 'สูง', false, 'MIL-F-8785C เก็บรูป 1-cosine แต่กำหนดแค่ครึ่งคาบ'),
    mathworksDefault: P({ dm_m: [120, 120, 80], vm_mps: [3.5, 3.5, 3.0] }, 'm, m/s', 'sim', ['W5'], 'กลาง', false, 'ค่าเริ่มต้นของ MathWorks block ไม่ใช่ค่าบังคับในสเปก'),
    cs25Shape: P({ formula: 'U=(Uds/2)(1-cos(pi s/H)), 0<=s<=2H' }, '-', 'aircraft', ['W9'], 'สูง', false, '14 CFR 25.341(a) / CS 25.341(a) ใช้กับเครื่อง transport ใน Round ถัดไป'),
    cs25H: P([30, 350], 'ft', 'aircraft', ['W9'], 'สูง', false, 'gust gradient H ที่ต้องกวาด'),
    cs25Uref: P({ axes: { h_ft: [0, 15000, 60000] }, data: [56.0, 44.0, 20.86] }, 'ft/s EAS', 'environment', ['W9'], 'สูง', false, 'Uref ระหว่าง VB-VC; ที่ VD ใช้ครึ่งหนึ่ง'),
    cs25Fg: P({ Fgz: '1 - Zmo/250000', Fgm: 'sqrt(R2 tan(pi R1/4))', Fg_sl: '0.5(Fgz+Fgm)' }, '-', 'aircraft', ['W9'], 'สูง', false, 'R1 = MLW/MTOW, R2 = MZFW/MTOW; Fg เพิ่มเชิงเส้นเป็น 1 ที่ Zmo'),
    cs25Usigma: P({ axes: { h_ft: [0, 24000, 60000] }, data: [90, 79, 79] }, 'ft/s TAS', 'environment', ['W9'], 'สูง', false, 'continuous turbulence 25.341(b) ระหว่าง VB-VC (คูณ Fg)'),
    trainerEvent: P({ dm_m: 30, vm_mps: 3.0, axis: 'w' }, 'm, m/s', 'sim', [], 'ต่ำ', true, 'เหตุการณ์ฝึก "บัมพ์" แนวดิ่งสำหรับเครื่องฝึก: ค่าประมาณเพื่อการสอน ไม่ใช่ค่าออกแบบ')
  },
  microburst: {
    vicroyConst: P({ alpha: 2, c1: -0.15, c2: -3.2175 }, '-', 'environment', ['W12', 'W13'], 'กลาง', false, 'ชุดค่าที่ TP-3460 และ Wanke-Hansman ใช้; จุดสูงสุดของลมราบอยู่ที่ z = zm'),
    vicroyConstTM: P({ alpha: 2, c1: -0.22, c2: -2.75 }, '-', 'environment', ['W11'], 'กลาง', false, 'ชุดค่าใน TM-104053 (1991) ต่างจากชุดหลัง เก็บไว้เปรียบเทียบ'),
    obRatios: P({ rPeak_over_R: 1.1212, zm_over_zstar: 0.22, zstar_over_eps: 12.5, umax_over_lambdaR: 0.2357 }, '-', 'environment', ['W10'], 'สูง', false, 'ความสัมพันธ์ของโมเดล Oseguera-Bowles (ตรวจซ้ำด้วยการคำนวณแล้ว)'),
    zm: P(60, 'm', 'environment', ['W12', 'W15'], 'กลาง', false, 'ความสูงของลมราบสูงสุดที่ TP-3460 ตั้งไว้'),
    scenarios: P({ light: { rp_m: 900, zm_m: 60, um_mps: 8 }, moderate: { rp_m: 900, zm_m: 60, um_mps: 13 }, severe: { rp_m: 900, zm_m: 60, um_mps: 20 } }, 'm, m/s', 'sim', [], 'ต่ำ', true, 'ค่าประมาณสำหรับการฝึก: F-bar(1 km) ของเครื่องฝึก 95 kt เมื่อศูนย์กลางอยู่ใต้ GP ที่ 300 ft = 0.089 / 0.144 / 0.223'),
    F_hazard_1km: P(0.1, '-', 'environment', ['W12', 'W13'], 'กลาง', false, 'F เฉลี่ย 1 km >= 0.1 ถือว่าอันตรายต่อการขึ้น-ลง'),
    F_avgLength: P(1000, 'm', 'sim', ['W12', 'W13'], 'กลาง', false, 'ความยาวเฉลี่ย F'),
    AC25_12_climbLoss: P(0.15, '-', 'aircraft', ['W14'], 'กลาง', false, 'AC 25-12: threshold ที่เกิน 15% loss of climb gradient อยู่ในกลุ่มที่ต้องพิจารณา controllability'),
    enableBand: P([50, 1000], 'ft AGL', 'aircraft', ['W14'], 'สูง', false, 'AC 25-12 6f: ระบบเตือนทำงานระหว่าง 50-1000 ft AGL'),
    trainerExcessTW: P(0.218, '-', 'aircraft', [], 'กลาง', true, 'คำนวณจากโมเดลปัจจุบัน: (Tmax-D)/W ที่ 95 kt แฟลปลง ล้อลง 31 C')
  },
  wake: {
    spanLoadFactor: P(0.7854, '-', 'aircraft', ['W16'], 'สูง', false, 's = b0/b = pi/4 สำหรับ elliptic loading'),
    coreRadius_over_b: P([0.01, 0.05], '-', 'aircraft', ['W17'], 'กลาง', false, 'ช่วงรัศมีแกน 1-5% ของ span ตามที่รวบรวมใน NASA review'),
    hazardRadius: P([5, 15], 'm', 'sim', ['W17'], 'กลาง', false, 'Gamma_5-15 ใช้เป็น hazard circulation'),
    igeStart_over_b0: P(1.5, '-', 'environment', ['W18'], 'กลาง', false, 'เริ่มใส่ image vortex เมื่อสูงกว่าพื้น 1.5 b0'),
    reboundMax_over_b0: P(2.6, '-', 'environment', ['W18'], 'กลาง', false, 'rebound สูงสุดที่สังเกต ~2.6 b0 (กรณีแรงสุด)'),
    secondaryRatio: P({ luff: 0.2, lee: 0.4 }, '-', 'environment', ['W18'], 'กลาง', false, 'อัตราส่วน Gamma secondary/primary ใน D2P'),
    crosswindClear: P([2.5, 3.3], 'm/s', 'environment', ['W18'], 'กลาง', false, 'ลมขวางที่ 10 m ที่ทำให้ vortex พ้น corridor (5 NM / 2 NM)'),
    decayLowTurb: P({ plateau: 0.7, tStarOnset: 2.8, tauStar: 6.4 }, '-', 'environment', ['W16'], 'ต่ำ', true, 'fit จาก B-767 run 23 (70% ถึง ~60 s แล้วเหลือ <1/3 ที่ 160 s) แปลงเป็น t*; กรณีปั่นป่วนน้อย อายุยืน'),
    generators: P({ A320ceo: { m_kg: 66000, b_m: 35.80, Vapp_kt: 135 }, B737_800W: { m_kg: 66361, b_m: 35.79, Vapp_kt: 142 } }, 'kg, m, kt', 'aircraft', ['W19', 'W20'], 'กลาง', true, 'มวล = MLW (ขอบบน); Vapp ของ A320 เป็นค่าประมาณในช่วง Cat C 121-140 kt'),
    rollRatio5NM: P({ stripTheory: [1.4, 2.2], clpConsistent: [0.84, 1.31] }, '-', 'aircraft', [], 'ต่ำ', true, 'อัตราส่วนโมเมนต์ม้วนจาก vortex ของ A320 ต่อ aileron เต็มของเครื่องฝึก ที่ 5 NM (decay แบบปั่นป่วนน้อย, rc 5%-1% ของ span)'),
    Gamma0_A320: P(290, 'm^2/s', 'aircraft', ['W19', 'W16'], 'กลาง', true, 'rho 1.1434 kg/m3 (150 m AGL, 31 C); w0 = 1.64 m/s, t0 = 17.1 s'),
    Gamma0_B738: P(277, 'm^2/s', 'aircraft', ['W20', 'W16'], 'กลาง', true, 'w0 = 1.57 m/s, t0 = 17.9 s'),
    icaoCategories: P({ HEAVY_min_kg: 136000, LIGHT_max_kg: 7000, SUPER: 'listed in Doc 8643' }, 'kg MTOM', 'aircraft', ['W24'], 'สูง', false, 'หมวด PANS-ATM เดิม; เครื่องฝึก 2250 kg = LIGHT, A320/737 = MEDIUM'),
    icaoDistanceMinima: P({ SUPER: { HEAVY: 5, MEDIUM: 7, LIGHT: 8 }, HEAVY: { HEAVY: 4, MEDIUM: 5, LIGHT: 6 }, MEDIUM: { LIGHT: 5 } }, 'NM', 'environment', ['W26'], 'กลาง', false, 'leader -> follower ตาม Doc 4444 8.7.3.4 (อ่านผ่านแหล่งทุติยภูมิ; ยังไม่ได้เปิด Doc 4444 ฉบับจริง)'),
    icaoTimeMinimaArr: P({ SUPER: { HEAVY: 2, MEDIUM: 3, LIGHT: 4 }, HEAVY: { MEDIUM: 2, LIGHT: 3 }, MEDIUM: { LIGHT: 3 } }, 'min', 'environment', ['W26'], 'กลาง', false, 'time-based minima สำหรับการลงจอด Doc 4444 5.8.2.1 (อ่านผ่านแหล่งทุติยภูมิ)'),
    vtbdScheme: P({ scheme: 'ICAO PANS-ATM legacy (assumed)' }, '-', 'environment', ['W23'], 'ต่ำ', true, 'AIP ENR 1.1 ระบุว่ากฎจราจรเป็นไปตาม Annex 2/11 และ PANS; ไม่พบประกาศ RECAT/eWTS ที่ VTBD ใน ENR 1.6 จึงสมมติแบบ ICAO เดิม'),
    eWTSeffective: P({ date: '2020-11-05' }, 'date', 'environment', ['W24', 'W25'], 'สูง', false, 'Amendment 9 ของ PANS-ATM เพิ่ม wake turbulence groups (eWTS)')
  }
} };
// validate leaves
let n = 0, bad = [];
(function walk(o, path) {
  for (const [k, v] of Object.entries(o)) {
    if (v && typeof v === 'object' && 'v' in v && 'u' in v && 'scope' in v) {
      n++;
      for (const f of ['v', 'u', 'scope', 'src', 'conf', 'est', 'note']) if (!(f in v)) bad.push(path + k + ' missing ' + f);
      if (!['aircraft', 'engine', 'propeller', 'gear', 'environment', 'sim'].includes(v.scope)) bad.push(path + k + ' scope');
      if (!['สูง', 'กลาง', 'ต่ำ'].includes(v.conf)) bad.push(path + k + ' conf');
      if (typeof v.est !== 'boolean') bad.push(path + k + ' est');
      if (typeof v.v === 'string') bad.push(path + k + ' v is string');
    } else if (v && typeof v === 'object') walk(v, path + k + '.');
    else bad.push(path + k + ' not a leaf object');
  }
})(json, '');
console.error('leaves', n, 'bad', bad);
const isLeaf = (v) => v && typeof v === "object" && "scope" in v && "conf" in v;
const fmt = (o, ind) => { const pad = "  ".repeat(ind); const ent = Object.entries(o).map(([k, v]) => pad + "  " + JSON.stringify(k) + ": " + (isLeaf(v) ? JSON.stringify(v) : fmt(v, ind + 1))); return "{\n" + ent.join(",\n") + "\n" + pad + "}"; };
const s = fmt(json, 0);
JSON.parse(s);
process.stdout.write(s);
