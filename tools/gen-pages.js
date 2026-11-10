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
for(const [c,id,name,kind,blurb,list,group='meta'] of BUILDS){
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
  out.push({c,id,name,kind,blurb,group,seq,pts,code,ord,split:pts.map(p=>p.reduce((a,b)=>a+b,0))});}
console.log('builds OK',out.length);
// ---- shared shell
const CSS=`:root{color-scheme:dark;--night:#0b0e15;--deep:#11151f;--plate:#171c28;--plate-2:#1f2533;--edge:#2c3242;--gold:#e9b44c;--gold-soft:#f6d68e;--ember:#ff7a2f;--ink:#ede4d3;--muted:#a39886;--horde:#d2483c;--alliance:#4c82db;--f-display:"Cinzel",Georgia,serif;--f-body:"Alegreya Sans",system-ui,sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--night);color:var(--ink);font:17px/1.55 var(--f-body);background-image:radial-gradient(1000px 500px at 50% -10%,rgba(255,122,47,.10),transparent 60%)}
a{color:var(--gold)}.gut{padding-left:max(16px,env(safe-area-inset-left));padding-right:max(16px,env(safe-area-inset-right))}.wrap{max-width:1000px;margin:0 auto}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-block:14px;border-bottom:1px solid var(--edge)}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--gold-soft);font:800 18px/1 var(--f-display);letter-spacing:.06em}.brand img{width:34px;height:34px;border-radius:50%}
.top nav{display:flex;gap:14px;font-size:15px;flex-wrap:wrap}.top nav a{color:var(--muted);text-decoration:none}.top nav a:hover{color:var(--gold)}.top{justify-content:flex-start}.top nav{align-items:center;margin-left:auto}.nbs{display:flex;gap:10px;align-items:center}.nb{text-decoration:none;display:inline-flex;align-items:center;gap:6px;padding:2px 9px 2px 3px;margin:-3px 0;font-size:13px;border:1px solid var(--edge);border-radius:999px;color:var(--ink)!important;line-height:1.2}.nb img{width:16px;height:16px;border-radius:50%;flex:none}.nb:hover{border-color:var(--gold);color:var(--gold-soft)!important}@media (max-width:640px){.top nav .dsk{display:none}}@media (max-width:359px){header.top nav{font-size:12.5px;gap:4px}}
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
.tag.off{background:#3a2216;color:var(--ember);border:1px solid rgba(255,122,47,.45)}.tag.meta{background:#1d2b36;color:#8fc4e8}
.cols2{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:18px;align-items:start}.cols2>div>h3{font:800 20px/1.1 var(--f-display);margin:0 0 10px;display:flex;align-items:center;gap:8px}.cols2 .stack{display:grid;gap:10px}
.tag{display:inline-block;font:700 11px/1 var(--f-display);letter-spacing:.12em;text-transform:uppercase;padding:4px 7px;border-radius:4px;background:#3a2316;color:var(--ember)}.tag.lv{background:#22351f;color:#8fdc8c}
.split{font-variant-numeric:tabular-nums;color:var(--muted)}.split b{color:var(--ink)}
.old{color:var(--muted);font-size:14.5px}.new{font-size:15.5px}
.pill{display:inline-block;padding:2px 8px;border-radius:999px;font-size:13px;border:1px solid var(--edge);color:var(--muted);margin-left:6px}
.h{color:var(--horde)}.a{color:var(--alliance)}
footer{border-top:1px solid var(--edge);margin-top:40px;padding-block:22px 36px;color:var(--muted);font-size:14px;text-align:center}
.lvl-row td:first-child{width:70px}
table.races{width:auto;min-width:0}table.races th,table.races td{padding-right:28px;white-space:nowrap}
@media (max-width:640px){.top{flex-wrap:wrap}.top nav{width:100%;flex-wrap:nowrap;justify-content:space-between;gap:8px;font-size:14px;white-space:nowrap;padding-bottom:2px;order:3;margin-left:0}.top .nbs{margin-left:auto}}`;
const FONTS='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Alegreya+Sans:wght@400;500;700&display=swap">';
function crumbs(title,canon){const parts=canon.split('/').filter(Boolean),it=[['Talentsmith',SITE]];const sec={builds:'Builds',classes:'Class guides'}[parts[0]];if(sec)it.push([sec,SITE+parts[0]+'/']);if(!sec||parts.length>1)it.push([title.split(/ [–|] /)[0],SITE+canon]);return '<script type="application/ld+json">'+JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":it.map(([n,u],i)=>({"@type":"ListItem","position":i+1,"name":n,"item":u}))}).replace(/</g,'\\u003c')+'</script>';}
function page(rel,title,desc,body,canon){const p=rel?'../':'';return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${SITE}${canon}">
<meta property="og:url" content="${SITE}${canon}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:image" content="${SITE}img/og.jpg"><meta name="theme-color" content="#0b0e15">${crumbs(title,canon)}
<link rel="icon" type="image/png" href="${p}favicon.png">${FONTS}<style>${CSS}</style></head><body>
<div class="gut"><div class="wrap"><header class="top"><a class="brand" href="${p}./"><img src="${p}img/avatar.webp" alt="">Talentsmith</a>
<nav><a href="${p}classes/">Classes</a><a href="${p}calculator.html">Calculator</a><a href="${p}builds/">Builds</a><a href="${p}changes.html">Changes</a><a href="${p}./#picker">Race picker</a><a class="dsk" href="${p}./#races">Racials</a></nav><span class="nbs"><a class="nb" href="https://bigdforever.com/" rel="noopener"><img src="${p}img/bigd-icon.webp" alt="" width="16" height="16">BigD</a><a class="nb" href="https://ko-fi.com/bigdforever" rel="noopener"><img src="${p}img/coin.svg" alt="" width="16" height="16">Ko-fi</a></span></header>
${body}</div></div>
<footer class="gut"><div class="wrap"><p><a href="https://ko-fi.com/bigdforever" rel="noopener">Support Talentsmith on Ko-fi</a> – it keeps new builds and calculators coming.</p>
<p>Fan-made, not affiliated with Blizzard Entertainment. Builds and race picks are our own, made from the live WoW Forever talent trees.</p>
<p style="font-size:12px;opacity:.8">World of Warcraft, Warcraft and Blizzard Entertainment are trademarks or registered trademarks of Blizzard Entertainment, Inc. in the U.S. and/or other countries. Game icons © Blizzard Entertainment, Inc.</p></div></footer><!-- Cloudflare Web Analytics --><script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "87a25da520924d508c47601156b61bcc"}'></script><script defer src="https://cloud.umami.is/script.js" data-website-id="514e18a2-39d1-4a61-b429-dae9f1b6f5bc"></script><script>document.addEventListener("click",e=>{const t=e.target.closest("a,button");if(!t||!window.umami)return;const h=t.getAttribute("href")||"";const n=t.id==="share"?"build-link-copied":t.id==="reset"?"reset":t.dataset.cls?"class-opened":/ko-fi\.com/.test(h)?"tip-click":/bigdforever\.com/.test(h)?"bigd-click":"";if(n)umami.track(n,t.dataset.cls?{class:t.dataset.cls}:undefined)},true);</script><!-- End Cloudflare Web Analytics --></body></html>`;}
const ti=(c,n,p='../')=>`<span class="ti"><img src="${p}img/talents/${icon(c,n)}.webp" alt="" width="26" height="26" loading="lazy">${esc(n)}</span>`;
const calcUrl=(b,p='../')=>`${p}calculator.html?c=${b.c}&b=${b.code}&o=${b.ord}`;
const tags=b=>`<span class="tag ${b.group}">${b.group==='off'?'Off-meta':'Meta'}</span> <span class="tag ${b.kind==='Leveling'?'lv':''}">${b.kind}</span>`;
const KO=['Raid','Dungeon','DPS','Tank','Healer','Leveling','PvP'];
const bcard=(b,p)=>`<a class="card" style="text-decoration:none;color:var(--ink);display:block" href="${p}${b.c}-${b.id}.html"><span class="tag ${b.kind==='Leveling'?'lv':''}">${b.kind}</span><h3 style="margin:8px 0 4px;font:800 18px var(--f-display);color:var(--gold-soft)">${esc(b.name)}</h3><p style="margin:0;color:#d8cfbf;font-size:15.5px">${esc(b.blurb)}</p><p class="split" style="margin:8px 0 0">Split <b>${b.split.join(' / ')}</b> · level order →</p></a>`;
const twoCols=(L,p)=>{const srt=a=>a.sort((x,y)=>KO.indexOf(x.kind)-KO.indexOf(y.kind));const m=srt(L.filter(b=>b.group!=='off')),o=srt(L.filter(b=>b.group==='off'));
  return `<div class="cols2"><div><h3 style="color:#8fc4e8">Meta <span class="pill">${m.length}</span></h3><p class="old" style="margin:-4px 0 10px">The builds most players run.</p><div class="stack">${m.map(b=>bcard(b,p)).join('')||'<p class="old">None yet.</p>'}</div></div><div><h3 style="color:var(--ember)">Off-meta <span class="pill">${o.length}</span></h3><p class="old" style="margin:-4px 0 10px">Uncommon builds that can work – try something different.</p><div class="stack">${o.map(b=>bcard(b,p)).join('')||'<p class="old">None yet.</p>'}</div></div></div>`;};
const foldCols=(L,p)=>{const srt=a=>a.sort((x,y)=>KO.indexOf(x.kind)-KO.indexOf(y.kind));const m=srt(L.filter(b=>b.group!=='off')),o=srt(L.filter(b=>b.group==='off'));
  const grp=(t,c,n,d,arr)=>`<details class="bgrp"><summary><span style="color:${c}">${t}</span> <span class="pill">${n}</span><span class="old">${d}</span></summary><div class="stack">${arr.map(b=>bcard(b,p)).join('')||'<p class="old">None yet.</p>'}</div></details>`;
  return `<div class="cols2">${grp('Meta','#8fc4e8',m.length,'The builds most players run.',m)}${grp('Off-meta','var(--ember)',o.length,'Uncommon builds that can work.',o)}</div>`;};
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
  const others=out.filter(o=>o.c===b.c&&o.id!==b.id).map(o=>`<a href="${o.c}-${o.id}.html">${esc(o.name)}</a>${o.group==='off'?' <span class="pill">off-meta</span>':''}`).join(' · ');
  const body=`<p class="crumb"><a href="../classes/">Classes</a> › <a href="../classes/${b.c}.html">${C.name}</a> › Build</p>
<h1><img src="../img/icons/class-${b.c}.webp" alt="">${esc(C.name)} – ${esc(b.name)}</h1>
<p>${tags(b)} <span class="split">Split <b>${b.split.join(' / ')}</b> (${trees.map(t=>t.name).join(' / ')})</span></p>
<p class="lede">${esc(b.blurb)}</p>${b.group==='off'?`<p class="old">Off-meta: not the usual pick, but a build that can work well in Forever. Try it, tweak it in the calculator and share your link.</p>`:''}
<p><a class="btn" href="${calcUrl(b)}">Open in calculator</a></p>
<h2>Talents in this build</h2><div class="grid">${picked}</div>
<h2>Leveling order</h2><p class="lede">One talent point per level from 10 to 60. Follow it top to bottom.</p>
<div class="tbl"><table><thead><tr><th>Level</th><th>Talent</th><th>Tree</th></tr></thead><tbody>${rows}</tbody></table></div>
${others?`<p style="margin-top:20px">Other ${C.name} builds: ${others}</p>`:''}`;
  const fn=`builds/${b.c}-${b.id}.html`;urls.push(fn);
  fs.writeFileSync(R+fn,page(true,`${C.name} ${b.name} Build – WoW Forever | Talentsmith`,`WoW Forever ${C.name} ${b.name.toLowerCase()} talent build (${b.split.join('/')}) with a level-by-level talent order from 10 to 60 and a calculator link.`,body,fn));}
