const fs=require('fs'),vm=require('vm'),path=require('path');
const SITE=process.env.SITE||'https://talentsmith.app/';
const R=path.resolve(__dirname,'..')+'/';
const calc=fs.readFileSync(R+'calculator.html','utf8'), idx=fs.readFileSync(R+'index.html','utf8');
const ctx={};vm.createContext(ctx);
let s=calc.slice(calc.indexOf('const PALADIN='),calc.indexOf('const SOON='));
vm.runInContext(s.replace(/\bconst (\w+)=/g,'var $1=')+';var CCL=CLASSES;',ctx);
let t=idx.slice(idx.indexOf('const H="horde"'),idx.indexOf('const byId='));
vm.runInContext(t.replace(/\bconst (\w+)=/g,'var $1=')+';',ctx);
{const a=calc.indexOf('function rankText(');vm.runInContext(calc.slice(a,calc.indexOf('\n}\n',a)+2),ctx);}
{const a=calc.indexOf('const TICON=');vm.runInContext(calc.slice(a,calc.indexOf('\n',a)).replace('const ','var '),ctx);}
const BUILDS=require('./builds.js');ctx.CLASSES=ctx.CCL;
const slug=n=>n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const esc=x=>String(x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const icon=(c,n)=>c==='paladin'&&ctx.TICON[n]?ctx.TICON[n]:c+'-'+slug(n);
const ORDER=['warrior','paladin','hunter','rogue','priest','shaman','mage','warlock','druid'];
// ---- validate + expand builds
const out=[];
function encode(c,id,list){
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
    return {seq,pts,code,ord};}
// a swap in the notes: drop points (taken from the latest picks) and add new ones at the end; checked like a real build
function swapList(list,drop,add,inplace=true){// added points take the level slots of the dropped ones, so row requirements still hold
  const P=[];for(const [ti,tn,n] of list)for(let k=0;k<n;k++)P.push([ti,tn]);
  const holes=[];for(const [ti,tn,n] of drop){let k=n;for(let i=P.length-1;i>=0&&k>0;i--)if(P[i]&&P[i][0]===ti&&P[i][1]===tn){P[i]=null;holes.push(i);k--;} if(k) throw `swap: cannot drop ${tn}`;}
  holes.sort((x,y)=>x-y);const A=[];for(const [ti,tn,n] of add)for(let k=0;k<n;k++)A.push([ti,tn]);
  A.forEach((x,j)=>{if(inplace&&j<holes.length)P[holes[j]]=x;else P.push(x);});
  const L=[];for(const x of P){if(!x)continue;const l=L[L.length-1];if(l&&l[0]===x[0]&&l[1]===x[1])l[2]++;else L.push([x[0],x[1],1]);}return L;}
for(const [c,id,name,kind,blurb,list,group='meta',notes=null] of BUILDS){
  const {seq,pts,code,ord}=encode(c,id,list);
  if(notes&&notes.flex)for(const f of notes.flex)if(!f.any){try{f.calc=encode(c,id+' (swap)',swapList(list,f.drop,f.add));}catch(e){f.calc=encode(c,id+' (swap)',swapList(list,f.drop,f.add,false));}}
  const split=pts.map(p=>p.reduce((a,b)=>a+b,0)),main=split.indexOf(Math.max(...split)),spec=ctx.CLASSES[c].trees[main].name;
  out.push({c,id,name,kind,blurb,group,notes,seq,pts,code,ord,split,spec,specSlug:c+'-'+slug(spec)});}
console.log('builds OK',out.length);
// ---- shared shell
const CSS=`:root{color-scheme:dark;--night:#0b0e15;--deep:#11151f;--plate:#171c28;--plate-2:#1f2533;--edge:#2c3242;--gold:#e9b44c;--gold-soft:#f6d68e;--ember:#ff7a2f;--ink:#ede4d3;--muted:#a39886;--horde:#d2483c;--alliance:#4c82db;--f-display:"Cinzel",Georgia,serif;--f-body:"Alegreya Sans",system-ui,sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--night);color:var(--ink);font:17px/1.55 var(--f-body);background-image:radial-gradient(1000px 500px at 50% -10%,rgba(255,122,47,.10),transparent 60%)}
a{color:var(--gold)}.gut{padding-left:max(16px,env(safe-area-inset-left));padding-right:max(16px,env(safe-area-inset-right))}.wrap{max-width:1000px;margin:0 auto}
.top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-block:14px;border-bottom:1px solid var(--edge)}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--gold-soft);font:800 18px/1 var(--f-display);letter-spacing:.06em}.brand img{width:34px;height:34px;border-radius:50%}
.top nav{display:flex;gap:14px;font-size:15px;flex-wrap:wrap}.top nav a{color:var(--muted);text-decoration:none}.top nav a:hover{color:var(--gold)}.top{justify-content:flex-start}.top nav{align-items:center;margin-left:auto}.nbs{display:flex;gap:10px;align-items:center}.nb{text-decoration:none;display:inline-flex;align-items:center;gap:6px;padding:2px 9px 2px 3px;margin:-3px 0;font-size:13px;border:1px solid var(--edge);border-radius:999px;color:var(--ink)!important;line-height:1.2}.nb img{width:16px;height:16px;border-radius:50%;flex:none}.nb:hover{border-color:var(--gold);color:var(--gold-soft)!important}@media (max-width:640px){.top nav .dsk{display:none}}@media (max-width:359px){header.top nav{font-size:12.5px;gap:4px}}
.crumb{font-size:14px;color:var(--muted);margin:16px 0 0}.crumb a{color:var(--muted)}
h1{font:800 clamp(26px,5vw,38px)/1.1 var(--f-display);margin:10px 0 8px;color:var(--gold-soft);text-wrap:balance;display:flex;align-items:center;gap:12px;overflow-wrap:anywhere}h1 img{width:44px;height:44px;border-radius:8px}
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
function page(rel,title,desc,body,canon,og){const p=rel?'../':'';return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${SITE}${canon}">
<meta property="og:url" content="${SITE}${canon}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">${og?`<meta property="og:image" content="${SITE}${og}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">`:`<meta property="og:image" content="${SITE}img/og.jpg">`}<meta name="theme-color" content="#0b0e15">${crumbs(title,canon)}
<link rel="icon" type="image/png" href="${p}favicon.png">${FONTS}<style>${CSS}</style></head><body>
<div class="gut"><div class="wrap"><header class="top"><a class="brand" href="${p}./"><img src="${p}img/avatar.webp" alt="">Talentsmith</a>
<nav><a href="${p}classes/">Classes</a><a href="${p}calculator.html">Calculator</a><a href="${p}builds/">Builds</a><a href="${p}changes.html">Changes</a><a href="${p}./#picker">Race picker</a><a class="dsk" href="${p}./#races">Racials</a></nav><span class="nbs"><a class="nb" href="https://bigdforever.com/" rel="noopener"><img src="${p}img/bigd-icon.webp" alt="" width="16" height="16">BigD</a><a class="nb" href="https://ko-fi.com/bigdforever" rel="noopener"><img src="${p}img/coin.svg" alt="" width="16" height="16">Ko-fi</a></span></header>
${body}</div></div>
<footer class="gut"><div class="wrap"><p><a href="https://ko-fi.com/bigdforever" rel="noopener">Support Talentsmith on Ko-fi</a> – it keeps new builds and calculators coming.</p>
<p>Fan-made, not affiliated with Blizzard Entertainment. Builds and race picks are our own, made from the live WoW Forever talent trees.</p>
<p style="font-size:12px;opacity:.8">World of Warcraft, Warcraft and Blizzard Entertainment are trademarks or registered trademarks of Blizzard Entertainment, Inc. in the U.S. and/or other countries. Game icons © Blizzard Entertainment, Inc.</p></div></footer><!-- Cloudflare Web Analytics --><script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "87a25da520924d508c47601156b61bcc"}'></script><script defer src="https://cloud.umami.is/script.js" data-website-id="514e18a2-39d1-4a61-b429-dae9f1b6f5bc"></script><script>document.addEventListener("click",e=>{const t=e.target.closest("a,button");if(!t||!window.umami)return;const h=t.getAttribute("href")||"";const n=t.id==="share"?"build-link-copied":t.id==="reset"?"reset":t.dataset.cls?"class-opened":/ko-fi\.com/.test(h)?"tip-click":/bigdforever\.com/.test(h)?"bigd-click":"";if(n)umami.track(n,t.dataset.cls?{class:t.dataset.cls.toLowerCase()}:undefined)},true);</script><!-- End Cloudflare Web Analytics --></body></html>`;}
// tooltip text at rank r; at max rank drop the "up to" and per-rank lists the calculator uses for scaling
const tipText=(x,r,m)=>{if(r<m||m<=1||!ctx.rankText(x,1,m).scaled)return ctx.rankText(x,r,m).t;
  let t=x.replace(/\s*\(((?:[\d.]+\s*\/\s*)+[\d.]+)\s*(?:%|\s?sec|\s?yd)?\)/g,(a,b)=>b.split('/').length===m?'':a).replace(/\s*\([\d.]+(?:%|\s?sec)?\s+per rank\)|,\s*[\d.]+(?:%|\s?sec)?\s+per rank/g,'');
  t=t.replace(/\b([Uu])p to\s+(?=(?:a\s+|an\s+|\+)?[\d.]+(?:%|\s?sec|\s?yd)?(?!\s*(?:more\s+|extra\s+)?(?:times|enemies|targets|target|allies|charges|stacks|members|people)\b))/g,(a,U)=>U==='U'?'\u0001':'');
  return t.replace(/\u0001(.)/,(a,c)=>c.toUpperCase()).replace(/\s+([,.;)])/g,'$1').replace(/\s{2,}/g,' ');};
