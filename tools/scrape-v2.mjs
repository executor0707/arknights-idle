import { writeFile, mkdir } from 'node:fs/promises';
import { OPERATORS as OLD } from './operators.mjs';

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function getJSON(url, tries = 6) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'RhodesIslandIdle/2.0' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(900 * (i + 1));
    }
  }
}
const api = (q) => 'https://prts.wiki/api.php?' + q;

// 1. all operator pages + all stage pages
async function cat(name) {
  const j = await getJSON(api('action=query&format=json&list=categorymembers&cmlimit=500&cmtitle=' + encodeURIComponent('Category:' + name)));
  return (j.query?.categorymembers || []).map(x => x.title);
}
const opTitles = await cat('干员');
const mainTitles = await cat('主线关卡');
const annTitles = await cat('剿灭关卡');
console.log('titles', opTitles.length, mainTitles.length, annTitles.length);
await writeFile('.cache/stage-titles.json', JSON.stringify({ main: mainTitles, annihilation: annTitles }, null, 2));

// 2. fetch wikitext + categories in batches
const pages = {};
for (let i = 0; i < opTitles.length; i += 18) {
  const batch = opTitles.slice(i, i + 18);
  const j = await getJSON(api('action=query&format=json&prop=revisions|categories&rvslots=main&rvprop=content&cllimit=max&titles=' + encodeURIComponent(batch.join('|'))));
  const list = j.query?.pages || {};
  for (const p of Object.values(list)) {
    if (!p.title) continue;
    const text = p.revisions?.[0]?.slots?.main?.['*'] || '';
    pages[p.title] = { text, categories: (p.categories || []).map(c => c.title) };
  }
  console.log('batch', i, Object.keys(list).length);
  await sleep(100);
}
await writeFile('.cache/all-pages.json', JSON.stringify(pages, null, 2));

const field = (t, n) => t.match(new RegExp('\\|' + n + '=([^\\n\\r]*)'))?.[1]?.trim() || '';
const allFields = (t, n) => [...t.matchAll(new RegExp('\\|' + n + '=([^\\n|\\r]*)', 'g'))].map(m => m[1].trim()).filter(Boolean);
const oldByName = new Map(OLD.map(o => [o.name, o]));
const roleMap = { 先锋: 'vanguard', 近卫: 'guard', 重装: 'defender', 狙击: 'sniper', 术师: 'caster', 医疗: 'medic', 辅助: 'supporter', 特种: 'specialist' };
const skillType = { 先锋: 'buff', 近卫: 'aoe', 重装: 'shield', 狙击: 'multi', 术师: 'aoe', 医疗: 'heal', 辅助: 'buff', 特种: 'control' };
const ops = [];
const skins = [];
const seenIds = new Set();
for (const title of opTitles) {
  const page = pages[title];
  if (!page || !page.text.includes('CharinfoV2')) continue;
  const t = page.text;
  const charId = field(t, '干员id');
  if (!charId) continue;
  const name = field(t, '干员名') || title;
  const rarity = Math.min(6, Math.max(2, Number(field(t, '稀有度')) + 1 || 3));
  const cls = field(t, '职业') || '近卫';
  const sub = field(t, '分支') || cls;
  const r = roleMap[cls] || 'guard';
  const old = oldByName.get(name) || oldByName.get(title);
  const id = old?.id || charId;
  if (seenIds.has(id)) continue;
  seenIds.add(id);
  const cats = page.categories.join('|');
  const limited = cats.includes('限定干员');
  const collab = cats.includes('联动干员');
  const getWay = field(t, '获得方式');
  const welfare = /活动赠送|赠送干员|活动干员/.test(getWay) || /活动赠送/.test(t);
  let skillNames = allFields(t, '技能名').filter(x => x && !/技能名/.test(x));
  if (!skillNames.length) skillNames = allFields(t, '技能').slice(-1);
  const skillName = (old?.skill?.name) || skillNames[skillNames.length - 1] || '战术指令';
  const skill = old?.skill || {
    type: skillType[cls] || 'nuke',
    power: rarity >= 6 ? 2.8 : rarity >= 5 ? 2.2 : rarity >= 4 ? 1.9 : 1.6,
    ...(skillType[cls] === 'heal' ? { power: rarity >= 6 ? 1.9 : 1.5 } : {}),
    ...(skillType[cls] === 'shield' ? { duration: 6 } : {}),
    ...(skillType[cls] === 'control' ? { duration: 2 } : {}),
    ...(skillType[cls] === 'buff' ? { duration: 8 } : {}),
    desc: `自动释放${skillName}，按${cls}职业模板对战场产生效果。`,
  };
  const talentNames = allFields(t, '天赋').filter(x => x && x !== '？？？');
  const talent = old?.talent || (talentNames.length ? { name: talentNames[talentNames.length - 1], desc: `与${cls}职业特性联动的被动效果。` } : null);
  ops.push({
    id, name, rarity, cls, sub, role: r,
    img: `${id}.webp`,
    skill: { name: skillName, ...skill },
    talent,
    quote: old?.quote || '',
    limited: old ? old.limited : limited,
    collab: old ? old.collab : collab,
    welfare,
  });
  for (let i = 1; i <= 12; i++) {
    const sn = field(t, `时装${i}名称`);
    if (!sn) continue;
    skins.push({
      id: `${id}-skin${i}`, opId: id, key: `skin${i}`, name: sn,
      series: field(t, `时装${i}系列`), color: field(t, `时装${i}颜色`) || '#888888',
      desc: field(t, `时装${i}介绍`), img: `${id}-skin${i}.webp`,
    });
  }
}
await mkdir('.cache', { recursive: true });
await writeFile('.cache/all-operators.json', JSON.stringify(ops, null, 2));
await writeFile('.cache/all-skins.json', JSON.stringify(skins, null, 2));
console.log('parsed', ops.length, 'operators', skins.length, 'skins');
console.log('limited', ops.filter(o => o.limited).length, 'collab', ops.filter(o => o.collab).length, 'welfare', ops.filter(o => o.welfare).length);
console.log('rarity', ops.reduce((a, o) => { a[o.rarity] = (a[o.rarity] || 0) + 1; return a; }, {}));
