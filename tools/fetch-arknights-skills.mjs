import fs from 'node:fs';
const base='https://api.github.com/repos/Kengxxiao/ArknightsGameData/contents/zh_CN/gamedata/excel/';
for (const name of ['character_table.json','skill_table.json']) {
  const r=await fetch(base+name,{headers:{'user-agent':'x',accept:'application/vnd.github.raw'}});
  if(!r.ok) throw new Error(name+' '+r.status);
  const b=Buffer.from(await r.arrayBuffer());
  fs.writeFileSync('.cache/'+name,b);
  console.log(name,b.length);
}
