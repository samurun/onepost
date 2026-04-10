"use client"

import { useRef } from "react"
import { cn } from "@/lib/utils"
import type { MediaFile, PostResult, VideoMode } from "@/types"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  ImagePlus,
  Video,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
  Film,
  Clapperboard,
} from "lucide-react"
import { PlatformSelector, platforms } from "@/components/compose/platform-selector"
import { MediaUpload } from "@/components/compose/media-upload"
import { CharCounter } from "@/components/compose/char-counter"

const INSTAGRAM_MAX = 2200

interface ComposeFormProps {
  content: string
  onContentChange: (content: string) => void
  selectedPlatforms: string[]
  onPlatformsChange: (platforms: string[]) => void
  mediaFiles: MediaFile[]
  onMediaFilesChange: (files: MediaFile[]) => void
  videoMode: VideoMode
  onVideoModeChange: (mode: VideoMode) => void
  onPost?: () => void
  onSaveDraft?: () => void
  posting?: boolean
  savingDraft?: boolean
  postResult?: PostResult | null
}

export function ComposeForm({
  content,
  onContentChange,
  selectedPlatforms,
  onPlatformsChange,
  mediaFiles,
  onMediaFilesChange,
  videoMode,
  onVideoModeChange,
  onPost,
  onSaveDraft,
  posting,
  savingDraft,
  postResult,
}: ComposeFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const charLimits = selectedPlatforms
    .map((p) => platforms.find((pl) => pl.id === p)?.maxChars)
    .filter((v) => v !== undefined)
  const maxChars = charLimits.length ? Math.min(...charLimits) : INSTAGRAM_MAX

  const hasContent = content.trim() || mediaFiles.length > 0
  const isUploading = mediaFiles.some((f) => f.uploading)

  return (
    <div className="flex flex-1 flex-col">
      <PlatformSelector
        selected={selectedPlatforms}
        onChange={onPlatformsChange}
      />

      {/* Text Area Card */}
      <div className="relative rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-1 focus-within:ring-ring/20">
        <Textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="What's on your mind?"
          className="min-h-32 resize-none border-none bg-transparent text-base leading-relaxed shadow-none field-sizing-fixed focus-visible:ring-0"
        />

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => fileInputRef.current?.click()}
              className="gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ImagePlus className="size-3.5" />
              Image
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => fileInputRef.current?.click()}
              className="gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Video className="size-3.5" />
              Video
            </Button>
          </div>
          <CharCounter count={content.length} max={maxChars} />
        </div>
      </div>

      {/* Hidden file input for textarea card buttons */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (!e.target.files) return
          const newFiles: MediaFile[] = Array.from(e.target.files).map(
            (file) => ({
              id: crypto.randomUUID(),
              file,
              preview: URL.createObjectURL(file),
              type: file.type.startsWith("video/") ? "video" : "image",
            })
          )
          onMediaFilesChange([...mediaFiles, ...newFiles])
        }}
      />

      <MediaUpload mediaFiles={mediaFiles} onChange={onMediaFilesChange} />

      {/* Video Mode Toggle */}
      {mediaFiles.some((f) => f.type === "video") && (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 p-1">
          <button
            onClick={() => onVideoModeChange("reel")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              videoMode === "reel"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Clapperboard className="size-3.5" />
            Reel
          </button>
          <button
            onClick={() => onVideoModeChange("video")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              videoMode === "video"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Film className="size-3.5" />
            Video
          </button>
        </div>
      )}

      {/* Post Result */}
      {postResult && (
        <div
          className={cn(
            "mt-4 flex items-center gap-2.5 rounded-lg border p-3 text-sm",
            postResult.status === "published"
              ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
              : postResult.status === "partial"
                ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                : "border-destructive/30 bg-destructive/10 text-destructive"
          )}
        >
          {postResult.status === "published" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          <span className="font-medium">
            {postResult.status === "published"
              ? "Published successfully to all platforms!"
              : postResult.status === "partial"
                ? "Some platforms failed. Check your connections."
                : "Failed to post. Please try again."}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-auto flex items-center gap-2 pt-6">
        <Button
          size="lg"
          className="flex-1 gap-2 shadow-sm"
          disabled={!hasContent || posting || isUploading || selectedPlatforms.length === 0}
          onClick={onPost}
        >
          {posting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {posting ? "Publishing..." : "Publish Now"}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="gap-2"
          disabled={!hasContent || posting || savingDraft || isUploading}
          onClick={onSaveDraft}
        >
          {savingDraft ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {savingDraft ? "Saving..." : "Draft"}
        </Button>
      </div>
    </div>
  )
}
