import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{
 const st=__RHODES__.state; const G=__RHODES__.G;
 const before=G.maxEndlessPower();
 const levels={}; for(const [id,r] of Object.entries(st.base.rooms)){levels[id]=r.level;r.level+=1;}
 const all=G.maxEndlessPower();
 for(const [id,ly] of Object.entries(levels)) st.base.rooms[id].level=ly;
 // all rooms except control (crit) to exclude crit contribution
 for(const [id,r] of Object.entries(st.base.rooms)) if(id!=='control') r.level+=1;
 const noCrit=G.maxEndlessPower();
 for(const [id,ly] of Object.entries(levels)) st.base.rooms[id].level=ly;
 return JSON.stringify({before,all,noCrit,deltaAll:all-before,deltaNoCrit:noCrit-before,levels});
})()`));
process.exit(0);
