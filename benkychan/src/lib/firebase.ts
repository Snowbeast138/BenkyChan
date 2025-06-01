import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA34L0GvY3LCQQ_dcbJN4rYBkB4FPBu4GQ",
  authDomain: "benkychan-ebe0e.firebaseapp.com",
  projectId: "benkychan-ebe0e",
  storageBucket: "benkychan-ebe0e.firebasestorage.app",
  messagingSenderId: "316939548060",
  appId: "1:316939548060:web:e324340c0b96d5d70a4459",
  measurementId: "G-58VYS1X5Y6",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
