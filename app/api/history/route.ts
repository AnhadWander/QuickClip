/**
 * app/api/history/route.ts
 * GET  /api/history  – load user history (requires Firebase Auth token)
 * POST /api/history  – save a new history item (requires Firebase Auth token)
 */

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import { getHistory, saveHistory } from "@/lib/firestore";
import type { SummaryResult } from "@/lib/types";

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function verifyToken(req: NextRequest): Promise<string | null> {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;

    const token = authHeader.slice(7);
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

// ─── GET ───────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const userId = await verifyToken(req);

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Please sign in to view history." },
      { status: 401 }
    );
  }

  try {
    const history = await getHistory(userId);
    return NextResponse.json({ success: true, data: history });
  } catch (err) {
    console.error("[/api/history GET] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load history." },
      { status: 500 }
    );
  }
}

// ─── POST ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const userId = await verifyToken(req);

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Please sign in to save history." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const result: SummaryResult = body.result;

    if (!result || !result.videoUrl || !result.overallSummary) {
      return NextResponse.json(
        { success: false, error: "Invalid history data." },
        { status: 400 }
      );
    }

    const historyId = await saveHistory(userId, result);
    return NextResponse.json({ success: true, data: { historyId } });
  } catch (err) {
    console.error("[/api/history POST] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save history." },
      { status: 500 }
    );
  }
}
