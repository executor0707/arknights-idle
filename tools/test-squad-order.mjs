import { connect, evalJS, screenshot } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront');
await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:'http://127.0.0.1:8765/index.html?v=squadorder'});
await new Promise(r=>setTimeout(r,1200));
await send('Runtime.evaluate',{expression:`localStorage.clear();location.reload()`,userGesture:true});
await new Promise(r=>setTimeout(r,1200));
await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true});
await new Promise(r=>setTimeout(r,1700));
await send('Runtime.evaluate',{expression:`document.querySelector('[data-action="tutorial-skip"]')?.click()`,userGesture:true});
await new Promise(r=>setTimeout(r,700));
console.log('order', await evalJS(send,`JSON.stringify({ids:__RHODES__.battle.allies.map(a=>a.id),xs:__RHODES__.battle.allies.map(a=>a.x)})`));
// squad editor
await evalJS(send,`document.querySelector('[data-action="open-squad"]')?.click();true`);
await new Promise(r=>setTimeout(r,500));
console.log('squaddom', await evalJS(send,`JSON.stringify({slots:document.querySelectorAll('.squad-editor-slots .squad-slot').length,removeBtns:document.querySelectorAll('.sq-remove').length,cardActions:[...document.querySelectorAll('.squad-editor-slots .squad-slot[data-action]')].length})`));
await evalJS(send,`document.querySelector('.squad-editor-slots .squad-slot[data-action="remove-squad"]')?.click();true`);
await new Promise(r=>setTimeout(r,400));
console.log('removed', await evalJS(send,`JSON.stringify({squad:__RHODES__.state.squad,modal:!!document.querySelector('#modalRoot .modal'),buttons:document.querySelectorAll('.squad-editor-slots .squad-slot[data-action="squad-add"]').length})`));
// add first roster
await evalJS(send,`document.querySelector('.roster-pick[data-action="squad-add"]:not([disabled])')?.click();true`);
await new Promise(r=>setTimeout(r,400));
console.log('added', await evalJS(send,`JSON.stringify({squad:__RHODES__.state.squad,modal:!!document.querySelector('#modalRoot .modal')})`));
await screenshot(send,'.cache/squad-no-x.png',1440,1000);
// close, force skill
await evalJS(send,`document.querySelector('[data-action="close-modal"]')?.click();true`);
await new Promise(r=>setTimeout(r,500));
await evalJS(send,`(()=>{const b=__RHODES__.battle;for(const a of b.allies)a.sp=a.maxSp;b.tick(.1);return true})()`);
await new Promise(r=>setTimeout(r,500));
console.log('skill', await evalJS(send,`JSON.stringify({cut:__RHODES__.battle.cutIn?.skill||null,cast:__RHODES__.battle.cast?.name||null})`));
await screenshot(send,'.cache/skill-cast-on.png',1440,1000);
process.exit(0);
