import fs from 'node:fs';
import { OPERATORS } from '../build/app/js/operators.js';
const chars=JSON.parse(fs.readFileSync('.cache/character_table.json','utf8'));
const ids=['12f','char_1001_amiya2','char_1037_amiya3','char_4188_confes','char_286_cast3','durin','char_4093_frston','char_4227_gallus','noir_corne','char_4220_kormr','char_285_medic2','char_4215_buddy','char_4136_phonor','char_376_therex','char_4077_palico','char_4091_ulika','rangers','yato','char_506_rmedic','char_504_rguard','char_507_rsnipe','char_505_rcast','char_514_rdfend','char_4000_jnight'];
for(const id of ids){const o=OPERATORS.find(x=>x.id===id);console.log('\n',id,o?.name,o?.skill?.name,o?.skill?.desc);const rows=Object.entries(chars).filter(([k,v])=>v.name===o?.name||v.name?.includes(o?.name||'__')||k===id);console.log(rows.map(([k,v])=>[k,v.name,(v.skills||[]).map(s=>s.skillId)]).slice(0,5));}
