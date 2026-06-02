import { NextRequest, NextResponse } from "next/server";
import { addUsageLog, getUsageLogs } from "@/lib/platform-service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId") ?? undefined;

  return NextResponse.json({ usage: getUsageLogs(employeeId) });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    employeeId?: string;
    tool?: string;
    prompts?: number;
    tokens?: number;
    cost?: number;
    prompt?: string;
  } | null;

  try {
    const result = addUsageLog({
      employeeId: body?.employeeId ?? "",
      tool: body?.tool ?? "",
      prompts: Number(body?.prompts ?? 1),
      tokens: Number(body?.tokens ?? 0),
      cost: Number(body?.cost ?? 0),
      prompt: body?.prompt ?? ""
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save usage." }, { status: 400 });
  }
}
