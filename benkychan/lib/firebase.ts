import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA34L0GvY3LCQQ_dcbJN4rYBkB4FPBu4GQ",
  authDomain: "benkychan-ebe0e.firebaseapp.com",
  projectId: "benkychan-ebe0e",
  storageBucket: "benkychan-ebe0e.firebasestorage.app",
  messagingSenderId: "316939548060",
  appId: "1:316939548060:web:8b10b1b5db475b890a4459",
  measurementId: "G-41SF2PNNX8",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
