const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
function load(file) {
  const exports = {};
  const original = fs.readFileSync(path.join(root, file), 'utf8');
  const names = [...original.matchAll(/export (?:const|function) (\w+)/g)].map((match) => match[1]);
  const source =
    original.replace(/export /g, '') +
    '\n' +
    names.map((name) => 'exports.' + name + ' = ' + name + ';').join('\n');
  vm.runInNewContext(source, {
    exports,
    require: (asset) => path.resolve(root, path.dirname(file), asset),
  });
  return exports;
}
async function check() {
  const { movies } = load('assets/data/movies.js');
  const { trailers } = load('src/lib/trailers.js');
  const { isMovieId } = load('src/lib/library.js');
  const { movieThumbnails } = load('assets/data/thumbnails.js');
  const ids = new Set(),
    titles = new Set(),
    posters = new Map();
  const sources = JSON.parse(
    fs.readFileSync(path.join(root, 'assets/data/media-sources.json'), 'utf8'),
  );
  const rulePattern = fs
    .readFileSync(path.join(root, 'firestore.rules'), 'utf8')
    .match(/movieId\.matches\('([^']+)'\)/)?.[1];
  if (!rulePattern) throw new Error('Missing server catalog ID validation.');
  const serverIds = new RegExp(`^(?:${rulePattern})$`);
  for (const movie of movies) {
    if (
      !Number.isInteger(movie.runtimeMinutes) ||
      movie.runtimeMinutes < 1 ||
      !movie.director ||
      !movie.language ||
      !['PG', 'PG-13', 'R'].includes(movie.ageRating)
    )
      throw new Error(`Missing film details: ${movie.name}`);
    const title =
      movie.name
        .trim()
        .toLocaleLowerCase()
        .replace(/[^\p{L}\p{N}]/gu, '') + movie.releaseDate.slice(0, 4);
    if (ids.has(movie.id) || titles.has(title)) throw new Error(`Duplicate movie: ${movie.name}`);
    ids.add(movie.id);
    titles.add(title);
    if (!isMovieId(String(movie.id)) || !serverIds.test(String(movie.id)))
      throw new Error(`Collection rules reject movie ${movie.id}`);
    if (!movie.image || !movieThumbnails[movie.id])
      throw new Error(`Missing artwork: ${movie.name}`);
    const meta = await sharp(movie.image).metadata();
    if (
      meta.width < 780 ||
      meta.height < 1100 ||
      meta.height / meta.width < 1.4 ||
      meta.height / meta.width > 1.6
    )
      throw new Error(`Poster resolution/aspect ratio: ${movie.name}`);
    const pixels = await sharp(movie.image).resize(64, 96).removeAlpha().raw().toBuffer();
    const hash = crypto.createHash('sha256').update(pixels).digest('hex');
    if (posters.has(hash))
      throw new Error(`Duplicate poster: ${movie.name} and ${posters.get(hash)}`);
    posters.set(hash, movie.name);
    const trailer = trailers[movie.id];
    if (
      !trailer ||
      !/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/.test(trailer.url) ||
      !trailer.publisher ||
      !/trailer/i.test(trailer.title)
    )
      throw new Error(`Missing trailer: ${movie.name}`);
    const credit = sources.find((entry) => entry.movieId === movie.id);
    if (!credit || credit.trailer !== trailer.url || !credit.poster)
      throw new Error(`Missing media provenance: ${movie.name}`);
  }
  // Verify client and server reject every ID outside the actual catalog.
  for (let id = 0; id <= 100; id++) {
    if (isMovieId(String(id)) !== ids.has(id) || serverIds.test(String(id)) !== ids.has(id))
      throw new Error(`Catalog ID validation mismatch: ${id}`);
  }
  if (
    sources.length !== movies.length ||
    Object.keys(trailers).length !== movies.length ||
    Object.keys(movieThumbnails).length !== movies.length
  )
    throw new Error('Catalog media counts do not match.');
  console.log(
    `Catalog verified: ${movies.length} unique films, clear portrait posters, thumbnails, and YouTube trailers.`,
  );
}
check().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
