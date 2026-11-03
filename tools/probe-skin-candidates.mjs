const ids = ['char_1001_amiya2','char_4009_irene','char_4132_ascln','char_4178_alanna','char_291_aglina','char_188_helage'];
for (const id of ids) {
  const r = await fetch(`https://torappu.prts.wiki/assets/char_spine/${id}/meta.json`);
  if (!r.ok) { console.log(id, 'HTTP', r.status); continue; }
  const j = await r.json();
  console.log('\n', id, j.name, Object.keys(j.skin || {}));
  for (const [name, parts] of Object.entries(j.skin || {})) {
    console.log(' ', name, parts['正面']?.file || parts['正面'] || Object.keys(parts));
  }
}
