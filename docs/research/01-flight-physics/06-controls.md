# 6. ระบบบังคับ: hinge moment แรงที่คันบังคับ trim และ actuator

← [กลับไปหน้ารวมรอบที่ 1](../01-flight-physics.md) · [schema พารามิเตอร์](schema.md)

> ความเชื่อมั่นโดยรวม: กลาง (ข้อกำหนดแรงและสมการ: สูง · ค่า hinge moment และเรขาคณิตของเครื่องฝึกสมมุติ: ต่ำ–กลาง เพราะออกแบบเองจากช่วงค่าใน NACA) · แหล่งหลัก: 14 CFR Part 23 ฉบับก่อน Amdt 23-64 [C1–C7], MIL-F-8785C [C12] และ DOT/FAA/AR-07/47 [C14], NACA Rep. 927 [C15], NASA TN D-3726 [C18]

## 6.0 สรุปสั้น
- **ปัญหาใหญ่ที่สุดของโค้ดปัจจุบันคือ auto-trim ในโหมด DIRECT ลบ speed stability ทิ้ง** `trimDe += 0.25·q·dt` (20-flight.js:469) ทำงานเหมือนกฎ FBW แบบ neutral speed stability ผลวัดด้วย Node: ดึงคัน 15 % นาน 4 วินาทีแล้วปล่อย เครื่องค้างอยู่ที่ 80.5 kt (−15.3 % จาก 95 kt) และถ้าดันก็ค้างที่ 109.4 kt (+15.2 %) ซึ่งไม่ผ่าน 14 CFR 23.173(b) ที่ให้กลับมาภายใน ±10 % ของความเร็ว trim [C4] เมื่อตรึง trim ไว้ เครื่องกลับมาที่ 95.0 ± 2 kt เอง (ตาราง 6.1)
- **ไม่มีแนวคิด "แรง" ในระบบเลย** คันบังคับสั่งมุม elevator ตรง ๆ (`c.de = −y·deUp + trimDe`) จึงไม่มี stick force per g ไม่มีแรงตามความเร็ว ไม่มี trim tab และ `air.nz` ถูกตั้งเป็น 0 ตลอด (20-flight.js:291) ทำให้วัด g ไม่ได้
- **สิ่งที่ควรสร้าง:** โมเดล reversible ที่ใช้สมการ hinge moment $C_h = C_{h0}+C_{h\alpha}\alpha_t+C_{h\delta}\delta_e+C_{h\delta_t}\delta_t$ แล้วให้ผู้เล่นสั่ง **แรง** แทนตำแหน่ง (force-command) elevator จะลอยไปหาจุดสมดุล hinge moment เอง ต้นแบบใน Node (รันบนโมเดล 6-DOF ปัจจุบัน) ได้ stick force per g = 39.7 N/g (8.9 lbf/g, ค่าประมาณเพราะสัมประสิทธิ์ hinge moment เป็นค่าประมาณ) ทุกความเร็ว ปล่อยมือแล้วถือ 95 kt ได้ 94.8–95.0 kt และดึง 1 lbf ค้างได้ 88.1 kt ตรงกับที่คำนวณไว้ 87.6 kt
- **ค่าที่ได้อยู่ในกรอบข้อกำหนด:** 8.9 lbf/g อยู่ในช่วง Level 1 ของ MIL-F-8785C สำหรับ centre stick (4.2–28 lbf/g เมื่อ $n_L$ = 6) [C12] แรงดึงถึง 6 g = 44.6 lbf ผ่านเกณฑ์ 23.155 (≥ 35 lbf) [C2] และไม่เกิน 60 lbf ตาม 23.143 [C1] ส่วนความชันแรงตามความเร็ว 0.14 lbf/kt ที่ 95 kt ใกล้กับ Cessna 150/152 ที่วัดจริง (0.05–0.38 lbf/kt) [C20]
- **Trim และ auto-trim:** เปลี่ยน `trimDe` เป็นสถานะ trim tab ที่ปุ่มเลื่อนได้ด้วยอัตราจำกัด (เสนอ 1.0°/s ตอนแฟลปลง 0.5°/s ตอนแฟลปเก็บ ≈ ลดแรงได้ราว 1 lbf/s) ส่วน auto-trim ให้มีเฉพาะใน ASSIST หรือเป็นตัวเลือกสำหรับมือใหม่ โดยให้ไล่ "แรงเสมือน" เข้าหาศูนย์ ไม่ใช่ไล่ pitch rate
- **เส้นทางควบคุมเร็วพอ:** equivalent time delay จากคีย์บอร์ดถึง pitch rate วัดได้ 0.042 s (actuator อย่างเดียว 0.025 s) ต่ำกว่าเกณฑ์ Level 1 = 0.10 s [C14] แต่ gamepad บนเว็บไม่มี force feedback [C28] จึงต้องใช้แถบแสดงแรง (มีขีด 10 lbf ใช้ต่อเนื่อง และ 60 lbf ใช้ชั่วคราว) แทนความรู้สึกที่มือ

## 6.1 สภาพปัจจุบันใน AirfieldLab
**สิ่งที่โค้ดทำ**
- `AC` (20-flight.js:100–118) มีแค่ derivative ของพื้นบังคับ (`CLde` 0.35, `Cmde` −1.15, `Clda` 0.16, `Cndr` −0.072 ต่อ rad) และขีดจำกัดมุม `deUp` 22°, `deDn` 15°, `daMax` 20°, `drMax` 25° ไม่มีข้อมูลขนาดพื้นบังคับ คอร์ด gearing หรือ hinge moment
- `actuators()` (20-flight.js:241–251) จำกัดอัตราแบบ slew: elevator 70°/s, aileron 80°/s, rudder 60°/s, แฟลป 0.15 /s (ราว 6.7 s เต็มช่วง), ล้อ 1/6 /s และคันเร่งเป็น lag อันดับหนึ่ง 1 s ไม่มี lag ของ actuator ไม่มี free play หรือแรงเสียดทาน
- `PilotLaws` โหมด DIRECT (20-flight.js:466–472): `c.de = (y ≥ 0 ? −y·deUp : −y·deDn) + trimDe` และเมื่อคันอยู่กลาง (|y| < 0.05) จะปรับ `trimDe += 0.25·q·dt` คือ integrator บน pitch rate ส่วน aileron และ rudder เป็นสัดส่วนตรง ไม่มี trim
- โหมด ASSIST (20-flight.js:433–465): คันสั่ง pitch rate 7°/s ต่อคันเต็ม (attitude hold), สั่งมุมเอียง 33° ต่อคันเต็ม, auto-rudder และ auto-throttle ไม่มีแนวคิด trim เลย
- `setPilot()` (20-flight.js:600–608) ตอนสลับโหมดตั้ง `trimDe = ac.de` จึงไม่มีการกระตุกตอนสลับ ข้อนี้ควรรักษาไว้
- อินพุต (90-app.js:332–366): คีย์บอร์ดมี ramp แล้ว (เพิ่ม 2.0–2.5 /s, คืนกลาง 5 /s) ซึ่งต่างจากที่ CLAUDE.md เขียนว่า "binary" แต่คีย์ยังเป็นเปิด/ปิด จึง**ค้างคันไว้ที่ค่ากลาง ๆ ไม่ได้** กดค้างเมื่อไรคันวิ่งไปจนสุด ไม่มีปุ่ม trim, แฟลป, ล้อ, เบรกแยกซ้ายขวา และไม่มี Gamepad API
- `updateAir()` ตั้ง `a.nz = 0` (20-flight.js:291) จึงไม่มี load factor ให้ HUD หรือการทดสอบใช้

**ผลวัดด้วย Node** (สคริปต์ใน `scripts/`: `c6_current.mjs`, `c6_speedstab.mjs`, `c6_delay.mjs`)

| รายการ | โมเดลปัจจุบัน | หมายเหตุ |
|---|---|---|
| มุม elevator ตอน trim (95 kt แฟลปลง, ร่อน 3°) | −3.84° (TEU), α 1.76° | `setApproach()` |
| มุม elevator ตอน trim (130 kt / 160 kt แฟลปเก็บ) | +0.44° / +1.76° | elevator ไปทาง TED เมื่อเร็วขึ้น ถูกทิศ (เสถียร stick-fixed) |
| Δδe ต่อ g (ดึงคงความเร็ว) ที่ 80 / 95 / 120 / 160 kt | −13.4° / −9.5° / −5.9° / −3.3° | วิเคราะห์จาก derivative ใน `AC` |
| คันเต็มใน DIRECT ต่อ g ที่ 95 / 120 kt | 0.43 / 0.27 ของช่วงดึง | คันเต็มที่ 120 kt = 3.7 g เพิ่ม (ถ้าไม่ stall ก่อน) |
| คันเต็มใน ASSIST | Δn 0.51 / 0.61 / 0.77 g ที่ 80 / 95 / 120 kt | มาจาก 7°/s × V/g |
| ดึง 15 % 4 s แล้วปล่อย (DIRECT, auto-trim เปิด) | ค้างที่ 80.5 kt (−15.3 %), `trimDe` ย้ายจาก −3.84° เป็น −6.60° | ไม่ผ่าน 23.173(b) ±10 % [C4] |
| ดัน 15 % 4 s แล้วปล่อย (DIRECT, auto-trim เปิด) | ค้างที่ 109.4 kt (+15.2 %) | ไม่ผ่าน |
| กรณีเดียวกันแต่ตรึง trim | กลับมา 95.0 / 94.8 kt หลัง phugoid (ช่วง 77.6–106.8 kt) | แสดงว่า airframe เสถียรอยู่แล้ว ตัวทำลายคือ auto-trim |
| Equivalent time delay (step δe −4° ที่ 120 kt, เทียบกับ step ในอุดมคติ) | actuator 0.025 s, คีย์บอร์ด + actuator 0.042 s (เท่ากันเมื่ออ่านคีย์ 60 Hz) | Level 1 ≤ 0.10 s [C14] |
| เวลาคีย์บอร์ดจากศูนย์ถึงคันเต็ม | 0.50 s | ถึง 1 g ที่ 120 kt ใช้ 0.135 s |
| `air.nz` | 0 ตลอด | ต้องคำนวณจริง |

## 6.2 Hinge moment และแรงที่คันบังคับ
### 6.2.1 สมการ
แรงลมที่กระทำกับพื้นบังคับ (elevator, aileron, rudder) สร้างโมเมนต์รอบบานพับ เรียกว่า hinge moment ในระบบกลไกแบบ reversible (สายเคเบิลหรือก้านต่อตรงถึงคัน) นักบินต้องออกแรงต้าน hinge moment นี้ผ่านอัตราทด (gearing) จากงานเสมือน $F_s\,dx_s + H_e\,d\delta_e = 0$ [C20, Eq. 1]:

$$H_e = C_h\,\eta_t\,\bar q\,S_e\,\bar c_e,\qquad F_s = G_e\,H_e,\qquad G_e = \left|\frac{d\delta_e}{dx_s}\right|$$

$$C_h = C_{h0} + C_{h\alpha}\,\alpha_t + C_{h\delta}\,\delta_e + C_{h\delta_t}\,\delta_t,\qquad \alpha_t = \alpha\left(1-\frac{\partial\varepsilon}{\partial\alpha}\right) + \frac{q\,l_t}{V} + (i_t-\varepsilon_0)$$

สัญลักษณ์: $H_e$ hinge moment (N·m, บวกเมื่อดันให้ trailing edge ลง คือทิศเดียวกับ δe บวกของ repo), $C_h$ สัมประสิทธิ์ hinge moment, $\bar q$ ความดันพลวัต (Pa), $\eta_t$ อัตราส่วนความดันพลวัตที่หาง, $S_e$ พื้นที่ elevator หลังบานพับ (m²), $\bar c_e$ คอร์ดเฉลี่ยหลังบานพับ (m), $F_s$ แรงที่คัน (N, **บวก = ดึง**), $x_s$ ระยะคันที่มือจับ (m, บวก = ดึง), $G_e$ อัตราทด (rad/m), $\delta_e$ มุม elevator (rad, บวก = TED ตาม `Cmde` < 0 ของ repo), $\delta_t$ มุม trim tab (rad, บวก = TED), $\alpha_t$ มุมปะทะที่หาง (rad), $\partial\varepsilon/\partial\alpha$ downwash gradient, $l_t$ แขนหาง (m), $q$ pitch rate (rad/s, แกน FRD), $V$ TAS (m/s) ค่าคงที่ $(i_t-\varepsilon_0)$ รวมไว้ใน $C_{h0}$ ได้ สำหรับ aileron และ rudder ใช้รูปเดียวกัน โดยใช้ $\beta$ (หางดิ่ง) หรือ α เฉพาะที่ปีกแทน $\alpha_t$

เครื่องหมายตรวจได้ง่าย: ถ้า δe ติดลบ (TEU) และ $C_{h\delta}$ < 0 จะได้ $H_e$ > 0 ซึ่งพยายามดัน trailing edge กลับลง นักบินจึงต้อง "ดึง" ($F_s$ > 0) ถูกต้องตามความรู้สึกจริง

**Force-command (stick-free) ที่เสนอ:** ถ้าผู้เล่นสั่งแรง $F_s$ แทนตำแหน่ง มุม elevator ที่สมดุลคือ

$$\delta_e = \frac{F_s/(G_e\,\eta_t\,\bar q\,S_e\,\bar c_e) - C_{h0} - C_{h\alpha}\alpha_t - C_{h\delta_t}\delta_t}{C_{h\delta}}$$

ส่งผ่าน lag อันดับหนึ่ง $\tau_f$ ≈ 0.05 s (แทนพลวัตมวลคันและ elevator ซึ่งเร็วกว่ารอบ RK4 มาก) แล้วตัดที่ stop และ rate limit ของ `actuators()` เดิม มุม trim tab ที่ทำให้แรงเป็นศูนย์คือ $\delta_t^{*} = -(C_{h0}+C_{h\alpha}\alpha_t+C_{h\delta}\delta_e)/C_{h\delta_t}$ [C20, Eq. 8]

