import { state, getOpStats, getSquadBuffs, getBaseBonuses, grantStageRewards, saveNow, bus, STAGE_BY_ID, STAGES, isStageUnlocked, ensureEndlessFloor } from './game.js';
import { OPERATORS } from './operators.js';

const MELEE = new Set(['vanguard', 'guard', 'defender', 'specialist']);
// Merc Storia-like single horizontal marching line. Positions are still
// percentages of the arena; the renderer turns them into a side-scroller.
const LANES = [64];
// Same road line; only the horizontal spacing is staggered front-to-back.
// Slot 1 is leftmost; slots 2-5 advance to the right.
const MARCH_SLOTS = [[28, 64], [35, 64], [42, 64], [49, 64], [56, 64]];
const BOSS_BY_CHAPTER = {
  0: 'boss_skulsr', 1: 'boss_skulsr', 2: 'boss_skulsr', 3: 'boss_skulsr',
  4: 'boss_frstar', 5: 'boss_faust', 6: 'boss_mephi', 7: 'boss_mephi',
  8: 'boss_skulsr', 9: 'boss_sfsui', 10: 'boss_sfsui', 11: 'boss_blksnk',
  12: 'boss_blksnk', 13: 'boss_sfsui', 14: 'boss_blksnk', 15: 'boss_sfsui',
  16: 'boss_blksnk', 17: 'boss_sfsui',
};
const ENEMY_INFO = {
  soldier: { glyph: '兵', hp: 1, atk: 1, speed: 1, block: true, size: 1 },
  shield: { glyph: '盾', hp: 1.7, atk: 0.9, speed: 0.72, block: true, size: 1.06 },
  caster: { glyph: '术', hp: 0.78, atk: 1.35, speed: 0.92, block: true, size: 0.96 },
  drone: { glyph: '翼', hp: 0.68, atk: 0.9, speed: 1.36, block: false, size: 0.9 },
  boss: { glyph: 'BOSS', hp: 4.2, atk: 1.35, speed: 0.55, block: true, size: 1.5 },
};
// Low recommended-power stages stay at the old baseline. Above 5,000 the
// enemy curve grows faster than the displayed rec, otherwise a squad can
// clear a 14k stage while barely losing health.
function enemyPressure(stage) {
  const rec = Number(stage?.rec) || 0;
  return 1 + Math.max(0, rec - 5000) / 10000 * 1.5;
}

const OP_MAP = new Map(OPERATORS.map(o => [o.id, o]));
let uidCounter = 0;
const uid = (p) => `${p}${++uidCounter}`;

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function rand(a, b) { return a + Math.random() * (b - a); }

export class Battle {
  constructor() {
    this.status = 'idle'; // idle | running | victory | defeat
    this.stage = null;
    this.allies = [];
    this.enemies = [];
    this.projectiles = [];
    this.floats = [];
    this.effects = [];
    this.spawnQueue = [];
    this.time = 0;
    this.baseHp = 12;
    this.maxBaseHp = 12;
    this.wave = 0;
    this.totalWaves = 3;
    this.endTimer = 0;
    this.paused = false;
    this.timeout = 150;
    this.cast = null;
    this.cutIn = null;
    this.waveFlash = 0;
    this.shake = 0;
    this.totalSpawned = 0;
    this.kills = 0;
    this.onFinish = null;
    this.stats = { damage: 0, healing: 0, leaks: 0 };
  }

  setCallback(fn) { this.onFinish = fn; }

  start(stageId = state.stage.selected) {
    const stage = STAGE_BY_ID.get(stageId);
    if (!stage || !isStageUnlocked(stage)) return false;
    const ids = state.squad.filter(Boolean);
    if (!ids.length) return false;
    this.stage = stage;
    this.runId = (this.runId || 0) + 1;
    state.stage.selected = stage.id;
    this.status = 'running';
    this.paused = false;
    this.time = 0;
    this.endTimer = 0;
    this.baseHp = 12;
    this.maxBaseHp = 12;
    this.wave = 0;
    this.totalWaves = stage.waves || 3;
    this.spawnQueue = [];
    this.enemies = [];
    this.allies = [];
    this.projectiles = [];
    this.floats = [];
    this.effects = [];
    this.bardPulseT = 1;
    this.cast = null;
    this.cutIn = null;
    this.nextStageId = null;
    this.kills = 0;
    this.totalSpawned = 0;
    this.stats = { damage: 0, healing: 0, leaks: 0 };
    this.leaks = 0;
    this.shake = 0;
    this.waveFlash = 1.6;
    this.buffs = getSquadBuffs(ids);
    this.baseBonuses = getBaseBonuses();

    // Squad slot order is the battle order: slot 1 is the front-most unit.
    const placed = ids.slice(0, 5);
    placed.forEach((id, i) => {
      const pos = MARCH_SLOTS[i];
      const op = this._makeAlly(id, pos[0], pos[1], 0);
      if (op) this.allies.push(op);
    });
    this._buildSpawnQueue();
    this.killLmdBudget = Math.max(0, Math.floor((stage.rewards?.lmd || 0) * 0.35));
    this.killLmdPaid = 0;
    this.killLmdPerKill = Math.max(1, Math.floor(this.killLmdBudget / Math.max(1, this.spawnQueue.length)));
    bus.dispatchEvent(new CustomEvent('battle-start', { detail: { stage } }));
    saveNow();
    return true;
  }

