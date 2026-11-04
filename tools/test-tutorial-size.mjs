import { connect, evalJS, screenshot } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront');
await send('Runtime.enable'); await send('Network.enable'); await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:'http://127.0.0.1:8765/index.html?v=tutorial_size'});
await new Promise(r=>setTimeout(r,1200));
await send('Runtime.evaluate',{expression:`localStorage.clear();location.reload()`,userGesture:true});
await new Promise(r=>setTimeout(r,1200));
await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true});
await new Promise(r=>setTimeout(r,1600));
console.log('start', await evalJS(send, `JSON.stringify({tutorial:!!document.querySelector('.tutorial-card'),dots:document.querySelectorAll('.tutorial-dots i').length,title:document.querySelector('.tutorial-card h3')?.textContent})`));
for(let i=0;i<3;i++){await evalJS(send,`document.querySelector('[data-action="tutorial-next"]')?.click();true`);await new Promise(r=>setTimeout(r,300));}
console.log('last', await evalJS(send, `JSON.stringify({step:document.querySelector('.tutorial-step')?.textContent,title:document.querySelector('.tutorial-card h3')?.textContent,body:document.querySelector('.tutorial-card p')?.textContent,hint:document.querySelector('.tutorial-card p')?.nextElementSibling?.textContent,dots:document.querySelectorAll('.tutorial-dots i').length,button:document.querySelector('[data-action="tutorial-next"]')?.textContent})`));
await screenshot(send,'.cache/tutorial-skin-size.png',1440,1000);
process.exit(0);
