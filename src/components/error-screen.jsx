import { StyleSheet, Text, View } from 'react-native';
import { cinema as colors } from '../constants/cinema';
import { Action } from './cinema-ui';
export function ErrorScreen({ retry }) {
  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          Something went wrong
        </Text>
        <Text style={styles.description}>Try opening this screen again.</Text>
        <Action label="Try again" onPress={retry} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.bg },
  content: { width: '100%', maxWidth: 420, alignSelf: 'center' },
  title: { color: colors.text, fontSize: 26, fontWeight: '700' },
  description: { color: colors.muted, fontSize: 16, lineHeight: 24, marginVertical: 20 },
});
