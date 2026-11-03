import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `JSON.stringify((()=>{const w=document.querySelector('.spine38-frame').contentWindow;return {last:w.__frameLast,err:w.__frameErr,keys:Object.keys(w.__frame?.dataCache||{}),loading:[...(w.__frame?.loading||[])],sprites:w.__frame?.sprites?.size}})())`));
process.exit(0);
