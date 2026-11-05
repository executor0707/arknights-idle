import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{__RHODES__.setView('archive',true);const i=document.getElementById('charSpacing');return JSON.stringify({slider:!!i,value:i?.value,label:document.getElementById('charSpacingValue')?.textContent,heading:document.querySelector('.page h1')?.textContent})})()`));
process.exit(0);
