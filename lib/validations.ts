import { z } from "zod"

const platformEnum = z.enum(["facebook", "instagram", "youtube", "tiktok"])
const privacyEnum = z.enum(["public", "unlisted", "private"])
const tiktokPrivacyEnum = z.enum([
  "PUBLIC_TO_EVERYONE",
  "MUTUAL_FOLLOW_FRIENDS",
  "FOLLOWER_OF_CREATOR",
  "SELF_ONLY",
])
const videoModeEnum = z.enum(["reel", "video"])

export const createPostSchema = z.object({
  content: z.string().default(""),
  platforms: z.array(platformEnum).min(1, "At least one platform is required"),
  mediaUrls: z.array(z.string().url()).optional(),
  mediaTypes: z.array(z.enum(["image", "video"])).optional(),
  videoMode: videoModeEnum.optional(),
  youtubeTitle: z.string().max(100).optional(),
  youtubeDescription: z.string().max(5000).optional(),
  tiktokCaption: z.string().max(2200).optional(),
  privacy: privacyEnum.optional(),
  tiktokPrivacy: tiktokPrivacyEnum.optional(),
})

export const deleteByIdSchema = z.object({
  id: z.string().min(1, "ID is required"),
})

export const saveDraftSchema = z.object({
  id: z.string().optional(),
  content: z.string(),
  platforms: z.array(z.string()),
  mediaUrls: z.array(z.string()).optional(),
  youtubeTitle: z.string().max(100).optional(),
  youtubeDescription: z.string().max(5000).optional(),
  tiktokCaption: z.string().max(2200).optional(),
  videoMode: videoModeEnum.optional(),
  privacy: privacyEnum.optional(),
  tiktokPrivacy: tiktokPrivacyEnum.optional(),
})
