import { STAGES as V2_STAGES, STAGE_GROUPS as V2_STAGE_GROUPS, MAIN_CHAPTERS } from './stages-v2.js';

export const SAVE_KEY = 'rhodes_island_idle_save_v1';
export const SAVE_VERSION = 1;
export const MAX_SQUAD = 5;
export const PULL_COST = 600;
export const OFFLINE_CAP_HOURS = 8;
export const CLASSES = ['先锋', '近卫', '重装', '狙击', '术师', '医疗', '辅助', '特种'];
export const CLASS_GLYPH = { 先锋: '锋', 近卫: '卫', 重装: '重', 狙击: '狙', 术师: '术', 医疗: '医', 辅助: '辅', 特种: '特' };
export const CLASS_COLOR = { 先锋: '#f5b84b', 近卫: '#ff6b5e', 重装: '#73b7ff', 狙击: '#8ee08a', 术师: '#c792ff', 医疗: '#68e0c2', 辅助: '#f08ac6', 特种: '#d7dde5' };

export const STAR_COLOR = { 2: '#9aa6a8', 3: '#67a7e8', 4: '#c58cff', 5: '#ffd166', 6: '#ff9b3d' };

export const MATERIALS = {
  record1: { name: '基础作战记录', glyph: '记', tier: 1, kind: 'record', exp: 200, color: '#7f9aa4', desc: '记录着基础战术动作的教学录像。' },
  record2: { name: '初级作战记录', glyph: '记', tier: 2, kind: 'record', exp: 400, color: '#6fb7c9', desc: '经过剪辑的实战记录，可用于干员培训。' },
  record3: { name: '中级作战记录', glyph: '记', tier: 3, kind: 'record', exp: 1000, color: '#72d6d0', desc: '高密度战术数据，快速提升干员等级。' },
  record4: { name: '高级作战记录', glyph: '记', tier: 4, kind: 'record', exp: 2000, color: '#ffc857', desc: '由PRTS整理的高价值作战档案。' },

  book1: { name: '技巧概要·卷一', glyph: '技', tier: 1, kind: 'book', color: '#8fb8c7', desc: '基础技能训练教材。' },
  book2: { name: '技巧概要·卷二', glyph: '技', tier: 2, kind: 'book', color: '#6bd8d0', desc: '进阶技能训练教材。' },
  book3: { name: '技巧概要·卷三', glyph: '技', tier: 3, kind: 'book', color: '#ffc857', desc: '高阶技能与专精训练教材。' },

  chip: { name: '通用芯片', glyph: '芯', tier: 3, kind: 'chip', color: '#9ad6c8', desc: '不分职业的精英化芯片，由挂机产出。' },
  chip_pack: { name: '通用芯片组', glyph: '组', tier: 4, kind: 'chip_pack', color: '#ffb544', desc: '不分职业的精二芯片组，由挂机产出。' },
  chip_vanguard: { name: '先锋芯片', glyph: '锋', tier: 3, kind: 'chip', cls: '先锋', color: CLASS_COLOR['先锋'], desc: '旧版职业芯片，首次读取存档时会转换为通用芯片。' },
  chip_guard: { name: '近卫芯片', glyph: '卫', tier: 3, kind: 'chip', cls: '近卫', color: CLASS_COLOR['近卫'], desc: '近卫干员精英化所需的芯片。' },
  chip_defender: { name: '重装芯片', glyph: '重', tier: 3, kind: 'chip', cls: '重装', color: CLASS_COLOR['重装'], desc: '重装干员精英化所需的芯片。' },
  chip_sniper: { name: '狙击芯片', glyph: '狙', tier: 3, kind: 'chip', cls: '狙击', color: CLASS_COLOR['狙击'], desc: '狙击干员精英化所需的芯片。' },
  chip_caster: { name: '术师芯片', glyph: '术', tier: 3, kind: 'chip', cls: '术师', color: CLASS_COLOR['术师'], desc: '术师干员精英化所需的芯片。' },
  chip_medic: { name: '医疗芯片', glyph: '医', tier: 3, kind: 'chip', cls: '医疗', color: CLASS_COLOR['医疗'], desc: '医疗干员精英化所需的芯片。' },
  chip_supporter: { name: '辅助芯片', glyph: '辅', tier: 3, kind: 'chip', cls: '辅助', color: CLASS_COLOR['辅助'], desc: '辅助干员精英化所需的芯片。' },
  chip_specialist: { name: '特种芯片', glyph: '特', tier: 3, kind: 'chip', cls: '特种', color: CLASS_COLOR['特种'], desc: '特种干员精英化所需的芯片。' },

  pack_vanguard: { name: '先锋芯片组', glyph: '锋', tier: 4, kind: 'chip_pack', cls: '先锋', color: CLASS_COLOR['先锋'], desc: '先锋干员精二所需的芯片组。' },
  pack_guard: { name: '近卫芯片组', glyph: '卫', tier: 4, kind: 'chip_pack', cls: '近卫', color: CLASS_COLOR['近卫'], desc: '近卫干员精二所需的芯片组。' },
  pack_defender: { name: '重装芯片组', glyph: '重', tier: 4, kind: 'chip_pack', cls: '重装', color: CLASS_COLOR['重装'], desc: '重装干员精二所需的芯片组。' },
  pack_sniper: { name: '狙击芯片组', glyph: '狙', tier: 4, kind: 'chip_pack', cls: '狙击', color: CLASS_COLOR['狙击'], desc: '狙击干员精二所需的芯片组。' },
  pack_caster: { name: '术师芯片组', glyph: '术', tier: 4, kind: 'chip_pack', cls: '术师', color: CLASS_COLOR['术师'], desc: '术师干员精二所需的芯片组。' },
  pack_medic: { name: '医疗芯片组', glyph: '医', tier: 4, kind: 'chip_pack', cls: '医疗', color: CLASS_COLOR['医疗'], desc: '医疗干员精二所需的芯片组。' },
  pack_supporter: { name: '辅助芯片组', glyph: '辅', tier: 4, kind: 'chip_pack', cls: '辅助', color: CLASS_COLOR['辅助'], desc: '辅助干员精二所需的芯片组。' },
  pack_specialist: { name: '特种芯片组', glyph: '特', tier: 4, kind: 'chip_pack', cls: '特种', color: CLASS_COLOR['特种'], desc: '特种干员精二所需的芯片组。' },

  rock1: { name: '源岩', glyph: '岩', tier: 1, kind: 'material', color: '#b3a58a', desc: '常见的矿物原料，用途广泛。' },
  rock2: { name: '固源岩', glyph: '岩', tier: 2, kind: 'material', color: '#cbbd9a', desc: '经过初步处理的源岩。' },
  rock3: { name: '固源岩组', glyph: '岩', tier: 3, kind: 'material', color: '#e6d7a9', desc: '高纯度的固源岩集合体。' },
  sugar1: { name: '代糖', glyph: '糖', tier: 1, kind: 'material', color: '#e7a0b5', desc: '基础的有机化合物。' },
  sugar2: { name: '糖', glyph: '糖', tier: 2, kind: 'material', color: '#f0bcc9', desc: '精炼后的糖类材料。' },
  sugar3: { name: '糖聚块', glyph: '糖', tier: 3, kind: 'material', color: '#ffd3dd', desc: '高密度糖聚合物。' },
  ester1: { name: '酯原料', glyph: '酯', tier: 1, kind: 'material', color: '#9eb9df', desc: '用于合成聚酸酯的原料。' },
  ester2: { name: '聚酸酯', glyph: '酯', tier: 2, kind: 'material', color: '#b9d2f2', desc: '常见的工业合成材料。' },
  ester3: { name: '聚酸酯组', glyph: '酯', tier: 3, kind: 'material', color: '#d7e8ff', desc: '高强度聚酸酯组件。' },
  iron1: { name: '异铁', glyph: '铁', tier: 1, kind: 'material', color: '#9ab3b6', desc: '带有微弱活性的金属。' },
  iron2: { name: '异铁组', glyph: '铁', tier: 2, kind: 'material', color: '#b5cfd1', desc: '成组的异铁材料。' },
  ketone1: { name: '酮凝集', glyph: '酮', tier: 1, kind: 'material', color: '#cf9fdb', desc: '酮类物质的凝集形态。' },
  ketone2: { name: '酮凝集组', glyph: '酮', tier: 2, kind: 'material', color: '#e0b9ea', desc: '高纯度的酮凝集组。' },
  device1: { name: '装置', glyph: '装', tier: 2, kind: 'material', color: '#d4c46f', desc: '可回收的机械装置。' },
  device2: { name: '全新装置', glyph: '装', tier: 3, kind: 'material', color: '#eadb8f', desc: '未经使用的精密装置。' },
  alcohol: { name: '扭转醇', glyph: '醇', tier: 3, kind: 'material', color: '#8fd3c7', desc: '具有扭转性质的醇类。' },
  grindstone: { name: '研磨石', glyph: '磨', tier: 3, kind: 'material', color: '#c5b7a5', desc: '用于精密打磨的矿石。' },
  rma: { name: 'RMA70-12', glyph: 'R', tier: 3, kind: 'material', color: '#e3866d', desc: '一种活性研磨材料。' },
  manganese: { name: '轻锰矿', glyph: '锰', tier: 3, kind: 'material', color: '#d3a1d8', desc: '轻质的锰系矿物。' },
  alloy: { name: '炽合金', glyph: '合', tier: 4, kind: 'material', color: '#ffaa74', desc: '耐高温的活性合金。' },
  crystal: { name: '晶体元件', glyph: '晶', tier: 4, kind: 'material', color: '#a7d9ff', desc: '高纯度晶体电路元件。' },
  gel: { name: '凝胶', glyph: '胶', tier: 4, kind: 'material', color: '#9fe6c8', desc: '具有记忆性的活性凝胶。' },
  module: { name: '模组数据块', glyph: '组', tier: 4, kind: 'module', color: '#ffd166', desc: '用于解锁与升级干员模组的数据块。' },
  token: { name: '通用信物', glyph: '信', tier: 5, kind: 'token', color: '#ff9b3d', desc: '可替代任意干员信物，提升1点潜能。' },
  base_block: { name: '基建材料块', glyph: '块', tier: 3, kind: 'base', color: '#ffb544', desc: '从战场回收的标准化建材。用于无限升级基建设施。' },
};

