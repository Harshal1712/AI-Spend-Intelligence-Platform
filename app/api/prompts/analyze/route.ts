import { NextRequest, NextResponse } from "next/server";
import { analyzePrompt } from "@/lib/platform-service";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { prompt?: string } | null;

  if (!body?.prompt || body.prompt.trim().length < 8) {
    return NextResponse.json({ error: "Prompt must contain at least 8 characters." }, { status: 400 });
  }

  return NextResponse.json(analyzePrompt(body.prompt));
}
