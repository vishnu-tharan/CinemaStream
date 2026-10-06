import { onIdTokenChanged, User } from 'firebase/auth';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../lib/firebase';

const guestKey = 'cinemastream:guest';
const AuthContext = createContext<{ user: User | null; guest: boolean; loading: boolean; refresh: () => Promise<void>; enterGuest: () => void; exitGuest: () => void }>({ user: null, guest: false, loading: true, refresh: async () => {}, enterGuest: () => {}, exitGuest: () => {} });
export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [guest, setGuest] = useState(false);
  const [guestLoading, setGuestLoading] = useState(true);
  useEffect(() => {
    void AsyncStorage.getItem(guestKey).then((value) => { if (!auth.currentUser) setGuest(value === '1'); }).catch(() => {}).finally(() => setGuestLoading(false));
  }, []);
  useEffect(() => onIdTokenChanged(auth, (nextUser) => {
    setUser(nextUser);
    if (nextUser) { setGuest(false); void AsyncStorage.removeItem(guestKey).catch(() => {}); }
    setRevision((value) => value + 1);
    setLoading(false);
  }), []);
  const refresh = useCallback(async () => {
    if (auth.currentUser) { await auth.currentUser.reload(); await auth.currentUser.getIdToken(true); }
    setUser(auth.currentUser);
    setRevision((value) => value + 1);
  }, []);
  const enterGuest = useCallback(() => { if (auth.currentUser) return; setGuest(true); void AsyncStorage.setItem(guestKey, '1').catch(() => {}); }, []);
  const exitGuest = useCallback(() => { setGuest(false); void AsyncStorage.removeItem(guestKey).catch(() => {}); }, []);
  const value = useMemo(() => ({ user, guest: !user && guest, loading: loading || guestLoading, refresh, enterGuest, exitGuest, revision }), [user, guest, loading, guestLoading, refresh, enterGuest, exitGuest, revision]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