const ti=(c,n,p='../',tip)=>`<span class="ti"${tip?` tabindex="0" data-rk="${tip.r}/${tip.m}" data-tip="${esc(tipText(tip.x,tip.r,tip.m))}"`:''}><img src="${p}img/talents/${icon(c,n)}.webp" alt="" width="26" height="26" loading="lazy">${esc(n)}</span>`;
const calcUrl=(b,p='../')=>`${p}calculator.html?c=${b.c}&b=${b.code}&o=${b.ord}`;
const tags=b=>`<span class="tag ${b.group}">${b.group==='off'?'Off-meta':'Meta'}</span> <span class="tag ${b.kind==='Leveling'?'lv':''}">${b.kind}</span>`;
const KO=['Raid','Dungeon','DPS','Tank','Healer','Leveling','PvP'];
const sicon=(b,px=24,pre='../')=>`<img class="sicon" src="${pre}img/specs/${b.specSlug}.webp" alt="${esc(b.spec)}" title="Mostly ${esc(b.spec)}" width="${px}" height="${px}" style="border-radius:5px;flex:none;vertical-align:middle">`;
const bcard=(b,p)=>`<a class="card" style="text-decoration:none;color:var(--ink);display:block" href="${p}${b.c}-${b.id}.html"><span class="tag ${b.kind==='Leveling'?'lv':''}">${b.kind}</span><h3 style="margin:8px 0 4px;font:800 18px var(--f-display);color:var(--gold-soft);display:flex;align-items:center;gap:9px">${sicon(b,26)}${esc(b.name)}</h3><p style="margin:0;color:#d8cfbf;font-size:15.5px">${esc(b.blurb)}</p><p class="split" style="margin:8px 0 0">Split <b>${b.split.join(' / ')}</b> · level order →</p></a>`;
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
const BSECCSS=`<style>details.bsec{margin:26px 0 0}details.bsec>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:12px;border-radius:6px}details.bsec>summary::-webkit-details-marker{display:none}details.bsec>summary h2{margin:0}details.bsec>summary:focus-visible{outline:2px solid var(--gold);outline-offset:4px}details.bsec>summary::after{content:"";width:9px;height:9px;border-right:2px solid var(--gold);border-bottom:2px solid var(--gold);transform:translateY(-3px) rotate(45deg);transition:transform .2s;flex:none}details.bsec[open]>summary::after{transform:translateY(2px) rotate(-135deg)}details.bsec>summary .bh{font:500 14px var(--f-body);color:var(--muted)}details.bsec[open]>summary{margin-bottom:12px}.anyc{font-style:italic;color:#d8cfbf}</style>`;
const NOTESCSS=`<style>.notes-h{display:flex;align-items:baseline;gap:10px}.notes-h small{font:600 12px var(--f-body);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);border:1px solid var(--edge);border-radius:99px;padding:2px 9px}
.pc{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:12px 0 22px}.pc.one{grid-template-columns:1fr}.pc>div{background:var(--plate);border:1px solid var(--edge);border-radius:10px;padding:14px 16px 10px;border-top:3px solid}.pc .pro{border-top-color:#4fae6a}.pc .con{border-top-color:#d2483c}
.pc h3{margin:0 0 8px;font:700 16px var(--f-display);display:flex;align-items:center;gap:8px}.pc .pro h3{color:#8fd6a2}.pc .con h3{color:#f08a7e}.pc h3 i{font-style:normal;display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;font:800 14px/1 var(--f-body)}.pc .pro h3 i{background:#4fae6a33;color:#8fd6a2}.pc .con h3 i{background:#d2483c33;color:#f08a7e}.pc ul{margin:0;padding:0 0 0 18px}.pc li{margin:0 0 7px;line-height:1.45}
.flx-h{margin:4px 0 4px;font:700 17px var(--f-display);color:var(--gold-soft)}.flx-sub{margin:0 0 12px;color:var(--muted)}.flx{margin:0 0 10px;background:var(--plate);border:1px solid var(--edge);border-radius:10px;padding:2px 14px}
.sw{border-top:1px solid var(--edge);padding:12px 0;display:grid;grid-template-columns:1fr auto 1fr;gap:8px 14px;align-items:start}.sw .or{align-self:center}.sw .opt{display:flex;flex-direction:column;align-items:flex-start;gap:6px}
.sw .lab{font:700 11px var(--f-body);letter-spacing:.05em;text-transform:uppercase;color:var(--gold);border:1px solid #e9b44c66;border-radius:5px;padding:1px 6px}.sw .lab.alt{color:#8fd6a2;border-color:#4fae6a66}
.sw .or{font:800 12px var(--f-body);color:var(--muted);text-transform:uppercase;letter-spacing:.08em;background:var(--deep);border:1px solid var(--edge);border-radius:99px;padding:4px 10px}
.sw p{grid-column:1/-1;margin:2px 0 0;color:#d8cfbf;font-size:15px;line-height:1.45}.sw p a{white-space:nowrap}
.sw:first-child{border-top:0}@media(max-width:640px){.pc{grid-template-columns:1fr}.sw{grid-template-columns:1fr}.sw .or{justify-self:start}}</style>`;
const ti_=(...a)=>ti(...a);
function notesHtml(b,trees){const N=b.notes;if(!N)return '';
  const T=(ti,n)=>trees[ti].t.find(y=>y[0]===n);
  const one=(ti,n,r)=>{const x=T(ti,n);return `<span>${ti_(b.c,n,'../',{x:x[5],r,m:x[1]})} <span class="pill">${r}/${x[1]}</span></span>`;};
  const li=L=>L.map(x=>`<li>${esc(x)}</li>`).join('');
  let h=`${NOTESCSS}<details class="bsec" id="notes" open><summary><h2 class="notes-h">Notes <small>Our take</small></h2></summary>`;
  if(N.pros||N.cons)h+=`<div class="pc${N.pros&&N.cons?'':' one'}">${N.pros?`<div class="pro"><h3><i>+</i>Pros</h3><ul>${li(N.pros)}</ul></div>`:''}${N.cons?`<div class="con"><h3><i>−</i>Cons</h3><ul>${li(N.cons)}</ul></div>`:''}</div>`;
  if(N.flex){h+=`<h3 class="flx-h">Flexibility – your choice</h3><div class="flx">`;
    for(const f of N.flex){const P=f.calc?f.calc.pts:null;
      const have=f.drop.map(([ti,n,k])=>{const i=trees[ti].t.findIndex(y=>y[0]===n),r=b.pts[ti][i];return k<r?one(ti,n,r).replace(/<span class="pill">[^<]*<\/span>/,`<span class="pill">last ${k} pt${k>1?'s':''}</span>`):one(ti,n,r);}).join('');
      const get=f.any?`<span class="anyc">${esc(f.any)}</span>`:f.add.map(([ti,n])=>{const i=trees[ti].t.findIndex(y=>y[0]===n);return one(ti,n,P[ti][i]);}).join('');
      const alt=f.calc?`../calculator.html?c=${b.c}&b=${f.calc.code}&o=${f.calc.ord}`:null;
      h+=`<div class="sw"><div class="opt"><span class="lab">In build</span>${have}</div><span class="or">or</span><div class="opt"><span class="lab alt">Swap to</span>${get}</div>${f.why||alt?`<p>${esc(f.why||'')}${alt?` <a href="${alt}" data-umami-event="notes-swap-calc">Open this version in the calculator →</a>`:''}</p>`:''}</div>`;}
    h+=`</div>`;}
  return h+`</details>`;}
