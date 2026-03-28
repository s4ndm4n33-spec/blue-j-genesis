import { useBlueJStore, OperatingSystem, ProgrammingLanguage } from '@/lib/store';
import { Monitor, Terminal, Code2, ShieldAlert, ShieldCheck } from 'lucide-react';

export function HudHeader() {
  const { 
    selectedLanguage, setSelectedLanguage, 
    selectedOs, setSelectedOs,
    hardwareMonitorEnabled, setHardwareMonitorEnabled,
    hardwarePermissionGranted,
    activeTab, setActiveTab
  } = useBlueJStore();

  const languages: { id: ProgrammingLanguage, label: string }[] = [
    { id: 'python', label: 'PY' },
    { id: 'cpp', label: 'C++' },
    { id: 'javascript', label: 'JS' }
  ];

  const osList: { id: OperatingSystem, label: string }[] = [
    { id: 'windows', label: 'WIN' },
    { id: 'macos', label: 'MAC' },
    { id: 'linux', label: 'LINUX' },
    { id: 'android', label: 'AND' },
    { id: 'ios', label: 'IOS' }
  ];

  return (
    <header className="relative z-40 border-b border-primary/20 bg-background/80 backdrop-blur-xl">
      <div className="px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center glow-border relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/20 animate-pulse-glow"></div>
              <span className="font-display font-bold text-primary text-sm relative z-10">J.</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-primary glow-text tracking-widest leading-none">B.L.U.E.-J.</h1>
              <p className="text-[0.65rem] font-mono text-primary/60 uppercase tracking-widest">AI Synthesis Engine v1.0</p>
            </div>
          </div>
          
          {/* Mobile Tab Switcher */}
          <div className="flex md:hidden bg-secondary border border-primary/30 p-1 rounded-sm">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1 text-xs font-hud rounded-sm transition-colors ${activeTab === 'chat' ? 'bg-primary/20 text-primary' : 'text-primary/50'}`}
            >
              <Terminal className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setActiveTab('ide')}
              className={`px-3 py-1 text-xs font-hud rounded-sm transition-colors ${activeTab === 'ide' ? 'bg-primary/20 text-primary' : 'text-primary/50'}`}
            >
              <Code2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-hud">
          
          {/* Language Toggle */}
          <div className="flex items-center border border-primary/30 rounded-sm overflow-hidden bg-secondary/50">
            {languages.map(lang => (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                className={`px-3 py-1.5 transition-all ${selectedLanguage === lang.id ? 'bg-primary/20 text-primary border-b-2 border-primary' : 'text-primary/50 hover:text-primary/80 border-b-2 border-transparent'}`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* OS Toggle */}
          <div className="flex items-center border border-primary/30 rounded-sm overflow-hidden bg-secondary/50 hidden sm:flex">
            {osList.map(os => (
              <button
                key={os.id}
                onClick={() => setSelectedOs(os.id)}
                className={`px-2 py-1.5 transition-all ${selectedOs === os.id ? 'bg-accent/20 text-accent border-b-2 border-accent' : 'text-primary/50 hover:text-primary/80 border-b-2 border-transparent'}`}
              >
                {os.label}
              </button>
            ))}
          </div>

          {/* Hardware Toggle */}
          <button 
            onClick={() => hardwarePermissionGranted && setHardwareMonitorEnabled(!hardwareMonitorEnabled)}
            disabled={!hardwarePermissionGranted}
            className={`p-1.5 rounded-sm border transition-all flex items-center justify-center ${
              !hardwarePermissionGranted ? 'border-muted text-muted cursor-not-allowed' :
              hardwareMonitorEnabled ? 'border-primary/50 bg-primary/10 text-primary glow-border' : 'border-primary/20 text-primary/50'
            }`}
            title="Toggle Hardware Monitor"
          >
            {hardwareMonitorEnabled ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-secondary relative">
        <div className="absolute top-0 left-0 h-full bg-primary glow-border w-1/6 transition-all duration-1000 ease-out"></div>
      </div>
    </header>
  );
}
