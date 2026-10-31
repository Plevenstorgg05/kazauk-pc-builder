import re, math, sys
src=open('lib/animation/choreography.ts').read()
blocks=re.findall(r'id: "(\w+)",\s*size: \[([^\]]+)\],\s*assembled: \[([^\]]+)\],\s*exploded: \[([^\]]+)\],(?:\s*explodedRotation: \[([^\]]+)\],)?',src)
f=lambda t:[float(x) for x in t.split(',')]
SIZE={};ASM={};EXP={};ROT={}
for n,s,a,e,r in blocks:
    SIZE[n]=f(s);ASM[n]=f(a);EXP[n]=f(e);ROT[n]=f(r) if r else [0,0,0]
STAGING_X=2.3
STAGED={"CASE_GLASS_PANEL","COOLER","CPU","RAM_01","RAM_02","GPU","SSD","PSU"}
SEQ=[("removeCooler",["COOLER"]),("removeCPU",["CPU"]),("removeRAM",["RAM_01","RAM_02"]),
     ("removeGPU",["GPU"]),("removeSSD",["SSD"]),("removePSU",["PSU"]),
     ("removeMotherboard",["MOTHERBOARD","CASE_CHASSIS"])]
w,h,d=SIZE["CASE_CHASSIS"]; t=0.07
PANELS={"floor":([w,t,d],[0,-h/2,0]),"ceiling":([w,t,d],[0,h/2,0]),
        "back":([w,h,t],[0,0,-d/2]),"farside":([t,h,d],[-w/2,0,0]),
        # detail added with the procedural chassis
        "psu_shroud":([w-0.16,0.06,2.9],[0,-1.15,-0.55]),
        "front_panel":([w-0.14,h-0.2,0.04],[0,0,d/2-0.09]),
        "fan_lo":([0.92,0.92,0.16],[0,-1.05,d/2-0.28]),
        "fan_mid":([0.92,0.92,0.16],[0,0.0,d/2-0.28]),
        "fan_hi":([0.92,0.92,0.16],[0,1.05,d/2-0.28]),
        "rail_a":([0.11,h,0.11],[ (w/2-0.13),0, (d/2-0.13)]),
        "rail_b":([0.11,h,0.11],[ (w/2-0.13),0,-(d/2-0.13)]),
        "rail_c":([0.11,h,0.11],[-(w/2-0.13),0, (d/2-0.13)]),
        "rail_d":([0.11,h,0.11],[-(w/2-0.13),0,-(d/2-0.13)])}
TOL=0.004

def rotmat(r):
    cx,sx=math.cos(r[0]),math.sin(r[0]); cy,sy=math.cos(r[1]),math.sin(r[1]); cz,sz=math.cos(r[2]),math.sin(r[2])
    return [[cy*cz, -cy*sz, sy],
            [sx*sy*cz+cx*sz, -sx*sy*sz+cx*cz, -sx*cy],
            [-cx*sy*cz+sx*sz, cx*sy*sz+sx*cz, cx*cy]]
def aabb(size,pos,rot):
    """Conservative AABB of a rotated box."""
    m=rotmat(rot); hx,hy,hz=[s/2 for s in size]
    ext=[abs(m[i][0])*hx+abs(m[i][1])*hy+abs(m[i][2])*hz for i in range(3)]
    return [(pos[i]-ext[i], pos[i]+ext[i]) for i in range(3)]
def ov(a,b):
    o=[min(a[i][1],b[i][1])-max(a[i][0],b[i][0]) for i in range(3)]
    return (min(o)>TOL), min(o)
def lerp(a,b,u): return [a[i]+(b[i]-a[i])*u for i in range(3)]

def colliders(name,pos,rot):
    """Chassis is an open frame: 4 panels, never a solid block."""
    if name=="CASE_CHASSIS":
        return [aabb(ps,[pp[j]+pos[j] for j in range(3)],rot) for ps,pp in PANELS.values()]
    return [aabb(SIZE[name],pos,rot)]

def legs(name):
    if name in STAGED:
        st=[STAGING_X,ASM[name][1],ASM[name][2]]
        return [(ASM[name],st),(st,EXP[name])]
    return [(ASM[name],EXP[name])]

def run(label, order, direction):
    # glass panel is already removed before any component comes out
    state={n:("exploded" if n=="CASE_GLASS_PANEL" else ("assembled" if direction=="out" else "exploded")) for n in SIZE}
    if direction=="in": state["CASE_GLASS_PANEL"]="exploded"
    hits={}
    for stage,parts in order:
        L=max(len(legs(p)) for p in parts)
        for li in range(L):
            for k in range(81):
                u=k/80
                pos={};rot={}
                for n in SIZE:
                    if n in parts:
                        lg=legs(n)
                        if direction=="in": lg=[(b,a) for a,b in reversed(lg)]
                        if li < len(lg):
                            a,b=lg[li]; pos[n]=lerp(a,b,u)
                        else: pos[n]= EXP[n] if direction=="out" else ASM[n]
                        # match the implementation: rotation happens only on the
                        # outer leg, in open air outside the chassis
                        nl=len(lg)
                        if direction=="out":
                            f = u if (nl==1 or li==nl-1) else 0.0
                        else:
                            f = (1-u) if (nl==1 or li==0) else 0.0
                        rot[n]=[c*f for c in ROT[n]]
                    else:
                        ex = state[n]=="exploded"
                        pos[n]=EXP[n] if ex else ASM[n]
                        rot[n]=ROT[n] if ex else [0,0,0]
                for mover in parts:
                    for mb in colliders(mover,pos[mover],rot[mover]):
                        for other in SIZE:
                            if other==mover: continue
                            if other in parts and other<mover: continue
                            for pi,obx in enumerate(colliders(other,pos[other],rot[other])):
                                c,o=ov(mb,obx)
                                if c:
                                    lbl=other if other!="CASE_CHASSIS" else f"chassis.{list(PANELS)[pi]}"
                                    key=(mover,lbl,stage)
                                    hits[key]=max(hits.get(key,0),o)
        for p in parts: state[p]= "exploded" if direction=="out" else "assembled"
    print(f"\n=== {label} ===")
    if hits:
        for (a,b,s),dep in sorted(hits.items(),key=lambda x:-x[1]):
            print(f"  COLLISION {a:16} <-> {b:18} during {s:20} {dep*100:.0f}mm")
    else:
        print("  none")
    return len(hits)

n1=run("DISASSEMBLY", SEQ, "out")
n2=run("REASSEMBLY", list(reversed(SEQ)), "in")
print(f"\nTOTAL: {n1+n2}")
sys.exit(0 if n1+n2==0 else 1)