const TIPJS=`<style>.ti[data-tip]{cursor:help;border-bottom:1px dotted rgba(233,180,76,.45);padding-bottom:1px;outline:none}.ti[data-tip]:focus-visible{box-shadow:0 0 0 2px var(--gold);border-radius:4px}#ttip{position:fixed;z-index:50;max-width:min(320px,calc(100vw - 16px));padding:10px 12px;background:#14161c;border:1px solid var(--gold);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.55);font-size:14.5px;line-height:1.45;color:#e8dfcf;pointer-events:none;display:none}#ttip b{display:block;font:800 15px var(--f-display);color:var(--gold-soft);margin-bottom:4px}#ttip i{font-style:normal;color:var(--muted);font-size:13px;margin-left:6px}</style><div id="ttip" role="tooltip"></div><script>(()=>{const T=document.getElementById("ttip");let cur=null;
const show=el=>{cur=el;T.innerHTML="";const h=document.createElement("b");h.textContent=el.textContent.trim();const r=document.createElement("i");r.textContent="Rank "+el.dataset.rk;h.appendChild(r);T.appendChild(h);T.appendChild(document.createTextNode(el.dataset.tip));T.style.display="block";
const b=el.getBoundingClientRect(),w=T.offsetWidth,hh=T.offsetHeight;let x=Math.min(Math.max(8,b.left),innerWidth-w-8),y=b.bottom+8;if(y+hh>innerHeight-8)y=Math.max(8,b.top-hh-8);T.style.left=x+"px";T.style.top=y+"px";};
const hide=()=>{cur=null;T.style.display="none";};
const fine=matchMedia("(hover:hover)").matches;
document.addEventListener("mouseover",e=>{if(!fine)return;const el=e.target.closest(".ti[data-tip]");if(el)show(el);else if(cur)hide();});
let was=null;document.addEventListener("pointerdown",e=>{const el=e.target.closest(".ti[data-tip]");was=el&&cur===el?el:null;},true);
document.addEventListener("click",e=>{const el=e.target.closest(".ti[data-tip]");if(el){if(was===el&&!fine)hide();else show(el);}else hide();});
document.addEventListener("focusin",e=>{const el=e.target.closest&&e.target.closest(".ti[data-tip]");if(el)show(el);});
document.addEventListener("keydown",e=>{if(e.key==="Escape")hide();});
addEventListener("scroll",()=>{if(cur)hide();},{passive:true});})();</script>`;
// ---- build pages
for(const b of out){const C=ctx.CLASSES[b.c],trees=C.trees;
  const rows=b.seq.map(x=>`<tr class="lvl-row"><td class="n">${x.lvl}</td><td>${ti(b.c,x.tn,'../',{x:trees[x.ti].t.find(y=>y[0]===x.tn)[5],r:x.rank,m:x.max})} <span class="pill">${x.rank}/${x.max}</span></td><td class="n">${trees[x.ti].name}</td></tr>`).join('');
  const picked=trees.map((tr,i)=>tr.t.map((x,j)=>[x,b.pts[i][j]]).filter(([,p])=>p>0).map(([x,p])=>`<li>${ti(b.c,x[0],'../',{x:x[5],r:p,m:x[1]})} <span class="pill">${p}/${x[1]}</span></li>`).join('')).map((h,i)=>h?`<div class="card"><h3 style="margin:0 0 8px;font:800 17px var(--f-display);color:var(--gold-soft)">${trees[i].name} · ${b.split[i]}</h3><ul style="list-style:none;margin:0;padding:0;display:grid;gap:6px">${h}</ul></div>`:'').join('');
  const oth=out.filter(o=>o.c===b.c&&o.id!==b.id).sort((x,y)=>KO.indexOf(x.kind)-KO.indexOf(y.kind)||x.name.localeCompare(y.name));
  const ocards=g=>oth.filter(o=>(o.group==='off')===(g==='off')).map(o=>`<a class="ob" href="${o.c}-${o.id}.html">${sicon(o,28)}<span class="obt"><span>${esc(o.name).replace(/\//g,'/<wbr>')}</span><small>${esc(o.kind)}</small></span></a>`).join('');
  const others=oth.length?`<style>.obs{margin:30px 0 0}.obs h2{font-size:20px;margin:0 0 12px}.obrow{display:grid;grid-template-columns:90px 1fr;gap:10px 14px;align-items:start;margin:0 0 14px}.oblab{font:700 12px var(--f-body);letter-spacing:.06em;text-transform:uppercase;padding-top:12px}.oblab.meta{color:var(--gold)}.oblab.off{color:var(--ember)}.obg{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px}.ob{display:flex;align-items:center;gap:10px;min-width:0;overflow-wrap:break-word;padding:10px 12px;background:var(--plate);border:1px solid var(--edge);border-radius:9px;text-decoration:none;color:var(--ink);font-weight:600;line-height:1.3}.ob:hover,.ob:focus-visible{border-color:var(--gold);color:var(--gold-soft)}.obt{display:flex;flex-direction:column;gap:3px;min-width:0}.ob small{font:500 12.5px var(--f-body);color:var(--muted)}@media(max-width:640px){.obrow{grid-template-columns:1fr;gap:6px}.oblab{padding-top:0}.obg{grid-template-columns:repeat(2,minmax(0,1fr))}}</style><section class="obs"><h2>Other ${C.name} builds</h2>${['meta','off'].map(g=>{const c=ocards(g);return c?`<div class="obrow"><span class="oblab ${g}">${g==='off'?'Off-meta':'Meta'}</span><div class="obg">${c}</div></div>`:'';}).join('')}</section>`:'';
  const body=`<p class="crumb"><a href="../classes/">Classes</a> › <a href="../classes/${b.c}.html">${C.name}</a> › Build</p>
<h1><img src="../img/specs/${b.specSlug}.webp" alt="${esc(b.spec)}" title="Mostly ${esc(b.spec)}" style="border-radius:8px">${esc(C.name)} – ${esc(b.name).replace(/\//g,'/<wbr>')}</h1>
<p>${tags(b)} <span class="split">Split <b>${b.split.join(' / ')}</b> (${trees.map(t=>t.name).join(' / ')})</span></p>
<p class="lede">${esc(b.blurb)}</p>${b.group==='off'?`<p class="old">Off-meta: not the usual pick, but a build that can work well in Forever. Try it, tweak it in the calculator and share your link.</p>`:''}
<p><a class="btn" href="${calcUrl(b)}">Open in calculator</a></p>
${BSECCSS}<details class="bsec" open><summary><h2>Talents in this build</h2></summary><p class="old" style="margin:0 0 12px">Hover or tap a talent to see what it does at that rank.</p><div class="grid">${picked}</div></details>
<details class="bsec" id="order"><summary><h2>Leveling order</h2><span class="bh">level 10 → 60</span></summary><p class="lede">One talent point per level from 10 to 60. Follow it top to bottom.</p>
<div class="tbl"><table><thead><tr><th>Level</th><th>Talent</th><th>Tree</th></tr></thead><tbody>${rows}</tbody></table></div></details>${notesHtml(b,trees)}
${others}${TIPJS}`;
  const fn=`builds/${b.c}-${b.id}.html`;urls.push(fn);
  fs.writeFileSync(R+fn,page(true,`${C.name} ${b.name} Build – WoW Forever | Talentsmith`,`WoW Forever ${C.name} ${b.name.toLowerCase()} talent build (${b.split.join('/')}) with a level-by-level talent order from 10 to 60 and a calculator link.`,body,fn,fs.existsSync(R+`img/og/${b.c}-${b.id}.jpg`)?`img/og/${b.c}-${b.id}.jpg`:null));}
