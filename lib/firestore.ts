import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  doc, 
  deleteDoc, 
  getDoc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";
import type { HistoryItem, SummaryResult } from "./types";

const COLLECTION = "users";
const SUBCOLLECTION = "history";

// ─── Save ──────────────────────────────────────────────────────────────────────

/**
 * Save a new summary result to a user's history using the Client SDK.
 * Returns the newly created Firestore document ID.
 */
export async function saveHistory(
  userId: string,
  result: SummaryResult
): Promise<string> {
  const historyRef = collection(db, COLLECTION, userId, SUBCOLLECTION);

  const docData = {
    userId,
    videoUrl: result.videoUrl,
    videoTitle: result.videoTitle,
    thumbnailUrl: result.thumbnailUrl,
    createdAt: serverTimestamp(),
    summaryLength: result.summaryLength,
    overallSummary: result.overallSummary,
    keyPoints: result.keyPoints,
    timestamps: result.timestamps,
    quiz: result.quiz,
  };

  const docRef = await addDoc(historyRef, docData);
  return docRef.id;
}

// ─── Load ──────────────────────────────────────────────────────────────────────

/**
 * Load all history items for a user, ordered by most recent first.
 */
export async function getHistory(userId: string): Promise<HistoryItem[]> {
  const historyRef = collection(db, COLLECTION, userId, SUBCOLLECTION);
  const q = query(
    historyRef,
    orderBy("createdAt", "desc"),
    limit(50)
  );

  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((snap) => {
    const data = snap.data();
    // Convert Firestore Timestamp to ISO string for compatibility with existing UI
    let createdAt = new Date().toISOString();
    if (data.createdAt instanceof Timestamp) {
      createdAt = data.createdAt.toDate().toISOString();
    }

    return {
      id: snap.id,
      ...data,
      createdAt,
    } as HistoryItem;
  });
}

// ─── Delete ────────────────────────────────────────────────────────────────────

/**
 * Delete a single history item for a user.
 */
export async function deleteHistory(
  userId: string,
  historyId: string
): Promise<void> {
  const docRef = doc(db, COLLECTION, userId, SUBCOLLECTION, historyId);
  await deleteDoc(docRef);
}
