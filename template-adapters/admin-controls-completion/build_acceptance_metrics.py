"""Independent expected pair metrics. Does not touch frozen native proposals."""
import json
import pathlib

import native_fields as controls

HERE = pathlib.Path(__file__).resolve().parent
palettes = {
    'approved-current': dict(primary='#e06b4a',secondary='#c4553a',dark='#38264a',background='#fbefe2'),
    'shared-theme-independent-sample': dict(primary='#1765a8',secondary='#e0a800',dark='#151f2e',background='#f7fafc'),
    'root-native-test-candidate': dict(primary='#176B9D',secondary='#F2CA52',dark='#122C43',background='#F7FAFC'),
}


def oklab(rgb):
    r, g, b = (v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in rgb)
    l = (.4122214708*r + .5363325363*g + .0514459929*b) ** (1/3)
    m = (.2119034982*r + .6806995451*g + .1073969566*b) ** (1/3)
    s = (.0883024619*r + .2817188376*g + .6299787005*b) ** (1/3)
    return (.2104542553*l+.793617785*m-.0040720468*s, 1.9779984951*l-2.428592205*m+.4505937099*s, .0259040371*l+.7827717662*m-.808675766*s)


def from_oklab(lab):
    L, a, b = lab
    l, m, s = ((L+.3963377774*a+.2158037573*b)**3, (L-.1055613458*a-.0638541728*b)**3, (L-.0894841775*a-1.291485548*b)**3)
    channels = (4.0767416621*l-3.3077115913*m+.2309699292*s, -1.2684380046*l+2.6097574011*m-.3413193965*s, -.0041960863*l-.7034186147*m+1.707614701*s)
    return tuple(max(0,min(1,12.92*v if v <= .0031308 else 1.055*v**(1/2.4)-.055)) for v in channels)


reports = []
for name, palette in palettes.items():
    report = controls.palette_report(palette)
    report['name'] = name
    dark, paper = controls.rgb(palette['dark']), controls.rgb(palette['background'])
    report['otherMeasuredRecipes'] = [
        {'pair':'Storybook Dark copy at78% opacity / Background','ratio':round(controls.contrast(controls.mix(dark,.78,paper),paper),2)},
        {'pair':'Ma Dark copy at68% opacity / Background','ratio':round(controls.contrast(controls.mix(dark,.68,paper),paper),2)},
        {'pair':'Shared footer Background80% / Dark','ratio':round(controls.contrast(controls.mix(paper,.80,dark),dark),2)},
        {'pair':'Original solid Primary / Background (excluded for normal copy)','ratio':round(controls.contrast(controls.rgb(palette['primary']),paper),2)},
        {'pair':'Original solid Secondary / Dark (excluded for normal copy)','ratio':round(controls.contrast(controls.rgb(palette['secondary']),dark),2)},
    ]
    scrap = from_oklab(controls.mix(oklab(controls.rgb(palette['secondary'])), .60, oklab(paper)))
    report['oddActualScrapRecipes'] = {
        'recipe': 'Native D --v-scrap: Secondary60% + Background40%, mixed in Oklab',
        'computedApproxHex': '#' + ''.join(f'{round(v*255):02X}' for v in scrap),
        'DarkCopyRatio': round(controls.contrast(dark,scrap),2),
        'Dark85PercentMutedCopyRatio': round(controls.contrast(controls.mix(dark,.85,paper),scrap),2),
    }
    reports.append(report)
(HERE / 'acceptance-palette-metrics.json').write_text(json.dumps({'schema':'fd-independent-acceptance-palette-metrics/v1','status':'local-arithmetic-only-no-native-save-or-palette-change-inferred','measurements':reports,'interpretation':'Compare actual computed sRGB/Oklab values and measured backgrounds in browser. Native UI evidence governs installation and second-palette status. Translucent image treatments and group opacity require manual verification.'},indent=2)+'\n',encoding='utf-8')
print(json.dumps([{'name':r['name'],'newRecipePass':r['pass'],'otherRecipes':r['otherMeasuredRecipes']} for r in reports],indent=2))
