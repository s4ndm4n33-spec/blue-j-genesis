import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, CheckCircle2, XCircle, Loader2, FlaskConical, ListChecks,
  ChevronDown, ChevronRight, Lock, Award, Send, RotateCcw,
} from 'lucide-react';
import {
  useRegistry, useGradeSubmission, useGetProgress,
  type PublicConcept, type PublicAssessment, type GradingResult,
} from '@/hooks/use-bluej-api';
import { useProgressStore, type ConceptProgress } from '@/lib/progress-store';
import { useBlueJStore } from '@/lib/store';

const CODE_LANG_LABELS: Record<string, string> = {
  python: 'Python', javascript: 'JavaScript', cpp: 'C++', c: 'C',
};

// ─── Collegiate grade helpers ────────────────────────────────────────────────
function letterGrade(score: number): string {
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  return 'F';
}

function gradePoints(score: number): number {
  if (score >= 93) return 4.0;
  if (score >= 90) return 3.7;
  if (score >= 87) return 3.3;
  if (score >= 83) return 3.0;
  if (score >= 80) return 2.7;
  if (score >= 77) return 2.3;
  if (score >= 73) return 2.0;
  if (score >= 70) return 1.7;
  if (score >= 67) return 1.3;
  if (score >= 63) return 1.0;
  if (score >= 60) return 0.7;
  return 0.0;
}

function gradeColor(score: number): string {
  if (score >= 90) return 'text-green-400';
  if (score >= 80) return 'text-emerald-400';
  if (score >= 70) return 'text-yellow-400';
  if (score >= 60) return 'text-orange-400';
  return 'text-red-400';
}

