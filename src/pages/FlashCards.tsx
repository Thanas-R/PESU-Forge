import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FlashCard {
  question: string;
  answer: string;
}

export default function FlashCards() {
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
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
      setIsLoading(false);
      return;
    }

    // Simulate AI generation - in production this would call your edge function
    setTimeout(() => {
      const mockCards: FlashCard[] = [
        { question: 'What is React?', answer: 'A JavaScript library for building user interfaces' },
        { question: 'What are Props?', answer: 'Props are arguments passed into React components' },
        { question: 'What is JSX?', answer: 'JSX is a syntax extension for JavaScript' },
      ];
      setCards(mockCards);
      setIsLoading(false);
      toast({
        title: 'Flash cards generated!',
        description: `Created ${mockCards.length} cards from your content.`,
      });
    }, 1500);
  }, [toast]);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
        <Card className="p-8 pixel-border">
          <div className="pixel-font text-2xl animate-pulse">Generating flash cards...</div>
        </Card>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
        <Card className="p-8 pixel-border text-center">
          <h2 className="pixel-font text-2xl mb-4">No Content Available</h2>
          <p className="text-muted-foreground mb-4">Please upload content from the home page first.</p>
          <Button onClick={() => window.location.href = '/'} className="pixel-button">
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="pixel-font text-4xl mb-2">Flash Cards</h1>
          <p className="text-muted-foreground">
            Card {currentIndex + 1} of {cards.length}
          </p>
        </div>

        <div className="perspective-1000">
          <div
            key={currentIndex}
            className="cursor-pointer transition-transform duration-500"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
            }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <Card className="min-h-[300px] p-8 pixel-border bg-card flex items-center justify-center relative">
              <div
                className="text-center"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
                }}
              >
                <p className="text-2xl font-bold mb-4 pixel-font">
                  {isFlipped ? currentCard.answer : currentCard.question}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isFlipped ? 'Click to see question' : 'Click to reveal answer'}
                </p>
              </div>
            </Card>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="pixel-button"
            size="lg"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Previous
          </Button>

          <Button
            onClick={() => setIsFlipped(!isFlipped)}
            variant="outline"
            className="pixel-button"
            size="lg"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Flip
          </Button>

          <Button
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            className="pixel-button"
            size="lg"
          >
            Next
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
