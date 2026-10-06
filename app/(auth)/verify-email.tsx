import { Redirect, router } from 'expo-router';
import { sendEmailVerification } from 'firebase/auth';
import { useRef, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { Action, AuthShell, formStyles as s } from '../../components/cinema-ui';
import { useAuth } from '../../contexts/auth';

export default function VerifyEmail() {
  const { user, refresh } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const lastSent = useRef(0);
  const busy = useRef(false);
  if (!user) return <Redirect href="/(auth)/login" />;
  const send = async () => {
    if (busy.current) return;
    if (Date.now() - lastSent.current < 60000) { setError('Please wait a minute before requesting another email.'); return; }
    busy.current = true; setLoading(true); setError(''); setMessage('');
    try { await sendEmailVerification(user); lastSent.current = Date.now(); setMessage('Verification email sent. Open the link in your inbox, then check again here.'); }
    catch { setError('Unable to send a verification email. Please try again later.'); }
    finally { busy.current = false; setLoading(false); }
  };
  const check = async () => {
    if (busy.current) return;
    busy.current = true; setLoading(true); setError('');
    try { await refresh(); setMessage(user.emailVerified ? 'Your email is verified.' : 'Not verified yet. Open the latest link from your inbox and try again.'); }
    catch { setError('Unable to check verification. Check your connection and try again.'); }
    finally { busy.current = false; setLoading(false); }
  };
  return <AuthShell title={user.emailVerified ? 'You’re verified.' : 'Check your inbox.'} subtitle={user.emailVerified ? 'Your email address has been confirmed.' : 'Confirm your email address to help keep your account secure.'}>
    <Text style={[s.hint, { fontSize: 15, marginBottom: 28 }]}>{user.email}</Text>
    {!!message && <Text accessibilityLiveRegion="polite" style={[s.hint, { fontSize: 14 }]}>{message}</Text>}
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    {!user.emailVerified && <><Action label="Send verification email" onPress={send} loading={loading} /><Text style={{ height: 14 }} /><Action label="I’ve verified my email" secondary onPress={check} disabled={loading} /></>}
    <Pressable accessibilityRole="button" onPress={() => router.replace('/(tabs)/profile')} style={{ minHeight: 48 }}><Text style={s.footer}><Text style={s.link}>Back to my account</Text></Text></Pressable>
  </AuthShell>;
}