  _makeAlly(id, x, y, lane) {
    const st = getOpStats(id);
    if (!st) return null;
    const b = this.buffs;
    const bb = this.baseBonuses || { atk: 0, hp: 0, aspd: 0, heal: 0, crit: 0.05, critDmg: 1.5 };
    const hp = Math.round(st.hp * (1 + b.hp) * (1 + bb.hp));
    const skillSp = Math.max(10, Math.min(40, Number(OP_MAP.get(id)?.skill?.sp) || 30));
    return {
      uid: uid('a'), id, x, y, lane, role: st.role, bobPhase: Math.random() * Math.PI * 2,
      hp, maxHp: hp, shield: 0, atk: st.atk * (1 + b.atk) * (1 + bb.atk), def: st.def * (1 + b.def),
      res: st.res, interval: st.interval / (1 + bb.aspd), range: st.range, block: st.block,
      cooldown: rand(0.1, 0.6), sp: id === 'amiya' ? Math.min(5, skillSp) : 0, maxSp: skillSp,
      spRate: 1 + b.spRegen, dead: false, heal: st.heal, bard: !!st.bard, arts: st.arts,
      skillPower: st.skillPower, buffAtk: 0, buffUntil: 0, castUntil: 0, attackLock: 0,
      combo: 0, lastTarget: null, atkStacks: 0, mlynarTimer: 0, phantoms: [],
      hitFlash: 0, healFlash: 0,
    };
  }

  _bossKeyForStage() {
    const s = this.stage;
    if (s?.bossKey) return s.bossKey;
    if (s?.group === 'annihilation') return 'boss_blksnk';
    const ch = Number(s?.chapterKey ?? 0);
    return BOSS_BY_CHAPTER[ch] || 'boss_skulsr';
  }

  _buildSpawnQueue() {
    const stage = this.stage;
    const bossKey = this._bossKeyForStage();
    const waves = this.totalWaves;
    let at = 1.2;
    for (let w = 0; w < waves; w++) {
      const count = 3 + w + (waves <= 3 ? 1 : 0);
      for (let i = 0; i < count; i++) {
        const isBoss = w === waves - 1 && i === count - 1;
        let type = 'soldier';
        if (isBoss) type = 'boss';
        else if (w === 0) type = Math.random() < 0.2 ? 'shield' : 'soldier';
        else if (w === 1) type = Math.random() < 0.45 ? 'shield' : Math.random() < 0.3 ? 'caster' : 'soldier';
        else type = Math.random() < 0.3 ? 'drone' : Math.random() < 0.45 ? 'caster' : Math.random() < 0.4 ? 'shield' : 'soldier';
        this.spawnQueue.push({ at, wave: w + 1, type, lane: 0, boss: isBoss, bossKey: isBoss ? bossKey : null });
        at += isBoss ? 1.6 : rand(0.75, 1.22);
      }
      at += 2.2;
    }
  }

  _spawnEnemy(item) {
    const stage = this.stage;
    const info = ENEMY_INFO[item.type];
    const pressure = enemyPressure(stage);
    const baseHp = stage.rec * (0.205 + item.wave * 0.026) * pressure;
    let hp = baseHp * info.hp * rand(0.9, 1.1);
    let atk = stage.rec * 0.0105 * info.atk * pressure * rand(0.9, 1.1);
    let bossPower = 0;
    if (item.boss) {
      // A boss is a single unit at 1.75x the party's average member power.
      bossPower = (stage.rec / 5) * 1.75 * pressure;
      hp = bossPower * 2.4;
      atk = bossPower * 0.22;
    }
    const enemy = {
      uid: uid('e'), type: item.type, glyph: info.glyph, boss: item.boss, bossKey: item.bossKey || null, bossPower,
      x: 105 + rand(0, 6), y: LANES[item.lane] + rand(-1.4, 1.4), lane: item.lane,
      hp, maxHp: hp, atk,
      def: stage.rec * 0.0011 * pressure * (item.boss ? 1.8 : 1), res: 5 + item.wave * 2 + (item.type === 'caster' ? 15 : 0),
      speed: 6.2 * info.speed, blockable: info.block, size: info.size,
      blockedBy: null, attackCd: rand(0.5, 1.2), stun: 0, slow: 0, slowT: 0, burn: 0, burnDmg: 0,
      vuln: 0, vulnT: 0, hitFlash: 0, dead: false,
    };
    this.enemies.push(enemy);
    this.totalSpawned++;
  }

