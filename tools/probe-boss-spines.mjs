const names = ['弑君者','爱国者','塔露拉','曼弗雷德','特雷西斯','变形者集群','霜星','浮士德','梅菲斯特','碎骨','泥岩','大鲍勃','泥岩巨像','皇帝的利刃','岁相','睚','祟','无胄盟','血骑士','烛骑士','蒸汽骑士','灰烬','曼德拉','黑蛇','喉舌','歌者','梅菲斯特·歌者','不死的黑蛇','霜星·冬痕','霜星，"冬痕"'];
for (const n of names) {
  const u = 'https://prts.wiki/api.php?action=parse&format=json&page=' + encodeURIComponent(n + '/spine') + '&prop=wikitext';
  try {
    const r = await fetch(u, { signal: AbortSignal.timeout(12000), headers: { 'user-agent': 'Mozilla/5.0' } });
    const j = await r.json();
    const t = j.parse?.wikitext?.['*'] || '';
    const f = t.match(/"file": "([^"]+)"/)?.[1] || '';
    if (r.ok && j.parse) console.log('OK', n, f);
  } catch (e) {}
}
