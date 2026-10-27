const fs = require('node:fs');
const { before, after, beforeEach, test } = require('node:test');
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require('@firebase/rules-unit-testing');
const {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} = require('firebase/firestore');
let environment;

before(async () => {
  environment = await initializeTestEnvironment({
    projectId: 'demo-cinemastream',
    firestore: {
      host: '127.0.0.1',
      port: 8086,
      rules: fs.readFileSync('firestore.rules', 'utf8').replace(/^\uFEFF/, ''),
    },
  });
});
beforeEach(async () => {
  await environment.clearFirestore();
});
after(async () => {
  if (environment) await environment.cleanup();
});

function owner() {
  return environment.authenticatedContext('alice').firestore();
}
function other() {
  return environment.authenticatedContext('bob').firestore();
}
function record() {
  return { favorite: true, status: 'watchlist', updatedAt: serverTimestamp() };
}

test('guests cannot read or write collections', async () => {
  const db = environment.unauthenticatedContext().firestore();
  await assertFails(getDocs(collection(db, 'users/alice/library')));
  await assertFails(setDoc(doc(db, 'users/alice/library/1'), record()));
});
test('an owner can save, read, update and remove a collection record', async () => {
  const db = owner();
  const reference = doc(db, 'users/alice/library/1');
  await assertSucceeds(setDoc(reference, record()));
  await assertSucceeds(getDoc(reference));
  await assertSucceeds(updateDoc(reference, { status: 'watched', updatedAt: serverTimestamp() }));
  await assertSucceeds(getDocs(collection(db, 'users/alice/library')));
  await assertSucceeds(deleteDoc(reference));
});
test('another account cannot read or change a collection', async () => {
  await assertSucceeds(setDoc(doc(owner(), 'users/alice/library/1'), record()));
  const db = other();
  await assertFails(getDoc(doc(db, 'users/alice/library/1')));
  await assertFails(getDocs(collection(db, 'users/alice/library')));
  await assertFails(setDoc(doc(db, 'users/alice/library/1'), record()));
  await assertFails(deleteDoc(doc(db, 'users/alice/library/1')));
});
test('writes reject invalid IDs and values', async () => {
  const db = owner();
  await assertFails(setDoc(doc(db, 'users/alice/library/21'), record()));
  await assertFails(setDoc(doc(db, 'users/alice/library/01'), record()));
  await assertFails(setDoc(doc(db, 'users/alice/library/1'), { ...record(), favorite: 'true' }));
  await assertFails(setDoc(doc(db, 'users/alice/library/1'), { ...record(), status: 'admin' }));
  await assertFails(
    setDoc(doc(db, 'users/alice/library/1'), { ...record(), updatedAt: Timestamp.fromMillis(0) }),
  );
  await assertFails(setDoc(doc(db, 'users/alice/library/1'), { favorite: true }));
  await assertFails(setDoc(doc(db, 'users/alice/library/1'), { ...record(), role: 'admin' }));
});
test('all catalog IDs have the same owner-only permissions', async () => {
  for (let id = 1; id <= 20; id++) {
    await assertSucceeds(setDoc(doc(owner(), `users/alice/library/${id}`), record()));
  }
  await assertFails(getDoc(doc(other(), 'users/alice/library/20')));
});
test('unlisted database paths are denied', async () => {
  await assertFails(setDoc(doc(owner(), 'settings/site'), { enabled: true }));
  await assertFails(setDoc(doc(owner(), 'users/alice'), { role: 'admin' }));
});
