import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { conversations as conversationsTable, messages as messagesTable, userProgressTable } from "@workspace/db";
import { eq, notInArray } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

function computeHardwareStatus(
  cpuCores?: number | null,
  ramGb?: number | null
): "optimal" | "adequate" | "constrained" {
  const cores = cpuCores ?? 0;
  const ram = ramGb ?? 0;
  if (cores >= 8 && ram >= 16) return "optimal";
  if (cores >= 4 && ram >= 8) return "adequate";
  return "constrained";
}

router.post("/", async (req, res) => {
  try {
    const { sessionId, cpuCores, ramGb } = req.body as {
      sessionId: string;
      cpuCores?: number | null;
      ramGb?: number | null;
    };

    let orphanedConversations = 0;
    let orphanedMessages = 0;
    let sessionExists = false;

    // ── 1. Session check / init ────────────────────────────────────────────
    const existing = await db
      .select({ id: userProgressTable.id })
      .from(userProgressTable)
      .where(eq(userProgressTable.sessionId, sessionId ?? ""));

    sessionExists = existing.length > 0;

    if (!sessionExists && sessionId) {
      await db.insert(userProgressTable).values({
        sessionId,
        currentPhase: 0,
        currentTask: 0,
        completedTasks: [],
        selectedLanguage: "python",
        selectedOs: "linux",
      });
    }

    // ── 2. Find + purge orphaned conversations (no messages) ───────────────
    try {
      // All conversation IDs that have at least one message
      const convsWithMessages = await db
        .selectDistinct({ cid: messagesTable.conversationId })
        .from(messagesTable);

      const usedIds = convsWithMessages.map((r) => r.cid);

      // All conversations
      const allConvs = await db
        .select({ id: conversationsTable.id })
        .from(conversationsTable);

      const orphanIds = allConvs
        .map((c) => c.id)
        .filter((id) => !usedIds.includes(id));

      orphanedConversations = orphanIds.length;

      if (orphanIds.length > 0) {
        // Delete orphaned conversations (cascade deletes any stray messages too)
        await db
          .delete(conversationsTable)
          .where(notInArray(conversationsTable.id, usedIds.length > 0 ? usedIds : [-1]));
      }

      // ── 3. Find + purge orphaned messages (no parent conversation) ─────
      //   In normal operation these can't exist (FK + cascade), but check anyway.
      const validConvsAfter = await db
        .select({ id: conversationsTable.id })
        .from(conversationsTable);

      const validIds = validConvsAfter.map((c) => c.id);

      if (validIds.length > 0) {
        const strayMsgs = await db
          .select({ id: messagesTable.id })
          .from(messagesTable)
          .where(notInArray(messagesTable.conversationId, validIds));

        orphanedMessages = strayMsgs.length;

        if (strayMsgs.length > 0) {
          await db
            .delete(messagesTable)
            .where(notInArray(messagesTable.conversationId, validIds));
        }
      }
    } catch (dbErr) {
      req.log.warn({ dbErr }, "Orphan-purge query failed — non-fatal, continuing");
    }

    // ── 4. Hardware assessment ─────────────────────────────────────────────
    const hardwareStatus = computeHardwareStatus(cpuCores, ramGb);

    // ── 5. J.'s diagnostic summary ─────────────────────────────────────────
    const hwDesc =
      cpuCores || ramGb
        ? `CPU: ${cpuCores ?? "?"}×cores, RAM: ${ramGb ?? "?"}GB`
        : "hardware telemetry not available";

    const diagPrompt = [
      `System diagnostic clearance — report in J.'s voice (2 sentences max, under 50 words).`,
      `Hardware: ${hwDesc}. Status: ${hardwareStatus.toUpperCase()}.`,
      orphanedConversations > 0
        ? `${orphanedConversations} orphaned conversation record(s) and ${orphanedMessages} orphaned message(s) were found and purged from the database.`
        : `No orphaned records found in the database.`,
      sessionExists
        ? "Returning operator detected — session restored."
        : "New operator detected — fresh session initialized.",
      `Be dry, precise, and characteristically British. End with one hardware-specific recommendation.`,
    ].join(" ");

    const jResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are J. from B.L.U.E.-J. — dry wit, precise, British. Keep it under 55 words.",
        },
        { role: "user", content: diagPrompt },
      ],
      temperature: 0.7,
      max_tokens: 120,
    });

    const jSummary =
      jResponse.choices[0]?.message?.content ?? "Systems nominal. Shall we proceed?";

    res.json({
      orphanedConversations,
      orphanedMessages,
      sessionExists,
      hardwareStatus,
      jSummary,
    });
  } catch (err) {
    req.log.error({ err }, "Diagnostic error");
    res.status(500).json({
      orphanedConversations: 0,
      orphanedMessages: 0,
      sessionExists: false,
      hardwareStatus: "adequate" as const,
      jSummary: "Diagnostic inconclusive. Shall we proceed regardless?",
    });
  }
});

export default router;
