// One-off maintenance script: add ?v=<token> to local css/js asset references
// in every HTML page, so browsers never serve a stale build again.
// Run:  node tools/add-asset-versions.js <token>

const fs = require('fs');
const path = require('path');

const token = process.argv[2] || String(Date.now());
const root = path.resolve(__dirname, '..');

function htmlFiles(dir, out) {
    out = out || [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === '.git' || entry.name === 'node_modules') continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) htmlFiles(full, out);
        else if (entry.name.endsWith('.html')) out.push(full);
    }
    return out;
}

// Match local asset refs only: skip absolute http(s) URLs and the mathyxo base.
// Also rewrites an existing ?v= token so re-releases always bust the cache.
const refRe = /(\b(?:src|href)=")((?:\.\.?\/)*)((?:js|css)\/[^"?]+\.(?:js|css))(\?v=[^"]*)?(")/g;

let touched = 0;
for (const file of htmlFiles(root)) {
    const original = fs.readFileSync(file, 'utf8');
    const updated = original.replace(refRe, (m, pre, prefix, asset, _old, post) => {
        return pre + (prefix || '') + asset + '?v=' + token + post;
    });
    if (updated !== original) {
        fs.writeFileSync(file, updated, 'utf8');
        touched++;
        console.log('versioned:', path.relative(root, file));
    }
}
console.log('\n' + touched + ' file(s) updated with token ' + token);
