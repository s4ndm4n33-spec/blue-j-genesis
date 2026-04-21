import { useState } from 'react';
import { X, Key, Eye, EyeOff, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useBlueJStore } from '@/lib/store';

interface Props {
  onClose: () => void;
}

export function SettingsModal({ onClose }: Props) {
  const { userApiKey, setUserApiKey } = useBlueJStore();
  const [inputKey, setInputKey] = useState(userApiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setUserApiKey(inputKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    setInputKey('');
    setUserApiKey('');
  };

  const maskedKey = inputKey
    ? `sk-...${inputKey.slice(-6)}`
    : '';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 hud-panel border border-primary/40 bg-background rounded-sm overflow-hidden">
        <div className="border-b border-primary/30 bg-secondary/50 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            <span className="font-hud text-primary uppercase tracking-widest text-sm">API Key Settings</span>
          </div>
          <button onClick={onClose} className="text-primary/50 hover:text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-sm p-3 text-xs font-mono text-primary/70 leading-relaxed">
            <p className="text-primary/90 font-semibold mb-1">Default: Replit AI (no key needed)</p>
            <p>B.L.U.E.-J. uses Replit's built-in AI integration by default — no API key required, billed to your Replit credits.</p>
            <p className="mt-2">Optionally, enter your own OpenAI API key below to use your personal quota instead.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-primary/60 uppercase tracking-wider">
              OpenAI API Key (optional)
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => { setInputKey(e.target.value); setSaved(false); }}
                placeholder="sk-..."
                className="w-full bg-secondary/50 border border-primary/30 rounded-sm px-3 py-2 pr-10 text-sm font-mono text-primary placeholder-primary/30 focus:outline-none focus:border-primary/60 transition-colors"
              />
              <button
                onClick={() => setShowKey(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary/70 transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {inputKey && !showKey && (
              <p className="text-xs font-mono text-primary/40">{maskedKey}</p>
            )}
          </div>

          {userApiKey && (
            <div className="flex items-center gap-2 text-xs font-mono text-green-400">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Custom key active — using your OpenAI quota</span>
            </div>
          )}

          {!userApiKey && (
            <div className="flex items-center gap-2 text-xs font-mono text-primary/50">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>No custom key — using Replit AI integration (default)</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary text-xs font-hud uppercase tracking-widest py-2 rounded-sm transition-colors"
            >
              {saved ? '✓ Saved' : 'Save Key'}
            </button>
            {(inputKey || userApiKey) && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 bg-red-900/20 hover:bg-red-900/30 border border-red-500/30 text-red-400 text-xs font-hud uppercase tracking-widest px-3 py-2 rounded-sm transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-secondary/50 hover:bg-secondary border border-primary/20 text-primary/60 text-xs font-hud uppercase tracking-widest px-3 py-2 rounded-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
