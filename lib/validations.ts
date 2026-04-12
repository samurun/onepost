import { z } from "zod"

const platformEnum = z.enum(["facebook", "instagram", "youtube", "tiktok"])

export const createPostSchema = z.object({
  content: z.string().default(""),
  platforms: z.array(platformEnum).min(1, "At least one platform is required"),
  mediaUrls: z.array(z.string().url()).optional(),
  mediaTypes: z.array(z.enum(["image", "video"])).optional(),
  videoMode: z.enum(["reel", "video"]).optional(),
  youtubeTitle: z.string().max(100).optional(),
  privacy: z.enum(["public", "unlisted", "private"]).optional(),
  tiktokPrivacy: z
    .enum([
      "PUBLIC_TO_EVERYONE",
      "MUTUAL_FOLLOW_FRIENDS",
      "FOLLOWER_OF_CREATOR",
      "SELF_ONLY",
    ])
    .optional(),
})

export const deleteByIdSchema = z.object({
  id: z.string().min(1, "ID is required"),
})

export const saveDraftSchema = z.object({
  id: z.string().optional(),
  content: z.string(),
  platforms: z.array(z.string()),
  mediaUrls: z.array(z.string()).optional(),
})
