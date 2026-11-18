# 5. เครื่องยนต์เทอร์โบแฟน: thrust lapse, spool-up, idle และ reverser

← [กลับไปหน้ารวมรอบที่ 1](../01-flight-physics.md) · [schema พารามิเตอร์](schema.md)

> ความเชื่อมั่นโดยรวม: กลาง · แหล่งหลัก: 14 CFR 33.73 / 25.119 / 25.109 / 25.125 / 33.97 [F1–F7], Bartel & Young 2008 ผ่านโค้ด OpenAP และข้อมูล ICAO EEDB [F10, F11], NASA TM-2009-215668 (ผลตอบสนองของเครื่องยนต์) [F17], FAA AC 25-32 และ AC 91-79B (reverser กับระยะลงจอด) [F22, F23]

## 5.0 สรุปสั้น
- **AirfieldLab ยังไม่มีเทอร์โบแฟนเลย** เส้นทางแรงขับเดียวที่มีคือ `thr × thrustAvail(V)` ซึ่งไม่ขึ้นกับความดัน ความหนาแน่น อุณหภูมิ หรือ Mach ผลที่วัดด้วย Node คือแรงขับที่ 10,000 ft (3,048 m) เท่ากับที่ระดับน้ำทะเลทุกประการ (อัตราส่วน 1.000) ใช้ lag อันดับหนึ่ง 1 s จึงไปถึง 50% ของแรงขับเต็มใน 0.65 s และ 95% ใน 2.95 s และสั่ง reverse ไม่ได้เพราะคำสั่งถูก clamp ไว้ที่ idle 0.045
- **thrust lapse ที่ควรใช้:** สำหรับการขึ้นบิน การลงจอด go-around และการไต่ช่วงต้น (M ≤ 0.45) ให้ใช้สมการ take-off ของ Bartel & Young (2008) ซึ่งขึ้นกับ BPR, p/p₀ และ M [F11] (ใช้สัมประสิทธิ์ตามที่ OpenAP เขียนไว้ [F10]) แล้วคูณด้วยตัวแก้ flat rating ตามอุณหภูมิ ห้ามใช้สูตร σⁿ ที่ความสูงต่ำ เพราะที่ VTBD ในวันร้อน ISA+20 สูตร σ^0.7 จะลดแรงขับไป 4.6% ทั้งที่เครื่องแบบ flat-rated เช่น PW1127G-JM ยังให้แรงขับเต็มจนถึง 47 °C [F16]
- **spool-up:** ใช้สถานะ N2 แบบ first-order ที่มีขีดจำกัดอัตราเร่งซึ่งขึ้นกับ N2 (accel schedule) แล้วตามด้วย lag ของพัดลม ค่าพารามิเตอร์ที่ปรับแล้วให้ flight idle → 95% ใน 4.6 s ซึ่งผ่านเกณฑ์ 5 s ของ 14 CFR 33.73(b) [F1] ให้ approach idle → 95% ใน 3.0 s และที่ 8 s ได้แรงขับเต็มตามแนวคิดของ 25.119 [F2] ส่วนช่วงกำลังปานกลางตรงกับตารางความเร็วพัดลมของ C-MAPSS ใน NASA TM-2009-215668 (N1 ของโมเดลซึ่งคิดจากแรงขับที่ผ่าน lag แล้ว: delay 0.66 s, rise 1.11 s, settling 1.95 s เทียบกับ 0.72 / 1.13 / 2.02 s) [F17]
- **idle มีสามระดับ** คือ ground idle, flight idle และ approach idle TCDS ของ PW1100G-JM แยกรอบต่ำสุดของ ground idle กับ flight idle ไว้ชัดเจน [F16] ค่า 7% ใน LTO cycle [F8] เป็นจุดทดสอบไอเสีย ไม่ใช่แรงขับ idle จริง แรงขับ idle ที่เหลืออยู่มีผลจริงต่อการลงจอด FAA ระบุว่าเครื่องยังให้ "residual thrust at idle rpm" [F21]
- **reverser:** สร้างเป็นเครื่องสถานะ (stowed → deploying → deployed → stowing) ที่มี interlock แบบ WOW เลื่อน sleeve 2 s เพิ่มกำลังได้หลัง deploy ≥ 90% ลดเป็น reverse idle ที่ 60 kt (30.9 m/s) [F24] และให้แรงหน่วง F₀₀(c₀ + c₁M) โดยปรับ c₀, c₁ จนอัตราส่วนระยะลงจอด "มี/ไม่มี reverse" ตรงกับ LDF ของ AC 91-79B (RCC 3: 0.79 เทียบกับ 0.78) [F23]
- **สิ่งที่ต้องสร้าง:** คลาส `TurbofanEngine` ที่ไม่ใช้ DOM และอาร์เรย์ `AC.engines[]` ที่มีตำแหน่งและทิศแรงขับของแต่ละเครื่อง เพื่อให้แรงขับไม่สมมาตร (engine-out, reverser ไม่ครบ) สร้างโมเมนต์หันเห (yaw) ได้เอง โครงนี้รองรับ 737-800, A320/A321 และ ATR (เครื่องใบพัดใช้หัวข้อ 3–4) ในรอบหลัง

## 5.1 สภาพปัจจุบันใน AirfieldLab
**สิ่งที่โค้ดทำอยู่**
- `src/20-flight.js:110` พารามิเตอร์เครื่องยนต์มีแค่ `P: 700e3, eta: 0.80, T0: 11500, idle: 0.045` และไม่มีตำแหน่งเครื่องยนต์ จำนวนเครื่อง หรือชนิดเครื่อง
- `src/20-flight.js:144` `thrustAvail(V) = T0·Vc/√(V²+Vc²)` รับแค่ความเร็ว ไม่รับ p, ρ, T หรือ M
- `src/20-flight.js:197–198` แรงขับ `T = thr·thrustAvail(V)` วางตามแกน x ของลำตัวผ่าน CG จึงไม่มีโมเมนต์จากแรงขับ (ไม่มี pitch จาก thrust line และไม่มี yaw เมื่อเครื่องดับ)
- `src/20-flight.js:248` lag อันดับหนึ่ง τ = 1 s สมมาตรทั้งเร่งและลด และ clamp ไว้ที่ `[AC.idle, 1]`
- `src/20-flight.js:410` โหมด ROLLOUT ของ autopilot สั่ง `c.thr = 0` ซึ่งได้ idle เดินหน้า ไม่มีคำสั่ง reverse
- `src/90-app.js:364` คีย์บอร์ดเปลี่ยน `thr` ด้วยอัตรา 0.35/s และ HUD แสดง `THR xx%` (`:366`, `:583`) โดยไม่มี N1/N2, EGT หรือไฟ REV

**ผลวัดด้วย Node** (สคริปต์ `scripts/f5_current.mjs` และ `f5_spool.mjs`)

| รายการ | ผลวัด | ควรเป็น (ถ้าเป็นเทอร์โบแฟน) |
|---|---|---|
| แรงขับเต็มที่ 95 kt TAS: 10,000 ft เทียบกับ SL | 8,117 N ทั้งสองระดับ (อัตราส่วน 1.000) | 0.80 สำหรับทั้ง BPR 5.1 และ 11.1 (B&Y, `f5_ratio95.mjs`) |
| แรงขับ static เต็มที่ ISA กับ ISA+20 | 11,500 N เท่ากัน | เท่ากันได้ถ้าไม่เกิน flat-rate temperature แต่ต้องเป็นผลจากโมเดล ไม่ใช่เพราะไม่มีโมเดล |
| idle | 517 N static (4.5%), 365 N ที่ 95 kt | 4–5% static และลดลงตาม Mach |
| idle → เต็ม: เวลาถึง 50 / 90 / 95% | 0.65 / 2.26 / 2.95 s | 95% ใน 4–5 s จาก flight idle และแรงขับที่ 1 s ต้องยังไม่ถึง 10% (โค้งรูป S) |
| เต็ม → ลงถึง 10% | 2.86 s | ราว 2–3 s |
| สั่ง `cmd.thr = -1` (reverse) | `thr` ค้างที่ 0.045 | ต้องมีโหมด reverse ที่มี interlock |

เทรนเนอร์ปัจจุบันเป็นเทอร์โบพร็อป (หัวข้อ 4) ดังนั้นตอนนี้ "ช่องว่าง" ข้างต้นจึงยังไม่ใช่บั๊กของเทรนเนอร์ แต่เป็นงานที่ต้องทำก่อนเพิ่ม 737-800 และ A320/A321 ในรอบหลัง ทุก test ในหัวข้อนี้จึงทดสอบคลาสเครื่องยนต์โดยตรงได้ โดยไม่ต้องมีโครงเครื่องบินโดยสาร

## 5.2 โครงสร้างโมเดลเทอร์โบแฟนที่เสนอ
แบ่งเป็นชั้นที่ทดสอบแยกกันได้ เพื่อให้รอบหลังเติมค่าของเครื่องยนต์แต่ละรุ่นได้โดยไม่ต้องแก้โค้ด

1. **พิกัดแรงขับ (rating):** $F_{00}$ คือแรงขับ take-off แบบ sea-level static ใน ISA ซึ่งเป็นนิยามเดียวกับ "rated output" ใน ICAO EEDB [F9] ค่านี้เป็นตัวตั้งของทุกอย่าง
2. **lapse:** $F_{rated}(h, M, T_{amb}) = F_{00}\,\Phi(M,\delta)\,\Theta(T_{amb})$ เป็นแรงขับสูงสุดที่ใช้ได้ ณ สภาพนั้น (หัวข้อ 5.3)
3. **แกนหมุน (spool):** สถานะ $N_2$ (%), คำสั่งจากคันโยกผ่าน "thrust demand" $u\in[0,1]$ และพื้น idle ตามโหมด (หัวข้อ 5.5–5.6)
4. **แรงขับสุทธิ:** $F = F_{idle} + (F_{rated} - F_{idle})\,n^{k}$ แล้วผ่าน lag ของพัดลม
5. **reverser:** สถานะ sleeve $s\in[0,1]$ และแรงหน่วง (หัวข้อ 5.7)
6. **การติดตั้ง:** ตำแหน่ง $\mathbf r_e$ และทิศ $\hat{\mathbf e}_T$ ในแกนลำตัว FRD แรงและโมเมนต์ $\mathbf F_b \mathrel{+}= F\hat{\mathbf e}_T$, $\mathbf M_b \mathrel{+}= \mathbf r_e\times F\hat{\mathbf e}_T$ (หัวข้อ 5.8)

ขอบเขตของพารามิเตอร์ใน JSON: `engine` คือค่าที่เครื่องยนต์ทุกรุ่นต้องมี (F₀₀, BPR, idle, spool, reverser) `aircraft` คือค่าที่ขึ้นกับเครื่องบิน (ความเร็วยกเลิก reverse, ตำแหน่งเครื่อง) `environment` คือข้อกำหนดและสมการที่ใช้ร่วมกัน และ `sim` คือตรรกะของเครื่องจำลองและ fixture สำหรับ test

## 5.3 thrust lapse กับความสูง อุณหภูมิ และ Mach
**ฟิสิกส์โดยย่อ** แรงขับสุทธิ $F \approx \dot m\,(V_j - V)$ โดย ram drag $\dot m V$ โตตามความเร็ว เครื่อง BPR สูงมีความเร็วไอพ่น $V_j$ ต่ำ จึงเสียแรงขับตาม Mach เร็วกว่า ส่วนความสูงลด $\dot m$ ตามความดันรวมที่ทางเข้า และ FADEC คุมรอบกับอุณหภูมิกังหัน ในช่วงความสูงต่ำผลรวมจึงขึ้นกับความดันมากกว่าความหนาแน่น

**ตัวเลือกที่เปรียบเทียบ**

(ก) **Bartel & Young 2008, take-off model** (J. Aircraft 45(4):1450–1456) [F11] ผู้เขียนระบุว่าแม่นภายใน ±1% เมื่อเทียบกับเครื่องอ้างอิง สำหรับ "flight speeds up to Mach 0.4" สมการ (eq. 11–14 ตามที่ OpenAP อ้างไว้ในโค้ด [F10]):

$$\Phi_{BY}=\frac{F}{F_{00}}=A(\delta)-\frac{0.377\,(1+\lambda)}{\sqrt{(1+0.82\lambda)\,G_0}}\,Z(\delta)\,M+\left(0.23+0.19\sqrt{\lambda}\right)X(\delta)\,M^2$$

$$A=-0.4327\delta^2+1.3855\delta+0.0472,\quad Z=0.9106\delta^3-1.7736\delta^2+1.8697\delta,\quad X=0.1377\delta^3-0.4374\delta^2+1.3003\delta$$

โดย $\delta=p/p_0$ (ความดันบรรยากาศต่อ 101,325 Pa), $M$ คือ Mach ของการบิน, $\lambda$ คือ bypass ratio และ $G_0$ คือ gas generator function (ไม่มีหน่วย) ซึ่ง OpenAP ประมาณจากรูปที่ 5 ของบทความเป็น $G_0 = 0.0606\lambda + 0.6337$ [F10] ที่ $\delta = 1$ จะได้ $A = Z = X = 1$ และ $\Phi(0) = 1$ บทความต้นฉบับมีค่าใช้จ่าย ผู้วิจัยเปิดได้แค่บทคัดย่อ [F11] **สัมประสิทธิ์ทั้งหมดจึงมาจากโค้ด OpenAP** ซึ่งตรงกับตัวเลขที่วิทยานิพนธ์ของ Schulz (2007) แสดงไว้ (แม้การแยกข้อความจะทำให้เครื่องหมายอ่านไม่ออก) [F12] ความเชื่อมั่น: กลาง

(ข) **Howe 2000** (ผ่าน Schulz 2007 ตาราง 2.1) [F12]: $\tau = (k_1 + k_2\lambda + (k_3 + k_4\lambda)M)\,\sigma^{s}$ ใช้ได้ถึง M 0.9 โดย $s = 0.7$ ใต้ 11 km และ $s = 1$ เหนือ 11 km สำหรับ BPR 3–6 ใช้ $(1, 0, -0.6, -0.04)$ ที่ M 0–0.4 และ $(0.88, -0.016, -0.3, 0)$ ที่ M 0.4–0.9 สำหรับ BPR 8 ใช้ $(1, 0, -0.595, -0.03)$ และ $(0.89, -0.014, -0.3, 0.005)$ Schulz พบว่าผิดไม่เกิน 5% ใต้ 14,000 ft แต่ผิดถึง 20–43% ที่ 35,000–40,000 ft [F12] ความเชื่อมั่น: ต่ำ (แหล่งทุติยภูมิ)

