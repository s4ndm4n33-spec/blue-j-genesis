import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBlueJStore } from "@/lib/store";

export interface GradedConceptProgress {
  conceptId: string;
  name: string;
  category: string;
  phaseId: number;
  proficiency: number;
  bestScore: number;
  attempts: number;
  testsPassed: number;
  testsTotal: number;
  lastAttempted: number;
  mastered: boolean;
}

export interface UserProgress {
  sessionId: string;
  currentPhase: number;
  currentTask: number;
  completedTasks: number[];
  selectedLanguage: string;
  selectedOs: string;
  conceptsMastered?: GradedConceptProgress[];
}

// ─── Assessment registry (public — answers stripped server-side) ─────────────
export interface PublicSampleCase {
  id: string;
  stdin?: string;
  argv?: string[];
  expectedStdout: string;
  points: number;
}

export interface PublicQuizQuestion {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
  points: number;
}

export interface PublicAssessment {
  id: string;
  conceptId: string;
  type: 'code' | 'quiz';
  title: string;
  prompt: string;
  totalPoints: number;
  languages?: string[];
  sampleCases?: PublicSampleCase[];
  hiddenCaseCount?: number;
  questions?: PublicQuizQuestion[];
}

export interface PublicConcept {
  id: string;
  name: string;
  category: string;
  phaseId: number;
  taskIds: string[];
  objectives: string[];
  weight: number;
  masteryThreshold: number;
  assessments: PublicAssessment[];
}

export interface PublicRegistry {
  version: string;
  masteryThreshold: number;
  concepts: PublicConcept[];
}

// ─── Grading ─────────────────────────────────────────────────────────────────
export interface GradeCaseResult {
  id: string;
  passed: boolean;
  points: number;
  hidden: boolean;
  stdin?: string;
  expected?: string;
  got?: string;
  message?: string;
}

export interface GradeQuestionResult {
  id: string;
  passed: boolean;
  points: number;
  correctOptionId?: string; // only revealed once the concept is mastered
  explanation?: string;
}

export interface GradingResult {
  conceptId: string;
  assessmentId: string;
  type: 'code' | 'quiz';
  score: number;
  passedPoints: number;
  totalPoints: number;
  testsPassed: number;
  testsTotal: number;
  mastered: boolean;
  compileError?: string;
  cases?: GradeCaseResult[];
  questions?: GradeQuestionResult[];
  conceptProgress: GradedConceptProgress;
}

export interface GradeSubmissionBody {
  sessionId: string;
  assessmentId: string;
  language?: string;
  code?: string;
  answers?: Record<string, string>;
}

export interface CompleteTaskBody {
  sessionId: string;
  phaseIndex: number;
  taskIndex: number;
  selectedLanguage?: string;
  selectedOs?: string;
}

export interface TtsRequestBody {
  text: string;
  voice?: string;
}

export interface TtsResponse {
  audio: string;
  format: string;
}

export function useGetProgress(sessionId: string) {
  return useQuery({
    queryKey: ['/api/bluej/progress', sessionId],
    queryFn: async (): Promise<UserProgress> => {
      const res = await fetch(`/api/bluej/progress?sessionId=${sessionId}`);
      if (!res.ok) {
        return {
          sessionId,
          currentPhase: 1,
          currentTask: 1,
          completedTasks: [],
          selectedLanguage: 'python',
          selectedOs: 'linux',
        };
      }
      return res.json();
    }
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CompleteTaskBody): Promise<UserProgress> => {
      const res = await fetch('/api/bluej/progress/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to complete task');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/bluej/progress', data.sessionId], data);
    }
  });
}

export function useRegistry() {
  return useQuery({
    queryKey: ['/api/bluej/grade/registry'],
    queryFn: async (): Promise<PublicRegistry> => {
      const res = await fetch('/api/bluej/grade/registry');
      if (!res.ok) throw new Error('Failed to load assessment registry');
      return res.json();
    },
    staleTime: Infinity,
  });
}

export function useGradeSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: GradeSubmissionBody): Promise<GradingResult> => {
      const res = await fetch('/api/bluej/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Grading failed');
      }
      return res.json();
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bluej/progress', vars.sessionId] });
    },
  });
}

export function useTextToSpeech() {
  return useMutation({
    mutationFn: async ({ data }: { data: TtsRequestBody }): Promise<TtsResponse> => {
      const userApiKey = useBlueJStore.getState().userApiKey;
      const res = await fetch('/api/bluej/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userApiKey ? { 'x-openai-key': userApiKey } : {}),
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('TTS Failed');
      return res.json();
    }
  });
}
