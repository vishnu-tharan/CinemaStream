import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterMovies } from '../src/lib/discovery.js';
import { validRecord, isMovieId, emptyRecord } from '../src/lib/library.js';

const movies = [
  {
    id: 1,
    name: 'Inception',
    genre: 'Sci-Fi, Thriller',
    cast: 'Leonardo DiCaprio',
    releaseDate: '2010-07-16',
  },
  {
    id: 2,
    name: 'Interstellar',
    genre: 'Sci-Fi, Drama',
    cast: 'Matthew McConaughey',
    releaseDate: '2014-11-07',
  },
  {
    id: 5,
    name: 'Titanic',
    genre: 'Romance, Drama',
    cast: 'Leonardo DiCaprio',
    releaseDate: '1997-12-19',
  },
];

test('search trims whitespace and ignores letter case', () => {
  assert.deepEqual(
    filterMovies(movies, '  INCEPTION  ').map((movie) => movie.id),
    [1],
  );
});
test('search matches cast, genre and year', () => {
  assert.deepEqual(
    filterMovies(movies, 'leonardo').map((movie) => movie.id),
    [1, 5],
  );
  assert.deepEqual(
    filterMovies(movies, 'sci-fi').map((movie) => movie.id),
    [1, 2],
  );
  assert.deepEqual(
    filterMovies(movies, '2014').map((movie) => movie.id),
    [2],
  );
});
test('search and genre filters work together without changing the catalog', () => {
  assert.deepEqual(
    filterMovies(movies, 'leonardo', 'Drama').map((movie) => movie.id),
    [5],
  );
  assert.deepEqual(filterMovies(movies, 'missing'), []);
  assert.deepEqual(filterMovies(movies, ''), movies);
  assert.deepEqual(
    movies.map((movie) => movie.id),
    [1, 2, 5],
  );
});
test('collection IDs accept only the current catalog', () => {
  for (let id = 1; id <= 20; id++) assert.equal(isMovieId(String(id)), true);
  for (const id of ['0', '21', '-1', '1.5', '01', 'text', '']) assert.equal(isMovieId(id), false);
});
test('collection records validate favorites, status and timestamps', () => {
  assert.equal(validRecord(emptyRecord()), true);
  assert.equal(validRecord({ favorite: true, status: 'watched', updatedAt: 10 }), true);
  assert.equal(validRecord({ favorite: 'yes', status: 'none', updatedAt: 0 }), false);
  assert.equal(validRecord({ favorite: false, status: 'unknown', updatedAt: 0 }), false);
  assert.equal(validRecord({ favorite: false, status: 'none', updatedAt: -1 }), false);
  assert.equal(validRecord({ favorite: false, status: 'none', updatedAt: NaN }), false);
  assert.equal(validRecord(null), false);
});
