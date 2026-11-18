# 2. Downwash lag, ground effect และ slipstream ของใบพัด

← [กลับไปหน้ารวมรอบที่ 1](../01-flight-physics.md) · [schema พารามิเตอร์](schema.md)

> ความเชื่อมั่นโดยรวม: กลาง · แหล่งหลัก: Katzoff & Sweberg, NACA TR 738 [U7] · Weil & Sleeman, NACA TR 941 และ Katzoff, NACA TR 690 [U10, U11] · Jones & Fehlner, NACA TN 771 [U3] · JSBSim (c172p, FGPropeller, Aeromatic++) [U4–U6]

## 2.0 สรุปสั้น
- **Downwash lag ใช้ได้แล้ว แต่ α̇ ช้า** `CLadot` 1.6 และ `Cmadot` −4.5 อยู่ในช่วงที่เรขาคณิตหางให้ (1.5–2.0 และ −4.9 ถึง −6.6) ค่าที่แนะนำ 1.67 และ −5.50 (ค่าประมาณ) เพิ่ม ζ ของ short period จาก 0.585 เป็น 0.604 เท่านั้น ที่ควรแก้ก่อนคือ α̇ จาก finite difference ผ่าน filter 0.05 s ซึ่งช้ากว่าค่าจริง 46 ms และคลาด 13% RMS
- **Ground effect อ่อนเกินจริงราว 1.7–5.6 เท่าตอนแตะพื้น (แล้วแต่ปริมาณที่ดู)** สูตร McCormick ในโค้ดให้ induced drag เหลือ 72% ที่ h/b 0.1 แต่สูตร Tani/Torenbeek (NACA TR 738) ให้เหลือ 51% ใกล้กับ PHAK (ลด 47.6% คือเหลือ 52.4%), JSBSim c172p (51.5%) และ Hoerner–Borst (51.1%) พจน์ α ของแรงยกเพิ่ม 3.4% (CL รวมเพิ่มเพียงราว 2%) แทนราว 12% และ downwash ที่หางลดลงต้องใช้ elevator เพิ่มราว 4° (ค่าประมาณจาก VLM ใน 2.5) ไม่ใช่ 0.7°
- **ยังไม่มี slipstream** elevator และ rudder ใช้ $\bar q$ อิสระ ที่ความเร็ว 0 จึงไม่มีแรงบังคับ การเพิ่มกำลังไม่ทำให้เชิดหัวหรือหันเห และไม่มี corkscrew effect [U9, p. 5-31] โมเดลที่เสนอให้ $\bar q_s$ = T/A = 2,459 Pa ตอนอยู่กับที่ elevator มีผล 1.48 เท่าที่ 80 kt (41.2 m/s) กำลังเต็ม และ swirl ต้องใช้ rudder ขวาราว 8° (ค่าประมาณ)
- **สิ่งที่ควรสร้าง:** (1) α̇ แบบปิดรูปใน `deriv()` (2) ground effect แบบ Tani กับมุมเหนี่ยวนำ แรงต้าน และ downwash ที่หาง วัดความสูงที่ MAC ซ้าย/ขวา (3) `slipstream()` ที่ให้ $\bar q$ ของหางระดับ หางดิ่ง และมุม swirl แล้วจึงย้ายหางเป็นชิ้นส่วนแยกเพื่อรวม downwash หน่วงเวลา ground effect ที่หาง และ slipstream ไว้ในสมการเดียว

## 2.1 สภาพปัจจุบันใน AirfieldLab

| ตำแหน่ง | สิ่งที่โค้ดทำ | ข้อสังเกต (วัดด้วย Node, สคริปต์ `u2_*.mjs`) |
|---|---|---|
| `src/20-flight.js:103,107` | `CLadot: 1.6`, `Cmadot: −4.5` เป็นค่าคงที่ ปรับมาจากตำราโดยไม่ผูกกับเรขาคณิตหาง | อยู่ในช่วงที่ทฤษฎีให้ (2.2) แต่เมื่อเพิ่มเครื่องแบบอื่นจะไม่มีวิธีคำนวณให้สอดคล้องกัน |
| `:181` | `adh = adot·c/(2V)` ใช้การทำให้ไร้มิติแบบเดียวกับ JSBSim (`ci2vel`) [U5] | ถูกต้อง |
| `:275` | α̇ = finite difference ของ α หลังจบแต่ละ step ผ่าน low-pass τ = 0.05 s และ clamp ±2 rad/s แล้วตรึงไว้ทุก stage ของ RK4 รอบถัดไป | doublet elevator ±3° ที่ Vapp: ช้ากว่าค่าจริง **45.8 ms**, ความคลาด RMS **13.0%**, คลาดสูงสุด 1.5 °/s จากยอด 8.1 °/s (`u2_adot_current.mjs`) |
| `:176–177` | ความสูงปีก `hw = max(0.2, h − 0.35)` (ค่าคงที่ ไม่ขึ้นกับ pitch/bank) และ $\varphi = (16h/b)^2/(1+(16h/b)^2)$ | ตอนจอดนิ่ง CG สูง 1.304 m จึงได้ h/b = 0.094, φ = 0.691 แต่ MAC c/4 ของโมเดลภาพอยู่ต่ำกว่า CG เพียง 0.15 m (h/b ที่ถูกคือ 0.113) |
| `:182` | `CLa·(1 + 0.12(1 − φ))` คูณเฉพาะพจน์ α | ที่ h/b = 0.1 ได้ 1.034 เท่า (ทฤษฎี 1.12) และไม่คูณ CL0 + แฟลป |
| `:185` | induced drag `K·φ·(CL − 0.15)²` | ที่ h/b = 0.1 เหลือ 0.719 (ทฤษฎี 0.513) |
| `:189–190` | `Cm − 0.06(1 − φ)` | trim ที่ 80 kt แฟลปลง: h/b 0.1 เทียบนอก ground effect ต้องเพิ่ม elevator เพียง −0.74° และ α ลด 0.16° (`u2_expected.mjs`) |
| `:197–199` | แรงขับ `T = thr·thrustAvail(V)` วางบนแกน x ผ่าน CG และไม่มีโมเมนต์ ทุกพื้นบังคับใช้ $\bar q$ อิสระ | จอดนิ่ง กำลังเต็ม elevator ขึ้นสุด: โมเมนต์ elevator 0.07 N·m (เท่ากับศูนย์) ที่ approach เพิ่มกำลังทันทีจาก 1,973 N เป็น 7,944 N: $\dot q = \dot r = \dot p = 0$, หลัง 3 s ได้ β = 0°, φ = 0° และ θ +2.87° ซึ่งมาจากความเร็วที่เพิ่ม (phugoid) เท่านั้น (`u2_current_misc.mjs`) |
| `:312–319` | `setApproach` ใช้สูตร ground effect ชุดเดียวกันเพื่อ trim | ต้องเปลี่ยนตามกันเมื่อแก้สูตร |

สรุป: downwash lag มีแล้วในรูปอนุพันธ์ ground effect มีแต่อ่อนและวัดความสูงจากจุดที่ไม่ถูก ส่วน slipstream ไม่มีเลย ทุกค่าที่วัดได้อยู่ในคอลัมน์ "โมเดลปัจจุบัน" ของตารางทดสอบ 2.11

## 2.2 Downwash lag: ฟิสิกส์และสูตร $C_{L\dot\alpha}$, $C_{m\dot\alpha}$

ปีกเบนอากาศลง (downwash) แต่อากาศต้องใช้เวลา $\tau_t = l_t/V$ กว่าจะถึงหาง เมื่อ α เพิ่ม หางยังเห็น downwash ของ α ค่าเก่าซึ่งน้อยกว่า จึงได้มุมปะทะมากกว่าค่าคงตัว เกิดแรงยกหางเพิ่มและโมเมนต์ก้มหัวที่ต้านการเปลี่ยน α นี่คือที่มาของ $C_{m\dot\alpha}$ ที่เป็นลบ ซึ่งช่วยหน่วง short period ร่วมกับ $C_{mq}$ [U2]

แบบจำลองหน่วงเวลา (Cowley–Glauert) และการกระจายเทย์เลอร์ [U2, slides 6-2 ถึง 6-3]:

$$\varepsilon(t) = \varepsilon_0 + \frac{d\varepsilon}{d\alpha}\,\alpha(t-\tau_t),\qquad \alpha(t-\tau_t)\approx \alpha(t) - \tau_t\,\dot\alpha \;\Rightarrow\; \Delta\alpha_t = \frac{d\varepsilon}{d\alpha}\,\frac{l_t}{V}\,\dot\alpha$$

ทำให้ไร้มิติด้วย $\hat{\dot\alpha} = \dot\alpha\,\bar c/(2V)$ (แบบเดียวกับ `adh` ของ repo) ได้:

$$C_{L\dot\alpha} = 2\,\eta_t\,\bar V_H\,a_t\,\frac{d\varepsilon}{d\alpha},\qquad C_{m\dot\alpha} = -2\,\eta_t\,\bar V_H\,a_t\,\frac{d\varepsilon}{d\alpha}\,\frac{l_t}{\bar c},\qquad \bar V_H = \frac{S_h\,l_t}{S\,\bar c}$$

สัญลักษณ์: $\varepsilon$ มุม downwash ที่หาง (rad, บวกเมื่ออากาศเบนลง), $\varepsilon_0$ downwash ที่ α = 0, $\alpha_t$ มุมปะทะหาง (rad), $l_t$ ระยะจาก CG ถึง c/4 ของหาง (m), $V$ TAS (m/s), $\eta_t$ อัตราส่วนความดันพลวัตที่หาง, $a_t$ ความชันแรงยกหาง (/rad), $S_h$ พื้นที่หาง (m²), $S$, $\bar c$ พื้นที่และ MAC ของปีก Aeromatic++ ของ JSBSim ใช้สูตรเดียวกันในรูป `CLadot = CLq·deda` กับ `CLq = 2·nh·Vh·CLah` และ `Cmadot = −CLadot·lh/cbarw` [U4, Controls.cpp:344, 361] และตั้งค่าเริ่มต้น `de_da = 4/(A+2)` [U4, Aircraft.cpp:328]

**ค่าของเครื่องฝึก** (ค่าประมาณ, `u2_expected.mjs`) ใช้เรขาคณิตหางที่หัวข้อ 6 ถอยกลับจาก derivative ของ `AC` ($l_t$ = 5.42 m, $S_h$ = 2.96 m², $\bar V_H$ = 0.596, $a_t$ = 3.9 /rad, $\eta_t$ = 0.90) [U17] ซึ่งใกล้กับโมเดลภาพ (`src/70-aircraft.js:157–160`: หางกว้าง 3.7 m, c/4 อยู่หลัง CG ราว 5.1 m, พื้นที่ราว 3.2–3.6 m²) [U1]:

| ที่มาของ dε/dα | dε/dα | $C_{L\dot\alpha}$ | $C_{m\dot\alpha}$ | ความเชื่อมั่น |
|---|---|---|---|---|
| Aeromatic++ `4/(A+2)`, A = 6.38 [U4] | 0.477 | 2.00 | −6.56 | กลาง (สูตรหยาบ) |
| ถอยจาก `Cmadot/Cmq` ของ AC (หัวข้อ 6) [U17] | 0.36 | 1.51 | −4.95 | ต่ำ (วนกลับไปที่ค่าตั้งต้น) |
| สูตร DATCOM $4.44[K_AK_\lambda K_H\sqrt{\cos\Lambda}]^{1.19}$ จำได้แต่**ยังไม่ยืนยัน**จากต้นฉบับ (K_A 0.116, K_λ 1.234, K_H 0.935) | 0.40 | 1.67 | −5.50 | ต่ำ |
| VLM แถวเดียวของปีกในโมเดลภาพ (`u2_vlm_ge.mjs`) | 0.5–0.8 (ไวมากต่อความสูงหางเทียบแผ่น wake) | — | — | ต่ำ |
| **ค่าที่เสนอ** | **0.40** | **1.67** | **−5.50** | ต่ำ–กลาง |
| `AC` ปัจจุบัน | (โดยนัย 0.33–0.38) | 1.6 | −4.5 | — |
| เทียบ: JSBSim c172p [U5] | — | 1.7 | −7.27 | โมเดลเปิด ไม่ได้ validate |
| เทียบ: JSBSim pc7 (สร้างด้วย Aeromatic) [U5] | — | 2.473 | −9.07 | โมเดลเปิด ไม่ได้ validate |

