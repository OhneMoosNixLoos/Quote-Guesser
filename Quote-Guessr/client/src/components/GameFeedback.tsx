import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GameFeedbackProps {
  isCorrect: boolean;
  correctAuthor: string;
  userScore: number;
  message: string;
  source?: string;
  onNext: () => void;
  onRetry?: () => void;
}

export function GameFeedback({ 
  isCorrect, 
  correctAuthor, 
  message, 
  source,
  onNext,
  onRetry 
}: GameFeedbackProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl mx-auto mt-8"
      >
        <div className={`
          relative overflow-hidden rounded-2xl border p-8 shadow-lg
          ${isCorrect ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}
        `}>
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className={`
              p-4 rounded-full shrink-0
              ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
            `}>
              {isCorrect ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <XCircle className="w-8 h-8" />
              )}
            </div>

            <div className="flex-1 space-y-3">
              <h3 className={`text-xl font-bold font-display ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? "Correct!" : "Incorrect"}
              </h3>
              <p className="text-foreground/80 font-medium text-lg">
                {isCorrect 
                  ? message 
                  : <>The correct answer was <span className="font-bold">{correctAuthor}</span></>
                }
              </p>
              {source && (
                <p className={`text-sm font-medium p-3 rounded-lg ${isCorrect ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
                  📌 Source: <span className="italic">{source}</span>
                </p>
              )}
            </div>

            <div className="flex gap-3">
              {!isCorrect && onRetry && (
                <Button 
                  variant="outline" 
                  onClick={onRetry}
                  className="bg-white hover:bg-red-50 border-red-200 text-red-700"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
              
              <Button 
                onClick={onNext}
                className={`
                  font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5
                  ${isCorrect 
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200' 
                    : 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'}
                `}
              >
                Next Quote
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
