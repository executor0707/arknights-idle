import { SPINE_OPERATORS, SPINE_ENEMIES } from './spine-index.js';

const ENEMY_KEY = {};
const cache = new Map();
const loading = new Set();
let app = null;
let arenaEl = null;
let width = 0, height = 0;
let sprites = new Map();
let mounted = false;

function s35() { return window.PIXI_SPINE35 || window.PIXI.spine; }
function ready() {
  return !!(window.PIXI && window.PIXI.spine && s35() && window.SkeletonBinary);
}

export function enemySpineKey(type) { return ENEMY_KEY[type] || null; }

export function initSpineArena(arena) {
  arenaEl = arena;
  if (!ready()) return;
  destroySpine();
  width = arena.clientWidth;
  height = arena.clientHeight;
  app = new PIXI.Application({ width, height, transparent: true, antialias: true, resolution: 1 });
  app.view.className = 'spine-canvas';
  app.view.style.width = '100%';
  app.view.style.height = '100%';
  arena.prepend(app.view);
  sprites = new Map();
  mounted = true;
  // 预载当前编队和本关常见敌人
  if (window.__RHODES__?.state) {
    const squad = window.__RHODES__.state.squad.filter(Boolean);
    for (const id of squad) loadOperator(id);
  }
}

export function destroySpine() {
  if (app) {
    try { app.destroy(true, { children: true, texture: false, baseTexture: false }); } catch (e) {}
  }
  app = null;
  sprites = new Map();
  mounted = false;
}

export function isOperatorSpineReady(id) {
  return !!cache.get('op:' + id)?.data;
}
export function isEnemySpineReady(type) {
  const key = enemySpineKey(type);
  return !!(key && cache.get('enemy:' + key)?.data);
}

async function loadAsset(kind, key) {
  if (!ready()) return null;
  const cacheKey = kind + ':' + key;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  if (loading.has(cacheKey)) return null;
  const entry = kind === 'op' ? SPINE_OPERATORS[key] : SPINE_ENEMIES[key];
  if (!entry?.base) { cache.set(cacheKey, null); return null; }
  loading.add(cacheKey);
  const base = entry.base;
  const loader = new PIXI.loaders.Loader();
  const p = new Promise((resolve) => {
    loader
      .add(cacheKey + '_atlas', base + '.atlas', { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.TEXT })
      .add(cacheKey + '_skel', base + '.skel', { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER })
      .add(cacheKey + '_tex', base + '.png')
      .load((l, res) => {
        try {
          const btex = PIXI.BaseTexture.fromImage(base + '.png');
          let data;
          if (kind === 'op') {
            const bin = new SkeletonBinary();
            bin.data = new Uint8Array(res[cacheKey + '_skel'].data);
            bin.initJson();
            const s = s35();
            const atlas = new s.core.TextureAtlas(res[cacheKey + '_atlas'].data, (line, cb) => cb(btex));
            data = new s.core.SkeletonJson(new s.core.AtlasAttachmentLoader(atlas)).readSkeletonData(bin.json);
          } else {
            const s = PIXI.spine;
            const atlas = new s.core.TextureAtlas(res[cacheKey + '_atlas'].data, (line, cb) => cb(btex));
            const bin = new s.core.SkeletonBinary(new s.core.AtlasAttachmentLoader(atlas));
            data = bin.readSkeletonData(new Uint8Array(res[cacheKey + '_skel'].data));
          }
          cache.set(cacheKey, { data });
          resolve({ data });
        } catch (e) {
          console.warn('Spine load failed', key, e);
          (window.__SPINE_LOG__ ||= []).push({ key, error: String(e) });
          cache.set(cacheKey, null);
          resolve(null);
        } finally {
          loading.delete(cacheKey);
        }
      });
  });
  return p;
}

