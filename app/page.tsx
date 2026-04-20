"use client"

import { useState, useCallback, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import type { MediaFile, PostResult } from "@/types"
import { useAccounts } from "@/hooks/use-accounts"
import { isVideoUrl } from "@/lib/utils"
import { Sidebar } from "@/components/sidebar"
import { ComposeForm } from "@/components/compose-form"
import { PreviewPanel } from "@/components/preview-panel"
import { toast } from "sonner"

export default function Page() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  )
}

function PageContent() {
  const searchParams = useSearchParams()
  const [metaCaption, setMetaCaption] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "facebook",
    "instagram",
  ])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const { accounts } = useAccounts()
  const [draftId, setDraftId] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [postResult, setPostResult] = useState<PostResult | null>(null)

  // Load draft from URL ?draft=id
  const draftParam = searchParams.get("draft")
  useEffect(() => {
    if (!draftParam) return

    fetch("/api/posts")
      .then((res) => res.json())
      .then(
        (
          posts: {
            id: string
            content: string
            mediaUrls: string[] | null
            platforms: string[]
            status: string
          }[]
        ) => {
          const draft = posts.find(
            (p) => p.id === draftParam && p.status === "draft"
          )
          if (draft) {
            setDraftId(draft.id)
            setMetaCaption(draft.content)
            setSelectedPlatforms(
              draft.platforms.filter(
                (p) => p === "facebook" || p === "instagram"
              )
            )
            setPostResult(null)

            // Restore media from saved URLs
            if (draft.mediaUrls) {
              const urls = draft.mediaUrls as string[]
              const restored: MediaFile[] = urls.map((url) => ({
                id: crypto.randomUUID(),
                preview: url,
                type: isVideoUrl(url)
                  ? ("video" as const)
                  : ("image" as const),
                uploadedUrl: url,
              }))
              setMediaFiles(restored)
            }
          }
        }
      )
      .catch(() => toast.error("Failed to load draft"))
  }, [draftParam])

  // Upload new media files directly to Cloudinary on select
  const handleMediaFilesChange = useCallback((files: MediaFile[]) => {
    setMediaFiles(files)

    files.forEach(async (file) => {
      if (file.uploadedUrl || file.uploading || !file.file) return

      setMediaFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, uploading: true } : f))
      )

      try {
        // Get signed params from our API
        const signRes = await fetch("/api/upload", { method: "POST" })
        if (!signRes.ok) throw new Error("Failed to get upload signature")
        const { signature, timestamp, folder, apiKey, cloudName } =
          await signRes.json()

        // Upload directly to Cloudinary
        const formData = new FormData()
        formData.append("file", file.file!)
        formData.append("signature", signature)
        formData.append("timestamp", String(timestamp))
        formData.append("folder", folder)
        formData.append("api_key", apiKey)
        formData.append("resource_type", "auto")

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
          { method: "POST", body: formData }
        )

        if (uploadRes.ok) {
          const { secure_url } = await uploadRes.json()
          setMediaFiles((prev) =>
            prev.map((f) =>
              f.id === file.id
                ? { ...f, uploadedUrl: secure_url, uploading: false }
                : f
            )
          )
        } else {
          throw new Error("Upload failed")
        }
      } catch {
        setMediaFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, uploading: false, error: "Upload failed" }
              : f
          )
        )
        toast.error("Failed to upload media")
      }
    })
  }, [])

  const handleSaveDraft = useCallback(async () => {
    setSavingDraft(true)
    try {
      const uploadedUrls = mediaFiles
        .filter((f) => f.uploadedUrl)
        .map((f) => f.uploadedUrl)

      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draftId || undefined,
          content: metaCaption,
          platforms: selectedPlatforms,
          mediaUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
        }),
      })
      const data = await res.json()
      setDraftId(data.id)
      toast.success("Draft saved!")
    } catch {
      toast.error("Failed to save draft")
    } finally {
      setSavingDraft(false)
    }
  }, [metaCaption, selectedPlatforms, draftId, mediaFiles])

  const handlePost = useCallback(async () => {
    setPosting(true)
    setPostResult(null)

    try {
      // Collect pre-uploaded media URLs
      const mediaUrls: string[] = []
      const mediaTypes: ("image" | "video")[] = []
      for (const file of mediaFiles) {
        if (file.uploadedUrl) {
          mediaUrls.push(file.uploadedUrl)
          mediaTypes.push(file.type)
        }
      }

      // Post to platforms
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: metaCaption,
          platforms: selectedPlatforms,
          mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
          mediaTypes: mediaTypes.length > 0 ? mediaTypes : undefined,
        }),
      })

      const data = await res.json()
      setPostResult(data)

      if (data.status === "published") {
        toast.success("Published to all platforms!")
        setMetaCaption("")
        setMediaFiles([])
        setDraftId(null)
      } else {
        // Toast each failed platform with its error
        const results = data.results as Record<
          string,
          { success: boolean; error?: string }
        >
        for (const [key, result] of Object.entries(results)) {
          if (!result.success) {
            const platform = key.split("_")[0]
            const name =
              platform.charAt(0).toUpperCase() + platform.slice(1)
            toast.error(`${name}: ${result.error || "Failed"}`)
          }
        }
      }
    } catch {
      setPostResult({
        status: "failed",
        results: { error: { success: false, error: "Network error" } },
      })
      toast.error("Network error. Please try again.")
    } finally {
      setPosting(false)
    }
  }, [metaCaption, selectedPlatforms, mediaFiles])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex flex-1 flex-col overflow-auto lg:flex-row lg:overflow-hidden">
        {/* Compose Area */}
        <div className="flex flex-1 flex-col p-4 sm:p-6 lg:overflow-auto lg:p-8">
          <div className="mb-6">
            <h1 className="text-[22px] font-ui-strong tracking-tight text-foreground">
              {draftId ? "Edit draft" : "Create post"}
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground/80">
              Compose once, publish everywhere.
            </p>
          </div>
          <ComposeForm
            metaCaption={metaCaption}
            onMetaCaptionChange={setMetaCaption}
            selectedPlatforms={selectedPlatforms}
            onPlatformsChange={setSelectedPlatforms}
            mediaFiles={mediaFiles}
            onMediaFilesChange={handleMediaFilesChange}
            onPost={handlePost}
            onSaveDraft={handleSaveDraft}
            posting={posting}
            savingDraft={savingDraft}
            postResult={postResult}
          />
        </div>

        <div className="hidden w-px bg-border lg:block" />

        {/* Preview Panel — below on mobile, side on lg+ */}
        <div className="border-t border-border bg-sidebar p-4 sm:p-6 lg:w-96 lg:shrink-0 lg:overflow-auto lg:border-t-0">
          <PreviewPanel
            metaCaption={metaCaption}
            selectedPlatforms={selectedPlatforms}
            mediaFiles={mediaFiles}
            accounts={accounts}
          />
        </div>
      </main>
    </div>
  )
}
