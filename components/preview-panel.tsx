"use client"

import type { MediaFile, AccountInfo } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send } from "lucide-react"
import { FacebookIcon, InstagramIcon, YouTubeIcon } from "@/components/icons"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FacebookPreview } from "@/components/preview/facebook-preview"
import { InstagramPreview } from "@/components/preview/instagram-preview"
import { YouTubePreview } from "@/components/preview/youtube-preview"

interface PreviewPanelProps {
  content: string
  youtubeTitle?: string
  selectedPlatforms: string[]
  mediaFiles: MediaFile[]
  accounts?: AccountInfo[]
}

export function PreviewPanel({
  content,
  youtubeTitle,
  selectedPlatforms,
  mediaFiles,
  accounts = [],
}: PreviewPanelProps) {
  const defaultTab = selectedPlatforms[0] || "facebook"
  const fbAccount = accounts.find((a) => a.platform === "facebook")
  const igAccount = accounts.find((a) => a.platform === "instagram")
  const ytAccount = accounts.find((a) => a.platform === "youtube")

  if (selectedPlatforms.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-muted/50">
          <Send className="size-6 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Select a platform
        </p>
        <p className="mt-1 max-w-48 text-xs leading-relaxed text-muted-foreground/60">
          Choose where to post to see a live preview
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
        Preview
      </h3>

      <Tabs defaultValue={defaultTab} className="flex flex-1 flex-col">
        <TabsList variant="line" className="mb-4">
          {selectedPlatforms.includes("facebook") && (
            <TabsTrigger value="facebook" className="gap-1.5 text-xs">
              <FacebookIcon className="size-3.5 text-blue-500" />
              Facebook
            </TabsTrigger>
          )}
          {selectedPlatforms.includes("instagram") && (
            <TabsTrigger value="instagram" className="gap-1.5 text-xs">
              <InstagramIcon className="size-3.5 text-pink-500" />
              Instagram
            </TabsTrigger>
          )}
          {selectedPlatforms.includes("youtube") && (
            <TabsTrigger value="youtube" className="gap-1.5 text-xs">
              <YouTubeIcon className="size-3.5 text-red-500" />
              YouTube
            </TabsTrigger>
          )}
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="facebook">
            <FacebookPreview
              content={content}
              mediaFiles={mediaFiles}
              account={fbAccount}
            />
          </TabsContent>
          <TabsContent value="instagram">
            <InstagramPreview
              content={content}
              mediaFiles={mediaFiles}
              account={igAccount}
            />
          </TabsContent>
          <TabsContent value="youtube">
            <YouTubePreview
              content={content}
              youtubeTitle={youtubeTitle}
              mediaFiles={mediaFiles}
              account={ytAccount}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
