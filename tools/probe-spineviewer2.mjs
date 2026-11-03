const t = await (await fetch('https://static.prts.wiki/widgets/production/SpineViewer.Cjw6l2fw.js')).text();
for (const m of t.matchAll(/static\.prts\.wiki[^`'" ]{0,140}/g)) console.log(m[0].slice(0, 200));
for (const m of t.matchAll(/char_spine[^`'" ]{0,100}/g)) console.log('CHAR', m[0]);
