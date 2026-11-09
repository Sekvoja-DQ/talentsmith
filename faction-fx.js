/* Talentsmith – animated faction buttons (home page).
   Horde: soft fire bed (80% soft particles, 20% sharper particles + a faint broken-fire texture), embers, ash and smoke on a gradual wind.
   Alliance: rising spirits and golden orbs, rare thin stars (no light streak – owner removed it). Only the selected button animates; nothing runs off-screen,
   in a background tab or with reduced motion. */
(function(){
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const btns=[...document.querySelectorAll(".fac-btn[data-fac]")]; if(!btns.length) return;
const IMG={};["ember1","ember2","ember3","ember4","ember5","ember6","smoke1","smoke2","orb1","orb2","orb3","star-m","star-l"].forEach(k=>{const i=new Image();i.decoding="async";i.src="img/fx/"+k+".webp";IMG[k]=i;});
const ok=i=>i&&i.complete&&i.naturalWidth>0;
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[(Math.random()*a.length)|0];
function sizeCanvas(c){const r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);const w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));if(c.width!==w||c.height!==h){c.width=w;c.height=h;}return d;}
function sprite(stops){const s=document.createElement("canvas");s.width=s.height=64;const g=s.getContext("2d"),gr=g.createRadialGradient(32,32,0,32,32,32);stops.forEach(([o,a])=>gr.addColorStop(o,`rgba(255,255,255,${a})`));g.fillStyle=gr;g.fillRect(0,0,64,64);return s;}
const SOFT=sprite([[0,1],[.4,.5],[1,0]]),SHARP=sprite([[0,1],[.35,.85],[.62,.3],[1,0]]);
const TINT={};function tinted(base,key,r,g,b){const k=key+(r>>3)+"-"+(g>>3)+"-"+(b>>3);if(TINT[k]) return TINT[k];const t=document.createElement("canvas");t.width=t.height=64;const x=t.getContext("2d");x.drawImage(base,0,0);x.globalCompositeOperation="source-in";x.fillStyle=`rgb(${r},${g},${b})`;x.fillRect(0,0,64,64);return TINT[k]=t;}
const COL=[[255,214,120],[255,150,48],[226,84,24],[150,34,12],[70,14,8]];
const fcol=l=>{const f=l*(COL.length-1),i=Math.min(COL.length-2,Math.floor(f)),t=f-i,a=COL[i],b=COL[i+1];return [0,1,2].map(k=>Math.round(a[k]+(b[k]-a[k])*t));};
function Cells(){const fw=150,fh=40,buf=new Uint8Array(fw*fh),pal=[];for(let i=0;i<37;i++){const t=i/36;pal.push([Math.min(255,Math.round(255*Math.min(1,t*1.9))),Math.round(210*Math.max(0,Math.min(1,(t-.36)*1.6))),Math.round(90*Math.max(0,(t-.85)*5)),Math.round(255*Math.min(1,t*1.3))]);}
 const off=document.createElement("canvas");off.width=fw;off.height=fh;const og=off.getContext("2d"),img=og.createImageData(fw,fh);let t=0;
 return {c:off,step(){t++;for(let x=0;x<fw;x++) buf[(fh-1)*fw+x]=36-((Math.sin(x*.23+t*.06)+1)*1.5|0)-(Math.random()<.1?7:0);
  for(let y=1;y<fh;y++) for(let x=0;x<fw;x++){const src=y*fw+x,v=buf[src];if(!v){buf[src-fw]=0;continue;}const r=(Math.random()*3.2)|0;let dst=src-r+1-fw;if(dst<0) dst=0;buf[dst]=Math.max(0,v-((Math.random()*3.4)|0));}
  for(let i=0;i<fw*fh;i++){const p=pal[buf[i]];img.data[i*4]=p[0];img.data[i*4+1]=p[1];img.data[i*4+2]=p[2];img.data[i*4+3]=p[3];}og.putImageData(img,0,0);}};}
