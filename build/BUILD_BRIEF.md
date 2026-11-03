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

- 12-slot squad.
- Auto-battle with three lanes, block, ranged, healing, auto skills, crit.
- Original gacha rates, three independent banners, 100 starting pulls, 300-pull any-6★ selector.
- 5 potential levels per operator; duplicates, promotion, skill mastery, module, trust.
- CE-6 / LS-6 / AP-5 chip / PR-D chip pack / annihilation + 17 main stages.
- First clear gives Originite Prime.
- Idle income independent of win/loss: 10 pulls/h early to 30 pulls/h at 15-3; 5→29 primes/day; base blocks for unlimited base levels.
- 124 skins at 88 primes.
- Wis'adel sabotage with LMD repair.
- Offline settlement capped at 8 h, localStorage save, export/import/reset.

## Verified

- Desktop 1440×1000 and mobile 390×844 render.
- Fresh boot, tutorial skip, active battle, victory, first-clear prime, auto loop restart.
- Ten-pull overlay, duplicate potential, 300-pull selector.
- Level up, base upgrade, skin purchase, save reload, offline settlement.
- No uncaught console errors in tested paths.

## Known limitations

- 86 operators, not the full in-game roster.
- 17 main stages; story is represented by stage names/flavor, not cutscenes.
- No cloud save, account, or cross-device sync.
- Idle simulation is time-rate based while closed; active battle is a simplified three-lane model, not exact Arknights combat.
- Base levels are uncapped by design; fixed stage content can eventually be overpowered. 15-3 is the current terminal challenge.
- All art is PRTS Wiki half-body art; no custom illustrations.
