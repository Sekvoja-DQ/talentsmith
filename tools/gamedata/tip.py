import re,sys
sys.path.insert(0,'/home/claude/gd')
from load import rows
from collections import defaultdict
SP={r['ID']:r for r in rows('Spell')}
EF=defaultdict(dict)
for r in rows('SpellEffect'):
    if r['DifficultyID']=='0': EF[r['SpellID']][int(r['EffectIndex'])]=r
MISC={r['SpellID']:r for r in rows('SpellMisc') if r['DifficultyID']=='0'}
DUR={r['ID']:r for r in rows('SpellDuration')}
CD={r['SpellID']:r for r in rows('SpellCooldowns') if r['DifficultyID']=='0'}
def num(x):
    x=float(x); return int(x) if x==int(x) else round(x,2)
def val(sid,k,kind='s'):
    e=EF.get(sid,{}).get(k-1)
    if not e: return '?'
    if kind in 's m': return num(abs(float(e['EffectBasePointsF'])))
    if kind=='t': return num(int(e['EffectAuraPeriod'])/1000)
    if kind=='a': return e['EffectRadiusIndex']
    if kind=='o':
        d=dur(sid); p=int(e['EffectAuraPeriod']) or 1
        return num(abs(float(e['EffectBasePointsF']))*(d*1000//p)) if d else '?'
    return '?'
def dur(sid):
    m=MISC.get(sid); 
    if not m: return None
    d=DUR.get(m.get('DurationIndex','0'))
    return int(d['Duration'])/1000 if d else None
def tip(sid):
    s=SP.get(sid,{}).get('Description_lang','')
    def rep(m):
        ext,op,kind,k=m.group(1),m.group(2),m.group(3),m.group(4)
        sid2=ext or sid
        if kind=='d':
            d=dur(sid2); return (f'{num(d)} sec' if d and d<60 else f'{num(d/60)} min') if d else '?'
        v=val(sid2,int(k or 1),kind)
        if op and v!='?':
            o,n=op[0],float(op[1:]); v=num(v/n if o=='/' else v*n)
        return str(v)
    s=re.sub(r'\$(?:\{[^}]*\})?','$',s) if False else s
    s=re.sub(r'\$(\d+)?([/*]\d+;)?([smtoda])(\d)?', lambda m: rep(type('M',(),{'group':lambda self,i:[None,m.group(1),(m.group(2) or '')[:-1] or None,m.group(3),m.group(4)][i]})()), s)
    return s
