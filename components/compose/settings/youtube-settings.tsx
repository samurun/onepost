"use client"

import { cn } from "@/lib/utils"
import { Globe, EyeOff, Link2 } from "lucide-react"
import type { Privacy } from "@/types"

interface YouTubeSettingsProps {
  youtubeTitle: string
  onYoutubeTitleChange: (title: string) => void
  privacy: Privacy
  onPrivacyChange: (privacy: Privacy) => void
}

export function YouTubeSettings({
  youtubeTitle,
  onYoutubeTitleChange,
  privacy,
  onPrivacyChange,
}: YouTubeSettingsProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Title
        </label>
        <input
          value={youtubeTitle}
          onChange={(e) => onYoutubeTitleChange(e.target.value)}
          placeholder="YouTube title\u2026"
          name="youtubeTitle"
          aria-label="YouTube title"
          autoComplete="off"
          spellCheck={false}
          maxLength={100}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm transition-shadow placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/20"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Privacy
        </label>
        <div
          className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 p-1"
          role="radiogroup"
          aria-label="YouTube privacy"
        >
          {(
            [
              { value: "public", label: "Public", icon: Globe },
              { value: "unlisted", label: "Unlisted", icon: Link2 },
              { value: "private", label: "Private", icon: EyeOff },
            ] as const
          ).map((opt) => (
            <button
              type="button"
              role="radio"
              aria-checked={privacy === opt.value}
              key={opt.value}
              onClick={() => onPrivacyChange(opt.value)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                privacy === opt.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <opt.icon className="size-3.5" aria-hidden="true" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
