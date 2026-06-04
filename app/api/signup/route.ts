export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { hasDatabase, query } from "@/lib/db";
import { auditLog } from "@/lib/postgres-repository";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { name?: string; email?: string; password?: string; department?: string; team?: string } | null;

  if (!body?.name || !body.email || !body.password) {
    return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
  }

  if (!hasDatabase) {
    return NextResponse.json({ ok: true, mode: "demo" }, { status: 201 });
  }

  const department = await query<{ id: string }>(
    "INSERT INTO departments (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET updated_at = now() RETURNING id",
    [body.department || "General"]
  );
  const passwordHash = await bcrypt.hash(body.password, 10);
  const user = await query<{ id: string }>(
    `INSERT INTO users (email, name, password_hash, role, department_id, team)
     VALUES ($1, $2, $3, 'Employee', $4, $5)
     RETURNING id`,
    [body.email, body.name, passwordHash, department.rows[0].id, body.team || "General"]
  );
  await auditLog({ actorUserId: user.rows[0].id, action: "auth.signup", entityType: "users", entityId: user.rows[0].id });

  return NextResponse.json({ ok: true }, { status: 201 });
}
