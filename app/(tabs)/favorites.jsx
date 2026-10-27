import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { movies } from '../../assets/data/movies';
import { Action, MovieTile } from '../../src/components/cinema-ui';
import { GuestPrompt } from '../../src/components/guest-prompt';
import { cinema as colors } from '../../src/constants/cinema';
import { useAuth } from '../../src/contexts/auth';
import { useLibrary } from '../../src/contexts/library';
const filters = [
  { value: 'all', label: 'All saved' },
  { value: 'favorite', label: 'Favorites' },
  { value: 'watchlist', label: 'Watchlist' },
  { value: 'watched', label: 'Watched' },
];
export default function CollectionScreen() {
  const router = useRouter();
  const { guest } = useAuth();
  const library = useLibrary();
  const [filter, setFilter] = useState('all');
  const { width } = useWindowDimensions();
  const [contentWidth, setContentWidth] = useState(Math.max(0, width - 40));
  const columns = Math.max(2, Math.floor((contentWidth + 16) / 200));
  const cardWidth = Math.max(0, (contentWidth - (columns - 1) * 16) / columns);
  const savedMovies = movies.filter((movie) => {
    const record = library.entries[String(movie.id)];
    if (!record) return false;
    if (filter === 'all') return record.favorite || record.status !== 'none';
    if (filter === 'favorite') return record.favorite;
    return record.status === filter;
  });
  if (guest) return <GuestPrompt collection />;
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        key={columns}
        data={savedMovies}
        numColumns={columns}
        keyExtractor={(movie) => String(movie.id)}
        contentContainerStyle={styles.content}
        columnWrapperStyle={{ gap: 16 }}
        ListHeaderComponent={
          <View onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}>
            <Text accessibilityRole="header" style={styles.heading}>
              My collection
            </Text>
            <Text style={styles.description}>Your favorites and movies to watch.</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={width >= 600}
              contentContainerStyle={styles.filters}
            >
              {filters.map((item) => (
                <Pressable
                  key={item.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: filter === item.value }}
                  onPress={() => setFilter(item.value)}
                  style={[styles.filter, filter === item.value && styles.selected]}
                >
                  <Text style={{ color: filter === item.value ? colors.bg : colors.text }}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            {!!library.error && (
              <View style={styles.message}>
                <Text accessibilityRole="alert" style={styles.error}>
                  {library.error}
                </Text>
                <Action label="Retry" onPress={library.retry} secondary />
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => <MovieTile movie={item} width={cardWidth} />}
        ListEmptyComponent={
          !library.ready || library.error ? (
            <Text style={styles.description}>
              {library.error
                ? 'Your collection could not be loaded.'
                : 'Loading your collection...'}
            </Text>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="bookmark-outline" size={40} color={colors.accent} />
              <Text style={styles.emptyTitle}>No movies here yet</Text>
              <Text style={styles.emptyDescription}>
                Open a movie and save it to your favorites or watchlist.
              </Text>
              <Action label="Browse movies" onPress={() => router.replace('/(tabs)')} />
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { width: '100%', padding: 20, paddingBottom: 40 },
  heading: { color: colors.text, fontSize: 28, fontWeight: '700', marginTop: 10 },
  description: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 10 },
  emptyState: { maxWidth: 400, alignSelf: 'center', width: '100%', paddingVertical: 40, gap: 18 },
  emptyTitle: { color: colors.text, fontSize: 22, fontWeight: '600' },
  emptyDescription: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  filters: { gap: 8, paddingVertical: 20 },
  filter: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
  },
  selected: { backgroundColor: colors.accent, borderColor: colors.accent },
  message: { gap: 12, marginBottom: 20 },
  error: { color: colors.danger, lineHeight: 22 },
});
