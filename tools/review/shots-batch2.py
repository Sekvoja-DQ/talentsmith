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
 dict(n=5,title="Smaller hero",what="The logo shrinks to about half the screen height (whole logo still visible, nothing cropped), so the Horde / Alliance buttons and the race picker show without scrolling.",
  css=".hero picture img{width:auto;max-width:100%;height:46vh;min-height:260px}@media (max-width:640px){.hero picture img{height:40vh;min-height:220px}}",js="",cap="view"),
 dict(n=6,title="Less gold",what="Gold only where it matters. The nine calculator cards get a dark stone look with a thin gold top edge (full gold on hover), and the selected spec / content buttons become gold outlines with a small gem instead of solid gold. The best-pick card keeps its gold.",
  css=".calc-grid .calc-card{border-color:var(--edge);background:linear-gradient(180deg,#1b1d25,#13161e);box-shadow:inset 0 2px 0 rgba(233,180,76,.5)}.calc-grid .calc-card img{box-shadow:0 0 0 1px rgba(233,180,76,.55),0 0 0 3px rgba(0,0,0,.55)}"
      ".chip[aria-pressed=\"true\"]{color:var(--gold-soft);background:linear-gradient(180deg,rgba(233,180,76,.18),rgba(233,180,76,.05));border-color:var(--gold);box-shadow:0 0 12px rgba(233,180,76,.16)}.chip[aria-pressed=\"true\"]::before{content:\"\";display:inline-block;width:6px;height:6px;margin-right:8px;transform:rotate(45deg);background:var(--gold-soft);box-shadow:0 0 6px var(--ember);vertical-align:2px}",
  js="",cap=[".step-lbl",".picks"],cap2=[".calc-grid"]),
 dict(n=7,title="Race cards: live values only",what="The patch-history lines (“Oct 26: 5% → 10%”, “Blizzard's Oct 26 post…”, “Post and hotfix data disagree”) go, like in the calculator. Each racial shows only what it does now, and the hero says “live value” instead of “launch value”.",
  css=".chg{display:none!important}",js='''document.querySelectorAll(".racial p").forEach(p=>{if(/Blizzard's Oct 26 post/.test(p.textContent)) p.textContent="+15% movement speed, castable while moving. At an elemental convergence you also become Charged, which doubles it. Charged is kept through death and removed on entering a raid.";});document.querySelectorAll(".hero .lede").forEach(l=>l.textContent=l.textContent.replace("current launch value","live value"));''',cap="races"),
 dict(n=8,title="Shorter home page",what="The race list shows only the faction you picked above (it follows the Horde / Alliance buttons), and each racial shows just its name until you tap it. The home page goes from about %NOW% to %OPT% pixels tall on a computer.",
  css="#races{width:100%;max-width:1120px;margin-left:auto;margin-right:auto}.racial p{display:none}.racial>div>b{cursor:pointer}.racial>div>b::after{content:\" ▸\";color:var(--muted);font-weight:400}.racial{padding-top:8px}",
  js='''const f=(document.querySelector(".classes[data-fac]")||{}).dataset?.fac||"horde";document.querySelectorAll(".race").forEach(r=>{if(!(r.getAttribute("style")||"").includes(f)) r.style.display="none";});''',cap="races",height=True),
 dict(n=9,title="Same menu on every page",what="The home page gets the slim top menu the other pages already have (Classes, Calculator, Builds, Changes, Race picker, Ko-fi). The Ko-fi corner button moves into it, and the hero keeps just two buttons: Find your race and Talent calculator.",
  css=NAV_CSS,js=NAV_JS,cap="view"),
 dict(n=10,title="Frames on the best pick and the selected class",what="Your corner pieces on two more places: the best-pick card gets two corners (iron for Horde, gold for Alliance, following the faction you picked), and the selected class button gets small gold corner brackets. Nothing else gets frames.",
  css='''.pick.r0::before,.pick.r0::after{content:"";position:absolute;width:40px;height:52px;background:url(img/fx/gold-corner.webp) center/contain no-repeat;pointer-events:none}.pick.r0::before{top:3px;right:3px}.pick.r0::after{bottom:3px;left:3px;transform:scale(-1,-1)}
#picker:has(.classes[data-fac="horde"]) .pick.r0::before,#picker:has(.classes[data-fac="horde"]) .pick.r0::after{background-image:url(img/fx/iron-corner.webp)}
#picker:has(.classes[data-fac="horde"]) .pick.r0{border-color:rgba(210,72,60,.65)}
.cls-btn{position:relative}.cls-btn[aria-pressed="true"]::before,.cls-btn[aria-pressed="true"]::after{content:"";position:absolute;width:11px;height:11px;border:2px solid var(--gold-soft);pointer-events:none;filter:drop-shadow(0 0 3px rgba(233,180,76,.6))}
.cls-btn[aria-pressed="true"]::before{top:4px;left:4px;border-right:0;border-bottom:0}.cls-btn[aria-pressed="true"]::after{bottom:4px;right:4px;border-left:0;border-top:0}''',js="",cap=[".classes",".picks"]),
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
                im.save(f"/home/claude/work/review/shots/b2-{p['n']}-{v}-{dev}.webp",quality=74,method=6)
                pg.close()
    b.close()
for p in P:
    if p.get('height'): p['what']=p['what'].replace('%NOW%',f"{round(heights['now'],-2):,}").replace('%OPT%',f"{round(heights['opt'],-2):,}")
json.dump([{k:p[k] for k in ['n','title','what']} for p in P],open('/home/claude/work/review/batch2.json','w'),ensure_ascii=False,indent=1)
print(heights)