/* wind that builds up and calms down over several seconds */
function Wind(){let w=0,tgt=.3,next=0,T=0;return k=>{T+=.033*k;if(T>next){tgt=Math.random()<.7?rnd(.2,1.4):rnd(-.5,.2);next=T+rnd(4,8);}w+=(tgt-w)*.012*k;return w+Math.sin(T*.5)*.12;};}
const FX={};
FX.horde=c=>{const g=c.getContext("2d"),cells=Cells(),wind=Wind();let P=[],E=[],A=[],S=[];const EM=["ember1","ember2","ember3","ember4","ember5","ember6"];
 return (d,k)=>{const W=c.width,H=c.height,w=wind(k),hs=H/(84*d);g.clearRect(0,0,W,H);g.globalCompositeOperation="lighter";
  const n=Math.max(3,Math.round(W/(26*d)*k));for(let i=0;i<n;i++){const sh=Math.random()<.2;P.push({x:rnd(-.05,1.05)*W,y:H+rnd(2,10)*d,vx:rnd(-.2,.2)*d,vy:-rnd(.55,1.15)*d*hs,s:(sh?rnd(11,22):rnd(14,28))*d,l:0,dl:rnd(.016,.026),ph:rnd(0,6.28),sh});}
  P=P.filter(p=>{p.l+=p.dl*k;if(p.l>=1) return false;p.ph+=.13*k;p.x+=(p.vx+Math.sin(p.ph)*.33*d+w*.35*d*p.l)*k;p.y+=p.vy*k;const s=p.s*(1-p.l*.72),[r,gg,b]=fcol(p.l);
   g.globalAlpha=Math.min(1,(1-p.l)*1.1)*.3;g.drawImage(p.sh?tinted(SHARP,"h",r,gg,b):tinted(SOFT,"s",r,gg,b),p.x-s/2,p.y-s/2,s,s);return true;});
  cells.step();g.globalAlpha=.07;g.drawImage(cells.c,0,H*.4,W,H*.62);
  if(Math.random()<.24*k){const spr=Math.random()<.35;E.push({x:rnd(0,W),y:H*rnd(.7,1),vx:rnd(-.3,.3)*d,vy:-rnd(1.1,2.2)*d,l:0,dl:rnd(.007,.012),ph:rnd(0,6.28),s:spr?rnd(9,15)*d:rnd(1.4,2.4)*d,img:spr?pick(EM):null});}
  E=E.filter(p=>{p.l+=p.dl*k;if(p.l>=1||p.y<-20||p.x<-20||p.x>W+20) return false;p.ph+=.09*k;const vx=p.vx+Math.sin(p.ph)*.5*d+w*1.6*d;p.x+=vx*k;p.y+=p.vy*k;g.globalAlpha=(1-p.l)*.9;
   const im=p.img&&IMG[p.img];if(im&&ok(im)){g.save();g.translate(p.x,p.y);g.rotate(Math.atan2(p.vy,vx)+Math.PI*.75);g.drawImage(im,-p.s/2,-p.s*im.height/im.width/2,p.s,p.s*im.height/im.width);g.restore();}
   else{g.fillStyle=`rgb(255,${Math.round(210-130*p.l)},${Math.round(90-60*p.l)})`;g.beginPath();g.arc(p.x,p.y,(p.img?2:p.s)/2,0,7);g.fill();}return true;});
  g.globalCompositeOperation="source-over";
  if(Math.random()<.025*k) S.push({x:rnd(.05,.95)*W,y:H*rnd(.45,.65),l:0,dl:rnd(.004,.007),s:rnd(.5,.8)*H,img:pick(["smoke1","smoke2"]),fl:Math.random()<.5});
  S=S.filter(p=>{p.l+=p.dl*k;if(p.l>=1) return false;p.y-=.35*d*k;p.x+=(w*1.2*d+.1*d)*k;const im=IMG[p.img];if(!ok(im)) return true;const h=p.s*(1+p.l*.5),ww=h*im.width/im.height;g.save();g.translate(p.x,p.y);if(p.fl) g.scale(-1,1);g.globalAlpha=Math.sin(p.l*Math.PI)*.22;g.drawImage(im,-ww/2,-h/2,ww,h);g.restore();return true;});
  if(Math.random()<.32*k) A.push({x:rnd(-.1,1)*W,y:rnd(.35,1)*H,vx:rnd(-.1,.2)*d,vy:-rnd(.15,.5)*d,l:0,dl:rnd(.006,.012),rot:rnd(0,6.28),vr:rnd(-.15,.15),s:rnd(1.4,3)*d,glow:Math.random()<.35});
  A=A.filter(p=>{p.l+=p.dl*k;if(p.l>=1||p.x>W+20||p.x<-20) return false;p.rot+=p.vr*k;p.x+=(p.vx+w*2.4*d)*k;p.y+=(p.vy+Math.sin(p.rot*2)*.25*d)*k;const a=Math.sin(p.l*Math.PI);
   g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.globalAlpha=a*(p.glow?.85:.55);g.fillStyle=p.glow?`rgb(255,${130+((1-p.l)*60|0)},60)`:"rgb(120,108,100)";g.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);g.restore();return true;});
  g.globalAlpha=1;const vg=g.createLinearGradient(0,0,0,H);vg.addColorStop(0,"rgba(26,16,18,.45)");vg.addColorStop(.45,"rgba(26,16,18,0)");g.fillStyle=vg;g.fillRect(0,0,W,H);};};
