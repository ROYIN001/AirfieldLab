# 12. ศึกษาซิมตัวอื่น: JSBSim, FlightGear YASim, X-Plane, MSFS, GeoFS

← [กลับไปหน้ารวมรอบที่ 1](../01-flight-physics.md) · [schema พารามิเตอร์](schema.md)

> ความเชื่อมั่นโดยรวม: กลาง (JSBSim และ YASim สูง เพราะอ่านซอร์สโค้ดและรันจริง · X-Plane และ MSFS กลาง เพราะมีแต่เอกสารของผู้ผลิต ไม่มีซอร์ส · GeoFS ต่ำ เพราะปิดซอร์สและมีแต่ typings ของชุมชน) · แหล่งหลัก: ซอร์สและแพ็กเกจ JSBSim 1.3.3 [S1–S7], ซอร์ส YASim ใน FlightGear [S12], เอกสาร "How X-Plane Works" และ X-Plane 12 flight model report [S14, S15], MSFS SDK [S18, S19]

## 12.0 สรุปสั้น
- **EOM ของ AirfieldLab ถูกต้องแล้ว** ผู้วิจัยสร้างโมเดล JSBSim จากพารามิเตอร์ `AC` ของเราเอง แล้วบิน open-loop (elevator doublet, aileron doublet, rudder pulse) 25 s ผลต่างสูงสุด h 4 mm, TAS 1 mm/s, θ 0.014°, φ 0.039°, p 0.21 °/s (JSBSim AB3 240 Hz) [S29] ช่องว่างความสมจริงจึงอยู่ที่ "ข้อมูล" (aero, ใบพัด, ล้อ, ระบบบังคับ) ไม่ใช่ integrator หรือการแปลงแกน
- ซิมทุกตัวที่ศึกษา **แยกนิยามเครื่องบินออกจากโค้ด** (JSBSim: XML + ตารางที่ตัดค่าขอบ [S3]; YASim: เรขาคณิต + solver สองจุด [S12]; X-Plane และ MSFS: เรขาคณิต + airfoil แบ่งชิ้น [S14, S19]) แต่ AirfieldLab ผูกเครื่องฝึกลำเดียวไว้ใน `AC` (src/20-flight.js:100–118) ต้องแยกก่อนเพิ่ม C172S, DA40/DA42 และเครื่องบินโดยสาร
- **ควรสร้างก่อน (P1):** oracle ออฟไลน์ที่สร้าง XML ของ JSBSim จากข้อมูลของเรา รันด้วย `pip install jsbsim` (LGPL-2.1) และเก็บผลเป็น fixture ให้การทดสอบ Node, โครงสร้างข้อมูลเครื่องบินแบบ JSBSim (metrics, mass, aero แยกแกน, engine + ตารางใบพัด, gear, fcs) และ trim แบบ "ตำแหน่งพักของคัน" ตาม X-Plane 12 [S15]
- **สิ่งที่โค้ดปัจจุบันขาดหรือผิดเมื่อเทียบ:** แรงขับเป็น throttle × $T_0V_c/\sqrt{V^2+V_c^2}$ ไม่มี $C_T(J)$, $C_P(J)$, แรงบิด หรือ P-factor แบบ JSBSim, YASim, X-Plane [S4, S12, S14] และ DIRECT law บวก trim เข้า `c.de` แล้วตัดที่ขีด elevator (src/20-flight.js:468) วัดได้ว่า trim −5° ดันคันสุดได้แค่ +10° แทน +15° ซึ่งไม่ตรงทั้ง trim tab (ตำแหน่งพัก, X-Plane 12 [S15]) และ stabilizer trim (โมเมนต์บวกเพิ่ม, MSFS [S20]) ยังไม่มี trim เชิงตัวเลขแบบ `FGTrim`
- JSBSim มีรุ่น WebAssembly แล้ว (`@0x62/jsbsim-wasm` .wasm 1.59 MB, LGPL-2.1 [S9]) แต่ **ยังไม่แนะนำในหน้าเว็บจริง** เพราะภาระ LGPL, XML เครื่องบินของ JSBSim เป็น GPL หรือไม่ระบุใบอนุญาต และ repo ยังไม่มี LICENSE GeoFS ปิดซอร์สและใช้แรงขับคงที่ [S26] เอามาได้แค่แนวคิด "parts" และโครงการตั้งค่าอินพุต

## 12.1 สภาพปัจจุบันใน AirfieldLab
**โครงสร้าง** สัมประสิทธิ์ มวล แรงขับ และล้อทั้งหมดอยู่ใน `AC` (src/20-flight.js:100–118) `Aircraft.deriv` (165–239) รวมแรงในแกน body FRD และ `step` (253–270) ใช้ RK4 ที่ 240 Hz (YASim ก็ใช้ RK4 ส่วน JSBSim ตั้งต้นด้วย Euler/Adams–Bashforth ที่ 120 Hz [S2]) `actuators()` (241–251) มีแค่ rate limit 70/80/60 °/s และ lag throttle τ = 1 s ไม่มี deadband, hysteresis หรือ delay แบบ `FGActuator` [S6] แป้นพิมพ์ไม่ได้เปิดปิดล้วนอย่างที่ CLAUDE.md เขียน `readInputs` (src/90-app.js:359–368) ramp คำสั่งคัน 2.5/s (โรล, รัดเดอร์) และ 2.0/s (พิทช์) คืนศูนย์ 5/s (สัดส่วนของระยะคันเต็ม) แต่ยังไม่มี trim, flap, gear หรือ gamepad (หัวข้อ 11)

**ผลวัดด้วย Node 22.23.5 และ JSBSim 1.3.3 (สคริปต์ใน `scripts/s12/`)** [S29]

| สิ่งที่วัด | ผล | หมายเหตุ |
|---|---|---|
| EOM เทียบ JSBSim (ไม่มี α̇), JSBSim AB3 240 Hz | max \|Δh\| 0.004 m, \|ΔV\| 0.00095 m/s, \|Δθ\| 0.0137°, \|Δφ\| 0.039°, \|Δp\| 0.21 °/s | `s12_oracle_js.mjs` + `s12_oracle_jsb.py` |
| JSBSim integrator ตั้งต้น 240 Hz / ตั้งต้น 120 Hz (แบบ FlightGear) / AB3 1200 Hz | θ 0.041° / 0.083° / 0.008°, φ 0.096° / 0.19° / 0.018°, h 0.012 / 0.026 / 0.006 m | ผลต่างของ θ, φ, p ลดเมื่อ JSBSim ใช้ integrator อันดับสูงขึ้นหรือ dt เล็กลง ส่วนใหญ่จึงมาจากฝั่ง JSBSim ยกเว้น h และ ψ ที่ AB3 1200 Hz (0.006 m, 0.026°) ไม่เล็กกว่า AB3 240 Hz (0.004 m, 0.011°) แปลว่ายังมีส่วนต่างเล็กมากที่ไม่ได้มาจาก integrator (ยังไม่ได้หาสาเหตุ) |
| รวม α̇ (ของเรา: อนุพันธ์เชิงตัวเลขกรอง 50 ms; JSBSim: เชิงวิเคราะห์) | \|Δθ\| 0.048°, \|Δα\| 0.040°, \|Δq\| 0.117 °/s | การประมาณ α̇ ของเราใช้ได้ |
| trim จาก `setApproach` ปล่อยคันนิ่ง 20 s | \|Δθ\| 0.008°, ΔIAS −0.146 kt, vs −511 → −508 fpm | trim สมดุลดี |
| DIRECT law: trimDe = −5° ดันคันสุด | elevator +10° (ควรได้ +15°) | trim แบบบวกเพิ่มกินระยะคันบังคับ |
| DIRECT law: trimDe = +5° ดึงคันสุด | elevator −17° (ควรได้ −22°) | เช่นเดียวกัน |
| throttle step 0.3 → 1.0 หลัง 1 s | 0.7425 (ทฤษฎี 0.7425) | lag อันดับหนึ่งตรงสมการ |
| ต้นทุนต่อ step (RK4 + updateAir) | 3.7–4.5 µs หลัง warm-up (สองรอบวัด) | งบเหลือมากสำหรับตาราง |
| จุด cruise ของโมเดลปัจจุบัน 5,000 ft, thr 0.75, clean | 240.4 KTAS (ค่าประมาณ ≈ 224 KCAS และ 223 KEAS คำนวณจาก USSA-1976 ของ repo ด้วยสูตร impact pressure, `s12rev/rev_cas.mjs`), α −1.19°, δe +2.99° | ใช้เป็นข้อมูลนำเข้าของ solver ในหัวข้อ 12.9 |

ข้อสังเกต: aileron doublet และ rudder pulse สร้าง β และ r จึงตรวจเครื่องหมาย $I_{xz}$ และทิศแรงเมื่อมี sideslip ไปด้วย ส่วน 240 KTAS ที่ throttle 75% สูงเกินเครื่องฝึก turboprop ทั่วไป เป็นผลของแบบจำลองแรงขับ ไม่ใช่ EOM (ดูหัวข้อ 3–4)

## 12.2 JSBSim: โมเดลอ้างอิงแบบเปิดที่ขับด้วยข้อมูล
**แนวทางฟิสิกส์** JSBSim เป็นไลบรารี C++ "general purpose object-oriented Flight Dynamics Model" ใช้แบบ batch, Python, MATLAB, Unreal และ FlightGear [S1] เป็น rigid body 6-DOF บนโลกหมุน (แรงโน้มถ่วง WGS84 แบบ J2) กำหนดดาวเคราะห์ใหม่ได้ด้วย `<planet>` [S2, S6] dt ตั้งต้น 1/120 s, integrator ตั้งต้น Euler สำหรับ $\dot\omega$ และมุม, AB2 สำหรับ $\dot v$, AB3 สำหรับตำแหน่ง [S2]

**ข้อมูล aero** ไฟล์เครื่องบินกำหนดแรงตามแกนที่เลือกได้หนึ่งชุด คือ DRAG/SIDE/LIFT (wind), X/Y/Z (body), AXIAL/SIDE/NORMAL หรือ stability [S3] แรงแต่ละแกนเป็นผลรวมของ `<function>` ซึ่งรับ property ใด ๆ และ operator อย่าง `product`, `sum`, `table`, `sin`, `exp`, `sign`, `max`, `ifthen` [S3] สำหรับแกน wind JSBSim กลับเครื่องหมาย D และ L แล้วแปลงด้วย $T_{w\to b}$:

$$\mathbf F_b = T_{w\to b}(\alpha,\beta)\begin{bmatrix}-D\\ Y\\ -L\end{bmatrix},\qquad D=\bar q S\,C_D(\cdot),\; L=\bar q S\,C_L(\cdot)$$

โดย $\bar q = \tfrac12\rho V^2$ (Pa หรือ lbf/ft²), $S$ พื้นที่ปีก (m²), $Y=\bar qS\,C_Y$ แรงข้าง (N), $\alpha$ มุมปะทะ (บวกเมื่อหัวเชิด), $\beta$ มุม sideslip (บวกเมื่อลมมาจากขวา) โมเมนต์ ROLL/PITCH/YAW คิดรอบจุด AERORP แล้วย้ายมาที่ CG ด้วย $(\mathbf r_{ARP}-\mathbf r_{CG})\times\mathbf F$ ตาราง `FGTable` มี 1D, 2D และ 3D แบบ linear interpolation และ **คืนค่าขอบเมื่อ key อยู่นอกช่วง** ("do not extrapolate") [S3] ข้อนี้สำคัญเมื่อเราย้ายไปใช้ตาราง เพราะตารางที่สั้นเกินไปจะทำให้ค่าแบนนอกช่วงโดยไม่มีคำเตือน

**เครื่องยนต์และใบพัด** `FGPropeller` ต้องมีตาราง `C_THRUST` และ `C_POWER` เป็นฟังก์ชันของ advance ratio (และมุมใบถ้าเป็นใบปรับมุม) [S4]:

$$J=\frac{V}{nD},\qquad T=C_T(J)\,\rho n^2D^4,\qquad P_{req}=C_P(J)\,\rho n^3D^5$$

โดย $n$ รอบต่อวินาที, $D$ เส้นผ่านศูนย์กลาง (m), $\rho$ ความหนาแน่น (kg/m³) มีตัวคูณ Mach, ความเร็วเหนี่ยวนำ, แรงบิดปฏิกิริยา $-\text{sense}\cdot P/\omega$ และโมเมนต์ไจโรสโคปจาก $I_{xx}\omega$ ส่วน P-factor ทำโดย **เลื่อนจุดที่แรงขับกระทำ** ในแนว y และ z ของใบพัด ตามมุมระหว่างแกนใบพัดกับกระแสลมผ่านจาน (รวมความเร็วเหนี่ยวนำ) คูณ `p_factor` และทิศหมุน `sense` [S4] ซึ่งง่ายและเหมาะกับเรา (ดูหัวข้อ 3)

