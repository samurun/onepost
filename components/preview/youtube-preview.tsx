"use client"

import type { MediaFile, AccountInfo } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  MoreVertical,
  AlertTriangle,
} from "lucide-react"

interface YouTubePreviewProps {
  content: string
  youtubeTitle?: string
  mediaFiles: MediaFile[]
  account?: AccountInfo
}

export function YouTubePreview({
  content,
  youtubeTitle,
  mediaFiles,
  account,
}: YouTubePreviewProps) {
  const channelName = account?.name || "Your Channel"
  const initials = channelName.slice(0, 2).toUpperCase()
  const videoFile = mediaFiles.find((f) => f.type === "video")

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border">
      {/* Video player area */}
      <div className="relative aspect-video bg-black">
        {videoFile ? (
          <video
            src={videoFile.preview}
            className="size-full object-contain"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <div className="text-center text-white/40">
              <AlertTriangle className="mx-auto mb-1.5 size-5" />
              <p className="text-sm font-medium">Video required</p>
              <p className="mt-0.5 text-xs">YouTube only supports video uploads</p>
            </div>
          </div>
        )}
      </div>

      {/* Title & info */}
      <div className="p-3">
        <p className="line-clamp-2 text-[13px] font-semibold leading-snug">
          {youtubeTitle || "Untitled"}
        </p>
        <div className="mt-2 flex items-center gap-2.5">
          <Avatar className="size-6 ring-1 ring-border">
            {account?.avatarUrl && <AvatarImage src={account.avatarUrl} />}
            <AvatarFallback className="bg-red-500 text-[9px] font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{channelName}</p>
            <p className="text-[10px] text-muted-foreground/60">
              0 views · Just now
            </p>
          </div>
          <MoreVertical className="size-4 text-muted-foreground/50" aria-hidden="true" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex border-t border-border">
        <button type="button" className="flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50">
          <ThumbsUp className="size-4" aria-hidden="true" />
          Like
        </button>
        <button type="button" className="flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50">
          <ThumbsDown className="size-4" aria-hidden="true" />
          Dislike
        </button>
        <button type="button" className="flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50">
          <Share2 className="size-4" aria-hidden="true" />
          Share
        </button>
      </div>
    </div>
  )
}
