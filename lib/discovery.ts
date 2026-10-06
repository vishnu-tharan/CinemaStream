export type DiscoverableMovie = { id: number; name: string; genre: string; cast: string; releaseDate: string };
export type SortOrder = 'curated' | 'newest' | 'oldest' | 'title';
export function discover<T extends DiscoverableMovie>(movies: T[], { search = '', genre = 'All films', decade = 'All years', sort = 'curated' }: { search?: string; genre?: string; decade?: string; sort?: SortOrder }): T[] {
  const query = search.trim().toLocaleLowerCase();
  const result = movies.filter((movie) => {
    const year = Number(movie.releaseDate.slice(0, 4));
    return (genre === 'All films' || movie.genre.split(', ').includes(genre))
      && (decade === 'All years' || Math.floor(year / 10) * 10 === Number(decade.slice(0, 4)))
      && (!query || [movie.name, movie.genre, movie.cast, String(year)].some((field) => field.toLocaleLowerCase().includes(query)));
  });
  if (sort === 'newest') result.sort((a, b) => b.releaseDate.localeCompare(a.releaseDate) || a.id - b.id);
  if (sort === 'oldest') result.sort((a, b) => a.releaseDate.localeCompare(b.releaseDate) || a.id - b.id);
  if (sort === 'title') result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}
