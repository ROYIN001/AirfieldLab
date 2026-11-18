// Build the section-8 "wind" parameter JSON (valid JSON, printed pretty).
const P = (v, u, scope, src, conf, est, note) => ({ v, u, scope, src, conf, est, note });
const J = { wind: {
  meanProfile: {
    model: P({ default: 'log', options: ['log', 'power'] }, '-', 'environment', ['W5', 'W17'], 'กลาง', false, 'โปรไฟล์ลมเฉลี่ย log law เป็นค่าเริ่มต้น; power law เก็บไว้เพื่อเทียบกับโค้ดเดิม'),
    zRef_m: P(10, 'm', 'environment', ['W18'], 'กลาง', false, 'ความสูงอ้างอิงของลมผิวพื้นที่รายงาน (METAR/ATIS) ตามมาตรฐาน WMO; ข้อความยังไม่ได้เปิดยืนยันในเนื้อหา'),
    z0_m: P({ milspec_catC: 0.046, open_grass: 0.03, roughly_open: 0.10, rough: 0.25, parkland: 0.5, suburb: 1.0, city_centre: 2.0 }, 'm', 'environment', ['W5', 'W17'], 'กลาง', false, 'milspec_catC = 0.15 ft ตาม MIL-F-8785C (ผ่าน MathWorks); ที่เหลือจากตารางความขรุขระ (ทุติยภูมิ)'),
    z0_default_VTBD_m: P(0.05, 'm', 'environment', ['W5', 'W17'], 'ต่ำ', true, 'ค่าประมาณ: ลานบิน (หญ้า/ผิวลาดยาง) ใกล้ 0.03-0.046 m; ใช้ 0.5-1.0 m เป็น preset "ลมผ่านเมือง" สำหรับแนวร่อนที่ผ่านย่านชุมชน'),
    powerExponent_legacy: P(0.142857, '-', 'environment', ['W5'], 'กลาง', true, 'ค่าในโค้ดเดิม (1/7) เทียบเท่า log law ที่ z0 = 10·e^-7 = 0.0091 m (ค่าประมาณจากการจับความชันที่ 10 m)'),
    profileTop_m: P(300, 'm', 'environment', ['W5'], 'ต่ำ', true, 'ค่าประมาณ: เหนือระดับนี้ใช้ลมคงที่ (โค้ดเดิม clamp 300 m); MathWorks ระบุช่วงใช้ได้ 3-1000 ft')
  },
  turbulence: {
    spec: P({ default: 'MIL-F-8785C-Dryden', options: ['MIL-F-8785C-Dryden', 'MIL-HDBK-1797-Dryden', 'vonKarman-rational'] }, '-', 'sim', ['W1', 'W2'], 'สูง', false, 'สองสเปกให้ transfer function เดียวกันเมื่อแทนค่า L ของแต่ละสเปก (1797: Lw = h/2)'),
    W20_by_severity: P({ light: 15, moderate: 30, severe: 45 }, 'kt', 'environment', ['W1', 'W7'], 'สูง', false, 'ความเร็วลมที่ 20 ft ที่ใช้กำหนดความรุนแรงความปั่นป่วนระดับต่ำ'),
    sigmaW_over_W20: P(0.1, '-', 'environment', ['W1', 'W7'], 'สูง', false, 'σw = 0.1·W20 ต่ำกว่า 1000 ft'),
    lowAlt_coeffs: P({ a: 0.177, b_per_ft: 0.000823, L_exp: 1.2, sigma_exp: 0.4, hMin_ft: 10, hMax_ft: 1000 }, 'ft', 'environment', ['W1', 'W7'], 'สูง', false, 'Lu = Lv = h/(a+b·h)^1.2, Lw = h (8785C); σu/σw = σv/σw = 1/(a+b·h)^0.4; h ตัดที่ 10 ft'),
    highAlt_L_ft: P({ dryden: 1750, vonKarman: 2500, blendFrom_ft: 1000, blendTo_ft: 2000 }, 'ft', 'environment', ['W1', 'W2', 'W7'], 'สูง', false, 'เหนือ 2000 ft ใช้ L คงที่และ σu = σv = σw จากตาราง POE; 1000-2000 ft ผสมเชิงเส้น'),
    highAlt_sigma_POE: P({ axes: { prob: [2e-1, 1e-1, 1e-2, 1e-3, 1e-4, 1e-5, 1e-6], alt_ft: [500, 1750, 3750, 7500, 15000, 25000, 35000, 45000, 55000, 65000, 75000, 80000] }, data: [
      [3.2, 2.2, 1.5, 0, 0, 0, 0, 0, 0, 0, 0, 0], [4.2, 3.6, 3.3, 1.6, 0, 0, 0, 0, 0, 0, 0, 0], [6.6, 6.9, 7.4, 6.7, 4.6, 2.7, 0.4, 0, 0, 0, 0, 0], [8.6, 9.6, 10.6, 10.1, 8, 6.6, 5, 4.2, 2.7, 0, 0, 0],
      [11.8, 13, 16, 15.1, 11.6, 9.7, 8.1, 8.2, 7.9, 4.9, 3.2, 2.1], [15.6, 17.6, 23, 23.6, 22.1, 20, 16, 15.1, 12.1, 7.9, 6.2, 5.1], [18.7, 21.5, 28.4, 30.2, 30.7, 31, 25.2, 23.1, 17.5, 10.7, 8.4, 7.2]] },
      'ft/s', 'environment', ['W7', 'W1'], 'กลาง', false, 'ตาราง Fig. 7 ของ MIL-F-8785C ตามที่ JSBSim ถอดไว้; การจับคู่แถว↔ความน่าจะเป็นอนุมานจากลำดับและ light=1e-2, moderate=1e-3, severe=1e-5'),
    rotary: P({ sigmaP_coeff: 0.954, tauP_k: 4, tauQ_k: 4, tauR_k: 3 }, 'σp = k·σw/(Lw·b²)^(1/3); τ = k·b/(π·V)', 'environment', ['W1', 'W3'], 'กลาง', true, 'สัมประสิทธิ์ 0.954 อินทิเกรตจากสเปกตรัม p_g ของ 8785C (ค่าประมาณที่คำนวณเอง ตรวจด้วยการอินทิเกรตเชิงตัวเลข)'),
    sigmaP_1797_simplified: P({ coeff: 1.9, Lp_div: 2.6 }, 'σp = 1.9σw/√(h·b); Lp = √(h·b)/2.6', 'environment', ['W3', 'W8'], 'กลาง', false, 'รูปย่อของ 1797/Yeager ที่ JSBSim ใช้; ให้ σp สูงกว่าสเปกตรัม 8785C 1.66 เท่าที่ h = 100 ft, b = 10.2 m'),
    verticalTaper_m: P(3, 'm', 'sim', [], 'ต่ำ', true, 'ค่าประมาณ: ลด σw เชิงเส้นเฉพาะต่ำกว่า 3 m (โค้ดเดิมใช้ 15 m ซึ่งไม่มีในสเปก)'),
    dt_s: P(0.0041667, 's', 'sim', [], 'สูง', false, '1/240 s ตาม RK4 ของโมเดล; ใช้การ discretize แบบ exact จึงไม่ขึ้นกับ dt')
  },
  discreteGust: {
    cfr25_341: P({ Uref_SL_ftps_EAS: 56, Uref_15000ft: 44, Uref_60000ft: 20.86, H_min_ft: 30, H_max_ft: 350, H_ref_ft: 350, exponent: 0.16667, VD_factor: 0.5 }, 'ft/s EAS, ft', 'environment', ['W9'], 'สูง', false, 'U = (Uds/2)(1-cos(πs/H)), 0≤s≤2H; Uds = Uref·Fg·(H/350)^(1/6)'),
    cfr25_341_Fg: P({ Fgz: '1 - Zmo/250000', Fgm: 'sqrt(R2*tan(pi*R1/4))', Fg: '0.5*(Fgz+Fgm)' }, '-', 'aircraft', ['W9'], 'สูง', false, 'ต้องใช้ MLW/MTOW, MZFW/MTOW และ Zmo ของแต่ละแบบ (รอบถัดไปสำหรับ A320/737)'),
    milspec_8785C: P({ shape: 'Vm/2*(1-cos(pi*x/dm)) for 0<=x<=dm, Vm beyond', default_dm_m: [120, 120, 80], default_Vm_mps: [3.5, 3.5, 3.0] }, 'm, m/s', 'environment', ['W4'], 'กลาง', false, 'ค่า default ของ MathWorks ไม่ใช่ค่าบังคับของสเปก'),
    etso_c117b_nuisance: P({ A_kt: 7.5, omega_radps: [2.10, 1.26, 0.78, 0.63, 0.52, 0.42, 0.31] }, 'kt, rad/s', 'environment', ['W11'], 'กลาง', false, 'gust แนวราบ A(1-cos ωt) ~15 kt; ระบบเตือน wind shear ต้องไม่เตือน (หน่วยของ A อนุมานว่า kt)')
  },
  microburst: {
    OB_relations: P({ zm_over_zstar: 0.22, zstar_over_eps: 12.5, rpeak_over_R: 1.1212, umax_over_lambdaR: 0.2357 }, '-', 'environment', ['W13', 'W11'], 'สูง', false, 'ตรวจด้วย Node: ln(12.5)/11.5 = 0.2196, argmax (1-e^-x²)/x = 1.121, 0.5·0.6382·0.7385 = 0.2357'),
    Vicroy: P({ alpha: 2, c1c2_TM104053: [-0.22, -2.75], c1c2_1992: [-0.15, -3.2175] }, '-', 'environment', ['W14', 'W15'], 'กลาง', false, 'ทั้งสองชุดทำให้ ∂u/∂z = 0 ที่ z = zm (c1·e^c1 ≈ c2·e^c2)'),
    etso_sets: P({ axes: { col: ['R_ft', 'umax_ftps', 'zm_ft', 'xc_rel_touchdown_ft'] }, data: [[920, 37, 98, -9000], [1180, 47.6, 98, -14000], [2070, 58.4, 131, -4000], [4430, 68.9, 164, 1000], [9010, 72.2, 262, 1000], [3450, 88.2, 197, -4000], [3180, 53.1, 262, 1000], [1640, 46, 164, -4000], [5250, 81.3, 197, 1000], [1250, 67.6, 100, -4000]] }, 'ft, ft/s', 'environment', ['W11'], 'สูง', false, 'ชุดทดสอบ ETSO-C117b App. 2 (โมเดล TM-100632); เริ่ม 1500 ft บน 3°'),
    training_sets_trainer: P({ axes: { col: ['R_m', 'umax_mps', 'zm_m', 'xc_before_TD_m', 'Fbar_1km_95kt'] }, data: [[600, 6, 50, 2000, 0.094], [600, 8, 50, 2000, 0.126], [600, 12, 50, 2000, 0.190]] }, 'm, m/s', 'sim', ['W13', 'W16'], 'กลาง', true, 'ค่าประมาณที่ออกแบบเอง: light/moderate/severe สำหรับเครื่องฝึกที่ 95 kt; (Tmax-D)/W ของเครื่องฝึก ≈ 0.218'),
    translation_mps: P(0, 'm/s', 'environment', [], 'ต่ำ', true, 'ค่าประมาณ: เริ่มแบบนิ่ง (โมเดลทั้งสองเป็น steady); เพิ่มการเคลื่อนที่ไปกับลมเฉลี่ยภายหลัง')
  },
  fFactor: {
    avgLength_m: P(1000, 'm', 'sim', ['W16', 'W15'], 'สูง', false, 'เฉลี่ย F ตามระยะทาง 1 km'),
    hazardThreshold: P(0.1, '-', 'sim', ['W16'], 'กลาง', false, 'FAA ถือว่าอันตรายเมื่อ F เฉลี่ย 1 km > 0.1'),
    predictiveMustAlert: P(0.13, '-', 'sim', ['W16'], 'กลาง', false, 'must-alert ของระบบพยากรณ์ล่วงหน้า'),
    reactiveFloor: P({ default: 0.105, approachMode: 0.09, takeoffMode: 0.12, fav_dV_kt: 20 }, '-', 'sim', ['W11'], 'สูง', false, 'f_av,x = ΔV/(g·t_x) กับ ΔV = 20 kt; 0.105 ที่ t_x = 10 s'),
    trainerExcessTW: P(0.218, '-', 'aircraft', [], 'กลาง', true, 'ค่าประมาณจากโมเดลปัจจุบัน: (Tmax-D)/W ที่ 95 kt แฟลปเต็ม ล้อลง ISA+16')
  },
  wake: {
    b0_over_b: P(0.7854, '-', 'aircraft', ['W19'], 'สูง', false, 'π/4 สำหรับการกระจายแรงยกแบบวงรี'),
    rc_over_b: P({ default: 0.035, min: 0.02, max: 0.06 }, '-', 'aircraft', ['W19', 'W24'], 'กลาง', false, 'รัศมีแกนวน; 0.035 b ตามตัวอย่าง NASA'),
    decay_SwitzerProctor: P({ Tss_a: 1.27, Tss_b: 0.57, Tss_N: 1.15, beta1: 0.75, alpha: 2.7, C1: 0.08 }, '-', 'environment', ['W20'], 'ต่ำ', false, 'อ่านจาก OCR ของ AIAA 2002-0945: Tss = -(1.27 ln ε* + 0.57)exp(-1.15N*); ใช้รูป tanh step; ต้องตรวจกับต้นฉบับ'),
    epsilon_presets: P({ calm: 1e-4, light: 1e-3, moderate: 1e-2 }, 'm2/s3', 'environment', [], 'ต่ำ', true, 'ค่าประมาณ: eddy dissipation rate สำหรับ scenario'),
    groundEffect: P({ imageFrom_b0: 1.5, minHeight_b0: 0.5, reboundMax_b0: 2.0 }, 'b0', 'environment', ['W21'], 'กลาง', false, 'เริ่ม image vortex ที่ 1.5 b0; rebound สูงสุดราว 2 b0 (2.6 b0 เมื่อมี shear)'),
    leaders: P({ A320ceo: { mass_kg: 64500, span_m: 35.8, Vapp_kt: 137, Gamma0_m2ps: 283.4, w0_mps: 1.604 }, B737_800W: { mass_kg: 66361, span_m: 35.79, Vapp_kt: 142, Gamma0_m2ps: 281.4, w0_mps: 1.593 } }, 'kg, m, kt, m2/s, m/s', 'aircraft', ['W31', 'W32'], 'กลาง', true, 'มวล = MLW, ρ = 1.1262 kg/m³ (1000 ft, 31°C); Vapp ของ A320 เป็นค่าประมาณ'),
    trainerRollControl: P({ Clda: 0.16, daMax_deg: 20, ClMax: 0.0559, ratio1_Gamma_m2ps: 56.5 }, '-', 'aircraft', [], 'กลาง', true, 'ค่าประมาณ: strip theory, ปีกเรียว 0.6, CLα 4.8/rad, 95 kt, อยู่กลางแกนวน'),
    hazardBankLimit_deg: P(10, 'deg', 'sim', ['W24'], 'กลาง', false, 'เกณฑ์ bank angle ที่ใช้กำหนดขอบเขตอันตรายใกล้พื้นใน NASA TM-110223'),
    separation_NM: P({ ICAO_Doc4444: { HEAVY_LIGHT: 6, MEDIUM_LIGHT: 5, HEAVY_MEDIUM: 5, HEAVY_HEAVY: 4, A380_LIGHT: 8 }, RECAT_EU: { D_F: 5, E_F: 4, F_F: 3, B_F: 7, A_F: 8 }, FAA_CWT: { F_I: 4 } }, 'NM', 'environment', ['W25', 'W27'], 'กลาง', false, 'ค่าระยะห่างขณะ approach; ตำแหน่งเซลล์บางช่องอนุมานจากข้อความที่ถอด')
  }
} };
console.log(JSON.stringify(J, null, 1));
