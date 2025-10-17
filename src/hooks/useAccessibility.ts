import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';

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

const useAccessibilityStore = create<AccessibilityState>()(
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

export const useAccessibility = () => {
  const state = useAccessibilityStore();
  
  useEffect(() => {
    // Apply zoom
    document.documentElement.style.zoom = `${state.fontSize}%`;
  }, [state.fontSize]);
  
  useEffect(() => {
    // Apply dyslexic font
    document.documentElement.setAttribute('data-dyslexic-font', String(state.dyslexicFont));
  }, [state.dyslexicFont]);
  
  useEffect(() => {
    // Apply reduced motion
    document.documentElement.setAttribute('data-reduce-motion', String(state.reducedMotion));
  }, [state.reducedMotion]);
  
  useEffect(() => {
    // Apply high contrast
    document.documentElement.setAttribute('data-high-contrast', String(state.highContrast));
  }, [state.highContrast]);
  
  return state;
};
