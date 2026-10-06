import { getApps, getApp, initializeApp } from "firebase/app";
import { getAuth, initializeAuth, Persistence, connectAuthEmulator } from "firebase/auth";
import * as FirebaseAuth from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

// Public Firebase client configuration; access is controlled by server rules.
const useEmulators = __DEV__ && process.env.EXPO_PUBLIC_USE_EMULATORS === "1";
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Metro resolves the native Firebase entry, whose extra persistence export
// is omitted from the package's shared web TypeScript declarations.
const nativeAuth = FirebaseAuth as typeof FirebaseAuth & {
  getReactNativePersistence(storage: typeof AsyncStorage): Persistence;
};
if (!useEmulators && Object.values(firebaseConfig).some((value) => !value)) {
  throw new Error('Firebase configuration is missing. Copy .env.example to .env.local, fill in your Firebase client configuration, and restart Expo.');
}
const existingApp = getApps().length > 0;
const app = existingApp ? getApp() : initializeApp(useEmulators ? { ...firebaseConfig, apiKey: "demo-key", projectId: "demo-cinemastream", authDomain: "demo-cinemastream.firebaseapp.com" } : firebaseConfig);
export const auth = Platform.OS === "web" || existingApp
  ? getAuth(app)
  : initializeAuth(app, { persistence: nativeAuth.getReactNativePersistence(AsyncStorage) });
export const db = getFirestore(app);
if (useEmulators && !existingApp) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8086);
}
