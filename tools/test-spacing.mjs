import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=spacing'});
await new Promise(r=>setTimeout(r,4000));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2200)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state;const ids=['mlynar','ela','eyjafjalla','char_391_rosmon','char_4009_irene'];for(const id of ids)s.operators[id]={level:90,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};s.squad=ids;s.settings.formationSpacing=1;__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');return JSON.stringify({actual:b.allies.map(a=>a.x),slider:!!document.getElementById('charSpacing'),left:[...document.querySelectorAll('.ally-token')].map(x=>x.style.left)})})()`));
await new Promise(r=>setTimeout(r,300));
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state;const input=document.getElementById('charSpacing');if(!input)return 'no slider';input.value='2';input.dispatchEvent(new Event('input',{bubbles:true}));return JSON.stringify({setting:s.settings.formationSpacing,actual:__RHODES__.battle.allies.map(a=>a.x),left:[...document.querySelectorAll('.ally-token')].map(x=>x.style.left),label:document.getElementById('charSpacingValue')?.textContent})})()`));
process.exit(0);