(ค) **Torenbeek 1982, Mattingly และ Raymer (ใช้เป็นตัวเปรียบเทียบเท่านั้น):** Torenbeek ใช้รูป $1 - \dfrac{0.45(1+\lambda)}{\sqrt{(1+0.75\lambda)G}}M + \left(0.6 + \dfrac{0.11\lambda}{G}\right)M^2$ ซึ่ง B&Y นำมาปรับ Schulz ยืนยันสัมประสิทธิ์ 0.45, 0.75, 0.6, 0.11 (ภาคผนวก H ใช้ 0.13) และ G = 0.9/1.0 แต่สมการในข้อความที่แยกได้อ่านไม่ครบ จึง **ยืนยันการจัดเรียงพจน์ไม่ได้** [F12] (ความเชื่อมั่นต่ำ) แนวทางของ Mattingly ใช้ θ₀ (อุณหภูมิรวมของกระแสอิสระต่ออุณหภูมิมาตรฐานที่ระดับน้ำทะเล) และ throttle ratio TR = T_t4,max/T_t4,SLS [F28] แต่ผู้วิจัยไม่พบสมการ lapse ฉบับเต็มในแหล่งที่เปิดได้ จึงไม่ใส่สัมประสิทธิ์ (ยังไม่ยืนยัน) แนวคิด theta break ยังใช้อธิบาย flat rating ได้ ส่วน Raymer ใช้ $1 - 0.000018\,h_{ft}$ (ผ่าน Schulz [F12]) ซึ่งไม่มีพจน์ Mach จึงหยาบเกินไป

(ง) **BADA 3 ของ EUROCONTROL:** Schulz อ้างสมการของ Eurocontrol (2004) ว่าแรงขับไต่สูงสุดคือ $C_{Tc1}(1 - h/C_{Tc2} + C_{Tc3}h^2)$ ต่อแบบเครื่องบิน และมีตัวแก้อุณหภูมิ C_Tc4, C_Tc5 [F12] EUROCONTROL ระบุว่า "BADA is free to use, its distribution is regulated through a license agreement" [F27] **AirfieldLab เป็น repo สาธารณะ จึงห้ามใส่สัมประสิทธิ์ BADA ลงใน repo** ใช้ได้แค่อ้างถึงรูปแบบสมการ

(จ) **ตาราง JSBSim `engine/CFM56.xml`** (Aero-Matic, 20,000 lbf, BPR 5.9, แกน Mach × density altitude) [F19]

(ฉ) **ตรวจไขว้ด้วย Poll & Schumann 2024** (CC BY) [F13] ซึ่งให้สมการ (37) ที่ M = 0.4 ระดับน้ำทะเล: $F/F_{00} \approx 0.97\,(0.825 - 0.018\lambda)$ โดย 0.97 คือ installation loss ผู้เขียนระบุว่าความสัมพันธ์ใช้ได้ที่ M > 0.2 และยังไม่ครอบคลุมการวิ่งบนพื้น

**ผลคำนวณ** (สคริปต์ `f5_lapse.mjs` ใช้ `atmosphere()` ของ repo)

| h (ft), M | B&Y λ=5.1 | Howe λ=5.1 | Torenbeek λ=5.1 (G=1) | JSBSim CFM56 | σ^0.7 | B&Y λ=11.1 | Howe λ=11.1 (แถว BPR 8) | Torenbeek λ=11.1 |
|---|---|---|---|---|---|---|---|---|
| 0, 0.1 | 0.902 | 0.920 | 0.887 | 0.967 | 1.000 | 0.882 | 0.907 | 0.840 |
| 0, 0.2 | 0.817 | 0.839 | 0.797 | 0.934 | 1.000 | 0.782 | 0.814 | 0.716 |
| 0, 0.3 | 0.745 | 0.759 | 0.730 | 0.928 | 1.000 | 0.698 | 0.722 | 0.629 |
| 0, 0.4 | 0.687 | 0.678 | 0.686 | 0.921 | 1.000 | 0.633 | 0.629 | 0.578 |
| 5,000, 0.3 | 0.685 | 0.684 | – | 0.811 | 0.901 | 0.646 | 0.650 | – |
| 10,000, 0.4 | 0.563 | 0.549 | – | 0.692 | 0.809 | 0.523 | 0.509 | – |
| 20,000, 0.6 | 0.358* | 0.398 | – | 0.532 | 0.644 | 0.322* | 0.379 | – |
| 35,000, 0.78 | 0.176* | 0.249 | – | 0.344 | 0.441 | 0.152* | 0.240 | – |

\* อยู่นอกช่วงที่ B&Y take-off model ใช้ได้ ค่าตรวจไขว้ที่ M 0.4: Poll & Schumann ให้ 0.711 (λ 5.1) และ 0.606 (λ 11.1) ต่างจาก B&Y 0.024 และ 0.027 ตามลำดับ ที่ระดับ cruise ข้อมูลใน OpenAP ให้ `cruise_thrust/max_thrust` = 0.208 สำหรับ CFM56-7B26 และ 0.189 สำหรับ CFM56-5B4 ที่ M 0.8, 35,000 ft [F10] เมื่อคำนวณที่จุดเดียวกัน (M 0.8, 35,000 ft, BPR ของแต่ละรุ่น 5.1 และ 5.9 ใน `f5_vmc.mjs`) Howe ได้ 0.246 และ 0.241 จึงสูงกว่าราว 18–28% ส่วน B&Y ที่ใช้นอกช่วงได้ 0.175 และ 0.169 จึงต่ำกว่าราว 11–16%

**สิ่งที่อ่านได้จากตาราง**
1. ในช่วงที่เครื่องจำลองลงจอดใช้จริง (ต่ำกว่า 10,000 ft, M ≤ 0.45) B&Y, Howe และ Poll & Schumann ต่างกันไม่เกินราว 0.03 (มากสุด 0.032 ระหว่าง B&Y กับ Howe ที่ λ 11.1, SL, M 0.2 และ 0.025 สำหรับ λ 5.1 ตามผลของ `f5_lapse.mjs`) จึงเลือก B&Y ได้อย่างมั่นใจพอสมควร เพราะใช้ความดัน (ไม่ใช่ความหนาแน่น) ซึ่งเข้ากับเครื่องแบบ flat-rated
2. ตาราง JSBSim CFM56 แบบ generic ลดแรงขับตาม Mach น้อยเกินไป (0.93 ที่ M 0.2 เทียบกับ 0.82) ตารางนี้จึงไม่เหมาะกับเครื่อง BPR สูง และไม่ควรคัดลอกมาใช้ (สัญญาอนุญาต LGPL ก็ไม่เหมาะกับ repo ที่ยังไม่มี LICENSE)
3. สูตร σⁿ เพียงอย่างเดียวไม่มีพจน์ Mach เลย และลงโทษวันร้อนผิดทาง

**อุณหภูมิและ flat rating** เครื่องยนต์โดยสารถูก "flat rate" คือ FADEC รักษาแรงขับ take-off ให้คงที่จนถึงอุณหภูมิอากาศค่าหนึ่ง แล้วจึงลดลงเมื่อร้อนกว่านั้นเพราะชนขีดจำกัด EGT ตัวอย่างที่ยืนยันได้คือ TCDS ของ EASA สำหรับ PW1127G-JM ซึ่งให้ take-off 12,044 daN ที่ "flat rating 47 °C" และ max continuous 11,719 daN ที่ 25 °C [F16] ส่วน TCDS ของ CFM56-7B ระบุแค่ว่าพิกัดอยู่ที่ "sea level corner point conditions" โดยไม่บอกอุณหภูมิ [F14] เสนอสมการ:

$$\Theta(T_{amb}) = 1 - k_T\,\max\!\left(0,\;T_{amb}-T_{flat}\right)$$

โดย $T_{amb}$ คือ OAT (°C), $T_{flat}$ คืออุณหภูมิ flat rate (°C) และ $k_T$ (1/K) ค่าเริ่มต้น 0.0075/K มาจาก Raymer ผ่าน Schulz ส่วนตาราง 3.3 ของ Schulz ให้ช่วง 0.426–0.958 %/K ซึ่ง Schulz ระบุว่าคำนวณจากค่าอ้างอิงของ Eurocontrol (2004) ไม่ใช่ข้อมูลวัดจริง เพราะ "no actual data is available" [F12] ความเชื่อมั่น: ต่ำ ตัวอย่างที่ VTBD เมื่อ OAT 35 °C: ถ้าใช้ $T_{flat}$ = 30 °C (ค่าเริ่มต้นของ CFM56-7B ซึ่งยังไม่ยืนยัน) จะได้ Θ = 0.9625 แต่ถ้าใช้ 47 °C ของ PW1127G-JM จะได้ Θ = 1.000 ในทางกลับกัน สูตร σ^0.7 ให้ 0.954 สำหรับทุกเครื่อง (σ = 0.9351 ที่ ISA+20)

**ข้อเสนอสำหรับเครื่องจำลองบนเบราว์เซอร์**
- M ≤ 0.45: ใช้ $\Phi_{BY}$ ทั้งการขึ้นบิน go-around และ climb ต้น ซึ่งใช้ CPU ราว 20 flop ต่อเครื่องต่อ step
- M > 0.45 (เมื่อรอบหลังมีการบิน cruise): ผสม B&Y เข้ากับ Howe แถว M 0.4–0.9 ด้วย smoothstep ในช่วง M 0.40–0.50 แล้วคูณ Howe ด้วยตัวแก้ ≈ 0.85 เหนือ 25,000 ft ให้ตรงกับจุด cruise ของ OpenAP (ค่าประมาณ ความเชื่อมั่นต่ำ) อีกทางคือใช้สมการ climb ของ B&Y ซึ่งต้องรู้แรงขับอ้างอิงที่ 30,000 ft ต่อรุ่น [F10, F11]
- ให้ go-around rating = take-off rating × `kGA` (ค่าเริ่มต้น 1.0) TCDS ของ LEAP-1A ระบุว่า "Maximum continuous thrust is set to not exceed go-around thrust" [F15] จึงต้องเก็บพิกัดแยกกัน

(โค้ด `lapseBY()` และ `ratedThrust()` อยู่ในหัวข้อ 5.9)

## 5.4 พิกัดของเครื่องยนต์อ้างอิง (ตรวจกับ EEDB และ TCDS)
ICAO Aircraft Engine Emissions Databank (EEDB) ที่ EASA เป็นผู้ดูแลให้ rated thrust (sea-level static, ISA, ไม่มี water injection) และ fuel flow ที่ 4 โหมดของ LTO [F9] ผู้วิจัยเปิดเอกสารแนะนำของ EEDB ได้ แต่ดาวน์โหลดไฟล์ Excel ผ่าน proxy ไม่ได้ จึงใช้ `engines.csv` ของ OpenAP ซึ่งระบุว่าข้อมูลเครื่องยนต์ "Primarily from the ICAO emission data-bank" [F10] และอ้างรหัส UID ของ EEDB ไว้ทุกแถว เพื่อให้รอบหลังตรวจกับไฟล์ต้นฉบับได้

| เครื่องยนต์ (EEDB UID) | F₀₀ (kN / lbf) | BPR | OPR | FF TO / CO / App / Idle (kg/s) | ตรวจกับ TCDS | ความเชื่อมั่น |
|---|---|---|---|---|---|---|
| CFM56-7B27 (3CM034) | 121.44 / 27,300 | 5.0 | 28.63 | 1.284 / 1.043 / 0.349 / 0.116 | E.004: take-off 12,143 daN [F14] | สูง (แรงขับ) |
| CFM56-7B27/3 (8CM066) | 121.4 / 27,290 | 5.1 | 29.0 | 1.293 / 1.031 / 0.343 / 0.110 | E.004 ตารางเดียวกัน | สูง |
| CFM56-5B4/3 (8CM055) | 120.1 / 27,000 | 5.7 | 27.3 | 1.142 / 0.939 / 0.316 / 0.102 | ไม่ได้เปิด TCDS | กลาง |
| CFM56-5B4 (2CM014) | 117.9 / 26,500 | 5.9 | 27.1 | 1.166 / 0.961 / 0.326 / 0.107 | ไม่ได้เปิด TCDS | กลาง |
| LEAP-1A26 (20CM089) | 120.6 / 27,110 | 11.1 | 33.3 | 0.861 / 0.710 / 0.244 / 0.091 | E.110 มีค่า 12,064 daN ในตาราง (จับคู่รุ่นไม่ได้จากข้อความ) [F15] | สูง (แรงขับ) |
| LEAP-1B27 (20CM098) | 124.7 / 28,030 | 8.3 | 40.5 | 1.014 / 0.826 / 0.273 / 0.095 | – | กลาง |
| PW1127G-JM | 120.44 / 27,075 | ไม่อยู่ใน OpenAP | – | – | IM.E.093: take-off 12,044 daN, flat 47 °C [F16] | สูง (แรงขับ) |

(แปลง lbf ด้วย 1 lbf = 4.448222 N) **รอบหมุนจาก TCDS:** CFM56-7B: N1 สูงสุด 5,382 rpm (104%), N2 สูงสุด 15,183 rpm (105%) จึงคำนวณกลับได้ 100% N1 ≈ 5,175 rpm และ 100% N2 ≈ 14,460 rpm (ค่าประมาณ) และ minimum N2 ในสภาพน้ำแข็ง 58.8% เมื่อ OAT สูงกว่า +15 °C [F14] LEAP-1A: 100% N1 = 3,856 rpm (สูงสุด 101%) และ 100% N2 = 16,645 rpm (สูงสุด 116.5%) [F15] PW1100G-JM: N1 สูงสุด 10,047 rpm, N1 ต่ำสุดที่ ground idle 1,750 rpm และที่ flight idle 1,801 rpm, N2 สูงสุด 22,300 rpm และ N2 ต่ำสุดที่ idle 12,400 rpm (55.6% ของ N2 สูงสุด) อัตราทดพัดลม 1:3.0625 [F16]

**ข้อสังเกตต่อ HUD/EICAS:** สัดส่วน FF ที่ idle ต่อ FF ที่ take-off อยู่ที่ 0.085–0.106 และที่ approach อยู่ที่ 0.265–0.283 (คำนวณจากหกแถวในตาราง) ใช้สร้างมาตรวัด fuel flow แบบ $FF = FF(\%F)$ ด้วยการ interpolate 4 จุด LTO ได้ทันที (คูณ $\sqrt{\theta}\,\delta$ เมื่อขึ้นสูง ซึ่งเป็นค่าประมาณ) แต่ EASA เตือนว่าค่าเหล่านี้ "should not be used for comparing the fuel efficiency of different engines" [F9]

## 5.5 พลวัตของแกนหมุน (spool-up / spool-down)
**ข้อกำหนดการรับรอง (ปฐมภูมิ)**
- **14 CFR 33.73(a)** เครื่องยนต์ต้องเร่งจากต่ำสุดถึงกำลัง take-off โดยไม่เกิด "overtemperature, surge, stall" เมื่อ "the power control lever is moved from the minimum to the maximum position in not more than 1 second" [F1]
- **14 CFR 33.73(b)** เริ่ม "From the fixed minimum flight idle power lever position when provided" หรือถ้าไม่มี ให้เริ่ม "from not more than 15 percent of the rated takeoff power or thrust" แล้วต้องได้ "95 percent rated takeoff power or thrust in not over 5 seconds" การทดสอบ "must occur from a stabilized static condition" [F1] ข้อนี้คือเพดานบนที่โมเดลห้ามเกิน
- **14 CFR 25.119** (landing climb ทุกเครื่องทำงาน) gradient ต้องไม่น้อยกว่า 3.2% โดยคิดแรงขับเท่าที่มี "8 seconds after initiation of movement" ของคันโยกจาก minimum flight idle ไปยัง go-around [F2] ผลทางปฏิบัติคือผู้ผลิตเครื่องบินออกแบบ approach idle ให้เครื่องตอบสนองทันภายใน 8 s
- 14 CFR 33.97(a) กำหนดให้เลื่อนคันโยกสุดช่วงใน "not more than one second" ในการทดสอบ reverser ด้วย [F6]