  tick(dtReal) {
    if (this.status === 'victory' || this.status === 'defeat') {
      this.endTimer -= dtReal;
      if (this.endTimer <= 0 && this.shouldAutoRestart && !this.paused) this.start(this.nextStageId || this.stage.id);
      return;
    }
    if (this.status !== 'running' || this.paused) return;
    const dt = Math.min(dtReal, 0.08) * (state.stage.speed || 1);
    this.time += dt;
    this.waveFlash = Math.max(0, this.waveFlash - dt);
    this.shake = Math.max(0, this.shake - dt);
    if (this.cast) { this.cast.life -= dt; if (this.cast.life <= 0) this.cast = null; }
    if (this.cutIn) { this.cutIn.life -= dt; if (this.cutIn.life <= 0) this.cutIn = null; }

    while (this.spawnQueue.length && this.spawnQueue[0].at <= this.time) {
      const item = this.spawnQueue.shift();
      if (item.wave !== this.wave) { this.wave = item.wave; this.waveFlash = 1.8; }
      this._spawnEnemy(item);
    }

    this._updateEnemies(dt);
    this._updateBardChorus(dt);
    this._assignBlocks();
    this._updateAllies(dt);
    this._updateProjectiles(dt);
    this._updateFloats(dt);
    this._updateEffects(dt);

    if (this.baseHp <= 0) { this._finish(false, '防线崩溃'); return; }
    if (!this.spawnQueue.length && !this.enemies.length && this.time > 1) { this._finish(true, '作战完成'); return; }
    if (this.time > this.timeout) { this._finish(false, '行动超时'); return; }
  }

  _updateBardChorus(dt) {
    const bards = this.allies.filter(a => a.bard && !a.dead);
    if (bards.length < 5) { this.bardPulseT = 1; return; }
    this.bardPulseT = (this.bardPulseT ?? 1) - dt;
    if (this.bardPulseT > 0) return;
    this.bardPulseT += 1;
    for (const e of this.enemies) {
      if (e.dead) continue;
      for (const a of bards) {
        if (e.dead) break;
        this._damageEnemy(e, a.atk * 0.8325, { arts: false, source: a });
      }
    }
    this._effect(50, 50, 'aoe', 0.45);
  }

  _updateEnemies(dt) {
    for (const e of this.enemies) {
      if (e.dead) continue;
      e.hitFlash = Math.max(0, e.hitFlash - dt);
      e.attackFlash = Math.max(0, (e.attackFlash || 0) - dt);
      if (e.burnT > 0) {
        e.burnT -= dt;
        e.hp -= e.burnDmg * dt;
        if (e.hp <= 0) { this._killEnemy(e); continue; }
      }
      if (e.stun > 0) { e.stun -= dt; continue; }
      if (e.vulnT > 0) e.vulnT -= dt; else e.vuln = 0;
      if (e.slowT > 0) { e.slowT -= dt; if (e.slowT <= 0) e.slow = 0; }
      const blocker = e.blockedBy ? this.allies.find(a => a.uid === e.blockedBy && !a.dead) : null;
      if (blocker) {
        e.attackCd -= dt;
        if (e.attackCd <= 0) {
          e.attackCd = e.boss ? 1.8 : 1.35;
          e.attackFlash = 0.18;
          this._damageAlly(blocker, Math.max(e.atk - blocker.def * 0.65, e.atk * 0.22), e);
        }
        continue;
      }
      const speed = e.speed * (1 - e.slow);
      e.x -= speed * dt;
      if (e.x <= 5.5) {
        const leakCost = e.boss ? 3 : 1;
        this.baseHp -= leakCost;
        this.leaks += leakCost;
        this.stats.leaks++;
        this.shake = 0.35;
        this._float(8, e.y, `漏怪 ${leakCost}`, 'danger');
        this._effect(6, e.y, 'breach', 0.6);
        bus.dispatchEvent(new CustomEvent('battle-sfx', { detail: { sound: 'breach' } }));
        e.dead = true;
        if (this.leaks >= 3) { this._finish(false, '漏怪 3 个，防线失守'); return; }
      }
    }
    this.enemies = this.enemies.filter(e => !e.dead);
  }

  _assignBlocks() {
    for (const a of this.allies) { a.blockCount = 0; a.blocked = []; }
    for (const e of this.enemies) {
      if (e.blockedBy) {
        const b = this.allies.find(a => a.uid === e.blockedBy && !a.dead);
        if (!b || !e.blockable || b.blockCount >= b.block) e.blockedBy = null;
        else { b.blockCount++; b.blocked.push(e); }
      }
    }
    const melee = this.allies.filter(a => !a.dead && a.block > 0 && a.range <= 40 && ['vanguard', 'guard', 'defender', 'specialist'].includes(a.role))
      .sort((a, b) => b.x - a.x);
    for (const a of melee) {
      if (a.blockCount >= a.block) continue;
      const candidates = this.enemies.filter(e => !e.dead && !e.blockedBy && e.blockable && e.lane === a.lane &&
        e.x <= a.x + 8.5 && e.x > a.x - 8);
      for (const e of candidates) {
        if (a.blockCount >= a.block) break;
        e.blockedBy = a.uid;
        a.blockCount++;
        a.blocked.push(e);
      }
    }
  }

