const names = ['士兵','源石虫','盾卫','术师','无人机','猎狗','暴徒','碎骨','弑君者','霜星','浮士德','梅菲斯特','重装防御者','源石虫·α'];
for (const n of names) {
  const u = 'https://prts.wiki/api.php?action=parse&format=json&page=' + encodeURIComponent(n + '/spine') + '&prop=wikitext';
  try {
    const r = await fetch(u, { headers: { 'user-agent': 'Mozilla/5.0' } });
    const j = await r.json();
    const t = j.parse?.wikitext?.['*'] || '';
    const f = t.match(/"file": "([^"]+)"/)?.[1] || '';
    console.log(n, r.status, !!j.parse, f);
  } catch (e) { console.log(n, 'ERR'); }
}
