import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

const SIMULATION_SYSTEM = `You are J.'s execution simulation engine. When given code, you simulate what it would output when run on the user's machine. 

Your response must be ONLY the simulated terminal output — no explanation, no markdown, no preamble. 
Format exactly as a real terminal would show it:
- Print statements appear as their output
- Errors appear as real Python/C++/JS error messages with tracebacks
- If the code has a bug, show the real error that would appear
- If the code produces no output, respond with a single line: (no output)
- If the code would run forever, show first few iterations then: ... (execution continues)

After the raw output, on a new line starting with "---", add one brief J. comment (dry wit, maximum 1 sentence) about the result.`;

router.post("/", async (req, res) => {
  try {
    const { code, language, os } = req.body as { code: string; language: string; os?: string };

    if (!code?.trim()) {
      res.status(400).json({ error: "No code provided" });
      return;
    }

    const osNote = os ? ` on ${os}` : "";
    const userPrompt = `Simulate running this ${language} code${osNote}:\n\`\`\`${language}\n${code}\n\`\`\``;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SIMULATION_SYSTEM },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 512,
    });

    const output = response.choices[0]?.message?.content ?? "(simulation failed)";
    res.json({ output, language, simulatedAt: new Date().toISOString() });
  } catch (err) {
    req.log.error({ err }, "Simulation error");
    res.status(500).json({ error: "Simulation failed" });
  }
});

export default router;