ผลต่อพลวัต (แบบจำลอง short period สองสถานะที่ Vapp 50.2 m/s, ρ 1.160, `u2_delay.mjs`): $C_{m\dot\alpha}$ = 0, −4.5, −5.50, −7.27 ให้ ζ = 0.498, 0.585, 0.604, 0.638 ที่ ωn = 2.23 rad/s เท่ากันทุกกรณี (สอดคล้องกับค่าที่หัวข้อ 10 วัดจากโมเดลเต็ม ωn 2.221, ζ 0.578) แปลว่าการปรับจาก −4.5 เป็น −5.5 เปลี่ยนความรู้สึกน้อยมาก จึงจัดเป็นงาน P3 ส่วน $C_{L\dot\alpha}$ มีผลต่อ ζ น้อยกว่านี้อีก

**ข้อจำกัดของ lag เดี่ยว** Jones และ Fehlner คำนวณด้วย indicial function แล้วพบว่าหางเห็น upwash ก่อนในช่วงแรก และ "the lag is, however, somewhat greater than that indicated by the tail length" ฟังก์ชันแรงยกในรายงานให้ผลแม่นสำหรับการเคลื่อนที่ที่ประกอบด้วยความถี่ต่ำกว่าหนึ่งรอบต่อ 18 half-chord (n < 0.35 โดย n คือความถี่เชิงมุมต่อระยะทางที่บินได้หนึ่ง half-chord หน่วย rad/half-chord ไม่ใช่ Hz) และรูปที่แน่นอนของ indicial function สำคัญเฉพาะเมื่อแรงยกเปลี่ยนเร็วมาก (n > 0.35) เช่น gust คม [U3, pp. 1, 8–10] short period ของเครื่องฝึก (ωn 2.23 rad/s ที่ 51 m/s, $\bar c/2$ = 0.825 m) มี n = 0.036 rad/half-chord หรือความยาวคลื่นราว 174 half-chord (`u2_review.mjs`) ต่ำกว่าขีดราวสิบเท่า จึงอยู่ในช่วงที่ใช้ได้ดี (ความเชื่อมั่น: สูง)

## 2.3 รูปอนุพันธ์กับรูปหน่วงเวลา และตัวประมาณ α̇

| ทางเลือก | วิธี | ข้อดี | ข้อเสีย | CPU |
|---|---|---|---|---|
| A. อนุพันธ์ + α̇ จาก finite difference + filter (ปัจจุบัน) | `adot` ปรับปลายรอบ | ง่าย | lag 46 ms, ไม่สอดคล้องภายใน RK4, ขึ้นกับ dt | ~0 |
| B. อนุพันธ์ + α̇ แบบปิดรูปภายใน `deriv()` | แก้สมการเชิงเส้นของ α̇ (คล้าย apparent mass $Z_{\dot w}$) | ถูกต้องทุก stage, ไม่มี lag, ไม่ต้องเก็บประวัติ | ต้องรวมอนุพันธ์ของลม (gust) เอง | ~0 |
| C. JSBSim: α̇ จาก $\dot u,\dot w$ ของรอบก่อน: $\dot\alpha = (u\dot w - w\dot u)/(u^2+w^2)$ [U6, FGAuxiliary.cpp:175] | ใช้ derivative ของรอบก่อน | ง่าย | lag 1 รอบ (4 ms) | ~0 |
| D. หางเป็นชิ้นส่วน + downwash หน่วงเวลา $\varepsilon(t) = (d\varepsilon/d\alpha)\,\alpha_w(t-l_t/V)$ | ring buffer ของ α ที่ 240 Hz (ราว 26 ช่องที่ Vapp, 130 ช่องที่ 10 m/s) | ได้ gust penetration, ground effect ที่หาง, slipstream ที่หาง ในสมการเดียว; ไม่ต้องมี $C_{L\dot\alpha}$ | ต้องแยก `Cma`, `Cmq`, `Cmde` ออกเป็นส่วนปีก-ลำตัวกับส่วนหาง | ~0 (buffer 256 ช่อง) |

**ตรวจว่า B กับ D เท่ากัน** (`u2_delay.mjs`): แบบจำลองสองสถานะชุดเดียวกัน แยกหางออก ($C_{m\alpha,wb} = C_{m\alpha} + \eta_t\bar V_H a_t(1-d\varepsilon/d\alpha)$ = +0.535) สั่ง elevator −2° แบบขั้น ได้ q สูงสุด 3.996 °/s (อนุพันธ์) กับ 3.993 °/s (หน่วงเวลา) ต่างกันสูงสุด 0.041 °/s และ α สุดท้าย 2.446° เท่ากัน รูป D จึงให้พลวัตเดิมเมื่อการเคลื่อนที่ช้า และต่างเฉพาะเมื่อมี gust คม

**α̇ แบบปิดรูป (ทางเลือก B)** ภายใน `deriv()` แรงตามแกน z ของลำตัวขึ้นกับ α̇ แบบเชิงเส้นผ่าน $C_{L\dot\alpha}$ จึงแก้ได้ตรง:

$$\dot\alpha = \frac{u\,\dot w - w\,\dot u}{u^2+w^2},\qquad \dot u = \dot u_0 + X_{\dot\alpha}\,\dot\alpha,\quad \dot w = \dot w_0 + Z_{\dot\alpha}\,\dot\alpha,\qquad X_{\dot\alpha} = +K_{\dot\alpha}\sin\alpha,\quad Z_{\dot\alpha} = -K_{\dot\alpha}\cos\alpha,\quad K_{\dot\alpha} = \frac{\bar q S}{m}\,C_{L\dot\alpha}\frac{\bar c}{2V}(1-\sigma_{st})$$

$$\Rightarrow\quad \dot\alpha = \frac{u\,\dot w_0 - w\,\dot u_0}{u^2+w^2 - u\,Z_{\dot\alpha} + w\,X_{\dot\alpha}} = \frac{u\,\dot w_0 - w\,\dot u_0}{u^2+w^2 + \dfrac{\bar q S\bar c}{2m}\,C_{L\dot\alpha}\,(1-\sigma_{st})\cos\beta}$$

(แรงยกในโค้ดตั้งฉากกับลมสัมพัทธ์ จึงมีองค์ประกอบทั้งแกน x และ z; $\sigma_{st}$ คือ `sig` ของ stall blend; แรงต้านอยู่ตามแนวความเร็วจึงไม่เข้าตัวหาร ตรวจหน่วย: $\bar q S\bar c/m$ มีหน่วย m²/s² เท่ากับ $u^2+w^2$) ตรวจด้วย `Aircraft.deriv()` จริง (`u2_review.mjs`): ที่ approach 95 kt และที่ 72 kt α 10.3° สูตรนี้ให้ α̇ ตรงกับ fixed point ของ `deriv()` ภายใน 1e-4 °/s ส่วนรูปเดิมที่ใช้เฉพาะ $Z_{\dot\alpha}$ คลาด 3e-4 °/s ที่ α 10° และพจน์ $C_{L\dot\alpha}$ ในตัวหารมีขนาดเพียงราว 0.5% ของ $u^2+w^2$

โดย $u, w$ คือความเร็วเทียบอากาศในแกนลำตัว (m/s, `vab[0]`, `vab[2]`) และ $\dot u_0, \dot w_0$ คือความเร่งในแกนลำตัวที่ยังไม่มีพจน์ α̇ (แรง/มวล, แรงโน้มถ่วง และ $-\boldsymbol\omega\times\mathbf v$) ลบอนุพันธ์ของลมในแกนลำตัว (ประมาณจากผลต่างของลมระหว่าง tick เพราะ `Wind.update()` เรียกครั้งเดียวต่อ tick) α̇ จึงสอดคล้องทุก stage ของ RK4 และหมด lag 46 ms (T-U-02)

**คำแนะนำ:** P1 ใช้ B (เปลี่ยนน้อย แก้ lag และความไม่สอดคล้องภายใน RK4); P2 ย้ายไปใช้ D พร้อมกับ slipstream และ ground effect ที่หาง (2.9) และคงรูปอนุพันธ์ไว้เป็นทางเลือก `sim.tailModel = "derivative"` สำหรับเครื่องที่มีข้อมูลเป็น derivative เท่านั้น (เช่นข้อมูลจาก JSBSim)

## 2.4 Ground effect: แรงต้านเหนี่ยวนำและแรงยก

พื้นบังคับให้ความเร็วตั้งฉากกับพื้นเป็นศูนย์ เท่ากับมีระบบ vortex สะท้อน (image) ใต้พื้นซึ่งสร้าง upwash ที่ปีกและที่หาง ผลคือ (1) induced drag ลดลง เครื่อง "ลอย" (2) ที่ CL เท่าเดิมใช้ α น้อยลง (3) downwash ที่หางลดลง เกิดโมเมนต์ก้มหัว ต้องดึงคันเพิ่มตอน flare PHAK ระบุว่าเมื่อออกจาก ground effect เครื่องจะ "Experience a decrease in stability and a nose-up change in moment" ต้องเพิ่ม AOA เพื่อคง CL และผลจะชัดเมื่อสูงไม่เกินช่วงปีก [U9, p. 5-12]

**สูตรที่มีในเอกสาร** (h = ความสูงของปีกเหนือพื้น m, b = ช่วงปีก m; อัตราส่วน $k_D = C_{Di,IGE}/C_{Di,OGE}$ ที่ CL เดียวกัน):

$$\text{Tani/Torenbeek (NACA TR 738 p. 10):}\quad \sigma = \exp\!\left[-2.48\left(\frac{2h}{b}\right)^{0.768}\right],\qquad k_D = 1-\sigma$$

(NACA TR 738 เขียนสูตรนี้ในรูป log ของ σ โดยใช้ d = ระยะจาก aerodynamic center ของปีกถึงพื้น และอ้างงานทฤษฎีในรายการอ้างอิง สแกน OCR ไม่ชัดว่าระบุชื่อ Tani หรือไม่ ส่วน Phillips และ Hunsaker เรียกรูป $1-\exp[\,\cdot\,]$ ว่าสูตรของ Torenbeek (1982) [U7, U8] ชื่อ "Tani" ในหัวข้อนี้จึงเป็นป้ายเรียกที่ยังไม่ยืนยัน แต่ตัวสูตรและค่าคงที่ยืนยันจากทั้งสองแหล่ง ความเชื่อมั่น: สูง)

$$\text{McCormick (ที่ repo ใช้):}\quad k_D = \frac{(16h/b)^2}{1+(16h/b)^2},\qquad \text{Hoerner–Borst:}\quad k_D = \frac{33(h/b)^{1.5}}{1+33(h/b)^{1.5}}$$

Katzoff และ Sweberg ให้การลดมุมปะทะที่ CL เดียวกัน $\Delta\alpha = -\dfrac{57.3\,C_L}{\pi A}\,\sigma$ (องศา) โดยวัด h ที่ aerodynamic center และระบุว่าในท่าลงจอด σ อาจถึงราว 0.5 [U7, p. 10] Phillips และ Hunsaker พบว่าสูตรนี้ (ในชื่อ Torenbeek) ตรงกับ Hoerner–Borst ภายใน ±6% เมื่อ h/b > 0.08 และสูตร McCormick ในตำราพิมพ์ครั้งแรกมีที่พิมพ์ผิด ซึ่งรูป $(16h/b)^2/[1+(16h/b)^2]$ ที่ repo ใช้คือรูปที่ Phillips และ Hunsaker ระบุว่ามาจากที่พิมพ์ผิดนั้น (eq. 2; รูปที่แก้แล้วอยู่ใน eq. 3) [U8, eq. 1–4] งานเดียวกันสรุปว่าอัตราส่วนขึ้นกับรูปทรงปีก AR และ CL ด้วย ไม่ใช่ h/b อย่างเดียว [U8] แต่ค่าคงที่ของสูตรใหม่ (eq. 10–19) อ่านจาก PDF ได้ไม่ครบ จึง**ไม่นำมาใช้**

**ผลเชิงตัวเลข** (`u2_ge_table.mjs`; VLM แถวเดียว + image ของปีกในโมเดลภาพ: semi-span 5.1 m, คอร์ด 2.2→1.0 m, dihedral 6°, washout 2.5°, h วัดที่ c/4 ของโคนปีก, ค่าประมาณ):