  setDeployment(id, x, y) {
    const a = this.allies.find(u => u.id === id && !u.dead);
    if (!a) return false;
    const GRID_X = [15, 29, 43, 57, 71, 85];
    const GRID_Y = [21, 50, 79];
    const nx = clamp(Number(x) || a.x, 8, 92);
    const ny = clamp(Number(y) || a.y, 8, 92);
    const col = GRID_X.reduce((best, gx, i) => Math.abs(gx - nx) < Math.abs(GRID_X[best] - nx) ? i : best, 0);
    const lane = GRID_Y.reduce((best, gy, i) => Math.abs(gy - ny) < Math.abs(GRID_Y[best] - ny) ? i : best, 0);
    const tx = GRID_X[col], ty = GRID_Y[lane];
    const occupied = this.allies.find(u => u.id !== id && !u.dead && u.lane === lane && Math.abs(u.x - tx) < 3);
    if (!state.deploy) state.deploy = {};
    if (occupied) {
      const old = { x: a.x, y: a.y, lane: a.lane };
      a.x = occupied.x; a.y = occupied.y; a.lane = occupied.lane;
      occupied.x = old.x; occupied.y = old.y; occupied.lane = old.lane;
      state.deploy[id] = { x: a.x, y: a.y, lane: a.lane };
      state.deploy[occupied.id] = { x: occupied.x, y: occupied.y, lane: occupied.lane };
    } else {
      a.x = tx; a.y = ty; a.lane = lane;
      state.deploy[id] = { x: tx, y: ty, lane };
    }
    this._assignBlocks();
    saveNow();
    return true;
  }

  _updateAllies(dt) {
    for (const a of this.allies) {
      if (a.dead) continue;
      if (a.phantom) {
        a.phantomT -= dt;
        if (a.phantomT <= 0) { a.dead = true; continue; }
      }
      a.hitFlash = Math.max(0, a.hitFlash - dt);
      a.healFlash = Math.max(0, a.healFlash - dt);
      a.castUntil = Math.max(0, a.castUntil - dt);
      a.attackFlash = Math.max(0, (a.attackFlash || 0) - dt);
      a.attackLock = Math.max(0, (a.attackLock || 0) - dt);
      if (a.buffUntil > 0) { a.buffUntil -= dt; if (a.buffUntil <= 0) a.buffAtk = 0; }
      if (a.shieldT > 0) { a.shieldT -= dt; if (a.shieldT <= 0) a.shield = 0; }
      const regen = this.buffs.regen * a.maxHp * dt;
      if (regen > 0) a.hp = Math.min(a.maxHp, a.hp + regen);
      a.sp = Math.min(a.maxSp, a.sp + dt * a.spRate);
      a.cooldown -= dt * (a.id === 'specter_alter' && a.hp / a.maxHp < 0.5 ? 1.3 : 1);
      if (a.id === 'mlynar') {
        a.mlynarTimer += dt;
        if (a.mlynarTimer >= 15) { a.mlynarReady = true; a.mlynarTimer = 0; }
      }
      if (a.bard) {
        // Bards never attack. Their song heals every living ally for a small
        // portion of ATK, with unlimited range. No attackFlash/Lock is set so
        // the Spine stays on Idle instead of playing an attack clip.
        if (a.cooldown <= 0 && a.attackLock <= 0) {
          const amount = a.atk * 0.18 * (1 + (this.baseBonuses?.heal || 0));
          let healedAny = false;
          for (const al of this.allies) {
            if (!al.dead && al.hp < al.maxHp) {
              this._healAlly(al, amount, a);
              healedAny = true;
            }
          }
          if (healedAny) this._effect(a.x, a.y, 'heal', 0.55);
          a.sp = Math.min(a.maxSp, a.sp + 2.5);
          a.cooldown = a.interval * 1.35;
        }
      } else if (a.heal) {
        const target = this._lowestAlly(a);
        // Healing uses the same cadence as a normal attack. It is not gated
        // on the skill gauge; the skill is only an additional AoE heal.
        if (target && target.hp < target.maxHp && a.cooldown <= 0 && a.attackLock <= 0) {
          const amount = a.atk * (1 + this.buffs.heal) * (1 + (this.baseBonuses?.heal || 0));
          this._healAlly(target, amount, a);
          this._effect(target.x, target.y, 'heal', 0.55);
          a.sp = Math.min(a.maxSp, a.sp + 4);
          a.cooldown = a.interval;
          a.attackFlash = 0.18;
          a.attackLock = Math.max(a.attackLock || 0, 0.8);
        }
      } else {
        if (a.cooldown <= 0 && a.attackLock <= 0) {
          const target = this._targetFor(a);
          if (target) {
            this._attack(a, target);
            a.cooldown = a.interval;
            a.sp = Math.min(a.maxSp, a.sp + 2.2);
          }
        }
      }
      if (state.settings.autoSkill && a.sp >= a.maxSp) this._castSkill(a);
    }
    this.allies = this.allies.filter(a => a.phantom ? a.phantomT > 0 : true);
  }

