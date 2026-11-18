# Second tightening pass: drop descriptive list leaves from JSON, compress two paragraphs.
import sys,re,json
p=sys.argv[1]; L=open(p,encoding='utf8').read().split('\n')
def setline(prefix,new):
    idx=[i for i,l in enumerate(L) if l.startswith(prefix)]
    assert len(idx)==1,(prefix,idx); L[idx[0]]=new
def dropline(prefix):
    idx=[i for i,l in enumerate(L) if l.startswith(prefix)]
    assert len(idx)==1,(prefix,idx); del L[idx[0]]
for k in ['   "actuatorFeatures"','   "propellerTables"','   "solverUnknowns"','   "wingSegmentLength"']: dropline(k)
setline('**4) solver สองจุดแบบ YASim (P2)**', '**4) solver สองจุดแบบ YASim (P2)** สำหรับเครื่องใหม่ที่มีแค่ตัวเลข POH ให้ตรึง derivative ที่หาจากเรขาคณิต ($C_{L\\alpha}$, $C_{m\\alpha}$, $C_{m\\delta_e}$ จากหัวข้อ 1) แล้วแก้ offset ด้วย Newton จากสมการสมดุลที่จุดเป้า (บินระดับ ใช้ `deriv` คำนวณความเร่ง N, D และ $\\dot q$):')
setline('และอีกสามตัว $[C_{D,flap}', 'และอีกสามตัว $[C_{D,flap}+C_{D,gear},\\,C_{L,flap},\\,C_{m,flap}]$ จากจุด approach ต้นแบบ `s12_solver_proto.mjs` ใช้จุด cruise ของโมเดลปัจจุบัน (5,000 ft, throttle 0.75, 240.36 KTAS, α −1.194°, δe +2.989°) เริ่มจาก $C_{D0}$ 0.03, $C_{L0}$ 0.4, $C_{m0}$ 0 แล้ว Newton กลับมาได้ 0.024, 0.25, 0.045 ตรงค่าใน `AC` (round trip) กับเครื่องจริง เป้าต้องเป็นตัวเลขที่มีแหล่ง (cruise ที่กำลังกำหนด, Vs0/Vs1, อัตราไต่) และต้องตรวจว่าผลมีความหมายทางกายภาพ ($C_{D0}>0$, δe ไม่ชนขีด) แบบที่ YASim ตรวจ [S12]')
setline('fixture ขนาดราว', 'fixture ราว 30 KB ต่อกรณี สร้างใหม่เฉพาะเมื่อ EOM หรือโครงสร้างข้อมูลเปลี่ยน CI ไม่ต้องมี Python เพราะการทดสอบ Node อ่าน fixture อย่างเดียว')
s='\n'.join(L)
j=json.loads(re.search(r'```json\n([\s\S]*?)```',s).group(1))
open(p,'w',encoding='utf8').write(s); print(len(s.encode()))
