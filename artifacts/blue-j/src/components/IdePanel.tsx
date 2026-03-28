import { useState, useMemo } from 'react';
import { useBlueJStore } from '@/lib/store';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Code2, Copy, Play, Check } from 'lucide-react';
import { useChatStream } from '@/hooks/use-chat'; // to get latest code block

export function IdePanel() {
  const { selectedLanguage } = useBlueJStore();
  const [activeTab, setActiveTab] = useState<'j_code' | 'my_code'>('j_code');
  const [myCode, setMyCode] = useState<string>("# Your code goes here...\n\nprint('Hello, J.')");
  const [copied, setCopied] = useState(false);
  
  const { messages } = useChatStream();

  // Extract latest code block from J.'s messages
  const jCode = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'assistant') {
        const match = msg.content.match(/```(\w+)?\n([\s\S]*?)```/);
        if (match) return match[2].trim();
      }
    }
    return "# Awaiting code synthesis from J...";
  }, [messages]);

  const handleCopy = () => {
    const codeToCopy = activeTab === 'j_code' ? jCode : myCode;
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col hud-panel">
      {/* Header Tabs */}
      <div className="flex border-b border-primary/20 bg-secondary/50">
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

      {/* Editor Area */}
      <div className="flex-1 relative bg-[#1E1E1E] overflow-hidden flex flex-col">
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <div className="bg-black/50 text-primary/70 text-xs px-2 py-1 rounded border border-primary/20 font-mono uppercase">
            {selectedLanguage}
          </div>
          <button 
            onClick={handleCopy}
            className="bg-black/50 hover:bg-primary/20 text-primary p-1.5 rounded border border-primary/20 transition-colors"
            title="Copy to Clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {activeTab === 'j_code' ? (
          <div className="flex-1 overflow-auto p-4 text-sm font-mono">
            <SyntaxHighlighter 
              language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage} 
              style={vscDarkPlus}
              customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
              showLineNumbers
            >
              {jCode}
            </SyntaxHighlighter>
          </div>
        ) : (
          <textarea
            value={myCode}
            onChange={(e) => setMyCode(e.target.value)}
            className="flex-1 w-full p-4 bg-transparent text-gray-300 font-mono text-sm focus:outline-none resize-none"
            spellCheck={false}
          />
        )}
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-primary/20 bg-secondary/50 flex justify-end">
        <button className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/40 border border-primary/50 text-primary rounded-sm transition-all text-sm font-hud uppercase tracking-wider glow-border">
          <Play className="w-4 h-4" />
          <span>Simulate Execution</span>
        </button>
      </div>
    </div>
  );
}
