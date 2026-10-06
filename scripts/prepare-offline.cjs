/* global __dirname */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../dist');
function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}
const urls = walk(root).filter((file) => /\.(html|js|css|webp|png|jpg|ttf|woff2?)$/.test(file) && !file.endsWith('sw.js'))
  .map((file) => '/' + path.relative(root, file).split(path.sep).map(encodeURIComponent).join('/')).sort();
const hash = crypto.createHash('sha256').update(JSON.stringify(urls)).digest('hex').slice(0, 12);
fs.writeFileSync(path.join(root, 'offline-manifest.json'), JSON.stringify(urls));
const worker = fs.readFileSync(path.resolve(__dirname, '../public/sw.js'), 'utf8').replace('__CACHE_NAME__', 'cinemastream-public-' + hash);
fs.writeFileSync(path.join(root, 'sw.js'), worker);
console.log('Offline catalog prepared (' + urls.length + ' public files).');
