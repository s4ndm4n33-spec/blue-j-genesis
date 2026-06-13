import { useState } from 'react';
import { useBlueJStore, LEARNER_MODES, type OperatingSystem, type ProgrammingLanguage } from '@/lib/store';
import { useProgressStore, xpForNextLevel, xpProgressInLevel } from '@/lib/progress-store';
import { Terminal, Code2, GitBranch, ShieldAlert, ShieldCheck, GraduationCap, HelpCircle, Target, Award, Settings, Key, Bot } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { HelpOverlay } from './HelpOverlay';
import { SettingsModal } from './SettingsModal';

interface HudHeaderProps {
  onOpenTutorial?: () => void;
}

export function HudHeader({ onOpenTutorial }: HudHeaderProps) {
  const {
    selectedLanguage, setSelectedLanguage,
    selectedOs, setSelectedOs,
    hardwareMonitorEnabled, setHardwareMonitorEnabled,
    hardwarePermissionGranted,
    activeTab, setActiveTab,
    learnerMode, cycleLearnerMode,
    userApiKey,
  } = useBlueJStore();

  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { stats } = useProgressStore();
  const levelProgress = xpProgressInLevel(stats.totalXp, stats.level);
  const levelTarget = xpForNextLevel(stats.level);
  const xpPct = Math.min((levelProgress / levelTarget) * 100, 100);

  const languages: { id: ProgrammingLanguage; label: string; tip: string }[] = [
    { id: 'python', label: 'PY', tip: 'Python 3.x — recommended for beginners and ML work' },
    { id: 'cpp', label: 'C++', tip: 'C++17 — systems programming, performance-critical code' },
    { id: 'c', label: 'C', tip: 'C99 — low-level systems, embedded, hardware' },
    { id: 'javascript', label: 'JS', tip: 'JavaScript (ES2022+, Node.js) — web and scripting' },
    { id: 'gcode', label: 'GC', tip: 'G-code — CNC, 3D printing, manufacturing control' },
  ];

  const osList: { id: OperatingSystem; label: string; tip: string }[] = [
    { id: 'windows', label: 'WIN', tip: 'Windows — PowerShell / cmd.exe context' },
    { id: 'macos', label: 'MAC', tip: 'macOS — zsh Terminal context' },
    { id: 'linux', label: 'LINUX', tip: 'Linux — bash Terminal context' },
    { id: 'android', label: 'AND', tip: 'Android — Termux terminal context' },
    { id: 'ios', label: 'IOS', tip: 'iOS — Pythonista / a-Shell context' },
  ];

  const currentLearnerLabel = LEARNER_MODES.find(m => m.id === learnerMode)?.shortLabel ?? 'BEGINNER';

  return (
    <>
      <header className="relative z-40 border-b border-primary/20 bg-background/80 backdrop-blur-xl">
        <div className="px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">

          {/* Logo + Mobile Tabs */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center glow-border relative overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-primary/20 animate-pulse-glow"></div>
                <span className="font-display font-bold text-primary text-sm relative z-10">J.</span>
              </div>
              <div>
                <h1 className="font-display font-bold text-xl text-primary glow-text tracking-widest leading-none">B.L.U.E.-J.</h1>
                <p className="text-[0.6rem] font-mono text-primary/50 uppercase tracking-widest leading-tight">Build · Learn · Utilize · Engineer</p>
              </div>
            </div>

            {/* Mobile Tab Switcher */}
            <div className="flex md:hidden bg-secondary border border-primary/30 p-1 rounded-sm overflow-x-auto max-w-[60vw]">
              <Tooltip content="Chat with J." position="bottom">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-2.5 py-1 text-xs font-hud rounded-sm transition-colors ${activeTab === 'chat' ? 'bg-primary/20 text-primary' : 'text-primary/50'}`}
                >
                  <Terminal className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip content="IDE / Code Editor" position="bottom">
                <button
                  onClick={() => setActiveTab('ide')}
                  className={`px-2.5 py-1 text-xs font-hud rounded-sm transition-colors ${activeTab === 'ide' ? 'bg-primary/20 text-primary' : 'text-primary/50'}`}
                >
                  <Code2 className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip content="Git Integration" position="bottom">
                <button
                  onClick={() => setActiveTab('git')}
                  className={`px-2.5 py-1 text-xs font-hud rounded-sm transition-colors ${activeTab === 'git' ? 'bg-primary/20 text-primary' : 'text-primary/50'}`}
                >
                  <GitBranch className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip content="Daily Goals & XP" position="bottom">
                <button
                  onClick={() => setActiveTab('goals')}
                  className={`px-2.5 py-1 text-xs font-hud rounded-sm transition-colors ${activeTab === 'goals' ? 'bg-primary/20 text-primary' : 'text-primary/50'}`}
                >
                  <Target className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip content="Achievements" position="bottom">
                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`px-2.5 py-1 text-xs font-hud rounded-sm transition-colors ${activeTab === 'achievements' ? 'bg-primary/20 text-primary' : 'text-primary/50'}`}
                >
                  <Award className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip content="Agent Mode" position="bottom">
                <button
                  onClick={() => setActiveTab('agent')}
                  className={`px-2.5 py-1 text-xs font-hud rounded-sm transition-colors ${activeTab === 'agent' ? 'bg-primary/20 text-primary' : 'text-primary/50'}`}
                >
                  <Bot className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-hud justify-center md:justify-end w-full md:w-auto">

            {/* Language Toggle */}
            <div className="flex items-center border border-primary/30 rounded-sm overflow-hidden bg-secondary/50">
              {languages.map(lang => (
                <Tooltip key={lang.id} content={lang.tip} position="bottom">
                  <button
                    onClick={() => setSelectedLanguage(lang.id)}
                    className={`px-3 py-1.5 transition-all min-h-[32px] ${selectedLanguage === lang.id ? 'bg-primary/20 text-primary border-b-2 border-primary' : 'text-primary/50 hover:text-primary/80 border-b-2 border-transparent'}`}
                  >
                    {lang.label}
                  </button>
                </Tooltip>
              ))}
            </div>

            {/* OS Toggle */}
            <div className="hidden sm:flex items-center border border-primary/30 rounded-sm overflow-hidden bg-secondary/50">
              {osList.map(os => (
                <Tooltip key={os.id} content={os.tip} position="bottom">
                  <button
                    onClick={() => setSelectedOs(os.id)}
                    className={`px-2 py-1.5 transition-all min-h-[32px] ${selectedOs === os.id ? 'bg-accent/20 text-accent border-b-2 border-accent' : 'text-primary/50 hover:text-primary/80 border-b-2 border-transparent'}`}
                  >
                    {os.label}
                  </button>
                </Tooltip>
              ))}
            </div>

            {/* Learner Mode Toggle */}
            <Tooltip content="Cycle learner mode — adjusts J.'s vocabulary, code complexity, and teaching pace" position="bottom">
              <button
                onClick={cycleLearnerMode}
                className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[32px] border border-accent/40 bg-accent/5 hover:bg-accent/15 text-accent rounded-sm transition-all"
              >
                <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">{currentLearnerLabel}</span>
              </button>
            </Tooltip>

            {/* Hardware Toggle */}
            <Tooltip
              content={
                !hardwarePermissionGranted
                  ? 'Hardware monitor — grant permission during startup to enable'
                  : hardwareMonitorEnabled
                  ? 'Hardware monitor active — J. knows your CPU/RAM specs'
                  : 'Hardware monitor paused — click to resume'
              }
              position="bottom"
            >
              <button
                onClick={() => hardwarePermissionGranted && setHardwareMonitorEnabled(!hardwareMonitorEnabled)}
                disabled={!hardwarePermissionGranted}
                className={`p-1.5 min-h-[32px] min-w-[32px] rounded-sm border transition-all flex items-center justify-center ${
                  !hardwarePermissionGranted ? 'border-muted text-muted cursor-not-allowed' :
                  hardwareMonitorEnabled ? 'border-primary/50 bg-primary/10 text-primary glow-border' : 'border-primary/20 text-primary/50'
                }`}
              >
                {hardwareMonitorEnabled ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
              </button>
            </Tooltip>

            {/* Tutorial Button */}
            <Tooltip content="Interactive tutorial — J. walks you through the workspace step by step" position="bottom">
              <button
                onClick={() => onOpenTutorial?.()}
                className="p-1.5 min-h-[32px] min-w-[32px] rounded-sm border border-primary/20 hover:border-primary/50 hover:bg-primary/10 text-primary/50 hover:text-primary transition-all flex items-center justify-center"
              >
                <GraduationCap className="w-4 h-4" />
              </button>
            </Tooltip>

            {/* Help Button */}
            <Tooltip content="Workspace guide — how to use every panel and button" position="bottom">
              <button
                onClick={() => setShowHelp(true)}
                className="p-1.5 min-h-[32px] min-w-[32px] rounded-sm border border-primary/20 hover:border-primary/50 hover:bg-primary/10 text-primary/50 hover:text-primary transition-all flex items-center justify-center"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </Tooltip>

            {/* Settings Button */}
            <Tooltip content={userApiKey ? 'Settings — custom OpenAI key active' : 'Settings — API key, preferences'} position="bottom">
              <button
                onClick={() => setShowSettings(true)}
                className={`p-1.5 min-h-[32px] min-w-[32px] rounded-sm border transition-all flex items-center justify-center ${userApiKey ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400' : 'border-primary/20 hover:border-primary/50 hover:bg-primary/10 text-primary/50 hover:text-primary'}`}
              >
                {userApiKey ? <Key className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="w-full h-1 bg-secondary relative" title={`LVL ${stats.level} — ${levelProgress}/${levelTarget} XP`}>
          <div
            className="absolute top-0 left-0 h-full bg-primary glow-border transition-all duration-1000 ease-out"
            style={{ width: `${xpPct}%` }}
          />
        </div>
      </header>

      <HelpOverlay open={showHelp} onClose={() => setShowHelp(false)} />
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
