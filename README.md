# B.L.U.E.-J. AI Coding Simulator

## Purpose

B.L.U.E.-J. (Build. Learn. Utilize. Engineer.) is an immersive AI-powered coding simulator designed to teach users how to build their own personal AI assistant. J. is an AI mentor voiced in the dry wit and precision of Paul Bettany's J.A.R.V.I.S., guiding users through a structured six-phase curriculum that progresses from basic programming concepts to deploying a functional local AI clone.

The project is built as a Progressive Web App (PWA) with a sci-fi holographic HUD aesthetic, operating as both a learning environment and a functional code editor. Every conversation, code execution, and milestone is tracked through persistent state management, gamification mechanics, and a deterministic token budget system that preserves conversation continuity without exhausting context windows.

---

## Core Capabilities

### Curriculum (Six Phases)
1. **INITIALIZATION** — Variables, data types, first contact
2. **DATA STRUCTURES** — Lists, dictionaries, basic algorithmic thinking
3. **CONTROL FLOW** — If/else, loops, conditional logic
4. **FUNCTIONS & OOP** — Functions, classes, the AICore blueprint
5. **AI LIBRARIES** — NumPy, HuggingFace Transformers, model loading
6. **YOUR AI CLONE** — Full local AI assistant deployment

Each phase contains progressively complex tasks with code snippets in **Python**, **C++**, and **JavaScript**, matched to the user's selected language.

### AI Mentor (J.)
- **Personality Engine**: Built on a system prompt that embeds the Five Sovereign Masters (Korotkevich/Torvalds/Carmack/Hamilton/Ritchie), Asimov's Three Laws, and the Anti-Ultron safety protocol
- **Streaming Chat**: Server-Sent Events (SSE) with real-time token delivery
- **Voice I/O**: OpenAI TTS (echo voice) and STT for hands-free interaction
- **Workspace Awareness**: J. can reference, critique, and improve code from the user's editor when explicitly requested
- **Code Quality Gauntlet**: Backend validation of all generated code for safety, correctness, and style before delivery

### IDE & Code Execution
- **Dual Editor**: J.'s synthesized code (read-only) and user's workspace (editable)
- **Syntax Highlighting**: react-syntax-highlighter with vscDarkPlus theme
- **Horizontal Scrolling**: Synchronized textarea + highlight layer for long lines
- **Inline Code Hygiene**: Client-side linting for common style issues (Python/JS/C++)
- **Real Execution**: Server-side sandboxed execution via Piston API with safety filters
- **Simulation Mode**: AI-simulated hardware profiles (auto-detect, beast, mid-range, budget, Pi, cloud GPU)
- **Optimization**: Five Masters gauntlet optimization with before/after diff

### Git Integration
- **Clone**: Clone repositories from GitHub with user-provided PAT
- **File Tree**: Browse repository structure
- **Read/Edit**: View and modify files directly in the IDE
- **Status/Diff**: See git status and file diffs before committing
- **Commit/Push**: Stage changes, write commit messages, and push back to origin

### Token Budget & Conversation Archiving
- **Hard Token Budget**: 2,048-token history budget per conversation
- **Deterministic Summarization**: When budget exceeded, oldest messages are summarized using `temperature=0` with `gpt-4o-mini` for reproducible compression
- **Archive Notifications**: System messages notify users when context is archived
- **Full Export**: Markdown export of complete conversation history via `GET /api/bluej/chat/:id/export`

### Gamification
- **XP & Levels**: Earned for chat questions, lines written, portfolio saves, mode usage
- **Achievements**: 15+ unlockable achievements (Coding Pilgrim, Speed Coder, Night Owl, Polyglot, etc.)
- **Daily Goals**: Reset at midnight — chat questions, code lines, portfolio saves, wellness tasks
- **Streaks**: Daily login streaks with recovery tokens
- **Wellness**: Water intake, stretches, eye rest, mood tracking, Pomodoro timer

### Hardware & OS Awareness
- **Auto-Detection**: Browser APIs detect CPU cores, RAM, platform (with user consent, revocable)
- **OS Context**: Terminal commands adapted for Windows (PowerShell), macOS (zsh), Linux (bash)
- **Hardware Profiles**: Simulation targets from Raspberry Pi to cloud GPU

### BYOK (Bring Your Own Key)
- Default: Replit AI Integration (no user key needed)
- Optional: User-provided OpenAI API key stored in localStorage, sent as `x-openai-key` header
- Server automatically routes to user's key + standard OpenAI API when BYOK detected

