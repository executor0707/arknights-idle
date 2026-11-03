import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await evalJS(send, `__RHODES__.setView('archive', true);true`);
await new Promise(r => setTimeout(r, 500));
console.log(await evalJS(send, `JSON.stringify({slider:document.getElementById('charScale')?.value,label:document.getElementById('charScaleValue')?.textContent,setting:__RHODES__.state.settings.characterScale})`));
await evalJS(send, `(()=>{const el=document.getElementById('charScale');el.value='1.6';el.dispatchEvent(new Event('input',{bubbles:true}));return true})()`);
await new Promise(r => setTimeout(r, 300));
console.log(await evalJS(send, `JSON.stringify({slider:document.getElementById('charScale')?.value,label:document.getElementById('charScaleValue')?.textContent,setting:__RHODES__.state.settings.characterScale})`));
process.exit(0);
