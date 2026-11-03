import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
await send('Page.bringToFront');
await evalJS(send, `__RHODES__.setView('battle', true); __RHODES__.battle.start('CE-6'); true`);
await new Promise(r => setTimeout(r, 500));
await evalJS(send, `(()=>{const b=__RHODES__.battle;b._spawnEnemy({type:'boss',wave:3,boss:true,bossKey:'boss_skulsr'});return true})()`);
await new Promise(r => setTimeout(r, 1200));
console.log(await evalJS(send, `(()=>{const f=document.querySelector('iframe.spine38-frame');const s=f?.contentWindow?.__frame?.sprites;const out=[];for(const [k,sp] of s){if(k.startsWith('e:'))out.push({h:Math.round(sp.height)})}return JSON.stringify({enemyScale:__RHODES__.state.settings.enemyScale,enemies:out.slice(-4)})})()`));
process.exit(0);
