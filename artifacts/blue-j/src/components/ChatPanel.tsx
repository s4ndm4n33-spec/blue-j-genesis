import { useState, useRef, useEffect, useCallback } from 'react';
import { useChatStream } from '@/hooks/use-chat';
import { useAudioOutput, useVoiceRecording } from '@/hooks/use-audio';
import { Send, Mic, Volume2, VolumeX, Terminal as TerminalIcon, Loader2, MicOff, Download, X, Code2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

import { useBlueJStore } from '@/lib/store';

export function ChatPanel() {
  const { messages, isTyping, sendMessage } = useChatStream();
  const conversationId = useBlueJStore(s => s.conversationId);
  const [input, setInput] = useState("");
  const [exportBanner, setExportBanner] = useState<{ show: boolean; count: number }>({ show: false, count: 0 });
  const [exportToast, setExportToast] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const showExportToastRef = useRef<(text: string) => void>(() => {});
  showExportToastRef.current = (text: string) => { setExportToast(text); setTimeout(() => setExportToast(''), 3000); };

  // Detect system archive messages to show export banner
  useEffect(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role === 'system' && m.content.includes('CONTEXT ARCHIVED')) {
        const match = m.content.match(/(\d+)\s+earlier/);
        if (match) {
          setExportBanner({ show: true, count: Number(match[1]) });
          break;
        }
      }
    }
  }, [messages]);

  const handleExport = () => {
    const convId = conversationId;
    if (!convId) {
      showExportToastRef.current?.('No active conversation to export.');
      return;
    }
    const a = document.createElement('a');
    a.href = `/api/bluej/chat/${convId}/export`;
    a.download = `bluej-conversation-${convId}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setExportBanner({ show: false, count: 0 });
  };

  const { isPlaying, playBase64Audio, stopAudio } = useAudioOutput();

  const handleTranscription = useCallback((text: string) => {
    if (text.trim()) {
      // Auto-submit voice input
      sendMessage(text, playBase64Audio, true);
      setInput("");
    }
  }, [sendMessage, playBase64Audio]);

  const { isRecording, isTranscribing, recordingState, startRecording, stopRecording } = useVoiceRecording(handleTranscription);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input, playBase64Audio, false);
      setInput("");
    }
  };

  const handleShareWorkspace = () => {
    const text = input.trim() ? input : "Please review my workspace code.";
    sendMessage(text, playBase64Audio, false, true);
    setInput("");
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isTranscribing) {
      startRecording();
    }
  };

  const micLabel =
    recordingState === 'recording' ? 'Stop recording' :
    recordingState === 'transcribing' ? 'Transcribing...' :
    recordingState === 'error' ? 'Mic error' :
    'Start voice input';

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
          title={isPlaying ? 'Stop audio' : 'Audio off'}
        >
          {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Export Banner */}
      <AnimatePresence>
        {exportBanner.show && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-accent/30 bg-accent/10 overflow-hidden"
          >
            <div className="px-4 py-2 flex items-center justify-between gap-3 text-xs font-hud">
              <div className="flex items-center gap-2 text-accent/80">
                <Download className="w-3.5 h-3.5" />
                <span className="uppercase tracking-wider">{exportBanner.count} earlier messages archived — export full log?</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="px-2.5 py-1 bg-accent/20 hover:bg-accent/30 border border-accent/50 text-accent rounded-sm text-[0.65rem] uppercase tracking-wider transition-all"
                >
                  Export .md
                </button>
                <button
                  onClick={() => setExportBanner({ show: false, count: 0 })}
                  className="p-1 text-primary/40 hover:text-primary transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Toast */}
      <AnimatePresence>
        {exportToast && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-destructive/30 bg-destructive/10 overflow-hidden"
          >
            <div className="px-4 py-2 text-[0.7rem] font-mono text-destructive">{exportToast}</div>
          </motion.div>
        )}
      </AnimatePresence>

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
                {msg.role === 'user' && (
                  <span className="text-accent flex items-center gap-1">
                    {msg.voiceInput && <Mic className="w-3 h-3" />}
                    OPERATOR
                  </span>
                )}
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
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="ml-2 uppercase tracking-widest">Compiling Response...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recording Indicator Banner */}
      <AnimatePresence>
        {(isRecording || isTranscribing) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-destructive/30 bg-destructive/10 overflow-hidden"
          >
            <div className="px-4 py-2 flex items-center gap-3 text-xs font-hud">
              {isRecording ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse flex-shrink-0" />
                  <span className="text-destructive uppercase tracking-widest">Recording — Click mic to stop</span>
                </>
              ) : (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-accent animate-spin flex-shrink-0" />
                  <span className="text-accent uppercase tracking-widest">Transcribing audio...</span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area — pb accounts for iOS home indicator / Android nav bar */}
      <div className="p-4 border-t border-primary/20 bg-secondary/30" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isTranscribing ? "Transcribing your voice..." : "Type or speak to J. (Enter to send, Shift+Enter for newline)"}
            disabled={isTranscribing}
            className="flex-1 bg-background border border-primary/30 rounded-sm p-3 text-sm font-mono text-primary placeholder:text-primary/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 resize-none min-h-[56px] max-h-[160px] disabled:opacity-50"
            rows={2}
          />

          {/* Share Workspace Button */}
          <button
            onClick={handleShareWorkspace}
            disabled={isTyping || isTranscribing}
            title="Share workspace code with J."
            className="h-[56px] w-[48px] flex items-center justify-center rounded-sm border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Code2 className="w-4 h-4" />
          </button>

          {/* Mic Button */}
          <button
            onClick={handleMicClick}
            disabled={isTranscribing}
            title={micLabel}
            className={`h-[56px] w-[48px] flex items-center justify-center rounded-sm border transition-all flex-shrink-0 ${
              recordingState === 'error'
                ? 'border-destructive/50 bg-destructive/10 text-destructive'
                : isRecording
                ? 'border-destructive bg-destructive/20 text-destructive animate-pulse'
                : isTranscribing
                ? 'border-accent/50 bg-accent/10 text-accent cursor-wait'
                : 'border-primary/30 bg-secondary text-primary/60 hover:text-primary hover:border-primary/60'
            }`}
          >
            {isTranscribing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : recordingState === 'error' ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping || isTranscribing}
            className="h-[56px] px-4 bg-primary/20 hover:bg-primary/40 border border-primary/50 text-primary rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
