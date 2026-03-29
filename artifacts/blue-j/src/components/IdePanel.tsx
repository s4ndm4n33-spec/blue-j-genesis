import { useState, useMemo, useRef, useEffect } from 'react';
import { useBlueJStore } from '@/lib/store';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Code2, Copy, Play, Check, Download, Zap, ChevronDown, ChevronUp,
  Terminal as TerminalIcon, Loader2, X
} from 'lucide-react';
import { useChatStream } from '@/hooks/use-chat';
import { DownloadModal } from './DownloadModal';
import { motion, AnimatePresence } from 'framer-motion';

const LANG_MAP: Record<string, string> = {
  python: 'python',
  py: 'python',
  javascript: 'javascript',
  js: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  cpp: 'cpp',
  'c++': 'cpp',
  c: 'c',
};

function extractCodeBlock(content: string): { code: string; lang: string } {
  const match = content.match(/```(\w+)?\n([\s\S]*?)```/);
  if (match) {
    const rawLang = (match[1] ?? 'python').toLowerCase();
    const lang = LANG_MAP[rawLang] ?? rawLang;
    return { code: match[2].trim(), lang };
  }
  return { code: '# Awaiting code synthesis from J...', lang: 'python' };
}

interface SimulationResult {
  output: string;
  simulatedAt: string;
  error?: string;
}

export function IdePanel() {
  const { selectedLanguage, selectedOs, myCode, setMyCode } = useBlueJStore();
  const { messages, addSystemMessage } = useChatStream();
  const [activeTab, setActiveTab] = useState<'j_code' | 'my_code'>('j_code');
  const [copied, setCopied] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
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

  const handleCopy = () => {
    const codeToCopy = activeTab === 'j_code' ? jCode : myCode;
    navigator.clipboard.writeText(codeToCopy);
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
        body: JSON.stringify({ code: codeToRun, language: lang, os: selectedOs }),
      });
      const data = await resp.json() as SimulationResult;
      setSimResult(data);
    } catch (err) {
      setSimResult({ output: '[Connection error — simulation unavailable]', simulatedAt: new Date().toISOString(), error: String(err) });
    } finally {
      setSimulating(false);
    }
  };

  const handleOptimize = async () => {
    if (!myCode.trim() || myCode.includes('Hello, J.')) return;
    setOptimizing(true);

    try {
      const resp = await fetch(`/api/bluej/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: myCode, language: selectedLanguage, os: selectedOs }),
      });
      const data = await resp.json() as { optimizedCode: string; explanation: string; language: string };

      if (data.optimizedCode) {
        setMyCode(data.optimizedCode);
        setActiveTab('my_code');
        if (addSystemMessage) {
          addSystemMessage(`**J. on your optimization:** ${data.explanation}`);
        }
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
    return {
      terminalOutput: parts[0]?.trim() ?? '',
      jComment: parts[1]?.trim() ?? '',
    };
  }, [simResult]);

  const currentLang = activeTab === 'j_code' ? jLang : selectedLanguage;

  return (
    <>
      <div className="h-full flex flex-col hud-panel overflow-hidden">
        {/* Header Tabs */}
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
              <div className="p-4 pt-10 text-sm font-mono h-full">
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
                animate={{ height: '40%' }}
                exit={{ height: 0 }}
                className="border-t border-primary/30 bg-black flex flex-col overflow-hidden"
              >
                {/* Terminal Header */}
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-primary/20 bg-black/80 flex-shrink-0">
                  <div className="flex items-center gap-2 text-xs font-hud text-primary/70 uppercase tracking-widest">
                    <TerminalIcon className="w-3.5 h-3.5" />
                    <span>Execution Simulation</span>
                    {simulating && <Loader2 className="w-3 h-3 animate-spin text-accent" />}
                  </div>
                  <button
                    onClick={() => setShowTerminal(false)}
                    className="text-primary/40 hover:text-primary transition-colors p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Terminal Output */}
                <div
                  ref={terminalRef}
                  className="flex-1 overflow-auto p-3 font-mono text-xs leading-relaxed"
                >
                  {simulating && (
                    <div className="text-green-500/70 animate-pulse">
                      {'>'} Running simulation...
                    </div>
                  )}
                  {simResult && !simulating && (
                    <>
                      <div className="text-green-400/60 mb-2 text-[0.7rem]">
                        {'>'} {new Date(simResult.simulatedAt).toLocaleTimeString()} — predicted output:
                      </div>
                      {terminalOutput ? (
                        <pre className="text-green-300 whitespace-pre-wrap break-words">{terminalOutput}</pre>
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
                    <span className="text-primary/30 italic">No simulation run yet.</span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Toolbar */}
        <div className="p-2 border-t border-primary/20 bg-secondary/50 flex items-center justify-between gap-2 flex-shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
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
              title="Toggle terminal panel"
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Terminal</span>
              {showTerminal ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>
          </div>

          {/* Simulate Execution */}
          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/40 border border-primary/50 text-primary rounded-sm transition-all text-sm font-hud uppercase tracking-wider glow-border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {simulating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>{simulating ? 'Simulating...' : 'Simulate Execution'}</span>
          </button>
        </div>
      </div>

      {showDownload && <DownloadModal onClose={() => setShowDownload(false)} />}
    </>
  );
}
