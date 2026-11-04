import fs from 'node:fs';
const chars=JSON.parse(fs.readFileSync('.cache/character_table.json','utf8'));
const skills=JSON.parse(fs.readFileSync('.cache/skill_table.json','utf8'));
for(const id of ['char_391_rosmon','char_4065_judge','char_136_hsguma','nian','amiya']){
  const c=chars[id]; if(!c){console.log('missing',id);continue;}
  console.log('\n',id,c.name);
  console.log((c.skills||[]).map(s=>s.skillId));
  for(const s of (c.skills||[]).slice(0,3)){
    const sk=skills[s.skillId];
    console.log(s.skillId, sk?.levels?.[0]?.name, sk?.skillType, sk?.levels?.[0]?.description?.slice(0,250));
  }
}