### Safety
- **Anti-Ultron Protocol**: Hard-blocked phrases for malware, exploitation, circumvention requests
- **Contextual Checks**: Secondary validation for ambiguous terms with harmful context
- **Code Execution Filter**: Server-side sandbox blocking network access, subprocess calls, file system manipulation
- **Asimov's Laws**: Embedded in system prompt architecture

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| Monorepo Tool | pnpm workspaces |
| Node.js | v24 |
| Frontend | React 19 + Vite 7 + Tailwind CSS v4 + Framer Motion |
| Backend | Express 5 + TypeScript 5.9 |
| Database | PostgreSQL + Drizzle ORM |
| AI | OpenAI GPT via Replit AI Integration (server proxy) |
| TTS/STT | OpenAI Audio API (tts-1, whisper-1) |
| State | Zustand (persisted to localStorage) |
| API Contracts | OpenAPI 3.0 + Orval codegen |
| Validation | Zod v4 |
| Build | esbuild (server), Vite (frontend) |

---

## Project Structure

```
workspace/
├── artifacts/
│   ├── blue-j/                    # React + Vite frontend (PWA)
│   │   ├── src/
│   │   │   ├── pages/simulator.tsx     # Main app shell
│   │   │   ├── components/
│   │   │   │   ├── ChatPanel.tsx       # Chat UI + voice + export
│   │   │   │   ├── IdePanel.tsx        # Code editor + execution
│   │   │   │   ├── GitPanel.tsx        # Git integration
│   │   │   │   ├── HudHeader.tsx       # Top HUD bar
│   │   │   │   ├── HardwareStrip.tsx   # Bottom hardware bar
│   │   │   │   ├── DiagnosticSequence.tsx  # Boot sequence
│   │   │   │   ├── TutorialOverlay.tsx     # First-time tutorial
│   │   │   │   ├── AchievementsPanel.tsx   # Achievement display
│   │   │   │   ├── DailyGoals.tsx          # Goal tracking
│   │   │   │   ├── WellnessPanel.tsx       # Wellness tracking
│   │   │   │   ├── DownloadModal.tsx       # Export/Portfolio/GitHub
│   │   │   │   └── Tooltip.tsx             # Reusable tooltip
│   │   │   ├── lib/
│   │   │   │   ├── store.ts            # Zustand state (session, code, UI)
│   │   │   │   └── progress-store.ts   # Zustand gamification state
│   │   │   ├── hooks/
│   │   │   │   ├── use-chat.ts         # Chat streaming logic
│   │   │   │   ├── use-audio.ts        # TTS/STT playback
│   │   │   │   └── use-bluej-api.ts    # API hooks
│   │   │   └── main.tsx                # Entry point
│   │   └── public/
│   │       └── images/hologrid.png     # Background texture
│   │
│   └── api-server/                # Express API server
│       ├── src/
│       │   ├── app.ts                 # Express app setup
│       │   ├── index.ts               # Server entry
│       │   ├── lib/logger.ts          # Pino logger
│       │   └── routes/
│       │       ├── bluej/
│       │       │   ├── index.ts           # Route aggregator
│       │       │   ├── chat.ts            # Streaming chat + token budget
│       │       │   ├── j-personality.ts   # System prompt builder + safety
│       │       │   ├── curriculum.ts      # Six-phase curriculum data
│       │       │   ├── tts.ts             # Text-to-speech endpoint
│       │       │   ├── stt.ts             # Speech-to-text endpoint
│       │       │   ├── progress.ts        # Curriculum progress tracking
│       │       │   ├── download.ts        # Offline package generation
│       │       │   ├── simulate.ts        # AI code simulation
│       │       │   ├── optimize.ts        # Five Masters optimization
│       │       │   ├── execute.ts         # Sandboxed code execution
│       │       │   ├── diagnostic.ts      # Hardware detection endpoint
│       │       │   ├── github.ts          # GitHub Gist export
│       │       │   ├── git.ts             # Git repo management
│       │       │   └── export.ts          # Markdown conversation export
│       │       ├── openai/index.ts        # OpenAI-compatible routes
│       │       └── health.ts              # Health check
│       └── build.mjs                  # esbuild config
│
├── lib/
│   ├── api-spec/                  # OpenAPI spec + Orval config
│   ├── api-zod/                   # Generated Zod schemas from OpenAPI
│   ├── api-client-react/          # Generated React Query hooks
│   ├── db/                        # Drizzle ORM schema + connection
│   │   ├── src/schema/
│   │   │   ├── conversations.ts      # Conversation table
│   │   │   ├── messages.ts           # Message table
│   │   │   ├── user-progress.ts      # Progress tracking table
│   │   │   └── git-repos.ts          # Git repo tracking table
│   │   └── drizzle.config.ts
│   └── integrations-openai-ai-server/  # Replit OpenAI server integration
│       ├── src/
│       │   ├── client.ts              # OpenAI client wrapper
│       │   └── audio/
│       │       ├── client.ts          # Audio API client
│       │       └── index.ts           # Voice streaming
│
├── pnpm-workspace.yaml            # Workspace config
├── tsconfig.base.json             # Shared TypeScript config
└── package.json                   # Root package
```