| h/b | $k_D$ McCormick (repo) | $k_D$ Tani [U7] | $k_D$ Hoerner–Borst [U8] | $k_D$ JSBSim c172p [U5] | $k_D$ VLM เครื่องฝึก | $k_L$ repo | $k_L$ Tani + Katzoff | $k_L$ JSBSim c172p | $C_{L\alpha}$ ratio VLM |
|---|---|---|---|---|---|---|---|---|---|
| 0.05 | 0.390 | 0.345 | 0.270 | 0.497 | 0.594 | 1.073 | 1.168 | 1.165 | 1.372 |
| 0.10 | 0.719 | **0.513** | 0.511 | 0.515 | 0.640 | 1.034 | **1.120** | 1.127 | 1.143 |
| 0.15 | 0.852 | 0.626 | 0.657 | 0.629 | 0.712 | 1.018 | 1.089 | 1.090 | 1.082 |
| 0.20 | 0.911 | **0.707** | 0.747 | 0.709 | 0.769 | 1.011 | **1.069** | 1.073 | 1.056 |
| 0.30 | 0.958 | 0.813 | 0.844 | 0.815 | 0.846 | 1.005 | 1.043 | 1.046 | 1.032 |
| 0.50 | 0.985 | **0.916** | 0.921 | 0.928 | 0.920 | 1.002 | **1.019** | 1.019 | 1.015 |
| 1.00 | 0.996 | 0.985 | 0.971 | 1.000 | 0.974 | 1.000 | 1.003 | 1.002 | 1.004 |

ข้อสังเกตจากตาราง:
1. ตัวเลขของ PHAK ("one-tenth its span … 47.6 percent", "one-fourth … 23.5 percent", "equal to its span … 1.4 percent") [U9, p. 5-11] ตรงกับสูตร Tani (48.7%, 23.3%, 1.5%) และตาราง `kCDge` ของ JSBSim c172p (อินพุต `aero/h_b-mac-ft`) ตรงกับ $1-\sigma$ ของ Tani ภายใน 0.006 ที่ h/b 0.1–0.4 และ 0.012 ที่ 0.5 (ยกเว้นจุด h/b = 0 ที่ตั้งไว้ 0.48) [U5, c172p.xml:411–431; ผลต่างจาก `u2_review.mjs`] สูตรที่ repo ใช้จึงเป็นค่าที่แยกออกจากกลุ่ม
2. $k_L$ ตามรูป Katzoff ที่ใช้กับมุมเหนี่ยวนำ ($C_{L\alpha,w}$ = 4.4 /rad ซึ่งเท่ากับ $a_{2D} = 0.9\cdot 2\pi$ ที่ปรับเป็น A = 6.38 แล้วได้ 4.41, ค่าประมาณ) ตรงกับตาราง `kCLge` ของ JSBSim c172p ภายใน 0.01 ที่ h/b 0.1, 0.15, 0.2, 0.3 และ 0.5 แต่ที่ h/b 0.4 ตาราง JSBSim ให้ 1.055 (สูงกว่าจุด 0.3 คือไม่เป็นฟังก์ชันทางเดียว น่าจะเป็นค่าที่พิมพ์ผิดในไฟล์) เทียบ 1.028 ของสูตร [U5, c172p.xml:433–452] และใกล้ VLM เมื่อ h/b ≥ 0.15
3. VLM ของปีกเครื่องฝึกให้ $k_D$ สูงกว่า Tani (ลดน้อยกว่า) ที่ h/b ต่ำ เพราะ dihedral 6° ยกปลายปีกสูงกว่าโคน 0.48 m ถ้าวัดความสูงที่ MAC (สูงกว่าโคนราว 0.21 m) ความต่างจะลดลงเหลือราว 0.07 ซึ่งเข้ากับข้อสรุปของ Phillips และ Hunsaker ว่ารูปทรงปีกมีผล [U8]
4. $k_D$ ของ Tani ต่างจาก 1 เกิน 5% เมื่อ h/b < 0.64 (0.942 ที่ 0.6, 0.952 ที่ 0.65) และเหลือต่างเพียง 0.3% ที่ h/b 1.5 จึงตัดการคำนวณเมื่อ h/b > 1.5 ได้

**โมเดลที่เสนอ (ปีก)** ใช้ σ ตัวเดียวกับทั้งแรงยกและแรงต้าน ในรูปการลดมุมเหนี่ยวนำของ Katzoff [U7, p. 10]:

$$\alpha_{\rm eff} = \alpha + \sigma\,\frac{C_{L,w}}{\pi A}\quad\Rightarrow\quad C_{L,w} = \frac{C_{L,w}^{\rm OGE}(\alpha)}{1-\sigma\,C_{L\alpha,w}/(\pi A)},\qquad C_{Di} = K\,(1-\sigma)\,(C_L - C_{L,minD})^2$$

สัญลักษณ์: $C_{L,w}$ แรงยกปีก-ลำตัว, $C_{L\alpha,w}$ ≈ 4.4 /rad (4.8 ของ `AC` ลบส่วนหาง 0.38, ค่าประมาณ), $A = b^2/S$ = 6.38, $K$ = `AC.K`, $C_{L,minD}$ = 0.15 ตามโค้ดเดิม จุดสำคัญคือ**ใส่ $\alpha_{\rm eff}$ เข้า stall blend ด้วย** CLmax ใน ground effect จึงเท่าเดิม แต่ stall เกิดที่ α ต่ำลง $\sigma C_{L\max}/(\pi A)$ = 2.2° ที่ h/b 0.1 ส่วนโค้ดปัจจุบันคูณความชัน ทำให้ CLmax สูงขึ้นราว 2% โดย α_stall ไม่เปลี่ยน

**ความสูงอ้างอิง** วัดจาก c/4 ของ MAC ซ้ายและขวา ที่ $\mathbf r_{L,R}$ = [0, ∓2.51, +0.15] m (FRD จาก CG, คำนวณจากโมเดลภาพ: MAC อยู่ห่างโคน 2.01 m, คอร์ด 1.68 m, ค่าประมาณ) แล้วแปลงเป็นความสูงเหนือพื้นด้วย quaternion:

$$h_{L,R} = -\big(s_d + (\mathbf R\,\mathbf r_{L,R})_d\big),\qquad \sigma = \tfrac12\big[\sigma(h_L/b)+\sigma(h_R/b)\big],\qquad \Delta C_l = -\frac{y_{mac}}{b}\cdot\frac{C_{L,w}}{2}\,\big[k_L(h_R)-k_L(h_L)\big]$$

($s_d$ = `s[2]`, ตำแหน่ง d ของ CG ใน NED) ตอนจอดนิ่งได้ h/b = 0.113 ไม่ใช่ 0.094 ที่โค้ดปัจจุบันให้ เมื่อเอียงปีกใกล้พื้น ปีกที่ต่ำได้แรงยกเพิ่มมากกว่า เกิดโมเมนต์ม้วนกลับเข้าระดับ ($\Delta C_l$ ลบเมื่อปีกขวาต่ำ) ซึ่งช่วยลดโอกาสปลายปีกแตะพื้นตอนลงจอดลมขวาง ผลนี้เล็ก (ที่ bank 5° ความสูงปลาย MAC ต่างกัน 0.44 m) จึงเป็น P3

## 2.5 Ground effect: downwash ที่หางและการเปลี่ยน trim ตอน flare

NACA TR 738 สรุปว่าพื้นทำให้ "the large reduction of downwash in take-off or in landing" และดัน wake ขึ้นจนอาจคลุมหาง [U7, pp. 1–3] ในตัวอย่างของรายงาน (wake เริ่มที่ h/b = 0.1, แฟลปลง) downwash ที่แนวบานพับลดลงราว 5° เหลือ 5.7° และเมื่อหักผลที่ α ลดลง 1.2° แล้ว มุมปะทะหางยังเพิ่มราว 3.8° (สแกน OCR อ่านตัวเลขนี้ได้ "3. 0" ค่า 3.8° จึงได้จาก 5° − 1.2° และค่าก่อนลดราว 10.7° เป็นการอนุมานจาก 5.7° + 5°) [U7, pp. 11–12] downwash ที่เหลือจึงราวครึ่งหนึ่ง (ความเชื่อมั่น: กลาง)

**VLM ของเครื่องฝึก** (`u2_ge_table.mjs`, ค่าประมาณ) ให้อัตราส่วน downwash ที่หางที่ CL เดียวกัน $r_\varepsilon = \varepsilon_{IGE}/\varepsilon_{OGE}$ = 0.585 ที่ h/b 0.1, 0.747 ที่ 0.2 และ 0.931 ที่ 0.5 (เฉลี่ยตำแหน่งหางห้าระดับ ±0.3–0.9 m เพราะไม่รู้ตำแหน่ง wake แน่ชัด, พิสัย 0.56–0.60 ที่ h/b 0.1) ซึ่งเข้ากับตัวอย่างของ NACA TR 738 fit แบบสองพารามิเตอร์ได้ดี (RMS 0.010, `u2_expected.mjs`):

$$r_\varepsilon(h/b) = 1 - \exp\!\left[-3.99\,(h/b)^{0.652}\right]$$

**โมเมนต์ก้มหัวและ elevator ที่ต้องเพิ่ม** ในรูปอนุพันธ์ (ยังไม่แยกหาง) ใส่เป็น

$$\varepsilon = \varepsilon_0 + \frac{d\varepsilon}{d\alpha}\,\frac{C_{L,w}}{C_{L\alpha,w}},\qquad \Delta C_{m,GE} = -\eta_t\,\bar V_H\,a_t\,(1-r_\varepsilon)\,\varepsilon,\qquad C_{m\dot\alpha}^{GE} = r_\varepsilon\,C_{m\dot\alpha}$$

(ε มาจากแรงยกของปีกรวมแฟลป เพราะ downwash แปรตามแรงยก; $\varepsilon_0$ ตั้ง 0 ได้สำหรับปีกที่ไม่มี twist มาก) ผลที่ 80 kt IAS, แฟลปลง, CL ที่ต้องการ 1.305, VTBD 31 °C (`u2_expected.mjs`, ค่าประมาณ):

| h/b | σ | Δα เหนี่ยวนำ | ε นอก GE | Δε | $\Delta C_{m,GE}$ | Δα trim | Δδe trim (ลบ = ดึง) |
|---|---|---|---|---|---|---|---|
| 0.1 | 0.487 | −1.81° | 6.8° | −2.79° | −0.102 | −1.51° | **−4.13°** |
| 0.2 | 0.293 | −1.09° | 6.8° | −1.68° | −0.061 | −0.91° | −2.49° |
| 0.5 | 0.084 | −0.31° | 6.8° | −0.54° | −0.020 | −0.25° | −0.82° |
| โค้ดปัจจุบัน h/b 0.1 | φ = 0.719 | — | — | — | −0.017 | −0.16° | −0.74° |

ขนาด −0.10 อยู่ในระดับเดียวกับตัวอย่าง NACA TR 738 (มุมปะทะหางเพิ่ม 3.8° × $\eta_t\bar V_H a_t$ 2.09 = −0.14) โค้ดปัจจุบันจึงทำให้ flare "ง่ายเกินไป" คือไม่ต้องดึงคันเพิ่มใกล้พื้น และเครื่องลอยน้อยเกินเมื่อ flare สูง หลังแก้ต้องจูน flare ของ AP ใหม่และตรวจแรงคันกับหัวข้อ 6

## 2.6 Slipstream: ทฤษฎี actuator disk, การหดตัว และความดันพลวัตที่หาง

ใบพัดเร่งอากาศที่ไหลผ่านจาน ความเร็วเหนี่ยวนำที่จาน $v_i$ ได้จากสมดุลโมเมนตัม (สูตรเดียวกับ `Vinduced` ของ JSBSim ที่อ้าง McCormick eqn 6.15 [U6, FGPropeller.cpp:267–277] และหัวข้อ 3 [U16]) ในกระแสไกลหลังจานความเร็วเหนี่ยวนำเป็นสองเท่า มวลไหลคงที่จึงทำให้ท่อกระแสหดตัว:

