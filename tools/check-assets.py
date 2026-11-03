import re, pathlib
root = pathlib.Path('build/app')
ops = (root / 'js' / 'operators.js').read_text(encoding='utf-8')
skins = (root / 'js' / 'skins.js').read_text(encoding='utf-8')
opids = re.findall(r'"img": "assets/operators/([^"]+)"', ops)
skids = re.findall(r'"img": "assets/skins/([^"]+)"', skins)
missing = [x for x in opids if not (root / 'assets' / 'operators' / x).exists()]
missing2 = [x for x in skids if not (root / 'assets' / 'skins' / x).exists()]
print('ops', len(opids), 'skins', len(skids), 'missing', len(missing), len(missing2))
print('total size MB', round(sum(p.stat().st_size for p in root.rglob('*') if p.is_file()) / 1048576, 2))
