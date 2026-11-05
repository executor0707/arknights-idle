import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{const cards=[...document.querySelectorAll('.selector-card')];const cls=[...new Set(cards.map(c=>c.dataset.cls))];return JSON.stringify({count:cards.length,classes:cls,guards:cards.filter(c=>c.dataset.cls==='近卫').length,visible:cards.filter(c=>!c.classList.contains('hidden')).length,btn:[...document.querySelectorAll('[data-action="selector-class"]')].map(b=>[b.dataset.value,b.classList.contains('active')])})})()`));
process.exit(0);
