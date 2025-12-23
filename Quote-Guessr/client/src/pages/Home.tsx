import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Radio, Lock, Type, HelpCircle } from "lucide-react";
import { DifficultyCard } from "@/components/DifficultyCard";
import { type Difficulty } from "@shared/schema";

export default function Home() {
  const [_, setLocation] = useLocation();

  const handleDifficultySelect = (difficulty: Difficulty) => {
    setLocation(`/game/${difficulty}`);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-display font-bold text-foreground"
          >
            Who Said It?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl text-muted-foreground font-light max-w-2xl mx-auto"
          >
            Test your knowledge of famous quotes from history, literature, and pop culture.
            Choose your game mode to begin.
          </motion.p>
        </div>

        {/* Multiple Choice Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center text-foreground">Multiple Choice</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <DifficultyCard
              title="Easy"
              description="Well-known quotes. Pick from 4 options."
              icon={Radio}
              colorClass="border-emerald-200 hover:border-emerald-500 text-emerald-600"
              onClick={() => handleDifficultySelect("mc-easy")}
              delay={0.3}
            />
            
            <DifficultyCard
              title="Hard"
              description="Obscure quotes. Pick from 4 options. Test your knowledge!"
              icon={HelpCircle}
              colorClass="border-rose-200 hover:border-rose-500 text-rose-600"
              onClick={() => handleDifficultySelect("mc-hard")}
              delay={0.4}
            />
          </div>
        </div>

        {/* Type Answer Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center text-foreground">Type Answer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <DifficultyCard
              title="Easy"
              description="Well-known quotes. Type the author's name."
              icon={Type}
              colorClass="border-amber-200 hover:border-amber-500 text-amber-600"
              onClick={() => handleDifficultySelect("type-easy")}
              delay={0.5}
            />
            
            <DifficultyCard
              title="Hard"
              description="Deep & obscure quotes. Exact match required."
              icon={Lock}
              colorClass="border-violet-200 hover:border-violet-500 text-violet-600"
              onClick={() => handleDifficultySelect("type-hard")}
              delay={0.6}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
