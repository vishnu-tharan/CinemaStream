import { router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useRef, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { Action, AuthShell, Field, formStyles as s } from '../../components/cinema-ui';
import { auth } from '../../lib/firebase';

const confirmation = 'If an account exists for this email, a reset link will arrive shortly. Check your spam folder too.';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const busy = useRef(false);
  async function reset() {
    if (busy.current) return;
    setError(''); setMessage('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Enter a valid email address.'); return; }
    busy.current = true; setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage(confirmation);
    } catch (failure) {
      const code = (failure as { code?: string }).code;
      // Do not disclose whether an email has an account.
      if (code === 'auth/user-not-found') setMessage(confirmation);
      else setError(code === 'auth/too-many-requests' ? 'Please wait a few minutes before requesting another link.' : 'Unable to send the link. Check your connection and try again.');
    } finally { busy.current = false; setLoading(false); }
  }
  return <AuthShell title="A fresh start." subtitle="We’ll help you get back to your collection.">
    <Field label="Email address" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" value={email} editable={!loading} onChangeText={setEmail} />
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    {!!message && <Text accessibilityLiveRegion="polite" style={[s.hint, { marginTop: 0, fontSize: 14 }]}>{message}</Text>}
    <Action label="Send reset link" loading={loading} onPress={reset} />
    <Pressable accessibilityRole="button" onPress={() => router.replace('/(auth)/login')} style={{ minHeight: 48 }}><Text style={s.footer}><Text style={s.link}>Back to sign in</Text></Text></Pressable>
  </AuthShell>;
}
