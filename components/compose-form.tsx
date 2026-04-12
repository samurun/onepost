"use client"

import { useRef } from "react"
import { cn } from "@/lib/utils"
import type { MediaFile, PostResult, VideoMode, Privacy } from "@/types"
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
  Globe,
  EyeOff,
  Link2,
} from "lucide-react"
import {
  PlatformSelector,
  platforms as platformConfigs,
} from "@/components/compose/platform-selector"
import { MediaUpload } from "@/components/compose/media-upload"
import { CharCounter } from "@/components/compose/char-counter"

const INSTAGRAM_MAX = 2200

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
  onPost,
  onSaveDraft,
  posting,
  savingDraft,
  postResult,
}: ComposeFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const charLimits = selectedPlatforms
    .map((p) => platformConfigs.find((pl) => pl.id === p)?.maxChars)
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

      {/* YouTube Title */}
      {selectedPlatforms.includes("youtube") && (
        <div className="mb-3">
          <input
            value={youtubeTitle}
            onChange={(e) => onYoutubeTitleChange(e.target.value)}
            placeholder="YouTube title"
            maxLength={100}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium shadow-sm transition-shadow placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/20"
          />
        </div>
      )}

      {/* Text Area Card */}
      <div className="relative rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-1 focus-within:ring-ring/20">
        <Textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder={
            selectedPlatforms.includes("youtube")
              ? "Description / caption..."
              : "What's on your mind?"
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

      {/* Privacy Selector — show when YouTube is selected */}
      {selectedPlatforms.includes("youtube") && (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 p-1">
          {(
            [
              { value: "public", label: "Public", icon: Globe },
              { value: "unlisted", label: "Unlisted", icon: Link2 },
              { value: "private", label: "Private", icon: EyeOff },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => onPrivacyChange(opt.value)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                privacy === opt.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <opt.icon className="size-3.5" />
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Publishing Progress */}
      {posting && (
        <div className="mt-4 space-y-1.5 rounded-lg border border-border bg-muted/30 p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Publishing...
          </p>
          {selectedPlatforms.map((pId) => {
            const pConfig = platformConfigs.find((p) => p.id === pId)
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
            const pConfig = platformConfigs.find((p) => p.id === platformId)
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
