import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=maxout'});
await new Promise(r=>setTimeout(r,4000));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2200)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state; s.distinction=100000; __RHODES__.setView('inventory',true); const btn=document.querySelector('[data-action="maxout-selector"]'); btn?.click(); const cards=[...document.querySelectorAll('.selector-card')]; return JSON.stringify({button:!!btn,modal:!!document.querySelector('.modal-backdrop'),cards:cards.length,first:cards[0]?.dataset.name,rarity:cards[0]?.dataset.rarity})})()`));
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state;const cards=[...document.querySelectorAll('.selector-card')];const card=cards.find(c=>c.dataset.id==='char_4183_mortis')||cards[0];card?.click();const op=s.operators['char_4183_mortis'];return JSON.stringify({id:card?.dataset.id,distinction:s.distinction,elite:op?.elite,level:op?.level,potential:op?.potential,skill:op?.skill,mastery:op?.mastery,module:op?.module,trust:op?.trust})})()`));
process.exit(0);