### 6.2.2 ค่าทั่วไปของ $C_{h\alpha}$, $C_{h\delta}$, $C_{h\delta_t}$
| แหล่ง | ชนิดพื้นบังคับ | $C_{h\alpha}$ (/deg) | $C_{h\delta}$ (/deg) | อื่น ๆ |
|---|---|---|---|---|
| NACA Rep. 927 ตัวอย่าง elevator ไม่มี balance [C15, p. 15] | elevator plain | −0.003 | −0.007 | ใช้ W/S = 40 lb/ft² |
| NACA Rep. 721, ตัวอย่างหาง $c_f/c$ ≈ 0.40, sealed gap [C16, pp. 10–12] | plain flap + tab | (ต่อ $C_N$ −0.093) | ≈ −0.0076 | tab ≈ −0.0032 /deg; flap effectiveness 0.67 |
| KU-FRL-351 (NASA grant), elevator 30 % คอร์ด, AR 4.5 [C17, Table 2.2] | plain | ≈ −0.0025 (ค่าประมาณจากแถว α = −10°) | ≈ −0.0085 ที่ 2°, ≈ −0.0108 ที่ 20° (ค่าประมาณจากตาราง) | $C_h$ ไม่เป็นเชิงเส้นที่มุมมาก |
| **เสนอสำหรับเครื่องฝึก (ค่าประมาณ)** | elevator มี horn/inset balance เล็กน้อย | **−0.0020** | **−0.0060** | tab −0.0035 /deg |

ข้อสังเกต: ค่าในตำราเป็นของพื้นบังคับที่ไม่มี balance หรือ balance น้อย การใส่ aerodynamic balance (บานพับเยื้องไปข้างหลัง horn balance หรือ balance tab) ลดขนาด $C_{h\delta}$ ลงได้มาก Phillips ระบุว่า balancing tab ลด $C_{h\delta}$ ที่เป็นลบได้โดย $C_{h\alpha}$ เปลี่ยนน้อย [C15, p. 17] และ NACA 721 เตือนว่า balancing tab เต็มช่วงที่คอร์ดเกิน 0.10 $c_f$ กับอัตราทด 1:1 "will produce overbalance" [C16, p. 6] ค่าที่เสนอจึงเล็กกว่าค่า plain ราว 20–30 %

### 6.2.3 Stick-fixed กับ stick-free และ free-elevator factor
ถ้าปล่อยคัน elevator จะลอย (float) ไปตามมุมที่ทำให้ $C_h$ = 0 คือ $\partial\delta_e/\partial\alpha_t = -C_{h\alpha}/C_{h\delta}$ เมื่อ $C_{h\alpha}$ และ $C_{h\delta}$ ติดลบทั้งคู่ elevator จะลอยขึ้นตาม α ทำให้หางยกได้น้อยลง ความชันแรงยกของหางลดลงด้วยตัวคูณ free-elevator factor

$$F_e = 1 - \tau\,\frac{C_{h\alpha}}{C_{h\delta}},\qquad \Delta C_{m\alpha,\mathrm{free}} = \eta_t\,\bar V_H\,a_t\left(1-\frac{\partial\varepsilon}{\partial\alpha}\right)(1-F_e),\qquad SM' = -\frac{C_{m\alpha}+\Delta C_{m\alpha,\mathrm{free}}}{C_{L\alpha}}$$

$\tau = \partial\alpha_t/\partial\delta_e$ คือ elevator effectiveness, $a_t$ ความชันแรงยกหาง (/rad), $\bar V_H = S_h l_t/(S\bar c)$ tail volume, $SM'$ stick-free static margin (สัดส่วนของ $\bar c$) Phillips ยกตัวอย่างการบินทดสอบที่ neutral point แบบ stick-fixed อยู่ที่ 36.5 % MAC แต่แบบ stick-free อยู่ที่ 28.0 % MAC [C15, p. 9] แปลว่าการปล่อยคันลดเสถียรภาพลงได้ราว 8.5 % MAC

**ตัวเลขของเครื่องฝึก** (ค่าประมาณ, `c6_hinge.mjs`): ใช้ $a_t$ = 3.9 /rad, $\eta_t$ = 0.90, $\tau$ = 0.55 แล้วถอยหลังจาก derivative เดิมใน `AC` ได้ $l_t = -(C_{m\delta_e}/C_{L\delta_e})\bar c$ = −(−1.15/0.35)·1.65 = 5.42 m (ถือว่าแรงยกจาก elevator ทั้งหมดอยู่ที่หาง และวัดแขนจาก CG), $S_h = C_{L\delta_e}S/(\eta_t a_t\tau)$ = 2.96 m², $\bar V_H$ = 0.596 และ $\partial\varepsilon/\partial\alpha = C_{m\dot\alpha}/C_{mq}$ = 0.36 ตรวจความสอดคล้องได้: ทฤษฎีหางให้ $C_{mq,\mathrm{tail}} = -2\eta_t\bar V_H a_t l_t/\bar c$ = −13.7 (ใน `AC` ใช้ −12.5) และ $C_{m\dot\alpha}$ = −4.95 (ใน `AC` ใช้ −4.5) ใกล้กันพอ แปลว่าเรขาคณิตที่ถอยมานี้เข้ากับโมเดลเดิม ผลที่ได้: $F_e$ = 0.817, $SM$ = 0.150 $\bar c$ (stick-fixed) และ $SM'$ = 0.099 $\bar c$ (stick-free) elevator ลอย −0.21° ต่อ α 1°

### 6.2.4 Tab และ aerodynamic balance
| อุปกรณ์ | หลักการและผลต่อแรง | ตัวอย่างสาธารณะ |
|---|---|---|
| Trim tab | นักบินตั้งมุม tab แยก; tab ขยับสวนทางกับพื้นบังคับ [C23, p. 6-11]; ย้ายจุดแรงศูนย์ | เครื่องเล็กส่วนใหญ่ใช้ tab เดียวที่ elevator [C23, p. 6-10] |
| Balance tab (geared) | tab ขยับสวนทางอัตโนมัติ [C23, p. 6-11]; ลด $\lvert C_{h\delta}\rvert$ | ATR 72 aileron: "geared trailing edge balance tabs" + electric trim ที่ tab ซ้าย [C31, p. 19] |
| Antiservo tab | ขยับทิศเดียวกับ trailing edge ของ stabilator เพื่อลดความไว [C23, pp. 6-7, 6-11]; หนักขึ้น | stabilator ของเครื่องเล็ก |
| Servo / spring tab | นักบินขยับ tab แล้ว tab ลากพื้นบังคับ [C23, p. 6-11]; spring tab ทำงานแบบ servo เมื่อแรงสูง | เครื่องใหญ่ที่ไม่มีไฮดรอลิก (spring tab ยังไม่ยืนยันแบบเฉพาะ) |
| Bobweight | เพิ่มแรงคงที่ต่อ g ทุกตำแหน่ง CG; Phillips เทียบผลต่อแรงว่าคล้ายการทำให้ $C_{h\delta}$ บวกขึ้น [C15, p. 16] | เครื่องที่ stick force per g ต่ำ |
| Downspring | สปริงดึงคันไปข้างหน้าด้วยแรงเกือบคงที่ ให้แรงเพิ่มตามความเร็ว (speed stability ที่รู้สึก) แต่ไม่เพิ่มแรงต่อ g ([C15] หน้าที่เปิดไม่ได้กล่าวถึง downspring จึงเป็นหลักการทั่วไป ยังไม่ยืนยันจากแหล่งในรายการนี้) | เครื่องเล็กบางแบบ |
| Horn / inset hinge | ย้ายพื้นที่ไปหน้าบานพับ ลดทั้ง $C_{h\alpha}$ และ $C_{h\delta}$ | ทั่วไป |

**คำแนะนำสำหรับเว็บ:** ใช้สมการ $C_h$ เชิงเส้นตัวเดียวต่อแกน แล้วแทนอุปกรณ์ด้วยพารามิเตอร์: trim tab คือ $C_{h\delta_t}$ และสถานะ $\delta_t$; balance tab คือการปรับ $C_{h\delta}$ ให้เล็กลง; bobweight คือแรงเพิ่ม $F_{bw}(n_z-1)$; spring tab ทำทีหลังได้ด้วยตัวคูณ $k_{st}(\bar q)$ ต้นทุน CPU แทบเป็นศูนย์

### 6.2.5 ค่าที่คำนวณได้ของเครื่องฝึก (โมเดลที่เสนอ)
เรขาคณิต (ค่าประมาณ): $S_e$ = 1.10 m², $\bar c_e$ = 0.30 m, $G_e$ = 2.40 rad/m (คัน 160 mm ดึงสุด = −22°, 109 mm ดันสุด = +15°; 6.3/4.3 in) Stick force per g คำนวณจากการดึงคงที่ที่ความเร็วคงที่:

$$\frac{F_s}{n} = G_e\,\eta_t\,\bar q\,S_e\,\bar c_e\left[C_{h\alpha}\left(\frac{\Delta\alpha}{\Delta n}\Big(1-\frac{\partial\varepsilon}{\partial\alpha}\Big) + \frac{g\,l_t}{V^2}\right) + C_{h\delta}\frac{\Delta\delta_e}{\Delta n}\right]$$

โดย $\Delta\alpha/\Delta n$ และ $\Delta\delta_e/\Delta n$ แก้จาก $C_{L\alpha}\Delta\alpha + C_{L\delta_e}\Delta\delta_e = W/(\bar q S) - C_{Lq}\hat q$ และ $C_{m\alpha}\Delta\alpha + C_{m\delta_e}\Delta\delta_e = -C_{mq}\hat q$ ที่ $\hat q = (g/V)\bar c/(2V)$ (ต่อ 1 g) ในโมเดลเชิงเส้นที่ความหนาแน่นคงที่ $\bar q$ ตัดกันหมด ($\Delta\alpha$, $\Delta\delta_e$ แปรตาม $1/\bar q$ และพจน์ $\hat q$, $g l_t/V^2$ แปรตาม $1/V^2$) ค่าจึงไม่ขึ้นกับความเร็ว

| เงื่อนไข (ISA ระดับต่ำ) | δe trim | tab สำหรับแรงศูนย์ | $F_s/n$ | คันต่อ g | แรงต่อระยะคัน | ความชันแรงตามความเร็ว (stick-free) |
|---|---|---|---|---|---|---|
| 95 kt แฟลปลง (approach) | −4.07° | +6.2° | 39.7 N/g (8.93 lbf/g) | 2.71 in | 3.3 lbf/in | 0.63 N/kt (0.141 lbf/kt) |
| 110 kt แฟลปเก็บ (climb) | −1.26° | +0.1° | 39.7 N/g | 2.02 in | 4.4 lbf/in | 0.54 N/kt (0.122 lbf/kt) |
| 150 kt แฟลปเก็บ (cruise) | +1.31° | −2.8° | 39.7 N/g | 1.09 in | 8.2 lbf/in | 0.40 N/kt (0.090 lbf/kt) |

แรงดึงที่ trim tab คงที่ (lbf, บวก = ดึง) ช่วงที่ 23.175 ต้องการ: approach 80→110 kt = +1.95, +1.34, +0.69, 0, −0.73, −1.49, −2.29 (ทุก 5 kt); cruise 120→180 kt = +2.42 … −2.96 ความชันเป็นบวกตลอด (ดึงเมื่อช้ากว่า trim ดันเมื่อเร็วกว่า) ผ่านเงื่อนไขทิศของ 23.173(a) [C4]

ข้อสังเกตเรื่องแรงต่อระยะคัน (ค่าประมาณ, `c6_rev_check.mjs`): เมื่อ stick force per g คงที่ 8.93 lbf/g แรงต่อระยะคันเท่ากับ $(F_s/n)\,G_e/|\Delta\delta_e/\Delta n|$ จึงเพิ่มตามความเร็ว: 3.3 lbf/in ที่ 95 kt, 4.4 ที่ 110 kt, 5.25 ที่ 120 kt และ 8.2 ที่ 150 kt ถึง 5 lbf/in ของ MIL-F-8785C 3.2.2.2.2 [C12] ที่ราว 117.5 kt ขึ้นไป เกณฑ์นี้ใช้กับ Category A เท่านั้น (approach เป็น Category C, climb เป็น Category B) จึงไม่ขัดข้อกำหนด แต่ถ้าใช้เครื่องฝึกทำท่า aerobatic (Category A) ต่ำกว่าราว 118 kt คันจะรู้สึก "หลวม" กว่าเกณฑ์ ถ้าต้องการให้ผ่านทุกความเร็วให้ลด $G_e$ (คันเดินยาวขึ้น) ไม่ใช่เพิ่ม $C_{h\delta}$

**ข้อสรุปของ 6.2:** ค่านี้อยู่กลางกรอบข้อกำหนดทุกข้อในหัวข้อ 6.3 แต่ทุกตัวเลขในตารางเป็นค่าที่ออกแบบเอง (ความเชื่อมั่นต่ำ–กลาง) เมื่อรอบหลังได้ข้อมูลเครื่องจริง (C172S, DA40) ให้ปรับ $C_{h\alpha}$, $C_{h\delta}$, $G_e$ จนได้ stick force per g และความชันแรงตามความเร็วที่วัดจริง ซึ่งเป็นวิธีที่ใช้ได้ดีกว่าการหาค่า $C_h$ โดยตรง

## 6.3 ข้อกำหนดแรงที่คันบังคับ
### 6.3.1 ขีดจำกัดแรงของเครื่องบินขนาดเล็กและขนาดใหญ่
Part 23 ฉบับก่อน Amdt 23-64 (2017) ยังเป็นแหล่งตัวเลขที่ดีที่สุด เพราะฉบับปัจจุบันเป็น performance-based: §23.2135 เขียนเพียงว่าต้องควบคุมได้ "without requiring exceptional piloting skill, alertness, or strength" [C10] และ §23.2140 ว่าแรงตกค้าง "must not fatigue or distract the pilot" [C10] ส่วนตัวเลขย้ายไปอยู่ใน consensus standard ASTM F3173/F3173M ซึ่ง preview ฉบับ -23 แสดงตารางเดียวกับ 23.143 เดิม (และเพิ่มตารางที่เบากว่าสำหรับ Level 1 ที่ $V_{S0}$ ≤ 45 KCAS) [C11]