**ล้อ** `FGLGear` ใช้สปริง–แดมเปอร์ต่อ strut (มี `damping_coeff_rebound` แยกขาคืนตัว) แรงเสียดทาน static, dynamic และ rolling และแรงข้างแบบ Pacejka "magic formula" ที่ค่าตั้งต้น B = 0.06, C = 2.8, D = μ_static, E = 1.03 [S5]:

$$\mu_y(\beta_t)=D\sin\!\Big(C\arctan\big(B\beta_t-E\,(B\beta_t-\arctan(B\beta_t))\big)\Big)$$

โดย $\beta_t$ คือมุมไถลของยาง (องศา) แรงเสียดทานที่ความเร็วต่ำ JSBSim แก้ด้วยข้อจำกัด (Lagrange multiplier) แทนการใช้ tanh (ดูหัวข้อ 9)

**ระบบบังคับและการป้อนคำสั่ง** JSBSim ไม่อ่านจอยเอง โฮสต์เขียนค่าลง property เช่น `fcs/elevator-cmd-norm`, `fcs/pitch-trim-cmd-norm` แล้วสายสัญญาณใน XML (summer, gain, filter, pid, kinematic, actuator) แปลงเป็นมุมพื้นผิว `FGActuator` มี rate limit แยกขาขึ้นลง, lag, deadband, hysteresis, bias และ delay [S6] แฟลป c172x ใช้ `kinematic` (0 → 10° ใช้ 2 s, ช่วงละ 10° ถัดไปใช้ 1 s) [S7] และ trim ใช้ `FGTrim` ซึ่งแก้เชิงตัวเลขจนอนุพันธ์เข้าใกล้ศูนย์

**จุดแข็ง** เปิดซอร์ส ติดตั้งด้วย `pip install jsbsim` ได้ทันที มี trim และ linearization **จุดอ่อน** โมเดลส่วนใหญ่ไม่ผ่าน validation (c172x เขียนว่า "validated only to the extent that it seems to 'fly right'") [S7] และ integrator ตั้งต้นอันดับต่ำ

**Aeromatic** เป็นฟอร์มเว็บที่สร้างไฟล์ XML ตั้งต้นของเครื่องบิน เครื่องยนต์ และใบพัด จากข้อมูลพื้นฐาน (ประเภทเครื่อง, MTOW, span, ความยาว, chord, พื้นที่ปีก, พื้นที่และแขนของหาง, กำลัง, รอบสูงสุด, เส้นผ่านศูนย์กลางใบพัด; ช่อง chord, พื้นที่ปีก, มุมติดตั้งปีก และพื้นที่/แขนของหาง ถ้าใส่ 0 จะประมาณให้) ผลเป็นเพียง "plausible configuration files ... using some simplifying assumptions" [S8] บทบาทเดียวกับ solver ของ YASim คือได้จุดเริ่มต้น ไม่ใช่โมเดลที่ validate แล้ว repo ของ Aeromatic เป็น AGPL-3.0 [S8] จึงอ้างแนวคิดได้อย่างเดียว

**ใบอนุญาต** ไลบรารีและโมดูล Python เป็น LGPL-2.1 ตาม README [S1] (classifier บน PyPI เขียน "LGPLv2+" [S7] ถือ LGPL-2.1 เป็นค่าที่ใช้) ไฟล์เครื่องบินปนกัน ผู้วิจัยนับใน `jsbsim/aircraft/` ของแพ็กเกจ 1.3.3 ได้ 60 โมเดล 14 โมเดลระบุ GPL (เช่น c172x, 737, f16) และ 46 โมเดลไม่ระบุใบอนุญาต (เช่น c172p, A320, pc7, t6texan2) [S7, S29] **AirfieldLab ทำได้:** อ้างสมการและค่าตั้งต้น รัน JSBSim เป็นเครื่องมือภายนอก (ไม่ได้แจกจ่าย) และใช้ผลที่คำนวณจากโมเดลที่สร้างจากข้อมูลของเราเอง **ห้าม** คัดลอกโค้ด C++ หรือ XML ของเครื่องบินลง repo ตัวเลขจากโมเดลเปิดใช้เทียบได้โดยระบุว่า "ผลจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง"

## 12.3 FlightGear และ YASim: เรขาคณิตบวก solver
FlightGear มีโมเดลพลศาสตร์การบินที่ใช้กันมากสองตัว คือ JSBSim และ YASim [S11] ค่า `model-hz` ตั้งต้นของ FlightGear คือ 120 Hz [S13] และ YASim ใช้ RK4 (ดูหัวข้อ 9) ซอร์ส FlightGear เป็น GPL-2.0-or-later (SPDX ในไฟล์ซอร์ส ไฟล์ YASim เองไม่มีหัวใบอนุญาต จึงอยู่ใต้ใบอนุญาตของโครงการ) และเนื้อหา wiki เป็น GPL [S11, S12] (ยังไม่ได้เปิดหน้า Copyrights ของ wiki ในรอบทบทวน)

**แนวคิดหลักของ YASim** คือสร้างเครื่องบินจากเรขาคณิต (ปีก, hstab, vstab, ลำตัว, ใบพัด, ล้อ) แล้วแบ่งปีกเป็น strip ยาวประมาณหนึ่ง mean chord ในแต่ละช่วงระหว่างขอบของ flap/slat/spoiler (อย่างน้อย 8 ชิ้นต่อช่วงถ้าปีกบิด, `Wing.cpp`) [S12] แต่ละ surface คำนวณแรงจากลมท้องถิ่น มีฟังก์ชัน stall ที่กำหนดด้วย `aoa` (มุม stall), `width` (ความนุ่มของ stall) และ `peak` (ความสูงของยอดแรงยกเทียบกับยอดรองหลัง stall ที่ 45° ค่าตั้งต้น 1.5) [S11, S12] ground effect เป็นแรงเพิ่ม $F_{z,ge}=k_{ge}\,F_{z,aero}\,(b-h)/b$ ตามแนวตั้งฉากพื้น เมื่อจุดอ้างอิงของปีกสูงจากพื้น $h$ น้อยกว่า span $b$ ($k_{ge}$ คือตัวคูณ ground effect ของเครื่อง, `Model.cpp`) [S12]

**solver สองจุด** เรขาคณิตอย่างเดียวให้ค่าแค่ "rough approximation" [S11] YASim จึงรับ `<cruise>` (ความเร็ว ความสูง throttle) และ `<approach>` (ความเร็ว TAS, AoA, throttle, แฟลป) แล้ว `Airplane::solveAirplane` ปรับตัวแปรห้าตัวจนสมดุล [S12]:

$$\text{cruise: } T_c + W\sin\gamma_c = D_c,\quad L_c(\alpha_c)=W_c,\quad M_c(i_t)=0;\qquad \text{approach: } L_a(\alpha_a)=W_a,\quad M_a(\delta_{e,a})=0$$

ตัวแปรคือ dragFactor (คูณ $C_D$ ทุก surface), liftRatio (คูณ $C_L$ ของปีกและหาง), AoA ตอน cruise, มุมติดตั้งหาง $i_t$ และ elevator ตอน approach ทุกรอบคำนวณ $f_D = T/(T-D)$ และ $f_L = W/(W+L)$ แล้วยกกำลัง `_solverDelta` เพื่อหน่วงการกระโดด เมื่อ $f_D, f_L$ เข้าใกล้ 1 จึงค่อยปรับ AoA และ $i_t$ ด้วยอนุพันธ์เชิงตัวเลข (เลื่อนทีละ ARCMIN = 0.00029 rad) ทั้ง AoA และ $i_t$ ถูกจำกัดที่ ±0.175 rad และ solver ล้มเหลวเมื่อ "Insufficient elevator to trim for approach" [S12] แนวคิดนี้เหมาะมากกับรอบถัดไปที่ต้องสร้างเครื่องใหม่จากตัวเลขใน POH หรือ AFM

**ใบพัดของ YASim** เป็นสูตรวิเคราะห์ ไม่ใช่ตาราง: $J = V/\omega$, $\lambda = J/J_0$ โดย $J_0$ หาจากความเร็ว cruise และรอบ cruise ประสิทธิภาพสูงสุด $\eta_C = 0.85$ ที่ $\lambda_{peak}=5^{-1/4}\approx0.669$ สัมประสิทธิ์แรงขับลดเชิงเส้น $t_c=(1-\lambda)/(1-\lambda_{peak})$ จำกัดด้วยค่า takeoff และเมื่อ $\lambda>1$ (กังหันลม) แรงบิดเป็นศูนย์ที่ $\lambda=1.2$ [S12] **ล้อ** ระบุระยะยุบ `compression`, ตัวคูณ `spring` และ `damp` ส่วน `sfric` ตั้งต้น 0.8 และ `dfric` 0.7 [S11] (ยืนยันในตัวสร้างของ `Gear.cpp` ด้วย [S12])

**การป้อนคำสั่ง** YASim ผูก property ด้วย `<control-input>` (หลายอินพุตบนค่าเดียวกันถูกบวกกัน) และจำกัดอัตราด้วย `<control-speed>` (เวลาที่ใช้เคลื่อนสุดช่วง wiki เรียกว่า "semi-deprecated" แนะนำ Nasal แทน) [S11] ส่วนแป้นพิมพ์ของ FlightGear เพิ่มมุมทีละขั้นต่อการกดและไม่คืนศูนย์ (รายละเอียดในหัวข้อ 11)

**จุดแข็ง** สร้างเครื่องจากข้อมูลน้อยได้และสมรรถนะสองจุดตรงเป้าโดยการสร้าง **จุดอ่อน** นอกสองจุดนั้น (stall, การไต่, โหมดพลวัต) ไม่รับประกัน และตัวแปรที่ได้อาจไร้ความหมายทางกายภาพ **AirfieldLab นำมาได้:** แนวคิด solver สองจุด (ทดลองต้นแบบในหัวข้อ 12.9) ห้ามคัดลอกโค้ด GPL-2.0

## 12.4 X-Plane: blade element theory และ airfoil
**แนวทางฟิสิกส์** X-Plane "อ่านรูปทรงเรขาคณิตของเครื่องบินแล้วหาว่าจะบินอย่างไร" ด้วย blade element theory [S14] ขั้นตอนคือ (1) แบ่งปีก, stabilizer และใบพัดเป็น element (ปีกหรือ stabilizer **สูงสุด 10 ชิ้นต่อข้าง**: "Ten elements per side per wing or stabilizer is the maximum") (2) หาความเร็วลมท้องถิ่นรวม propwash (จากพื้นที่จานและแรงขับ) และ downwash (จาก aspect ratio, taper, sweep) (3) หาสัมประสิทธิ์จาก airfoil 2 มิติ แก้เป็นปีกจำกัดช่วง และใช้ Prandtl–Glauert (4) รวมแรงแล้วหารด้วยมวลและความเฉื่อย (5) ทำซ้ำ "อย่างน้อย 15 ครั้งต่อวินาที" [S14] คู่มือ X-Plane 12 บอกว่า physics วิ่งต่อเฟรมและขั้นต่ำ 20 fps (ต่ำกว่านั้นจะเพิ่มหมอก) [S17] ไม่พบจำนวน substep ต่อเฟรม แรงยกของ element หนึ่งชิ้นเขียนได้ว่า (ผู้วิจัยเขียนจากขั้นตอนใน [S14] เป็นค่าประมาณเชิงแนวคิด ไม่ใช่สมการที่ Laminar เผยแพร่)

$$\Delta L=\tfrac12\rho\,V_{loc}^2\,c(y)\,\Delta y\,C_l(\alpha_{loc},Re,M),\qquad \alpha_{loc}=\alpha_{geo}(y)+\frac{p\,y}{V}-\varepsilon(y)+\alpha_{wash}(y)$$

โดย $\rho$ ความหนาแน่น (kg/m³), $V$ ความเร็วอากาศของเครื่อง (m/s), $V_{loc}$ ความเร็วลมท้องถิ่นรวม propwash (m/s), $c(y)$ chord (m), $\Delta y$ ความกว้างชิ้น (m), $y$ ระยะจากแนวกลางลำ (m, บวกทางขวา), $\alpha_{geo}$ มุมปะทะของเครื่องรวมมุมติดตั้ง (rad), $\alpha_{wash}$ การบิดของปีก (rad, ปกติติดลบที่ปลาย), $p$ อัตราโรล (rad/s, บวกเมื่อปีกขวาลง), $\varepsilon$ downwash (rad), $Re$ และ $M$ Reynolds และ Mach ของชิ้น