export const SKIN_PRICE = 18;
export const PRIME_SHARD_COST = 20;
export const SELECTOR_COST = 300;

export const RECORD_ORDER = ['record4', 'record3', 'record2', 'record1'];

const main = [
  ['0-1', '坍塌', 4200, 3, '切尔诺伯格废墟，第一声警报。', ['rock1', 'ester1']],
  ['0-4', '暴君', 5200, 3, '整合运动的阴影正在逼近。', ['rock1', 'sugar1']],
  ['1-7', '苦难摇篮', 6400, 3, '在废墟中寻找幸存者。', ['rock1', 'rock2', 'ester1']],
  ['2-3', '异卵同生', 7800, 3, '感染者的怒吼回荡在矿场。', ['sugar1', 'sugar2', 'iron1']],
  ['3-4', '二次呼吸', 9400, 3, '雪原上的追击战。', ['ester2', 'iron1', 'ketone1']],
  ['4-4', '不要恐慌', 11200, 3, '龙门贫民窟，巷战开始。', ['iron1', 'ketone1', 'device1']],
  ['5-3', '往昔之风', 13400, 4, '旧日的风穿过废墟。', ['sugar2', 'ester2', 'device1']],
  ['6-5', '局部坏死', 16000, 4, '冻原上的感染者聚落。', ['iron2', 'ketone2', 'alcohol']],
  ['7-9', '苦难摇篮', 19000, 4, '向核心区推进。', ['grindstone', 'rma', 'device2']],
  ['8-3', '怒号光明', 22500, 4, '乌萨斯矿区的火光。', ['manganese', 'alcohol', 'grindstone']],
  ['9-4', '风暴瞭望', 26500, 4, '维多利亚的风暴正在酝酿。', ['rma', 'manganese', 'alloy']],
  ['10-5', '破碎日冕', 31000, 4, '萨卡兹王庭的残响。', ['alloy', 'crystal', 'grindstone']],
  ['11-6', '淬火尘霾', 36000, 5, '伦蒂尼姆的街垒。', ['crystal', 'gel', 'alloy']],
  ['12-7', '惊霆无声', 42000, 5, '维多利亚上空雷声滚滚。', ['gel', 'crystal', 'manganese']],
  ['13-3', '恶兆湍流', 49000, 5, '萨卡兹的源石风暴。', ['gel', 'alloy', 'crystal']],
  ['14-4', '慈悲灯塔', 57000, 5, '灯塔之下，最后的防线。', ['gel', 'crystal', 'alloy']],
  ['15-3', '离解复合', 66000, 5, '源石与文明的边界，在第十五章彻底溶解。', ['gel', 'crystal', 'alloy']],
];

