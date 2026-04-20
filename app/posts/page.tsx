"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Badge } from "@/components/ui/badge"
import {
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  TikTokIcon,
} from "@/components/icons"
import { isVideoUrl, timeAgo } from "@/lib/utils"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  FileText,
  Clock,
  Image as ImageIcon,
  PenSquare,
  Trash2,
} from "lucide-react"

interface Post {
  id: string
  content: string
  mediaUrls: string[] | null
  platforms: string[]
  status: string
  publishedAt: string | null
  createdAt: string
  results: Record<string, { success: boolean; error?: string }> | null
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "published":
      return (
        <Badge className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="size-3" />
          Published
        </Badge>
      )
    case "failed":
      return (
        <Badge className="gap-1 border-destructive/20 bg-destructive/10 text-destructive">
          <XCircle className="size-3" />
          Failed
        </Badge>
      )
    case "scheduled":
      return (
        <Badge className="gap-1 border-accent/30 bg-accent/10 text-accent">
          <Clock className="size-3" />
          Scheduled
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="gap-1">
          <AlertTriangle className="size-3" />
          Draft
        </Badge>
      )
  }
}

function PlatformIcons({ platforms }: { platforms: string[] }) {
  return (
    <div className="flex gap-1.5">
      {platforms.includes("facebook") && (
        <div className="flex size-5 items-center justify-center rounded bg-blue-500/10">
          <FacebookIcon className="size-3 text-blue-500" />
        </div>
      )}
      {platforms.includes("instagram") && (
        <div className="flex size-5 items-center justify-center rounded bg-pink-500/10">
          <InstagramIcon className="size-3 text-pink-500" />
        </div>
      )}
      {platforms.includes("youtube") && (
        <div className="flex size-5 items-center justify-center rounded bg-red-500/10">
          <YouTubeIcon className="size-3 text-red-500" />
        </div>
      )}
      {platforms.includes("tiktok") && (
        <div className="flex size-5 items-center justify-center rounded bg-foreground/10">
          <TikTokIcon className="size-3" />
        </div>
      )}
    </div>
  )
}

export default function PostsPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function deletePost(id: string) {
    setDeleting(id)
    try {
      await fetch("/api/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } catch {
      toast.error("Failed to delete post")
    } finally {
      setDeleting(null)
    }
  }

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then(setPosts)
      .catch(() => toast.error("Failed to load posts"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex flex-1 flex-col overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-[22px] font-ui-strong tracking-tight text-foreground">
            Posts
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground/80">
            Your posting history across all platforms.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
            <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-white/4">
              <FileText className="size-4 text-muted-foreground/50" aria-hidden="true" />
            </div>
            <p className="text-sm font-ui text-foreground">No posts yet</p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Go to Compose to create your first post
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {posts.map((post) => {
              const platforms = post.platforms ?? []
              const mediaUrls = post.mediaUrls ?? []

              return (
                <div
                  key={post.id}
                  className="flex items-start gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-white/4"
                >
                  {/* Media thumbnail */}
                  {mediaUrls.length > 0 ? (
                    <div className="size-12 shrink-0 overflow-hidden rounded-md border border-border">
                      {isVideoUrl(mediaUrls[0]) ? (
                        <video
                          src={mediaUrls[0]}
                          muted
                          className="size-full object-cover"
                        />
                      ) : (
                        <img
                          src={mediaUrls[0]}
                          alt=""
                          className="size-full object-cover"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-md border border-border bg-white/2">
                      <FileText className="size-4 text-muted-foreground/50" aria-hidden="true" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[13px] leading-relaxed text-foreground">
                      {post.content || (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <ImageIcon className="size-3.5" aria-hidden="true" />
                          Media only
                        </span>
                      )}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <PlatformIcons platforms={platforms} />
                      <span className="text-xs text-muted-foreground/70">
                        {timeAgo(post.publishedAt || post.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Status + Actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    <StatusBadge status={post.status} />
                    {post.status === "draft" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-foreground"
                        onClick={() => router.push(`/?draft=${post.id}`)}
                      >
                        <PenSquare className="size-3.5" />
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          disabled={deleting === post.id}
                        >
                          {deleting === post.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete post?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete this post.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deletePost(post.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