// ---- data for share images (tools/og-images.js renders img/og/<class>-<id>.jpg from it)
{const crypto=require('crypto');const og=out.map(b=>{const C=ctx.CLASSES[b.c];const d={c:b.c,id:b.id,cls:C.name,name:b.name,kind:b.kind,group:b.group,split:b.split,
  trees:C.trees.map((tr,i)=>({name:tr.name,t:tr.t.map((x,j)=>[x[0],x[1],x[2],x[3],b.pts[i][j],icon(b.c,x[0])])}))};d.hash=crypto.createHash('sha1').update(JSON.stringify(d)).digest('hex').slice(0,12);return d;});
  fs.writeFileSync(R+'tools/og-builds.json',JSON.stringify(og));
  const miss=og.filter(d=>!fs.existsSync(R+`img/og/${d.c}-${d.id}.jpg`)).length;if(miss)console.log(`share images missing for ${miss} builds – run node tools/og-images.js, then gen-pages again`);}
// ---- class pages
const cards=[];
for(const c of ORDER){const C=ctx.CLASSES[c],Cn=C.name,trees=C.trees;
  const specLinks=trees.map(tr=>`<a class="btn ghost" href="${c}-${slug(tr.name)}.html">${esc(tr.name)}</a>`).join(' ');
  const specs=ctx.BUILDS[Cn].map(b=>{const r=bestRaces(c,b);return `<tr><td><b>${esc(b.name)}</b></td>${ctx.CTX.map(([k])=>`<td><span class="h">${esc(r.horde[k])}</span><br><span class="a">${esc(r.alliance[k])}</span></td>`).join('')}</tr>`;}).join('');
  const bl=twoCols(out.filter(b=>b.c===c),'../builds/');
  const ch=trees.flatMap(tr=>tr.t.filter(x=>x[7]).map(x=>`<tr><td>${ti(c,x[0])}</td><td class="n">${tr.name}</td><td class="new">${esc(x[6]||x[5])}</td></tr>`)).join('');
  const body=`<p class="crumb"><a href="./">Classes</a> › ${Cn}</p><h1><img src="../img/icons/class-${c}.webp" alt="">${Cn} in WoW Forever</h1>
<p style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span style="color:var(--muted)">Specs:</span> ${specLinks}</p>
<p style="margin-top:14px"><a class="btn" href="../calculator.html?c=${c}">${Cn} talent calculator</a> <a class="btn ghost" href="../?class=${Cn}#picker">Race picker</a></p>
<h2>${Cn} builds</h2>${bl}
<h2>Best race for each ${Cn} spec</h2><p class="lede">Top-scoring race from our racial scores: <span class="h">Horde</span> first, <span class="a">Alliance</span> below. Open the race picker for the full ranking and why.</p>
<div class="tbl" style="display:inline-block;max-width:100%"><table class="races"><thead><tr><th>Spec</th>${ctx.CTX.map(([,n])=>`<th>${n}</th>`).join('')}</tr></thead><tbody>${specs}</tbody></table></div>`;
  // ---- spec pages (review 16, trial from Nov 10: check traffic Nov 18)
  const SPECMAP={warrior:{Arms:['dps'],Fury:['dps'],Protection:['tank']},paladin:{Holy:['holy'],Protection:['prot'],Retribution:['ret']},hunter:{'Beast Mastery':['pet'],Marksmanship:['pet'],Survival:['pet']},rogue:{Assassination:['dps'],Combat:['dps'],Subtlety:['dps']},priest:{Discipline:['disc'],Holy:['holy'],Shadow:['shadow']},shaman:{Elemental:['ele'],Enhancement:['enh'],Restoration:['resto']},mage:{Arcane:['dps'],Fire:['dps'],Frost:['dps']},warlock:{Affliction:['pet'],Demonology:['pet'],Destruction:['pet']},druid:{Balance:['balance'],'Feral Combat':['cat','bear'],Restoration:['resto']}};
  trees.forEach((tr,ti2)=>{const sn=tr.name,sfn=`classes/${c}-${slug(sn)}.html`;urls.push(sfn);
    const key=tr.t.filter(x=>x[2]>=5).sort((x,y)=>x[2]-y[2]||x[3]-y[3]);
    const kc=key.map(x=>`<div class="card" style="display:flex;gap:12px;align-items:flex-start"><img src="../img/talents/${icon(c,x[0])}.webp" width="40" height="40" alt="" loading="lazy" style="border-radius:6px;flex:none"><div><h3 style="margin:0 0 4px;font:800 17px var(--f-display);color:var(--gold-soft)">${esc(x[0])} <span class="pill">${x[1]} rank${x[1]>1?'s':''}</span></h3><p style="margin:0;color:#d8cfbf;font-size:15px">${esc(x[5])}</p></div></div>`).join('');
    const pick=(SPECMAP[c]||{})[sn]||[];
    const rr=pick.map(id=>ctx.BUILDS[Cn].find(x=>x.id===id)).filter(Boolean).map(b=>{const r=bestRaces(c,b);return `<tr><td><b>${esc(b.name)}</b></td>${ctx.CTX.map(([k])=>`<td><span class="h">${esc(r.horde[k])}</span><br><span class="a">${esc(r.alliance[k])}</span></td>`).join('')}</tr>`;}).join('');
    const sb=out.filter(b=>b.c===c&&b.split[ti2]>=20);
    const others=trees.filter(t=>t!==tr).map(t=>`<a href="${c}-${slug(t.name)}.html">${esc(t.name)} ${Cn}</a>`).join(' · ');
    const sbody=`<p class="crumb"><a href="./">Classes</a> › <a href="${c}.html">${Cn}</a> › ${esc(sn)}</p><h1><img src="../img/icons/class-${c}.webp" alt="">${esc(sn)} ${Cn} in WoW Forever</h1>
<p style="max-width:70ch;color:#d8cfbf;font-size:17px;margin-top:10px">Builds that go deep into ${esc(sn)}, the talents that define the spec, and the best race for a ${esc(sn)} ${Cn} – from the live game data.</p>
<p style="margin-top:14px"><a class="btn" href="../calculator.html?c=${c}">${esc(sn)} ${Cn} in the calculator</a> <a class="btn ghost" href="../?class=${Cn}#picker">Race picker</a></p>
<h2>Key ${esc(sn)} talents</h2><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px">${kc}</div>
${rr?`<h2>Best race for ${esc(sn)} ${Cn}</h2><p class="lede">Top-scoring race from our racial scores: <span class="h">Horde</span> first, <span class="a">Alliance</span> below.</p><div class="tbl" style="display:inline-block;max-width:100%"><table class="races"><thead><tr><th>Spec</th>${ctx.CTX.map(([,n])=>`<th>${n}</th>`).join('')}</tr></thead><tbody>${rr}</tbody></table></div>`:''}
<h2>${esc(sn)} builds</h2>${sb.length?twoCols(sb,'../builds/'):`<p class="old">No ${esc(sn)}-heavy build yet – see all <a href="${c}.html">${Cn} builds</a>.</p>`}
<p style="margin-top:24px" class="old">Other ${Cn} specs: ${others}</p>`;
    fs.writeFileSync(R+sfn,page(true,`${sn} ${Cn} Guide – Talents, Builds & Best Race | WoW Forever | Talentsmith`,`WoW Forever ${sn} ${Cn}: key ${sn} talents with live values, the best race for each faction, and ${sn} talent builds with leveling order.`,sbody,sfn));});
  const fn=`classes/${c}.html`;urls.push(fn);
  fs.writeFileSync(R+fn,page(true,`${Cn} Guide – Best Race, Builds & Talents | WoW Forever | Talentsmith`,`WoW Forever ${Cn}: meta and off-meta talent builds with leveling order, and the best race for every spec.`,body,fn));
  cards.push(`<a class="card" style="text-decoration:none;color:var(--ink);display:flex;gap:12px;align-items:center" href="${c}.html"><img src="../img/icons/class-${c}.webp" alt="" width="40" height="40" style="border-radius:8px"><span><b style="color:var(--gold-soft);font-family:var(--f-display)">${Cn}</b><br><span style="color:var(--muted);font-size:15px">${out.filter(b=>b.c===c&&b.group==='meta').length} meta · ${out.filter(b=>b.c===c&&b.group==='off').length} off-meta builds · best race</span></span></a>`);}
