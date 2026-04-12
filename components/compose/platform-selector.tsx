"use client"

import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"
import {
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
} from "@/components/icons"

const FACEBOOK_MAX = 63206
const INSTAGRAM_MAX = 2200
const YOUTUBE_MAX = 5000

export const platforms = [
  {
    id: "facebook",
    label: "Facebook",
    icon: FacebookIcon,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/40",
    maxChars: FACEBOOK_MAX,
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: InstagramIcon,
    color: "text-pink-600",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/40",
    maxChars: INSTAGRAM_MAX,
  },
  {
    id: "youtube",
    label: "YouTube",
    icon: YouTubeIcon,
    color: "text-red-600",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/40",
    maxChars: YOUTUBE_MAX,
  },
] as const

interface PlatformSelectorProps {
  selected: string[]
  onChange: (platforms: string[]) => void
}

export function PlatformSelector({
  selected,
  onChange,
}: PlatformSelectorProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((p) => p !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className="mb-5 flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">Post to</span>
      <div className="flex gap-1.5">
        {platforms.map((platform) => {
          const isActive = selected.includes(platform.id)
          return (
            <button
              key={platform.id}
              onClick={() => toggle(platform.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                isActive
                  ? cn(platform.borderColor, platform.bgColor, platform.color)
                  : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
              )}
            >
              <platform.icon className="size-3.5" />
              {platform.label}
              {isActive && <CheckCircle2 className="size-3 opacity-60" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
