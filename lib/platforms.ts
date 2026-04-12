import {
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  TikTokIcon,
} from "@/components/icons"

export type Platform = "facebook" | "instagram" | "youtube" | "tiktok"

export const PLATFORM_CHAR_LIMITS: Record<Platform, number> = {
  facebook: 63206,
  instagram: 2200,
  youtube: 5000,
  tiktok: 2200,
}

export const PLATFORMS = [
  {
    id: "facebook" as const,
    label: "Facebook",
    icon: FacebookIcon,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/40",
    maxChars: 63206,
  },
  {
    id: "instagram" as const,
    label: "Instagram",
    icon: InstagramIcon,
    color: "text-pink-600",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/40",
    maxChars: 2200,
  },
  {
    id: "youtube" as const,
    label: "YouTube",
    icon: YouTubeIcon,
    color: "text-red-600",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/40",
    maxChars: 5000,
  },
  {
    id: "tiktok" as const,
    label: "TikTok",
    icon: TikTokIcon,
    color: "text-foreground",
    bgColor: "bg-foreground/10",
    borderColor: "border-foreground/40",
    maxChars: 2200,
  },
] as const
