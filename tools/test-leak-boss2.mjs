import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
const mk = `(o={})=>({uid:'e'+Math.random(),x:5.4,y:64,lane:0,dead:false,boss:false,blockedBy:null,speed:0,slow:0,stun:0,vulnT:0,slowT:0,burnT:0,hp:100,maxHp:100,atk:1,def:0,res:0,size:1,attackCd:1,attackFlash:0,hitFlash:0,...o})`;
console.log('leak', await evalJS(send, `(()=>{const b=__RHODES__.battle;b.start('CE-6');for(let i=0;i<3;i++){const e=(${mk})();b.enemies.push(e);b._updateEnemies(0.1)}return JSON.stringify({leaks:b.leaks,status:b.status,base:b.baseHp})})()`));
console.log('bossleak', await evalJS(send, `(()=>{const b=__RHODES__.battle;b.start('CE-6');const e=(${mk})({boss:true});b.enemies.push(e);b._updateEnemies(0.1);return JSON.stringify({leaks:b.leaks,status:b.status})})()`));
console.log('bob', await evalJS(send, `(async()=>{const n=document.querySelector('.ally-token');const a=n.style.top;await new Promise(r=>setTimeout(r,220));const b=n.style.top;return JSON.stringify({a,b,changed:a!==b})})()`));
process.exit(0);