| แหล่ง | การออกแรง | Pitch | Roll | Yaw |
|---|---|---|---|---|
| 14 CFR 23.143(c) (Amdt 23-50, 1996) [C1] | ชั่วคราว: stick | 60 lbf (267 N) | 30 lbf (133 N) | — |
| | ชั่วคราว: wheel สองมือ / มือเดียว | 75 / 50 lbf | 50 / 25 lbf | — |
| | ชั่วคราว: rudder pedal | — | — | 150 lbf (667 N) |
| | ใช้ต่อเนื่อง (prolonged) | 10 lbf (44 N) | 5 lbf (22 N) | 20 lbf (89 N) |
| ASTM F3173-23 Table 1, Level 1 และ $V_{S0}$ ≤ 45 KCAS [C11] | ชั่วคราว stick / wheel / pedal | 200 N / 250 N | 100 N / 200 N | 400 N |
| | ใช้ต่อเนื่อง | 20 N | 15 N | 100 N |
| 14 CFR 25.143(d) [C8] | ระยะสั้น สองมือ / มือเดียว | 75 / 50 lbf | 50 / 25 lbf | — |
| | ระยะสั้น yaw / ระยะยาว | — / 10 lbf | — / 5 lbf | 150 / 20 lbf |
| MIL-F-8785C Table X (Class I, Level 1, Cat A–C) [C12] | roll stick / wheel | — | 20 lbf / 40 lbf (Cat C: 20) | — |
| MIL-F-8785C 3.3.5.1, 3.3.2.6 [C12] | pedal (ส่วนใหญ่) | — | — | 100 lbf Level 1–2, 180 lbf Level 3 (3.3.7 crosswind: 100 lbf Level 1, 180 lbf Level 2–3); steady coordinated turn ≤ 40 lbf (Level 1–2) |

ขีดแรงเชิงโครงสร้างที่นักบินอาจออกได้ (ใช้กำหนด "แรงสูงสุดของอินพุต" ไม่ใช่แรงใช้งาน): 23.397(b) สำหรับเครื่อง ≤ 5,000 lb กำหนด elevator stick 167 lbf, wheel 200 lbf, aileron stick 67 lbf, rudder 200 lbf [C7] ส่วน sidestick ของ FBW ใช้ special condition เพราะ "Pilot forces are applied to side stick controllers with only the wrist, not arms" โดยกำหนด 200 lbf pitch และ 100 lbf roll ที่ด้ามจับ [C26]

### 6.3.2 แรงในการหลบหลีก (stick force per g)
- **14 CFR 23.155(a)** แรงที่ต้องใช้ให้ถึง limit load factor ต้องไม่น้อยกว่า: wheel $W/100$ หรือ 20 lbf ที่มากกว่า (ไม่ต้องเกิน 50 lbf); stick $W/140$ หรือ 15 lbf ที่มากกว่า (ไม่ต้องเกิน 35 lbf) ทดสอบที่ maximum continuous power (turbine) แฟลปและล้อเก็บ และ (c) ความชันแรงต่อ g ต้องไม่ลดลงมากเกินเมื่อ g เพิ่ม [C2] ASTM F3173-23 §5.4.1 ใช้ตัวเลขเดียวกันในหน่วย SI (stick: W/14 N เมื่อ W เป็น kg หรือ 67 N ที่มากกว่า ไม่ต้องเกิน 156 N; wheel: W/10 N หรือ 89 N ไม่ต้องเกิน 222 N) [C11] สำหรับเครื่องฝึก 2,250 kg ได้ 160.7 N จึงถูกตัดที่ 156 N (35 lbf) เท่ากับฉบับ lbf
- **14 CFR 25.143(g)** เป็นข้อความเชิงคุณภาพ: แรงต้องไม่สูงจนนักบินล้า และไม่ต่ำจนทำให้ overstress ได้ง่าย [C8]
- **MIL-F-8785C Table V** (Fs/n, lbf/g, ไม่รวม breakout) [C12]:

| Level | Centre stick: สูงสุด | Centre stick: ต่ำสุด | Wheel: สูงสุด | Wheel: ต่ำสุด |
|---|---|---|---|---|
| 1 | $240/(n/\alpha)$ แต่ ≤ 28.0 และ ≥ $56/(n_L-1)$ | ค่ามากกว่าของ $21/(n_L-1)$ กับ 3.0 | $500/(n/\alpha)$ แต่ ≤ 120 และ ≥ $120/(n_L-1)$ | ค่ามากกว่าของ $35/(n_L-1)$ กับ 6.0 |
| 2 | $360/(n/\alpha)$ แต่ ≤ 42.5 และ ≥ $85/(n_L-1)$ | ค่ามากกว่าของ $18/(n_L-1)$ กับ 3.0 | $775/(n/\alpha)$ แต่ ≤ 182 และ ≥ $182/(n_L-1)$ | ยังไม่ยืนยัน (ข้อความที่สกัดได้เพี้ยน) |
| 3 | 56.0 | ค่ามากกว่าของ $12/(n_L-1)$ กับ 2.0 | 240 | 5.0 |

$n/\alpha$ (g/rad) คือ load factor ต่อมุมปะทะ เชิงอรรถระบุว่าเมื่อ $n_L$ < 3 ค่าสูงสุดของ centre stick คือ 28.0 (Level 1) และ 42.5 (Level 2) [C12] ตัวเลข 18 และ 85 ของ Level 2 มีหลักฐานเสริมจากรายการ errata ใน user guide หน้า 122 ที่แก้เป็น "18/(nL-1) and 85/(nL-1)" แต่ errata นั้นแก้เอกสารพื้นหลังปี 1969 (AFFDL-TR-69-72 ของ 8785B, ข้อ 3.2.2.2.1) ไม่ใช่ Table V ของ 8785C โดยตรง [C13, p. 122] (ความเชื่อมั่นกลาง ดู 6.10) ข้อ 3.2.2.2.2 ยังกำหนดให้แรงต่อระยะคันใน Category A ไม่ต่ำกว่า 5 lbf/in (wheel และ centre stick) หรือ 2.0 lbf/deg (side stick) [C12]
- **NACA Rep. 927** เสนอค่าบนตามชนิดเครื่อง: transport/bomber < 50 lbf/g, dive bomber < 15 lbf/g, เครื่องที่หลบหลีกมาก < 8 lbf/g และต้องใช้แรงดึงอย่างน้อย 30 lbf จึงถึง load factor ที่อนุญาต [C15, p. 15]
- **ข้อมูลบินจริงของ GA** (NASA TN D-3726, เจ็ดลำ, ล้อพับเก็บได้, คันแบบ wheel): โดยประมาณ 35 lbf/g ที่ CG หน้าและ 19 lbf/g ที่ CG หลัง (รูป 10 แสดงที่ landing configuration 70 kt; ข้อความไม่ได้ระบุ configuration ของตัวเลขเฉลี่ยนี้) สองลำลดเหลือราว 5 lbf/g ที่ CG หลัง และนักบินไม่ติจนถึง 45 lbf/g [C18, p. 10, fig. 10] NASA TN D-779 ใช้ 10 lbf/g ในการทดสอบ variable-stability [C19, p. 7]

**ตรวจเครื่องฝึก (centre stick, สมมุติ aerobatic $n_L$ = +6, ค่าประมาณ):** ที่ 95 kt $n/\alpha$ = 5.04 g/rad จึงได้กรอบ Level 1 = 4.2–28 lbf/g; 23.155 ต้องการ $F(n_L)$ ≥ 35 lbf (เพราะ $W/140$ = 4,960/140 = 35.4 lbf แต่ไม่ต้องเกิน 35) คือ ≥ 7.0 lbf/g ค่าที่เสนอ 8.93 lbf/g ให้ 44.6 lbf ที่ 6 g ผ่านทั้งสองข้อ ถ้าเครื่องเป็น utility ($n_L$ = 4.4) จะได้ 30.4 lbf ซึ่งไม่ผ่าน 23.155 ต้องเพิ่มเป็น ≥ 10.3 lbf/g (เช่น เพิ่ม bobweight)

### 6.3.3 เสถียรภาพตามความเร็ว (static longitudinal stability)
- **23.173** (a) ต้องดึงเมื่อช้ากว่า trim และดันเมื่อเร็วกว่า ไม่ต้องพิจารณาความเร็วที่ต้องใช้แรงเกิน 40 lbf; (b) ความเร็วต้องกลับมาภายใน ±10 % ของความเร็ว trim (commuter cruise ±7.5 %); (c) แรงต้องเปลี่ยน "clearly perceptible to the pilot" ไม่มีตัวเลขความชัน [C4]
- **23.175** ช่วงทดสอบ: climb 85–115 % ของความเร็ว trim ที่ maximum continuous power แฟลปและล้อเก็บ; cruise (normal/utility/acrobatic) ค่าที่มากกว่าระหว่าง 15 % ของความเร็ว trim กับ 40 kt บวก free-return range ทั้งด้านบนและด้านล่าง โดยไม่ต้องมีความชันเสถียรที่ความเร็วต่ำกว่า 1.3 $V_{S1}$ หรือสูงกว่า $V_{NE}$/$V_{FC}$ (commuter: 50 kt บวก free-return range); landing 1.1–1.8 $V_{S1}$ แฟลปลงล้อลง trim ที่ $V_{REF}$ ทั้งแบบ power off และแบบร่อน 3° [C5]
- **25.173** (c) ความชันเฉลี่ยไม่น้อยกว่า 1 lbf ต่อ 6 kt (0.167 lbf/kt) และ (b) กลับมาภายใน 10 % (climb, approach, landing) หรือ 7.5 % (cruise) [C9] — ใช้กับเครื่องบินโดยสารในรอบหลัง
- **MIL-F-8785C 3.2.1.1** ต้องไม่มีแนวโน้มที่ความเร็วจะลู่ออก ทั้ง controls fixed และ free เส้นแรงและตำแหน่งคันกับความเร็วต้องเรียบและเสถียรในช่วง ±15 % หรือ ±50 kt EAS (ที่น้อยกว่า) [C12]
- **ข้อมูลวัดจริง** (Bromfield & Gratton): Cessna 150M ความชันที่ $V_{trim}$ 0.020–0.066 daN/kt (0.045–0.15 lbf/kt) ตาม configuration และ C152 0.098–0.170 daN/kt (0.22–0.38 lbf/kt); breakout/friction ของเครื่องทุกลำที่ทดสอบอยู่ที่ 0.22–0.44 daN (0.5–1.0 lbf) ด้านดึงและ 0.11–1.11 daN (0.25–2.5 lbf) ด้านดัน [C20, §3.4] เฉพาะ C150M คือ 0.33–0.44 daN ด้านดึงและ 0.22–1.11 daN ด้านดัน [C20, Table 10] ค่าที่เสนอ (0.09–0.14 lbf/kt) อยู่ในช่วง C150 ซึ่งเป็นด้านที่เบา ถ้าทดสอบด้วยความรู้สึกแล้วเบาไป ให้เพิ่ม $G_e$ หรือ $S_e\bar c_e$

### 6.3.4 Breakout, friction และ centring
"Breakout force" คือแรงที่ต้องใช้ก่อนคันเริ่มขยับ (รวม friction และ preload ของสปริงกลาง) ข้อมูลที่ยืนยันได้ในรอบนี้:
- MIL-F-8785 ฉบับต้น (ASG, ข้อ 3.2.1): breakout ของ rudder pedal (รวม friction) 1–7 lbf (Class II-C) และ 1–14 lbf (Class II-L); MIL-F-8785B (3.5.2.1): Class III 1–14 lbf สำหรับ Level 1–2 และค่าบนเป็นสองเท่าสำหรับ Level 3 [C14, §10.2.1–10.2.2] ตาราง breakout ของ pitch/roll ใน MIL-F-8785C (3.5.2.1) **ยังไม่ยืนยัน** เพราะสำเนาที่เปิดได้ขาดหมวด 3.5 ค่าที่ผู้เขียนจำได้ (Class I: pitch stick 0.5–3 lbf, roll stick 0.5–2 lbf, pedal 1–7 lbf) จึงเก็บไว้เป็นความเชื่อมั่นต่ำ
- แรงเสียดทานของ GA จริง: ที่ตำแหน่งกลาง aileron เกิน 2 lbf, elevator เกือบ 6 lbf, rudder ราว 20 lbf (วัดขณะล้อหน้าหมุนได้อิสระ) และรายงานเสนอให้มีเกณฑ์ friction แต่ไม่ได้ให้ตัวเลข [C18, p. 5, fig. 2]; เครื่อง variable-stability ของ NASA มี friction คันราว 1.25 lbf และ breakout ระหว่างแรงกับระยะคันราว 1 lbf [C19, pp. 6–7]
- JSBSim (c172x) จำลอง free play ด้วย `hysteresis_width` 0.05 rad (2.9°) และ lag 60 /s ที่ actuator ของ elevator [C29] ซึ่งเป็นการจำลองในโดเมนมุม ไม่ใช่โดเมนแรง

**คำแนะนำ:** ในโหมด force-command ให้ใส่ breakout เป็นแถบตายในโดเมนแรง $F_{eff} = \mathrm{sign}(F)\max(0, |F| - F_{bo})$ โดย $F_{bo}$ ≈ 4.5 N (1 lbf) pitch, 3 N roll, 13 N (3 lbf) yaw (ค่าประมาณจาก [C19, C20, C14]) และแรงเสียดทานแบบ Coulomb ที่ทำให้คันค้างอยู่กับที่ถ้า $|F - F_{eq}| < F_{fr}$ ซึ่งสำคัญมาก: friction ทำให้ปล่อยมือแล้วความเร็วกลับมาไม่ตรงจุดเดิม (free-return band) ตรงตามที่ 23.173(b) อนุญาต ±10 %

## 6.4 Trim
### 6.4.1 ข้อกำหนด
- **23.161** หลัง trim แล้ว "without further pressure upon, or movement of, the primary controls" ต้อง trim ตามยาวได้ใน climb (takeoff power และ maximum continuous power), level flight จากค่าที่น้อยกว่าของ $V_H$ กับ $V_{NO}$ (หรือ $V_{MO}/M_{MO}$) ลงถึง 1.4 $V_{S1}$, descent ที่ $V_{NO}$ power off และ approach ล้อลง (3° ที่ 1.4 $V_{S1}$ แฟลปเก็บ, 3° ที่ $V_{REF}$ แฟลปลง และมุมร่อนชันสุดที่ใช้ทดสอบระยะลงจอด) ส่วน lateral และ directional ต้อง trim ได้ที่ค่าต่ำสุดของ 0.9 $V_H$, $V_C$ หรือ $V_{MO}/M_{MO}$ (commuter: ทุกความเร็วตั้งแต่ 1.4 $V_{S1}$) [C3]
- **23.677** ต้องกันการใช้ trim โดยไม่ตั้งใจหรือกระชาก มีสิ่งบอกทิศทางใกล้ตัวควบคุม trim มีตัวบอกตำแหน่ง trim และช่วงที่ปลอดภัยสำหรับวิ่งขึ้น ตัวควบคุม tab ต้อง irreversible เว้นแต่ tab balance ดีและไม่มี flutter และถ้าเป็น powered trim ต้องแสดงว่าควบคุมได้หลัง runaway โดยให้ "appropriate time delay after pilot recognition" [C6]
- เครื่องบินโดยสาร: ตัวอย่าง 737 MAX ระบบ MCAS ขยับ stabilizer "at a rate of 0.27 degrees per second" ซึ่งเท่ากับอัตรา Speed Trim ตอนแฟลปลง [C24, p. 23] แสดงหลักว่าอัตรา trim ของเครื่องใหญ่ถูกจัดตาม configuration และ Boeing ระบุว่า rudder trim ทำงานโดยหมุน feel and centering unit เพื่อย้ายตำแหน่งกลาง [C25, p. 27]
- NASA TN D-3726 วิจารณ์ระบบ trim ของ GA ว่า "insensitive and poorly located" และบางลำมีแค่ trim ตามยาว [C18, p. 16]

