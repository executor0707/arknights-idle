import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `JSON.stringify((()=>{const f=document.querySelector('.spine38-frame');const w=f.contentWindow;return {info:w.__frame?.info,bg:getComputedStyle(w.document.body).backgroundColor,htmlbg:getComputedStyle(w.document.documentElement).backgroundColor,canvas:!!w.document.querySelector('canvas'),sprites:w.__frame?.sprites?.size,ops:Object.keys(w.__frame?.ops||{}).length}})())`));
process.exit(0);