---

## Deterministic Build Strategy

### Prerequisites
- Node.js v24
- pnpm v10+
- PostgreSQL database (Replit-managed or external)
- Replit account (for AI integration proxy)

### Step 1: Bootstrap the Monorepo

```bash
# 1.1 Create workspace structure
mkdir -p artifacts/blue-j/src/{components,lib,hooks,pages}
mkdir -p artifacts/api-server/src/routes/bluej
mkdir -p lib/{api-spec,api-zod,api-client-react,db/src/schema,integrations/openai_ai_integrations}

# 1.2 Initialize root package.json
cat > package.json << 'EOF'
{
  "name": "workspace",
  "version": "0.0.0",
  "license": "MIT",
  "scripts": {
    "preinstall": "sh -c 'rm -f package-lock.json yarn.lock; case \"\$npm_config_user_agent\" in pnpm/*) ;; *) echo \"Use pnpm instead\" >&2; exit 1 ;; esac'",
    "build": "pnpm run typecheck && pnpm -r --if-present run build",
    "typecheck:libs": "tsc --build",
    "typecheck": "pnpm run typecheck:libs && pnpm -r --filter \"./artifacts/**\" --filter \"./scripts\" --if-present run typecheck"
  },
  "private": true,
  "devDependencies": {
    "typescript": "~5.9.2",
    "prettier": "^3.8.1"
  }
}
EOF

# 1.3 Create pnpm-workspace.yaml
cat > pnpm-workspace.yaml << 'EOF'
minimumReleaseAge: 1440
minimumReleaseAgeExclude:
  - '@replit/*'
  - stripe-replit-sync
packages:
  - artifacts/*
  - lib/*
  - lib/integrations/*
  - scripts
catalog:
  '@replit/vite-plugin-cartographer': ^0.5.1
  '@replit/vite-plugin-dev-banner': ^0.1.1
  '@replit/vite-plugin-runtime-error-modal': ^0.0.6
  '@tailwindcss/vite': ^4.1.14
  '@tanstack/react-query': ^5.90.21
  '@types/node': ^25.3.3
  '@types/react': ^19.2.0
  '@types/react-dom': ^19.2.0
  '@vitejs/plugin-react': ^5.0.4
  class-variance-authority: ^0.7.1
  clsx: ^2.1.1
  drizzle-orm: ^0.45.1
  framer-motion: ^12.23.24
  lucide-react: ^0.545.0
  react: 19.1.0
  react-dom: 19.1.0
  tailwind-merge: ^3.3.1
  tailwindcss: ^4.1.14
  tsx: ^4.21.0
  vite: ^7.3.0
  zod: ^3.25.76
autoInstallPeers: false
EOF

# 1.4 Create base TypeScript config
cat > tsconfig.base.json << 'EOF'
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
EOF
```

### Step 2: Install Dependencies

```bash
# 2.1 Install all workspace dependencies
pnpm install

# 2.2 Key frontend dependencies (artifacts/blue-j)
cd artifacts/blue-j
pnpm add react react-dom zustand framer-motion lucide-react react-syntax-highlighter react-markdown
pnpm add -D vite @vitejs/plugin-react typescript @types/react @types/react-dom tailwindcss @tailwindcss/vite

# 2.3 Key backend dependencies (artifacts/api-server)
cd ../api-server
pnpm add express drizzle-orm pg zod pino pino-http dotenv
pnpm add -D @types/express @types/pg typescript esbuild tsx

# 2.4 Database package (lib/db)
cd ../../lib/db
pnpm add drizzle-orm pg dotenv
pnpm add -D drizzle-kit @types/pg typescript

# 2.5 OpenAI integration (lib/integrations-openai-ai-server)
cd ../integrations-openai-ai-server
pnpm add openai
pnpm add -D typescript
```

### Step 3: Database Schema

