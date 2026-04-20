"use client"

import { cn } from "@/lib/utils"
import { Globe, Users, UserCheck, Lock } from "lucide-react"
import type { TikTokPrivacy } from "@/types"

interface TikTokSettingsProps {
  tiktokPrivacy: TikTokPrivacy
  onTikTokPrivacyChange: (privacy: TikTokPrivacy) => void
}

const privacyOptions: {
  value: TikTokPrivacy
  label: string
  icon: typeof Globe
}[] = [
  { value: "PUBLIC_TO_EVERYONE", label: "Public", icon: Globe },
  { value: "FOLLOWER_OF_CREATOR", label: "Followers", icon: Users },
  { value: "MUTUAL_FOLLOW_FRIENDS", label: "Friends", icon: UserCheck },
  { value: "SELF_ONLY", label: "Private", icon: Lock },
]

export function TikTokSettings({
  tiktokPrivacy,
  onTikTokPrivacyChange,
}: TikTokSettingsProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted-foreground">
          Privacy
        </label>
        <div
          className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/40 p-1"
          role="radiogroup"
          aria-label="TikTok privacy"
        >
          {privacyOptions.map((opt) => (
            <button
              type="button"
              role="radio"
              aria-checked={tiktokPrivacy === opt.value}
              key={opt.value}
              onClick={() => onTikTokPrivacyChange(opt.value)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                tiktokPrivacy === opt.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <opt.icon className="size-3" aria-hidden="true" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[10px] leading-relaxed text-muted-foreground/60">
        Unaudited apps can only post as Private. Apply for TikTok audit to
        unlock public posting.
      </p>
    </div>
  )
}
