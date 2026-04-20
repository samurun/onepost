"use client"

import { cn } from "@/lib/utils"

interface CharCounterProps {
  count: number
  max: number
}

export function CharCounter({ count, max }: CharCounterProps) {
  const percent = Math.min((count / max) * 100, 100)
  const isOver = count > max

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative size-4">
        <svg className="size-4 -rotate-90" viewBox="0 0 20 20">
          <circle
            cx="10"
            cy="10"
            r="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-muted/40"
          />
          <circle
            cx="10"
            cy="10"
            r="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray={`${percent * 0.5} 50`}
            className={cn(
              "transition-colors",
              isOver
                ? "text-destructive"
                : percent > 80
                  ? "text-yellow-500"
                  : "text-primary/60"
            )}
          />
        </svg>
      </div>
      <span
        className={cn(
          "text-[11px] tabular-nums",
          isOver ? "font-medium text-destructive" : "text-muted-foreground"
        )}
      >
        {count.toLocaleString()}/{max.toLocaleString()}
      </span>
    </div>
  )
}
