"use client"

import { cn } from "@/lib/utils"
import type { MediaFile, AccountInfo } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Globe,
} from "lucide-react"

interface FacebookPreviewProps {
  content: string
  mediaFiles: MediaFile[]
  account?: AccountInfo
}

export function FacebookPreview({
  content,
  mediaFiles,
  account,
}: FacebookPreviewProps) {
  const hasContent = content || mediaFiles.length > 0
  const pageName = account?.name || "Your Page"
  const initials = pageName.slice(0, 2).toUpperCase()

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border">
      {/* Header */}
      <div className="flex items-center gap-2.5 p-3 pb-2">
        <Avatar className="size-10 ring-1 ring-border">
          {account?.avatarUrl && <AvatarImage src={account.avatarUrl} />}
          <AvatarFallback className="bg-blue-500 text-xs font-semibold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-[13px] font-semibold leading-tight">{pageName}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Just now</span>
            <span>·</span>
            <Globe className="size-3" />
          </div>
        </div>
        <MoreHorizontal className="size-5 text-muted-foreground/50" aria-hidden="true" />
      </div>

      {/* Content */}
      {content && (
        <div className="px-3 pb-2">
          <p className="whitespace-pre-wrap wrap-break-word text-[13px] leading-relaxed">
            {content}
          </p>
        </div>
      )}

      {/* Media */}
      {mediaFiles.length > 0 && (
        <div className={cn(!content && "mt-1")}>
          {mediaFiles.length === 1 ? (
            <div className="aspect-video bg-muted">
              {mediaFiles[0].type === "image" ? (
                <img
                  src={mediaFiles[0].preview}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <video
                  src={mediaFiles[0].preview}
                  className="size-full object-cover"
                />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-px bg-border">
              {mediaFiles.slice(0, 4).map((file, i) => (
                <div
                  key={file.id}
                  className={cn(
                    "relative aspect-square bg-muted",
                    mediaFiles.length === 3 &&
                      i === 0 &&
                      "col-span-2 aspect-video"
                  )}
                >
                  <img
                    src={file.preview}
                    alt=""
                    className="size-full object-cover"
                  />
                  {i === 3 && mediaFiles.length > 4 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="text-xl font-bold text-white">
                        +{mediaFiles.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Engagement */}
      {hasContent && (
        <div className="flex items-center justify-between px-3 py-1.5 text-xs text-muted-foreground">
          <span>0 likes</span>
          <span>0 comments</span>
        </div>
      )}

      {/* Reactions */}
      <div className="flex border-t border-border">
        <button type="button" className="flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-blue-500">
          <ThumbsUp className="size-4" aria-hidden="true" />
          Like
        </button>
        <button type="button" className="flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50">
          <MessageCircle className="size-4" aria-hidden="true" />
          Comment
        </button>
        <button type="button" className="flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50">
          <Share2 className="size-4" aria-hidden="true" />
          Share
        </button>
      </div>
    </div>
  )
}