const LEGACY_STAGES = [
  ...main.map(([code, name, rec, waves, desc, drops], i) => ({
    id: 'main-' + code,
    group: 'main',
    code,
    chapter: i < 2 ? '序章' : ['第一章', '第二章', '第三章', '第四章', '第五章', '第六章', '第七章', '第八章', '第九章', '第十章', '第十一章', '第十二章', '第十三章', '第十四章', '第十五章'][i - 2] || '主线',
    name,
    rec,
    waves,
    desc,
    drops,
    color: '#ffb544',
    rewards: { lmd: 420 + rec * 0.16, orundum: i < 4 ? 12 : 18, doctorExp: 10 + i * 2, items: { [drops[0]]: 1 } },
  })),
  {
    id: 'CE-6', group: 'resource', code: 'CE-6', chapter: '资源筹备', name: '龙门币·六',
    rec: 4800, waves: 3, desc: '击退劫掠车队，回收龙门币。挂机产出最稳定的资金来源。',
    color: '#ffd166', drops: [], rewards: { lmd: 7800, orundum: 12, doctorExp: 12, items: {} },
  },
  {
    id: 'LS-6', group: 'resource', code: 'LS-6', chapter: '资源筹备', name: '经验·六',
    rec: 4800, waves: 3, desc: '护送战术记录运输车，获取作战记录。',
    color: '#72d6d0', drops: [], rewards: { lmd: 600, orundum: 12, doctorExp: 12, items: { record3: 2, record2: 3, record1: 4 } },
  },
  ...CLASSES.map((cls, i) => ({
    id: 'PR-D-' + cls,
    group: 'resource',
    code: 'PR-D',
    chapter: '资源筹备',
    name: cls + '芯片组',
    cls,
    rec: 13600 + i * 140,
    waves: 4,
    desc: `高风险芯片回收行动，产出${cls}干员精二所需的芯片组。`,
    color: CLASS_COLOR[cls],
    drops: [],
    rewards: { lmd: 1200, orundum: 22, doctorExp: 24, items: { ['pack_' + ({ 先锋: 'vanguard', 近卫: 'guard', 重装: 'defender', 狙击: 'sniper', 术师: 'caster', 医疗: 'medic', 辅助: 'supporter', 特种: 'specialist' }[cls])]: 1 } },
  })),
  {
    id: 'ANN-1', group: 'annihilation', code: '剿灭', chapter: '长期剿灭', name: '龙门市区',
    rec: 19000, waves: 5, desc: '高压连续作战。单次奖励大量合成玉，适合挂机刷取寻访资源。',
    color: '#ff7a59', drops: ['device2', 'alcohol'], rewards: { lmd: 6200, orundum: 180, doctorExp: 38, items: {} },
  },
  ...CLASSES.map((cls, i) => ({
    id: 'AP-5-' + cls,
    group: 'chip',
    code: 'AP-5',
    chapter: '芯片搜索',
    name: cls + '芯片',
    cls,
    rec: 7600 + i * 120,
    waves: 3,
    desc: `定向回收${cls}干员精英化芯片。可通过芯片关自选职业。`,
    color: CLASS_COLOR[cls],
    drops: [],
    rewards: { lmd: 800, orundum: 14, doctorExp: 16, items: { ['chip_' + ({ 先锋: 'vanguard', 近卫: 'guard', 重装: 'defender', 狙击: 'sniper', 术师: 'caster', 医疗: 'medic', 辅助: 'supporter', 特种: 'specialist' }[cls])]: 2 } },
  })),
];

