import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { movieThumbnails } from '../../assets/data/thumbnails';
import { cinema as colors } from '../constants/cinema';
import { Poster } from './poster';
export function Brand() {
  return (
    <View style={styles.brand}>
      <Ionicons name="film-outline" size={28} color={colors.accent} />
      <Text style={styles.brandText}>CinemaStream</Text>
    </View>
  );
}
export function Action({ label, onPress, disabled = false, loading = false, secondary = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondaryButton,
        { opacity: disabled || loading ? 0.5 : pressed ? 0.8 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? colors.text : colors.bg} />
      ) : (
        <Text style={[styles.buttonText, secondary && styles.secondaryText]}>{label}</Text>
      )}
    </Pressable>
  );
}
export function Field({ label, ...props }) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, focused && styles.focusedField]}>
        <TextInput
          {...props}
          accessibilityLabel={label}
          placeholderTextColor={colors.muted}
          secureTextEntry={props.secureTextEntry && !visible}
          style={styles.input}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
        />
        {props.secureTextEntry && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
            disabled={props.editable === false}
            onPress={() => setVisible(!visible)}
            style={styles.passwordButton}
          >
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.muted}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}
export function AuthShell({ title, subtitle, children }) {
  const { width } = useWindowDimensions();
  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.authPage}>
          <View style={[styles.authContent, width < 480 && styles.compactAuthCard]}>
            <Brand />
            <Text accessibilityRole="header" style={styles.title}>
              {title}
            </Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <View style={styles.form}>{children}</View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function MovieTile({ movie, width }) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${movie.name}`}
      onPress={() => router.push('/movie/' + movie.id)}
      style={({ pressed }) => [styles.movieCard, { width }, pressed && styles.pressed]}
    >
      <Poster
        label={`${movie.name} artwork`}
        source={movieThumbnails[movie.id] || movie.image}
        style={{ width: '100%', aspectRatio: 2 / 3 }}
      />
      <View style={styles.movieCaption}>
        <Text style={styles.movieTitle} numberOfLines={2}>
          {movie.name}
        </Text>
        <Text style={styles.movieYear}>{movie.releaseDate.slice(0, 4)}</Text>
      </View>
    </Pressable>
  );
}
export const formStyles = StyleSheet.create({
  error: { color: colors.danger, lineHeight: 22, marginBottom: 16 },
  footer: { color: colors.muted, textAlign: 'center', marginTop: 20, lineHeight: 22 },
  link: { color: colors.accent, fontWeight: '600' },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 20, marginBottom: 18 },
});
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandText: { color: colors.text, fontSize: 22, fontWeight: '700' },
  button: {
    minHeight: 50,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: { backgroundColor: colors.elevated, borderColor: colors.border },
  buttonText: { color: colors.bg, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  secondaryText: { color: colors.text },
  fieldGroup: { marginBottom: 18 },
  label: { color: colors.text, fontSize: 14, marginBottom: 8 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.bg,
  },
  focusedField: { borderColor: colors.accent },
  input: { flex: 1, minWidth: 0, minHeight: 48, padding: 12, color: colors.text, fontSize: 16 },
  passwordButton: { padding: 12, minWidth: 44, minHeight: 44 },
  authPage: { flexGrow: 1, justifyContent: 'center', padding: 16 },
  authContent: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  compactAuthCard: { padding: 18 },
  title: { color: colors.text, fontSize: 28, fontWeight: '700', marginTop: 30 },
  subtitle: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 10 },
  form: { marginTop: 28 },
  movieCard: {
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  movieCaption: { padding: 12 },
  movieTitle: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 44,
    fontWeight: '600',
  },
  movieYear: { color: colors.muted, fontSize: 14, marginTop: 6 },
  pressed: { opacity: 0.8 },
});
