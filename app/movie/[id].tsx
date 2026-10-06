import { Poster } from '../../components/poster';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { movies } from '../../assets/data/movies';
import { cinema as c } from '../../constants/cinema';
import { useFavorites } from '../../hooks/use-favorites';
import { useState } from 'react';
import { useLibrary } from '../../contexts/library';
import { trailerFor } from '../../lib/trailers';
import { SyncNotice } from '../../components/sync-notice';
import { Action } from '../../components/cinema-ui';
import { useAuth } from '../../contexts/auth';

export function generateStaticParams() {
  return movies.map((movie) => ({ id: String(movie.id) }));
}

export default function MovieDetails() {
  const { guest } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { ids, loading, error, saving, toggle } = useFavorites();
  const library = useLibrary();
  const [trailerError, setTrailerError] = useState('');
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const movie = movies.find((m) => String(m.id) === id);
  const back = () => router.canGoBack() ? router.back() : router.replace('/(tabs)');
  if (!movie) return <View style={s.notFound}><Ionicons name="film-outline" size={40} color={c.accent} /><Text style={s.title}>This film is missing.</Text><Action label="Explore the collection" onPress={() => router.replace('/(tabs)')} /></View>;
  const movieId = String(movie.id);
  const saved = ids.includes(movieId);
  const status = library.entries[movieId]?.status || 'none';
  const trailer = trailerFor(movie);
  async function watchTrailer() {
    setTrailerError('');
    try { await Linking.openURL(trailer.url); } catch { setTrailerError('Unable to open the trailer. Please retry when you are connected.'); }
  }
  return <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}>
    <View style={{ height: width >= 800 ? 540 : 470, backgroundColor: c.surface }}><Poster label={movie.name + " artwork"} source={movie.image} style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%' }]} /><LinearGradient colors={['#0B0D1230', '#0B0D1220', c.bg]} style={StyleSheet.absoluteFillObject} /><View style={[s.topbar, { top: insets.top + 18 }]}><Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={back} style={s.iconButton}><Ionicons name="arrow-back" color={c.text} size={21} /></Pressable><Text style={s.topLabel}>THE COLLECTION</Text><View style={{ width: 44 }} /></View><View style={s.heroCopy}><Text style={s.eyebrow}>A CINEMASTREAM SELECTION</Text><Text accessibilityRole="header" style={s.heroTitle}>{movie.name}</Text><Text style={s.meta}>{movie.releaseDate.slice(0, 4)}  •  {movie.genre}</Text></View></View>
    <View style={s.content}><SyncNotice />
      {guest ? <View style={{ marginBottom: 24 }}><Text style={[s.description, { marginBottom: 16 }]}>You’re browsing as a guest. Sign in to save this film to your collection.</Text><Action label="Sign in to save films" secondary onPress={() => router.push('/(auth)/login')} /></View> : <>
      <Pressable accessibilityRole="button" accessibilityLabel={saved ? 'Remove from favorites' : 'Add to favorites'} accessibilityState={{ selected: saved, disabled: loading || saving }} disabled={loading || saving} onPress={() => toggle(String(movie.id))} style={[s.save, { opacity: loading || saving ? 0.5 : 1 }]}>{loading || saving ? <ActivityIndicator color={c.bg} /> : <Ionicons name={saved ? 'heart' : 'heart-outline'} color={c.bg} size={19} />}<Text style={s.saveText}>{saving ? 'Saving...' : loading ? 'Loading collection...' : saved ? 'Added to favorites' : 'Add to favorites'}</Text></Pressable>
      <View style={s.libraryActions}>{([{ value: 'watchlist', label: 'Want to watch', icon: 'bookmark-outline' }, { value: 'watched', label: 'Watched', icon: 'checkmark-done-outline' }] as const).map((item) => <Pressable accessibilityRole="button" accessibilityState={{ selected: status === item.value, disabled: loading }} disabled={loading} key={item.value} onPress={() => library.setStatus(movieId, status === item.value ? 'none' : item.value)} style={[s.libraryAction, status === item.value && { borderColor: c.accent, backgroundColor: c.accentDark }]}><Ionicons name={item.icon} size={18} color={status === item.value ? c.accent : c.muted} /><Text style={{ color: status === item.value ? c.accent : c.text, fontSize: 13 }}>{item.label}</Text></Pressable>)}</View>
      </>}
      <Action label={trailer.official ? 'Watch official trailer ↗' : 'Find a trailer on YouTube ↗'} onPress={watchTrailer} secondary />
      <Text style={[s.note, { fontSize: 12, marginTop: 10, marginBottom: 26, fontFamily: undefined }]}>{trailer.official ? 'Opens the distributor’s trailer in your browser.' : 'Opens YouTube search. Official uploads may vary by film.'}</Text>
      {!!trailerError && <Text accessibilityRole="alert" style={s.error}>{trailerError}</Text>}
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      <Text style={s.sectionTitle}>The story</Text><Text style={s.description}>{movie.description}</Text>
      <View style={s.divider} /><Text style={s.sectionTitle}>Behind the story</Text>
      <View style={s.info}><Text style={s.label}>STARRING</Text><Text style={s.value}>{movie.cast}</Text></View>
      <View style={s.info}><Text style={s.label}>GENRE</Text><View style={s.genres}>{movie.genre.split(', ').map((genre) => <View key={genre} style={s.genre}><Text style={s.genreText}>{genre}</Text></View>)}</View></View>
      <View style={s.info}><Text style={s.label}>RELEASED</Text><Text style={s.value}>{new Date(movie.releaseDate + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</Text></View>
      <View style={s.divider} /><Text style={s.note}>Some stories stay with you long after the credits.</Text>
    </View>
  </ScrollView>;
}
const s = StyleSheet.create({
  libraryActions: { flexDirection: 'row', gap: 12, marginBottom: 16, flexWrap: 'wrap' }, libraryAction: { flex: 1, minWidth: 135, minHeight: 48, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: c.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  screen: { flex: 1, backgroundColor: c.bg }, topbar: { position: 'absolute', left: 24, right: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, iconButton: { width: 44, height: 44, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0D12BB', borderWidth: 1, borderColor: '#FFFFFF30' }, topLabel: { color: c.text, fontSize: 11, letterSpacing: 2.6, fontWeight: '700' },
  heroCopy: { position: 'absolute', bottom: 30, width: '100%', maxWidth: 850, alignSelf: 'center', paddingHorizontal: 24 }, eyebrow: { color: c.accent, fontSize: 11, letterSpacing: 2.4, marginBottom: 16, fontWeight: '700' }, heroTitle: { color: c.text, fontFamily: c.serif, fontSize: 44, letterSpacing: -1 }, meta: { color: '#C3C6CF', fontSize: 12, marginTop: 14, lineHeight: 20 },
  content: { width: '100%', maxWidth: 850, alignSelf: 'center', paddingHorizontal: 24 }, save: { backgroundColor: c.accent, padding: 18, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 16 }, saveText: { color: c.bg, fontSize: 14, fontWeight: '700' }, error: { color: c.danger, marginBottom: 24, fontSize: 13, lineHeight: 22 },
  sectionTitle: { color: c.text, fontSize: 26, fontFamily: c.serif, marginBottom: 18 }, description: { color: '#B2B7C2', fontSize: 16, lineHeight: 28 }, divider: { height: 1, backgroundColor: c.border, marginVertical: 30 }, info: { marginTop: 12, marginBottom: 18 }, label: { color: c.muted, fontSize: 11, letterSpacing: 2, marginBottom: 12 }, value: { color: c.text, fontSize: 14, lineHeight: 24 }, genres: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, genre: { borderWidth: 1, borderColor: c.border, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20 }, genreText: { color: c.muted, fontSize: 11 }, note: { color: c.muted, fontFamily: c.serif, fontSize: 15, textAlign: 'center', fontStyle: 'italic' },
  notFound: { flex: 1, backgroundColor: c.bg, padding: 24, justifyContent: 'center', gap: 24 }, title: { fontFamily: c.serif, fontSize: 32, color: c.text },
});
