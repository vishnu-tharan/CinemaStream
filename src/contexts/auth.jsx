import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
const guestKey = 'cinemastream:guest';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [account, setAccount] = useState({
    user: null,
    loading: true,
  });
  const [guest, setGuest] = useState(false);
  const [guestLoading, setGuestLoading] = useState(true);
  useEffect(() => {
    void AsyncStorage.getItem(guestKey)
      .then((value) => {
        if (!auth.currentUser) setGuest(value === '1');
      })
      .catch(() => {})
      .finally(() => setGuestLoading(false));
    return onAuthStateChanged(auth, (user) => {
      setAccount({ user, loading: false });
      if (user) {
        setGuest(false);
        void AsyncStorage.removeItem(guestKey).catch(() => {});
      }
    });
  }, []);
  async function refresh() {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      await auth.currentUser.getIdToken(true);
    }
    setAccount({ user: auth.currentUser, loading: false });
  }
  function enterGuest() {
    if (auth.currentUser) return;
    setGuest(true);
    void AsyncStorage.setItem(guestKey, '1').catch(() => {});
  }
  function exitGuest() {
    setGuest(false);
    void AsyncStorage.removeItem(guestKey).catch(() => {});
  }
  const value = {
    user: account.user,
    guest: !account.user && guest,
    loading: account.loading || guestLoading,
    refresh,
    enterGuest,
    exitGuest,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const account = useContext(AuthContext);
  if (!account) throw new Error('useAuth must be used inside AuthProvider.');
  return account;
}