**ข้อมูลที่ตีพิมพ์ (ปฐมภูมิ)** NASA TM-2009-215668 (Litt, Frederick และ Guo) จำลองเครื่อง "90,000-lb thrust class" ด้วย C-MAPSS โดยให้ TRA ขั้นบันไดจาก 40° (กำลังต่ำ ไม่ใช่ idle) ไป 100° และกลับ ตารางนี้เป็น **ผลตอบสนองของความเร็วพัดลม (fan speed, N1)** ไม่ใช่แรงขับ delay คือเวลาถึง 50% ของการเปลี่ยน rise คือ 10–90% และ settling คือเวลาที่เข้าและอยู่ในแถบ 2% สุดท้ายของการเปลี่ยน [F17, Table 1] (ตารางต้นฉบับมีทั้งขาขึ้นและขาลงที่ทุกความสูง ผู้ตรวจเปิด PDF ซ้ำแล้วเติมแถวขาลงที่ความสูงให้ครบ):

| สภาพ | ทิศ | delay (ถึง 50%) s | rise (10–90%) s | settling (2%) s |
|---|---|---|---|---|
| SL, M 0 | 40→100 | 0.72 | 1.13 | 2.02 |
| SL, M 0 | 100→40 | 0.70 | 0.68 | 2.10 |
| 10,000 ft, M 0.25 | 40→100 | 0.78 | 1.25 | 2.41 |
| 10,000 ft, M 0.25 | 100→40 | 0.76 | 0.93 | 1.63 |
| 25,000 ft, M 0.62 | 40→100 | 0.94 | 1.95 | 2.51 |
| 25,000 ft, M 0.62 | 100→40 | 1.00 | 1.83 | 4.48 |
| 42,000 ft, M 0.84 | 40→100 | 1.63 | 3.66 | 6.27 |
| 42,000 ft, M 0.84 | 100→40 | 1.60 | 4.52 | 9.63 |

รายงานเดียวกันระบุว่า "the engine responds much more slowly at higher altitude than at lower altitude" และอ้างว่าเครื่อง JT8D ของ B-727 "slow (3 sec) from idle to a low power setting" แล้วจึงเร่งเร็ว (อีกราว 3 s) ถึงแรงขับเต็ม ส่วนตัวจำกัดการเร่งของ C-MAPSS คือขีดจำกัด Wf/PS3 ตามความเร็วแกนที่แก้แล้ว (corrected core speed, N2) และรายงานระบุว่าถ้าปรับ limiter ให้เครื่องตอบสนองเร็วขึ้นจะ "at the expense of a lower stall margin" [F17] รายงาน NASA อีกฉบับ [F18] กล่าวถึง "High Speed Idle" ในช่วง approach ว่าลดเวลาหน่วงได้ราว 30% และลด settling ราว 17% **(ยังไม่ยืนยัน: ผู้ตรวจรอบนี้เปิด PDF ของ [F18] ไม่ได้เพราะโควตา WebFetch หมด ยืนยันได้เพียงว่า URL ตรงกับชื่อรายงาน ความเชื่อมั่นต่ำ)** FAA Airplane Flying Handbook บทเครื่องบินไอพ่นเขียนว่า "the transition to full power could take up to 10 seconds" และ "Jet engine response at low rpm is slower" [F21, น. 16-3, 16-21]

**ทำไมจึงเป็นรูปตัว S** ที่ N2 ต่ำ FADEC เติมเชื้อเพลิงได้น้อยเพื่อรักษาระยะห่างจาก surge แกนจึงเร่งช้า เมื่อ N2 สูงขึ้นอัตราที่อนุญาตก็สูงขึ้น และแรงขับแปรราวกำลังสองของรอบ ช่วงแรกแรงขับจึงแทบไม่ขยับแล้วพุ่งขึ้น ส่วน lag อันดับหนึ่งบนแรงขับ (โค้ดปัจจุบัน) ตอบสนองเร็วที่สุดในวินาทีแรก ซึ่งสอนนักบินผิดทาง

**แบบจำลองที่เปรียบเทียบ**

| แบบจำลอง | สมการ | idle → 95% (s) | ถึง 50% (s) | ข้อสังเกต |
|---|---|---|---|---|
| AirfieldLab ปัจจุบัน | lag 1 s บนแรงขับ | 2.95 | 0.65 | ไม่มีรูป S |
| JSBSim `FGTurbine` [F19] | N2 เพิ่มด้วยอัตรา $\frac{90/(\lambda+3)}{1+3(1-\tilde n)^3+(1-\sigma)}$ %/s (`FGSpoolUp`, $\tilde n=\min(1,n+0.1)$), $F = F_{idle}+(F_{mil}-F_{idle})\,\Phi_{mil}(M,h)\,n^2$ โดย $F_{idle}=F_{mil}\,\Phi_{idle}(M,h)$ (`FGTurbine::Run`) | 5.28 (λ 5.1), 9.19 (λ 11.1) | 4.26 / 7.42 | ตัวหาร BPR ทำให้ LEAP ไม่ผ่าน 33.73(b) |
| YASim `Jet` [F20] | implicit first-order บน N2 แล้ว N1, decay = 1.5·2.3/t_spool, ค่าเริ่ม t_spool = 4 s | 5.52 | 1.95 | ช่วงแรกเร็วเกิน |
| **เสนอ (CFM56-7B27 class)** | ด้านล่าง | GI 5.15, FI 4.58, AI 3.00 | 4.08 (GI) | ผ่าน 33.73(b) |
| **เสนอ (LEAP-1A26 class)** | ด้านล่าง | GI 5.45, FI 4.88, AI 3.12 | 4.30 (GI) | ผ่าน 33.73(b) |

(ทุกค่าคำนวณด้วย `f5_spool.mjs` ที่ระดับน้ำทะเล static ยกเว้น AI ซึ่งคำนวณที่ 1,000 ft, M 0.2)

**สมการที่เสนอ** (first-order ที่มีขีดจำกัดอัตราซึ่งขึ้นกับ N2)

$$N_{2,cmd}=\max\!\Big(N_{2,floor},\;N_{2,GI}+(N_{2,max}-N_{2,GI})\,u^{1/k}\Big)$$

$$\dot N_2=\mathrm{clamp}\!\left(\frac{(N_{2,cmd}-N_2)\,\delta_t^{\,e}}{\tau_2},\;-R_{dec}\,\delta_t^{\,e},\;\frac{R_{acc}\,\delta_t^{\,e}}{1+a\,(1-\tilde n)^3}\right),\qquad \tilde n=\min(1,\,n+0.1)$$

$$n=\frac{N_2-N_{2,GI}}{N_{2,max}-N_{2,GI}},\qquad F_{ss}=F_{idle}+(F_{rated}-F_{idle})\,n^{k},\qquad \dot F=\frac{F_{ss}-F}{\tau_F}$$

สัญลักษณ์: $N_2$ รอบแกนแรงดันสูง (% ของรอบ 100%), $u\in[0,1]$ thrust demand จากคันโยกหรือ autothrottle (สเกลตามพิกัดที่เลือก TO/GA/CLB), $N_{2,floor}$ พื้น idle ตามโหมด (GI, FI หรือ AI ในหัวข้อ 5.6), $k$ เลขชี้กำลังของแผนที่แรงขับ (2 ตาม JSBSim), $\tau_2$ (s) ค่าคงที่เวลาของสัญญาณเล็ก, $R_{acc}$ และ $R_{dec}$ (%N2/s) อัตราเร่งและลดสูงสุด, $a$ รูปร่างของ accel schedule (รูปแบบ $(1-\tilde n)^3$ จาก JSBSim [F19]), $\delta_t = p_{t2}/p_0 = \delta(1+0.2M^2)^{3.5}$ ไม่เกิน 1, $e$ เลขชี้กำลังของผลความสูง และ $\tau_F$ (s) lag ของพัดลม/แรงขับ ส่วน N1 สำหรับแสดงผลให้คิดจากแรงขับที่ผ่าน lag แล้ว $N_1 = N_{1,GI} + (N_{1,max}-N_{1,GI})\sqrt{(F-F_{idle})/(F_{rated}-F_{idle})}$ (ค่าประมาณ ซึ่งเท่ากับสมมติว่าแรงขับส่วนเกิน idle แปรตาม $N_1^2$) วิธีนี้ทำให้ N1 ช้ากว่า N2 เล็กน้อยเหมือนเครื่องจริง และให้ผลตรงกับตาราง fan speed ของ NASA ดีกว่าการคิด N1 จาก N2 โดยตรง (`f5_n1check.mjs` และ `f5_n1check2.mjs`)

**ค่าที่ปรับแล้ว** (ทั้งหมดเป็นค่าประมาณ ปรับด้วย grid search ใน `f5_spool_tune.mjs` ให้ตรงเป้า: FI→95% = 4.5 s, GI→95% = 5.5 s, AI→95% = 3.5 s, ช่วงกลางตาม NASA SL และอัตราส่วน rise time ตามความสูงของ NASA)

| พารามิเตอร์ | CFM56-7B27 class | LEAP-1A26 class | หน่วย |
|---|---|---|---|
| N2 GI / FI / AI | 59 / 61 / 69 | 57 / 59 / 68 | % |
| τ₂ | 0.35 | 0.35 | s |
| R_acc / a | 18 / 6 | 18 / 6 | %/s / – |
| R_dec | 16 | 15 | %/s |
| e (ความสูง) | 1.0 | 1.0 | – |
| τ_F | 0.25 | 0.30 | s |

**ผลของโมเดลที่เสนอ** (CFM56-7B27 class; LEAP ในวงเล็บ)

| กรณี | ผล | เป้า / แหล่ง |
|---|---|---|
| FI → 95% static SL | 4.58 s (4.88 s) | ≤ 5.0 s [F1] |
| GI → 95% static SL | 5.15 s (5.45 s); แรงขับที่ 1 / 2 / 3 s = 5.5 / 8.3 / 17.5% | JT8D "3 s + 3 s" [F17]; AFH "up to 10 s" [F21] |
| AI → 95% ที่ 1,000 ft M 0.2 | 3.00 s (3.12 s); ที่ 8 s ได้ 100% | 25.119 ใช้แรงขับที่ 8 s [F2] |
| 40% → TO ที่ SL, **N1** (จากแรงขับที่ lag แล้ว): delay / rise / settling | 0.66 / 1.11 / 1.95 s (0.72 / 1.19 / 2.10) | fan speed 0.72 / 1.13 / 2.02 s [F17] |
| 40% → TO ที่ SL, แรงขับ: t50 / rise / settling | 0.72 / 1.14 / 2.03 s (0.78 / 1.24 / 2.18) | (ใช้ตารางเดียวกันเป็นตัวยึด) |
| N1 ที่ 10k / 25k / 42k ft: delay / rise / settling | 0.84/1.42/2.52, 1.15/2.00/3.55, 1.87/3.46/6.12 s | 0.78/1.25/2.41, 0.94/1.95/2.51, 1.63/3.66/6.27 s [F17] |
| อัตราส่วน rise time ของแรงขับ 10k / 25k / 42k ft ต่อ SL | 1.30 / 1.82 / 3.18 (1.26 / 1.75 / 3.00) | 1.11 / 1.73 / 3.24 [F17] |
| 100 → 40% ที่ SL, N1: delay / rise / settling | 0.72 / 1.17 / 2.02 s | 0.70 / 0.68 / 2.10 s [F17] (โมเดลลดรอบช้ากว่าในช่วงกลาง) |
| TO → idle: แรงขับถึง 10% | 2.28 s (2.55 s) | – |

ข้อสรุป: ใช้ตัวคูณอัตรา $\delta_t^{1.0}$ ได้ผลใกล้ NASA ที่ 25,000 และ 42,000 ft แต่ช้ากว่าเล็กน้อยที่ 10,000 ft (1.30 เทียบกับ 1.11) ซึ่งยอมรับได้ เพราะการฝึกลงจอดที่ VTBD เกิดใต้ 3,000 ft ซึ่งผลต่างน้อยกว่า 5% (ค่าประมาณ: ที่ 3,000 ft M 0.2 โมเดลให้อัตราส่วน rise time 1.070 เทียบกับ 1.032 ที่ได้จากการ interpolate เชิงเส้นระหว่างค่า NASA ที่ SL กับ 10,000 ft ต่างกัน 3.7%, `f5rev_3000ft.mjs`) สูตรของ JSBSim ที่หารด้วย (BPR + 3) ทำให้เครื่อง BPR 11 ใช้เวลา 9.2 s จึง **ไม่ควรใช้ตัวหาร BPR** แต่ให้แต่ละเครื่องยนต์ระบุ $R_{acc}$ เอง เพราะเครื่องทุกรุ่นต้องผ่าน 33.73(b) เหมือนกัน

**ต้นทุน CPU** ราว 40 flop ต่อเครื่องต่อ step อัปเดตครั้งเดียวต่อ step ใน `actuators(dt)` เหมือน `thr` ในปัจจุบัน

## 5.6 idle: ground, flight, approach และผลต่อการลดความเร็วและการลงจอด
**สามระดับของ idle**
- **Ground idle (GI)** รอบต่ำสุดบนพื้น เพื่อลดแรงขับขณะขับเคลื่อน (taxi) และลดการสึกของเบรก
- **Flight idle (FI)** รอบต่ำสุดในอากาศ ซึ่งสูงกว่า GI เล็กน้อย TCDS ของ PW1100G-JM ระบุ minimum N1 ที่ ground idle 1,750 rpm และที่ flight idle 1,801 rpm แยกกัน ส่วน N2 ต่ำสุดเท่ากัน (12,400 rpm) [F16]
- **Approach idle (AI)** รอบสูงขึ้นเมื่อเครื่องบินอยู่ในรูปแบบลงจอด เพื่อให้ go-around ทันตามแนวคิดของ 25.119 [F2] งานของ NASA แสดงว่ารอบ idle ที่สูงขึ้นลดเวลาหน่วงได้ราว 30% [F18] **ตรรกะการเลือก AI ของแต่ละผู้ผลิตยังไม่ยืนยันจากแหล่งปฐมภูมิ** จึงเสนอตรรกะทั่วไป (ค่าประมาณ): ใช้ AI เมื่อแฟลปอยู่ในตำแหน่งลงจอดหรือล้อลง ใช้ FI เมื่ออยู่ในอากาศในกรณีอื่น และกลับเป็น GI หลังล้อหลักแตะพื้นต่อเนื่อง 4 s

**LTO cycle ไม่ใช่ idle จริง** 40 CFR 1031.140(e) Table 1 "LTO Test Cycles" (สอดคล้องกับ ICAO Annex 16 Vol. II) กำหนดโหมดทดสอบไอเสียของเครื่องเทอร์โบแฟนเป็น take-off 100% (0.7 นาที), climb 85% (2.2 นาที), approach 30% (4.0 นาที) และ taxi/ground idle 7% (26.0 นาที) ของ rated output [F8] ค่า 7% เป็นจุดตั้งในห้องทดสอบ แรงขับ idle จริงขึ้นกับรุ่นและสภาพ ตาราง generic ของ JSBSim สำหรับ CFM56 ให้ idle 4.36% ที่ SL static และลดลงเหลือ 0.47% ที่ M 0.4 [F19] OpenAP ใช้ 7% ของแรงขับที่มีเป็น "descent idle" และบอกเองว่าเป็น "an approximation" [F10]

