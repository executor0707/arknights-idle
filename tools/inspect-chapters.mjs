import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `JSON.stringify(['main-0-1','main-4-1','main-8-1','main-11-1','main-17-1'].map(id=>{const s=__RHODES__.G.STAGE_BY_ID.get(id);return [id,s?.chapterKey,s?.group] }))`));
process.exit(0);
