export interface MediaFile {
  id: string
  file: File
  preview: string
  type: "image" | "video"
}

export interface AccountInfo {
  platform: string
  name: string
  avatarUrl: string | null
}

export interface PostResult {
  status: "published" | "partial" | "failed"
  results: Record<string, { success: boolean; error?: string }>
}
