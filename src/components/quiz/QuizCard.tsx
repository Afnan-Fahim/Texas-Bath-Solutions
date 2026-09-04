import React from "react";
import { cn } from "@/lib/utils";

interface QuizCardProps {
  title: string;
  description?: string;
  image?: string;
  selected: boolean;
  onClick: () => void;
}

export function QuizCard({ title, description, image, selected, onClick }: QuizCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-xl border-2 overflow-hidden transition-all duration-300",
        "flex flex-col items-center text-center",
        "hover:border-primary/50 hover:shadow-md active:scale-90 active:rotate-1",
        selected
          ? "border-primary bg-primary/5 shadow-lg scale-105"
          : "border-border bg-card"
      )}
    >
      {image ? (
        <div className="w-full aspect-video sm:aspect-[4/3] bg-muted/30 relative overflow-hidden flex items-center justify-center p-2 group">
          {/* Premium blurred background effect */}
          <div 
            className="absolute inset-0 blur-2xl opacity-50 bg-cover bg-center scale-110" 
            style={{ backgroundImage: `url(${image})` }} 
          />
          <img
            src={image}
            alt={title}
            className="relative w-full h-full object-contain rounded-md drop-shadow-md z-10 animate-[bounce_2s_infinite] group-hover:animate-none group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              // Fallback if image fails to load
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      ) : (
        // Placeholder if no image provided
        <div className="w-full aspect-video sm:aspect-[4/3] bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Image Pending</span>
        </div>
      )}
      <div className="p-3 w-full">
        <h3 className="font-medium text-base sm:text-lg">{title}</h3>
        {description && <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
  );
}
