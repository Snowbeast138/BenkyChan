import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (!process.env.FIREBASE_ADMIN_PROJECT_ID) {
  throw new Error("Firebase Admin config missing");
}

const adminApp = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

export const adminAuth = getAuth(adminApp);
