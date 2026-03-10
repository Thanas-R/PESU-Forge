import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { Trophy, ThumbsUp, BookOpen, Home, CheckCircle, XCircle, Loader2, Clock, Zap, ChevronRight, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

type Phase = 'loading' | 'empty' | 'intro' | 'quiz' | 'result';

export default function Quiz() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<Phase>('loading');
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const content = localStorage.getItem('learning-content');
    if (!content || content.trim().length < 50) {
      toast({ title: 'No content found', description: 'Please upload content from the home page first.', variant: 'destructive' });
      setPhase('empty');
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-learning', {
          body: { content, type: 'quiz', count: 10 },
        });
        if (error) throw error;
        const fromAI = (data?.questions || []).map((q: any) => ({
          question: q.question,
          options: q.options,
          correct: q.correctIndex,
          explanation: q.explanation,
        }));
        setQuestions(fromAI);
        setPhase(fromAI.length > 0 ? 'intro' : 'empty');
      } catch (e) {
        console.error(e);
        toast({ title: 'Failed to generate quiz', variant: 'destructive' });
        setPhase('empty');
      }
    })();
  }, [toast]);

  const handleAnswer = (option: string) => {
    if (answered) return;
    setSelectedAnswer(option);
    const currentQ = questions[currentQuestion];
    const isCorrect = option === currentQ.options[currentQ.correct];
    setWasCorrect(isCorrect);
    setAnswered(true);
    if (isCorrect) setScore(s => s + 1);
  };

  const handleNext = () => {
    setAnswered(false);
    setSelectedAnswer('');
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setPhase('result');
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer('');
    setAnswered(false);
    setPhase('intro');
  };

  const estimatedTime = Math.ceil(questions.length * 0.5);

  // Loading
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <Card className="p-8 glass-card border border-border/50">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <TextShimmer className="font-semibold text-2xl" duration={1}>Generating quiz...</TextShimmer>
          </div>
        </Card>
      </div>
    );
  }

  // Empty
  if (phase === 'empty') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <Card className="p-8 glass-card text-center border border-border/50">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">No Content Available</h2>
          <p className="text-muted-foreground mb-4">Upload learning content from the home page to generate a quiz.</p>
          <Button onClick={() => window.location.href = '/'}>
            <Home className="mr-2 h-4 w-4" /> Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  // Instruction / Intro Screen
  if (phase === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-8 md:p-10 glass-card border border-border/50 max-w-lg text-center space-y-6">
            <Zap className="h-14 w-14 text-primary mx-auto" />
            <h1 className="text-3xl font-bold">Quiz Challenge</h1>
            <p className="text-muted-foreground">Test your understanding of the uploaded material.</p>

            <div className="flex justify-center gap-6 text-sm">
              <div className="glass-card px-4 py-3 rounded-xl text-center">
                <div className="text-2xl font-bold text-primary">{questions.length}</div>
                <div className="text-muted-foreground text-xs">Questions</div>
              </div>
              <div className="glass-card px-4 py-3 rounded-xl text-center">
                <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                  <Clock className="h-5 w-5" /> ~{estimatedTime}
                </div>
                <div className="text-muted-foreground text-xs">Minutes</div>
              </div>
            </div>

            <div className="text-left text-sm text-muted-foreground space-y-2 glass-card p-4 rounded-xl">
              <p>- One question at a time</p>
              <p>- Select an answer to submit</p>
              <p>- Instant feedback after each question</p>
              <p>- See your score at the end</p>
            </div>

            <Button onClick={() => setPhase('quiz')} size="lg" className="w-full rounded-full text-lg">
              Start Quiz <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Result
  if (phase === 'result') {
    const ratio = score / questions.length;
    const ResultIcon = ratio >= 0.7 ? Trophy : ratio >= 0.5 ? ThumbsUp : BookOpen;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-8 glass-card text-center max-w-md border border-border/50 space-y-6">
            <h2 className="text-3xl font-bold">Quiz Complete</h2>
            <ResultIcon className="h-16 w-16 text-primary mx-auto" />
            <p className="text-4xl font-bold text-primary">
              {score} / {questions.length}
            </p>
            <p className="text-muted-foreground text-sm">
              {ratio >= 0.7 ? 'Excellent work!' : ratio >= 0.5 ? 'Good effort, keep studying!' : 'Review the material and try again.'}
            </p>
            <Progress value={ratio * 100} className="h-3 rounded-full" />
            <Button onClick={resetQuiz} className="w-full rounded-full" size="lg">
              <RotateCcw className="mr-2 h-4 w-4" /> Try Again
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Quiz Phase
  const currentQ = questions[currentQuestion];
  const progressValue = ((currentQuestion + (answered ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4 pb-28">
      <div className="w-full max-w-2xl space-y-6">
        {/* Progress Header */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span className="glass-card px-3 py-1 rounded-full text-xs">Score: {score}</span>
          </div>
          <Progress value={progressValue} className="h-2 rounded-full" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 md:p-8 glass-card border border-border/50 rounded-2xl">
              <h2 className="text-lg md:text-xl font-bold mb-6 leading-relaxed">{currentQ.question}</h2>

              <div className="space-y-3">
                {currentQ.options.map((option, idx) => {
                  let style = 'border-border/50 hover:border-primary/40 hover:bg-muted/30';
                  let icon = null;

                  if (answered) {
                    if (idx === currentQ.correct) {
                      style = 'border-green-500/50 bg-green-500/10';
                      icon = <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />;
                    } else if (option === selectedAnswer) {
                      style = 'border-destructive/50 bg-destructive/10';
                      icon = <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />;
                    } else {
                      style = 'border-border/30 opacity-50';
                    }
                  } else if (option === selectedAnswer) {
                    style = 'border-primary/50 bg-primary/10';
                  }

                  return (
                    <motion.div
                      key={idx}
                      whileHover={!answered ? { scale: 1.01 } : {}}
                      whileTap={!answered ? { scale: 0.99 } : {}}
                      onClick={() => handleAnswer(option)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors cursor-pointer ${style}`}
                    >
                      <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold flex-shrink-0 opacity-60">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 text-sm font-medium">{option}</span>
                      {icon}
                    </motion.div>
                  );
                })}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {answered && currentQ.explanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-5 p-4 rounded-xl glass-card border border-border/30"
                  >
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Explanation:</span> {currentQ.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Next Button */}
        <AnimatePresence>
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button onClick={handleNext} className="w-full rounded-full" size="lg">
                {currentQuestion + 1 < questions.length ? (
                  <>Next Question <ChevronRight className="ml-2 h-5 w-5" /></>
                ) : (
                  'View Results'
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
