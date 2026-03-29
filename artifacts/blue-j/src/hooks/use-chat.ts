import { useCallback } from 'react';
import { useBlueJStore, type ChatMessage } from '@/lib/store';
import { useTextToSpeech } from '@/hooks/use-bluej-api';

export type { ChatMessage };

export function useChatStream() {
  const {
    sessionId,
    conversationId, setConversationId,
    selectedLanguage, selectedOs,
    hardwareInfo, learnerMode,
    messages, isTyping,
    addMessage, updateLastAssistantMessage, setIsTyping, addSystemMessage,
  } = useBlueJStore();

  const ttsMutation = useTextToSpeech();

  const sendMessage = useCallback(async (
    content: string,
    onAudioReceived?: (b64: string, fmt: string) => void,
    isVoice = false
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

    try {
      const response = await fetch(`/api/bluej/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
            if (data.conversationId && !conversationId) {
              setConversationId(data.conversationId);
            }
          } catch {
            // Partial JSON carried over — will complete in next read
          }
        }
      }

      setIsTyping(false);

      if (assistantContent && onAudioReceived) {
        const textForSpeech = assistantContent.replace(/```[\s\S]*?```/g, " [Code Block] ");
        ttsMutation.mutate({ data: { text: textForSpeech, voice: 'echo' } }, {
          onSuccess: (res) => onAudioReceived(res.audio, res.format)
        });
      }

    } catch (err) {
      console.error("Chat error", err);
      setIsTyping(false);
      addMessage({
        id: `err-${Date.now()}`,
        role: 'system',
        content: "ERROR: Connection to J. interrupted. ULTRON protocol failsafe engaged.",
        timestamp: Date.now()
      });
    }
  }, [
    sessionId, conversationId, selectedLanguage, selectedOs,
    hardwareInfo, learnerMode, setConversationId,
    addMessage, updateLastAssistantMessage, setIsTyping, ttsMutation
  ]);

  return { messages, isTyping, sendMessage, addSystemMessage };
}
