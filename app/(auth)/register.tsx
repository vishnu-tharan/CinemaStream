import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification, validatePassword } from 'firebase/auth';
import { useRef, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { Action, AuthShell, Field, formStyles as s } from '../../components/cinema-ui';
import { useAuth } from '../../contexts/auth';
import { auth } from '../../lib/firebase';
import { finishProfile, pendingProfileKey } from '../../lib/profile';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);
  const busy = useRef(false);
  const { refresh } = useAuth();
  async function register() {
    if (busy.current) return;
    setError('');
    if (!name.trim() || name.trim().length > 100) { setError('Enter a name between 1 and 100 characters.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Enter a valid email address.'); return; }
    if (!created && (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password))) { setError('Use at least 8 characters, one uppercase letter, and one number.'); return; }
    busy.current = true; setLoading(true);
    let accountCreated = created;
    try {
      if (!accountCreated) {
        const policy = await validatePassword(auth, password);
        if (!policy.isValid) { setError('Your password does not meet the account password policy. Add more characters, numbers, or symbols.'); return; }
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        accountCreated = true; setCreated(true); setPassword('');
        // Store only the chosen name, never the password. Login can resume setup.
        await AsyncStorage.setItem(pendingProfileKey(credential.user.uid), name.trim());
      }
      if (!auth.currentUser) { router.replace('/(auth)/login'); return; }
      await finishProfile(auth.currentUser, name.trim());
      await refresh();
      // Email delivery is independent of account creation and can be retried.
      try { await sendEmailVerification(auth.currentUser); } catch { /* The verification screen provides resend. */ }
      router.replace('/(auth)/verify-email');
    } catch (failure) {
      const code = (failure as { code?: string }).code;
      if (accountCreated) setError('Your account is created. Retry to finish setup, or sign in later to resume.');
      else if (code === 'auth/email-already-in-use') setError('This email is already registered. Sign in or reset your password.');
      else if (code === 'auth/too-many-requests') setError('Please wait a few minutes before trying again.');
      else setError('Unable to create your account. Check your connection and retry.');
    } finally { busy.current = false; setLoading(false); }
  }
  return <AuthShell title={created ? 'Almost there.' : 'Make it your own.'} subtitle={created ? 'Your account is ready. Let’s finish setting up your profile.' : 'A world of stories. A collection that is uniquely yours.'}>
    <Field label="Your name" placeholder="What should we call you?" value={name} editable={!loading} autoComplete="name" maxLength={100} onChangeText={setName} />
    <Field label="Email address" placeholder="you@example.com" value={email} editable={!loading && !created} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" onChangeText={setEmail} />
    {!created && <><Field label="Password" placeholder="Create a password" value={password} editable={!loading} secureTextEntry autoCapitalize="none" autoComplete="new-password" onChangeText={setPassword} /><Text style={s.hint}>8+ characters, one uppercase letter, and one number.</Text></>}
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    <Action label={created ? 'Finish setup' : 'Create account'} onPress={register} loading={loading} />
    {created && <Pressable accessibilityRole="button" disabled={loading} onPress={() => router.replace('/(tabs)')} style={{ minHeight: 48 }}><Text style={s.footer}><Text style={s.link}>Continue and finish later</Text></Text></Pressable>}
    <Pressable accessibilityRole="button" disabled={loading} onPress={() => router.replace('/(auth)/login')} style={{ minHeight: 48 }}><Text style={s.footer}>Already part of the collection? <Text style={s.link}>Sign in</Text></Text></Pressable>
  </AuthShell>;
}