### 6.4.2 วิธีทำ trim ในเครื่องจำลอง
Trim ที่ถูกต้องทางฟิสิกส์คือ**ย้ายจุดแรงศูนย์** ไม่ใช่ย้ายมุม elevator ตรง ๆ ใน force-command การเปลี่ยน $\delta_t$ จะเปลี่ยนมุม elevator ที่สมดุลเมื่อปล่อยมือ เครื่องบินจึงไปหาความเร็วใหม่เอง (stick-free trim speed) ส่วนใน position-command (โหมดเดิม) trim คือ offset ของมุม elevator ที่คันกลาง

**อัตรา trim:** ความไวของความเร็ว trim ต่อ tab คำนวณได้ 5.6 kt ต่อ tab 1° ที่ 95 kt แฟลปลง และ 22 kt ต่อ 1° ที่ 150 kt แฟลปเก็บ (`c6_misc.mjs`) ถ้าใช้อัตราเดียว 3.3°/s (เต็มช่วง ±20° ใน 12 s) ความเร็ว trim จะเลื่อน 19 kt/s ที่ approach และ 74 kt/s ที่ cruise ซึ่งไวเกินไป ข้อเสนอ (ค่าประมาณ): 1.0°/s เมื่อแฟลปลง และ 0.5°/s เมื่อแฟลปเก็บ คิดเป็นการลดแรงที่คันราว 0.8 lbf/s ที่ 95 kt และ 1.0 lbf/s ที่ 150 kt (นักบินจึง "กดปุ่ม trim สั้น ๆ" ได้แบบเดียวกับเครื่องจริง) ช่วง tab ที่ต้องใช้ตั้งแต่ 71 kt แฟลปลง (+12.9°) ถึง 230 kt แฟลปเก็บ (−4.7°) จึงตั้งช่วง tab ±20° (ค่าประมาณ, มีเผื่อ CG)

**Rudder และ aileron trim ของ turboprop:** หัวข้อ 3 ของรอบนี้คำนวณว่าที่ 80 kt กำลังเต็ม α 10° P-factor ต้องใช้ rudder ขวาราว 2.8° และแรงบิดเครื่องต้องใช้ aileron ราว 7.3° (ยังไม่รวม slipstream swirl) ด้วยเรขาคณิตสมมุติในตาราง JSON (6.8) ได้แรงเหยียบ 5.2–10.3 lbf ตามสัดส่วน $\bar q_v/\bar q$ = 1.0–2.0 ของหางดิ่งใน slipstream และแรง aileron 6.4 lbf (ค่าประมาณทั้งหมด, `c6_misc.mjs`) แรง aileron เกินขีดใช้ต่อเนื่อง 5 lbf ของ 23.143 [C1] จึง**ต้องมี aileron trim หรือการติดตั้งเครื่องเยื้อง** ส่วน rudder ยังต่ำกว่า 20 lbf แต่จะสูงขึ้นมากเมื่อรวม swirl และตอนเปลี่ยนกำลังเร็ว ข้อมูลบินจริงของ GA รายงานว่าที่ 110 kt เมื่อเปลี่ยนกำลังจากสูงสุดเป็น idle ต้องใช้ rudder ราว 10° และแรงที่ rudder ราว 90 lbf เพื่อรักษาทิศ ซึ่งนักบินเห็นว่ามากเกิน (รูป 8: cruise configuration, CG หน้า) [C18, pp. 8–9, fig. 8] เครื่องฝึก turboprop จึงควรมี rudder trim ที่ปรับง่าย ระบบปรับ rudder trim อัตโนมัติตามกำลังที่เครื่องฝึกบางแบบใช้ ผู้เขียนยังไม่ได้เปิดแหล่งปฐมภูมิสาธารณะที่ยืนยัน จึงเสนอเป็นตัวเลือก sim เท่านั้น (`sim.autoRudderTrim`)

**Auto-trim ใน ASSIST:** ให้คำนวณ "แรงเสมือน" $F_v = G_e\eta_t\bar q S_e\bar c_e C_h(\alpha_t,\delta_e,\delta_t)$ จาก elevator ที่กฎ ASSIST สั่งจริง แล้วขยับ tab เข้าหาศูนย์ด้วยอัตรา trim เดียวกับปุ่ม: $\dot\delta_t = \dot\delta_{t,\max}\,\mathrm{clamp}(F_v/F_{ref},\ \pm 1)$ เมื่อ $|F_v| > F_{bo}$ (ทิศ: $F_v$ ดึง → tab TED → trim เชิดหัว ซึ่งลด $F_v$) ในย่านเชิงเส้น time constant คือ $\tau_{at} = F_{ref}/(K\,|C_{h\delta_t}|\,\dot\delta_{t,\max})$ โดย $K\,|C_{h\delta_t}|$ = 3.54 N ต่อ tab 1° ที่ 95 kt และ 8.84 N/° ที่ 150 kt (`c6_rev_check.mjs`) ถ้าต้องการ $\tau_{at}$ ≈ 3 s จึงต้องใช้ $F_{ref}$ ≈ 11.1 N (2.5 lbf) ซึ่งให้ 3.1 s ที่ 95 kt แฟลปลง (1.0°/s) และ 2.5 s ที่ 150 kt แฟลปเก็บ (0.5°/s) (ค่าประมาณ) ถ้าตั้ง $F_{ref}$ เท่ากับ $F_{bo}$ = 4.45 N ย่านเชิงเส้นจะถูก dead band กลบหมด กลายเป็นการสั่งอัตราเต็มแบบเปิด/ปิด และหยุด auto-trim ขณะดึงเกิน 1.3 g หรือบนพื้น ผลคือเมื่อสลับเป็น DIRECT เครื่องอยู่ใน trim จริงทั้งแรงและตำแหน่ง ไม่ต้องตั้ง `trimDe = de` แบบเดิม

**ตัวเลือกมือใหม่ใน DIRECT:** ถ้าต้องการช่วยมือใหม่ ให้ใช้ auto-trim แบบเดียวกับ ASSIST (ไล่แรงเข้าศูนย์ช้า ๆ) **แทน** integrator บน q เพราะ integrator บน q ทำให้ speed stability หายไป (ตาราง 6.1) ใน force-command เมื่อคันอยู่กลาง แรงเป็นศูนย์อยู่แล้ว auto-trim จึงไม่ทำอะไร มันจะ trim เฉพาะแรงที่ผู้เล่นค้างไว้ เหมือนนักบินที่ trim แรงออกเอง เมื่อปล่อยมือเครื่องจึงยังกลับไปหาความเร็ว trim ได้ตามปกติ

## 6.5 Actuator, time delay, rate limit และ PIO
### 6.5.1 เกณฑ์ time delay และ lag
MIL-F-8785C 3.5.3 กำหนดว่า "the response of the airplane motion shall not exhibit a time delay longer than" 0.10 s (Level 1), 0.20 s (Level 2) และ 0.25 s (Level 3) และฉบับ 8785B กำหนดว่าพื้นบังคับต้องไม่ lag แรงที่คันเกิน 30° (Level 1–2, Category A และ C), 45° (Category B) และ 60° (Level 3) [C14, §10.2 ซึ่งยกจาก user guide ของ 8785C (Table XIV, p. 147 ของ [C13]) และของ 8785B (p. 392)] สำหรับเว็บ ให้ถือ 0.10 s เป็นงบประมาณรวมทั้งเส้นทาง: อ่านอินพุต (ครึ่งเฟรม ≈ 8 ms ที่ 60 Hz) + พลวัตจำลอง (วัดได้ 0.025–0.042 s, ตาราง 6.1) + การ render และจอ (1–3 เฟรม 17–50 ms, ค่าประมาณที่ไม่ได้วัดในรอบนี้) ผลรวมราว 0.05–0.10 s จึงอยู่ที่ขอบ Level 1 ไม่ควรเพิ่ม lag ใดอีกโดยไม่จำเป็น (เช่น smoothing ของ gamepad) และ lag ของ force-command ($\tau_f$) ไม่ควรเกิน 0.05 s

### 6.5.2 Rate limit และ PIO ประเภท II
Klyde, McRuer และ Myers แบ่ง PIO เป็นสามประเภท: Category I เป็นระบบเชิงเส้นที่ gain รวมสูงเกินและมี lag มาก; Category II คือ "Quasi-Linear Pilot-Vehicle System Oscillations with Series Rate or Position Limiting" ซึ่ง rate limit เปลี่ยนสถานการณ์ของ Category I "by adding an amplitude-dependent lag and by setting the limit cycle magnitude"; Category III ("Essentially Nonlinear Pilot-Vehicle System Oscillations with Transitions") เกิดจากการเปลี่ยนพลวัตแบบไม่เชิงเส้น (เช่น สลับโหมด) [C22, pp. 11–12] ผู้เขียนคำนวณ describing function ของ rate limiter แบบเดียวกับฟังก์ชัน `rate()` ใน `actuators()` สำหรับอินพุตไซน์ขนาด $A$ ที่ความถี่ $\omega$ (`c6_delay.mjs`, ค่าที่ได้จากการคำนวณเอง):

$$\omega_{on} = \frac{R}{A}\quad(\text{เริ่มอิ่มตัวเมื่อ } A\omega > R)$$

| $\omega/\omega_{on}$ | gain | phase | ตัวอย่าง elevator 70°/s, A = 22° ($\omega_{on}$ = 3.18 rad/s) |
|---|---|---|---|
| 1.0 | 1.000 | 0° | — |
| 1.5 | 0.838 | −15.8° | ≈ delay 0.058 s ที่ 4.8 rad/s |
| 2.0 | 0.637 | −38.2° | ≈ delay 0.105 s ที่ 6.4 rad/s |
| 3.0 | 0.424 | −58.4° | ≈ delay 0.107 s ที่ 9.5 rad/s |

เมื่อ $\omega/\omega_{on} \ge \sqrt{1+(\pi/2)^2}$ ≈ 1.86 เอาต์พุตเป็นคลื่นสามเหลี่ยมเต็มรูป ได้สูตรปิด gain $= (4/\pi)(\omega_{on}/\omega)$ และ phase $= -\arccos\!\big(\pi\omega_{on}/(2\omega)\big)$ ซึ่งตรงกับการจำลอง 40 รอบใน `c6_rev_check.mjs` (แถว 3.0 เดิมใช้การจำลองเพียง 3 รอบซึ่งยังมี transient ค้าง)

ความหมาย: rate limit 70°/s ของ elevator ปัจจุบันไม่เป็นปัญหาสำหรับการแก้เล็ก ๆ ($A$ = 5° เริ่มอิ่มที่ 14 rad/s ซึ่งเร็วกว่าย่านที่นักบินคุม 1–6 rad/s) แต่ถ้าผู้เล่นโยกคันเต็มช่วงไปมาเร็ว ๆ (เช่น ตกใจตอน flare) จะเกิด lag เพิ่มขึ้นถึง ≈ 0.1 s ซึ่งเป็นกลไก PIO ประเภท II ที่ถูกต้องทางฟิสิกส์ สำหรับเครื่องกลไกขนาดเล็ก rate limit ที่แท้คือความเร็วมือนักบิน จึงควรตั้งให้สูง (≥ 70°/s, คงค่าเดิม) และไม่ควรใส่ rate limit ซ้อนสองชั้น (คีย์บอร์ด ramp + actuator) เกินจำเป็น ส่วนเครื่องไฮดรอลิกต้องใช้อัตราจริงของเครื่อง เพราะเป็นตัวกำหนด PIO และพฤติกรรมตอนกู้

### 6.5.3 ค่าอ้างอิงของ actuator
| ระบบ | ค่า | แหล่ง / ความเชื่อมั่น |
|---|---|---|
| 737 (-300) rudder PCU | ราว 66°/s เมื่อ slide หลักและรองทำงานร่วม, ราว 33°/s slide หลักอย่างเดียว; blowdown 14–21°; แรงเหยียบเต็ม rudder ราว 70 lbf; pedal เดินราว 3 in ที่ blowdown; yaw damper จำกัด 3° และไม่ขยับ pedal | Boeing submission (USAir 427) [C25, pp. 26–31] · กลาง |
| 737 MAX stabilizer (MCAS = Speed Trim แฟลปลง) | 0.27°/s, สูงสุด 2.5° ต่อครั้งที่ Mach ต่ำ | FAA RTS summary [C24, p. 23] · สูง |
| ATR 72 aileron | ไม่มีไฮดรอลิก, cable, geared balance tab, แรงที่ wheel ออกแบบไว้ < 60 lbf, มุมสูงสุด 14° ต่อข้าง; autopilot aileron rate monitor 3.6°/s | NTSB AAR-96/01 [C31, pp. 19, 26] · สูง |
| Actuator ไฟฟ้า/ไฮดรอลิกของเครื่องเล็กในงานวิจัย | time constant 0.06–0.45 s ตามชนิด; ออกแบบอัตราไร้โหลด 100°/s | KU-FRL-351 [C17, Tables 3.2, 4.1, 5.1] · กลาง (เป็นงานศึกษา ไม่ใช่เครื่องจริง) |
| JSBSim c172x elevator | lag 60 /s, hysteresis 0.05 rad, bias 0.002 rad | [C29] · กลาง (ค่าของโมเดล ไม่ใช่วัด) |
| เครื่องฝึก (ปัจจุบัน) | elevator 70°/s, aileron 80°/s, rudder 60°/s | 20-flight.js:243–245 · ค่าประมาณ |
| A320 class elevator/aileron rate | ไม่พบแหล่งสาธารณะที่ยืนยันในรอบนี้ | ยังไม่ยืนยัน |

