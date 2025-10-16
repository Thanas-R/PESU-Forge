import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function Thoughtscape() {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const content = localStorage.getItem('learning-content');
    if (!content) {
      toast({
        title: 'No content found',
        description: 'Please upload content from the home page first.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
        <Card className="p-8 pixel-border">
          <div className="pixel-font text-2xl animate-pulse">Loading Thoughtscape...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <div className="container mx-auto py-8">
        <h1 className="pixel-font text-4xl mb-8 text-center">Thoughtscape</h1>
        
        <Card className="p-8 pixel-border text-center">
          <div className="text-6xl mb-4">🌐</div>
          <h2 className="pixel-font text-2xl mb-4">Mind Map Visualization</h2>
          <p className="text-muted-foreground mb-4">
            Interactive mind mapping with ReactFlow coming soon!
          </p>
          <p className="text-sm text-muted-foreground">
            This feature will create visual flow charts and mind maps of your content,
            allowing you to explore connections and concepts interactively.
          </p>
        </Card>
      </div>
    </div>
  );
}
