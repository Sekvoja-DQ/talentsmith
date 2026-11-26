// Ready posts for a confirmed hotfix/patch: winners & losers image(s) in class colors + copy-ready Reddit/TikTok texts.
// Usage: node tools/posts/make-posts.js tools/posts/<yyyy-mm-dd>.json [outDir]
// Output (outDir, default tools/posts/out – not committed): card-1.png (card-2.png … when there are many rows),
//   card-N.jpg, ready-posts.html (one page, all texts with Copy buttons + the image(s) embedded).
// Rules (owner, Nov 24): only Blizzard-confirmed facts; bug fixes / exploit fixes are NEVER losers – losers are real nerfs only
//   (empty losers → "No nerfs this time"); short, human-sounding text, class by class; link https://talentsmith.app/changes.html at the end.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..'), IMG = path.join(ROOT, 'img');
const src = process.argv[2]; if (!src) { console.error('usage: node tools/posts/make-posts.js <data.json> [outDir]'); process.exit(1); }
const D = JSON.parse(fs.readFileSync(src, 'utf8'));
const OUT = path.resolve(process.argv[3] || path.join(__dirname, 'out')); fs.mkdirSync(OUT, { recursive: true });

// Site colors (index.html .tg.c-<class>, .tg.h/.a/.sky/.gen)
const COL = { warrior: '#C69B6D', paladin: '#F48CBA', hunter: '#AAD372', rogue: '#FFF468', priest: '#ffffff', shaman: '#4aa3ff',
  mage: '#3FC7EB', warlock: '#a3a4ff', druid: '#FF7C0A', horde: '#ff9a8a', alliance: '#9cc7ff', skyborne: '#9fe6d8', all: '#e9b44c', none: '#8fd39a' };
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fileUrl = p => 'file://' + p;
const icon = it => { if (!it.icon) return ''; const cands = [path.join(IMG, 'talents', it.icon + '.webp'), path.join(IMG, 'icons', it.icon + '.webp'), path.join(IMG, it.icon)];
  const f = cands.find(fs.existsSync); if (!f) console.warn('icon not found:', it.icon); return f ? `<img src="${fileUrl(f)}" alt="">` : ''; };
const row = it => `<div class="row" style="--cc:${COL[it.cls] || COL.all}">${icon(it)}<div>${it.who ? `<div class="c">${esc(it.who)}</div>` : ''}<div class="t">${esc(it.name)}</div>${it.text ? `<div class="d">${esc(it.text)}</div>` : ''}</div></div>`;

