import { Router, type IRouter } from "express";
import { getOpenAIClient } from "./openai-client.js";
import type OpenAI from "openai";
import { db } from "@workspace/db";
import { openai as defaultOpenAI } from "@workspace/integrations-openai-ai-server";
import { conversations as conversationsTable, messages as messagesTable, userProgressTable } from "@workspace/db";
import { ChatWithJBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { buildSystemPrompt, buildSafetyCheck } from "./j-personality.js";
import { CURRICULUM } from "./curriculum.js";
import { buildStructuredMemory, formatMemoryPrompt, parseWorkingMemory, type WorkingMemory } from "./working-memory.js";

const router: IRouter = Router();

const VALID_LEARNER_MODES = new Set(["kids", "teen", "adult-beginner", "advanced"]);
type LearnerMode = "kids" | "teen" | "adult-beginner" | "advanced";

function parseLearnerMode(raw: unknown): LearnerMode {
  if (typeof raw === "string" && VALID_LEARNER_MODES.has(raw)) {
    return raw as LearnerMode;
  }
  return "adult-beginner";
}

function extractCodeBlocks(text: string): Array<{ lang: string; code: string }> {
  const blocks: Array<{ lang: string; code: string }> = [];
  const regex = /```([\w+#.-]+)?\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const lang = (match[1] ?? "python").toLowerCase();
    const code = match[2]?.trim() ?? "";
    if (code.length > 10) blocks.push({ lang, code });
  }
  return blocks;
}

const STYLE_RULES: Record<string, string[]> = {
  python: [
    "1. snake_case for all variable and function names — no camelCase or mixedCase",
    "2. 4-space indentation — no tabs, no 2-space indents",
    "3. Spaces around all operators: a = 1 (not a=1); x + y (not x+y)",
    "4. Consistent string quotes — do not mix single and double quotes in the same block",
    "5. Always specify exception type in except clauses — never bare `except:` without a type",
  ],
  javascript: [
    "1. Use const for all bindings that are never reassigned; let for reassignable — never var",
    "2. Arrow functions for all callbacks and anonymous functions",
    "3. Template literals (`) instead of string concatenation with +",
    "4. Strict equality === for all comparisons — never == or !=",
    "5. camelCase for variable/function names, PascalCase for classes and constructors",
  ],
  typescript: [
    "1. Explicit types on all function parameters and return values (no implicit any)",
    "2. Use const for all bindings that are never reassigned — never var",
    "3. Template literals instead of string concatenation",
    "4. Strict equality === for all comparisons",
    "5. camelCase for identifiers, PascalCase for types/interfaces/classes",
  ],
  cpp: [
    "1. Use #pragma once or proper include guards in every header file",
    "2. Pass large objects by const reference (&) — never by value unless intentionally copying",
    "3. Use nullptr instead of NULL or 0 for null pointers",
    "4. Prefer std::string over raw char* for string handling",
    "5. Initialize every variable at declaration — no uninitialized reads",
  ],
};

function resolveRules(lang: string): string[] {
  if (lang.includes("python") || lang === "py") return STYLE_RULES.python;
  if (lang.includes("typescript") || lang === "ts" || lang === "tsx") return STYLE_RULES.typescript;
  if (lang.includes("javascript") || lang === "js" || lang === "jsx") return STYLE_RULES.javascript;
  if (lang.includes("c++") || lang === "cpp" || lang === "c") return STYLE_RULES.cpp;
  return STYLE_RULES.python;
}

interface GauntletResult {
  passed: boolean;
  violations: string[];
}

async function runCodeGauntlet(
  code: string,
  language: string
): Promise<GauntletResult> {
  if (!code || code.length < 20) return { passed: true, violations: [] };

  const rules = resolveRules(language).join("\n");
  const prompt = `Audit this ${language} code against ONLY these 5 style rules. Be strict but pragmatic — only flag genuine violations.

RULES:
${rules}

CODE:
\`\`\`${language}
${code}
\`\`\`

Respond ONLY in valid JSON (no markdown, no explanation):
{"passed": true|false, "violations": ["specific violation here"]}`;

  try {
    const resp = await defaultOpenAI.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a strict code quality auditor. Respond only in raw JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const raw = resp.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as { passed?: boolean; violations?: string[] };
    return {
      passed: parsed.passed !== false,
      violations: Array.isArray(parsed.violations) ? parsed.violations : [],
    };
  } catch {
    return { passed: true, violations: [] };
  }
}

