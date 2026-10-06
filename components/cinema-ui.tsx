import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { memo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cinema as c } from '../constants/cinema';
import { Poster } from './poster';
import { movies } from '../assets/data/movies';
import { movieThumbnails } from '../assets/data/thumbnails';

export function Brand() {
  return <View style={s.brand}><View style={s.brandIcon}><Ionicons name="film-outline" size={20} color={c.bg} /></View><Text style={s.brandText}>Cinema<Text style={{ color: c.accent }}>Stream</Text></Text></View>;
}
export function Action({ label, onPress, disabled, loading, secondary = false }: { label: string; onPress: () => void; disabled?: boolean; loading?: boolean; secondary?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }} disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [s.button, secondary && s.secondary, { opacity: disabled || loading ? 0.5 : pressed ? 0.8 : 1 }]}>
    {loading ? <ActivityIndicator color={c.bg} /> : <><Text style={[s.buttonText, secondary && { color: c.text }]}>{label}</Text><Ionicons name="arrow-forward" size={18} color={secondary ? c.text : c.bg} /></>}
  </Pressable>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  return <View style={{ marginBottom: 18 }}><Text style={s.label}>{label}</Text><View style={[s.field, focused && { borderColor: c.accent }]}>
    <TextInput {...props} accessibilityLabel={label} placeholderTextColor={c.muted} style={s.input} secureTextEntry={props.secureTextEntry && !visible} onFocus={(event) => { setFocused(true); props.onFocus?.(event); }} onBlur={(event) => { setFocused(false); props.onBlur?.(event); }} />
    {props.secureTextEntry && <Pressable accessibilityRole="button" disabled={props.editable === false} accessibilityState={{ disabled: props.editable === false }} accessibilityLabel={visible ? 'Hide password' : 'Show password'} onPress={() => setVisible(!visible)} style={{ padding: 12 }}><Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} color={c.muted} size={20} /></Pressable>}
  </View></View>;
}
export function AuthShell({ title, subtitle, children }: React.PropsWithChildren<{ title: string; subtitle: string }>) {
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  return <SafeAreaView style={s.screen}><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[s.authPage, wide && { flexDirection: 'row', gap: 80 }]}>
    {wide && <View style={s.authArt}><Poster label="Interstellar artwork" source={movies[1].image} style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%' }]} /><LinearGradient colors={['transparent', c.bg]} style={StyleSheet.absoluteFillObject} /><View style={s.artCopy}><Text style={s.eyebrow}>FOR THE LOVE OF CINEMA</Text><Text style={s.artTitle}>Great stories.<Text>{String.fromCharCode(10)}</Text>A little escape.</Text><Text style={s.artSubtitle}>Discover your next favorite film, and keep the ones you love close.</Text></View></View>}
    <View style={s.authContent}><Brand /><Text style={[s.eyebrow, { marginTop: 48 }]}>YOUR NEXT CHAPTER</Text><Text accessibilityRole="header" style={s.authTitle}>{title}</Text><Text style={s.subtitle}>{subtitle}</Text><View style={{ marginTop: 30 }}>{children}</View><View style={s.authNote}><Ionicons name="lock-closed-outline" size={13} color={c.muted} /><Text style={s.note}>Your movie collection. Your own space.</Text></View></View>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}
export const MovieTile = memo(function MovieTile({ movie, width }: { movie: typeof movies[number]; width: number }) {
  const router = useRouter();
  return <Pressable accessibilityRole="button" accessibilityLabel={'View ' + movie.name} onPress={() => router.push(('/movie/' + movie.id) as '/movie/[id]')} style={({ pressed }) => [{ width, marginBottom: 24, opacity: pressed ? 0.8 : 1 }]}>
    <View style={{ borderRadius: 14, overflow: 'hidden', backgroundColor: c.surface }}><Poster label={movie.name + " artwork"} source={movieThumbnails[movie.id] || movie.image} style={{ width: '100%', aspectRatio: 0.69 }} /><View style={s.year}><Text style={s.yearText}>{movie.releaseDate.slice(0, 4)}</Text></View></View>
    <Text style={s.movieTitle} numberOfLines={2}>{movie.name}</Text><Text style={s.movieGenre} numberOfLines={1}>{movie.genre}</Text>
  </Pressable>;
});
export const formStyles = StyleSheet.create({
  error: { color: c.danger, fontSize: 14, lineHeight: 21, marginBottom: 18 },
  footer: { color: c.muted, textAlign: 'center', fontSize: 14, marginTop: 24, lineHeight: 22 },
  link: { color: c.accent, fontWeight: '600' },
  hint: { color: c.muted, fontSize: 12, lineHeight: 18, marginTop: -8, marginBottom: 22 },
});
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 }, brandIcon: { width: 36, height: 36, backgroundColor: c.accent, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  brandText: { color: c.text, fontSize: 20, fontWeight: '700', letterSpacing: -0.7 },
  button: { minHeight: 54, borderRadius: 12, backgroundColor: c.accent, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  secondary: { backgroundColor: c.surface, borderColor: c.border, borderWidth: 1 }, buttonText: { color: c.bg, fontSize: 15, fontWeight: '700' },
  label: { color: c.text, fontSize: 13, fontWeight: '600', marginBottom: 9 }, field: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface }, input: { flex: 1, minWidth: 0, minHeight: 54, paddingHorizontal: 16, color: c.text, fontSize: 15 },
  authPage: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 28, paddingVertical: 48, width: '100%', maxWidth: 1280, alignSelf: 'center' },
  authContent: { width: '100%', maxWidth: 420 }, authArt: { flex: 1, alignSelf: 'stretch', minHeight: 650, overflow: 'hidden', borderRadius: 24 }, artCopy: { position: 'absolute', bottom: 48, left: 32, right: 32 },
  eyebrow: { color: c.accent, fontSize: 10, letterSpacing: 2.8, fontWeight: '700', marginBottom: 16 }, artTitle: { color: c.text, fontSize: 48, lineHeight: 54, fontFamily: c.serif }, artSubtitle: { color: '#CDD0D8', fontSize: 15, lineHeight: 24, marginTop: 20 },
  authTitle: { fontFamily: c.serif, fontSize: 42, lineHeight: 48, color: c.text, letterSpacing: -1 }, subtitle: { color: c.muted, fontSize: 15, lineHeight: 24, marginTop: 12 },
  authNote: { flexDirection: 'row', justifyContent: 'center', gap: 7, marginTop: 40 }, note: { color: c.muted, fontSize: 11 },
  year: { position: 'absolute', top: 10, right: 10, backgroundColor: '#0B0D12CC', borderRadius: 6, paddingVertical: 5, paddingHorizontal: 8 }, yearText: { color: c.text, fontSize: 12, fontWeight: '600' },
  movieTitle: { color: c.text, fontSize: 15, fontWeight: '600', marginTop: 12 }, movieGenre: { color: c.muted, fontSize: 13, marginTop: 5 },
});
