import { useLibrary } from '../contexts/library';

export function useFavorites() {
  const library = useLibrary();
  return { ids: Object.keys(library.entries).filter((id) => library.entries[id].favorite), loading: !library.ready, error: library.error, saving: false, toggle: library.toggleFavorite, retry: library.retry };
}
