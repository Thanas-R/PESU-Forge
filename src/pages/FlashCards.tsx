import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw, Loader2, BookOpen, Lightbulb, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface FlashCard {
  question: string;
  answer: string;
}

interface StudyMaterial {
  summary: string;
  keyPoints: string[];
  flashcards: FlashCard[];
}

export default function FlashCards() {
  const [studyMaterial, setStudyMaterial] = useState<StudyMaterial | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
      } catch (e) {
        console.error(e);
        toast({ title: 'Failed to generate study materials', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [toast]);

  const handleNext = () => {
    if (studyMaterial && currentIndex < studyMaterial.flashcards.length - 1) {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <Card className="p-8 glass-card border border-border/50">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
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
          <p className="text-muted-foreground mb-4">Please upload content from the home page first (minimum 50 characters).</p>
          <Button onClick={() => window.location.href = '/'}>
            <Home className="mr-2 h-4 w-4" />
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  const currentCard = studyMaterial.flashcards[currentIndex];
  const progress = ((currentIndex + 1) / studyMaterial.flashcards.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 md:p-8">
      <div className="container mx-auto max-w-5xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Study Materials</h1>
          <p className="text-muted-foreground">Generated from your content</p>
        </div>

        {/* Summary */}
        <Card className="glass-card p-6 md:p-8 border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Summary</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">{studyMaterial.summary}</p>
        </Card>

        {/* Key Points */}
        {studyMaterial.keyPoints.length > 0 && (
          <Card className="glass-card p-6 md:p-8 border border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Key Points</h2>
            </div>
            <ul className="space-y-3">
              {studyMaterial.keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-0.5 text-sm">{idx + 1}.</span>
                  <span className="text-muted-foreground text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Flashcards */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Flashcards ({studyMaterial.flashcards.length})</h2>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Card {currentIndex + 1} of {studyMaterial.flashcards.length}
          </div>
          <Progress value={progress} className="max-w-md mx-auto" />

          {/* 3D Flip Card */}
          <div
            className="perspective-1000 max-w-2xl mx-auto cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ perspective: '1000px' }}
          >
            <div
              className="relative w-full min-h-[250px] transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front */}
              <Card
                className="absolute inset-0 glass-card p-8 border border-border/50 flex flex-col items-center justify-center"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="text-xs text-primary font-semibold uppercase tracking-wider mb-3">Question</div>
                <p className="text-lg md:text-xl font-medium text-center whitespace-pre-wrap">{currentCard.question}</p>
                <p className="text-xs text-muted-foreground mt-4">Click to reveal answer</p>
              </Card>

              {/* Back */}
              <Card
                className="absolute inset-0 glass-card p-8 border border-primary/30 flex flex-col items-center justify-center bg-primary/5"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="text-xs text-primary font-semibold uppercase tracking-wider mb-3">Answer</div>
                <p className="text-lg md:text-xl font-medium text-center whitespace-pre-wrap">{currentCard.answer}</p>
                <p className="text-xs text-muted-foreground mt-4">Click to see question</p>
              </Card>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 max-w-2xl mx-auto">
            <Button onClick={handlePrevious} disabled={currentIndex === 0} size="lg" variant="outline">
              <ChevronLeft className="mr-2 h-5 w-5" />
              Previous
            </Button>
            <Button onClick={() => setIsFlipped(!isFlipped)} variant="ghost" size="lg">
              <RotateCcw className="mr-2 h-5 w-5" />
              Flip
            </Button>
            <Button onClick={handleNext} disabled={currentIndex === studyMaterial.flashcards.length - 1} size="lg" variant="outline">
              Next
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
