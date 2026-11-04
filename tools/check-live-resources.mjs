import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log(await evalJS(send, `JSON.stringify(performance.getEntriesByType('resource').filter(x=>x.name.includes('js10')).map(x=>({n:x.name,d:Math.round(x.duration),t:x.transferSize})))`));
process.exit(0);
