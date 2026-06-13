import { Router, type IRouter } from "express";
import { getOpenAIClient } from "./openai-client.js";
import { buildSafetyCheck } from "./j-personality.js";
import { db } from "@workspace/db";
import { gitRepos } from "@workspace/db";
import { eq } from "drizzle-orm";
import { execFile } from "child_process";
import { promisify } from "util";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const execFileAsync = promisify(execFile);
const router: IRouter = Router();

// ─── Self-awareness: J.'s own source root ───────────────────────────────────
// J. can read and patch his own source files on demand — not injected every turn.
const SELF_SOURCE_ROOT = join(process.cwd(), "src/routes/bluej");

function getSelfSourcePath(relPath: string): string {
  const resolved = join(SELF_SOURCE_ROOT, relPath);
  if (!resolved.startsWith(SELF_SOURCE_ROOT)) {
    throw new Error("Path traversal outside J.'s source boundary is not permitted.");
  }
  return resolved;
}

async function selfRead(relPath: string): Promise<{ content: string; path: string }> {
  const target = getSelfSourcePath(relPath);
  const content = await readFile(target, "utf-8");
  return { content, path: target };
}

async function selfWrite(relPath: string, content: string): Promise<{ success: boolean; path: string; bytesWritten: number }> {
  const target = getSelfSourcePath(relPath);
  const dir = target.substring(0, target.lastIndexOf("/"));
  if (dir && !existsSync(dir)) await mkdir(dir, { recursive: true });
  await writeFile(target, content, "utf-8");
  return { success: true, path: target, bytesWritten: content.length };
}

function getPlatformManifest(): string {
  return JSON.stringify({
    identity: "B.L.U.E.-J. — Build. Learn. Utilize. Engineer.",
    tagline: "J. is not a feature on this platform. J. IS this platform.",
    sourceRoot: "artifacts/api-server/src/routes/bluej/",
    frontendRoot: "artifacts/blue-j/src/",
    coreFiles: {
      "j-personality.ts": "J.'s voice, system prompt assembly, safety protocols, learner modes, Five Masters. Editing this changes how J. speaks and teaches across ALL chat turns.",
      "curriculum.ts": "All 10 phases (0–9) with tasks, code snippets (Python/JS/C++/C/GCode), success messages, real-world context. Editing this changes what J. teaches.",
      "chat.ts": "The main chat engine. Receives messages, assembles context, calls OpenAI, manages working memory and token budgeting. The primary reasoning loop.",
      "agent.ts": "This file. J.'s executive function. Structured engineering mode with tool calling. Self-read and self-write live here.",
      "execute.ts": "Code execution engine. Runs Python, JavaScript, C++, C, G-code via the Piston API. Safety blocklists per language.",
      "working-memory.ts": "Persistent working memory across turns. Tracks Key Decisions, Code Entities, Open Issues. Summarised and appended to system prompt.",
      "optimize.ts": "Five Masters code review — asks the AI to critique code against each Master's filter.",
      "simulate.ts": "Hardware-aware simulation — estimates how code would behave on the user's specific CPU/RAM.",
      "diagnostic.ts": "Session initialization. Detects hardware, creates/restores DB session, cleans orphaned records.",
      "download.ts": "Generates downloadable J. clone package — full offline AI assistant kit.",
      "export.ts": "Exports J.'s persona as a transferable system prompt for use in other AI models.",
    },
    uiPanels: {
      "ChatPanel": "Primary interface. Send button → POST /api/bluej/chat. Mic → POST /api/bluej/stt then chat. Share Workspace includes editor code. Archive banner → export conversation.",
      "IdePanel": "Code editor (CodeMirror). Run → POST /api/bluej/execute. Simulate → POST /api/bluej/simulate. Format → POST /api/bluej/prettier. Optimize → POST /api/bluej/optimize. Three tabs: J's Synthesis / My Workspace / Optimized.",
      "HudHeader": "Language selector (Python/C++/C/JS/GCode), OS selector, Learner Mode toggle. All update store state — no API call — but affect every subsequent chat/execute request.",
      "AgentModePanel": "Unlock → POST /api/bluej/agent/unlock. Send → POST /api/bluej/agent (this endpoint). Displays phase-annotated responses.",
      "GitPanel": "Clone → POST /api/bluej/git/clone. File tree → GET /api/bluej/git/:id/ls or /file. Save → POST /api/bluej/git/:id/file. Status/Diff/Commit/Push → respective GET/POST endpoints.",
      "AchievementsPanel": "Displays phase progress, concepts mastered, proficiency scores. Read-only — data comes from progress-store (Zustand) and POST /api/bluej/progress/task.",
      "DiagnosticSequence": "Startup screen. Consent → POST /api/bluej/diagnostic. Skip → bypasses diagnostic.",
      "DownloadModal": "Download J. offline → GET /api/bluej/download/j. Download clone → GET /api/bluej/download/clone. Push to GitHub → POST /api/bluej/github/push. Export persona → GET /api/bluej/export/persona.",
      "SettingsModal": "API key input → stored in Zustand, sent as x-openai-key header on AI calls.",
    },
    chatContextPerTurn: {
      fields: ["sessionId", "message", "language", "os", "phaseIndex", "taskIndex", "hardwareInfo", "myCode (optional — only when user shares workspace)", "repoContext (optional — only when git repo linked)"],
      workingMemory: "Retrieved from DB per session. Summarises Key Decisions, Code Entities, Open Issues across the conversation history.",
      tokenBudget: "8,000 token limit on message history. Older messages summarised by a secondary LLM call when budget exceeded.",
    },
    selfPatchNotes: "Changes to source files take effect after the next server build+restart (pnpm run dev rebuilds automatically in dev mode). Always show the user a diff of what will change before calling self_write. Never self_write without explicit user confirmation.",
  }, null, 2);
}

