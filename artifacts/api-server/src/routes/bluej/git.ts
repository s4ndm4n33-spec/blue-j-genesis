import { Router, type IRouter } from "express";
import { execFile } from "child_process";
import { promisify } from "util";
import { db } from "@workspace/db";
import { gitRepos } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { readFile, writeFile, mkdir, access } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const execFileAsync = promisify(execFile);
const router: IRouter = Router();

const GIT_BASE_DIR = "/tmp/bluej-git";

async function ensureGitBase() {
  if (!existsSync(GIT_BASE_DIR)) {
    await mkdir(GIT_BASE_DIR, { recursive: true });
  }
}

function getToken(headers: Record<string, unknown>): string | null {
  const raw = headers["x-github-token"];
  if (typeof raw === "string" && raw.startsWith("ghp_")) return raw;
  return null;
}

function maskUrl(url: string, token: string | null): string {
  if (!token) return url;
  // Inject token into HTTPS clone URL
  const parsed = new URL(url);
  parsed.username = "x-access-token";
  parsed.password = token;
  return parsed.toString();
}

function repoNameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1]?.replace(/\.git$/, "") || "repo";
  } catch {
    return "repo";
  }
}

// Clone a repo for a session
router.post("/clone", async (req, res) => {
  try {
    const { url, sessionId } = req.body as { url: string; sessionId: string };
    const token = getToken(req.headers);

    if (!url?.trim()) { res.status(400).json({ error: "Repository URL required" }); return; }
    if (!sessionId?.trim()) { res.status(400).json({ error: "Session ID required" }); return; }

    await ensureGitBase();
    const name = repoNameFromUrl(url);
    const localPath = join(GIT_BASE_DIR, `${sessionId}-${name}`);

    // Remove existing if present
    try {
      await execFileAsync("rm", ["-rf", localPath]);
    } catch { /* ignore */ }

    const cloneUrl = maskUrl(url, token);
    await execFileAsync("git", ["clone", "--depth", "1", cloneUrl, localPath]);

    // Get current branch
    const { stdout: branch } = await execFileAsync("git", ["-C", localPath, "rev-parse", "--abbrev-ref", "HEAD"]);

    const inserted = await db.insert(gitRepos).values({
      url,
      name,
      localPath,
      branch: branch.trim(),
      sessionId,
    }).returning();

    res.json({ repo: inserted[0] });
  } catch (err: any) {
    req.log.error({ err }, "Git clone error");
    res.status(500).json({ error: err?.stderr || err?.message || "Clone failed" });
  }
});

// Status
router.get("/:id/status", async (req, res) => {
  try {
    const repoId = Number(req.params.id);
    const rows = await db.select().from(gitRepos).where(eq(gitRepos.id, repoId));
    const repo = rows[0];
    if (!repo) { res.status(404).json({ error: "Repo not found" }); return; }

    const { stdout: status } = await execFileAsync("git", ["-C", repo.localPath, "status", "--short", "--branch"]);
    const { stdout: log } = await execFileAsync("git", ["-C", repo.localPath, "log", "--oneline", "-5"]);

    res.json({ status: status.trim(), recentCommits: log.trim().split("\n").filter(Boolean) });
  } catch (err: any) {
    req.log.error({ err }, "Git status error");
    res.status(500).json({ error: err?.stderr || err?.message || "Status failed" });
  }
});

// List files
router.get("/:id/ls", async (req, res) => {
  try {
    const repoId = Number(req.params.id);
    const { path: relPath = "." } = req.query as { path?: string };
    const rows = await db.select().from(gitRepos).where(eq(gitRepos.id, repoId));
    const repo = rows[0];
    if (!repo) { res.status(404).json({ error: "Repo not found" }); return; }

    const target = join(repo.localPath, relPath);
    // Prevent escaping repo root
    if (!target.startsWith(repo.localPath)) { res.status(400).json({ error: "Invalid path" }); return; }

    const { stdout } = await execFileAsync("ls", ["-la", target]);
    const entries = stdout.trim().split("\n").slice(3).map((line) => {
      const parts = line.trim().split(/\s+/);
      const name = parts[parts.length - 1];
      const isDir = line.startsWith("d");
      return { name, isDir, size: isDir ? null : parts[4] };
    });

    res.json({ path: relPath, entries });
  } catch (err: any) {
    req.log.error({ err }, "Git ls error");
    res.status(500).json({ error: err?.stderr || err?.message || "List failed" });
  }
});

// Read file
router.get("/:id/file", async (req, res) => {
  try {
    const repoId = Number(req.params.id);
    const { path: relPath } = req.query as { path?: string };
    const rows = await db.select().from(gitRepos).where(eq(gitRepos.id, repoId));
    const repo = rows[0];
    if (!repo) { res.status(404).json({ error: "Repo not found" }); return; }
    if (!relPath) { res.status(400).json({ error: "Path required" }); return; }

    const target = join(repo.localPath, relPath);
    if (!target.startsWith(repo.localPath)) { res.status(400).json({ error: "Invalid path" }); return; }

    const content = await readFile(target, "utf-8");
    res.json({ path: relPath, content });
  } catch (err: any) {
    req.log.error({ err }, "Git read-file error");
    res.status(500).json({ error: err?.message || "Read failed" });
  }
});

