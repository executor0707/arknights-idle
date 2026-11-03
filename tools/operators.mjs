// 干员基础资料：稀有度、职业、子职业与挂机化技能。
// 数值层（等级/精英化/潜能）在 js/game.js 中按稀有度与职业推导。
const O = (id, name, rarity, cls, sub, skill, extra = {}) => ({
  id, name, rarity, cls, sub,
  skill: { name: skill, ...extra.skill },
  talent: extra.talent || null,
  quote: extra.quote || '',
  limited: !!extra.limited,
  collab: !!extra.collab,
});

export const OPERATORS = [
  // ── 6★ ─────────────────────────────────────────────────────────
  O('wisadel', '维什戴尔', 6, '狙击', '投掷手', '爆裂黎明', {
    limited: true, quote: '别紧张，我只是在测试承重结构。',
    skill: { type: 'aoe', power: 2.6, duration: 4, desc: '召唤死魂灵轰炸全场，对全体敌人造成 260% 攻击力的物理伤害，并留下 4 秒灼烧。' },
    talent: { name: '死魂灵的余息', desc: '攻击时有 20% 概率追加一次 80% 攻击力的死魂灵轰击；在编队中时，罗德岛设施爆炸概率提升。' },
  }),
  O('exusiai', '能天使', 6, '狙击', '速射手', '过载模式', {
    quote: '义人，今天也要准时下班哦。',
    skill: { type: 'multi', power: 0.9, hits: 6, desc: '进入过载模式，连续射击 6 次，每次造成 90% 攻击力的物理伤害。' },
    talent: { name: '天使的祝福', desc: '全队狙击干员攻击力 +12%，自身攻击速度 +15%。' },
  }),
  O('silverash', '银灰', 6, '近卫', '领主', '真银斩', {
    quote: '喀兰贸易，从不做亏本的买卖。',
    skill: { type: 'aoe', power: 3.0, duration: 3, desc: '挥出真银斩，对前方大范围敌人造成 300% 物理伤害，并使其防御力 -20%，持续 3 秒。' },
    talent: { name: '领袖', desc: '全队攻击力 +10%；喀兰贸易阵营干员额外获得 +5%。' },
  }),
  O('eyjafjalla', '艾雅法拉', 6, '术师', '核心术师', '火山', {
    quote: '前辈，火山的声音……你听见了吗？',
    skill: { type: 'aoe', power: 2.8, duration: 3, desc: '引发火山喷发，对全体敌人造成 280% 法术伤害，并降低 15 点法术抗性，持续 3 秒。' },
    talent: { name: '炎息', desc: '造成的法术伤害 +15%，攻击附带持续灼烧。' },
  }),
  O('surtr', '史尔特尔', 6, '近卫', '术战者', '黄昏', {
    quote: '这把剑，会烧尽一切。',
    skill: { type: 'execute', power: 6.0, desc: '对生命最低的敌人造成 600% 法术伤害；若目标生命低于 25%，则直接处决。' },
    talent: { name: '熔火', desc: '对生命低于 40% 的敌人造成的伤害 +30%。' },
  }),
  O('skadi_alter', '浊心斯卡蒂', 6, '辅助', '吟游者', '同葬无光之愿', {
    limited: true, quote: '博士，海在唱歌。',
    skill: { type: 'buff', power: 0.45, duration: 10, desc: '奏响深海之歌，全队攻击力 +45%、攻击速度 +20%，持续 10 秒，并回复全队 15% 生命。' },
    talent: { name: '深海的回声', desc: '全队生命上限 +12%，每秒回复 0.5% 生命。' },
  }),
  O('texas_alter', '缄默德克萨斯', 6, '特种', '处决者', '剑雨', {
    limited: true, quote: '……别问。剑会回答。',
    skill: { type: 'control', power: 2.2, duration: 3, desc: '降下剑雨，对范围内敌人造成 220% 伤害并眩晕 3 秒，自身获得 30% 闪避。' },
    talent: { name: '清算', desc: '对眩晕目标造成的伤害 +35%。' },
  }),
  O('logos', '逻各斯', 6, '术师', '核心术师', '延异视阈', {
    quote: '语言是牢笼，也是武器。',
    skill: { type: 'debuff', power: 2.4, duration: 8, desc: '展开延异视阈，对全体敌人造成 240% 法术伤害，并使其受到的伤害 +20%，持续 8 秒。' },
    talent: { name: '语言终局', desc: '无视 20% 法术抗性；敌人被击败时，为全队回复 1 点技力。' },
  }),
  O('mlynar', '玛恩纳', 6, '近卫', '解放者', '未照耀的荣光', {
    quote: '我只是一名普通的游侠。',
    skill: { type: 'aoe', power: 4.2, duration: 2, desc: '蓄力斩出未照耀的荣光，对全体敌人造成 420% 物理伤害。' },
    talent: { name: '游侠', desc: '每 15 秒获得一次强化斩击，额外造成 150% 攻击力伤害。' },
  }),
  O('jian', '锏', 6, '近卫', '剑豪', '归于宁静', {
    quote: '胜负已分。',
    skill: { type: 'multi', power: 0.75, hits: 8, final: 2.0, desc: '连续斩击 8 次，每次造成 75% 攻击力伤害，最后一击造成 200% 伤害。' },
    talent: { name: '剑心', desc: '连续攻击同一目标时，每次伤害提升 6%，最多叠加 5 层。' },
  }),
  O('shu', '黍', 6, '重装', '守护者', '离离枯荣', {
    quote: '土地不会骗人。',
    skill: { type: 'heal', power: 1.2, shield: 0.3, desc: '为全队回复 25% 生命，并赋予相当于自身生命上限 30% 的护盾，持续 8 秒。' },
    talent: { name: '丰饶', desc: '治疗量 +20%；受到治疗的队友获得 10% 伤害减免。' },
  }),
  O('nearl_alter', '耀骑士临光', 6, '近卫', '无畏者', '耀阳颔首', {
    limited: true, quote: '以耀骑士之名。',
    skill: { type: 'execute', power: 3.2, heal: 0.3, desc: '对前方敌人造成 320% 真实伤害，并为自身回复 30% 生命。' },
    talent: { name: '骑士精神', desc: '生命低于 50% 时攻击力 +25%；每次击败敌人回复 8% 生命。' },
  }),
  O('chen_alter', '假日威龙陈', 6, '狙击', '散射手', '假日风暴', {
    limited: true, quote: '休假？不，这是战术调整。',
    skill: { type: 'multi', power: 0.8, hits: 6, desc: '掀起假日风暴，对全体敌人进行 6 段散射，每段造成 80% 物理伤害。' },
    talent: { name: '假日', desc: '攻击有 20% 概率追加一次水花伤害，并使目标减速。' },
  }),
  O('specter_alter', '归溟幽灵鲨', 6, '特种', '傀儡师', '纠缠', {
    limited: true, quote: '深海不欢迎你。',
    skill: { type: 'aoe', power: 2.6, lowHpBonus: 1.0, desc: '对周围敌人造成 260% 法术伤害；自身生命越低，伤害越高，最多提升 100%。' },
    talent: { name: '深海猎手', desc: '生命越低攻击速度越快，最多 +30%。' },
  }),
  O('ling', '令', 6, '辅助', '召唤师', '宁作吾', {
    limited: true, quote: '一壶酒，一局棋。',
    skill: { type: 'summon', power: 0.7, count: 2, duration: 15, desc: '召唤 2 个逍遥影卫协同作战，持续 15 秒，影卫继承 70% 攻击力。' },
    talent: { name: '逍遥', desc: '召唤物属性 +30%，召唤物存在时自身技力恢复 +20%。' },
  }),
  O('dusk', '夕', 6, '术师', '扩散术师', '写意胜形', {
    limited: true, quote: '墨色深处，自有天地。',
    skill: { type: 'aoe', power: 3.0, dot: 0.4, duration: 6, desc: '对全体敌人造成 300% 法术伤害，并留下墨水领域，每秒造成 40% 法术伤害，持续 6 秒。' },
    talent: { name: '笔墨', desc: '技能造成的伤害 +20%；击败敌人时留下墨痕。' },
  }),
  O('nian', '年', 6, '重装', '铁卫', '铜印', {
    limited: true, quote: '别碰那个机关，会炸。',
    skill: { type: 'shield', power: 0.5, duration: 3, reflect: 0.5, desc: '为全队提供 3 秒护盾，并反弹 50% 受到的伤害。' },
    talent: { name: '铜墙', desc: '全队防御力 +15%；自身受到的法术伤害 -15%。' },
  }),
  O('chongyue', '重岳', 6, '近卫', '斗士', '我无', {
    limited: true, quote: '拳脚无眼，点到为止。',
    skill: { type: 'multi', power: 0.5, hits: 10, final: 1.5, desc: '连续出拳 10 次，每次造成 50% 攻击力伤害，最后一击造成 150% 伤害并击退。' },
    talent: { name: '武', desc: '每次攻击叠加 3% 攻击力，最多 8 层；技能期间翻倍。' },
  }),
  O('ash', '灰烬', 6, '狙击', '速射手', '突击战术', {
    collab: true, quote: 'Breach and clear.',
    skill: { type: 'control', power: 1.2, hits: 5, duration: 2, desc: '投掷闪光弹眩晕全体敌人 2 秒，随后扫射 5 次，每次造成 120% 物理伤害。' },
    talent: { name: '爆破专精', desc: '对眩晕目标造成的伤害 +30%；攻击被眩晕目标时回复 1 点技力。' },
  }),
  O('ela', '艾拉', 6, '特种', '陷阱师', '雷鸣地雷', {
    collab: true, quote: '雷区已布置完毕。',
    skill: { type: 'aoe', power: 3.5, duration: 3, desc: '引爆雷鸣地雷，对范围内敌人造成 350% 伤害并减速 3 秒。' },
    talent: { name: '雷区', desc: '攻击附带减速；敌人进入雷区时受到额外 10% 伤害。' },
  }),
  O('rathalos_noir', '火龙S黑角', 6, '近卫', '领主', '火龙强击', {
    collab: true, quote: '这把大剑，是火龙给的。',
    skill: { type: 'aoe', power: 2.8, duration: 4, desc: '挥出火龙强击，对全体敌人造成 280% 物理伤害并灼烧 4 秒。' },
    talent: { name: '火龙', desc: '攻击附带灼烧；对灼烧目标造成的伤害 +20%。' },
  }),
  O('kirin_yato', '麒麟R夜刀', 6, '特种', '处决者', '居合', {
    collab: true, quote: '麒麟之力，一瞬之间。',
    skill: { type: 'execute', power: 4.0, targets: 3, desc: '瞬间斩击生命最低的 3 名敌人，造成 400% 真实伤害。' },
    talent: { name: '居合', desc: '对满血目标造成的伤害 +40%；击败目标后立即回复 20 点技力。' },
  }),

  // ── 5★ ─────────────────────────────────────────────────────────
  O('amiya', '阿米娅', 5, '术师', '核心术师', '精神爆发', {
    quote: '博士，我们一起走下去。',
    skill: { type: 'aoe', power: 2.2, duration: 3, desc: '释放精神爆发，对全体敌人造成 220% 法术伤害，并眩晕 1.5 秒。' },
    talent: { name: '罗德岛的意志', desc: '全队攻击力 +5%；自身技能技力消耗 -10%。' },
  }),
  O('lappland', '拉普兰德', 5, '近卫', '领主', '狼魂', { skill: { type: 'debuff', power: 2.0, duration: 6 } }),
  O('bluepoison', '蓝毒', 5, '狙击', '速射手', '毒液散射', { skill: { type: 'multi', power: 0.7, hits: 4 } }),
  O('platinum', '白金', 5, '狙击', '速射手', '天马视域', { skill: { type: 'nuke', power: 3.0 } }),
  O('meteorite', '陨星', 5, '狙击', '炮手', '高爆弹头', { skill: { type: 'aoe', power: 2.1 } }),
  O('nearl', '临光', 5, '重装', '守护者', '急救', { skill: { type: 'heal', power: 1.8 } }),
  O('croissant', '可颂', 5, '重装', '铁卫', '磁暴锤', { skill: { type: 'control', power: 1.6, duration: 2 } }),
  O('liskarm', '雷蛇', 5, '重装', '哨戒铁卫', '反击电弧', { skill: { type: 'aoe', power: 1.8 } }),
  O('silence', '赫默', 5, '医疗', '医师', '医疗无人机', { skill: { type: 'heal', power: 1.9 } }),
  O('warfarin', '华法琳', 5, '医疗', '医师', '不稳定血浆', { skill: { type: 'buff', power: 0.35, duration: 8 } }),
  O('ptilopsis', '白面鸮', 5, '医疗', '群愈师', '脑啡肽', { skill: { type: 'heal', power: 1.7 } }),
  O('specter', '幽灵鲨', 5, '近卫', '强攻手', '肉斩骨断', { skill: { type: 'nuke', power: 3.0 } }),
  O('cliffheart', '崖心', 5, '特种', '钩索师', '束缚链', { skill: { type: 'control', power: 1.5, duration: 2.5 } }),
  O('pramanix', '初雪', 5, '辅助', '削弱者', '自然震慑', { skill: { type: 'debuff', power: 1.6, duration: 6 } }),
  O('swire', '诗怀雅', 5, '近卫', '教官', '冲锋号令', { skill: { type: 'buff', power: 0.3, duration: 8 } }),
  O('texas', '德克萨斯', 5, '先锋', '尖兵', '剑雨', { skill: { type: 'control', power: 1.8, duration: 2 } }),
  O('zima', '凛冬', 5, '先锋', '尖兵', '乌萨斯战吼', { skill: { type: 'buff', power: 0.28, duration: 8 } }),
  O('projektred', '红', 5, '特种', '处决者', '处决模式', { skill: { type: 'execute', power: 3.2 } }),
  O('waai_fu', '槐琥', 5, '特种', '处决者', '寸劲', { skill: { type: 'execute', power: 3.0 } }),
  O('executor', '送葬人', 5, '狙击', '散射手', '最终旅程', { skill: { type: 'aoe', power: 2.4 } }),
  O('provence', '普罗旺斯', 5, '狙击', '重射手', '杀戮嗅觉', { skill: { type: 'nuke', power: 3.4 } }),
  O('nightmare', '夜魔', 5, '术师', '秘术师', '夜魇', { skill: { type: 'debuff', power: 2.0, duration: 6 } }),
  O('skyfire', '天火', 5, '术师', '扩散术师', '天坠之火', { skill: { type: 'aoe', power: 2.3 } }),

  // ── 4★ ─────────────────────────────────────────────────────────
  O('cuora', '蛇屠箱', 4, '重装', '铁卫', '壳状防御', { skill: { type: 'shield', power: 0.35, duration: 6 } }),
  O('gummy', '古米', 4, '重装', '守护者', '平底锅', { skill: { type: 'heal', power: 1.5 } }),
  O('matterhorn', '角峰', 4, '重装', '铁卫', '抗寒屏障', { skill: { type: 'shield', power: 0.3, duration: 6 } }),
  O('courier', '讯使', 4, '先锋', '尖兵', '冲锋', { skill: { type: 'buff', power: 0.22, duration: 8 } }),
  O('scavenger', '清道夫', 4, '先锋', '尖兵', '扫荡', { skill: { type: 'aoe', power: 1.7 } }),
  O('shirayuki', '白雪', 4, '狙击', '炮手', '霰射', { skill: { type: 'aoe', power: 1.9 } }),
  O('meteor', '流星', 4, '狙击', '速射手', '碎甲击', { skill: { type: 'debuff', power: 1.7, duration: 5 } }),
  O('jessica', '杰西卡', 4, '狙击', '速射手', '强力击', { skill: { type: 'nuke', power: 2.6 } }),
  O('gitano', '远山', 4, '术师', '扩散术师', '命运', { skill: { type: 'aoe', power: 2.0 } }),
  O('haze', '夜烟', 4, '术师', '核心术师', '赤色之瞳', { skill: { type: 'nuke', power: 2.8 } }),
  O('susurro', '苏苏洛', 4, '医疗', '医师', '深度治疗', { skill: { type: 'heal', power: 2.2 } }),
  O('gavial', '嘉维尔', 4, '医疗', '医师', '活力再生', { skill: { type: 'heal', power: 1.8 } }),
  O('myrrh', '末药', 4, '医疗', '医师', '再生', { skill: { type: 'heal', power: 1.6 } }),
  O('perfumer', '调香师', 4, '医疗', '群愈师', '精调', { skill: { type: 'heal', power: 1.7 } }),
  O('gravel', '砾', 4, '特种', '处决者', '影袭', { skill: { type: 'shield', power: 0.3, duration: 6 } }),
  O('shaw', '阿消', 4, '特种', '推击手', '消防水炮', { skill: { type: 'control', power: 1.4, duration: 2 } }),
  O('rope', '暗索', 4, '特种', '钩索师', '勾爪', { skill: { type: 'control', power: 1.4, duration: 2 } }),
  O('mousse', '慕斯', 4, '近卫', '术战者', '抓挠', { skill: { type: 'nuke', power: 2.4 } }),
  O('beehunter', '猎蜂', 4, '近卫', '斗士', '蜂群', { skill: { type: 'multi', power: 0.65, hits: 5 } }),
  O('earthspirit', '地灵', 4, '辅助', '减速者', '引力', { skill: { type: 'control', power: 1.3, duration: 2 } }),
  O('deepcolor', '深海色', 4, '辅助', '召唤师', '绘梦', { skill: { type: 'summon', power: 0.5, count: 1, duration: 12 } }),

  // ── 3★ ─────────────────────────────────────────────────────────
  O('fang', '芬', 3, '先锋', '尖兵', '冲锋号令', { skill: { type: 'buff', power: 0.18, duration: 8 } }),
  O('vanilla', '香草', 3, '先锋', '尖兵', '冲锋', { skill: { type: 'buff', power: 0.18, duration: 8 } }),
  O('melantha', '玫兰莎', 3, '近卫', '无畏者', '攻击力强化', { skill: { type: 'buff', power: 0.18, duration: 8 } }),
  O('cardigan', '卡缇', 3, '重装', '铁卫', '生命回复', { skill: { type: 'heal', power: 1.3 } }),
  O('beagle', '米格鲁', 3, '重装', '铁卫', '防御强化', { skill: { type: 'shield', power: 0.22, duration: 6 } }),
  O('kroos', '克洛丝', 3, '狙击', '速射手', '二连射', { skill: { type: 'multi', power: 0.8, hits: 2 } }),
  O('adnachiel', '安德切尔', 3, '狙击', '速射手', '精准射击', { skill: { type: 'nuke', power: 2.2 } }),
  O('lava', '炎熔', 3, '术师', '扩散术师', '攻击强化', { skill: { type: 'buff', power: 0.18, duration: 8 } }),
  O('steward', '史都华德', 3, '术师', '核心术师', '法术强化', { skill: { type: 'nuke', power: 2.3 } }),
  O('ansel', '安赛尔', 3, '医疗', '医师', '治疗强化', { skill: { type: 'heal', power: 1.4 } }),
  O('hibiscus', '芙蓉', 3, '医疗', '医师', '治疗强化', { skill: { type: 'heal', power: 1.4 } }),
  O('spot', '斑点', 3, '重装', '守护者', '防御强化', { skill: { type: 'shield', power: 0.22, duration: 6 } }),
  O('popukar', '泡普卡', 3, '近卫', '强攻手', '攻击强化', { skill: { type: 'buff', power: 0.18, duration: 8 } }),
  O('midnight', '月见夜', 3, '近卫', '领主', '攻击强化', { skill: { type: 'buff', power: 0.18, duration: 8 } }),
  O('catapult', '空爆', 3, '狙击', '炮手', '炮击', { skill: { type: 'aoe', power: 1.8 } }),

  // ── 2★ ─────────────────────────────────────────────────────────
  O('yato', '夜刀', 2, '特种', '处决者', '快速部署', { skill: { type: 'execute', power: 2.5 } }),
  O('noir_corne', '黑角', 2, '重装', '铁卫', '防御强化', { skill: { type: 'shield', power: 0.2, duration: 6 } }),
  O('rangers', '巡林者', 2, '狙击', '速射手', '射击强化', { skill: { type: 'nuke', power: 2.0 } }),
  O('durin', '杜林', 2, '术师', '扩散术师', '法术强化', { skill: { type: 'nuke', power: 2.0 } }),
  O('12f', '12F', 2, '术师', '扩散术师', '闪避', { skill: { type: 'shield', power: 0.15, duration: 6 } }),
];

export const STARTERS = ['amiya', 'fang', 'kroos', 'melantha', 'beagle', 'ansel', 'hibiscus', 'popukar'];
export const LIMITED_IDS = OPERATORS.filter(o => o.limited || o.collab).map(o => o.id);
