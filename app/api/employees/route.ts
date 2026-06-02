import { NextRequest, NextResponse } from "next/server";
import { createEmployee, searchEmployees } from "@/lib/platform-service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const team = searchParams.get("team") ?? "All Teams";

  return NextResponse.json({
    employees: searchEmployees({ query, team }),
    filters: { query, team }
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    name?: string;
    team?: string;
    department?: string;
    tool?: string;
    productivity?: number;
    risk?: number;
  } | null;

  try {
    const employee = createEmployee({
      name: body?.name ?? "",
      team: body?.team ?? "",
      department: body?.department ?? "",
      tool: body?.tool ?? "",
      productivity: body?.productivity,
      risk: body?.risk
    });

    return NextResponse.json({ employee }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create employee." }, { status: 400 });
  }
}
