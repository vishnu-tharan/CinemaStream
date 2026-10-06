import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/auth';
import { LibraryProvider } from '../contexts/library';
import { ProfileSetupProvider } from '../contexts/profile-setup';
import { cinema as c } from '../constants/cinema';
import { initializeMonitoring } from '../lib/monitoring';
import { useEffect } from 'react';
import { enableOfflineWeb } from '../lib/offline-web';
export { ErrorScreen as ErrorBoundary } from '../components/error-screen';

function Navigation() {
  const { user, guest, loading } = useAuth();
  if (loading) return <View accessibilityLabel="Restoring your account" style={{ flex: 1, backgroundColor: c.bg, justifyContent: 'center' }}><ActivityIndicator color={c.accent} /></View>;
  return <>
    <StatusBar style="light" />
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Protected guard={!!user || guest}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="movie/[id]" />
      </Stack.Protected>
    </Stack>
  </>;
}
export default function RootLayout() {
  useEffect(() => { enableOfflineWeb(); initializeMonitoring(); }, []);
  return <AuthProvider><ProfileSetupProvider><LibraryProvider><Navigation /></LibraryProvider></ProfileSetupProvider></AuthProvider>;
}
