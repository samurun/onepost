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
import { Heart, MessageCircle, Bookmark, Share2, Music } from "lucide-react"
import { TikTokIcon } from "@/components/icons"

interface TikTokPreviewProps {
  content: string
  mediaFiles: MediaFile[]
  account?: AccountInfo
}

function TikTokCarousel({ mediaFiles }: { mediaFiles: MediaFile[] }) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) return
    api.on("select", () => setCurrent(api.selectedScrollSnap()))
  }, [api])

  return (
    <div className="relative size-full">
      <Carousel setApi={setApi} className="size-full">
        <CarouselContent className="ml-0 h-full">
          {mediaFiles.map((file) => (
            <CarouselItem key={file.id} className="h-full pl-0">
              <div className="flex size-full items-center justify-center">
                {file.type === "video" ? (
                  <video
                    src={file.preview}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <img
                    src={file.preview}
                    alt=""
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 size-6 -translate-y-1/2 border-none bg-white/20 text-white shadow-sm backdrop-blur-sm hover:bg-white/40" />
        <CarouselNext className="absolute right-2 top-1/2 size-6 -translate-y-1/2 border-none bg-white/20 text-white shadow-sm backdrop-blur-sm hover:bg-white/40" />
      </Carousel>

      {/* Dots */}
      {mediaFiles.length > 1 && (
        <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 gap-1">
          {mediaFiles.map((_, i) => (
            <span
              key={i}
              className={cn(
                "size-1.5 rounded-full transition-colors",
                i === current ? "scale-125 bg-white" : "bg-white/50"
              )}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {mediaFiles.length > 1 && (
        <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          {current + 1}/{mediaFiles.length}
        </div>
      )}
    </div>
  )
}

export function TikTokPreview({
  content,
  mediaFiles,
  account,
}: TikTokPreviewProps) {
  const username = account?.name || "yourname"
  const initials = username.slice(0, 2).toUpperCase()

  return (
    <div className="overflow-hidden shadow-sm">
      <div className="relative aspect-9/16 w-full border bg-black">
        {mediaFiles.length > 1 ? (
          <TikTokCarousel mediaFiles={mediaFiles} />
        ) : mediaFiles.length === 1 ? (
          <div className="flex size-full items-center justify-center">
            {mediaFiles[0].type === "video" ? (
              <video
                src={mediaFiles[0].preview}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <img
                src={mediaFiles[0].preview}
                alt=""
                className="max-h-full max-w-full object-contain"
              />
            )}
          </div>
        ) : (
          <div className="flex size-full items-center justify-center">
            <div className="text-center text-white/40">
              <TikTokIcon className="mx-auto mb-2 size-8" />
              <p className="text-xs">Upload media to preview</p>
            </div>
          </div>
        )}

        {/* Right sidebar icons */}
        <div className="absolute bottom-16 right-3 flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <div className="flex size-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <Heart className="size-5 text-white" />
            </div>
            <span className="text-[10px] font-medium text-white">0</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex size-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <MessageCircle className="size-5 text-white" />
            </div>
            <span className="text-[10px] font-medium text-white">0</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex size-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <Bookmark className="size-5 text-white" />
            </div>
            <span className="text-[10px] font-medium text-white">0</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex size-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
              <Share2 className="size-5 text-white" />
            </div>
            <span className="text-[10px] font-medium text-white">0</span>
          </div>
        </div>

        {/* Bottom overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-12">
          <div className="mb-2 flex items-center gap-2">
            <Avatar className="size-8 border-2 border-white">
              {account?.avatarUrl && <AvatarImage src={account.avatarUrl} />}
              <AvatarFallback className="bg-foreground/20 text-[9px] font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold text-white">
              @{username}
            </span>
          </div>

          {content && (
            <p className="line-clamp-3 text-xs leading-relaxed text-white/90">
              {content}
            </p>
          )}

          <div className="mt-2 flex items-center gap-1.5">
            <Music className="size-3 text-white/60" aria-hidden="true" />
            <span className="text-[10px] text-white/60">Original sound</span>
          </div>
        </div>
      </div>
    </div>
  )
}
