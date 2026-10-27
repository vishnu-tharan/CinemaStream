// Studio/distributor YouTube uploads; provenance is in assets/data/media-sources.json.
export const trailers = {
  1: {
    url: 'https://www.youtube.com/watch?v=Qwe6qXFTdgc',
    publisher: 'Warner Bros. Entertainment',
    title: 'Inception | Digital Trailer | Warner Bros. Entertainment',
  },
  2: {
    url: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    publisher: 'Warner Bros. UK & Ireland',
    title: 'Interstellar - Trailer - Official Warner Bros. UK',
  },
  3: {
    url: 'https://www.youtube.com/watch?v=5PSNL1qE6VY',
    publisher: '20th Century Studios',
    title: 'Avatar | Official Trailer (HD) | 20th Century FOX',
  },
  4: {
    url: 'https://www.youtube.com/watch?v=_PZpmTj1Q8Q',
    publisher: 'Warner Bros. Rewind',
    title: 'The Dark Knight | Original Theatrical Trailer | Warner Bros. Rewind',
  },
  5: {
    url: 'https://www.youtube.com/watch?v=oHY7D7K58BM',
    publisher: 'Paramount Pictures',
    title: 'Titanic 25th Anniversary | Official Trailer | In Theatres February 10th',
  },
  6: {
    url: 'https://www.youtube.com/watch?v=D4eJx-0g3Do',
    publisher: 'Warner Bros. Rewind',
    title: 'The Matrix | Original Theatrical Trailer | World of Warner Bros.',
  },
  7: {
    url: 'https://www.youtube.com/watch?v=P5ieIbInFpg',
    publisher: 'Paramount Movies',
    title: 'GLADIATOR | Official Trailer | Paramount Movies',
  },
  8: {
    url: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
    publisher: 'Marvel Entertainment',
    title: "Marvel Studios' Avengers: Endgame - Official Trailer",
  },
  9: {
    url: 'https://www.youtube.com/watch?v=zAGVQLHvwOY',
    publisher: 'Warner Bros.',
    title: 'JOKER - Final Trailer - Now Playing In Theaters',
  },
  10: {
    url: 'https://www.youtube.com/watch?v=JfVOs4VSpmA',
    publisher: 'Sony Pictures Entertainment',
    title: 'SPIDER-MAN: NO WAY HOME - Official Trailer (HD)',
  },
  11: {
    url: 'https://www.youtube.com/watch?v=PLl99DlL6b4',
    publisher: 'Warner Bros. Entertainment',
    title: 'The Shawshank Redemption | Official Trailer | Warner Bros. Entertainment',
  },
  12: {
    url: 'https://www.youtube.com/watch?v=xjDjIWPwcPU',
    publisher: 'Marvel Entertainment',
    title: "Marvel Studios' Black Panther - Official Trailer",
  },
  13: {
    url: 'https://www.youtube.com/watch?v=Zi4LMpSDccc',
    publisher: 'Walt Disney Animation Studios',
    title: 'Frozen 2 Official Trailer',
  },
  14: {
    url: 'https://www.youtube.com/watch?v=7TavVZMewpY',
    publisher: 'Disney',
    title: 'The Lion King Official Trailer',
  },
  15: {
    url: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    publisher: 'Warner Bros.',
    title: 'Dune: Part Two | Official Trailer',
  },
  16: {
    url: 'https://www.youtube.com/watch?v=bK6ldnjE3Y0',
    publisher: 'Universal Pictures',
    title: 'Oppenheimer | Official Trailer',
  },
  17: {
    url: 'https://www.youtube.com/watch?v=pBk4NYhWNMM',
    publisher: 'Warner Bros.',
    title: 'Barbie | Main Trailer',
  },
  18: {
    url: 'https://www.youtube.com/watch?v=LEjhY15eCx0',
    publisher: 'Pixar',
    title: 'Inside Out 2 | Official Trailer',
  },
  19: {
    url: 'https://www.youtube.com/watch?v=8g18jFHCLXk',
    publisher: 'Warner Bros.',
    title: 'Dune | Official Main Trailer',
  },
  20: {
    url: 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
    publisher: 'Warner Bros.',
    title: 'THE BATMAN – Main Trailer',
  },
};
export function trailerFor(movie) {
  const trailer = trailers[movie.id];
  return {
    official: !!trailer,
    publisher: trailer?.publisher,
    title: trailer?.title,
    url:
      trailer?.url ||
      'https://www.youtube.com/results?search_query=' +
        encodeURIComponent(movie.name + ' ' + movie.releaseDate.slice(0, 4) + ' official trailer'),
  };
}
