import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDlqc0e9vIuEMeBulCqe7k771yo17ZeRa0",
  authDomain: "occ-ai-3eb6c.firebaseapp.com",
  projectId: "occ-ai-3eb6c",
  storageBucket: "occ-ai-3eb6c.firebasestorage.app",
  messagingSenderId: "444580031060",
  appId: "1:444580031060:web:47970d38351e5cb7a0dbc1",
  measurementId: "G-E17V7C2SX3"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
