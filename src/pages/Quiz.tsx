import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { TextShimmer } from '@/components/ui/text-shimmer';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export default function Quiz() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
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
        setIsLoading(true);
        const { data, error } = await supabase.functions.invoke('generate-learning', {
          body: { content, type: 'quiz', count: 5 },
        });
        if (error) throw error;
        const fromAI = (data?.questions || []).map((q: any) => ({
          question: q.question,
          options: q.options,
          correct: q.correctIndex,
          explanation: q.explanation,
        }));
        setQuestions(fromAI);
      } catch (e) {
        console.error(e);
        toast({ title: 'Failed to generate quiz', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [difficulty, toast]);

  const handleAnswer = () => {
    if (!selectedAnswer) {
      toast({
        title: 'Please select an answer',
        variant: 'destructive',
      });
      return;
    }

    const currentQ = questions[currentQuestion];
    const isCorrect = selectedAnswer === currentQ.options[currentQ.correct];

    if (isCorrect) {
      setScore(score + 1);
      toast({
        title: 'Correct! 🎉',
        description: 'Great job!',
      });
    } else {
      toast({
        title: 'Incorrect',
        description: `The correct answer was: ${currentQ.options[currentQ.correct]}`,
        variant: 'destructive',
      });
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
        <Card className="p-8 pixel-border">
          <TextShimmer className='font-mono text-2xl' duration={1}>Generating quiz...</TextShimmer>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 p-4">
        <Card className="p-8 pixel-border text-center">
          <h2 className="pixel-font text-2xl mb-4">No Content Available</h2>
          <p className="text-muted-foreground mb-4">
            Please upload learning content from the home page to generate a quiz.
          </p>
          <Button onClick={() => window.location.href = '/'} className="pixel-button">
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 p-4">
        <Card className="p-8 pixel-border text-center max-w-md">
          <h2 className="pixel-font text-4xl mb-4">Quiz Complete!</h2>
          <div className="text-6xl mb-4">
            {score / questions.length >= 0.7 ? '🏆' : score / questions.length >= 0.5 ? '👍' : '📚'}
          </div>
          <p className="text-2xl mb-6">
            Score: {score} / {questions.length}
          </p>
          <Progress value={(score / questions.length) * 100} className="mb-6" />
          <Button onClick={resetQuiz} className="pixel-button w-full">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

   const currentQ = questions[currentQuestion];
   const currentExplanation = (currentQ as any)?.explanation as string | undefined;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="pixel-font text-4xl mb-2">Quiz Challenge</h1>
          <p className="text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </p>
          <Progress
            value={((currentQuestion + 1) / questions.length) * 100}
            className="mt-4"
          />
        </div>

        <Card className="p-8 pixel-border">
          <h2 className="text-2xl font-bold mb-6">{currentQ.question}</h2>

          <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
            <div className="space-y-4">
              {currentQ.options.map((option, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedAnswer(option)}
                >
                  <RadioGroupItem value={option} id={`option-${idx}`} />
                  <Label
                    htmlFor={`option-${idx}`}
                    className="flex-1 cursor-pointer text-lg"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </Card>

        <Button onClick={handleAnswer} className="pixel-button w-full" size="lg">
          Submit Answer
        </Button>

        {selectedAnswer && (
          <div className="text-center text-sm text-muted-foreground">
            {currentExplanation && <p className="mt-3">Why: {currentExplanation}</p>}
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          Score: {score} / {currentQuestion}
        </div>
      </div>
    </div>
  );
}