**สมการที่เสนอ** (ค่าประมาณ ความเชื่อมั่นต่ำ):

$$F_{idle}(M,\delta)=F_{00}\,\delta\,f_{i0}\,\max\!\left(-0.2,\;1-\frac{M}{M_{i0}}\right)$$

โดย $f_{i0}$ = 0.05 (CFM56-7B) หรือ 0.045 (LEAP-1A) คือ net idle ต่อ $F_{00}$ ที่ static, $M_{i0}$ = 0.5 คือ Mach ที่ net idle เป็นศูนย์ (รูปร่างจากตาราง JSBSim) และพื้น −0.2 แทนแรงต้านเล็กน้อยของเครื่อง idle ที่ความเร็วสูง ที่ 140 kt (M 0.212) ระดับน้ำทะเล ได้ net idle ≈ 2.9% ของ $F_{00}$ ต่อเครื่องสำหรับชุด CFM56-7B27 ($f_{i0}$ = 0.05) และ 2.6% สำหรับชุด LEAP-1A26 ($f_{i0}$ = 0.045) ฟิกซ์เจอร์ A320neo-class 2 เครื่อง (2 × 120.6 kN, 62 t, ใช้ชุด LEAP) จึงได้ T/W ≈ 0.010 (ค่าประมาณ คำนวณใน `f5rev_delay.mjs`; ฉบับก่อนเขียน 0.011 เพราะใช้ $f_{i0}$ ของ CFM56 กับเครื่อง LEAP)

**ผลต่อการบินที่นักเรียนต้องเห็น**
1. **ลดความเร็วยาก:** FAA ระบุว่า "In level flight at idle power, it takes about 1 mile to lose 10 knots of airspeed" [F21, น. 16-4] ใช้เป็น test ความสมเหตุสมผลของแรงต้านรวมกับ idle ได้ เมื่อรอบหลังมีโครงเครื่องบินโดยสาร
2. **ลอยยาวในการ flare:** FAA ระบุว่าการลากเครื่องลอยใน flare เพิ่มระยะลงจอดมากเพราะเครื่อง "still produce residual thrust at idle rpm" [F21, น. 16-23] ใน AirfieldLab ควรให้ autothrottle ลดคันโยกเป็น idle ใน flare (ทำอยู่แล้วใน `:407` และ `:460`) แต่แรงขับจะลดตามโมเดล spool-down จริง (ถึง 10% ใน ~2.3 s) แทนที่จะหายทันที
3. **go-around จาก idle ช้า:** ถ้านักเรียนดึงคันโยกลง idle ก่อนถึง flare และต้อง go-around จะเห็นว่าแรงขับแทบไม่เพิ่มในวินาทีแรก (5.5% ที่ 1 s จาก GI, หรือราว 20% ที่ 1 s จาก AI) จึงควรเพิ่มข้อความเตือนใน Evaluator เมื่อ thrust demand ต่ำกว่า AI ต่อเนื่องเกิน 3 s ระหว่าง 1,000 ft ถึง 50 ft (ค่าประมาณ) โดยใช้ภาษาไทย เช่น "แรงขับต่ำเกินไปบน final เครื่องยนต์จะตอบสนองช้าถ้าต้อง go-around"

## 5.7 thrust reverser
**ชนิดและหลักการ** FAA แบ่ง reverser ของเครื่องไอพ่นเป็น "target reverser" (ประตูแบบ clamshell) กับ "cascade reverser" ซึ่งบนเทอร์โบแฟน "reverse only the fan air" [F21, น. 16-10 ถึง 16-11] TCDS ระบุว่า CFM56-7B ได้รับอนุมัติให้ใช้กับ reverser ของ Boeing P/N 315A2295 [F14] LEAP-1A ใช้ระบบของ Aircelle [F15] และ PW1100G-JM ระบุว่า "The thrust reverser is not part of the engine type design and is certified as part of the aircraft" [F16] Mahmood และคณะ (Cranfield, GT2011-46397) จำลอง reverser แบบ pivoting door สี่บานบนเครื่อง CUTS_TF ซึ่งผู้เขียนระบุว่าคล้าย CFM56-5B4 [F25] ผลที่สำคัญต่อแรง:
- reverser หันลำไอพ่นไปข้างหน้าเป็นมุม ไม่ใช่ 180° (FAA ระบุราว 45° จากแนวตรงไปข้างหน้าสำหรับ target reverser [F21]) แกนกลาง (core) ยังดันไปข้างหน้าบางส่วน และอากาศร้อนอาจย้อนเข้าทางเข้า (reingestion) ซึ่งการทดสอบโมเดลของ NASA พบว่าทำให้ "43 percent loss of reversed thrust" ในบางรูปแบบ [F26]
- "Reverse thrust is more effective at high speed than at low speed" และ "selecting idle reverse produces very little reverse thrust" [F21] ส่วนหนึ่งของแรงหน่วงที่ความเร็วสูงคือ ram drag ของอากาศที่เข้าเครื่อง
- Mahmood และคณะ (2011) อ้างว่า overall reverser effectiveness ทั่วไปอยู่ "between 0.31 and 0.58" (อ้างต่อจากแหล่งอื่น) ระบุว่า "the reverse thrust is cancelled between the speeds of 80 and 60knots" เพื่อเลี่ยงการดูดก๊าซร้อนกลับเข้าทางเข้า และ stow "at speeds near 60 knots" โดยสมมติ max reverse ที่ "80% power" [F25] งานต่อเนื่องของกลุ่มเดียวกัน (2018, CC BY) ระบุว่าเครื่องเร่ง "from reverse idle to maximum reverse (i.e. 80% power) in approximately 3 seconds" [F29] โมเดลที่เสนอในหัวข้อนี้ใช้เวลา 4.6 s ถึง 90% ของแรง max reverse จาก reverse idle ที่ ground idle (`f5_revspool.mjs`) จึงช้ากว่าค่าอ้างอิงนี้ราว 1.5 s (ดู 5.12)

**ข้อกำหนดการรับรองและการคิดระยะ (ปฐมภูมิ)**
- 14 CFR 25.934: "Thrust reversers installed on turbojet engines must meet the requirements of §33.97" [F5] และ 33.97(b) กำหนดการกลับทิศ 175 ครั้งจาก flight idle และ 25 ครั้งจาก rated take-off ไปยัง maximum reverse โดยค้างที่ full reverse 1 นาทีต่อครั้ง (30 s ถ้าใช้เบรกบนพื้นเท่านั้น) [F6]
- 14 CFR 25.109(f): reverse thrust "Shall not be included" ในระยะ accelerate-stop บนทางวิ่งแห้ง แต่ "May be included" บนทางวิ่งเปียกถ้าใช้ขั้นตอนที่แนะนำและผ่าน 25.109(e) [F3]
- 14 CFR 25.125(c)(3): ระยะลงจอดที่รับรองใช้ "Means other than wheel brakes" ได้ถ้า "safe and reliable", ได้ผลคงที่ในการใช้งาน และไม่ต้องใช้ "exceptional skill" [F4] FAA ระบุว่าระยะลงจอดใน AFM ของเหตุการณ์ Southwest 1248 ไม่รวม reverse thrust แต่การคำนวณบนเครื่องรวมไว้ [F24]
- FAA AC 25-32 (การคิดระยะลงจอด ณ เวลาถึง): การกระทำของนักบินแต่ละขั้นใช้ "no less than one second" ต้องรวม interlock และ engine spin-up ระยะในอากาศคิด 7 s ที่ 98% ของ V_APP และ V_TD = 96% ของ V_APP ค่า μ เบรกของ RCC 3 = 0.163 และ RCC 1 = 0.083 (ตาราง 2, ¶8.3.6) [F22]
- FAA AC 91-79B Table 3-1 ให้ landing distance factor ของเครื่องไอพ่นแบบ "no reverse / with reverse": RwyCC 6 = 1.67 / 1.67, RwyCC 5 (grooved/PFC) = 2.3 / 1.92, RwyCC 5 (smooth) = 2.6 / 2.2, RwyCC 4 = 2.8 / 2.3, RwyCC 3 = 3.2 / 2.5, RwyCC 2 = 4.0 / 2.9, RwyCC 1 = 5.1 / 3.4 [F23] และระบุว่าการหน่วง 2 s ที่ 118 kt เพิ่มระยะเกือบ 400 ft [F23, ¶5.2.8.2]
- ความเร็วยกเลิก: FAA ระบุว่า "On the 737, reverser cancellation speed is 60 knots." [F24] ค่า 70 kt ของ Airbus ที่พบในเอกสารฝึกอบรม **ยังไม่ยืนยัน** (เปิดเอกสาร Airbus ไม่ได้)

**แบบจำลองที่เสนอ**

สถานะ: ตำแหน่ง sleeve/ประตู $s\in[0,1]$ คำสั่ง reverse $r\in[0,1]$ (0 = reverse idle, 1 = max reverse)

$$\dot s=\begin{cases}+1/t_{dep} & \text{ขอ reverse และ WOW และคันโยกเดินหน้าอยู่ที่ idle}\\ -1/t_{stow} & \text{กรณีอื่น}\end{cases}$$

$$u=\begin{cases} r\,u_{rev,max} & s\ge 0.9\ \text{และ}\ V>V_{cancel}\\ 0 & \text{กรณีอื่น (reverse idle หรือ idle)}\end{cases}$$

$$F_x=(1-s)\,F_{fwd}-s\,F_{00}\,(c_0+c_1M)\,\big[\rho_i+(1-\rho_i)\,\varphi\big],\qquad \varphi=n^k$$

โดย $F_x$ คือแรงตามแกน x ของลำตัว (บวกไปข้างหน้า), $F_{fwd}$ คือแรงขับเดินหน้าจาก 5.5, $\varphi$ คือสัดส่วนรอบที่ได้จากแกนหมุนเดียวกัน (reverse ใช้ spool model เดียวกัน), $\rho_i$ = 0.10 สัดส่วนของ reverse idle, $u_{rev,max}$ = 0.70 (Cranfield ใช้ 80% power [F25]) และ $c_0$ = 0.30, $c_1$ = 1.0 ต่อ Mach ผลรวมคือแรงหน่วงจาก max reverse ราว 0.37 $F_{00}$ ต่อเครื่องที่ 130 kt (M 0.2) และ 0.29 $F_{00}$ ที่ 60 kt ส่วน reverse idle ให้ราว 0.05 $F_{00}$ ที่ M 0.2 **ทั้งหมดเป็นค่าประมาณ ความเชื่อมั่นต่ำ** เวลา $t_{dep}$ = 2.0 s และ $t_{stow}$ = 2.5 s เป็นค่าประมาณ (Mahmood และคณะเผื่อ 3.5 s ไว้สำหรับ "T/Rev Deployment" ในตาราง 9 แต่ตาราง 7 ใช้ 3.5 s เดียวกันเป็นเวลาจากล้อหลักแตะถึง ground idle จึงตีความได้ไม่ชัด [F25]) และต้องรวมเวลาของนักบินอย่างน้อย 1 s ตาม AC 25-32 [F22]

**วิธีหาค่า c₀, c₁** (ค่าประมาณจากการปรับ) จำลองการวิ่งบนพื้นแบบจุดมวลด้วยฟิกซ์เจอร์ A320neo-class (`f5_reverse.mjs`: 62 t, 2 × LEAP-1A26 120.6 kN, S = 122.6 m², C_D พื้น 0.10, V_APP 135 kt, ระยะในอากาศ 7 s, ใช้เบรกและ spoiler ที่ 1 s, reverse เลือกที่ 1 s และ sleeve 2 s, ลดเป็น reverse idle ที่ 60 kt) แล้วเทียบ "ระยะรวมแบบมี max reverse ÷ ระยะรวมแบบไม่มี reverse" กับอัตราส่วน LDF ของ AC 91-79B [F23]

| สภาพทางวิ่ง (μ เบรก) | ไม่มี reverse (m) | reverse idle (m) | max reverse (m) | อัตราส่วน max/none | อัตราส่วนจาก LDF |
|---|---|---|---|---|---|
| แห้ง (0.40) | 1,089 | 1,054 | 1,029 | 0.945 | ไม่ให้เครดิต (1.67/1.67) |
| RCC 5 grooved (0.25) | 1,404 | 1,316 | 1,232 | 0.877 | 0.835 |
| RCC 3 (0.163) | 1,838 | 1,644 | 1,456 | 0.792 | 0.781 |
| RCC 2 (0.12) | 2,272 | 1,938 | 1,636 | 0.720 | 0.725 |
| RCC 1 (0.083) | 2,984 | 2,357 | 1,871 | 0.627 | 0.667 |

ชุด c₀ = 0.30, c₁ = 1.0 ให้ความคลาดเคลื่อนสัมบูรณ์รวมต่ำสุด (0.098) เมื่อเทียบกับชุด (0.25, 1.0) ที่ได้ 0.108 และ (0.35, 1.3) ที่ได้ 0.130 ข้อจำกัดคือ LDF รวม margin และระยะในอากาศมาด้วย การเทียบนี้จึงเป็นเพียงการยึดลำดับขนาด แรงหน่วงสูงสุดจาก reverser ในฟิกซ์เจอร์คือ 0.128 g ส่วนการเลือก reverse ช้าไป 15 s บน RCC 3 (แบบเหตุการณ์ที่ Midway [F24]) โดยเบรกและ spoiler ยังเริ่มที่ 1 s เพิ่มระยะรวมจาก 1,456 เป็น 1,745 m และถ้าเบรกช้าไป 15 s ด้วยจะได้ 2,183 m (`f5rev_delay.mjs`; ฉบับก่อนเขียน 1,478 → 2,200 m ซึ่งมาจากชุด c₀ = 0.25 รุ่นเก่าและหน่วงเบรกไปพร้อมกับ reverse)

ค่า μ เบรกในตารางมีเพียง RCC 3 = 0.163 และ RCC 1 = 0.083 ที่มาจากตาราง 2 ของ AC 25-32 [F22] ค่าแห้ง 0.40, RCC 5 = 0.25 และ RCC 2 = 0.12 เป็นค่าสมมติของฟิกซ์เจอร์ (AC 25-32 ให้ RCC 4 = 0.203, RCC 5 ใช้วิธีของ 25.109(c) และ RCC 2 ใช้ 50% ของค่าตาม 25.109(c) แต่ไม่เกิน 0.163 หรือ 0.053 เมื่อเร็วเกิน 85% ของความเร็ว hydroplaning) และตารางสมมติ anti-skid แบบ fully modulating

**กฎสำหรับเครื่องจำลองและการประเมิน**
1. Interlock: deploy ได้เมื่อ WOW ของล้อหลักและคันโยกเดินหน้าอยู่ที่ idle เท่านั้น ในอากาศให้ไม่มีผลใด ๆ (เครื่องบินรุ่นจริงมีระบบป้องกันหลายชั้น แต่เครื่องจำลองไม่ต้องจำลองความเสียหาย)
2. ระหว่าง $0 < s < 0.9$ ให้ $u = 0$ (ขึ้นกำลังไม่ได้) ตามแนวคิดที่ AC 25-32 ให้รวม interlock [F22]
3. ต่ำกว่า $V_{cancel}$ = 60 kt (ค่าของ 737 [F24]) ให้ $u$ กลับเป็น reverse idle เองหรือให้ Evaluator หักคะแนน และ stow ก่อนออกจากทางวิ่ง
4. ถ้าใช้ reverse ไม่ครบทุกเครื่อง แรงที่ไม่สมมาตรจะสร้าง yaw ผ่าน $\mathbf r_e\times\mathbf F$ ได้เอง AC 25-32 เตือนเรื่องการควบคุมทิศทางเมื่อใช้ reverser ไม่ครบและเมื่อมีลมขวางบนพื้นลื่น [F22]
5. ข้อความ UI เป็นภาษาไทย คงคำย่อ REV, N1, N2 เช่น "ลด reverse เป็น idle ที่ 60 kt"

