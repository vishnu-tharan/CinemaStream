// Verified studio/distributor trailers. Other films provide an explicitly labelled search.
const trailers: Record<number, string> = {
  2: 'https://www.youtube.com/watch?v=2LqzF5WauAw',
  5: 'https://www.paramountplus.com/movies/trailer/video/qykIi_7XQHn5BoIk1oI78geaXmrT4LPz/',
  10: 'https://www.youtube.com/watch?v=2ax61PjJgjw',
  13: 'https://video.disney.com/watch/frozen-2-official-trailer-58b0e63cfe2f4ebd6b4f2a72',
  14: 'https://video.disney.com/watch/the-lion-king-official-trailer-5862bff2f8928ebd6b4f2a72',
};
export function trailerFor(movie: { id: number; name: string; releaseDate: string }) {
  const official = trailers[movie.id];
  return { official: !!official, url: official || 'https://www.youtube.com/results?search_query=' + encodeURIComponent(movie.name + ' ' + movie.releaseDate.slice(0, 4) + ' official trailer') };
}
