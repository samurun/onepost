"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import {
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  TikTokIcon,
} from "@/components/icons"
import { PLATFORMS } from "@/lib/platforms"
import { YouTubeSettings } from "@/components/compose/settings/youtube-settings"
import { TikTokSettings } from "@/components/compose/settings/tiktok-settings"
import type { Privacy, TikTokPrivacy } from "@/types"

const platformIcons: Record<string, typeof FacebookIcon> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  tiktok: TikTokIcon,
}

interface PlatformSettingsProps {
  selectedPlatforms: string[]
  youtubeTitle: string
  onYoutubeTitleChange: (title: string) => void
  privacy: Privacy
  onPrivacyChange: (privacy: Privacy) => void
  tiktokPrivacy: TikTokPrivacy
  onTikTokPrivacyChange: (privacy: TikTokPrivacy) => void
}

export function PlatformSettings({
  selectedPlatforms,
  youtubeTitle,
  onYoutubeTitleChange,
  privacy,
  onPrivacyChange,
  tiktokPrivacy,
  onTikTokPrivacyChange,
}: PlatformSettingsProps) {
  const [expanded, setExpanded] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("youtube")

  const hasYouTube = selectedPlatforms.includes("youtube")
  const hasTikTok = selectedPlatforms.includes("tiktok")

  const settingsPlatforms = selectedPlatforms.filter(
    (p) => p === "youtube" || p === "tiktok"
  )

  // Ensure activeTab is valid for current selection
  const resolvedTab =
    settingsPlatforms.includes(activeTab as typeof settingsPlatforms[number])
      ? activeTab
      : settingsPlatforms[0]

  if (!hasYouTube && !hasTikTok) return null

  return (
    <div className="mt-3 rounded-xl border border-border bg-card shadow-sm">
      {/* Header — collapsible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 transition-colors hover:text-muted-foreground sm:px-4 sm:py-3"
      >
        Platform Settings
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform",
            expanded && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        <div className="border-t border-border px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3">
          {/* Platform tabs */}
          {settingsPlatforms.length > 1 && (
            <div className="mb-3 flex flex-wrap gap-1 rounded-lg bg-muted/40 p-1">
              {settingsPlatforms.map((pId) => {
                const config = PLATFORMS.find((p) => p.id === pId)
                const Icon = platformIcons[pId]
                if (!config || !Icon) return null
                return (
                  <button
                    type="button"
                    key={pId}
                    onClick={() => setActiveTab(pId)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      resolvedTab === pId
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("size-3.5", config.color)} />
                    {config.label}
                  </button>
                )
              })}
            </div>
          )}

          {/* Settings content */}
          {resolvedTab === "youtube" && hasYouTube && (
            <YouTubeSettings
              youtubeTitle={youtubeTitle}
              onYoutubeTitleChange={onYoutubeTitleChange}
              privacy={privacy}
              onPrivacyChange={onPrivacyChange}
            />
          )}
          {resolvedTab === "tiktok" && hasTikTok && (
            <TikTokSettings
              tiktokPrivacy={tiktokPrivacy}
              onTikTokPrivacyChange={onTikTokPrivacyChange}
            />
          )}
        </div>
      )}
    </div>
  )
}
