import { NextRequest, NextResponse } from "next/server";
import { updateIntegration } from "@/lib/platform-service";

export async function PATCH(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { name?: string; status?: "Connected" | "Ready" } | null;

  if (!body?.name || !body.status || !["Connected", "Ready"].includes(body.status)) {
    return NextResponse.json({ error: "Integration name and status are required." }, { status: 400 });
  }

  const integration = updateIntegration(body.name, body.status);

  if (!integration) {
    return NextResponse.json({ error: "Integration not found." }, { status: 404 });
  }

  return NextResponse.json({ integration });
}
