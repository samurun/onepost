"use client"

import { useState, useCallback, useEffect } from "react"
import type { MediaFile, AccountInfo, PostResult } from "@/types"
import { Sidebar } from "@/components/sidebar"
import { ComposeForm } from "@/components/compose-form"
import { PreviewPanel } from "@/components/preview-panel"
import { toast } from "sonner"

export default function Page() {
  const [content, setContent] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "facebook",
    "instagram",
  ])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [accounts, setAccounts] = useState<AccountInfo[]>([])
  const [draftId, setDraftId] = useState<string | null>(null)
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
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get("draft")
    if (!id) return

    fetch("/api/posts")
      .then((res) => res.json())
      .then(
        (
          posts: {
            id: string
            content: string
            platforms: string
            status: string
          }[]
        ) => {
          const draft = posts.find((p) => p.id === id && p.status === "draft")
          if (draft) {
            setDraftId(draft.id)
            setContent(draft.content)
            setSelectedPlatforms(JSON.parse(draft.platforms))
            setPostResult(null)
          }
        }
      )
      .catch(() => {})
  }, [])

  const handleSaveDraft = useCallback(async () => {
    setSavingDraft(true)
    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draftId || undefined,
          content,
          platforms: selectedPlatforms,
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
  }, [content, selectedPlatforms, draftId])

  const handlePost = useCallback(async () => {
    setPosting(true)
    setPostResult(null)

    try {
      // Upload media files
      const mediaUrls: string[] = []
      for (const file of mediaFiles) {
        const formData = new FormData()
        formData.append("file", file.file)
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        if (uploadRes.ok) {
          const { url } = await uploadRes.json()
          mediaUrls.push(url)
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
        }),
      })

      const data = await res.json()
      setPostResult(data)

      if (data.status === "published") {
        toast.success("Published to all platforms!")
        setContent("")
        setMediaFiles([])
        setDraftId(null)
      } else if (data.status === "partial") {
        toast.warning("Some platforms failed")
      } else {
        toast.error("Failed to publish")
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
  }, [content, selectedPlatforms, mediaFiles])

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
            selectedPlatforms={selectedPlatforms}
            onPlatformsChange={setSelectedPlatforms}
            mediaFiles={mediaFiles}
            onMediaFilesChange={setMediaFiles}
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
            selectedPlatforms={selectedPlatforms}
            mediaFiles={mediaFiles}
            accounts={accounts}
          />
        </div>
      </main>
    </div>
  )
}
