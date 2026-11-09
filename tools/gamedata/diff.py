from trait import *
import json
S=json.load(open('site.json'))
SPEC_ORDER={}  # map game spec col group -> site tree index by name overlap
rep={}
for tid,c in CLS.items():
    nodes=tree(tid)
    xs=sorted(set(n['x'] for n in nodes))
    # split into groups by gaps >1000
    groups=[[xs[0]]]
    for x in xs[1:]:
        (groups[-1].append(x) if x-groups[-1][-1]<=1000 else groups.append([x]))
    byid={n['id']:n for n in nodes}
    G=[]
    for g in groups:
        base=g[0]
        gn=[n for n in nodes if n['x'] in g]
        # base col: min x of group might not be col1; use overall pattern: col=(x-base)/600+1
        G.append((base,gn))
    rep[c]=[]
    site=S[c]
    for ti,(base,gn) in enumerate(G):
        names={e['name'] for n in gn for e in n['ents']}
        # match site tree by overlap
        best=max(range(len(site)),key=lambda k:len(names&{t['name'] for t in site[k]['t']}))
        st={t['name']:t for t in site[best]['t']}
        gt={}
        for n in gn:
            if not n['ents']: continue
            e=n['ents'][0]
            pre=[byid[p]['ents'][0]['name'] for p,_ in n['pre'] if p in byid and byid[p]['ents']]
            gt[e['name']]=dict(ranks=e['ranks'],row=(n['y']-2130)//600+1,col=(n['x']-base)//600+1,pre=pre,spell=e['spell'],nents=len(n['ents']),flags=n['flags'],y=n['y'])
        rep[c].append((site[best]['name'],gt,st))
json.dump({c:[(a,b,{k:v for k,v in s.items()}) for a,b,s in v] for c,v in rep.items()},open('cmp.json','w'))
