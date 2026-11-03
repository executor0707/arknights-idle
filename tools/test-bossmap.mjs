import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `(()=>{const b=__RHODES__.battle;const old=b.stage;const out={};for(const id of ['main-0-1','main-4-1','main-11-1','main-17-1','endless-5','ann-1']){const s=__RHODES__.G.STAGE_BY_ID.get(id);b.stage=s;out[id]=[s?.chapterKey,s?.group,b._bossKeyForStage()]}b.stage=old;return JSON.stringify(out)})()`));
process.exit(0);