```bash
# 3.1 Create schema files
cat > lib/db/src/schema/conversations.ts << 'EOF'
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
EOF

cat > lib/db/src/schema/messages.ts << 'EOF'
import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
EOF

cat > lib/db/src/schema/user-progress.ts << 'EOF'
import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  phaseIndex: integer("phase_index").notNull().default(0),
  taskIndex: integer("task_index").notNull().default(0),
  completedTaskIds: text("completed_task_ids").array().notNull().default([]),
  selectedLanguage: text("selected_language").notNull().default("python"),
  selectedOs: text("selected_os").notNull().default("linux"),
  learnerMode: text("learner_mode").notNull().default("adult-beginner"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
EOF

cat > lib/db/src/schema/git-repos.ts << 'EOF'
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const gitRepos = pgTable("git_repos", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  name: text("name").notNull(),
  localPath: text("local_path").notNull(),
  branch: text("branch").notNull().default("main"),
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
EOF

cat > lib/db/src/schema/index.ts << 'EOF'
export * from "./conversations";
export * from "./messages";
export * from "./user-progress";
export * from "./git-repos";
EOF

# 3.2 Create Drizzle config
cat > lib/db/drizzle.config.ts << 'EOF'
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL || "" },
});
EOF

# 3.3 Push schema to database
pnpm --filter @workspace/db run push
```

### Step 4: OpenAPI Spec & Codegen

```bash
# 4.1 Define OpenAPI spec in lib/api-spec/openapi.yaml
# (Full spec with endpoints for chat, tts, stt, progress, download, simulate, optimize, execute, diagnostic, git, export)

# 4.2 Install Orval
cd lib/api-spec
pnpm add -D orval

# 4.3 Run codegen
cat > orval.config.ts << 'EOF'
import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: { target: "./openapi.yaml" },
    output: {
      target: "../api-client-react/src/generated",
      schemas: "../api-zod/src/generated",
      client: "react-query",
      zod: true,
    },
  },
});
EOF

npx orval
```

### Step 5: Backend Implementation

The backend is implemented as Express routers under `artifacts/api-server/src/routes/bluej/`:

1. **j-personality.ts** — System prompt builder with Five Masters, Asimov's Laws, Anti-Ultron protocol, hardware context, OS context, curriculum context, and learner mode instructions. Includes `buildSafetyCheck()` for input validation.

2. **curriculum.ts** — Six-phase curriculum with tasks, code snippets (Python/C++/JS), success messages, and real-world context.

3. **chat.ts** — Streaming chat endpoint:
   - Parse request body with Zod schema
   - Safety check via `buildSafetyCheck()`
   - Create/fetch conversation from DB
   - Token-aware history trimming (240K budget for history + message)
   - Deterministic summarization when budget exceeded (temp=0, gpt-4o-mini)
   - Archive notifications in SSE stream
   - Stream response via OpenAI chat completions

4. **git.ts** — Git operations:
   - `POST /clone` — Clone repo with x-github-token
   - `GET /list/:sessionId` — List user's repos
   - `GET /status/:repoId` — Git status
   - `GET /ls/:repoId` — Directory listing
   - `GET /read/:repoId` — Read file
   - `POST /write/:repoId` — Write file
   - `POST /commit/:repoId` — Commit changes
   - `POST /push/:repoId` — Push to origin

5. **export.ts** — Markdown export of full conversation history

6. **execute.ts** — Sandboxed code execution via Piston API with safety filters

### Step 6: Frontend Implementation

1. **store.ts** — Zustand store with persist middleware:
   - Session ID, conversation ID
   - Selected language (Python/C++/JS)
   - Selected OS (Windows/macOS/Linux/Android/iOS)
   - Hardware info (auto-detected or user-provided)
   - myCode (workspace code)
   - Messages array, typing state
   - Active tab (chat/ide/git/goals/achievements/wellness)
   - User API key (BYOK)
   - Sim hardware profile

2. **progress-store.ts** — Gamification state:
   - XP, level, streak
   - Achievements (unlocked/new)
   - Daily goals (progress/completed)
   - Wellness metrics
   - Stats tracking (lines written, chat count, etc.)

3. **use-chat.ts** — Chat streaming hook:
   - Fetch SSE stream from `/api/bluej/chat`
   - Parse data events, append content to last assistant message
   - Handle `done` flag, update conversation ID
   - Handle `contextArchived` + `archivedCount` notifications
   - TTS integration (send final text to TTS endpoint)
   - Smart workspace sharing: only includes `myCode` when keywords detected ("look at my code", "check my code", etc.) or explicit Share Workspace button clicked

