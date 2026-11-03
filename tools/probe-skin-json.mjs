const page = '阿米娅(近卫)/spine';
const u = 'https://prts.wiki/api.php?action=query&format=json&prop=revisions&rvprop=content&rvslots=main&titles=' + encodeURIComponent(page);
const j = await (await fetch(u, { headers: { 'user-agent': 'RhodesIslandIdle/2.0' } })).json();
console.log(JSON.stringify(j).slice(0, 3000));
