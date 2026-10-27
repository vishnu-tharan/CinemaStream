import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Action, AuthShell, Field, formStyles as styles } from '../../src/components/cinema-ui';
import { useAuth } from '../../src/contexts/auth';
import { auth } from '../../src/lib/firebase';
export default function LoginScreen() {
  const { enterGuest, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function login() {
    if (loading) return;
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/(tabs)');
    } catch (failure) {
      const code = failure.code;
      setError(
        code === 'auth/too-many-requests'
          ? 'Too many attempts. Please try again later.'
          : 'Unable to sign in. Check your email, password and connection.',
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthShell title="Sign in" subtitle="Save your favorite movies and build a watchlist.">
      <Field
        label="Email address"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        editable={!loading}
      />
      <Field
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        editable={!loading}
      />
      {!!error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
      <Action label="Sign in" loading={loading} onPress={login} />
      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={() => router.push('/(auth)/reset-password')}
        style={{ minHeight: 44 }}
      >
        <Text style={styles.footer}>
          <Text style={styles.link}>Forgot password?</Text>
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={() => router.push('/(auth)/register')}
        style={{ minHeight: 44 }}
      >
        <Text style={styles.footer}>
          New here? <Text style={styles.link}>Create an account</Text>
        </Text>
      </Pressable>
      <Text style={[styles.hint, { marginTop: 24 }]}>
        You can browse movies without an account.
      </Text>
      <Action
        label={user ? 'Continue to movies' : 'Continue as guest'}
        secondary
        disabled={loading}
        onPress={() => {
          if (!user) enterGuest();
          router.replace('/(tabs)');
        }}
      />
    </AuthShell>
  );
}