$$v_i = \tfrac12\left(-u_p + \sqrt{u_p^2 + \frac{2T}{\rho A_p}}\right),\qquad V_s(x) = u_p + v_i\,k_x,\qquad k_x = 1 + \frac{x}{\sqrt{R^2+x^2}}$$

$$r_s = R\sqrt{\frac{u_p+v_i}{u_p+2v_i}},\qquad \bar q_s = \tfrac12\rho V_s^2 = \bar q + \frac{T}{A_p}\ (\text{เมื่อพัฒนาเต็ม}),\qquad \frac{\bar q_s}{\bar q} = 1 + \frac{8\,T_c}{\pi},\ T_c = \frac{T}{\rho V^2 D^2}$$

สัญลักษณ์: $u_p$ ความเร็วอากาศตามแกนใบพัด (m/s), $T$ แรงขับ (N), $A_p = \pi R^2$ = 4.676 m² (D 2.44 m), $V_s$ ความเร็วแกนในกระแส (m/s), $x$ ระยะหลังจาน (m), $k_x$ ตัวคูณการพัฒนาบนแกนจากแบบจำลอง vortex cylinder (ค่าประมาณ; ที่ปีก x ≈ 3.4 m ได้ 1.94 ที่หาง x ≈ 9.1 m ได้ 1.99 จึงถือว่าพัฒนาเต็ม), $r_s$ รัศมีกระแสที่หดแล้ว (m), $T_c$ สัมประสิทธิ์แรงขับ (8/π มาจาก $T/(A_p\bar q)$, คำนวณเอง)

**ทำไมใช้ $\bar q_s$ ตรง ๆ ไม่ได้** อุโมงค์ลมเต็มขนาดใน NACA TR 690 พบว่าเมื่อ $\bar q$ เฉลี่ยตามแนวบานพับหางสูงถึง 1.70 $q_0$ ค่า "effective" จากประสิทธิผลหางจริงเพิ่มเป็นเพียง 1.30 $q_0$ ที่ $T_c'$ = 0.139 (สัมประสิทธิ์แรงขับที่อิงพื้นที่ปีก $T/(q_0 S)$ ไม่ใช่ $T_c$ ที่อิง $D^2$; เครื่องฝึกที่ 80 kt กำลังเต็มมี $T_c'$ ≈ 0.55 และที่ approach ≈ 0.08 จึงเป็นการ extrapolate) [U11, p. 224 และ Concluding Remarks ข้อ 5 p. 241] เพราะพื้นผิวในเจ็ตแคบสร้างแรงได้น้อยกว่าผลรวมแบบ strip และกระแสที่หางมีขอบเขตชัดเจน ("well defined") เส้นผ่านศูนย์กลางราวเท่าใบพัด [U11, Concl. 8] NACA TR 941 ก็ไม่ใช้ทฤษฎีกระแสทรงกระบอกตรง ๆ แต่ใช้อัตราส่วน $R_s$ ของประสิทธิผล stabilizer ตอนมีกำลังต่อไม่มีกำลัง (ไม่ใช่ $\bar q$ โดยตรง) ที่แปรตาม $\Delta T_c$ และ $D/b_t$ สูงสุดเมื่อหางอยู่บนแนวแรงขับ และลดลงเชิงเส้นเป็น 1 ที่ระยะหนึ่ง D เหนือหรือใต้แนวนั้น [U10, eq. 5, Fig. 10, pp. 408–410] จึงเสนอรูปกึ่งทฤษฎี:

$$\bar q_{t} = \eta_t\Big[\bar q + \kappa\,k_H(r_s)\,(\bar q_s - \bar q)\Big],\qquad \bar q_{v} = \eta_v\Big[\bar q + \kappa\,k_V(r_s)\,(\bar q_s - \bar q)\Big],\qquad \kappa \approx \frac{1.30-1}{1.70-1} = 0.43$$

โดย $k_H$, $k_V$ คือสัดส่วนพื้นที่หาง (ถ่วงคอร์ด) ในวงกลมรัศมี $r_s$ รอบแนวแรงขับ สมมติว่ากระแสที่หางอยู่บนแนวแรงขับ เพราะการเอียงตามลมอิสระ (ขึ้นเทียบลำตัวราว $\arctan[V\sin\alpha/(V\cos\alpha+2v_i)]$) หักล้างกับ downwash ของปีก (ราว 4–5° ทั้งคู่, ค่าประมาณ) เรขาคณิตจาก `src/70-aircraft.js:157–176`: หางระดับสูงกว่าแนวแรงขับ 0.24 m กว้าง 3.7 m; หางดิ่งเริ่มที่ 0.28 m สูง 1.75 m พื้นที่ 2.06 m²

ผลของเครื่องฝึก (`u2_slip.mjs`, VTBD 31 °C, ρ = 1.160 ที่พื้น และ 1.127 สำหรับแถว approach ที่ 300 m; แรงขับจาก `thrustAvail()` ปัจจุบัน; ค่าประมาณ):

| สภาวะ | V (kt) | T (N) | $T_c$ | $v_i$ (m/s) | $V_s$ (m/s) | $r_s$ (m) | $\bar q_s/\bar q$ | $k_H$ / $k_V$ | $\bar q_{t}/(\eta_t\bar q)$ |
|---|---|---|---|---|---|---|---|---|---|
| อยู่กับที่ กำลังเต็ม | 0 | 11,500 | ∞ | 32.6 | 65.1 | 0.86 | ∞ ($\bar q_s$ 2,459 Pa) | 0.44 / 0.40 | $\bar q_t/\eta_t$ = 465 Pa (เทียบเท่า EAS ราว 54 kt) |
| วิ่งขึ้น 40 kt | 40 | 10,593 | 3.62 | 22.6 | 65.8 | 0.99 | 10.2 | 0.52 / 0.48 | 3.07 |
| rotate 70 kt | 70 | 9,246 | 1.03 | 16.3 | 68.6 | 1.07 | 3.63 | 0.57 / 0.53 | 1.64 |
| go-around 80 kt | 80 | 8,783 | 0.75 | 14.5 | 70.2 | 1.09 | 2.91 | 0.58 / 0.54 | **1.48** |
| 110 kt กำลังเต็ม | 110 | 7,501 | 0.34 | 10.3 | 77.3 | 1.14 | 1.86 | 0.61 / 0.57 | 1.23 |
| approach trim (`setApproach`) | 99 TAS | 1,973 | 0.113 | 3.4 | 57.9 | 1.18 | 1.29 | 0.64 / 0.60 | **1.08** |
| approach idle | 99 TAS | 357 | 0.021 | 0.7 | 52.3 | 1.21 | 1.05 | 0.66 / 0.61 | 1.01 |

**ผลที่ตามมา** (1) อยู่กับที่ elevator ขึ้นสุดให้ราว 5.5 kN·m (= $\bar q_t/\eta_t \cdot S\bar c\,|C_{m\delta e}|\,\delta_{e,up}$ = 465 × 16.3 × 1.65 × 1.15 × 0.384 เพราะ `Cmde` รวม $\eta_t$ ไว้แล้ว; สคริปต์ `u2_slip.mjs` รุ่นแรกหาร 0.9 ซ้ำจึงได้ 6.1, แก้ใน `u2_review.mjs`) แต่ต้องใช้ 7.7 kN·m เพื่อยกล้อหน้า (2,914 N × 2.65 m) บวก 15.7 kN·m ที่แรงขับซึ่งอยู่สูงจากพื้นราว 1.36 m (CG ตอนจอด 1.304 m + 0.06 m) กดหัวลง ล้อหน้าจึงยกไม่ได้ (ถูกต้อง) แต่นักบินรู้สึกแรงบังคับตั้งแต่ความเร็วต่ำ (2) elevator/rudder มีประสิทธิผล 3 เท่าที่ 40 kt และ 1.6 เท่าตอน rotate (3) go-around: หางที่รับแรงกดอยู่แล้วกดแรงขึ้นตามอัตรา 1.48/1.08 จึงเชิดหัว (2.8) (4) approach ปกติเพิ่มเพียง 8%

เทียบกับ JSBSim c172p ซึ่งใช้ `qbar-induced` = ½ρ(u + 2v_i)² กับ elevator และ rudder โดยตรง [U5, c172p.xml:455–472, 830, 908] คือเท่ากับ $\kappa k$ = 1 ทำให้ที่ 80 kt กำลังเต็มได้อัตรา 2.91 แทน 1.48 ซึ่งเป็นขอบบนของความเป็นไปได้ ข้อมูลสำรวจของ NASA ยืนยันทิศทาง: ประสิทธิผลพื้นบังคับเพิ่มตามสัมประสิทธิ์แรงขับ [U15, p. 27] และในงานอ้างอิงหนึ่งที่รายงานสรุปไว้ slipstream เพิ่มการหน่วง yaw ของหางดิ่ง "by a factor of three ... for low advance ratios" [U15, p. 25]

## 2.7 Slipstream: การหมุนวน (swirl) ที่หางดิ่ง

ใบพัดหมุนตามเข็มเมื่อมองจากด้านหลัง ($s = +1$) ทำให้กระแสหมุนทางเดียวกัน ด้านบนของกระแสอากาศเคลื่อนไปทาง +y ปะทะด้านซ้ายของหางดิ่ง หัวจึงหันซ้าย PHAK ว่าผลนี้ "very compact and exerts a strong sideward force on the aircraft's vertical tail surface" ที่กำลังสูงความเร็วต่ำ [U9, p. 5-31] ข้อมูลบินของ NASA กับเครื่อง GA: "At a speed of 110 knots, approximately 10° of rudder and 90 pounds of force are required to maintain heading" เมื่อเปลี่ยนกำลังจากสูงสุดเป็น idle (90 lbf ≈ 400 N; หัวข้อ lateral-directional statics, Fig. 8) [U14, Fig. 8] และในหัวข้อ stall ระบุว่าที่กำลังสูง "the pilot must use full-right rudder to maintain heading when near the stall speed" [U14, p. 18, Fig. 8–9] (เป็นผลรวม P-factor, swirl และแรงบิดของเครื่องหนึ่งลำในรายงาน ไม่ใช่ข้อมูลของเครื่องฝึก)

มุม swirl จากการอนุรักษ์โมเมนตัมเชิงมุม: แรงบิด dQ ของวงแหวนรัศมี r เท่ากับฟลักซ์โมเมนตัมเชิงมุม NACA TR 712 ให้ความสัมพันธ์ระหว่างมุมบิดของกระแส (angle of twist) กับ $dC_Q/dx$ ในสมการ 13–15 ใต้หัวข้อ "Angle of Twist in the Slipstream" และกราฟมุมบิดตามรัศมีใน Fig. 23 โดยสรุปว่ามุมบิดเฉลี่ยเป็นฟังก์ชันของ $C_Q$ [U12, pp. 155–156, eq. 13–15, Fig. 23] (สแกนอ่านตัวหารไม่ได้ทั้งหมด รูปข้างล่างจึงเป็นการเขียนใหม่จากหลักเดียวกัน, ค่าประมาณ):

$$\frac{dQ}{dr} = 2\pi\rho\,r^2\,(u_p+v_i)\,w_t(r),\qquad \tan\phi_{sw} = \frac{w_t}{u_p+v_i} = \frac{4\,dC_Q/dx}{\pi\,J^2x^2(1+a)^2}$$

ถ้าสมมติ $w_t r$ คงที่ตามรัศมี (free vortex) ระหว่างดุม $r_h$ ถึงปลาย และ $w_t r$ คงที่ตามเส้นกระแสเมื่อกระแสหดตัว:

$$w_t(r) = \frac{C_\Gamma}{r},\quad C_\Gamma = \frac{Q}{\pi\rho\,(u_p+v_i)\,(R^2-r_h^2)},\qquad \sigma_{sw}(z) = k_{sw}\,\arctan\frac{C_\Gamma}{z\,V_s}$$

