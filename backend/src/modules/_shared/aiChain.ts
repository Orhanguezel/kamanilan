// =============================================================
// FILE: src/modules/_shared/aiChain.ts
// Shared AI provider chain builder
// Env keys take priority over DB config.
// =============================================================

import { getIntegrationSettings } from "@/modules/integrationSettings/service";

export type AiProviderEntry = {
  provider: string;
  apiKey:   string;
  apiBase:  string;
  model:    string;
};

export const AI_DEFAULT_BASES: Record<string, string> = {
  groq:      "https://api.groq.com/openai/v1",
  openai:    "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  gemini:    "https://generativelanguage.googleapis.com/v1beta/openai",
};

export const AI_DEFAULT_MODELS: Record<string, string> = {
  groq:      "llama-3.3-70b-versatile",
  openai:    "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-20241022",
  gemini:    "gemini-2.0-flash",
};

const ENV_PROVIDERS: Array<{ name: string; keyEnvs: string[]; modelEnv: string }> = [
  { name: "groq",      keyEnvs: ["GROQ_API_KEY"],                 modelEnv: "GROQ_MODEL"      },
  { name: "openai",    keyEnvs: ["OPENAI_API_KEY", "OPENAI"],     modelEnv: "OPENAI_MODEL"    },
  { name: "anthropic", keyEnvs: ["ANTHROPIC_API_KEY", "CLAUDE"],  modelEnv: "ANTHROPIC_MODEL" },
  { name: "gemini",    keyEnvs: ["GEMINI_API_KEY", "GEMINI"],     modelEnv: "GEMINI_MODEL"    },
];

function envKeyFor(name: string): string {
  const entry = ENV_PROVIDERS.find((p) => p.name === name);
  if (!entry) return "";
  return entry.keyEnvs.map((k) => process.env[k] ?? "").find((v) => v) ?? "";
}

/** Gemini API keys from Google AI Studio start with "AIza". OAuth2 tokens start with "AQ." — reject those. */
function isValidKey(name: string, key: string): boolean {
  if (name === "gemini" && !key.startsWith("AIza")) return false;
  return key.length > 10;
}

/**
 * Build the AI provider chain.
 * Priority order for each provider: .env key > admin panel DB config.
 * Gemini keys that are OAuth2 tokens (not "AIza...") are silently skipped.
 */
export async function buildAiChain(): Promise<AiProviderEntry[]> {
  const aiConfig   = await getIntegrationSettings("ai", false);
  const orderStr   = (aiConfig?.settings?.provider_order as string | undefined)
    ?? "groq,openai,anthropic,gemini";
  const order      = orderStr.split(",").map((s) => s.trim()).filter(Boolean);

  const chain:   AiProviderEntry[] = [];
  const handled: Set<string>       = new Set();

  for (const name of order) {
    if (handled.has(name)) continue;
    handled.add(name);

    // 1. Prefer .env key
    const envKey = envKeyFor(name);
    if (envKey && isValidKey(name, envKey)) {
      const entry = ENV_PROVIDERS.find((p) => p.name === name);
      chain.push({
        provider: name,
        apiKey:   envKey,
        apiBase:  AI_DEFAULT_BASES[name] ?? "",
        model:    (entry ? (process.env[entry.modelEnv] ?? "") : "") || (AI_DEFAULT_MODELS[name] ?? ""),
      });
      continue;
    }

    // 2. Fall back to DB
    const cfg    = await getIntegrationSettings(name, true);
    const apiKey = String(cfg?.settings?.api_key ?? "").trim();
    if (!cfg?.enabled || !isValidKey(name, apiKey)) continue;
    chain.push({
      provider: name,
      apiKey,
      apiBase:  String(cfg.settings?.base_url ?? AI_DEFAULT_BASES[name] ?? ""),
      model:    String(cfg.settings?.model    ?? AI_DEFAULT_MODELS[name] ?? ""),
    });
  }

  // Add any env-available providers not yet in the order list
  for (const { name, keyEnvs, modelEnv } of ENV_PROVIDERS) {
    if (handled.has(name)) continue;
    const apiKey = keyEnvs.map((k) => process.env[k] ?? "").find((v) => v) ?? "";
    if (!apiKey || !isValidKey(name, apiKey)) continue;
    chain.push({
      provider: name,
      apiKey,
      apiBase:  AI_DEFAULT_BASES[name] ?? "",
      model:    (process.env[modelEnv] ?? "") || (AI_DEFAULT_MODELS[name] ?? ""),
    });
  }

  return chain;
}

/** Shared callAi — supports both Anthropic native format and OpenAI-compatible format */
export async function callAi(
  apiBase:      string,
  apiKey:       string,
  model:        string,
  provider:     string,
  systemPrompt: string,
  userPrompt:   string,
): Promise<string> {
  const isAnthropic = provider === "anthropic" || apiBase.includes("anthropic.com");

  let res: Response;
  if (isAnthropic) {
    res = await fetch(`${apiBase}/messages`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body:    JSON.stringify({ model, system: systemPrompt, messages: [{ role: "user", content: userPrompt }], max_tokens: 2500 }),
      signal:  AbortSignal.timeout(60_000),
    });
  } else {
    res = await fetch(`${apiBase}/chat/completions`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body:    JSON.stringify({ model, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], max_tokens: 2500, temperature: 0.5 }),
      signal:  AbortSignal.timeout(60_000),
    });
  }

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    try {
      const errJson = JSON.parse(errBody) as any;
      throw new Error(String(errJson?.error?.message ?? errJson?.message ?? errBody.slice(0, 300)));
    } catch (pe) {
      if (pe instanceof SyntaxError) throw new Error(`AI API ${res.status}: ${errBody.slice(0, 300)}`);
      throw pe;
    }
  }

  const data = (await res.json()) as any;
  return data?.content?.[0]?.text?.trim() ?? data?.choices?.[0]?.message?.content?.trim() ?? "";
}

/** Escapes literal newlines inside JSON string values (fixes AI-generated JSON with unescaped newlines). */
function sanitizeJsonLiteralNewlines(text: string): string {
  let result = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escaped) { result += ch; escaped = false; continue; }
    if (ch === "\\") { escaped = true; result += ch; continue; }
    if (ch === '"') { inString = !inString; result += ch; continue; }
    if (inString && ch === "\n") { result += "\\n"; continue; }
    if (inString && ch === "\r") { result += "\\r"; continue; }
    result += ch;
  }
  return result;
}

export function extractJson(text: string): any {
  const stripped = text.replace(/^```(?:json)?\s*/im, "").replace(/\s*```$/im, "").trim();
  // Attempt 1: raw parse
  try { return JSON.parse(stripped); } catch { /* continue */ }
  // Attempt 2: sanitize literal newlines inside strings, then parse
  try { return JSON.parse(sanitizeJsonLiteralNewlines(stripped)); } catch { /* continue */ }
  // Attempt 3: regex-extract the JSON object, then parse
  const m = stripped.match(/\{[\s\S]*\}/);
  if (m) {
    try { return JSON.parse(m[0]); } catch { /* continue */ }
    try { return JSON.parse(sanitizeJsonLiteralNewlines(m[0])); } catch { /* continue */ }
  }
  throw new Error(`AI geçerli JSON döndürmedi. Ham yanıt (ilk 300): ${text.slice(0, 300)}`);
}

export function wrapParagraphs(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter((p) => p.length > 0)
    .map((p) => `<p>${p}</p>`)
    .join("\n");
}
