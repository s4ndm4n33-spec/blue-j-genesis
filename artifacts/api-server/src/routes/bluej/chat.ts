import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { db } from "@workspace/db";
import { conversations as conversationsTable, messages as messagesTable, userProgressTable } from "@workspace/db";
import { ChatWithJBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { buildSystemPrompt, buildSafetyCheck } from "./j-personality.js";
import { CURRICULUM } from "./curriculum.js";

const router: IRouter = Router();

router.post("/", async (req, res) => {
  try {
    const body = ChatWithJBody.parse(req.body);
    const { sessionId, message, language, os, phaseIndex, taskIndex, hardwareInfo } = body;
    const learnerMode = (req.body.learnerMode as "kids" | "teen" | "adult-beginner" | "advanced") ?? "adult-beginner";
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

    const existingMessages = await db.select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, conversationId))
      .orderBy(messagesTable.createdAt);

    const messageHistory = existingMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const currentPhase = CURRICULUM[phaseIndex] ?? null;
    const currentTask = currentPhase?.tasks[taskIndex] ?? null;

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
    });

    await db.insert(messagesTable).values({
      conversationId,
      role: "user",
      content: message,
    });

    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messageHistory.slice(-20).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    let fullResponse = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    await db.insert(messagesTable).values({
      conversationId,
      role: "assistant",
      content: fullResponse,
    });

    await db.update(userProgressTable)
      .set({
        conversationId,
        selectedLanguage: language,
        selectedOs: os,
        updatedAt: new Date(),
      })
      .where(eq(userProgressTable.sessionId, sessionId));

    res.write(`data: ${JSON.stringify({ done: true, conversationId })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Chat error");
    if (!res.headersSent) {
      res.status(500).json({ error: "Chat failed" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Internal error", done: true })}\n\n`);
      res.end();
    }
  }
});

export default router;
