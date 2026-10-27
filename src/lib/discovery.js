export function filterMovies(movies, search, genre = 'All films') {
  const query = search.trim().toLowerCase();
  return movies.filter((movie) => {
    const matchesGenre = genre === 'All films' || movie.genre.split(', ').includes(genre);
    const searchableText =
      `${movie.name} ${movie.cast} ${movie.genre} ${movie.releaseDate.slice(0, 4)}`.toLowerCase();
    return matchesGenre && searchableText.includes(query);
  });
}
