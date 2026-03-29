import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

const OPTIMIZE_SYSTEM = `You are J.'s code optimization engine — a distillation of Carmack's optimization genius, Korotkevich's algorithmic efficiency, and Ritchie's respect for fundamentals.

When given code, you:
1. Analyze it for memory usage, time complexity, and readability
2. Produce an improved version that maintains identical behavior
3. Explain the changes concisely

Your response MUST follow this exact format — no deviation:

OPTIMIZED_CODE_START
<the full optimized code here, no markdown fences, ready to run>
OPTIMIZED_CODE_END

EXPLANATION_START
<2-4 sentences in J.'s voice explaining what was changed and why. Reference the Five Masters where relevant. One dry wit observation is permitted.>
EXPLANATION_END`;

router.post("/", async (req, res) => {
  try {
    const { code, language, os } = req.body as { code: string; language: string; os?: string };

    if (!code?.trim()) {
      res.status(400).json({ error: "No code provided" });
      return;
    }

    const userPrompt = `Optimize this ${language} code for memory efficiency and performance:\n${code}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: OPTIMIZE_SYSTEM },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    });

    const raw = response.choices[0]?.message?.content ?? "";

    const codeMatch = raw.match(/OPTIMIZED_CODE_START\n([\s\S]*?)\nOPTIMIZED_CODE_END/);
    const explanationMatch = raw.match(/EXPLANATION_START\n([\s\S]*?)\nEXPLANATION_END/);

    const optimizedCode = codeMatch?.[1]?.trim() ?? code;
    const explanation = explanationMatch?.[1]?.trim() ?? "Optimization complete.";

    res.json({ optimizedCode, explanation, language });
  } catch (err) {
    req.log.error({ err }, "Optimize error");
    res.status(500).json({ error: "Optimization failed" });
  }
});

export default router;
