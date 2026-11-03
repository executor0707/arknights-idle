# BUILD_BRIEF — 罗德岛值守协议

## targetRuntime

Static web, GitHub Pages.

## buildPath

custom vanilla HTML/CSS/ES modules. No bundler, no runtime dependencies.

## Entry

`build/app/index.html`

## Run

```powershell
python -m http.server 8765 --directory build/app
```

## Version

- Chrome 156.0.8078.80 headless (tested)
- Node 22.20.0 (tooling only)

## Required experience facts

- 5-slot squad, with slot order defining the battle order.
- Auto-battle with a horizontal march, block, ranged, healing, auto skills, crit.
- Original gacha rates, three independent banners, 100 starting pulls, 300-pull any-6★ selector.
- 5 potential levels per operator; duplicates, promotion, skill mastery, module, trust.
- CE-6 / LS-6 / CA-5 technique summaries / uncapped endless floors / 37 annihilation maps + 307 main stages across chapters 0–17. Main and annihilation no longer drop materials.
- First clear gives Originite Prime.
- Idle income independent of win/loss: 10 pulls/h early to 30 pulls/h at chapter 15; 5→29 primes/day; base blocks for unlimited base levels.
- 531 skins at 18 primes.
- Wis'adel sabotage with LMD repair.
- Offline settlement capped at 8 h, localStorage save, export/import/reset.

## Verified

- Desktop 1440×1000 and mobile 390×844 render.
- Fresh boot, tutorial skip, active battle, victory, first-clear prime, auto loop restart.
- Ten-pull overlay, duplicate potential, 300-pull selector.
- Level up, base upgrade, skin purchase, save reload, offline settlement.
- No uncaught console errors in tested paths.

## Known limitations

- 469 operators from PRTS; alternate forms included, but not a guarantee of future roster additions.
- 307 main stages (0–17), 37 annihilation maps; story is represented by stage names/flavor, not cutscenes.
- No cloud save, account, or cross-device sync.
- Idle simulation is time-rate based while closed; active battle is a simplified five-person horizontal march, not exact Arknights combat.
- PRTS operator Spine is rendered with two isolated runtimes: 3.5.51 via legacy pixi-spine + SkeletonBinary, and 3.8 via an isolated iframe renderer. 469/469 operators are covered. Enemy Spine 3.8 is enabled for five normal classes and six boss classes with attack/idle animations.
- Most base levels are uncapped; the control center caps when crit reaches 100%. Chapter 17 is the current terminal challenge, with uncapped endless floors after it.
- All art is PRTS Wiki half-body art; no custom illustrations.
