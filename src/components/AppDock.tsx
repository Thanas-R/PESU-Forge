import { useState } from 'react';
import {
  Home,
  BookOpen,
  Brain,
  Gamepad2,
  Network,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { ExpandableTabs } from '@/components/ui/expandable-tabs';
import { useNavigate, useLocation } from 'react-router-dom';
import { AccessibilitySettings } from '@/components/AccessibilitySettings';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export function AppDock() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const tabs: Array<{ title: string; icon: typeof Home; onClick: () => void } | { type: 'separator' }> = [
    {
      title: 'Home',
      icon: Home,
      onClick: () => navigate('/'),
    },
    {
      title: 'Flash Cards',
      icon: BookOpen,
      onClick: () => navigate('/flashcards'),
    },
    {
      title: 'Quiz',
      icon: Brain,
      onClick: () => navigate('/quiz'),
    },
    {
      title: 'Memory',
      icon: Gamepad2,
      onClick: () => navigate('/memory'),
    },
    {
      title: 'Thoughtscape',
      icon: Network,
      onClick: () => navigate('/thoughtscape'),
    },
    { type: 'separator' },
    {
      title: theme === 'dark' ? 'Light' : 'Dark',
      icon: theme === 'dark' ? Sun : Moon,
      onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    },
    {
      title: 'Settings',
      icon: Settings,
      onClick: () => setIsSettingsOpen(true),
    },
  ];

  return (
    <>
      <div 
        className='fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]' 
      >
        <ExpandableTabs 
          tabs={tabs}
          className="shadow-xl"
        />
      </div>
      
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl rounded-2xl border border-white/10">
          <AccessibilitySettings />
        </DialogContent>
      </Dialog>
    </>
  );
}
