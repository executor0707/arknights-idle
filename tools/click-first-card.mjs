import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
const r = JSON.parse(await evalJS(send, `(()=>{const c=document.querySelector('.op-card');const r=c.getBoundingClientRect();return JSON.stringify({x:r.x+r.width/2,y:r.y+r.height/2})})()`));
console.log(r);
await send('Input.dispatchMouseEvent',{type:'mousePressed',x:r.x,y:r.y,button:'left',clickCount:1});
await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:r.x,y:r.y,button:'left',clickCount:1});
await new Promise(res=>setTimeout(res,500));
console.log(await evalJS(send, `JSON.stringify({modal:!!document.querySelector('.modal-backdrop'),text:document.querySelector('.modal-backdrop')?.innerText?.slice(0,100)})`));
process.exit(0);