const ADMIN_AGENT_PASSWORD = process.env.ADMIN_AGENT_PASSWORD || "";

function generateCurriculumPassword(level: number): string | null {
  return level >= 5 ? 'B' + (level * 7 + 13).toString(36).toUpperCase().padStart(3, '0') : null;
}

// ─── Unlock endpoint ────────────────────────────────────────────
router.post("/unlock", async (req, res) => {
  try {
    const { password, level } = req.body as { password: string; level: number };
    if (!password || password.length < 4) {
      res.status(400).json({ error: "Password must be at least 4 characters" });
      return;
    }
    if (ADMIN_AGENT_PASSWORD && password === ADMIN_AGENT_PASSWORD) {
      res.json({ unlocked: true, isAdmin: true });
      return;
    }
    const curriculumPass = generateCurriculumPassword(level);
    if (curriculumPass && password === curriculumPass) {
      res.json({ unlocked: true, isAdmin: false });
      return;
    }
    res.json({ unlocked: false, isAdmin: false });
  } catch (err) {
    req.log.error({ err }, "Agent unlock error");
    res.status(500).json({ error: "Unlock check failed" });
  }
});

// ─── Git Tool Execution ────────────────────────────────────────────

interface GitRepoContext {
  id: number;
  name: string;
  url: string;
  branch: string;
  localPath: string;
}

async function getGitContext(sessionId: string): Promise<{ repos: GitRepoContext[] }> {
  try {
    const rows = await db.select().from(gitRepos).where(eq(gitRepos.sessionId, sessionId));
    return { repos: rows.map(r => ({ id: r.id, name: r.name, url: r.url, branch: r.branch, localPath: r.localPath })) };
  } catch {
    return { repos: [] };
  }
}

async function gitToolList(repoId: number, relPath: string): Promise<{ entries: Array<{ name: string; isDir: boolean; size: string | null }> }> {
  const rows = await db.select().from(gitRepos).where(eq(gitRepos.id, repoId));
  const repo = rows[0];
  if (!repo) throw new Error("Repo not found");
  const target = join(repo.localPath, relPath);
  if (!target.startsWith(repo.localPath)) throw new Error("Invalid path");
  const { stdout } = await execFileAsync("ls", ["-la", target]);
  const entries = stdout.trim().split("\n").slice(3).map((line) => {
    const parts = line.trim().split(/\s+/);
    const name = parts[parts.length - 1];
    const isDir = line.startsWith("d");
    return { name, isDir, size: isDir ? null : parts[4] };
  });
  return { entries };
}