  _targetFor(a) {
    if (MELEE.has(a.role) && a.range <= 40) {
      // Melee covers roughly two body-lengths in front and behind. It is not
      // limited to enemies actually assigned to this unit's block slots.
      return this.enemies.filter(e => !e.dead && e.lane === a.lane && Math.abs(e.x - a.x) <= a.range)
        .sort((x, y) => x.hp - y.hp)[0] || null;
    }
    return this.enemies.filter(e => !e.dead && Math.abs(e.x - a.x) <= a.range && (a.range > 40 || e.lane === a.lane))
      .sort((x, y) => x.hp - y.hp)[0] || null;
  }

  _lowestAlly(a) {
    // Medics have unlimited healing range in this mode: every living ally on
    // the battlefield is a valid target. Lowest HP percentage wins.
    return this.allies.filter(x => !x.dead)
      .sort((x, y) => (x.hp / x.maxHp) - (y.hp / y.maxHp))[0];
  }

  _attack(a, target) {
    let mult = 1;
    if (a.id === 'kirin_yato' && target.hp >= target.maxHp) mult *= 1.4;
    if (a.id === 'surtr' && target.hp / target.maxHp < 0.4) mult *= 1.3;
    if ((a.id === 'ash' || a.id === 'texas_alter') && target.stun > 0) mult *= a.id === 'ash' ? 1.3 : 1.35;
    if (a.id === 'jian' && a.lastTarget === target.uid) { a.combo = Math.min(5, a.combo + 1); }
    else if (a.id === 'jian') { a.combo = 0; }
    if (a.id === 'jian') mult *= 1 + a.combo * 0.06;
    a.lastTarget = target.uid;
    if (a.id === 'chongyue') { a.atkStacks = Math.min(8, (a.atkStacks || 0) + 1); mult *= 1 + a.atkStacks * 0.03; }
    if (a.id === 'nearl_alter' && a.hp / a.maxHp < 0.5) mult *= 1.25;
    if (a.id === 'mlynar' && a.mlynarReady) { mult *= 2.2; a.mlynarReady = false; }
    let damage = a.atk * (1 + a.buffAtk) * mult;
    if (a.id === 'wisadel' && Math.random() < 0.2) {
      damage += a.atk * 0.8;
      this._effect(target.x, target.y, 'blast', 0.35);
    }
    let crit = false;
    if (Math.random() < (this.baseBonuses?.crit || 0.05)) {
      crit = true;
      damage *= (this.baseBonuses?.critDmg || 1.5);
    }
    this._damageEnemy(target, damage, { arts: a.arts, source: a, crit });
    a.attackFlash = 0.18;
    a.attackLock = Math.max(a.attackLock || 0, 0.8);
    this._projectile(a, target);
    if (a.id === 'chen_alter' && Math.random() < 0.2) {
      for (const e of this.enemies) if (!e.dead && e !== target && Math.abs(e.x - target.x) < 10) this._damageEnemy(e, damage * 0.4, { arts: false, source: a });
    }
    if (a.id === 'rathalos_noir') { target.burnT = 3; target.burnDmg = a.atk * 0.18; }
    if (a.id === 'ela') { target.slow = 0.25; target.slowT = 1.1; }
  }

  _damageEnemy(e, amount, opts = {}) {
    if (!e || e.dead) return;
    let dmg = amount;
    if (opts.arts) {
      let pen = 0;
      if (opts.source?.id === 'logos') pen = 0.2;
      dmg *= 1 - Math.max(0, (e.res * (1 - pen))) / 100;
    } else {
      dmg = Math.max(amount - e.def * 0.62, amount * 0.12);
    }
    if (e.vulnT > 0) dmg *= 1 + e.vuln;
    dmg = Math.max(1, Math.round(dmg));
    e.hp -= dmg;
    e.hitFlash = 0.12;
    this.stats.damage += dmg;
    if (opts.crit) this._float(e.x, e.y - 4, '暴击 ' + dmg, 'crit');
    else if (Math.random() < 0.55) this._float(e.x, e.y - 2, String(dmg), opts.arts ? 'arts' : 'phys');
    if (e.hp <= 0) this._killEnemy(e);
  }

