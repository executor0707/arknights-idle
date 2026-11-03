from pathlib import Path
p = Path('build/app/js/skins.js')
t = p.read_text(encoding='utf-8')
needle = '"img": "assets/operators/char_1001_amiya2.webp"'
parts = t.split(needle)
out = parts[0]
for i, part in enumerate(parts[1:]):
    out += '"img": "assets/skins/char_1001_amiya2-skin1.webp"' if i % 2 == 0 else '"img": "assets/skins/char_1001_amiya2-skin2.webp"'
    out += part
p.write_text(out, encoding='utf-8', newline='\n')
print('replaced', len(parts) - 1)
