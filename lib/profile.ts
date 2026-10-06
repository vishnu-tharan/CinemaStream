import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateProfile, User } from 'firebase/auth';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const pendingProfileKey = (uid: string) => 'cinemastream:pending-profile:' + uid;

export async function finishProfile(user: User, requestedName?: string) {
  const stored = await AsyncStorage.getItem(pendingProfileKey(user.uid));
  const name = (requestedName || stored || user.displayName || 'Movie lover').trim().slice(0, 100) || 'Movie lover';
  if (user.displayName !== name) await updateProfile(user, { displayName: name });
  const reference = doc(db, 'users', user.uid);
  await runTransaction(db, async (transaction) => {
    const existing = await transaction.get(reference);
    if (existing.exists() && existing.data().name === name && existing.data().email === user.email) return;
    transaction.set(reference, { name, email: user.email, createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp() });
  });
  await AsyncStorage.removeItem(pendingProfileKey(user.uid));
}
