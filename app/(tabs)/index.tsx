import { Poster } from '../../components/poster';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { movies } from '../../assets/data/movies';
import { Brand, MovieTile } from '../../components/cinema-ui';
import { SyncNotice } from '../../components/sync-notice';
import { discover, SortOrder } from '../../lib/discovery';
import { cinema as c } from '../../constants/cinema';
import { useAuth } from '../../contexts/auth';

const genres = ['All films', 'Sci-Fi', 'Drama', 'Action', 'Animation', 'Romance'];
export default function MovieHome() {
  const { guest } = useAuth();
  const router = useRouter();
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All films');
  const [decade, setDecade] = useState('All years');
  const [sort, setSort] = useState<SortOrder>('curated');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const effectiveWidth = width / Math.max(1, fontScale);
  const columns = effectiveWidth >= 1000 ? 5 : effectiveWidth >= 700 ? 4 : effectiveWidth >= 500 ? 3 : 2;
  const contentWidth = Math.min(width, 1200);
  const tileWidth = (contentWidth - 48 - (columns - 1) * 16) / columns;
  const query = search.trim().toLowerCase();
  const filtered = useMemo(() => discover(movies, { search, genre, decade, sort }), [search, genre, decade, sort]);
  const renderMovie = useCallback(({ item }: { item: typeof movies[number] }) => <MovieTile movie={item} width={tileWidth} />, [tileWidth]);
  const featured = movies[1];
  return <View style={s.screen}><FlatList key={columns} numColumns={columns} data={filtered} keyExtractor={(m) => String(m.id)}
    initialNumToRender={columns * 2} maxToRenderPerBatch={columns * 2} windowSize={5} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} columnWrapperStyle={{ gap: 16 }} contentContainerStyle={{ width: '100%', maxWidth: 1200, alignSelf: 'center', paddingHorizontal: 24, paddingTop: insets.top + 20, paddingBottom: 120 }}
    ListHeaderComponent={<>
      <View style={s.header}><Brand /><Pressable accessibilityRole="button" accessibilityLabel="Open profile" onPress={() => router.push('/(tabs)/profile')} style={s.profile}><Ionicons name="person-outline" size={18} color={c.text} /></Pressable></View>
      {guest && <Pressable accessibilityRole="button" onPress={() => router.push('/(auth)/login')} style={{ paddingVertical: 14, minHeight: 44 }}><Text style={{ color: c.accent, fontSize: 13 }}>Guest mode · Browse only · Sign in to save films</Text></Pressable>}
      <SyncNotice /><View style={s.intro}><Text style={s.eyebrow}>THE CINEMASTREAM COLLECTION</Text><Text style={s.title}>Find your next escape.</Text><Text style={s.subtitle}>Extraordinary stories, waiting to be discovered.</Text></View>
      {!query && genre === 'All films' && decade === 'All years' && sort === 'curated' && <Pressable accessibilityRole="button" accessibilityLabel="Explore Interstellar" onPress={() => router.push('/movie/2')} style={[s.hero, { height: width < 500 ? 350 : 420 }]}>
        <Poster label="Interstellar artwork" source={featured.image} style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%' }]} />
        <LinearGradient colors={['#0B0D1210', '#0B0D1290', '#0B0D12F5']} style={StyleSheet.absoluteFillObject} />
        <View style={s.heroTag}><View style={s.dot} /><Text style={s.heroTagText}>IN THE SPOTLIGHT</Text></View>
        <View style={s.heroContent}><Text style={s.heroMeta}>2014   /   SCI-FI & DRAMA</Text><Text style={s.heroTitle}>Beyond the ordinary.</Text><Text style={s.heroName}>Interstellar</Text><Text style={s.heroDescription} numberOfLines={2}>A journey through space. A story that stays with you.</Text><View style={s.heroButton}><Text style={s.heroButtonText}>Explore film</Text><Ionicons name="arrow-forward" size={17} color={c.bg} /></View></View>
      </Pressable>}
      <View style={s.search}><Ionicons name="search-outline" size={20} color={c.muted} /><TextInput accessibilityLabel="Search movies" value={search} onChangeText={setSearch} placeholder="Search films, cast, genres, or year" placeholderTextColor={c.muted} style={s.searchInput} />{!!search && <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setSearch('')}><Ionicons name="close-circle" size={20} color={c.muted} /></Pressable>}</View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>{genres.map((item) => <Pressable accessibilityRole="button" accessibilityState={{ selected: genre === item }} key={item} onPress={() => setGenre(item)} style={[s.filter, genre === item && s.activeFilter]}><Text style={[s.filterText, genre === item && { color: c.bg }]}>{item}</Text></Pressable>)}</ScrollView>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: filtersOpen }} onPress={() => setFiltersOpen(!filtersOpen)} style={s.moreFilters}><Ionicons name="options-outline" size={18} color={c.accent} /><Text style={s.moreFilterText}>{decade !== 'All years' || sort !== 'curated' ? decade + ' · ' + sort : 'Year & sort'}</Text><Ionicons name={filtersOpen ? 'chevron-up' : 'chevron-down'} size={14} color={c.muted} /></Pressable>
      {filtersOpen && <View style={s.filterPanel}><Text style={s.filterLabel}>RELEASE DECADE</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>{['All years', '1990s', '2000s', '2010s', '2020s'].map((item) => <Pressable accessibilityRole="button" accessibilityState={{ selected: decade === item }} key={item} onPress={() => setDecade(item)} style={[s.filter, decade === item && s.activeFilter]}><Text style={[s.filterText, decade === item && { color: c.bg }]}>{item}</Text></Pressable>)}</ScrollView><Text style={s.filterLabel}>SORT BY</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>{([{ value: 'curated', label: 'Curated' }, { value: 'newest', label: 'Newest first' }, { value: 'oldest', label: 'Oldest first' }, { value: 'title', label: 'Title A–Z' }] as { value: SortOrder; label: string }[]).map((item) => <Pressable accessibilityRole="button" accessibilityState={{ selected: sort === item.value }} key={item.value} onPress={() => setSort(item.value)} style={[s.filter, sort === item.value && s.activeFilter]}><Text style={[s.filterText, sort === item.value && { color: c.bg }]}>{item.label}</Text></Pressable>)}</ScrollView></View>}
      <View style={s.section}><Text style={s.sectionTitle}>{query ? 'Search results' : genre === 'All films' ? 'Worth your time' : genre + ' collection'}</Text><Text style={s.count}>{filtered.length} FILMS</Text></View>
    </>}
    renderItem={renderMovie}
    ListEmptyComponent={<View style={s.empty}><Ionicons name="search-outline" size={32} color={c.accent} /><Text style={s.emptyTitle}>No films found</Text><Text style={s.subtitle}>Try a different title or genre.</Text><Pressable onPress={() => { setSearch(''); setGenre('All films'); setDecade('All years'); setSort('curated'); }}><Text style={{ color: c.accent, marginTop: 20 }}>Reset filters</Text></Pressable></View>} /></View>;
}
const s = StyleSheet.create({
  moreFilters: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, alignSelf: 'flex-start', marginBottom: 10 }, moreFilterText: { color: c.accent, fontSize: 14 }, filterPanel: { padding: 16, borderRadius: 14, borderWidth: 1, borderColor: c.border, marginBottom: 16 }, filterLabel: { color: c.muted, fontSize: 12, letterSpacing: 1 },
  screen: { flex: 1, backgroundColor: c.bg }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, profile: { width: 44, height: 44, borderRadius: 20, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
  intro: { marginTop: 36, marginBottom: 28 }, eyebrow: { color: c.accent, fontSize: 11, letterSpacing: 2.4, fontWeight: '700', marginBottom: 12 }, title: { fontFamily: c.serif, fontSize: 36, color: c.text, letterSpacing: -1 }, subtitle: { color: c.muted, fontSize: 13, lineHeight: 22, marginTop: 10 },
  hero: { borderRadius: 20, overflow: 'hidden', backgroundColor: c.surface, marginBottom: 28 }, heroTag: { position: 'absolute', top: 20, left: 20, backgroundColor: '#0B0D12AA', borderRadius: 7, padding: 9, flexDirection: 'row', alignItems: 'center', gap: 7 }, dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: c.accent }, heroTagText: { color: c.text, fontSize: 11, letterSpacing: 1.6, fontWeight: '700' },
  heroContent: { position: 'absolute', bottom: 24, left: 24, right: 24 }, heroMeta: { color: c.accent, fontSize: 11, letterSpacing: 1.8, marginBottom: 12 }, heroTitle: { color: c.text, fontSize: 31, fontFamily: c.serif }, heroName: { color: c.text, fontSize: 13, fontWeight: '600', marginTop: 8 }, heroDescription: { color: '#CDD0D8', fontSize: 12, lineHeight: 20, marginTop: 8 }, heroButton: { flexDirection: 'row', alignSelf: 'flex-start', gap: 14, alignItems: 'center', backgroundColor: c.accent, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 9, marginTop: 18 }, heroButtonText: { color: c.bg, fontSize: 12, fontWeight: '700' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: c.border, borderRadius: 12, backgroundColor: c.surface, paddingHorizontal: 16 }, searchInput: { flex: 1, minWidth: 0, height: 52, color: c.text, fontSize: 12 }, filters: { gap: 8, paddingVertical: 20 }, filter: { paddingHorizontal: 16, paddingVertical: 12, minHeight: 44, justifyContent: 'center', borderRadius: 24, borderWidth: 1, borderColor: c.border }, activeFilter: { backgroundColor: c.accent, borderColor: c.accent }, filterText: { color: c.muted, fontSize: 13, fontWeight: '600' },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 22 }, sectionTitle: { color: c.text, fontFamily: c.serif, fontSize: 26 }, count: { color: c.muted, fontSize: 11, letterSpacing: 1.5 }, empty: { paddingVertical: 50, alignItems: 'center' }, emptyTitle: { color: c.text, fontSize: 20, marginTop: 20 },
});
