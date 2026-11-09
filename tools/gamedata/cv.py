import sys,re,json;sys.path.insert(0,'/home/claude/gd')
from trait import *
from tip import tip,EF
from load import rows
from collections import defaultdict
CP=defaultdict(list)
for r in rows('CurvePoint'): CP[r['CurveID']].append(r)
def curve(cid):
    pts=sorted(CP[cid],key=lambda p:int(p['OrderIndex']))
    return [(float(p['Pos'].split(',')[0]),float(p['Pos'].split(',')[1])) for p in pts]
TDE=defaultdict(dict)
for r in rows('TraitDefinitionEffectPoints'): TDE[r['TraitDefinitionID']][int(r['EffectIndex'])]=curve(r['CurveID'])
S=json.load(open('site.json'))
def nums(s): return [float(x) for x in re.findall(r'(?<![\w$])(\d+(?:\.\d+)?)',s.replace('–',' '))]
def fmt(v): v=abs(v); return int(v) if v==int(v) else round(v,2)
out=[]
for tid,c in CLS.items():
    st={t['name']:t for tr in S[c] for t in tr['t']}
    for n in tree(tid):
        if not n['ents'] or n['y']>6000 or n['x']>20000: continue
        e=n['ents'][0]; s=st.get(e['name'])
        if not s or e['def_'] not in TDE: continue
        R=e['ranks']; sn=nums(s['txt'])
        effs=[]
        for ei,pts in sorted(TDE[e['def_']].items()):
            vals=[fmt(v) for r,v in pts if 1<=r<=R]
            # include display transforms: ms->sec, /10 etc
            mx=vals[-1] if vals else None
            cand={mx}
            if isinstance(mx,(int,float)):
                cand|={fmt(mx/1000),fmt(mx/60000),fmt(mx/10),fmt(mx/100) ,fmt(mx/60)}
            ok=any(x in sn for x in cand)
            seq_site=re.findall(r'\((\d+(?:\.\d+)?(?:\s*/\s*\d+(?:\.\d+)?)+)%?\)',s['txt'])
            effs.append(dict(ei=ei,vals=vals,ok=ok,eff=EF.get(e['spell'],{}).get(ei,{}).get('EffectAura')))
        bad=[x for x in effs if not x['ok']]
        out.append(dict(cls=c,name=e['name'],ranks=R,effs=effs,bad=len(bad),site=s['txt'],game=tip(e['spell'])))
json.dump(out,open('cv.json','w'),indent=0)
from collections import Counter
print(Counter((o['cls'],o['bad']>0) for o in out))
