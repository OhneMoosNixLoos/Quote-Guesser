import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface DifficultyCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  colorClass: string;
  onClick: () => void;
  delay?: number;
}

export function DifficultyCard({ 
  title, 
  description, 
  icon: Icon, 
  colorClass,
  onClick,
  delay = 0 
}: DifficultyCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center justify-center p-8 text-center",
        "w-full h-64 rounded-2xl border-2 transition-all duration-300",
        "bg-white hover:shadow-xl hover:shadow-primary/5",
        colorClass
      )}
    >
      <div className={cn(
        "mb-6 p-4 rounded-full bg-opacity-10 transition-transform duration-300 group-hover:scale-110",
        colorClass.replace("border-", "bg-").replace("/20", "")
      )}>
        <Icon className={cn("w-8 h-8", colorClass.replace("border-", "text-"))} />
      </div>
      
      <h3 className="text-2xl font-bold font-display text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-[200px]">
        {description}
      </p>
      
      <div className={cn(
        "absolute bottom-0 left-0 w-full h-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl",
        colorClass.replace("border-", "bg-")
      )} />
    </motion.button>
  );
}