## 5.8 แรงขับไม่สมมาตรเมื่อเครื่องดับ และความสัมพันธ์กับ Vmc (สรุปสั้น)
เมื่อเครื่องหนึ่งดับ โมเมนต์หันเหคือ $N = (F_{op} + D_{wm})\,y_e$ โดย $F_{op}$ คือแรงขับของเครื่องที่ทำงาน (N), $D_{wm}$ คือแรงต้านของเครื่องที่ดับซึ่งหมุนตามลม (windmilling) และ $y_e$ (m) คือระยะด้านข้างของเครื่องจากแนวกลางลำตัว ความเร็วต่ำสุดที่ rudder เต็มที่ยังทานได้ (ตั้ง β ≈ 0 และ bank ≈ 0) คือ

$$V_{MC}\approx\sqrt{\frac{2\,(F_{op}+D_{wm})\,y_e}{\rho\,S\,b\,|C_{n\delta_r}|\,\delta_{r,max}}}$$

นิยามตามกฎหมายอยู่ใน 14 CFR 25.149: เครื่องวิกฤต "suddenly made inoperative" ต้องบินตรงได้โดย bank "not more than 5 degrees", $V_{MC}$ "may not exceed 1.13 V_SR" โดยใช้แรงขับ take-off สูงสุดและ CG ที่แย่ที่สุด แรงที่ rudder ไม่เกิน 150 lb และ $V_{MCG}$ ต้องเบี่ยงจากเส้นกลางไม่เกิน 30 ft โดยใช้ rudder อย่างเดียว [F7] การเอียง 5° เข้าหาเครื่องที่ทำงานช่วยลด $V_{MC}$ เพราะใช้แรงด้านข้างจากน้ำหนักแทน sideslip

ข้อสังเกตที่สำคัญสำหรับ VTBD: เพราะเครื่องโดยสารเป็นแบบ flat-rated $F_{op}$ จึงคงที่จนถึง $T_{flat}$ ขณะที่ $\tfrac12\rho V^2$ ที่ต้องการคงที่ $V_{MC}$ ในรูป EAS/CAS จึงไม่ลดลงในวันร้อนจนกว่า OAT จะเกิน $T_{flat}$ (ข้อสรุปจากสมการ ไม่ใช่ข้อมูลรับรอง) ตัวอย่างเชิงตัวเลขจากค่าในโมเดล JSBSim 737 (S = 108.8 m², b = 28.86 m, $C_{n\delta_r}$ = −0.20/rad, δ_r,max = 0.35 rad, y_e = 4.90 m, F₀₀ = 89 kN, BPR 5.9 [F19]) ได้ $V_{MC}$ ≈ 102 kt (แรงขับที่ความเร็วนั้น 75.5 kN ตาม B&Y) และถ้าเพิ่ม windmilling 10% และลดประสิทธิผล rudder เหลือ 0.85 จะได้ ≈ 115 kt (`f5_vmc.mjs`) ผู้สร้างโมเดล JSBSim ระบุเองว่าใช้ "publicly available data ... and guesses" [F19] ตัวเลขนี้จึงใช้ทดสอบสูตรเท่านั้น ไม่ใช่ค่า Vmc ของ 737 จริง สำหรับเทรนเนอร์เครื่องยนต์เดียว ส่วนนี้ไม่มีผล แต่โครง `AC.engines[]` ต้องรองรับตั้งแต่ตอนนี้

## 5.9 แนวทาง implement ใน `src/20-flight.js`
1. เพิ่ม `ENGINE_DB` (pure data) ที่มีชุดพารามิเตอร์จาก JSON ในหัวข้อ 5.10 และ `AC.engines = [{ kind: 'turbofan', db: 'CFM56_7B27_class', pos: [x, y, z], dir: [1, 0, 0] }, ...]` โดยเทรนเนอร์ปัจจุบันใช้ `kind: 'turboprop'` ตามหัวข้อ 3–4
2. คลาส `TurbofanEngine` (ไม่มี DOM จึงยังทดสอบผ่าน `test/harness.mjs` ได้) เมธอด `update(dt, env, cmd)` เรียกจาก `actuators(dt)` และเมธอด `force(env)` ใช้ใน `deriv()`
3. ใน `deriv()` แทน `Fb[0] += T` ด้วยลูปรวมแรงและโมเมนต์ของทุกเครื่อง
4. `harness.mjs` ต้อง export `TurbofanEngine` และ `ENGINE_DB` เพิ่ม เพื่อให้ test T-F-xx เรียกได้
5. `ENGINE_DB` แปลงชื่อจาก JSON (5.10) เป็นชื่อสั้นในโค้ด: `F00`→`F00`, `bpr`→`bpr`, `Tflat_C`→`TflatC`, `kT_perK`→`kT`, `N2_GI_pct/FI/AI`→`N2gi/N2fi/N2ai`, `thrustExp_k`→`k`, `tau2_s`→`tau2`, `Racc_pctps`→`Racc`, `accShape_a`→`a`, `Rdec_pctps`→`Rdec`, `altExp`→`altExp`, `tauFan_s`→`tauF`, `idleFrac0`→`idle0`, `idleMach0`→`idleM0`, `rev_*`→`revC0, revC1, revUmax, revIdle, revDeploy, revStow`, `reverser.cancel_kt`→`vCancel`, `N1_GI_pct`→`N1gi` (โค้ดใช้คำนวณ N1 สำหรับแสดงผล) และกำหนด `N2max` = 100, `N1max` = 100

โค้ดด้านล่างถูกดึงออกจากไฟล์นี้แล้วรันจริงด้วย `f5_codecheck.mjs` (ชุด CFM56-7B27 class): FI → 95% = 4.58 s, AI → 95% ที่ 1,000 ft = 3.00 s, สั่ง reverse ในอากาศ 5 s แล้ว sleeve ยังอยู่ที่ 0, บนพื้นที่ 130 kt sleeve ถึง 90% ใน 1.8 s และได้แรง −0.365 F₀₀ เมื่อความเร็วลดเหลือ 55 kt แรงกลับเป็น reverse idle −0.038 F₀₀ และระหว่าง stow แรงขับเดินหน้ายังถูกล็อก

```js
function lapseBY(M, d, bpr) {                              // Bartel & Young 2008 eq. 11-14, d = p/p0
  const G0 = 0.0606 * bpr + 0.6337;                        // OpenAP fit to B&Y Fig. 5
  const A = -0.4327*d*d + 1.3855*d + 0.0472, Z = 0.9106*d**3 - 1.7736*d*d + 1.8697*d, X = 0.1377*d**3 - 0.4374*d*d + 1.3003*d;
  return A - 0.377*(1+bpr)/Math.sqrt((1+0.82*bpr)*G0)*Z*M + (0.23+0.19*Math.sqrt(bpr))*X*M*M;
}
function ratedThrust(E, amb, M) {                          // amb = atmosphere(h, isaDev)
  const theta = 1 - E.kT * Math.max(0, (amb.T - 273.15) - E.TflatC);
  return E.F00 * lapseBY(Math.min(M, 0.45), amb.p / 101325, E.bpr) * theta;   // M > 0.45: blend to Howe (P3)
}
class TurbofanEngine {
  constructor(E) { this.E = E; this.n2 = E.N2gi; this.F = 0; this.phiL = 0; this.s = 0; this.wowT = 0; }
  floorN2(env) {            // env: { wow, flapsLanding, gearDown }
    const E = this.E;
    if (env.wow && this.wowT > 4) return E.N2gi;
    return (env.flapsLanding || env.gearDown) ? E.N2ai : E.N2fi;
  }
  update(dt, env, cmd) {    // cmd: { u 0..1 forward demand, rev bool, r 0..1 }, env: { amb, M, V, wow, ... }
    const E = this.E, span = E.N2max - E.N2gi;
    this.wowT = env.wow ? this.wowT + dt : 0;
    const wantRev = cmd.rev && env.wow && cmd.u <= 0.02;
    this.s = clamp(this.s + (wantRev ? dt / E.revDeploy : -dt / E.revStow), 0, 1);
    let u = this.s > 0.02 ? 0 : cmd.u;                                  // forward power locked while sleeves move
    if (this.s >= 0.9 && env.V > E.vCancel * KT) u = cmd.r * E.revUmax;  // reverse power only when deployed
    const n2cmd = Math.max(this.floorN2(env), E.N2gi + span * Math.pow(u, 1 / E.k));
    const n = clamp((this.n2 - E.N2gi) / span, 0, 1), nn = Math.min(1, n + 0.1);
    const dt2 = Math.min(1, env.amb.p / 101325 * (1 + 0.2 * env.M * env.M) ** 3.5) ** E.altExp;
    const rate = clamp((n2cmd - this.n2) * dt2 / E.tau2, -E.Rdec * dt2, E.Racc * dt2 / (1 + E.a * (1 - nn) ** 3));
    this.n2 += rate * dt;
    const phi = clamp((this.n2 - E.N2gi) / span, 0, 1) ** E.k;
    const Fr = ratedThrust(E, env.amb, env.M), d = env.amb.p / 101325;
    const Fi = E.F00 * d * E.idle0 * Math.max(-0.2, 1 - env.M / E.idleM0);
    const Ffwd = Fi + (Fr - Fi) * phi;
    const Frev = E.F00 * (E.revC0 + E.revC1 * env.M) * (E.revIdle + (1 - E.revIdle) * phi);
    const Fss = (1 - this.s) * Ffwd - this.s * Frev;
    const g = 1 - Math.exp(-dt / E.tauF);
    this.F += (Fss - this.F) * g;
    this.phiL += (phi - this.phiL) * g;                                 // lagged spool fraction (F is linear in phi)
    this.N1 = E.N1gi + (E.N1max - E.N1gi) * Math.sqrt(this.phiL);       // display only, lags N2 through tauF
  }
}
// in deriv():  for (const e of this.engines) { const f = e.eng.F; Fb[0] += f*e.dir[0]; ...; Mb += cross(e.pos, f*dir) }
```

หมายเหตุ: ใน `deriv()` ใช้ค่า `F` ที่อัปเดตแล้วในต้น step ทั้งสี่ขั้นของ RK4 ซึ่งเป็นวิธีเดียวกับ `thr` ในปัจจุบัน ส่วน autopilot และ PilotLaws เปลี่ยนจากสั่ง `c.thr` เป็นสั่ง `u` (thrust demand) แบบเดิม ซึ่งเข้ากับ autothrottle ที่มีอยู่โดยไม่ต้องเปลี่ยนกฎควบคุม

## 5.10 ค่าพารามิเตอร์ (JSON)
ทุกค่าที่ `est: true` เป็นค่าประมาณที่ผู้วิจัยปรับหรือคำนวณเอง (วิธีอยู่ในหัวข้อ 5.3–5.7 และสคริปต์ `f5_json2.mjs`) ชุด `CFM56_5B4_class` และ `LEAP_1A26_class` ระบุเฉพาะค่าที่ต่างจาก `CFM56_7B27_class` ผ่านคีย์ `inherits` เพื่อให้รอบ 3 เติมค่าเฉพาะรุ่นได้ทีละช่อง

