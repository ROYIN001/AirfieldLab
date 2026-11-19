# lb_fg_fetch.py - fetch the FlightGear JSBSim models of topic 03 (gap 14) at pinned commits into a scratch folder
# OUTSIDE the repo and build a JSBSim root for them. The models are GPL (03.4.1, 03.9): we only run them and keep the
# numbers we measure; no XML, table or file of theirs is ever copied into docs/research/.
# Usage: python3 -I scripts/lb_fg_fetch.py [scratch_dir]   (default: $LB_FG_DIR or <tmp>/lb_fg; needs git and network
# access to github.com). Each repo is cloned shallowly with a sparse checkout of *.xml plus licence/readme files, then
# checked out at the commit listed in lb_jsb.FG_MODELS. The root gets aircraft/<model> symlinks and engine/, systems/
# symlinks to the jsbsim wheel's own folders (fallback search paths).
import os, sys, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lb_jsb
dest = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else lb_jsb.FG_DIR
root = os.path.join(dest, 'root'); os.makedirs(os.path.join(root, 'aircraft'), exist_ok=True)
def run(*a, cwd=None): return subprocess.run(a, cwd=cwd, check=True, capture_output=True, text=True).stdout.strip()
for key, m in lb_jsb.FG_MODELS.items():
    d = os.path.join(dest, m['dir'])
    if not os.path.isdir(os.path.join(d, '.git')):
        run('git', 'clone', '-q', '--filter=blob:limit=300k', '--no-checkout', f"https://github.com/{m['repo']}.git", d)
    run('git', 'sparse-checkout', 'init', '--no-cone', cwd=d)
    with open(os.path.join(d, '.git', 'info', 'sparse-checkout'), 'w') as fh: fh.write('*.xml\nCOPYING*\nLICENSE*\nREADME*\n')
    try: run('git', 'checkout', '-q', m['commit'], cwd=d)
    except subprocess.CalledProcessError:   # shallow clone without that commit: fetch it explicitly
        run('git', 'fetch', '-q', '--depth', '1', 'origin', m['commit'], cwd=d); run('git', 'checkout', '-q', m['commit'], cwd=d)
    head = run('git', 'rev-parse', 'HEAD', cwd=d)
    link = os.path.join(root, 'aircraft', m['xml'])
    if not os.path.islink(link): os.symlink(d, link)
    print(f"{key}: {m['repo']} @ {head} {'OK' if head == m['commit'] else 'MISMATCH'} -> {link}")
for sub in ('engine', 'systems'):
    link = os.path.join(root, sub)
    if not os.path.islink(link): os.symlink(os.path.join(lb_jsb.ROOT, sub), link)
print('JSBSim root:', root)