const SCOL=[[255,248,228],[255,230,170],[200,222,255],[228,238,255],[255,214,178],[214,200,255]];
const HALO=sprite([[0,.7],[.14,.34],[.45,.09],[1,0]]);const HT={};
function halo(c){const k=c.join();if(HT[k]) return HT[k];const t=document.createElement("canvas");t.width=t.height=64;const x=t.getContext("2d");x.drawImage(HALO,0,0);x.globalCompositeOperation="source-in";x.fillStyle=`rgb(${c})`;x.fillRect(0,0,64,64);return HT[k]=t;}
FX.alliance=c=>{const g=c.getContext("2d");let S=[],T=[];
 return (d,k)=>{const W=c.width,H=c.height;g.clearRect(0,0,W,H);g.globalCompositeOperation="lighter";
  if(S.length<22&&Math.random()<.2*k){const orb=Math.random()<.5;S.push({x:rnd(.04,.96)*W,y:rnd(.45,1.05)*H,vy:-rnd(.28,.7)*d,ax:rnd(4,12)*d,fx:rnd(.025,.06),ay:rnd(1,3)*d,fy:rnd(.04,.09),ph:rnd(0,6.28),l:0,dl:rnd(.006,.012),r:rnd(.6,1.1)*d,h:(orb?rnd(9,16):rnd(14,24))*d,c:pick(SCOL),a:rnd(.5,.85),orb:orb?pick(["orb1","orb2","orb3"]):null});}
  S=S.filter(s=>{s.l+=s.dl*k;if(s.l>=1) return false;s.ph+=k;s.y+=s.vy*k;const x=s.x+Math.sin(s.ph*s.fx)*s.ax,y=s.y+Math.sin(s.ph*s.fy)*s.ay,a=s.a*Math.pow(Math.sin(s.l*Math.PI),1.6)*(.75+.25*Math.sin(s.ph*.21));
   const im=s.orb&&IMG[s.orb];g.globalAlpha=a;if(im&&ok(im)){g.drawImage(im,x-s.h,y-s.h,s.h*2,s.h*2);}else{g.drawImage(halo(s.c),x-s.h,y-s.h,s.h*2,s.h*2);g.globalAlpha=Math.min(1,a*1.3);g.fillStyle=`rgb(${s.c})`;g.beginPath();g.arc(x,y,s.r,0,7);g.fill();}return true;});
  if(T.length<3&&Math.random()<.025*k) T.push({x:rnd(.06,.94)*W,y:rnd(.15,.85)*H,s:rnd(12,22)*d,l:0,dl:rnd(.018,.03),rot:rnd(-.3,.3),img:Math.random()<.5?"star-m":"star-l"});
  T=T.filter(t=>{t.l+=t.dl*k;if(t.l>=1) return false;const im=IMG[t.img];if(!ok(im)) return true;const e=Math.sin(t.l*Math.PI),s=t.s*(.55+.45*e),h=s*im.height/im.width;g.save();g.translate(t.x,t.y);g.rotate(t.rot+t.l*.4);g.globalAlpha=e*.7;g.drawImage(im,-s/2,-h/2,s,h);g.restore();return true;});
  g.globalAlpha=1;g.globalCompositeOperation="source-over";};};
/* select moment: claw slash on Horde, light burst on Alliance (only when the user switches) */
document.addEventListener("click",e=>{const b=e.target.closest(".fac-btn[data-fac]");if(!b||b.getAttribute("aria-pressed")==="true") return;
 btns.forEach(x=>x.classList.remove("hit"));void b.offsetWidth;b.classList.add("hit");},true);
if(RM) return;
const run=btns.map(b=>({b,c:b.querySelector("canvas"),f:null})).filter(o=>o.c);
let vis=true;try{new IntersectionObserver(es=>{vis=es.some(x=>x.isIntersecting);},{rootMargin:"80px"}).observe(btns[0].parentElement);}catch(e){}
let last=0;function loop(ts){requestAnimationFrame(loop);if(!vis||document.hidden){last=0;return;}const dt=last?ts-last:16;if(dt<15) return;last=ts;const k=Math.min(3,dt/33);
 run.forEach(o=>{if(o.b.getAttribute("aria-pressed")!=="true") return;const d=sizeCanvas(o.c);if(!o.f) o.f=FX[o.b.dataset.fac](o.c);o.f(d,k);});}
requestAnimationFrame(loop);
})();
