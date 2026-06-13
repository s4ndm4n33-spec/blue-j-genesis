import { Router, type IRouter } from "express";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import {
  checkSafety,
  ensureTmpDir,
  spawnProcess,
  TMP_DIR,
  PYTHON_BIN,
  GPP_BIN,
  GCC_BIN,
  NODE_BIN,
} from "./executor.js";

const router: IRouter = Router();

// ─── Route ───────────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const { code, language } = req.body as { code: string; language: string };

  if (!code?.trim()) {
    res.status(400).json({ error: "No code provided." });
    return;
  }

  const supportedLangs = ["python", "javascript", "cpp", "c", "gcode"];
  if (!supportedLangs.includes(language)) {
    res.status(400).json({ error: `Unsupported language: ${language}` });
    return;
  }

  // Safety filter first
  const blocked = checkSafety(code, language);
  if (blocked) {
    res.json({
      stdout: "",
      stderr: `[SANDBOX] ${blocked}`,
      exitCode: 1,
      runtimeMs: 0,
      timedOut: false,
      phase: "blocked",
      engine: "sandbox-filter",
    });
    return;
  }

  await ensureTmpDir();
  const id = randomUUID();

  try {
    if (language === "python") {
      const f = join(TMP_DIR, `${id}.py`);
      await writeFile(f, code, "utf-8");
      const r = await spawnProcess(PYTHON_BIN, [f]);
      await unlink(f).catch(() => {});
      res.json({ ...r, phase: "run", engine: "server" });

    } else if (language === "javascript") {
      const f = join(TMP_DIR, `${id}.js`);
      await writeFile(f, code, "utf-8");
      const r = await spawnProcess(NODE_BIN, [f]);
      await unlink(f).catch(() => {});
      res.json({ ...r, phase: "run", engine: "server" });

    } else if (language === "cpp") {
      const src = join(TMP_DIR, `${id}.cpp`);
      const bin = join(TMP_DIR, `${id}.out`);
      await writeFile(src, code, "utf-8");
      const compile = await spawnProcess(GPP_BIN, ["-O2", "-std=c++17", "-o", bin, src, "-Wall"]);
      await unlink(src).catch(() => {});
      if (compile.exitCode !== 0) {
        res.json({ ...compile, phase: "compile", engine: "server" });
        return;
      }
      const run = await spawnProcess(bin, []);
      await unlink(bin).catch(() => {});
      res.json({ ...run, phase: "run", engine: "server" });

    } else if (language === "c") {
      const src = join(TMP_DIR, `${id}.c`);
      const bin = join(TMP_DIR, `${id}.out`);
      await writeFile(src, code, "utf-8");
      const compile = await spawnProcess(GCC_BIN, ["-O2", "-std=c99", "-o", bin, src, "-Wall"]);
      await unlink(src).catch(() => {});
      if (compile.exitCode !== 0) {
        res.json({ ...compile, phase: "compile", engine: "server" });
        return;
      }
      const run = await spawnProcess(bin, []);
      await unlink(bin).catch(() => {});
      res.json({ ...run, phase: "run", engine: "server" });

    } else if (language === "gcode") {
      const f = join(TMP_DIR, `${id}.nc`);
      await writeFile(f, code, "utf-8");
      // G-code is a descriptive language; we validate and simulate
      const lines = code.split("\n").map(l => l.trim()).filter(l => l && !l.startsWith("("));
      const issues: string[] = [];
      const axes: Record<string, number> = {};
      for (const line of lines) {
        const cmd = line.split(" ")[0];
        const args = line.split(" ").slice(1);
        if (!/^[GM]\d+(?:\.\d+)?$/.test(cmd)) {
          issues.push(`Unrecognized command: ${cmd}`);
        }
        for (const arg of args) {
          if (!/^[A-Z][-+]?\d+(?:\.\d+)?$/.test(arg)) {
            issues.push(`Invalid argument: ${arg} in line ${line}`);
          }
        }
        if (cmd === "G1" || cmd === "G0") {
          for (const arg of args) {
            const axis = arg[0];
            const val = parseFloat(arg.slice(1));
            if (!isNaN(val)) axes[axis] = val;
          }
        }
      }
      await unlink(f).catch(() => {});
      const stdout = [
        `G-code parsed: ${lines.length} valid lines`,
        `Commands found: ${[...new Set(lines.map(l => l.split(" ")[0]))].join(", ")}`,
        `Final position: ${Object.entries(axes).map(([k, v]) => `${k}${v.toFixed(2)}`).join(" ")}`,
        issues.length ? `\nWarnings: ${issues.join("; ")}` : "",
        "\n[G-code is a control language for CNC/3D printers — validated, not compiled]",
      ].join("\n");
      res.json({ stdout, stderr: "", exitCode: issues.length > 0 ? 1 : 0, runtimeMs: 0, timedOut: false, phase: "validate", engine: "simulator" });
    }
  } catch (err) {
    req.log.error({ err }, "Execute error");
    res.status(500).json({ error: "Execution failed unexpectedly." });
  }
});

export default router;
