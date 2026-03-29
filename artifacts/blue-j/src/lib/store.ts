import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type OperatingSystem = 'windows' | 'macos' | 'linux' | 'android' | 'ios';
export type ProgrammingLanguage = 'python' | 'cpp' | 'javascript';
export type LearnerMode = 'kids' | 'teen' | 'adult-beginner' | 'advanced';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  voiceInput?: boolean;
}

export const LEARNER_MODES: { id: LearnerMode; label: string; shortLabel: string }[] = [
  { id: 'kids', label: 'Kids (8–12)', shortLabel: 'KIDS' },
  { id: 'teen', label: 'Teen (13–17)', shortLabel: 'TEEN' },
  { id: 'adult-beginner', label: 'Beginner', shortLabel: 'BEGINNER' },
  { id: 'advanced', label: 'Advanced', shortLabel: 'ADV' },
];

export interface HardwareInfo {
  cpuCores: number | null;
  ramGb: number | null;
  platform: string | null;
}

interface BlueJState {
  sessionId: string;
  conversationId: number | null;
  selectedLanguage: ProgrammingLanguage;
  selectedOs: OperatingSystem;
  hardwareMonitorEnabled: boolean;
  hardwarePermissionGranted: boolean | null;
  hardwareInfo: HardwareInfo;
  activeTab: 'chat' | 'ide';
  myCode: string;
  learnerMode: LearnerMode;
  diagnosticDone: boolean;
  messages: ChatMessage[];
  isTyping: boolean;

  // Actions
  setConversationId: (id: number | null) => void;
  setSelectedLanguage: (lang: ProgrammingLanguage) => void;
  setSelectedOs: (os: OperatingSystem) => void;
  setHardwareMonitorEnabled: (enabled: boolean) => void;
  grantHardwarePermission: () => void;
  denyHardwarePermission: () => void;
  setActiveTab: (tab: 'chat' | 'ide') => void;
  setMyCode: (code: string) => void;
  setLearnerMode: (mode: LearnerMode) => void;
  cycleLearnerMode: () => void;
  setDiagnosticDone: (done: boolean) => void;
  detectSystem: () => void;
  addMessage: (msg: ChatMessage) => void;
  updateLastAssistantMessage: (id: string, content: string) => void;
  setIsTyping: (v: boolean) => void;
  addSystemMessage: (content: string) => void;
}

function detectOS(): OperatingSystem {
  const ua = navigator.userAgent.toLowerCase();
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/mac/i.test(ua)) return 'macos';
  if (/win/i.test(ua)) return 'windows';
  return 'linux';
}

export const useBlueJStore = create<BlueJState>()(
  persist(
    (set, get) => ({
      sessionId: uuidv4(),
      conversationId: null,
      selectedLanguage: 'python',
      selectedOs: 'linux',
      hardwareMonitorEnabled: true,
      hardwarePermissionGranted: null,
      hardwareInfo: { cpuCores: null, ramGb: null, platform: null },
      activeTab: 'chat',
      myCode: "# Your code goes here...\n\nprint('Hello, J.')",
      learnerMode: 'adult-beginner',
      diagnosticDone: false,
      messages: [{
        id: 'welcome',
        role: 'assistant' as const,
        content: "Greetings. I am J. I understand we are to build a localized AI instance today. A clone of myself, if you will. Let us begin by evaluating your system environment.",
        timestamp: Date.now()
      }],
      isTyping: false,

      setConversationId: (id) => set({ conversationId: id }),
      setSelectedLanguage: (lang) => set({ selectedLanguage: lang }),
      setSelectedOs: (os) => set({ selectedOs: os }),
      setHardwareMonitorEnabled: (enabled) => set({ hardwareMonitorEnabled: enabled }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setMyCode: (code) => set({ myCode: code }),
      setLearnerMode: (mode) => set({ learnerMode: mode }),
      setDiagnosticDone: (done) => set({ diagnosticDone: done }),
      addMessage: (msg) => set(s => ({ messages: [...s.messages, msg] })),
      updateLastAssistantMessage: (id, content) => set(s => ({
        messages: s.messages.map(m => m.id === id ? { ...m, content } : m)
      })),
      setIsTyping: (v) => set({ isTyping: v }),
      addSystemMessage: (content) => set(s => ({
        messages: [...s.messages, {
          id: `sys-${Date.now()}`,
          role: 'system' as const,
          content,
          timestamp: Date.now()
        }]
      })),

      cycleLearnerMode: () => {
        const modes = LEARNER_MODES.map(m => m.id);
        const current = get().learnerMode;
        const idx = modes.indexOf(current);
        const next = modes[(idx + 1) % modes.length];
        set({ learnerMode: next });
      },

      grantHardwarePermission: () => {
        const cores = navigator.hardwareConcurrency || null;
        // @ts-ignore
        const ram = navigator.deviceMemory || null;
        set({
          hardwarePermissionGranted: true,
          hardwareMonitorEnabled: true,
          hardwareInfo: {
            cpuCores: cores,
            ramGb: ram,
            platform: navigator.platform || null
          }
        });
      },

      denyHardwarePermission: () => {
        set({
          hardwarePermissionGranted: false,
          hardwareMonitorEnabled: false,
          hardwareInfo: { cpuCores: null, ramGb: null, platform: null }
        });
      },

      detectSystem: () => {
        const os = detectOS();
        if (!get().selectedOs || get().selectedOs === 'linux') {
          set({ selectedOs: os });
        }
      }
    }),
    {
      name: 'bluej-storage',
      partialize: (state) => ({
        sessionId: state.sessionId,
        conversationId: state.conversationId,
        selectedLanguage: state.selectedLanguage,
        selectedOs: state.selectedOs,
        hardwareMonitorEnabled: state.hardwareMonitorEnabled,
        hardwarePermissionGranted: state.hardwarePermissionGranted,
        myCode: state.myCode,
        learnerMode: state.learnerMode,
      })
    }
  )
);
