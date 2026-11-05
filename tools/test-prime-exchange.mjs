import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.navigate',{url:'http://127.0.0.1:8765/v4/?v=primeexchange'});
await new Promise(r=>setTimeout(r,4000));
if (await evalJS(send, `!!document.querySelector('#enterBtn')`)) { await send('Runtime.evaluate',{expression:`document.getElementById('enterBtn')?.click()`,userGesture:true}); await new Promise(r=>setTimeout(r,2200)); await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click();true`); await new Promise(r=>setTimeout(r,300)); }
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state;s.primes=10;s.orundum=0;__RHODES__.setView('gacha',true);const i=document.getElementById('primeExchangeRange');return JSON.stringify({slider:!!i,max:i?.max,value:i?.value,gain:document.getElementById('primeExchangeGain')?.textContent,button:!!document.querySelector('[data-action="exchange-primes"]')})})()`));
console.log(await evalJS(send, `(()=>{const i=document.getElementById('primeExchangeRange');i.value='5';i.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('[data-action="exchange-primes"]')?.click();const s=__RHODES__.state;return JSON.stringify({primes:s.primes,orundum:s.orundum,gain:document.getElementById('primeExchangeGain')?.textContent})})()`));
process.exit(0);
