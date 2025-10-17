import {
  Home,
  BookOpen,
  Brain,
  Gamepad2,
  Network,
  MessageSquare,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/Dock';
import { useNavigate, useLocation } from 'react-router-dom';
import { AccessibilitySettings } from '@/components/AccessibilitySettings';
import { useTheme } from '@/components/providers/ThemeProvider';

export function AppDock() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      title: 'Home',
      icon: <Home className='w-full h-full text-foreground' />,
      href: '/',
    },
    {
      title: 'Notes & Flash Cards',
      icon: <BookOpen className='w-full h-full text-foreground' />,
      href: '/flashcards',
    },
    {
      title: 'Quiz',
      icon: <Brain className='w-full h-full text-foreground' />,
      href: '/quiz',
    },
    {
      title: 'Memory Match',
      icon: <Gamepad2 className='w-full h-full text-foreground' />,
      href: '/memory',
    },
    {
      title: 'Thoughtscape',
      icon: <Network className='w-full h-full text-foreground' />,
      href: '/thoughtscape',
    },
  ];

  const { theme, setTheme } = useTheme();

  return (
    <div 
      className='fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]' 
      style={{ pointerEvents: 'none' }}
    >
      <Dock className='items-center' panelHeight={56} magnification={80} distance={150}>
        {navItems.map((item, idx) => (
          <div
            key={idx}
            onClick={() => navigate(item.href)}
          >
            <DockItem
              className={`aspect-square rounded-2xl transition-all cursor-pointer border ${
                location.pathname === item.href
                  ? 'bg-primary/20 border-primary/40 shadow-lg shadow-primary/30'
                  : 'bg-background/60 border-border/40 hover:bg-background/80 hover:border-border/60'
              }`}
            >
              <DockLabel>{item.title}</DockLabel>
              <DockIcon>
                <div className="flex items-center justify-center w-5 h-5">
                  {item.icon}
                </div>
              </DockIcon>
            </DockItem>
          </div>
        ))}
        
        <div className="w-px h-8 bg-border/40 mx-1" />

        {/* Theme toggle */}
        <DockItem
          className='aspect-square rounded-2xl bg-background/60 border border-border/40 hover:bg-background/80 hover:border-border/60 transition-all cursor-pointer'
        >
          <DockLabel>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</DockLabel>
          <DockIcon>
            <button
              aria-label="Toggle theme"
              className="flex items-center justify-center w-5 h-5"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className='w-5 h-5' /> : <Moon className='w-5 h-5' />}
            </button>
          </DockIcon>
        </DockItem>

        <DockItem className='aspect-square rounded-2xl bg-background/60 border border-border/40 hover:bg-background/80 hover:border-border/60 transition-all'>
          <DockLabel>Settings</DockLabel>
          <DockIcon>
            <div className="flex items-center justify-center w-full h-full">
              <AccessibilitySettings />
            </div>
          </DockIcon>
        </DockItem>
      </Dock>
    </div>
  );
}
