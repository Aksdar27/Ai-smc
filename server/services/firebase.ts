import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      console.log("Firebase initialized");
    } else {
      console.warn("GOOGLE_APPLICATION_CREDENTIALS is not set. Firebase is not initialized.");
    }
  } catch (err) {
    console.error("Firebase initialization error:", err);
  }
}

export const db = admin.apps.length ? admin.firestore() : null;
