import { useState } from 'react';
import { useBlueJStore } from '@/lib/store';
import { X, Download, Cpu, Database, HardDrive, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  onClose: () => void;
}

function getModelRecommendation(ram: number | null) {
  if (!ram) return { name: "llama3.2:3b", display: "Llama 3.2 3B", size: "2.0GB", reason: "Default — balanced performance" };
  if (ram <= 2) return { name: "tinyllama:1.1b", display: "TinyLlama 1.1B", size: "0.6GB", reason: "Ultra-lightweight for low RAM" };
  if (ram <= 4) return { name: "phi3:mini", display: "Phi-3 Mini 3.8B", size: "2.3GB", reason: "Microsoft's efficient coding model" };
  if (ram <= 8) return { name: "llama3.2:3b", display: "Llama 3.2 3B", size: "2.0GB", reason: "Fast, capable, hardware-friendly" };
  if (ram <= 16) return { name: "llama3.1:8b", display: "Llama 3.1 8B", size: "4.7GB", reason: "Full-power instruction following" };
  if (ram <= 32) return { name: "codellama:13b", display: "CodeLlama 13B", size: "7.4GB", reason: "Code-specialized, near-GPT4 quality" };
  return { name: "codellama:34b", display: "CodeLlama 34B", size: "19.0GB", reason: "Studio-grade code assistance" };
}

