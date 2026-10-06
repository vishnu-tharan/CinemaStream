import { Poster } from '../components/poster';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand, Action } from '../components/cinema-ui';
import { cinema as c } from '../constants/cinema';
import { useAuth } from '../contexts/auth';
import { movies } from '../assets/data/movies';

const slides = [
  { image: movies[1].image, tag: 'DISCOVER SOMETHING EXTRAORDINARY', title: 'A world of stories.\nOne place to escape.', copy: 'From unforgettable classics to worlds beyond imagination. Find the films that stay with you.' },
  { image: movies[6].image, tag: 'CURATE YOUR OWN COLLECTION', title: 'Some films deserve\na place of their own.', copy: 'Save the stories you love. Build a collection for quiet evenings, big adventures, and everything between.' },
  { image: movies[2].image, tag: 'MAKE TONIGHT A MOVIE NIGHT', title: 'Your next favorite\nis waiting.', copy: 'Explore by genre, discover an extraordinary cast, and let a great story find you.' },
];
export default function Welcome() {
  const [step, setStep] = useState(0);
  const { user, guest } = useAuth();
  const { width } = useWindowDimensions();
  const wide = width >= 800;
  if (user || guest) return <Redirect href="/(tabs)" />;
  const slide = slides[step];
  return <SafeAreaView style={s.screen}><ScrollView contentContainerStyle={s.page}>
    <View style={s.header}><Brand /><Pressable accessibilityRole="button" onPress={() => router.push('/(auth)/login')} style={{ padding: 12 }}><Text style={s.signin}>Sign in <Ionicons name="arrow-forward" size={12} /></Text></Pressable></View>
    <View style={[s.main, wide && { flexDirection: 'row', gap: 56 }]}>
      <View style={[s.art, { height: wide ? 580 : 340, width: wide ? '48%' : '100%' }]}><Poster label="Featured film artwork" source={slide.image} style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%' }]} /><LinearGradient colors={['#0B0D1200', '#0B0D1240', '#0B0D12']} style={StyleSheet.absoluteFillObject} /><View style={s.frameTag}><Ionicons name="film-outline" size={13} color={c.accent} /><Text style={s.frameText}>THE ART OF GETTING LOST</Text></View></View>
      <View style={[s.copy, wide && { flex: 1 }]}><Text style={s.eyebrow}>{slide.tag}</Text><Text style={[s.title, { fontSize: wide ? 50 : 37 }]}>{slide.title}</Text><Text style={s.subtitle}>{slide.copy}</Text>
        <View style={s.progress}>{slides.map((_, i) => <Pressable accessibilityRole="button" accessibilityLabel={'Introduction ' + (i + 1)} accessibilityState={{ selected: step === i }} key={i} onPress={() => setStep(i)} style={{ paddingVertical: 14, paddingRight: 8 }}><View style={[s.progressDot, i === step && { width: 30, backgroundColor: c.accent }]} /></Pressable>)}</View>
        <Action label={step === 2 ? 'Start your collection' : 'Continue'} onPress={() => step === 2 ? router.push('/(auth)/register') : setStep(step + 1)} />
        <Pressable accessibilityRole="button" onPress={() => router.push('/(auth)/register')} style={{ padding: 20 }}><Text style={s.skip}>Skip introduction</Text></Pressable>
      </View>
    </View><Text style={s.footer}>CURATED STORIES. ENDLESS POSSIBILITIES.</Text>
  </ScrollView></SafeAreaView>;
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg }, page: { flexGrow: 1, width: '100%', maxWidth: 1200, alignSelf: 'center', padding: 24, paddingBottom: 30 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, signin: { color: c.accent, fontSize: 12, fontWeight: '600' },
  main: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 36 }, art: { borderRadius: 22, overflow: 'hidden', backgroundColor: c.surface }, frameTag: { position: 'absolute', top: 20, left: 20, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#0B0D12AA', padding: 10, borderRadius: 8 }, frameText: { color: c.text, fontSize: 11, letterSpacing: 1.6 },
  copy: { width: '100%', maxWidth: 520, marginTop: 20 }, eyebrow: { color: c.accent, fontSize: 11, letterSpacing: 2.3, fontWeight: '700', marginBottom: 16 }, title: { fontFamily: c.serif, color: c.text, letterSpacing: -1, lineHeight: 48 }, subtitle: { color: c.muted, fontSize: 14, lineHeight: 24, marginTop: 20, maxWidth: 390 }, progress: { flexDirection: 'row', marginTop: 18, marginBottom: 14 }, progressDot: { width: 7, height: 5, borderRadius: 5, backgroundColor: c.border }, skip: { color: c.muted, fontSize: 11, textAlign: 'center' }, footer: { color: c.muted, fontSize: 11, textAlign: 'center', letterSpacing: 2, marginTop: 24 },
});