**airfoil** ไฟล์ .afl เก็บ $C_l, C_d, C_m$ ตามมุมปะทะ ตัวควบคุมการออกแบบครอบคลุม −20° ถึง +20° และแท็บ AOA-180 แสดงค่าเต็ม −180° ถึง +180° สำหรับท่าทางผิดปกติ คู่มือแนะนำให้สร้าง airfoil เดียวกันสองไฟล์ที่ Reynolds number ต่างกัน (ไม่บังคับ) X-Plane หา Re ของแต่ละชิ้น "at least 10 times per second" แล้ว interpolate ระหว่างไฟล์ และ $C_d$ ในไฟล์ไม่รวม induced drag ซึ่ง X-Plane คำนวณเอง [S16]

**X-Plane 12** [S15] เพิ่ม airfoil เป็นสามไฟล์ต่อพื้นผิวและ Re กี่ค่าก็ได้ หา centroid ของแรงดูดบนปีกและใบพัดทุกเฟรมเพื่อปรับ aspect ratio ที่มีผลและ Oswald efficiency, downwash เพิ่มราว 25% จากรุ่น 11, ปรับ ground effect, ผลของพื้นผิวบังคับลดลงเกือบหมดเมื่อปีก stall แล้ว ("all the control effects are going to go down to just about nothing"), **trim กำหนดตำแหน่งพักของคันเมื่อไม่ได้โยกจอย แทนการบวกเข้าไปในมุมรวมแบบรุ่นก่อน**, ยกเลิกตัวปรับ damping, ยางเฉลี่ยความสูงพื้นในรอยสัมผัส (rolling coefficient แนะนำ 0.008 เครื่องโดยสาร/ขับไล่, ราว 0.016 GA, ราว 0.040 สำหรับ Piper ที่รายงานยกตัวอย่าง) และจำลอง brake fade จากพลังงานที่เบรกดูดซับ

**การป้อนคำสั่ง** X-Plane 12 ให้ calibrate แกน (โยกสุดทุกทิศแล้วตั้งศูนย์) และมีตัวเลื่อนเส้นตอบสนองต่อแกน ซ้ายสุดเป็นเชิงเส้น ขวาสุดโยกครึ่งทางได้มุมพื้นผิวราว 10% [S17] สูตรเทียบและค่าที่เสนอให้เราอยู่ในหัวข้อ 11 ส่วน trim ของ XP12 ดูย่อหน้าบน

**จุดแข็ง** stall ปลายปีก, spin และผลของใบพัดต่อปีกเกิดเองจากเรขาคณิต **จุดอ่อน** ความถูกต้องขึ้นกับการปรับเรขาคณิตและ airfoil ไม่มี derivative ให้ตรวจกับข้อมูลบินตรง ๆ และต้นทุน CPU สูง

**ใบอนุญาต** proprietary ของ Laminar Research [S14] ไฟล์ .acf/.afl เป็นลิขสิทธิ์ของผู้สร้าง **AirfieldLab ทำได้:** อ้างแนวคิดและตัวเลขที่เผยแพร่ ห้ามใช้ไฟล์ข้อมูลของ X-Plane คู่มือ Airfoil Maker เป็น CC BY-SA 2.5 จึงควรสรุปด้วยคำของเราเองแทนการคัดลอก

## 12.5 Microsoft Flight Simulator 2020 และ 2024: legacy กับ modern flight model
**legacy กับ modern** ใน `flight_model.cfg` ส่วน `[AERODYNAMICS]` ตารางสัมประสิทธิ์จำนวนมาก (เช่น `pitch_moment_aoa_table`, `roll_moment_roll_rate_aoa_table` และตาราง Mach) ถูกระบุว่าเป็น "Legacy FSX table, not used in the modern flight model" เพราะ modern flight model ได้ผลเหล่านี้จาก "aerodynamic simulation of the surfaces" ใน `[AIRPLANE_GEOMETRY]` [S18, S20] และ "almost entirely dropped the use of tables of data" [S19]

**การสร้างพื้นผิวและการ normalize** แพนหางระดับรวม elevator และแพนหางดิ่งรวม rudder ถูกจำลองเป็น "single wing with surfaces positioned" [S20] แล้วเครื่องบินถูกส่งเข้า "virtual wind tunnel in real time" ซึ่งทำ "100 adjustment iterations to the surface aerodynamic parameters" ให้ตรงค่าสมรรถนะเป้าหมายชุดเล็กที่ผู้สร้างกรอก (หน้าเอกสารไม่ได้ระบุรายการเป้าหมายครบ) โดย normalize เฉพาะกระแสลมตามแกนลำตัวที่ AoA 0–15° [S19] `lift_coef_aoa_table` (≤ 47 แถว) เป็นเป้าเฉพาะช่วง AoA 0 ถึงมุม stall [S18] และ drag polar เป้าหมายคือ

$$C_D = C_{D0} + k\,(C_L - C_{L0})^2$$

แทน $C_{D0}+kC_L^2$ ของ legacy [S19] (AirfieldLab ใช้รูป $K(C_L-0.15)^2$ อยู่แล้ว src/20-flight.js:185)

**stall ต่อพื้นผิว** "Stalling is computed individually for each surface" [S19] กระแสเริ่มแยกที่ 0.9 และแยกสมบูรณ์ที่ 1.1 ของ stall AoA (`StallDef_StartRatio/EndRatio`) เส้นระหว่างนั้นยกกำลัง 0.8 ช่วงเปลี่ยนต่ำสุด 0.025 rad ปลายปีกได้มุม stall เพิ่ม 2.0° (`Stall_TipAddIncidence`) และบิดปีกเสมือน 2.5 (`Stall_TipAddTwist` หน้า SDK ไม่ระบุหน่วย น่าจะเป็นองศา) เป็นค่าตั้งต้น [S18] ส่วน Beard–McLain M = 55 ของเราเปลี่ยน σ จาก 0.05 เป็น 0.95 ในช่วง $\pm\ln19/M=\pm3.1°$ รอบ $\alpha_0$ (ค่าประมาณจาก src/20-flight.js:145–148) กว้างกว่า MSFS ที่ราว ±1.5° ที่ 14.5° (ประเด็นของหัวข้อ 5)

**CFD และ physics objects** SDK 2020 มีพารามิเตอร์ CFD เช่น `CFD_VoxelNbVoxels` (ตั้งต้น 20) [S18] SDK 2024 ให้แต่ละชิ้นส่วนเป็น physics object มี `surface_cx` (ผิวบนล่างทำหน้าที่สัมประสิทธิ์แรงยกด้วย), `surface_cx_tangent`, `surface_cx_efficiency` แยกแกน X/Y/Z [S21] ไม่พบในเอกสารว่าแบ่งปีกกี่ชิ้น ใช้ integrator ใด หรือรันกี่เฮิรตซ์ [S22] **ล้อ** สปริงและ damping "calculated automatically based on the value of the static compression" สปริงไม่เชิงเส้นมีเลขชี้กำลังตั้งต้น 16 (ค่าสุดท้ายของรายการ `point.N`) [S22]

**trim และขีดจำกัดพื้นผิว** ใน `[AIRPLANE_GEOMETRY]` trim ของ MSFS "adds to the elevator deflection" ตั้งได้ด้วย `elevator_trim_limit` หรือ `elevator_trim_up_limit`/`down_limit` (องศา) และถูกคูณด้วย `elevator_trim_elasticity_table` ตาม $\bar q$ (psf) ตารางนี้รับได้สูงสุด 5 จุด (psf : ตัวคูณ) ส่วนขีด `elevator_up_limit`, `elevator_down_limit`, `aileron_up/down_limit` ก็มีตาราง elasticity ตาม $\bar q$ ของพื้นผิวนั้น (`elevator_elasticity_table`, `aileron_elasticity_table` ค่าตั้งต้น `0.0:1.0` คือไม่ลด) [S20] ตาราง elasticity คือ "blowback" ที่ลดมุมพื้นผิวสูงสุดเมื่อแรงลมมาก ซึ่งเป็นงานของหัวข้อ 6 ส่วนการนำ trim ไปบวกต่างจาก X-Plane 12 (ดูหัวข้อ 12.12)

**เครื่องมือ debug** หน้าต่าง Sim Forces แสดงพื้นผิวเป็นกล่องสีเขียวและเส้นแรงสีฟ้า ส่วนในการทดสอบ stall ของ elevator เวกเตอร์แรงยกบนพื้นผิวเปลี่ยนสีตามสถานะ stall ("Yellow is getting close to stall, red is stalling, blue is a fully stalled surface") [S19] ทำใน three.js ได้ด้วย ArrowHelper

**จุดแข็ง** ได้พฤติกรรมไม่สมมาตรและบังคับให้สมรรถนะรวมตรงเป้า **จุดอ่อน** ซอร์สปิด กลไกเปิดเผยน้อย **ใบอนุญาต** proprietary (Microsoft) **AirfieldLab ทำได้:** อ้างแนวคิดและค่าตั้งต้นที่เผยแพร่ ห้ามคัดลอกข้อความหรือ cfg

## 12.6 GeoFS และโครงการ JavaScript อื่น
**GeoFS** เริ่มราวปี 2011 แสดงผลด้วย CesiumJS ตั้งแต่ราว 2017 (ยังไม่ยืนยันซ้ำในรอบทบทวน) มีผู้เล่นหลายคน จอยสติ๊ก และระบบลม [S23] ผู้สร้างเรียกว่า "accurate simulation program built on CesiumJS" แต่ไม่ให้รายละเอียดฟิสิกส์ [S24] เครื่องมือสร้างเครื่องบินเปิดให้เฉพาะผู้ที่ขอสิทธิ์ [S25] และ typings ของชุมชน (MIT) ยืนยันว่า "its true source code has never popped into the public's view" [S26] ข้อมูลด้านล่างจึงมาจากการแกะของชุมชน ความเชื่อมั่นต่ำ

นิยามเครื่องบินเป็น JSON มี `mass` (kg), `com`, `tensorFactor`, `dragFactor` และ `parts` ที่ผูกกับโหนดของโมเดล 3 มิติ ชนิด frame, airfoil, engine, wheel, hook [S26] airfoil มี `area` (หรือ `liftFactor`/`dragFactor`), `stallIncidence`, `zeroLiftIncidence` ("lift decreases linearly from stallIncidence"), `span`, `chord`, `aspectRatio` engine เป็นแรงขับคงที่ (N) ลดเชิงเส้นจนเป็นศูนย์ที่ `zeroThrustAltitude` และ wheel มี `suspension` {stiffness, damping, restLength, hardPoint} [S26] เป็นโมเดลแรงต่อชิ้นส่วนที่หยาบกว่าโมเดลปัจจุบันของเรา

**การป้อนคำสั่งของ GeoFS** (จาก typings) มีห้าโหมด (mouse, keyboard, orientation, touch, joystick) แต่ละโหมดมี `sensitivity`, `exponential` และ `mixYawRoll` (รัดเดอร์ตามโรล) แป้นพิมพ์มี increment ต่อแกนและ `recenterRatio` จอยมี `deadZoneUp/Down` trim มี `elevatorTrimMin/Max/Step` [S26] ตรงกับโครงที่หัวข้อ 11 เสนอ คลาส `rigidBody` มี `integrateVelocities`, `integrateTransform`, `applyImpulse` [S26] ชื่อคล้าย `btRigidBody` ของ Bullet จึงอาจใช้ semi-implicit Euler ต่อเฟรม (ข้อสังเกตของผู้วิจัย ยังไม่ยืนยัน)

**JSBSim ใน JavaScript และ WebAssembly**
| โครงการ | สถานะ | ใบอนุญาต | หมายเหตุ |
|---|---|---|---|
| `@0x62/jsbsim-wasm` 1.2.4-beta.4 (npm, ก.พ. 2026) | beta, README เตือนว่า "early development" | ตัวห่อ TypeScript เป็น MIT, ไฟล์ .wasm ของ JSBSim และ patch เป็น LGPL-2.1 (README ส่วน License) | .wasm 1,588,236 ไบต์ + .mjs 122 KB, โหลดไฟล์ XML ผ่าน MEMFS ของ Emscripten, มี demo [S9] |
| `jsbsim.js` 0.0.4 (npm, 2015, csbrandt/JSBSim.js) | ไม่มีการพัฒนาต่อ | LGPL-2.1 | Emscripten แบบ CLI รัน script [S10] |
| vinny-palumbo/FlightSim, jorisfalter/opengeo-sim, nagoya0/webgpu-skyscape (2026) | ตัวอย่างที่ใช้ JSBSim WASM | ไม่ระบุ / ไม่ระบุ / MIT (ตาม GitHub) | อ่านแค่คำอธิบาย ไม่ได้ตรวจโค้ด [S27] |