สัญลักษณ์: $Q = P_{shaft}/\Omega$ (3,342 N·m ที่ 700 kW, 2,000 rpm), $w_t$ ความเร็วหมุนวน (m/s), $x = r/R$, $a = v_i/u_p$, $J$ advance ratio, $z$ ความสูงของหน้าตัดหางดิ่งเหนือแนวแรงขับ (m), $\sigma_{sw}$ sidewash ที่หางดิ่ง (rad, บวก = อากาศไปทาง +y), $k_{sw}$ ตัวคูณที่ปีกและลำตัวลด swirl = 0.5 (ค่าประมาณ ความเชื่อมั่นต่ำ ไม่พบข้อมูลปฐมภูมิที่เปิดได้) NACA TN 1474 ระบุว่าสำหรับหางระดับแบบปกติ (สมมาตร) ผลของการหมุนของ slipstream ต่อเสถียรภาพตามยาวมีน้อย และคาดว่าน้อยสำหรับแบบที่ทดสอบ [U13, pp. 2, 10] จึงใช้กับหางดิ่งเท่านั้น ($l_v$ = 5.25 m):

$$\beta_v = \beta - \frac{r\,l_v}{V} + \frac{p\,|z_v|}{V} - s\,\sigma_{sw},\qquad \Delta N_{sw} = -\,s\,k_V\,\kappa\,\eta_v\,\bar q_s\,S_v\,a_v\,\bar\sigma_{sw}\,l_v$$

ผล (`u2_slip.mjs`, $a_v$ = 2.8 /rad, $S_v$ = 2.06 m², ค่าประมาณ; rudder ที่ต้องใช้คิดจาก `AC.Cndr` = −0.072 คูณ $\bar q_v$ ที่รวม slipstream แล้ว, ลบ = rudder ขวา):

| สภาวะ | มุม swirl เฉลี่ยบนหางดิ่ง ($k_{sw}$ = 1) | $\Delta N_{sw}$ (N·m, $k_{sw}$ = 0.5) | rudder สำหรับ swirl อย่างเดียว ($k_{sw}$ = 0.5) |
|---|---|---|---|
| อยู่กับที่ กำลังเต็ม | 30.1° | −3,049 | −34° (เกิน rudder สุด 25°: ต้องใช้ nosewheel steering/เบรก) |
| 40 kt กำลังเต็ม | 22.0° | −2,714 | −18.2° |
| 70 kt กำลังเต็ม | 17.1° | −2,521 | −10.0° |
| 80 kt กำลังเต็ม (go-around) | 15.7° | −2,471 | **−8.3°** |
| 110 kt กำลังเต็ม | 11.8° | −2,362 | −5.0° |
| approach trim | 4.9° | −564 | −1.7° |

รวมกับ P-factor ของหัวข้อ 3 (rudder ขวา 2.8° ที่ 80 kt, α 10°) [U16] ได้ราว 11° ที่ 80 kt และราว 6° ที่ 110 kt ขนาดเดียวกับ 10° ของ TN D-3726 แต่ต่ำกว่าราว 40% ($k_{sw}$ ≈ 0.8 จะตรงกว่า) จึงให้ $k_{sw}$ เป็นพารามิเตอร์ปรับจูนที่ทดสอบด้วยช่วงกว้าง (T-U-13) และมี `sim.propEffectsScale` ให้ครูลดความยาก ตอนวิ่งขึ้นช่วงแรก $\beta_v$ เกิน 15° จึงต้องลดความชันหางดิ่งเมื่อมุมใหญ่ (stall blend แบบเดียวกับปีก)

## 2.8 Slipstream: ปีกในกระแสใบพัด แรงตั้งฉากใบพัด และผลรวมต่อเสถียรภาพ

**ปีกในกระแสใบพัด (blown wing)** ช่วงปีกในกระแสราว 0.9D (TR 941 ใช้เป็นสมมติฐาน "taken as 0.9D") [U10, p. 406] หักลำตัวกว้างราว 1.0 m เหลือ $S_b$ ≈ 2.63 m² (16% ของ S, ค่าประมาณ) ความเร็วแกนเพิ่มแต่ $V\sin\alpha$ ไม่เพิ่ม มุมปะทะเฉพาะที่จึงลดเป็นราว $\alpha V/V_s$ แรงยกจาก α จึงแปรตาม $V(V_s-V)$ ซึ่งเข้ากับผลทดลองที่ว่าแรงยกที่เพิ่ม "increased approximately in proportion to the slipstream velocity" [U15, p. 100] ส่วนแฟลปได้แรงเพิ่มตาม $\bar q_s$ เต็ม (ค่าประมาณ):

$$\Delta C_{L,b} = k_b\,\frac{S_b}{S}\left[C_{L\alpha,w}\,\alpha_w\left(\frac{V_s}{V}-1\right) + \Delta C_{L,flap}\left(\frac{V_s^2}{V^2}-1\right)\right],\qquad k_b \approx 0.5$$

ที่ go-around 80 kt กำลังเต็ม α 8° แฟลปลง ได้ $\Delta C_L$ = 0.12 (ราว 9% ของ CL) ที่ approach ได้ 0.016 ($k_b$ ประมาณจากผลขอบเจ็ตเดียวกับ κ, ความเชื่อมั่นต่ำ) ผลนี้ร่วมกับองค์ประกอบแรงขับ $T\sin\alpha$ ทำให้ stall speed ตอนมีกำลังต่ำกว่าตอน idle NACA TR 941 มีสูตรประมาณขั้นเดียวสำหรับ $\Delta C_{L,w}$ (สมการ 3) ที่ใช้คอร์ดปีกที่ตำแหน่ง 0.75R จากแนวกลาง (0.50R สำหรับใบพัดหมุนสวนทาง) แต่สแกนอ่านตัวสมการไม่ได้ [U10, pp. 404–405] จึงจัดเป็น P3

**แรงตั้งฉากใบพัด (Ribner)** ใบพัดที่แกนเอียงจากลมสร้างแรงในระนาบจานเหมือนครีบ [U19] หัวข้อ 3 คำนวณตาราง $C_{N\mu}(J,\beta)$ แล้วได้ $dC_m/d\alpha$ ≈ +0.22 /rad ที่กำลังเต็ม (ไม่เสถียร ราว 30% ของ `AC.Cma`) และ ΔCm ≈ +0.038 ที่ 80 kt α 10° [U16] จึงใช้ผลนั้นตรง ๆ NACA TR 690 ยืนยันว่าแรงแนวตั้งของใบพัดที่เอียงเป็นตัวหลักของแรงยกที่เพิ่มเมื่อมีกำลัง (ราว 85% ตามงานอ้างอิงที่ 4 และเกือบ 100% ตามงานอ้างอิงที่ 5 ของรายงาน) [U11, p. 215]

**ผลรวมต่อเสถียรภาพตามยาวเมื่อมีกำลัง** มีห้าพจน์ (TR 941 แยกเป็นผลตรงของใบพัด, slipstream ต่อแรงยกและโมเมนต์ของปีก-ลำตัว, downwash ที่หาง, ประสิทธิผล stabilizer และประสิทธิผล elevator) [U10, pp. 401–409]: (1) แรงขับและแรงตั้งฉากใบพัด (ไม่เสถียร) (2) $\bar q$ ที่หางเพิ่ม (เสถียรขึ้นและขยายแรงหางที่ trim) (3) dε/dα เพิ่มเมื่อมีกำลัง ซึ่ง TR 690 ว่า "considerably increased by propeller operation" สำหรับเครื่องปีกนางนวลและปีก parasol [U11, Concl. 7] (ไม่เสถียร) (4) แรงยกและ (5) โมเมนต์ของปีกในกระแส TR 941 ระบุว่าพารามิเตอร์การออกแบบหลายตัวมีผลทั้งทางเสียและทางดี จึงควรประเมินผลของกำลังเป็นรายแบบ และในแบบจำลองหนึ่ง (model 21) ผลทางเสียกับทางดีหักล้างกันจนการเปลี่ยนแปลงสุทธิน้อย [U10, pp. 412, 414] ข้อสรุปเชิงปฏิบัติคือต้องคำนวณทุกพจน์ (ข้อสรุปของผู้เขียนหัวข้อนี้) และ NASA TN D-3726 รายงานว่าเครื่อง GA ในท่าลงจอด เมื่อเพิ่มกำลังจาก approach เป็นสูงสุดที่ 80 kt (แบบ waveoff) นักบินต้องดันคันราว 8 lbf (≈ 36 N) เพื่อต้านการเชิดหัว [U14, Fig. 5]

ประมาณสำหรับเครื่องฝึก: ถ้าหางรับ $C_{m,t}$ ≈ +0.10 ตอน trim แฟลปลง (เท่ากับ |`Cmflap`|) การเพิ่มกำลังเต็มที่ 80 kt ให้ $\Delta C_m \approx 0.10(1.48-1.08) = +0.04$ รวมแรงตั้งฉาก +0.038 [U16] ได้ราว +0.08 เชิดหัว ต้องใช้ elevator ก้มราว 2.7° ทิศตรงกับ TN D-3726 ส่วนพจน์ (3) ยังไม่มีตัวเลขที่อ่านได้ (Fig. 9 ของ TR 941) จึงตั้ง `k_deda_power` = 0 ไว้ก่อน (ค่าประมาณทั้งย่อหน้า)

## 2.9 โครงสร้างโค้ดที่แนะนำใน `src/20-flight.js`

ทุกฟังก์ชันข้างล่างเป็น pure JS ไม่แตะ DOM ใช้ได้ใน `test/harness.mjs` และไม่จองหน่วยความจำใหม่ในเส้นทางร้อน (ใช้ object ที่ส่งเข้าไป) พารามิเตอร์มาจาก `AC.interference` ตาม JSON ใน 2.10

```js
// ── ground effect: Tani/Katzoff sigma evaluated at the left and right MAC quarter-chords ──
const geSigma = (hb, P) => (hb >= P.cutoffHb ? 0 : Math.exp(-P.a * Math.pow(2 * Math.max(hb, P.minHb), P.m)));
function groundEffect(s, R, G, out) {               // G = AC.interference.groundEffect (values only)
  const r = G.rMac, zL = R[6] * r[0] - R[7] * r[1] + R[8] * r[2], zR = R[6] * r[0] + R[7] * r[1] + R[8] * r[2];
  const hL = -(s[2] + zL), hR = -(s[2] + zR), b = AC.b;
  out.sL = geSigma(hL / b, G.sigmaModel); out.sR = geSigma(hR / b, G.sigmaModel);
  out.sig = 0.5 * (out.sL + out.sR);
  const hb = Math.max(0.5 * (hL + hR) / b, 0.02);
  out.rEps = hb >= G.sigmaModel.cutoffHb ? 1 : 1 - Math.exp(-G.rEps.a * Math.pow(hb, G.rEps.m));
  out.kL = 1 / (1 - out.sig * G.CLa_w / (Math.PI * G.A));
  return out;
}
// ── propeller slipstream (actuator disk + angular momentum), sense s = +1 clockwise from behind ──
function slipstream(up, T, Pshaft, Omega, rho, S, out) { // S = AC.interference.slipstream (values only)
  const R = 0.5 * S.diskDiameter, A = Math.PI * R * R;
  const v2 = up * Math.abs(up) + 2 * T / (rho * A);     // JSBSim-style sign handling for T < 0
  const vi = v2 > 0 ? 0.5 * (-up + Math.sqrt(v2)) : 0.5 * (-up - Math.sqrt(-v2));
  const Vs = Math.max(up + 2 * vi, 0);
  out.vi = vi; out.Vs = Vs; out.qs = 0.5 * rho * Vs * Vs;
  out.rs = R * Math.sqrt(Math.max(up + vi, 0) / Math.max(up + 2 * vi, 1e-3));
  out.kH = lerpTable(S.immersionH, out.rs); out.kV = lerpTable(S.immersionV, out.rs);   // 1-D table helper (not in repo yet; write it, clamp at the ends)
  const Q = Pshaft / Math.max(Omega, 1), C = Q / (Math.PI * rho * Math.max(up + vi, 0.5) * (R * R - S.hubRadius ** 2));
  out.swirl = S.sense * S.kSwirl * Math.atan(C / (S.zSwirl * Math.max(Vs, 1)));   // rad, + = flow toward +y at fin
  return out;
}
// in deriv(): after V, alpha, beta, atm
//   ge = groundEffect(s, R, GE, this._ge);  sl = slipstream(vab[0], T, Pshaft, Omega, atm.rho, SL, this._sl);
//   qH = qbar + SL.kappa * sl.kH * (sl.qs - qbar);  qV = qbar + SL.kappa * sl.kV * (sl.qs - qbar);
//   wing:  aEff = alpha + ge.sig * CLw_lin / (Math.PI * GE.A)  (CLw_lin from the previous stage or one fixed-point pass)
//          CLw = (CL0w + CLaw * aEff) blended with stallBlend(aEff, a0);  CDi = AC.K * (1 - ge.sig) * (CL - 0.15) ** 2
//   tail (derivative form, P1): Cm += -etaVHat * (1 - ge.rEps) * eps;  Cmadot_eff = AC.Cmadot * ge.rEps;
//          elevator / tail-lift terms use qH, rudder / fin terms use qV (multiply by qH/qbar, qV/qbar)
//   fin:   betaV = beta - r*lv/V - p*zv/V - sl.swirl  (zv < 0: fin above CG, FRD);  Y_fin = -qV*Sv*a_v*betaV, blended above 15 deg
//   alpha-dot (P1): closed form  adot = (u*wd0 - w*ud0) / (u*u + w*w + qbar*S*c/(2*m) * CLadot * (1 - sig) * cos(beta))   (section 2.3)
```