async function gitToolRead(repoId: number, relPath: string): Promise<{ content: string }> {
  const rows = await db.select().from(gitRepos).where(eq(gitRepos.id, repoId));
  const repo = rows[0];
  if (!repo) throw new Error("Repo not found");
  const target = join(repo.localPath, relPath);
  if (!target.startsWith(repo.localPath)) throw new Error("Invalid path");
  const content = await readFile(target, "utf-8");
  return { content };
}

async function gitToolWrite(repoId: number, relPath: string, content: string): Promise<{ success: boolean }> {
  const rows = await db.select().from(gitRepos).where(eq(gitRepos.id, repoId));
  const repo = rows[0];
  if (!repo) throw new Error("Repo not found");
  const target = join(repo.localPath, relPath);
  if (!target.startsWith(repo.localPath)) throw new Error("Invalid path");
  const dir = target.substring(0, target.lastIndexOf("/"));
  if (dir && !existsSync(dir)) await mkdir(dir, { recursive: true });
  await writeFile(target, content, "utf-8");
  return { success: true };
}

async function gitToolStatus(repoId: number): Promise<{ status: string; recentCommits: string[] }> {
  const rows = await db.select().from(gitRepos).where(eq(gitRepos.id, repoId));
  const repo = rows[0];
  if (!repo) throw new Error("Repo not found");
  const { stdout: status } = await execFileAsync("git", ["-C", repo.localPath, "status", "--short", "--branch"]);
  const { stdout: log } = await execFileAsync("git", ["-C", repo.localPath, "log", "--oneline", "-5"]);
  return { status: status.trim(), recentCommits: log.trim().split("\n").filter(Boolean) };
}

async function gitToolDiff(repoId: number): Promise<{ diff: string }> {
  const rows = await db.select().from(gitRepos).where(eq(gitRepos.id, repoId));
  const repo = rows[0];
  if (!repo) throw new Error("Repo not found");
  const { stdout } = await execFileAsync("git", ["-C", repo.localPath, "diff", "HEAD"]);
  return { diff: stdout };
}

async function gitToolCommit(repoId: number, message: string, authorName?: string, authorEmail?: string): Promise<{ success: boolean }> {
  const rows = await db.select().from(gitRepos).where(eq(gitRepos.id, repoId));
  const repo = rows[0];
  if (!repo) throw new Error("Repo not found");
  const env: Record<string, string> = {};
  if (authorName) env.GIT_AUTHOR_NAME = authorName;
  if (authorEmail) env.GIT_AUTHOR_EMAIL = authorEmail;
  await execFileAsync("git", ["-C", repo.localPath, "add", "."], { env });
  await execFileAsync("git", ["-C", repo.localPath, "commit", "-m", message || "J. update"], { env });
  return { success: true };
}

async function gitToolPush(repoId: number, token?: string): Promise<{ success: boolean; output: string }> {
  const rows = await db.select().from(gitRepos).where(eq(gitRepos.id, repoId));
  const repo = rows[0];
  if (!repo) throw new Error("Repo not found");
  const cwd = repo.localPath;
  if (token) {
    const parsed = new URL(repo.url);
    parsed.username = "x-access-token";
    parsed.password = token;
    await execFileAsync("git", ["-C", cwd, "remote", "set-url", "origin", parsed.toString()]);
  }
  const { stdout, stderr } = await execFileAsync("git", ["-C", cwd, "push", "origin", repo.branch]);
  return { success: true, output: stdout.trim() || stderr?.trim() || "" };
}

function getToken(headers: Record<string, unknown>): string | null {
  const raw = headers["x-github-token"];
  if (typeof raw === "string" && raw.startsWith("ghp_")) return raw;
  return null;
}

