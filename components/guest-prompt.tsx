import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cinema as c } from '../constants/cinema';
import { useAuth } from '../contexts/auth';
import { Action, Brand } from './cinema-ui';

export function GuestPrompt({ collection = false }: { collection?: boolean }) {
  const { exitGuest } = useAuth();
  const insets = useSafeAreaInsets();
  return <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={[s.screen, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 100 }]}><View style={s.content}>
    <Brand /><Text style={s.label}>GUEST MODE · BROWSE ONLY</Text>
    <Text accessibilityRole="header" style={s.title}>{collection ? 'Make the collection yours.' : 'Welcome, movie explorer.'}</Text>
    <Text style={s.copy}>Explore films, read their stories, and watch trailers. Sign in to save favorites, keep a watchlist, and track what you’ve watched.</Text>
    <Action label="Sign in" onPress={() => router.push('/(auth)/login')} />
    <View style={s.gap} /><Action label="Create an account" secondary onPress={() => router.push('/(auth)/register')} />
    <View style={s.gap} /><Action label="Keep browsing" secondary onPress={() => router.replace('/(tabs)')} />
    <View style={s.gap} /><Action label="Exit guest mode" secondary onPress={() => { exitGuest(); router.replace('/(auth)/login'); }} />
  </View></ScrollView>;
}
const s = StyleSheet.create({ screen: { flexGrow: 1, backgroundColor: c.bg, padding: 24 }, content: { width: '100%', maxWidth: 480, alignSelf: 'center' }, label: { color: c.accent, fontSize: 12, marginTop: 36, letterSpacing: 1 }, title: { color: c.text, fontFamily: c.serif, fontSize: 34, marginTop: 18 }, copy: { color: c.muted, fontSize: 15, lineHeight: 24, marginTop: 18, marginBottom: 28 }, gap: { height: 12 } });
