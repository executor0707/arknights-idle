from pathlib import Path
p = Path('build/app/js/ui.js')
t = p.read_text(encoding='utf-8')
start = t.index('    <div class="archive-grid">')
end = t.index('  </section>', start)
block = t[start:end]
t = t[:start] + t[end:]
insert = t.index('    <div class="archive-hero">')
t = t[:insert] + block + t[insert:]
t = t.replace("pageHead('PERSONNEL // ARCHIVE', '博士档案'", "pageHead('RHODES ISLAND // SETTINGS', '设置'")
t = t.replace('>档案管理<', '>存档管理<')
p.write_text(t, encoding='utf-8', newline='\n')
print('moved settings first')