fs.writeFileSync(R+'classes/index.html',page(true,'WoW Forever Class Guides – Best Race & Builds | Talentsmith','Every WoW Forever class: meta and off-meta talent builds with level-by-level order, and the best race per spec.',`<h1>Class guides</h1><p class="lede">Pick a class for its meta and off-meta builds and best races.</p><div class="grid">${cards.join('')}</div>`,'classes/'));
// ---- builds index
{const body=`<h1>WoW Forever builds</h1><p class="lede">${out.length} talent builds for all nine classes, each with a level-by-level order from 10 to 60 and a calculator link. Meta builds are what most players run; off-meta builds are the uncommon ones that can work.</p>
<p>${ORDER.map(c=>`<a href="#${c}">${ctx.CLASSES[c].name}</a>`).join(' · ')}</p>`+'<style>.bcls{margin:12px 0;border:1px solid var(--edge,#2a2f3a);border-radius:12px;background:rgba(255,255,255,.02)}.bcls>summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:12px;padding:12px 16px;font:800 22px/1.1 var(--f-display);color:var(--gold-soft)}.bcls>summary::-webkit-details-marker,.bgrp>summary::-webkit-details-marker{display:none}.bcls>summary::after,.bgrp>summary::after{content:"▾";margin-left:auto;color:var(--gold);font-size:14px;transition:transform .2s}.bcls[open]>summary::after,.bgrp[open]>summary::after{transform:rotate(180deg)}.bcls>summary .cnt{font:500 14px var(--f-body);color:var(--muted)}.bcls>.cols2{padding:0 16px 16px}.bgrp{border:1px solid var(--edge,#2a2f3a);border-radius:10px;padding:0 12px}.bgrp>summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:12px 0;font:800 19px/1.1 var(--f-display)}.bgrp>summary .old{font:400 14px var(--f-body);flex-basis:100%;margin:2px 0 0;order:3}.bgrp>summary::after{order:2}.bgrp>.stack{padding:0 0 12px}</style>'+ORDER.map(c=>{const L=out.filter(b=>b.c===c);return `<details class="bcls" id="${c}"><summary><img src="../img/icons/class-${c}.webp" alt="" width="34" height="34" style="border-radius:7px">${ctx.CLASSES[c].name}<span class="cnt">${L.length} builds</span></summary>${foldCols(L,'')}</details>`;}).join('')+'<script>(()=>{const o=()=>{const d=document.getElementById(location.hash.slice(1));if(d&&d.tagName==="DETAILS"){d.open=true;d.scrollIntoView();}};addEventListener("hashchange",o);o();})();</script>';
 urls.push('builds/');fs.writeFileSync(R+'builds/index.html',page(true,'WoW Forever Talent Builds – Meta & Off-meta for Every Class | Talentsmith',`${out.length} WoW Forever talent builds: meta and off-meta builds for every class and spec with level-by-level talent order.`,body,'builds/'));}
