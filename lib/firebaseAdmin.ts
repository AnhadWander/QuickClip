/**
 * lib/firebaseAdmin.ts
 * Server-side Firebase Admin SDK initialization.
 * NEVER import this file in client-side code.
 *
 * Expects FIREBASE_SERVICE_ACCOUNT_KEY env var as a base64-encoded
 * JSON string of your Firebase service account credentials.
 */

import * as admin from "firebase-admin";

function getServiceAccount() {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!key) {
    // Return null – API routes will handle missing config gracefully
    return null;
  }
  try {
    const decoded = Buffer.from(key, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    console.error("[FirebaseAdmin] Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY");
    return null;
  }
}

function initAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const serviceAccount = getServiceAccount();

  if (!serviceAccount) {
    // Initialize with no credentials – useful for NEXT_PUBLIC_USE_MOCK=true
    return admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project",
    });
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

const adminApp = initAdmin();

export const adminAuth = admin.auth(adminApp);
export const adminDb = admin.firestore(adminApp);
export default adminApp;
