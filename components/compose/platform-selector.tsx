"use client"

import { cn } from "@/lib/utils"
import { ACTIVE_PLATFORMS, PLATFORMS } from "@/lib/platforms"
import { useAccounts } from "@/hooks/use-accounts"
import { Check } from "lucide-react"

interface PlatformSelectorProps {
  selected: string[]
  onChange: (platforms: string[]) => void
}

export function PlatformSelector({
  selected,
  onChange,
}: PlatformSelectorProps) {
  const { accounts } = useAccounts()
  const connectedPlatforms = new Set(accounts.map((a) => a.platform))

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((p) => p !== id))
    } else {
      onChange([...selected, id])
    }
  }

  const availablePlatforms = PLATFORMS.filter(
    (p) => ACTIVE_PLATFORMS.includes(p.id) && connectedPlatforms.has(p.id)
  )

  if (availablePlatforms.length === 0) {
    return (
      <div className="mb-4 rounded-md border border-dashed border-border px-4 py-3 text-center text-xs text-muted-foreground">
        No accounts connected. Go to Accounts to connect a platform.
      </div>
    )
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-ui uppercase tracking-widest text-muted-foreground/60">
        Publish to
      </span>
      <div
        className="flex flex-wrap gap-1.5"
        role="group"
        aria-label="Select platforms"
      >
        {availablePlatforms.map((platform) => {
          const isActive = selected.includes(platform.id)
          return (
            <button
              type="button"
              key={platform.id}
              onClick={() => toggle(platform.id)}
              aria-pressed={isActive}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-ui transition-colors",
                isActive
                  ? "border-accent/40 bg-accent/10 text-foreground"
                  : "border-border bg-white/2 text-muted-foreground hover:border-border/80 hover:bg-white/4 hover:text-foreground"
              )}
            >
              <platform.icon
                className={cn("size-3.5", isActive ? platform.color : "")}
              />
              {platform.label}
              {isActive && (
                <Check className="size-3 text-accent" aria-hidden="true" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
