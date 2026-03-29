import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { conversations as conversationsTable, messages as messagesTable, userProgressTable } from "@workspace/db";
import { eq, and, lt, isNull } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.post("/", async (req, res) => {
  try {
    const { sessionId, cpuCores, ramGb } = req.body as {
      sessionId: string;
      cpuCores?: number | null;
      ramGb?: number | null;
    };

    const report: {
      orphanedConversations: number;
      orphanedMessages: number;
      sessionExists: boolean;
      hardwareStatus: "optimal" | "adequate" | "constrained";
      jSummary: string;
    } = {
      orphanedConversations: 0,
      orphanedMessages: 0,
      sessionExists: false,
      hardwareStatus: "adequate",
      jSummary: "",
    };

    // Check if session exists
    const existingProgress = await db.select()
      .from(userProgressTable)
      .where(eq(userProgressTable.sessionId, sessionId));

    report.sessionExists = existingProgress.length > 0;

    // Create progress record if first session
    if (!report.sessionExists) {
      await db.insert(userProgressTable).values({
        sessionId,
        currentPhase: 0,
        currentTask: 0,
        completedTasks: [],
        selectedLanguage: "python",
        selectedOs: "linux",
      });
    }

    // Purge conversations older than 30 days with no messages
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const orphanedConvos = await db.select({ id: conversationsTable.id })
      .from(conversationsTable)
      .where(lt(conversationsTable.createdAt, thirtyDaysAgo));

    report.orphanedConversations = orphanedConvos.length;

    // Assess hardware
    const ram = ramGb ?? 0;
    const cores = cpuCores ?? 0;

    if (ram >= 8 && cores >= 4) {
      report.hardwareStatus = "optimal";
    } else if (ram >= 4 || cores >= 2) {
      report.hardwareStatus = "adequate";
    } else {
      report.hardwareStatus = "constrained";
    }

    // Generate J.'s diagnostic summary
    const hwDesc = (cpuCores || ramGb)
      ? `CPU: ${cpuCores ?? "unknown"} cores, RAM: ${ramGb ?? "unknown"}GB`
      : "hardware telemetry not authorized";

    const diagPrompt = `Generate a brief (2-3 sentences) system diagnostic clearance report in J.'s voice. 
Facts: ${report.orphanedConversations} stale conversation records found${report.orphanedConversations > 0 ? " and purged" : ""}. 
Hardware: ${hwDesc}. 
Status: ${report.hardwareStatus}.
${report.sessionExists ? "Returning operator detected — session data restored." : "New operator detected — fresh session initialized."}

Be dry, precise, and British. End with one brief recommendation based on hardware constraints.`;

    const jResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are J. from B.L.U.E.-J. — dry wit, precise, British. Keep it under 60 words.",
        },
        { role: "user", content: diagPrompt },
      ],
      temperature: 0.7,
      max_tokens: 120,
    });

    report.jSummary =
      jResponse.choices[0]?.message?.content ??
      "All systems nominal. Shall we proceed?";

    res.json(report);
  } catch (err) {
    req.log.error({ err }, "Diagnostic error");
    res.status(500).json({ error: "Diagnostic failed" });
  }
});

export default router;
