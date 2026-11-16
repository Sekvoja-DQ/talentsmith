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
function opts(C,v){const g=(k,l)=>`<optgroup label="${l}">${C.builds.filter(b=>b.group===k).map(b=>`<option value="${b.id}"${b.id===v?' selected':''}>${esc(b.name)} (${b.kind})</option>`).join('')}</optgroup>`;
 const own=v&&!C.builds.some(b=>b.id===v)?`<option value="${esc(v)}" selected>Your build (${esc(v.split('-').map(p=>p.split('').reduce((a,d)=>a+ +d,0)).join(' / '))})</option>`:'';
 return own+g('meta','Meta')+g('off','Off-meta');}
function syncUrl(){const q=new URLSearchParams({c:cls,a:pick.a,b:pick.b});history.replaceState(null,'','?'+q);}
function render(){const C=CMP.cls[cls];
 if(!codeOf(C,pick.a))pick.a=(C.builds.find(b=>b.group==='meta')||C.builds[0]).id;
 if(!codeOf(C,pick.b)||pick.b===pick.a)pick.b=(C.builds.find(b=>b.id!==pick.a&&b.group==='off')||C.builds.find(b=>b.id!==pick.a)||C.builds[0]).id;
 $('#cls').innerHTML=CMP.order.map(c=>`<button type="button" data-c="${c}" aria-pressed="${c===cls}"><img src="img/icons/class-${c}.webp" alt="" width="28" height="28">${CMP.cls[c].name}</button>`).join('');
 $('#sa').innerHTML=opts(C,pick.a);$('#sb').innerHTML=opts(C,pick.b);
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
$('#sa').addEventListener('change',e=>{pick.a=e.target.value;if(pick.a===pick.b)pick.b='';render();});
$('#sb').addEventListener('change',e=>{pick.b=e.target.value;if(pick.a===pick.b)pick.a='';render();});
$('#paste').addEventListener('submit',e=>{e.preventDefault();const f=$('#link'),m=$('#pmsg');let q;try{q=new URL(f.value.trim(),location.href).searchParams;}catch(_){q=null;}
 const c=q&&q.get('c'),b=q&&q.get('b');
 if(!c||!CMP.cls[c]||!b||!/^[0-9-]+$/.test(b)){m.textContent='That is not a calculator link. Copy it with "Copy build link" in the calculator.';return;}
 if(c!==cls){cls=c;pick.a='';}pick.b=b;if(pick.a===b)pick.a='';m.textContent='';f.value='';render();
 if(window.umami)umami.track('compare-paste',{class:c});});
render();
})();
