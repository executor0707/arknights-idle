import { connect, evalJS } from './cdp.mjs';
const { send } = await connect();
console.log('events', await evalJS(send, `(()=>{let ev=null;for(let i=0;i<200&&!ev;i++){__RHODES__.state.randomEvent.nextAt=1;ev=__RHODES__.G.checkRandomEvent();}return JSON.stringify({event:ev?.event?.id,result:ev?.result,log:__RHODES__.state.randomEvent.log.length})})()`));
console.log('amiya', await evalJS(send, `(()=>{const st=__RHODES__.state;st.stage.cleared.push('main-R8-11','main-14-23');__RHODES__.G.unlockAmiyaForms();return JSON.stringify({guard:!!st.operators['char_1001_amiya2'],medic:!!st.operators['char_1037_amiya3'],unlocked:[__RHODES__.G.amiyaFormUnlocked('char_1001_amiya2'),__RHODES__.G.amiyaFormUnlocked('char_1037_amiya3')]})})()`));
console.log('skins', await evalJS(send, `JSON.stringify({s1:document.querySelector('img[src*="char_1001_amiya2-skin1"]')?.src||null,s2:document.querySelector('img[src*="char_1001_amiya2-skin2"]')?.src||null})`));
process.exit(0);
