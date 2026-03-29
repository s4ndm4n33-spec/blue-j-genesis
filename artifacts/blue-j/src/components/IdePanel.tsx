import { useState, useMemo, useRef, useEffect } from 'react';
import { useBlueJStore, SIM_PROFILES, type SimHardwareProfile } from '@/lib/store';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Code2, Copy, Play, Check, Download, Zap, ChevronDown, ChevronUp,
  Terminal as TerminalIcon, Loader2, X, Cpu, ChevronRight, Activity
} from 'lucide-react';
import { useChatStream } from '@/hooks/use-chat';
import { DownloadModal } from './DownloadModal';
import { motion, AnimatePresence } from 'framer-motion';

const LANG_MAP: Record<string, string> = {
  python: 'python', py: 'python',
  javascript: 'javascript', js: 'javascript',
  typescript: 'typescript', ts: 'typescript',
  cpp: 'cpp', 'c++': 'cpp', c: 'c',
};

function extractCodeBlock(content: string): { code: string; lang: string } {
  const match = content.match(/```(\w+)?\n([\s\S]*?)```/);
  if (match) {
    const rawLang = (match[1] ?? 'python').toLowerCase();
    return { code: match[2].trim(), lang: LANG_MAP[rawLang] ?? rawLang };
  }
  return { code: '# Awaiting code synthesis from J...', lang: 'python' };
}

interface SimulationResult {
  output: string;
  simulatedAt: string;
  error?: string;
  profile?: {
    id: string;
    label: string;
    cores: number | null;
    ramGb: number | null;
    gpu: string | null;
  };
}

