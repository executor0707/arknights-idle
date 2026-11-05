import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=tactician'});
await new Promise(r=>setTimeout(r,3500));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2000)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); }
console.log(await evalJS(send, `(()=>{const G=__RHODES__.G,s=__RHODES__.state;const list=G.OPERATORS.filter(o=>o.role==='vanguard'&&o.sub==='战术家');for(const o of list)s.operators[o.id]={level:90,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};s.squad=[list[0].id,null,null,null,null];__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');const a=b.allies[0];return JSON.stringify({names:list.map(o=>o.name),stats:list.map(o=>({name:o.name,range:G.getOpStats(o.id).range,block:G.getOpStats(o.id).block,role:G.getOpStats(o.id).role})),battle:{range:a.range,block:a.block,role:a.role}})})()`));
process.exit(0);
