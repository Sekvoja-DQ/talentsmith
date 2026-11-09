import struct
H=[0x486E26EE,0xDCAA16B3,0xE1918EEF,0x202DAFDB,0x341C7DC7,0x1C365303,0x40EF2D37,0x65FD5E49,0xD6057177,0x904ECE93,0x1C38024F,0x98FD323B,0xE3061AE7,0xA39B0FA1,0x9797F25F,0xE4444563]
def sh(s):
    seed=0x7FED7FED; shift=0xEEEEEEEE
    for ch in s.upper():
        c=ord(ch)
        seed=((H[c>>4]-H[c&0xF])&0xFFFFFFFF)^((shift+seed)&0xFFFFFFFF)
        shift=(c+seed+33*shift+3)&0xFFFFFFFF
    return seed if seed else 1
def read(path="/mnt/user-data/uploads/World of Warcraft/_forever_/Cache/ADB/enUS/DBCache.bin"):
    b=open(path,'rb').read()
    magic,ver,build=struct.unpack_from('<4sII',b,0)
    off=12+32
    out=[]
    while off+4<=len(b):
        if b[off:off+4]!=b'XFTH': break
        mg,push,uniq,x,th,rid,size,status=struct.unpack_from('<4siIIIIIB',b,off)
        off+=32
        data=b[off:off+size]; off+=size
        out.append(dict(push=push,table=th,id=rid,status=status,data=data))
    return ver,build,out