**ใช้ JSBSim-WASM ในหน้าเว็บจริงหรือไม่** ทำได้ทางเทคนิค แต่ยังไม่แนะนำ เพราะ (1) LGPL-2.1 ยอมให้โค้ดอื่นลิงก์ได้ แต่ต้องแจกซอร์สส่วน LGPL (รวม patch) และให้ผู้ใช้เปลี่ยนไลบรารีได้ (2) ต้องเขียน XML ของเครื่องบินเองทั้งหมด (3) autopilot, PilotLaws และ Evaluator ผูกกับ state ของ `Aircraft` ต้องเขียนชั้นนี้ใหม่ (4) เพิ่มไฟล์ 1.6 MB

**โครงการ JS อื่น** ผลค้นหา GitHub (flight dynamics, JavaScript/TypeScript) พบแต่โครงการเล็กหรือแบบ arcade ไม่มีตัวใดมี validation หรือเอกสารฟิสิกส์พอเป็นแบบอย่าง [S27]

## 12.7 ตารางเปรียบเทียบ
| หัวข้อ | JSBSim | YASim (FlightGear) | X-Plane 12 | MSFS 2020/2024 (modern) | GeoFS | AirfieldLab ตอนนี้ |
|---|---|---|---|---|---|---|
| แนวทาง aero | function/ตาราง ต่อแกน (wind/body/stability) [S3] | strip จากเรขาคณิต + solver 2 จุด [S12] | blade element ≤ 10 ชิ้น/ข้าง + airfoil 2D [S14] | พื้นผิวจากเรขาคณิต + wind tunnel 100 รอบ ให้ตรงเป้า [S19] | แรงต่อ part, stall เชิงเส้น [S26] | derivative เชิงเส้น + Beard–McLain |
| รูปแบบข้อมูล | XML + property | XML | .acf/.afl (Plane Maker) | .cfg | JSON | อ็อบเจกต์ `AC` ในโค้ด |
| ใบพัด | ตาราง $C_T(J)$, $C_P(J)$, P-factor เลื่อนจุดแรง [S4] | สูตรวิเคราะห์ η_C 0.85 [S12] | ใบพัดเป็น blade element มี airfoil 3 ไฟล์ [S15] | ไม่ได้ตรวจ | แรงคงที่ (N) | $T\propto$ throttle·$V_c/\sqrt{V^2+V_c^2}$ |
| ล้อ | strut + Pacejka + constraint friction [S5] | spring/damp, sfric 0.8 dfric 0.7 [S11] | footprint เฉลี่ย, rolling 0.008–0.040 [S15] | สปริงอัตโนมัติจาก static compression, exponent 16 [S22] | stiffness/damping | strut + tanh |
| integrator / อัตรา | Euler/AB2/AB3, 120 Hz [S2] | RK4, 120 Hz [S13] | ต่อเฟรม ≥ 15–20 Hz [S14, S17] | ไม่เปิดเผย | ไม่เปิดเผย | RK4, 240 Hz |
| ระบบบังคับ | XML FCS: actuator, lag, kinematic flap [S6, S7] | control-input/control-speed [S11] | trim = ตำแหน่งพัก (XP12) [S15] | ตาราง/พารามิเตอร์ใน cfg | `controller` ต่อ part | rate limit + lag throttle |
| trim | `FGTrim` เชิงตัวเลข | solver ตอนโหลด | ตำแหน่งพักของคัน [S15] | บวกเข้ามุม elevator + elasticity ตาม $\bar q$ [S20] | `elevatorTrim` min/max/step [S26] | บวกเข้า `c.de` แล้ว clamp (กินระยะคัน) |
| การป้อนคำสั่ง | โฮสต์เขียน property (ไม่มีอินพุตเอง) [S6] | แป้นพิมพ์เพิ่มทีละขั้น ไม่คืนศูนย์ (หัวข้อ 11) | calibrate + เส้นตอบสนองต่อแกน [S17] | (ไม่ได้ตรวจ) | 5 โหมด, sensitivity/expo, increment + recenterRatio, dead zone [S26] | ramp 2.0–2.5/s, คืนศูนย์ 5/s, ไม่มี gamepad |
| ใบอนุญาต | LGPL-2.1 (โค้ด), XML ปน GPL/ไม่ระบุ [S1, S7] | GPL-2.0-or-later [S12] | proprietary | proprietary | proprietary (ปิดซอร์ส) | ยังไม่มี LICENSE |
| AirfieldLab นำมาได้ | แนวคิด + รันเป็น oracle + ผลที่คำนวณจากข้อมูลเรา | แนวคิด solver | แนวคิด, ตัวเลขที่เผยแพร่ | แนวคิด, ค่าตั้งต้นที่เผยแพร่, debug view | แนวคิด parts | — |

## 12.8 JSBSim เป็น oracle ออฟไลน์: วิธีและผลการทดลองจริง
**ขั้นที่ 1: ติดตั้งและรันโมเดลของ JSBSim เอง** ใน virtualenv ใหม่ `pip install jsbsim` ได้รุ่น 1.3.3 (wheel ออก 2026-10-16, classifier LGPLv2+) [S7] รัน c172x ด้วย `do_simple_trim = 1` แล้วปล่อย 10 s (สคริปต์ `s12_jsb_c172x.py`, แก้ลำดับ IC ใน `s12rev/rev_c172x_fixed.py`) [S29]

**แก้ไขจากการทบทวน:** สคริปต์รอบแรกตั้ง `ic/lat-geod-deg` และ `ic/long-gc-deg` หลัง `ic/vc-kts` ทำให้ JSBSim trim ที่ vc 104.5 kt (กรณี cruise) และ 65.96 kt (กรณี approach) ไม่ใช่ 100 และ 65 kt ตามที่ตั้งใจ ผู้ทบทวนรันใหม่โดยตั้ง lat/long ก่อนความสูงและความเร็ว ได้ vc ตรง 100.0 และ 65.0 kt ตารางนี้จึงใช้ผลที่แก้แล้ว (ค่าเดิม: α 0.585°, elevator +5.39°, throttle 0.793, 2,453 rpm ที่ vc 104.5 kt) บทเรียนสำหรับ oracle คือต้องตั้งตำแหน่งก่อนความเร็วเสมอ และตรวจ `velocities/vc-kts` หลัง `run_ic()`

| กรณี | α (°) | elevator (°, บวก = ขอบท้ายลง) | throttle | rpm | Δh ใน 10 s | เวลา trim | เวลา 10 s (1,200 step) |
|---|---|---|---|---|---|---|---|
| cruise 100 KCAS, 3,000 ft, clean, 2,480 lb | 0.796 | +5.14 (pitch-trim-cmd 0.219) | 0.769 | 2,359 | +0.07 ft | 6.8 ms (รอบแรก) | 18.4 ms (15.3 µs/step, 544× เวลาจริง; วัดในรอบแรก) |
| approach 65 KCAS, 1,000 ft, flap 30°, γ −3° | 2.21 | +2.04 (0.084) | 0.507 | 1,574 | −57.9 ft (หลัง trim −349.6 fpm ตาม γ −3° ที่ TAS 65.96 kt, ลดเป็น −345 fpm ที่ 10 s) | 4.3 ms (รอบแรก) | 20.0 ms (รอบแรก) |

ตัวเลขนี้มาจากโมเดลเปิดที่ผ่าน validation แค่ "fly right" ใช้ตรวจว่าสภาพแวดล้อม oracle ถูกต้องเท่านั้น ไม่ใช่ค่าจริงของ C172

**ขั้นที่ 2: สร้างโมเดล JSBSim ของเครื่องฝึกเราจากข้อมูลของเราเอง** `s12_oracle_jsb.py` อ่านพารามิเตอร์ `AC` ที่ `s12_oracle_js.mjs` ส่งออก แล้วเขียน XML ที่ใช้แกน X/Y/Z (body) เพื่อให้ทิศแรงเหมือน `Aircraft.deriv` ทุกประการ:

$$F_x=\bar qS\,[C_L\sin\alpha-C_D\cos\alpha\cos\beta]+T,\quad F_y=\bar qS\,[C_Y-C_D\sin\beta],\quad F_z=\bar qS\,[-C_L\cos\alpha-C_D\sin\alpha\cos\beta]$$

$$\mathcal L=\bar qSb\,C_l,\quad \mathcal M=\bar qS\bar c\,C_m,\quad \mathcal N=\bar qSb\,C_n,\qquad T=\delta_T\,\frac{T_0V_c}{\sqrt{V^2+V_c^2}},\; V_c=\frac{\eta P}{T_0}=48.7\ \text{m/s}$$

โดย $F_{x,y,z}$ แรงในแกน body FRD (N), $\mathcal L,\mathcal M,\mathcal N$ โมเมนต์โรล พิทช์ ยอว์ (N·m), $b$ = 10.2 m, $\bar c$ = 1.65 m, $S$ = 16.3 m², $C_L, C_D, C_Y, C_l, C_m, C_n$ เป็นสูตรเดียวกับ src/20-flight.js:176–191 (รวม σ ของ Beard–McLain, ground effect, $\hat p,\hat q,\hat r$) $\delta_T$ ตำแหน่ง throttle (0–1), $T_0$ = 11,500 N, $P$ = 700 kW, $\eta$ = 0.80 แรงขับใส่เป็น `external_reactions` แกน BODY ที่ CG สิ่งที่ต้องตั้งให้ JSBSim เหมือนโมเดลเรามีสามข้อ (1) `<planet>` รัศมี 1,000 เท่าของโลก ไม่หมุน และ GM ที่ให้ g = 9.80665 m/s² เพื่อตัดผลของ Coriolis, แรงหนีศูนย์และความโค้งของโลก (2) `negated_crossproduct_inertia="false"` เพื่อให้เมทริกซ์ความเฉื่อยมี $-I_{xz}$ ตรงกับ `AC.Iinv` [S6] (3) ทิศของ external force แกน BODY คือแกน body จริง (+x ไปข้างหน้า) [S6] ข้อ (3) ผู้วิจัยตั้งผิดในรอบแรก (ใส่ −1) แล้วได้ θ ต่างกัน 17° การทดสอบแบบนี้จึงจับความผิดพลาดเรื่องแกนได้ทันที

**ขั้นที่ 3: บินแบบ open-loop เหมือนกันทั้งสองฝั่ง** เริ่มจาก state ที่ `setApproach({dist: 5500})` ให้ (95 KIAS, flap 1, gear down, 304.7 m, α 1.761°, δe −3.843°, throttle 0.2448) แล้วสั่ง δe ±2° ที่ t = 1–3 s, δa ±5° ที่ 8–10 s และ δr +5° ที่ 14–15 s รวม 25 s ฝั่ง JS ตั้ง `ac.de = ac.cmd.de` ทุก step เพื่อข้าม rate limit ผลอยู่ในตารางหัวข้อ 12.1 (max |Δθ| 0.0137°, |Δφ| 0.039°) ที่ t = 25 s ฝั่ง JS กับ JSBSim ได้ h = 238.298 กับ 238.299 m และ ψ = −159.501° กับ 200.501° (= −159.499°) (จาก `oracle_jsb_noadot_240hz_ab3.json`)

**นำเข้า repo อย่างไร (ข้อเสนอ)**
```text
tools/jsbsim/make_model.py   # สร้าง XML จาก data/aircraft/<id>.json (ข้อมูลของเรา) ลงโฟลเดอร์ชั่วคราว
tools/jsbsim/run_cases.py    # รันกรณีมาตรฐาน เขียน test/fixtures/jsbsim_<id>_<case>.json (10 Hz, ~250 แถว)
test/oracle.test.mjs         # Node ล้วน: รัน JS ด้วย schedule เดียวกัน เทียบกับ fixture ตามเกณฑ์ T-S-02
```
fixture ราว 30 KB ต่อกรณี สร้างใหม่เฉพาะเมื่อ EOM หรือโครงสร้างข้อมูลเปลี่ยน CI ไม่ต้องมี Python เพราะการทดสอบ Node อ่าน fixture อย่างเดียว

**ใบอนุญาต** การรัน JSBSim เป็นโปรแกรมภายนอกไม่ใช่การแจกจ่าย จึงไม่มีภาระ LGPL ต่อ repo สคริปต์ที่ `import jsbsim`, XML ที่สร้างจากข้อมูลของเรา และ fixture ตัวเลข เป็นงานของเรา ห้ามใส่ XML ของเครื่องบินจาก JSBSim หรือโค้ด C++ ลง repo

