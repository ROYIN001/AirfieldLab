import json,sys
d='docs/research/01-flight-physics/dl_in/'
def show(fn, path):
    j=json.load(open(d+fn))
    node=j
    for p in path: node=node.get(p, {})
    s=node.get('__compat',{}).get('support',{})
    out={}
    for b in ['chrome','chrome_android','edge','firefox','firefox_android','safari','safari_ios','webview_android']:
        v=s.get(b)
        if v is None: continue
        vs=v if isinstance(v,list) else [v]
        out[b]=[{k:x[k] for k in x if k in('version_added','version_removed','prefix','partial_implementation','notes','flags')} for x in vs]
    print('/'.join(path)); 
    for b,v in out.items(): print('  ',b, json.dumps(v,ensure_ascii=False)[:300])
show('bcd_Gamepad.json',['api','Gamepad'])
show('bcd_Navigator.json',['api','Navigator','getGamepads'])
show('bcd_Gamepad.json',['api','Gamepad','vibrationActuator'])
show('bcd_Gamepad.json',['api','Gamepad','hapticActuators'])
show('bcd_GamepadHapticActuator.json',['api','GamepadHapticActuator','playEffect'])
show('bcd_GamepadHapticActuator.json',['api','GamepadHapticActuator','playEffect','trigger-rumble'])
show('bcd_GamepadHapticActuator.json',['api','GamepadHapticActuator','effects'])
show('bcd_GamepadHapticActuator.json',['api','GamepadHapticActuator','canPlayEffectType'])
show('bcd_GamepadHapticActuator.json',['api','GamepadHapticActuator','pulse'])
show('bcd_pp.json',['http','headers','Permissions-Policy','gamepad'])
show('bcd_HID.json',['api','HID'])
show('bcd_Keyboard.json',['api','Keyboard','lock'])
show('bcd_Keyboard.json',['api','Keyboard','getLayoutMap'])
show('bcd_Navigator.json',['api','Navigator','vibrate'])
