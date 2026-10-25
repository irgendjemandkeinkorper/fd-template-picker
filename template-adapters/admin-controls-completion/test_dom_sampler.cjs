const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const makeElement = (text, color) => ({
  tagName: 'P', className: 'demo-copy', textContent: text, innerText: text,
  parentElement: null,
  style: {color,backgroundColor:'rgb(251,239,226)',backgroundImage:'none',opacity:'1',fontSize:'14px',fontWeight:'400',fontFamily:'Arial',textShadow:'none',display:'block',visibility:'visible'},
  getAttribute: name => name === 'class' ? 'demo-copy' : null,
  getBoundingClientRect: () => ({x:0,y:0,right:180,bottom:30,width:180,height:30}),
  querySelectorAll: () => [], closest: () => null,
});
const good = makeElement('Readable native copy','rgb(56,38,74)');
const bad = makeElement('Low contrast brand copy','rgb(224,107,74)');
const emptySlot = makeElement('✕','rgba(0,0,0,0)');
emptySlot.tagName = 'SPAN';
emptySlot.closest = selector => selector === '.od-club__stamps' ? {} : null;
const page = makeElement('Page','rgb(56,38,74)');
page.tagName = 'MAIN';
page.className = 'q-page page-variant-a-circuit-5659';
page.querySelectorAll = selector => selector === '*' ? [good,bad,emptySlot] : [];
const palette = {'--q-primary':'#e06b4a','--q-secondary':'#c4553a','--q-dark':'#38264a','--q-background':'#fbefe2'};
const body = makeElement('','rgb(56,38,74)');
body.style.getPropertyValue = name => palette[name] || '';
const document = {
  URL:'https://example.test/variant-a-circuit/',title:'Sampler compatibility test',body,
  documentElement:{clientWidth:390,clientHeight:844,scrollWidth:390},
  querySelector: selector => selector.includes('.q-page') ? page : null,
  querySelectorAll: () => [],
};
const source = fs.readFileSync(path.join(__dirname,'dom-acceptance-sampler.js'),'utf8');
const result = vm.runInNewContext('(' + source + ')()', {
  document, getComputedStyle: element => element.style,
  parseFloat: undefined, parseInt: undefined, NodeFilter: undefined,
  Set: undefined, location: undefined, innerWidth: undefined, innerHeight: undefined,
});
assert.equal(result.summary.pass,1);
assert.equal(result.summary.fail,1);
assert.equal(result.samples.length,3);
assert.equal(result.summary['decorative-empty-loyalty-slot-excluded'],1);
assert.equal(result.samples[0].textSelection,'leaf-element');
assert.equal(result.samples[0].hovered,null);
assert.equal(result.viewport.width,390);
assert.equal(result.nativePalette.dark,'#38264a');
assert.ok(result.samples[0].ratio > 12);
assert.ok(result.samples[1].ratio < 3);
assert.equal(result.completeness.status,'incomplete-retry-after-native-content-load');
assert.equal(result.completeness.minimumTextSamples,30);
assert.ok(result.completeness.reasons.length >= 2);
process.stdout.write('DOM sampler compatibility checks passed.\n');
