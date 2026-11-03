import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `JSON.stringify([...document.querySelectorAll('.stage-card')].slice(0,2).map(x=>({text:x.innerText,html:x.innerHTML.slice(0,500),h:x.getBoundingClientRect().height})))`));
process.exit(0);
