import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/auth';
import { useLibrary } from '../../contexts/library';
import { useProfileSetup } from '../../contexts/profile-setup';
import { Action } from '../../components/cinema-ui';
import { SyncNotice } from '../../components/sync-notice';
import { cinema as c } from '../../constants/cinema';
import { auth } from '../../lib/firebase';
import { GuestPrompt } from '../../components/guest-prompt';
export default function Profile() {
  const router = useRouter();
  const { user, guest } = useAuth();
  const library = useLibrary();
  const setup = useProfileSetup();
  const count = Object.values(library.entries).filter((entry) => entry.favorite || entry.status !== 'none').length;
  const insets = useSafeAreaInsets();
  const [errorMsg, setErrorMsg] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const logout = async () => {
    setSigningOut(true);
    try { await signOut(auth); router.replace('/(auth)/login'); }
    catch { setErrorMsg('Unable to sign out. Please try again.'); }
    finally { setSigningOut(false); }
  };
  if (guest) return <GuestPrompt />;
  if (!user) return <View style={s.screen}><ActivityIndicator color={c.accent} /></View>;
  return <ScrollView style={s.screen} contentContainerStyle={{ width: '100%', maxWidth: 720, alignSelf: 'center', padding: 24, paddingTop: insets.top + 32, paddingBottom: 100 }}>
    <Text style={s.eyebrow}>YOUR CORNER OF CINEMA</Text><Text style={s.title}>A little about you.</Text>
    <LinearGradient colors={[c.elevated, c.surface]} style={s.member}>
      <View style={s.memberTop}><Text style={s.memberLabel}>CINEMASTREAM MEMBER</Text><Ionicons name="sparkles-outline" size={20} color={c.accent} /></View>
      <View style={s.avatar}><Text style={s.initial}>{(user.displayName || 'M').slice(0, 1).toUpperCase()}</Text></View>
      <Text style={s.name}>{user.displayName || 'Movie lover'}</Text><Text style={s.email}>{user.email}</Text>
      <View style={s.memberFooter}><View style={s.memberDot} /><Text style={s.memberFootText}>Made for the love of film.</Text></View>
    </LinearGradient>
    <SyncNotice />
    {!!setup.error && <View style={{ padding: 18, borderRadius: 12, backgroundColor: c.surface, marginTop: 16 }}><Text accessibilityRole="alert" style={{ color: c.muted, fontSize: 14, lineHeight: 22, marginBottom: 16 }}>{setup.error}</Text><Action label="Finish account setup" loading={setup.loading} onPress={setup.retry} /></View>}
    <Text style={s.section}>Your account</Text>
    <Pressable accessibilityRole="button" onPress={() => router.push('/(auth)/verify-email')} style={s.row}><View style={s.rowIcon}><Ionicons name={user.emailVerified ? 'shield-checkmark-outline' : 'mail-outline'} color={c.accent} size={21} /></View><View style={{ flex: 1 }}><Text style={s.rowTitle}>{user.emailVerified ? 'Email verified' : 'Verify your email'}</Text><Text style={s.rowSubtitle}>{user.emailVerified ? 'Your address is confirmed' : 'Send a link and check verification'}</Text></View><Ionicons name="chevron-forward" size={18} color={c.muted} /></Pressable>
    <Text style={s.section}>Your library</Text>
    <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/favorites')} style={s.row}><View style={s.rowIcon}><Ionicons name="bookmark-outline" color={c.accent} size={20} /></View><View style={{ flex: 1 }}><Text style={s.rowTitle}>My collection</Text><Text style={s.rowSubtitle}>{!library.ready ? 'Loading your films...' : count + (count === 1 ? ' film in your collection' : ' films in your collection')}</Text></View><Ionicons name="chevron-forward" size={18} color={c.muted} /></Pressable>
    <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)')} style={s.row}><View style={s.rowIcon}><Ionicons name="compass-outline" color={c.accent} size={21} /></View><View style={{ flex: 1 }}><Text style={s.rowTitle}>Find your next favorite</Text><Text style={s.rowSubtitle}>Explore the full collection</Text></View><Ionicons name="chevron-forward" size={18} color={c.muted} /></Pressable>
    {!!errorMsg && <Text style={{ color: c.danger, marginTop: 20 }}>{errorMsg}</Text>}
    <Pressable accessibilityRole="button" disabled={signingOut} onPress={logout} style={s.logout}><Ionicons name="log-out-outline" size={20} color={c.muted} /><Text style={s.logoutText}>{signingOut ? 'Signing out...' : 'Sign out'}</Text></Pressable>
    <Text style={s.footer}>CinemaStream  /  Every story starts somewhere.</Text>
  </ScrollView>;
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg }, eyebrow: { color: c.accent, fontSize: 11, letterSpacing: 2.3, marginBottom: 14, fontWeight: '700' }, title: { color: c.text, fontSize: 36, fontFamily: c.serif, letterSpacing: -1 },
  member: { borderWidth: 1, borderColor: c.border, borderRadius: 22, padding: 26, marginTop: 32 }, memberTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, memberLabel: { color: c.muted, fontSize: 11, letterSpacing: 2 }, avatar: { width: 72, height: 72, borderRadius: 24, backgroundColor: c.accent, justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 18 }, initial: { color: c.bg, fontSize: 34, fontFamily: c.serif }, name: { color: c.text, fontSize: 26, fontFamily: c.serif }, email: { color: c.muted, fontSize: 13, marginTop: 8 }, memberFooter: { flexDirection: 'row', gap: 8, alignItems: 'center', borderTopWidth: 1, borderColor: c.border, marginTop: 28, paddingTop: 20 }, memberDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: c.accent }, memberFootText: { color: c.muted, fontSize: 11 },
  section: { color: c.text, fontSize: 18, fontWeight: '600', marginTop: 36, marginBottom: 12 }, row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 20, borderBottomWidth: 1, borderColor: c.border }, rowIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: c.accentDark, justifyContent: 'center', alignItems: 'center' }, rowTitle: { color: c.text, fontSize: 14, fontWeight: '600' }, rowSubtitle: { color: c.muted, fontSize: 11, marginTop: 6 }, logout: { marginTop: 34, flexDirection: 'row', gap: 10, alignItems: 'center', alignSelf: 'flex-start', paddingVertical: 14 }, logoutText: { color: c.muted, fontSize: 14 }, footer: { color: c.muted, fontSize: 11, textAlign: 'center', marginTop: 40, letterSpacing: 0.8 },
});
