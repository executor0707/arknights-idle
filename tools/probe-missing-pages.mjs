const names = ['阿斯卡纶', '艾拉', '贝洛内', '涤火杰西卡', '阿兰娜', '九色鹿', '阿米娅(医疗)', '承曦格雷伊', '赤刃明霄陈'];
for (const n of names) {
  const u = 'https://prts.wiki/api.php?action=parse&format=json&page=' + encodeURIComponent(n + '/spine') + '&prop=wikitext';
  try {
    const r = await fetch(u, { headers: { 'user-agent': 'Mozilla/5.0' } });
    const j = await r.json();
    const t = j.parse?.wikitext?.['*'] || '';
    console.log('\n###', n, r.status, 'parse', !!j.parse, 'len', t.length);
    console.log(t.slice(0, 500).replace(/\n/g, ' '));
  } catch (e) { console.log(n, 'ERR', e.message); }
}
