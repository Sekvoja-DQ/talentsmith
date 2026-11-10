"""Diff two DBCache.bin snapshots: which records changed, decoded where possible.
usage: python3 hotdiff.py OLD.bin NEW.bin > diff.json"""
import sys,json,os
sys.path.insert(0,'/home/claude/gd')
from dbc import read,sh
from hotx import decode
names={}
for f in os.listdir('/home/claude/gd/wdb/definitions'):
    if f.endswith('.dbd'): names[sh(f[:-4])]=f[:-4]
def state(p):
    _,_,R=read(p); S={}
    for r in sorted(R,key=lambda r:r['push']): S[(r['table'],r['id'])]=(r['status'],r['data'])
    return S
A,B=state(sys.argv[1]),state(sys.argv[2])
out=[]
for k in sorted(set(A)|set(B)):
    if A.get(k)==B.get(k): continue
    t=names.get(k[0],hex(k[0])); rec=dict(table=t,id=k[1])
    for tag,S in (('old',A),('new',B)):
        v=S.get(k)
        if not v: rec[tag]=None; continue
        st,data=v
        if st!=1: rec[tag]={'_status':st}; continue
        try: rec[tag]=decode(t,data)[0]
        except Exception as e: rec[tag]={'_raw':data.hex()[:200]}
    if rec.get('old') and rec.get('new') and isinstance(rec['old'],dict) and isinstance(rec['new'],dict):
        rec['changed']={f:[rec['old'].get(f),rec['new'].get(f)] for f in set(rec['old'])|set(rec['new']) if rec['old'].get(f)!=rec['new'].get(f)}
    out.append(rec)
json.dump(out,sys.stdout,indent=1,default=str)