// Pack rows into pages (max 6 rows per 1080x1350 card); a section header repeats on a continued page.
const winners = D.winners || [], losers = (D.losers && D.losers.length) ? D.losers : [{ cls: 'none', name: 'No nerfs this time', text: D.noNerfsText || 'Everything else was bug fixes' }];
const items = [...winners.map(x => ['win', x]), ...losers.map(x => ['lose', x])];
const PER = 6, pages = []; for (let i = 0; i < items.length; i += PER) pages.push(items.slice(i, i + PER));
const PLAIN = !!process.env.PLAIN; // Nov 26: r/wowforever bans AI art – PLAIN=1 uses only in-game icons
const head = k => PLAIN ? `<h2>${k === 'win' ? 'Winners' : 'Losers'}</h2>` : k === 'win' ? `<h2><img src="${fileUrl(path.join(IMG, 'art/podium.webp'))}" alt="">Winners</h2>` : `<h2><img src="${fileUrl(path.join(IMG, 'art/stocks.webp'))}" alt="">Losers</h2>`;
const CSS = `*{box-sizing:border-box}html,body{margin:0}
body{width:1080px;height:1350px;overflow:hidden;background:#0b0e15 ${PLAIN ? '' : `url(${fileUrl(path.join(IMG, 'bg-horde.webp'))}) center/cover`};color:#ede4d3;font-family:"Fira Sans","Alegreya Sans",sans-serif;position:relative}
body::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,14,21,.82),rgba(11,14,21,.94) 30%,rgba(11,14,21,.97))}
.in{position:relative;padding:64px 64px 0;display:flex;flex-direction:column;gap:30px;height:100%}
.kick{font:600 26px "Fira Sans",sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#a39886}
h1{margin:6px 0 0;font:700 76px/1 "Lora","Cinzel",serif;color:#f6d68e}
h2{margin:0;font:700 34px "Lora",serif;letter-spacing:.12em;text-transform:uppercase;display:flex;align-items:center;gap:16px}
h2 img{height:64px;width:auto}.win h2{color:#8fd39a}.lose h2{color:#e8826e}
.sec{display:flex;flex-direction:column;gap:14px}
.row{display:flex;align-items:center;gap:22px;background:rgba(23,26,35,.9);border:1px solid #2c3242;border-left:6px solid var(--cc);border-radius:12px;padding:18px 22px}
.row img{width:72px;height:72px;border-radius:10px;border:2px solid var(--cc);flex:none}
.row .c{font:800 22px "Fira Sans",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--cc)}
.row .t{font:700 34px/1.15 "Fira Sans",sans-serif;color:#fff}
.row .d{font:400 27px/1.25 "Fira Sans",sans-serif;color:#cfc6b6;margin-top:2px}
.foot{margin-top:auto;padding:26px 0 40px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #2c3242;font:600 28px "Fira Sans",sans-serif;color:#a39886}
.foot b{font:700 36px "Lora",serif;color:#e9b44c;letter-spacing:.04em}`;
const cardHtml = (pg, n) => { let body = '', cur = null;
  for (const [k, it] of pg) { if (k !== cur) { if (cur) body += '</div>'; body += `<div class="sec ${k}">${head(k)}`; cur = k; } body += row(it); }
  body += '</div>';
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="in"><div><div class="kick">${esc(D.kicker || 'WoW Forever hotfix')}</div><h1>${esc(D.title)}${pages.length > 1 ? ` <span style="font-size:40px;color:#a39886">${n}/${pages.length}</span>` : ''}</h1></div>${body}<div class="foot"><span>${esc(D.footer || 'Calculator updated')}</span><b>talentsmith.app</b></div></div></body></html>`; };

(async () => {
  const { chromium } = require('playwright'); let sharp = null;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  const imgs = [];
  for (let i = 0; i < pages.length; i++) {
    const h = path.join(OUT, `card-${i + 1}.html`); fs.writeFileSync(h, cardHtml(pages[i], i + 1));
    await p.goto(fileUrl(h)); await p.waitForTimeout(400);
    const png = path.join(OUT, `card-${i + 1}.png`); await p.screenshot({ path: png });
    const jpg = await p.screenshot({ type: 'jpeg', quality: 88 }); fs.writeFileSync(path.join(OUT, `card-${i + 1}.jpg`), jpg);
    const over = await p.evaluate(() => { const f = document.querySelector('.foot').getBoundingClientRect(); const rows = [...document.querySelectorAll('.row')]; return rows.some(r => r.getBoundingClientRect().bottom > f.top); });
    if (over) console.warn(`card-${i + 1}: rows overlap the footer – shorten texts`);
    imgs.push(jpg.toString('base64'));
  }
  await b.close();
  const R = D.reddit || {};
  const card = (id, label, text, cls = '') => `<div class="card"><div class="head"><span class="label">${label}</span><button type="button" id="b-${id}" data-for="${id}">Copy</button></div><p class="txt ${cls}" id="${id}">${esc(text)}</p></div>`;
  const page = `<title>Talentsmith Ready Posts</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Alegreya+Sans:wght@400;500;700&display=swap">
<style>
/* Layout: one narrow column of copy cards for the newest confirmed hotfix; tap Copy, paste, post */
:root{--bg:#0e1016;--panel:#171a23;--line:#2b2f3c;--ink:#e9e3d6;--muted:#a39d90;--gold:#d9b25f;--gold-ink:#1a1408;--ok:#7fc08a;
  --f-display:'Cinzel',Georgia,serif;--f-body:'Alegreya Sans',system-ui,sans-serif;color-scheme:dark}
body{background:var(--bg);color:var(--ink);font:400 17px/1.5 var(--f-body);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:20px 40px}
.wrap{max-width:640px;margin:0 auto;display:flex;flex-direction:column;gap:18px}
h1{font:700 22px var(--f-display);color:var(--gold);margin:0;text-wrap:balance}
h2{font:700 16px var(--f-display);color:var(--gold);margin:8px 0 0}
.meta{color:var(--muted);font-size:15px;margin:2px 0 0}
.steps{display:flex;flex-wrap:wrap;gap:8px}
.steps a{color:var(--gold-ink);background:var(--gold);text-decoration:none;font-weight:700;padding:9px 14px;border-radius:8px;font-size:15px}
.steps a.ghost{background:transparent;color:var(--gold);border:1px solid var(--gold)}
.card{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:10px;min-width:0}
.head{display:flex;align-items:center;justify-content:space-between;gap:10px}
.label{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700}
.txt{white-space:pre-wrap;word-break:break-word;margin:0;font:400 16px/1.5 var(--f-body);color:var(--ink)}
.txt.title{font-weight:700;font-size:17px}
button{font:700 15px var(--f-body);background:var(--gold);color:var(--gold-ink);border:0;border-radius:8px;padding:9px 16px;cursor:pointer;flex:none}
button:focus-visible,.steps a:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
button.done{background:var(--ok)}
.note{color:var(--muted);font-size:14px;margin:0}
.card img{width:100%;height:auto;border-radius:6px}
</style>
<div class="wrap">
  <div><h1>Ready posts</h1><p class="meta">${esc(D.meta || '')}</p></div>
  <div class="steps"><a href="https://www.reddit.com/r/wowforever/submit" target="_blank" rel="noopener">Open r/wowforever</a><a class="ghost" href="https://talentsmith.app/changes.html" target="_blank" rel="noopener">Check the site</a></div>
  <p class="note">Flair: <b>Addons, Apps and Websites</b> · Reddit: paste the title, add the image under Images, paste the body.</p>
  <h2>Reddit</h2>
  ${card('t1', 'Title', R.title, 'title')}
  ${card('t2', 'Body', R.body)}
  <h2>Winners &amp; losers image${imgs.length > 1 ? 's' : ''}</h2>
  ${imgs.map((b64, i) => `<div class="card"><img src="data:image/jpeg;base64,${b64}" alt="${esc(D.title)} winners and losers${imgs.length > 1 ? ` ${i + 1} of ${imgs.length}` : ''}" width="1080" height="1350"></div>`).join('\n  ')}
  <p class="note">Long-press an image to save it. Reddit text can't be colored, so the class colors live in the image.</p>
  <h2>TikTok / Shorts</h2>
  ${card('t3', 'Caption', D.caption)}
</div>
<script>
document.querySelectorAll('button[data-for]').forEach(b=>{b.addEventListener('click',()=>{const el=document.getElementById(b.dataset.for);const t=el.textContent;
  const ok=()=>{b.textContent='Copied';b.classList.add('done');setTimeout(()=>{b.textContent='Copy';b.classList.remove('done')},1800)};
  const sel=()=>{const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent='Selected – copy it'};
  try{navigator.clipboard.writeText(t).then(ok,sel)}catch(e){sel()}});});
</script>
`;
  fs.writeFileSync(path.join(OUT, 'ready-posts.html'), page);
  console.log(`cards ${pages.length} · ${path.join(OUT, 'ready-posts.html')}`);
})();