```json
{
 "turbofan": {
  "engines": {
   "CFM56_7B27_class": {
    "F00": {"v":121400,"u":"N","scope":"engine","src":["F10","F14"],"conf":"สูง","est":false,"note":"EEDB 8CM066 (CFM56-7B27/3); TCDS E.004 take-off 12143 daN"},
    "bpr": {"v":5.1,"u":"-","scope":"engine","src":["F10"],"conf":"กลาง","est":false,"note":"EEDB 8CM066 = 5.1 (รุ่นแรก 3CM034 = 5.0)"},
    "opr": {"v":29,"u":"-","scope":"engine","src":["F10"],"conf":"กลาง","est":false,"note":"OPR จาก EEDB"},
    "ffLTO": {"v":[1.293,1.031,0.343,0.11],"u":"kg/s","scope":"engine","src":["F10"],"conf":"กลาง","est":false,"note":"FF ที่ TO/CO/App/Idle"},
    "N1_100_rpm": {"v":5175,"u":"rpm","scope":"engine","src":["F14"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: จาก E.004: 5382 rpm = 104%"},
    "N2_100_rpm": {"v":14460,"u":"rpm","scope":"engine","src":["F14"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: จาก E.004: 15183 rpm = 105%"},
    "N1_GI_pct": {"v":20,"u":"%N1","scope":"engine","src":["F16"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: แสดงผล; PW1100G-JM: N1 GI 1750/10047 rpm = 17.4%"},
    "Tflat_C": {"v":30,"u":"degC","scope":"engine","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยังไม่ยืนยัน; E.004 ไม่ระบุอุณหภูมิ"},
    "kT_perK": {"v":0.0075,"u":"1/K","scope":"engine","src":["F12"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: Raymer 0.75%/K ผ่าน Schulz; ช่วง 0.43-0.96%/K มาจากค่าอ้างอิง Eurocontrol ไม่ใช่ค่าวัด (ตัวเลขใน F12 ยังไม่ได้เปิดยืนยันซ้ำในการตรวจ)"},
    "N2_GI_pct": {"v":59,"u":"%N2","scope":"engine","src":["F16","F14","F19"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เทียบ PW1100G 55.6%, CFM56-7B icing 58.8%, JSBSim 60%"},
    "N2_FI_pct": {"v":61,"u":"%N2","scope":"engine","src":["F16"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: floor ในอากาศ"},
    "N2_AI_pct": {"v":69,"u":"%N2","scope":"engine","src":["F18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: แฟลปลงจอดหรือล้อลง; AI->95% = 3.0 s; ผลของ high-speed idle ใน F18 ยังไม่ยืนยันซ้ำในการตรวจ"},
    "idleFrac0": {"v":0.05,"u":"-","scope":"engine","src":["F19","F10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: net idle/F00 static SL; JSBSim 4.36%"},
    "idleMach0": {"v":0.5,"u":"-","scope":"engine","src":["F19"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: Mach ที่ net idle = 0 (พื้น -0.2)"},
    "thrustExp_k": {"v":2,"u":"-","scope":"engine","src":["F19"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: F = Fidle + (Frated-Fidle) n^k"},
    "tau2_s": {"v":0.35,"u":"s","scope":"engine","src":["F17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ปรับให้ตรงตาราง NASA C-MAPSS"},
    "Racc_pctps": {"v":18,"u":"%N2/s","scope":"engine","src":["F1","F17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: FI->95% = 4.6 s (< 5 s)"},
    "accShape_a": {"v":6,"u":"-","scope":"engine","src":["F19"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: รูป (1-n)^3 จาก JSBSim"},
    "Rdec_pctps": {"v":16,"u":"%N2/s","scope":"engine","src":["F17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: TO->10% ใน 2.3 s"},
    "altExp": {"v":1,"u":"-","scope":"engine","src":["F17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: อัตราคูณ delta_t^e"},
    "tauFan_s": {"v":0.25,"u":"s","scope":"engine","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: lag ของพัดลม"},
    "revType": {"v":{"type":"cascade (translating sleeve, fan stream)"},"u":"-","scope":"engine","src":["F14","F21"],"conf":"กลาง","est":false,"note":"TCDS E.004 Note 7: Boeing P/N 315A2295; cascade กลับเฉพาะ fan air"},
    "rev_c0": {"v":0.3,"u":"-","scope":"engine","src":["F23","F25"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ปรับให้ตรงอัตราส่วน LDF"},
    "rev_c1": {"v":1,"u":"1/Mach","scope":"engine","src":["F21","F25"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: แรงหน่วงมากขึ้นที่ความเร็วสูง"},
    "rev_uMax": {"v":0.7,"u":"-","scope":"engine","src":["F25","F29"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: thrust demand ของ max reverse; Mahmood ใช้ 80% power"},
    "rev_idleFrac": {"v":0.1,"u":"-","scope":"engine","src":["F21"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: idle reverse ให้แรงน้อยมาก"},
    "rev_deploy_s": {"v":2,"u":"s","scope":"engine","src":["F22","F25"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เวลาเลื่อน sleeve ไม่รวม 1 s ของนักบิน"},
    "rev_stow_s": {"v":2.5,"u":"s","scope":"engine","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีแหล่ง"}
   },
   "CFM56_5B4_class": {
    "inherits": {"v":{"from":"CFM56_7B27_class"},"u":"-","scope":"engine","src":[],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ค่าที่ไม่ได้ระบุใช้ตาม CFM56_7B27_class"},
    "F00": {"v":120100,"u":"N","scope":"engine","src":["F10"],"conf":"สูง","est":false,"note":"EEDB 8CM055 (CFM56-5B4/3); รุ่นเดิม 2CM014 = 117.9 kN"},
    "bpr": {"v":5.7,"u":"-","scope":"engine","src":["F10"],"conf":"กลาง","est":false,"note":"EEDB 8CM055 = 5.7 (2CM014 = 5.9)"},
    "opr": {"v":27.3,"u":"-","scope":"engine","src":["F10"],"conf":"กลาง","est":false,"note":"OPR จาก EEDB"},
    "ffLTO": {"v":[1.142,0.939,0.316,0.102],"u":"kg/s","scope":"engine","src":["F10"],"conf":"กลาง","est":false,"note":"FF ที่ TO/CO/App/Idle"},
    "N1_100_rpm": {"v":5000,"u":"rpm","scope":"engine","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยังไม่ยืนยัน แสดงผลเท่านั้น"},
    "N2_100_rpm": {"v":14460,"u":"rpm","scope":"engine","src":["F14"],"conf":"ต่ำ","est":true,"note":"ยังไม่ยืนยัน; ค่าประมาณโดยสมมติว่าแกน HP เท่ากับ CFM56-7B (E.004: 15183 rpm = 105% จึง 100% ≈ 14460 rpm); ฉบับก่อนใส่ 15183 ซึ่งเป็นรอบสูงสุด 105% ไม่ใช่ 100%"},
    "N1_GI_pct": {"v":20,"u":"%N1","scope":"engine","src":["F16"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: วิธีเดียวกับ 7B27"},
    "Tflat_C": {"v":30,"u":"degC","scope":"engine","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยังไม่ยืนยัน"},
    "N2_GI_pct": {"v":59,"u":"%N2","scope":"engine","src":["F16","F14","F19"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: วิธีเดียวกับ 7B27"},
    "N2_FI_pct": {"v":61,"u":"%N2","scope":"engine","src":["F16"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: วิธีเดียวกับ 7B27"},
    "N2_AI_pct": {"v":69,"u":"%N2","scope":"engine","src":["F18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: วิธีเดียวกับ 7B27; ผลของ high-speed idle ใน F18 ยังไม่ยืนยันซ้ำในการตรวจ"},
    "idleFrac0": {"v":0.05,"u":"-","scope":"engine","src":["F19","F10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: วิธีเดียวกับ 7B27"},
    "Rdec_pctps": {"v":16,"u":"%N2/s","scope":"engine","src":["F17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: วิธีเดียวกับ 7B27"},
    "tauFan_s": {"v":0.25,"u":"s","scope":"engine","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: วิธีเดียวกับ 7B27"},
    "revType": {"v":{"type":"pivoting door"},"u":"-","scope":"engine","src":["F25"],"conf":"กลาง","est":false,"note":"ตามงานจำลองของ Mahmood 2011 บนเครื่องคล้าย CFM56-5B4 (ไม่ใช่ข้อมูลผู้ผลิต)"}
   },
   "LEAP_1A26_class": {
    "inherits": {"v":{"from":"CFM56_7B27_class"},"u":"-","scope":"engine","src":[],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ค่าที่ไม่ได้ระบุใช้ตาม CFM56_7B27_class"},
    "F00": {"v":120600,"u":"N","scope":"engine","src":["F10","F15"],"conf":"สูง","est":false,"note":"EEDB 20CM089 (LEAP-1A26); TCDS E.110 มีค่า 12064 daN ในตาราง"},
    "bpr": {"v":11.1,"u":"-","scope":"engine","src":["F10"],"conf":"กลาง","est":false,"note":"EEDB 20CM089 = 11.1"},
    "opr": {"v":33.3,"u":"-","scope":"engine","src":["F10"],"conf":"กลาง","est":false,"note":"OPR จาก EEDB"},
    "ffLTO": {"v":[0.861,0.71,0.244,0.091],"u":"kg/s","scope":"engine","src":["F10"],"conf":"กลาง","est":false,"note":"FF ที่ TO/CO/App/Idle"},
    "N1_100_rpm": {"v":3856,"u":"rpm","scope":"engine","src":["F15"],"conf":"สูง","est":false,"note":"E.110: max 101%"},
    "N2_100_rpm": {"v":16645,"u":"rpm","scope":"engine","src":["F15"],"conf":"สูง","est":false,"note":"E.110: max 116.5%"},
    "N1_GI_pct": {"v":18,"u":"%N1","scope":"engine","src":["F16"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: วิธีเดียวกับ 7B27"},
    "Tflat_C": {"v":30,"u":"degC","scope":"engine","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยังไม่ยืนยัน; PW1127G-JM = 47 C"},
    "N2_GI_pct": {"v":57,"u":"%N2","scope":"engine","src":["F16","F14","F19"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: วิธีเดียวกับ 7B27"},
    "N2_FI_pct": {"v":59,"u":"%N2","scope":"engine","src":["F16"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: วิธีเดียวกับ 7B27"},
    "N2_AI_pct": {"v":68,"u":"%N2","scope":"engine","src":["F18"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: วิธีเดียวกับ 7B27; ผลของ high-speed idle ใน F18 ยังไม่ยืนยันซ้ำในการตรวจ"},
    "idleFrac0": {"v":0.045,"u":"-","scope":"engine","src":["F19","F10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: วิธีเดียวกับ 7B27"},
    "Rdec_pctps": {"v":15,"u":"%N2/s","scope":"engine","src":["F17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: วิธีเดียวกับ 7B27"},
    "tauFan_s": {"v":0.3,"u":"s","scope":"engine","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: วิธีเดียวกับ 7B27"},
    "revType": {"v":{"type":"cascade (translating sleeve)"},"u":"-","scope":"engine","src":["F15"],"conf":"กลาง","est":false,"note":"E.110 Note 5: Aircelle"}
   }
  },
  "lapse": {
   "takeoffModel": {"v":{"name":"Bartel-Young 2008 eq.11-14","validMach":[0,0.45]},"u":"-","scope":"environment","src":["F11","F10"],"conf":"กลาง","est":false,"note":"ใช้กับ take-off/go-around/ไต่ต้น; สัมประสิทธิ์ยืนยันจากโค้ด OpenAP; ข้อความ ±1% ถึง M 0.4 มาจากบทคัดย่อ (ยังไม่ได้เปิดยืนยันซ้ำในการตรวจ)"},
   "BY_A": {"v":[-0.4327,1.3855,0.0472],"u":"-","scope":"environment","src":["F10","F11"],"conf":"กลาง","est":false,"note":"A(d) = a0 d^2 + a1 d + a2, d = p/p0"},
   "BY_Z": {"v":[0.9106,-1.7736,1.8697],"u":"-","scope":"environment","src":["F10","F11"],"conf":"กลาง","est":false,"note":"Z(d) = z0 d^3 + z1 d^2 + z2 d"},
   "BY_X": {"v":[0.1377,-0.4374,1.3003],"u":"-","scope":"environment","src":["F10","F11"],"conf":"กลาง","est":false,"note":"X(d) = x0 d^3 + x1 d^2 + x2 d"},
   "BY_lin": {"v":[0.377,0.82],"u":"-","scope":"environment","src":["F10","F11"],"conf":"กลาง","est":false,"note":"พจน์ M: 0.377(1+BPR)/sqrt((1+0.82 BPR) G0)"},
   "BY_quad": {"v":[0.23,0.19],"u":"-","scope":"environment","src":["F10","F11"],"conf":"กลาง","est":false,"note":"พจน์ M^2: (0.23 + 0.19 sqrt(BPR))"},
   "BY_G0fit": {"v":[0.0606,0.6337],"u":"-","scope":"environment","src":["F10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: G0 = 0.0606 BPR + 0.6337 (OpenAP fit ของ Fig. 5 ใน B&Y)"},
   "tempModel": {"v":{"form":"F = Fflat*(1 - kT*max(0, OAT - Tflat))"},"u":"-","scope":"environment","src":["F12","F16"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ห้ามใช้ sigma^n ที่ความสูงต่ำกับเครื่อง flat-rated"}
  },
  "idleAndLTO": {
   "LTO_pct": {"v":{"takeoff":100,"climb":85,"approach":30,"idle":7},"u":"% rated","scope":"environment","src":["F8"],"conf":"สูง","est":false,"note":"40 CFR 1031.140(e) Table 1 (LTO Test Cycles: 100/85/30/7% ที่ 0.7/2.2/4.0/26.0 นาที; สอดคล้อง ICAO Annex 16 Vol II) เป็นจุดทดสอบไอเสีย ไม่ใช่ค่า idle จริง"},
   "N1_display": {"v":{"form":"N1 = N1gi + (N1max-N1gi)*sqrt(phi_lagged)"},"u":"-","scope":"sim","src":["F17"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: N1 ตาม lag ของแรงขับ ตรงตาราง fan speed ของ NASA"},
   "AI_select": {"v":{"flapsAtLeast":"landing","orGearDown":true,"holdAfterTouchdown_s":4},"u":"-","scope":"sim","src":[],"conf":"ต่ำ","est":true,"note":"ตรรกะเลือก approach idle; hold หลังแตะพื้นเป็นค่าประมาณ"}
  },
  "cert": {
   "accel_FI_to_95pct_s": {"v":5,"u":"s","scope":"environment","src":["F1"],"conf":"สูง","est":false,"note":"14 CFR 33.73(b): static, จาก fixed min flight idle (หรือ <=15%) ถึง 95% rated ใน 5 s"},
   "lever_full_travel_s": {"v":1,"u":"s","scope":"environment","src":["F1","F6"],"conf":"สูง","est":false,"note":"33.73(a) และ 33.97(a): เลื่อนคันโยกสุดช่วงใน 1 s"},
   "GA_thrust_available_at_s": {"v":8,"u":"s","scope":"environment","src":["F2"],"conf":"สูง","est":false,"note":"14 CFR 25.119: แรงขับที่มีหลังเริ่มเลื่อนคันโยกจาก min flight idle 8 s ใช้คิด landing climb"},
   "landing_climb_gradient": {"v":0.032,"u":"-","scope":"environment","src":["F2"],"conf":"สูง","est":false,"note":"25.119: 3.2% ทุกเครื่องทำงาน ที่ VREF"},
   "reverse_credit": {"v":{"accelStopDry":false,"accelStopWet":true,"landingAFM":"means other than wheel brakes if safe, reliable, consistent, no exceptional skill"},"u":"-","scope":"environment","src":["F3","F4"],"conf":"สูง","est":false,"note":"25.109(f), 25.125(c)(3)"},
   "Vmc_limits": {"v":{"maxBank_deg":5,"VmcMax_over_VSR":1.13,"rudderForce_lbf":150,"VMCG_lateral_ft":30},"u":"-","scope":"environment","src":["F7"],"conf":"สูง","est":false,"note":"14 CFR 25.149(b)-(e)"}
  },
  "reverser": {
   "cancel_kt": {"v":60,"u":"kt","scope":"aircraft","src":["F24","F25"],"conf":"กลาง","est":false,"note":"B737 60 kt [F24]; Mahmood 2011 ยกเลิกช่วง 80-60 kt [F25]; ค่า 70 kt ของ Airbus ยังไม่ยืนยัน"},
   "pilotAction_min_s": {"v":1,"u":"s","scope":"sim","src":["F22"],"conf":"สูง","est":false,"note":"AC 25-32 para 10.1.3: การกระทำของนักบินอย่างน้อย 1 s"},
   "interlock": {"v":{"wow":"main gear","forwardLeverAtIdle":true,"powerAboveRevIdleWhenDeployedAtLeast":0.9},"u":"-","scope":"sim","src":["F22"],"conf":"กลาง","est":true,"note":"AC 25-32 para 10.1.4 ให้รวม interlock และ spin-up; ค่า 0.9 เป็นค่าประมาณ"},
   "revSpool_target_s": {"v":3,"u":"s","scope":"engine","src":["F29"],"conf":"ต่ำ","est":false,"note":"reverse idle -> max reverse ~3 s เป็นตัวอย่างประกอบในงานจำลอง ไม่มีที่มาหรือข้อมูลวัด (ผู้ตรวจเปิด F29 ยืนยันข้อความแล้ว); โมเดลให้ 4.6 s"},
   "LDF_AC91_79B": {"v":{"axes":{"RwyCC":[6,5,4,3,2,1],"col":["noReverse","withReverse"]},"data":[[1.67,1.67],[2.3,1.92],[2.8,2.3],[3.2,2.5],[4,2.9],[5.1,3.4]]},"u":"-","scope":"environment","src":["F23"],"conf":"สูง","est":false,"note":"Table 3-1 คอลัมน์ turbojet; RwyCC 5 = grooved/PFC (RwyCC 5 smooth = 2.6/2.2)"}
  },
  "sim": {
   "testFixture_A320class": {"v":{"m_kg":62000,"S_m2":122.6,"CDground":0.1,"nEng":2,"Vapp_kt":135,"Vtd_over_Vapp":0.96,"airDistance_s":7,"muBrake":{"dry":0.4,"RCC5":0.25,"RCC3":0.163,"RCC2":0.12,"RCC1":0.083}},"u":"mixed","scope":"sim","src":["F22"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ค่าสมมติสำหรับ test; จาก AC 25-32 มีเฉพาะ mu RCC3 = 0.163, RCC1 = 0.083 (Table 2), 7 s ที่ 98% ของ VAPP และ VTD = 0.96 VAPP; mu แห้ง 0.40, RCC5 0.25, RCC2 0.12 และค่าโครงเครื่องบินเป็นค่าสมมติ"},
   "vmcFixture_JSBSim737": {"v":{"S_m2":108.79,"b_m":28.86,"Cn_dr_perRad":-0.2,"dr_max_rad":0.35,"yEngine_m":4.9,"F00_N":88964,"bpr":5.9},"u":"mixed","scope":"sim","src":["F19"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: จาก JSBSim 737.xml/CFM56.xml (ค่าเดาจากข้อมูลสาธารณะ) ใช้ทดสอบสูตร; 737.xml ประกาศ GPL ในส่วนหัว ใช้ตัวเลขเป็นข้อเท็จจริงได้ ห้ามคัดลอกไฟล์"}
  }
 }
}
```

