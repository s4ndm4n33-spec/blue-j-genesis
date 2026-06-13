---
name: BlueJ concept-mastery system
description: How B.L.U.E.-J. measures empirical concept mastery (graded assessments, best-score retries, DB-authoritative progress) and the integrity constraints that follow.
---

# BlueJ empirical concept mastery

Concept progress is **empirical**: every curriculum task maps 1:1 to a concept with a real graded
assessment — CODE (stdin→stdout auto-graded against hidden test cases) or QUIZ (objective MCQ). A
concept is `mastered` only when `bestScore >= masteryThreshold` (default 80). There is an old fake
path ("code didn't crash" → mastered) that was removed; do not reintroduce crash/exit-code as a
mastery signal.

## Best-score retry model — two integrity constraints
Proficiency = max score across attempts (retries allowed, only the best counts). This retry model
creates two failure modes that any future assessment/progress work MUST defend against:

1. **Quiz answer-key leakage.** The grader must NOT return `correctOptionId`/`explanation` for a
   question the learner got wrong until the concept is actually mastered — otherwise a learner can
   fail once, read the keys, and resubmit for full marks. Rule in use: reveal a question's key only
   if `conceptProgress.mastered || question.passed`. CODE is protected differently — by hidden test
   cases (sample cases are intentionally public; hidden cases' expected/got are stripped).

2. **Progress hydration must be server/DB-authoritative.** The DB JSONB `conceptsMastered` is the
   single source of truth. The frontend Zustand store persists its own copy to localStorage, so
   hydration must **replace** local records wholesale (not merge / keep-higher), or stale/legacy
   local entries masquerade as empirical mastery.

**Why:** both were flagged in review as defeating "genuinely empirical" measurement.
**How to apply:** when touching the grader, the progress store, or any new assessment type, re-check
both constraints — they span backend grader ↔ DB JSONB ↔ frontend store/transcript.

## Locked cross-cutting contract
`ConceptProgress { conceptId, name, category, phaseId, proficiency(0-100=bestScore), bestScore,
attempts, testsPassed, testsTotal, lastAttempted(ms), mastered }`. Keep this shape identical across
the grader response, the DB column, and the frontend types or the transcript silently desyncs.
