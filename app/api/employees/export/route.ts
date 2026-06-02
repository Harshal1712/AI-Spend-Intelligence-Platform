import { NextRequest } from "next/server";
import { employeesToCsv, searchEmployees } from "@/lib/platform-service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const team = searchParams.get("team") ?? "All Teams";
  const csv = employeesToCsv(searchEmployees({ query, team }));

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="ai-spend-employees.csv"'
    }
  });
}
