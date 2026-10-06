const fs = require('node:fs');
const { before, after, beforeEach, test } = require('node:test');
const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc, Timestamp, updateDoc } = require('firebase/firestore');
let environment;
before(async () => {
  environment = await initializeTestEnvironment({ projectId: 'demo-cinemastream', firestore: { host: '127.0.0.1', port: 8086, rules: fs.readFileSync('firestore.rules', 'utf8') } });
});
beforeEach(async () => { await environment.clearFirestore(); });
after(async () => { if (environment) await environment.cleanup(); });
const owner = () => environment.authenticatedContext('alice', { email: 'alice@example.test' }).firestore();
const other = () => environment.authenticatedContext('bob', { email: 'bob@example.test' }).firestore();
const profile = () => ({ name: 'Alice', email: 'alice@example.test', createdAt: serverTimestamp() });
const record = () => ({ favorite: true, status: 'watchlist', updatedAt: serverTimestamp() });
test('unauthenticated clients cannot read or write private records', async () => {
  const db = environment.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(db, 'users/alice')));
  await assertFails(setDoc(doc(db, 'users/alice'), profile()));
  await assertFails(getDocs(collection(db, 'users/alice/library')));
});
test('owner can create and read their profile', async () => {
  const db = owner();
  await assertSucceeds(setDoc(doc(db, 'users/alice'), profile()));
  await assertSucceeds(getDoc(doc(db, 'users/alice')));
});
test('another account cannot read, modify, or delete a profile', async () => {
  await assertSucceeds(setDoc(doc(owner(), 'users/alice'), profile()));
  await assertFails(getDoc(doc(other(), 'users/alice')));
  await assertFails(updateDoc(doc(other(), 'users/alice'), { name: 'Changed' }));
  await assertFails(deleteDoc(doc(other(), 'users/alice')));
});
test('profile rejects extra role fields, spoofed email, and client timestamps', async () => {
  await assertFails(setDoc(doc(owner(), 'users/alice'), { ...profile(), role: 'admin' }));
  await assertFails(setDoc(doc(owner(), 'users/alice'), { ...profile(), email: 'bob@example.test' }));
  await assertFails(setDoc(doc(owner(), 'users/alice'), { ...profile(), createdAt: Timestamp.fromMillis(0) }));
});
test('profile update preserves creation time', async () => {
  const db = owner();
  await assertSucceeds(setDoc(doc(db, 'users/alice'), profile()));
  await assertSucceeds(updateDoc(doc(db, 'users/alice'), { name: 'New name' }));
  await assertFails(updateDoc(doc(db, 'users/alice'), { createdAt: Timestamp.fromMillis(0) }));
});
test('owner can read, write, and remove library entries', async () => {
  const db = owner();
  await assertSucceeds(setDoc(doc(db, 'users/alice/library/1'), record()));
  await assertSucceeds(updateDoc(doc(db, 'users/alice/library/1'), { status: 'watched', updatedAt: serverTimestamp() }));
  await assertSucceeds(getDocs(collection(db, 'users/alice/library')));
  await assertSucceeds(deleteDoc(doc(db, 'users/alice/library/1')));
});
test('library is isolated between accounts', async () => {
  await assertSucceeds(setDoc(doc(owner(), 'users/alice/library/1'), record()));
  await assertFails(getDoc(doc(other(), 'users/alice/library/1')));
  await assertFails(getDocs(collection(other(), 'users/alice/library')));
  await assertFails(setDoc(doc(other(), 'users/alice/library/1'), record()));
  await assertFails(deleteDoc(doc(other(), 'users/alice/library/1')));
});
test('library validates IDs, status, booleans, timestamps, and fields', async () => {
  await assertFails(setDoc(doc(owner(), 'users/alice/library/99'), record()));
  await assertFails(setDoc(doc(owner(), 'users/alice/library/1'), { ...record(), status: 'admin' }));
  await assertFails(setDoc(doc(owner(), 'users/alice/library/1'), { ...record(), favorite: 'true' }));
  await assertFails(setDoc(doc(owner(), 'users/alice/library/1'), { ...record(), updatedAt: Timestamp.fromMillis(0) }));
  await assertFails(setDoc(doc(owner(), 'users/alice/library/1'), { ...record(), email: 'private' }));
});
test('legacy favorites remain readable only by the owner', async () => {
  await assertSucceeds(setDoc(doc(owner(), 'users/alice/favorites/1'), { savedAt: serverTimestamp() }));
  await assertSucceeds(getDocs(collection(owner(), 'users/alice/favorites')));
  await assertFails(getDocs(collection(other(), 'users/alice/favorites')));
});
test('unknown collections and listing every user are denied', async () => {
  await assertFails(getDocs(collection(owner(), 'users')));
  await assertFails(setDoc(doc(owner(), 'admin/config'), { enabled: true }));
});