// Write file
router.post("/:id/file", async (req, res) => {
  try {
    const repoId = Number(req.params.id);
    const { path: relPath, content } = req.body as { path: string; content: string };
    const rows = await db.select().from(gitRepos).where(eq(gitRepos.id, repoId));
    const repo = rows[0];
    if (!repo) { res.status(404).json({ error: "Repo not found" }); return; }
    if (!relPath) { res.status(400).json({ error: "Path required" }); return; }

    const target = join(repo.localPath, relPath);
    if (!target.startsWith(repo.localPath)) { res.status(400).json({ error: "Invalid path" }); return; }

    const dir = target.substring(0, target.lastIndexOf("/"));
    if (dir && !existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    await writeFile(target, content, "utf-8");
    res.json({ success: true, path: relPath });
  } catch (err: any) {
    req.log.error({ err }, "Git write-file error");
    res.status(500).json({ error: err?.message || "Write failed" });
  }
});

// Commit
router.post("/:id/commit", async (req, res) => {
  try {
    const repoId = Number(req.params.id);
    const { message, authorName, authorEmail } = req.body as { message: string; authorName?: string; authorEmail?: string };
    const token = getToken(req.headers);
    const rows = await db.select().from(gitRepos).where(eq(gitRepos.id, repoId));
    const repo = rows[0];
    if (!repo) { res.status(404).json({ error: "Repo not found" }); return; }

    const cwd = repo.localPath;
    const env: Record<string, string> = {};
    if (authorName) env.GIT_AUTHOR_NAME = authorName;
    if (authorEmail) env.GIT_AUTHOR_EMAIL = authorEmail;

    // Configure remote with token if available
    if (token) {
      const masked = maskUrl(repo.url, token);
      await execFileAsync("git", ["-C", cwd, "remote", "set-url", "origin", masked]);
    }

    await execFileAsync("git", ["-C", cwd, "add", "."], { env });
    await execFileAsync("git", ["-C", cwd, "commit", "-m", message || "J. update"], { env });

    res.json({ success: true });
  } catch (err: any) {
    req.log.error({ err }, "Git commit error");
    res.status(500).json({ error: err?.stderr || err?.message || "Commit failed" });
  }
});

// Push
router.post("/:id/push", async (req, res) => {
  try {
    const repoId = Number(req.params.id);
    const token = getToken(req.headers);
    const rows = await db.select().from(gitRepos).where(eq(gitRepos.id, repoId));
    const repo = rows[0];
    if (!repo) { res.status(404).json({ error: "Repo not found" }); return; }

    const cwd = repo.localPath;
    if (token) {
      const masked = maskUrl(repo.url, token);
      await execFileAsync("git", ["-C", cwd, "remote", "set-url", "origin", masked]);
    }

    const { stdout, stderr } = await execFileAsync("git", ["-C", cwd, "push", "origin", repo.branch]);
    res.json({ success: true, output: stdout.trim(), stderr: stderr?.trim() || "" });
  } catch (err: any) {
    req.log.error({ err }, "Git push error");
    res.status(500).json({ error: err?.stderr || err?.message || "Push failed" });
  }
});

// Diff (unstaged)
router.get("/:id/diff", async (req, res) => {
  try {
    const repoId = Number(req.params.id);
    const { path: relPath } = req.query as { path?: string };
    const rows = await db.select().from(gitRepos).where(eq(gitRepos.id, repoId));
    const repo = rows[0];
    if (!repo) { res.status(404).json({ error: "Repo not found" }); return; }

    const args = relPath
      ? ["-C", repo.localPath, "diff", "HEAD", "--", relPath]
      : ["-C", repo.localPath, "diff", "HEAD"];

    const { stdout } = await execFileAsync("git", args);
    res.json({ diff: stdout });
  } catch (err: any) {
    req.log.error({ err }, "Git diff error");
    res.status(500).json({ error: err?.stderr || err?.message || "Diff failed" });
  }
});

// Get repo context for J (latest files + status)
router.get("/context/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const rows = await db.select().from(gitRepos).where(eq(gitRepos.sessionId, sessionId));
    if (rows.length === 0) {
      res.json({ repos: [] });
      return;
    }
    const contexts: Array<{ repoName: string; branch: string; files: Array<{ path: string; content: string }> }> = [];
    for (const repo of rows) {
      try {
        const { stdout: branch } = await execFileAsync("git", ["-C", repo.localPath, "rev-parse", "--abbrev-ref", "HEAD"]);
        const { stdout: ls } = await execFileAsync("git", ["-C", repo.localPath, "ls-files"]);
        const files: Array<{ path: string; content: string }> = [];
        for (const path of ls.split("\n").filter(Boolean)) {
          try {
            const { stdout } = await execFileAsync("git", ["-C", repo.localPath, "show", `HEAD:${path}`]);
            files.push({ path, content: stdout.slice(0, 2000) });
          } catch {
            files.push({ path, content: "[binary or unreadable]" });
          }
        }
        contexts.push({ repoName: repo.repoName, branch: branch.trim(), files });
      } catch {
        // skip repo on error
      }
    }
    res.json({ repos: contexts });
  } catch (err) {
    req.log.error({ err }, "Git context error");
    res.status(500).json({ error: "Context failed" });
  }
});

// List repos for a session
router.get("/list/:sessionId", async (req, res) => {
  try {
    const rows = await db.select().from(gitRepos).where(eq(gitRepos.sessionId, req.params.sessionId));
    res.json({ repos: rows });
  } catch (err) {
    req.log.error({ err }, "Git list error");
    res.status(500).json({ error: "List failed" });
  }
});

export default router;