ลำดับงานที่ปลอดภัย: (1) แก้ α̇ แล้วยืนยันว่า `node test/flight.test.mjs` และ autoland ยังผ่าน (2) เปลี่ยน ground effect พร้อม `setApproach` และ AP flare (3) เพิ่ม slipstream แบบคูณ derivative ของ elevator/rudder ด้วย $\bar q_t/\bar q$, $\bar q_v/\bar q$ และเพิ่มแรง swirl ที่หางดิ่ง (4) เมื่อหัวข้อ 3 ส่ง $T$, $P_{shaft}$, Ω จริงมาแล้ว จึงเปิดใช้ `slipstream()` ด้วยค่าจริงแทน `thrustAvail()` (5) P2: ย้ายหางเป็นชิ้นส่วน (downwash หน่วงเวลา + $\bar q_t$ + $r_\varepsilon$ ในสมการเดียว) ต้นทุน CPU ของทั้งหมดราวสิบกว่า `Math.*` ต่อการเรียก `deriv()` (960 ครั้งต่อวินาทีจำลอง) ไม่มีผลต่อเฟรมเรต

## 2.10 ค่าพารามิเตอร์ (JSON)

```json
{"interference": {
 "downwash": {
  "deda": {"v": 0.40, "u": "-", "scope": "aircraft", "src": ["U4", "U17"], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ: อยู่ระหว่าง 0.36 (ถอยจาก AC) กับ 0.477 (Aeromatic)"},
  "eps0": {"v": 0, "u": "rad", "scope": "aircraft", "src": [], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ: downwash ที่ CL ปีก = 0; ใช้ ε = eps0 + deda·CL_w/CLa_w"},
  "l_t": {"v": 5.42, "u": "m", "scope": "aircraft", "src": ["U17", "U1"], "conf": "กลาง", "est": true, "note": "ค่าประมาณ: ถอยจาก Cmde/CLde (หัวข้อ 6); โมเดลภาพให้ราว 5.1 m"},
  "VH": {"v": 0.596, "u": "-", "scope": "aircraft", "src": ["U17"], "conf": "กลาง", "est": true, "note": "ค่าประมาณ: S_h l_t/(S c), S_h 2.96 m2"},
  "a_t": {"v": 3.9, "u": "1/rad", "scope": "aircraft", "src": ["U17"], "conf": "กลาง", "est": true, "note": "ค่าประมาณ: ความชันแรงยกหางระดับ"},
  "eta_t": {"v": 0.90, "u": "-", "scope": "aircraft", "src": ["U11", "U17"], "conf": "กลาง", "est": true, "note": "ค่าประมาณ: TR 690 วัด (q/q0)eff ที่หางเมื่อไม่มีใบพัดได้ 0.88–1.01 (Concl. 2)"},
  "CLadot": {"v": 1.67, "u": "1/(rad·c/2V)", "scope": "aircraft", "src": ["U2", "U4"], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ: 2 eta VH a_t deda; ปัจจุบัน 1.6"},
  "Cmadot": {"v": -5.50, "u": "1/(rad·c/2V)", "scope": "aircraft", "src": ["U2", "U4"], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ: -CLadot l_t/c; ปัจจุบัน -4.5; JSBSim c172p -7.27"},
  "tailModel": {"v": {"mode": "derivative", "alternative": "delay", "bufferHz": 240, "bufferLen": 256}, "u": "-", "scope": "sim", "src": ["U2", "U3"], "conf": "สูง", "est": false, "note": "delay = หางเป็นชิ้นส่วน ε หน่วง l_t/V"},
  "adotEstimator": {"v": {"method": "closedForm", "clampRadS": 2.0}, "u": "-", "scope": "sim", "src": ["U6"], "conf": "สูง", "est": false, "note": "แทน finite difference + filter 0.05 s (lag 46 ms); สูตร α̇ = (u ẇ − w u̇)/(u²+w²) ตาม FGAuxiliary แต่แก้แบบปิดรูปใน deriv() แทนการใช้ค่ารอบก่อน (หัวข้อ 2.3)"}
 },
 "groundEffect": {
  "sigmaModel": {"v": {"type": "tani", "a": 2.48, "m": 0.768, "cutoffHb": 1.5, "minHb": 0.02}, "u": "-", "scope": "sim", "src": ["U7", "U8", "U9"], "conf": "สูง", "est": false, "note": "sigma = exp(-a (2h/b)^m), kD = 1 - sigma"},
  "rMac": {"v": [0.0, 2.51, 0.15], "u": "m (FRD จาก CG, y ใช้ ±)", "scope": "aircraft", "src": ["U1"], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ: c/4 ของ MAC จากโมเดลภาพ"},
  "CLa_w": {"v": 4.4, "u": "1/rad", "scope": "aircraft", "src": ["U17"], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ: 4.8 ลบส่วนหาง"},
  "A": {"v": 6.38, "u": "-", "scope": "aircraft", "src": ["U1"], "conf": "สูง", "est": false, "note": "b^2/S จาก AC"},
  "rEps": {"v": {"a": 3.99, "m": 0.652}, "u": "-", "scope": "aircraft", "src": ["U7", "U18"], "conf": "กลาง", "est": true, "note": "ค่าประมาณ: eps_IGE/eps_OGE = 1 - exp(-a (h/b)^m) fit VLM, RMS 0.010"},
  "tablesCheck": {"v": {"axes": {"hb": [0.05, 0.1, 0.15, 0.2, 0.3, 0.5, 1.0]}, "data": [[0.345, 0.513, 0.626, 0.707, 0.813, 0.916, 0.985], [1.168, 1.120, 1.089, 1.069, 1.043, 1.019, 1.003], [0.432, 0.589, 0.686, 0.753, 0.838, 0.921, 0.982]]}, "u": "-", "scope": "aircraft", "src": ["U7", "U18"], "conf": "กลาง", "est": true, "note": "ค่าประมาณ: แถว kD, kL, rEps สำหรับการทดสอบ"}
 },
 "slipstream": {
  "diskDiameter": {"v": 2.44, "u": "m", "scope": "propeller", "src": ["U16"], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ: สมมติฐานร่วม (หัวข้อ 3)"},
  "hubRadius": {"v": 0.25, "u": "m", "scope": "propeller", "src": [], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ: รัศมี spinner สำหรับสูตร swirl"},
  "hubPos": {"v": [3.94, 0, -0.06], "u": "m (FRD จาก CG)", "scope": "aircraft", "src": ["U16", "U1"], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ: ตำแหน่งดุมจากโมเดลภาพ"},
  "sense": {"v": 1, "u": "-", "scope": "propeller", "src": ["U16"], "conf": "กลาง", "est": true, "note": "ค่าประมาณ: +1 = ตามเข็มเมื่อมองจากด้านหลัง (PT6A)"},
  "kappa": {"v": 0.43, "u": "-", "scope": "aircraft", "src": ["U11"], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ: (1.30-1)/(1.70-1) จาก TR 690 จุดเดียวที่ Tc' 0.139 (อิงพื้นที่ปีก); เครื่องฝึกใช้ที่ Tc' 0.08-0.55 จึงเป็นการ extrapolate"},
  "immersionH": {"v": {"axes": {"rs_m": [0.3, 0.5, 0.7, 0.8, 0.9, 1.0, 1.1, 1.22]}, "data": [0, 0.175, 0.327, 0.397, 0.464, 0.529, 0.591, 0.663]}, "u": "-", "scope": "aircraft", "src": ["U1", "U18"], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ: หางระดับสูงกว่าแนวแรงขับ 0.24 m"},
  "immersionV": {"v": {"axes": {"rs_m": [0.3, 0.5, 0.7, 0.8, 0.9, 1.0, 1.1, 1.22]}, "data": [0.015, 0.161, 0.298, 0.364, 0.427, 0.489, 0.548, 0.616]}, "u": "-", "scope": "aircraft", "src": ["U1", "U18"], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ: หางดิ่งเริ่มเหนือแนวแรงขับ 0.28 m สูง 1.75 m"},
  "kSwirl": {"v": 0.5, "u": "-", "scope": "aircraft", "src": ["U14"], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ: ปรับได้ 0.5–0.8 เทียบ TN D-3726"},
  "zSwirl": {"v": 0.55, "u": "m", "scope": "aircraft", "src": ["U18"], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ: แทนการอินทิเกรต คลาด < 2 deg"},
  "finArea": {"v": 2.06, "u": "m2", "scope": "aircraft", "src": ["U1"], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ: รวม rudder จากโมเดลภาพ"},
  "finArm": {"v": 5.25, "u": "m", "scope": "aircraft", "src": ["U1"], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ: CG ถึง c/4 เฉลี่ยของหางดิ่ง"},
  "finLiftSlope": {"v": 2.8, "u": "1/rad", "scope": "aircraft", "src": [], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ: ตรวจ: eta_v Vv a_v = 0.164 /rad; ถ้า tau_r 0.5 ได้ Cndr -0.082 เทียบ AC -0.072 (ต้องใช้ tau_r 0.44)"},
  "eta_v": {"v": 0.90, "u": "-", "scope": "aircraft", "src": [], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ"},
  "blownSpanFactor": {"v": 0.9, "u": "D", "scope": "aircraft", "src": ["U10"], "conf": "กลาง", "est": false, "note": "TR 941 p. 406"},
  "blownArea": {"v": 2.63, "u": "m2", "scope": "aircraft", "src": ["U10", "U1"], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ: (0.9 D - ความกว้างลำตัว 1.0 m) x คอร์ด 2.2 m"},
  "kBlown": {"v": 0.5, "u": "-", "scope": "aircraft", "src": [], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ: ผลขอบเจ็ตของปีก ประมาณเท่ากับ kappa"},
  "k_deda_power": {"v": 0, "u": "-", "scope": "aircraft", "src": ["U11"], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ: ยังไม่มีตัวเลขที่อ่านได้"},
  "propEffectsScale": {"v": 1.0, "u": "-", "scope": "sim", "src": [], "conf": "สูง", "est": false, "note": "ตัวคูณรวมผลใบพัด 0 = ปิด"}
 }
}}
```

## 2.11 กรณีทดสอบ

เงื่อนไขร่วม: VTBD 31 °C (`isaDev` ตาม `Flight`), m 2,250 kg, แฟลปและเกียร์ลงถ้าไม่ระบุ ค่าคาดหวังคำนวณด้วยสคริปต์ใน `scripts/` (`u2_expected.mjs`, `u2_delay.mjs`, `u2_ge_table.mjs`, `u2_slip.mjs`, `u2_adot_current.mjs`, `u2_current_misc.mjs`, `u2_review.mjs`) ค่าที่มาจากโมเดลที่เสนอเป็นค่าประมาณสำหรับ regression ไม่ใช่ข้อมูลบินจริง