**ข้อจำกัด** oracle ตรวจได้เฉพาะ "การนำสมการไปใช้" (EOM, แกน, ความเฉื่อย, การรวมแรง, trim/linearization ของโมเดลเดียวกัน) ไม่ได้บอกว่าข้อมูล aero สมจริง และเทียบล้อตรง ๆ ไม่ได้เพราะ `FGLGear` ใช้แรงเสียดทานต่างจากเรา

## 12.9 ข้อเสนอแนะเรียงตามคุณค่า และหมายเหตุการนำไปใช้
**1) oracle ออฟไลน์ (P1)** ตามหัวข้อ 12.8 คุ้มที่สุด เพราะงานรอบถัดไป (ย้ายข้อมูลไป JSON, ใบพัด, เครื่องบินใหม่) เสี่ยงทำ EOM หรือแกนพัง และ oracle จับได้ในไม่กี่วินาที

**2) โครงสร้างข้อมูลเครื่องบินแบบ JSBSim (P1)** แยก `AC` ออกเป็นไฟล์ JSON ต่อเครื่อง โดยยังให้ `20-flight.js` เป็น pure:
```js
// data/aircraft/trainer.json (ย่อ) ทุกค่ามี {v,u,src,conf,est} ตาม schema ของรอบนี้
// { "metrics": {...}, "mass": {...}, "aero": { "CL": [{"k":"CLa","v":4.8,"in":"alpha"}, ...],
//   "tables": { "CLmaxFlap": {"axes":{"flap":[0,1]}, "data":[1.45,2.0]} } },
//   "engine": {...}, "propeller": {"CT": {...}, "CP": {...}}, "gear": [...], "fcs": {"de": {"rate":70,"lag":0}} }
function table1(t, x) {                       // เหมือน FGTable 1D: ตัดค่าที่ขอบ ไม่ extrapolate [S3]
  const X = t.x, Y = t.y, n = X.length;
  if (x <= X[0]) return Y[0]; if (x >= X[n - 1]) return Y[n - 1];
  let i = 1; while (X[i] < x) i++;
  const f = (x - X[i - 1]) / (X[i] - X[i - 1]); return Y[i - 1] + f * (Y[i] - Y[i - 1]);
}
```
ค้นแบบเชิงเส้นพอสำหรับตาราง < 20 จุด ถ้าตารางยาวให้เก็บ index ล่าสุดไว้ (ตารางแปรช้า) การอ่านไฟล์ JSON ต้องอยู่นอก `20-flight.js` เพราะ `test/harness.mjs` ประเมิน `10-atmo.js + 15-geo.js + 20-flight.js` ด้วย `new Function` (ไม่มี `fetch`, DOM หรือ `fs`): ให้ `48-data.js` โหลดในเบราว์เซอร์และ harness อ่านด้วย `fs.readFileSync` แล้วส่งอ็อบเจกต์เข้าฟังก์ชัน pure เช่น `setAircraft(def)` (ชื่อเสนอ ยังไม่มีในโค้ด) ซึ่งสร้าง `AC` และ `AC.Iinv` ใหม่

**3) actuator และ trim แบบ JSBSim/X-Plane 12 (P1)** ให้ทุกพื้นผิวผ่านองค์ประกอบเดียวกัน:
$$\delta_{cmd}=\begin{cases}\delta_t+s\,(\delta_{max}-\delta_t)&s\ge0\\ \delta_t+s\,(\delta_t-\delta_{min})&s<0\end{cases},\qquad \dot\delta=\mathrm{clamp}\!\Big(\frac{\delta_{cmd}-\delta}{\tau},\,-r,\,r\Big)$$
โดย $s\in[-1,1]$ คือคำสั่งคันหลัง dead zone และ expo (หัวข้อ 11) บวกเมื่อดันคันหรือขอบท้ายลงตามเครื่องหมาย `de` ของ repo ($s=-y$), $\delta_t$ มุม trim, $\delta_{max},\delta_{min}$ ขีดจำกัดพื้นผิว, $\tau$ lag (s), $r$ rate limit (rad/s) สูตรนี้ทำให้ trim เป็น "ตำแหน่งพัก" และคันสุดยังได้มุมสุดทั้งสองทาง ตามที่ X-Plane 12 อธิบาย [S15] เมื่อ $\tau\to0$ เหลือแค่ rate limit (สมการเป็นค่าประมาณของผู้วิจัย) ส่วน deadband และ hysteresis เลียนแบบ `FGActuator` [S6] ได้ในภายหลังเมื่อจำลองสายเคเบิล

**trim มีสองชนิดจริง ให้ schema ระบุ `trim.kind` ต่อเครื่อง** (ก) `tab`: trim tab ที่ขอบท้าย elevator ดัน elevator ไปทางตรงข้ามจนพักนิ่งโดยไม่ต้องออกแรง [S30, pp. 6-10–6-11] ผลคือตำแหน่งพักของคันเปลี่ยน สูตรข้างบนใช้กับกรณีนี้ (เครื่องฝึก, C172S, DA40) (ข) `ths`: "adjustable stabilizer" ที่หมุนหางระดับทั้งชิ้นรอบ rear spar [S30, p. 6-12] ทำให้โมเมนต์บวกเพิ่ม $\Delta C_m = C_{m_{i_h}}\,\Delta i_h$ โดย elevator ยังมีระยะครบ (เครื่องบินโดยสารในรอบ 3 ตามหัวข้อ 6) วิธีของ MSFS ที่บวก trim เข้ามุม elevator [S20] จึงเลียนแบบแบบ (ข) ได้ถ้าไม่ตัดผลรวมด้วยขีดของ elevator แต่โค้ดเราบวกแล้วตัดที่ขีดของ elevator (src/20-flight.js:468 ร่วมกับ `actuators()`) ซึ่งไม่ตรงทั้งสองแบบ

**4) solver สองจุดแบบ YASim (P2)** สำหรับเครื่องใหม่ที่มีแค่ตัวเลข POH ให้ตรึง derivative ที่หาจากเรขาคณิต ($C_{L\alpha}$, $C_{m\alpha}$, $C_{m\delta_e}$ จากหัวข้อ 1) แล้วแก้ offset ด้วย Newton จากสมการสมดุลที่จุดเป้า (บินระดับ ใช้ `deriv` คำนวณความเร่ง N, D และ $\dot q$):
$$\mathbf r(\mathbf x)=\big[\dot V_N,\ \dot V_D,\ \dot q\big]_{\text{cruise}}=\mathbf 0,\qquad \mathbf x=[C_{D0},\,C_{L0},\,C_{m0}]$$
และอีกสามตัว $[C_{D,flap}+C_{D,gear},\,C_{L,flap},\,C_{m,flap}]$ จากจุด approach ต้นแบบ `s12_solver_proto.mjs` ใช้จุด cruise ของโมเดลปัจจุบัน (5,000 ft, throttle 0.75, 240.36 KTAS, α −1.194°, δe +2.989°) เริ่มจาก $C_{D0}$ 0.03, $C_{L0}$ 0.4, $C_{m0}$ 0 แล้ว Newton กลับมาได้ 0.024, 0.25, 0.045 ตรงค่าใน `AC` (round trip) กับเครื่องจริง เป้าต้องเป็นตัวเลขที่มีแหล่ง (cruise ที่กำลังกำหนด, Vs0/Vs1, อัตราไต่) และต้องตรวจว่าผลมีความหมายทางกายภาพ ($C_{D0}>0$, δe ไม่ชนขีด) แบบที่ YASim ตรวจ [S12]

**5) debug view แบบ MSFS (P3)** แสดงเวกเตอร์ L, D, T, แรงล้อ และสีตาม σ จาก `diag` ที่ `deriv` มีอยู่แล้ว (src/20-flight.js:238)

**6) strip/blade element (P3 ในหัวข้อนี้)** ถ้าทำ ให้ทำเฉพาะปีก 4–6 strip ต่อข้างเพื่อ wing drop และ spin (หัวข้อ 1 และ 5) งบ CPU ยังเหลือมากจาก 3.7–4.5 µs/step

**7) JSBSim-WASM ในหน้าเว็บ (P3, ยังไม่แนะนำ)** เหตุผลในหัวข้อ 12.6 ถ้าจะทดลองให้ทำในสาขาแยกหลังเพิ่ม LICENSE และหน้าแจ้งซอร์ส LGPL

## 12.10 ค่าพารามิเตอร์ (JSON)
ค่าที่ `est: true` คือค่าที่ผู้วิจัยคำนวณหรือวัดเองจากการรันโมเดล (สคริปต์ใน `scripts/s12/`) ค่า `est: false` อ่านตรงจากซอร์สโค้ดหรือเอกสาร หมวด `xplane`, `msfs`, `geofs` ใส่ไว้เป็นค่าอ้างอิงเชิงเปรียบเทียบ ไม่ได้เสนอให้ใช้เป็นค่าของเครื่องฝึกเราโดยตรง