export const ENDLESS_BOSSES = ['boss_skulsr', 'boss_frstar', 'boss_faust', 'boss_mephi', 'boss_sfsui', 'boss_blksnk'];
export const MAX_ENDLESS_FLOOR = Infinity;
export function makeEndlessStage(n) {
  const floor = Math.max(1, Math.floor(n));
  // Two endless floors per full-base-level power gain. The base calculator
  // currently yields +16 power for upgrading every room once, so +8/floor.
  const rec = 16000 + 8 * (floor - 1);
  const i = floor - 1;
  const bossKey = ENDLESS_BOSSES[(floor * 37 + Math.floor(floor / 7)) % ENDLESS_BOSSES.length];
  return {
    id: 'endless-' + floor,
    group: 'endless',
    code: 'END-' + String(floor - 1).padStart(3, '0'),
    chapter: '无尽战斗',
    name: '无尽战线-' + String(floor - 1),
    floor,
    rec,
    waves: Math.min(8, 3 + Math.floor(i / 3)),
    desc: `无尽战线第 ${floor} 层。敌人强度与规模逐层上升；失败会留在当前层继续挂机，直到练度足够。`,
    color: '#c58cff',
    drops: [],
    firstClearPrime: 1,
    bossKey,
    rewards: { lmd: 1200 + rec * 0.18, orundum: 20 + i * 9, doctorExp: 18 + Math.min(60, i * 4), items: {} },
    idle: {
      orundumPerHour: 9000 + 60 * (floor - 1),
      shardsPerHour: 12 + 0.05 * (floor - 1),
      blocksPerHour: 2.4 + 0.004 * (floor - 1),
      lmdPerHour: 8000 + 22 * (floor - 1),
      expPerHour: 3200 + 9 * (floor - 1),
    },
  };
}
const ENDLESS_STAGES = [makeEndlessStage(1)];

