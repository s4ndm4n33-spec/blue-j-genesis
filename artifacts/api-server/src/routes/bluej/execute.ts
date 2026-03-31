import { Router, type IRouter } from "express";
import { spawn } from "child_process";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { existsSync } from "fs";

const router: IRouter = Router();

const PYTHON_BIN = "/home/runner/.nix-profile/bin/python3";
const GPP_BIN    = "/nix/store/q5qbngdpv0n9zgh42d3ssprj31cf779j-replit-runtime-path/bin/g++";
const NODE_BIN   = process.execPath; // node itself

const EXEC_TIMEOUT_MS = 10_000;
const MAX_OUTPUT_BYTES = 64 * 1024; // 64 KB

const TMP_DIR = "/tmp/bluej-exec";

async function ensureTmpDir() {
  if (!existsSync(TMP_DIR)) {
    await mkdir(TMP_DIR, { recursive: true });
  }
}

interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  runtimeMs: number;
  timedOut: boolean;
}

function runProcess(cmd: string, args: string[], timeoutMs: number): Promise<RunResult> {
  return new Promise((resolve) => {
    const start = Date.now();
    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const proc = spawn(cmd, args, {
      env: {
        // Minimal env — no user credentials, no home shortcuts, no network tokens
        PATH: "/usr/local/bin:/usr/bin:/bin",
        PYTHONDONTWRITEBYTECODE: "1",
        PYTHONIOENCODING: "utf-8",
      },
      timeout: timeoutMs,
    });

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill("SIGKILL");
    }, timeoutMs);

    proc.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf-8");
      if (stdout.length > MAX_OUTPUT_BYTES) {
        stdout = stdout.slice(0, MAX_OUTPUT_BYTES) + "\n[output truncated — exceeded 64KB]";
        proc.kill("SIGKILL");
      }
    });

    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf-8");
      if (stderr.length > MAX_OUTPUT_BYTES) {
        stderr = stderr.slice(0, MAX_OUTPUT_BYTES) + "\n[error output truncated]";
        proc.kill("SIGKILL");
      }
    });

    proc.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: code ?? -1,
        runtimeMs: Date.now() - start,
        timedOut,
      });
    });

    proc.on("error", (err) => {
      clearTimeout(timer);
      resolve({
        stdout: "",
        stderr: err.message,
        exitCode: -1,
        runtimeMs: Date.now() - start,
        timedOut: false,
      });
    });
  });
}

router.post("/", async (req, res) => {
  const { code, language } = req.body as { code: string; language: string };

  if (!code?.trim()) {
    res.status(400).json({ error: "No code provided." });
    return;
  }

  await ensureTmpDir();
  const id = randomUUID();

  try {
    let result: RunResult;

    if (language === "python") {
      const filePath = join(TMP_DIR, `${id}.py`);
      await writeFile(filePath, code, "utf-8");
      result = await runProcess(PYTHON_BIN, [filePath], EXEC_TIMEOUT_MS);
      await unlink(filePath).catch(() => {});

    } else if (language === "javascript") {
      const filePath = join(TMP_DIR, `${id}.js`);
      await writeFile(filePath, code, "utf-8");
      result = await runProcess(NODE_BIN, [filePath], EXEC_TIMEOUT_MS);
      await unlink(filePath).catch(() => {});

    } else if (language === "cpp") {
      const srcPath = join(TMP_DIR, `${id}.cpp`);
      const binPath = join(TMP_DIR, `${id}.out`);
      await writeFile(srcPath, code, "utf-8");

      // Compile step
      const compileResult = await runProcess(GPP_BIN, [
        "-O2", "-std=c++17", "-o", binPath, srcPath,
        "-Wall", "-Wextra", "-Werror=return-type",
      ], 20_000);

      if (compileResult.exitCode !== 0) {
        await unlink(srcPath).catch(() => {});
        res.json({
          stdout: "",
          stderr: compileResult.stderr || "Compilation failed.",
          exitCode: compileResult.exitCode,
          runtimeMs: compileResult.runtimeMs,
          timedOut: false,
          phase: "compile",
        });
        return;
      }

      // Run step
      result = await runProcess(binPath, [], EXEC_TIMEOUT_MS);
      await unlink(srcPath).catch(() => {});
      await unlink(binPath).catch(() => {});

    } else {
      res.status(400).json({ error: `Unsupported language: ${language}` });
      return;
    }

    res.json({
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: result.exitCode,
      runtimeMs: result.runtimeMs,
      timedOut: result.timedOut,
      phase: "run",
    });
  } catch (err) {
    req.log.error({ err }, "Execute error");
    res.status(500).json({ error: "Execution failed unexpectedly." });
  }
});

export default router;
