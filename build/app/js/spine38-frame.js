(function () {
  var app = null, dataCache = new Map(), loading = new Set(), sprites = new Map();
  var ops = {}, enemies = {}, ready = false, lastUnits = [], lastW = 0, lastH = 0;

  function init() {
    app = new PIXI.Application({ width: Math.max(1, window.innerWidth), height: Math.max(1, window.innerHeight), transparent: true, antialias: true, resolution: 1 });
    app.view.style.width = '100%';
    app.view.style.height = '100%';
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
    app.view.style.background = 'transparent';
    if ('backgroundAlpha' in app.renderer) app.renderer.backgroundAlpha = 0;
    app.renderer.backgroundColor = 0x000000;
    document.body.appendChild(app.view);
    ready = true;
    window.__frame = {
      app, sprites, dataCache,
      get ops() { return ops; }, get enemies() { return enemies; },
      setData: function (o, e) { ops = o || {}; enemies = e || {}; },
      update: function (u, w, h) { update(u || [], w, h); },
      get info() { return { inner: [window.innerWidth, window.innerHeight], canvas: [app.view.width, app.view.height], children: app.stage.children.length, ops: Object.keys(ops).length }; }
    };
  }

  function load(kind, key, base, cb) {
    var ck = kind + ':' + key;
    if (dataCache.has(ck)) { cb(dataCache.get(ck)); return; }
    if (loading.has(ck)) return;
    loading.add(ck);
    window.__frameLoads = (window.__frameLoads || 0) + 1;
    Promise.all([
      fetch(base + '.atlas').then(function (r) { if (!r.ok) throw new Error('atlas ' + r.status); return r.text(); }),
      fetch(base + '.skel').then(function (r) { if (!r.ok) throw new Error('skel ' + r.status); return r.arrayBuffer(); }),
      new Promise(function (res, rej) { var img = new Image(); img.onload = function () { res(); }; img.onerror = function () { rej(new Error('png')); }; img.src = base + '.png'; })
    ]).then(function (vals) {
      try {
        var btex = PIXI.BaseTexture.fromImage(base + '.png');
        var atlas = new PIXI.spine.core.TextureAtlas(vals[0], function (line, cb2) { cb2(btex); });
        var bin = new PIXI.spine.core.SkeletonBinary(new PIXI.spine.core.AtlasAttachmentLoader(atlas));
        var data = bin.readSkeletonData(new Uint8Array(vals[1]));
        dataCache.set(ck, data);
        cb(data);
      } catch (e) {
        console.warn('38 fail', key, e);
        window.__frameErr = String(e && e.stack || e);
        dataCache.set(ck, null);
        cb(null);
      } finally { loading.delete(ck); }
    }).catch(function (e) {
      console.warn('38 fetch fail', key, e);
      window.__frameErr = String(e && e.stack || e);
      dataCache.set(ck, null);
      cb(null);
      loading.delete(ck);
    });
  }

  function sprite(kind, key, unit) {
    var ck = kind + ':' + key;
    var data = dataCache.get(ck);
    if (!data) return null;
    var sp = new PIXI.spine.Spine(data);
    sp.autoUpdate = true;
    sp._anims = data.animations.map(function (a) { return a.name; });
    sp.state.setAnimation(0, sp._anims.indexOf('Idle') >= 0 ? 'Idle' : sp._anims[0], true);
    sp.update(0);
    var lb = sp.getLocalBounds();
    var visibleH = lb && lb.height > 4 ? lb.height : data.height;
    var target = kind === 'op' ? 130 : (unit && unit.boss ? 160 : 92);
    var sc = target / Math.max(1, visibleH);
    sp._baseScale = sc;
    sp._dir = kind === 'enemy' ? -1 : 1;
    sp.scale.set(sc * sp._dir, sc);
    sp._anim = 'Idle';
    app.stage.addChild(sp);
    return sp;
  }

  function play(sp, name, loop) {
    if (!sp || sp._anim === name) return;
    if (sp._anims.indexOf(name) < 0) name = 'Idle', loop = true;
    sp.state.setAnimation(0, name, !!loop);
    sp._anim = name;
  }

  function update(units, w, h) {
    window.__frameLast = { units: (units || []).length, w: w, h: h, ready: ready };
    try {
    if (!ready) return;
    if (w && h && (w !== lastW || h !== lastH)) {
      lastW = w; lastH = h;
      app.renderer.resize(w, h);
    }
    var wanted = {};
    for (var i = 0; i < units.length; i++) {
      var u = units[i], ck = u.uid;
      wanted[ck] = true;
      var entry = u.kind === 'op' ? ops[u.key] : enemies[u.key];
      var base = entry && (entry.base || entry);
      window.__frameLast.sample = { u: u, base: base, opKeys: Object.keys(ops).slice(0, 3) };
      if (!base) continue;
      var data = dataCache.get(u.kind + ':' + u.key);
      if (!data) {
        load(u.kind, u.key, base, function (d) { if (d) window.__frameDirty = true; });
        continue;
      }
      var sp = sprites.get(ck);
      if (!sp) { sp = sprite(u.kind, u.key, u); if (sp) sprites.set(ck, sp); if (!sp) continue; }
      var factor = u.kind === 'enemy' && u.boss ? 1.35 : 1;
      var sc = sp._baseScale * factor * (u.scale || 1);
      sp.scale.set(sc * sp._dir, sc);
      sp.x = Math.min(w - 26, Math.max(26, (u.x / 100) * w + (u.bobX || 0)));
      sp.y = (u.y / 100) * h + 18 + (u.bob || 0);
      sp.visible = !u.dead;
      if (u.dead) { play(sp, 'Die'); continue; }
      if (u.castUntil > 0.05) {
        if (sp._castMark !== u.sp) { play(sp, sp._anims.indexOf('Skill') >= 0 ? 'Skill' : 'Attack'); sp._castMark = u.sp; }
      } else if (u.attackLock > 0.01 || u.attackFlash > 0.06) {
        if (!sp._attackActive) { play(sp, 'Attack'); sp._attackActive = true; }
      } else {
        sp._attackActive = false;
        play(sp, 'Idle', true);
      }
    }
    sprites.forEach(function (sp, uid) {
      if (!wanted[uid]) { sp.destroy(); sprites.delete(uid); }
    });
    } catch (e) { window.__frameErr = e && e.stack || String(e); console.error(e); }
  }

  window.addEventListener('message', function (ev) {
    var m = ev.data || {};
    if (m.type === 'init') {
      ops = m.ops || {};
      enemies = m.enemies || {};
      if (!ready) init();
    } else if (m.type === 'units') {
      lastUnits = m.units || [];
      if (ready) update(lastUnits, m.w, m.h);
    }
  });

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();