export function CompetencyPanel() {
  const sessionId = useBlueJStore((s) => s.sessionId);
  const { data: registry, isLoading, isError } = useRegistry();
  const { data: serverProgress } = useGetProgress(sessionId);
  const conceptsMastered = useProgressStore((s) => s.stats.conceptsMastered);
  const hydrateConcepts = useProgressStore((s) => s.hydrateConcepts);

  // Hydrate local store from the authoritative server record once it loads. We
  // replace local state wholesale (even when the server has no graded concepts
  // yet) so stale/legacy local entries cannot masquerade as empirical mastery.
  useEffect(() => {
    if (serverProgress) {
      hydrateConcepts((serverProgress.conceptsMastered ?? []) as ConceptProgress[]);
    }
  }, [serverProgress, hydrateConcepts]);

  const progressById = useMemo(() => {
    const m = new Map<string, ConceptProgress>();
    for (const c of conceptsMastered) m.set(c.conceptId, c);
    return m;
  }, [conceptsMastered]);

  const [expanded, setExpanded] = useState<string | null>(null);

  // ── Transcript aggregates (over ATTEMPTED concepts) ──
  const attempted = useMemo(
    () => conceptsMastered.filter((c) => (c.attempts ?? 0) > 0 || (c.testsTotal ?? 0) > 0),
    [conceptsMastered],
  );
  const gpa = useMemo(() => {
    if (attempted.length === 0) return 0;
    const total = attempted.reduce((s, c) => s + gradePoints(c.bestScore ?? c.proficiency), 0);
    return total / attempted.length;
  }, [attempted]);
  const totalConcepts = registry?.concepts.length ?? 0;
  const masteredCount = conceptsMastered.filter((c) => c.mastered).length;

  // Group concepts by phase for the transcript.
  const phases = useMemo(() => {
    if (!registry) return [];
    const byPhase = new Map<number, { phaseId: number; name: string; concepts: PublicConcept[] }>();
    for (const c of registry.concepts) {
      const entry = byPhase.get(c.phaseId) ?? { phaseId: c.phaseId, name: c.category, concepts: [] };
      entry.concepts.push(c);
      byPhase.set(c.phaseId, entry);
    }
    return Array.from(byPhase.values()).sort((a, b) => a.phaseId - b.phaseId);
  }, [registry]);

  return (
    <div className="h-full flex flex-col hud-panel">
      <div className="px-4 py-2 border-b border-primary/20 bg-secondary/50 flex items-center gap-2 text-primary font-hud uppercase tracking-widest text-sm">
        <GraduationCap className="w-4 h-4" />
        <span>Competency Transcript // Empirical Record</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-primary/50 font-hud text-xs py-10">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading assessment registry…
          </div>
        )}
        {isError && (
          <div className="text-red-400/80 font-hud text-xs py-10 text-center">
            Assessment registry unavailable. Is the API server running?
          </div>
        )}

        {registry && (
          <>
            {/* ── Transcript summary ── */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-secondary/50 rounded-sm p-3 border border-primary/20 text-center">
                <div className={`text-2xl font-bold font-display ${gradeColor((gpa / 4) * 100)}`}>
                  {gpa.toFixed(2)}
                </div>
                <div className="text-[10px] text-primary/40 uppercase font-hud tracking-wider">GPA / 4.0</div>
              </div>
              <div className="bg-secondary/50 rounded-sm p-3 border border-primary/20 text-center">
                <div className="text-2xl font-bold text-primary font-display">{masteredCount}/{totalConcepts}</div>
                <div className="text-[10px] text-primary/40 uppercase font-hud tracking-wider">Mastered</div>
              </div>
              <div className="bg-secondary/50 rounded-sm p-3 border border-primary/20 text-center">
                <div className="text-2xl font-bold text-primary font-display">{attempted.length}</div>
                <div className="text-[10px] text-primary/40 uppercase font-hud tracking-wider">Attempted</div>
              </div>
            </div>

            <p className="text-[10px] text-primary/40 font-mono leading-relaxed">
              Mastery requires a best score of <span className="text-primary/70">{registry.masteryThreshold}%+</span> on a
              real graded assessment. Code tasks run your program against hidden test cases; theory tasks are objective exams.
            </p>

            {/* ── Phases → concepts ── */}
            {phases.map((phase) => (
              <div key={phase.phaseId} className="space-y-1.5">
                <h3 className="text-xs font-bold text-primary/70 uppercase tracking-widest font-hud flex items-center gap-1.5 pt-1">
                  <span className="text-accent/70">P{phase.phaseId}</span> {phase.name}
                </h3>
                {phase.concepts.map((concept) => {
                  const assessment = concept.assessments[0];
                  const prog = progressById.get(concept.id);
                  const isOpen = expanded === concept.id;
                  return (
                    <div key={concept.id} className="border border-primary/15 rounded-sm bg-secondary/30 overflow-hidden">
                      <button
                        onClick={() => setExpanded(isOpen ? null : concept.id)}
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-left hover:bg-primary/5 transition-colors"
                      >
                        {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-primary/50 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-primary/50 shrink-0" />}
                        {assessment?.type === 'code'
                          ? <FlaskConical className="w-3.5 h-3.5 text-cyan-400/80 shrink-0" />
                          : <ListChecks className="w-3.5 h-3.5 text-purple-400/80 shrink-0" />}
                        <span className="flex-1 text-xs font-hud text-primary/85 truncate">{concept.name}</span>
                        {prog ? (
                          <>
                            <span className={`text-xs font-bold font-display ${gradeColor(prog.bestScore ?? prog.proficiency)}`}>
                              {letterGrade(prog.bestScore ?? prog.proficiency)}
                            </span>
                            <span className="text-[10px] text-primary/50 font-hud w-9 text-right">{prog.bestScore ?? prog.proficiency}%</span>
                            {prog.mastered
                              ? <Award className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                              : <span className="w-3.5 shrink-0" />}
                          </>
                        ) : (
                          <span className="text-[9px] text-primary/30 font-hud uppercase tracking-wider flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Ungraded
                          </span>
                        )}
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && assessment && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-primary/15"
                          >
                            <AssessmentRunner
                              sessionId={sessionId}
                              concept={concept}
                              assessment={assessment}
                              progress={prog}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Assessment runner (code submit OR quiz) ─────────────────────────────────
function AssessmentRunner({
  sessionId, concept, assessment, progress,
}: {
  sessionId: string;
  concept: PublicConcept;
  assessment: PublicAssessment;
  progress?: ConceptProgress;
}) {
  const applyGradeResult = useProgressStore((s) => s.applyGradeResult);
  const storeLang = useBlueJStore((s) => s.selectedLanguage);
  const grade = useGradeSubmission();
  const [result, setResult] = useState<GradingResult | null>(null);

  // Code state
  const langs = assessment.languages ?? [];
  const defaultLang = langs.includes(storeLang) ? storeLang : (langs[0] ?? 'python');
  const [language, setLanguage] = useState(defaultLang);
  const [code, setCode] = useState('');

  // Quiz state
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const submit = async () => {
    setResult(null);
    try {
      if (assessment.type === 'code') {
        if (!code.trim()) return;
        const r = await grade.mutateAsync({ sessionId, assessmentId: assessment.id, language, code });
        setResult(r);
        applyGradeResult(r.conceptProgress as ConceptProgress);
      } else {
        const r = await grade.mutateAsync({ sessionId, assessmentId: assessment.id, answers });
        setResult(r);
        applyGradeResult(r.conceptProgress as ConceptProgress);
      }
    } catch {
      /* error surfaced via grade.isError below */
    }
  };

  const reset = () => {
    setResult(null);
    if (assessment.type === 'quiz') setAnswers({});
  };

  const allAnswered = assessment.type === 'quiz'
    && (assessment.questions ?? []).every((q) => !!answers[q.id]);

  return (
    <div className="p-3 space-y-3 bg-background/40">
      {/* Objectives */}
      {concept.objectives.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {concept.objectives.map((o) => (
            <span key={o} className="text-[9px] font-hud uppercase tracking-wider text-primary/50 border border-primary/15 rounded-sm px-1.5 py-0.5">
              {o}
            </span>
          ))}
        </div>
      )}

      <div>
        <div className="text-xs font-hud text-primary/80 font-medium mb-1">{assessment.title}</div>
        <p className="text-[11px] text-primary/60 font-mono whitespace-pre-wrap leading-relaxed">{assessment.prompt}</p>
      </div>

      {assessment.type === 'code' ? (
        <>
          {/* Sample cases */}
          {(assessment.sampleCases ?? []).length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] text-primary/40 uppercase font-hud tracking-wider">Sample Cases</div>
              {(assessment.sampleCases ?? []).map((sc) => (
                <div key={sc.id} className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="bg-secondary/40 rounded-sm p-1.5 border border-primary/10">
                    <span className="text-primary/30">stdin:</span>
                    <pre className="text-primary/70 whitespace-pre-wrap">{sc.stdin ?? '(none)'}</pre>
                  </div>
                  <div className="bg-secondary/40 rounded-sm p-1.5 border border-primary/10">
                    <span className="text-primary/30">expected:</span>
                    <pre className="text-green-400/70 whitespace-pre-wrap">{sc.expectedStdout}</pre>
                  </div>
                </div>
              ))}
              {(assessment.hiddenCaseCount ?? 0) > 0 && (
                <div className="text-[10px] text-primary/30 font-hud flex items-center gap-1">
                  <Lock className="w-3 h-3" /> + {assessment.hiddenCaseCount} hidden test case{assessment.hiddenCaseCount === 1 ? '' : 's'}
                </div>
              )}
            </div>
          )}

          {/* Language + editor */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-primary/40 uppercase font-hud tracking-wider">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-secondary/60 border border-primary/20 rounded-sm text-[11px] font-hud text-primary/80 px-2 py-1 focus:outline-none focus:border-primary/50"
            >
              {langs.map((l) => (
                <option key={l} value={l}>{CODE_LANG_LABELS[l] ?? l}</option>
              ))}
            </select>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            placeholder={`# Write your ${CODE_LANG_LABELS[language] ?? language} solution here.\n# Read from standard input, print the exact expected output.`}
            className="w-full h-40 bg-background/80 border border-primary/20 rounded-sm p-2 text-[11px] font-mono text-primary/90 focus:outline-none focus:border-primary/50 resize-y"
          />
        </>
      ) : (
        /* Quiz */
        <div className="space-y-3">
          {(assessment.questions ?? []).map((q, qi) => {
            const qResult = result?.questions?.find((r) => r.id === q.id);
            return (
              <div key={q.id} className="space-y-1.5">
                <div className="text-[11px] font-hud text-primary/80">
                  <span className="text-accent/70">{qi + 1}.</span> {q.prompt}
                </div>
                <div className="space-y-1">
                  {q.options.map((opt) => {
                    const chosen = answers[q.id] === opt.id;
                    const isCorrect = qResult && qResult.correctOptionId === opt.id;
                    const isWrongChoice = qResult && chosen && !qResult.passed;
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-sm border text-[11px] font-mono cursor-pointer transition-colors ${
                          isCorrect ? 'border-green-500/40 bg-green-500/10 text-green-300'
                          : isWrongChoice ? 'border-red-500/40 bg-red-500/10 text-red-300'
                          : chosen ? 'border-primary/40 bg-primary/5 text-primary/90'
                          : 'border-primary/10 bg-secondary/30 text-primary/60 hover:border-primary/25'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`${assessment.id}-${q.id}`}
                          checked={chosen}
                          disabled={!!result}
                          onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt.id }))}
                          className="accent-primary"
                        />
                        <span className="flex-1">{opt.text}</span>
                        {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
                        {isWrongChoice && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                      </label>
                    );
                  })}
                </div>
                {qResult?.explanation && (
                  <p className="text-[10px] text-primary/40 font-mono pl-2 border-l-2 border-primary/20">{qResult.explanation}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!result ? (
          <button
            onClick={submit}
            disabled={grade.isPending || (assessment.type === 'code' ? !code.trim() : !allAnswered)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-primary/15 border border-primary/30 text-primary text-xs font-hud uppercase tracking-wider hover:bg-primary/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {grade.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Submit for Grade
          </button>
        ) : (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-secondary/60 border border-primary/20 text-primary/70 text-xs font-hud uppercase tracking-wider hover:bg-secondary/80 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Try Again
          </button>
        )}
        {grade.isError && (
          <span className="text-[11px] text-red-400/80 font-hud">{(grade.error as Error)?.message ?? 'Grading failed'}</span>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-sm border p-3 space-y-2 ${result.mastered ? 'border-green-500/30 bg-green-500/5' : 'border-orange-500/30 bg-orange-500/5'}`}>
          <div className="flex items-center gap-2">
            {result.mastered ? <Award className="w-5 h-5 text-yellow-400" /> : <FlaskConical className="w-5 h-5 text-orange-400" />}
            <span className={`text-2xl font-bold font-display ${gradeColor(result.score)}`}>{result.score}%</span>
            <span className={`text-lg font-bold font-display ${gradeColor(result.score)}`}>{letterGrade(result.score)}</span>
            <span className="text-[11px] font-hud uppercase tracking-wider text-primary/60 ml-auto">
              {result.mastered ? 'Concept Mastered' : `Need ${concept.masteryThreshold}% to master`}
            </span>
          </div>
          <div className="text-[10px] text-primary/50 font-hud">
            {result.testsPassed}/{result.testsTotal} {result.type === 'code' ? 'test cases' : 'questions'} passed
            {progress && (progress.attempts ?? 0) > 0 && <> · best {result.conceptProgress.bestScore}% over {result.conceptProgress.attempts} attempt{result.conceptProgress.attempts === 1 ? '' : 's'}</>}
          </div>

          {result.compileError && (
            <pre className="text-[10px] text-red-400/80 font-mono bg-background/60 rounded-sm p-2 whitespace-pre-wrap overflow-x-auto">{result.compileError}</pre>
          )}

          {/* Per-case results for code */}
          {result.type === 'code' && result.cases && (
            <div className="space-y-1">
              {result.cases.map((c, i) => (
                <div key={c.id} className="text-[10px] font-mono">
                  <div className="flex items-center gap-1.5">
                    {c.passed ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <XCircle className="w-3 h-3 text-red-400" />}
                    <span className="text-primary/60">Case {i + 1}{c.hidden ? ' (hidden)' : ''} · {c.points} pts</span>
                    {c.message && <span className="text-red-400/60 truncate">— {c.message}</span>}
                  </div>
                  {!c.hidden && !c.passed && (c.expected !== undefined) && (
                    <div className="grid grid-cols-2 gap-2 mt-1 pl-4">
                      <div><span className="text-primary/30">expected:</span> <pre className="inline text-green-400/70 whitespace-pre-wrap">{c.expected}</pre></div>
                      <div><span className="text-primary/30">got:</span> <pre className="inline text-red-400/70 whitespace-pre-wrap">{c.got}</pre></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
