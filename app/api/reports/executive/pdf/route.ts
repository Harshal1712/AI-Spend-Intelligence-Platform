export const dynamic = "force-dynamic";

import { generateExecutiveReportPdf } from "@/lib/postgres-repository";

export async function GET() {
  return new Response(await generateExecutiveReportPdf(), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="ai-spend-executive-report.pdf"'
    }
  });
}