export function DownloadModal({ onClose }: Props) {
  const { selectedOs, selectedLanguage, hardwareInfo, myCode } = useBlueJStore();
  const [downloading, setDownloading] = useState<'j' | 'clone' | null>(null);
  const [done, setDone] = useState<'j' | 'clone' | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const model = getModelRecommendation(hardwareInfo.ramGb);
  const isMobile = selectedOs === 'android' || selectedOs === 'ios';

  const buildUrl = (type: 'j' | 'clone') => {
    const base = `${import.meta.env.BASE_URL}api/bluej/download/${type}`;
    const params = new URLSearchParams({
      os: selectedOs,
      language: selectedLanguage,
      ...(hardwareInfo.cpuCores != null ? { cpuCores: String(hardwareInfo.cpuCores) } : {}),
      ...(hardwareInfo.ramGb != null ? { ramGb: String(hardwareInfo.ramGb) } : {}),
      ...(type === 'clone' && myCode ? { code: myCode } : {}),
    });
    return `${base}?${params.toString()}`;
  };

  const handleDownload = async (type: 'j' | 'clone') => {
    setDownloading(type);
    try {
      const url = buildUrl(type);
      const a = document.createElement('a');
      a.href = url;
      a.download = type === 'j' ? 'bluej-offline.zip' : 'my-ai-clone.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => {
        setDownloading(null);
        setDone(type);
        setTimeout(() => setDone(null), 4000);
      }, 1500);
    } catch {
      setDownloading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg hud-panel border border-primary/40 bg-background rounded-sm overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary/20 bg-secondary/50">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-primary" />
            <span className="font-hud text-primary uppercase tracking-widest text-sm">Offline Export</span>
          </div>
          <button onClick={onClose} className="text-primary/50 hover:text-primary transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* Hardware Profile */}
          <div className="border border-primary/20 rounded-sm p-3 bg-secondary/30 space-y-2">
            <p className="text-xs font-hud text-primary/60 uppercase tracking-widest mb-2">Your Hardware Profile</p>
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="flex flex-col items-center gap-1 p-2 border border-primary/10 rounded-sm bg-background/50">
                <Cpu className="w-4 h-4 text-primary/70" />
                <span className="text-primary/50">CPU</span>
                <span className="text-primary font-bold">{hardwareInfo.cpuCores ?? '?'} cores</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 border border-primary/10 rounded-sm bg-background/50">
                <Database className="w-4 h-4 text-primary/70" />
                <span className="text-primary/50">RAM</span>
                <span className="text-primary font-bold">{hardwareInfo.ramGb != null ? hardwareInfo.ramGb + 'GB' : '?'}</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 border border-primary/10 rounded-sm bg-background/50">
                <HardDrive className="w-4 h-4 text-accent/70" />
                <span className="text-accent/50">OS</span>
                <span className="text-accent font-bold uppercase">{selectedOs}</span>
              </div>
            </div>
            {!hardwareInfo.cpuCores && !hardwareInfo.ramGb && (
              <p className="text-xs text-yellow-500/80 flex items-center gap-1.5 mt-1">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                Authorize hardware access in the HUD for a more tailored package.
              </p>
            )}
          </div>

          {/* Download J. Offline */}
          <div className="border border-primary/30 rounded-sm overflow-hidden">
            <div className="bg-primary/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-hud text-primary text-sm uppercase tracking-widest mb-1">J. — Offline Edition</h3>
                  <p className="text-xs text-primary/60 leading-relaxed">
                    Your AI mentor, running entirely on your machine. No API keys. No internet. 
                    Full curriculum. Complete privacy.
                  </p>
                  {isMobile && (
                    <p className="text-xs text-yellow-500/80 mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      Mobile devices have limited local LLM support. See README for options.
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDownload('j')}
                  disabled={downloading === 'j'}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-sm border text-sm font-hud uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0 ${
                    done === 'j'
                      ? 'border-green-500/50 bg-green-500/10 text-green-400'
                      : 'border-primary/50 bg-primary/10 hover:bg-primary/25 text-primary glow-border'
                  } disabled:opacity-50 disabled:cursor-wait`}
                >
                  {done === 'j' ? (
                    <><CheckCircle2 className="w-4 h-4" /> Sent</>
                  ) : downloading === 'j' ? (
                    <><span className="animate-pulse">Packaging...</span></>
                  ) : (
                    <><Download className="w-4 h-4" /> Download</>
                  )}
                </button>
              </div>

              {/* Model Recommendation */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1.5 mt-3 text-xs text-primary/50 hover:text-primary/80 transition-colors"
              >
                {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                Recommended model: <span className="text-primary font-mono">{model.display}</span> ({model.size})
              </button>

              {showDetails && (
                <div className="mt-3 bg-black/30 border border-primary/10 rounded-sm p-3 text-xs font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-primary/50">Model</span>
                    <span className="text-primary">{model.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary/50">Download size</span>
                    <span className="text-primary">{model.size} (one-time)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary/50">Why this model</span>
                    <span className="text-primary/80">{model.reason}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary/50">Runtime</span>
                    <span className="text-primary">Ollama (local)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary/50">Internet required</span>
                    <span className="text-green-400">Setup only</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary/50">After setup</span>
                    <span className="text-green-400">100% offline</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Download Clone */}
          <div className="border border-accent/30 rounded-sm overflow-hidden">
            <div className="bg-accent/5 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-hud text-accent text-sm uppercase tracking-widest mb-1">My AI Clone</h3>
                  <p className="text-xs text-accent/60 leading-relaxed">
                    Your code from the workspace, packaged as a standalone{' '}
                    <span className="font-mono text-accent/80">{selectedLanguage}</span> project.
                    {!myCode.trim() || myCode.includes("Hello, J.") 
                      ? " Includes a starter template." 
                      : " Includes your custom code."}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload('clone')}
                  disabled={downloading === 'clone'}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-sm border text-sm font-hud uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0 ${
                    done === 'clone'
                      ? 'border-green-500/50 bg-green-500/10 text-green-400'
                      : 'border-accent/50 bg-accent/10 hover:bg-accent/25 text-accent'
                  } disabled:opacity-50 disabled:cursor-wait`}
                >
                  {done === 'clone' ? (
                    <><CheckCircle2 className="w-4 h-4" /> Sent</>
                  ) : downloading === 'clone' ? (
                    <><span className="animate-pulse">Packaging...</span></>
                  ) : (
                    <><Download className="w-4 h-4" /> Download</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-xs text-primary/30 text-center font-mono">
            Both packages are self-contained. No account or connection required after first-time model download.
          </p>
        </div>
      </div>
    </div>
  );
}
