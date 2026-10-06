import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { movies } from '../../assets/data/movies';
import { Action, MovieTile } from '../../components/cinema-ui';
import { SyncNotice } from '../../components/sync-notice';
import { cinema as c } from '../../constants/cinema';
import { useLibrary } from '../../contexts/library';
import { useAuth } from '../../contexts/auth';
import { GuestPrompt } from '../../components/guest-prompt';

type CollectionTab = 'all' | 'favorite' | 'watchlist' | 'watched';
const tabs: { value: CollectionTab; label: string }[] = [{ value: 'all', label: 'All saved' }, { value: 'favorite', label: 'Favorites' }, { value: 'watchlist', label: 'Want to watch' }, { value: 'watched', label: 'Watched' }];
export default function Favorites() {
  const { guest } = useAuth();
  const { entries, ready, error, retry } = useLibrary();
  const [tab, setTab] = useState<CollectionTab>('all');
  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const effectiveWidth = width / Math.max(1, fontScale);
  const columns = effectiveWidth >= 1000 ? 5 : effectiveWidth >= 700 ? 4 : effectiveWidth >= 500 ? 3 : 2;
  const tileWidth = (Math.min(width, 1200) - 48 - (columns - 1) * 16) / columns;
  const filtered = movies.filter((movie) => {
    const record = entries[String(movie.id)];
    if (!record) return false;
    return tab === 'all' ? record.favorite || record.status !== 'none' : tab === 'favorite' ? record.favorite : record.status === tab;
  }).sort((a, b) => entries[String(b.id)].updatedAt - entries[String(a.id)].updatedAt);
  if (guest) return <GuestPrompt collection />;
  return <View style={s.screen}><FlatList key={columns} numColumns={columns} columnWrapperStyle={{ gap: 16 }} data={filtered}
    contentContainerStyle={{ width: '100%', maxWidth: 1200, alignSelf: 'center', padding: 24, paddingTop: insets.top + 32, paddingBottom: 100 }}
    ListHeaderComponent={<View style={{ marginBottom: 24 }}><Text style={s.eyebrow}>SAVED FOR A GREAT NIGHT</Text><Text accessibilityRole="header" style={s.title}>Your collection.</Text><Text style={s.subtitle}>The films you love, and the ones you haven’t met yet.</Text><SyncNotice /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabs}>{tabs.map((item) => <Pressable key={item.value} accessibilityRole="button" accessibilityState={{ selected: tab === item.value }} onPress={() => setTab(item.value)} style={[s.tab, tab === item.value && s.active]}><Text style={[s.tabText, tab === item.value && { color: c.bg }]}>{item.label}</Text></Pressable>)}</ScrollView></View>}
    keyExtractor={(m) => String(m.id)} renderItem={({ item }) => <View><MovieTile movie={item} width={tileWidth} /><Text style={[s.badge, { width: tileWidth }]}>{entries[String(item.id)].status === 'watched' ? 'Watched' : entries[String(item.id)].status === 'watchlist' ? 'Want to watch' : 'Favorite'}</Text></View>}
    ListEmptyComponent={!ready ? <View accessibilityLabel="Loading your collection" style={s.skeletons}>{[0, 1].map((i) => <View key={i} style={[s.skeleton, { width: tileWidth, height: tileWidth / 0.69 }]} />)}</View> : <View style={s.empty}><View style={s.icon}><Ionicons name={tab === 'watched' ? 'checkmark-done-outline' : 'bookmark-outline'} color={c.accent} size={28} /></View><Text accessibilityRole="header" style={s.emptyTitle}>{error && !Object.keys(entries).length ? 'Your collection needs a retry.' : tab === 'watched' ? 'The credits are just the beginning.' : 'Start your own collection.'}</Text><Text style={s.emptyText}>{error && !Object.keys(entries).length ? 'Reconnect to load your saved films. You can keep discovering films while offline.' : 'Open a film to favorite it, add it to your watchlist, or mark it as watched.'}</Text><Action label={error ? 'Retry collection' : 'Discover films'} onPress={error ? retry : () => router.push('/(tabs)')} /></View>} /></View>;
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg }, eyebrow: { color: c.accent, fontSize: 11, letterSpacing: 2, fontWeight: '700', marginBottom: 14 }, title: { color: c.text, fontFamily: c.serif, fontSize: 38, letterSpacing: -1 }, subtitle: { color: c.muted, fontSize: 14, lineHeight: 22, marginTop: 12 },
  tabs: { gap: 8, paddingTop: 24 }, tab: { minHeight: 44, paddingHorizontal: 16, paddingVertical: 12, justifyContent: 'center', borderRadius: 24, borderWidth: 1, borderColor: c.border }, active: { backgroundColor: c.accent, borderColor: c.accent }, tabText: { color: c.muted, fontSize: 13, fontWeight: '600' }, badge: { color: c.accent, fontSize: 12, marginTop: -14, marginBottom: 24 },
  skeletons: { flexDirection: 'row', gap: 16 }, skeleton: { backgroundColor: c.elevated, borderRadius: 14 },
  empty: { alignSelf: 'center', width: '100%', maxWidth: 390, paddingVertical: 50, alignItems: 'center' }, icon: { width: 76, height: 76, borderRadius: 24, backgroundColor: c.accentDark, alignItems: 'center', justifyContent: 'center' }, emptyTitle: { fontFamily: c.serif, fontSize: 26, color: c.text, textAlign: 'center', marginTop: 26 }, emptyText: { color: c.muted, fontSize: 14, lineHeight: 24, textAlign: 'center', marginTop: 12, marginBottom: 28 },
});
