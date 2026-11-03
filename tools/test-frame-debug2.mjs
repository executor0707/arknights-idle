import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `JSON.stringify((()=>{const f=document.querySelector('.spine38-frame');const w=f.contentWindow;return {allies:__RHODES__.battle.allies.map(a=>a.id),enemy:__RHODES__.battle.enemies.map(e=>e.type),keys:Object.keys(w.__frame?.dataCache||{}),loading:[...(w.__frame?.loading||[])],sprites:w.__frame?.sprites?.size,ops:Object.keys(w.__frame?.ops||{}).slice(0,5),has:!!w.__frame?.ops?.amiya,base:w.__frame?.ops?.amiya}})())`));
process.exit(0);
