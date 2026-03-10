import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Lightbulb, Home, ChevronRight, RotateCcw, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface FlashCard {
  question: string;
  answer: string;
}

interface StudyMaterial {
  summary: string;
  keyPoints: string[];
  flashcards: FlashCard[];
}

const positionStyles = [
  { scale: 1, y: 12 },
  { scale: 0.95, y: -16 },
  { scale: 0.9, y: -44 },
];

export default function FlashCards() {
  const [studyMaterial, setStudyMaterial] = useState<StudyMaterial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCards, setVisibleCards] = useState<Array<{ id: number; index: number }>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const content = localStorage.getItem('learning-content');
    if (!content || content.trim().length < 50) {
      toast({
        title: 'No content found',
        description: 'Please upload content from the home page first (minimum 50 characters).',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-learning', {
          body: { content, type: 'flashcards' },
        });
        if (error) throw error;

        const material: StudyMaterial = {
          summary: data?.summary || 'No summary available.',
          keyPoints: data?.keyPoints || [],
          flashcards: data?.flashcards || [],
        };

        if (material.flashcards.length === 0) {
          toast({ title: 'No flashcards generated', description: 'Try with more detailed content.', variant: 'destructive' });
        }

        setStudyMaterial(material);
        // Initialize visible card stack
        const initial = [];
        for (let i = 0; i < Math.min(3, material.flashcards.length); i++) {
          initial.push({ id: i, index: i });
        }
        setVisibleCards(initial);
      } catch (e) {
        console.error(e);
        toast({ title: 'Failed to generate study materials', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [toast]);

  const handleNext = () => {
    if (!studyMaterial || isAnimating) return;
    const total = studyMaterial.flashcards.length;
    if (currentIndex >= total - 1) return;

    setIsAnimating(true);
    setIsFlipped(false);
    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);

    // Shift stack: remove front, add new card at back
    const newCards = visibleCards.slice(1);
    const nextBackIndex = nextIdx + 2;
    if (nextBackIndex < total) {
      newCards.push({ id: Date.now(), index: nextBackIndex });
    }
    setVisibleCards(newCards);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleRestart = () => {
    if (!studyMaterial) return;
    setCurrentIndex(0);
    setIsFlipped(false);
    const initial = [];
    for (let i = 0; i < Math.min(3, studyMaterial.flashcards.length); i++) {
      initial.push({ id: Date.now() + i, index: i });
    }
    setVisibleCards(initial);
  };

  const isLastCard = studyMaterial ? currentIndex >= studyMaterial.flashcards.length - 1 : false;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <Card className="p-8 glass-card border border-border/50">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <TextShimmer duration={1} className="text-2xl font-semibold">Generating study materials...</TextShimmer>
          </div>
        </Card>
      </div>
    );
  }

  if (!studyMaterial || studyMaterial.flashcards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <Card className="p-8 glass-card text-center border border-border/50">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl mb-4 font-bold">No Content Available</h2>
          <p className="text-muted-foreground mb-4">Please upload content from the home page first.</p>
          <Button onClick={() => window.location.href = '/'}>
            <Home className="mr-2 h-4 w-4" />
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 md:p-8 pb-28">
      <div className="container mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center pt-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-1">Study Materials</h1>
          <p className="text-muted-foreground text-sm">Generated from your content</p>
        </div>

        {/* Toggle Summary / Cards */}
        <div className="flex justify-center gap-2">
          <Button
            variant={showSummary ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowSummary(true)}
            className="rounded-full"
          >
            <BookOpen className="mr-2 h-4 w-4" /> Summary
          </Button>
          <Button
            variant={!showSummary ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowSummary(false)}
            className="rounded-full"
          >
            <Hash className="mr-2 h-4 w-4" /> Flashcards
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {showSummary ? (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Summary Card */}
              <div className="glass-card p-6 md:p-8 rounded-2xl border border-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Summary</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm">{studyMaterial.summary}</p>
              </div>

              {/* Key Points */}
              {studyMaterial.keyPoints.length > 0 && (
                <div className="glass-card p-6 md:p-8 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-bold">Key Points</h2>
                  </div>
                  <ul className="space-y-3">
                    {studyMaterial.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-muted-foreground text-sm leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-center">
                <Button onClick={() => setShowSummary(false)} size="lg" className="rounded-full">
                  Start Flashcards <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="flashcards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Progress */}
              <div className="text-center text-sm text-muted-foreground">
                Card {currentIndex + 1} of {studyMaterial.flashcards.length}
              </div>

              {/* Animated Card Stack */}
              <div className="flex flex-col items-center justify-center pt-2">
                <div className="relative h-[340px] w-full overflow-hidden sm:w-[520px]">
                  <AnimatePresence initial={false}>
                    {visibleCards.slice(0, 3).map((card, stackIdx) => {
                      const { scale, y } = positionStyles[stackIdx] ?? positionStyles[2];
                      const zIndex = stackIdx === 0 ? 3 : 3 - stackIdx;
                      const flashcard = studyMaterial.flashcards[card.index];
                      if (!flashcard) return null;

                      return (
                        <motion.div
                          key={card.id}
                          initial={stackIdx === 2 ? { y: -16, scale: 0.9 } : undefined}
                          animate={{ y, scale }}
                          exit={{ y: 340, scale: 1, zIndex: 10 }}
                          transition={{ type: 'spring', duration: 0.8, bounce: 0 }}
                          style={{ zIndex, left: '50%', x: '-50%', bottom: 0 }}
                          className="absolute flex w-[310px] sm:w-[480px] items-center justify-center overflow-hidden rounded-2xl border border-border/50 glass-card shadow-lg will-change-transform"
                        >
                          {stackIdx === 0 ? (
                            <div
                              className="w-full cursor-pointer"
                              onClick={() => setIsFlipped(!isFlipped)}
                              style={{ perspective: '1000px' }}
                            >
                              <div
                                className="relative w-full min-h-[280px] transition-transform duration-500"
                                style={{
                                  transformStyle: 'preserve-3d',
                                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                }}
                              >
                                {/* Front */}
                                <div
                                  className="absolute inset-0 p-8 flex flex-col items-center justify-center"
                                  style={{ backfaceVisibility: 'hidden' }}
                                >
                                  <div className="text-[10px] text-primary font-semibold uppercase tracking-widest mb-3">Question</div>
                                  <p className="text-base md:text-lg font-medium text-center leading-relaxed">{flashcard.question}</p>
                                  <p className="text-[10px] text-muted-foreground mt-6">Tap to flip</p>
                                </div>
                                {/* Back */}
                                <div
                                  className="absolute inset-0 p-8 flex flex-col items-center justify-center bg-primary/5 rounded-2xl"
                                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                >
                                  <div className="text-[10px] text-primary font-semibold uppercase tracking-widest mb-3">Answer</div>
                                  <p className="text-base md:text-lg font-medium text-center leading-relaxed">{flashcard.answer}</p>
                                  <p className="text-[10px] text-muted-foreground mt-6">Tap to flip back</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full min-h-[280px] p-8 flex items-center justify-center">
                              <p className="text-sm text-muted-foreground text-center opacity-50">{flashcard.question}</p>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="relative z-10 -mt-px flex w-full items-center justify-center gap-3 border-t border-border/30 py-5">
                  {isLastCard ? (
                    <Button onClick={handleRestart} className="rounded-full px-6" size="lg">
                      <RotateCcw className="mr-2 h-4 w-4" /> Restart
                    </Button>
                  ) : (
                    <Button onClick={handleNext} className="rounded-full px-6" size="lg" disabled={isAnimating}>
                      Next <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
