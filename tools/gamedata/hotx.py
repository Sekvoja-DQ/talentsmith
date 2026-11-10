"""Generic DBCache hotfix decoder using WoWDBDefs layouts (build 1.60.1)."""
import re,struct
from dbc import read,sh
BUILD='1.60.1.70862'
def _inrange(spec,b):
    v=lambda x:tuple(int(p) for p in x.split('.'))
    for part in spec.split(','):
        part=part.strip()
        if '-' in part:
            a,z=part.split('-'); 
            if v(a)<=v(b)<=v(z): return True
        elif part==b: return True
    return False
def layout(t):
    s=open(f'/home/claude/gd/wdb/definitions/{t}.dbd').read()
    head,_,rest=s.partition('\n\n')
    types={}
    for l in head.splitlines()[1:]:
        m=re.match(r'(\w+)(<[^>]*>)?\s+(\w+)',l.strip())
        if m: types[m.group(3).rstrip('?')]=m.group(1)
    for blk in rest.split('\n\n'):
        L=blk.strip().splitlines()
        if any(l.startswith('BUILD') and _inrange(l[6:],BUILD) for l in L):
            return types,[l for l in L if not l.startswith(('BUILD','LAYOUT','COMMENT'))]
    raise KeyError(t)
def decode(t,data):
    types,cols=layout(t); off=0; out={}
    for c in cols:
        ni='$noninline' in c
        name=re.sub(r'^\$[^$]*\$','',c)
        m=re.match(r'(\w+)(?:<(u?)(\d+)>)?(?:\[(\d+)\])?',name)
        n,us,bits,arr=m.group(1),m.group(2),m.group(3),m.group(4)
        if ni and 'id' in c.split('$')[1].split(','): continue
        ty=types.get(n,'int'); cnt=int(arr or 1); vals=[]
        for _ in range(cnt):
            if ty in ('string','locstring'):
                e=data.index(b'\0',off); vals.append(data[off:e].decode('utf8','replace')); off=e+1
            elif ty=='float': vals.append(round(struct.unpack_from('<f',data,off)[0],4)); off+=4
            else:
                b=int(bits or 32)//8; fmt={1:'b',2:'h',4:'i',8:'q'}[b]; fmt=fmt.upper() if us else fmt
                vals.append(struct.unpack_from('<'+fmt,data,off)[0]); off+=b
        out[n]=vals[0] if cnt==1 else vals
    return out,off
def table_rows(t,path=None):
    _,_,R=read(path) if path else read()
    h=sh(t); res={}
    for r in sorted([r for r in R if r['table']==h],key=lambda r:r['push']):
        if r['status']==1:
            try: d,used=decode(t,r['data']); d['_ok']=used==len(r['data']); res[r['id']]=d
            except Exception as e: res[r['id']]={'_err':str(e)}
        elif r['status']==2: res[r['id']]=None
    return res
