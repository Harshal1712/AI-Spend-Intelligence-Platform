export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { employeesToCsv } from "@/lib/platform-service";
import { listEmployeesFromDb } from "@/lib/postgres-repository";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const team = searchParams.get("team") ?? "All Teams";
  const csv = employeesToCsv(await listEmployeesFromDb({ queryText: query, team }));

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="ai-spend-employees.csv"'
    }
  });
}
