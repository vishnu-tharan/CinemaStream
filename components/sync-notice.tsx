import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLibrary } from '../contexts/library';
import { cinema as c } from '../constants/cinema';

export function SyncNotice() {
  const { offline, pendingCount, error, retry } = useLibrary();
  if (!offline && !pendingCount && !error) return null;
  return <View style={s.notice}>
    <Ionicons name={offline ? 'cloud-offline-outline' : 'cloud-upload-outline'} size={18} color={c.accent} />
    <Text accessibilityLiveRegion="polite" style={s.text}>{offline ? 'Offline. Films and saved collections stay available.' : error || 'Syncing your collection…'}{pendingCount ? ' ' + pendingCount + ' change' + (pendingCount === 1 ? '' : 's') + ' saved locally.' : ''}</Text>
    {!!error && !offline && <Pressable accessibilityRole="button" onPress={retry} style={s.retry}><Text style={s.retryText}>Retry</Text></Pressable>}
  </View>;
}
const s = StyleSheet.create({ notice: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 14, marginVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }, text: { color: c.muted, flex: 1, fontSize: 13, lineHeight: 21 }, retry: { minHeight: 44, minWidth: 44, justifyContent: 'center' }, retryText: { color: c.accent, fontSize: 14, fontWeight: '600' } });
