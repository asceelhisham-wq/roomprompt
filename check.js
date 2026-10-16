const fs=require('fs');const html=fs.readFileSync(process.argv[2] || "index.html",'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
let code=scripts.join('\n').replace('document.addEventListener("DOMContentLoaded", init);','');
code+=`
const ids=new Set();let dup=0;ITEMS.forEach(i=>{if(ids.has(i.id))dup++;ids.add(i.id)});
const sids=new Set(STYLES.map(s=>s.id));const pids=new Set(COLOR_PALETTES.map(p=>p.id));const rids=new Set(ROOM_TYPES.map(r=>r.id));const cids=new Set(CATEGORIES.map(c=>c.id));
let badTag=new Set(),badRoom=0,badCat=0,noRoom=0;
ITEMS.forEach(i=>{i.styleTags.forEach(t=>{if(!sids.has(t))badTag.add(t)});i.roomTypes.forEach(r=>{if(!rids.has(r))badRoom++});if(!i.roomTypes.length)noRoom++;if(!cids.has(i.category))badCat++;});
const badPal=STYLES.filter(s=>!pids.has(s.typicalPalette)).map(s=>s.id);
const unmapped=ITEMS.filter(i=>i.sub==='other').map(i=>i.category+'/'+i.id);
const subs={};ITEMS.forEach(i=>{const k=i.category+' › '+subName(i.category,i.sub);subs[k]=(subs[k]||0)+1});
console.log('unmapped',unmapped.length,unmapped.slice(0,20));if(unmapped.length)process.exitCode=1;console.log(subs);
console.log({items:ITEMS.length,generated:ITEMS.filter(i=>!i.sig).length,styles:STYLES.length,palettes:COLOR_PALETTES.length,dup,badTag:[...badTag],badRoom,badCat,noRoom,badPal,leftover:ITEMS.filter(i=>/\\{/.test(i.promptText)).length});
const perStyle=STYLES.map(s=>{state.style=s.id;computeMatches();return [s.id,matchSet.size]}).sort((a,b)=>a[1]-b[1]);console.log('fewest matches',perStyle.slice(0,6));
const perRoom=ROOM_TYPES.map(r=>[r.id,ITEMS.filter(i=>i.roomTypes.includes(r.id)).length]);console.log(perRoom.map(x=>x.join(':')).join(' '));
state.style='japandi';state.selected=['sectional-sofa','coffee-wood--oak','p-bonsai--cplanter','p-olive--tpot','framed-art--ebonised'];state.size={w:'4',l:'5.5'};
console.log(build3D());state.cam.fmt='mj';state.cam.pos='f';console.log(build3D());
for(const m of ['plan','blueprint','elevation','iso','flat','board']){state.plan=m;console.log('['+m+'] '+build2D());}
console.log(ITEMS.filter(i=>!i.sig).sort(()=>Math.random()-.5).slice(0,12).map(i=>i.promptText).join(' | '));
`;
// minimal DOM stub
global.document={addEventListener(){} };global.window={};
try{eval(code)}catch(e){console.error('ERR',e)}