// ---- class pages
const cards=[];
for(const c of ORDER){const C=ctx.CLASSES[c],Cn=C.name,trees=C.trees;
  const specs=ctx.BUILDS[Cn].map(b=>{const r=bestRaces(c,b);return `<tr><td><b>${esc(b.name)}</b></td>${ctx.CTX.map(([k])=>`<td><span class="h">${esc(r.horde[k])}</span><br><span class="a">${esc(r.alliance[k])}</span></td>`).join('')}</tr>`;}).join('');
  const bl=twoCols(out.filter(b=>b.c===c),'../builds/');
  const ch=trees.flatMap(tr=>tr.t.filter(x=>x[7]).map(x=>`<tr><td>${ti(c,x[0])}</td><td class="n">${tr.name}</td><td class="new">${esc(x[6]||x[5])}</td></tr>`)).join('');
  const body=`<p class="crumb"><a href="./">Classes</a> › ${Cn}</p><h1><img src="../img/icons/class-${c}.webp" alt="">${Cn} in WoW Forever</h1>
<p style="margin-top:14px"><a class="btn" href="../calculator.html?c=${c}">${Cn} talent calculator</a> <a class="btn ghost" href="../?class=${Cn}#picker">Race picker</a></p>
<h2>${Cn} builds</h2>${bl}
<h2>Best race for each ${Cn} spec</h2><p class="lede">Top-scoring race from our racial scores: <span class="h">Horde</span> first, <span class="a">Alliance</span> below. Open the race picker for the full ranking and why.</p>
<div class="tbl" style="display:inline-block;max-width:100%"><table class="races"><thead><tr><th>Spec</th>${ctx.CTX.map(([,n])=>`<th>${n}</th>`).join('')}</tr></thead><tbody>${specs}</tbody></table></div>`;
  const fn=`classes/${c}.html`;urls.push(fn);
  fs.writeFileSync(R+fn,page(true,`${Cn} Guide – Best Race, Builds & Talents | WoW Forever | Talentsmith`,`WoW Forever ${Cn}: meta and off-meta talent builds with leveling order, and the best race for every spec.`,body,fn));
  cards.push(`<a class="card" style="text-decoration:none;color:var(--ink);display:flex;gap:12px;align-items:center" href="${c}.html"><img src="../img/icons/class-${c}.webp" alt="" width="40" height="40" style="border-radius:8px"><span><b style="color:var(--gold-soft);font-family:var(--f-display)">${Cn}</b><br><span style="color:var(--muted);font-size:15px">${out.filter(b=>b.c===c&&b.group==='meta').length} meta · ${out.filter(b=>b.c===c&&b.group==='off').length} off-meta builds · best race</span></span></a>`);}
