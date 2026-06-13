import { Router, type IRouter } from "express";
import { db, userProgressTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  getAssessment,
  getConcept,
  getPublicRegistry,
  totalPointsFor,
  type AssessmentLanguage,
  type CodeAssessment,
  type QuizAssessment,
} from "./concepts.js";
import { prepareProgram, runPrepared, cleanupPrepared } from "./executor.js";

const router: IRouter = Router();

// ─── Locked cross-cutting contract (grader ↔ DB JSONB ↔ frontend) ────────────
export interface ConceptProgress {
  conceptId: string;
  name: string;
  category: string;
  phaseId: number;
  proficiency: number; // 0-100, equals bestScore
  bestScore: number;   // 0-100
  attempts: number;
  testsPassed: number; // from the best-scoring attempt
  testsTotal: number;
  lastAttempted: number; // epoch ms
  mastered: boolean;     // bestScore >= masteryThreshold
}

interface CaseResult {
  id: string;
  passed: boolean;
  points: number;
  hidden: boolean;
  stdin?: string;
  expected?: string;
  got?: string;
  message?: string;
}

interface QuestionResult {
  id: string;
  passed: boolean;
  points: number;
  correctOptionId?: string; // withheld until the concept is mastered (anti-gaming)
  explanation?: string;
}

interface GradingResult {
  conceptId: string;
  assessmentId: string;
  type: "code" | "quiz";
  score: number;
  passedPoints: number;
  totalPoints: number;
  testsPassed: number;
  testsTotal: number;
  mastered: boolean;
  compileError?: string;
  cases?: CaseResult[];
  questions?: QuestionResult[];
  conceptProgress: ConceptProgress;
}

// Normalize program output for fair comparison: unify newlines, strip trailing
// whitespace per line, and trim overall. Internal spacing is preserved.
function norm(s: string): string {
  return s.replace(/\r\n/g, "\n").split("\n").map((l) => l.replace(/\s+$/g, "")).join("\n").trim();
}

const PER_CASE_TIMEOUT_MS = 8000;

async function gradeCode(
  assessment: CodeAssessment,
  language: AssessmentLanguage,
  code: string,
): Promise<{ passedPoints: number; totalPoints: number; testsPassed: number; cases: CaseResult[]; compileError?: string }> {
  const totalPoints = totalPointsFor(assessment);
  const prepared = await prepareProgram(language, code);

  if (prepared.kind === "error") {
    // Safety/compile failures: zero credit, all cases failed.
    const cases: CaseResult[] = assessment.cases.map((c) => ({
      id: c.id, passed: false, points: c.points, hidden: !!c.hidden,
      message: prepared.phase === "safety" ? "Blocked by sandbox safety filter" : "Did not compile",
    }));
    return { passedPoints: 0, totalPoints, testsPassed: 0, cases, compileError: prepared.message };
  }

  let passedPoints = 0;
  let testsPassed = 0;
  const cases: CaseResult[] = [];
  try {
    for (const c of assessment.cases) {
      const run = await runPrepared(prepared, { stdin: c.stdin, argv: c.argv, timeoutMs: PER_CASE_TIMEOUT_MS });
      const expected = norm(c.expectedStdout);
      const got = norm(run.stdout);
      const passed = run.exitCode === 0 && !run.timedOut && got === expected;
      if (passed) { passedPoints += c.points; testsPassed += 1; }

      const result: CaseResult = { id: c.id, passed, points: c.points, hidden: !!c.hidden };
      if (run.timedOut) result.message = "Timed out";
      else if (run.exitCode !== 0) result.message = run.stderr ? `Runtime error: ${run.stderr.slice(0, 200)}` : "Non-zero exit";
      // Only reveal expected/got for visible cases — never leak hidden answers.
      if (!c.hidden) {
        result.stdin = c.stdin;
        result.expected = expected;
        result.got = got;
      }
      cases.push(result);
    }
  } finally {
    await cleanupPrepared(prepared);
  }

  return { passedPoints, totalPoints, testsPassed, cases };
}

function gradeQuiz(
  assessment: QuizAssessment,
  answers: Record<string, string>,
): { passedPoints: number; totalPoints: number; testsPassed: number; questions: QuestionResult[] } {
  const totalPoints = totalPointsFor(assessment);
  let passedPoints = 0;
  let testsPassed = 0;
  const questions: QuestionResult[] = assessment.questions.map((q) => {
    const chosen = answers[q.id];
    const passed = chosen === q.correctOptionId;
    if (passed) { passedPoints += q.points; testsPassed += 1; }
    return { id: q.id, passed, points: q.points, correctOptionId: q.correctOptionId, explanation: q.explanation };
  });
  return { passedPoints, totalPoints, testsPassed, questions };
}