4. **ChatPanel.tsx** — Chat UI:
   - Message list with ReactMarkdown rendering
   - Voice input (mic button with recording states)
   - TTS playback (volume toggle)
   - Export banner (dismissible, appears when archive detected)
   - Share Workspace button (cyan Code2 icon)
   - Scroll-to-bottom on new messages

5. **IdePanel.tsx** — IDE UI:
   - Three tabs: J.'s Synthesis, My Workspace, Optimized
   - Syntax highlighting overlay on editable textarea (synced scroll)
   - Horizontal scrolling (overflow-auto, whitespace-pre)
   - Bottom toolbar: Export, Optimize, Hygiene, Terminal toggle, Hardware profile
   - Hygiene panel: Client-side linting with severity levels (note/warn/error)
   - Terminal panel: Execution output (simulation + real)

6. **GitPanel.tsx** — Git UI:
   - Repo list with clone form (URL + GitHub PAT)
   - File tree browser (expand/collapse directories)
   - File editor (syntax highlighted)
   - Git status display
   - Diff view before commit
   - Commit message input + commit/push buttons

7. **HudHeader.tsx** — Top navigation:
   - Logo + B.L.U.E.-J. acronym
   - Language/OS toggles
   - Learner mode cycle (Kids/Teen/Beginner/Advanced)
   - Hardware monitor toggle
   - XP bar with level progress
   - Settings modal (BYOK key input)
   - Help overlay trigger

8. **DiagnosticSequence.tsx** — Boot animation:
   - "Initializing diagnostic sequence..." with spinner
   - Auto-advances after simulated hardware detection
   - Unlocks main simulator interface

### Step 7: Styling & Aesthetic

```css
/* Tailwind v4 configuration in artifacts/blue-j/src/index.css */
@theme {
  --color-background: #020617;
  --color-primary: #22d3ee;
  --color-accent: #3b82f6;
  --color-secondary: #0f172a;
  --color-destructive: #ef4444;
  --font-hud: "Courier New", monospace;
}

/* Key visual elements:
   - Scanline overlay via CSS pseudo-element
   - Cyan/blue cyberpunk palette
   - Monospace HUD font for headers and labels
   - Glass-morphic panels with border-primary/20
   - Hologrid background image (opacity 0.1)
   - Responsive: mobile-first, md breakpoint for desktop split view
*/
```

### Step 8: Configure & Launch

```bash
# 8.1 Set environment variables
cat > artifacts/api-server/.env << 'EOF'
DATABASE_URL=postgresql://user:pass@localhost:5432/bluej
PORT=8080
EOF

# 8.2 Build backend
pnpm --filter @workspace/api-server run build

# 8.3 Start backend
pnpm --filter @workspace/api-server run start
# Server listens on port 8080

# 8.4 Start frontend (in separate terminal)
cd artifacts/blue-j
pnpm run dev
# Vite dev server (port assigned by environment)

# 8.5 Access the app
# Open browser to the frontend dev server URL
# The app will show the diagnostic sequence on first load
# Complete the sequence to unlock the full simulator
```

---

## Limitations

1. **AI Model Dependency**: Requires Replit AI Integration or user-provided OpenAI API key. Without either, chat functionality is unavailable.

2. **Code Execution**: Real code execution depends on external Piston API availability. Simulation mode does not execute code — it generates plausible output based on hardware profile.

3. **Git Operations**: Requires user-provided GitHub Personal Access Token. Repos are stored in `/tmp/bluej-git` (ephemeral in containerized environments).

4. **Hardware Detection**: Browser hardware APIs are limited. RAM detection is approximate. Not all browsers support all APIs.

5. **Voice Input**: Requires browser microphone permission. STT accuracy depends on audio quality and ambient noise.

6. **Mobile Experience**: While fully responsive, the split-screen IDE+Chat layout is optimized for desktop. Mobile uses tab switching.

7. **Token Budget**: The 2,048-token history budget is a heuristic estimate (~4 chars/token). Very dense code blocks may consume budget faster than estimated.

8. **Database**: All conversation state is stored server-side. If the database is reset, conversation history is lost. User progress (phases/tasks) is stored in localStorage as backup.

9. **Free Tier Limits**: Replit AI Integration has monthly spend limits. Heavy usage may require BYOK or paid plan.

10. **No Offline Mode**: While offline packages can be downloaded, the live app requires internet connectivity for AI chat, TTS, and code execution.

---

## License

MIT