```json
{
 "otherSims": {
  "jsbsim": {
   "version": {"v": [1,3,3], "u": "major.minor.patch", "scope": "sim", "src": ["S7"], "conf": "สูง", "est": false, "note": "รุ่นบน PyPI ที่ติดตั้งและรันจริง 2026-11-18 (ออก 2026-10-16)"},
   "defaultDt": {"v": 0.008333333333333333, "u": "s", "scope": "sim", "src": ["S2"], "conf": "สูง", "est": false, "note": "dT เริ่มต้นใน FGFDMExec ตั้งใหม่ได้ด้วย set_dt"},
   "defaultIntegrators": {"v": {"rotationalRate": "RectEuler", "translationalRate": "AdamsBashforth2", "rotationalPosition": "RectEuler", "translationalPosition": "AdamsBashforth3"}, "u": "-", "scope": "sim", "src": ["S2"], "conf": "สูง", "est": false, "note": "ค่าเริ่มต้นใน FGPropagate เปลี่ยนได้ทาง simulation/integrator/*"},
   "tableOutOfRange": {"v": {"mode": "clamp", "extrapolate": false}, "u": "-", "scope": "sim", "src": ["S3"], "conf": "สูง", "est": false, "note": "FGTable คืนค่าขอบตาราง ไม่ extrapolate"},
   "gearSideForcePacejkaDefaults": {"v": {"B_stiffness": 0.06, "C_shape": 2.8, "D_peak": "static_friction", "E_curvature": 1.03}, "u": "-", "scope": "gear", "src": ["S5"], "conf": "สูง", "est": false, "note": "ค่าเริ่มต้นของ magic formula ใน FGLGear (มุมไถลเป็นองศา)"},
   "c172xTrimCruise100kcas3000ft": {"v": {"vc_kts": 100.0, "alpha_deg": 0.796, "elevator_pos_deg": 5.140, "pitchTrimCmd": 0.2186, "throttle": 0.769, "rpm": 2359, "weight_lb": 2480, "dh_10s_ft": 0.068}, "u": "kt, deg, -, rpm, lb, ft", "scope": "aircraft", "src": ["S7", "S29"], "conf": "กลาง", "est": true, "note": "ผลรันโมเดลเปิด c172x (GPL) ไม่ใช่ข้อมูลบินจริง elevator บวก = ขอบท้ายลง; ค่าหลังแก้ลำดับ IC (ตั้ง lat/long ก่อนความเร็ว) ใน s12rev/rev_c172x_fixed.py ค่าเดิมที่ vc 104.5 kt คือ alpha 0.585, elevator 5.392, throttle 0.793"},
   "c172xTrimApproach65kcas1000ftFlap30": {"v": {"vc_kts": 65.0, "vtrue_kts": 65.96, "alpha_deg": 2.213, "theta_deg": -0.787, "elevator_pos_deg": 2.036, "pitchTrimCmd": 0.0835, "throttle": 0.507, "rpm": 1574, "hdot_fpm_trim": -349.6, "hdot_fpm_10s": -344.8}, "u": "kt, deg, -, rpm, fpm", "scope": "aircraft", "src": ["S7", "S29"], "conf": "กลาง", "est": true, "note": "gamma -3 deg; ค่าหลังแก้ลำดับ IC (s12rev/rev_c172x_fixed.py); ใช้ตรวจว่าสภาพแวดล้อม oracle ติดตั้งถูก ไม่ใช่ข้อมูลบินจริง"},
   "costPerStep_c172x_native": {"v": 15.3, "u": "us/step", "scope": "sim", "src": ["S29"], "conf": "กลาง", "est": true, "note": "Python loop + C++ ที่ 120 Hz บนเครื่อง cloud นี้ (544 เท่าเวลาจริง) วัดในรอบแรก (กรณี cruise ที่ vc 104.5 kt) ค่าประมาณ ขึ้นกับเครื่อง"},
   "wasmBundleBytes": {"v": 1588236, "u": "byte", "scope": "sim", "src": ["S9"], "conf": "สูง", "est": false, "note": "@0x62/jsbsim-wasm 1.2.4-beta.4 ไฟล์ .wasm (LGPL-2.1) ยังไม่ได้รันทดสอบ"}
  },
  "yasim": {
   "propEtaC": {"v": 0.85, "u": "-", "scope": "propeller", "src": ["S12"], "conf": "สูง", "est": false, "note": "ประสิทธิภาพสูงสุดคงที่ของโมเดลใบพัด YASim"},
   "propLambdaPeak": {"v": 0.6687, "u": "-", "scope": "propeller", "src": ["S12"], "conf": "สูง", "est": false, "note": "5^(-1/4) อัตราส่วน J/J0 ที่ประสิทธิภาพสูงสุด"},
   "gearStaticFrictionDefault": {"v": 0.8, "u": "-", "scope": "gear", "src": ["S11"], "conf": "สูง", "est": false, "note": "sfric ค่าเริ่มต้น"},
   "gearDynamicFrictionDefault": {"v": 0.7, "u": "-", "scope": "gear", "src": ["S11"], "conf": "สูง", "est": false, "note": "dfric ค่าเริ่มต้น"},
   "groundEffectShape": {"v": {"form": "Fz_extra = Fz_aero * k_ge * (b - h)/b", "activeBelow": "h < b"}, "u": "-", "scope": "sim", "src": ["S12"], "conf": "สูง", "est": false, "note": "Model::calcForces คูณแรงแนวดิ่งเชิงเส้นตามความสูงเทียบ span"},
   "flightgearModelHz": {"v": 120, "u": "Hz", "scope": "sim", "src": ["S13"], "conf": "สูง", "est": false, "note": "fgdata defaults.xml"}
  },
  "xplane": {
   "maxElementsPerSide": {"v": 10, "u": "-", "scope": "aircraft", "src": ["S14"], "conf": "สูง", "est": false, "note": "ต่อปีกหรือ stabilizer ต่อข้าง (\"Ten elements per side per wing or stabilizer is the maximum\")"},
   "minCyclesPerSecond": {"v": 15, "u": "Hz", "scope": "sim", "src": ["S14"], "conf": "กลาง", "est": false, "note": "หน้า How X-Plane Works ระบุ \"at least 15 times per second\""},
   "minFrameRate": {"v": 20, "u": "fps", "scope": "sim", "src": ["S17"], "conf": "สูง", "est": false, "note": "คู่มือ X-Plane 12: physics และ rendering วิ่งต่อเฟรม ขั้นต่ำ 20 fps"},
   "tireRollingCoeffGuidance": {"v": {"airlinerFighter": 0.008, "generalAviation": 0.016, "piper": 0.04}, "u": "-", "scope": "gear", "src": ["S15"], "conf": "กลาง", "est": false, "note": "คำแนะนำของผู้พัฒนา X-Plane 12 (\"about 0.040 for the piper\") ไม่ใช่ค่าวัด"}
  },
  "msfs": {
   "windTunnelIterations": {"v": 100, "u": "-", "scope": "sim", "src": ["S19"], "conf": "สูง", "est": false, "note": "\"100 adjustment iterations to the surface aerodynamic parameters\" ให้ตรงค่าสมรรถนะเป้าหมาย normalize เฉพาะกระแสลมตามแกนลำตัวที่ AoA 0-15 deg"},
   "stallDefStartRatio": {"v": 0.9, "u": "-", "scope": "aircraft", "src": ["S18"], "conf": "สูง", "est": false, "note": "สัดส่วนของ stall AoA ที่กระแสเริ่มแยก"},
   "stallDefEndRatio": {"v": 1.1, "u": "-", "scope": "aircraft", "src": ["S18"], "conf": "สูง", "est": false, "note": "แยกสมบูรณ์"},
   "stallDefCurvePower": {"v": 0.8, "u": "-", "scope": "aircraft", "src": ["S18"], "conf": "สูง", "est": false, "note": "เลขชี้กำลังของเส้นการแยก"},
   "stallTipAddIncidence": {"v": 2, "u": "deg", "scope": "aircraft", "src": ["S18"], "conf": "สูง", "est": false, "note": "เพิ่ม stall AoA ที่ปลายปีก"},
   "elevatorTrimModel": {"v": {"mode": "additive to elevator deflection", "limits": ["elevator_trim_limit", "elevator_trim_up_limit", "elevator_trim_down_limit"], "scaling": "elevator_trim_elasticity_table(qbar_psf), default 0.0:1.0"}, "u": "deg", "scope": "aircraft", "src": ["S20"], "conf": "สูง", "est": false, "note": "MSFS 2020 [AIRPLANE_GEOMETRY] trim บวกเข้ามุม elevator และลดตาม qbar ได้"},
   "gearSpringExponentDefault": {"v": 16, "u": "-", "scope": "gear", "src": ["S22"], "conf": "กลาง", "est": false, "note": "เลขชี้กำลังสปริงไม่เชิงเส้นของ contact point (ค่าสุดท้ายในรายการ point.N) สปริงและ damping คำนวณอัตโนมัติจาก static compression เมื่อทุก contact point เป็นล้อ"}
  },
  "geofs": {
   "airfoilPartFields": {"v": ["area | liftFactor+dragFactor", "stallIncidence", "zeroLiftIncidence", "span", "chord", "aspectRatio", "efficiencyFactor", "forceDirection"], "u": "-", "scope": "aircraft", "src": ["S26"], "conf": "ต่ำ", "est": false, "note": "จาก typings ชุมชน ไม่ใช่เอกสารทางการ"},
   "inputModel": {"v": {"modes": ["mouse", "keyboard", "orientation", "touch", "joystick"], "perMode": ["sensitivity", "exponential", "mixYawRoll", "mixYawRollQuantity"], "keyboard": ["rollIncrement", "pitchIncrement", "yawIncrement", "throttleIncrement", "recenterRatio"], "joystick": ["deadZoneUp", "deadZoneDown"], "trim": ["elevatorTrimMin", "elevatorTrimMax", "elevatorTrimStep"]}, "u": "-", "scope": "sim", "src": ["S26"], "conf": "ต่ำ", "est": false, "note": "ชื่อฟิลด์จาก typings ชุมชน ไม่มีค่าตัวเลข"},
   "enginePartThrust": {"v": {"unit": "N", "model": "constant static thrust x throttle", "altitudeLapse": "linear to zeroThrustAltitude"}, "u": "-", "scope": "engine", "src": ["S26"], "conf": "ต่ำ", "est": false, "note": "ลดเชิงเส้นตามความสูงถึง zeroThrustAltitude"}
  },
  "airfieldlab": {
   "oracleTolerance": {"v": {"h_m": 0.05, "V_mps": 0.01, "theta_deg": 0.05, "phi_deg": 0.1, "beta_deg": 0.05, "rate_dps": 0.5}, "u": "m, m/s, deg, deg/s", "scope": "sim", "src": ["S29"], "conf": "กลาง", "est": true, "note": "เกณฑ์ T-S-01/02 ของผู้วิจัย (ค่าประมาณ) ตั้งจากผลจริงที่ AB3 240 Hz คูณราว 2.4-12.5 เท่า (h 12.5x, V 10.5x, theta 3.6x, beta 3.9x, phi 2.5x, p 2.4x); JSBSim integrator ตั้งต้นที่ 120 Hz ไม่ผ่าน (theta 0.083 deg)"},
   "oracleMeasuredMaxErr240HzAB3": {"v": {"h_m": 0.004, "V_mps": 0.00095, "alpha_deg": 0.0123, "beta_deg": 0.0129, "theta_deg": 0.0137, "phi_deg": 0.0393, "psi_deg": 0.0113, "p_dps": 0.207, "q_dps": 0.05, "r_dps": 0.02}, "u": "m, m/s, deg, deg/s", "scope": "sim", "src": ["S29"], "conf": "สูง", "est": true, "note": "JS RK4 240 Hz เทียบ JSBSim 1.3.3 AB3 240 Hz ไม่มี alpha-dot 25 s"},
   "oracleMeasuredMaxErrAdot": {"v": {"h_m": 0.0095, "alpha_deg": 0.04, "theta_deg": 0.048, "q_dps": 0.117}, "u": "m, deg, deg/s", "scope": "sim", "src": ["S29"], "conf": "สูง", "est": true, "note": "alpha-dot แบบกรองตัวเลข 50 ms ของเรา เทียบ alphadot เชิงวิเคราะห์ของ JSBSim"},
   "trimKind": {"v": {"options": ["tab", "ths"], "trainer": "tab"}, "u": "-", "scope": "aircraft", "src": ["S30", "S15", "S20"], "conf": "กลาง", "est": true, "note": "tab = ตำแหน่งพักของคันเลื่อน; ths = มุมหางเปลี่ยน โมเมนต์บวกเพิ่ม elevator ยังมีระยะครบ"},
   "stepCostNode": {"v": [3.7, 4.5], "u": "us/step", "scope": "sim", "src": ["S29"], "conf": "กลาง", "est": true, "note": "ช่วงจากสองรอบวัด Node 22.23.5 หลัง warm-up, RK4 + updateAir (5 deriv ต่อ step)"}
  }
 }
}
```