## 5.11 กรณีทดสอบ
ทุก test เรียก `TurbofanEngine`, `lapseBY` และ `ratedThrust` ผ่าน `test/harness.mjs` ด้วย Node โดยไม่มี dependency ค่าคาดหวังคำนวณด้วยสคริปต์ใน `scripts/` (ชื่อไฟล์อยู่ในคอลัมน์ที่มา) ใช้ dt = 1/240 s และชุด CFM56-7B27 class เว้นแต่ระบุ

| ID | สิ่งที่ทดสอบ | การตั้งค่า | ผลที่คาดหวัง (± tolerance) | ที่มาของค่าคาดหวัง | โมเดลปัจจุบัน |
|---|---|---|---|---|---|
| T-F-01 | แรงขับเต็มลดตามความสูง | 95 kt (48.9 m/s) TAS, ISA, BPR 5.1: F(10,000 ft (3,048 m)) ÷ F(SL) | 0.80 ± 0.02 | B&Y [F10, F11], `f5_ratio95.mjs` | 1.000 (8,117 N ทั้งสองระดับ) |
| T-F-02 | ค่า `lapseBY` | (λ 5.1, SL, M 0.2), (λ 5.1, 10,000 ft (3,048 m), M 0.4), (λ 11.1, SL, M 0.2) | 0.817, 0.563, 0.782 (± 0.003 ทุกค่า) | สมการ 5.3, `f5_lapse.mjs` | ยังไม่มีฟีเจอร์ |
| T-F-03 | ตรวจไขว้กับ Poll & Schumann | SL, M 0.4, λ 5.1 และ 11.1 | \|Φ_BY − 0.97(0.825 − 0.018λ)\| ≤ 0.03 (คำนวณได้ 0.024 และ 0.027) | [F13], `f5_lapse.mjs` | ยังไม่มีฟีเจอร์ |
| T-F-04 | flat rating ในวันร้อนที่ VTBD | SL static, ISA+20 (OAT 35 °C), T_flat 30 °C แล้ว 47 °C | Θ = 0.9625 ± 0.001 และ 1.000 ± 0.001 และต้องไม่เท่ากับ σ^0.7 = 0.954 | สมการ 5.3, [F12, F16], `f5_codecheck.mjs` | แรงขับเท่ากันทุกอุณหภูมิ (11,500 N) เพราะไม่มีโมเดล |
| T-F-05 | 14 CFR 33.73(b) | static SL, ตั้งที่ flight idle 20 s แล้ว u = 1 | ถึง 95% ของ F_rated ใน ≤ 5.0 s; ค่าโมเดล 4.58 ± 0.3 s (LEAP 4.88 ± 0.3 s) | [F1], `f5_spool.mjs`, `f5_codecheck.mjs` | 2.95 s (ผ่านเพดาน 5 s แต่ไม่มีรูป S) |
| T-F-06 | รูป S จาก ground idle | static SL, WOW > 4 s, u: 0 → 1 | F(1 s) ≤ 0.10 F_rated (โมเดล 0.055 ± 0.02); ถึง 95% ใน 5.15 ± 0.4 s | [F17, F21], `f5_spool.mjs` | F(1 s) = 0.649 (เร็วที่สุดในวินาทีแรก) |
| T-F-07 | go-around จาก approach idle (14 CFR 25.119) | 1,000 ft (305 m), M 0.2, gearDown, u: 0 → 1 | ถึง 95% ใน 3.0 ± 0.3 s และ F(8 s) ≥ 0.99 F_rated | [F2, F18], `f5_spool.mjs` | ยังไม่มีฟีเจอร์ (ไม่มี AI; idle → 95% = 2.95 s ทุกกรณี) |
| T-F-08 | ผลตอบสนอง N1 ช่วงกำลังปานกลาง | SL static, u: 0.4 → 1, วัด N1 ที่แสดงผล | delay 0.72 ± 0.15 s, rise 1.13 ± 0.25 s, settling 2.02 ± 0.4 s (โมเดล 0.66/1.11/1.95) | [F17, Table 1], `f5_n1check2.mjs` | ไม่มี N1; คันโยก thr: 0.70 / 2.20 / 3.91 s (`f5_current2.mjs`) |
| T-F-09 | spool ช้าลงเมื่อขึ้นสูง | u: 0.4 → 1 ที่ (25,000 ft (7,620 m), M 0.62) และ (42,000 ft (12,802 m), M 0.84) เทียบ SL | อัตราส่วน rise time ของแรงขับ 1.73 ± 0.3 และ 3.24 ± 0.5 (โมเดล 1.82 และ 3.18) | [F17], `f5_spool.mjs` | 1.00 (lag ไม่ขึ้นกับความสูง) |
| T-F-10 | idle ลดตาม Mach | SL, u = 0, M 0, 0.21, 0.6 | F_idle/F₀₀ = 0.050, 0.029, −0.010 (± 0.002) | สมการ 5.6 (ค่าประมาณ), รูปร่างจาก [F19] | 517 N static และ 365 N ที่ 95 kt (48.9 m/s) (ไม่ขึ้นกับ Mach หรือความสูง) |
| T-F-11 | interlock ของ reverser | (ก) WOW = false สั่ง rev 5 s; (ข) WOW = true, 130 kt (66.9 m/s), u = 0 สั่ง rev | (ก) s = 0 และ F ≥ 0; (ข) s ≥ 0.9 ที่ 1.8 ± 0.1 s และ u ถูกล็อกเป็น 0 ระหว่าง 0.02 < s < 0.9 | [F22], `f5_codecheck.mjs` | `thr` ค้างที่ 0.045 (สั่ง reverse ไม่ได้) |
| T-F-12 | แรง reverse และความเร็วยกเลิก | WOW, r = 1 หลัง deploy: ที่ 130 kt (66.9 m/s) แล้วลดเป็น 55 kt (28.3 m/s) | F = −0.365 ± 0.01 F₀₀ ที่ 130 kt (66.9 m/s); ต่ำกว่า 60 kt (30.9 m/s) เหลือ −0.038 ± 0.005 F₀₀ | สมการ 5.7 (c₀, c₁ ค่าประมาณ), [F24], `f5_codecheck.mjs` | ยังไม่มีฟีเจอร์ |
| T-F-13 | ระยะลงจอดเมื่อมี/ไม่มี reverse | ฟิกซ์เจอร์ A320-class จุดมวล (5.7), ระยะในอากาศ 7 s, เบรกที่ 1 s | อัตราส่วน max/none: RCC 3 = 0.79 ± 0.03 (LDF 0.781), RCC 1 = 0.63 ± 0.05 (LDF 0.667), แห้ง ≥ 0.93 | [F22, F23], `f5_reverse.mjs` | ยังไม่มีฟีเจอร์ |
| T-F-14 | spool ของ reverse | WOW, s = 1, ที่ GI, r: 0 → 1, M 0.2 | ถึง 90% ของแรง max reverse ใน 3.0–5.0 s (โมเดล 4.58 s) | [F29] (~3 s, งานจำลอง), `f5_revspool.mjs` | ยังไม่มีฟีเจอร์ |
| T-F-15 | สูตร Vmc กับ `AC.engines[]` | ฟิกซ์เจอร์ JSBSim 737 (5.8), เครื่องซ้ายดับ, rudder เต็ม | V_MC = 101.9 ± 1 kt (52.4 ± 0.51 m/s); เมื่อเพิ่ม windmilling 10% และ rudder 0.85 ได้ 114.8 ± 1 kt (59.1 ± 0.51 m/s); โมเมนต์ yaw จาก `r × F` = 370 ± 5 kN·m | [F7, F19], `f5_vmc.mjs` | ยังไม่มีฟีเจอร์ (เครื่องเดียว แรงขับผ่าน CG) |

## 5.12 ความขัดแย้งของแหล่งข้อมูลและข้อจำกัด
1. **สัมประสิทธิ์ของ Bartel & Young มาจากโค้ด OpenAP ไม่ใช่จากบทความ** เพราะบทความต้องซื้อ หน้า repository ของ University of Limerick สะกดชื่อผู้เขียนแรกว่า "Battel" ส่วน OpenAP และแหล่งอื่นใช้ "Bartel" [F10, F11] ค่า G₀ เป็น fit ของ OpenAP จากรูปที่ 5 ของบทความ ความเชื่อมั่นจึงอยู่ที่ระดับกลาง
2. **โมเดล lapse แตกต่างกันมากที่ระดับ cruise:** ที่ระดับ cruise (M 0.8, 35,000 ft) สูตร Howe สูงกว่าอัตราส่วน cruise ของ OpenAP ราว 18–28% ส่วน B&Y take-off model ที่ใช้นอกช่วงต่ำกว่าราว 11–16% [F10, F12] ข้อเสนอผสมกับ Howe แล้วคูณ 0.85 เป็นค่าประมาณความเชื่อมั่นต่ำ สำหรับการฝึกลงจอดที่ VTBD (M ≤ 0.45, ต่ำกว่า 10,000 ft) ผลต่างของโมเดลไม่เกินราว 0.03 (มากสุด 0.032)
3. **ตาราง generic ของ JSBSim ขัดกับ B&Y และ Poll & Schumann** ที่ M 0.2 ระดับน้ำทะเล (0.934 เทียบกับ 0.817) และสูตรเวลา spool ของ JSBSim ที่หารด้วย (BPR + 3) ทำให้ BPR 11.1 ใช้เวลา 9.2 s ซึ่งขัดกับ 14 CFR 33.73(b) [F1, F19]
4. **อุณหภูมิ:** σ^0.7 ลดแรงขับ 4.6% ที่ ISA+20 แต่ TCDS ของ PW1127G-JM ระบุ flat rating ที่ 47 °C [F16] ส่วน T_flat ของ CFM56-7B และ LEAP-1A ยังไม่ยืนยัน (TCDS E.004 ระบุเพียง "Sea level corner point conditions" [F14]) อัตรา k_T 0.75%/K มาจาก Raymer ผ่าน Schulz ส่วนช่วง 0.43–0.96%/K มาจากค่าอ้างอิงของ Eurocontrol ไม่ใช่ข้อมูลวัด [F12]
5. **แรงขับพิกัด:** CFM56-7B27 สอดคล้องกันระหว่าง EEDB (121.44 kN) กับ TCDS (12,143 daN) [F10, F14] สำหรับ LEAP-1A26 ตาราง TCDS E.110 ที่แยกข้อความได้จับคู่รุ่นกับค่า 12,064 daN ไม่ได้ จึงใช้ 120.6 kN จาก EEDB ผ่าน OpenAP [F10, F15] และยังไม่ได้เปิดไฟล์ Excel ของ EEDB โดยตรง (ทุกแถวมี UID ให้ตรวจซ้ำ)
6. **เวลา spool:** ตาราง 1 ของ NASA เป็นความเร็วพัดลมของเครื่องคลาส 90,000 lbf ซึ่งไม่ใช่ CFM56 หรือ LEAP [F17] ผู้วิจัยใช้ตารางนี้เป็นตัวยึดรูปร่างเท่านั้น โมเดลยังลดรอบช่วงกลางช้ากว่า NASA (rise 1.17 s เทียบกับ 0.68 s) และที่ 10,000 ft ช้ากว่าเล็กน้อย (อัตราส่วน 1.30 เทียบกับ 1.11) FAA AFH ระบุว่า "the transition to full power could take up to 10 seconds" ในบางกรณี [F21] ซึ่งยาวกว่าเพดาน 5 s ของ 33.73(b) จาก flight idle [F1] เพราะ AFH พูดถึงการเร่งจากรอบต่ำทั่วไป ไม่ใช่การทดสอบรับรอง โมเดลที่เสนอ (GI → 95% = 5.15 s) จึงอยู่ระหว่างสองค่านี้
7. **idle:** ค่า 7% ของ LTO เป็นจุดทดสอบไอเสีย [F8] ไม่ใช่แรงขับ idle จริง ค่า net idle 4–5% และตรรกะการเลือก approach idle เป็นค่าประมาณ เอกสารของผู้ผลิตที่ระบุค่าจริงไม่เปิดเผยต่อสาธารณะ
8. **reverser:** c₀ และ c₁ ปรับจากอัตราส่วน LDF ของ AC 91-79B ซึ่งรวม margin ไว้แล้ว [F23] จึงยึดได้แค่ลำดับขนาด ความเร็วยกเลิกมีสองค่า: 737 คือ 60 kt [F24] ส่วน Mahmood และคณะเขียนว่า 80–60 kt ในหัวข้อ 2 แต่ยกเลิกที่ M 0.1 (66 kt) ในหัวข้อ 6.1 [F25] เวลาเร่ง reverse ของโมเดล (4.6 s) ช้ากว่าค่า "approximately 3 seconds" ของ [F29] ซึ่งเป็นสมมติฐานของงานจำลอง ไม่ใช่ข้อมูลวัด ถ้ารอบหลังพบข้อมูลที่ดีกว่า ให้เพิ่ม `revN2floor` (N2 ขั้นต่ำขณะ deploy) แทนการเปลี่ยน R_acc ค่า 0.31–0.58 ของ reverser effectiveness เป็นการอ้างต่อจากแหล่งอื่น [F25] ค่า 70 kt ของ Airbus ยังไม่ยืนยัน
9. **ข้อมูลเหตุการณ์:** หน้า lessons learned ของ FAA ระบุทั้ง "approximately 15 seconds after touchdown" (เลือก reverse) และ 18 s (ถึง full reverse) [F24] การจำลองในหัวข้อ 5.7 ใช้ 15 s
10. **Vmc:** ฟิกซ์เจอร์จาก JSBSim 737 เป็นค่าเดาของผู้สร้างโมเดล [F19] ใช้ทดสอบสูตรและการรวมโมเมนต์เท่านั้น ห้ามนำไปแสดงเป็น Vmc ของเครื่องบินจริง
11. **สถานะการตรวจซ้ำของผู้ตรวจ (รอบ review):** เปิดต้นฉบับซ้ำและยืนยันค่าที่ใช้แล้ว: [F1] 33.73(a)(b), [F2] 25.119, [F7] 25.149, [F8] 40 CFR 1031.140(e), [F10] โค้ดและ `engines.csv` ของ OpenAP (ทุกแถวในตาราง 5.4 และสัญญาอนุญาต LGPL-3.0), [F13] สมการ (37) และสัญญาอนุญาต CC BY 4.0, [F14] E.004, [F15] E.110, [F16] IM.E.093, [F17] ตาราง 1 และข้อความที่อ้าง, [F19] ไฟล์ JSBSim, [F20] `Jet.cpp`, [F21] AFH บทที่ 16 (เลขหน้าตรง), [F22] AC 25-32, [F23] AC 91-79B, [F24] หน้า N471WN, [F29] ข้อความ "approximately 3 seconds" และ CC BY ส่วน [F3] 25.109, [F4] 25.125, [F5] 25.934, [F6] 33.97, [F9], [F11], [F12], [F18], [F25]–[F28] **ผู้ตรวจเปิดซ้ำไม่ได้เพราะโควตา WebFetch ของเซสชันหมด** (ยืนยันได้จากผลค้นหาเพียงว่า URL ของ [F11], [F12], [F18], [F25] ชี้ไปยังเอกสารชื่อตรงกัน) ค่าที่มาจากแหล่งกลุ่มนี้คงไว้ตามที่ผู้วิจัยรายงาน แต่ควรเปิดตรวจอีกครั้งก่อน implement โดยเฉพาะสัมประสิทธิ์ Howe และ k_T ของ [F12], ค่า 30%/17% ของ [F18], และค่า 80% power, 0.31–0.58, 3.5 s ของ [F25]

