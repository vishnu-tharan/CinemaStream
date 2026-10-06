import { ErrorBoundaryProps } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cinema as c } from '../constants/cinema';
import { captureCrash } from '../lib/monitoring';
import { Action } from './cinema-ui';

export function ErrorScreen({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => { captureCrash(error); }, [error]);
  return <View style={s.screen}><View style={s.content}>
    <Text accessibilityRole="header" style={s.title}>A little intermission.</Text>
    <Text style={s.copy}>Something went wrong while opening this screen. Try again to continue.</Text>
    <Action label="Try again" onPress={retry} />
  </View></View>;
}
const s = StyleSheet.create({ screen: { flex: 1, backgroundColor: c.bg, justifyContent: 'center', padding: 24 }, content: { width: '100%', maxWidth: 440, alignSelf: 'center' }, title: { color: c.text, fontFamily: c.serif, fontSize: 36 }, copy: { color: c.muted, fontSize: 16, lineHeight: 26, marginVertical: 24 } });
