import asyncio, os
from playwright.async_api import async_playwright
from PIL import Image

URL = "http://localhost:8765/builds/shaman-enh-tank.html"
OUT = "/home/claude/talentsmith/tools/review/shots"; os.makedirs(OUT, exist_ok=True)

CSS = """
.xm-tag{display:inline-flex;align-items:center;gap:4px;font:700 11px/1 var(--f-body,Inter,sans-serif);letter-spacing:.08em;text-transform:uppercase;padding:5px 7px;border-radius:5px;border:1px solid rgba(110,200,120,.55);color:#8fe09a;background:rgba(60,140,70,.16);vertical-align:middle;margin-left:4px}
.xm-line{margin:8px 0 0;font:500 14px/1.4 var(--f-body,Inter,sans-serif);color:#8fd398}.xm-line a{color:#8fd398}
.xm-box{display:flex;gap:10px;align-items:flex-start;margin:14px 0 4px;padding:10px 12px;border-radius:10px;border:1px solid rgba(110,200,120,.35);background:rgba(40,90,50,.18);font:500 14px/1.45 var(--f-body,Inter,sans-serif);color:#cfe9d2}.xm-box b{color:#8fe09a}
.xm-ico{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:10px;border:1px solid rgba(233,180,76,.45);background:rgba(233,180,76,.08);color:#e9b44c;vertical-align:middle;margin-left:8px}
.xm-link{display:block;margin-top:10px;font:500 14px var(--f-body,Inter,sans-serif);color:#a99f8c}.xm-link b{color:#e9b44c;font-weight:600}
.xm-pill{float:right;margin-top:4px;font:600 12.5px var(--f-body,Inter,sans-serif);padding:5px 10px;border-radius:999px;border:1px solid rgba(233,180,76,.4);color:#e9b44c;background:rgba(233,180,76,.07)}
.xm-pbtn{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.04);color:#cfc6b4;margin-left:6px}
.xm-under{text-align:center;margin:8px 0 2px;font:500 13px var(--f-body,Inter,sans-serif);color:#8f8676}.xm-under b{color:#e9b44c;font-weight:600}
"""
DL = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19h14"/></svg>'
IMG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 8"/></svg>'

JS = {
 # hotfix badges
 "hf1": "document.querySelector('.tag').parentNode.insertAdjacentHTML('beforeend','<span class=\"xm-tag\" title=\"Checked after the Nov 13 hotfixes\">✓ Nov 13</span>')",
 "hf2": "document.querySelector('.split').parentNode.insertAdjacentHTML('afterend','<p class=\"xm-line\">✓ Checked after the Nov 13 hotfixes · <a href=\"#\">what changed</a></p>')",
 "hf3": "document.querySelector('main a.btn, a.btn').insertAdjacentHTML('beforebegin','<div class=\"xm-box\"><span>✓</span><span><b>Up to date</b> – checked against the Nov 13 hotfixes. <a href=\"#\" style=\"color:#8fe09a\">See the changes</a></span></div>')",
 # share image
 "si1": f"document.querySelector('main a.btn, a.btn').insertAdjacentHTML('afterend','<span class=\"xm-ico\" title=\"Save as image\">{IMG}</span>')",
 "si2": "document.querySelector('main a.btn, a.btn').insertAdjacentHTML('afterend','<a class=\"xm-link\" href=\"#\">Share it: <b>save as image</b></a>')",
 "si3": f"(document.querySelector('details.bsec > summary')).insertAdjacentHTML('beforeend',`<span class=\"xm-pill\">{IMG} Image</span>`)",
 # save video
 "sv1": f"(()=>{{const b=document.querySelector('#lvp [aria-label=\"Play\"]');const row=b.parentNode;const nx=[...row.querySelectorAll('button')].pop();nx.insertAdjacentHTML('afterend',`<span class=\"xm-pbtn\" title=\"Save as video\">{DL}</span>`);}})()",
 "sv2": "document.querySelector('#order p').insertAdjacentHTML('beforeend',' <a href=\"#\" style=\"color:#e9b44c;white-space:nowrap\">Save as video ⤓</a>')",
 "sv3": f"document.querySelector('#order > summary').insertAdjacentHTML('beforeend',`<span class=\"xm-pill\">{DL} Video</span>`)",
}

async def shoot(pg, key, ver, dev):
    await pg.goto(URL); await pg.wait_for_timeout(700)
    await pg.add_style_tag(content=CSS)
    if ver == "opt": await pg.evaluate(JS[key])
    await pg.wait_for_timeout(200)
    if key.startswith("sv"):
        r = await pg.evaluate("(()=>{const o=document.querySelector('#order').getBoundingClientRect(),l=document.querySelector('#lvp').getBoundingClientRect(),ne=document.querySelector('#lvp').nextElementSibling,n=ne?ne.getBoundingClientRect():l;return [o.top+scrollY,l.bottom+scrollY,n.bottom+scrollY]})()")
        q = await pg.evaluate("(()=>{let c=document.querySelector('#lvp [aria-label=\\\"Play\\\"]');while(c&&!c.querySelector('input[type=range],[role=slider],.seek')) c=c.parentNode;const r=c.getBoundingClientRect();return [r.top+scrollY,r.bottom+scrollY]})()")
        if key in ("sv2","sv3"): clip = {"x": 0, "y": r[0] - 10, "width": pg.viewport_size["width"], "height": 420}
        else: clip = {"x": 0, "y": q[0] - 150, "width": pg.viewport_size["width"], "height": q[1] - q[0] + 215}
    else:
        clip = {"x": 0, "y": 100, "width": pg.viewport_size["width"], "height": 640 if dev == "m" else 560}
    path = f"/tmp/{key}-{ver}-{dev}.png"
    await pg.screenshot(path=path, clip=clip, full_page=True)
    im = Image.open(path).convert("RGB")
    im.save(f"{OUT}/{key}-{ver}-{dev}.webp", quality=82)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for dev, vp, dsf in [("d", {"width": 1280, "height": 900}, 1), ("m", {"width": 390, "height": 844}, 2)]:
            pg = await b.new_page(viewport=vp, device_scale_factor=dsf)
            await pg.route("**/*", lambda r: r.abort() if not r.request.url.startswith("http://localhost") else r.continue_())
            for key in [k for k in JS if k.startswith('sv')]:
                for ver in ("opt", "now"):
                    await shoot(pg, key, ver, dev)
        await b.close()
asyncio.run(main())
print(sorted(os.listdir(OUT)))