async function generateWithGauntlet(
  chatMessages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  language: string,
  client: OpenAI,
  isByok: boolean,
  maxRetries = 2
): Promise<string> {
  let attempt = 0;
  let currentMessages = [...chatMessages];
  let lastResponse = "";

  while (attempt < maxRetries) {
    attempt++;

    const response = await client.chat.completions.create({
      model: isByok ? "gpt-4o" : "gpt-5.2",
      max_completion_tokens: 8192,
      ...(isByok ? { temperature: 0.7 } : {}),
      messages: currentMessages,
      stream: false,
    });

    const fullResponse = response.choices[0]?.message?.content ?? "";
    lastResponse = fullResponse;
    if (!fullResponse) return fullResponse;

    const codeBlocks = extractCodeBlocks(fullResponse);
    if (codeBlocks.length === 0) return fullResponse;

    const allViolations: string[] = [];
    for (const block of codeBlocks) {
      const result = await runCodeGauntlet(block.code, block.lang || language);
      if (!result.passed) {
        allViolations.push(...result.violations);
      }
    }

    if (allViolations.length === 0) {
      return fullResponse;
    }

    if (attempt >= maxRetries) {
      return lastResponse;
    }

    const fixPrompt = [
      "Your code contains the following best-practice violations across one or more code blocks. Please revise your ENTIRE previous response to correct all of them:",
      "",
      allViolations.map((v, i) => `${i + 1}. ${v}`).join("\n"),
      "",
      "Reproduce the full explanation with corrected code. Do not acknowledge this correction — simply provide the improved response as if it were your first attempt.",
    ].join("\n");

    currentMessages = [
      ...currentMessages,
      { role: "assistant" as const, content: fullResponse },
      { role: "user" as const, content: fixPrompt },
    ];
  }

  return lastResponse;
}

