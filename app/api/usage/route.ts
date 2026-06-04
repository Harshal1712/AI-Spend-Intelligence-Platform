export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createUsageInDb } from "@/lib/postgres-repository";
import { rateLimit } from "@/lib/rate-limit";
import { sendAlert } from "@/lib/webhooks";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId") ?? undefined;
  const { getUsageLogs } = await import("@/lib/platform-service");
  return NextResponse.json({ usage: getUsageLogs(employeeId) });
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request);
  if (limited) return limited;

  const body = (await request.json().catch(() => null)) as {
    employeeId?: string;
    tool?: string;
    modelName?: string;
    prompts?: number;
    tokens?: number;
    cost?: number;
    prompt?: string;
  } | null;

  try {
    const result = await createUsageInDb({
      employeeId: body?.employeeId ?? "",
      tool: body?.tool ?? "",
      modelName: body?.modelName ?? body?.tool ?? "Unknown model",
      prompts: Number(body?.prompts ?? 1),
      tokens: Number(body?.tokens ?? 0),
      cost: Number(body?.cost ?? 0),
      prompt: body?.prompt ?? ""
    });

    // Fire Slack/Teams alert if the prompt is elevated risk
    if (result.analysis?.riskLevel === "Elevated") {
      await sendAlert(
        "⚠️ High-Risk Prompt Detected",
        `A prompt with elevated risk was flagged. Employee submitted a prompt through ${body?.tool ?? "an AI tool"} that may contain sensitive data. Please review in the Security section.`,
        "High"
      );
    }

    // Alert if a single usage entry has unusually high cost (>$50)
    if (Number(body?.cost ?? 0) > 50) {
      await sendAlert(
        "💸 High-Cost AI Usage Detected",
        `A single AI usage entry cost $${Number(body?.cost ?? 0).toFixed(2)} via ${body?.tool ?? "AI"}. Review in the Cost Intelligence section.`,
        "Medium"
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save usage." }, { status: 400 });
  }
}