**Cable stretch:** สายเคเบิลยืดทำให้มุมพื้นบังคับน้อยกว่าที่คันสั่งเมื่อ hinge moment สูง แทนได้ด้วยสปริงอนุกรม $\delta_e = \delta_{e,cmd} - H_e/K_{cable}$ ผลจะเห็นเฉพาะที่ความเร็วสูงมาก ไม่จำเป็นสำหรับเครื่องฝึกในตอนนี้ (P3)

## 6.6 สถาปัตยกรรมระบบบังคับ และสิ่งที่ sim ควรทำ
| สถาปัตยกรรม | นักบินรู้สึกอะไร | ตัวอย่างสาธารณะ | โมเดลที่ควรใช้ใน AirfieldLab |
|---|---|---|---|
| กลไก reversible (cable/rod) | hinge moment จริงผ่าน gearing แรงโตตาม $\bar q$ | เครื่องเล็กใช้ "rods, cables, pulleys" [C23, p. 6-1]; ATR 72 aileron [C31] | **เครื่องฝึก, C172S, DA40/42, ATR 72 (aileron/elevator):** สมการ 6.2 + tab + breakout |
| กลไก + balance/servo/spring tab | แรงลดลงตามอัตราทดของ tab | balance tab ของ ATR 72 [C31]; servo/antiservo [C23] | ปรับ $C_{h\delta}$ ต่อแกน; spring tab = ตัวคูณที่ลดลงตาม $\bar q$ |
| Irreversible ไฮดรอลิก + artificial feel | แรงจาก feel unit (สปริงกลาง + q-feel) ไม่ใช่ hinge moment | 737 rudder: feel and centering unit ให้แรงราวสัดส่วนกับมุม rudder, trim หมุน unit นี้ [C25, p. 27] | **737 (รอบ 3):** $F = F_{bo} + K_{feel}(\bar q)\,x_s$; trim คือ stabilizer (ย้ายมุม stab) ไม่ใช่ tab; actuator rate จริง |
| Fly-by-wire + sidestick passive | สปริงคงที่ ไม่บอกสภาพการบิน | FBW "replaces the physical connection" [C23, p. 6-2]; A330 normal law คันสั่ง load factor และมี envelope protection [C27, §1.6.9.3] | **A320/A321 (รอบ 3):** คัน → กฎ (C*/nz command) + auto-trim THS; แรงคันจาก spring ไม่ขึ้นกับ $\bar q$ |
| Active sidestick | มอเตอร์สร้างแรงตามสภาพบิน และคันสองข้าง coupling กัน | special condition ใหม่กำหนดแรงโครงสร้างแยกสำหรับ side stick [C26] | ไม่จำเป็น (ไม่มี hardware บนเว็บ) |

**สิ่งที่ควรสร้างตอนนี้:** โครงสร้าง `CTRL` ต่อแกน (pitch/roll/yaw) ที่มีฟิลด์ `kind: 'reversible' | 'feel' | 'fbw'` แล้วทำเฉพาะ `reversible` ให้ครบ ส่วน `feel` และ `fbw` ใส่ไว้เป็นรูปแบบพารามิเตอร์ (JSON ใน 6.8) เพื่อให้รอบหลังเติมโดยไม่เปลี่ยนโครงสร้าง ทุกแบบส่งออกค่าเดียวกันให้ HUD: `Fs` (N), `Fs/Fmax`, ตำแหน่ง trim และสถานะ in-trim

## 6.7 การแปลงอินพุตบนเว็บ (artificial feel ที่ไม่มี force feedback)
### 6.7.1 ข้อจำกัดของ hardware
Gamepad API ให้แกนที่ "linearly normalized to the range [-1 .. 1]" และปุ่ม analog 0–1 อ่านด้วย `navigator.getGamepads()` ที่ควรเรียกก่อน animation callback; haptics มีเพียง "dual-rumble" และ "trigger-rumble" ซึ่งเป็น "fixed-duration, constant-intensity vibration" ไม่มีเอฟเฟกต์ spring หรือ constant force [C28] สเปกไม่ได้กำหนด dead zone ให้ จึงต้องทำเอง

### 6.7.2 หลักการ: ให้การโยกคันแทน "แรง"
คันของ gamepad (และนิ้วบนจอสัมผัส) มีสปริงกลับกลาง ระยะที่โยกจึงแปรตามแรงที่นิ้วกด ดังนั้นการแปลงที่สมจริงที่สุดคือ **ระยะคัน → แรงที่คันเครื่องบิน** แล้วให้ฟิสิกส์ (6.2) หามุมพื้นบังคับเอง ได้ผลพร้อมกันสามอย่าง: (1) stick force per g ออกมาเอง เพราะแรงเท่ากันได้ g เท่ากันทุกความเร็ว (2) ปล่อยคัน = แรงศูนย์ = เครื่องกลับไปความเร็ว trim (3) trim มีความหมายเหมือนจริง คือถ้ายังไม่ trim ต้องค้างคันไว้

$$F_s = F_{full}\cdot \mathrm{sgn}(x)\left[(1-e)\,u + e\,u^3\right],\qquad u = \max\!\left(0,\frac{|x|-d}{1-d}\right)$$

$x$ ค่าแกน (−1…1, ดึง = บวกหลังกลับเครื่องหมายแกน Y ของ gamepad), $d$ dead zone (เสนอ 0.08), $e$ expo (0–1, เสนอ 0.5), $F_{full}$ แรงที่คันสุด เสนอ 267 N (60 lbf = ขีดชั่วคราวของ 23.143 [C1]) ในโปรไฟล์ "สมจริง" และ 133 N ในโปรไฟล์ "ง่าย" ตัวอย่าง: $x$ = 0.5 ได้ $u$ = 0.457, ได้ 0.276·267 = 73.6 N (16.5 lbf ≈ 1.85 g ที่ 8.93 lbf/g) ส่วน roll ใช้ $F_{full}$ = 133 N (30 lbf) และ pedal 667 N (150 lbf) ตามขีดชั่วคราวของ 23.143 [C1]

**ข้อควรระวัง (วัดจากต้นแบบ, `c6_forcemode2.mjs`):** ที่ 95 kt แฟลปลง ดึงเพิ่มช้า ๆ 0.5 lbf/s ถึง stall warning ที่แรงเพียง 4.5 lbf (77.7 kt) ซึ่งเป็นบทเรียนที่ถูกต้อง (แรงเบาก็ stall ได้ตอน approach) แต่บนคันที่ไวมาก 4.5 lbf คือเพียง 21 % ของระยะคันในโปรไฟล์สมจริง จึงต้องมี expo และ stall warning ที่ชัด

**คีย์บอร์ด:** ใช้แรงเช่นกัน กดค้าง = แรงเพิ่มที่อัตรา 45 N/s (≈ 10 lbf/s, ≈ 1.1 g ต่อวินาที) ถึงเพดาน 89 N (20 lbf), ปล่อย = แรงกลับศูนย์ที่ 180 N/s (ค่าประมาณ) เพราะคีย์ค้างค่ากลางไม่ได้ ผู้เล่นคีย์บอร์ดจึงต้อง trim ให้แรงค้างเป็นศูนย์ ซึ่งตรงกับวิธีบินจริง (ใช้คันเฉพาะช่วงเปลี่ยน แล้ว trim ออก) ปุ่มที่เสนอ: trim pitch `[`/`]` หรือ Home/End, rudder trim `,`/`.`, aileron trim (ถ้ามี) Shift+`,`/`.`, แฟลป F/V, ล้อ G, เบรกซ้ายขวา Z/X (ข้อความบน UI เป็นภาษาไทย)

**จอสัมผัส:** stick เสมือนเดิม (90-app.js:345) ใช้สูตรเดียวกับ gamepad แต่ให้ dead zone เล็กกว่า (0.04) เพราะไม่มีสปริงกลไก

**ทางเลือก position-command:** เก็บโหมดเดิม (คันสั่งมุม) ไว้เป็นตัวเลือก แต่คำนวณแรงเสมือน $F_v$ เพื่อแสดงผลเสมอ

### 6.7.3 ตัวแสดงแรงที่คัน (visual force cue)
- แถบแนวตั้งข้าง HUD แสดง $F_s$ (N และ lbf) สเกล ±60 lbf มีขีดที่ ±10 lbf ("ค้างได้นาน" ตาม prolonged ของ 23.143) และ ±60 lbf ("ชั่วคราว") [C1] สีเขียว ≤ 10 lbf, เหลือง 10–40 lbf (40 lbf คือเพดานที่ 23.173(a) ไม่ต้องพิจารณา [C4]), แดง > 40 lbf
- แถบแนวนอนสำหรับ roll (ขีด 5/30 lbf) และ yaw (ขีด 20/150 lbf)
- ไอคอน "ต้อง trim" เมื่อ |F| > 2 lbf ค้างเกิน 3 s และลูกศรบอกทิศ (ข้อความไทย เช่น "trim เชิดหัว")
- ตัวบอกตำแหน่ง trim tab และช่วงที่ปลอดภัยสำหรับวิ่งขึ้น (ตาม 23.677(a) ที่เครื่องจริงต้องมี [C6])
- Rumble ใช้เฉพาะ buffet ก่อน stall และการสัมผัสพื้น (dual-rumble ความแรงตาม stall blend) ไม่ใช้แทนแรง เพราะ API ไม่มี force [C28]

### 6.7.4 โค้ดที่เสนอสำหรับ `src/20-flight.js` (DOM-free)
```js
// Reversible control axis: pilot FORCE in, surface angle out (stick-free equilibrium).
// Signs: F > 0 = pull / right stick / right pedal (as the axis is wired); delta > 0 = TED for the elevator.
class ControlAxis {
  constructor(p) { this.p = p; this.tab = 0; this.d = 0; this.Fv = 0; }
  // Fpilot: N (null in position/law mode), aLoc: local AoA (rad), qbar: Pa, dCmd: rad (position/law mode)
  update(dt, Fpilot, aLoc, qbar, dCmd) {
    const p = this.p, K = p.G * p.eta * qbar * p.S * p.c;                  // N per unit C_h
    const Kc = p.Kc * Math.max(0, Math.min(1, 1 - qbar / p.qFade));       // centring spring, fades out with airspeed
    const chB = p.Ch0 + p.Cha * aLoc + p.Cht * this.tab;
    let dEq;
    if (Fpilot == null) dEq = dCmd;
    else {
      const Fb = Math.sign(Fpilot) * Math.max(0, Math.abs(Fpilot) - p.Fbo);  // breakout dead band
      dEq = (Fb - K * chB) / (K * p.Chd - Kc);                             // solves Fb = K*Ch(d) - Kc*d
    }
    dEq = Math.min(p.dMaxTED, Math.max(-p.dMaxTEU, dEq));
    this.d += (dEq - this.d) * Math.min(1, dt / p.tauF);                   // stick + surface lag (0.05 s)
    this.Fv = K * (chB + p.Chd * this.d) - Kc * this.d;                    // force needed to hold this.d
    return this.d;                                                         // -> ac.cmd.de/da/dr -> actuators()
  }
  trim(dt, dir, flapsDown) {                                               // dir = +1 nose-up (tab TED), -1, 0
    const r = flapsDown ? this.p.trimRateDn : this.p.trimRateUp;
    this.tab = Math.min(this.p.tabMax, Math.max(-this.p.tabMax, this.tab + dir * r * dt));
  }
  autoTrim(dt, flapsDown) {                                                // ASSIST / beginner: drive Fv toward 0
    const dir = Math.max(-1, Math.min(1, this.Fv / this.p.FtrimRef));      // +Fv (pull held) -> nose-up trim
    if (Math.abs(this.Fv) > this.p.Fbo) this.trim(dt, dir, flapsDown);
  }
}
// elevator: aLoc = alpha*(1 - deda) + q*lt/V. Call update() each tick before ac.actuators(dt).
```
หมายเหตุ: (1) ทุก tick เรียก `update()` ก่อน `actuators()` แล้วส่งผลเป็น `ac.cmd.de/da/dr` ส่วน rate limit เดิมคงไว้ (2) สปริงกลาง $K_c$ (เสนอ 60 N ของแรงที่คันต่อมุมพื้นบังคับ 1 rad, ค่าประมาณ: ดึงสุด −22° บนพื้นต้องใช้ราว 23 N หรือ 5.2 lbf) ค่อย ๆ หายไปเมื่อ $\bar q$ ถึง `qFade` = 400 Pa (≈ 50 kt) เพื่อไม่ให้คันห้อยตอนจอดหรือแท็กซี่ และไม่ไปเปลี่ยน stick force per g ในอากาศ (3) ค่า `Fv` ส่งให้ HUD และ `Recorder` (4) เติม `a.nz` ใน `updateAir()` จาก specific force แกน body: $n_z = -(R^T\mathbf f_{NED})_z/g$, $\mathbf f_{NED} = \dot{\mathbf v} - [0,0,g]$

## 6.8 ค่าพารามิเตอร์ (JSON)
โครงสร้าง: `pitch`/`roll`/`yaw` เป็นค่าต่อเครื่อง (scope aircraft) ที่ทุกแบบในรอบหลังต้องให้; `reference_types` เก็บค่าที่ยืนยันได้ของเครื่องจริงไว้ใช้ตอนทำ 737/ATR; `requirements` และ `input` ใช้ร่วมกัน (scope sim) ค่าที่ถอยหรือออกแบบเองทุกตัวมี `est: true`

