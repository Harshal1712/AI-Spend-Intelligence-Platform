import { NextRequest, NextResponse } from "next/server";
import { getPromptLogs } from "@/lib/platform-service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId") ?? undefined;

  return NextResponse.json({ prompts: getPromptLogs(employeeId) });
}