const CORE_STAGES = V2_STAGES.filter(s => s.group !== 'chip' && !(s.group === 'resource' && s.code === 'PR-D'));
const CA_STAGE = {
  id: 'CA-5', group: 'resource', code: 'CA-5', chapter: '资源筹备', name: '技巧概要·五',
  rec: 4800, waves: 3, desc: '整理并回收技巧概要，用于干员技能升级与专精。',
  color: '#c58cff', drops: [], rewards: { lmd: 600, orundum: 12, doctorExp: 12, items: { book1: 4, book2: 2, book3: 1 } },
};
export const STAGES = [...CORE_STAGES, CA_STAGE, ...ENDLESS_STAGES];
export { MAIN_CHAPTERS };

const MIN_REC = 4200;
const MAX_REC = Math.max(...STAGES.map(s => s.rec));
for (const s of STAGES) {
  const t = Math.max(0, Math.min(1, (s.rec - MIN_REC) / (MAX_REC - MIN_REC)));
  if (!s.idle) {
    s.idle = {
      orundumPerHour: 6000 + 12000 * t,
      shardsPerHour: 4.2 + 20 * t,
      blocksPerHour: 1.2 + 2 * t,
      lmdPerHour: 3000 + 9000 * t,
      expPerHour: 1200 + 4800 * t,
    };
  }
  // Universal chips are idle output, not a separate farming stage.
  s.idle.chipsPerHour = 20 + 24 * t;
  s.idle.chipPacksPerHour = 16 + 20 * t;
  s.firstClearPrime = s.firstClearPrime || (s.group === 'annihilation' ? 2 : 1);
}

