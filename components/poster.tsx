import { Image, ImageProps } from 'expo-image';
import { ImageStyle, Pressable, StyleProp, Text, View } from 'react-native';
import { useState } from 'react';
import { cinema as c } from '../constants/cinema';

export function Poster({ source, style, label, contentFit = 'cover' }: { source: ImageProps['source']; style: StyleProp<ImageStyle>; label: string; contentFit?: ImageProps['contentFit'] }) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (!source) return <View accessibilityLabel={'Poster unavailable for ' + label.replace(/ artwork$/, '')} style={[style, { backgroundColor: c.elevated, alignItems: 'center', justifyContent: 'center', padding: 16 }]}><Text style={{ color: c.text, fontSize: 18, textAlign: 'center' }}>{label.replace(/ artwork$/, '')}</Text><Text style={{ color: c.muted, fontSize: 12, marginTop: 12 }}>Poster unavailable</Text></View>;
  return <View style={[style, { overflow: 'hidden', backgroundColor: c.elevated }]}>
    {!loaded && !failed && <View accessibilityLabel={'Loading artwork for ' + label} style={{ position: 'absolute', inset: 0, backgroundColor: c.elevated }} />}
    {!failed ? <Image key={attempt} source={source} accessibilityLabel={label} contentFit={contentFit} cachePolicy="memory-disk" transition={180} style={{ width: '100%', height: '100%' }} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} /> : <Pressable accessibilityRole="button" accessibilityLabel={'Retry artwork for ' + label} onPress={() => { setFailed(false); setLoaded(false); setAttempt((n) => n + 1); }} style={{ flex: 1, minHeight: 44, padding: 12, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: c.accent, fontSize: 13, textAlign: 'center' }}>Artwork unavailable. Tap to retry.</Text></Pressable>}
  </View>;
}
