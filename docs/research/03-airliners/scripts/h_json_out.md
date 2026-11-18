{
 "a330_300": {
  "_na": {"v":["propeller.*","turboprop.*","interference.slipstream.*","aero.spin_reference.*","gear.certification.part23_limit_descent","gear.certification.part23_wing_lift_ratio","gear.certification.part23_min_load_factors","gear.certification.part23_reserve_drop_factor","wind.fFactor.trainerExcessTW","wind.wake.trainerRollControl","validation.procedures.v50MinFactor_singleEngine","validation.currentModel.*","validation.typicalModes.*"],"u":"-","scope":"aircraft","src":[],"conf":"สูง","est":false,"note":"เจ็ตสองเครื่องยนต์ไม่มีใบพัดและ slipstream; ไม่จำลอง spin; การรับรองล้อเป็น Part 25; ค่าเฉพาะของเครื่องฝึกไม่ใช้ ให้ใช้ validation.reference_modes และ validation.trim_targets แทน"},
  "airframe": {
   "identity": {"v":{"manufacturer":"Airbus S.A.S.","model":"A330-300","variant":"A330-343 (ATSB: AirAsia X ใช้ A330-343X; HS-XTC เป็น A330-343E)","engine":"Rolls-Royce Trent 772B-60 (Trent 700) สองเครื่อง","icao":"A333","seats":{"XJ_P_E":[12,365],"XJ_total":377,"XJ_all_economy":367,"XJ_C18_Y345_from_Dec2025":363,"airbus_typical":"250-290","max_exit":440},"operatorsDMK":[{"airline":"Thai AirAsia X (XJ/TAX)","fleet":{"wikipedia_2025_08":11,"capa_2024_12_31":10},"base":"DMK"}]},"u":"-","scope":"aircraft","src":["H10","H27","H28","H9","H11","H2","H3"],"conf":"กลาง","est":false,"note":"รุ่นเครื่องยนต์ของฝูงบินไทยอนุมานจากกลุ่ม AirAsia X (ATSB) และ TCDS ที่ให้ A330-343 ใช้ Trent 768-60/772B-60/772C-60; รุ่น 772B-60 ของ HS-XT* ยังไม่ยืนยันรายลำ; จำนวนลำต่างกันตามวันที่ (หัวข้อรอบ 5 เขียน 6 ลำที่ยังบิน)"},
   "weights": {
    "MTW": {"v":{"WV000":212900,"WV022":233900,"WV052":233900,"WV054":235900,"WV080":238900,"WV081":242900,"WV083":240900},"u":"kg","scope":"aircraft","src":["H1"],"conf":"สูง","est":false,"note":"Maximum ramp weight; AC 2-1-1 Jul 01/23 มี 37 WV ของ A330-300"},
    "MTOW": {"v":{"WV000":212000,"WV022":233000,"WV052":233000,"WV054":235000,"WV080":238000,"WV081":242000,"WV083":240000},"u":"kg","scope":"aircraft","src":["H1","H3"],"conf":"สูง","est":false,"note":"WV081 533,519 lb; WV000 467,380 lb"},
    "MLW": {"v":{"WV000":174000,"WV022":187000,"WV052":187000,"WV054":187000,"WV080":187000,"WV081":187000,"WV083":187000},"u":"kg","scope":"aircraft","src":["H1"],"conf":"สูง","est":false,"note":"187,000 kg = 412,264 lb; OpenAP 188,000 (ขัดแย้ง ใช้ AC)"},
    "MZFW": {"v":{"WV000":164000,"WV022":175000,"WV052":175000,"WV054":173000,"WV080":175000,"WV081":171000,"WV083":173000},"u":"kg","scope":"aircraft","src":["H1"],"conf":"สูง","est":false,"note":"WV082 และ WV055 เป็น dynamic payload (171 ถึง 175 t และ 173 ถึง 175 t)"},
    "OEW": {"v":{"jenkinson_1999":118189,"openap":122780},"u":"kg","scope":"aircraft","src":["H5","H12"],"conf":"กลาง","est":false,"note":"ค่าในหนังสือ/ฐานข้อมูล ไม่ใช่ของ Thai AirAsia X"},
    "default_sim": {"v":{"MTW":242900,"MTOW":242000,"MLW":187000,"MZFW":171000},"u":"kg","scope":"aircraft","src":["H1","H3","H29"],"conf":"ต่ำ","est":true,"note":"เลือก WV081 (MTOW 242 t ตาม Facts & Figures; ตัวเลือก 242 t ส่งมอบครั้งแรกปี 2015) เพราะไม่พบ WV ของ Thai AirAsia X; MLW 187 t เป็นค่าสูงสุดของ A330-300 (WV022, 031, 033, 035, 039, 051 ถึง 056, 058, 080 ถึง 083)"},
    "max_fuel": {"v":{"usable_L":97530,"kg_at_0p785":76561},"u":"L, kg","scope":"aircraft","src":["H1"],"conf":"สูง","est":false,"note":"25,765 US gal; Jenkinson 98,250 L; OpenAP mfc 139,000 (หน่วยไม่ระบุ ขัดแย้ง ไม่ใช้)"},
    "min_weight": {"v":121000,"u":"kg","scope":"aircraft","src":["H20"],"conf":"ต่ำ","est":false,"note":"การ์ดทบทวนนักบิน (สำเนาไม่เป็นทางการ)"}
   },
   "cg": {
    "LEMAC_x": {"v":28.95,"u":"m STA","scope":"aircraft","src":["D4","H2"],"conf":"ต่ำ","est":true,"note":"ไม่พบในแหล่งสาธารณะ; = CG อ้างอิง 30.77 m STA ของหัวข้อ 5 (ล้อหน้ารับ 8 %) − 0.25 × 7.27 (h_speeds_perf.mjs)"},
    "MAC": {"v":7.27,"u":"m","scope":"aircraft","src":["H2","H5","H12"],"conf":"สูง","est":false,"note":"TCDS (ส่วน A330-200 ปีกเดียวกัน) \"MAC: 7,270m\" = 286.2 in; Jenkinson/OpenAP 7.26"},
    "datum": {"v":{"A330_200_fwd_of_nose_m":6.382,"A330_300":null},"u":"m","scope":"aircraft","src":["H2"],"conf":"กลาง","est":false,"note":"TCDS ส่วน A330-200 \"Station 0.0, located 6,382 meters forward of aeroplane nose\"; ส่วน A330-300 อ่านไม่ได้"},
    "fwd_limit_pctMAC": {"v":{"TSB_CGHLM_takeoff_221t":23.8,"AF447_takeoff_233t_A330_203":23.3},"u":"%MAC","scope":"aircraft","src":["H6","H7"],"conf":"กลาง","est":false,"note":"เป็น CG จริงในรายงาน ไม่ใช่ขีดจำกัด; TCDS ให้ \"Refer to approved AFM\"; ซอง CG ไม่พบในแหล่งสาธารณะ"},
    "aft_limit_pctMAC": {"v":{"AF447_cruise_205t":28.7,"QF72_cruise_185t_refdist":28.2},"u":"%MAC","scope":"aircraft","src":["H7","H8"],"conf":"กลาง","est":false,"note":"CG จริงในรายงาน (QF72 ใช้คำว่า reference distance); ขีดจำกัดท้ายไม่พบ"},
    "ref_pctMAC": {"v":25,"u":"%MAC","scope":"aircraft","src":["H2"],"conf":"สูง","est":true,"note":"ข้อตกลงรอบที่ 3; กรณีทดสอบพลวัตใช้ 28 %"}
   },
   "inertia": {
    "ref_mass": {"v":187000,"u":"kg","scope":"aircraft","src":["H1"],"conf":"ต่ำ","est":true,"note":"MLW"},
    "Ixx": {"v":15810000,"u":"kg m2","scope":"aircraft","src":["L23","L13","H17"],"conf":"ต่ำ","est":true,"note":"m (Rx b/2)², Rx 0.305, b 60.30 (h_inertia.mjs); ±25 %"},
    "Iyy": {"v":41140000,"u":"kg m2","scope":"aircraft","src":["L23","L13"],"conf":"ต่ำ","est":true,"note":"m (Ry L/2)², Ry 0.466, L 63.66; ถ้าใช้ Ry ระดับ B747 (~0.35 ถึง 0.39) จะต่ำลง 30 ถึง 45 %"},
    "Izz": {"v":54130000,"u":"kg m2","scope":"aircraft","src":["L23","L13"],"conf":"ต่ำ","est":true,"note":"m (Rz e/2)², Rz 0.549, e = (b + L)/2"},
    "Ixz": {"v":0,"u":"kg m2","scope":"aircraft","src":["H16","H17"],"conf":"ต่ำ","est":true,"note":"แกนตัวเครื่อง (FG A330 0; JSBSim B747 −970,000 slug ft²); แกน stability ที่ α 5°: −3.33e6"},
    "radii": {"v":{"Rx":0.305,"Ry":0.466,"Rz":0.549},"u":"-","scope":"aircraft","src":["L23","L13","L45","H17"],"conf":"ต่ำ","est":true,"note":"รัศมีของ A320 (หัวข้อ 3) ใช้กับขนาด A330; B747 JSBSim Rx 0.287 ถึง 0.316 สนับสนุน Rx; FG A330 (0.191/0.263/0.253, Izz < Iyy) ตัดทิ้ง"},
    "source_values": {"v":{"fg_a330_empty":{"m":97069,"Ixx":3221000,"Iyy":6785000,"Izz":5978000},"jsbsim_b747":{"m_empty":237600,"Ixx":24676000,"Iyy":44877000,"Izz":67384000,"Ixz":-1315000}},"u":"kg, kg m2","scope":"aircraft","src":["H16","H17"],"conf":"ต่ำ","est":false,"note":"แปลงจาก slug ft² และ lb"}
   },
   "wing": {
    "S": {"v":361.6,"u":"m2","scope":"aircraft","src":["H12","H16","H5"],"conf":"สูง","est":false,"note":"3,892 ft²; Jenkinson 363.1"},
    "b": {"v":60.3,"u":"m","scope":"aircraft","src":["H3","H2"],"conf":"สูง","est":false,"note":"197 ft 10 in (รวม winglet); Jenkinson 58.0 (ไม่รวม)"},
    "MAC": {"v":7.27,"u":"m","scope":"aircraft","src":["H2"],"conf":"สูง","est":false,"note":""},
    "AR": {"v":{"geometric_b60p3":10.056,"jenkinson":9.26},"u":"-","scope":"aircraft","src":["H5"],"conf":"สูง","est":true,"note":"b²/S"},
    "taper": {"v":0.251,"u":"-","scope":"aircraft","src":["H5"],"conf":"กลาง","est":false,"note":""},
    "sweep_c4_deg": {"v":29.7,"u":"deg","scope":"aircraft","src":["H5","H12"],"conf":"สูง","est":false,"note":""},
    "dihedral_deg": {"v":5,"u":"deg","scope":"aircraft","src":["L13"],"conf":"ต่ำ","est":true,"note":"ไม่พบ; ใช้ระดับเดียวกับ A320 (5.1° ใน FBW cfg)"},
    "incidence_deg": {"v":1.03,"u":"deg","scope":"aircraft","src":["H16"],"conf":"ต่ำ","est":false,"note":"ค่าใน FlightGear metrics"},
    "twist_deg": {"v":null,"u":"deg","scope":"aircraft","src":["H12"],"conf":"ต่ำ","est":true,"note":"ไม่พบในแหล่งสาธารณะ"},
    "airfoil": {"v":{"tc_avg":0.11,"type":"supercritical"},"u":"-","scope":"aircraft","src":["H12","H13"],"conf":"กลาง","est":false,"note":"OpenAP t/c 0.11; drag.py ถือว่าเป็น supercritical (kappa 0.95)"},
    "flap": {"v":{"type":"Fowler (S2 = slotted ช่องเดียวตาม Jenkinson; OpenAP เขียน double-slotted) + slats","span_ratio":0.665,"cf_c":0.15,"Sf_S":0.15,"lambda_f":0.9},"u":"-","scope":"aircraft","src":["H5","H12","H25"],"conf":"กลาง","est":false,"note":"ชนิดแฟลปขัดแย้งระหว่างแหล่ง (ดูส่วนความขัดแย้ง)"}
   },
   "tail": {
    "S_h": {"v":72.9,"u":"m2","scope":"aircraft","src":["H5"],"conf":"กลาง","est":false,"note":"span 19.06 m, AR 4.98, taper 0.36, sweep 30°; FG 222 ft² (20.6 m²) ผิดลำดับ"},
    "l_h": {"v":28.6,"u":"m","scope":"aircraft","src":["H5"],"conf":"กลาง","est":false,"note":"V_H = 0.793"},
    "b_h": {"v":19.06,"u":"m","scope":"aircraft","src":["H5"],"conf":"กลาง","est":false,"note":""},
    "S_v": {"v":45.2,"u":"m2","scope":"aircraft","src":["H5"],"conf":"กลาง","est":false,"note":"height 8.45 m, AR 1.58, taper 0.35, sweep 45°; FG 496 ft² (46.1 m²)"},
    "l_v": {"v":27.5,"u":"m","scope":"aircraft","src":["H5"],"conf":"กลาง","est":false,"note":"V_V = 0.057"},
    "b_v": {"v":8.45,"u":"m","scope":"aircraft","src":["H5"],"conf":"กลาง","est":false,"note":""}
   }
  },
  "aero": {
   "ref": {
    "S": {"v":361.6,"u":"m2","scope":"aircraft","src":["H12"],"conf":"สูง","est":false,"note":""},
    "b": {"v":60.3,"u":"m","scope":"aircraft","src":["H3"],"conf":"สูง","est":false,"note":""},
    "c": {"v":7.27,"u":"m","scope":"aircraft","src":["H2"],"conf":"สูง","est":false,"note":""}
   },
   "static_long": {
    "CL0": {"v":{"CONF0":0.116,"CONF1":0.129,"CONF1+F":0.429,"CONF2":0.614,"CONF3":0.782,"FULL":1.001},"u":"-","scope":"aircraft","src":["H8","H6","H5"],"conf":"ต่ำ","est":true,"note":"CONF0 ยึดกับ QF72 (α 2.5° ที่ M0.82) แล้วคูณ β; CONF อื่น = CLmax + 0.10 − CLα α* (h_aero_modes.mjs)"},
    "CLalpha": {"v":{"M0p21":5.072,"M0p82":6.654},"u":"1/rad","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":"DATCOM ทั้งลำ (ปีก 4.563, หาง 3.885, dε/dα 0.278)"},
    "CLmax_target": {"v":{"CONF0":1.26,"CONF1":1.8,"CONF1+F":2.1,"CONF2":2.24,"CONF3":2.32,"FULL":2.45},"u":"-","scope":"aircraft","src":["H5","H6","H4"],"conf":"ต่ำ","est":true,"note":"FULL จาก Jenkinson Vapp 136 kt = VLS ที่ 179 t; CONF2 จาก V2 144 kt = 1.13 VS1g ที่ 217 t; CONF0 = A320 × cosΛ; ที่เหลือแทรกค่า; S 361.6"},
    "alpha_star": {"v":{"CONF0":14.05,"CONF1":20,"CONF1+F":20,"CONF2":19.5,"CONF3":18.5,"FULL":17.5},"u":"deg","scope":"aircraft","src":["H6","H8"],"conf":"ต่ำ","est":true,"note":"รูปแบบ A320 แล้วเลื่อน +2° ให้ตรงจุด lift-off ของ TSB (152 kt, 13.7°)"},
    "alpha_CLmax": {"v":{"CONF0":14.05,"CONF1":20,"CONF1+F":20,"CONF2":19.5,"CONF3":18.5,"FULL":17.5},"u":"deg","scope":"aircraft","src":["H6"],"conf":"ต่ำ","est":true,"note":"เท่ากับ alpha_star ในแบบจำลองนี้"},
    "Cmalpha": {"v":{"approach_cg28":-0.963,"cruise_M0p82_cg28":-1.072},"u":"1/rad","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":"Cmα = −CLα (h_n − h_cg)"},
    "neutral_point_pctMAC": {"v":{"M0p21":47,"M0p82":44.1},"u":"%MAC","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":"build-up DATCOM แบบย่อ"}
   },
   "flaps": {
    "detents": {"v":[{"name":"CONF0","slat_deg":null,"flap_deg":0,"VFE_kt":null,"dCL0":0,"dCD0":0,"dCm0":null,"CLmax":1.26},{"name":"CONF1","slat_deg":null,"flap_deg":0,"VFE_kt":240,"dCL0":0.013,"dCD0":0.004,"dCm0":null,"CLmax":1.8},{"name":"CONF1+F","slat_deg":null,"flap_deg":8,"VFE_kt":215,"dCL0":0.313,"dCD0":0.01,"dCm0":null,"CLmax":2.1},{"name":"CONF2","slat_deg":null,"flap_deg":14,"VFE_kt":196,"dCL0":0.498,"dCD0":0.02,"dCm0":null,"CLmax":2.24},{"name":"CONF3","slat_deg":null,"flap_deg":22,"VFE_kt":186,"dCL0":0.666,"dCD0":0.03,"dCm0":null,"CLmax":2.32},{"name":"FULL","slat_deg":null,"flap_deg":32,"VFE_kt":180,"dCL0":0.885,"dCD0":0.05,"dCm0":null,"CLmax":2.45}],"u":"deg, kt IAS, -","scope":"aircraft","src":["H20","H16"],"conf":"ต่ำ","est":true,"note":"VFE จากการ์ดทบทวน (240/215/196/186/180; CONF2* 205 สำหรับวิ่งขึ้น) conf กลาง; มุมแฟลปไม่พบในแหล่งปฐมภูมิ (ค่าในตารางเป็นค่าประมาณ ไม่ยืนยัน); FG ใช้แฟลปเต็ม 35° สแลตเต็ม 27°"},
    "transition_time_s": {"v":{"flaps_full_travel":30,"slats_full_travel":20},"u":"s","scope":"aircraft","src":["H16"],"conf":"ต่ำ","est":false,"note":"จากอัตราใน FG: แฟลป 35° ÷ 1.1667°/s, สแลต 27° ÷ 1.35°/s"}
   },
   "polar": {
    "CD0_clean": {"v":0.022,"u":"-","scope":"aircraft","src":["H12","H15"],"conf":"กลาง","est":false,"note":"OpenAP (Sun et al.); FG 0.0125"},
    "K_by_flap": {"v":{"CONF0":0.041,"CONF1":0.0406,"CONF1+F":0.0422,"CONF2":0.044,"CONF3":0.044,"FULL":0.0452},"u":"-","scope":"aircraft","src":["H12","L21"],"conf":"ต่ำ","est":true,"note":"clean 0.041 (OpenAP e 0.773); แฟลปใช้ e ตามรูปแบบ A320"},
    "dCD0_by_flap": {"v":{"CONF0":0,"CONF1":0.004,"CONF1+F":0.01,"CONF2":0.02,"CONF3":0.03,"FULL":0.05},"u":"-","scope":"aircraft","src":["L21","H13"],"conf":"ต่ำ","est":true,"note":"รูปแบบ A320 ของหัวข้อ 3; สูตร OpenAP drag.py ให้เพียง 0.002/0.0022/0.0026/0.0034/0.0048 (ต่ำเกิน)"}
   },
   "gear_drag": {
    "dCD0": {"v":0.014,"u":"-","scope":"aircraft","src":["H12","H13"],"conf":"กลาง","est":false,"note":"OpenAP; สูตร Mair & Birdsall ใน drag.py ที่ MTOW 242 t ได้ 0.0144; FG 0.0175"}
   },
   "mach": {
    "Mcrit": {"v":{"CL0p5":0.764},"u":"-","scope":"aircraft","src":["H13","H12"],"conf":"ต่ำ","est":true,"note":"Korn: 0.95/cosΛ − 0.11/cos²Λ − 0.1 CL/cos³Λ − 0.108"},
    "MDD": {"v":0.864,"u":"-","scope":"aircraft","src":["H13"],"conf":"ต่ำ","est":true,"note":"ΔCDw = 0.002 ที่ M = Mcrit + 0.1; MMO 0.86"},
    "CD_wave_table": {"v":{"axes":{"mach":[0.74,0.78,0.8,0.82,0.84,0.86,0.88]},"data":[0,0,0.00004,0.0002,0.00068,0.00173,0.00367]},"u":"-","scope":"aircraft","src":["H13"],"conf":"ต่ำ","est":true,"note":"ที่ CL 0.5: 20 (M − Mcrit)^4"},
    "CLalpha_vs_Mach": {"v":{"axes":{"mach":[0.2,0.4,0.5,0.6,0.7,0.76,0.8,0.82,0.86]},"data":[5.065,5.274,5.45,5.694,6.035,6.308,6.529,6.654,6.943]},"u":"1/rad","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":"DATCOM Helmbold กับ β"}
   },
   "derivatives": {
    "CLq": {"v":{"approach":5.55,"cruise":6.98},"u":"1/rad (c/2V)","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":"2 η a_t V_H"},
    "CLadot": {"v":{"approach":1.54,"cruise":2.59},"u":"1/rad (c/2V)","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":"CLq dε/dα"},
    "CLde": {"v":{"approach":0.352,"cruise":0.443},"u":"1/rad","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":"τe 0.50"},
    "CD0": {"v":0.022,"u":"-","scope":"aircraft","src":["H12"],"conf":"กลาง","est":false,"note":"clean"},
    "K": {"v":0.041,"u":"-","scope":"aircraft","src":["H12"],"conf":"กลาง","est":false,"note":"clean"},
    "CYb": {"v":{"approach":-0.505,"cruise":-0.547},"u":"1/rad","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":"FG −0.609"},
    "CYp": {"v":{"approach":0.04,"cruise":0.064},"u":"1/rad (b/2V)","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":""},
    "CYr": {"v":{"approach":0.314,"cruise":0.35},"u":"1/rad (b/2V)","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":""},
    "CYdr": {"v":{"approach":0.196,"cruise":0.22},"u":"1/rad","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":"τr 0.58 (ปรับให้ VMCA ≈ 122 kt)"},
    "Clb": {"v":{"approach":-0.201,"cruise":-0.176},"u":"1/rad","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":"FG −0.1"},
    "Clp": {"v":{"approach":-0.483,"cruise":-0.638},"u":"1/rad (b/2V)","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":"FG −0.46"},
    "Clr": {"v":{"approach":0.265,"cruise":0.145},"u":"1/rad (b/2V)","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":""},
    "Clda": {"v":{"approach":0.135,"cruise":0.18},"u":"1/rad","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":"aileron ช่วง 0.66 ถึง 0.97 ของครึ่งปีก (ประมาณ) ไม่รวม spoiler"},
    "Cldr": {"v":{"approach":0.0115,"cruise":0.0186},"u":"1/rad","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":""},
    "Cmq": {"v":{"approach":-24,"cruise":-30.2},"u":"1/rad (c/2V)","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":"FG −37.2"},
    "Cmadot": {"v":{"approach":-6.06,"cruise":-10.18},"u":"1/rad (c/2V)","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":""},
    "Cmde": {"v":{"approach":-1.387,"cruise":-1.744},"u":"1/rad","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":"−CLde l_h/c"},
    "CLih": {"v":{"approach":0.705},"u":"1/rad","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":"THS"},
    "Cmih": {"v":{"approach":-2.773},"u":"1/rad","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":"THS"},
    "Cnb": {"v":{"approach":0.046,"cruise":0.064},"u":"1/rad","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":"FG 0.139"},
    "Cnp": {"v":{"approach":-0.15,"cruise":-0.091},"u":"1/rad (b/2V)","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":""},
    "Cnr": {"v":{"approach":-0.197,"cruise":-0.171},"u":"1/rad (b/2V)","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":"FG −0.3"},
    "Cnda": {"v":{"approach":-0.031,"cruise":-0.013},"u":"1/rad","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":""},
    "Cndr": {"v":{"approach":-0.091,"cruise":-0.101},"u":"1/rad","scope":"aircraft","src":["H5","H20"],"conf":"ต่ำ","est":true,"note":"เครื่องหมายตามโค้ด (rudder บวก = จมูกซ้าย)"}
   },
   "legacy": {"v":{"CL0":0.116,"CLa":5.072,"CLflap":0.885,"CDflap":0.05,"CDgear":0.014,"CD0":0.022,"K":0.041,"Cm0":0.0722,"Cma":-0.963,"Cmflap":0.0243,"aStall":16.59,"aStallFlap":4.16,"flapMap":{"CONF0":0,"CONF1":0.015,"CONF1+F":0.354,"CONF2":0.563,"CONF3":0.753,"FULL":1},"CLq":5.55,"CLadot":1.54,"CLde":0.352,"Cmq":-24,"Cmadot":-6.06,"Cmde":-1.387},"u":"ตามนิยาม AC (deg สำหรับ aStall)","scope":"aircraft","src":["H5","H12","H8"],"conf":"ต่ำ","est":true,"note":"AC.flaps 1 = FULL; aStall/aStallFlap หาให้ max ของ blend (M 55) = CLmax CONF0/FULL; legacy ให้ CLmax CONF1 1.28 แทน 1.80 (สแลตแสดงไม่ได้); Cm0/Cmflap ให้ trim ที่ elevator 0 ทั้ง clean 250 kt และ FULL α 5.74°"}
  },
  "interference": {
   "downwash": {
    "deda": {"v":{"approach":0.278,"cruise":0.371},"u":"-","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":"DATCOM"},
    "l_t": {"v":28.6,"u":"m","scope":"aircraft","src":["H5"],"conf":"กลาง","est":false,"note":""},
    "VH": {"v":0.793,"u":"-","scope":"aircraft","src":["H5"],"conf":"กลาง","est":true,"note":"S_h l_h/(S c)"},
    "a_t": {"v":3.885,"u":"1/rad","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":"DATCOM AR 4.98"},
    "eta_t": {"v":0.9,"u":"-","scope":"aircraft","src":["L21"],"conf":"ต่ำ","est":true,"note":"ค่าตั้งต้นเดียวกับหัวข้อ 3"},
    "CLadot": {"v":1.54,"u":"1/rad","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":""},
    "Cmadot": {"v":-6.06,"u":"1/rad","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":""}
   },
   "groundEffect": {
    "CLa_w": {"v":4.563,"u":"1/rad","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":"ปีกอย่างเดียว M 0.21"},
    "A": {"v":10.056,"u":"-","scope":"aircraft","src":["H12","H3"],"conf":"สูง","est":true,"note":"b²/S"}
   }
  },
  "speeds": {
   "VMO_kt": {"v":330,"u":"kt CAS","scope":"aircraft","src":["H12","H5"],"conf":"กลาง","est":false,"note":"OpenAP และ Jenkinson; TCDS ให้ \"Refer to AFM\""},
   "MMO": {"v":0.86,"u":"-","scope":"aircraft","src":["H12","H5"],"conf":"กลาง","est":false,"note":"VD/MD 365 kt/0.93 (Jenkinson)"},
   "VLE_kt": {"v":{"kt":250,"mach":0.55},"u":"kt CAS","scope":"aircraft","src":["H20"],"conf":"ต่ำ","est":false,"note":"การ์ดทบทวน (สำเนาไม่เป็นทางการ)"},
   "VLO_kt": {"v":{"extension":250,"retraction":250,"mach":0.55},"u":"kt CAS","scope":"aircraft","src":["H20"],"conf":"ต่ำ","est":false,"note":"การ์ดทบทวน"},
   "VFE": {"v":{"CONF1":240,"CONF1+F":215,"CONF2_takeoff":205,"CONF2":196,"CONF3":186,"FULL":180},"u":"kt CAS","scope":"aircraft","src":["H20"],"conf":"กลาง","est":false,"note":"การ์ดทบทวน อ้าง FCOM; ไม่พบเอกสารปฐมภูมิ"},
   "VS1g": {"v":{"axes":{"mass_kg":[130000,150000,170000,187000,210000,242000],"flap":["CONF0","CONF1","CONF1+F","CONF2","CONF3","FULL"]},"data":[[131.4,109.9,101.8,98.5,96.8,94.2],[141.1,118.1,109.3,105.8,104,101.2],[150.2,125.7,116.4,112.7,110.7,107.7],[157.6,131.8,122.1,118.2,116.1,113],[167,139.7,129.3,125.2,123.1,119.8],[179.3,150,138.9,134.4,132.1,128.6]]},"u":"kt CAS","scope":"aircraft","src":["H5","H6"],"conf":"ต่ำ","est":true,"note":"sqrt(2 m g/(ρ0 S CLmax)), S 361.6, ISA SL, CAS ≈ EAS (h_speeds_perf.mjs)"},
   "VLS": {"v":{"axes":{"mass_kg":[130000,150000,170000,187000,210000,242000],"flap":["CONF3","FULL"]},"data":[[119.1,115.9],[127.9,124.5],[136.2,132.5],[142.8,139],[151.4,147.4],[162.5,158.2]]},"u":"kt CAS","scope":"aircraft","src":["H5","L9"],"conf":"ต่ำ","est":true,"note":"1.23 VS1g; ที่ 179 t FULL = 136.0 kt = Vapp ของ Jenkinson"},
   "VAPP_kt": {"v":{"axes":{"mass_kg":[130000,150000,170000,187000,210000,242000],"flap":["CONF3","FULL"]},"data":[[124.1,120.9],[132.9,129.5],[141.2,137.5],[147.8,144],[156.4,152.4],[167.5,163.2]]},"u":"kt CAS","scope":"aircraft","src":["L9"],"conf":"ต่ำ","est":true,"note":"VLS + 5 (A/THR on, ลมสงบ)"},
   "V2_kt": {"v":{"axes":{"mass_kg":[180000,200000,222700,242000],"flap":["CONF1+F","CONF2","CONF3"]},"data":[[135.4,131,128.7],[142.6,138.1,135.7],[150.5,145.8,143.2],[157,151.9,149.3]]},"u":"kt CAS","scope":"aircraft","src":["H22","H6"],"conf":"ต่ำ","est":true,"note":"V2min = 1.13 VS1g; V2 ใช้งานจริงสูงกว่าได้ (TSB 162 kt = 1.216 VS1g ที่ 222.7 t บนทางวิ่ง 4,000 m)"},
   "takeoff_typical": {"v":{"mass_kg":242000,"flap":"CONF2","V1":148,"VR":151.5,"V2":156.5,"TSB_CGHLM_222t_CONF1F":{"V1":156,"VR":157,"V2":162}},"u":"kt CAS","scope":"aircraft","src":["H6","H22"],"conf":"ต่ำ","est":true,"note":"V2 = 1.13 × 1.03 VS1g (ค่าประมาณ), VR = V2 − 5, V1 = VR − 3.5 (ค่าประมาณ); จุด TSB เป็นค่าจริงแต่ใช้ FLEX"},
   "VMCG_kt": {"v":120,"u":"kt CAS","scope":"aircraft","src":["H24","H20"],"conf":"ต่ำ","est":true,"note":"ไม่พบในแหล่งสาธารณะ; ≈ VMCA − 2 kt ตามความต่างของ A320 (หัวข้อ 3)"},
   "VMCA_kt": {"v":122,"u":"kt CAS","scope":"aircraft","src":["H24","H20"],"conf":"ต่ำ","est":true,"note":"ไม่พบ; ≈ VMCL 125 − 3 kt; build-up τr 0.58 ให้ 122.2 kt ที่แรงขับ 0.85 × 316.3 kN, rudder 30°, y_e 9.40 m"},
   "VMCL_kt": {"v":125,"u":"kt CAS","scope":"aircraft","src":["H20"],"conf":"ต่ำ","est":false,"note":"การ์ดทบทวน (สำเนาไม่เป็นทางการ)"},
   "crosswind_demonstrated_kt": {"v":{"takeoff_incl_gust":32,"landing_incl_gust":40},"u":"kt","scope":"aircraft","src":["H20"],"conf":"ต่ำ","est":false,"note":"\"Take Off 32 kt (gust included)\", \"Landing 40 kt (gust included) MAX demonstrated\" ตามการ์ดทบทวน; ไม่พบ AFM"},
   "tailwind_limit_kt": {"v":{"takeoff_landing":15,"autoland":10},"u":"kt","scope":"aircraft","src":["H20"],"conf":"ต่ำ","est":false,"note":"ขีดจำกัดทั่วไปที่ ≤ 11,000 ft"},
   "icao_approach_category": {"v":"C","u":"-","scope":"aircraft","src":["H4"],"conf":"สูง","est":false,"note":"Airbus ME1911189; VAT < 141 kt (แบบจำลองให้ VLS FULL ที่ 187 t = 139.0 kt)"}
  },
  "performance": {
   "TOFL_MTOW_ISA_SL": {"v":{"est_242t_trent772b":2737,"jenkinson_217t_cf6":2320},"u":"m","scope":"aircraft","src":["H5","J6"],"conf":"ต่ำ","est":true,"note":"2,320 × (242/217)² × (300/316.3) (h_speeds_perf.mjs) = 8,979 ft; Jenkinson ISA+20 2,680 m, 5,000 ft 3,840 m; AC 3-3 เป็นกราฟอ่านไม่ได้"},
   "LFL_MLW_ISA_SL": {"v":{"est_187t":1672,"jenkinson_179t":1600},"u":"m","scope":"aircraft","src":["H5"],"conf":"ต่ำ","est":true,"note":"certified (×1.667); สเกลตามน้ำหนัก 1,600 × 187/179 = 5,484 ft"},
   "landing_distance_actual_MLW": {"v":{"est_187t":1003,"est_179t":960},"u":"m","scope":"aircraft","src":["H5","H23"],"conf":"ต่ำ","est":true,"note":"LFL/1.667 (จาก 50 ft ถึงหยุด)"},
   "ROC_initial_fpm": {"v":1736,"u":"fpm","scope":"aircraft","src":["H14"],"conf":"ต่ำ","est":false,"note":"WRAP cl_vs_avg_pre_cas 8.82 m/s (ค่าสถิติ ADS-B ไม่ใช่สมรรถนะสูงสุด)"},
   "service_ceiling_ft": {"v":41010,"u":"ft","scope":"aircraft","src":["H12","H2"],"conf":"กลาง","est":false,"note":"OpenAP 12,500 m; TCDS ส่วน A330-200 FL 414.5"},
   "cruise_Mach": {"v":{"typical":0.82,"wrap_mean":0.81},"u":"-","scope":"aircraft","src":["H8","H12","H14"],"conf":"กลาง","est":false,"note":"QF72 M0.82 ที่ FL370"},
   "range_km": {"v":11750,"u":"km","scope":"aircraft","src":["H3"],"conf":"สูง","est":false,"note":"6,350 nm (Airbus)"},
   "max_fuel_kg": {"v":76561,"u":"kg","scope":"aircraft","src":["H1"],"conf":"สูง","est":false,"note":"97,530 L × 0.785"},
   "load_factor_limits": {"v":{"clean":[-1,2.5],"flaps":[0,2]},"u":"g","scope":"aircraft","src":["H20","H34"],"conf":"กลาง","est":false,"note":"การ์ดทบทวน; ตรงกับค่าต่ำสุดของ 14 CFR 25.337 (W > 50,000 lb: +2.5, −1.0) และ 25.345 (แฟลป +2.0)"},
   "tests": {"v":{"wrap_takeoff_distance_km":1.86,"wrap_liftoff_mps":89.9,"wrap_final_approach_mps":73,"wrap_touchdown_mps":71.5,"wrap_braking_distance_km":1.48,"wrap_braking_decel_mps2":-1.2},"u":"km, m/s, m/s2","scope":"aircraft","src":["H14"],"conf":"กลาง","est":false,"note":"ค่ามัธยฐานจาก ADS-B (OpenAP WRAP) เป็นความเร็วพื้น/อากาศรวมลม ไม่ใช่ค่าที่รับรอง"}
  },
  "validation": {
   "reference_modes": {
    "est_approach_FULL_187t": {"v":{"mass_kg":187000,"V_kt":144,"CG_pctMAC":28,"sp_wn":0.586,"sp_zeta":0.688,"CAP":0.102,"ph_T_s":43.4,"ph_zeta":0.007,"dr_wn":0.5,"dr_zeta":0.027,"dr_T_s":12.6,"roll_tau_s":0.99,"spiral_T_half_s":18.9},"u":"kg, kt, rad/s, -, s","scope":"aircraft","src":["H5","L23","L13"],"conf":"ต่ำ","est":true,"note":"โครงเครื่องเปล่า ไม่มี FBW และ yaw damper (h_aero_modes.mjs)"},
    "est_cruise_M082_FL370": {"v":{"mass_kg":185280,"sp_wn":0.931,"sp_zeta":0.51,"CAP":0.064,"ph_T_s":121.8,"ph_zeta":0.031,"dr_wn":0.656,"dr_zeta":0.041,"dr_T_s":9.6,"roll_tau_s":0.83,"spiral_T_half_s":57.8},"u":"kg, rad/s, -, s","scope":"aircraft","src":["H8","H5"],"conf":"ต่ำ","est":true,"note":"โครงเครื่องเปล่า สภาพของ QF72"}
   },
   "trim_targets": {
    "approach_FULL_VAPP_187t": {"v":{"mass_kg":187000,"V_kt":144,"gamma_deg":-3,"alpha_deg":5.74,"theta_deg":2.74,"CL":1.509,"CD":0.189,"thrust_total_kN":133.7,"sink_fpm":763},"u":"kg, kt, deg, -, kN, fpm","scope":"aircraft","src":["H5","H6"],"conf":"ต่ำ","est":true,"note":"ไม่พบมุม pitch ขณะ approach ของ A330 ในแหล่งสาธารณะ"},
    "cruise_QF72": {"v":{"mass_kg":185280,"FL":370,"mach":0.82,"CAS_kt":270,"CL":0.493,"alpha_deg":2.5,"alpha_range_src":[2,3],"q_Pa":10196,"drag_total_kN":118.5},"u":"kg, -, kt, deg, Pa, kN","scope":"aircraft","src":["H8"],"conf":"กลาง","est":true,"note":"α 2 ถึง 3° จาก ATSB (สูง); CL และแรงต้านเป็นค่าคำนวณ"},
    "V2_CONF2_242t": {"v":{"CL":1.754,"alpha_deg":12.88,"L_over_D":9.89,"OEI_gradient_pct":3.22},"u":"-, deg, %","scope":"aircraft","src":["H22","J6"],"conf":"ต่ำ","est":true,"note":"V2 = 1.13 VS1g, แรงขับเครื่องเดียว 316.3 kN"}
   },
   "anchors": {
    "TSB_C_GHLM_A330_343": {"v":{"mass_kg":221200,"CG_pctMAC":23.8,"conf":"CONF1+F","FLEX_C":48,"V1":156,"VR":157,"V2":162,"rotation_start_kt":133,"pitch_rate_dps":2.81,"tailstrike_pitch_deg":10.4,"liftoff_kt":152,"liftoff_pitch_deg":13.7},"u":"kg, %MAC, °C, kt, deg/s, deg","scope":"aircraft","src":["H6"],"conf":"สูง","est":false,"note":"หมุนก่อน VR 24 kt ทำให้หางแตะ"},
    "QF72_A330_303": {"v":{"mass_kg":185280,"cg_refdist_pct":28.2,"FL":370,"mach":0.82,"CAS_kt":270,"alpha_deg":[2,3],"elevator_deg":{"nose_up":30,"nose_down":15},"ths_deg":{"nose_up":14,"nose_down":2}},"u":"kg, %, kt, deg","scope":"aircraft","src":["H8"],"conf":"สูง","est":false,"note":"ATSB AO-2008-070"},
    "AF447_A330_203": {"v":{"takeoff_mass_kg":232757,"takeoff_cg_pct":23.3,"event_mass_kg":205500,"event_cg_pct":28.7,"sw_margin_M0p8_deg":1.5,"buffet_free_below_nz":1.3},"u":"kg, %MAC, deg, g","scope":"aircraft","src":["H7"],"conf":"สูง","est":false,"note":"A330-200 (ปีกเดียวกัน ลำตัวสั้นกว่า)"}
   }
  },
  "gear": {
   "strut_main": {
    "k_linear": {"v":2007689,"u":"N/m","scope":"gear","src":["H16"],"conf":"ต่ำ","est":false,"note":"FG 137,570 lbf/ft ต่อขา (bogie); ยุบนิ่ง 0.42 m ที่ 187 t (h_gear.mjs)"},
    "c_linear": {"v":786823,"u":"N s/m","scope":"gear","src":["H16"],"conf":"ต่ำ","est":false,"note":"53,915 lbf/(ft/s); ζ 0.95 ที่ 187 t"}
   },
   "strut_nose": {
    "k_linear": {"v":786190,"u":"N/m","scope":"gear","src":["H16"],"conf":"ต่ำ","est":false,"note":"53,871 lbf/ft"},
    "c_linear": {"v":583133,"u":"N s/m","scope":"gear","src":["H16"],"conf":"ต่ำ","est":false,"note":"39,957 lbf/(ft/s); ζ 2.7 (หน่วงเกินมาก ควรลด)"}
   },
   "tyre_main": {
    "size": {"v":{"size":"1400x530R23","type":"radial","ply":[32,36],"count":8,"per_leg":4},"u":"-","scope":"gear","src":["H18","H5"],"conf":"สูง","est":false,"note":"ทางเลือก bias 54x21.0-23 32PR; A330neo WV251t ใช้ 40PR; bogie 4 ล้อต่อขา"},
    "rated_load": {"v":{"size":"54x21.0-23 36PR","N":304700},"u":"N","scope":"gear","src":["H19"],"conf":"กลาง","est":false,"note":"68,500 lb; ไม่พบค่าของ 1400x530R23"},
    "rated_pressure": {"v":{"size":"54x21.0-23 36PR","kPa":1538},"u":"kPa","scope":"gear","src":["H19"],"conf":"กลาง","est":false,"note":"223 psi"},
    "operating_pressure": {"v":{"est_MRW_242t":1412},"u":"kPa","scope":"gear","src":["H19","H1"],"conf":"ต่ำ","est":true,"note":"205 psi (14.1 bar) = 223 psi × ภาระต่อยาง 62,922 lb / 68,500 lb (ล้อหลักรับ 94 %, ค่าประมาณ)"},
    "outside_diameter": {"v":1.4,"u":"m","scope":"gear","src":["H18"],"conf":"สูง","est":true,"note":"จากชื่อขนาด 1400 mm; bias 54 in = 1.37 m"},
    "section_width": {"v":0.53,"u":"m","scope":"gear","src":["H18"],"conf":"สูง","est":true,"note":"530 mm"},
    "speed_rating": {"v":105.05,"u":"m/s","scope":"gear","src":["H18"],"conf":"สูง","est":false,"note":"235 mph"},
    "limit_ground_speed": {"v":104.95,"u":"m/s","scope":"gear","src":["H20"],"conf":"ต่ำ","est":false,"note":"204 kt GS (การ์ดทบทวน)"}
   },
   "tyre_nose": {
    "size": {"v":{"size":"1050x395R16","type":"radial","ply":28,"count":2},"u":"-","scope":"gear","src":["H18"],"conf":"สูง","est":false,"note":""},
    "outside_diameter": {"v":1.05,"u":"m","scope":"gear","src":["H18"],"conf":"สูง","est":true,"note":""},
    "section_width": {"v":0.395,"u":"m","scope":"gear","src":["H18"],"conf":"สูง","est":true,"note":""}
   },
   "brakes": {
    "type": {"v":{"braked_wheels":8,"nose_braked":false,"material":"carbon"},"u":"-","scope":"aircraft","src":["H16","H5","H30"],"conf":"กลาง","est":true,"note":"Honeywell Carbenix ระบุ A330/A340 เป็นแพลตฟอร์มที่ใช้ได้ (วัสดุ carbon); ผู้ผลิตเบรกของลำ Thai AirAsia X ไม่พบ; จำนวนล้อเบรกเป็นค่าที่อนุมาน (ล้อหน้าไม่มีเบรกเป็นปกติของแบบนี้)"},
    "max_temp_takeoff": {"v":{"fans_off":300},"u":"°C","scope":"aircraft","src":["H20"],"conf":"ต่ำ","est":false,"note":"การ์ดทบทวน"}
   },
   "steering": {
    "mode": {"v":"hydraulic nose wheel steering (tiller + rudder pedals)","u":"-","scope":"aircraft","src":["D6"],"conf":"กลาง","est":true,"note":"มุมสูงสุด 72° (65° ในรุ่นที่ลดมุม) เป็นของหัวข้อ 5 ใน airframe.geometry.turning"},
    "tiller_max": {"v":{"angle_deg":72},"u":"deg","scope":"aircraft","src":["D6"],"conf":"กลาง","est":false,"note":"อ้างเลขเดียวกับหัวข้อ 5; การลดมุมตามความเร็วไม่พบ (ใช้รูปแบบ A320 ชั่วคราว)"},
    "pedal_max": {"v":{"angle_deg":6,"note":"ค่า A320 ชั่วคราว"},"u":"deg","scope":"aircraft","src":["L15","L16"],"conf":"ต่ำ","est":true,"note":"ไม่พบของ A330"},
    "deflated_tyre_limits": {"v":{"one_deflated_turn_kt":7,"two_deflated_same_gear_turn_kt":3,"two_deflated_nws_max_deg":30},"u":"kt, deg","scope":"aircraft","src":["H20"],"conf":"ต่ำ","est":false,"note":"การ์ดทบทวน"}
   }
  },
  "wind": {
   "wake": {
    "b0_over_b": {"v":0.7854,"u":"-","scope":"aircraft","src":["R1:W19"],"conf":"สูง","est":false,"note":"π/4 ปีกวงรี"},
    "leaders": {"v":{"A330_300_MLW":{"mass_kg":187000,"span_m":60.3,"Vapp_kt":144,"Gamma0_ISA_m2ps":426.7,"w0_ISA_mps":1.434,"Gamma0_35C_m2ps":456.3,"w0_35C_mps":1.534},"A330_300_MTOW_V2":{"mass_kg":242000,"V_kt":156.5,"Gamma0_ISA_m2ps":508.2,"w0_ISA_mps":1.708}},"u":"kg, m, kt, m2/s, m/s","scope":"aircraft","src":["R1:W19","H1"],"conf":"กลาง","est":true,"note":"Γ0 = m g/(ρ V b0); ρ 35 °C SL 1.1455 (h_speeds_perf.mjs)"},
    "category": {"v":{"ICAO":"H","RECAT_EU":"CAT-B Upper Heavy","FAA_CWT":"B","FAA_SRS":"III","ARC":"4E","ADG":"V","APC":"C"},"u":"-","scope":"aircraft","src":["H21","H4","H32","H33"],"conf":"สูง","est":false,"note":"ICAO Heavy เพราะ MTOM ≥ 136,000 kg (Doc 4444); FAA JO 7360.1J: \"A333 Fixed-wing 2J/H Heavy B III 8\""}
   }
  }
 }
}
