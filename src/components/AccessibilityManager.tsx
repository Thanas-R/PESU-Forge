import { useEffect } from 'react';
import { useAccessibility } from '@/hooks/useAccessibility';

export const AccessibilityManager = () => {
  const {
    fontSize,
    dyslexicFont,
    reducedMotion,
    highContrast,
  } = useAccessibility();

  useEffect(() => {
    const html = document.documentElement;
    
    // Apply font size
    if (fontSize >= 20) {
      html.setAttribute('data-font-size', 'x-large');
    } else if (fontSize >= 18) {
      html.setAttribute('data-font-size', 'large');
    } else {
      html.removeAttribute('data-font-size');
    }

    // Apply dyslexic font
    if (dyslexicFont) {
      html.setAttribute('data-dyslexic-font', 'true');
    } else {
      html.removeAttribute('data-dyslexic-font');
    }

    // Apply reduced motion
    if (reducedMotion) {
      html.setAttribute('data-reduce-motion', 'true');
    } else {
      html.removeAttribute('data-reduce-motion');
    }

    // Apply high contrast
    if (highContrast) {
      html.setAttribute('data-high-contrast', 'true');
    } else {
      html.removeAttribute('data-high-contrast');
    }
  }, [fontSize, dyslexicFont, reducedMotion, highContrast]);

  return null;
};
