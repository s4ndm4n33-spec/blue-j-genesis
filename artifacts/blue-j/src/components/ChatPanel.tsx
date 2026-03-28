import { useState, useRef, useEffect } from 'react';
import { useChatStream, ChatMessage } from '@/hooks/use-chat';
import { useAudioOutput, useVoiceRecording } from '@/hooks/use-audio';
import { Send, Mic, Volume2, VolumeX, Terminal as TerminalIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

export function ChatPanel() {
  const { messages, isTyping, sendMessage } = useChatStream();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { isPlaying, playBase64Audio, stopAudio } = useAudioOutput();
  const { isRecording, startRecording, stopRecording } = useVoiceRecording((text) => {
    setInput(text);
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input, playBase64Audio);
      setInput("");
    }
  };

  return (
    <div className="h-full flex flex-col hud-panel">
      {/* Header */}
      <div className="px-4 py-2 border-b border-primary/20 bg-secondary/50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary font-hud uppercase tracking-widest text-sm">
          <TerminalIcon className="w-4 h-4" />
          <span>Comm-Link // J.</span>
        </div>
        <button 
          onClick={() => isPlaying ? stopAudio() : undefined}
          className={`p-1 rounded transition-colors ${isPlaying ? 'text-primary animate-pulse' : 'text-primary/30'}`}
        >
          {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 font-mono text-sm" ref={scrollRef}>
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 opacity-50 text-xs">
                {msg.role === 'assistant' && <span className="text-primary">J.</span>}
                {msg.role === 'user' && <span className="text-accent">OPERATOR</span>}
                {msg.role === 'system' && <span className="text-destructive">SYSTEM</span>}
              </div>
              <div className={`p-3 max-w-[90%] rounded-sm backdrop-blur-md border ${
                msg.role === 'user' 
                  ? 'bg-accent/10 border-accent/30 text-accent-foreground' 
                  : msg.role === 'system'
                  ? 'bg-destructive/10 border-destructive/50 text-destructive glow-border'
                  : 'bg-primary/5 border-primary/20 text-primary-foreground'
              }`}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-primary/20 prose-a:text-primary max-w-none text-sm">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-center text-primary/50 text-xs font-hud">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-75" />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150" />
              <span className="ml-2 uppercase tracking-widest">Compiling Response...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-primary/20 bg-secondary/30">
        <div className="relative flex items-end gap-2">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your response or paste code..."
            className="w-full bg-background border border-primary/30 rounded-sm p-3 pr-12 text-sm font-mono text-primary placeholder:text-primary/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 resize-none min-h-[60px] max-h-[200px]"
            rows={2}
          />
          <div className="absolute right-14 bottom-3 flex gap-2">
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2 rounded-sm transition-all ${isRecording ? 'bg-destructive/20 text-destructive animate-pulse glow-border' : 'bg-secondary text-primary/50 hover:text-primary'}`}
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="h-[60px] px-4 bg-primary/20 hover:bg-primary/40 border border-primary/50 text-primary rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
