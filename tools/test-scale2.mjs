import { connect, evalJS, screenshot } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront');
await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:'http://127.0.0.1:8765/index.html?v=scales2'});
await new Promise(r=>setTimeout(r,1000));
await evalJS(send,`localStorage.clear();location.reload();true`);
await new Promise(r=>setTimeout(r,1000));
await evalJS(send,`document.getElementById('enterBtn').click();true`);
await new Promise(r=>setTimeout(r,1900));
await evalJS(send,`document.querySelector('[data-action="tutorial-skip"]')?.click();true`);
await send('Page.bringToFront');
await new Promise(r=>setTimeout(r,3500));
console.log('base', await evalJS(send,`JSON.stringify({scale:__RHODES__.state.settings.characterScale,enemy:__RHODES__.state.settings.enemyScale,interval:__RHODES__.G.getOpStats('fang').interval,squad:__RHODES__.state.squad.filter(Boolean),allies:__RHODES__.battle.allies.map(a=>a.id),errs:window.__errs||null,time:__RHODES__.battle.time})`));
console.log('sprites', await evalJS(send,`(()=>{const f=document.querySelector('iframe.spine38-frame');const s=f?.contentWindow?.__frame?.sprites;if(!s)return null;const a=[];for(const [k,sp] of s)a.push({k,w:Math.round(sp.width),h:Math.round(sp.height)});return JSON.stringify(a)})()`));
await screenshot(send,'.cache/settings-scale2.png',1440,1000);
// open squad editor
await evalJS(send,`document.querySelector('[data-action="open-squad"]')?.click();true`);
await new Promise(r=>setTimeout(r,500));
console.log('slots', await evalJS(send,`JSON.stringify({count:document.querySelectorAll('.squad-editor-slots .squad-slot').length,imgH:getComputedStyle(document.querySelector('.squad-editor-slots .sq-img')).height,cols:getComputedStyle(document.querySelector('.squad-editor-slots')).gridTemplateColumns})`));
await screenshot(send,'.cache/squad-five.png',1440,1000);
await evalJS(send,`document.querySelector('[data-action="close-modal"]')?.click();true`);
// settings sliders
await evalJS(send,`__RHODES__.setView('archive',true);true`);
await new Promise(r=>setTimeout(r,500));
console.log('sliders', await evalJS(send,`JSON.stringify({char:document.getElementById('charScale')?.value,enemy:document.getElementById('enemyScale')?.value})`));
process.exit(0);
