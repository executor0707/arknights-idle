import { SPINE_ENEMIES } from './spine-index.js';
import { SPINE38_OPERATORS, SPINE35_ONLY } from './spine38-index.js';
import { SKIN_SPINE } from './skin-spine-index.js';
import { SKIN_SPINE_REMOTE } from './skin-spine-remote.js';
import { state, skinScaleForOp } from './game.js';
const OPS_DATA = { ...SPINE38_OPERATORS, ...SKIN_SPINE_REMOTE, ...SKIN_SPINE };

const ENEMY_KEY = { soldier: 'soldier', shield: 'shield', caster: 'caster', drone: 'hound', boss: 'boss_skulsr' };
const cache = new Map();
const loading = new Set();
let app = null;
let frame = null;
let frameLoaded = false;
let arenaEl = null;
let width = 0, height = 0;
let sprites = new Map();
let mounted = false;
let lastPost = 0;

function s35() { return window.PIXI_SPINE35 || window.PIXI.spine; }
function ready() {
  return !!(window.PIXI && s35() && window.SkeletonBinary);
}

export function enemySpineKey(type, bossKey) {
  if (type === 'boss' && bossKey) return bossKey;
  return ENEMY_KEY[type] || null;
}

function postInit() {
  if (!frame || !frameLoaded || !frame.contentWindow) return;
  const f = frame.contentWindow.__frame;
  if (f?.setData) { f.setData(OPS_DATA, SPINE_ENEMIES); return; }
  frame.contentWindow.postMessage({
    type: 'init',
    ops: OPS_DATA,
    enemies: SPINE_ENEMIES,
  }, '*');
}

export function initSpineArena(arena) {
  arenaEl = arena;
  destroySpine();
  if (!ready()) return;
  width = arena.clientWidth;
  height = arena.clientHeight;
  app = new PIXI.Application({ width, height, transparent: true, antialias: true, resolution: 1 });
  app.view.className = 'spine-canvas';
  app.view.style.width = '100%';
  app.view.style.height = '100%';
  arena.prepend(app.view);

  frame = document.createElement('iframe');
  frame.className = 'spine38-frame';
  frame.src = 'spine38-frame.html';
  frame.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent;z-index:3;pointer-events:none;opacity:0;';
  frame.setAttribute('allowtransparency', 'true');
  frame.addEventListener('load', () => {
    frameLoaded = true;
    postInit();
    setTimeout(() => {
      try {
        const cv = frame.contentDocument?.querySelector('canvas');
        if (cv) {
          cv.className = 'spine38-canvas';
          cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none;background:transparent;';
          arena.appendChild(cv);
          frame.style.display = 'none';
        }
      } catch (e) {}
    }, 120);
  });
  arena.prepend(frame);

  sprites = new Map();
  mounted = true;
  if (window.__RHODES__?.state) {
    const squad = window.__RHODES__.state.squad.filter(Boolean);
    for (const id of squad) if (SPINE35_ONLY[id]) load35(id);
  }
}

export function destroySpine() {
  if (app) {
    try { app.destroy(true, { children: true, texture: false, baseTexture: false }); } catch (e) {}
  }
  if (frame) { try { frame.remove(); } catch (e) {} }
  arenaEl?.querySelector('.spine38-canvas')?.remove();
  app = null; frame = null; frameLoaded = false;
  sprites = new Map();
  mounted = false;
}

export function isOperatorSpineReady(id) {
  return !!SPINE38_OPERATORS[id] || !!cache.get('op:' + id)?.data;
}
export function isEnemySpineReady(type, bossKey) {
  const key = enemySpineKey(type, bossKey);
  return !!(key && SPINE_ENEMIES[key]);
}

async function load35(id) {
  if (!ready()) return null;
  const cacheKey = 'op:' + id;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  if (loading.has(cacheKey)) return null;
  const entry = SPINE35_ONLY[id];
  if (!entry?.base) return null;
  loading.add(cacheKey);
  const base = entry.base;
  const loader = new PIXI.loaders.Loader();
  return new Promise((resolve) => {
    loader
      .add(cacheKey + '_atlas', base + '.atlas', { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.TEXT })
      .add(cacheKey + '_skel', base + '.skel', { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER })
      .add(cacheKey + '_tex', base + '.png')
      .load((l, res) => {
        try {
          const bin = new SkeletonBinary();
          bin.data = new Uint8Array(res[cacheKey + '_skel'].data);
          bin.initJson();
          const s = s35();
          const btex = PIXI.BaseTexture.fromImage(base + '.png');
          const atlas = new s.core.TextureAtlas(res[cacheKey + '_atlas'].data, (line, cb) => cb(btex));
          const data = new s.core.SkeletonJson(new s.core.AtlasAttachmentLoader(atlas)).readSkeletonData(bin.json);
          cache.set(cacheKey, { data });
          resolve({ data });
        } catch (e) {
          console.warn('Spine 3.5 load failed', id, e);
          (window.__SPINE_LOG__ ||= []).push({ key: id, error: String(e) });
          cache.set(cacheKey, null);
          resolve(null);
        } finally {
          loading.delete(cacheKey);
        }
      });
  });
}

