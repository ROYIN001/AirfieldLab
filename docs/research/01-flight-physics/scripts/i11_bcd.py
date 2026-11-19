import json,sys
def show(path, keys):
    d=json.load(open(path))
    def walk(node, name):
        for k,v in node.items():
            if k=='__compat':
                if any(x in name for x in keys):
                    s=v.get('support',{})
                    out=[]
                    for b in ['chrome','chrome_android','edge','firefox','firefox_android','safari','safari_ios']:
                        e=s.get(b)
                        if e is None: continue
                        if isinstance(e,list):
                            es=e
                        else: es=[e]
                        parts=[]
                        for e in es[:2]:
                            if isinstance(e,str): parts.append(e); continue
                            parts.append(f"{e.get('version_added')}{'(flag)' if e.get('flags') else ''}{'(prefix)' if e.get('prefix') else ''}{'(alt)' if e.get('alternative_name') else ''}{'-'+str(e.get('version_removed')) if e.get('version_removed') else ''}{' partial' if e.get('partial_implementation') else ''}")
                        out.append(b+':'+'/'.join(parts))
                    st=v.get('status',{})
                    print(name, '|', ' '.join(out), '|', 'std' if st.get('standard_track') else '', 'exp' if st.get('experimental') else '', 'depr' if st.get('deprecated') else '')
            elif isinstance(v,dict):
                walk(v, name+'.'+k)
    walk(d,'')
show(sys.argv[1], sys.argv[2].split(','))