## 5.13 แหล่งอ้างอิง
PD = งานของรัฐบาลสหรัฐฯ (สาธารณสมบัติ) อ้าง คัดลอกข้อความ ตาราง และสมการได้ โดยควรให้เครดิต EASA-R = เงื่อนไขของ EASA "Reproduction is authorised, provided the source is acknowledged" (https://www.easa.europa.eu/en/copyright-disclaimer) ใส่ตัวเลขพร้อมอ้างที่มาได้

1. [F1] FAA, 14 CFR 33.73 Power or thrust response (ข้อความตรวจจาก govinfo ฉบับ 2012) https://www.govinfo.gov/content/pkg/CFR-2012-title14-vol1/pdf/CFR-2012-title14-vol1-sec33-73.pdf ปฐมภูมิ · PD
2. [F2] 14 CFR 25.119 Landing climb: All-engines-operating, eCFR https://www.ecfr.gov/current/title-14/chapter-I/subchapter-C/part-25/subpart-B/subject-group-ECFR14f0e2fcc647a42/section-25.119 (ตรวจข้อความจากสำเนา https://faraim.org/faa/far/cfr/title-14/part-25/section-25.119/index.html) ปฐมภูมิ · PD
3. [F3] 14 CFR 25.109 Accelerate-stop distance (CFR 2024) https://www.govinfo.gov/content/pkg/CFR-2024-title14-vol1/pdf/CFR-2024-title14-vol1-sec25-109.pdf ปฐมภูมิ · PD
4. [F4] 14 CFR 25.125 Landing, LII https://www.law.cornell.edu/cfr/text/14/25.125 ปฐมภูมิ · PD
5. [F5] 14 CFR 25.934 Turbojet engine thrust reverser system tests https://www.faraim.org/faa/far/cfr/title-14/part-25/section-25.934/index.html ปฐมภูมิ (สำเนา) · PD
6. [F6] 14 CFR 33.97 Thrust reversers, LII https://www.law.cornell.edu/cfr/text/14/33.97 ปฐมภูมิ · PD
7. [F7] 14 CFR 25.149 Minimum control speed, LII https://www.law.cornell.edu/cfr/text/14/25.149 ปฐมภูมิ · PD
8. [F8] US EPA, 40 CFR 1031.140 Test procedures, Table 1 to paragraph (e) "LTO Test Cycles" https://www.law.cornell.edu/cfr/text/40/1031.140 (eCFR: https://www.ecfr.gov/current/title-40/chapter-I/subchapter-U/part-1031/subpart-B/section-1031.140) ปฐมภูมิ · PD ส่วน ICAO Annex 16 Vol. II ต้นฉบับเป็นลิขสิทธิ์ของ ICAO จึงอ้างผ่าน CFR แทน
9. [F9] EASA, Introduction to the ICAO Engine Emissions Databank (TE.GEN.00301-006) https://www.easa.europa.eu/en/downloads/45576/en และหน้า databank https://www.easa.europa.eu/easa-and-you/environment/icao-aircraft-engine-emissions-databank ปฐมภูมิ · EASA-R ข้อมูลมาจากผู้ผลิตซึ่ง "solely responsible for its accuracy" ไม่ควรแจกจ่ายไฟล์ databank ทั้งไฟล์ใน repo
10. [F10] J. Sun (TU Delft), OpenAP v2.5: `openap/thrust.py`, `openap/data/engine/engines.csv` https://github.com/junzis/openap (raw: https://raw.githubusercontent.com/junzis/openap/master/openap/thrust.py) ทุติยภูมิ (โค้ดเปิด อ้าง B&Y และ EEDB) · LGPL-3.0: อ้างสมการและตัวเลขได้ แต่ห้ามคัดลอกโค้ดหรือไฟล์ CSV เข้า repo จนกว่าจะเลือกสัญญาอนุญาตที่เข้ากันได้ (ให้เขียนใหม่จากสมการ)
11. [F11] M. Bartel (Pure UL สะกด "Battel"), T. M. Young, "Simplified Thrust and Fuel Consumption Models for Modern Two-Shaft Turbofan Engines", Journal of Aircraft 45(4):1450–1456, 2008, doi:10.2514/1.35589, บทคัดย่อ https://pure.ul.ie/en/publications/simplified-thrust-and-fuel-consumption-models-for-modern-two-shaf/ ปฐมภูมิ (เปิดได้เฉพาะบทคัดย่อ) · ลิขสิทธิ์ AIAA: อ้างสมการ (ข้อเท็จจริง) ได้ ห้ามคัดลอกข้อความหรือรูป
12. [F12] O. Schulz, "Assessment of Numerical Models for Thrust and Specific Fuel Consumption for Turbofan Engines", Diplomarbeit, HAW Hamburg, 2007 https://www.fzt.haw-hamburg.de/pers/Scholz/arbeiten/TextSchulzDipl.pdf ทุติยภูมิ · ลิขสิทธิ์ผู้เขียน/HAW: อ้างสมการและตัวเลขได้ ลิงก์เท่านั้น
13. [F13] D. I. A. Poll, U. Schumann, "A simple model for the estimation of turbofan engine performance in all airborne phases of flight", The Aeronautical Journal 128:2725–2753, 2024, doi:10.1017/aer.2024.92 https://cambridge.org/core/services/aop-cambridge-core/content/view/4E17D2FE2BD9D87CCC4A4A132A52B27B/S0001924024000927a.pdf/simple_model_for_the_estimation_of_turbofan_engine_performance_in_all_airborne_phases_of_flight.pdf ปฐมภูมิ · CC BY 4.0 ("Open Access article, distributed under the terms of the Creative Commons Attribution licence"): ใช้สมการ ตัวเลข และตารางได้เมื่อให้เครดิต
14. [F14] EASA, TCDS E.004 CFM56-7B series, Issue 07, 9 Jan 2023 https://www.easa.europa.eu/en/downloads/7795/en ปฐมภูมิ · EASA-R
15. [F15] EASA, TCDS E.110 LEAP-1A/LEAP-1C, Issue 14, 11 May 2026 https://www.easa.europa.eu/mt/downloads/20086/en ปฐมภูมิ · EASA-R
16. [F16] EASA, TCDS IM.E.093 PW1100G-JM series, Issue 14, 16 Oct 2026 https://www.easa.europa.eu/en/downloads/20016/en ปฐมภูมิ · EASA-R
17. [F17] J. S. Litt, D. K. Frederick, T.-H. Guo, "The Case for Intelligent Propulsion Control for Fast Engine Response", NASA/TM-2009-215668 (AIAA 2009-1876), 2009 https://ntrs.nasa.gov/citations/20090042821 (PDF: https://ntrs.nasa.gov/api/citations/20090042821/downloads/20090042821.pdf) ปฐมภูมิ · PD
18. [F18] R. D. May, K. A. Lemon, J. T. Csank, J. S. Litt, T.-H. Guo, "The Effect of Faster Engine Response on the Lateral Directional Control of a Damaged Aircraft", NASA/TM-2012-217216, 2012 https://ntrs.nasa.gov/api/citations/20120003738/downloads/20120003738.pdf ปฐมภูมิ · PD
19. [F19] JSBSim Team, `src/models/propulsion/FGTurbine.cpp`, `engine/CFM56.xml`, `aircraft/737/737.xml` https://github.com/JSBSim-Team/jsbsim (raw: https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/src/models/propulsion/FGTurbine.cpp, https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/engine/CFM56.xml, https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/aircraft/737/737.xml) โค้ดเปิด · repo เป็น LGPL-2.1 (ไฟล์ COPYING) แต่ส่วนหัวของ `aircraft/737/737.xml` ประกาศ "GPL (General Public License)" และ `engine/CFM56.xml` (สร้างด้วย Aero-Matic) ไม่มีส่วนหัวสัญญาอนุญาต: อ้างรูปแบบสมการและตัวเลขเป็นข้อเท็จจริงได้ ห้ามคัดลอกโค้ดหรือตาราง XML เข้า repo (ผู้ตรวจเปิดไฟล์ทั้งสามจากสำเนาที่ดาวน์โหลดแล้วและยืนยันค่าที่ใช้: อัตรา spool, $\tilde n$, รูปแบบแรงขับ, idle 4.36%/0.47%, MilThrust 0.934/0.921, S 1171 ft², b 94.7 ft, Cnδr −0.20, rudder ±0.35 rad, เครื่องยนต์ที่ y = ±193 in)
20. [F20] FlightGear, YASim `src/FDM/YASim/Jet.cpp` https://raw.githubusercontent.com/FlightGear/flightgear/next/src/FDM/YASim/Jet.cpp โค้ดเปิด · GPL-2.0: อ้างแนวคิดได้เท่านั้น ห้ามคัดลอกโค้ด
21. [F21] FAA, Airplane Flying Handbook FAA-H-8083-3C, Chapter 16 Transition to Jet-Powered Airplanes https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/17_afh_ch16.pdf ปฐมภูมิ · PD
22. [F22] FAA, AC 25-32 Landing Performance Data for Time-of-Arrival Landing Performance Assessments, 12/22/2015 https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_25-32.pdf ปฐมภูมิ · PD
23. [F23] FAA, AC 91-79B Aircraft Landing Performance and Runway Excursion Mitigation, 8/28/2023 https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_91-79B_FAA.pdf ปฐมภูมิ · PD
24. [F24] FAA, Lessons Learned: Boeing 737-700 N471WN (Southwest 1248, Chicago Midway) https://www.faa.gov/lessons_learned/transport_airplane/accidents/N471WN ปฐมภูมิ · PD
25. [F25] T. Mahmood, A. Jackson, V. Sethi, P. Pilidis, "Thrust Reverser for a Separate Exhaust High Bypass Ratio Turbofan Engine and its Effect on Aircraft and Engine Performance", ASME GT2011-46397, 2011 https://torroja.dmt.upm.es/congresos/asme_2011/data/pdfs/trk-1/GT2011-46397.pdf ปฐมภูมิ (งานจำลอง) · ลิขสิทธิ์ ASME: อ้างตัวเลขได้ ลิงก์เท่านั้น
26. [F26] D. A. Dietrich, R. W. Luidens, "Experimental Performance of Cascade Thrust Reversers at Forward Velocity", NASA TM X-2665, 1973 https://ntrs.nasa.gov/api/citations/19730008046/downloads/19730008046.pdf ปฐมภูมิ · PD
27. [F27] EUROCONTROL, "BADA latest evolutions" (showcase summit 2025) https://www.eurocontrol.int/sites/default/files/2025-11/eurocontrol-showcase-summit-bada-latest-evolutions.pdf ปฐมภูมิ · BADA: "free to use, its distribution is regulated through a license agreement" ห้ามใส่สัมประสิทธิ์ BADA ใน repo สาธารณะ อ้างได้แค่รูปแบบสมการ
28. [F28] K. H. Liew, E. Urip, S. L. Yang, J. D. Mattingly, C. J. Marek, "Performance (Off-Design) Cycle Analysis for a Turbofan Engine With Interstage Turbine Burner", NASA/TM-2005-213659, 2005 https://ntrs.nasa.gov/api/citations/20050207438/downloads/20050207438.pdf ปฐมภูมิ · PD (ใช้เฉพาะนิยาม θ₀ และ TR)
29. [F29] T. Mahmood, A. J. B. Jackson, V. Sethi, B. Khanal, F. Ali, "CFD investigation of a core-mounted-target-type thrust reverser, Part 2: reverser deployed configuration", J. Eng. Gas Turbines Power 140(9), 2018, doi:10.1115/1.4038817 https://core.ac.uk/download/188364901.pdf ปฐมภูมิ (งานจำลอง) · CC BY: อ้างและใช้ตัวเลขได้เมื่อให้เครดิต

## 5.14 งานที่แนะนำสำหรับ Claude Code
งานเหล่านี้เปลี่ยนโมเดลการบิน จึงต้องทำบน branch แล้วเปิด pull request ให้เจ้าของลองก่อน merge ตาม CLAUDE.md ทุก test ใหม่อยู่ใน `test/turbofan.test.mjs` และ `test/engines.test.mjs` และต้องไม่ทำให้ test เดิมห้าไฟล์ล้ม
1. **P1 · M** สร้าง `AC.engines[]` (ตำแหน่ง `pos` และทิศ `dir` ในแกน FRD) แล้วรวมแรงและโมเมนต์ทุกเครื่องใน `deriv()` แทน `Fb[0] += T` เทรนเนอร์ใช้เครื่องเดียวที่ `pos` = [0, 0, 0] เพื่อให้ผลเดิมไม่เปลี่ยน · tests: T-F-15 และ test เดิมทั้งหมด (autoland 94–100 คะแนน)
2. **P1 · S** เพิ่ม `lapseBY()`, `ratedThrust()` และ `ENGINE_DB` (โหลดค่าจาก JSON ในหัวข้อ 5.10) ใน `src/20-flight.js` ให้ไม่มี DOM และ export ผ่าน `test/harness.mjs` · tests: T-F-01, T-F-02, T-F-03, T-F-04
3. **P1 · M** คลาส `TurbofanEngine`: สถานะ N2, accel schedule, พื้น GI/FI/AI, lag ของพัดลม, N1 สำหรับแสดงผล · tests: T-F-05, T-F-06, T-F-07, T-F-08, T-F-09
4. **P2 · S** โมเดล idle ตาม Mach และความดัน พร้อมคำเตือนภาษาไทยใน Evaluator เมื่อ thrust demand ต่ำกว่า approach idle เกิน 3 s ระหว่าง 1,000–50 ft · tests: T-F-10
5. **P2 · M** reverser: state machine, interlock แบบ WOW, ความเร็วยกเลิก, คีย์ลัดและไฟ REV บน HUD (ข้อความไทย คงคำว่า REV, N1, N2) · tests: T-F-11, T-F-12, T-F-14
6. **P2 · M** ฟิกซ์เจอร์ระยะลงจอดแบบจุดมวลตามจังหวะของ AC 25-32 (7 s ในอากาศ, การกระทำของนักบิน ≥ 1 s) เพื่อตรวจ c₀/c₁ ทุกครั้งที่ปรับ reverser · tests: T-F-13
7. **P3 · M** เมื่อรอบหลังเพิ่มการบิน cruise: ผสม B&Y กับ Howe ที่ M 0.40–0.50 และตรวจกับอัตราส่วน cruise ของ OpenAP (0.208 สำหรับ CFM56-7B26, 0.189 สำหรับ CFM56-5B4 ที่ M 0.8, 35,000 ft ± 0.03) · tests: T-F-02 (เพิ่มกรณี M 0.78)
