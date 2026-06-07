import { Router, type IRouter } from "express";
import { promisify } from "util";
import { execFile } from "child_process";
import { writeFile, readFile, unlink } from "fs/promises";
import { randomUUID } from "crypto";

const execFileAsync = promisify(execFile);
const router: IRouter = Router();

async function detectPrettier(): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("npx", ["prettier", "--version"], { timeout: 5000 });
    if (stdout.trim()) return "npx";
  } catch {
    // ignore
  }
  try {
    const { stdout } = await execFileAsync("pnpm", ["prettier", "--version"], { timeout: 5000 });
    if (stdout.trim()) return "pnpm";
  } catch {
    // ignore
  }
  try {
    const { stdout } = await execFileAsync("prettier", ["--version"], { timeout: 5000 });
    if (stdout.trim()) return "global";
  } catch {
    // ignore
  }
  return null;
}

function detectLang(code: string, explicitLang?: string): string {
  if (explicitLang) return explicitLang;
  const trimmed = code.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("const ") || trimmed.includes("function ") || trimmed.includes("=>")) return "babel";
  if (trimmed.includes("import ") && trimmed.includes("from ")) return "babel";
  if (trimmed.includes("<?xml")) return "xml";
  if (trimmed.includes("<!DOCTYPE") || trimmed.includes("<html")) return "html";
  if (trimmed.includes("def ") || trimmed.includes("print(")) return "python";
  if (trimmed.includes("#include") || trimmed.includes("int main(")) return "cpp";
  if (trimmed.includes("package main") || trimmed.includes("func main(")) return "go";
  return "babel";
}

router.post("/", async (req, res) => {
  try {
    const { code, language } = req.body as { code: string; language?: string };
    if (!code || typeof code !== "string") {
      res.status(400).json({ error: "Missing code" });
      return;
    }

    const prettier = await detectPrettier();
    if (!prettier) {
      res.status(503).json({ error: "Prettier not available. Install with `npm install -g prettier` or include in project." });
      return;
    }

    const lang = detectLang(code, language);
    const tmpPath = `/tmp/prettier-${randomUUID()}.tmp`;
    await writeFile(tmpPath, code, "utf-8");

    try {
      const cmd = prettier === "npx" ? "npx" : prettier === "pnpm" ? "pnpm" : "prettier";
      const args = prettier === "global" ? ["--parser", lang, tmpPath] : ["prettier", "--parser", lang, tmpPath];
      const { stdout, stderr } = await execFileAsync(cmd, args, { timeout: 10000 });
      if (stderr) {
        req.log.warn({ stderr }, "Prettier stderr");
      }
      res.json({ formatted: stdout, language: lang });
    } catch (err: any) {
      const parseErr = err?.stderr || err?.message || "";
      res.status(422).json({ error: "Prettier parse error", detail: parseErr.slice(0, 500) });
    } finally {
      await unlink(tmpPath).catch(() => {});
    }
  } catch (err) {
    req.log.error({ err }, "Prettier format error");
    res.status(500).json({ error: "Format failed" });
  }
});

export default router;
