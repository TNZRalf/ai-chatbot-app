import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  enableIndexedDbPersistence,
  type Firestore 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize services
const auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage = getStorage(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Enable persistence for Firestore
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((error: { code: string }) => {
    if (error.code === 'failed-precondition') {
      console.log('Persistence failed - multiple tabs open');
    } else if (error.code === 'unimplemented') {
      console.log('Persistence not available in this browser');
    }
  });
}

export { auth, db, storage, analytics };