| ID | สิ่งที่ทดสอบ | การตั้งค่า | ผลที่คาดหวัง (± tolerance) | ที่มาของค่าคาดหวัง | โมเดลปัจจุบัน |
|---|---|---|---|---|---|
| T-U-01 | สูตร α̇ derivative จากเรขาคณิต | `alphaDotDerivs({eta:0.9, VH:0.596, at:3.9, deda:0.40, lt:5.42, c:1.65})` | $C_{L\dot\alpha}$ = 1.674 ± 0.01, $C_{m\dot\alpha}$ = −5.50 ± 0.03 | สูตร [U2, U4] | ค่าคงที่ 1.6 / −4.5 (ไม่มีฟังก์ชัน) |
| T-U-02 | ความแม่นของ α̇ | `setApproach`, doublet elevator ±3° (0.5–1.5 s ลบ, 1.5–2.5 s บวก), 6 s, เทียบ α̇ อ้างอิงแบบ centred difference | RMS ความคลาด/RMS อ้างอิง < 0.03 และ lag (cross-correlation) ≤ 2 step (8 ms) | 2.3 | 0.130 และ 45.8 ms (11 step) |
| T-U-03 | รูปหน่วงเวลาเท่ากับรูปอนุพันธ์ | แบบจำลองสองสถานะของ `u2_delay.mjs` หรือ `tailModel="delay"` เทียบ `"derivative"`, elevator step −2° ที่ 0.2 s | q สูงสุด 3.99 ± 0.08 °/s ทั้งสองแบบ, ต่างกันทุกเวลา < 0.1 °/s, α สุดท้าย 2.45 ± 0.05° | `u2_delay.mjs` | ยังไม่มีฟีเจอร์ |
| T-U-04 | ผลของ $C_{m\dot\alpha}$ ต่อ short period | linearise ที่ approach 95 kt (48.9 m/s) (วิธีของหัวข้อ 10) | ζ เพิ่มขึ้น 0.019 ± 0.008 เมื่อเปลี่ยน $C_{m\dot\alpha}$ จาก −4.5 เป็น −5.5; ωn เปลี่ยน < 1% | `u2_delay.mjs` (สองสถานะ: 0.585 → 0.604) | ζ 0.578 (หัวข้อ 10) ที่ −4.5 |
| T-U-05 | อัตราส่วน induced drag | `groundEffect` ที่ h/b = 0.1, 0.2, 0.5 | $k_D$ = 0.513, 0.707, 0.916 (± 0.005) | Tani [U7]; PHAK 47.6%/23.5% [U9] | 0.719, 0.911, 0.985 |
| T-U-06 | แรงยกใน ground effect | α คงที่ 4° แฟลปเก็บ ความสูง MAC h/b = 0.1 เทียบ 3.0 | $C_{L,w}$ เพิ่ม 12.0 ± 1.0% (JSBSim c172p 12.7%, VLM 14.3%) | 2.4 [U5, U7] | CL รวม +1.9% (พจน์ α +3.4%; ความสูงตามโค้ดเดิม hw/b = 0.1, `u2_review.mjs`) |
| T-U-07 | stall ใน ground effect | กวาด α ที่ h/b 0.1 และ 3.0 แฟลปลง | CLmax เท่าเดิม ± 0.02; α ที่ CLmax ต่ำลง σ·CLmax/(πA) ± 0.3° (2.2° เมื่อ CLmax 1.6) | $\sigma C_{L\max}/(\pi A)$ [U7] | CLmax +≈2%, α_stall ไม่เปลี่ยน |
| T-U-08 | trim ตอน flare | trim ที่ 80 kt (41.2 m/s) IAS แฟลปลง เกียร์ลง ความสูง MAC h/b 0.1 เทียบนอก GE | Δδe = −4.1 ± 1.5° (ดึง), Δα = −1.5 ± 0.5° | 2.5 (VLM + NACA TR 738) | −0.74° และ −0.16° |
| T-U-09 | ความสูงอ้างอิงของ GE | `setParked` แล้วรอ 5 s; จากนั้นเอียง 5° บนอากาศที่ h/b 0.2 | จอด: h/b (MAC) = 0.113 ± 0.01; เอียงขวาลง: $\Delta C_l$ < 0 (ม้วนกลับ) | 2.4 | 0.094 และไม่มีโมเมนต์ม้วน |
| T-U-10 | actuator disk ตอนอยู่กับที่ | `slipstream(0, 11500, 700e3, 209.4, 1.160, AC.interference.slipstream (ค่าใน 2.10), out)` | $v_i$ = 32.56 ± 0.1 m/s (63.3 ± 0.2 kt), $\bar q_s$ = 2,459 ± 10 Pa, $r_s/R$ = 0.707 ± 0.002 | momentum theory [U6, U16] | ยังไม่มีฟีเจอร์ |
| T-U-11 | ประสิทธิผล elevator ตามกำลัง | 80 kt (41.2 m/s) กำลังเต็ม (T = 8,783 N); approach trim (T = 1,973 N); approach idle | $\bar q_t/(\eta_t\bar q)$ = 1.48 ± 0.05, 1.08 ± 0.02, 1.01 ± 0.01 | 2.6 (κ จาก [U11]) | 1.00 ทุกกรณี |
| T-U-12 | ล้อหน้าตอนอยู่กับที่กำลังเต็ม | `setParked`, เบรกเต็ม, thr 1, elevator ขึ้นสุด, 5 s | โมเมนต์ elevator 5.5 ± 1.1 kN·m (ไม่ใช่ศูนย์) แต่ล้อหน้ายังรับแรง > 500 N (ประมาณ 3,192 − 5,520/2.65 ≈ 1,100 N) | 2.6, `u2_review.mjs` | 0.07 N·m; ล้อหน้า 3,192 N |
| T-U-13 | swirl ต่อ rudder | บินตรง ปีกระดับ β = 0 กำลังเต็ม ที่ 80 kt (41.2 m/s) และ 110 kt (56.6 m/s), ปิด P-factor | rudder ขวา (δr < 0) 8.3 ± 4° ที่ 80 kt (41.2 m/s) และ 5.0 ± 3° ที่ 110 kt (56.6 m/s); รวม P-factor ที่ 110 kt (56.6 m/s) อยู่ใน 4–15° (TN D-3726 รายงานราว 10° [U14]) | 2.7 | 0° (กำลังไม่ทำให้เกิด yaw) |
| T-U-14 | ทิศการเชิดหัวตอน go-around | approach trim แล้วตั้ง thr = 1 ทันที (elevator คงที่), ดู $\dot q$ ใน 0.1 s แรก | $\dot q$ > 0 (เชิดหัว) และ ΔCm เทียบเท่า +0.04 ถึง +0.12; หลังหักผล phugoid ต้องดันคัน | 2.8, [U14 Fig. 5] | $\dot q$ = 0.000 °/s² ทันทีหลังเพิ่มกำลัง |
| T-U-15 | blown wing | 80 kt (41.2 m/s) กำลังเต็ม α 8° แฟลปลง | $\Delta C_L$ = 0.12 ± 0.06; ที่ approach trim 0.016 ± 0.01 | 2.8 | 0 |

## 2.12 ความขัดแย้งของแหล่งข้อมูลและข้อจำกัด
1. **สูตร ground effect ของ induced drag ต่างกันมาก** ที่ h/b = 0.1: McCormick (ที่ repo ใช้) 0.719, Tani/Torenbeek 0.513 [U7, U8], Hoerner–Borst 0.511 [U8], JSBSim c172p 0.515 [U5], VLM ของปีกเครื่องฝึก 0.640 (ค่าประมาณ) Phillips และ Hunsaker ระบุว่าสูตร McCormick รูปที่ repo ใช้มาจากที่พิมพ์ผิดในตำราพิมพ์ครั้งแรก [U8] และ PHAK ให้การลด 47.6% คือเหลือ 0.524 [U9] จึงเลือก Tani ความเชื่อมั่น สูง สำหรับปีกตรงแบน และกลางสำหรับปีกที่มี dihedral
2. **ความสูงอ้างอิงไม่ตรงกัน** NACA TR 738 ใช้ความสูงของ aerodynamic center [U7, p. 10] JSBSim ใช้ความสูงของ MAC (`hoverbmac`) [U6, FGAuxiliary.cpp:233] Phillips และ Hunsaker ใช้แนว quarter-chord [U8] โค้ดปัจจุบันใช้ CG − 0.35 m ข้อเสนอนี้ใช้ c/4 ของ MAC ซ้าย/ขวา ความต่างที่ h/b ต่ำมีผลมาก (0.094 กับ 0.113 ตอนจอด ทำให้ $k_D$ ต่างกันราว 0.05)
3. JSBSim c172p ตั้ง `kCDge` = 0.48 ที่ h/b = 0 ขณะที่ Tani ให้ 0 [U5] ไม่มีผลจริงเพราะปีกไม่ต่ำกว่า h/b ≈ 0.1
4. **dε/dα มีช่วงกว้าง** 0.36 (ถอยจาก AC), 0.40 (สูตร DATCOM ที่ยังไม่ยืนยัน), 0.477 (Aeromatic) และ 0.5–0.8 จาก VLM ที่ไวต่อความสูงหางเทียบ wake ผลต่อ $C_{m\dot\alpha}$ คือ −4.9 ถึง −6.6 แต่ ζ เปลี่ยนเพียงราว ±0.03 จึงไม่วิกฤต
5. Lag $l_t/V$ ของ Cowley–Glauert สั้นกว่าที่ Jones และ Fehlner คำนวณเล็กน้อย [U3] ไม่มีผลในช่วงความถี่ของเครื่องฝึก
6. **κ ของ slipstream** มีจุดข้อมูลเดียว (TR 690, เครื่องเดียว, $T_c'$ 0.139 ซึ่งอิงพื้นที่ปีก ขณะที่เครื่องฝึกใช้งานที่ $T_c'$ 0.08–0.55) [U11] ส่วน JSBSim c172p ใช้ $\bar q$ ของ slipstream เต็ม ($\kappa k$ = 1) [U5] ที่ 80 kt กำลังเต็มให้ประสิทธิผล elevator 1.48 เท่า (ข้อเสนอ) เทียบ 2.91 เท่า (JSBSim) ความจริงน่าจะอยู่ระหว่างนี้ ความเชื่อมั่นต่ำ
7. **ขนาดของ swirl** สูตรโมเมนตัมเชิงมุมให้มุม 16–30° ที่หางดิ่งตอนกำลังเต็ม แต่ปีกและลำตัวลด swirl ลงโดยไม่ทราบขนาด ($k_{sw}$ = 0.5 เป็นค่าประมาณ) เมื่อรวม P-factor ได้ราว 6° ที่ 110 kt เทียบ 10° ของเครื่อง GA ใน TN D-3726 [U14] ข้อมูลอ้างอิงของ PHAK เรื่อง corkscrew อยู่หน้า 5-31 ตามที่เปิดอ่าน ส่วนหัวข้อ 3 อ้างหน้า 5-32 [U9, U16] (ต่างกันที่ตัวแบ่งหน้าของ PDF)
8. **สมการของ NACA TR 941, TR 712 และค่าคงที่ของ Phillips–Hunsaker อ่านจากสแกนไม่ได้ครบ** จึงใช้เฉพาะข้อสรุปเชิงคุณภาพและสมการที่ตรวจด้วยการเขียนใหม่จากหลักเดียวกันได้ (TR 712 eq. 15)
9. **เรขาคณิตหางและครีบ** มาจากโมเดลภาพ (`70-aircraft.js`) และการถอยกลับของหัวข้อ 6 ไม่ใช่ข้อมูลเครื่องจริง เพราะเครื่องฝึกเป็นเครื่องสมมติ ทุกค่าจึงเป็นค่าประมาณ
10. ข้อจำกัดของ VLM: แถวเดียวตามคอร์ด, wake แบนไม่ม้วน ไม่เบนลง และ image ของ wake อยู่ที่ระดับปีก downwash ที่หางจึงไวต่อความสูงหาง (ค่าเฉลี่ยห้าระดับมีพิสัย ±0.02 ที่ h/b 0.1)

