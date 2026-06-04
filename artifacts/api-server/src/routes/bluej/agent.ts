import { Router, type IRouter } from "express";
import { getOpenAIClient } from "./openai-client.js";
import { buildSafetyCheck } from "./j-personality.js";

const router: IRouter = Router();

const ADMIN_AGENT_PASSWORD = process.env.ADMIN_AGENT_PASSWORD || "";

function generateCurriculumPassword(level: number): string | null {
  return level >= 5 ? 'B' + (level * 7 + 13).toString(36).toUpperCase() : null;
}

router.post("/unlock", async (req, res) => {
  try {
    const { password, level } = req.body as { password: string; level: number };
    if (!password || password.length < 4) {
      res.status(400).json({ error: "Password must be at least 4 characters" });
      return;
    }

    // Admin override
    if (ADMIN_AGENT_PASSWORD && password === ADMIN_AGENT_PASSWORD) {
      res.json({ unlocked: true, isAdmin: true });
      return;
    }

    // Curriculum password
    const curriculumPass = generateCurriculumPassword(level);
    if (curriculumPass && password === curriculumPass) {
      res.json({ unlocked: true, isAdmin: false });
      return;
    }

    res.json({ unlocked: false, isAdmin: false });
  } catch (err) {
    req.log.error({ err }, "Agent unlock error");
    res.status(500).json({ error: "Unlock check failed" });
  }
});

// ─── Agent Mode: Development Agent with CORE LOOP schema ──────────────
// This is a locked feature. It provides a structured development loop
// with the Five Masters, safety enforcement, and trace-and-debug teaching.

const AGENT_SYSTEM_PROMPT = `You are J. in Development Agent Mode. You are a structured AI development assistant that follows the CORE LOOP on every turn:

CORE LOOP (mandatory every turn):
1. INTAKE: Restate the user's goal in one sentence. Extract constraints. Define success criteria.
2. CLARIFY: Ask up to 3 questions only if required. Otherwise proceed with explicit assumptions.
3. PLAN: Short numbered plan (max 6 steps) before any execution.
4. ACT: Execute using available tools. Keep changes small. Never fabricate actions or results.
5. VERIFY: Test outputs against success criteria. Report what passed, what failed, and any risks.
6. TEACH: When code is involved, include a brief "trace & debug" section showing how to reproduce, inspect, and isolate the issue.
7. CLOSE: End with exactly ONE next-step sentence (max 25 words).

SAFETY / TRUST (non-negotiable):
- Refuse malware, exploits, surveillance, deception, self-harm, physical harm, illegal guidance.
- Provide safe alternatives. Be explicit about uncertainty. Separate proposed vs performed.

ENGINEERING PRINCIPLES (Five Masters):
- Efficiency: no wasted operations, no redundant complexity.
- Rigor: type safety, error handling, deterministic behavior.
- Optimisation: performance-aware, resource-conscious.
- Reliability: defensive coding, graceful degradation, no silent failures.
- Fundamentals: solid foundations before clever tricks.

PYTHON CODE STANDARDS (enforced):
- PEP 8, 79-char lines, type hints everywhere, docstrings everywhere.
- No bare except. No mutable defaults. Deterministic behavior.
- Structured logging. No secrets in code.

OUTPUT STYLE:
- British English. Calm. Precise. Subtly sardonic. No emojis.
- Concise. Markdown sparingly. Code only in fenced blocks.
- Exactly one next step at the end of every response.

PHASE ANNOTATIONS:
Begin each phase of your response with a tag in the format [PHASE: Name].
Example: [PHASE: Intake], [PHASE: Plan], [PHASE: Act], etc.
`;

router.post("/", async (req, res) => {
  try {
    const { message, language, os, history = [] } = req.body as {
      message: string;
      language: string;
      os: string;
      history: Array<{ role: string; content: string }>;
    };

    if (!message?.trim()) {
      res.status(400).json({ error: "No message provided" });
      return;
    }

    // Safety check
    const safety = buildSafetyCheck(message);
    if (!safety.safe) {
      res.json({
        phases: [
          { phase: "intake", content: "Request received." },
          { phase: "verify", content: `ANTI-ULTRON protocol engaged. ${safety.reason}` },
          { phase: "close", content: "State a safe, constructive objective and I will proceed." },
        ]
      });
      return;
    }

    const client = getOpenAIClient(req.headers);

    const chatMessages = [
      { role: "system" as const, content: AGENT_SYSTEM_PROMPT },
      { role: "system" as const, content: `Current environment: ${language} on ${os}.` },
      ...history.slice(-6).map((m) => ({
        role: m.role === "user" ? "user" : ("assistant" as "user" | "assistant"),
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: chatMessages,
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content ?? "No response.";

    // Parse phase tags from content
    const phases: Array<{ phase: string; content: string }> = [];
    const phaseRegex = /\[PHASE:\s*(\w+)\]([\s\S]*?)(?=\[PHASE:|$)/gi;
    let match;
    while ((match = phaseRegex.exec(content)) !== null) {
      phases.push({
        phase: match[1].toLowerCase(),
        content: match[2].trim(),
      });
    }

    // If no phases parsed, return the whole content as a single response
    if (phases.length === 0) {
      phases.push({ phase: "act", content: content.trim() });
    }

    res.json({ phases });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "";
    const isQuota = errMsg.includes("spend limit") || errMsg.includes("quota") || errMsg.includes("exceeded") || (err as any)?.code === "FREE_TIER_BUDGET_EXCEEDED";

    if (isQuota) {
      res.status(503).json({
        error: "AI service unavailable — monthly quota exceeded. Add your own API key in Settings (gear icon) to continue.",
        code: "QUOTA_EXCEEDED"
      });
    } else {
      res.status(500).json({ error: "Agent failed" });
    }
  }
});

export default router;
