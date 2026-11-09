from dbc import *
import struct
_,_,R=read()
FMT={'TraitNode':('<IIiiBII',['ID','TraitTreeID','PosX','PosY','Type','Flags','TraitSubTreeID']),
     'TraitEdge':('<IIIIB',['ID','VisualStyle','LeftTraitNodeID','RightTraitNodeID','Type']),
     'TraitNodeEntry':('<IIIBI',['ID','TraitDefinitionID','MaxRanks','NodeEntryType','TraitSubTreeID']),
     'TraitNodeXTraitNodeEntry':('<IIII',['ID','TraitNodeID','TraitNodeEntryID','Index']),
     'TraitNodeGroupXTraitNode':('<IIII',['ID','TraitNodeGroupID','TraitNodeID','Index']),
     'TraitDefinitionEffectPoints':('<IIIii',['ID','TraitDefinitionID','EffectIndex','OperationType','CurveID'])}
def hot(t):
    """returns {id: row-dict or None(deleted)} final state by push order"""
    rr=sorted([r for r in R if r['table']==sh(t)],key=lambda r:r['push'])
    out={}
    for r in rr:
        if r['status']==1:
            f,names=FMT[t]
            if struct.calcsize(f)!=len(r['data']): out[str(r['id'])]=('?',r['data']);continue
            out[str(r['id'])]={k:str(v) for k,v in zip(names,struct.unpack(f,r['data']))}
        elif r['status']==2: out[str(r['id'])]=None
    return out
