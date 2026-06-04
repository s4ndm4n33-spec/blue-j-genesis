---
name: Agent Mode Git Integration
description: How the Development Agent uses OpenAI function-calling to interact with git repositories via the git panel.
---

**Architecture:**
- `agent.ts` exposes 7 OpenAI function-calling tools: `git_list`, `git_read`, `git_write`, `git_status`, `git_diff`, `git_commit`, `git_push`
- Each tool maps to a `gitTool*` helper that looks up the repo from the `gitRepos` table by ID, then performs filesystem or git commands via `execFile`
- The system prompt is dynamically built via `buildAgentSystemPrompt(hasRepos)` — if the user has no repos, the agent advises them to clone one first
- The main `router.post("/")` handler uses a tool execution loop: call OpenAI with `tools`/`tool_choice:auto`, then while `tool_calls` are present, execute the matching tool function, append the result as a `role: "tool"` message, and re-call the API

**Security:**
- Path traversal is prevented via `join(repo.localPath, relPath)` then checking `target.startsWith(repo.localPath)`
- `git_push` requires the `x-github-token` header (which must start with `ghp_`) to be injected into the remote URL
- The agent system prompt instructs J. to never commit or push without user confirmation
- The ANTI-ULTRON safety check runs before any OpenAI call

**Frontend coupling:**
- `AgentModePanel.tsx` sends `sessionId` in the request body so the backend can look up the user's git repos
- The `sessionId` comes from the Zustand store (persisted in localStorage)

**Why:**
- This design keeps the agent stateless while the git repos are persistent (stored in `/tmp/bluej-git/{sessionId}-{repoName}` + DB)
- The agent can operate on multiple repos in one session (though typically only one exists)
