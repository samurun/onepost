import type { Platform } from "@/lib/platforms"

export type VideoMode = "reel" | "video"
export type Privacy = "public" | "unlisted" | "private"
export type TikTokPrivacy =
  | "PUBLIC_TO_EVERYONE"
  | "MUTUAL_FOLLOW_FRIENDS"
  | "FOLLOWER_OF_CREATOR"
  | "SELF_ONLY"

export interface MediaFile {
  id: string
  file?: File
  preview: string
  type: "image" | "video"
  uploadedUrl?: string
  uploading?: boolean
  error?: string
}

export interface AccountInfo {
  platform: Platform
  name: string
  avatarUrl: string | null
}

export interface PlatformResult {
  success: boolean
  error?: string
  postId?: string
}

export interface PostResult {
  status: "published" | "partial" | "failed"
  results: Record<string, PlatformResult>
}
