import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  total?: number; // Optional, might be session total
  className?: string;
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-full",
      "bg-white/80 border border-border shadow-sm backdrop-blur-sm",
      "text-primary font-medium transition-all duration-300",
      className
    )}>
      <Trophy className="w-4 h-4 text-secondary" />
      <span className="text-sm font-bold tracking-wide">
        SCORE: <span className="text-foreground">{score}</span>
      </span>
    </div>
  );
}
