"use client"

import { useState, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import type { MediaFile } from "@/types"
import { ImagePlus, X, Upload, Loader2 } from "lucide-react"

interface MediaUploadProps {
  mediaFiles: MediaFile[]
  onChange: (files: MediaFile[]) => void
}

export function MediaUpload({ mediaFiles, onChange }: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (files: FileList) => {
      const newFiles: MediaFile[] = Array.from(files).map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith("video/") ? "video" : "image",
      }))
      onChange([...mediaFiles, ...newFiles])
    },
    [mediaFiles, onChange]
  )

  const removeMedia = (id: string) => {
    const file = mediaFiles.find((f) => f.id === id)
    if (file) URL.revokeObjectURL(file.preview)
    onChange(mediaFiles.filter((f) => f.id !== id))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {mediaFiles.length === 0 ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "mt-4 flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed px-4 py-5 transition-all",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/15 hover:border-muted-foreground/30 hover:bg-muted/30"
          )}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Upload className="size-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Add media</p>
            <p className="text-xs text-muted-foreground">
              Drag & drop or click — JPG, PNG, MP4
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <div className="grid grid-cols-4 gap-2">
            {mediaFiles.map((file) => (
              <div
                key={file.id}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border shadow-sm"
              >
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
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                <button
                  onClick={() => removeMedia(file.id)}
                  className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="size-3" />
                </button>
                {file.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="size-5 animate-spin text-white" />
                  </div>
                )}
                {file.type === "video" && (
                  <div className="absolute bottom-1 left-1 rounded-sm bg-black/70 px-1 py-0.5 text-[9px] font-medium uppercase tracking-wider text-white">
                    Video
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/15 transition-colors hover:border-muted-foreground/30 hover:bg-muted/30"
            >
              <ImagePlus className="size-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
