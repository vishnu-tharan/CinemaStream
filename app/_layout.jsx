import { Stack } from 'expo-router';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { AuthProvider, useAuth } from '../src/contexts/auth';
import { LibraryProvider } from '../src/contexts/library';
import { cinema as colors } from '../src/constants/cinema';
export { ErrorScreen as ErrorBoundary } from '../src/components/error-screen';
function Navigation() {
  const { user, guest, loading } = useAuth();
  if (loading)
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <ActivityIndicator accessibilityLabel="Restoring your account" color={colors.accent} />
      </View>
    );
  return (
    <>
      <StatusBar barStyle="light-content" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Protected guard={!!user || guest}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="movie/[id]" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
export default function RootLayout() {
  return (
    <AuthProvider>
      <LibraryProvider>
        <Navigation />
      </LibraryProvider>
    </AuthProvider>
  );
}
