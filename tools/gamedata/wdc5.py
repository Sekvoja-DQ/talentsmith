import struct
def read(path):
    b=open(path,'rb').read();assert b[:4]==b'WDC5'
    off=136
    (rc,fc,rs,sts,th,lh,minid,maxid,loc,flags,idx,tfc,bpo,lcc,fsis,cds,pds,sc)=struct.unpack_from('<IIIIIIIIIHHIIIIIII',b,off);off+=68
    secs=[]
    for _ in range(sc):
        secs.append(struct.unpack_from('<QIIIIIIII',b,off));off+=40
    fstruct=[struct.unpack_from('<hH',b,off+4*i) for i in range(tfc)];off+=4*tfc
    fsi=[struct.unpack_from('<HHIIIII',b,off+24*i) for i in range(fsis//24)];off+=fsis
    pallet=b[off:off+pds];off+=pds
    common=b[off:off+cds];off+=cds
    poff=[];p=0
    for f in fsi:
        poff.append(p)
        if f[3] in(3,4): p+=f[2]
    rows=[]
    for (tk,fo,src,sst,ore,ids,rels,omc,ctc) in secs:
        if src==0: continue
        o=fo;recs=b[o:o+src*rs];o+=src*rs+sst
        idl=list(struct.unpack_from('<%dI'%(ids//4),b,o)) if ids else None;o+=ids
        cp=[struct.unpack_from('<II',b,o+8*i) for i in range(ctc)];o+=8*ctc
        o+=omc*6 if False else 0
        rel={}
        if rels:
            n,_,_=struct.unpack_from('<III',b,o);q=o+12
            for i in range(n):
                fid,ri=struct.unpack_from('<II',b,q+8*i);rel[ri]=fid
        if tk and not any(recs[:64]): continue
        for r in range(src):
            raw=int.from_bytes(recs[r*rs:(r+1)*rs]+b'\0'*8,'little')
            vals=[]
            for fi,f in enumerate(fsi):
                bo,bs,ads,st,a,bb,c=f
                if st in(1,5): v=(raw>>bo)&((1<<bs)-1)
                elif st==3:
                    ix=(raw>>bo)&((1<<bs)-1);v=struct.unpack_from('<I',pallet,poff[fi]+ix*4)[0]
                elif st==0:
                    v=int.from_bytes(recs[r*rs+bo//8:r*rs+bo//8+bs//8],'little')
                else: v=None
                vals.append(v)
            rows.append((idl[r] if idl else None,vals,rel.get(r)))
    return rows,fsi
