import { Handle, Position } from '@xyflow/react';
import { memo } from 'react';

interface CustomNodeProps {
  data: {
    label: string;
    description?: string;
    badge?: string;
    color?: string;
    details?: string;
    onOpen?: (data: any) => void;
  };
}

export const CustomNode = memo(({ data }: CustomNodeProps) => {
  return (
    <div 
      className="px-4 py-3 rounded-lg shadow-lg min-w-[200px] max-w-[320px] border-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
      style={{ 
        backgroundColor: data.color || '#6366f1',
        borderColor: 'rgba(255, 255, 255, 0.2)'
      }}
      role="button"
      tabIndex={0}
      onClick={() => data.onOpen?.(data)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && data.onOpen?.(data)}
    >
      <Handle type="target" position={Position.Top} className="!bg-white/50" />
      
      <div className="text-white">
        <h3 className="font-bold text-sm mb-1 leading-tight">{data.label}</h3>
        {data.description && (
          <p className="text-xs opacity-90 mb-2 line-clamp-3">{data.description}</p>
        )}
        {data.badge && (
          <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-white/20 backdrop-blur-sm">
            {data.badge}
          </span>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!bg-white/50" />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
