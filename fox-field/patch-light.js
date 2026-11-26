// Lighten Resn bundles at build time (deployed copies only).
const fs = require('fs');
const REPLACEMENTS = [
  ["this.devicePixelRatio = 2.0;", "this.devicePixelRatio = 1.5;"],
  ["itterator >= 400", "itterator >= 90"],
  ["this.devicePixelRatio - 0.1 >= 0.8", "this.devicePixelRatio - 0.25 >= 0.8"],
  ["devicePixelRatio -= 0.1", "devicePixelRatio -= 0.25"],
  ["offsetWidth * window.devicePixelRatio", "offsetWidth * Math.min(window.devicePixelRatio, 1.5)"],
  ["offsetHeight * window.devicePixelRatio", "offsetHeight * Math.min(window.devicePixelRatio, 1.5)"],
  ["var scale = window.devicePixelRatio * AppModel.get('scaleRatio')",
   "var scale = Math.min(window.devicePixelRatio, 1.5) * AppModel.get('scaleRatio')"],
  ["onTick: function() {\n            this.draw();\n        }",
   "onTick: function() {\n            this._tk = (this._tk || 0) + 1;\n            if (this._tk % 2 === 0) { this.draw(); }\n        }"],
];
for (const path of process.argv.slice(2)) {
  let txt = fs.readFileSync(path, 'utf8');
  for (const [oldStr, newStr] of REPLACEMENTS) {
    const n = txt.split(oldStr).length - 1;
    if (n !== 1) console.log(`WARN ${path}: pattern found ${n}x (expected 1): ${oldStr.slice(0, 50)}`);
    txt = txt.split(oldStr).join(newStr);
  }
  fs.writeFileSync(path, txt);
  console.log(`patched ${path}`);
}