export function IdePanel() {
  const {
    selectedLanguage, selectedOs, myCode, setMyCode,
    simHardwareProfile, setSimHardwareProfile,
    hardwareInfo,
  } = useBlueJStore();
  const { messages, addSystemMessage } = useChatStream();

  const [activeTab, setActiveTab] = useState<'j_code' | 'my_code'>('j_code');
  const [copied, setCopied] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const { code: jCode, lang: jLang } = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'assistant') {
        const result = extractCodeBlock(msg.content);
        if (result.code !== '# Awaiting code synthesis from J...') return result;
      }
    }
    return { code: '# Awaiting code synthesis from J...', lang: selectedLanguage };
  }, [messages, selectedLanguage]);

  useEffect(() => {
    if (showTerminal && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [simResult, showTerminal]);

  const currentProfile = SIM_PROFILES.find(p => p.id === simHardwareProfile) ?? SIM_PROFILES[0];

  // Resolve "auto" to actual detected hardware
  const resolvedCores = simHardwareProfile === 'auto' ? hardwareInfo.cpuCores : currentProfile.cores;
  const resolvedRam   = simHardwareProfile === 'auto' ? hardwareInfo.ramGb   : currentProfile.ramGb;
  const resolvedGpu   = simHardwareProfile === 'auto' ? null                 : currentProfile.gpu;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTab === 'j_code' ? jCode : myCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulate = async () => {
    const codeToRun = activeTab === 'j_code' ? jCode : myCode;
    const lang = activeTab === 'j_code' ? jLang : selectedLanguage;
    if (!codeToRun.trim() || codeToRun.includes('Awaiting code')) return;

    setSimulating(true);
    setShowTerminal(true);
    setSimResult(null);

    try {
      const resp = await fetch(`/api/bluej/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeToRun,
          language: lang,
          os: selectedOs,
          simProfileId: simHardwareProfile,
          simCores: resolvedCores,
          simRamGb: resolvedRam,
          simGpu: resolvedGpu,
        }),
      });
      const data = await resp.json() as SimulationResult;
      setSimResult(data);
    } catch (err) {
      setSimResult({ output: '[Connection error — simulation unavailable]', simulatedAt: new Date().toISOString() });
    } finally {
      setSimulating(false);
    }
  };

  const handleOptimize = async () => {
    if (!myCode.trim()) return;
    setOptimizing(true);
    try {
      const resp = await fetch(`/api/bluej/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: myCode, language: selectedLanguage, os: selectedOs }),
      });
      const data = await resp.json() as { optimizedCode: string; explanation: string };
      if (data.optimizedCode) {
        setMyCode(data.optimizedCode);
        setActiveTab('my_code');
        addSystemMessage?.(`**J. on your optimization:** ${data.explanation}`);
      }
    } catch (err) {
      console.error('Optimize error:', err);
    } finally {
      setOptimizing(false);
    }
  };

  // Parse J.'s terminal comment (after ---)
  const { terminalOutput, jComment } = useMemo(() => {
    if (!simResult?.output) return { terminalOutput: '', jComment: '' };
    const parts = simResult.output.split(/\n---\n?/);
    return { terminalOutput: parts[0]?.trim() ?? '', jComment: parts[1]?.trim() ?? '' };
  }, [simResult]);

  const currentLang = activeTab === 'j_code' ? jLang : selectedLanguage;

  return (
    <>
      <div className="h-full flex flex-col hud-panel overflow-hidden">
        {/* Tab Header */}
        <div className="flex border-b border-primary/20 bg-secondary/50 flex-shrink-0">
          <button
            onClick={() => setActiveTab('j_code')}
            className={`flex-1 py-3 text-sm font-hud uppercase tracking-widest transition-colors ${activeTab === 'j_code' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-primary/50 hover:text-primary/80'}`}
          >
            J.'s Synthesis
          </button>
          <button
            onClick={() => setActiveTab('my_code')}
            className={`flex-1 py-3 text-sm font-hud uppercase tracking-widest transition-colors ${activeTab === 'my_code' ? 'text-accent border-b-2 border-accent bg-accent/5' : 'text-accent/50 hover:text-accent/80'}`}
          >
            My Workspace
          </button>
        </div>

        {/* Code Area */}
        <div className="flex-1 relative bg-[#1E1E1E] overflow-hidden flex flex-col min-h-0">
          {/* Top-right toolbar */}
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            <div className="bg-black/60 text-primary/70 text-xs px-2 py-1 rounded border border-primary/20 font-mono uppercase">
              {currentLang}
            </div>
            <button
              onClick={handleCopy}
              className="bg-black/60 hover:bg-primary/20 text-primary p-1.5 rounded border border-primary/20 transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'j_code' ? (
              <div className="p-4 pt-10 h-full">
                <SyntaxHighlighter
                  language={jLang}
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, padding: 0, background: 'transparent', fontSize: '0.85rem', lineHeight: '1.6' }}
                  showLineNumbers
                  lineNumberStyle={{ color: '#4a5568', minWidth: '2.5em' }}
                >
                  {jCode}
                </SyntaxHighlighter>
              </div>
            ) : (
              <textarea
                value={myCode}
                onChange={(e) => setMyCode(e.target.value)}
                className="w-full h-full p-4 pt-10 bg-transparent text-gray-300 font-mono text-sm focus:outline-none resize-none"
                style={{ lineHeight: '1.6' }}
                spellCheck={false}
                placeholder="Write or paste your code here..."
              />
            )}
          </div>

          {/* Terminal Panel */}
          <AnimatePresence>
            {showTerminal && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: '42%' }}
                exit={{ height: 0 }}
                className="border-t border-primary/30 bg-[#0d0d0d] flex flex-col overflow-hidden"
              >
                {/* Terminal Header */}
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-primary/20 bg-black/80 flex-shrink-0">
                  <div className="flex items-center gap-2 text-xs font-hud text-primary/70 uppercase tracking-widest">
                    <TerminalIcon className="w-3.5 h-3.5" />
                    <span>J. Simulation Engine</span>
                    {simulating && <Loader2 className="w-3 h-3 animate-spin text-accent" />}
                  </div>
                  {/* Simulation Mode Badge */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-green-900/30 border border-green-500/30 text-green-400 text-[0.65rem] font-hud px-2 py-0.5 rounded uppercase tracking-wider">
                      <Activity className="w-2.5 h-2.5" />
                      <span>AI SIM — No Local Runtime Required</span>
                    </div>
                    <button
                      onClick={() => setShowTerminal(false)}
                      className="text-primary/40 hover:text-primary transition-colors p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Profile info bar (shown after sim runs) */}
                {simResult?.profile && (
                  <div className="px-3 py-1 bg-primary/5 border-b border-primary/10 text-[0.68rem] font-mono text-primary/50 flex items-center gap-2 flex-shrink-0 flex-wrap">
                    <Cpu className="w-3 h-3 flex-shrink-0" />
                    <span>Target: <span className="text-primary/80">{simResult.profile.label}</span></span>
                    {simResult.profile.cores && <span>· {simResult.profile.cores}-core CPU</span>}
                    {simResult.profile.ramGb  && <span>· {simResult.profile.ramGb}GB RAM</span>}
                    {simResult.profile.gpu    && <span>· {simResult.profile.gpu}</span>}
                  </div>
                )}

                {/* Terminal Output */}
                <div ref={terminalRef} className="flex-1 overflow-auto p-3 font-mono text-xs leading-relaxed">
                  {simulating && (
                    <div className="text-green-500/70 animate-pulse">
                      {'>'} Running simulation on {currentProfile.label}...
                    </div>
                  )}
                  {simResult && !simulating && (
                    <>
                      <div className="text-green-400/50 mb-2 text-[0.68rem]">
                        {'>'} {new Date(simResult.simulatedAt).toLocaleTimeString()} — simulated output:
                      </div>
                      {terminalOutput ? (
                        <pre className="text-green-300 whitespace-pre-wrap break-words leading-relaxed">{terminalOutput}</pre>
                      ) : (
                        <span className="text-primary/40 italic">(no output)</span>
                      )}
                      {jComment && (
                        <div className="mt-3 pt-2 border-t border-primary/10 text-cyan-400/80 italic text-[0.75rem]">
                          J.: {jComment}
                        </div>
                      )}
                    </>
                  )}
                  {!simulating && !simResult && (
                    <div className="text-primary/30 italic space-y-1">
                      <p>No simulation run yet.</p>
                      <p className="text-[0.7rem]">Select a hardware profile below, then click "Simulate Execution."</p>
                      <p className="text-[0.7rem]">No Python, Node.js, or C++ compiler needed — J. handles all execution.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Toolbar */}
        <div className="p-2 border-t border-primary/20 bg-secondary/50 flex items-center justify-between gap-2 flex-shrink-0 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Download */}
            <button
              onClick={() => setShowDownload(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-accent/10 hover:bg-accent/20 border border-accent/40 text-accent rounded-sm transition-all text-xs font-hud uppercase tracking-wider"
              title="Download offline package"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Optimize (My Workspace only) */}
            {activeTab === 'my_code' && (
              <button
                onClick={handleOptimize}
                disabled={optimizing || !myCode.trim()}
                title="Ask J. to optimize your code for memory & performance"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 rounded-sm transition-all text-xs font-hud uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {optimizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{optimizing ? 'Optimizing...' : 'Optimize'}</span>
              </button>
            )}

            {/* Terminal Toggle */}
            <button
              onClick={() => setShowTerminal(v => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded-sm transition-all text-xs font-hud uppercase tracking-wider ${
                showTerminal
                  ? 'border-green-500/50 bg-green-500/10 text-green-400'
                  : 'border-primary/20 text-primary/50 hover:text-primary/80'
              }`}
              title="Toggle terminal"
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Terminal</span>
              {showTerminal ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>

            {/* Hardware Profile Selector */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(v => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary/70 hover:text-primary rounded-sm transition-all text-xs font-hud uppercase tracking-wider"
                title="Select simulation hardware profile"
              >
                <Cpu className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">{currentProfile.shortLabel}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute bottom-full mb-1 left-0 z-50 bg-background border border-primary/30 rounded-sm min-w-[260px] shadow-xl shadow-black/60"
                  >
                    {/* Header */}
                    <div className="px-3 py-2 border-b border-primary/20 text-[0.65rem] font-hud text-primary/50 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-3 h-3" />
                      <span>Simulation Hardware Profile</span>
                    </div>

                    {/* No local runtime disclaimer */}
                    <div className="px-3 py-2 bg-green-900/20 border-b border-green-500/20">
                      <p className="text-[0.65rem] text-green-400/80 font-mono leading-relaxed">
                        ✓ AI Simulation Mode — no Python, Node.js, or compiler installation required.
                        J. predicts exact output for each hardware target.
                      </p>
                    </div>

                    {/* Profile Options */}
                    {SIM_PROFILES.map(profile => (
                      <button
                        key={profile.id}
                        onClick={() => { setSimHardwareProfile(profile.id); setShowProfileMenu(false); setSimResult(null); }}
                        className={`w-full text-left px-3 py-2.5 flex items-start gap-3 hover:bg-primary/10 transition-colors border-b border-primary/10 last:border-0 ${
                          simHardwareProfile === profile.id ? 'bg-primary/10' : ''
                        }`}
                      >
                        <ChevronRight className={`w-3 h-3 mt-0.5 flex-shrink-0 transition-opacity ${simHardwareProfile === profile.id ? 'text-primary opacity-100' : 'opacity-0'}`} />
                        <div>
                          <div className={`text-xs font-hud uppercase tracking-wider ${simHardwareProfile === profile.id ? 'text-primary' : 'text-primary/70'}`}>
                            {profile.label}
                          </div>
                          <div className="text-[0.65rem] text-primary/40 font-mono mt-0.5">{profile.desc}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Simulate Button */}
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/40 border border-primary/50 text-primary rounded-sm transition-all text-sm font-hud uppercase tracking-wider glow-border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {simulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span className="hidden sm:inline">{simulating ? 'Simulating...' : 'Simulate Execution'}</span>
            <span className="sm:hidden">{simulating ? '...' : 'Run'}</span>
          </button>
        </div>
      </div>

      {showDownload && <DownloadModal onClose={() => setShowDownload(false)} />}

      {/* Close profile menu on outside click */}
      {showProfileMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
      )}
    </>
  );
}
