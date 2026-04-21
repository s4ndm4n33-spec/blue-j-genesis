# Workspace

## Overview

B.L.U.E.-J. — An immersive AI-powered Python coding simulator. J. (B.L.U.E.-J.) is an AI mentor with the dry wit and English accent of Paul Bettany's J.A.R.V.I.S., teaching users to code by guiding them through the process of building their own personal AI clone. Fully responsive — works on desktop, tablet, phone, all OS platforms.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/blue-j)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: OpenAI GPT-5.2 via Replit AI Integrations (no user API key needed)
- **TTS/STT**: OpenAI audio models (never Web Speech API)
- **Validation**: Zod (zod/v4), drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **State**: Zustand
- **Animations**: Framer Motion

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── blue-j/              # React+Vite frontend (B.L.U.E.-J. simulator)
│   └── api-server/          # Express API server
├── lib/
│   ├── api-spec/            # OpenAPI spec + Orval codegen config
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod schemas from OpenAPI
│   ├── db/                  # Drizzle ORM schema + DB connection
│   ├── integrations-openai-ai-server/  # OpenAI server-side integration
│   └── integrations-openai-ai-react/   # OpenAI React hooks
├── scripts/
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## DB Schema

- `conversations` — OpenAI conversation sessions
- `messages` — Individual messages per conversation
- `user_progress` — Per-session curriculum progress, selected language/OS, phase/task tracking

## API Routes

All routes prefixed with `/api`:

### B.L.U.E.-J. Routes (`/api/bluej/`)
- `POST /bluej/chat` — Stream chat with J. (SSE). Includes J.'s personality engine, Five Masters validation, Asimov's Laws safety, OS-aware terminal context.
- `POST /bluej/tts` — Text-to-speech for J.'s voice (OpenAI audio, echo voice)
- `GET /bluej/progress?sessionId=` — Get user curriculum progress
- `POST /bluej/progress/task` — Mark a curriculum task complete
- `GET /bluej/download/j?os=&cpuCores=&ramGb=&language=` — Download J. Offline zip (hardware-tailored Ollama package)
- `GET /bluej/download/clone?os=&language=&code=` — Download user's AI clone as a standalone zip

### OpenAI Routes (`/api/openai/`)
- Standard conversation CRUD + streaming message/voice endpoints

## Curriculum (6 Phases)

1. **INITIALIZATION** — Variables, data types, first contact
2. **DATA STRUCTURES** — Lists, dictionaries
3. **CONTROL FLOW** — If/else, loops
4. **FUNCTIONS & OOP** — Functions, classes (AICore blueprint)
5. **AI LIBRARIES** — NumPy, HuggingFace Transformers
6. **YOUR AI CLONE** — Full local AI assistant (J.'s clone)

## Key Features

- Holographic HUD UI with scanline overlays, cyan/blue cyberpunk aesthetic
- Language toggle: Python | C++ | JavaScript
- OS toggle: Windows | macOS | Linux | Android | iOS (auto-detected, user-overridable)
- Hardware monitoring: CPU cores + RAM via browser APIs (user consent required, revocable)
- Voice I/O: J. speaks via TTS; user can speak via STT
- Session persistence via localStorage + database
- ANTI-ULTRON safety protocol + Asimov's Laws hardwired
- Fully responsive: mobile-first, works on all screen sizes

## Gamification (localStorage via Zustand)

- **XP & Levels**: Earned for chat questions, lines written, portfolio saves, mode usage. XP bar in HUD header.
- **Achievements**: 15+ achievements (Coding Pilgrim, Speed Coder, Night Owl, Polyglot, etc.)
- **Daily Goals**: Reset at midnight — chat questions, code lines, portfolio saves, wellness tasks
- **Streaks**: Daily login streaks with recovery tokens
- **Wellness tracking**: Water intake, stretches, eye rest, mood, Pomodoro timer, coding session timer
- **Panels**: Goals tab, Achievements tab, Wellness tab in simulator

## BYOK (Bring Your Own Key)

- Default: Replit AI integration (no user key needed, billed to Replit credits)
- Optional: User can enter their own OpenAI API key in Settings (gear icon in HUD header)
- Key stored in localStorage, sent as `x-openai-key` request header
- Server detects BYOK header — uses user's key + standard OpenAI API (gpt-4o, tts-1) instead of Replit proxy
- BYOK indicator: header shows yellow key icon when custom key is active

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`.

Run codegen: `pnpm --filter @workspace/api-spec run codegen`
Push DB: `pnpm --filter @workspace/db run push`

## Packages

### `artifacts/blue-j` (`@workspace/blue-j`)
React + Vite frontend. Main simulator UI. Entry: `src/main.tsx`. Pages: `src/pages/simulator.tsx`. Key components: HudHeader, ChatPanel, IdePanel, HardwareStrip, HardwareBanner.

### `artifacts/api-server` (`@workspace/api-server`)
Express 5 API server. J.'s brain lives in `src/routes/bluej/`. Key files: `j-personality.ts` (system prompt builder, safety checks), `curriculum.ts` (all 6 phases and code snippets), `chat.ts` (streaming chat endpoint), `tts.ts` (voice endpoint), `progress.ts` (progress tracking).
