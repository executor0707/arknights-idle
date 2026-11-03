from pathlib import Path
p = Path('build/app/css/large.css')
t = p.read_text(encoding='utf-8')
repl = {
'.page-head h2 { font-size: 43px;': '.page-head h2 { font-size: 52px;',
'.panel-title { font-size: 18px;': '.panel-title { font-size: 21px;',
'.panel-meta { font-size: 12px;': '.panel-meta { font-size: 14px;',
'.kv { font-size: 15px;': '.kv { font-size: 17px;',
'.small { font-size: 13px;': '.small { font-size: 15px;',
'.btn { min-height: 50px; padding: 12px 22px; font-size: 16px;': '.btn { min-height: 54px; padding: 13px 24px; font-size: 19px;',
'.btn-small { min-height: 38px; padding: 7px 13px; font-size: 13px;': '.btn-small { min-height: 42px; padding: 8px 14px; font-size: 15px;',
'.stage-code { font-size: 15px;': '.stage-code { font-size: 17px;',
'.stage-name { font-size: 18px;': '.stage-name { font-size: 22px;',
'.stage-rec { font-size: 11px;': '.stage-rec { font-size: 13px;',
'.stage-card .stage-power { font-size: 11px;': '.stage-card .stage-power { font-size: 13px;',
'.stage-tab { padding: 11px 5px; font-size: 14px;': '.stage-tab { padding: 12px 5px; font-size: 16px;',
'.squad-slot .sq-name { font-size: 14px;': '.squad-slot .sq-name { font-size: 16px;',
'.squad-slot .sq-sub { font-size: 10px;': '.squad-slot .sq-sub { font-size: 12px;',
'.res-num { font-size: 18px;': '.res-num { font-size: 21px;',
'.nav-label { font-size: 15px;': '.nav-label { font-size: 17px;',
'.brand-title { font-size: 21px;': '.brand-title { font-size: 24px;',
'.page-head-stat b { font-size: 26px;': '.page-head-stat b { font-size: 30px;',
'.brief-desc { font-size: 15px;': '.brief-desc { font-size: 17px;',
'.mini-stat b { font-size: 21px;': '.mini-stat b { font-size: 24px;',
'.op-name { font-size: 17px;': '.op-name { font-size: 18px;',
'.gallery-info b { font-size: 15px;': '.gallery-info b { font-size: 17px;',
'.gallery-info span { font-size: 10px;': '.gallery-info span { font-size: 12px;',
}
for a,b in repl.items():
    if a not in t: print('MISS', a)
    t=t.replace(a,b)
p.write_text(t, encoding='utf-8', newline='\n')
print('updated', len(t))
