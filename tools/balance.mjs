import { connect, evalJS } from './cdp.mjs';

const { send } = await connect();
await send('Page.enable'); await send('Runtime.enable');
await send('Page.navigate', { url: 'http://127.0.0.1:8765/index.html' });
await new Promise(r => setTimeout(r, 700));
await evalJS(send, `localStorage.clear(); location.reload(); true`);
await new Promise(r => setTimeout(r, 900));
await evalJS(send, `document.getElementById('enterBtn').click(); true`);
await new Promise(r => setTimeout(r, 900));
await evalJS(send, `document.querySelector('[data-action="tutorial-skip"]')?.click(); true`);
await new Promise(r => setTimeout(r, 400));

const expr = `(() => {
  const G = __RHODES__.G;
  const b = __RHODES__.battle;
  const allMain = G.STAGES.filter(s => s.group === 'main').map(s => s.id);
  const allStageIds = G.STAGES.map(s => s.id);
  const original = { squad: __RHODES__.state.squad.slice(), ops: JSON.parse(JSON.stringify(__RHODES__.state.operators)), auto: __RHODES__.state.stage.auto, cleared: __RHODES__.state.stage.cleared.slice() };
  const top6 = ['wisadel','exusiai','silverash','eyjafjalla','surtr','skadi_alter','texas_alter','logos','mlynar','jian','shu','nearl_alter'];
  const mixed = ['amiya','fang','kroos','melantha','beagle','ansel','hibiscus','popukar','lappland','ptilopsis','texas','cuora'];
  const starter = ['amiya','fang','kroos','melantha','beagle','ansel','hibiscus','popukar'];
  function setTeam(ids, level, elite, pot, skill) {
    const st = __RHODES__.state;
    st.operators = {};
    for (const id of ids) {
      const o = G.ensureOp(id);
      o.level = level; o.elite = elite; o.potential = pot; o.skill = skill; o.mastery = 0; o.trust = 100; o.module = 0;
    }
    st.squad = ids.slice(0,12); while (st.squad.length < 12) st.squad.push(null);
    st.stage.cleared = allMain.slice();
    st.settings.autoSkill = true;
    st.stage.auto = false;
  }
  function run(ids, stageId, level, elite, pot, skill, n=2) {
    setTeam(ids, level, elite, pot, skill);
    const out = [];
    for (let i=0;i<n;i++) {
      b.start(stageId);
      let guard = 0;
      while (b.status === 'running' && guard++ < 4000) b.tick(0.05);
      out.push({status:b.status, time:+b.time.toFixed(1), base:b.baseHp, kills:b.kills, power:G.squadPower()});
    }
    return { stage: stageId, rec: G.STAGE_BY_ID.get(stageId).rec, power: G.squadPower(), runs: out };
  }
  const results = [];
  results.push({label:'starter E0L1 x CE-6', ...run(starter,'CE-6',1,0,1,1,2)});
  results.push({label:'starter E0L1 x 0-1', ...run(starter,'main-0-1',1,0,1,1,2)});
  results.push({label:'starter E0L30 x 0-4', ...run(starter,'main-0-4',30,0,1,3,2)});
  results.push({label:'starter E0L40 x 1-7', ...run(starter,'main-1-7',40,0,1,3,2)});
  results.push({label:'mixed E0L40 x 2-3', ...run(mixed,'main-2-3',40,0,1,3,2)});
  results.push({label:'top6 E0L50 x 4-4', ...run(top6,'main-4-4',50,0,1,3,2)});
  results.push({label:'top6 E1L70 x 8-3', ...run(top6,'main-8-3',70,1,2,5,2)});
  results.push({label:'top6 E1L80 x 10-5', ...run(top6,'main-10-5',80,1,3,6,2)});
  results.push({label:'top6 E2L90 x 12-7', ...run(top6,'main-12-7',90,2,3,7,2)});
  results.push({label:'top6 E2L90 x 15-3', ...run(top6,'main-15-3',90,2,5,7,5)});
  const st = __RHODES__.state;
  st.squad = original.squad; st.operators = original.ops; st.stage.auto = original.auto; st.stage.cleared = original.cleared;
  return results;
})()`;
const results = await evalJS(send, expr, false);
console.log(JSON.stringify(results, null, 2));
process.exit(0);