// ---- calculator presets (Meta / Off-meta button)
{const P={};for(const c of ORDER){const L=out.filter(b=>b.c===c).sort((x,y)=>(x.group==='off')-(y.group==='off')||KO.indexOf(x.kind)-KO.indexOf(y.kind));P[c]=L.map(b=>[b.group==='off'?'off':'meta',b.name,b.kind,b.code,b.ord,b.id,b.specSlug]);}
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
`<h1>Hotfixes &amp; changes</h1><p class="lede">Live WoW Forever hotfixes and racial changes, newest first. The talent calculator includes the Nov 10 class hotfixes. <a href="patch-nov-10.html">Nov 10 class changes, before and after →</a></p>${log}`,'changes.html'));
// ---- patch page: Nov 10 class hotfixes (EU live after the Nov 11 restart)
{const rows=(cls,items)=>`<h2><span class="tg c-${cls.toLowerCase()}" style="font-size:15px;margin-right:10px">${cls}</span></h2><div class="tbl" style="display:block"><table class="races pt"><thead><tr><th>Change</th><th>Before</th><th>Now</th></tr></thead><tbody>${items.map(([a,b,c])=>`<tr><td><b>${a}</b></td><td class="old">${b}</td><td>${c}</td></tr>`).join('')}</tbody></table></div>`;
 const body=`<style>${LOGCSS.split('\n').filter(l=>l.startsWith('.tg')).join('\n')}table.races.pt{width:100%;table-layout:fixed}table.races.pt td,table.races.pt th{white-space:normal;vertical-align:top;padding-right:16px}table.races.pt th:nth-child(1){width:26%}table.races.pt th:nth-child(2){width:32%}@media (max-width:640px){table.races.pt,table.races.pt tbody,table.races.pt tr,table.races.pt td{display:block;width:auto}table.races.pt thead{display:none}table.races.pt tr{padding:10px 12px;border-top:1px solid var(--edge)}table.races.pt td{padding:2px 0}table.races.pt td.old::before{content:"Before: ";color:var(--muted)}table.races.pt td:nth-child(3)::before{content:"Now: ";color:var(--muted)}}.pt td:nth-child(3){color:var(--gold-soft)}.pt td.old{color:var(--muted)}.pt{min-width:0}.mean{list-style:none;padding:0;display:grid;gap:10px;max-width:80ch}.mean li{padding-left:18px;position:relative;color:#d8cfbf}.mean li::before{content:"";position:absolute;left:0;top:9px;width:7px;height:7px;transform:rotate(45deg);background:var(--gold)}</style>
<p class="crumb"><a href="changes.html">Hotfixes &amp; changes</a> › November 10</p>
<h1>WoW Forever class hotfixes – November 10, 2026</h1>
<p class="lede">Blizzard's first class tuning: Enhancement Shaman goes back to Strength and Windfury, Affliction's Wrack now speeds up your DoTs, and Hunter and Warlock pets change. Live in the US on Nov 10 and in Europe after the Nov 11 restart. Every number below is from Blizzard's hotfix notes; the talent calculator already shows the new values.</p>
<p style="margin-top:14px"><a class="btn" href="calculator.html?c=shaman">Shaman calculator</a> <a class="btn ghost" href="calculator.html?c=warlock">Warlock calculator</a> <a class="btn ghost" href="calculator.html?c=hunter">Hunter calculator</a></p>
<h2>What it means</h2><ul class="mean">
<li><b>Enhancement Shaman:</b> Intellect gives much less Attack Power (Mental Dexterity 100% at 3/3 instead of 150%) and Stormstrike hits for less, less often. Strength and Attack Power gear now beat Intellect. Weapon imbues and totems also work together now, so Windfury Weapon and Windfury Totem both proc.</li>
<li><b>Affliction Warlock:</b> Wrack hits 30% softer but makes your Corruption, Siphon Life and Bane of Agony tick twice as fast while you channel. Put all three up first, then Wrack. Soul Siphon only counts those three DoTs now.</li>
<li><b>Hunter:</b> pets keep 115% of normal health (they had 150%). Arcane Shot and Summon Hawk cost 11% of base mana at every rank, and the Hawk hits about 80% harder.</li>
<li><b>Warlock pets:</b> Imp, Voidwalker, Incubus and Succubus have about 15% more health, and the Imp's first 4 Firebolt ranks hit harder.</li></ul>
${rows('Shaman',[["Stormstrike (Enhancement)","150% weapon damage, 6 sec cooldown","100% weapon damage, 8 sec cooldown"],["Mental Dexterity (Enhancement)","Intellect → Attack Power 50 / 100 / 150%","33 / 66 / 100%"],["Maelstrom Weapon (Enhancement)","4 / 8 / 12 / 16 / 20% per stack, 20 procs per minute at every rank","20% per stack at every rank, 6 / 7 / 8 / 9 / 10 procs per minute (adjusted for main-hand speed)"],["Weapon imbues and weapon totems","Didn't work together","Work together (Windfury Weapon + Windfury Totem both proc)"],["Maelstrom Weapon","–","Can be tracked in the Cooldown Manager"]])}
${rows('Warlock',[["Wrack (Affliction)","Full damage; your Shadow DoTs on the target deal 10% more","30% less damage; lasts 6 sec, ticks every second; while channeling, Corruption, Siphon Life and Bane of Agony tick 100% faster (same duration)"],["Soul Siphon (Affliction)","Counted any of your Affliction effects","4 / 8 / 12% per Corruption, Siphon Life or Bane of Agony on the target, max +36%"],["Imp","–","About 15% more health; first 4 Firebolt ranks hit harder"],["Voidwalker, Incubus, Succubus","–","About 15% more health"],["Bane of Havoc (Destruction)","No global cooldown","Triggers the global cooldown"]])}
${rows('Hunter',[["Pet health","150% of normal","115% of normal"],["Arcane Shot","Mana cost by rank","11% of base mana at every rank (about the same at 6 and 60, a bit cheaper in between)"],["Summon Hawk (Beast Mastery)","Mana cost by rank","11% of base mana at every rank; Hawk melee damage about 80% higher"]])}
${rows('Druid',[["Nature's Swiftness (Restoration)","Not usable on Wild Growth","Also makes Wild Growth instant"],["Omen of Clarity","Could stop working after a spec swap","Fixed"]])}
${rows('Warrior',[["Sweeping Strikes (Arms)","Lost charges with no second target","Only uses a charge when a second enemy is hit"]])}
${rows('Priest',[["Revelation enchant","Triggered from Vampiric Embrace healing","Fixed"],["Holy Nova (Holy)","Stayed learned after untalenting","Fixed"]])}
${rows('Paladin',[["Redoubt","–","Can be tracked in the Cooldown Manager"]])}
<h2>Everything else</h2><p style="max-width:80ch;color:#d8cfbf">The same hotfixes lower the Auction House minimum deposit to 1 copper, add gold rewards to most quests from level 48, make racial vendor mounts Bind-on-Pickup, change Rage of the Storm to Strength with a 3.6 speed, and fix many quests, professions and spawns. <a href="https://www.bluetracker.gg/wow/topic/eu-en/639885-wow-forever-hotfixes-november-10-2026/" rel="noopener">Full Blizzard notes →</a></p>
<p class="old" style="margin-top:20px">Talent builds that use these talents were re-checked: the Enhancement and Affliction builds keep their talents; the Affliction build notes now explain the new DoT-then-Wrack order. <a href="builds/">All builds →</a></p>
<div class="cta-end" style="margin:34px 0 8px;padding:22px 20px;border:1px solid var(--edge);border-radius:10px;background:rgba(233,180,76,.05);text-align:center"><h2 style="margin:0 0 6px">Try the new numbers</h2><p style="margin:0 auto 16px;max-width:60ch;color:#d8cfbf">Plan your spec with the Nov 10 values already in. Pick a class, spend 51 points and share the link.</p><p style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:0"><a class="btn" href="calculator.html" data-umami-event="patch-cta-calculator">Open the calculator</a><a class="btn ghost" href="builds/" data-umami-event="patch-cta-builds">Ready-made builds</a><a class="btn ghost" href="https://bigdforever.com/" rel="noopener"><img src="img/bigd-icon.webp" alt="" width="18" height="18" style="border-radius:50%">BigD's WoW Forever site</a></p></div>`;
 urls.push('patch-nov-10.html');
 fs.writeFileSync(R+'patch-nov-10.html',page(false,'WoW Forever Nov 10 Class Hotfixes: Enhancement, Affliction, Pet Changes | Talentsmith','Every WoW Forever class change from the November 10 hotfixes: Stormstrike, Mental Dexterity, Maelstrom Weapon, Wrack, Soul Siphon, Hunter and Warlock pets – before and after.',body,'patch-nov-10.html'));}
// ---- sitemap/robots
const today='2026-11-09';
fs.writeFileSync(R+'sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(R+'robots.txt',`User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
console.log('pages',urls.length);