```json
{"controls": {
 "pitch": {
  "architecture": {"v":{"kind":"reversible","input":"force"},"u":"-","scope":"aircraft","src":["C23","C15"],"conf":"สูง","est":true,"note":"ค่าประมาณ: เครื่องฝึก: กลไก reversible + trim tab; 737 ใช้ kind feel, A320 ใช้ kind fbw"},
  "S_e": {"v":1.1,"u":"m2","scope":"aircraft","src":["C17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: พื้นที่ elevator หลังบานพับ ประมาณจาก S_h 2.96 m2 ที่ถอยจาก CLde; เทียบ KU-FRL-351: elevator 15.46 ft2 = 1.44 m2 (เครื่อง A) และ 26.39 ft2 = 2.45 m2 (เครื่อง C), โมเดลพื้นบังคับ 12 ft2 = 1.11 m2 (Table 2.1)"},
  "c_e": {"v":0.3,"u":"m","scope":"aircraft","src":["C17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: คอร์ดเฉลี่ยหลังบานพับ"},
  "gearing": {"v":2.4,"u":"rad/m","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: คันดึงสุด 160 mm = -22 deg, ดันสุด 109 mm = +15 deg"},
  "eta_t": {"v":0.9,"u":"-","scope":"aircraft","src":[],"conf":"กลาง","est":true,"note":"ค่าประมาณ: อัตราส่วนความดันพลวัตที่หาง"},
  "a_t": {"v":3.9,"u":"1/rad","scope":"aircraft","src":[],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ความชันแรงยกหาง AR ราว 4.5"},
  "tau_e": {"v":0.55,"u":"-","scope":"aircraft","src":["C16"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: elevator effectiveness; NACA 721 ให้ 0.67 ที่ cf/c 0.40 (ไม่รวมการสูญเสียจริง)"},
  "l_t": {"v":5.42,"u":"m","scope":"aircraft","src":[],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ถอยจาก -(Cmde/CLde)*cbar ของ AC = 1.15/0.35*1.65"},
  "deda": {"v":0.36,"u":"-","scope":"aircraft","src":[],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ถอยจาก Cmadot/Cmq ของ AC"},
  "Ch0": {"v":0,"u":"-","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รวม i_t - eps0; ปรับร่วมกับ tab"},
  "Ch_alpha": {"v":-0.1146,"u":"1/rad","scope":"aircraft","src":["C15","C17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: -0.0020/deg; plain elevator -0.0025 ถึง -0.003/deg"},
  "Ch_delta": {"v":-0.3438,"u":"1/rad","scope":"aircraft","src":["C15","C16","C17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: -0.0060/deg; plain -0.007 ถึง -0.0085/deg ลดด้วย balance"},
  "Ch_tab": {"v":-0.2005,"u":"1/rad","scope":"aircraft","src":["C16"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: -0.0035/deg ลำดับเดียวกับตัวอย่าง NACA 721 (-0.0032/deg)"},
  "tab_max": {"v":20,"u":"deg","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ต้องใช้ +12.9 (71 kt แฟลปลง) ถึง -4.7 (230 kt) เผื่อ CG"},
  "trim_rate_flaps_down": {"v":1,"u":"deg/s","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: tab; ≈ 5.6 kt/s ของความเร็ว trim ที่ 95 kt, ลดแรง ≈ 0.8 lbf/s"},
  "trim_rate_flaps_up": {"v":0.5,"u":"deg/s","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: tab; ≈ 11 kt/s ที่ 150 kt, ลดแรง ≈ 1.0 lbf/s"},
  "breakout": {"v":4.45,"u":"N","scope":"aircraft","src":["C19","C20"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 1 lbf; เครื่องที่ Bromfield & Gratton ทดสอบวัดได้ 2.2–4.4 N ด้านดึง (C150M 3.3–4.4 N), NASA TN D-779 breakout ราว 1 lbf"},
  "friction": {"v":4.45,"u":"N","scope":"aircraft","src":["C18","C19"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: Coulomb; GA วัดได้ถึง ~6 lbf (elevator) จึงเป็นค่าเบา"},
  "centring_spring": {"v":{"Kc":60,"qFade":400},"u":"N/rad, Pa","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้เฉพาะ qbar ต่ำ ไม่ให้คันห้อยบนพื้น"},
  "float_lag": {"v":0.05,"u":"s","scope":"sim","src":["C14"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: lag ของ stick-free equilibrium; รักษางบ time delay Level 1"},
  "stops": {"v":{"teu":22,"ted":15},"u":"deg","scope":"aircraft","src":[],"conf":"กลาง","est":false,"note":"ค่าเดิม AC.deUp/deDn"},
  "rate_limit": {"v":70,"u":"deg/s","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ค่าเดิม; กลไกจริงจำกัดด้วยมือนักบิน"},
  "derived_check": {"v":{"Fs_per_g_N":39.7,"grad_95kt_N_per_kt":0.63,"SM_fixed":0.15,"SM_free":0.099,"free_elevator_factor":0.817},"u":"mixed","scope":"aircraft","src":[],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ผลคำนวณ c6_hinge.mjs สำหรับยืนยันการ implement"}
 },
 "roll": {
  "architecture": {"v":{"kind":"reversible","input":"force"},"u":"-","scope":"aircraft","src":["C31"],"conf":"สูง","est":true,"note":"ค่าประมาณ: ATR 72 aileron ก็เป็นแบบนี้ (geared balance tab)"},
  "S_a_each": {"v":0.65,"u":"m2","scope":"aircraft","src":["C17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: KU-FRL-351: 0.54–0.65 m2 ต่อข้างในเครื่องเล็ก"},
  "c_a": {"v":0.25,"u":"m","scope":"aircraft","src":["C17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ"},
  "gearing": {"v":3.88,"u":"rad/m","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ±20 deg ต่อ stick ±90 mm"},
  "Ch_delta": {"v":-0.1719,"u":"1/rad","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: -0.0030/deg (Frise/balance) ให้ 24.9 lbf ที่ aileron เต็ม 95 kt แต่ 62 lbf ที่ 150 kt (ρ 1.225, c6_misc.mjs) ดังนั้นด้วย F_full 30 lbf จะได้ aileron สูงสุดราว 9.7 deg ที่ 150 kt ซึ่งเป็นข้อจำกัดเชิงแรงที่สมจริง"},
  "Ch_alpha": {"v":-0.0573,"u":"1/rad","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: -0.0010/deg; ผลรวมสองข้างหักล้างกันเมื่อสมมาตร"},
  "tab_max": {"v":10,"u":"deg","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: aileron trim เพื่อแรงบิดเครื่อง (6.4 lbf ที่ 80 kt กำลังเต็ม > 5 lbf)"},
  "trim_rate": {"v":1,"u":"deg/s","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ"},
  "breakout": {"v":3,"u":"N","scope":"aircraft","src":["C18","C19"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: GA friction aileron > 2 lbf"},
  "stops": {"v":{"max":20},"u":"deg","scope":"aircraft","src":[],"conf":"กลาง","est":false,"note":"ค่าเดิม AC.daMax"},
  "rate_limit": {"v":80,"u":"deg/s","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ค่าเดิม"}
 },
 "yaw": {
  "architecture": {"v":{"kind":"reversible","input":"force"},"u":"-","scope":"aircraft","src":["C23"],"conf":"สูง","est":true,"note":"ค่าประมาณ: 737 rudder เป็น kind feel (feel and centering unit) [C25]"},
  "S_r": {"v":0.85,"u":"m2","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ"},
  "c_r": {"v":0.32,"u":"m","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ"},
  "gearing": {"v":4.85,"u":"rad/m","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ±25 deg ต่อ pedal ±90 mm"},
  "Ch_delta": {"v":-0.3438,"u":"1/rad","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: -0.0060/deg; 2.6 lbf/deg ที่ 95 kt"},
  "Ch_beta": {"v":-0.1146,"u":"1/rad","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: -0.0020/deg ใช้ beta ที่หางดิ่ง"},
  "slipstream_q_ratio": {"v":[1,2],"u":"-","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ช่วงของ qbar_v/qbar ตอนกำลังเต็ม รอผลหัวข้อ slipstream"},
  "tab_max": {"v":15,"u":"deg","scope":"aircraft","src":["C18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: rudder trim สำหรับ P-factor/swirl"},
  "trim_rate": {"v":1.5,"u":"deg/s","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ"},
  "breakout": {"v":13.3,"u":"N","scope":"aircraft","src":["C14"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: 3 lbf อยู่ในช่วง 1–7 lbf ของ MIL-F-8785 Class II-C"},
  "stops": {"v":{"max":25},"u":"deg","scope":"aircraft","src":[],"conf":"กลาง","est":false,"note":"ค่าเดิม AC.drMax"},
  "rate_limit": {"v":60,"u":"deg/s","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ค่าเดิม"}
 },
 "reference_types": {
  "b737_rudder_rate": {"v":{"dual":66,"primaryOnly":33},"u":"deg/s","scope":"aircraft","src":["C25"],"conf":"กลาง","est":false,"note":"737-300 main rudder PCU"},
  "b737_rudder_pedal_force_full": {"v":311,"u":"N","scope":"aircraft","src":["C25"],"conf":"กลาง","est":false,"note":"≈ 70 lbf ที่ rudder เต็ม; blowdown 14–21 deg"},
  "b737_yaw_damper_authority": {"v":3,"u":"deg","scope":"aircraft","src":["C25"],"conf":"กลาง","est":false,"note":"series yaw damper ไม่ขยับ pedal"},
  "b737max_stab_rate_flaps_down": {"v":0.27,"u":"deg/s","scope":"aircraft","src":["C24"],"conf":"สูง","est":false,"note":"อัตรา Speed Trim/MCAS แฟลปลง"},
  "atr72_aileron": {"v":{"maxDeflection":14,"wheelForceDesignMax_lbf":60,"apRateMonitor":3.6},"u":"deg, lbf, deg/s","scope":"aircraft","src":["C31"],"conf":"สูง","est":false,"note":"ไม่มีไฮดรอลิก, geared balance tab"}
 },
 "requirements": {
  "part23_force_limits": {"v":{"temporary":{"pitch_stick":60,"roll_stick":30,"pitch_wheel2":75,"roll_wheel2":50,"pitch_wheel1":50,"roll_wheel1":25,"yaw":150},"prolonged":{"pitch":10,"roll":5,"yaw":20}},"u":"lbf","scope":"sim","src":["C1","C11"],"conf":"สูง","est":false,"note":"14 CFR 23.143(c) Amdt 23-50; ASTM F3173-23 Table 1 ใช้ค่าเดียวกันสำหรับ Level 1 ที่ VS0 > 45 KCAS และ Level 2–4 (Level 1 ที่ VS0 ≤ 45 KCAS ใช้ตารางที่เบากว่า: stick 200/100 N, pedal 400 N, prolonged 20/15/100 N)"},
  "part25_force_limits": {"v":{"short2":{"pitch":75,"roll":50},"short1":{"pitch":50,"roll":25},"shortYaw":150,"long":{"pitch":10,"roll":5,"yaw":20}},"u":"lbf","scope":"sim","src":["C8"],"conf":"สูง","est":false,"note":"14 CFR 25.143(d)"},
  "part23_maneuver_force_min": {"v":{"wheel":{"perWeight":0.01,"min":20,"cap":50},"stick":{"perWeight":0.007142857142857143,"min":15,"cap":35}},"u":"lbf (W in lbf)","scope":"sim","src":["C2","C11"],"conf":"สูง","est":false,"note":"23.155: แรงถึง limit load factor"},
  "mil8785c_fs_per_g_centre_stick": {"v":{"L1":{"maxNum":240,"maxCap":28,"maxFloorNum":56,"minNum":21,"minFloor":3},"L2":{"maxNum":360,"maxCap":42.5,"maxFloorNum":85,"minNum":18,"minFloor":3},"L3":{"max":56,"minNum":12,"minFloor":2}},"u":"lbf/g","scope":"sim","src":["C12","C13"],"conf":"กลาง","est":false,"note":"max = min(num/(n/alpha), cap) แต่ไม่ต่ำกว่า floorNum/(nL-1); min = max(minNum/(nL-1), floor)"},
  "mil8785c_fs_per_g_wheel_L1": {"v":{"maxNum":500,"maxCap":120,"maxFloorNum":120,"minNum":35,"minFloor":6},"u":"lbf/g","scope":"sim","src":["C12"],"conf":"กลาง","est":false,"note":"Level 1 wheel"},
  "force_per_deflection_min_catA": {"v":{"stickOrWheel_lbf_per_in":5,"sidestick_lbf_per_deg":2},"u":"mixed","scope":"sim","src":["C12"],"conf":"กลาง","est":false,"note":"MIL-F-8785C 3.2.2.2.2"},
  "speed_stability_return": {"v":{"part23":0.1,"part25_cruise":0.075,"part25_other":0.1,"maxForceConsidered_lbf":40},"u":"fraction","scope":"sim","src":["C4","C9"],"conf":"สูง","est":false,"note":"23.173(b), 25.173(b)"},
  "part25_min_speed_gradient": {"v":0.1667,"u":"lbf/kt","scope":"sim","src":["C9"],"conf":"สูง","est":false,"note":"1 lbf ต่อ 6 kt"},
  "time_delay_levels": {"v":[0.1,0.2,0.25],"u":"s","scope":"sim","src":["C14"],"conf":"สูง","est":false,"note":"MIL-F-8785C 3.5.3 Level 1/2/3"},
  "surface_lag_levels": {"v":{"L12_catAC":30,"L12_catB":45,"L3":60},"u":"deg","scope":"sim","src":["C14"],"conf":"กลาง","est":false,"note":"MIL-F-8785B 3.5.3 (อ้างผ่าน DOT/FAA/AR-07/47)"},
  "pedal_breakout": {"v":{"classIIC":[1,7],"classIIL_III":[1,14]},"u":"lbf","scope":"sim","src":["C14"],"conf":"กลาง","est":false,"note":"II-C และ II-L จาก MIL-F-8785(ASG) 3.2.1; Class III จาก MIL-F-8785B 3.5.2.1 (Level 1–2, ค่าบน x2 ที่ Level 3); อ้างผ่าน DOT/FAA/AR-07/47 §10.2"}
 },
 "input": {
  "force_full_scale": {"v":{"pitch":267,"roll":133,"yaw":667},"u":"N","scope":"sim","src":["C1"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: โปรไฟล์สมจริง = ขีดชั่วคราว 23.143; โปรไฟล์ง่ายใช้ครึ่งหนึ่ง"},
  "deadzone_gamepad": {"v":0.08,"u":"-","scope":"sim","src":["C28"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: สเปกไม่กำหนด dead zone"},
  "deadzone_touch": {"v":0.04,"u":"-","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ"},
  "expo": {"v":0.5,"u":"-","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: f(u) = (1-e)u + e u^3"},
  "keyboard_force_ramp": {"v":{"up":45,"release":180,"max":89},"u":"N/s, N/s, N","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: กดค้าง ≈ 10 lbf/s ถึง 20 lbf"},
  "auto_trim_ref_force": {"v":11.1,"u":"N","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 2.5 lbf; แรงที่ auto-trim ใช้อัตราเต็ม ให้ time constant 3.1 s ที่ 95 kt (1.0 deg/s) และ 2.5 s ที่ 150 kt (0.5 deg/s) จาก c6_rev_check.mjs; ต้องมากกว่า breakout 4.45 N ไม่เช่นนั้นย่านเชิงเส้นหายไป"},
  "force_display_marks": {"v":{"pitch":[10,40,60],"roll":[5,30],"yaw":[20,150]},"u":"lbf","scope":"sim","src":["C1","C4"],"conf":"สูง","est":false,"note":"ขีดบนแถบแสดงแรง"},
  "trim_alert": {"v":{"force_lbf":2,"hold_s":3},"u":"lbf, s","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: แสดง \"ต้อง trim\""}
 }
}}
```

