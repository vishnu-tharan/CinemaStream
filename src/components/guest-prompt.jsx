import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cinema as colors } from '../constants/cinema';
import { useAuth } from '../contexts/auth';
import { Action } from './cinema-ui';
export function GuestPrompt({ collection = false }) {
  const router = useRouter();
  const { exitGuest } = useAuth();
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.icon}>
          <Ionicons
            name={collection ? 'bookmark-outline' : 'person-outline'}
            size={32}
            color={colors.accent}
          />
        </View>
        <Text accessibilityRole="header" style={styles.title}>
          {collection ? 'My collection' : 'Guest account'}
        </Text>
        <Text style={styles.description}>
          Sign in to save favorites, keep a watchlist and mark movies as watched.
        </Text>
        <View style={styles.actions}>
          <Action label="Sign in" onPress={() => router.push('/(auth)/login')} />
          <Action
            label="Create account"
            secondary
            onPress={() => router.push('/(auth)/register')}
          />
          <Action label="Keep browsing" secondary onPress={() => router.replace('/(tabs)')} />
          <Action
            label="Exit guest mode"
            secondary
            onPress={() => {
              exitGuest();
              router.replace('/(auth)/login');
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { width: '100%', maxWidth: 480, alignSelf: 'center', padding: 24 },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', marginTop: 12 },
  description: { color: colors.muted, fontSize: 16, lineHeight: 24, marginVertical: 20 },
  actions: { gap: 14 },
});