export function loadOperator(id) {
  if (SPINE35_ONLY[id]) load35(id);
}
export function loadEnemy() {}

function make35(unit) {
  const data = cache.get('op:' + unit.id)?.data;
  if (!data) return null;
  const s = s35();
  const sp = new s.Spine(data);
  sp.autoUpdate = true;
  sp._anims = data.animations.map(a => a.name);
  sp.state.setAnimation(0, sp._anims.includes('Idle') ? 'Idle' : sp._anims[0], true);
  sp.update(0);
  const lb = sp.getLocalBounds();
  const visibleH = lb && lb.height > 4 ? lb.height : data.height;
  const scale = 130 / Math.max(1, visibleH);
  sp._baseScale = scale;
  sp._dir = 1;
  sp.scale.set(scale, scale);
  sp._anim = 'Idle';
  sp._attackActive = false;
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
  const post = [];
  for (const a of battle.allies) {
    if (SPINE38_OPERATORS[a.id]) {
      const equipped = state.skins?.equipped?.[a.id];
      const skinKey = equipped ? `${a.id}-${equipped}` : null;
      const key = skinKey && OPS_DATA[skinKey] ? skinKey : a.id;
      post.push({ uid: 'a:' + a.uid, kind: 'op', key, x: a.x, y: a.y, scale: (state.settings?.characterScale || 1.2) * skinScaleForOp(a.id), bob: Math.sin(performance.now() / 170 + (a.bobPhase || 0)) * 1.6, bobX: Math.sin(performance.now() / 220 + (a.bobPhase || 0)) * 0.7, dead: a.dead, attackFlash: a.attackFlash, attackLock: a.attackLock || 0, castUntil: a.castUntil, sp: a.sp });
      continue;
    }
    if (!SPINE35_ONLY[a.id]) continue;
    wanted.add('a:' + a.uid);
    let sp = sprites.get('a:' + a.uid);
    if (!sp) {
      load35(a.id);
      sp = make35(a);
      if (sp) sprites.set('a:' + a.uid, sp);
      if (!sp) continue;
    }
    const s = sp._baseScale * (state.settings?.characterScale || 1.2);
    sp.scale.set(s, s);
    sp.x = Math.min(width - 26, Math.max(26, (a.x / 100) * width + Math.sin(performance.now() / 220 + (a.bobPhase || 0)) * 0.7));
    sp.y = (a.y / 100) * height + 18 + Math.sin(performance.now() / 170 + (a.bobPhase || 0)) * 1.6;
    sp.visible = !a.dead;
    if (a.dead) { play(sp, 'Die'); continue; }
    if (a.castUntil > 0.05) {
      const name = sp._anims.includes('Skill') ? 'Skill' : 'Attack';
      if (sp._castMark !== a.sp) { play(sp, name); sp._castMark = a.sp; }
    } else if (a.attackLock > 0.01 || a.attackFlash > 0.06) {
      if (!sp._attackActive) { play(sp, 'Attack'); sp._attackActive = true; }
    } else {
      sp._attackActive = false;
      play(sp, 'Idle', true);
    }
  }
  for (const e of battle.enemies) {
    const key = enemySpineKey(e.type, e.bossKey);
    if (!key || !SPINE_ENEMIES[key]) continue;
    post.push({ uid: 'e:' + e.uid, kind: 'enemy', key, x: e.x, y: e.y, scale: state.settings?.enemyScale || 1, dead: e.dead, attackFlash: e.attackFlash, castUntil: 0, sp: 0, boss: !!e.boss });
  }
  for (const [uid, sp] of sprites) {
    if (!wanted.has(uid)) { sp.destroy(); sprites.delete(uid); }
  }
  const now = performance.now();
  if (window.__SPINE_DEBUG__) window.__SPINE_DEBUG__.last = { post: post.length, frameLoaded, now, lastPost, mounted };
  if (frame && frameLoaded && now - lastPost > 33) {
    lastPost = now;
    const f = frame.contentWindow?.__frame;
    if (f?.setData) {
      if (!f.ops || Object.keys(f.ops).length === 0) f.setData(OPS_DATA, SPINE_ENEMIES);
      f.update(post, w, h);
    } else {
      frame.contentWindow?.postMessage({ type: 'units', units: post, w, h }, '*');
    }
  }
}

export function spineCanvasExists() { return !!app; }

if (typeof window !== 'undefined') {
  window.__SPINE_DEBUG__ = {
    cache, loading,
    keys: () => [...cache.keys()],
    log: () => window.__SPINE_LOG__ || [],
    frame: () => frame,
  };
}
