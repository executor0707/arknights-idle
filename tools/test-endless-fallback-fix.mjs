import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=endlessfix'});
await new Promise(r=>setTimeout(r,1200));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) {
  await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true});
  await new Promise(r=>setTimeout(r,1400));
  await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`);
  await new Promise(r=>setTimeout(r,400));
}
// 1. Switching tabs must not replace the running stage.
console.log('tab', await evalJS(send, `(()=>{const s=__RHODES__.state;__RHODES__.battle.start('CE-6');s.stage.selected='CE-6';document.querySelector('[data-action="stage-group"][data-group="endless"]')?.click();return JSON.stringify({selected:s.stage.selected,battle:__RHODES__.battle.stage?.id,group:__RHODES__.battle.stage?.group})})()`));
// 2. floors 1..7 cleared, floor 8 pending retry, floor 9 fallback but not cleared.
console.log('unlock', await evalJS(send, `(()=>{const s=__RHODES__.state;for(let f=1;f<=9;f++)__RHODES__.G.ensureEndlessFloor(f);s.stage.cleared=s.stage.cleared.filter(id=>!/^endless-\\d+$/.test(id));for(let f=1;f<=7;f++)s.stage.cleared.push('endless-'+f);s.stage.endlessRetry='endless-9';s.stage.auto=false;const a=__RHODES__.G.STAGE_BY_ID.get('endless-8'),b=__RHODES__.G.STAGE_BY_ID.get('endless-9');return JSON.stringify({retry:s.stage.endlessRetry,f8:__RHODES__.G.isStageUnlocked(a),f9:__RHODES__.G.isStageUnlocked(b),cleared:s.stage.cleared.filter(x=>/^endless-/.test(x))})})()`));
// 3. Fail the fallback floor 8; pending floor 9 must survive and 8 must remain open/next.
console.log('fail8', await evalJS(send, `(()=>{const s=__RHODES__.state;const b=__RHODES__.battle;b.start('endless-8');b._finish(false,'test');return JSON.stringify({retry:s.stage.endlessRetry,next:b.nextStageId,current:b.stage.id,status:b.status,f8:__RHODES__.G.isStageUnlocked(__RHODES__.G.STAGE_BY_ID.get('endless-8'))})})()`));
// 4. UI cards after the failed fallback.
await evalJS(send, `__RHODES__.setView('battle',true);true`);
await new Promise(r=>setTimeout(r,400));
console.log('cards', await evalJS(send, `JSON.stringify({selected:__RHODES__.state.stage.selected,battle:__RHODES__.battle.stage?.id,cards:[...document.querySelectorAll('.stage-card')].map(x=>({name:x.querySelector('.stage-name')?.textContent,disabled:x.disabled,locked:x.classList.contains('locked')}))})`));
process.exit(0);