## 12.11 กรณีทดสอบ
| ID | สิ่งที่ทดสอบ | การตั้งค่า | ผลที่คาดหวัง (± tolerance) | ที่มาของค่าคาดหวัง | โมเดลปัจจุบัน |
|---|---|---|---|---|---|
| T-S-01 | EOM และแกนตรงกับ JSBSim (ออฟไลน์, Python) | XML สร้างจาก `AC`, `<planet>` ไม่หมุน g = 9.80665, JSBSim AB3 240 Hz, เริ่มจาก `setApproach({dist:5500})`, δe ±2° (1–3 s), δa ±5° (8–10 s), δr +5° (14–15 s), 25 s, CLadot = Cmadot = 0 | max \|Δh\| ≤ 0.05 m, \|ΔV\| ≤ 0.01 m/s, \|Δθ\| ≤ 0.05°, \|Δφ\| ≤ 0.1°, \|Δβ\| ≤ 0.05°, \|Δp,Δq,Δr\| ≤ 0.5 °/s | เกณฑ์ของผู้วิจัย (ค่าประมาณ) ตั้งจากผลจริงคูณราว 2.4–12.5 เท่า [S29] (ตรวจซ้ำด้วย `s12rev/rev_oracle_cmp.mjs`) | 0.004 m, 0.00095 m/s, 0.0137°, 0.039°, 0.0129°, p 0.21 q 0.05 r 0.02 °/s (ผ่าน); ถ้าใช้ integrator ตั้งต้นของ JSBSim ที่ 120 Hz ได้ θ 0.083° φ 0.19° p 0.68 °/s (ไม่ผ่าน จึงต้องใช้ AB3 240 Hz) |
| T-S-02 | ทดสอบ Node กับ fixture จาก JSBSim (ไม่มี dependency) | `test/fixtures/jsbsim_trainer_doublet.json` 10 Hz, schedule เดียวกับ T-S-01 | เกณฑ์เดียวกับ T-S-01 | [S29] | ยังไม่มีฟีเจอร์ (ยังไม่มี fixture ใน repo; ข้อมูลวันนี้จะผ่าน) |
| T-S-03 | การประมาณ α̇ แบบกรองเชิงตัวเลข | เหมือน T-S-01 แต่คง CLadot 1.6, Cmadot −4.5 | \|Δθ\| ≤ 0.1°, \|Δα\| ≤ 0.1°, \|Δq\| ≤ 0.25 °/s | ผลจริงคูณ ~2 [S29] | 0.048°, 0.040°, 0.117 °/s (ผ่าน) |
| T-S-04 | trim ของ `setApproach` คงตัว | dist 5,500 m, คันนิ่ง, ไม่มีลม, 20 s | \|Δθ\| ≤ 0.1°, \|ΔIAS\| ≤ 0.5 kt, \|Δvs\| ≤ 20 fpm | เกณฑ์ของผู้วิจัย (ค่าประมาณ) | 0.008°, −0.146 kt, 3.3 fpm (ผ่าน) |
| T-S-05 | สภาพแวดล้อม oracle ถูกต้อง (Python) | jsbsim 1.3.3, c172x, ตั้ง `ic/lat-geod-deg`, `ic/long-gc-deg` **ก่อน** `ic/h-sl-ft` 3,000 และ `ic/vc-kts` 100, `do_simple_trim=1`, ปล่อย 10 s | `velocities/vc-kts` 100.0 ± 0.1 หลัง trim, α 0.796° ± 0.05°, elevator +5.14° ± 0.1°, throttle 0.769 ± 0.01, \|Δh\| ≤ 1 ft | ผลรันของผู้ทบทวน (`s12rev/rev_c172x_fixed.py`) [S7, S29] | ผ่าน (vc 100.0 kt, 0.796°, 5.140°, 0.769, 0.07 ft); สคริปต์รอบแรกที่ตั้ง lat/long หลังความเร็วได้ vc 104.5 kt ซึ่งการตรวจ vc จะจับได้ |
| T-S-06 | solver สองจุดแบบ YASim (round trip) | จุด cruise: 5,000 ft ISA, thr 0.75, clean, 240.362 KTAS, α −1.1939°, δe +2.9895°; เริ่ม CD0 0.03, CL0 0.4, Cm0 0 | CD0 0.024, CL0 0.25, Cm0 0.045 (± 1e-6) | ค่าจริงใน `AC` [S28, S29] | ยังไม่มีฟีเจอร์ (ต้นแบบใน scripts/ ผ่าน) |
| T-S-07 | ตารางแบบ FGTable ตัดค่าที่ขอบ | 1D x = [0,10,20], y = [0,1,4]; 2D rows [0,1], cols [0,10], data [[0,1],[2,3]] | 1D ที่ −5, 5, 15, 25 = 0, 0.5, 2.5, 4; 2D ที่ (0.5,5) = 1.5, (2,20) = 3, (−1,−3) = 0 (± 1e-12) | [S3], `s12_table_expected.mjs` | ยังไม่มีฟีเจอร์ |
| T-S-08 | trim เป็นตำแหน่งพัก ไม่กินระยะคัน | DIRECT, `trim.kind = tab`, trim −5° และ +5°, คัน y = ±1 และ 0 | trim −5°: ดันสุด +15.0°, ดึงสุด −22.0°, ปล่อย −5.0°; trim +5°: ดึงสุด −22.0°, ดันสุด +15.0°, ปล่อย +5.0° (± 0.1°) | แนวคิด X-Plane 12 [S15] และสูตรหัวข้อ 12.9 (คำนวณใน `s12rev/rev_ths.mjs`) | trim −5°: ดันสุด **+10°** (ไม่ผ่าน); trim +5°: ดึงสุด **−17°** (ไม่ผ่าน) |
| T-S-09 | lag อันดับหนึ่งของ actuator | step 0.3 → 1.0, τ = 1 s, dt 1/240, 1 s | 0.7425 ± 0.002 | $0.3+0.7(1-e^{-1})$ | throttle 0.7425 (ผ่าน); พื้นผิวบังคับยังไม่มี lag (ยังไม่มีฟีเจอร์) |
| T-S-10 | งบ CPU ต่อ step หลังย้ายไปตาราง | Node 22, warm-up 2,000 step แล้วจับเวลา 24,000 step | ≤ 20 µs/step (ให้ 240 Hz ใช้ CPU < 0.5%) | เกณฑ์ของผู้วิจัย (ค่าประมาณ) | 3.7–4.5 µs/step (ผ่าน) |
| T-S-11 | ป้องกันการคัดลอกไฟล์ GPL/LGPL ลง repo | grep ทุกไฟล์ใน repo (ยกเว้น .git) หา `<fdm_config`, `licenseName="GPL`, "GNU GENERAL PUBLIC LICENSE", "GNU LESSER GENERAL PUBLIC" | 0 ไฟล์ (ยกเว้นที่เจ้าของอนุมัติใน allowlist) | กฎข้อ 4 ของเจ้าของ, [S1, S7] | 0 ไฟล์ (ผ่าน) |
| T-S-12 | schema ของไฟล์เครื่องบิน | ทุก `data/aircraft/*.json` | ทุก leaf มี v, u, scope ∈ {aircraft, engine, propeller, gear, environment, sim}, src ไม่ว่าง, conf ∈ {สูง, กลาง, ต่ำ}, est เป็น boolean | schema ของรอบนี้ | ยังไม่มีฟีเจอร์ |
| T-S-13 | trim แบบ stabilizer (THS) ไม่กินระยะ elevator | DIRECT, `trim.kind = ths`, $\Delta i_h$ = −1°, α และ $\bar q$ คงที่, คัน y = ±1, $C_{m_{i_h}}$ = −2.0 /rad (ค่าสมมติสำหรับการทดสอบเท่านั้น ยังไม่มีค่าของเครื่อง) | δe ดันสุด +15.0°, ดึงสุด −22.0° (± 0.1°); $\Delta C_m = C_{m_{i_h}}\Delta i_h$ = +0.034907 (± 1e-9) | [S30, p. 6-12], [S20]; ค่าคาดหวังคำนวณใน `s12rev/rev_ths.mjs` | ยังไม่มีฟีเจอร์ |

## 12.12 ความขัดแย้งของแหล่งข้อมูลและข้อจำกัด
- **อัตราฟิสิกส์ของ X-Plane:** หน้า "How X-Plane Works" บอก "อย่างน้อย 15 ครั้งต่อวินาที" [S14] คู่มือ X-Plane 12 บอกว่า physics วิ่งต่อเฟรมและตั้งขั้นต่ำ 20 fps [S17] ทั้งสองค่าไม่ได้บอกว่ามี substep ต่อเฟรมกี่ครั้ง ผู้วิจัยจึงไม่สรุปอัตราที่แท้จริง
- **ใบอนุญาตของโมเดลเครื่องบินใน JSBSim:** README บอกว่าโมเดลทำจากข้อมูลสาธารณะ [S1] แต่ไม่ได้ระบุใบอนุญาตของไฟล์ XML ไฟล์ที่ระบุมีแต่ GPL และ 46 จาก 60 โมเดลไม่ระบุเลย [S7] จึงถือว่าห้ามคัดลอก
- **ใบอนุญาตของ `@0x62/jsbsim-wasm`:** package.json และ LICENSE บอก MIT แต่ README บอกว่าไฟล์ .wasm และ patch เป็น LGPL-2.1 [S9] ค่าที่ถูกคือ README (โค้ด JSBSim เป็น LGPL) ผู้ที่ดูแค่ช่อง license บน npm จะเข้าใจผิด
- **GeoFS:** ไม่มีเอกสารทางการเกี่ยวกับฟิสิกส์ บทความของ Cesium [S23, S24] เป็นบล็อกของผู้ผลิตไลบรารีที่สัมภาษณ์ผู้สร้าง และ typings [S26] มาจากการแกะของชุมชน ความเชื่อมั่นต่ำทั้งหมด
- **MSFS:** หน้า SDK 2024 บางหน้าเครื่องมืออ่านได้ไม่ครบ จึงใช้หน้า SDK 2020 เป็นหลัก พฤติกรรมของ 2024 อาจต่างในจุดที่ไม่ได้ตรวจ
- **WASM:** ไม่ได้รัน `@0x62/jsbsim-wasm` เพราะสภาพแวดล้อมไม่อนุญาตให้รันโค้ดจาก npm ที่ดาวน์โหลดมา ประสิทธิภาพของ JSBSim ในเบราว์เซอร์ยังไม่ยืนยัน
- **oracle:** ใช้ g = 9.80665 และโลกแบนไม่หมุนเหมือนโมเดลของเรา ซึ่งไม่ใช่โลกจริง ถ้าจะเทียบเที่ยวบินยาวหรือการนำทางในอนาคตต้องเปลี่ยน `<planet>` ทั้งสองฝั่ง
- **trim บวกเพิ่มหรือเป็นตำแหน่งพัก:** MSFS ให้ trim "adds to the elevator deflection" [S20] ส่วน X-Plane 12 เปลี่ยนจากการบวกมาเป็นตำแหน่งพักของคัน [S15] ไม่ขัดกันทางฟิสิกส์ถ้าแยกชนิด trim (tab หรือ stabilizer [S30]) แต่ทั้งสองไม่บอกว่าผลรวมถูกตัดที่ขีดของ elevator หรือไม่ จึงเสนอให้ระบุชนิดต่อเครื่อง
- **ตัวเลข c172x:** น้ำหนัก 2,480 lb ในไฟล์ c172x อาจไม่ตรงกับ POH (ไม่ได้ตรวจรอบนี้) จึงใช้ตรวจสภาพแวดล้อมเท่านั้น
- **ขอบเขตการทบทวน:** ผู้ทบทวนยืนยันซ้ำจากซอร์สและแพ็กเกจที่ดาวน์โหลด (JSBSim 1.3.3, YASim, fgdata, npm, typings ของ GeoFS) และเปิดหน้า [S8], [S11], [S14]–[S16], [S17], [S18]–[S20], [S22], [S30] อีกครั้ง ส่วน [S21] (MSFS 2024 physics objects), [S23]–[S25] (บล็อก Cesium และ GeoFS) และ [S27] (repo บน GitHub) เปิดซ้ำไม่ได้เพราะโควตาการดึงเว็บหมดและ proxy ปฏิเสธ github.com ข้อความที่อิงแหล่งเหล่านี้ (ปีที่ GeoFS เริ่ม, การย้ายไป CesiumJS, ฟิลด์ `surface_cx*`, ใบอนุญาตของ repo ตัวอย่าง) จึงยังไม่ยืนยันซ้ำ ความเชื่อมั่นต่ำ