router.post("/", async (req, res) => {
  try {
    const aiClient = getOpenAIClient(req.headers);
    const isByok = typeof req.headers["x-openai-key"] === "string" && (req.headers["x-openai-key"] as string).startsWith("sk-");
    const body = ChatWithJBody.parse(req.body);
    const { sessionId, message, language, os, phaseIndex, taskIndex, hardwareInfo, myCode, repoContext } = body;

    const learnerMode = parseLearnerMode(req.body.learnerMode);
    let conversationId = body.conversationId;

    const safety = buildSafetyCheck(message);
    if (!safety.safe) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.write(`data: ${JSON.stringify({ content: safety.reason })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true, conversationId })}\n\n`);
      return res.end();
    }

    if (!conversationId) {
      const phase = CURRICULUM[phaseIndex];
      const title = phase
        ? `${phase.name} — ${sessionId.slice(0, 8)}`
        : `Session ${sessionId.slice(0, 8)}`;
      const conv = await db.insert(conversationsTable).values({ title }).returning();
      conversationId = conv[0].id;
    }

    const existingMessages = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, conversationId))
      .orderBy(messagesTable.createdAt);

    const messageHistory = existingMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const currentPhase = CURRICULUM[phaseIndex] ?? null;
    const currentTask = currentPhase?.tasks[taskIndex] ?? null;

    // Load structured working memory for this conversation
    const convRows = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, conversationId));
    let workingMemory = parseWorkingMemory(convRows[0]?.structuredSummary ?? null);

    // Build system prompt with working memory injected
    const memoryPrompt = formatMemoryPrompt(workingMemory);
    const systemPrompt = buildSystemPrompt({
      phaseIndex,
      taskIndex,
      currentPhase,
      currentTask,
      language,
      os,
      hardwareInfo: hardwareInfo as { cpuCores?: number | null; ramGb?: number | null; platform?: string | null } | null | undefined,
      messageHistory,
      learnerMode,
      myCode,
      repoContext,
    });
    const fullSystemPrompt = systemPrompt + memoryPrompt;

    await db.insert(messagesTable).values({
      conversationId,
      role: "user",
      content: message,
    });

    const freshMessages = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, conversationId))
      .orderBy(messagesTable.createdAt);

    const freshHistory = freshMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // ── DETERMINISTIC TOKEN BUDGET ARCHIVING ──
    const HISTORY_TOKEN_BUDGET = 8_000;
    const estimateTokens = (text: string) => Math.ceil(text.length / 4);

    let totalTokens = 0;
    for (const m of freshHistory) totalTokens += estimateTokens(m.content);
    totalTokens += estimateTokens(message);
    totalTokens += estimateTokens(fullSystemPrompt);

    let contextArchived = false;
    let archivedCount = 0;

    if (totalTokens > HISTORY_TOKEN_BUDGET && freshHistory.length > 4) {
      const toArchive: typeof freshHistory = [];
      let remainingTokens = totalTokens;
      for (let i = 0; i < freshHistory.length; i++) {
        const msgTokens = estimateTokens(freshHistory[i].content);
        if (remainingTokens - msgTokens <= HISTORY_TOKEN_BUDGET || freshHistory.length - toArchive.length <= 4) {
          break;
        }
        toArchive.push(freshHistory[i]);
        remainingTokens -= msgTokens;
      }

      if (toArchive.length > 0) {
        archivedCount = toArchive.length;
        const archiveTranscript = toArchive
          .map((m) => `${m.role}: ${m.content.slice(0, 800)}`)
          .join("\n---\n");

        let summaryText = "Earlier conversation archived.";
        try {
          const sumResp = await aiClient.chat.completions.create({
            model: "gpt-4o-mini",
            max_completion_tokens: 200,
            temperature: 0,
            messages: [
              {
                role: "system",
                content: "Summarize the following conversation transcript in 2-3 sentences. Include what coding concepts were discussed and any code that was written. Be deterministic and concise.",
              },
              { role: "user", content: archiveTranscript },
            ],
          });
          summaryText = sumResp.choices[0]?.message?.content ?? summaryText;
        } catch {
          // Fail-safe: deterministic summarization is best-effort
        }

        const archiveContent = `[ARCHIVE SUMMARY] ${summaryText}`;
        await db.insert(messagesTable).values({
          conversationId,
          role: "system",
          content: archiveContent,
        });
        contextArchived = true;
      }
    }

    // Re-fetch history after possible archive insertion
    const finalMessages = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, conversationId))
      .orderBy(messagesTable.createdAt);

    const finalHistory = finalMessages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    const chatMessages = [
      { role: "system" as const, content: fullSystemPrompt },
      ...finalHistory.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    const fullResponse = await generateWithGauntlet(chatMessages, language, aiClient, isByok);

    await db.insert(messagesTable).values({
      conversationId,
      role: "assistant",
      content: fullResponse,
    });

    // ── STRUCTURED WORKING MEMORY UPDATE ──
    // Update every 10 messages or when user explicitly asks
    const shouldUpdateMemory =
      finalHistory.length % 10 === 0 ||
      /\bremember\b|working\s*memory|update\s*memory|track\s*this|keep\s*this\s*in\s*mind/i.test(message);

    if (shouldUpdateMemory && finalHistory.length >= 4) {
      const updatedMemory = await buildStructuredMemory(
        finalHistory.map((m) => ({ role: m.role, content: m.content })),
        workingMemory,
        aiClient
      );
      await db
        .update(conversationsTable)
        .set({ structuredSummary: updatedMemory })
        .where(eq(conversationsTable.id, conversationId));
      workingMemory = updatedMemory;
    }

    await db
      .update(userProgressTable)
      .set({ conversationId, selectedLanguage: language, selectedOs: os, updatedAt: new Date() })
      .where(eq(userProgressTable.sessionId, sessionId));

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const CHUNK = 20;
    for (let i = 0; i < fullResponse.length; i += CHUNK) {
      res.write(`data: ${JSON.stringify({ content: fullResponse.slice(i, i + CHUNK) })}\n\n`);
    }

    const memoryVersion = workingMemory.version;
    res.write(`data: ${JSON.stringify({ done: true, conversationId, memoryVersion, contextArchived, archivedCount })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Chat error");
    const errMsg = err instanceof Error ? err.message : "";
    const isQuota = errMsg.includes("spend limit") || errMsg.includes("quota") || errMsg.includes("exceeded") || (err as any)?.code === "FREE_TIER_BUDGET_EXCEEDED";
    if (!res.headersSent) {
      if (isQuota) {
        res.status(503).json({ error: "AI service unavailable — monthly quota exceeded. Add your own API key in Settings (gear icon) to continue.", code: "QUOTA_EXCEEDED" });
      } else {
        res.status(500).json({ error: "Chat failed" });
      }
    } else {
      res.write(`data: ${JSON.stringify({ error: "Internal error", done: true })}\n\n`);
      res.end();
    }
  }
  return;
});

// ── GET: working memory for a conversation ──
router.get("/:conversationId/memory", async (req, res) => {
  try {
    const convId = Number(req.params.conversationId);
    if (Number.isNaN(convId)) {
      res.status(400).json({ error: "Invalid conversation ID" });
      return;
    }
    const convRows = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, convId));
    const conv = convRows[0];
    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    const memory = parseWorkingMemory(conv.structuredSummary ?? null);
    res.json({ memory, version: memory.version, lastUpdated: memory.lastUpdated });
  } catch (err) {
    req.log.error({ err }, "Memory fetch error");
    res.status(500).json({ error: "Failed to fetch working memory" });
  }
});

// ── POST: update working memory for a conversation ──
router.post("/:conversationId/memory", async (req, res) => {
  try {
    const convId = Number(req.params.conversationId);
    if (Number.isNaN(convId)) {
      res.status(400).json({ error: "Invalid conversation ID" });
      return;
    }
    const { memory } = req.body;
    if (!memory || typeof memory !== "object") {
      res.status(400).json({ error: "Invalid memory payload" });
      return;
    }
    const parsed = parseWorkingMemory(memory);
    await db
      .update(conversationsTable)
      .set({ structuredSummary: parsed })
      .where(eq(conversationsTable.id, convId));
    res.json({ success: true, version: parsed.version });
  } catch (err) {
    req.log.error({ err }, "Memory update error");
    res.status(500).json({ error: "Failed to update working memory" });
  }
});

// ── EXPORT: full conversation as markdown ──
router.get("/:conversationId/export", async (req, res) => {
  try {
    const convId = Number(req.params.conversationId);
    if (Number.isNaN(convId)) {
      res.status(400).json({ error: "Invalid conversation ID" });
      return;
    }

    const convRows = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, convId));
    const conv = convRows[0];
    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    const msgs = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, convId))
      .orderBy(messagesTable.createdAt);

    const lines = [
      `# B.L.U.E.-J. Conversation Export`,
      ``,
      `**Title:** ${conv.title}`,
      `**Exported:** ${new Date().toISOString()}`,
      `**ID:** ${conv.id}`,
      ``,
      `---`,
      ``,
    ];

    for (const m of msgs) {
      const roleLabel = m.role === "user" ? "You" : m.role === "assistant" ? "J." : "System";
      const ts = m.createdAt ? new Date(m.createdAt).toISOString() : "";
      lines.push(`### ${roleLabel}  \`${ts}\``);
      lines.push("");
      lines.push(m.content);
      lines.push("");
      lines.push("---");
      lines.push("");
    }

    const markdown = lines.join("\n");
    const filename = `bluej-conversation-${conv.id}-${new Date().toISOString().slice(0, 10)}.md`;

    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(markdown);
  } catch (err) {
    req.log.error({ err }, "Export error");
    res.status(500).json({ error: "Export failed" });
  }
});

router.post("/progress", async (req, res) => {
  try {
    const { sessionId, conceptsMastered } = req.body;
    if (!sessionId || !Array.isArray(conceptsMastered)) {
      return res.status(400).json({ error: "Missing sessionId or conceptsMastered array" });
    }
    const [existing] = await db.select().from(userProgressTable).where(eq(userProgressTable.sessionId, sessionId));
    if (existing) {
      await db.update(userProgressTable).set({
        conceptsMastered,
        updatedAt: new Date(),
      }).where(eq(userProgressTable.id, existing.id));
      return res.json({ ok: true, updated: true });
    }
    return res.status(404).json({ error: "Session not found" });
  } catch (err) {
    req.log.error({ err }, "Progress update error");
    res.status(500).json({ error: "Progress update failed" });
  }
});

export default router;
