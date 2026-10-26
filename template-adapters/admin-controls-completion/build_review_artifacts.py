"""Generate portable field append examples and measured new palette recipes."""
import json
import pathlib

import native_fields as controls

HERE = pathlib.Path(__file__).resolve().parent
folder = HERE / 'caption-adapters'
folder.mkdir(exist_ok=True)
for letter in 'ABCDEFGHI':
    (folder / f'{letter}-page-caption-append.css').write_text(controls.overlay_adapter(letter).lstrip(), encoding='utf-8')
reports = [
    controls.palette_report(dict(primary='#e06b4a', secondary='#c4553a', dark='#38264a', background='#fbefe2')),
    controls.palette_report(dict(primary='#0055a4', secondary='#f2c94c', dark='#101820', background='#f7fbff')),
]
(HERE / 'new-recipe-palette-checks.json').write_text(json.dumps({
    'status': 'local-math-only-native-palette-change-unverified',
    'recipes': 'Exact new sRGB native-controls-completion recipes; remaining original Oklab recipes need separate verification.',
    'reports': reports,
}, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'captionAppends': 9, 'newRecipePalettesPass': [r['pass'] for r in reports]}))
