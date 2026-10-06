const { test } = require('node:test');
const assert = require('node:assert/strict');
const { discover } = require('../.npm-cache/unit/discovery.cjs');
const { decodeLibraryCache, mergeLibrary, nextDurableWrite, validRecord } = require('../.npm-cache/unit/library.cjs');
const movies = [
  { id: 1, name: 'Inception', genre: 'Sci-Fi, Thriller', cast: 'Leonardo DiCaprio', releaseDate: '2010-07-16' },
  { id: 2, name: 'Interstellar', genre: 'Sci-Fi, Drama', cast: 'Matthew McConaughey', releaseDate: '2014-11-07' },
  { id: 5, name: 'Titanic', genre: 'Romance, Drama', cast: 'Leonardo DiCaprio', releaseDate: '1997-12-19' },
];
test('cloud sync waits for the latest edit to be saved on device', () => {
  const pending = { '5': { favorite: true, status: 'watched', updatedAt: 10, revision: 2 } };
  assert.equal(nextDurableWrite(pending, { '5': 1 }), undefined);
  assert.equal(nextDurableWrite(pending, {}) , undefined);
  assert.deepEqual(nextDurableWrite(pending, { '5': 2 }), ['5', pending['5']]);
});
test('cast search is trimmed, case insensitive, and combined with decade and genre', () => {
  assert.deepEqual(discover(movies, { search: '  LEONARDO  ', decade: '1990s', genre: 'Drama' }).map((m) => m.id), [5]);
});
test('release year search and missing matches', () => {
  assert.deepEqual(discover(movies, { search: '2014' }).map((m) => m.id), [2]);
  assert.equal(discover(movies, { search: 'unknown cast' }).length, 0);
});
test('sorts without mutating curated order', () => {
  assert.deepEqual(discover(movies, { sort: 'newest' }).map((m) => m.id), [2, 1, 5]);
  assert.deepEqual(discover(movies, { sort: 'oldest' }).map((m) => m.id), [5, 1, 2]);
  assert.deepEqual(discover(movies, { sort: 'title' }).map((m) => m.id), [1, 2, 5]);
  assert.deepEqual(movies.map((m) => m.id), [1, 2, 5]);
});
test('new records take precedence over legacy favorites, including explicit removal', () => {
  const entries = mergeLibrary({ '1': { favorite: false, status: 'watched', updatedAt: 5 } }, ['1', '2', '99'], {});
  assert.equal(entries['1'].favorite, false);
  assert.equal(entries['1'].status, 'watched');
  assert.equal(entries['2'].favorite, true);
  assert.equal(entries['99'], undefined);
});
test('pending offline changes survive older cloud snapshots', () => {
  const pending = { '1': { favorite: true, status: 'watchlist', updatedAt: 20, revision: 2 } };
  const merged = mergeLibrary({ '1': { favorite: false, status: 'watched', updatedAt: 10 } }, [], pending);
  assert.equal(merged['1'].status, 'watchlist');
  assert.equal(merged['1'].favorite, true);
});
test('cache restoration keeps pending revisions and rejects invalid records', () => {
  const cache = decodeLibraryCache(JSON.stringify({ version: 1, records: { '1': { favorite: false, status: 'watched', updatedAt: 10 }, '99': { favorite: true, status: 'none', updatedAt: 0 }, '2': { favorite: 'yes', status: 'watchlist', updatedAt: 10 } }, pending: { '1': { favorite: true, status: 'watched', updatedAt: 11, revision: 4 }, '2': { favorite: false, status: 'none', updatedAt: 0, revision: 'bad' } } }));
  assert.equal(cache.pending['1'].revision, 4);
  assert.equal(cache.records['99'], undefined);
  assert.equal(cache.records['2'], undefined);
  assert.equal(cache.pending['2'], undefined);
});
test('damaged or unsupported cache cannot break app startup', () => {
  for (const raw of ['invalid json', 'null', '{"version":2}', null]) assert.deepEqual(decodeLibraryCache(raw), { records: {}, pending: {} });
  assert.equal(validRecord({ favorite: true, status: 'admin', updatedAt: 0 }), false);
});
