// Share images for build pages (Discord/Reddit/X previews), 1200x630 JPEG in img/og/<class>-<id>.jpg.
// Input: tools/og-builds.json (written by gen-pages.js). Only builds whose data changed are re-rendered
// (hashes in tools/og-hashes.json). Run: node tools/gen-pages.js && node tools/og-images.js && node tools/gen-pages.js
const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
const R=path.resolve(__dirname,'..')+'/';
const DATA=JSON.parse(fs.readFileSync(R+'tools/og-builds.json','utf8'));
const OUT=R+'img/og/',HF=R+'tools/og-hashes.json';fs.mkdirSync(OUT,{recursive:true});
let H={};try{H=JSON.parse(fs.readFileSync(HF,'utf8'));}catch(e){}
const force=process.argv.includes('--all');
const COLOR={Warrior:"#C69B6D",Paladin:"#F48CBA",Hunter:"#AAD372",Rogue:"#FFF468",Priest:"#F2F2F2",Shaman:"#2a8cf0",Mage:"#3FC7EB",Warlock:"#8788EE",Druid:"#FF7C0A"};
const BGMAP={retribution:"combat",elemental:"elementalcombat",affliction:"curses",demonology:"summoning",feral:"feralcombat"};
const treeBg=(c,n)=>{const k=n.toLowerCase().replace(/[^a-z]/g,"");return c+(BGMAP[k]||k);};
const esc=x=>String(x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CSS=`*{box-sizing:border-box}html,body{margin:0}body{width:1200px;height:630px;overflow:hidden;background:#0b0e15;color:#ede4d3;font-family:"Alegreya Sans",system-ui,sans-serif;position:relative}
.top{position:absolute;left:0;right:0;top:0;height:112px;display:flex;align-items:center;gap:18px;padding:0 36px;background:linear-gradient(180deg,#171c28,#0f131c);border-bottom:2px solid #2c3242}
.top .ci{width:64px;height:64px;border-radius:12px;border:2px solid var(--cc)}
.top .tx{flex:1;min-width:0}.top h1{margin:0;font:800 40px/1.05 "Cinzel",Georgia,serif;color:#f6d68e;white-space:nowrap;overflow:hidden}
.top h1 span{color:var(--cc)}.top p{margin:6px 0 0;font-size:22px;color:#a39886}.top p b{color:#ede4d3}
.tag{display:inline-block;padding:1px 10px;border-radius:999px;font-size:17px;font-weight:700;border:1px solid #2c3242;background:#1f2533;margin-right:6px;color:#ede4d3}
.tag.off{color:#ff7a2f;border-color:#6b3a1e}.tag.meta{color:#8fc4e8;border-color:#2b4a63}
.brand{flex-shrink:0;display:flex;align-items:center;gap:10px;font:800 24px "Cinzel",Georgia,serif;color:#e9b44c}
.brand img{width:40px;height:40px;border-radius:50%}
.trees{position:absolute;left:24px;right:24px;top:128px;bottom:20px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.tree{position:relative;border:1px solid #2c3242;border-radius:12px;overflow:hidden;background:#11151f}
.tree::before{content:"";position:absolute;inset:0;background:var(--bg) center/cover;opacity:.28}
.tree.zero::before{opacity:.12}
.th{position:relative;display:flex;justify-content:space-between;align-items:baseline;padding:8px 14px 0;font:800 21px "Cinzel",Georgia,serif;color:#f6d68e}
.th b{font:700 22px "Alegreya Sans",sans-serif;color:#ede4d3}.zero .th{color:#8a8274}.zero .th b{color:#8a8274}
.grid{position:absolute;left:14px;right:14px;top:44px;bottom:8px}
.t{position:absolute;width:48px;height:48px;border-radius:9px;transform:translate(-50%,-50%)}
.t img{width:100%;height:100%;border-radius:8px;display:block}
.t.off img{filter:grayscale(1) brightness(.55);opacity:.45}
.t.on{box-shadow:0 0 0 2px #e9b44c,0 0 10px rgba(233,180,76,.45)}
.t.part{box-shadow:0 0 0 2px #7fc36a}
.t i{position:absolute;right:-8px;bottom:-7px;font:700 14px/1 "Alegreya Sans",sans-serif;font-style:normal;background:#0b0e15;border:1px solid #e9b44c;color:#f6d68e;border-radius:6px;padding:2px 4px}
.t.part i{border-color:#7fc36a;color:#bfe6b2}`;
function html(d){
  const cc=COLOR[d.cls]||'#e9b44c';
  const trees=d.trees.map((tr,i)=>{const sum=d.split[i];
    const cells=tr.t.map(([n,max,row,col,p,ic])=>{const x=((col-0.5)/4*100).toFixed(2),y=((row-0.5)/7*100).toFixed(2);
      const cl=p===0?'off':p>=max?'on':'part';
      return `<div class="t ${cl}" style="left:${x}%;top:${y}%"><img src="img/talents/${ic}.webp" alt="">${p?`<i>${p}/${max}</i>`:''}</div>`;}).join('');
    return `<div class="tree${sum?'':' zero'}" style="--bg:url(img/trees/${treeBg(d.c,tr.name)}.webp)"><div class="th">${esc(tr.name)}<b>${sum}</b></div><div class="grid">${cells}</div></div>`;}).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800&family=Alegreya+Sans:wght@400;500;700&display=swap"><style>${CSS}</style></head>
<body style="--cc:${cc}"><div class="top"><img class="ci" src="img/icons/class-${d.c}.webp" alt=""><div class="tx"><h1><span>${esc(d.cls)}</span> – ${esc(d.name)}</h1>
<p><span class="tag ${d.group==='off'?'off':'meta'}">${d.group==='off'?'Off-meta':'Meta'}</span><span class="tag">${esc(d.kind)}</span> Split <b>${d.split.join(' / ')}</b> · level order 10–60</p></div>
<div class="brand"><img src="img/avatar.webp" alt="">talentsmith.app</div></div><div class="trees">${trees}</div></body></html>`;}
(async()=>{
  const todo=DATA.filter(d=>force||H[`${d.c}-${d.id}`]!==d.hash||!fs.existsSync(OUT+`${d.c}-${d.id}.jpg`));
  const keep=new Set(DATA.map(d=>`${d.c}-${d.id}.jpg`));
  for(const f of fs.readdirSync(OUT))if(f.endsWith('.jpg')&&!keep.has(f)){fs.unlinkSync(OUT+f);delete H[f.slice(0,-4)];console.log('removed',f);}
  if(todo.length){
    const br=await chromium.launch(),pg=await br.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
    for(const d of todo){const tmp=R+'.og-tmp.html';fs.writeFileSync(tmp,html(d));
      await pg.goto('file://'+tmp,{waitUntil:'networkidle'});await pg.evaluate(()=>document.fonts.ready);
      await pg.evaluate(()=>{const h=document.querySelector('h1');let f=40;while(h.scrollWidth>h.clientWidth&&f>24){f--;h.style.fontSize=f+'px';}});
      const bad=await pg.evaluate(()=>[...document.images].filter(i=>!i.naturalWidth).map(i=>i.getAttribute('src')));
      if(bad.length)throw `${d.c}-${d.id}: missing images ${bad.join(', ')}`;
      await pg.screenshot({path:OUT+`${d.c}-${d.id}.jpg`,type:'jpeg',quality:80});H[`${d.c}-${d.id}`]=d.hash;}
    fs.unlinkSync(R+'.og-tmp.html');await br.close();}
  fs.writeFileSync(HF,JSON.stringify(H,null,0));
  console.log(`share images: ${todo.length} rendered, ${DATA.length} builds`);
})().catch(e=>{console.error(e);process.exit(1);});
