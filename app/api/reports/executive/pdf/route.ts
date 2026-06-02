import { generateExecutiveReportPdf } from "@/lib/platform-service";

export async function GET() {
  return new Response(generateExecutiveReportPdf(), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="ai-spend-executive-report.pdf"'
    }
  });
}
