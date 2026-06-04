export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSecurityDashboard } from "@/lib/postgres-repository";

export async function GET() {
  return NextResponse.json(await getSecurityDashboard());
}