## 6.9 กรณีทดสอบ
ทุกกรณีใช้ `test/harness.mjs` ลมสงบ ISA ระดับต่ำ เริ่มจาก `Flight({ pilot: 'man', assist: false, autoThr: false, dist: 14000 })` เว้นแต่ระบุ ค่าคาดหวังคำนวณด้วยสคริปต์ `c6_*.mjs` ใน `scripts/` (`c6_axis_check.mjs` เป็นต้นแบบของ `test/controls.test.mjs`)

| ID | สิ่งที่ทดสอบ | การตั้งค่า | ผลที่คาดหวัง (± tolerance) | ที่มาของค่าคาดหวัง | โมเดลปัจจุบัน |
|---|---|---|---|---|---|
| T-C-01 | `air.nz` | trim 95 kt ร่อน 3° (θ ≈ −1.24°, φ = 0) | 1.00 ± 0.02 | ฟิสิกส์: ในการบินคงตัว specific force = −gravity จึงได้ $n_z$ แกน body $= \cos\theta\cos\phi$ = 0.9998 (ส่วน $L/W \approx \cos\gamma$ = 0.9986 เป็นแกนลม) | 0 (ค่าคงที่, 20-flight.js:291) |
| T-C-02 | ความเร็วกลับ trim เมื่อปล่อยคัน (DIRECT) | ดึง 15 % 4 s แล้วปล่อย (และดัน), รัน 120 s | IAS เฉลี่ย 40 s สุดท้าย อยู่ใน 95 ± 9.5 kt (±10 %) | 23.173(b) [C4] | ไม่ผ่าน: ค้าง 80.5 kt / 109.4 kt; ตรึง trim แล้วผ่าน 95.0 / 94.8 kt |
| T-C-03 | Force-command ปล่อยมือถือ trim | trim tab ตั้งให้แรงศูนย์ที่ 95 kt, $F$ = 0 นาน 120 s | IAS 95 ± 2 kt ตลอด | สมดุล $C_h$ = 0 | ยังไม่มีฟีเจอร์ (ต้นแบบ 94.8–95.0) |
| T-C-04 | ความเร็วที่สมดุลกับแรงค้าง | แรงสุทธิหลัง breakout 1 lbf ดึง / ดัน 60 s | ดึง 87.6 ± 2 kt; ดัน 101.8 ± 2.5 kt | $F(V)=K(1-V^2/V_0^2)$, $K$ = 6.7 lbf (`c6_hinge.mjs`) | ยังไม่มีฟีเจอร์ (ต้นแบบ 88.0 / 101.5) |
| T-C-05 | Stick force per g (วิเคราะห์) | สูตร 6.2.5 ที่ 95 kt แฟลปลง, 110 และ 150 kt แฟลปเก็บ | 39.7 N/g ± 5 % ทุกจุด (ต่างกันไม่เกิน 3 %); อยู่ใน 4.2–28 lbf/g; แรงถึง 6 g อยู่ใน 35–60 lbf | [C12] Table V, [C2], [C1] | ยังไม่มีฟีเจอร์ (DIRECT ปัจจุบัน: คัน 0.43 / 0.27 ต่อ g ที่ 95 / 120 kt) |
| T-C-06 | Pull-up 6-DOF ด้วยแรง | 120 kt แฟลปเก็บ ล้อเก็บ, step ดึง 39.7 N ที่ t = 0.5 s | Δnz สูงสุด 1.00 ± 0.15 ภายใน 3 s | T-C-05 | ยังไม่มีฟีเจอร์ (ต้นแบบ 1.009 ที่ 2.25 s) |
| T-C-07 | ความชันแรงตามความเร็ว stick-free | trim 95 kt แฟลปลง, tab คงที่, กวาด 80–110 kt | dF/dV = 0.63 N/kt ± 15 %; ดึงทุกจุดที่ช้ากว่า trim ดันทุกจุดที่เร็วกว่า | 23.173(a) [C4], `c6_hinge.mjs` | ยังไม่มีฟีเจอร์ |
| T-C-08 | Free-elevator factor และ static margin | ค่าใน JSON | $F_e$ 0.817 ± 0.01; SM 0.150 ± 0.005; SM′ 0.099 ± 0.005 | สมการ 6.2.3 | ยังไม่มีฟีเจอร์ (SM stick-fixed ของ `AC` = 0.150) |
| T-C-09 | ช่วง trim tab | tab แรงศูนย์ที่ 71 kt แฟลปลง และ 230 kt แฟลปเก็บ | +12.9° ± 0.5° และ −4.7° ± 0.5°; ทั้งคู่อยู่ใน ±20° | `c6_misc.mjs` | ยังไม่มีฟีเจอร์ |
| T-C-10 | อัตรา trim | กดปุ่ม trim เชิดหัว 1 s ที่ 95 kt แฟลปลง แล้วปล่อยมือ | tab +1.0° ± 0.02°; ความเร็ว trim ใหม่ช้าลง 5.6 ± 1.0 kt | `c6_misc.mjs` | ยังไม่มีฟีเจอร์ |
| T-C-11 | `autoTrim()` | `FtrimRef` 11.1 N, `Fbo` 4.45 N, แฟลปลง: ป้อน `Fv` คงที่ +44.5 N (10 lbf) 2 s แล้วตั้ง `Fv` = 8 N 1 s แล้ว `Fv` = 3 N 1 s | tab เพิ่ม 2.0° ± 0.05° ใน 2 s แรก, เพิ่มอีก 0.72° ± 0.01° (8/11.1 × 1.0°/s) ใน 1 s ถัดมา แล้วหยุด (abs(Fv) < breakout) | สมการ 6.4.2 | ยังไม่มีฟีเจอร์ (ASSIST ไม่มี trim) |
| T-C-12 | Equivalent time delay ของเส้นทางคีย์บอร์ด | step δe −4° ที่ 120 kt เทียบ step ในอุดมคติ, fit time shift ของ q(t) 0–2.5 s | ≤ 0.10 s (Level 1); คาด 0.04 ± 0.02 s | [C14] | ผ่าน: 0.042 s (actuator อย่างเดียว 0.025 s) |
| T-C-13 | Describing function ของ rate limiter | ไซน์ A = 10°, R = 70°/s, ω = 2 ω_on | gain 0.637 ± 0.01; phase −38.2° ± 1° | คำนวณเอง (`c6_delay.mjs`) | ผ่าน (อัลกอริทึมเดียวกับ `rate()` ใน `actuators()`) |
| T-C-14 | Shaping ของ gamepad | $d$ 0.08, $e$ 0.5 | f(0.08) = 0, f(0.5) = 0.2758 ± 0.0005, f(±1) = ±1, เป็นฟังก์ชันคี่และเพิ่มขึ้นทางเดียว | สมการ 6.7.2 | ยังไม่มีฟีเจอร์ (ไม่มี Gamepad API) |
| T-C-15 | ความต้องการ rudder/aileron trim | 80 kt กำลังเต็ม α 10° (หลังใส่ผลใบพัดของหัวข้อ 3) | ก่อน trim: pedal 5–10 lbf, aileron 6.4 ± 1 lbf; หลัง trim ทั้งคู่ < 1 lbf | `c6_misc.mjs`, 23.143 prolonged [C1] | ยังไม่มีฟีเจอร์ (ยังไม่มี P-factor/แรงบิดด้วย) |

## 6.10 ความขัดแย้งของแหล่งข้อมูลและข้อจำกัด
- **MIL-F-8785C Table V และตาราง breakout:** สำเนาที่มีชั้นข้อความ [C12] ให้ตาราง Table V ที่เพี้ยนบางช่อง (Level 2 centre stick สูงสุดแสดง 28.0 แต่เชิงอรรถบอก 42.5; Level 2 wheel ต่ำสุดแสดงซ้ำกับ stick) และขาดหมวด 3.5–3.6 (breakout, delay, trim) ส่วนสำเนาอื่น (everyspec, IIT, DTIC) เป็นภาพสแกนที่อ่านไม่ได้ ค่า delay และ lag จึงอ้างผ่านรายงาน FAA [C14] ซึ่งเป็นแหล่งทุติยภูมิเชิงปฐมภูมิ (รายงานรัฐบาลที่ยกข้อความมา) ค่า breakout ของ pitch/roll ยังไม่ยืนยัน
- **ความชันแรงตามความเร็ว:** Part 25 ต้องการ ≥ 1 lbf/6 kt [C9] แต่ Part 23 เดิมไม่มีตัวเลข [C4] และ C150 ที่ได้ certificate วัดได้เพียง 0.045–0.15 lbf/kt [C20] Bromfield ชี้ว่าเครื่องเล็กยังไม่มีเกณฑ์ขั้นต่ำ [C21] และใช้ 1 lbf/6 kt เป็นค่า "moderate" ในการทดลองภาระทางใจ [C30] ค่าที่เสนอ (0.09–0.14 lbf/kt) จึงผ่าน Part 23 แต่เบากว่าเกณฑ์ Part 25
- **Stick force per g:** NACA 927 เสนอ < 8 lbf/g สำหรับเครื่องหลบหลีกมาก [C15] แต่ 23.155 ต้องการ ≥ 7 lbf/g ($n_L$ 6) หรือ ≥ 10.3 lbf/g ($n_L$ 4.4) สำหรับเครื่องหนัก 4,960 lb [C2] ส่วน GA แบบ wheel ใน TN D-3726 อยู่ที่ 19–35 lbf/g [C18] ค่าที่เลือก 8.9 lbf/g ทำให้ต้อง**สมมุติประเภท aerobatic ($n_L$ = +6)** ซึ่งเป็นสมมุติฐานใหม่ของหัวข้อนี้
- **Spring tab ของ turboprop ภูมิภาค:** โจทย์ตั้งไว้ว่า turboprop ภูมิภาคใช้ spring tab แต่รายงาน NTSB ระบุว่า aileron ของ ATR 72 ใช้ "geared trailing edge balance tabs" และไม่ได้กล่าวถึง spring tab [C31, p. 19] จึงแก้เป็น balance tab สำหรับ ATR 72 ส่วน elevator/rudder ของ ATR ยังไม่ได้ตรวจ
- **ค่า $C_h$:** แหล่งต่างกันได้ 1.5 เท่า ($C_{h\delta}$ −0.007 [C15], −0.0076 [C16], −0.0085 ถึง −0.0108 [C17] ต่อองศา) และ $C_h$ ไม่เป็นเชิงเส้นที่มุมมาก [C17, Table 2.2] โมเดลเชิงเส้นจะให้แรงต่ำไปเล็กน้อยที่มุมใหญ่
- **ขีดแรงของ ATR 72:** ออกแบบให้ wheel < 60 lbf [C31, p. 19] แต่การวิเคราะห์จากอุโมงค์ลมกรณีสันน้ำแข็งหน้า aileron (รายงานเรียกว่า "very conservative") ประเมินว่าที่ 175 KIAS ต้องใช้ราว 56 lbf เพื่อรักษาปีกระดับ [C31, p. 39] แสดงว่าขีดแรงเป็นสิ่งที่ sim ของเครื่องกลไกต้องแสดง
- **เอกสารโครงการ:** CLAUDE.md เขียนว่าคีย์ "binary (no proportional ramp yet)" แต่ 90-app.js:362 มี ramp แล้ว (2.0–2.5 /s เข้า 5 /s คืน)
- **ข้อจำกัดของการค้น:** eCFR ปฏิเสธ robots และ curl ถูก proxy ปิด จึงใช้ CFR ฉบับปี 2011 จาก govinfo (ก่อน Amdt 23-64) และ LII สำหรับฉบับปัจจุบัน; AC 23-8C แปลงข้อความได้เฉพาะสารบัญ จึงไม่มีตัวเลข runaway delay หรืออัตรา trim ของ FAA; อัตรา actuator ของ A320 และรายละเอียด sidestick ไม่พบแหล่งสาธารณะที่เปิดได้; time delay วัดเฉพาะส่วนจำลอง ไม่รวม render และจอ; ทุกเรขาคณิตของพื้นบังคับเป็นค่าประมาณ

