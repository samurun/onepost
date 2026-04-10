"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { MediaFile, AccountInfo } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import {
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  MoreHorizontal,
} from "lucide-react"
import { InstagramIcon } from "@/components/icons"

interface InstagramPreviewProps {
  content: string
  mediaFiles: MediaFile[]
  account?: AccountInfo
}

function InstagramCarousel({ mediaFiles }: { mediaFiles: MediaFile[] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) return
    api.on("select", () => setCurrent(api.selectedScrollSnap()))
  }, [api])

  return (
    <div className="relative">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent className="ml-0">
          {mediaFiles.map((file) => (
            <CarouselItem key={file.id} className="pl-0">
              <div className="aspect-square bg-muted">
                {file.type === "image" ? (
                  <img
                    src={file.preview}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <video
                    src={file.preview}
                    className="size-full object-cover"
                  />
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 size-6 -translate-y-1/2 border-none bg-white/90 shadow-sm hover:bg-white" />
        <CarouselNext className="absolute right-2 top-1/2 size-6 -translate-y-1/2 border-none bg-white/90 shadow-sm hover:bg-white" />
      </Carousel>

      {/* Dots */}
      {mediaFiles.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
          {mediaFiles.map((_, i) => (
            <span
              key={i}
              className={cn(
                "size-1.5 rounded-full transition-all",
                i === current ? "scale-125 bg-blue-500" : "bg-white/70"
              )}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {mediaFiles.length > 1 && (
        <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
          {current + 1}/{mediaFiles.length}
        </div>
      )}
    </div>
  )
}

export function InstagramPreview({
  content,
  mediaFiles,
  account,
}: InstagramPreviewProps) {
  const username = account?.name || "yourpage"
  const initials = username.slice(0, 2).toUpperCase()

  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-border">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div className="rounded-full bg-linear-to-tr from-amber-400 via-rose-500 to-purple-600 p-0.5">
          <Avatar className="size-7 border-2 border-card">
            {account?.avatarUrl && <AvatarImage src={account.avatarUrl} />}
            <AvatarFallback className="bg-card text-[9px] font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <p className="flex-1 text-[13px] font-semibold">{username}</p>
        <MoreHorizontal className="size-5 text-muted-foreground/50" />
      </div>

      {/* Media */}
      {mediaFiles.length > 1 ? (
        <InstagramCarousel mediaFiles={mediaFiles} />
      ) : mediaFiles.length === 1 ? (
        <div className="aspect-square bg-muted">
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
        <div className="flex aspect-square flex-col items-center justify-center gap-2 bg-muted/50">
          <InstagramIcon className="size-8 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground/50">
            Add an image to preview
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex gap-3.5">
          <Heart className="size-5 text-foreground transition-colors hover:text-red-500" />
          <MessageCircle className="size-5 text-foreground" />
          <Send className="size-5 text-foreground" />
        </div>
        <Bookmark className="size-5 text-foreground" />
      </div>

      {/* Likes */}
      <div className="px-3">
        <p className="text-xs font-semibold">0 likes</p>
      </div>

      {/* Caption */}
      {content && (
        <div className="px-3 pb-3 pt-1">
          <p className="text-[13px] leading-relaxed">
            <span className="mr-1 font-semibold">{username}</span>
            <span className="whitespace-pre-wrap wrap-break-word">
              {content}
            </span>
          </p>
        </div>
      )}

      {!content && <div className="pb-3" />}
    </div>
  )
}
