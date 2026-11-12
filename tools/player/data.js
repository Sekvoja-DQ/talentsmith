const fs=require('fs'),vm=require('vm');const R='/home/claude/talentsmith/';
const calc=fs.readFileSync(R+'calculator.html','utf8');const ctx={};vm.createContext(ctx);
let s=calc.slice(calc.indexOf('const PALADIN='),calc.indexOf('const SOON='));
vm.runInContext(s.replace(/\bconst (\w+)=/g,'var $1=')+';var CCL=CLASSES;',ctx);
{const a=calc.indexOf('const TICON=');vm.runInContext(calc.slice(a,calc.indexOf(';',a)+1).replace('const ','var '),ctx);}
{const a=calc.indexOf('function rankText(');vm.runInContext(calc.slice(a,calc.indexOf('\n}\n',a)+2),ctx);}
const slug=n=>n.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const uri=f=>'data:image/webp;base64,'+fs.readFileSync(R+f).toString('base64');
const c='paladin',T=ctx.CCL[c].trees,bgs=['paladinholy','paladinprotection','paladincombat'];
const b=require(R+'tools/builds.js').find(x=>x[0]===c&&x[1]==='shockadin-endgame');
const trees=T.map((t,k)=>({name:t.name,bg:uri('img/trees/'+bgs[k]+'.webp'),icon:uri('img/specs/'+c+'-'+slug(t.name)+'.webp'),t:t.t.map(x=>({n:x[0],m:x[1],r:x[2],c:x[3],q:x[4]||null,i:uri('img/talents/'+((ctx.TICON&&ctx.TICON[x[0]])||c+'-'+slug(x[0]))+'.webp')}))}));
const seq=[];const pts=T.map(t=>t.t.map(()=>0));
for(const [ti,tn,n] of b[5])for(let k=0;k<n;k++){const i=T[ti].t.findIndex(x=>x[0]===tn);pts[ti][i]++;const x=T[ti].t[i];seq.push({t:ti,i,r:pts[ti][i],tx:ctx.rankText(x[5],pts[ti][i],x[1]).t});}
fs.writeFileSync('/home/claude/work/player/data.json',JSON.stringify({cls:'Paladin',name:b[2],spec:uri('img/specs/paladin-holy.webp'),trees,seq}));
console.log(seq.length, fs.statSync('/home/claude/work/player/data.json').size);
