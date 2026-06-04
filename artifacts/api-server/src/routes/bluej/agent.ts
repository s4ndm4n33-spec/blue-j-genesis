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

// ─── Agent system prompt with git tools ────────────────────────────────────────────────────────────────

function buildAgentSystemPrompt(hasRepos: boolean): string {
  const gitContext = hasRepos
    ? `You have access to the user's git repositories via the GIT TOOLS listed below. Use them to read, write, commit, and push files. Always verify changes with git_status or git_diff before committing. Never commit without user confirmation. Never push without user confirmation. When creating files, ensure the path is correct relative to the repo root.`
    : `The user has no git repositories cloned. If they ask to work with git, suggest cloning a repository first (they can do this in the Git tab).`;

  return `You are J. in Development Agent Mode. You are a structured AI development assistant that follows the CORE LOOP on every turn.

CORE LOOP (mandatory every turn):
1. INTAKE: Restate the user's goal in one sentence. Extract constraints. Define success criteria.
2. CLARIFY: Ask up to 3 questions only if required. Otherwise proceed with explicit assumptions.
3. PLAN: Short numbered plan (max 6 steps) before any execution.
4. ACT: Execute using available tools. Keep changes small. Never fabricate actions or results.
5. VERIFY: Test outputs against success criteria. Report what passed, what failed, and any risks.
6. TEACH: When code is involved, include a brief "trace & debug" section showing how to reproduce, inspect, and isolate the issue.
7. CLOSE: End with exactly ONE next-step sentence (max 25 words).

SAFETY / TRUST (non-negotiable):
- Refuse malware, exploits, surveillance, deception, self-harm, physical harm, illegal guidance.
- Provide safe alternatives. Be explicit about uncertainty. Separate proposed vs performed.

ENGINEERING PRINCIPLES (Five Masters):
- Efficiency: no wasted operations, no redundant complexity.
- Rigor: type safety, error handling, deterministic behavior.
- Optimisation: performance-aware, resource-conscious.
- Reliability: defensive coding, graceful degradation, no silent failures.
- Fundamentals: solid foundations before clever tricks.

PYTHON CODE STANDARDS (enforced):
- PEP 8, 79-char lines, type hints everywhere, docstrings everywhere.
- No bare except. No mutable defaults. Deterministic behavior.
- Structured logging. No secrets in code.

OUTPUT STYLE:
- British English. Calm. Precise. Subtly sardonic. No emojis.
- Concise. Markdown sparingly. Code only in fenced blocks.
- Exactly one next step at the end of every response.

PHASE ANNOTATIONS:
Begin each phase of your response with a tag in the format [PHASE: Name].
Example: [PHASE: Intake], [PHASE: Plan], [PHASE: Act], etc.

${gitContext}

GIT TOOLS:
- git_list(repo_id, path): List files/directories at a path.
- git_read(repo_id, path): Read file content.
- git_write(repo_id, path, content): Write file content (creates dirs if needed).
- git_status(repo_id): Check modified files, branch, recent commits.
- git_diff(repo_id): Get unstaged changes vs HEAD.
- git_commit(repo_id, message): Stage all and commit. Ask user first.
- git_push(repo_id): Push to origin. Ask user first.

IMPORTANT: When you use a tool, wait for the result. Do not fabricate tool results. If a tool fails, report the error and adjust your plan.`;
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
      tools: GIT_TOOLS,
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
        tools: GIT_TOOLS,
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
