/**
 * app/api/history/[id]/route.ts
 * DELETE /api/history/[id] – deletes a specific history item for the authenticated user
 */

import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import { deleteHistory } from "@/lib/firestore";

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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await verifyToken(req);

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, error: "History ID is required." },
      { status: 400 }
    );
  }

  try {
    await deleteHistory(userId, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = (err as Error).message;
    const status = message.includes("Unauthorized") ? 403 : message.includes("not found") ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
