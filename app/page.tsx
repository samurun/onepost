"use client"

import { useState, useCallback, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import type { MediaFile, AccountInfo, PostResult, VideoMode, Privacy } from "@/types"
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
  const [content, setContent] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "facebook",
    "instagram",
  ])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [youtubeTitle, setYoutubeTitle] = useState("")
  const [accounts, setAccounts] = useState<AccountInfo[]>([])
  const [draftId, setDraftId] = useState<string | null>(null)
  const [videoMode, setVideoMode] = useState<VideoMode>("reel")
  const [privacy, setPrivacy] = useState<Privacy>("public")
  const [posting, setPosting] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [postResult, setPostResult] = useState<PostResult | null>(null)

  // Fetch connected accounts
  useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then(setAccounts)
      .catch(() => {})
  }, [])

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
            mediaUrls: string | null
            platforms: string
            status: string
          }[]
        ) => {
          const draft = posts.find(
            (p) => p.id === draftParam && p.status === "draft"
          )
          if (draft) {
            setDraftId(draft.id)
            setContent(draft.content)
            setSelectedPlatforms(JSON.parse(draft.platforms))
            setPostResult(null)

            // Restore media from saved URLs
            if (draft.mediaUrls) {
              const urls: string[] = JSON.parse(draft.mediaUrls)
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
      .catch(() => {})
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
            f.id === file.id ? { ...f, uploading: false } : f
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
          content,
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
  }, [content, selectedPlatforms, draftId, mediaFiles])

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
          content,
          platforms: selectedPlatforms,
          mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
          mediaTypes: mediaTypes.length > 0 ? mediaTypes : undefined,
          videoMode,
          youtubeTitle: youtubeTitle || undefined,
          privacy,
        }),
      })

      const data = await res.json()
      setPostResult(data)

      if (data.status === "published") {
        toast.success("Published to all platforms!")
        setContent("")
        setYoutubeTitle("")
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
  }, [content, selectedPlatforms, mediaFiles, videoMode, youtubeTitle, privacy])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex flex-1 overflow-hidden">
        {/* Compose Area */}
        <div className="flex flex-1 flex-col overflow-auto p-6 lg:p-8">
          <div className="mb-6">
            <h1 className="text-lg font-semibold tracking-tight">
              {draftId ? "Edit Draft" : "Create Post"}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Compose once, publish everywhere.
            </p>
          </div>
          <ComposeForm
            content={content}
            onContentChange={setContent}
            youtubeTitle={youtubeTitle}
            onYoutubeTitleChange={setYoutubeTitle}
            selectedPlatforms={selectedPlatforms}
            onPlatformsChange={setSelectedPlatforms}
            mediaFiles={mediaFiles}
            onMediaFilesChange={handleMediaFilesChange}
            videoMode={videoMode}
            onVideoModeChange={setVideoMode}
            privacy={privacy}
            onPrivacyChange={setPrivacy}
            onPost={handlePost}
            onSaveDraft={handleSaveDraft}
            posting={posting}
            savingDraft={savingDraft}
            postResult={postResult}
          />
        </div>

        <div className="hidden w-px bg-border lg:block" />

        {/* Preview Panel */}
        <div className="hidden w-96 shrink-0 overflow-auto bg-muted/20 p-6 lg:block">
          <PreviewPanel
            content={content}
            youtubeTitle={youtubeTitle}
            selectedPlatforms={selectedPlatforms}
            mediaFiles={mediaFiles}
            accounts={accounts}
          />
        </div>
      </main>
    </div>
  )
}
