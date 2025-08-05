import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyBhV4POZ2p_JVX2MBw-I_iCksxWfU-dmUM",
  authDomain: "yuconnect2-170c9.firebaseapp.com",
  projectId: "yuconnect2-170c9",
  storageBucket: "yuconnect2-170c9.firebasestorage.app",
  messagingSenderId: "914951198011",
  appId: "1:914951198011:web:826e5243868228cfa6d31e",
  measurementId: "G-XXV25PMJE2"
};
// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db =getFirestore(app);

export { app, auth,db };
