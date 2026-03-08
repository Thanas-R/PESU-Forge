import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Trophy, ThumbsUp, BookOpen, Home, CheckCircle, XCircle, Sparkles } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

export default function Quiz() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
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
  }, [toast]);

  const handleAnswer = () => {
    if (!selectedAnswer) {
      toast({ title: 'Please select an answer', variant: 'destructive' });
      return;
    }

    const currentQ = questions[currentQuestion];
    const isCorrect = selectedAnswer === currentQ.options[currentQ.correct];
    setWasCorrect(isCorrect);
    setAnswered(true);

    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    setAnswered(false);
    setSelectedAnswer('');
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer('');
    setAnswered(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <Card className="p-8 glass-card border border-border/50">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            <TextShimmer className="font-semibold text-2xl" duration={1}>Generating quiz...</TextShimmer>
          </div>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <Card className="p-8 glass-card text-center border border-border/50">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">No Content Available</h2>
          <p className="text-muted-foreground mb-4">
            Please upload learning content from the home page to generate a quiz.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            <Home className="mr-2 h-4 w-4" />
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  if (showResult) {
    const ratio = score / questions.length;
    const ResultIcon = ratio >= 0.7 ? Trophy : ratio >= 0.5 ? ThumbsUp : BookOpen;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <Card className="p-8 glass-card text-center max-w-md border border-border/50">
          <h2 className="text-3xl font-bold mb-4">Quiz Complete</h2>
          <ResultIcon className="h-16 w-16 text-primary mx-auto mb-4" />
          <p className="text-2xl mb-2 font-semibold">
            {score} / {questions.length}
          </p>
          <p className="text-muted-foreground mb-6 text-sm">
            {ratio >= 0.7 ? 'Excellent work!' : ratio >= 0.5 ? 'Good effort, keep studying!' : 'Review the material and try again.'}
          </p>
          <Progress value={ratio * 100} className="mb-6" />
          <Button onClick={resetQuiz} className="w-full">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Quiz Challenge</h1>
          <p className="text-muted-foreground text-sm">
            Question {currentQuestion + 1} of {questions.length}
          </p>
          <Progress value={((currentQuestion + 1) / questions.length) * 100} className="mt-4" />
        </div>

        <Card className="p-6 md:p-8 glass-card border border-border/50">
          <h2 className="text-xl font-bold mb-6">{currentQ.question}</h2>

          <RadioGroup value={selectedAnswer} onValueChange={(v) => { if (!answered) setSelectedAnswer(v); }}>
            <div className="space-y-3">
              {currentQ.options.map((option, idx) => {
                let optionStyle = 'border-border/50 hover:bg-muted/50';
                if (answered) {
                  if (idx === currentQ.correct) optionStyle = 'border-green-500/50 bg-green-500/10';
                  else if (option === selectedAnswer) optionStyle = 'border-destructive/50 bg-destructive/10';
                }

                return (
                  <div
                    key={idx}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${optionStyle}`}
                    onClick={() => { if (!answered) setSelectedAnswer(option); }}
                  >
                    <RadioGroupItem value={option} id={`option-${idx}`} disabled={answered} />
                    <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                    {answered && idx === currentQ.correct && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {answered && option === selectedAnswer && idx !== currentQ.correct && <XCircle className="h-5 w-5 text-destructive" />}
                  </div>
                );
              })}
            </div>
          </RadioGroup>

          {answered && currentQ.explanation && (
            <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/30">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Explanation:</span> {currentQ.explanation}
              </p>
            </div>
          )}
        </Card>

        {!answered ? (
          <Button onClick={handleAnswer} className="w-full" size="lg" disabled={!selectedAnswer}>
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNext} className="w-full" size="lg">
            {currentQuestion + 1 < questions.length ? 'Next Question' : 'View Results'}
          </Button>
        )}

        <div className="text-center text-sm text-muted-foreground">
          Score: {score} / {questions.length}
        </div>
      </div>
    </div>
  );
}
