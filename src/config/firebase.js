import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDDPecUpcJ8TPSFwltJIL8aytzLXyTlcNc",
  authDomain: "ai-chatbot-app-13fe7.firebaseapp.com",
  projectId: "ai-chatbot-app-13fe7",
  storageBucket: "ai-chatbot-app-13fe7.firebasestorage.app",
  messagingSenderId: "454855882708",
  appId: "1:454855882708:web:4e627eb0c675636e1fc841",
  measurementId: "G-V86PTNDSVV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
