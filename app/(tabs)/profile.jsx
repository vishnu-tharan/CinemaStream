import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { Action } from '../../src/components/cinema-ui';
import { GuestPrompt } from '../../src/components/guest-prompt';
import { cinema as colors } from '../../src/constants/cinema';
import { useAuth } from '../../src/contexts/auth';
import { useLibrary } from '../../src/contexts/library';
import { auth } from '../../src/lib/firebase';
export default function AccountScreen() {
  const { user, guest } = useAuth();
  const { entries, ready } = useLibrary();
  const router = useRouter();
  const [error, setError] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const savedCount = Object.values(entries).filter(
    (record) => record.favorite || record.status !== 'none',
  ).length;
  const collectionCountText = savedCount === 1 ? '1 saved movie' : `${savedCount} saved movies`;
  async function logout() {
    setSigningOut(true);
    setError('');
    try {
      await signOut(auth);
      router.replace('/(auth)/login');
    } catch {
      setError('Unable to sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  }
  if (guest) return <GuestPrompt />;
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.heading}>
          My account
        </Text>
        <View style={styles.card}>
          <Text style={styles.name}>{user?.displayName || 'Movie fan'}</Text>
          <Text style={styles.description}>{user?.email}</Text>
          <Text style={styles.description}>
            {ready ? collectionCountText : 'Loading collection...'}
          </Text>
        </View>
        <View style={styles.actions}>
          <Action
            label="Open my collection"
            onPress={() => router.push('/(tabs)/favorites')}
            secondary
          />
          <Action
            label={user?.emailVerified ? 'Email verified' : 'Verify email'}
            onPress={() => router.push('/(auth)/verify-email')}
            secondary
          />
          <Action label="Sign out" onPress={logout} loading={signingOut} />
          {!!error && (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', padding: 24 },
  heading: { color: colors.text, fontSize: 28, fontWeight: '700', marginTop: 12 },
  card: { backgroundColor: colors.surface, padding: 20, borderRadius: 8, marginVertical: 24 },
  name: { color: colors.text, fontSize: 20, fontWeight: '600' },
  description: { color: colors.muted, fontSize: 15, lineHeight: 24, marginTop: 10 },
  actions: { gap: 14 },
  error: { color: colors.danger, lineHeight: 22 },
});
