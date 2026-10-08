import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBwnp-nFeS-ZBQsoCeiVmSdq6hGPO-ASzg",
  authDomain: "mj-properties-50378.firebaseapp.com",
  projectId: "mj-properties-50378",
  storageBucket: "mj-properties-50378.firebasestorage.app",
  messagingSenderId: "52595137283",
  appId: "1:52595137283:web:be54c0576f7af1f7872736",
  measurementId: "G-SX1H11JJTC"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Authentication and Firestore services
export const auth = getAuth(app);
export const db = getFirestore(app);
