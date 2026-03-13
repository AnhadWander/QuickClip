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
    console.warn("[FirebaseAdmin] FIREBASE_SERVICE_ACCOUNT_KEY is missing from environment (undefined or empty).");
    return null;
  }
  
  console.log(`[FirebaseAdmin] Found FIREBASE_SERVICE_ACCOUNT_KEY in environment (length: ${key.length})`);
  
  try {
    const decoded = Buffer.from(key, "base64").toString("utf-8");
    console.log("[FirebaseAdmin] Successfully decoded base64 key.");
    try {
      const parsed = JSON.parse(decoded);
      console.log(`[FirebaseAdmin] Successfully parsed service account for project: ${parsed.project_id}`);
      return parsed;
    } catch (parseError) {
      console.error("[FirebaseAdmin] JSON parse error: The decoded string is not valid JSON.");
      return null;
    }
  } catch (decodeError) {
    console.error("[FirebaseAdmin] Failed to decode base64 FIREBASE_SERVICE_ACCOUNT_KEY");
    return null;
  }
}

function initAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  console.log("[FirebaseAdmin] Initializing SDK...");
  const serviceAccount = getServiceAccount();

  if (!serviceAccount) {
    const isMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project";
    
    console.warn(`[FirebaseAdmin] Initializing WITHOUT credentials (Project: ${projectId}, Mock: ${isMock})`);
    
    // If mock is false but credentials are missing, we should probably warn louder
    if (!isMock) {
      console.error("[FirebaseAdmin] CRITICAL: FIREBASE_SERVICE_ACCOUNT_KEY is missing but NEXT_PUBLIC_USE_MOCK is false. Writes will fail.");
    }

    return admin.initializeApp({
      projectId: projectId,
    });
  }

  console.log(`[FirebaseAdmin] Initializing for project: ${serviceAccount.project_id}`);
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: serviceAccount.project_id
  });
}

const adminApp = initAdmin();

export const adminAuth = admin.auth(adminApp);
export const adminDb = admin.firestore(adminApp);
export default adminApp;
