import { initializeApp } from "firebase/app";
    import { getAuth } from "firebase/auth";
    import { getFirestore } from "firebase/firestore";

    // REPLACE WITH YOUR REAL FIREBASE KEYS
  const firebaseConfig = {
  apiKey: "AIzaSyAa6dFlDR8E-2FDkFW_0P0_5YHJU-IOGYE",
  authDomain: "cinema-95a89.firebaseapp.com",
  projectId: "cinema-95a89",
  storageBucket: "cinema-95a89.firebasestorage.app",
  messagingSenderId: "683782963288",
  appId: "1:683782963288:web:87945878f155e1ba48ca2d"
};

    const app = initializeApp(firebaseConfig);
    export const auth = getAuth(app);
    export const db = getFirestore(app);