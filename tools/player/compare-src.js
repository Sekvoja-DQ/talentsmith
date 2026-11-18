/* Talentsmith build comparison (review #35 prototype). Inlined into compare.html by gen-pages.js.
   Needs CMP = {order:[cls...], cls:{<cls>:{name, trees:[{name,bg,icon,t:[{n,m,r,c,q,i,x}]}], builds:[{id,name,group,kind,code,ord}]}}} */
(function(){
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const U=new URLSearchParams(location.search);
let cls=CMP.cls[U.get('c')]?U.get('c'):'paladin';
const pick={a:U.get('a')||'',b:U.get('b')||''};
// code "0532-00051-…" = ranks per talent in tree order, trees joined by "-"
const parse=(C,code)=>C.trees.map((t,ti)=>{const d=(String(code).split('-')[ti]||'').split('').map(Number);return t.t.map((_,i)=>Math.min(d[i]||0,t.t[i].m));});
const codeOf=(C,v)=>{if(!v)return null;const b=C.builds.find(x=>x.id===v);if(b)return b.code;return /^[0-9-]+$/.test(v)?v:null;};
const label=(C,v)=>{const b=C.builds.find(x=>x.id===v);return b?b.name:(v?'Your build':'–');};
const CHEV='<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const sumOf=v=>parse(CMP.cls[cls],v).map(t=>t.reduce((a,d)=>a+d,0));
const KIND={Raid:'Raid',Tank:'Tank',Healer:'Healer',Leveling:'Leveling',PvP:'PvP',DPS:'DPS'};
function selHtml(C,v){const b=C.builds.find(x=>x.id===v);
 if(b)return `<img src="img/specs/${b.s}.webp" alt=""><span class="nm">${esc(b.name)}</span><span class="mk"></span><span class="kd">${esc(b.kind)}</span>${CHEV}`;
 return `<img src="img/icons/class-${cls}.webp" alt=""><span class="nm">Your build (${sumOf(v).join(' / ')})</span><span class="mk"></span><span class="kd">Custom</span>${CHEV}`;}
function listHtml(C,k){const mine=pick[k],other=pick[k==='a'?'b':'a'],O=k==='a'?'b':'a';
 const g=(grp,l,cl)=>`<h4 class="${cl}">${l}</h4>`+C.builds.filter(b=>b.group===grp).map(b=>`<button type="button" class="it" role="option" data-v="${b.id}" aria-selected="${b.id===mine}"><img src="img/specs/${b.s}.webp" alt="" loading="lazy"><span class="nm">${esc(b.name)}</span>${b.id===other?`<span class="ot ${O}" title="Picked as ${O.toUpperCase()} – choosing it swaps">${O.toUpperCase()}</span>`:''}<span class="kd">${esc(b.kind)}</span></button>`).join('');
 const own=mine&&!C.builds.some(b=>b.id===mine)?`<h4>Custom</h4><button type="button" class="it" role="option" data-v="${esc(mine)}" aria-selected="true"><img src="img/icons/class-${cls}.webp" alt=""><span class="nm">Your build (${sumOf(mine).join(' / ')})</span><span class="kd">Custom</span></button>`:'';
 return own+g('meta','Meta','')+g('off','Off-meta','off');}
function custHtml(k){return `<div class="cust"><p>Paste a link from the calculator (<b>Copy build link</b>) to use your own build as <b>${k.toUpperCase()}</b>.</p><form data-k="${k}"><input type="text" inputmode="url" autocomplete="off" placeholder="Paste your calculator link" aria-label="Calculator link for build ${k.toUpperCase()}"><button class="btn" type="submit">Use</button></form><p class="err" role="status"></p></div>`;}
let open=null; // {k, mode:'list'|'custom'}
function closePop(){document.querySelectorAll('.slot .pop').forEach(p=>p.hidden=true);document.querySelectorAll('.combo button').forEach(b=>b.setAttribute('aria-expanded','false'));document.querySelectorAll('.combo .own').forEach(b=>b.classList.remove('on'));open=null;}
function openPop(k,mode){const C=CMP.cls[cls],sl=document.querySelector('.slot.s'+k),pp=sl.querySelector('.pop');closePop();
 pp.innerHTML=mode==='list'?listHtml(C,k):custHtml(k);pp.setAttribute('role',mode==='list'?'listbox':'dialog');pp.hidden=false;open={k,mode};
 const btn=sl.querySelector(mode==='list'?'.sel':'.own');btn.setAttribute('aria-expanded','true');if(mode!=='list')btn.classList.add('on');
 const f=pp.querySelector(mode==='list'?'[aria-selected="true"]':'input');if(f){if(mode==='list')f.scrollIntoView({block:'nearest'});f.focus({preventScroll:mode==='list'});}}
function choose(k,v){const O=k==='a'?'b':'a';if(v===pick[O])pick[O]=pick[k];pick[k]=v;closePop();render();}
function syncUrl(){const q=new URLSearchParams({c:cls,a:pick.a,b:pick.b});history.replaceState(null,'','?'+q);}
function render(){const C=CMP.cls[cls];
 if(!codeOf(C,pick.a))pick.a=(C.builds.find(b=>b.group==='meta')||C.builds[0]).id;
 if(!codeOf(C,pick.b)||pick.b===pick.a)pick.b=(C.builds.find(b=>b.id!==pick.a&&b.group==='off')||C.builds.find(b=>b.id!==pick.a)||C.builds[0]).id;
 $('#cls').innerHTML=CMP.order.map(c=>`<button type="button" data-c="${c}" aria-pressed="${c===cls}"><img src="img/icons/class-${c}.webp" alt="" width="28" height="28">${CMP.cls[c].name}</button>`).join('');
 document.querySelector('.slot.sa .sel').innerHTML=selHtml(C,pick.a);document.querySelector('.slot.sb .sel').innerHTML=selHtml(C,pick.b);
 const A=parse(C,codeOf(C,pick.a)),B=parse(C,codeOf(C,pick.b)),sum=P=>P.map(t=>t.reduce((x,y)=>x+y,0));
 const sa=sum(A),sb=sum(B);
 $('#split').innerHTML=`<span class="ka">A</span> ${esc(label(C,pick.a))} <b>${sa.join(' / ')}</b><span class="vs">vs</span><span class="kb">B</span> ${esc(label(C,pick.b))} <b>${sb.join(' / ')}</b>`;
 let diffs=[],same=0;
 $('#trees').innerHTML=C.trees.map((t,ti)=>{let cells='';
  t.t.forEach((x,i)=>{const a=A[ti][i],b=B[ti][i];let k='';if(a&&b){k=a===b?'both':'both diff';}else if(a)k='onlya';else if(b)k='onlyb';
   same+=Math.min(a,b);if(a!==b)diffs.push({ti,x,a,b});
   const badge=a&&b&&a===b?`<span class="rk">${a}/${x.m}</span>`:(a||b)?`<span class="rk">${a?`<i class="a">${a}</i>`:''}${a&&b?'|':''}${b?`<i class="b">${b}</i>`:''}</span>`:'';
   cells+=`<div class="cell" style="grid-row:${x.r};grid-column:${x.c}"><div class="node ${k}" style="background-image:url('${x.i}')" title="${esc(x.n)} – A ${a}/${x.m}, B ${b}/${x.m}">${badge}</div><div class="lbl">${esc(x.n)}</div></div>`;});
  return `<div class="tree" style="--bg:url('${t.bg}')"><div class="th"><img src="${t.icon}" alt="">${esc(t.name)}<span><i class="a">${sa[ti]}</i> · <i class="b">${sb[ti]}</i></span></div><div class="grid">${cells}</div></div>`;}).join('');
 const tot=Math.max(sa.reduce((x,y)=>x+y,0),sb.reduce((x,y)=>x+y,0)),moved=tot-same;
 $('#sum').innerHTML=diffs.length?`<b>${same}</b> of ${tot} points are the same. <b>${moved}</b> point${moved===1?'':'s'} differ${moved===1?'s':''}.`:'These two builds are identical.';
 const row=d=>`<li><img src="${d.x.i}" alt="" width="32" height="32"><span class="nm">${esc(d.x.n)}<small>${esc(C.trees[d.ti].name)}</small></span><span class="rr"><i class="a">A ${d.a}/${d.x.m}</i><i class="b">B ${d.b}/${d.x.m}</i></span><p>${esc(d.x.x)}</p></li>`;
 const onlyA=diffs.filter(d=>d.a>d.b),onlyB=diffs.filter(d=>d.b>d.a);
 $('#diff').innerHTML=diffs.length?`<div class="col"><h3><span class="ka">A</span> has more in</h3><ul>${onlyA.map(row).join('')}</ul></div><div class="col"><h3><span class="kb">B</span> has more in</h3><ul>${onlyB.map(row).join('')}</ul></div>`:'';
 const calc=v=>{const b=C.builds.find(x=>x.id===v);return `calculator.html?c=${cls}&b=${b?b.code:v}${b?'&o='+b.ord:''}`;};
 $('#ca').href=calc(pick.a);$('#cb').href=calc(pick.b);
 syncUrl();}
document.addEventListener('click',e=>{const b=e.target.closest('#cls button');if(b){cls=b.dataset.c;pick.a=pick.b='';render();}
 if(e.target.id==='swap'){[pick.a,pick.b]=[pick.b,pick.a];render();}});
document.addEventListener('click',e=>{const sl=e.target.closest('.slot');
 if(!sl){if(open&&!e.target.closest('.pop'))closePop();return;}
 const k=sl.dataset.s;
 if(e.target.closest('.sel')){open&&open.k===k&&open.mode==='list'?closePop():openPop(k,'list');return;}
 if(e.target.closest('.own')){open&&open.k===k&&open.mode==='custom'?closePop():openPop(k,'custom');return;}
 const it=e.target.closest('.pop .it');if(it)choose(k,it.dataset.v);});
document.addEventListener('keydown',e=>{if(!open)return;if(e.key==='Escape'){const k=open.k;closePop();document.querySelector('.slot.s'+k+' .sel').focus();}
 if((e.key==='ArrowDown'||e.key==='ArrowUp')&&open.mode==='list'){e.preventDefault();const its=[...document.querySelectorAll('.slot.s'+open.k+' .pop .it')],i=its.indexOf(document.activeElement);const n=its[Math.max(0,Math.min(its.length-1,i+(e.key==='ArrowDown'?1:-1)))];if(n)n.focus();}});
document.addEventListener('submit',e=>{const f=e.target.closest('.cust form');if(!f)return;e.preventDefault();const k=f.dataset.k,inp=f.querySelector('input'),m=f.parentElement.querySelector('.err');let q;try{q=new URL(inp.value.trim(),location.href).searchParams;}catch(_){q=null;}
 const c=q&&q.get('c'),b=q&&q.get('b');
 if(!c||!CMP.cls[c]||!b||!/^[0-9-]+$/.test(b)){m.textContent='That is not a calculator link. Copy it with "Copy build link" in the calculator.';return;}
 if(c!==cls){cls=c;pick[k==='a'?'b':'a']='';}choose(k,b);
 if(window.umami)umami.track('compare-paste',{class:c,slot:k});});
render();
})();