export const STAGE_GROUPS = V2_STAGE_GROUPS.map(g => g.id === 'chip'
  ? { id: 'endless', name: '无尽战斗', desc: '逐层提升难度，失败后留在本层挂机。' }
  : g);

export const BANNERS = [
  {
    id: 'standard', name: '标准寻访', subtitle: '常驻寻访 · 战术协同',
    tag: '标准', featured6: 'logos', featured5: 'lappland', pool: 'standard',
    image: 'logos', accent: '#ffb544',
    desc: '全部常驻干员混合寻访，包含活动赠送干员。不含限定与联动干员。',
    spark: 0,
  },
  {
    id: 'limited', name: '限定寻访', subtitle: '死魂灵 · 维什戴尔',
    tag: '限定', featured6: 'wisadel', featured5: 'ptilopsis', pool: 'limited',
    image: 'wisadel', accent: '#ff5c4d',
    desc: '全部限定干员混合寻访。限定池拥有独立保底，不与标准寻访共享。',
    spark: 0,
  },
  {
    id: 'collab', name: '联动寻访', subtitle: '源石尘行动 · 灰烬',
    tag: '联动', featured6: 'ash', featured5: 'executor', pool: 'collab',
    image: 'ash', accent: '#67d9ff',
    desc: '全部联动干员混合寻访，包含迷宫饭、彩虹六号、怪物猎人等联动干员。联动池拥有独立保底。',
    spark: 0,
  },
];

export const ROOMS = [
  { id: 'control', name: '控制中枢', glyph: '控', desc: '统筹全舰运作。每级提升全舰产出与基础暴击率。', effect: 'global', rate: 0.02, baseCost: 9000, color: '#ffb544', combat: { crit: 0.0005 }, combatLabel: '暴击率 +0.05%' },
  { id: 'trade', name: '贸易站', glyph: '贸', desc: '与龙门商会对接。每级提升龙门币产出与暴击伤害。', effect: 'lmd', rate: 9, baseCost: 5200, color: '#ffd166', combat: { critDmg: 0.001 }, combatLabel: '暴击伤害 +0.10%' },
  { id: 'factory', name: '制造站', glyph: '造', desc: '生产作战记录。每级提升全队攻击力。', effect: 'record', rate: 2.4, baseCost: 5200, color: '#72d6d0', combat: { atk: 0.0006 }, combatLabel: '全队攻击 +0.06%' },
  { id: 'power', name: '发电站', glyph: '电', desc: '为全舰供能。每级提升攻速与全舰产出。', effect: 'global', rate: 0.015, baseCost: 6800, color: '#67d9ff', combat: { aspd: 0.0003 }, combatLabel: '攻击速度 +0.03%' },
  { id: 'reception', name: '会客室', glyph: '客', desc: '接待来访势力。每级缓慢产出基建材料块并提升治疗量。', effect: 'block', rate: 1 / 1800, baseCost: 8200, color: '#f08ac6', combat: { heal: 0.0004 }, combatLabel: '治疗量 +0.04%' },
  { id: 'workshop', name: '加工站', glyph: '加', desc: '定时整理技巧概要。每级提升治疗量。', effect: 'material', rate: 1 / 240, baseCost: 7000, color: '#c58cff', combat: { heal: 0.0003 }, combatLabel: '治疗量 +0.03%' },
  { id: 'training', name: '训练室', glyph: '训', desc: '定时整理技巧概要。每级提升治疗量。', effect: 'book', rate: 1 / 200, baseCost: 6600, color: '#8ee08a', combat: { heal: 0.0008 }, combatLabel: '治疗量 +0.08%' },
  { id: 'dorm', name: '宿舍', glyph: '宿', desc: '让干员好好休息。每级提升全队生命上限。', effect: 'repair', rate: 0, baseCost: 5800, color: '#d7dde5', combat: { hp: 0.0008 }, combatLabel: '生命上限 +0.08%' },
];