  _killEnemy(e) {
    if (e.dead) return;
    e.dead = true;
    this.kills++;
    this._effect(e.x, e.y, e.boss ? 'bossdown' : 'down', e.boss ? 1.2 : 0.45);
    const payable = Math.max(0, (this.killLmdBudget || 0) - (this.killLmdPaid || 0));
    const gain = Math.min(payable, (this.killLmdPerKill || 0) * (e.boss ? 6 : 1));
    if (gain > 0) {
      state.lmd += gain;
      this.killLmdPaid = (this.killLmdPaid || 0) + gain;
      bus.dispatchEvent(new CustomEvent('lmd-change', { detail: { amount: gain, total: state.lmd } }));
    }
    if (e.boss) this.shake = 0.5;
    for (const a of this.allies) if (!a.dead && a.id === 'kirin_yato') a.sp = Math.min(a.maxSp, a.sp + 20);
  }

  _damageAlly(a, amount, source) {
    if (a.dead) return;
    let dmg = Math.max(1, Math.round(amount));
    if (a.id === 'nian') dmg *= 0.85;
    if (a.shield > 0) {
      const absorbed = Math.min(a.shield, dmg);
      a.shield -= absorbed;
      dmg -= absorbed;
      if (source && a.reflect > 0) this._damageEnemy(source, absorbed * a.reflect, { arts: false, source: a });
    }
    if (dmg <= 0) return;
    a.hp -= dmg;
    a.hitFlash = 0.14;
    if (Math.random() < 0.3) this._float(a.x, a.y - 2, '-' + dmg, 'hurt');
    if (a.hp <= 0) {
      a.hp = 0;
      a.dead = true;
      for (const e of this.enemies) if (e.blockedBy === a.uid) e.blockedBy = null;
      this._effect(a.x, a.y, 'down', 0.35);
    }
  }

  _healAlly(a, amount, source) {
    if (a.dead) return;
    const real = Math.min(a.maxHp - a.hp, amount * (1 + this.buffs.heal));
    a.hp = Math.min(a.maxHp, a.hp + real);
    a.healFlash = 0.25;
    this.stats.healing += real;
    if (real > 1) this._float(a.x, a.y - 2, '+' + Math.round(real), 'heal');
    if (source && source.id === 'shu') {
      a.shield = Math.max(a.shield, a.maxHp * 0.08);
      a.shieldT = Math.max(a.shieldT || 0, 8);
    }
  }

