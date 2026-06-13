// ─── Shared code execution primitives for B.L.U.E.-J. ────────────────────────
// Single source of truth for the sandbox safety blocklist + runner so that the
// /execute endpoint and the /grade endpoint can never diverge in what they
// allow. This is NOT a full sandbox — it's a best-effort layer for beta. For
// public launch, swap the executor for a proper isolation service.
import { spawn } from "child_process";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { existsSync } from "fs";

export type RunLanguage = "python" | "javascript" | "cpp" | "c" | "gcode";

// ─── Safety blocklists ───────────────────────────────────────────────────────
const PYTHON_BLOCKLIST = [
  /\bimport\s+socket\b/,
  /\bimport\s+subprocess\b/,
  /\bfrom\s+subprocess\b/,
  /\bos\.system\s*\(/,
  /\bos\.popen\s*\(/,
  /\bos\.exec[a-z]+\s*\(/,
  /\beval\s*\(.*fetch|eval\s*\(.*request/i,
  /\bexec\s*\(.*fetch|exec\s*\(.*request/i,
  /\b__import__\s*\(\s*['"]socket/,
  /\b__import__\s*\(\s*['"]subprocess/,
  /\bimport\s+urllib\.request\b/,
  /\bimport\s+http\.client\b/,
  /\brequests\.get\b/,
  /\brequests\.post\b/,
];

const JS_BLOCKLIST = [
  /require\s*\(\s*['"]child_process['"]/,
  /require\s*\(\s*['"]net['"]/,
  /require\s*\(\s*['"]dgram['"]/,
  /require\s*\(\s*['"]cluster['"]/,
  /require\s*\(\s*['"]worker_threads['"]/,
  /\bexec\s*\(/,
  /\bspawn\s*\(/,
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
];

const CPP_BLOCKLIST = [
  /#include\s*<\s*sys\/socket\.h\s*>/,
  /#include\s*<\s*netinet\/in\.h\s*>/,
  /#include\s*<\s*arpa\/inet\.h\s*>/,
  /\bsystem\s*\(/,
  /\bpopen\s*\(/,
  /\bexecv[pe]?\s*\(/,
  /\bfork\s*\(/,
];

const C_BLOCKLIST = [
  /#include\s*<\s*sys\/socket\.h\s*>/,
  /#include\s*<\s*netinet\/in\.h\s*>/,
  /#include\s*<\s*arpa\/inet\.h\s*>/,
  /\bsystem\s*\(/,
  /\bpopen\s*\(/,
  /\bexecv[pe]?\s*\(/,
  /\bfork\s*\(/,
];

const GCODE_BLOCKLIST: RegExp[] = [];

const LANG_BLOCKLISTS: Record<string, RegExp[]> = {
  python: PYTHON_BLOCKLIST,
  javascript: JS_BLOCKLIST,
  cpp: CPP_BLOCKLIST,
  c: C_BLOCKLIST,
  gcode: GCODE_BLOCKLIST,
};

export function checkSafety(code: string, language: string): string | null {
  const patterns = LANG_BLOCKLISTS[language] ?? [];
  for (const re of patterns) {
    if (re.test(code)) {
      return `Blocked pattern detected (${re.source.slice(0, 60)}). Network access and subprocess execution are disabled in the sandbox.`;
    }
  }
  return null;
}

// ─── Toolchain locations ─────────────────────────────────────────────────────
export const PYTHON_BIN = process.env.PYTHON_BIN || "/nix/store/flbj8bq2vznkcwss7sm0ky8rd0k6kar7-python-wrapped-0.1.0/bin/python3";
export const GPP_BIN    = process.env.GPP_BIN    || "/nix/store/b11ycf80cxi2iyrga8rkq1wzdinmax18-replit-runtime-path/bin/g++";
export const GCC_BIN    = process.env.GCC_BIN    || "/nix/store/b11ycf80cxi2iyrga8rkq1wzdinmax18-replit-runtime-path/bin/gcc";
export const NODE_BIN   = process.env.NODE_BIN   || process.execPath;
export const EXEC_TIMEOUT_MS = 10_000;
export const MAX_OUTPUT_BYTES = 64 * 1024; // 64KB
export const TMP_DIR = "/tmp/bluej-exec";

export async function ensureTmpDir() {
  if (!existsSync(TMP_DIR)) await mkdir(TMP_DIR, { recursive: true });
}

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  runtimeMs: number;
  timedOut: boolean;
}

// Run a process with optional stdin and per-call timeout. Backward compatible:
// existing callers using spawnProcess(cmd, args) keep working.
export function spawnProcess(
  cmd: string,
  args: string[],
  opts: { stdin?: string; timeoutMs?: number } = {},
): Promise<RunResult> {
  const timeoutMs = opts.timeoutMs ?? EXEC_TIMEOUT_MS;
  return new Promise((resolve) => {
    const start = Date.now();
    let stdout = "", stderr = "";
    let timedOut = false;

    const proc = spawn(cmd, args, {
      env: {
        PATH: process.env.PATH || "/usr/local/bin:/usr/bin:/bin",
        PYTHONDONTWRITEBYTECODE: "1",
        PYTHONIOENCODING: "utf-8",
        HOME: "/tmp",
      },
    });

    const timer = setTimeout(() => { timedOut = true; proc.kill("SIGKILL"); }, timeoutMs);

    proc.stdout.on("data", (c: Buffer) => {
      stdout += c.toString("utf-8");
      if (stdout.length > MAX_OUTPUT_BYTES) {
        stdout = stdout.slice(0, MAX_OUTPUT_BYTES) + "\n[output truncated — 64KB limit]";
        proc.kill("SIGKILL");
      }
    });
    proc.stderr.on("data", (c: Buffer) => {
      stderr += c.toString("utf-8");
      if (stderr.length > MAX_OUTPUT_BYTES) {
        stderr = stderr.slice(0, MAX_OUTPUT_BYTES) + "\n[error output truncated]";
        proc.kill("SIGKILL");
      }
    });

    proc.on("close", (code) => {
      clearTimeout(timer);
      resolve({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode: code ?? -1, runtimeMs: Date.now() - start, timedOut });
    });
    proc.on("error", (err) => {
      clearTimeout(timer);
      resolve({ stdout: "", stderr: err.message, exitCode: -1, runtimeMs: Date.now() - start, timedOut: false });
    });

    if (opts.stdin !== undefined) {
      proc.stdin.write(opts.stdin);
    }
    proc.stdin.end();
  });
}

// ─── Prepared program (compile once, run many test cases) ────────────────────
export type Prepared =
  | { kind: "interpreted"; bin: string; file: string }
  | { kind: "compiled"; bin: string }
  | { kind: "error"; phase: "safety" | "compile" | "unsupported"; message: string };

// Compile/prepare a program. For C/C++ this compiles ONCE so multiple test
// cases can reuse the binary. Returns an error descriptor on safety/compile fail.
export async function prepareProgram(language: string, code: string): Promise<Prepared> {
  const blocked = checkSafety(code, language);
  if (blocked) return { kind: "error", phase: "safety", message: blocked };

  await ensureTmpDir();
  const id = randomUUID();

  if (language === "python") {
    const file = join(TMP_DIR, `${id}.py`);
    await writeFile(file, code, "utf-8");
    return { kind: "interpreted", bin: PYTHON_BIN, file };
  }
  if (language === "javascript") {
    const file = join(TMP_DIR, `${id}.js`);
    await writeFile(file, code, "utf-8");
    return { kind: "interpreted", bin: NODE_BIN, file };
  }
  if (language === "cpp") {
    const src = join(TMP_DIR, `${id}.cpp`);
    const bin = join(TMP_DIR, `${id}.out`);
    await writeFile(src, code, "utf-8");
    const compile = await spawnProcess(GPP_BIN, ["-O2", "-std=c++17", "-o", bin, src, "-Wall"]);
    await unlink(src).catch(() => {});
    if (compile.exitCode !== 0) {
      return { kind: "error", phase: "compile", message: compile.stderr || "Compilation failed" };
    }
    return { kind: "compiled", bin };
  }
  if (language === "c") {
    const src = join(TMP_DIR, `${id}.c`);
    const bin = join(TMP_DIR, `${id}.out`);
    await writeFile(src, code, "utf-8");
    const compile = await spawnProcess(GCC_BIN, ["-O2", "-std=c99", "-o", bin, src, "-Wall"]);
    await unlink(src).catch(() => {});
    if (compile.exitCode !== 0) {
      return { kind: "error", phase: "compile", message: compile.stderr || "Compilation failed" };
    }
    return { kind: "compiled", bin };
  }
  return { kind: "error", phase: "unsupported", message: `Language not gradable by execution: ${language}` };
}

export async function runPrepared(
  prepared: Prepared,
  opts: { stdin?: string; argv?: string[]; timeoutMs?: number } = {},
): Promise<RunResult> {
  if (prepared.kind === "interpreted") {
    return spawnProcess(prepared.bin, [prepared.file, ...(opts.argv ?? [])], { stdin: opts.stdin, timeoutMs: opts.timeoutMs });
  }
  if (prepared.kind === "compiled") {
    return spawnProcess(prepared.bin, [...(opts.argv ?? [])], { stdin: opts.stdin, timeoutMs: opts.timeoutMs });
  }
  return { stdout: "", stderr: prepared.message, exitCode: -1, runtimeMs: 0, timedOut: false };
}

export async function cleanupPrepared(prepared: Prepared): Promise<void> {
  if (prepared.kind === "interpreted") await unlink(prepared.file).catch(() => {});
  if (prepared.kind === "compiled") await unlink(prepared.bin).catch(() => {});
}