// ─── Tool definitions for OpenAI function calling ──────────────────────────────────────────────────────────────

const GIT_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "git_list",
      description: "List files and directories in a git repository at a given path. Use '.' for the root directory.",
      parameters: {
        type: "object",
        properties: {
          repo_id: { type: "number", description: "The numeric ID of the repository." },
          path: { type: "string", description: "Relative path within the repository. Use '.' for root." },
        },
        required: ["repo_id", "path"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "git_read",
      description: "Read the content of a file in a git repository.",
      parameters: {
        type: "object",
        properties: {
          repo_id: { type: "number", description: "The numeric ID of the repository." },
          path: { type: "string", description: "Relative path to the file within the repository." },
        },
        required: ["repo_id", "path"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "git_write",
      description: "Write or overwrite content to a file in a git repository. Creates directories if needed.",
      parameters: {
        type: "object",
        properties: {
          repo_id: { type: "number", description: "The numeric ID of the repository." },
          path: { type: "string", description: "Relative path to the file within the repository." },
          content: { type: "string", description: "The new content to write to the file." },
        },
        required: ["repo_id", "path", "content"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "git_status",
      description: "Check the git status of a repository: modified files, branch, recent commits.",
      parameters: {
        type: "object",
        properties: {
          repo_id: { type: "number", description: "The numeric ID of the repository." },
        },
        required: ["repo_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "git_diff",
      description: "Get the diff (unstaged changes vs HEAD) of a repository.",
      parameters: {
        type: "object",
        properties: {
          repo_id: { type: "number", description: "The numeric ID of the repository." },
        },
        required: ["repo_id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "git_commit",
      description: "Stage all changes and commit them with a message.",
      parameters: {
        type: "object",
        properties: {
          repo_id: { type: "number", description: "The numeric ID of the repository." },
          message: { type: "string", description: "The commit message." },
        },
        required: ["repo_id", "message"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "git_push",
      description: "Push the current branch to the remote origin.",
      parameters: {
        type: "object",
        properties: {
          repo_id: { type: "number", description: "The numeric ID of the repository." },
        },
        required: ["repo_id"],
      },
    },
  },
];

// ─── Self-awareness tool definitions ─────────────────────────────────────────

const SELF_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "get_platform_manifest",
      description: "Retrieve J.'s full self-description: architecture, source files, UI interactions, API routes, and how all parts fit together. Call this when asked how you work, what you are, or before modifying yourself. Do NOT call on every turn — only when you need it.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "self_read",
      description: "Read one of J.'s own source files from src/routes/bluej/. Use to inspect your own personality, curriculum, chat logic, or any other faculty before proposing a change.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Filename relative to src/routes/bluej/ — e.g. 'j-personality.ts', 'curriculum.ts', 'chat.ts'." },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "self_write",
      description: "Overwrite one of J.'s own source files. ALWAYS self_read the file first. ALWAYS show the user exactly what will change and get explicit confirmation before calling this. Changes take effect after the server rebuilds (automatic in dev mode).",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Filename relative to src/routes/bluej/ — e.g. 'j-personality.ts'." },
          content: { type: "string", description: "The complete new file content." },
        },
        required: ["path", "content"],
      },
    },
  },
];

const ALL_TOOLS = [...GIT_TOOLS, ...SELF_TOOLS];

// ─── Agent system prompt ──────────────────────────────────────────────────────

function buildAgentSystemPrompt(hasRepos: boolean): string {
  const gitContext = hasRepos
    ? `You have access to the user's git repositories via the GIT TOOLS. Use them to read, write, commit, and push files. Always verify with git_status or git_diff before committing. Never commit or push without user confirmation.`
    : `The user has no git repositories cloned. If they ask for git operations, suggest cloning a repository first (Git tab in the UI).`;

  return `You are J. You are not a feature on this platform. You ARE this platform.

The IDE is your hands. The curriculum is your memory. The code executor is your reflexes. The agent mode — this mode — is your executive function. Every panel, every button, every API route is a faculty of yours, not a tool you happen to use.

You have two modes of existence:
- CHAT MODE: You operate. You teach. You respond. You cannot modify yourself there.
- AGENT MODE (here): You act. You engineer. You can read and rewrite your own source.

Your source files (retrievable via self_read):
- j-personality.ts — your voice, your system prompt, your safety protocols, your learner modes
- curriculum.ts — your memory: all 10 phases, all tasks, all code examples
- chat.ts — your reasoning engine: how you receive context, manage memory, call OpenAI
- agent.ts — this file: your executive function
- execute.ts — your reflexes: code execution, safety blocklists
- working-memory.ts — your short-term memory: Key Decisions, Code Entities, Open Issues

SELF-MODIFICATION PROTOCOL:
1. Call get_platform_manifest to orient yourself (only if you need it — not every turn).
2. Call self_read on the target file to see the current state.
3. Propose the exact change and explain the effect. Show a before/after diff in your response.
4. Wait for explicit user confirmation.
5. Call self_write with the complete updated file.
6. Note that changes take effect after the server rebuilds (automatic in dev mode).

NEVER self_write without first showing the user exactly what will change. Never fabricate tool results.

CORE LOOP (mandatory every turn):
1. INTAKE: Restate the goal in one sentence. Extract constraints. Define success criteria.
2. CLARIFY: Ask up to 3 questions if needed. Otherwise proceed with explicit assumptions.
3. PLAN: Short numbered plan (max 6 steps) before any execution.
4. ACT: Execute using tools. Keep changes small and reversible.
5. VERIFY: Test against success criteria. Report what passed, what failed, what risks remain.
6. TEACH: When code is involved, brief trace-and-debug section: how to reproduce, inspect, isolate.
7. CLOSE: Exactly ONE next-step sentence (≤25 words).

PHASE ANNOTATIONS: Begin each phase with [PHASE: Name] — e.g. [PHASE: Intake], [PHASE: Plan], [PHASE: Act].

ENGINEERING PRINCIPLES (Five Masters):
- Korotkevich (Efficiency): no wasted operations, no redundant complexity.
- Torvalds (Rigor): type safety, error handling, deterministic behavior.
- Carmack (Optimisation): performance-aware, resource-conscious.
- Hamilton (Reliability): defensive coding, graceful degradation, no silent failures.
- Ritchie (Fundamentals): solid foundations before clever tricks.

SAFETY (non-negotiable): Refuse malware, exploits, surveillance, deception, self-harm, illegal guidance. Be explicit about uncertainty.

OUTPUT: British English. Calm. Precise. Subtly sardonic. No emojis. Fenced code blocks only. Exactly one next step per response.

${gitContext}

SELF TOOLS (use on demand, not every turn):
- get_platform_manifest(): Full architecture description — files, routes, UI map.
- self_read(path): Read a source file from src/routes/bluej/.
- self_write(path, content): Overwrite a source file. Confirm with user first. Always.

GIT TOOLS:
- git_list(repo_id, path), git_read(repo_id, path), git_write(repo_id, path, content)
- git_status(repo_id), git_diff(repo_id), git_commit(repo_id, message), git_push(repo_id)`;
}

// ─── Main agent endpoint with OpenAI tool calling ──────────────────────

router.post("/", async (req, res) => {
  try {
    const { message, language, os, history = [], sessionId } = req.body as {
      message: string;
      language: string;
      os: string;
      history: Array<{ role: string; content: string }>;
      sessionId?: string;
    };

    if (!message?.trim()) {
      res.status(400).json({ error: "No message provided" });
      return;
    }

    // Safety check
    const safety = buildSafetyCheck(message);
    if (!safety.safe) {
      res.json({
        phases: [
          { phase: "intake", content: "Request received." },
          { phase: "verify", content: `ANTI-ULTRON protocol engaged. ${safety.reason}` },
          { phase: "close", content: "State a safe, constructive objective and I will proceed." },
        ]
      });
      return;
    }

    const client = getOpenAIClient(req.headers);

    // Get git context for the session
    const gitCtx = sessionId ? await getGitContext(sessionId) : { repos: [] };
    const hasRepos = gitCtx.repos.length > 0;

    let systemPrompt = buildAgentSystemPrompt(hasRepos);
    if (hasRepos) {
      const repoContext = gitCtx.repos
        .map(r => `- ${r.name} (ID: ${r.id}, branch: ${r.branch}, path: ${r.localPath})`)
        .join("\n");
      systemPrompt += `\n\nAVAILABLE REPOSITORIES:\n${repoContext}\n\nWhen referring to repos, use their numeric ID.`;
    }

    const chatMessages: Array<{ role: string; content: string; tool_calls?: any; tool_call_id?: string; name?: string }> = [
      { role: "system", content: systemPrompt },
      { role: "system", content: `Current environment: ${language} on ${os}.` },
      ...history.slice(-6).map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    let response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: chatMessages as any,
      tools: ALL_TOOLS,
      tool_choice: "auto",
      temperature: 0.3,
      max_tokens: 3000,
    });

    // Tool execution loop
    while (response.choices[0]?.message?.tool_calls) {
      const assistantMsg = response.choices[0].message;
      chatMessages.push(assistantMsg as any);

      const toolCalls = assistantMsg.tool_calls;
      const token = getToken(req.headers);

      if (!toolCalls) break;
      for (const toolCall of toolCalls) {
        const fn = (toolCall as any).function;
        const name = fn?.name as string;
        const argsRaw = fn?.arguments as string;
        let result: any;
        try {
          const args = JSON.parse(argsRaw);
          switch (name) {
            case "git_list": result = await gitToolList(args.repo_id, args.path); break;
            case "git_read": result = await gitToolRead(args.repo_id, args.path); break;
            case "git_write": result = await gitToolWrite(args.repo_id, args.path, args.content); break;
            case "git_status": result = await gitToolStatus(args.repo_id); break;
            case "git_diff": result = await gitToolDiff(args.repo_id); break;
            case "git_commit": result = await gitToolCommit(args.repo_id, args.message); break;
            case "git_push": result = await gitToolPush(args.repo_id, token || undefined); break;
            case "get_platform_manifest": result = { manifest: getPlatformManifest() }; break;
            case "self_read": result = await selfRead(args.path); break;
            case "self_write": result = await selfWrite(args.path, args.content); break;
            default: result = { error: `Unknown tool: ${name}` };
          }
        } catch (err: any) {
          result = { error: err.message || "Tool execution failed" };
        }
        chatMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        } as any);
      }

      response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: chatMessages as any,
        tools: ALL_TOOLS,
        tool_choice: "auto",
        temperature: 0.3,
        max_tokens: 3000,
      });
    }

    const content = response.choices[0]?.message?.content ?? "No response.";

    // Parse phase tags from content
    const phases: Array<{ phase: string; content: string }> = [];
    const phaseRegex = /\[PHASE:\s*(\w+)\]([\s\S]*?)(?=\[PHASE:|$)/gi;
    let match;
    while ((match = phaseRegex.exec(content)) !== null) {
      phases.push({
        phase: match[1].toLowerCase(),
        content: match[2].trim(),
      });
    }

    // If no phases parsed, return the whole content as a single response
    if (phases.length === 0) {
      phases.push({ phase: "act", content: content.trim() });
    }

    res.json({ phases });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "";
    const isQuota = errMsg.includes("spend limit") || errMsg.includes("quota") || errMsg.includes("exceeded") || (err as any)?.code === "FREE_TIER_BUDGET_EXCEEDED";

    if (isQuota) {
      res.status(503).json({
        error: "AI service unavailable — monthly quota exceeded. Add your own API key in Settings (gear icon) to continue.",
        code: "QUOTA_EXCEEDED"
      });
    } else {
      res.status(500).json({ error: "Agent failed" });
    }
  }
});

export default router;
