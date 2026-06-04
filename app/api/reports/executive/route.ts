export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getExecutiveReport } from "@/lib/platform-service";

export async function GET() {
  return NextResponse.json(getExecutiveReport());
}