fs.writeFileSync(R+'classes/index.html',page(true,'WoW Forever Class Guides – Best Race & Builds | Talentsmith','Every WoW Forever class: meta and off-meta talent builds with level-by-level order, and the best race per spec.',`<h1>Class guides</h1><p class="lede">Pick a class for its meta and off-meta builds and best races.</p><div class="grid">${cards.join('')}</div>`,'classes/'));
// ---- builds index
{const body=`<h1>WoW Forever builds</h1><p class="lede">${out.length} talent builds for all nine classes, each with a level-by-level order from 10 to 60 and a calculator link. Meta builds are what most players run; off-meta builds are the uncommon ones that can work.</p>
<p>${ORDER.map(c=>`<a href="#${c}">${ctx.CLASSES[c].name}</a>`).join(' · ')}</p>`+'<style>.bcls{margin:12px 0;border:1px solid var(--edge,#2a2f3a);border-radius:12px;background:rgba(255,255,255,.02)}.bcls>summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:12px;padding:12px 16px;font:800 22px/1.1 var(--f-display);color:var(--gold-soft)}.bcls>summary::-webkit-details-marker,.bgrp>summary::-webkit-details-marker{display:none}.bcls>summary::after,.bgrp>summary::after{content:"▾";margin-left:auto;color:var(--gold);font-size:14px;transition:transform .2s}.bcls[open]>summary::after,.bgrp[open]>summary::after{transform:rotate(180deg)}.bcls>summary .cnt{font:500 14px var(--f-body);color:var(--muted)}.bcls>.cols2{padding:0 16px 16px}.bgrp{border:1px solid var(--edge,#2a2f3a);border-radius:10px;padding:0 12px}.bgrp>summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:12px 0;font:800 19px/1.1 var(--f-display)}.bgrp>summary .old{font:400 14px var(--f-body);flex-basis:100%;margin:2px 0 0;order:3}.bgrp>summary::after{order:2}.bgrp>.stack{padding:0 0 12px}</style>'+ORDER.map(c=>{const L=out.filter(b=>b.c===c);return `<details class="bcls" id="${c}"><summary><img src="../img/icons/class-${c}.webp" alt="" width="34" height="34" style="border-radius:7px">${ctx.CLASSES[c].name}<span class="cnt">${L.length} builds</span></summary>${foldCols(L,'')}</details>`;}).join('')+'<script>(()=>{const o=()=>{const d=document.getElementById(location.hash.slice(1));if(d&&d.tagName==="DETAILS"){d.open=true;d.scrollIntoView();}};addEventListener("hashchange",o);o();})();</script>';
 urls.push('builds/');fs.writeFileSync(R+'builds/index.html',page(true,'WoW Forever Talent Builds – Meta & Off-meta for Every Class | Talentsmith',`${out.length} WoW Forever talent builds: meta and off-meta builds for every class and spec with level-by-level talent order.`,body,'builds/'));}
