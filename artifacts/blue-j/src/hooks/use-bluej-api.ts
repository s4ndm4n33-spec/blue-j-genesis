import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type UserProgress, type CompleteTaskBody, type TtsRequestBody, type TtsResponse } from "@workspace/api-client-react";

// Wrapping the generated types into native fetch hooks to handle API routing securely
// Since this is a specialized frontend we want to control the fetch credentials perfectly

export function useGetProgress(sessionId: string) {
  return useQuery({
    queryKey: ['/api/bluej/progress', sessionId],
    queryFn: async (): Promise<UserProgress> => {
      const res = await fetch(`/api/bluej/progress?sessionId=${sessionId}`);
      if (!res.ok) {
        // Return default progress if not found
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

export function useTextToSpeech() {
  return useMutation({
    mutationFn: async ({ data }: { data: TtsRequestBody }): Promise<TtsResponse> => {
      const res = await fetch('/api/bluej/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('TTS Failed');
      return res.json();
    }
  });
}
