import type OpenAI from "openai";

// ─────────────────────────────────────────────────────────────
// Structured Working Memory — hallucination-resistant project state
// ─────────────────────────────────────────────────────────────

export interface WorkingMemoryEntry {
  label: string;
  details: string;
  confidence: "confirmed" | "suggested" | "unverified" | "stale";
  fromMessage: number | null;
  updatedAt: string;
}

export interface WorkingMemory {
  keyDecisions: WorkingMemoryEntry[];
  codeEntities: WorkingMemoryEntry[];
  openIssues: WorkingMemoryEntry[];
  projectState: WorkingMemoryEntry[];
  lastUpdated: string;
  version: number;
}

const DEFAULT_MEMORY: WorkingMemory = {
  keyDecisions: [],
  codeEntities: [],
  openIssues: [],
  projectState: [],
  lastUpdated: new Date().toISOString(),
  version: 1,
};

export function parseWorkingMemory(raw: unknown): WorkingMemory {
  if (!raw || typeof raw !== "object") return DEFAULT_MEMORY;
  const obj = raw as Record<string, unknown>;
  return {
    keyDecisions: parseEntries(obj["keyDecisions"]),
    codeEntities: parseEntries(obj["codeEntities"]),
    openIssues: parseEntries(obj["openIssues"]),
    projectState: parseEntries(obj["projectState"]),
    lastUpdated: typeof obj["lastUpdated"] === "string" ? obj["lastUpdated"] : new Date().toISOString(),
    version: typeof obj["version"] === "number" ? obj["version"] : 1,
  };
}

function parseEntries(raw: unknown): WorkingMemoryEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((e) => e && typeof e === "object")
    .map((e) => ({
      label: String(e["label"] ?? ""),
      details: String(e["details"] ?? ""),
      confidence: validateConfidence(e["confidence"]),
      fromMessage: typeof e["fromMessage"] === "number" ? e["fromMessage"] : null,
      updatedAt: typeof e["updatedAt"] === "string" ? e["updatedAt"] : new Date().toISOString(),
    }));
}

function validateConfidence(c: unknown): WorkingMemoryEntry["confidence"] {
  const valid = new Set(["confirmed", "suggested", "unverified", "stale"]);
  return valid.has(c as string) ? (c as WorkingMemoryEntry["confidence"]) : "unverified";
}

/**
 * Build a structured memory update from the last few messages.
 * Uses a lightweight model to keep costs low.
 */
export async function buildStructuredMemory(
  msgs: Array<{ role: string; content: string }>,
  existing: WorkingMemory,
  client: OpenAI
): Promise<WorkingMemory> {
  const transcript = msgs
    .slice(-12)
    .map((m, i) => `msg_${i}: [${m.role}] ${m.content.slice(0, 600)}`)
    .join("\n");

  const existingJson = JSON.stringify(existing, null, 2).slice(0, 2000);

  const prompt = [
    "You are a structured memory engine for a coding assistant. Given a conversation transcript and the current working memory, produce an updated JSON working memory.",
    "",
    "Rules:",
    "1. Only update entries that are actually changed by the new transcript.",
    "2. Confidence levels: 'confirmed' (user explicitly stated), 'suggested' (assistant proposed, user accepted), 'unverified' (mentioned in passing), 'stale' (code may have changed since last seen).",
    "3. For code_entities: store only the name and a brief description. NEVER store the full implementation — store a pointer like 'function foo() in workspace.py — verify before use'.",
    "4. For open_issues: mark the user’s intent (e.g., 'TODO: refactor auth flow'), not the assistant’s opinion.",
    "5. For key_decisions: record what was actually agreed, not what was discussed.",
    "6. Keep total JSON under 2KB for token efficiency.",
    "",
    "Current working memory:",
    existingJson,
    "",
    "New transcript:",
    transcript,
    "",
    "Respond ONLY with valid JSON matching this schema:",
    JSON.stringify({
      keyDecisions: [{ label: "...", details: "...", confidence: "confirmed" }],
      codeEntities: [{ label: "...", details: "...", confidence: "suggested" }],
      openIssues: [{ label: "...", details: "...", confidence: "unverified" }],
      projectState: [{ label: "...", details: "...", confidence: "confirmed" }],
    }, null, 2),
  ].join("\n");

  try {
    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 800,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are a structured memory engine. Output only valid JSON." },
        { role: "user", content: prompt },
      ],
    });
    const raw = resp.choices[0]?.message?.content ?? "";
    if (!raw) return existing;
    const parsed = JSON.parse(raw);
    const merged = mergeWithExisting(existing, parsed);
    merged.lastUpdated = new Date().toISOString();
    merged.version = (merged.version || 1) + 1;
    return merged;
  } catch {
    return existing;
  }
}

function mergeWithExisting(existing: WorkingMemory, incoming: Partial<WorkingMemory>): WorkingMemory {
  const sections: (keyof WorkingMemory)[] = ["keyDecisions", "codeEntities", "openIssues", "projectState"];
  const merged: WorkingMemory = {
    ...existing,
    lastUpdated: new Date().toISOString(),
    version: (existing.version || 1) + 1,
  };

  for (const section of sections) {
    const incomingEntries = parseEntries(incoming[section]);
    const existingEntries = existing[section] as WorkingMemoryEntry[];
    const result: WorkingMemoryEntry[] = [];
    const seen = new Set<string>();

    // Keep existing entries unless overridden by new ones with same label
    for (const e of existingEntries) {
      const override = incomingEntries.find((i) => i.label === e.label);
      if (override) {
        result.push(override);
        seen.add(override.label);
      } else {
        result.push(e);
        seen.add(e.label);
      }
    }

    // Add new entries not in existing
    for (const e of incomingEntries) {
      if (!seen.has(e.label)) {
        result.push(e);
      }
    }

    // Limit to 8 entries per section for token efficiency
    (merged as any)[section] = result.slice(0, 8);
  }

  return merged;
}

/**
 * Format the working memory as a compact string for injection into the system prompt.
 */
export function formatMemoryPrompt(memory: WorkingMemory): string {
  const sections = [
    { key: "keyDecisions" as const, title: "Key Decisions" },
    { key: "codeEntities" as const, title: "Code Entities" },
    { key: "openIssues" as const, title: "Open Issues" },
    { key: "projectState" as const, title: "Project State" },
  ];

  const lines = ["\n[WORKING MEMORY] — Verified project state. Check workspace for ground truth on code."];

  for (const section of sections) {
    const entries = memory[section.key];
    if (entries.length === 0) continue;
    lines.push(`\n${section.title}:`);
    for (const e of entries) {
      const icon = { confirmed: "✓", suggested: "~", unverified: "?", stale: "✗" }[e.confidence];
      lines.push(`  ${icon} ${e.label}: ${e.details}`);
    }
  }

  if (lines.length === 1) return ""; // No entries, skip entirely
  return lines.join("\n");
}
