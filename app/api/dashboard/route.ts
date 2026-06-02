import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/platform-service";

export async function GET() {
  return NextResponse.json(getDashboardData());
}
