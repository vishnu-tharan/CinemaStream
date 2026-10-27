import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Action, AuthShell, Field, formStyles as styles } from '../../src/components/cinema-ui';
import { auth } from '../../src/lib/firebase';
import { useAuth } from '../../src/contexts/auth';
export default function RegisterScreen() {
  const { refresh } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);
  async function register() {
    if (loading) return;
    if (!name.trim() || name.trim().length > 100) {
      setError('Enter a name between 1 and 100 characters.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (!created && (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password))) {
      setError('Use at least 8 characters, one uppercase letter and one number.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (!created) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
        setCreated(true);
        setPassword('');
      }
      if (!auth.currentUser) {
        router.replace('/(auth)/login');
        return;
      }
      await updateProfile(auth.currentUser, { displayName: name.trim() });
      await refresh();
      router.replace('/(tabs)');
    } catch (failure) {
      const code = failure.code;
      if (code === 'auth/email-already-in-use') {
        setError('This email is already registered. Sign in or reset your password.');
      } else if (
        code === 'auth/weak-password' ||
        code === 'auth/password-does-not-meet-requirements'
      ) {
        setError(
          'This password does not meet the account password policy. Try a stronger password.',
        );
      } else if (auth.currentUser) {
        setError('Your account is created. Retry to save your name.');
      } else {
        setError('Unable to create an account. Check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthShell title="Create account" subtitle="Keep your movie collection in one place.">
      <Field
        label="Your name"
        value={name}
        onChangeText={setName}
        maxLength={100}
        autoComplete="name"
        editable={!loading}
      />
      <Field
        label="Email address"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        editable={!loading && !created}
      />
      {!created && (
        <>
          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            editable={!loading}
          />
          <Text style={styles.hint}>8+ characters, one uppercase letter and one number.</Text>
        </>
      )}
      {!!error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
      <Action
        label={created ? 'Save name' : 'Create account'}
        onPress={register}
        loading={loading}
      />
      <Pressable
        accessibilityRole="button"
        disabled={loading}
        onPress={() => router.replace('/(auth)/login')}
        style={{ minHeight: 48 }}
      >
        <Text style={styles.footer}>
          Already registered? <Text style={styles.link}>Sign in</Text>
        </Text>
      </Pressable>
    </AuthShell>
  );
}
