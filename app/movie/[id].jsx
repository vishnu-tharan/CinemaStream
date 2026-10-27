import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { movies } from '../../assets/data/movies';
import { Action } from '../../src/components/cinema-ui';
import { Poster } from '../../src/components/poster';
import { cinema as colors } from '../../src/constants/cinema';
import { useAuth } from '../../src/contexts/auth';
import { useLibrary } from '../../src/contexts/library';
import { trailerFor } from '../../src/lib/trailers';
export function generateStaticParams() {
  return movies.map((movie) => ({ id: String(movie.id) }));
}
export default function MovieDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 800;
  const { guest } = useAuth();
  const library = useLibrary();
  const [trailerError, setTrailerError] = useState('');
  const movie = movies.find((item) => String(item.id) === id);
  const record = library.entries[id];
  const disabled = !library.ready || library.saving;
  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  }
  if (!movie)
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.content}>
          <Text style={styles.title}>Movie not found</Text>
          <Action label="Browse movies" onPress={() => router.replace('/(tabs)')} />
        </View>
      </SafeAreaView>
    );
  const trailer = trailerFor(movie);
  async function openTrailer() {
    setTrailerError('');
    try {
      await Linking.openURL(trailer.url);
    } catch {
      setTrailerError('Unable to open the trailer. Please try again.');
    }
  }
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.backButton}>
          <Action label="Back to movies" onPress={goBack} secondary />
        </View>
        <View style={[styles.detailLayout, wide && styles.wideLayout]}>
          <Poster
            label={`${movie.name} artwork`}
            source={movie.image}
            contentFit="contain"
            style={[styles.poster, wide && styles.widePoster]}
          />
          <View style={styles.information}>
            <Text accessibilityRole="header" style={styles.title}>
              {movie.name}
            </Text>
            <Text style={styles.meta}>
              {movie.releaseDate.slice(0, 4)} · {movie.genre}
            </Text>
            <Text style={styles.description}>{movie.description}</Text>
            <Text style={styles.meta}>Director: {movie.director}</Text>
            <Text style={styles.meta}>Cast: {movie.cast}</Text>
            <Text style={styles.meta}>
              Runtime: {movie.runtimeMinutes} minutes · Language: {movie.language}
            </Text>
            <Text style={styles.meta}>US age rating: {movie.ageRating}</Text>
            <View style={styles.actions}>
              <Action label="Watch official trailer" onPress={openTrailer} />
              <Text style={styles.meta}>YouTube · {trailer.publisher}</Text>
              {guest ? (
                <Action
                  label="Sign in to save this movie"
                  secondary
                  onPress={() => router.push('/(auth)/login')}
                />
              ) : (
                <>
                  <Action
                    label={record?.favorite ? 'Remove from favorites' : 'Add to favorites'}
                    disabled={disabled}
                    onPress={() => library.toggleFavorite(id)}
                    secondary
                  />
                  <Action
                    label={
                      record?.status === 'watchlist' ? 'Remove from watchlist' : 'Add to watchlist'
                    }
                    disabled={disabled}
                    onPress={() =>
                      library.setStatus(id, record?.status === 'watchlist' ? 'none' : 'watchlist')
                    }
                    secondary
                  />
                  <Action
                    label={record?.status === 'watched' ? 'Mark as not watched' : 'Mark as watched'}
                    disabled={disabled}
                    onPress={() =>
                      library.setStatus(id, record?.status === 'watched' ? 'none' : 'watched')
                    }
                    secondary
                  />
                  {library.saving && (
                    <Text accessibilityLiveRegion="polite" style={styles.meta}>
                      Saving...
                    </Text>
                  )}
                  {!library.ready && !library.error && (
                    <Text style={styles.meta}>Loading your collection...</Text>
                  )}
                  {!!library.error && (
                    <>
                      <Text accessibilityRole="alert" style={styles.error}>
                        {library.error}
                      </Text>
                      {!library.ready && (
                        <Action label="Retry collection" onPress={library.retry} secondary />
                      )}
                    </>
                  )}
                </>
              )}
              {!!trailerError && (
                <Text accessibilityRole="alert" style={styles.error}>
                  {trailerError}
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { width: '100%', maxWidth: 1000, alignSelf: 'center', padding: 20, paddingBottom: 48 },
  backButton: { width: 180, alignSelf: 'flex-start' },
  detailLayout: { gap: 24, marginTop: 24 },
  wideLayout: { flexDirection: 'row', alignItems: 'flex-start', gap: 32 },
  information: { flex: 1, minWidth: 0 },
  widePoster: { width: 260, flexShrink: 0, alignSelf: 'flex-start' },
  poster: {
    width: '100%',
    maxWidth: 280,
    aspectRatio: 2 / 3,
    alignSelf: 'center',
    borderRadius: 12,
  },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', marginBottom: 10 },
  meta: { color: colors.muted, fontSize: 15, lineHeight: 24, marginBottom: 8 },
  description: { color: colors.text, fontSize: 16, lineHeight: 26, marginVertical: 16 },
  actions: { gap: 12, marginTop: 24 },
  error: { color: colors.danger, lineHeight: 22 },
});
