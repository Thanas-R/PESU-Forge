import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { supabase } from '@/integrations/supabase/client';
import { HelpCircle, RotateCcw, Trophy, Loader2, Home, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MemoryPair {
  question: string;
  answer: string;
}

interface MemoryItem {
  id: string;
  content: string;
  type: 'question' | 'answer';
  pairIndex: number;
  isSelected: boolean;
  isMatched: boolean;
}

export default function Memory() {
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [matches, setMatches] = useState(0);
  const [totalPairs, setTotalPairs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [wrongPair, setWrongPair] = useState<string[] | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('memory-best-score');
    if (saved) setBestScore(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    const content = localStorage.getItem('learning-content');
    if (!content || content.trim().length < 50) {
      toast({ title: 'No content found', description: 'Please upload content from the home page first.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-learning', {
          body: { content, type: 'memory' },
        });
        if (error) throw error;

        const flashcards: MemoryPair[] = (data?.flashcards || []).slice(0, 6);
        if (flashcards.length < 3) {
          toast({ title: 'Not enough content', variant: 'destructive' });
          setIsLoading(false);
          return;
        }

        setTotalPairs(flashcards.length);
        const memItems: MemoryItem[] = [];
        flashcards.forEach((pair, idx) => {
          memItems.push({ id: `q-${idx}`, content: pair.question, type: 'question', pairIndex: idx, isSelected: false, isMatched: false });
          memItems.push({ id: `a-${idx}`, content: pair.answer, type: 'answer', pairIndex: idx, isSelected: false, isMatched: false });
        });
        // Shuffle questions and answers separately for two-column layout
        const questions = memItems.filter(i => i.type === 'question').sort(() => Math.random() - 0.5);
        const answers = memItems.filter(i => i.type === 'answer').sort(() => Math.random() - 0.5);
        setItems([...questions, ...answers]);
      } catch (e) {
        console.error(e);
        toast({ title: 'Failed to generate memory game', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [toast]);

  const questions = items.filter(i => i.type === 'question');
  const answers = items.filter(i => i.type === 'answer');

  const handleSelect = (id: string) => {
    if (wrongPair) return;
    const item = items.find(i => i.id === id);
    if (!item || item.isMatched) return;

    // If already selected, deselect
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
      return;
    }

    // Can only select one Q and one A
    const itemType = item.type;
    const existingSameType = selected.find(s => items.find(i => i.id === s)?.type === itemType);
    let newSelected = [...selected];
    if (existingSameType) {
      newSelected = newSelected.filter(s => s !== existingSameType);
    }
    newSelected.push(id);
    setSelected(newSelected);

    // Check if we have one Q and one A selected
    if (newSelected.length === 2) {
      const q = items.find(i => i.id === newSelected[0]);
      const a = items.find(i => i.id === newSelected[1]);
      if (q && a && q.type !== a.type) {
        setAttempts(prev => prev + 1);
        if (q.pairIndex === a.pairIndex) {
          // Match!
          setItems(prev => prev.map(i => i.id === q.id || i.id === a.id ? { ...i, isMatched: true } : i));
          const newMatches = matches + 1;
          setMatches(newMatches);
          setSelected([]);

          if (newMatches === totalPairs) {
            const finalAttempts = attempts + 1;
            if (!bestScore || finalAttempts < bestScore) {
              setBestScore(finalAttempts);
              localStorage.setItem('memory-best-score', String(finalAttempts));
            }
            toast({ title: 'Congratulations!', description: `Matched all pairs in ${finalAttempts} attempts!` });
          }
        } else {
          // Wrong
          setWrongPair(newSelected);
          setTimeout(() => {
            setWrongPair(null);
            setSelected([]);
          }, 800);
        }
      }
    }
  };

  const resetGame = () => {
    setItems(prev => prev.map(i => ({ ...i, isMatched: false, isSelected: false })).sort(() => Math.random() - 0.5));
    setSelected([]);
    setAttempts(0);
    setMatches(0);
    setWrongPair(null);
  };

  const getCardStyle = (item: MemoryItem) => {
    if (item.isMatched) return 'border-green-500/40 bg-green-500/10 opacity-60';
    if (wrongPair?.includes(item.id)) return 'border-destructive/50 bg-destructive/10 ring-2 ring-destructive/30';
    if (selected.includes(item.id)) return 'border-primary/60 bg-primary/10 ring-2 ring-primary/30';
    return 'border-border/50 hover:border-primary/30 hover:bg-muted/30';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <Card className="p-8 glass-card border border-border/50">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
            <TextShimmer className="text-2xl font-semibold" duration={1}>Loading game...</TextShimmer>
          </div>
        </Card>
      </div>
    );
  }

  if (items.length === 0) {
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

  const allMatched = matches === totalPairs;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 pb-28">
      <div className="container mx-auto py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Memory Match</h1>
          <p className="text-sm text-muted-foreground mb-6">Match each question with its correct answer</p>

          <div className="flex gap-6 justify-center items-center flex-wrap">
            <div className="glass-card px-4 py-2 rounded-full text-sm">
              Attempts: <span className="font-bold text-primary">{attempts}</span>
            </div>
            <div className="glass-card px-4 py-2 rounded-full text-sm">
              Matched: <span className="font-bold text-green-400">{matches}</span> / {totalPairs}
            </div>
            {bestScore !== null && (
              <div className="glass-card px-4 py-2 rounded-full text-sm flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5 text-primary" />
                Best: <span className="font-bold">{bestScore}</span>
              </div>
            )}
            <Button onClick={resetGame} variant="outline" size="sm" className="rounded-full">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </div>

        {/* Win State */}
        <AnimatePresence>
          {allMatched && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 rounded-2xl border border-primary/30 text-center mb-8"
            >
              <Trophy className="h-12 w-12 text-primary mx-auto mb-3" />
              <h2 className="text-2xl font-bold mb-2">All Matched!</h2>
              <p className="text-muted-foreground mb-4">Completed in {attempts} attempts</p>
              <Button onClick={resetGame} className="rounded-full">
                <RotateCcw className="mr-2 h-4 w-4" /> Play Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Two Column Layout: Questions | Answers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Questions Column */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider text-center mb-4">Questions</h3>
            {questions.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: item.isMatched ? 1 : 1.02 }}
                whileTap={{ scale: item.isMatched ? 1 : 0.98 }}
              >
                <Card
                  onClick={() => !item.isMatched && handleSelect(item.id)}
                  className={`p-4 cursor-pointer transition-all duration-200 rounded-xl ${getCardStyle(item)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 text-sm font-medium">{item.content}</div>
                    {item.isMatched && <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Answers Column */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider text-center mb-4">Answers</h3>
            {answers.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: item.isMatched ? 1 : 1.02 }}
                whileTap={{ scale: item.isMatched ? 1 : 0.98 }}
              >
                <Card
                  onClick={() => !item.isMatched && handleSelect(item.id)}
                  className={`p-4 cursor-pointer transition-all duration-200 rounded-xl ${getCardStyle(item)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 text-sm">{item.content}</div>
                    {item.isMatched && <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
