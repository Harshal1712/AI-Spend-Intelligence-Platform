export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { hasDatabase, query } from "@/lib/db";
import { sendAlert } from "@/lib/webhooks";

export async function GET() {
  if (!hasDatabase) {
    return NextResponse.json({
      notifications: [
        { id: "demo-budget", title: "Budget threshold reached", body: "Engineering is at 92% of monthly AI budget.", severity: "High", channel: "in_app", read_at: null, created_at: new Date(Date.now() - 60000 * 5).toISOString() },
        { id: "demo-risk", title: "Security incident detected", body: "Sensitive prompt content was flagged in Legal department.", severity: "Critical", channel: "in_app", read_at: null, created_at: new Date(Date.now() - 60000 * 15).toISOString() },
        { id: "demo-renewal", title: "Subscription renewal in 9 days", body: "Cursor enterprise seats renew on June 12, 2026.", severity: "Medium", channel: "in_app", read_at: null, created_at: new Date(Date.now() - 60000 * 60).toISOString() },
        { id: "demo-productivity", title: "Productivity drop detected", body: "Legal AI adoption declined 11% week over week.", severity: "Medium", channel: "in_app", read_at: null, created_at: new Date(Date.now() - 60000 * 120).toISOString() }
      ]
    });
  }

  const result = await query("SELECT id, title, body, severity, channel, read_at, created_at FROM notifications ORDER BY created_at DESC LIMIT 100");
  return NextResponse.json({ notifications: result.rows });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { title?: string; body?: string; severity?: string; channel?: string; userId?: string } | null;

  if (!body?.title || !body.body) {
    return NextResponse.json({ error: "Title and body are required." }, { status: 400 });
  }

  // Fire Slack/Teams webhook for Critical or High severity
  if (body.severity === "Critical" || body.severity === "High") {
    await sendAlert(body.title, body.body, body.severity).catch(console.error);
  }

  if (!hasDatabase) return NextResponse.json({ ok: true, mode: "demo" }, { status: 201 });

  const result = await query(
    `INSERT INTO notifications (user_id, channel, title, body, severity)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, title, body, severity, channel, created_at`,
    [body.userId ?? null, body.channel ?? "in_app", body.title, body.body, body.severity ?? "Medium"]
  );

  return NextResponse.json({ notification: result.rows[0] }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  // Mark notification as read
  const body = (await request.json().catch(() => null)) as { id?: string } | null;
  if (!body?.id) return NextResponse.json({ error: "Notification ID required." }, { status: 400 });

  if (!hasDatabase) return NextResponse.json({ ok: true });

  await query("UPDATE notifications SET read_at = now() WHERE id = $1", [body.id]);
  return NextResponse.json({ ok: true });
}