export function loadOperator(id) {
  if (!SPINE_OPERATORS[id]) return;
  loadAsset('op', id);
}
export function loadEnemy(type) {
  const key = enemySpineKey(type);
  if (key) loadAsset('enemy', key);
}

function makeSprite(kind, key, unit) {
  const cacheKey = kind + ':' + key;
  const data = cache.get(cacheKey)?.data;
  if (!data) return null;
  const runtime = kind === 'op' ? s35() : PIXI.spine;
  const sp = new runtime.Spine(data);
  sp.autoUpdate = true;
  const anims = data.animations.map(a => a.name);
  sp._anims = anims;
  sp._kind = kind;
  sp._key = cacheKey;
  const target = kind === 'op' ? 66 : (unit?.boss ? 96 : 50);
  const scale = target / Math.max(1, data.height);
  sp._baseScale = scale;
  sp._dir = kind === 'enemy' ? -1 : 1;
  sp.scale.set(scale * sp._dir, scale);
  sp.state.setAnimation(0, anims.includes('Idle') ? 'Idle' : anims[0], true);
  sp._anim = 'Idle';
  sp._attackMark = -1;
  sp._castMark = -1;
  app.stage.addChild(sp);
  return sp;
}

function play(sp, name, loop = false) {
  if (!sp || sp._anim === name) return;
  if (!sp._anims.includes(name)) {
    if (!sp._anims.includes('Idle')) return;
    name = 'Idle'; loop = true;
  }
  sp.state.setAnimation(0, name, loop);
  sp._anim = name;
}

export function syncSpine(battle) {
  if (!mounted || !app || !arenaEl) return;
  const w = arenaEl.clientWidth, h = arenaEl.clientHeight;
  if (w !== width || h !== height) {
    width = w; height = h;
    app.renderer.resize(w, h);
  }
  const wanted = new Set();
  const all = [];
  for (const a of battle.allies) all.push({ unit: a, kind: 'op', key: a.id, uid: 'a:' + a.uid });
  for (const e of battle.enemies) {
    const key = enemySpineKey(e.type);
    if (key) all.push({ unit: e, kind: 'enemy', key, uid: 'e:' + e.uid });
  }
  for (const item of all) {
    wanted.add(item.uid);
    const data = cache.get(item.kind + ':' + item.key)?.data;
    if (!data) {
      if (item.kind === 'op') loadOperator(item.key); else loadEnemy(item.unit.type);
      continue;
    }
    let sp = sprites.get(item.uid);
    if (!sp) {
      sp = makeSprite(item.kind, item.key, item.unit);
      if (sp) sprites.set(item.uid, sp);
      if (!sp) continue;
    }
    const u = item.unit;
    const factor = item.kind === 'enemy' && u.boss ? 1.35 : 1;
    const s = sp._baseScale * factor;
    sp.scale.set(s * sp._dir, s);
    sp.x = (u.x / 100) * width;
    sp.y = (u.y / 100) * height + (item.kind === 'enemy' ? 10 : 18);
    sp.visible = !u.dead;
    if (u.dead) {
      play(sp, 'Die');
      continue;
    }
    if (u.castUntil > 0.05) {
      const name = sp._anims.includes('Skill') ? 'Skill' : 'Attack';
      if (sp._castMark !== u.sp) { play(sp, name); sp._castMark = u.sp; }
    } else if (u.attackFlash > 0.06) {
      if (!sp._attackActive) {
        play(sp, 'Attack');
        sp._attackActive = true;
      }
    } else {
      sp._attackActive = false;
      play(sp, 'Idle', true);
    }
  }
  for (const [uid, sp] of sprites) {
    if (!wanted.has(uid)) { sp.destroy(); sprites.delete(uid); }
  }
}

export function spineCanvasExists() { return !!app; }

if (typeof window !== 'undefined') {
  window.__SPINE_DEBUG__ = {
    cache, loading,
    keys: () => [...cache.keys()],
    log: () => window.__SPINE_LOG__ || [],
  };
}
