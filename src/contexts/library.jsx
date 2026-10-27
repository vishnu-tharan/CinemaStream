import {
  collection,
  doc,
  getDocFromServer,
  getDocsFromServer,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { emptyRecord, isMovieId, validRecord } from '../lib/library';
import { useAuth } from './auth';
const LibraryContext = createContext(null);
export function LibraryProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.uid;
  const [view, setView] = useState({ userId: '', entries: {}, ready: false });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);
  const writing = useRef(false);
  useEffect(() => {
    let cancelled = false;
    setError('');
    setView({ userId: userId ?? '', entries: {}, ready: false });
    if (!userId) return;
    async function loadCollection() {
      try {
        const snapshot = await getDocsFromServer(collection(db, 'users', userId, 'library'));
        const entries = {};
        snapshot.forEach((document) => {
          const data = document.data();
          const record = {
            favorite: data.favorite,
            status: data.status,
            updatedAt: data.updatedAt?.toMillis?.() ?? 0,
          };
          if (isMovieId(document.id) && validRecord(record)) entries[document.id] = record;
        });
        if (!cancelled) setView({ userId: userId, entries, ready: true });
      } catch {
        if (!cancelled)
          setError('Unable to load your collection. Check your connection and retry.');
      }
    }
    void loadCollection();
    return () => {
      cancelled = true;
    };
  }, [userId, reload]);
  async function saveFilm(id, changes) {
    if (!userId || view.userId !== userId || !view.ready || writing.current || !isMovieId(id))
      return;
    const record = { ...(view.entries[id] ?? emptyRecord()), ...changes, updatedAt: Date.now() };
    if (!validRecord(record)) return;
    writing.current = true;
    setSaving(true);
    setError('');
    try {
      // Confirm the connection before submitting an online collection change.
      await getDocFromServer(doc(db, 'users', userId, 'library', id));
      if (auth.currentUser?.uid !== userId) return;
      await setDoc(doc(db, 'users', userId, 'library', id), {
        favorite: record.favorite,
        status: record.status,
        updatedAt: serverTimestamp(),
      });
      if (auth.currentUser?.uid === userId) {
        setView((current) =>
          current.userId === userId
            ? { ...current, entries: { ...current.entries, [id]: record } }
            : current,
        );
      }
    } catch {
      if (auth.currentUser?.uid === userId)
        setError('Unable to save this change. Check your connection and try again.');
    } finally {
      writing.current = false;
      setSaving(false);
    }
  }
  const entries = view.userId === userId ? view.entries : {};
  const value = {
    entries,
    ready: view.userId === userId && view.ready,
    saving,
    error,
    retry: () => setReload((count) => count + 1),
    toggleFavorite: (id) => saveFilm(id, { favorite: !entries[id]?.favorite }),
    setStatus: (id, status) => saveFilm(id, { status }),
  };
  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}
export function useLibrary() {
  const library = useContext(LibraryContext);
  if (!library) throw new Error('useLibrary must be used inside LibraryProvider.');
  return library;
}
