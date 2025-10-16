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
      icon: <Home className='w-full h-full text-foreground' />,
      href: '/',
    },
    {
      title: 'Flash Cards',
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
    {
      title: 'Ask PESU',
      icon: <MessageSquare className='w-full h-full text-foreground' />,
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
              className={`aspect-square rounded-full transition-all cursor-pointer ${
                location.pathname === item.href
                  ? 'bg-primary/90 shadow-lg shadow-primary/50'
                  : 'bg-background/80 hover:bg-background'
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
        
        <div onClick={toggleTheme}>
          <DockItem className='aspect-square rounded-full bg-background/80 hover:bg-background transition-all cursor-pointer'>
            <DockLabel>
              Theme: {theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}
            </DockLabel>
            <DockIcon>
              <div className="flex items-center justify-center w-5 h-5">
                <SunMoon className='h-full w-full text-foreground' />
              </div>
            </DockIcon>
          </DockItem>
        </div>

        <DockItem className='aspect-square rounded-full bg-background/80 hover:bg-background transition-all'>
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
