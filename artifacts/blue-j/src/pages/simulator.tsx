import { useEffect, useState } from 'react';
import { useBlueJStore } from '@/lib/store';
import { HardwareBanner } from '@/components/HardwareBanner';
import { HudHeader } from '@/components/HudHeader';
import { ChatPanel } from '@/components/ChatPanel';
import { IdePanel } from '@/components/IdePanel';
import { HardwareStrip } from '@/components/HardwareStrip';
import { DiagnosticSequence } from '@/components/DiagnosticSequence';
import { TutorialOverlay } from '@/components/TutorialOverlay';
import { DailyGoals } from '@/components/DailyGoals';
import { AchievementsPanel } from '@/components/AchievementsPanel';
import { GitPanel } from '@/components/GitPanel';
import { AgentModePanel } from '@/components/AgentModePanel';
import { UnlockToast } from '@/components/UnlockToast';
import { AnimatePresence } from 'framer-motion';
import { Terminal, Code2, GitBranch, Target, Award, Bot } from 'lucide-react';

export default function SimulatorPage() {
  const { detectSystem, activeTab, setActiveTab, diagnosticDone, setDiagnosticDone, tutorialDone, setTutorialDone } = useBlueJStore();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    detectSystem();
  }, [detectSystem]);

  const handleDiagnosticComplete = () => {
    setDiagnosticDone(true);
    if (!tutorialDone) {
      setShowTutorial(true);
    }
  };

  const handleTutorialClose = () => {
    setShowTutorial(false);
    setTutorialDone(true);
  };

  const desktopTabs = [
    { id: 'chat' as const,         label: 'Chat',         icon: Terminal },
    { id: 'ide' as const,          label: 'IDE',          icon: Code2 },
    { id: 'git' as const,          label: 'Git',          icon: GitBranch },
    { id: 'goals' as const,        label: 'Goals',        icon: Target },
    { id: 'achievements' as const, label: 'Achievements', icon: Award },
    { id: 'agent' as const,        label: 'Agent',        icon: Bot },
  ];

  const isFullPanel = activeTab === 'goals' || activeTab === 'achievements' || activeTab === 'git' || activeTab === 'agent';

  return (
    <div className="min-h-dvh h-dvh flex flex-col relative bg-background">
      <div className="scanlines pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/images/hologrid.png"
          alt=""
          className="w-full h-full object-cover opacity-10 mix-blend-screen"
        />
      </div>

      <HardwareBanner />
      <HudHeader onOpenTutorial={() => setShowTutorial(true)} />

      {/* Desktop tab bar */}
      <div className="hidden md:flex items-center gap-1 px-4 pt-2 border-b border-primary/10 bg-background/60 relative z-10">
        {desktopTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-hud uppercase tracking-wider rounded-t-sm border-b-2 transition-all ${
              activeTab === id
                ? 'border-primary text-primary bg-primary/10'
                : 'border-transparent text-primary/40 hover:text-primary/70'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-hidden relative z-10 p-2 md:p-4 pb-14 md:pb-16 flex gap-4">
        {isFullPanel ? (
          <div className="w-full h-full">
            {activeTab === 'goals' && <DailyGoals />}
            {activeTab === 'achievements' && <AchievementsPanel />}
            {activeTab === 'git' && <GitPanel />}
            {activeTab === 'agent' && <AgentModePanel />}
          </div>
        ) : (
          <>
            <div className={`w-full md:w-1/2 h-full ${activeTab === 'chat' ? 'block' : 'hidden md:block'}`}>
              <ChatPanel />
            </div>
            <div className={`w-full md:w-1/2 h-full ${activeTab === 'ide' ? 'block' : 'hidden md:block'}`}>
              <IdePanel />
            </div>
          </>
        )}
      </main>

      <HardwareStrip />

      <UnlockToast />

      <AnimatePresence>
        {!diagnosticDone && (
          <DiagnosticSequence onComplete={handleDiagnosticComplete} />
        )}
      </AnimatePresence>

      <TutorialOverlay open={showTutorial} onClose={handleTutorialClose} />
    </div>
  );
}
