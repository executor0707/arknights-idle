import { execFileSync } from 'node:child_process';
import { OPERATORS } from '../build/app/js/operators.js';
const ids = [
  'char_388_mint-skin1','char_388_mint-skin2','char_445_wscoot-skin1',
  'char_426_billro-skin1','char_426_billro-skin2','char_486_takila-skin1','char_486_takila-skin2',
  'mlynar-skin1','mlynar-skin2','char_344_beewax-skin1','char_344_beewax-skin2',
  'char_1043_leizi2-skin1','char_376_therex-skin1','liskarm-skin1','liskarm-skin2',
];
const txt = execFileSync('git',['show','7ba65f0:build/app/js/skins.js'],{encoding:'utf8'});
const start=txt.indexOf('['), end=txt.indexOf('\n];',start)+2;
const skins=JSON.parse(txt.slice(start,end));
for(const id of ids){const s=skins.find(x=>x.id===id);const o=OPERATORS.find(x=>x.id===s?.opId);console.log(JSON.stringify({skinId:id,skin:s?.name,opId:s?.opId,operator:o?.name,rarity:o?.rarity,role:o?.role,sub:o?.sub,img:s?.img},null,0));}
