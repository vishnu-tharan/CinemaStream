import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { finishProfile, pendingProfileKey } from '../lib/profile';
import { useNetwork } from '../hooks/use-network';
import { useAuth } from './auth';

const SetupContext = createContext({ error: '', loading: false, retry: async () => {} });
export function ProfileSetupProvider({ children }: React.PropsWithChildren) {
  const { user, refresh } = useAuth();
  const { offline } = useNetwork();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);
  const uid = user?.uid;
  useEffect(() => {
    let disposed = false;
    setError('');
    if (!user || offline) return;
    void (async () => {
      try {
        const pending = await AsyncStorage.getItem(pendingProfileKey(user.uid));
        // New signup supplies the name itself; do not race it with a fallback name.
        if (disposed || (!pending && !user.displayName)) return;
        await finishProfile(user);
      } catch { if (!disposed) setError('Account setup needs a retry. Your sign-in is safe.'); }
    })();
    return () => { disposed = true; };
    // Profile repair is scoped to the account and reconnection, not every token refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, offline]);
  async function retry() {
    if (!user || busy.current) return;
    busy.current = true; setLoading(true); setError('');
    try { await finishProfile(user); await refresh(); }
    catch { setError('Unable to finish setup. Check your connection and retry.'); }
    finally { busy.current = false; setLoading(false); }
  }
  return <SetupContext.Provider value={{ error, loading, retry }}>{children}</SetupContext.Provider>;
}
export const useProfileSetup = () => useContext(SetupContext);