// ---- calculator presets (Meta / Off-meta button)
{const P={};for(const c of ORDER){const L=out.filter(b=>b.c===c).sort((x,y)=>(x.group==='off')-(y.group==='off')||KO.indexOf(x.kind)-KO.indexOf(y.kind));P[c]=L.map(b=>[b.group==='off'?'off':'meta',b.name,b.kind,b.code,b.ord,b.id]);}
 const cp=R+'calculator.html';let h=fs.readFileSync(cp,'utf8');const re=/\/\*PRESETS\*\/[\s\S]*?\/\*\/PRESETS\*\//;
 if(!re.test(h)) throw new Error('PRESETS marker missing in calculator.html');
 h=h.replace(re,()=>'/*PRESETS*/const PRESETS='+JSON.stringify(P)+';/*/PRESETS*/');fs.writeFileSync(cp,h);}
// ---- changes page
const LOGCSS=`.log{list-style:none;margin:0;padding:0 0 0 22px;border-left:2px solid #3b352f;display:flex;flex-direction:column;gap:14px}
.log>li{position:relative}
.log>li::before{content:"";position:absolute;left:-30px;top:5px;width:12px;height:12px;transform:rotate(45deg);background:#0b0e15;border:2px solid var(--gold)}
.log>li:first-child::before{background:var(--ember);border-color:var(--gold-soft);box-shadow:0 0 12px var(--ember)}
.log summary{cursor:pointer;list-style:none;display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 12px;position:relative;padding-right:26px}
.log summary::-webkit-details-marker{display:none}
.log summary::after{content:"▾";color:var(--gold);font-size:13px;transition:transform .2s;position:absolute;right:4px;top:0}
.log details[open] summary::after{transform:rotate(180deg)}
.log time{font:700 14px/1 var(--f-display);letter-spacing:.08em;color:var(--gold);min-width:52px}
.log .gist{color:#d8cfbf;font-size:15.5px}
.log .items{list-style:none;margin:10px 0 0;padding:0;display:grid;gap:8px;max-width:80ch}
.log .items li{display:flex;gap:10px;align-items:baseline;color:#d8cfbf;line-height:1.5}
.tg{flex:none;font:700 11.5px/1 var(--f-body,inherit);letter-spacing:.04em;padding:4px 8px;border-radius:6px;border:1px solid;min-width:86px;text-align:center}
.tg.h{color:#ff9a8a;border-color:rgba(255,110,90,.45);background:rgba(160,30,20,.22)}
.tg.a{color:#9cc7ff;border-color:rgba(90,150,255,.45);background:rgba(20,60,160,.22)}
.tg.sky{color:#9fe6d8;border-color:rgba(90,210,190,.45);background:rgba(20,120,110,.2)}
.tg.gen{color:var(--gold-soft);border-color:rgba(233,180,76,.4);background:rgba(233,180,76,.1)}
.tg[class*="c-"]{background:rgba(255,255,255,.04)}
.tg.c-warrior{color:#C69B6D;border-color:#C69B6D80}.tg.c-paladin{color:#F48CBA;border-color:#F48CBA80}.tg.c-hunter{color:#AAD372;border-color:#AAD37280}.tg.c-rogue{color:#FFF468;border-color:#FFF46880}.tg.c-priest{color:#fff;border-color:#ffffff80}.tg.c-shaman{color:#4aa3ff;border-color:#4aa3ff80}.tg.c-mage{color:#3FC7EB;border-color:#3FC7EB80}.tg.c-warlock{color:#a3a4ff;border-color:#a3a4ff80}.tg.c-druid{color:#FF7C0A;border-color:#FF7C0A80}
@media (max-width:640px){.log .items li{display:block}.tg{display:inline-block;min-width:0;margin:0 8px 0 0;vertical-align:1px}}
.log{margin-top:8px}`;
const log='<style>'+LOGCSS+'</style>'+idx.slice(idx.indexOf('<ol class="log">'),idx.indexOf('</ol>')+5);
fs.writeFileSync(R+'changes.html',page(false,'WoW Forever Hotfixes & Changes Tracker | Talentsmith','WoW Forever hotfixes and racial changes, checked against the live game, plus what is coming next.',
`<h1>Hotfixes &amp; changes</h1><p class="lede">Live WoW Forever hotfixes and racial changes, newest first. The talent calculator matches the live game (build 1.60.1.70862, checked Nov 9).</p>${log}`,'changes.html'));
// ---- sitemap/robots
const today='2026-11-09';
fs.writeFileSync(R+'sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(R+'robots.txt',`User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
console.log('pages',urls.length);
