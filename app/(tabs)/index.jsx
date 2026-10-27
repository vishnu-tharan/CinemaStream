import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { movies } from '../../assets/data/movies';
import { Brand, MovieTile } from '../../src/components/cinema-ui';
import { cinema as colors } from '../../src/constants/cinema';
import { useAuth } from '../../src/contexts/auth';
import { filterMovies } from '../../src/lib/discovery';
const genres = [
  'All films',
  ...Array.from(new Set(movies.flatMap((movie) => movie.genre.split(', ')))).sort(),
];
export default function DiscoverScreen() {
  const router = useRouter();
  const { guest } = useAuth();
  const { width } = useWindowDimensions();
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All films');
  const [contentWidth, setContentWidth] = useState(Math.max(0, width - 40));
  const columns = Math.max(2, Math.floor((contentWidth + 16) / 200));
  const cardWidth = Math.max(0, (contentWidth - (columns - 1) * 16) / columns);
  const results = filterMovies(movies, search, genre);
  const genreButtons = genres.map((item) => (
    <Pressable
      key={item}
      accessibilityRole="button"
      accessibilityState={{ selected: genre === item }}
      onPress={() => setGenre(item)}
      style={[styles.filter, genre === item && styles.selectedFilter]}
    >
      <Text style={{ color: genre === item ? colors.bg : colors.text, fontWeight: '600' }}>
        {item}
      </Text>
    </Pressable>
  ));
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        key={columns}
        data={results}
        numColumns={columns}
        keyExtractor={(movie) => String(movie.id)}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}>
            <Brand />
            <Text accessibilityRole="header" style={styles.heading}>
              Discover movies
            </Text>
            <Text style={styles.description}>Find a film and build your collection.</Text>
            {guest && (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/(auth)/login')}
                style={styles.guestLink}
              >
                <Text style={styles.link}>Browsing as a guest. Sign in to save movies.</Text>
              </Pressable>
            )}
            <View style={styles.search}>
              <Ionicons name="search-outline" size={20} color={colors.muted} />
              <TextInput
                accessibilityLabel="Search movies"
                placeholder="Search movies, cast or year"
                placeholderTextColor={colors.muted}
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
              {!!search && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  onPress={() => setSearch('')}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={22} color={colors.muted} />
                </Pressable>
              )}
            </View>
            {contentWidth >= 600 ? (
              <View style={[styles.filters, styles.wrappedFilters]}>{genreButtons}</View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filters}
              >
                {genreButtons}
              </ScrollView>
            )}
            <Text style={styles.resultCount}>{results.length} movies</Text>
          </View>
        }
        renderItem={({ item }) => <MovieTile movie={item} width={cardWidth} />}
        ListEmptyComponent={
          <Text style={styles.description}>
            No movies match your search. Try another title or genre.
          </Text>
        }
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { width: '100%', padding: 20, paddingBottom: 40 },
  row: { gap: 16 },
  heading: { fontSize: 28, fontWeight: '700', color: colors.text, marginTop: 28 },
  description: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 8 },
  guestLink: { paddingVertical: 14, minHeight: 44 },
  link: { color: colors.accent, lineHeight: 21 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingLeft: 14,
    marginTop: 20,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 16,
  },
  clearButton: { minWidth: 44, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  filters: { gap: 8, paddingVertical: 16 },
  wrappedFilters: { flexDirection: 'row', flexWrap: 'wrap' },
  filter: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
  },
  selectedFilter: { backgroundColor: colors.accent, borderColor: colors.accent },
  resultCount: { color: colors.muted, marginBottom: 16 },
});
