export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { analyzePromptWithAI } from "@/lib/ai-analysis";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { prompt?: string } | null;

  if (!body?.prompt || body.prompt.trim().length < 8) {
    return NextResponse.json({ error: "Prompt must contain at least 8 characters." }, { status: 400 });
  }

  const result = await analyzePromptWithAI(body.prompt);
  return NextResponse.json(result);
}
