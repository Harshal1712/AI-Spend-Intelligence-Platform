import { NextResponse } from "next/server";
import { getBenchmarks } from "@/lib/postgres-repository";

export const dynamic = "force-dynamic";


const DEMO_BENCHMARKS = [
  { provider: "OpenAI", model_name: "GPT-4o", cost_per_1k_tokens: 0.005, speed_score: 88, quality_score: 94, productivity_score: 91, adoption_score: 78, recommendation: "Use for high-value reasoning and executive work." },
  { provider: "OpenAI", model_name: "GPT-4o-mini", cost_per_1k_tokens: 0.0006, speed_score: 95, quality_score: 84, productivity_score: 87, adoption_score: 71, recommendation: "Route repetitive summarization here to reduce spend." },
  { provider: "Anthropic", model_name: "Claude 3.5 Sonnet", cost_per_1k_tokens: 0.003, speed_score: 82, quality_score: 95, productivity_score: 89, adoption_score: 62, recommendation: "Use for long-form analysis and policy workflows." },
  { provider: "Google", model_name: "Gemini 1.5 Pro", cost_per_1k_tokens: 0.0025, speed_score: 86, quality_score: 87, productivity_score: 78, adoption_score: 45, recommendation: "Good for multimodal and broad research workflows." },
  { provider: "GitHub", model_name: "Copilot", cost_per_1k_tokens: 0.0012, speed_score: 92, quality_score: 86, productivity_score: 94, adoption_score: 74, recommendation: "Best fit for developer productivity." },
  { provider: "Cursor", model_name: "Cursor Agent", cost_per_1k_tokens: 0.0014, speed_score: 90, quality_score: 88, productivity_score: 93, adoption_score: 59, recommendation: "Best fit for codebase-aware engineering tasks." },
  { provider: "Perplexity", model_name: "Sonar", cost_per_1k_tokens: 0.001, speed_score: 96, quality_score: 82, productivity_score: 73, adoption_score: 38, recommendation: "Best fit for fast external research." }
];

export async function GET() {
  const benchmarks = await getBenchmarks();
  return NextResponse.json({ benchmarks: benchmarks.length > 0 ? benchmarks : DEMO_BENCHMARKS });
}
