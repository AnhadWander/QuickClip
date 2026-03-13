/**
 * lib/firestore.ts
 * Server-side Firestore operations for user history.
 * Uses Firebase Admin SDK – NEVER import this on the client.
 *
 * Collection structure:  users/{userId}/history/{historyId}
 */

import { adminDb } from "./firebaseAdmin";
import type { HistoryItem, SummaryResult } from "./types";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION = "users";
const SUBCOLLECTION = "history";

// ─── Save ──────────────────────────────────────────────────────────────────────

/**
 * Save a new summary result to a user's history.
 * Returns the newly created Firestore document ID.
 */
export async function saveHistory(
  userId: string,
  result: SummaryResult
): Promise<string> {
  const historyRef = adminDb
    .collection(COLLECTION)
    .doc(userId)
    .collection(SUBCOLLECTION);

  const docData: Omit<HistoryItem, "id"> = {
    userId,
    videoUrl: result.videoUrl,
    videoTitle: result.videoTitle,
    thumbnailUrl: result.thumbnailUrl,
    createdAt: new Date().toISOString(),
    summaryLength: result.summaryLength,
    overallSummary: result.overallSummary,
    keyPoints: result.keyPoints,
    timestamps: result.timestamps,
    quiz: result.quiz,
  };

  const docRef = await historyRef.add(docData);
  return docRef.id;
}

// ─── Load ──────────────────────────────────────────────────────────────────────

/**
 * Load all history items for a user, ordered by most recent first.
 */
export async function getHistory(userId: string): Promise<HistoryItem[]> {
  const snapshot = await adminDb
    .collection(COLLECTION)
    .doc(userId)
    .collection(SUBCOLLECTION)
    .orderBy("createdAt", "desc")
    .limit(50) // Safety limit
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<HistoryItem, "id">),
  }));
}

// ─── Delete ────────────────────────────────────────────────────────────────────

/**
 * Delete a single history item for a user.
 * Verifies the document belongs to the user before deleting.
 */
export async function deleteHistory(
  userId: string,
  historyId: string
): Promise<void> {
  const docRef = adminDb
    .collection(COLLECTION)
    .doc(userId)
    .collection(SUBCOLLECTION)
    .doc(historyId);

  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error("History item not found.");
  }

  const data = doc.data();
  if (data?.userId !== userId) {
    throw new Error("Unauthorized: this history item does not belong to you.");
  }

  await docRef.delete();
}

// ─── Stub for FieldValue (used in future batching) ─────────────────────────────

export { FieldValue };
