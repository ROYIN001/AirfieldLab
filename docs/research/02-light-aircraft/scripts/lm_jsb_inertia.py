# lm_jsb_inertia.py — total inertia (structure + point masses + fuel) and weight that JSBSim 1.3.3's bundled models
# fly with at their default loading, for lm_inertia.mjs REF. Numbers we measure by running the model are ours.
# usage: python3 -I scripts/lm_jsb_inertia.py  -> writes scripts/out/lm_jsb_inertia.json (pure JSON) and prints it.
# (review 2026-11-18: JSBSim prints a start-up banner on stdout, so the JSON is now written to the file directly
#  instead of redirecting stdout, which had left the banner at the top of the .json file)
import json, os, jsbsim
out = {}
for ac in ['c172p', 'c172r', 'c172x', 'pa28', 'c310', 'pc7', 't6texan2']:
    try:
        f = jsbsim.FGFDMExec(None); f.set_debug_level(0)
        if not f.load_model(ac): continue
        f['ic/h-sl-ft'] = 1000; f['ic/vc-kts'] = 0; f.run_ic()
        g = lambda p: f.get_property_value(p)
        out[ac] = {k: round(g(p), 2) for k, p in [('W_lb', 'inertia/weight-lbs'), ('empty_lb', 'inertia/empty-weight-lbs'),
                   ('Ixx', 'inertia/ixx-slugs_ft2'), ('Iyy', 'inertia/iyy-slugs_ft2'), ('Izz', 'inertia/izz-slugs_ft2'), ('Ixz', 'inertia/ixz-slugs_ft2'),
                   ('S_ft2', 'metrics/Sw-sqft'), ('b_ft', 'metrics/bw-ft'), ('cbar_ft', 'metrics/cbarw-ft')]}
    except Exception as e:
        out[ac] = {'error': str(e)}
dst = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out', 'lm_jsb_inertia.json')
with open(dst, 'w') as fh:
    fh.write(json.dumps(out, indent=1) + '\n')
print(json.dumps(out, indent=1))
