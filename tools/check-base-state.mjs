import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{const G=__RHODES__.G,s=__RHODES__.state;const ids=['control','trade','factory','power','reception','workshop','training','dorm'];for(const id of ids)s.base.rooms[id]={level:10,damaged:false};const r=G.roomDef?G.roomDef('factory'):null;return JSON.stringify({factoryState:s.base.rooms.factory,factoryDef:r,baseBonuses:G.getBaseBonuses(),rate:G.roomRate('factory'),summary:G.baseSummary(),allRooms:s.base.rooms})})()`));
process.exit(0);
