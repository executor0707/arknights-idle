import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `JSON.stringify({view:document.querySelector('.page')?.className,notes:document.querySelector('.gacha-notes')?.innerText,dist:[...document.querySelectorAll('.pity-item')].map(x=>x.innerText)})`));
process.exit(0);
