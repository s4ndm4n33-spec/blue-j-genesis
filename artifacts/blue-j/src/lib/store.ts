import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type OperatingSystem = 'windows' | 'macos' | 'linux' | 'android' | 'ios';
export type ProgrammingLanguage = 'python' | 'cpp' | 'javascript';

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
  
  // Actions
  setConversationId: (id: number | null) => void;
  setSelectedLanguage: (lang: ProgrammingLanguage) => void;
  setSelectedOs: (os: OperatingSystem) => void;
  setHardwareMonitorEnabled: (enabled: boolean) => void;
  grantHardwarePermission: () => void;
  denyHardwarePermission: () => void;
  setActiveTab: (tab: 'chat' | 'ide') => void;
  setMyCode: (code: string) => void;
  detectSystem: () => void;
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

      setConversationId: (id) => set({ conversationId: id }),
      setSelectedLanguage: (lang) => set({ selectedLanguage: lang }),
      setSelectedOs: (os) => set({ selectedOs: os }),
      setHardwareMonitorEnabled: (enabled) => set({ hardwareMonitorEnabled: enabled }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setMyCode: (code) => set({ myCode: code }),
      
      grantHardwarePermission: () => {
        const cores = navigator.hardwareConcurrency || null;
        // @ts-ignore - deviceMemory is not in standard TS DOM lib yet
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
        // Only override if not already set manually by user, or on first load
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
        myCode: state.myCode
      })
    }
  )
);
