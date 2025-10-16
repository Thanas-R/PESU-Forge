import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

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
        const { data, error } = await (await import('@/integrations/supabase/client')).supabase.functions.invoke('generate-learning', {
          body: { content, type: 'memory' },
        });
        if (error) throw error;
        const concepts: string[] = data?.concepts || [];
        const limited = concepts.slice(0, 6).length ? concepts.slice(0,6) : ['Concept A','Concept B','Concept C','Concept D','Concept E','Concept F'];
        const cardPairs = limited.flatMap((concept, idx) => ([
          { id: idx * 2, content: concept, isFlipped: false, isMatched: false },
          { id: idx * 2 + 1, content: concept, isFlipped: false, isMatched: false },
        ]));
        const shuffled = cardPairs.sort(() => Math.random() - 0.5);
        setCards(shuffled);
      } catch(e) {
        console.error(e);
        toast({ title: 'Failed to generate memory game', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [toast]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2) return;
    if (cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;

      if (cards[first].content === cards[second].content) {
        setTimeout(() => {
          const matched = [...cards];
          matched[first].isMatched = true;
          matched[second].isMatched = true;
          setCards(matched);
          setFlippedCards([]);

          if (matched.every(card => card.isMatched)) {
            toast({
              title: 'Congratulations! 🎉',
              description: `You completed the game in ${moves + 1} moves!`,
            });
          }
        }, 500);
      } else {
        setTimeout(() => {
          const flippedBack = [...cards];
          flippedBack[first].isFlipped = false;
          flippedBack[second].isFlipped = false;
          setCards(flippedBack);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled.map(card => ({ ...card, isFlipped: false, isMatched: false })));
    setFlippedCards([]);
    setMoves(0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/20 to-accent/20">
        <Card className="p-8 pixel-border">
          <div className="pixel-font text-2xl animate-pulse">Loading game...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 to-accent/20 p-4">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="pixel-font text-4xl mb-4">Memory Match</h1>
          <div className="flex gap-4 justify-center items-center">
            <p className="text-xl">Moves: {moves}</p>
            <Button onClick={resetGame} variant="outline" className="pixel-button">
              Reset Game
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {cards.map((card, idx) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(idx)}
              className="cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              <Card
                className={`aspect-square flex items-center justify-center p-4 pixel-border transition-all ${
                  card.isMatched
                    ? 'bg-primary text-primary-foreground'
                    : card.isFlipped
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-card hover:bg-muted'
                }`}
              >
                <div className="text-center pixel-font text-lg">
                  {card.isFlipped || card.isMatched ? card.content : '?'}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
