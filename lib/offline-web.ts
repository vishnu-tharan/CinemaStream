import { Platform } from 'react-native';

export function enableOfflineWeb() {
  if (Platform.OS !== 'web' || __DEV__ || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  void navigator.serviceWorker.register('/sw.js').catch(() => {
    // Private browsing or insecure hosts can prevent caching; regular browsing still works.
  });
}
