import json, io
from playwright.sync_api import sync_playwright
from PIL import Image
SITE='file:///home/claude/talentsmith/index.html'
NAV_CSS='''.ts-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 0;border-bottom:1px solid var(--edge);max-width:1120px;margin:0 auto}
.ts-top .brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--gold-soft);font:800 18px/1 var(--f-display);letter-spacing:.06em}.ts-top .brand img{width:34px;height:34px;border-radius:50%}
.ts-top nav{display:flex;gap:14px;font-size:15px;flex-wrap:wrap}.ts-top nav a{color:var(--muted);text-decoration:none}
@media (max-width:640px){.ts-top{flex-wrap:wrap}.ts-top nav{width:100%;flex-wrap:nowrap;overflow-x:auto;white-space:nowrap;gap:18px}}
.kofi-corner{display:none!important}.hero .cta a[href="classes/"]{display:none}'''
NAV_JS='''const d=document.createElement("div");d.className="gut";d.innerHTML='<header class="ts-top"><a class="brand" href="./"><img src="img/avatar.webp" alt="">Talentsmith</a><nav><a href="classes/">Classes</a><a href="calculator.html">Calculator</a><a href="builds/">Builds</a><a href="changes.html">Changes</a><a href="#picker">Race picker</a><a href="#">Ko-fi</a></nav></header>';document.body.prepend(d);'''
P=[
 dict(n=11,title="Race list: details folded, one button to open them",what="The race list stays exactly as it is now (all races, with the All races / Horde / Alliance buttons). A new “Show details” button sits next to them: the page opens with every racial folded to its name, and one tap shows or hides all descriptions. Your rework of proposal 8.",
  css="#races{width:100%;max-width:1120px;margin-left:auto;margin-right:auto}.rf-det{margin-left:auto}.racial p{display:none}.racial{padding-top:8px}",
  js='''const row=document.querySelector("#races .chips")||document.querySelector("#races [data-show]")?.parentElement;if(row){row.style.display="flex";row.style.flexWrap="wrap";row.style.alignItems="center";const b=document.createElement("button");b.type="button";b.className="chip rf-det";b.setAttribute("aria-pressed","false");b.textContent="Show details ▾";row.appendChild(b);}''',cap="races"),
]
def region(pg,sels):
    boxes=[pg.query_selector(s).bounding_box() for s in sels]
    x=0;y=min(b['y'] for b in boxes)-12;bot=max(b['y']+b['height'] for b in boxes)+12;return y,bot
def shoot(pg,p,dev):
    W=pg.viewport_size['width']
    if p['cap']=="view":
        pg.evaluate("window.scrollTo(0,0)");pg.wait_for_timeout(400);return Image.open(io.BytesIO(pg.screenshot()))
    full=Image.open(io.BytesIO(pg.screenshot(full_page=True)))
    s=pg.evaluate("window.devicePixelRatio")
    def crop(sels,maxh=None):
        y,bot=region(pg,sels);
        if maxh: bot=min(bot,y+maxh)
        return full.crop((0,int(max(0,y)*s),int(W*s),int(bot*s)))
    if p['cap']=="races":
        y=pg.query_selector("#races, .races").bounding_box()['y'];bh=1100 if dev=='d' else 1300
        return full.crop((0,int((y-70)*s),int(W*s),int((y+bh)*s)))
    im=crop(p['cap'])
    if p.get('cap2'):
        im2=crop(p['cap2']);out=Image.new('RGB',(im.width,im.height+im2.height+int(16*s)),(11,14,21));out.paste(im,(0,0));out.paste(im2,(0,im.height+int(16*s)));im=out
    return im
heights={}
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for dev,vp,sc in [('d',{'width':1280,'height':800},1),('m',{'width':390,'height':844},2)]:
        for p in P:
            for v in ['now','opt']:
                pg=b.new_page(viewport=vp,device_scale_factor=sc)
                pg.goto(SITE);pg.evaluate("document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager')");pg.wait_for_timeout(1500)
                if v=='opt':
                    pg.add_style_tag(content=p['css'])
                    if p['js']: pg.evaluate(p['js'])
                    pg.wait_for_timeout(500)
                if p.get('height') and dev=='d': heights[v]=pg.evaluate("document.documentElement.scrollHeight")
                im=shoot(pg,p,dev).convert('RGB')
                maxw=1100 if dev=='d' else 780
                if im.width>maxw: im=im.resize((maxw,round(im.height*maxw/im.width)),Image.LANCZOS)
                im.save(f"/home/claude/work/review/shots/b3-{p['n']}-{v}-{dev}.webp",quality=74,method=6)
                pg.close()
    b.close()
for p in P:
    if p.get('height'): p['what']=p['what'].replace('%NOW%',f"{round(heights['now'],-2):,}").replace('%OPT%',f"{round(heights['opt'],-2):,}")
json.dump([{k:p[k] for k in ['n','title','what']} for p in P],open('/home/claude/work/review/batch3.json','w'),ensure_ascii=False,indent=1)
print(heights)
