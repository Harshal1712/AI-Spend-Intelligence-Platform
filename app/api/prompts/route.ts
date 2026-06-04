export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { listPromptHistory } from "@/lib/postgres-repository";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId") ?? undefined;

  return NextResponse.json({ prompts: await listPromptHistory(employeeId ? { userId: employeeId, role: "Employee" } : {}) });
}
