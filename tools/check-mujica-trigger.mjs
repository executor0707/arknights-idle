import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{const s=__RHODES__.state,G=__RHODES__.G;const m=['char_4182_oblvns','char_4183_mortis','char_4184_dolris','char_4186_tmoris','char_4185_amoris'];for(const id of m)s.operators[id]={level:90,elite:2,potential:5,skill:7,mastery:3,trust:100,module:3,exp:0};s.squad=m;__RHODES__.setView('battle',true);const b=__RHODES__.battle;b.start('CE-6');const all=b.allies.map(a=>({id:a.id,hp:a.hp}));const before={mujicaT:b.mujicaT,allies:all,enemies:b.enemies.length};b._updateMujica(4.1);return JSON.stringify({before,afterT:b.mujicaT,enemyHp:b.enemies.map(e=>Math.round(e.hp)),stun:b.enemies.map(e=>e.stun),allyBuff:b.allies.map(a=>[a.id,a.buffAtk,a.buffUntil])})})()`));
process.exit(0);