## 12.13 แหล่งอ้างอิง
1. [S1] JSBSim-Team, *README.md* (master, ดึง 2026-11-17) https://github.com/JSBSim-Team/jsbsim — ปฐมภูมิ · LGPL-2.1 (Unreal plugin MIT, MATLAB BSD) · อ้างข้อเท็จจริงได้ ไม่คัดลอกโค้ด
2. [S2] JSBSim-Team, `src/models/FGPropagate.cpp` (integrator ตั้งต้น) และ `src/FGFDMExec.cpp` (`dT = 1.0/120.0`, `<planet>`) https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/src/models/FGPropagate.cpp , https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/src/FGFDMExec.cpp — ปฐมภูมิ · LGPL-2.1 · อ้างค่าและแนวคิดได้
3. [S3] JSBSim-Team, `src/models/FGAerodynamics.cpp`, `src/math/FGTable.cpp`, `src/math/FGFunction.cpp` https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/src/models/FGAerodynamics.cpp , https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/src/math/FGTable.cpp , https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/src/math/FGFunction.cpp — ปฐมภูมิ · LGPL-2.1 · อ้างได้ เขียนตารางของเราเองได้ (interpolation เป็นอัลกอริทึมทั่วไป)
4. [S4] JSBSim-Team, `src/models/propulsion/FGPropeller.cpp` https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/src/models/propulsion/FGPropeller.cpp — ปฐมภูมิ · LGPL-2.1 · อ้างสมการได้
5. [S5] JSBSim-Team, `src/models/FGLGear.cpp` https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/src/models/FGLGear.cpp — ปฐมภูมิ · LGPL-2.1 · อ้างสมการและค่าตั้งต้นได้
6. [S6] JSBSim-Team, https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/src/models/flight_control/FGActuator.cpp , https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/src/models/FGExternalForce.cpp , https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/src/models/propulsion/FGForce.cpp , https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/src/models/FGMassBalance.cpp , https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/src/models/FGInertial.cpp — ปฐมภูมิ · LGPL-2.1 · อ้างได้
7. [S7] JSBSim-Team, PyPI `jsbsim` 1.3.3 (2026-10-16) https://pypi.org/project/jsbsim/ และไฟล์ในแพ็กเกจ `aircraft/c172x/c172x.xml` (หัวไฟล์ GPL, Tony Peden), `aircraft/c172p/c172p.xml` (Unknown, ไม่ระบุใบอนุญาต) — ปฐมภูมิ · โค้ด LGPL-2.1, XML GPL/ไม่ระบุ · รันเป็นเครื่องมือได้ ห้ามคัดลอก XML
8. [S8] JSBSim, *Aeromatic* https://jsbsim.sourceforge.net/aeromatic2.html และ repo https://github.com/JSBSim-Team/aeromatic (ไฟล์ LICENSE: GNU AGPL v3, https://raw.githubusercontent.com/JSBSim-Team/aeromatic/master/LICENSE) — ปฐมภูมิ · อ้างแนวคิดเท่านั้น
9. [S9] Benedict Lewis (0x62), `@0x62/jsbsim-wasm` 1.2.4-beta.4 (npm, 2026-02-22) https://www.npmjs.com/package/@0x62/jsbsim-wasm (demo ตาม README: https://0x62.github.io/jsbsim-wasm/ ; ลิงก์ GitHub https://github.com/0x62/jsbsim-wasm ไม่มีใน metadata ของแพ็กเกจ รอบทบทวนเปิดไม่ได้ จึงยังไม่ยืนยัน) — ทุติยภูมิ (ชุมชน) · ตัวห่อ MIT (ไฟล์ LICENSE, © 2026 Benedict Lewis), .wasm และ patch LGPL-2.1 (README ส่วน License) · ลิงก์ได้ ใช้ต้องปฏิบัติตาม LGPL
10. [S10] csbrandt (ชื่อผู้ใช้ npm/GitHub), `jsbsim.js` 0.0.4 (npm, 2015-03-21) https://www.npmjs.com/package/jsbsim.js , https://github.com/csbrandt/JSBSim.js — ทุติยภูมิ · LGPL-2.1 · ลิงก์เท่านั้น
11. [S11] FlightGear wiki, *YASim* https://wiki.flightgear.org/YASim (ยืนยันข้อความ "rough approximation", นิยาม aoa/width/peak และ sfric 0.8, dfric 0.7 ในรอบทบทวน) — ทุติยภูมิ (เอกสารโครงการ) · ใบอนุญาตของเนื้อหา wiki: ผู้วิจัยระบุ GPL ตามหน้า https://wiki.flightgear.org/FlightGear_wiki:Copyrights แต่รอบทบทวนเปิดหน้านั้นไม่ได้และหน้า YASim ที่ดึงมาไม่แสดงประกาศใบอนุญาต (ยังไม่ยืนยัน) · สรุปด้วยคำของเราเองและอ้างได้ ไม่คัดลอกข้อความยาว
12. [S12] FlightGear, YASim `Airplane.cpp`, `Propeller.cpp`, `Surface.cpp`, `Wing.cpp`, `Model.cpp`, `Gear.cpp` (branch next, ดึง 2026-11-18) https://raw.githubusercontent.com/FlightGear/flightgear/next/src/FDM/YASim/Airplane.cpp และไฟล์ใน path เดียวกัน — ปฐมภูมิ · GPL-2.0-or-later (ใบอนุญาตของโครงการ FlightGear; ไฟล์ YASim ไม่มีหัวใบอนุญาตของตัวเอง) · อ้างแนวคิดและค่าคงที่ได้ ห้ามคัดลอกโค้ด
13. [S13] FlightGear, fgdata `defaults.xml` (`<model-hz type="int">120</model-hz>`) https://gitlab.com/api/v4/projects/9225950/repository/files/defaults.xml/raw?ref=next และ YASim `Integrator.cpp` (RK4: TIMESTEP 1, ½, ½, 1 และ WEIGHTS 6, 3, 3, 6) https://raw.githubusercontent.com/FlightGear/flightgear/next/src/FDM/YASim/Integrator.cpp — ปฐมภูมิ · GPL-2.0 (fgdata) / GPL-2.0-or-later (ซอร์ส) · อ้างค่าได้
14. [S14] Laminar Research, *How X-Plane Works* https://www.x-plane.com/desktop/how-x-plane-works/ — ปฐมภูมิ · proprietary (© 2026 X-Plane) · อ้างแนวคิดและตัวเลขได้ (ยืนยันข้อความ 10 ชิ้นต่อข้างและ "at least 15 times per second" ในรอบทบทวน)
15. [S15] Laminar Research, *X-Plane 12 flight model report* (หน้าไม่ระบุวันเผยแพร่แรก มีหัวข้อ "Update Sep-17, 2022"; ปรับล่าสุด 2026-04-15) https://developer.x-plane.com/article/x-plane-12-flight-model-report — ปฐมภูมิ · proprietary · อ้างแนวคิดได้
16. [S16] Laminar Research, *Airfoil Maker manual* https://developer.x-plane.com/manuals/airfoil_maker/ — ปฐมภูมิ · CC BY-SA 2.5 (ข้อความในคู่มือ "released under the Creative Commons Attribution-ShareAlike 2.5 license" ยืนยันในรอบทบทวน) · สรุปและอ้างได้โดยให้เครดิต ถ้าคัดลอกข้อความต้องใช้ CC BY-SA 2.5 กับส่วนนั้น
17. [S17] Laminar Research, *X-Plane 12 Desktop Manual* (Configuring the Rendering Options) https://x-plane.com/manuals/desktop/index.html — ปฐมภูมิ · proprietary · อ้างได้
18. [S18] Microsoft/Asobo, MSFS SDK 2020, *flight_model.cfg – [AERODYNAMICS]* https://docs.flightsimulator.com/html/Content_Configuration/SimObjects/Aircraft_SimO/flight_model/aerodynamics.htm — ปฐมภูมิ · proprietary · อ้างได้
19. [S19] Microsoft/Asobo, MSFS SDK 2020, *Defining A Flight Model* https://docs.flightsimulator.com/html/Samples_And_Tutorials/Tutorials/Defining_A_Flight_Model.htm — ปฐมภูมิ · proprietary · อ้างได้
20. [S20] Microsoft/Asobo, MSFS SDK 2020, *[AIRPLANE_GEOMETRY]* https://docs.flightsimulator.com/html/Content_Configuration/SimObjects/Aircraft_SimO/flight_model/geometry.htm — ปฐมภูมิ · proprietary · อ้างได้
21. [S21] Microsoft/Asobo, MSFS 2024 SDK, *Physics Objects Information* https://docs.flightsimulator.com/msfs2024/html/5_Content_Configuration/CFG_Files/Flight_Model/flight_model_physics_obj.htm — ปฐมภูมิ · proprietary · อ้างได้
22. [S22] Microsoft/Asobo, MSFS 2024 SDK, *Additional Flight Model Information* https://docs.flightsimulator.com/msfs2024/retail/content-configuration/cfg-files/flight-model/additional-flight-model-information/index.md — ปฐมภูมิ · proprietary · อ้างได้
23. [S23] S. Chow, "Access Global, Photorealistic Flight Simulation with GeoFS", Cesium blog, 2017-11-16 https://cesium.com/blog/2017/11/16/gefs/ — ทุติยภูมิ · ลิขสิทธิ์ Cesium · อ้างได้
24. [S24] S. Chow, "Incredible Graphics Development in CesiumJS with GeoFS", Cesium blog, 2021-12-06 https://cesium.com/blog/2021/12/06/geofs-is-a-flight-simulator-that-showcases-global-satellite/ — ทุติยภูมิ (สัมภาษณ์ผู้สร้าง) · อ้างได้
25. [S25] X. Tassin, "GeoFS Aircraft Editor", GeoFS Blog, 2017-06-15 https://blog.geo-fs.com/2017/06/geofs-aircraft-editor.html — ปฐมภูมิ (ผู้สร้าง) · อ้างได้
26. [S26] GeoFS Plugin System (ชุมชน), `@geps/geofs-types` 1.0.1 https://github.com/gpsystem/geofs-types , https://gpsystem.github.io/geofs-types/interfaces/aircraftDefinition.DefinitionBase.html — ทุติยภูมิ (แกะ API ของซอฟต์แวร์ปิด) · MIT · อ้างได้ ความเชื่อมั่นต่ำ
27. [S27] ผลค้นหา GitHub API 2026-11-18: https://github.com/vinny-palumbo/FlightSim , https://github.com/jorisfalter/opengeo-sim , https://github.com/nagoya0/webgpu-skyscape , https://github.com/dimartarmizi/web-flight-simulator — ทุติยภูมิ · ใบอนุญาตตามที่ GitHub แสดง · อ่านเฉพาะคำอธิบาย ลิงก์เท่านั้น
28. [S28] AirfieldLab `src/20-flight.js`, `src/90-app.js`, `test/harness.mjs` (commit cabf0f0) — ปฐมภูมิ (โค้ดของโครงการ) · ยังไม่มี LICENSE
29. [S29] การคำนวณของผู้วิจัย (Node 22.23.5, Python 3.13.18, jsbsim 1.3.3) ใน `scripts/s12/`: `s12_jsb_c172x.py`, `s12_oracle_js.mjs`, `s12_oracle_jsb.py`, `s12_trimhold.mjs`, `s12_current_misc.mjs`, `s12_solver_proto.mjs`, `s12_table_expected.mjs`, `s12_json.mjs`, ผล `oracle_*.json` และสคริปต์รอบทบทวนใน `scripts/s12rev/`: `rev_c172x_fixed.py`, `rev_cas.mjs`, `rev_oracle_cmp.mjs`, `rev_ths.mjs`, `rev_json.mjs` — ค่าประมาณของผู้วิจัย · ใส่ใน repo ได้ (ไม่มีโค้ด JSBSim)
30. [S30] FAA, *Pilot's Handbook of Aeronautical Knowledge* FAA-H-8083-25 (ไฟล์บทที่ 6 บนเว็บ FAA ไม่พิมพ์เลขฉบับที่ท้ายหน้า จึงยังไม่ยืนยันว่า B หรือ C), Ch. 6 Flight Controls, pp. 6-10–6-12 (Trim Tabs p. 6-10: "Placing the trim control in the full nose-down position moves the trim tab to its full up position"; Adjustable Stabilizer p. 6-12: "linkages pivot the horizontal stabilizer about its rear spar", ขับด้วย jackscrew) https://www.faa.gov/sites/faa.gov/files/08_phak_ch6.pdf — ปฐมภูมิ · US Government work (public domain) · อ้างและสรุปได้เต็มที่

## 12.14 งานที่แนะนำสำหรับ Claude Code
1. **P1 · M** สร้าง `tools/jsbsim/` (make_model.py, run_cases.py ดัดแปลงจาก `s12_oracle_jsb.py`) และ `test/fixtures/jsbsim_trainer_doublet.json` พร้อม `test/oracle.test.mjs` แบบ Node ล้วน ระบุใน README ว่าต้องใช้ `pip install jsbsim==1.3.3` เฉพาะตอน regenerate — ทดสอบ: T-S-01, T-S-02, T-S-03, T-S-05
2. **P1 · S** เพิ่ม `test/license-guard.test.mjs` ที่ grep หาไฟล์ GPL/LGPL หรือ XML ของ JSBSim ใน repo — ทดสอบ: T-S-11
3. **P1 · M** ย้าย `AC` ไปเป็น `data/aircraft/trainer.json` ตาม schema ของรอบนี้ (ทุก leaf มี v, u, scope, src, conf, est) และเพิ่ม `table1`/`table2` แบบตัดค่าขอบใน `20-flight.js` (ยังคง DOM-free) โดยต้องผ่าน T-S-01/02 ก่อนและหลังย้าย (oracle ใช้ตรวจว่าไม่มีอะไรเปลี่ยน) — ทดสอบ: T-S-07, T-S-12, T-S-02, T-S-10
4. **P1 · S** แก้ DIRECT law ให้ trim เป็นตำแหน่งพักตามสูตรหัวข้อ 12.9 สำหรับ `trim.kind = tab` (และเตรียม `ths` ที่บวกโมเมนต์ผ่าน $i_h$ โดยไม่กินระยะ elevator สำหรับรอบ 3) และให้ actuator ของทุกพื้นผิวมี rate limit + lag ที่ตั้งได้ต่อเครื่อง (เปิด PR ตามกฎของ CLAUDE.md เพราะเปลี่ยน flight model) — ทดสอบ: T-S-08, T-S-13, T-S-09, T-S-04
5. **P2 · M** เพิ่ม solver สองจุดแบบ YASim ใน `tools/` (หรือ `20-flight.js` แบบ pure) สำหรับเครื่องใหม่ในรอบถัดไป พร้อมการตรวจความสมเหตุสมผลของผล — ทดสอบ: T-S-06
6. **P2 · S** สร้าง trim เชิงตัวเลขทั่วไป (Newton บน $\dot V_N,\dot V_D,\dot q$ ของ state NED ตามต้นแบบ `s12_solver_proto.mjs` หรือ $\dot u,\dot w,\dot q$ ในแกน body ซึ่งเท่ากันเมื่อบินระดับหัวไปทิศเหนือ ปีกระดับ) แทนสูตรวิเคราะห์ใน `setApproach` เพื่อให้รองรับตารางและใบพัด — ทดสอบ: T-S-04, T-S-06
7. **P3 · S** debug view แบบ MSFS (เวกเตอร์แรงและสีตาม σ) ในโหมดนักพัฒนา — ทดสอบ: ไม่มี (ตรวจด้วยตา)
8. **P3 · L** (ไม่แนะนำตอนนี้) ทดลอง JSBSim-WASM ในสาขาแยก หลังจากเพิ่ม LICENSE และหน้าแจ้งซอร์ส LGPL — ทดสอบ: T-S-11 (ต้องเพิ่ม allowlist)
