import { analyzePrompt } from "./platform-service";

export type AnalysisResult = {
  quality: number;
  efficiency: number;
  complexity: number;
  riskLevel: string;
  suggestions: string[];
  improvedPrompt: string;
  analyzedAt: string;
  usedAI?: boolean;
};

const SYSTEM_PROMPT =
  'You are an enterprise AI prompt quality analyzer. Analyze the following prompt and respond with ONLY a valid JSON object (no markdown, no code blocks) with these exact fields: {"quality": <0-100>, "efficiency": <0-100>, "complexity": <0-100>, "riskLevel": "Low" or "Elevated", "suggestions": ["tip1", "tip2", "tip3"], "improvedPrompt": "<rewritten version>"}. Mark riskLevel as Elevated only if the prompt contains passwords, API keys, secrets, confidential contracts, or customer PII.';

function parseAIJson(raw: string): Omit<AnalysisResult, "analyzedAt" | "usedAI"> | null {
  try {
    const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    if (
      typeof parsed.quality !== "number" ||
      typeof parsed.efficiency !== "number" ||
      typeof parsed.complexity !== "number" ||
      typeof parsed.riskLevel !== "string" ||
      !Array.isArray(parsed.suggestions) ||
      typeof parsed.improvedPrompt !== "string"
    ) {
      return null;
    }

    return {
      quality: Math.min(100, Math.max(0, Math.round(parsed.quality))),
      efficiency: Math.min(100, Math.max(0, Math.round(parsed.efficiency))),
      complexity: Math.min(100, Math.max(0, Math.round(parsed.complexity))),
      riskLevel: parsed.riskLevel === "Elevated" ? "Elevated" : "Low",
      suggestions: (parsed.suggestions as unknown[]).slice(0, 3).map((s) => String(s)),
      improvedPrompt: String(parsed.improvedPrompt)
    };
  } catch {
    return null;
  }
}

async function tryOpenAI(prompt: string): Promise<Omit<AnalysisResult, "analyzedAt" | "usedAI"> | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      console.error(`[ai-analysis] OpenAI error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data?.choices?.[0]?.message?.content ?? "";
    return parseAIJson(content);
  } catch (error) {
    console.error("[ai-analysis] OpenAI request failed:", error);
    return null;
  }
}

async function tryAnthropic(prompt: string): Promise<Omit<AnalysisResult, "analyzedAt" | "usedAI"> | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      console.error(`[ai-analysis] Anthropic error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const content = data?.content?.find((block) => block.type === "text")?.text ?? "";
    return parseAIJson(content);
  } catch (error) {
    console.error("[ai-analysis] Anthropic request failed:", error);
    return null;
  }
}

async function tryGemini(prompt: string): Promise<Omit<AnalysisResult, "analyzedAt" | "usedAI"> | null> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      console.error(`[ai-analysis] Gemini error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return parseAIJson(content);
  } catch (error) {
    console.error("[ai-analysis] Gemini request failed:", error);
    return null;
  }
}

export async function analyzePromptWithAI(prompt: string): Promise<AnalysisResult> {
  const analyzedAt = new Date().toISOString();

  const openAIResult = await tryOpenAI(prompt);
  if (openAIResult) {
    return { ...openAIResult, analyzedAt, usedAI: true };
  }

  const anthropicResult = await tryAnthropic(prompt);
  if (anthropicResult) {
    return { ...anthropicResult, analyzedAt, usedAI: true };
  }

  const geminiResult = await tryGemini(prompt);
  if (geminiResult) {
    return { ...geminiResult, analyzedAt, usedAI: true };
  }

  const fallback = analyzePrompt(prompt);
  return { ...fallback, usedAI: false };
}
