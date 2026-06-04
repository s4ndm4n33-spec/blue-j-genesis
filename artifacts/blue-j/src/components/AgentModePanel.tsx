import { useState, useCallback, useRef, useEffect } from 'react';
import { useBlueJStore } from '@/lib/store';
import { useProgressStore } from '@/lib/progress-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Bot, Send, ChevronRight, AlertTriangle, CheckCircle2, Loader2, Shield } from 'lucide-react';

interface AgentMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  phase?: 'intake' | 'clarify' | 'plan' | 'act' | 'verify' | 'teach' | 'close';
  content: string;
  timestamp: number;
}

export function AgentModePanel() {
  const { agentModeUnlocked, unlockAgentMode, selectedLanguage, selectedOs, sessionId } = useBlueJStore();
  const { stats } = useProgressStore();

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Generate curriculum password from level
  const curriculumPassword = useCallback(() => {
    const level = stats.level;
    const seed = level >= 5 ? 'B' + (level * 7 + 13).toString(36).toUpperCase().padStart(3, '0') : null;
    return seed;
  }, [stats.level]);

  const handleUnlock = async () => {
    setPasswordError('');
    if (password.length < 4) {
      setPasswordError('Password must be at least 4 characters.');
      return;
    }
    try {
      const resp = await fetch('/api/bluej/agent/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, level: stats.level }),
      });
      const data = await resp.json();
      if (data.unlocked) {
        unlockAgentMode(password);
        setMessages([{
          id: 'welcome',
          role: 'agent',
          phase: 'intake',
          content: `Development Agent Mode activated. I am J. in agent configuration. State your objective and I will guide you through the development loop: intake, clarify, plan, act, verify, teach, close. I enforce the Five Masters and the Anti-Ultron protocol.`,
          timestamp: Date.now()
        }]);
      } else {
        setPasswordError('Invalid access key. Complete the curriculum or use your personal password.');
      }
    } catch {
      setPasswordError('Unlock failed. Please try again.');
    }
  };

  const sendAgentMessage = async () => {
    if (!input.trim() || isProcessing) return;
    const userMsg: AgentMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      const resp = await fetch('/api/bluej/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          language: selectedLanguage,
          os: selectedOs,
          sessionId,
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await resp.json();

      if (data.error) {
        setMessages(prev => [...prev, {
          id: `err-${Date.now()}`,
          role: 'system',
          content: data.error,
          timestamp: Date.now()
        }]);
      } else if (data.phases) {
        // Streaming phases from backend
        for (const phase of data.phases) {
          setMessages(prev => [...prev, {
            id: `p-${Date.now()}-${phase.phase}`,
            role: 'agent',
            phase: phase.phase,
            content: phase.content,
            timestamp: Date.now()
          }]);
          setCurrentPhase(phase.phase);
          await new Promise(r => setTimeout(r, 300));
        }
      } else {
        setMessages(prev => [...prev, {
          id: `a-${Date.now()}`,
          role: 'agent',
          content: data.content || 'No response.',
          timestamp: Date.now()
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'system',
        content: 'Agent connection failed. Check your API key in Settings.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsProcessing(false);
      setCurrentPhase(null);
    }
  };

  // Phase badge colors
  const phaseColor = (phase?: string) => {
    switch (phase) {
      case 'intake': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      case 'clarify': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'plan': return 'text-purple-400 border-purple-400/30 bg-purple-400/10';
      case 'act': return 'text-green-400 border-green-400/30 bg-green-400/10';
      case 'verify': return 'text-orange-400 border-orange-400/30 bg-orange-400/10';
      case 'teach': return 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10';
      case 'close': return 'text-primary border-primary/30 bg-primary/10';
      default: return 'text-primary/60 border-primary/20 bg-secondary/30';
    }
  };

  const phaseLabel = (phase?: string) => {
    switch (phase) {
      case 'intake': return 'INTAKE';
      case 'clarify': return 'CLARIFY';
      case 'plan': return 'PLAN';
      case 'act': return 'ACT';
      case 'verify': return 'VERIFY';
      case 'teach': return 'TEACH';
      case 'close': return 'CLOSE';
      default: return 'AGENT';
    }
  };

  // Lock screen
  if (!agentModeUnlocked) {
    const curriculumPass = curriculumPassword();
    return (
      <div className="h-full flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md hud-panel border border-primary/30 rounded-sm p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-primary/50 flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-hud text-primary uppercase tracking-widest text-sm">Development Agent Mode</h3>
              <p className="text-[0.65rem] font-mono text-primary/40">Locked — authorization required</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-primary/60 font-mono">
              Agent Mode is a locked feature. It provides a structured development loop with safety enforcement, Five Masters validation, and trace-and-debug teaching.
            </p>
            <div className="text-xs text-primary/50 font-mono space-y-1">
              <p>• <span className="text-primary/70">Curriculum password</span> {curriculumPass ? `(“${curriculumPass}”)` : '(reach Level 5 to unlock)'}</p>
              <p>• <span className="text-primary/70">Personal password</span> (set in Settings)</p>
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
              placeholder="Enter access key..."
              className="w-full bg-background border border-primary/30 rounded-sm px-3 py-2 text-xs font-mono text-primary placeholder:text-primary/30 focus:outline-none focus:border-primary"
            />
            {passwordError && (
              <div className="flex items-center gap-1.5 text-[0.7rem] text-red-400 font-mono">
                <AlertTriangle className="w-3 h-3" /> {passwordError}
              </div>
            )}
            <button
              onClick={handleUnlock}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-sm text-xs font-hud uppercase tracking-wider transition-all"
            >
              <Unlock className="w-3 h-3" /> Unlock
            </button>
          </div>

          <div className="border-t border-primary/10 pt-3 flex items-center gap-2 text-[0.6rem] font-mono text-primary/30">
            <Shield className="w-3 h-3" />
            <span>ANTI-ULTRON PROTOCOL — Agent Mode enforces safety on all code generation</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Unlocked agent interface
  return (
    <div className="h-full flex flex-col hud-panel overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 border-b border-primary/20 bg-secondary/50 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 text-primary font-hud uppercase tracking-widest text-sm">
          <Bot className="w-4 h-4" />
          <span>Development Agent // J.</span>
        </div>
        <div className="flex items-center gap-2">
          {currentPhase && (
            <span className={`text-[0.6rem] font-mono px-1.5 py-0.5 rounded border ${phaseColor(currentPhase)} uppercase tracking-wider`}>
              {currentPhase}
            </span>
          )}
          {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary/60" />}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[0.6rem] font-bold ${
                msg.role === 'user' ? 'bg-accent/20 text-accent' : msg.role === 'system' ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary'
              }`}>
                {msg.role === 'user' ? 'U' : msg.role === 'system' ? '!' : 'J'}
              </div>
              <div className={`max-w-[85%] rounded-sm px-3 py-2 text-xs font-mono leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : msg.role === 'system'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-secondary/40 text-primary border border-primary/10'
              }`}>
                {msg.phase && (
                  <div className={`inline-block text-[0.55rem] font-hud uppercase tracking-wider px-1 py-0.5 rounded border mb-1 mr-2 ${phaseColor(msg.phase)}`}>
                    {phaseLabel(msg.phase)}
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t border-primary/10 bg-secondary/30 flex-shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendAgentMessage())}
            placeholder={isProcessing ? 'Agent processing...' : 'State your objective...'}
            disabled={isProcessing}
            className="flex-1 bg-background border border-primary/30 rounded-sm px-3 py-2 text-xs font-mono text-primary placeholder:text-primary/30 focus:outline-none focus:border-primary disabled:opacity-50"
          />
          <button
            onClick={sendAgentMessage}
            disabled={isProcessing || !input.trim()}
            className="px-3 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-sm transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="mt-1 flex items-center gap-1 text-[0.55rem] font-mono text-primary/30">
          <ChevronRight className="w-2.5 h-2.5" />
          <span>Intake → Clarify → Plan → Act → Verify → Teach → Close</span>
        </div>
      </div>
    </div>
  );
}
