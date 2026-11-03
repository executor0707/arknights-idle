import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{const b=__RHODES__.battle;b.start('endless-1');b._finish(true,'test');const n=b.nextStageId;b.tick(4);return JSON.stringify({next:n,after:b.stage.id,group:b.stage.group,cleared:__RHODES__.state.stage.cleared.filter(x=>x.startsWith('endless'))})})()`));
console.log(await evalJS(send, `JSON.stringify({groups:__RHODES__.G.STAGE_GROUPS.map(x=>x.id),chipGroup:__RHODES__.G.STAGE_GROUPS.some(x=>x.id==='chip'),stages:__RHODES__.G.STAGES.length,endless:__RHODES__.G.STAGES.filter(x=>x.group==='endless').length})`));
process.exit(0);