async function persistConceptProgress(
  sessionId: string,
  next: ConceptProgress,
): Promise<void> {
  const rows = await db.select().from(userProgressTable).where(eq(userProgressTable.sessionId, sessionId)).limit(1);
  let row = rows[0];
  if (!row) {
    const created = await db.insert(userProgressTable).values({
      sessionId, currentPhase: 0, currentTask: 0, completedTasks: [],
      selectedLanguage: "python", selectedOs: "linux", conceptsMastered: [next],
    }).returning();
    row = created[0];
    return;
  }
  const existing = ((row.conceptsMastered as ConceptProgress[] | null) ?? []).filter(Boolean);
  const idx = existing.findIndex((c) => c.conceptId === next.conceptId);
  if (idx >= 0) existing[idx] = next;
  else existing.push(next);
  await db.update(userProgressTable)
    .set({ conceptsMastered: existing, updatedAt: new Date() })
    .where(eq(userProgressTable.id, row.id));
}

async function buildConceptProgress(
  sessionId: string,
  conceptId: string,
  score: number,
  testsPassed: number,
  testsTotal: number,
): Promise<ConceptProgress> {
  const concept = getConcept(conceptId);
  const rows = await db.select().from(userProgressTable).where(eq(userProgressTable.sessionId, sessionId)).limit(1);
  const prevArr = ((rows[0]?.conceptsMastered as ConceptProgress[] | null) ?? []).filter(Boolean);
  const prev = prevArr.find((c) => c.conceptId === conceptId);

  const prevBest = prev?.bestScore ?? 0;
  const isNewBest = score >= prevBest;
  const bestScore = Math.max(prevBest, score);
  const threshold = concept?.masteryThreshold ?? 80;

  return {
    conceptId,
    name: concept?.name ?? conceptId,
    category: concept?.category ?? "General",
    phaseId: concept?.phaseId ?? 0,
    proficiency: bestScore,
    bestScore,
    attempts: (prev?.attempts ?? 0) + 1,
    testsPassed: isNewBest ? testsPassed : (prev?.testsPassed ?? testsPassed),
    testsTotal: isNewBest ? testsTotal : (prev?.testsTotal ?? testsTotal),
    lastAttempted: Date.now(),
    mastered: bestScore >= threshold,
  };
}

// ─── POST /api/bluej/grade ───────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { sessionId, assessmentId, language, code, answers } = req.body as {
      sessionId?: string;
      assessmentId?: string;
      language?: string;
      code?: string;
      answers?: Record<string, string>;
    };

    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({ error: "Missing sessionId" });
    }
    if (!assessmentId || typeof assessmentId !== "string") {
      return res.status(400).json({ error: "Missing assessmentId" });
    }
    const assessment = getAssessment(assessmentId);
    if (!assessment) {
      return res.status(404).json({ error: `Unknown assessment: ${assessmentId}` });
    }

    let passedPoints = 0, totalPoints = 0, testsPassed = 0, testsTotal = 0;
    let cases: CaseResult[] | undefined;
    let questions: QuestionResult[] | undefined;
    let compileError: string | undefined;

    if (assessment.type === "code") {
      if (!code || typeof code !== "string" || !code.trim()) {
        return res.status(400).json({ error: "Missing code for code assessment" });
      }
      const lang = language as AssessmentLanguage;
      if (!lang || !assessment.languages.includes(lang)) {
        return res.status(400).json({ error: `Assessment requires one of: ${assessment.languages.join(", ")}` });
      }
      const r = await gradeCode(assessment, lang, code);
      passedPoints = r.passedPoints; totalPoints = r.totalPoints;
      testsPassed = r.testsPassed; testsTotal = assessment.cases.length;
      cases = r.cases; compileError = r.compileError;
    } else {
      if (!answers || typeof answers !== "object") {
        return res.status(400).json({ error: "Missing answers for quiz assessment" });
      }
      const r = gradeQuiz(assessment, answers);
      passedPoints = r.passedPoints; totalPoints = r.totalPoints;
      testsPassed = r.testsPassed; testsTotal = assessment.questions.length;
      questions = r.questions;
    }

    const score = totalPoints > 0 ? Math.round((passedPoints / totalPoints) * 100) : 0;
    const conceptProgress = await buildConceptProgress(sessionId, assessment.conceptId, score, testsPassed, testsTotal);
    await persistConceptProgress(sessionId, conceptProgress);

    // Quiz integrity: until the concept is genuinely mastered, never reveal the
    // correct option / explanation for questions the learner answered wrong.
    // Otherwise a learner could fail once, read the answer key, then resubmit
    // for full marks under the best-score model — defeating empirical measurement.
    if (questions) {
      const revealAll = conceptProgress.mastered;
      questions = questions.map((q) =>
        revealAll || q.passed
          ? q
          : { id: q.id, passed: q.passed, points: q.points },
      );
    }

    const result: GradingResult = {
      conceptId: assessment.conceptId,
      assessmentId: assessment.id,
      type: assessment.type,
      score,
      passedPoints,
      totalPoints,
      testsPassed,
      testsTotal,
      mastered: conceptProgress.mastered,
      compileError,
      cases,
      questions,
      conceptProgress,
    };
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Grading error");
    res.status(500).json({ error: "Grading failed unexpectedly." });
  }
});

// ─── GET /api/bluej/grade/registry (public, answers stripped) ────────────────
router.get("/registry", (_req, res) => {
  res.json(getPublicRegistry());
});

export default router;
