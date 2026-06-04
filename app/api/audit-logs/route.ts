import { NextRequest, NextResponse } from "next/server";
import { hasDatabase, query } from "@/lib/db";

export const dynamic = "force-dynamic";


export async function GET() {
  if (!hasDatabase) return NextResponse.json({ logs: [] });
  const result = await query(
    `SELECT id, actor_user_id, action, entity_type, entity_id, associated_cost, metadata, created_at
     FROM audit_logs
     ORDER BY created_at DESC
     LIMIT 200`
  );
  return NextResponse.json({ logs: result.rows });
}
