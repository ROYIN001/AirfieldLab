# Tighten sec-12 text: replace whole lines by line prefix; prints new size.
import sys,re
p=sys.argv[1]; L=open(p,encoding='utf8').read().split('\n')
def setline(prefix,new):
    idx=[i for i,l in enumerate(L) if l.startswith(prefix)]
    assert len(idx)==1,(prefix,idx); L[idx[0]]=new
def dropline(prefix):
    idx=[i for i,l in enumerate(L) if l.startswith(prefix)]
    assert len(idx)==1,(prefix,idx); del L[idx[0]]
setline('- ซิมทุกตัวที่ศึกษา', '- ซิมทุกตัวที่ศึกษา **แยกนิยามเครื่องบินออกจากโค้ด** (JSBSim: XML + ตารางที่ตัดค่าขอบ [S3]; YASim: เรขาคณิต + solver สองจุด [S12]; X-Plane และ MSFS: เรขาคณิต + airfoil แบ่งชิ้น [S14, S19]) แต่ AirfieldLab ผูกเครื่องฝึกลำเดียวไว้ใน `AC` (src/20-flight.js:100–118) ต้องแยกก่อนเพิ่ม C172S, DA40/DA42 และเครื่องบินโดยสาร')
setline('- **สิ่งที่โค้ดปัจจุบันขาดหร', '- **สิ่งที่โค้ดปัจจุบันขาดหรือผิดเมื่อเทียบ:** แรงขับเป็น throttle × $T_0V_c/\\sqrt{V^2+V_c^2}$ ไม่มี $C_T(J)$, $C_P(J)$, แรงบิด หรือ P-factor แบบ JSBSim, YASim, X-Plane [S4, S12, S14] และ DIRECT law บวก trim เข้า `c.de` แล้วตัดที่ขีด elevator (src/20-flight.js:468) วัดได้ว่า trim −5° ดันคันสุดได้แค่ +10° แทน +15° ซึ่งไม่ตรงทั้ง trim tab (ตำแหน่งพัก, X-Plane 12 [S15]) และ stabilizer trim (โมเมนต์บวกเพิ่ม, MSFS [S20]) ยังไม่มี trim เชิงตัวเลขแบบ `FGTrim`')
setline('- JSBSim มีรุ่น WebAssembly', '- JSBSim มีรุ่น WebAssembly แล้ว (`@0x62/jsbsim-wasm` .wasm 1.59 MB, LGPL-2.1 [S9]) แต่ **ยังไม่แนะนำในหน้าเว็บจริง** เพราะภาระ LGPL, XML เครื่องบินของ JSBSim เป็น GPL หรือไม่ระบุใบอนุญาต และ repo ยังไม่มี LICENSE GeoFS ปิดซอร์สและใช้แรงขับคงที่ [S26] เอามาได้แค่แนวคิด "parts" และโครงการตั้งค่าอินพุต')
# merge integrator rows in 12.1
setline('| เหมือนบรรทัดบน แต่ JSBSim ค่าตั้งต้น', '| JSBSim integrator ตั้งต้น 240 Hz / ตั้งต้น 120 Hz (แบบ FlightGear) / AB3 1200 Hz | θ 0.041° / 0.083° / 0.008°, φ 0.096° / 0.19° / 0.018°, h 0.012 / 0.026 / 0.006 m | ผลต่างลดเมื่อ JSBSim ใช้ integrator อันดับสูงขึ้นหรือ dt เล็กลง จึงมาจากฝั่ง JSBSim |')
dropline('| เหมือนบรรทัดบน แต่ JSBSim 120 Hz')
dropline('| JSBSim AB3 1200 Hz')
setline('ข้อสังเกต: ผลต่างกับ JSBSim', 'ข้อสังเกต: aileron doublet และ rudder pulse สร้าง β และ r จึงตรวจเครื่องหมาย $I_{xz}$ และทิศแรงเมื่อมี sideslip ไปด้วย ส่วน 240 KTAS ที่ throttle 75% สูงเกินเครื่องฝึก turboprop ทั่วไป เป็นผลของแบบจำลองแรงขับ ไม่ใช่ EOM (ดูหัวข้อ 3–4)')
setline('**การป้อนคำสั่ง** YASim', '**การป้อนคำสั่ง** YASim ผูก property ด้วย `<control-input>` และจำกัดอัตราด้วย `<control-speed>` [S11] ส่วนแป้นพิมพ์ของ FlightGear เพิ่มมุมทีละขั้นต่อการกดและไม่คืนศูนย์ (รายละเอียดในหัวข้อ 11)')
setline('| vinny-palumbo/FlightSim', '| vinny-palumbo/FlightSim, jorisfalter/opengeo-sim, nagoya0/webgpu-skyscape (2026) | ตัวอย่างที่ใช้ JSBSim WASM | ไม่ระบุ / ไม่ระบุ / MIT (ตาม GitHub) | อ่านแค่คำอธิบาย ไม่ได้ตรวจโค้ด [S27] |')
dropline('ผู้วิจัยพยายามรัน `@0x62/jsbsim-wasm`')
open(p,'w',encoding='utf8').write('\n'.join(L))
s='\n'.join(L); s=re.sub(r'\n{3,}','\n\n',s); open(p,'w',encoding='utf8').write(s)
print(len(s.encode()))
