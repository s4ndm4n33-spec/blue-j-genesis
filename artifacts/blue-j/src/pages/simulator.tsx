import { useEffect } from 'react';
import { useBlueJStore } from '@/lib/store';
import { HardwareBanner } from '@/components/HardwareBanner';
import { HudHeader } from '@/components/HudHeader';
import { ChatPanel } from '@/components/ChatPanel';
import { IdePanel } from '@/components/IdePanel';
import { HardwareStrip } from '@/components/HardwareStrip';
import { DiagnosticSequence } from '@/components/DiagnosticSequence';
import { AnimatePresence } from 'framer-motion';

export default function SimulatorPage() {
  const { detectSystem, activeTab, diagnosticDone, setDiagnosticDone } = useBlueJStore();

  useEffect(() => {
    detectSystem();
  }, [detectSystem]);

  return (
    <div className="min-h-screen h-screen flex flex-col relative bg-background">
      <div className="scanlines pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src="/images/hologrid.png"
          alt=""
          className="w-full h-full object-cover opacity-10 mix-blend-screen"
        />
      </div>

      <HardwareBanner />
      <HudHeader />

      <main className="flex-1 overflow-hidden relative z-10 p-2 md:p-4 pb-14 md:pb-16 flex gap-4">
        <div className={`w-full md:w-1/2 h-full ${activeTab === 'chat' ? 'block' : 'hidden md:block'}`}>
          <ChatPanel />
        </div>
        <div className={`w-full md:w-1/2 h-full ${activeTab === 'ide' ? 'block' : 'hidden md:block'}`}>
          <IdePanel />
        </div>
      </main>

      <HardwareStrip />

      {/* Diagnostic Sequence — shown on every fresh session load */}
      <AnimatePresence>
        {!diagnosticDone && (
          <DiagnosticSequence onComplete={() => setDiagnosticDone(true)} />
        )}
      </AnimatePresence>
    </div>
  );
}
