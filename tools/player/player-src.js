/* Talentsmith leveling player – mounted on build pages and play.html. rankText() is prepended by gen-pages.js. */
(function(){
const CSS=`.tsp{--tp-gap:12px}
.tsp .tp-top{display:flex;justify-content:flex-end;margin:0 0 10px}
.tsp .seg{display:inline-flex;border:1px solid var(--edge);border-radius:999px;overflow:hidden}
.tsp .seg button{font:600 14px/1 var(--f-body);padding:9px 16px;background:none;border:0;color:var(--muted);cursor:pointer}
.tsp .seg button[aria-pressed="true"]{background:var(--gold);color:#1a1205}
.tsp .now{transition:opacity .35s ease;display:flex;align-items:center;gap:12px;height:76px;overflow:hidden;background:var(--plate);border:1px solid var(--edge);border-radius:12px;padding:10px 14px;margin:0 0 12px}
.tsp .now .lv{font:800 12px var(--f-body);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);min-width:58px}
.tsp .now .lv b{display:block;font:800 26px/1 var(--f-display);color:var(--gold-soft);letter-spacing:0}
.tsp .now img{width:40px;height:40px;border-radius:7px;border:2px solid var(--gold);flex:none}
.tsp .now .mid{min-width:0}.tsp .now .nm{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tsp .now .nm small{color:var(--muted);font-weight:600;margin-left:6px}
.tsp .now p{margin:2px 0 0;color:#d8cfbf;font-size:14.5px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.tsp .now .nx{margin-left:auto;text-align:right;color:var(--muted);font-size:13px;flex:none;max-width:30%}.tsp .now .nx b{display:block;color:#cfc6b6;font-size:14px}
.tsp .tabs{display:none;gap:6px;margin:0 0 10px}
.tsp .tabs button{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;font:700 14px var(--f-body);padding:8px 6px;border-radius:9px;border:1px solid var(--edge);background:var(--plate);color:var(--muted);cursor:pointer}
.tsp .tabs button img{width:20px;height:20px;border-radius:4px}.tsp .tabs button[aria-pressed="true"]{border-color:var(--gold);color:var(--gold-soft)}
.tsp .stage{position:relative}.tsp .trees{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.tsp .tree{position:relative;background:linear-gradient(180deg,rgba(11,14,21,.45),rgba(11,14,21,.72)),var(--bg) center top/cover no-repeat,var(--plate);border:1px solid var(--edge);border-radius:10px;padding:10px 10px 12px;transition:filter .9s ease,border-color .9s ease}
.tsp .tree.dim{filter:grayscale(.85) brightness(.5)}.tsp .tree.on{border-color:rgba(233,180,76,.55)}
.tsp .th{display:flex;align-items:center;gap:8px;font:800 17px var(--f-display);color:var(--gold-soft);margin:0 0 6px}.tsp .th img{width:24px;height:24px;border-radius:5px}.tsp .th span{margin-left:auto;font:700 14px var(--f-body);color:var(--muted)}
.tsp .grid{position:relative;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(7,84px);gap:2px}
.tsp .grid svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
.tsp .cell{display:flex;flex-direction:column;align-items:center}
.tsp .node{position:relative;width:44px;height:44px;margin-top:4px;border-radius:7px;border:2px solid #4a5163;background:#1a1f2b center/cover no-repeat;transition:border-color .5s ease,box-shadow .5s ease,filter .6s ease,transform .35s ease;filter:grayscale(1) brightness(.55)}
.tsp .node.some{filter:none;border-color:#6fd28c;box-shadow:0 0 10px rgba(111,210,140,.35)}.tsp .node.max{filter:none;border-color:var(--gold);box-shadow:0 0 14px rgba(255,122,47,.55)}.tsp .node.pop{transform:scale(1.12)}
.tsp .node .rk{position:absolute;right:-9px;bottom:-7px;font:700 11px/1 var(--f-body);background:var(--night);border:1px solid #4a5163;border-radius:4px;padding:2px 4px;color:var(--muted)}
.tsp .node.some .rk{color:#6fd28c;border-color:#6fd28c}.tsp .node.max .rk{color:var(--gold-soft);border-color:var(--gold)}
.tsp .lbl{font:600 11.5px/1.15 var(--f-body);color:#bdb3a2;text-align:center;margin-top:6px;max-width:92px}.tsp .node.some+.lbl,.tsp .node.max+.lbl{color:var(--ink)}
.tsp canvas.fx{position:absolute;inset:0;pointer-events:none;z-index:5}
.tsp .player{position:sticky;bottom:8px;z-index:10;margin-top:14px;background:rgba(17,21,31,.96);backdrop-filter:blur(6px);border:1px solid var(--edge);border-radius:14px;padding:10px 14px 8px}
.tsp .ctrls{display:flex;align-items:center;gap:8px}
.tsp .ctrls button{width:42px;height:42px;border-radius:50%;border:1px solid var(--edge);background:var(--plate);color:var(--ink);display:grid;place-items:center;cursor:pointer;flex:none;padding:0}
.tsp .ctrls button svg{width:18px;height:18px;fill:currentColor}.tsp .ctrls button.play{width:54px;height:54px;background:linear-gradient(180deg,#3fd585,#1f9d57);border:0;color:#fff;box-shadow:0 0 0 4px rgba(63,213,133,.16),0 6px 18px rgba(47,191,113,.4),inset 0 1px 0 rgba(255,255,255,.3);transition:transform .15s,box-shadow .15s}.tsp .ctrls button.play:hover{transform:scale(1.05);box-shadow:0 0 0 6px rgba(63,213,133,.2),0 8px 22px rgba(47,191,113,.5)}.tsp .ctrls button.play svg{width:22px;height:22px}
.tsp .ctrls button:focus-visible,.tsp .seg button:focus-visible{outline:2px solid var(--gold-soft);outline-offset:2px}
.tsp .lvtxt{margin-left:auto;font:700 14px var(--f-body);color:var(--muted);font-variant-numeric:tabular-nums;text-align:right}
.tsp .bar{position:relative;margin:10px 4px 0}.tsp .bar input{width:100%;margin:0;accent-color:var(--gold);height:28px;cursor:pointer}
.tsp .ticks{position:relative;height:14px;font:600 11px var(--f-body);color:var(--muted)}.tsp .ticks span{position:absolute;transform:translateX(-50%)}
.tsp .chg{position:absolute;top:2px;height:6px;width:2px;border-radius:1px;transform:translateX(-50%);pointer-events:none}
.tsp .list{display:none}.tsp .list table{width:100%;border-collapse:collapse}.tsp .list td{padding:7px 12px;border-top:1px solid var(--edge);font-size:15px}
.tsp .list tr{cursor:pointer}.tsp .list tr.cur td{background:rgba(233,180,76,.12)}.tsp .list img{width:24px;height:24px;border-radius:4px;vertical-align:-6px;margin-right:8px}
.tsp.text .stage,.tsp.text .tabs,.tsp.text .now,.tsp.text .player{display:none}.tsp.text .list{display:block}
@media(max-width:820px){.tsp .now{height:96px}.tsp .vp{overflow:hidden;border-radius:10px}.tsp .trees{display:flex;gap:0;transition:transform .85s cubic-bezier(.65,0,.35,1);will-change:transform}.tsp .tree{flex:0 0 100%}.tsp .tabs{display:flex}.tsp .tree.dim{filter:grayscale(.6) brightness(.7)}.tsp .now .nx{display:none}}
@media (prefers-reduced-motion:reduce){.tsp .tree,.tsp .node,.tsp .trees{transition:none}}`;
const ICO={reset:'<path d="M12 5V2L7 6l5 4V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"/>',prev:'<path d="M6 6h2v12H6zM9.5 12 18 6v12z"/>',play:'<path d="M8 5v14l11-7z"/>',pause:'<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>',next:'<path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z"/>'};
const TC=["#f6d68e","#7fb2ff","#ff8a5c"];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function mount(root,D,opt){opt=opt||{};
 if(!document.getElementById("tsp-css")){const st=document.createElement("style");st.id="tsp-css";st.textContent=CSS;document.head.appendChild(st);}
 const N=D.seq.length;let k=0,playing=false,timer=null,showTree=0,manualTab=false;
 D.seq.forEach((s,j)=>{let r=0;for(let q=0;q<=j;q++){if(D.seq[q].t===s.t&&D.seq[q].i===s.i)r++;}s.r=r;});
 root.classList.add("tsp");
 root.innerHTML=`<div class="tp-top"><div class="seg"><button type="button" data-m="anim" aria-pressed="true">Animation</button><button type="button" data-m="text" aria-pressed="false">Text</button></div></div>
 <div class="now"></div><div class="tabs"></div><div class="stage"><div class="vp"><div class="trees"></div></div><canvas class="fx"></canvas></div><div class="list"></div>
 <div class="player"><div class="ctrls"><button type="button" data-a="reset" title="Back to the start" aria-label="Back to the start"><svg viewBox="0 0 24 24">${ICO.reset}</svg></button><button type="button" data-a="prev" title="One level back" aria-label="One level back"><svg viewBox="0 0 24 24">${ICO.prev}</svg></button><button type="button" class="play" data-a="play" title="Play" aria-label="Play"><svg viewBox="0 0 24 24">${ICO.play}</svg></button><button type="button" data-a="next" title="One level forward" aria-label="One level forward"><svg viewBox="0 0 24 24">${ICO.next}</svg></button><span class="lvtxt"></span></div>
 <div class="bar"><div class="marks"></div><input type="range" min="0" max="${N}" value="0" aria-label="Level"><div class="ticks"></div></div></div>`;
 const q=s=>root.querySelector(s),treesEl=q(".trees"),nodeEl=D.trees.map(()=>[]);
 const nameOf=(t,i)=>D.trees[t].t[i];
 D.trees.forEach((t,ti)=>{const el=document.createElement("div");el.className="tree";el.style.setProperty("--bg",`url(${t.bg})`);el.dataset.t=ti;
  el.innerHTML=`<div class="th"><img src="${t.icon}" alt="">${esc(t.name)}<span>0</span></div><div class="grid"><svg></svg></div>`;const g=el.querySelector(".grid");
  t.t.forEach((x,i)=>{const c=document.createElement("div");c.className="cell";c.style.gridRow=x.r;c.style.gridColumn=x.c;c.innerHTML=`<div class="node" style="background-image:url(${x.i})"><span class="rk">0/${x.m}</span></div><div class="lbl">${esc(x.n)}</div>`;g.appendChild(c);nodeEl[ti][i]=c.querySelector(".node");});
  treesEl.appendChild(el);});
 const tabs=q(".tabs");D.trees.forEach((t,ti)=>{const b=document.createElement("button");b.type="button";b.dataset.t=ti;b.innerHTML=`<img src="${t.icon}" alt="">${esc(t.name)}`;tabs.appendChild(b);});
 tabs.addEventListener("click",e=>{const b=e.target.closest("[data-t]");if(!b)return;showTree=+b.dataset.t;manualTab=true;paintTabs();});
 const narrow=()=>matchMedia("(max-width:820px)").matches;
 function paintTabs(){tabs.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",+b.dataset.t===showTree));treesEl.style.transform=narrow()?`translateX(${-showTree*100}%)`:"";requestAnimationFrame(drawLinks);}
 let P=D.trees.map(t=>t.t.map(()=>0));
 function drawLinks(){root.querySelectorAll(".tree").forEach(tr=>{const ti=+tr.dataset.t,g=tr.querySelector(".grid"),s=g.querySelector("svg"),gb=g.getBoundingClientRect();if(!gb.width)return;let h="";
  D.trees[ti].t.forEach((x,i)=>{if(!x.q)return;const r=D.trees[ti].t.findIndex(y=>y.n===x.q);if(r<0)return;const a=nodeEl[ti][r].getBoundingClientRect(),b=nodeEl[ti][i].getBoundingClientRect();
   const c=P[ti][r]>=D.trees[ti].t[r].m?"#e9b44c":"rgba(214,196,166,.28)";let x1,y1,x2,y2;
   if(Math.abs(a.top-b.top)<4){const d=b.left>a.left?1:-1;y1=y2=a.top+a.height/2-gb.top;x1=(d>0?a.right+6:a.left-6)-gb.left;x2=(d>0?b.left-7:b.right+7)-gb.left;}
   else{x1=x2=a.left+a.width/2-gb.left;y1=a.bottom+22-gb.top;y2=b.top-7-gb.top;}
   const L=Math.hypot(x2-x1,y2-y1)||1,ux=(x2-x1)/L,uy=(y2-y1)/L,px=-uy,py=ux,hh=6;
   h+=`<line x1="${x1}" y1="${y1}" x2="${x2-ux*hh*.6}" y2="${y2-uy*hh*.6}" stroke="${c}" stroke-width="2" stroke-linecap="round"/><path d="M${x2} ${y2}L${x2-ux*hh+px*hh*.65} ${y2-uy*hh+py*hh*.65}L${x2-ux*hh-px*hh*.65} ${y2-uy*hh-py*hh*.65}Z" fill="${c}"/>`;});s.innerHTML=h;});}
 // text view: the page's own level table, or a generated list
 const list=q(".list");
 if(opt.textEl){list.appendChild(opt.textEl);}
 else list.innerHTML=`<div class="tbl"><table><tbody>${D.seq.map((s,j)=>{const x=nameOf(s.t,s.i);return `<tr data-k="${j+1}"><td>${j+10}</td><td><img src="${x.i}" alt="">${esc(x.n)} <span style="color:var(--muted)">${s.r}/${x.m}</span></td><td style="color:var(--muted)">${esc(D.trees[s.t].name)}</td></tr>`;}).join("")}</tbody></table></div>`;
 list.addEventListener("click",e=>{const r=e.target.closest("tr[data-k]");if(r){stop();go(+r.dataset.k,true);setMode("anim");}});
 q(".marks").innerHTML=D.seq.map((s,j)=>{const nw=j===0||D.seq[j-1].t!==s.t||D.seq[j-1].i!==s.i;return nw?`<span class="chg" style="left:${(j+1)/N*100}%;background:${TC[s.t]}"></span>`:"";}).join("");
 q(".ticks").innerHTML=[10,20,30,40,50,60].filter(l=>l-9<=N).map(l=>`<span style="left:${(l-9)/N*100}%">${l}</span>`).join("");
 const seek=q('input[type=range]');
 function compute(kk){P=D.trees.map(t=>t.t.map(()=>0));for(let j=0;j<kk;j++){const s=D.seq[j];P[s.t][s.i]=s.r;}}
 function nextNew(kk){const cur=kk>0?D.seq[kk-1]:null;for(let j=kk;j<N;j++){const s=D.seq[j];if(!cur||s.t!==cur.t||s.i!==cur.i)return s;}return null;}
 const txt=(s)=>{const x=nameOf(s.t,s.i);try{return rankText(x.x||"",s.r,x.m).t;}catch(e){return x.x||"";}};
 function paint(){compute(k);
  D.trees.forEach((t,ti)=>{let sum=0;t.t.forEach((x,i)=>{const r=P[ti][i];sum+=r;const n=nodeEl[ti][i];n.classList.toggle("some",r>0&&r<x.m);n.classList.toggle("max",r>=x.m);n.querySelector(".rk").textContent=r+"/"+x.m;});root.querySelector(`.tree[data-t="${ti}"] .th span`).textContent=sum;});
  const cur=k>0?D.seq[k-1]:null,nx=nextNew(k),act=cur?cur.t:(nx?nx.t:0);
  root.querySelectorAll(".tree").forEach(t=>{t.classList.toggle("dim",+t.dataset.t!==act);t.classList.toggle("on",+t.dataset.t===act);});
  if(!manualTab||playing){showTree=act;manualTab=false;}paintTabs();
  const lv=k+9;q(".lvtxt").textContent=k?`Level ${lv} · ${k}/${N} points`:"Level 9 · no points yet";seek.value=k;
  const nxh=nx?`<div class="nx">Next<b>${esc(nameOf(nx.t,nx.i).n)}</b></div>`:"";
  if(cur){const x=nameOf(cur.t,cur.i);q(".now").innerHTML=`<div class="lv">Level<b>${lv}</b></div><img src="${x.i}" alt=""><div class="mid"><div class="nm">${esc(x.n)}<small>${cur.r}/${x.m} · ${esc(D.trees[cur.t].name)}</small></div><p>${esc(txt(cur))}</p></div>${nxh}`;}
  else q(".now").innerHTML=`<div class="lv">Level<b>9</b></div><div class="mid"><div class="nm">Press play</div><p>Your first talent point comes at level 10.</p></div>${nxh}`;
  list.querySelectorAll("tr[data-k]").forEach(r=>r.classList.toggle("cur",+r.dataset.k===k));
  FX.cur=cur?nodeEl[cur.t][cur.i]:null;FX.next=nx?nodeEl[nx.t][nx.i]:null;
  const pb=q('[data-a="play"]');pb.querySelector("svg").innerHTML=playing?ICO.pause:ICO.play;pb.setAttribute("aria-label",playing?"Pause":"Play");pb.title=playing?"Pause":"Play";
  requestAnimationFrame(drawLinks);}
 let scrollAnim=0;const SE=document.scrollingElement||document.documentElement;
 function glide(to,dur){cancelAnimationFrame(scrollAnim);const from=SE.scrollTop,d=Math.max(0,Math.min(to,SE.scrollHeight-innerHeight))-from;if(Math.abs(d)<4)return;const t0=performance.now();
  const f=now=>{const x=Math.min(1,(now-t0)/dur),e=x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;SE.scrollTop=from+d*e;if(x<1)scrollAnim=requestAnimationFrame(f);};scrollAnim=requestAnimationFrame(f);}
 ["wheel","touchstart"].forEach(ev=>addEventListener(ev,()=>cancelAnimationFrame(scrollAnim),{passive:true}));
 function follow(el){if(!el||!playing)return;const r=el.getBoundingClientRect(),ph=q(".player").getBoundingClientRect().height+24;if(r.top<90||r.bottom>innerHeight-ph-10)glide(SE.scrollTop+r.top-(innerHeight-ph)/2+r.height/2,900);}
 function go(nk,quiet){const was=k;k=Math.max(0,Math.min(N,nk));paint();const s=k>0?D.seq[k-1]:null;
  if(s){const el=nodeEl[s.t][s.i];setTimeout(()=>follow(el),narrow()?450:0);if(!quiet&&k===was+1){const fire=()=>{FX.burst(el);el.classList.add("pop");setTimeout(()=>el.classList.remove("pop"),350);};const moved=was>0&&D.seq[was-1].t!==s.t;setTimeout(fire,moved?850:0);}}}
 function delay(){if(k>=N)return null;const s=D.seq[k],p=k>0?D.seq[k-1]:null;return p&&p.t===s.t&&p.i===s.i?500:2000;}
 function tick(){if(!playing)return;if(k>=N){stop();return;}go(k+1);const d=delay();if(d==null){stop();return;}timer=setTimeout(tick,d);}
 function start(){if(k>=N)go(0,true);playing=true;paint();clearTimeout(timer);timer=setTimeout(tick,k===0?600:delay());if(window.umami)try{umami.track("player-play")}catch(e){}}
 function stop(){playing=false;clearTimeout(timer);paint();}
 q(".ctrls").addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;
  if(a==="play")playing?stop():start();else if(a==="next"){stop();go(k+1);}else if(a==="prev"){stop();go(k-1,true);}else if(a==="reset"){stop();go(0,true);}});
 seek.addEventListener("input",e=>{const v=+e.target.value;playing=false;clearTimeout(timer);go(v,true);});
 function setMode(m){root.classList.toggle("text",m==="text");q(".seg").querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x.dataset.m===m));if(m==="anim")requestAnimationFrame(()=>{FX.size();drawLinks();});}
 q(".seg").addEventListener("click",e=>{const b=e.target.closest("[data-m]");if(!b)return;if(b.dataset.m==="text")stop();setMode(b.dataset.m);});
 addEventListener("resize",()=>{FX.size();paintTabs();});
 // particle trails
 const FX=(()=>{const cv=q("canvas.fx"),cx=cv.getContext("2d"),st=q(".stage");let W=0,H=0,dpr=1;const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
  function size(){const r=st.getBoundingClientRect();dpr=Math.min(2,devicePixelRatio||1);W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+"px";cv.style.height=H+"px";}
  const parts=[],rings=[];
  function rectOf(el){if(!el)return null;const a=el.getBoundingClientRect(),b=st.getBoundingClientRect();if(!a.width)return null;return{x:a.left-b.left,y:a.top-b.top,w:a.width,h:a.height};}
  function perim(R,pad,t){const x=R.x-pad,y=R.y-pad,w=R.w+2*pad,h=R.h+2*pad,L=2*(w+h);let d=((t%1)+1)%1*L;if(d<w)return[x+d,y];d-=w;if(d<h)return[x+w,y+d];d-=h;if(d<w)return[x+w-d,y+h];d-=w;return[x,y+h-d];}
  const mk=o=>({o,head:null,trail:[],t:Math.random(),from:null,fly:1,target:null});
  const S=[mk({pad:7,speed:.85,len:34,width:3.2,alpha:1,glow:46,spark:.9}),mk({pad:5,speed:.45,len:16,width:2,alpha:.42,glow:26,spark:.25})];
  function step(s,el,dt){const R=rectOf(el);if(!R){s.trail.length=0;s.head=null;s.target=null;return null;}
   if(s.target!==el){s.from=s.head?[...s.head]:null;s.target=el;s.fly=s.from?0:1;}
   s.t+=s.o.speed*dt;const p=perim(R,s.o.pad,s.t);
   if(s.fly<1){s.fly=Math.min(1,s.fly+dt/0.9);const e=s.fly<.5?4*s.fly*s.fly*s.fly:1-Math.pow(-2*s.fly+2,3)/2,mx=(s.from[0]+p[0])/2,my=Math.min(s.from[1],p[1])-40,u=1-e;s.head=[u*u*s.from[0]+2*u*e*mx+e*e*p[0],u*u*s.from[1]+2*u*e*my+e*e*p[1]];}else s.head=p;
   s.trail.unshift([...s.head]);if(s.trail.length>s.o.len)s.trail.length=s.o.len;
   if(!RM&&Math.random()<s.o.spark){const a=Math.random()*Math.PI*2,v=20+Math.random()*50;parts.push({x:s.head[0],y:s.head[1],vx:Math.cos(a)*v,vy:Math.sin(a)*v-10,life:0,max:.35+Math.random()*.35,r:1+Math.random()*1.6,c:s.o.alpha>.9?"255,200,110":"200,190,170",a:s.o.alpha});}
   return R;}
  function draw(s,R){if(!s.head)return;cx.save();cx.globalCompositeOperation="lighter";
   if(R){const g=cx.createRadialGradient(R.x+R.w/2,R.y+R.h/2,0,R.x+R.w/2,R.y+R.h/2,s.o.glow);g.addColorStop(0,`rgba(255,190,90,${.22*s.o.alpha})`);g.addColorStop(1,"rgba(255,190,90,0)");cx.fillStyle=g;cx.beginPath();cx.arc(R.x+R.w/2,R.y+R.h/2,s.o.glow,0,7);cx.fill();}
   for(let j=1;j<s.trail.length;j++){const f=1-j/s.trail.length,a=s.trail[j-1],b=s.trail[j];cx.strokeStyle=`rgba(255,${170+60*f|0},${80+80*f|0},${f*s.o.alpha})`;cx.lineWidth=s.o.width*(.35+f);cx.lineCap="round";cx.beginPath();cx.moveTo(a[0],a[1]);cx.lineTo(b[0],b[1]);cx.stroke();}
   const h=s.head,g2=cx.createRadialGradient(h[0],h[1],0,h[0],h[1],9);g2.addColorStop(0,`rgba(255,240,200,${s.o.alpha})`);g2.addColorStop(1,"rgba(255,180,80,0)");cx.fillStyle=g2;cx.beginPath();cx.arc(h[0],h[1],9,0,7);cx.fill();cx.restore();}
  function burst(el){if(RM)return;const R=rectOf(el);if(!R)return;const x=R.x+R.w/2,y=R.y+R.h/2;
   for(let j=0;j<46;j++){const a=Math.random()*Math.PI*2,v=60+Math.random()*170;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:0,max:.45+Math.random()*.5,r:1.2+Math.random()*2.4,c:Math.random()<.5?"255,200,110":"255,130,60",a:1});}rings.push({x,y,life:0});}
  let last=performance.now(),vis=true;
  if("IntersectionObserver" in window)new IntersectionObserver(es=>{vis=es[0].isIntersecting;}).observe(st);
  function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;
   if(vis&&!root.classList.contains("text")){cx.setTransform(dpr,0,0,dpr,0,0);cx.clearRect(0,0,W,H);
    const R1=step(S[1],api.next!==api.cur?api.next:null,dt),R0=step(S[0],api.cur,dt);draw(S[1],R1);draw(S[0],R0);
    cx.save();cx.globalCompositeOperation="lighter";
    for(let j=rings.length-1;j>=0;j--){const r=rings[j];r.life+=dt;const f=r.life/.55;if(f>=1){rings.splice(j,1);continue;}cx.strokeStyle=`rgba(255,200,120,${1-f})`;cx.lineWidth=3*(1-f)+.5;cx.beginPath();cx.arc(r.x,r.y,22+f*48,0,7);cx.stroke();}
    for(let j=parts.length-1;j>=0;j--){const p=parts[j];p.life+=dt;if(p.life>=p.max){parts.splice(j,1);continue;}p.vx*=.96;p.vy=p.vy*.96+30*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;const f=1-p.life/p.max;cx.fillStyle=`rgba(${p.c},${f*p.a})`;cx.beginPath();cx.arc(p.x,p.y,p.r*f+.3,0,7);cx.fill();}
    cx.restore();}
   requestAnimationFrame(loop);}
  const api={cur:null,next:null,burst,size};size();requestAnimationFrame(loop);return api;})();
 paint();FX.size();
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{FX.size();drawLinks();});
 return {go,start,stop};}
// decode a calculator link (?c=&b=&o=) against class data
const ALPH="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
function decode(trees,o){const off=trees.map((_,k)=>trees.slice(0,k).reduce((a,t)=>a+t.t.length,0)),seq=[];
 for(const ch of o||""){const g=ALPH.indexOf(ch);if(g<0)continue;let ti=0;for(let k=trees.length-1;k>=0;k--)if(g>=off[k]){ti=k;break;}const i=g-off[ti];if(i<trees[ti].t.length)seq.push({t:ti,i});}return seq;}
window.TSPlayer={mount,decode};
})();
