import { useState, useCallback } from 'react';
import { useBlueJStore } from '@/lib/store';
import { useTextToSpeech } from '@/hooks/use-bluej-api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    role: 'assistant',
    content: "Greetings. I am J. I understand we are to build a localized AI instance today. A clone of myself, if you will. Let us begin by evaluating your system environment.",
    timestamp: Date.now()
  }]);
  const [isTyping, setIsTyping] = useState(false);
  
  const { 
    sessionId, 
    conversationId, 
    setConversationId, 
    selectedLanguage, 
    selectedOs, 
    hardwareInfo 
  } = useBlueJStore();

  const ttsMutation = useTextToSpeech();

  const sendMessage = useCallback(async (content: string, onAudioReceived?: (b64: string, fmt: string) => void) => {
    if (!content.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/bluej/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: content,
          conversationId,
          language: selectedLanguage,
          os: selectedOs,
          phaseIndex: 1, // hardcoded for demo, normally from progress
          taskIndex: 1,
          hardwareInfo
        })
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      
      const assistantMsgId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant',
        content: "",
        timestamp: Date.now()
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));
        
        for (const line of lines) {
          const dataStr = line.replace('data: ', '').trim();
          if (dataStr === '[DONE]') continue;
          
          try {
            const data = JSON.parse(dataStr);
            if (data.content) {
              assistantContent += data.content;
              setMessages(prev => prev.map(m => 
                m.id === assistantMsgId ? { ...m, content: assistantContent } : m
              ));
            }
            if (data.conversationId && !conversationId) {
              setConversationId(data.conversationId);
            }
          } catch (e) {
            console.error("Failed to parse SSE chunk", e, dataStr);
          }
        }
      }

      setIsTyping(false);

      // Trigger TTS for the final assistant content
      if (assistantContent && onAudioReceived) {
        // Strip code blocks for speech to avoid speaking python syntax character by character
        const textForSpeech = assistantContent.replace(/```[\s\S]*?```/g, " [Code Block] ");
        ttsMutation.mutate({ data: { text: textForSpeech, voice: 'alloy' } }, {
          onSuccess: (res) => onAudioReceived(res.audio, res.format)
        });
      }

    } catch (err) {
      console.error("Chat error", err);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: "ERROR: Connection to J. interrupted. ULTRON protocol failsafe engaged.",
        timestamp: Date.now()
      }]);
    }
  }, [sessionId, conversationId, selectedLanguage, selectedOs, hardwareInfo, setConversationId, ttsMutation]);

  return { messages, isTyping, sendMessage };
}
