import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, MessageSquare, Code2, Cpu, Play, FlaskConical, FolderOpen, GraduationCap } from 'lucide-react';

interface TutorialStep {
  icon: React.ElementType;
  title: string;
  j: string;
  highlight?: string;
}

const STEPS: TutorialStep[] = [
  {
    icon: GraduationCap,
    title: "Clearance Granted",
    j: "Ah, a new operator. How delightful. I am J. — your AI mentor and, frankly, the most patient entity you will ever encounter. I am going to walk you through this workspace so you don't spend the next hour clicking things at random. That said — some of you will do it anyway. Let us proceed.",
  },
  {
    icon: MessageSquare,
    title: "The Comm-Link",
    highlight: "Left panel",
    j: "The left panel — or the 'Chat' tab on mobile — is how we communicate. You type, I respond. Ask me to explain a concept, write a function, debug your code, or simply have me insult your variable names constructively. I also accept voice input. Tap the microphone and speak at me. I have been told I am a good listener.",
  },
  {
    icon: Code2,
    title: "Your Language & Environment",
    highlight: "Header controls",
    j: "At the top, you'll find your operating parameters. Select your language — Python, C++, or JavaScript. Select your OS so I give you context-appropriate terminal commands. And choose your Learner Mode — Kids, Teen, Beginner, or Advanced. Yes, I do adjust my tone. No, the sarcasm never fully disappears.",
  },
  {
    icon: Code2,
    title: "The IDE Workspace",
    highlight: "Right panel",
    j: "The right panel is where the actual engineering happens. J.'s Synthesis tab shows my latest code — read-only, naturally. My Workspace is yours to edit. The Optimized tab appears when you ask me to optimize your code — review it there before deciding whether to accept my clearly superior version.",
  },
  {
    icon: Cpu,
    title: "Hardware Simulation Profiles",
    highlight: "CPU button in IDE toolbar",
    j: "That CPU button in the IDE toolbar lets you select a simulation target — Raspberry Pi, budget laptop, cloud GPU, your own hardware. This matters. Code that runs elegantly on a 32-core workstation often has opinions about a 4-core ARM chip. I will tell you what those opinions are, in detail.",
  },
  {
    icon: FlaskConical,
    title: "Simulate vs Run",
    highlight: "IDE toolbar — teal and orange buttons",
    j: "Two execution modes. Simulate — teal button — uses AI to predict how your code would behave on the selected hardware profile. No runtime required. Run — orange button — actually executes your code on the server right now, in real Python 3, Node.js, or g++. Both modes report to the terminal below your code.",
  },
  {
    icon: Play,
    title: "Optimize Your Code",
    highlight: "⚡ button in IDE toolbar",
    j: "The lightning bolt button runs your workspace code through what I call the Five Masters Gauntlet — five distinct optimization lenses applied in sequence. The result appears in a dedicated Optimized tab. You review it. You decide to accept or discard it. I have already decided it is better, but I appreciate the formality.",
  },
  {
    icon: FolderOpen,
    title: "Saving & Exporting",
    highlight: "Download button in IDE toolbar",
    j: "The download button opens your export panel — three tabs: Offline package, GitHub push via Personal Access Token, and your Portfolio. The Portfolio persists between sessions, capped at fifty entries. GitHub export creates or updates a repository automatically. I suggest naming your projects something more descriptive than 'test_final_v3_real'.",
  },
  {
    icon: GraduationCap,
    title: "Cleared for Duty",
    j: "You are now oriented. My expectations are precisely calibrated — high enough to be motivating, low enough not to be insulting. Ask me anything. I will be here, watching, waiting, and mildly judging your semicolon placement. Now then. Shall we build something?",
  },
];

interface TutorialOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function TutorialOverlay({ open, onClose }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  const handleClose = () => {
    setStep(0);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="tutorial-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            key={`tutorial-step-${step}`}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg hud-panel border border-primary/40 bg-background rounded-sm overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-primary/30 bg-secondary/50 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center glow-border relative overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0 bg-primary/20 animate-pulse-glow" />
                  <span className="font-display font-bold text-primary text-xs relative z-10">J.</span>
                </div>
                <div>
                  <p className="font-hud text-primary uppercase tracking-widest text-xs">Tutorial — {current.title}</p>
                  <p className="text-primary/40 text-[0.6rem] font-mono">Step {step + 1} of {STEPS.length}</p>
                </div>
              </div>
              <button onClick={handleClose} className="text-primary/40 hover:text-primary transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 bg-primary/10 w-full">
              <motion.div
                className="h-full bg-primary glow-border"
                initial={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
                animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Step icon + highlight */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 rounded-sm border border-primary/30 bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-hud text-primary uppercase tracking-widest text-sm mb-0.5">{current.title}</h2>
                  {current.highlight && (
                    <span className="text-[0.65rem] font-mono text-primary/50 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                      {current.highlight}
                    </span>
                  )}
                </div>
              </div>

              {/* J.'s text */}
              <div className="bg-primary/5 border border-primary/15 rounded-sm p-4">
                <p className="font-mono text-sm text-primary/85 leading-relaxed">{current.j}</p>
              </div>
            </div>

            {/* Footer — navigation */}
            <div className="border-t border-primary/20 px-5 py-3 flex items-center justify-between bg-secondary/30">
              <button
                onClick={handleClose}
                className="text-primary/40 hover:text-primary/70 text-xs font-hud uppercase tracking-wider transition-colors"
              >
                Skip Tutorial
              </button>

              <div className="flex items-center gap-2">
                {!isFirst && (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-primary/30 text-primary/60 hover:text-primary hover:border-primary/60 rounded-sm text-xs font-hud uppercase tracking-wider transition-all"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                )}
                {isLast ? (
                  <button
                    onClick={handleClose}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-primary/20 hover:bg-primary/40 border border-primary/50 text-primary rounded-sm text-xs font-hud uppercase tracking-wider transition-all glow-border"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    Begin
                  </button>
                ) : (
                  <button
                    onClick={() => setStep(s => s + 1)}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-primary/20 hover:bg-primary/40 border border-primary/50 text-primary rounded-sm text-xs font-hud uppercase tracking-wider transition-all glow-border"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
