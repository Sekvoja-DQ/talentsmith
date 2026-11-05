const fs=require('fs'),vm=require('vm'),path=require('path');
const SITE=process.env.SITE||'https://talentsmith.app/';
const R=path.resolve(__dirname,'..')+'/';
const calc=fs.readFileSync(R+'calculator.html','utf8'), idx=fs.readFileSync(R+'index.html','utf8');
const ctx={};vm.createContext(ctx);
let s=calc.slice(calc.indexOf('const PALADIN='),calc.indexOf('const SOON='));
vm.runInContext(s.replace(/\bconst (\w+)=/g,'var $1=')+';var CCL=CLASSES;',ctx);
let t=idx.slice(idx.indexOf('const H="horde"'),idx.indexOf('const byId='));
vm.runInContext(t.replace(/\bconst (\w+)=/g,'var $1=')+';',ctx);
{const a=calc.indexOf('const TICON=');vm.runInContext(calc.slice(a,calc.indexOf('\n',a)).replace('const ','var '),ctx);}
const BUILDS=require('./builds.js');ctx.CLASSES=ctx.CCL;
const slug=n=>n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const esc=x=>String(x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const icon=(c,n)=>c==='paladin'&&ctx.TICON[n]?ctx.TICON[n]:c+'-'+slug(n);
const ORDER=['warrior','paladin','hunter','rogue','priest','shaman','mage','warlock','druid'];
// ---- validate + expand builds
const out=[];
for(const [c,id,name,kind,blurb,list] of BUILDS){
  const trees=ctx.CLASSES[c].trees, pts=trees.map(tr=>tr.t.map(()=>0)), seq=[];
  const tot=()=>pts.flat().reduce((a,b)=>a+b,0);
  for(const [ti,tn,n] of list){const i=trees[ti].t.findIndex(x=>x[0]===tn); if(i<0) throw `${id}: no talent ${tn}`;
    for(let k=0;k<n;k++){const x=trees[ti].t[i];
      const above=trees[ti].t.reduce((a,y,j)=>a+(y[2]<x[2]?pts[ti][j]:0),0);
      if(pts[ti][i]>=x[1]) throw `${id}: ${tn} over max`;
      if(above<(x[2]-1)*5) throw `${id}: ${tn} row ${x[2]} needs ${(x[2]-1)*5}, has ${above}`;
      if(x[4]){const r=trees[ti].t.findIndex(y=>y[0]===x[4]); if(pts[ti][r]<trees[ti].t[r][1]) throw `${id}: ${tn} needs ${x[4]} maxed`;}
      pts[ti][i]++; seq.push({lvl:tot()+9,ti,tn,rank:pts[ti][i],max:x[1]});}}
  if(tot()!==51) throw `${id}: total ${tot()}`;
  const code=pts.map(p=>p.join('').replace(/0+$/,'')).join('-');
  const ALPH='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',off=trees.map((_,k)=>trees.slice(0,k).reduce((a,tr)=>a+tr.t.length,0));
  const ord=seq.map(x=>ALPH[off[x.ti]+trees[x.ti].t.findIndex(y=>y[0]===x.tn)]).join('');
  out.push({c,id,name,kind,blurb,seq,pts,code,ord,split:pts.map(p=>p.reduce((a,b)=>a+b,0))});}
console.log('builds OK',out.length);
// ---- shared shell
const CSS=`:root{color-scheme:dark;--night:#0b0e15;--deep:#11151f;--plate:#171c28;--plate-2:#1f2533;--edge:#2c3242;--gold:#e9b44c;--gold-soft:#f6d68e;--ember:#ff7a2f;--ink:#ede4d3;--muted:#a39886;--horde:#d2483c;--alliance:#4c82db;--f-display:"Cinzel",Georgia,serif;--f-body:"Alegreya Sans",system-ui,sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--night);color:var(--ink);font:17px/1.55 var(--f-body);background-image:radial-gradient(1000px 500px at 50% -10%,rgba(255,122,47,.10),transparent 60%)}
a{color:var(--gold)}.gut{padding-left:max(16px,env(safe-area-inset-left));padding-right:max(16px,env(safe-area-inset-right))}.wrap{max-width:1000px;margin:0 auto}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-block:14px;border-bottom:1px solid var(--edge)}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--gold-soft);font:800 18px/1 var(--f-display);letter-spacing:.06em}.brand img{width:34px;height:34px;border-radius:50%}
.top nav{display:flex;gap:14px;font-size:15px;flex-wrap:wrap}.top nav a{color:var(--muted);text-decoration:none}.top nav a:hover{color:var(--gold)}
.crumb{font-size:14px;color:var(--muted);margin:16px 0 0}.crumb a{color:var(--muted)}
h1{font:800 clamp(26px,5vw,38px)/1.1 var(--f-display);margin:10px 0 8px;color:var(--gold-soft);text-wrap:balance;display:flex;align-items:center;gap:12px}h1 img{width:44px;height:44px;border-radius:8px}
h2{font:800 clamp(20px,3.6vw,26px)/1.15 var(--f-display);color:var(--gold-soft);margin:34px 0 12px}
.lede{color:var(--muted);max-width:70ch;margin:0 0 8px}
.card{background:linear-gradient(180deg,var(--plate-2),var(--plate));border:1px solid var(--edge);border-radius:10px;padding:16px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr));gap:12px}
.tbl{overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid var(--edge);border-radius:10px}
table{border-collapse:collapse;width:100%;min-width:520px;font-size:15.5px}th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--edge);vertical-align:top}th{font:700 12px/1.2 var(--f-display);letter-spacing:.1em;text-transform:uppercase;color:var(--muted);background:var(--deep);position:sticky;top:0}
tr:last-child td{border-bottom:0}td.n{font-variant-numeric:tabular-nums;color:var(--muted);white-space:nowrap}
.ti{display:inline-flex;align-items:center;gap:8px}.ti img{width:26px;height:26px;border-radius:5px;border:1px solid #4a5163;flex:none}
.btn{display:inline-flex;align-items:center;gap:8px;font:700 14px/1 var(--f-display);letter-spacing:.05em;text-decoration:none;padding:12px 16px;border-radius:6px;border:1px solid var(--gold);color:#24170a;background:linear-gradient(180deg,var(--gold-soft),var(--gold) 55%,#b9822e)}
.btn.ghost{background:rgba(233,180,76,.06);color:var(--gold)}
.tag{display:inline-block;font:700 11px/1 var(--f-display);letter-spacing:.12em;text-transform:uppercase;padding:4px 7px;border-radius:4px;background:#3a2316;color:var(--ember)}.tag.lv{background:#22351f;color:#8fdc8c}
.split{font-variant-numeric:tabular-nums;color:var(--muted)}.split b{color:var(--ink)}
.old{color:var(--muted);font-size:14.5px}.new{font-size:15.5px}
.pill{display:inline-block;padding:2px 8px;border-radius:999px;font-size:13px;border:1px solid var(--edge);color:var(--muted);margin-left:6px}
.h{color:var(--horde)}.a{color:var(--alliance)}
footer{border-top:1px solid var(--edge);margin-top:40px;padding-block:22px 36px;color:var(--muted);font-size:14px;text-align:center}
.lvl-row td:first-child{width:70px}
@media (max-width:640px){.top{flex-wrap:wrap}.top nav{width:100%;flex-wrap:nowrap;overflow-x:auto;white-space:nowrap;gap:18px;padding-bottom:2px}}`;
const FONTS='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Alegreya+Sans:wght@400;500;700&display=swap">';
function page(rel,title,desc,body,canon){const p=rel?'../':'';return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${SITE}${canon}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="${SITE}img/og.jpg"><meta name="theme-color" content="#0b0e15">
<link rel="icon" type="image/png" href="${p}favicon.png">${FONTS}<style>${CSS}</style></head><body>
<div class="gut"><div class="wrap"><header class="top"><a class="brand" href="${p}./"><img src="${p}img/avatar.webp" alt="">Talentsmith</a>
<nav><a href="${p}classes/">Classes</a><a href="${p}calculator.html">Calculator</a><a href="${p}changes.html">Launch changes</a><a href="${p}./#picker">Race picker</a><a href="https://ko-fi.com/bigdforever" rel="noopener">Ko-fi</a></nav></header>
${body}</div></div>
<footer class="gut"><div class="wrap"><p><a href="https://ko-fi.com/bigdforever" rel="noopener">Support Talentsmith on Ko-fi</a> – it keeps new builds and calculators coming.</p>
<p>Fan-made, not affiliated with Blizzard Entertainment. Builds and race picks are our opinion, made from the launch talent trees in Blizzard's Nov 2 development notes.</p>
<p style="font-size:12px;opacity:.8">World of Warcraft, Warcraft and Blizzard Entertainment are trademarks or registered trademarks of Blizzard Entertainment, Inc. in the U.S. and/or other countries. Game icons © Blizzard Entertainment, Inc.</p></div></footer></body></html>`;}
const ti=(c,n,p='../')=>`<span class="ti"><img src="${p}img/talents/${icon(c,n)}.webp" alt="" width="26" height="26" loading="lazy">${esc(n)}</span>`;
const calcUrl=(b,p='../')=>`${p}calculator.html?c=${b.c}&b=${b.code}&o=${b.ord}&v=hot`;
// race picks
function bestRaces(cls,b){const C=ctx.CCL[cls].name;const res={};
  for(const fac of ['horde','alliance']){res[fac]={};for(const [k] of ctx.CTX){
    const list=ctx.RACES.filter(r=>r.fac===fac&&r.cls.some(x=>x.replace('*','')===C)).map(r=>ctx.scoreRace(r,C,b,k)).sort((a,z)=>z.total-a.total);
    res[fac][k]=list[0]?list[0].race.name:'–';}}return res;}
const urls=['','calculator.html','changes.html','classes/'];
fs.mkdirSync(R+'classes',{recursive:true});fs.mkdirSync(R+'builds',{recursive:true});
// ---- build pages
for(const b of out){const C=ctx.CLASSES[b.c],trees=C.trees;
  const rows=b.seq.map(x=>`<tr class="lvl-row"><td class="n">${x.lvl}</td><td>${ti(b.c,x.tn)} <span class="pill">${x.rank}/${x.max}</span></td><td class="n">${trees[x.ti].name}</td></tr>`).join('');
  const picked=trees.map((tr,i)=>tr.t.map((x,j)=>[x,b.pts[i][j]]).filter(([,p])=>p>0).map(([x,p])=>`<li>${ti(b.c,x[0])} <span class="pill">${p}/${x[1]}</span></li>`).join('')).map((h,i)=>h?`<div class="card"><h3 style="margin:0 0 8px;font:800 17px var(--f-display);color:var(--gold-soft)">${trees[i].name} · ${b.split[i]}</h3><ul style="list-style:none;margin:0;padding:0;display:grid;gap:6px">${h}</ul></div>`:'').join('');
  const others=out.filter(o=>o.c===b.c&&o.id!==b.id).map(o=>`<a href="${o.c}-${o.id}.html">${esc(o.name)}</a>`).join(' · ');
  const body=`<p class="crumb"><a href="../classes/">Classes</a> › <a href="../classes/${b.c}.html">${C.name}</a> › Build</p>
<h1><img src="../img/icons/class-${b.c}.webp" alt="">${esc(C.name)} – ${esc(b.name)}</h1>
<p><span class="tag ${b.kind==='Leveling'?'lv':''}">${b.kind}</span> <span class="split">Split <b>${b.split.join(' / ')}</b> (${trees.map(t=>t.name).join(' / ')})</span></p>
<p class="lede">${esc(b.blurb)} Values from the launch trees (Blizzard's Nov 2 notes).</p>
<p><a class="btn" href="${calcUrl(b)}">Open in calculator</a></p>
<h2>Talents in this build</h2><div class="grid">${picked}</div>
<h2>Leveling order</h2><p class="lede">One talent point per level from 10 to 60. Follow it top to bottom.</p>
<div class="tbl"><table><thead><tr><th>Level</th><th>Talent</th><th>Tree</th></tr></thead><tbody>${rows}</tbody></table></div>
${others?`<p style="margin-top:20px">Other ${C.name} builds: ${others}</p>`:''}
<p class="old" style="margin-top:14px">This is a starter build – our pick, not the only good one. Change anything in the calculator and share your own link.</p>`;
  const fn=`builds/${b.c}-${b.id}.html`;urls.push(fn);
  fs.writeFileSync(R+fn,page(true,`${C.name} ${b.name} Build – WoW Forever | Talentsmith`,`WoW Forever ${C.name} ${b.name.toLowerCase()} talent build (${b.split.join('/')}) with a level-by-level talent order from 10 to 60 and a calculator link.`,body,fn));}
// ---- class pages
const cards=[];
for(const c of ORDER){const C=ctx.CLASSES[c],Cn=C.name,trees=C.trees;
  const specs=ctx.BUILDS[Cn].map(b=>{const r=bestRaces(c,b);return `<tr><td><b>${esc(b.name)}</b></td>${ctx.CTX.map(([k])=>`<td><span class="h">${esc(r.horde[k])}</span><br><span class="a">${esc(r.alliance[k])}</span></td>`).join('')}</tr>`;}).join('');
  const bl=out.filter(b=>b.c===c).map(b=>`<a class="card" style="text-decoration:none;color:var(--ink);display:block" href="../builds/${c}-${b.id}.html"><span class="tag ${b.kind==='Leveling'?'lv':''}">${b.kind}</span><h3 style="margin:8px 0 4px;font:800 19px var(--f-display);color:var(--gold-soft)">${esc(b.name)}</h3><p style="margin:0;color:#d8cfbf">${esc(b.blurb)}</p><p class="split" style="margin:8px 0 0">Split <b>${b.split.join(' / ')}</b> · level-by-level order →</p></a>`).join('');
  const ch=trees.flatMap(tr=>tr.t.filter(x=>x[7]).map(x=>`<tr><td>${ti(c,x[0])}</td><td class="n">${tr.name}</td><td class="new">${esc(x[6]||x[5])}</td></tr>`)).join('');
  const body=`<p class="crumb"><a href="./">Classes</a> › ${Cn}</p><h1><img src="../img/icons/class-${c}.webp" alt="">${Cn} in WoW Forever</h1>
<p class="lede">${esc(C.lede)}</p><p><a class="btn" href="../calculator.html?c=${c}">${Cn} talent calculator</a> <a class="btn ghost" href="../?class=${Cn}#picker">Race picker</a></p>
<h2>Starter builds</h2><div class="grid">${bl}</div>
<h2>Best race for each ${Cn} spec</h2><p class="lede">Top-scoring race from our racial scores: <span class="h">Horde</span> first, <span class="a">Alliance</span> below. Open the race picker for the full ranking and why.</p>
<div class="tbl"><table><thead><tr><th>Spec</th>${ctx.CTX.map(([,n])=>`<th>${n}</th>`).join('')}</tr></thead><tbody>${specs}</tbody></table></div>
<h2>${Cn} talents changed for launch</h2>${ch?`<div class="tbl"><table><thead><tr><th>Talent</th><th>Tree</th><th>Now</th></tr></thead><tbody>${ch}</tbody></table></div>`:`<p class="lede">No ${Cn} talents changed for launch.</p>`}`;
  const fn=`classes/${c}.html`;urls.push(fn);
  fs.writeFileSync(R+fn,page(true,`${Cn} Guide – Best Race, Builds & Talents | WoW Forever | Talentsmith`,`WoW Forever ${Cn}: best race for every spec, starter talent builds with leveling order, and every talent changed for launch.`,body,fn));
  cards.push(`<a class="card" style="text-decoration:none;color:var(--ink);display:flex;gap:12px;align-items:center" href="${c}.html"><img src="../img/icons/class-${c}.webp" alt="" width="40" height="40" style="border-radius:8px"><span><b style="color:var(--gold-soft);font-family:var(--f-display)">${Cn}</b><br><span style="color:var(--muted);font-size:15px">Best race · ${out.filter(b=>b.c===c).length} builds · hotfix changes</span></span></a>`);}
fs.writeFileSync(R+'classes/index.html',page(true,'WoW Forever Class Guides – Best Race & Builds | Talentsmith','Every WoW Forever class: best race per spec, starter talent builds with level-by-level order, and every talent changed for launch.',`<h1>Class guides</h1><p class="lede">Pick a class for its best races, starter builds and hotfix changes.</p><div class="grid">${cards.join('')}</div>`,'classes/'));
// ---- changes page
const sec=ORDER.map(c=>{const C=ctx.CLASSES[c];const rows=C.trees.flatMap(tr=>tr.t.filter(x=>x[7]).map(x=>`<tr><td>${ti(c,x[0],'')}</td><td class="n">${tr.name}</td><td><div class="new">${esc(x[6]||x[5])}</div>${x[6]?`<div class="old">Beta: ${esc(x[5])}</div>`:''}</td></tr>`)).join('');
  return `<h2 id="${c}"><a href="classes/${c}.html" style="color:inherit;text-decoration:none">${C.name}</a></h2>${rows?`<div class="tbl"><table><thead><tr><th>Talent</th><th>Tree</th><th>Change</th></tr></thead><tbody>${rows}</tbody></table></div>`:`<p class="lede">No talent changes for launch.</p>`}`;}).join('');
const log=idx.slice(idx.indexOf('<ol class="log">'),idx.indexOf('</ol>')+5).replace('<ol class="log">','<ol style="padding-left:20px;display:grid;gap:12px">').replace(/<time>/g,'<b style="color:var(--gold)">').replace(/<\/time>/g,'</b>');
fs.writeFileSync(R+'changes.html',page(false,'WoW Forever Launch Talent Changes & Hotfix Tracker | Talentsmith','Every WoW Forever talent changed for launch in Blizzard\'s Nov 2 notes and the Oct 30 hotfix, class by class, with beta and launch values side by side, plus racial changes.',
`<h1>Launch talent changes</h1><p class="lede">Every talent that changed between the October beta and launch, with the beta value under it, plus all racial changes since mid-October. Values follow <a href="https://us.forums.blizzard.com/en/wow/t/2360696" rel="noopener">Blizzard\'s development notes (updated Nov 2)</a>, which also confirm the Oct 30 hotfix changes first found in the game data by foreverchanges.pro. All of it is confirmed in the launch game data (build 1.60.1.70790, Nov 4).</p>
<p>${ORDER.map(c=>`<a href="#${c}">${ctx.CLASSES[c].name}</a>`).join(' · ')} · <a href="#racials">Racials</a></p>${sec}<h2 id="racials">Racial changes</h2>${log}`,'changes.html'));
// ---- sitemap/robots
const today='2026-11-02';
fs.writeFileSync(R+'sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(R+'robots.txt',`User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
console.log('pages',urls.length);
