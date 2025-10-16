import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

const DEFAULT_MAGNIFICATION = 80;
const DEFAULT_DISTANCE = 150;
const DEFAULT_PANEL_HEIGHT = 64;

type DockProps = {
  children: React.ReactNode;
  className?: string;
  distance?: number;
  panelHeight?: number;
  magnification?: number;
};
type DockItemProps = {
  className?: string;
  children: React.ReactNode;
};
type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
};
type DockIconProps = {
  className?: string;
  children: React.ReactNode;
};

type DocContextType = {
  mouseX: number;
  magnification: number;
  distance: number;
};
type DockProviderProps = {
  children: React.ReactNode;
  value: DocContextType;
};

const DockContext = createContext<DocContextType | undefined>(undefined);

function DockProvider({ children, value }: DockProviderProps) {
  return <DockContext.Provider value={value}>{children}</DockContext.Provider>;
}

function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error('useDock must be used within an DockProvider');
  }
  return context;
}

function Dock({
  children,
  className,
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  panelHeight = DEFAULT_PANEL_HEIGHT,
}: DockProps) {
  const [mouseX, setMouseX] = useState(Infinity);

  return (
    <div
      style={{
        height: panelHeight,
        scrollbarWidth: 'none',
      }}
      className='mx-2 flex max-w-full items-end overflow-x-auto'
    >
      <div
        onMouseMove={({ pageX }) => setMouseX(pageX)}
        onMouseLeave={() => setMouseX(Infinity)}
        className={cn(
          'mx-auto flex w-fit gap-4 rounded-2xl bg-card/80 backdrop-blur-md px-4 border border-border transition-all',
          className
        )}
        style={{ height: panelHeight }}
        role='toolbar'
        aria-label='Application dock'
      >
        <DockProvider value={{ mouseX, distance, magnification }}>
          {children}
        </DockProvider>
      </div>
    </div>
  );
}

function DockItem({ children, className }: DockItemProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { distance, magnification, mouseX } = useDock();
  const [width, setWidth] = useState(40);

  useEffect(() => {
    const domRect = ref.current?.getBoundingClientRect();
    if (!domRect) return;

    const mouseDistance = mouseX - domRect.x - domRect.width / 2;
    const distanceRatio = Math.max(0, 1 - Math.abs(mouseDistance) / distance);
    const newWidth = 40 + (magnification - 40) * distanceRatio;
    
    setWidth(newWidth);
  }, [mouseX, distance, magnification]);

  return (
    <button
      ref={ref}
      style={{ width }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative inline-flex items-center justify-center border-0 bg-transparent transition-all duration-200',
        className
      )}
      tabIndex={0}
      role='button'
      aria-haspopup='true'
    >
      {Children.map(children, (child) =>
        cloneElement(child as React.ReactElement, { width, isHovered })
      )}
    </button>
  );
}

function DockLabel({ children, className, ...rest }: DockLabelProps) {
  const restProps = rest as Record<string, unknown>;
  const isHovered = restProps['isHovered'] as boolean;

  return (
    <>
      {isHovered && (
        <div
          className={cn(
            'absolute -top-6 left-1/2 -translate-x-1/2 w-fit whitespace-pre rounded-md border bg-popover px-2 py-0.5 text-xs text-popover-foreground pixel-font animate-in fade-in slide-in-from-bottom-2 duration-200',
            className
          )}
          role='tooltip'
        >
          {children}
        </div>
      )}
    </>
  );
}

function DockIcon({ children, className }: DockIconProps) {
  return (
    <div
      className={cn('flex items-center justify-center w-full h-full', className)}
    >
      {children}
    </div>
  );
}

export { Dock, DockIcon, DockItem, DockLabel };