  _castSkill(a) {
    const op = OP_MAP.get(a.id);
    if (!op) return;
    const skill = op.skill;
    const enemiesInRange = this.enemies.filter(e => !e.dead && (a.range > 40 ? Math.abs(e.x - a.x) <= Math.max(70, a.range * 1.5) : e.lane === a.lane && Math.abs(e.x - a.x) <= 38));
    if (!['heal', 'buff', 'shield', 'summon'].includes(skill.type) && !enemiesInRange.length) return;
    const power = a.skillPower * (a.id === 'dusk' ? 1.2 : 1);
    a.sp = 0;
    a.castUntil = 0.7;
    this.cast = { name: `${op.name} · ${skill.name}`, life: 1.35, color: a.arts ? '#67d9ff' : '#ffb544' };
    this.cutIn = { id: a.id, name: op.name, skill: skill.name, life: 1.15, key: `${a.id}-${this.time.toFixed(2)}` };
    // Bard paralysis is tied to skill release, not to the one-second chorus
    // damage tick. max() prevents several simultaneous bards from stacking
    // multiple 0.3s controls into a long chain.
    if (a.bard) {
      for (const e of this.enemies) if (!e.dead) e.stun = Math.max(e.stun || 0, 0.325);
      this._effect(a.x, a.y, 'stun', 0.45);
    }
    bus.dispatchEvent(new CustomEvent('battle-sfx', { detail: { sound: 'skill' } }));
    if (skill.type === 'aoe') {
      const targets = enemiesInRange.length ? enemiesInRange : this.enemies;
      for (const e of targets) this._damageEnemy(e, a.atk * skill.power * power, { arts: a.arts, source: a });
      this._effect(a.x + 8, a.y, 'aoe', 0.75);
      if (skill.dot) for (const e of targets) { e.burnT = Math.max(e.burnT || 0, skill.duration || 4); e.burnDmg = a.atk * skill.dot * power; }
    } else if (skill.type === 'nuke') {
      const t = this.enemies.filter(e => !e.dead).sort((x, y) => x.hp - y.hp)[0];
      if (t) this._damageEnemy(t, a.atk * skill.power * power, { arts: a.arts, source: a });
    } else if (skill.type === 'multi') {
      const hits = skill.hits || 4;
      for (let i = 0; i < hits; i++) {
        const pool = this.enemies.filter(e => !e.dead && Math.abs(e.x - a.x) <= Math.max(40, a.range));
        if (!pool.length) break;
        const t = pool[Math.floor(Math.random() * pool.length)];
        const last = i === hits - 1 && skill.final;
        this._damageEnemy(t, a.atk * (last ? skill.final : skill.power) * power, { arts: a.arts, source: a });
        this._projectile(a, t);
      }
    } else if (skill.type === 'heal') {
      for (const al of this.allies) if (!al.dead) {
        this._healAlly(al, a.atk * 0.42 * (skill.power || 1) * (1 + (this.baseBonuses?.heal || 0)), a);
        if (skill.shield) { al.shield = Math.max(al.shield, al.maxHp * skill.shield); al.shieldT = 8; }
      }
      this._effect(a.x, a.y, 'heal', 0.8);
    } else if (skill.type === 'buff') {
      for (const al of this.allies) if (!al.dead) {
        al.buffAtk = Math.max(al.buffAtk, skill.power || 0.25);
        al.buffUntil = skill.duration || 8;
        if (a.id === 'skadi_alter') al.hp = Math.min(al.maxHp, al.hp + al.maxHp * 0.15);
      }
      this._effect(a.x, a.y, 'buff', 0.8);
    } else if (skill.type === 'shield') {
      for (const al of this.allies) if (!al.dead) {
        al.shield = Math.max(al.shield, al.maxHp * (skill.power || 0.25));
        al.shieldT = 8;
        if (skill.reflect) al.reflect = skill.reflect;
      }
      this._effect(a.x, a.y, 'shield', 0.8);
    } else if (skill.type === 'control') {
      for (const e of enemiesInRange) {
        e.stun = Math.max(e.stun, skill.duration || 2);
        for (let i = 0; i < (skill.hits || 1); i++) this._damageEnemy(e, a.atk * (skill.power || 1) * power, { arts: a.arts, source: a });
      }
      this._effect(a.x + 10, a.y, 'stun', 0.8);
    } else if (skill.type === 'execute') {
      const targets = this.enemies.filter(e => !e.dead).sort((x, y) => (x.hp / x.maxHp) - (y.hp / y.maxHp)).slice(0, skill.targets || 1);
      for (const t of targets) {
        this._damageEnemy(t, a.atk * skill.power * power, { arts: a.arts, source: a });
        if (t.hp > 0 && t.hp / t.maxHp < 0.25 && a.id !== 'kirin_yato') this._killEnemy(t);
      }
      if (skill.heal) a.hp = Math.min(a.maxHp, a.hp + a.maxHp * skill.heal);
    } else if (skill.type === 'debuff') {
      for (const e of enemiesInRange) {
        this._damageEnemy(e, a.atk * (skill.power || 1.5) * power, { arts: a.arts, source: a });
        e.vuln = 0.2; e.vulnT = skill.duration || 6;
      }
    } else if (skill.type === 'summon') {
      const count = skill.count || 1;
      for (let i = 0; i < count; i++) {
        const hp = a.atk * (skill.power || 0.6) * (a.id === 'ling' ? 1.3 : 1);
        this.allies.push({
          uid: uid('p'), id: 'phantom', name: skill.summonName || '召唤物', summonName: skill.summonName || '召唤物',
          phantom: true, phantomT: skill.duration || 12, x: a.x + rand(-3, 3), y: a.y + rand(-5, 5),
          lane: a.lane, role: 'guard', hp: Math.max(120, hp), maxHp: Math.max(120, hp), shield: 0,
          atk: a.atk * (skill.power || 0.6) * (a.id === 'ling' ? 1.3 : 1), def: 20, res: 0,
          interval: 1.1, range: 14, block: 1, cooldown: 0.2, sp: 0, maxSp: 999, spRate: 0,
          dead: false, heal: false, arts: false, skillPower: 1, buffAtk: 0, buffUntil: 0, castUntil: 0,
          hitFlash: 0, healFlash: 0,
        });
      }
      this._effect(a.x, a.y, 'summon', 0.9);
    }
  }

  _projectile(a, target) {
    if (a.heal) return;
    const type = a.role === 'sniper' ? 'bullet' : a.role === 'caster' || a.role === 'supporter' ? 'arts' : 'slash';
    if (type === 'slash') {
      this._effect(target.x - 2, target.y, 'slash', 0.18);
      return;
    }
    this.projectiles.push({ id: uid('pr'), x: a.x + 2, y: a.y, tx: target.x, ty: target.y, life: 0.28, maxLife: 0.28, type });
  }

  _updateProjectiles(dt) {
    for (const p of this.projectiles) {
      p.life -= dt;
      const t = 1 - p.life / p.maxLife;
      p.cx = p.x + (p.tx - p.x) * t;
      p.cy = p.y + (p.ty - p.y) * t;
    }
    this.projectiles = this.projectiles.filter(p => p.life > 0);
  }

