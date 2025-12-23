import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Loader2, ArrowLeft, Send } from "lucide-react";
import { useQuote, useCheckAnswer, useResetScore } from "@/hooks/use-game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScoreBadge } from "@/components/ScoreBadge";
import { GameFeedback } from "@/components/GameFeedback";
import { type Difficulty, difficultySchema } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function Game() {
  const params = useParams();
  const [location, setLocation] = useLocation();
  const difficulty = params.difficulty as Difficulty;
  
  // Validate difficulty parameter
  const isValidDifficulty = difficultySchema.safeParse(difficulty).success;

  if (!isValidDifficulty) {
    setLocation("/");
    return null;
  }

  // Determine if this is multiple choice or text input
  const isMultipleChoice = difficulty.startsWith("mc-");
  const difficultyLevel = difficulty.includes("easy") ? "Easy" : "Hard";

  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    correctAuthor: string;
    message: string;
    source?: string;
    score: number;
  } | null>(null);

  // Queries & Mutations
  const { data: quote, isLoading, isError, refetch } = useQuote(difficulty, true);
  const checkAnswerMutation = useCheckAnswer();
  const resetScoreMutation = useResetScore();

  const handleSubmit = async (userAnswer: string) => {
    if (!quote || checkAnswerMutation.isPending) return;

    try {
      const result = await checkAnswerMutation.mutateAsync({
        quoteId: quote.id,
        answer: userAnswer,
        difficulty,
      });

      setScore(result.userScore);
      setFeedback({
        correct: result.correct,
        correctAuthor: result.correctAuthor,
        message: result.message,
        source: result.source,
        score: result.userScore,
      });

      if (result.correct) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#22c55e", "#fbbf24", "#3b82f6"]
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleNext = () => {
    setFeedback(null);
    setAnswer("");
    refetch();
  };

  const handleRestart = () => {
    resetScoreMutation.mutate();
    setScore(0);
    setFeedback(null);
    setAnswer("");
    refetch();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
            <div className="text-sm font-medium text-muted-foreground">
              {isMultipleChoice ? "Multiple Choice" : "Type Answer"} • {difficultyLevel}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ScoreBadge score={score} />
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRestart}
              className="text-muted-foreground"
            >
              Reset
            </Button>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center max-w-4xl">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">Finding a quote...</p>
          </div>
        ) : isError ? (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-destructive">Failed to load quote</h2>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        ) : (
          <div className="w-full space-y-12">
            {/* Quote Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={quote?.id}
              className="relative p-12 md:p-16 rounded-3xl bg-white border shadow-xl shadow-primary/5 text-center"
            >
              <span className="absolute top-8 left-8 text-6xl font-serif text-primary/10 leading-none">“</span>
              <blockquote className="relative z-10 text-3xl md:text-5xl font-quote font-medium text-foreground leading-tight">
                "{quote?.text}"
              </blockquote>
              <span className="absolute bottom-8 right-8 text-6xl font-serif text-primary/10 leading-none rotate-180">“</span>
            </motion.div>

            {/* Interaction Area */}
            {!feedback && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-2xl mx-auto"
              >
                {isMultipleChoice && quote?.options ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quote.options.map((option, idx) => (
                      <Button
                        key={idx}
                        onClick={() => handleSubmit(option)}
                        className="h-16 text-lg font-medium bg-white hover:bg-primary/5 text-foreground hover:text-primary border-2 border-border hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-200"
                        variant="ghost"
                        disabled={checkAnswerMutation.isPending}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSubmit(answer); }}
                    className="flex gap-4"
                  >
                    <Input
                      autoFocus
                      placeholder="Who said this?"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="h-14 text-lg px-6 rounded-xl border-2 focus-visible:ring-primary/20 shadow-sm"
                      disabled={checkAnswerMutation.isPending}
                    />
                    <Button 
                      type="submit" 
                      size="lg"
                      disabled={!answer.trim() || checkAnswerMutation.isPending}
                      className="h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-lg shadow-lg shadow-primary/25 transition-all hover:shadow-xl active:scale-95"
                    >
                      {checkAnswerMutation.isPending ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Send className="w-6 h-6" />
                      )}
                    </Button>
                  </form>
                )}
              </motion.div>
            )}

            {/* Feedback Area */}
            {feedback && (
              <GameFeedback
                isCorrect={feedback.correct}
                correctAuthor={feedback.correctAuthor}
                userScore={feedback.score}
                message={feedback.message}
                source={feedback.source}
                onNext={handleNext}
                onRetry={!isMultipleChoice && !feedback.correct ? () => {
                  setFeedback(null);
                  setAnswer("");
                } : undefined}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
