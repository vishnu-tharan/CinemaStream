import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { decodeLibraryCache, emptyRecord, isMovieId, LibraryRecord, LibraryRecords, mergeLibrary, nextDurableWrite, PendingRecord, WatchStatus } from '../lib/library';
import { useNetwork } from '../hooks/use-network';
import { useAuth } from './auth';

type Session = { uid: string; disposed: boolean; records: LibraryRecords; legacy: string[]; pending: Record<string, PendingRecord>; durable: Record<string, number>; revision: number; flushing: boolean; loaded: boolean; writes: Promise<void>; lastQueued?: string };
type LibraryValue = { entries: LibraryRecords; ready: boolean; offline: boolean; error: string; pendingCount: number; retry: () => void; toggleFavorite: (id: string) => Promise<void>; setStatus: (id: string, status: WatchStatus) => Promise<void> };
const LibraryContext = createContext<LibraryValue>({ entries: {}, ready: false, offline: false, error: '', pendingCount: 0, retry: () => {}, toggleFavorite: async () => {}, setStatus: async () => {} });

export function LibraryProvider({ children }: React.PropsWithChildren) {
  const { user } = useAuth();
  const uid = user?.uid;
  const { offline } = useNetwork();
  const offlineRef = useRef(offline);
  offlineRef.current = offline;
  const sessionRef = useRef<Session | null>(null);
  const [view, setView] = useState({ uid: '', entries: {} as LibraryRecords, ready: false, pendingCount: 0 });
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  const publish = useCallback((session: Session) => {
    if (session.disposed) return;
    setView({ uid: session.uid, entries: mergeLibrary(session.records, session.legacy, session.pending), ready: session.loaded, pendingCount: Object.keys(session.pending).length });
  }, []);
  const persist = useCallback((session: Session) => {
    const data = JSON.stringify({ version: 1, records: mergeLibrary(session.records, session.legacy, {}), pending: session.pending });
    if (data === session.lastQueued) return session.writes;
    session.lastQueued = data;
    session.writes = session.writes.catch(() => {}).then(() => AsyncStorage.setItem('cinemastream:library:' + session.uid, data)).catch((error) => { session.lastQueued = undefined; throw error; });
    return session.writes;
  }, []);
  const flush = useCallback(async (session: Session) => {
    if (session.flushing || session.disposed || !session.loaded || offlineRef.current) return;
    session.flushing = true;
    try {
      while (Object.keys(session.pending).length) {
        // Never send a newer tap until its device write has succeeded.
        const next = nextDurableWrite(session.pending, session.durable);
        if (!next) break;
        const [id, record] = next;
        if (session.disposed || offlineRef.current || auth.currentUser?.uid !== session.uid) break;
        await setDoc(doc(db, 'users', session.uid, 'library', id), { favorite: record.favorite, status: record.status, updatedAt: serverTimestamp() });
        if (session.disposed) break;
        // A newer tap on the same film must survive an older write completing.
        if (session.pending[id]?.revision === record.revision) {
          session.records[id] = record;
          delete session.pending[id];
          delete session.durable[id];
        }
        await persist(session);
        publish(session);
      }
      if (!session.disposed) setError('');
    } catch {
      if (!session.disposed) setError('Cloud sync is unavailable. Your changes are saved on this device.');
    } finally {
      session.flushing = false;
    }
  }, [persist, publish]);

  useEffect(() => {
    setError('');
    if (!uid) { sessionRef.current = null; setView({ uid: '', entries: {}, ready: false, pendingCount: 0 }); return; }
    const previousSession = sessionRef.current;
    const session: Session = { uid, disposed: false, records: {}, legacy: [], pending: {}, durable: {}, revision: Date.now(), flushing: false, loaded: false, writes: Promise.resolve() };
    sessionRef.current = session;
    let unsubscribeLibrary = () => {};
    let unsubscribeLegacy = () => {};
    async function start() {
      try {
        // A retry must wait for this account's previous queued device writes.
        if (previousSession && previousSession.uid === uid) await previousSession.writes.catch(() => {});
        const cache = decodeLibraryCache(await AsyncStorage.getItem('cinemastream:library:' + uid));
        if (session.disposed) return;
        session.records = cache.records;
        session.pending = cache.pending;
        session.durable = Object.fromEntries(Object.entries(cache.pending).map(([id, record]) => [id, record.revision]));
        session.revision = Math.max(session.revision, ...Object.values(cache.pending).map((r) => r.revision));
      } catch {
        if (!session.disposed) setError('Local storage is unavailable. Please retry before changing your collection.');
        return;
      }
      if (session.disposed) return;
      session.loaded = true;
      publish(session);
      const onError = () => { if (!session.disposed) setError('Cloud sync is unavailable. Your collection is still available on this device.'); };
      unsubscribeLibrary = onSnapshot(collection(db, 'users', uid!, 'library'), { includeMetadataChanges: true }, (snapshot) => {
        if (session.disposed) return;
        if (!snapshot.metadata.fromCache || !snapshot.empty) {
          const records: LibraryRecords = {};
          snapshot.forEach((entry) => {
            const data = entry.data();
            if (isMovieId(entry.id) && typeof data.favorite === 'boolean' && ['none', 'watchlist', 'watched'].includes(data.status)) {
              records[entry.id] = { favorite: data.favorite, status: data.status, updatedAt: data.updatedAt?.toMillis?.() || 0 };
            }
          });
          session.records = records;
        }
        publish(session);
        void persist(session).catch(onError);
      }, onError);
      unsubscribeLegacy = onSnapshot(collection(db, 'users', uid!, 'favorites'), (snapshot) => {
        if (session.disposed) return;
        session.legacy = snapshot.docs.map((entry) => entry.id).filter(isMovieId);
        publish(session);
        void persist(session).catch(onError);
      }, onError);
      await flush(session);
    }
    void start();
    return () => { session.disposed = true; unsubscribeLibrary(); unsubscribeLegacy(); };
  }, [uid, attempt, flush, persist, publish]);

  useEffect(() => {
    if (!offline && sessionRef.current) void flush(sessionRef.current);
  }, [offline, flush]);

  const change = useCallback(async (id: string, patch: Partial<Pick<LibraryRecord, 'favorite' | 'status'>>) => {
    const session = sessionRef.current;
    if (!session || session.disposed || !session.loaded || !isMovieId(id) || auth.currentUser?.uid !== session.uid) return;
    const previous = session.pending[id];
    const current = mergeLibrary(session.records, session.legacy, session.pending)[id] || emptyRecord();
    const revision = ++session.revision;
    session.pending[id] = { ...current, ...patch, updatedAt: Date.now(), revision };
    try { await persist(session); }
    catch {
      if (session.pending[id]?.revision === revision) {
        if (previous) session.pending[id] = previous; else delete session.pending[id];
      }
      if (!session.disposed) setError('Unable to save on this device. Please retry.');
      return;
    }
    if (session.pending[id]?.revision === revision) session.durable[id] = revision;
    publish(session);
    void flush(session);
  }, [persist, publish, flush]);
  const entries = view.uid === uid ? view.entries : {};
  return <LibraryContext.Provider value={{ entries, ready: view.uid === uid && view.ready, offline, error, pendingCount: view.uid === uid ? view.pendingCount : 0, retry: () => setAttempt((n) => n + 1), toggleFavorite: (id) => change(id, { favorite: !(mergeLibrary(sessionRef.current?.records || {}, sessionRef.current?.legacy || [], sessionRef.current?.pending || {})[id]?.favorite) }), setStatus: (id, status) => change(id, { status }) }}>{children}</LibraryContext.Provider>;
}
export const useLibrary = () => useContext(LibraryContext);
