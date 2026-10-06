import Constants, { ExecutionEnvironment } from 'expo-constants';
const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
let monitoring: Promise<typeof import('@sentry/react-native')> | undefined;
function loadMonitoring() {
  if (!dsn || __DEV__) return undefined;
  if (!monitoring) monitoring = import('@sentry/react-native').then((Sentry) => {
    Sentry.init({ dsn, enableNative: Constants.executionEnvironment !== ExecutionEnvironment.StoreClient, sendDefaultPii: false, tracesSampleRate: 0,
      beforeSend(event) {
        delete event.user; delete event.request; delete event.breadcrumbs;
        for (const exception of event.exception?.values || []) {
          if (exception.value) exception.value = exception.value.replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[email]').replace(/(password|token|apiKey|authorization)\s*[:=]\s*\S+/gi, '$1=[redacted]');
        }
        return event;
      },
    });
    return Sentry;
  }).catch((error) => { monitoring = undefined; throw error; });
  return monitoring;
}
export function initializeMonitoring() { void loadMonitoring()?.catch(() => {}); }
export function captureCrash(error: Error) { void loadMonitoring()?.then((Sentry) => Sentry.captureException(error)).catch(() => {}); }