  _float(x, y, text, tone) {
    this.floats.push({ id: uid('f'), x, y, text, tone, life: 0.75, maxLife: 0.75 });
    if (this.floats.length > 60) this.floats.shift();
  }
  _effect(x, y, kind, life) {
    this.effects.push({ id: uid('fx'), x, y, kind, life, maxLife: life });
    if (this.effects.length > 40) this.effects.shift();
  }
  _updateFloats(dt) {
    for (const f of this.floats) { f.life -= dt; f.y -= dt * 4; }
    this.floats = this.floats.filter(f => f.life > 0);
  }
  _updateEffects(dt) {
    for (const e of this.effects) e.life -= dt;
    this.effects = this.effects.filter(e => e.life > 0);
  }

  _nextStageAfterWin() {
    if (this.stage.group === 'endless' && state.stage.endlessRetry) {
      const retry = STAGE_BY_ID.get(state.stage.endlessRetry);
      if (retry && retry.floor > 1 && this.stage.id === 'endless-' + (retry.floor - 1)) {
        return this.stage.id;
      }
    }
    if (this.stage.group === 'endless') {
      const nextFloor = (this.stage.floor || 1) + 1;
      ensureEndlessFloor(nextFloor);
      const next = STAGES.find(s => s.group === 'endless' && s.floor === nextFloor);
      if (next && isStageUnlocked(next)) return next.id;
      return this.stage.id;
    }
    if (this.stage.group === 'main') {
      const list = STAGES.filter(s => s.group === 'main');
      const i = list.findIndex(s => s.id === this.stage.id);
      const next = list[i + 1];
      if (next && isStageUnlocked(next)) return next.id;
    }
    return this.stage.id;
  }

  _finish(win, reason) {
    if (this.status === 'victory' || this.status === 'defeat') return;
    this.status = win ? 'victory' : 'defeat';
    this.reason = reason;
    this.endTimer = 4.2;
    this.shouldAutoRestart = !!state.stage.auto;
    state.stats.runs += win ? 0 : 1;
    if (!win) {
      if (this.stage.group === 'endless' && (this.stage.floor || 1) > 1) {
        const pending = state.stage.endlessRetry ? STAGE_BY_ID.get(state.stage.endlessRetry) : null;
        if (pending && pending.floor > this.stage.floor) {
          // Failing the fallback must not erase the higher-floor retry record.
          // Keep looping this fallback until the pending floor is cleared.
          this.nextStageId = this.stage.id;
        } else {
          const prev = ensureEndlessFloor(this.stage.floor - 1);
          state.stage.endlessRetry = this.stage.id;
          this.nextStageId = prev.id;
        }
      } else {
        this.nextStageId = this.stage.id;
      }
      this.lastReward = null;
      this.lastWin = false;
      state.stats.losses += 1;
      state.stats.battleSeconds += Math.round(this.time);
      bus.dispatchEvent(new CustomEvent('battle-end', { detail: { win, reason, stage: this.stage } }));
      bus.dispatchEvent(new CustomEvent('battle-sfx', { detail: { sound: 'defeat' } }));
      saveNow();
      this.onFinish?.({ win, reason, stage: this.stage, reward: null });
      return;
    }
    if ((this.stage.group === 'main' || this.stage.group === 'endless') && !state.stage.cleared.includes(this.stage.id)) state.stage.cleared.push(this.stage.id);
    if (this.stage.group === 'endless' && state.stage.endlessRetry === this.stage.id) state.stage.endlessRetry = null;
    this.nextStageId = this._nextStageAfterWin();
    state.stage.totalRuns = (state.stage.totalRuns || 0) + 1;
    const reward = grantStageRewards(this.stage, { lmdCredit: this.killLmdPaid || 0 });
    if (reward) reward.killLmd = this.killLmdPaid || 0;
    this.lastReward = reward;
    this.lastWin = true;
    bus.dispatchEvent(new CustomEvent('battle-end', { detail: { win: true, stage: this.stage, reward } }));
    bus.dispatchEvent(new CustomEvent('battle-sfx', { detail: { sound: 'victory' } }));
    saveNow();
    this.onFinish?.({ win: true, reason, stage: this.stage, reward });
  }

  exit() {
    this.status = 'idle';
    this.shouldAutoRestart = false;
    this.endTimer = 0;
    this.paused = false;
    this.nextStageId = null;
  }

  retreat() {
    if (this.status !== 'running') return;
    this.status = 'idle';
    this.enemies = [];
    this.projectiles = [];
    this.floats = [];
    this.effects = [];
    saveNow();
    bus.dispatchEvent(new CustomEvent('battle-end', { detail: { win: false, retreat: true, stage: this.stage } }));
  }

  restart() { return this.start(this.stage?.id || state.stage.selected); }

  setAuto(v) { state.stage.auto = v; saveNow(); }
  setSpeed(v) { state.stage.speed = v; saveNow(); }
  togglePause() { this.paused = !this.paused; }
}
