import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

    // Simulate AI generation - in production this would call your edge function
    setTimeout(() => {
      const mockMaterial: StudyMaterial = {
        summary: content.slice(0, 200) + '...',
        keyPoints: [
          content.split('.')[0] || 'Key concept from your notes',
          content.split('.')[1] || 'Important detail to remember',
          content.split('.')[2] || 'Critical information for learning',
        ].filter(p => p.trim()),
        flashcards: [
          { question: 'What is the main concept?', answer: content.slice(0, 100) },
          { question: 'Key takeaway?', answer: content.slice(100, 200) },
          { question: 'Important detail?', answer: content.slice(200, 300) },
        ],
      };
      setStudyMaterial(mockMaterial);
      setIsLoading(false);
      toast({
        title: 'Study materials generated!',
        description: `Created summary, ${mockMaterial.keyPoints.length} key points, and ${mockMaterial.flashcards.length} flashcards.`,
      });
    }, 1500);
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
      <div className="min-h-screen flex items-center justify-center glass-card p-4">
        <Card className="p-8 glass-card">
          <div className="text-2xl animate-pulse flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Generating study materials...
          </div>
        </Card>
      </div>
    );
  }

  if (!studyMaterial) {
    return (
      <div className="min-h-screen flex items-center justify-center glass-card p-4">
        <Card className="p-8 glass-card text-center">
          <h2 className="text-2xl mb-4 font-bold">No Content Available</h2>
          <p className="text-muted-foreground mb-4">Please upload content from the home page first (minimum 50 characters).</p>
          <Button onClick={() => window.location.href = '/'}>
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  const currentCard = studyMaterial.flashcards[currentIndex];

  return (
    <div className="min-h-screen glass-card p-4 md:p-8">
      <div className="container mx-auto max-w-5xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Generated Study Materials</h1>
        </div>

        {/* Summary Section */}
        <Card className="glass-card p-6 md:p-8 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Summary</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">{studyMaterial.summary}</p>
        </Card>

        {/* Key Points Section */}
        <Card className="glass-card p-6 md:p-8 border border-white/10">
          <h2 className="text-2xl font-bold mb-4">Key Points</h2>
          <ul className="space-y-3">
            {studyMaterial.keyPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Flashcards Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">
            Flashcards ({studyMaterial.flashcards.length})
          </h2>
          
          <div className="text-center text-sm text-muted-foreground mb-4">
            Card {currentIndex + 1} of {studyMaterial.flashcards.length}
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
              <Card className="glass-card min-h-[250px] p-8 border border-white/10 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-sm text-primary mb-2 font-semibold uppercase">
                    {isFlipped ? 'ANSWER' : 'QUESTION'}
                  </div>
                  <p className="text-xl md:text-2xl font-bold mb-4">
                    {isFlipped ? currentCard.answer : currentCard.question}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isFlipped ? 'Click to see question' : 'Click to reveal answer'}
                  </p>
                </div>
              </Card>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              size="lg"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Previous
            </Button>

            <Button
              onClick={() => setIsFlipped(!isFlipped)}
              variant="outline"
              size="lg"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Flip
            </Button>

            <Button
              onClick={handleNext}
              disabled={currentIndex === studyMaterial.flashcards.length - 1}
              size="lg"
            >
              Next
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
