import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { auth } from '../../lib/firebase';
import { router } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { Action, AuthShell, Field, formStyles as s } from '../../components/cinema-ui';
import { finishProfile } from '../../lib/profile';
import { useAuth } from '../../contexts/auth';

export default function Login() {
  const { enterGuest, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // ✅ NEW: Variable for error text

  const handleLogin = async () => {
    if (loading) return;
    setErrorMsg(""); // Clear previous errors

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      // Profile setup can be repaired later without blocking offline browsing.
      if (!credential.user.displayName) void finishProfile(credential.user).catch(() => {});
      setLoading(false);
      router.replace("/(tabs)");
    } catch (error: any) {
      setLoading(false);


      // ✅ SHOW ERROR ON SCREEN INSTEAD OF ALERT
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setErrorMsg("Incorrect email or password.");
      }
      else if (error.code === 'auth/invalid-email') {
        setErrorMsg("Invalid email format.");
      }
      else if (error.code === 'auth/too-many-requests') {
        setErrorMsg("Account temporarily locked. Try again later.");
      }
      else {
        setErrorMsg("Unable to sign in. Check your connection and try again.");
      }
    }
  };

  return <AuthShell title="Welcome back." subtitle="Your next great film is waiting. Pick up where you left off.">

    <Field label="Email address" placeholder="you@example.com" value={email} editable={!loading} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" onChangeText={(text) => { setEmail(text); setErrorMsg(''); }} />
    <Field label="Password" placeholder="Enter your password" value={password} editable={!loading} secureTextEntry autoCapitalize="none" autoComplete="current-password" onChangeText={(text) => { setPassword(text); setErrorMsg(''); }} />
    <Pressable accessibilityRole="button" onPress={() => router.push('/(auth)/reset-password')} style={{ minHeight: 44, alignSelf: 'flex-end', justifyContent: 'center', marginBottom: 12 }}><Text style={s.link}>Forgot password?</Text></Pressable>

    {!!errorMsg && <Text accessibilityRole="alert" style={s.error}>{errorMsg}</Text>}
    <Action label="Sign in" onPress={handleLogin} loading={loading} />
    {!user && <><Text style={[s.hint, { marginTop: 24, textAlign: 'center' }]}>Just looking around? Browse films without an account.</Text><Action label="Continue as guest" secondary disabled={loading} onPress={() => { enterGuest(); router.replace('/(tabs)'); }} /><Text style={[s.hint, { marginTop: 12, textAlign: 'center' }]}>Guest mode is for browsing. Sign in to save your collection.</Text></>}
    <Pressable accessibilityRole="button" disabled={loading} onPress={() => router.push('/(auth)/register')}>
      <Text style={s.footer}>New to CinemaStream? <Text style={s.link}>Join us</Text></Text>
    </Pressable>
  </AuthShell>;
}
