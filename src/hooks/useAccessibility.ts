import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AccessibilityState {
  fontSize: number;
  dyslexicFont: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  ttsEnabled: boolean;
  ttsVoice: string;
  setFontSize: (size: number) => void;
  setDyslexicFont: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  setTtsEnabled: (enabled: boolean) => void;
  setTtsVoice: (voice: string) => void;
}

export const useAccessibility = create<AccessibilityState>()(
  persist(
    (set) => ({
      fontSize: 100,
      dyslexicFont: false,
      reducedMotion: false,
      highContrast: false,
      ttsEnabled: false,
      ttsVoice: 'off',
      setFontSize: (fontSize) => set({ fontSize }),
      setDyslexicFont: (dyslexicFont) => set({ dyslexicFont }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setTtsEnabled: (ttsEnabled) => set({ ttsEnabled }),
      setTtsVoice: (ttsVoice) => set({ ttsVoice }),
    }),
    {
      name: 'accessibility-settings',
    }
  )
);
