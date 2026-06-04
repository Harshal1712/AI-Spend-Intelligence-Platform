export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createEmployeeInDb, listEmployeesFromDb } from "@/lib/postgres-repository";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const limited = rateLimit(request);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const team = searchParams.get("team") ?? "All Teams";

  return NextResponse.json({
    employees: await listEmployeesFromDb({ queryText: query, team }),
    filters: { query, team }
  });
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request);
  if (limited) return limited;

  const body = (await request.json().catch(() => null)) as {
    name?: string;
    email?: string;
    team?: string;
    department?: string;
    tool?: string;
    productivity?: number;
    risk?: number;
  } | null;

  try {
    const employee = await createEmployeeInDb({
      name: body?.name ?? "",
      email: body?.email ?? `${Date.now()}@local.employee`,
      team: body?.team ?? "",
      department: body?.department ?? "",
      tool: body?.tool ?? "",
      role: "Employee"
    });

    return NextResponse.json({ employee }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create employee." }, { status: 400 });
  }
}
