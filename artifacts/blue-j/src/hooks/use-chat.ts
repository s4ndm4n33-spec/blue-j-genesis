import { useCallback } from 'react';
import { useBlueJStore, type ChatMessage } from '@/lib/store';
import { useTextToSpeech } from '@/hooks/use-bluej-api';
import { useProgressStore } from '@/lib/progress-store';

export type { ChatMessage };

export function useChatStream() {
  const store = useBlueJStore();
  const {
    sessionId,
    conversationId, setConversationId,
    selectedLanguage, selectedOs,
    hardwareInfo, learnerMode,
    messages, isTyping,
    addMessage, updateLastAssistantMessage, setIsTyping, addSystemMessage, clearMessages, addChapterSummary,
    userApiKey,
  } = store;

  const { trackEvent, trackLanguageUsed } = useProgressStore();
  const ttsMutation = useTextToSpeech();

  const sendMessage = useCallback(async (
    content: string,
    onAudioReceived?: (b64: string, fmt: string) => void,
    isVoice = false,
    forceShareWorkspace = false
  ) => {
    if (!content.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
      voiceInput: isVoice,
    };

    addMessage(userMsg);
    setIsTyping(true);

    // Detect explicit workspace-share intent or keyword recall
    const shareKeywords = /\b(look at my code|check my code|review my code|see my code|what's wrong with my code|fix my code|optimize my code|workspace code|my code is|the code in my editor|share workspace)\b/i;
    const recallKeywords = /\b(what about the code|the code you saw|my code earlier|the workspace|the editor code|that code)\b/i;
    const repoKeywords = /\b(my repo|the repo|look at my repo|check my repo|review my repo|my project|the project|git repo|repository)\b/i;
    const messageHistory = messages.slice(-6);
    const recentShare = messageHistory.some(m =>
      m.role === 'user' && shareKeywords.test(m.content)
    );
    const shouldIncludeWorkspace = forceShareWorkspace || shareKeywords.test(content) || (recentShare && recallKeywords.test(content));
    const shouldIncludeRepo = repoKeywords.test(content);

    let repoContext: string | undefined;
    if (shouldIncludeRepo) {
      try {
        const resp = await fetch(`/api/bluej/git/context/${sessionId}`);
        if (resp.ok) {
          const data = await resp.json();
          repoContext = JSON.stringify(data.repos);
        }
      } catch {
        // silently ignore repo fetch failure
      }
    }

    try {
      const response = await fetch(`/api/bluej/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userApiKey ? { 'x-openai-key': userApiKey } : {}),
        },
        body: JSON.stringify({
          sessionId,
          message: content,
          conversationId,
          language: selectedLanguage,
          os: selectedOs,
          phaseIndex: 0,
          taskIndex: 0,
          hardwareInfo,
          learnerMode,
          ...(shouldIncludeWorkspace ? { myCode: useBlueJStore.getState().myCode } : {}),
          ...(repoContext ? { repoContext } : {}),
        })
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let sseBuffer = "";

      const assistantMsgId = `a-${Date.now()}`;

      addMessage({
        id: assistantMsgId,
        role: 'assistant',
        content: "",
        timestamp: Date.now()
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split('\n');
        // Keep the last (potentially incomplete) line in the buffer
        sseBuffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const dataStr = trimmed.slice(6).trim();
          if (dataStr === '[DONE]') continue;
          try {
            const data = JSON.parse(dataStr);
            if (data.content) {
              assistantContent += data.content;
              updateLastAssistantMessage(assistantMsgId, assistantContent);
            }
            if (data.done && data.conversationId) {
              setConversationId(data.conversationId);
              if (data.milestoneReset) {
                if (data.chapterSummary) addChapterSummary(data.chapterSummary);
                clearMessages();
                addSystemMessage("── CHAPTER COMPLETE — J. has archived this chapter. Open Export & Save → Progress to review all chapters. ──");
              }
              if (data.contextArchived && data.archivedCount > 0) {
                addSystemMessage(`── CONTEXT ARCHIVED — ${data.archivedCount} earlier messages were summarized to preserve token budget. Export the full log from the menu above. ──`);
              }
            } else if (data.conversationId && !conversationId) {
              setConversationId(data.conversationId);
            }
          } catch {
            // Partial JSON carried over — will complete in next read
          }
        }
      }

      setIsTyping(false);

      if (assistantContent) {
        trackEvent('chat');
        trackLanguageUsed(selectedLanguage);
      }

      if (assistantContent && onAudioReceived) {
        const textForSpeech = assistantContent.replace(/```[\s\S]*?```/g, " [Code Block] ");
        ttsMutation.mutate({ data: { text: textForSpeech, voice: 'echo' } }, {
          onSuccess: (res) => onAudioReceived(res.audio, res.format)
        });
      }

    } catch (err) {
      console.error("Chat error", err);
      setIsTyping(false);
      const errMsg = String(err);
      const isQuota = errMsg.includes("quota") || errMsg.includes("exceeded") || errMsg.includes("503") || errMsg.includes("spend limit");
      addMessage({
        id: `err-${Date.now()}`,
        role: 'system',
        content: isQuota
          ? "AI service quota exceeded. Open Settings (gear icon) and add your OpenAI API key to continue."
          : "ERROR: Connection to J. interrupted. ULTRON protocol failsafe engaged.",
        timestamp: Date.now()
      });
    }
  }, [
    sessionId, conversationId, selectedLanguage, selectedOs,
    hardwareInfo, learnerMode, setConversationId, userApiKey,
    addMessage, updateLastAssistantMessage, setIsTyping, addSystemMessage, clearMessages, addChapterSummary,
    ttsMutation, trackEvent, trackLanguageUsed
  ]);

  return { messages, isTyping, sendMessage, addSystemMessage };
}

export type SendMessageFn = (
  content: string,
  onAudioReceived?: (b64: string, fmt: string) => void,
  isVoice?: boolean,
  forceShareWorkspace?: boolean
) => void;