## 2.13 แหล่งอ้างอิง
1. [U1] AirfieldLab source: `src/20-flight.js` (บรรทัด 97–120, 144, 156–239, 273–288, 312–319), `src/70-aircraft.js` (บรรทัด 137–183) — ภายใน (repo ของเจ้าของ อ่านอย่างเดียว) · ยังไม่มี LICENSE
2. [U2] MIT 16.333 Aircraft Stability and Control, Fall 2004, Lecture 7 "Approximate Longitudinal Dynamics Models" (downwash lag หน้า 6-2, $C_{Z\dot\alpha}$, $C_{M\dot\alpha} = -2\eta V_H C_{L\alpha t}(d\varepsilon/d\alpha)(l_t/\bar c)$ หน้า 6-3; ไฟล์ไม่ระบุชื่อผู้สอน ชื่อ J. How ที่เคยใส่ไว้ยังไม่ยืนยันจากไฟล์), https://ocw.mit.edu/courses/16-333-aircraft-stability-and-control-fall-2004/2aca82b5d1a5aacf39ceffcfe4e5b517_lecture_7.pdf — ทุติยภูมิ (บันทึกบรรยาย) · MIT OpenCourseWare ซึ่งโดยทั่วไปเป็น CC BY-NC-SA (ไม่พบข้อความใบอนุญาตในไฟล์ที่เปิด) · อ้างสมการได้ ไม่คัดลอกเนื้อหา
3. [U3] R. T. Jones, L. F. Fehlner, "Transient Effects of the Wing Wake on the Horizontal Tail," NACA TN 771, 1940, https://ntrs.nasa.gov/api/citations/19930081625/downloads/19930081625.pdf — ปฐมภูมิ · งานรัฐบาลสหรัฐฯ (public domain ในสหรัฐฯ) · อ้างและคัดลอกข้อมูลได้
4. [U4] JSBSim Team, Aeromatic++ `utils/aeromatic++/Systems/Controls.cpp` (บรรทัด 139–142, 344, 359–361) และ `utils/aeromatic++/Aircraft.cpp` (บรรทัด 327–328), https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/utils/aeromatic++/Systems/Controls.cpp , https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/utils/aeromatic++/Aircraft.cpp — ซอร์สโค้ดเปิด · LGPL-2.1 · อ้างสูตรได้ ห้ามคัดลอกโค้ดเข้า repo ที่ยังไม่มี license ที่เข้ากันได้
5. [U5] JSBSim Team, `aircraft/c172p/c172p.xml` (kCDge/kCLge บรรทัด 411–452, qbar-induced 455–472, CLadot 694–702, Cmadot 816–825) และ `aircraft/pc7/pc7.xml` (สร้างด้วย Aeromatic 3.3.0), https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/aircraft/c172p/c172p.xml , https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/aircraft/pc7/pc7.xml — ข้อมูลโมเดลเปิด (ไม่ได้ validate, ระบุ "not to be sold") · อยู่ใต้ LGPL-2.1 ของ repo JSBSim · ใช้เทียบตัวเลขได้ ไม่คัดลอกตารางเข้า repo
6. [U6] JSBSim Team, `src/models/FGAuxiliary.cpp` (α̇ บรรทัด 175, `hoverbmac` บรรทัด 233) และ `src/models/propulsion/FGPropeller.cpp` (`Vinduced` บรรทัด 267–277), https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/src/models/FGAuxiliary.cpp , https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/src/models/propulsion/FGPropeller.cpp — ซอร์สโค้ดเปิด · LGPL-2.1 · อ้างอัลกอริทึมได้ ไม่คัดลอกโค้ด
7. [U7] S. Katzoff, H. H. Sweberg, "Ground Effect on Downwash Angles and Wake Location," NACA Report No. 738, 1943, https://ntrs.nasa.gov/citations/19930091817 (PDF https://ntrs.nasa.gov/api/citations/19930091817/downloads/19930091817.pdf) — ปฐมภูมิ · public domain ในสหรัฐฯ · อ้างและคัดลอกสูตร/ข้อมูลได้
8. [U8] W. F. Phillips, D. F. Hunsaker, "Lifting-Line Predictions for Induced Drag and Lift in Ground Effect," Journal of Aircraft 50(4):1226–1233, 2013, doi:10.2514/1.C032152, https://digitalcommons.usu.edu/mae_facpub/81 (PDF ที่อ่าน: https://core.ac.uk/download/32571419.pdf) — ปฐมภูมิ (peer-reviewed) · © AIAA/ผู้แต่ง · อ้างข้อสรุปและสูตรได้ ไม่คัดลอกเนื้อหาหรือรูป
9. [U9] FAA, Pilot's Handbook of Aeronautical Knowledge, FAA-H-8083-25C, Chapter 5 "Aerodynamics of Flight" (Ground Effect pp. 5-11 ถึง 5-12; Corkscrew Effect p. 5-31), https://www.faa.gov/sites/faa.gov/files/07_phak_ch5_0.pdf — ปฐมภูมิ (คู่มือทางการ) · public domain (งานรัฐบาลสหรัฐฯ) · อ้างและคัดลอกข้อความได้ · ข้อความและเลขหน้า 5-11, 5-12, 5-31 ยืนยันจากไฟล์นี้แล้ว แต่ข้อความในไฟล์ที่อ่านได้ไม่แสดงรหัสฉบับ "25C" (ยังไม่ยืนยันรหัสฉบับ)
10. [U10] J. Weil, W. C. Sleeman Jr., "Prediction of the Effects of Propeller Operation on the Static Longitudinal Stability of Single-Engine Tractor Monoplanes with Flaps Retracted," NACA Report No. 941, 1949 (ต้นฉบับลงวันที่ 13 July 1948; ปี 1949 ตามแคตตาล็อก UNT), https://ntrs.nasa.gov/api/citations/19930092006/downloads/19930092006.pdf — ปฐมภูมิ · public domain ในสหรัฐฯ · อ้างและคัดลอกได้
11. [U11] S. Katzoff, "Longitudinal Stability and Control with Special Reference to Slipstream Effects," NACA Report No. 690, 1940, https://ntrs.nasa.gov/citations/19930091767 (PDF https://ntrs.nasa.gov/api/citations/19930091767/downloads/19930091767.pdf) — ปฐมภูมิ (อุโมงค์ลมเต็มขนาด) · public domain ในสหรัฐฯ (หน้า NTRS ระบุ "Work of the US Gov. Public Use Permitted") · อ้างและคัดลอกได้
12. [U12] G. W. Stickle, J. L. Crigler, "Propeller Analysis from Experimental Data," NACA Report No. 712, 1940, https://digital.library.unt.edu/ark:/67531/metadc66373/m2/1/high_res_d/19930091790.pdf — ปฐมภูมิ · public domain ในสหรัฐฯ · อ้างได้
13. [U13] P. E. Purser, M. F. Spear, "Wind-Tunnel Investigation of Effects of Unsymmetrical Horizontal-Tail Arrangements on Power-On Static Longitudinal Stability of a Single-Engine Airplane Model," NACA TN 1474, 1947, https://ntrs.nasa.gov/api/citations/19930082127/downloads/19930082127.pdf — ปฐมภูมิ · public domain ในสหรัฐฯ · อ้างได้
14. [U14] M. R. Barber, C. K. Jones, T. R. Sisk, F. W. Haise, "An Evaluation of the Handling Qualities of Seven General-Aviation Aircraft," NASA TN D-3726, 1966, https://ntrs.nasa.gov/api/citations/19660030615/downloads/19660030615.pdf — ปฐมภูมิ (ข้อมูลบิน) · งานรัฐบาลสหรัฐฯ · อ้างและคัดลอกได้
15. [U15] S. J. Miley, E. von Lavante, "Propeller Propulsion System Integration: State of Technology Survey," NASA CR-3882, 1985, https://ntrs.nasa.gov/api/citations/19850012809/downloads/19850012809.pdf — ทุติยภูมิ (รายงานสำรวจภายใต้ทุน NASA, Texas A&M University) · ผู้เขียนไม่ใช่เจ้าหน้าที่รัฐ จึงไม่ถือว่าเป็น public domain โดยอัตโนมัติ และในไฟล์ไม่พบข้อความลิขสิทธิ์ · อ้างข้อเท็จจริงและข้อความสั้นได้ ไม่คัดลอกเนื้อหายาวหรือรูป
16. [U16] หัวข้อ 3 ของรอบนี้ (ใบพัด: momentum theory, P-factor, ตาราง $C_{N\mu}$), `03-propeller.md` — ภายใน
17. [U17] หัวข้อ 6 ของรอบนี้ (เรขาคณิตหางที่ถอยจาก `AC`), `06-controls.md` — ภายใน
18. [U18] สคริปต์คำนวณของหัวข้อนี้ `u2_vlm_ge.mjs`, `u2_ge_table.mjs` (+ `.json`), `u2_expected.mjs` (+ `.json`), `u2_delay.mjs`, `u2_slip.mjs` (+ `.json`), `u2_ktable.mjs`, `u2_adot_current.mjs`, `u2_current_misc.mjs`, `u2_review.mjs` (ตรวจซ้ำรอบรีวิว), `u2_jsoncheck.mjs` (ตรวจ JSON) ใน `scripts/` — ภายใน (ค่าประมาณ)
19. [U19] H. S. Ribner, "Propellers in Yaw," NACA Report No. 820, 1945 (หัวเรื่องและเลขรายงานยืนยันจากไฟล์ ชื่อผู้แต่งและปีอ่านจาก OCR ไม่ชัด จึงยังไม่ยืนยัน), https://ntrs.nasa.gov/api/citations/19930091897/downloads/19930091897.pdf — ปฐมภูมิ · public domain ในสหรัฐฯ · อ้างได้ (รายละเอียดตัวเลขอยู่ในหัวข้อ 3)

## 2.14 งานที่แนะนำสำหรับ Claude Code
1. **P1 · S** แทน finite difference + filter ของ α̇ (`20-flight.js:275`) ด้วยสูตรปิดรูปใน `deriv()` (2.3) และเพิ่มฟังก์ชัน `alphaDotDerivs()` ที่คำนวณ $C_{L\dot\alpha}$, $C_{m\dot\alpha}$ จากเรขาคณิตหาง (คง 1.6/−4.5 เดิมไว้จนกว่าจะเปลี่ยนด้วยเหตุผลอื่น) — ทดสอบ: T-U-01, T-U-02 และ `flight.test.mjs` autoland ยังได้ 94–100
2. **P1 · M** เปลี่ยน ground effect เป็นสูตร Tani: ความสูงจาก MAC ซ้าย/ขวา, $\alpha_{\rm eff}$ ใส่ทั้งแรงยกและ stall blend, $k_D = 1-\sigma$, $\Delta C_{m,GE}$ จาก $r_\varepsilon$ และแก้ `setApproach` ให้ใช้ชุดเดียวกัน จากนั้นจูน flare ของ AP ใหม่ (PR แยกให้เจ้าของลอง) — ทดสอบ: T-U-05, T-U-06, T-U-07, T-U-08, T-U-09 และ autoland ทุกทางวิ่ง
3. **P1 · M** เพิ่ม `slipstream()` และคูณ derivative ของ elevator (`CLde`, `Cmde`) ด้วย $\bar q_t/\bar q$ และของ rudder (`CYdr`, `Cndr`, `Cldr`) ด้วย $\bar q_v/\bar q$ ใช้ $\bar q$ แบบมีมิติเมื่อ V → 0 เพื่อให้มีแรงบังคับขณะอยู่กับที่ — ทดสอบ: T-U-10, T-U-11, T-U-12
4. **P2 · M** แรง swirl ที่หางดิ่งพร้อมตัวคูณ `propEffectsScale` และตรวจว่า auto-rudder ของ ASSIST ยังรักษาทิศได้ตอนวิ่งขึ้นและ go-around (ทำพร้อมงาน P-factor ของหัวข้อ 3) — ทดสอบ: T-U-13, `assist.test.mjs`
5. **P2 · L** ย้ายหางระดับและหางดิ่งเป็นชิ้นส่วน (`tailModel = "delay"`): downwash หน่วงเวลาด้วย ring buffer, $r_\varepsilon$ ของ ground effect, $\bar q_t$, $\bar q_v$ และ swirl ในสมการเดียว แยก `Cma`, `Cmq`, `Cmde` เป็นส่วนปีก-ลำตัวกับส่วนหาง ให้ trim และโหมดของหัวข้อ 10 เท่าเดิม — ทดสอบ: T-U-03, T-U-04, T-U-14 และชุดของหัวข้อ 10
6. **P3 · S** blown wing $\Delta C_{L,b}$ และโมเมนต์ม้วนจาก ground effect ไม่สมมาตร — ทดสอบ: T-U-15, T-U-09 (ส่วนเอียง)
7. **P3 · S** หลังมีข้อมูลบินหรือความเห็นนักบินฝึก ปรับ `kSwirl`, `kappa`, `k_deda_power` และบันทึกเหตุผลใน JSON — ทดสอบ: T-U-11, T-U-13, T-U-14 (ช่วงยอมรับเดิม)
