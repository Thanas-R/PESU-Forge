import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { supabase } from '@/integrations/supabase/client';
import { HelpCircle, RotateCcw, Timer, Trophy, Sparkles, Home } from 'lucide-react';

interface MemoryCard {
  id: number;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function Memory() {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('memory-best-score');
    if (saved) setBestScore(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  useEffect(() => {
    const content = localStorage.getItem('learning-content');
    if (!content || content.trim().length < 50) {
      toast({
        title: 'No content found',
        description: 'Please upload content from the home page first (min 50 chars).',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-learning', {
          body: { content, type: 'memory' },
        });
        if (error) throw error;
        const concepts: string[] = data?.concepts || [];
        const limited = concepts.slice(0, 6).length >= 3 ? concepts.slice(0, 6) : ['Concept A', 'Concept B', 'Concept C', 'Concept D', 'Concept E', 'Concept F'];
        const cardPairs = limited.flatMap((concept, idx) => ([
          { id: idx * 2, content: concept, isFlipped: false, isMatched: false },
          { id: idx * 2 + 1, content: concept, isFlipped: false, isMatched: false },
        ]));
        setCards(cardPairs.sort(() => Math.random() - 0.5));
      } catch (e) {
        console.error(e);
        toast({ title: 'Failed to generate memory game', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [toast]);

  const handleCardClick = (idx: number) => {
    if (flippedCards.length === 2) return;
    if (cards[idx].isFlipped || cards[idx].isMatched) return;

    if (!isRunning) setIsRunning(true);

    const newCards = [...cards];
    newCards[idx] = { ...newCards[idx], isFlipped: true };
    setCards(newCards);

    const newFlipped = [...flippedCards, idx];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;

      if (newCards[first].content === newCards[second].content) {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => i === first || i === second ? { ...c, isMatched: true } : c));
          setFlippedCards([]);

          // Check win
          const allMatched = newCards.every((c, i) => c.isMatched || i === first || i === second);
          if (allMatched) {
            setIsRunning(false);
            const finalMoves = moves + 1;
            if (!bestScore || finalMoves < bestScore) {
              setBestScore(finalMoves);
              localStorage.setItem('memory-best-score', String(finalMoves));
            }
            toast({ title: 'Congratulations!', description: `Completed in ${finalMoves} moves and ${timer}s.` });
          }
        }, 400);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => i === first || i === second ? { ...c, isFlipped: false } : c));
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  const resetGame = () => {
    setCards(prev => prev.map(c => ({ ...c, isFlipped: false, isMatched: false })).sort(() => Math.random() - 0.5));
    setFlippedCards([]);
    setMoves(0);
    setTimer(0);
    setIsRunning(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <Card className="p-8 glass-card border border-border/50">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            <TextShimmer className="text-2xl font-semibold" duration={1}>Loading game...</TextShimmer>
          </div>
        </Card>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <Card className="p-8 glass-card text-center border border-border/50">
          <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">No Content Available</h2>
          <p className="text-muted-foreground mb-4">Upload content from the home page first.</p>
          <Button onClick={() => window.location.href = '/'}>
            <Home className="mr-2 h-4 w-4" /> Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Memory Match</h1>
          <div className="flex gap-6 justify-center items-center flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" />
              {formatTime(timer)}
            </div>
            <p className="text-sm text-muted-foreground">Moves: {moves}</p>
            {bestScore !== null && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Trophy className="h-4 w-4" />
                Best: {bestScore}
              </div>
            )}
            <Button onClick={resetGame} variant="outline" size="sm">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto">
          {cards.map((card, idx) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(idx)}
              className="cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              <Card
                className={`aspect-square flex items-center justify-center p-3 border transition-all duration-300 ${
                  card.isMatched
                    ? 'bg-primary/20 border-primary/50 text-primary'
                    : card.isFlipped
                    ? 'bg-secondary/30 border-secondary/50 text-foreground'
                    : 'bg-card border-border/50 hover:bg-muted/50'
                }`}
              >
                <div className="text-center text-sm font-medium">
                  {card.isFlipped || card.isMatched ? (
                    card.content
                  ) : (
                    <HelpCircle className="h-6 w-6 text-muted-foreground mx-auto" />
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
