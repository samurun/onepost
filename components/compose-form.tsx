"use client"

import { useRef } from "react"
import { cn } from "@/lib/utils"
import type {
  MediaFile,
  PostResult,
  VideoMode,
  Privacy,
  TikTokPrivacy,
} from "@/types"
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
import { PlatformSelector } from "@/components/compose/platform-selector"
import { PLATFORMS, PLATFORM_CHAR_LIMITS } from "@/lib/platforms"
import { MediaUpload } from "@/components/compose/media-upload"
import { CharCounter } from "@/components/compose/char-counter"
import { PlatformSettings } from "@/components/compose/platform-settings"

interface ComposeFormProps {
  content: string
  onContentChange: (content: string) => void
  youtubeTitle: string
  onYoutubeTitleChange: (title: string) => void
  selectedPlatforms: string[]
  onPlatformsChange: (platforms: string[]) => void
  mediaFiles: MediaFile[]
  onMediaFilesChange: (files: MediaFile[]) => void
  videoMode: VideoMode
  onVideoModeChange: (mode: VideoMode) => void
  privacy: Privacy
  onPrivacyChange: (privacy: Privacy) => void
  tiktokPrivacy: TikTokPrivacy
  onTikTokPrivacyChange: (privacy: TikTokPrivacy) => void
  onPost?: () => void
  onSaveDraft?: () => void
  posting?: boolean
  savingDraft?: boolean
  postResult?: PostResult | null
}

export function ComposeForm({
  content,
  onContentChange,
  youtubeTitle,
  onYoutubeTitleChange,
  selectedPlatforms,
  onPlatformsChange,
  mediaFiles,
  onMediaFilesChange,
  videoMode,
  onVideoModeChange,
  privacy,
  onPrivacyChange,
  tiktokPrivacy,
  onTikTokPrivacyChange,
  onPost,
  onSaveDraft,
  posting,
  savingDraft,
  postResult,
}: ComposeFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const charLimits = selectedPlatforms
    .map((p) => PLATFORMS.find((pl) => pl.id === p)?.maxChars)
    .filter((v) => v !== undefined)
  const maxChars = charLimits.length
    ? Math.min(...charLimits)
    : PLATFORM_CHAR_LIMITS.instagram

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
          aria-label="Post content"
          placeholder={
            selectedPlatforms.includes("youtube")
              ? "Description / caption\u2026"
              : "What\u2019s on your mind?"
          }
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
        <div
          className="mt-3 flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 p-1"
          role="radiogroup"
          aria-label="Video mode"
        >
          <button
            type="button"
            role="radio"
            aria-checked={videoMode === "reel"}
            onClick={() => onVideoModeChange("reel")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              videoMode === "reel"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Clapperboard className="size-3.5" />
            Reel
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={videoMode === "video"}
            onClick={() => onVideoModeChange("video")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
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

      {/* Platform Settings (YouTube title/privacy, TikTok privacy) */}
      <PlatformSettings
        selectedPlatforms={selectedPlatforms}
        youtubeTitle={youtubeTitle}
        onYoutubeTitleChange={onYoutubeTitleChange}
        privacy={privacy}
        onPrivacyChange={onPrivacyChange}
        tiktokPrivacy={tiktokPrivacy}
        onTikTokPrivacyChange={onTikTokPrivacyChange}
      />

      {/* Publishing Progress */}
      {posting && (
        <div className="mt-4 space-y-1.5 rounded-lg border border-border bg-muted/30 p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Publishing\u2026
          </p>
          {selectedPlatforms.map((pId) => {
            const pConfig = PLATFORMS.find((p) => p.id === pId)
            if (!pConfig) return null
            return (
              <div
                key={pId}
                className="flex items-center gap-2.5 text-sm"
              >
                <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                <pConfig.icon className={cn("size-3.5", pConfig.color)} />
                <span className="text-muted-foreground">
                  {pConfig.label}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Post Result — per platform */}
      {!posting && postResult && (
        <div className="mt-4 space-y-1.5 rounded-lg border border-border bg-muted/30 p-3">
          {Object.entries(postResult.results).map(([key, result]) => {
            const platformId = key.split("_")[0]
            const pConfig = PLATFORMS.find((p) => p.id === platformId)
            return (
              <div key={key} className="flex items-center gap-2.5 text-sm">
                {result.success ? (
                  <CheckCircle2 className="size-3.5 text-green-500" />
                ) : (
                  <AlertCircle className="size-3.5 text-destructive" />
                )}
                {pConfig && (
                  <pConfig.icon className={cn("size-3.5", pConfig.color)} />
                )}
                <span
                  className={
                    result.success
                      ? "text-foreground"
                      : "text-destructive"
                  }
                >
                  {pConfig?.label || platformId}
                </span>
                {result.error && (
                  <span className="truncate text-xs text-muted-foreground">
                    — {result.error}
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
          className="flex-1 gap-2 shadow-sm"
          disabled={!hasContent || posting || isUploading || selectedPlatforms.length === 0}
          onClick={onPost}
        >
          {posting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          {posting ? "Publishing\u2026" : "Publish Now"}
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
