const names = ['令', '逻各斯', '黍', '维什戴尔', '塑心', '塔露拉', '锏', '荒芜拉普兰德'];
for (const n of names) {
  const u = 'https://prts.wiki/api.php?action=parse&format=json&page=' + encodeURIComponent(n) + '&prop=wikitext';
  try {
    const r = await fetch(u, { headers: { 'user-agent': 'Mozilla/5.0' } });
    const j = await r.json();
    const t = j.parse?.wikitext?.['*'] || '';
    const m = t.match(/char_[0-9]+_[a-z0-9]+/i) || t.match(/干员ID\s*=\s*([^\n|]+)/);
    console.log(n, r.status, m?.[0] || 'none', t.slice(0, 120).replace(/\n/g, ' '));
  } catch (e) { console.log(n, 'ERR'); }
}
