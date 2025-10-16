import {
  Home,
  BookOpen,
  Brain,
  Gamepad2,
  Network,
  MessageSquare,
  Settings,
  SunMoon,
} from 'lucide-react';
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/Dock';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/components/providers/ThemeProvider';
import { AccessibilitySettings } from '@/components/AccessibilitySettings';

export function AppDock() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const navItems = [
    {
      title: 'Home',
      icon: <Home className='h-full w-full text-foreground' />,
      href: '/',
    },
    {
      title: 'Flash Cards',
      icon: <BookOpen className='h-full w-full text-foreground' />,
      href: '/flashcards',
    },
    {
      title: 'Quiz',
      icon: <Brain className='h-full w-full text-foreground' />,
      href: '/quiz',
    },
    {
      title: 'Memory Match',
      icon: <Gamepad2 className='h-full w-full text-foreground' />,
      href: '/memory',
    },
    {
      title: 'Thoughtscape',
      icon: <Network className='h-full w-full text-foreground' />,
      href: '/thoughtscape',
    },
    {
      title: 'Ask PESU',
      icon: <MessageSquare className='h-full w-full text-foreground' />,
      href: '/chat',
    },
  ];

  return (
    <div className='fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-full'>
      <Dock className='items-end pb-3'>
        {navItems.map((item, idx) => (
          <div
            key={idx}
            onClick={() => navigate(item.href)}
          >
            <DockItem
              className={`aspect-square rounded-full ${
                location.pathname === item.href
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              } transition-colors cursor-pointer`}
            >
              <DockLabel>{item.title}</DockLabel>
              <DockIcon>{item.icon}</DockIcon>
            </DockItem>
          </div>
        ))}
        
        <div onClick={toggleTheme}>
          <DockItem className='aspect-square rounded-full bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer'>
            <DockLabel>
              Theme: {theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}
            </DockLabel>
            <DockIcon>
              <SunMoon className='h-full w-full text-secondary-foreground' />
            </DockIcon>
          </DockItem>
        </div>

        <DockItem className='aspect-square rounded-full'>
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
