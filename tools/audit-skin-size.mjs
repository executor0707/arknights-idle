import { SKINS } from '../build/app/js/skins.js';
import { SKIN_SPINE } from '../build/app/js/skin-spine-index.js';
import { SKIN_SPINE_REMOTE } from '../build/app/js/skin-spine-remote.js';
const entries=[];let cursor=0;
for(const s of SKINS){if(!SKIN_SPINE[s.id]&&SKIN_SPINE_REMOTE[s.id])entries.push({s,base:SKIN_SPINE_REMOTE[s.id].base});}
const sizes=new Map();let total=0;
async function worker(){while(cursor<entries.length){const {s,base}=entries[cursor++];let t=0;for(const ext of ['.skel','.atlas','.png']){try{const r=await fetch(base+ext,{method:'HEAD',signal:AbortSignal.timeout(15000)});t+=Number(r.headers.get('content-length')||0);}catch(e){}}sizes.set(s.id,t);total+=t;}}
await Promise.all(Array.from({length:16},worker));
const sorted=[...sizes.entries()].sort((a,b)=>b[1]-a[1]);
console.log(JSON.stringify({remote:entries.length,totalMB:+(total/1048576).toFixed(1),avgMB:+(total/entries.length/1048576).toFixed(2),largest:sorted.slice(0,10).map(([id,n])=>[id,+(n/1048576).toFixed(1)]),unknown:sorted.filter(([,n])=>n===0).length},null,2));
