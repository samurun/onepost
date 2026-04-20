"use client"

import { useRef } from "react"
import { cn } from "@/lib/utils"
import type { MediaFile, PostResult } from "@/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  ImagePlus,
  Video,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
} from "lucide-react"
import {
  ACTIVE_PLATFORMS,
  PLATFORMS,
  PLATFORM_CHAR_LIMITS,
} from "@/lib/platforms"
import { MediaUpload } from "@/components/compose/media-upload"
import { PlatformSelector } from "@/components/compose/platform-selector"
import { CharCounter } from "@/components/compose/char-counter"

interface ComposeFormProps {
  metaCaption: string
  onMetaCaptionChange: (value: string) => void
  selectedPlatforms: string[]
  onPlatformsChange: (platforms: string[]) => void
  mediaFiles: MediaFile[]
  onMediaFilesChange: (files: MediaFile[]) => void
  onPost?: () => void
  onSaveDraft?: () => void
  posting?: boolean
  savingDraft?: boolean
  postResult?: PostResult | null
}

export function ComposeForm({
  metaCaption,
  onMetaCaptionChange,
  selectedPlatforms,
  onPlatformsChange,
  mediaFiles,
  onMediaFilesChange,
  onPost,
  onSaveDraft,
  posting,
  savingDraft,
  postResult,
}: ComposeFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Char limit is the tightest of the active, selected platforms.
  const activeSelected = selectedPlatforms.filter((p) =>
    ACTIVE_PLATFORMS.includes(p as (typeof ACTIVE_PLATFORMS)[number])
  )
  const charLimits: number[] = activeSelected
    .map((p) => PLATFORMS.find((pl) => pl.id === p)?.maxChars)
    .filter((v) => typeof v === "number") as number[]
  const maxChars = charLimits.length
    ? Math.min(...charLimits)
    : PLATFORM_CHAR_LIMITS.instagram

  const hasContent = metaCaption.trim() || mediaFiles.length > 0
  const isUploading = mediaFiles.some((f) => f.uploading)

  return (
    <div className="flex flex-1 flex-col">
      {/* Shared media upload */}
      <div className="mb-5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-ui uppercase tracking-widest text-muted-foreground/60">
            Media
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => fileInputRef.current?.click()}
              className="gap-1 text-xs text-muted-foreground"
            >
              <ImagePlus className="size-3.5" aria-hidden="true" />
              Image
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => fileInputRef.current?.click()}
              className="gap-1 text-xs text-muted-foreground"
            >
              <Video className="size-3.5" aria-hidden="true" />
              Video
            </Button>
          </div>
        </div>

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
      </div>

      {/* Platform selector */}
      <PlatformSelector
        selected={selectedPlatforms}
        onChange={onPlatformsChange}
      />

      {/* Caption card */}
      <div className="relative rounded-lg border border-border bg-white/2 px-4 py-3 transition-colors focus-within:border-ring/50">
        <Textarea
          value={metaCaption}
          onChange={(e) => onMetaCaptionChange(e.target.value)}
          aria-label="Caption"
          placeholder="What's on your mind?"
          className="field-sizing-fixed min-h-32 resize-none border-none bg-transparent p-0 text-[15px] leading-relaxed text-foreground shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center justify-end pt-1">
          <CharCounter count={metaCaption.length} max={maxChars} />
        </div>
      </div>

      {/* Publishing Progress */}
      {posting && (
        <div className="mt-4 space-y-1.5 rounded-lg border border-border bg-card px-3 py-2.5">
          <p className="mb-1.5 text-[10px] font-ui uppercase tracking-widest text-muted-foreground/60">
            Publishing\u2026
          </p>
          {selectedPlatforms.map((pId) => {
            const pConfig = PLATFORMS.find((p) => p.id === pId)
            if (!pConfig) return null
            return (
              <div
                key={pId}
                className="flex items-center gap-2.5 text-[13px]"
              >
                <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                <pConfig.icon className={cn("size-3.5", pConfig.color)} />
                <span className="text-muted-foreground">{pConfig.label}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Post Result — per platform */}
      {!posting && postResult && (
        <div className="mt-4 space-y-1.5 rounded-lg border border-border bg-card px-3 py-2.5">
          {Object.entries(postResult.results).map(([key, result]) => {
            const platformId = key.split("_")[0]
            const pConfig = PLATFORMS.find((p) => p.id === platformId)
            return (
              <div
                key={key}
                className="flex items-center gap-2.5 text-[13px]"
              >
                {result.success ? (
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                ) : (
                  <AlertCircle className="size-3.5 text-destructive" />
                )}
                {pConfig && (
                  <pConfig.icon className={cn("size-3.5", pConfig.color)} />
                )}
                <span
                  className={cn(
                    "font-ui",
                    result.success
                      ? "text-foreground"
                      : "text-destructive"
                  )}
                >
                  {pConfig?.label || platformId}
                </span>
                {result.error && (
                  <span className="truncate text-xs text-muted-foreground">
                    \u2014 {result.error}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-auto flex items-center gap-2 pt-6">
        <Button
          size="lg"
          className="flex-1 gap-2"
          disabled={
            !hasContent ||
            posting ||
            isUploading ||
            selectedPlatforms.length === 0
          }
          onClick={onPost}
        >
          {posting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {posting ? "Publishing\u2026" : "Publish now"}
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
          {savingDraft ? "Saving\u2026" : "Draft"}
        </Button>
      </div>
    </div>
  )
}
