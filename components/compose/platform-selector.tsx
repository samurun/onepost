"use client"

import { cn } from "@/lib/utils"
import { PLATFORMS } from "@/lib/platforms"
import { useAccounts } from "@/hooks/use-accounts"
import { CheckCircle2 } from "lucide-react"

interface PlatformSelectorProps {
  selected: string[]
  onChange: (platforms: string[]) => void
}

export function PlatformSelector({
  selected,
  onChange,
}: PlatformSelectorProps) {
  const { accounts } = useAccounts()
  const connectedPlatforms = [...new Set(accounts.map((a) => a.platform))]

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((p) => p !== id))
    } else {
      onChange([...selected, id])
    }
  }

  const availablePlatforms = PLATFORMS.filter((p) =>
    connectedPlatforms.includes(p.id)
  )

  if (availablePlatforms.length === 0) {
    return (
      <div className="mb-5 rounded-lg border border-dashed border-muted-foreground/20 px-4 py-3 text-center text-xs text-muted-foreground">
        No accounts connected. Go to Accounts to connect a platform.
      </div>
    )
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">
        Post to
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
                "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? cn(
                      platform.borderColor,
                      platform.bgColor,
                      platform.color
                    )
                  : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
              )}
            >
              <platform.icon className="size-3.5" />
              {platform.label}
              {isActive && (
                <CheckCircle2
                  className="size-3 opacity-60"
                  aria-hidden="true"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
