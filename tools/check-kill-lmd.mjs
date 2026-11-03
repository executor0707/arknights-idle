import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `JSON.stringify({lmd:__RHODES__.state.lmd,budget:__RHODES__.battle.killLmdBudget,paid:__RHODES__.battle.killLmdPaid,kills:__RHODES__.battle.kills,allies:__RHODES__.battle.allies.map(a=>a.id)})`));
process.exit(0);
