import sys;sys.path.insert(0,'/home/claude/gd')
from load import rows
from collections import defaultdict
SN={r['ID']:r['Name_lang'] for r in rows('SpellName')}
N={r['ID']:r for r in rows('TraitNode')}
E_={r['ID']:r for r in rows('TraitNodeEntry')}
D={r['ID']:r for r in rows('TraitDefinition')}
NXE=defaultdict(list)
for r in rows('TraitNodeXTraitNodeEntry'): NXE[r['TraitNodeID']].append(r['TraitNodeEntryID'])
EDGE=defaultdict(list)
for r in rows('TraitEdge'): EDGE[r['RightTraitNodeID']].append((r['LeftTraitNodeID'],r['Type']))
GXN=defaultdict(list); NXG=defaultdict(list)
for r in rows('TraitNodeGroupXTraitNode'): GXN[r['TraitNodeGroupID']].append(r['TraitNodeID']); NXG[r['TraitNodeID']].append(r['TraitNodeGroupID'])
COND={r['ID']:r for r in rows('TraitCond')}
GXC=defaultdict(list)
for r in rows('TraitNodeGroupXTraitCond'): GXC[r['TraitNodeGroupID']].append(COND[r['TraitCondID']])
CLS={'1112':'mage','1089':'druid','1091':'hunter','1100':'paladin','1114':'priest','1111':'rogue','1082':'shaman','1116':'warlock','1117':'warrior'}
def tree(tid):
    out=[]
    for nid,n in N.items():
        if n['TraitTreeID']!=tid: continue
        ents=[]
        for eid in NXE[nid]:
            e=E_[eid]; d=D.get(e['TraitDefinitionID'],{})
            sp=d.get('SpellID','0'); nm=d.get('OverrideName_lang') or SN.get(sp,'?')
            ents.append(dict(eid=eid,def_=e['TraitDefinitionID'],ranks=int(e['MaxRanks']),spell=sp,name=nm))
        conds=[]
        for g in NXG[nid]:
            for c in GXC[g]: conds.append((g,c['SpentAmountRequired'],c['TraitCurrencyID'],c['CondType'],c['TraitNodeGroupID']))
        out.append(dict(id=nid,x=int(n['PosX']),y=int(n['PosY']),type=n['Type'],flags=n['Flags'],ents=ents,pre=EDGE.get(nid,[]),groups=NXG[nid],conds=conds))
    return sorted(out,key=lambda a:(a['x'],a['y']))
