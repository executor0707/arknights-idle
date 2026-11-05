import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{const c=document.querySelector('.selector-card');return JSON.stringify({cls:c?.dataset.cls,name:c?.dataset.name,filter:window.__RHODES__?.ui?.selectorFilter,modal:!!document.querySelector('.modal-backdrop')})})()`));
process.exit(0);
