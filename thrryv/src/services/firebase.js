import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = { apiKey: "AIzaSyAxKiMC5Piz-PFsuWSTW3a2_PUvPiL0t9o",
  authDomain: "thrryv.firebaseapp.com",
  projectId: "thrryv",
  storageBucket: "thrryv.firebasestorage.app",
  messagingSenderId: "490957817004",
  appId: "1:490957817004:web:29938f8aa09e79a1a34b09",
  measurementId: "G-JYN2NGDZTK" }; // Paste keys here
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);