## 6.11 แหล่งอ้างอิง
1. [C1] US FAA/OFR, 14 CFR §23.143 General (Amdt 23-50, 1996), CFR 2011 ed., https://www.govinfo.gov/content/pkg/CFR-2011-title14-vol1/pdf/CFR-2011-title14-vol1-sec23-143.pdf — ปฐมภูมิ · US Government work (public domain) · อ้างและคัดลอกตัวเลข/ข้อความได้
2. [C2] 14 CFR §23.155 Elevator control force in maneuvers (Amdt 23-50), https://www.govinfo.gov/content/pkg/CFR-2011-title14-vol1/pdf/CFR-2011-title14-vol1-sec23-155.pdf — ปฐมภูมิ · public domain · ใช้ได้เต็มที่
3. [C3] 14 CFR §23.161 Trim, https://www.govinfo.gov/content/pkg/CFR-2011-title14-vol1/pdf/CFR-2011-title14-vol1-sec23-161.pdf — ปฐมภูมิ · public domain · ใช้ได้เต็มที่
4. [C4] 14 CFR §23.173 Static longitudinal stability, https://www.govinfo.gov/content/pkg/CFR-2011-title14-vol1/pdf/CFR-2011-title14-vol1-sec23-173.pdf — ปฐมภูมิ · public domain · ใช้ได้เต็มที่
5. [C5] 14 CFR §23.175 Demonstration of static longitudinal stability, https://www.govinfo.gov/content/pkg/CFR-2011-title14-vol1/pdf/CFR-2011-title14-vol1-sec23-175.pdf — ปฐมภูมิ · public domain · ใช้ได้เต็มที่
6. [C6] 14 CFR §23.677 Trim systems, https://www.govinfo.gov/content/pkg/CFR-2011-title14-vol1/pdf/CFR-2011-title14-vol1-sec23-677.pdf — ปฐมภูมิ · public domain · ใช้ได้เต็มที่
7. [C7] 14 CFR §23.397 Limit control forces and torques, https://www.govinfo.gov/content/pkg/CFR-2011-title14-vol1/pdf/CFR-2011-title14-vol1-sec23-397.pdf — ปฐมภูมิ · public domain · ใช้ได้เต็มที่
8. [C8] 14 CFR §25.143 Controllability and maneuverability (ฉบับปัจจุบัน ถึง Amdt 25-140) ผ่าน Cornell LII, https://www.law.cornell.edu/cfr/text/14/25.143 — ข้อความปฐมภูมิที่ LII ทำซ้ำ (eCFR เปิดไม่ได้) · public domain · ใช้ได้เต็มที่
9. [C9] 14 CFR §25.173 Static longitudinal stability, https://www.govinfo.gov/content/pkg/CFR-2011-title14-vol1/pdf/CFR-2011-title14-vol1-sec25-173.pdf — ปฐมภูมิ · public domain · ใช้ได้เต็มที่
10. [C10] 14 CFR §23.2135 Controllability และ §23.2140 Trim (Part 23 หลัง Amdt 23-64) ผ่าน LII, https://www.law.cornell.edu/cfr/text/14/23.2135 และ https://www.law.cornell.edu/cfr/text/14/23.2140 — ปฐมภูมิ (ทำซ้ำ) · public domain · ใช้ได้เต็มที่
11. [C11] ASTM International, F3173/F3173M-23 Standard Specification for Aircraft Handling Characteristics (preview), https://cdn.standards.iteh.ai/samples/115555/2ba20a7083964b68bb3fc06d4d87da6f/ASTM-F3173-F3173M-23.pdf — ปฐมภูมิ (ตัวอย่างบางส่วน) · proprietary © ASTM · อ้างตัวเลขเป็นข้อเท็จจริงได้ ห้ามคัดลอกตาราง/ข้อความ
12. [C12] US DoD, MIL-F-8785C Military Specification: Flying Qualities of Piloted Airplanes, 5 Nov 1980; สำเนาที่มีข้อความ http://www2.coe.pku.edu.cn/tpic/2011971042474.pdf, หน้าดัชนี https://everyspec.com/MIL-SPECS/MIL-SPECS-MIL-F/MIL-F-8785C_5295/ — ปฐมภูมิ · เอกสารรัฐบาลสหรัฐ (public domain ในสหรัฐ) แต่สำเนาที่เปิดได้ไม่แสดง distribution statement และ statement "Approved for public release" ที่เห็นเป็นของ user guide [C13] ไม่ใช่ของ 8785C เอง (สถานะเผยแพร่ของ 8785C: ยังไม่ยืนยันจากสำเนาที่เปิด) · อ้างตัวเลขและสมการได้; ลิงก์ไปยัง everyspec แทนการเก็บสำเนา (หน้า everyspec ไม่ได้เปิดในรอบตรวจนี้)
13. [C13] D. J. Moorhouse, R. J. Woodcock, Background Information and User Guide for MIL-F-8785C, AFWAL-TR-81-3109, 1982, https://apps.dtic.mil/sti/tr/pdf/ADA119421.pdf — ปฐมภูมิ · approved for public release · ใช้ได้
14. [C14] R. A. Hess, Certification Standards and Design Issues for Rudder Control Systems in Transport Aircraft, DOT/FAA/AR-07/47, March 2008 (Final Report), สำเนาในคลัง govdocs1 ของ Apache Tika https://corpora.tika.apache.org/base/docs/govdocs1/043/043238.pdf — ปฐมภูมิ (รายงาน FAA ที่ยกข้อความ MIL-F-8785/8785B/8785C) · รายงานที่รัฐบาลสหรัฐเผยแพร่สาธารณะ แต่ผู้เขียนเป็นนักวิจัยมหาวิทยาลัย (UC Davis) ภายใต้ทุน FAA จึงอาจไม่ใช่ US-Government work โดยตรง (ส่วนที่เปิดไม่ระบุลิขสิทธิ์) · อ้างข้อเท็จจริงและตัวเลขได้
15. [C15] W. H. Phillips, Appreciation and Prediction of Flying Qualities, NACA Report 927, 1949, https://ntrs.nasa.gov/api/citations/19930091992/downloads/19930091992.pdf — ปฐมภูมิ · US Government work · ใช้สมการและตัวเลขได้
16. [C16] M. B. Ames Jr., R. I. Sears, Determination of Control-Surface Characteristics from NACA Plain-Flap and Tab Data, NACA Report 721, 1941, https://ntrs.nasa.gov/api/citations/19930091799/downloads/19930091799.pdf — ปฐมภูมิ · US Government work · ใช้ได้
17. [C17] H. Eijsink, M. Rice (PI J. Roskam), Final Report for a Study of Low-Cost Reliable Actuators for Light Aircraft, KU-FRL-351 (NASA grant NSG 1421), 1978, https://ntrs.nasa.gov/api/citations/19780012167/downloads/19780012167.pdf — ปฐมภูมิ · งานที่รัฐบาลสหรัฐให้ทุน เผยแพร่บน NTRS · อ้างตัวเลขได้
18. [C18] M. R. Barber, C. K. Jones, T. R. Sisk, F. W. Haise, An Evaluation of the Handling Qualities of Seven General-Aviation Aircraft, NASA TN D-3726, 1966, https://ntrs.nasa.gov/api/citations/19660030615/downloads/19660030615.pdf — ปฐมภูมิ · US Government work · ใช้ได้
19. [C19] N. M. McFadden, R. F. Vomaske, D. R. Heinle, Flight Investigation Using Variable-Stability Airplanes of Minimum Stability Requirements for High-Speed, High-Altitude Vehicles, NASA TN D-779, 1961, https://ntrs.nasa.gov/api/citations/20040006333/downloads/20040006333.pdf — ปฐมภูมิ · US Government work · ใช้ได้
20. [C20] M. A. Bromfield, G. B. Gratton, Factors affecting the apparent longitudinal stick-free static stability of a typical high-wing light aeroplane (Brunel Flight Safety Laboratory; ไฟล์ใน repository ของ Coventry University ชื่อไฟล์ระบุ "Journal Paper 2010 v5 final" ส่วนชื่อวารสาร ปีที่พิมพ์ และสถานะ accepted manuscript/peer review ยังไม่ยืนยันจากไฟล์ที่เปิด), https://pure.coventry.ac.uk/ws/portalfiles/portal/24534209/Bromfield_Gratton_Longstab_Journal_Paper_2010_v5_final.pdf — ปฐมภูมิ (ข้อมูลบินทดสอบ) · ไม่พบ license เปิดในไฟล์ จึงถือเป็นลิขสิทธิ์ผู้แต่ง/ผู้พิมพ์ · อ้างตัวเลขได้ ห้ามคัดลอกตาราง
21. [C21] M. A. Bromfield, Criteria for Acceptable Stick Force Gradients of a Light Aeroplane, PhD thesis, Brunel University, 2012, https://core.ac.uk/download/9633377.pdf — ทุติยภูมิ/วิทยานิพนธ์ · ลิขสิทธิ์ผู้แต่ง · อ้างได้
22. [C22] D. H. Klyde, D. T. McRuer, T. T. Myers, Unified Pilot-Induced Oscillation Theory Vol. I, WL-TR-96-3028, 1995, https://apps.dtic.mil/sti/pdfs/ADA307580.pdf — ปฐมภูมิ · approved for public release · ใช้ได้
23. [C23] FAA, Pilot's Handbook of Aeronautical Knowledge FAA-H-8083-25 (ระบุว่าเป็นฉบับ C; ส่วนที่เปิดได้ไม่แสดงเลขฉบับ จึงยังไม่ยืนยันว่า B หรือ C), Ch. 6 Flight Controls, https://www.faa.gov/sites/faa.gov/files/08_phak_ch6.pdf — ปฐมภูมิ (คู่มือรัฐ) · public domain · ใช้ได้
24. [C24] FAA, Summary of the FAA's Review of the Boeing 737 MAX, 18 Nov 2020, https://www.faa.gov/sites/faa.gov/files/2022-08/737_RTS_Summary.pdf — ปฐมภูมิ · US Government work · ใช้ได้
25. [C25] Boeing, เอกสารวิเคราะห์ระบบ rudder 737 (ชื่อไฟล์ "Boeing rudder system scenarios"; เนื้อหาอ้าง "Boeing Contribution to the USAir Flight 427 Accident Investigation, October 1996" ส่วนชื่อเรื่อง วันที่ และผู้แต่งที่พิมพ์บนเอกสารยังไม่ยืนยันจากส่วนที่เปิด; ตัวเลขอยู่ที่ pp. 26–31: อัตรา PCU p. 29, แรงเหยียบและ feel unit p. 27, blowdown p. 31) เผยแพร่โดย FAA Lessons Learned, https://www.faa.gov/sites/faa.gov/files/2022-11/Boeing%20rudder%20system%20scenarios.pdf — ปฐมภูมิ (เอกสารผู้ผลิต) · ลิขสิทธิ์ผู้ผลิต · อ้างตัวเลขได้ ห้ามคัดลอก
26. [C26] FAA, Special Conditions No. 25-881-SC, Dassault Falcon 10X; side stick limit pilot forces, Federal Register 2025-16081, 22 Aug 2025, https://www.govinfo.gov/content/pkg/FR-2025-08-22/html/2025-16081.htm — ปฐมภูมิ · public domain · ใช้ได้ (อ้างเฉพาะข้อเท็จจริงทั่วไปของ sidestick ไม่จำลองเครื่องแบบนี้)
27. [C27] BEA, Final Report on the accident of 1 June 2009, Airbus A330-203 F-GZCP (English), 2012, https://www.faa.gov/sites/faa.gov/files/f-cp090601.en_.pdf — ปฐมภูมิ · เอกสารรัฐฝรั่งเศส (เผยแพร่สาธารณะ) · อ้างข้อเท็จจริงได้
28. [C28] W3C, Gamepad (Editor's Draft), https://w3c.github.io/gamepad/ — ปฐมภูมิ · W3C Software and Document License ตามไฟล์ https://github.com/w3c/gamepad/blob/gh-pages/LICENSE.md (อนุญาตกว้าง ต้องคงข้อความลิขสิทธิ์เมื่อคัดลอก) · อ้างและใช้ชื่อ API ได้เต็มที่
29. [C29] JSBSim-Team, `aircraft/c172x/c172x.xml`, https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/aircraft/c172x/c172x.xml — ปฐมภูมิ (โมเดลเปิด) · fileheader ของไฟล์ระบุ licenseName "GPL (General Public License)" (ต่างจากตัว JSBSim engine ที่เป็น LGPL-2.1) · อ้างแนวคิดและค่าตัวเลขได้ ห้ามคัดลอกไฟล์หรือบล็อก XML เข้า repo ที่ยังไม่มี license (ถ้าคัดลอก repo ต้องเป็น GPL)
30. [C30] M. A. Bromfield, G. B. Gratton, M. S. Young, The Effects of Stick Force Gradient on Pilot Mental Demand, AIAA Atmospheric Flight Mechanics Conference, Kissimmee FL, Jan 2015, AIAA 2015-0751, doi:10.2514/6.2015-0751 (post-print ใน repository ของ Coventry), https://core.ac.uk/download/228146295.pdf — ปฐมภูมิ (บทความประชุมวิชาการ) · ลิขสิทธิ์ผู้แต่ง/เจ้าของลิขสิทธิ์ (repository อนุญาตเฉพาะสำเนาเพื่อการศึกษาไม่เชิงพาณิชย์) · อ้างข้อเท็จจริงได้ ห้ามคัดลอกยาว
31. [C31] NTSB, In-flight Icing Encounter and Loss of Control, ATR 72-212 N401AM, Roselawn IN, 31 Oct 1994, AAR-96/01, https://www.ntsb.gov:443/investigations/AccidentReports/Reports/AAR9601.pdf — ปฐมภูมิ · US Government work · ใช้ได้

## 6.12 งานที่แนะนำสำหรับ Claude Code
ทำบน branch แล้วเปิด PR ตาม CLAUDE.md เพราะเปลี่ยน flight model และต้องรัน `flight`, `assist`, `stall`, `runways`, `geo` เดิมให้ผ่านทุกครั้ง

1. **P1 · S** คำนวณ `air.nz` ใน `updateAir()` จาก specific force แกน body (ให้ HUD และการทดสอบใช้) — T-C-01
2. **P1 · S** เอา integrator `trimDe += 0.25·q·dt` ออกจาก DIRECT แล้วแทนด้วยสถานะ trim ที่ปรับด้วยปุ่ม (ยังเป็น position-command ได้ในขั้นนี้) แก้ speed stability ทันที — T-C-02
3. **P1 · M** เพิ่ม `ControlAxis` (6.7.4) และ `AC.ctrl.pitch` จาก JSON 6.8; DIRECT ใช้ force-command, คำนวณ `Fv` ทุกโหมด, breakout, สปริงกลางที่จางตาม $\bar q$ — T-C-03, T-C-04, T-C-05, T-C-06, T-C-07, T-C-08, T-C-09
4. **P1 · S** ปุ่ม trim (อัตราตามแฟลป), ตัวบอกตำแหน่ง trim และ auto-trim บน `Fv` ใน ASSIST (และตัวเลือกมือใหม่ใน DIRECT) — T-C-10, T-C-11
5. **P2 · M** ชั้นอินพุตใน 90-app.js: Gamepad API (dead zone, expo, สเกลแรง, โปรไฟล์สมจริง/ง่าย), คีย์บอร์ดแบบ ramp แรง, จอสัมผัสใช้สูตรเดียวกัน, ปุ่มแฟลป/ล้อ/เบรกแยก, ข้อความไทย — T-C-14, T-C-12
6. **P2 · S** แถบแสดงแรงบน HUD (ขีด 10/40/60 lbf), ไอคอน "ต้อง trim", rumble ตอน buffet — ตรวจในเบราว์เซอร์ + ค่าที่แสดงตรงกับ T-C-05
7. **P2 · M** ทำ roll และ yaw เป็น `ControlAxis` พร้อม aileron/rudder trim หลังจากหัวข้อใบพัด (P-factor, แรงบิด) เข้าโค้ดแล้ว — T-C-15
8. **P3 · S** เก็บ unit test ของ rate limiter และงบ time delay ไว้กัน regression (เช่น ห้ามใส่ smoothing ที่ทำให้เกิน 0.10 s) — T-C-12, T-C-13
9. **P3 · M** วางรูปแบบ `kind: 'feel'` (737: feel unit + stabilizer trim + actuator rate จริง) และ `kind: 'fbw'` (A320: nz/C* law + auto-trim THS) ให้รอบ 3 เติม — ใช้ค่า `reference_types` ใน 6.8 และทดสอบใหม่ในรอบ 3