export const DAILY_TASKS = [
  { id: 'runs', name: '完成 5 次作战', metric: 'runs', target: 5, rewards: { lmd: 8000, orundum: 300 } },
  { id: 'pulls', name: '进行 10 次寻访', metric: 'pulls', target: 10, rewards: { orundum: 500, items: { record3: 5 } } },
  { id: 'levels', name: '提升干员等级 8 次', metric: 'levels', target: 8, rewards: { lmd: 12000, items: { book3: 2 } } },
  { id: 'repairs', name: '维修 1 次受损设施', metric: 'repairs', target: 1, rewards: { lmd: 6000, items: { module: 1 } } },
  { id: 'annihilation', name: '完成 1 次剿灭作战', metric: 'annihilation', target: 1, rewards: { orundum: 600, items: { record4: 2 } } },
];

export const SHOP_ITEMS = [
  { id: 'token', name: '通用信物', qty: 1, cost: 120, desc: '为任意已拥有干员提升 1 点潜能。', stock: 1 },
  { id: 'book3', name: '技巧概要·卷三', qty: 3, cost: 30, desc: '技能专精所需的高阶教材。', stock: 3 },
  { id: 'module', name: '模组数据块', qty: 2, cost: 45, desc: '解锁与升级模组。', stock: 2 },
  { id: 'record4', name: '高级作战记录', qty: 5, cost: 25, desc: '快速提升干员等级。', stock: 3 },
];

export const RARITY_NAMES = { 2: '2★', 3: '3★', 4: '4★', 5: '5★', 6: '6★' };
export const RARITY_BASE = {
  2: { hp: 810, atk: 58, def: 24, res: 0 },
  3: { hp: 950, atk: 75, def: 33, res: 0 },
  4: { hp: 1090, atk: 92, def: 42, res: 5 },
  5: { hp: 1210, atk: 105, def: 47, res: 10 },
  6: { hp: 1340, atk: 120, def: 54, res: 15 },
};
export const ROLE_MODS = {
  vanguard: { hp: 1.05, atk: 0.9, def: 0.95, res: 1, interval: 1.15, range: 13, block: 2, heal: 0 },
  guard: { hp: 1.15, atk: 1.15, def: 1, res: 1, interval: 1.25, range: 14, block: 2, heal: 0 },
  defender: { hp: 1.55, atk: 0.7, def: 1.7, res: 1.25, interval: 1.5, range: 13, block: 3, heal: 0 },
  sniper: { hp: 0.75, atk: 1.25, def: 0.6, res: 0.8, interval: 1.02, range: 62, block: 1, heal: 0 },
  caster: { hp: 0.8, atk: 1.35, def: 0.55, res: 1.35, interval: 1.62, range: 58, block: 1, heal: 0, arts: true },
  medic: { hp: 0.8, atk: 0.65, def: 0.6, res: 1, interval: 2.05, range: 55, block: 1, heal: 1 },
  supporter: { hp: 0.85, atk: 0.8, def: 0.65, res: 1.15, interval: 1.55, range: 52, block: 1, heal: 0 },
  specialist: { hp: 0.95, atk: 1.15, def: 0.8, res: 1, interval: 1.08, range: 15, block: 1, heal: 0 },
};

export const MOOD_LINES = [
  'PRTS：今日罗德岛也在正常运转。',
  'PRTS：检测到微量源石粉尘，请保持通风。',
  'PRTS：博士，记得查看基建产出。',
  'PRTS：自动作战协议已就绪。',
  'PRTS：干员信赖记录持续更新中。',
];
