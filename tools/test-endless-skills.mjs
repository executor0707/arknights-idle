import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=skillsendless'});
await new Promise(r=>setTimeout(r,1400));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,1400)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
// High-floor reload condition: only the target stage object exists, cleared ids are persisted.
console.log('endless', await evalJS(send, `(()=>{const G=__RHODES__.G,s=__RHODES__.state;const st=G.ensureEndlessFloor(164);s.stage.cleared=Array.from({length:163},(_,i)=>'endless-'+(i+1));s.stage.endlessRetry=null;return JSON.stringify({floor:st.floor,unlocked:G.isStageUnlocked(st),set:G.setStage('endless-164'),selected:s.stage.selected})})()`));
// Skill coverage and generic text audit.
console.log('skills', await evalJS(send, `(()=>{const O=__RHODES__.G.OPERATORS;const generic=O.filter(o=>/职业模板|自动释放.*对战场产生效果/.test(o.skill?.desc||'')).map(o=>o.id);const missing=O.filter(o=>!o.skill?.name||!o.skill?.desc).map(o=>o.id);const bad=O.filter(o=>!Number.isFinite(o.skill?.power)||!Number.isFinite(o.skill?.duration)||!o.skill?.type).map(o=>o.id);return JSON.stringify({total:O.length,generic,missing,bad,rosmon:O.find(o=>o.id==='char_391_rosmon')?.skill,star:O.find(o=>o.id==='char_136_hsguma')?.skill,nian:O.find(o=>o.id==='nian')?.skill})})()`));
process.exit(0);
