"use client"

import { useState } from "react"
import type { MediaFile, AccountInfo } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send } from "lucide-react"
import { FacebookIcon, InstagramIcon } from "@/components/icons"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FacebookPreview } from "@/components/preview/facebook-preview"
import { InstagramPreview } from "@/components/preview/instagram-preview"

interface PreviewPanelProps {
  metaCaption: string
  selectedPlatforms: string[]
  mediaFiles: MediaFile[]
  accounts?: AccountInfo[]
}

export function PreviewPanel({
  metaCaption,
  selectedPlatforms,
  mediaFiles,
  accounts = [],
}: PreviewPanelProps) {
  const defaultTab = selectedPlatforms[0] || "facebook"
  const [activeTab, setActiveTab] = useState(defaultTab)
  const fbAccount = accounts.find((a) => a.platform === "facebook")
  const igAccount = accounts.find((a) => a.platform === "instagram")

  if (selectedPlatforms.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-white/4">
          <Send className="size-5 text-muted-foreground/50" aria-hidden="true" />
        </div>
        <p className="text-sm font-ui text-foreground">Select a platform</p>
        <p className="mt-1 max-w-48 text-xs leading-relaxed text-muted-foreground/60">
          Choose where to post to see a live preview
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-3 text-[10px] font-ui uppercase tracking-widest text-muted-foreground/60">
        Preview
      </h3>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-1 flex-col"
      >
        <TabsList variant="line" className="mb-4 flex-wrap">
          {selectedPlatforms.includes("facebook") && (
            <TabsTrigger value="facebook" className="gap-1.5 text-xs font-ui">
              <FacebookIcon className="size-3.5 text-blue-500" />
              Facebook
            </TabsTrigger>
          )}
          {selectedPlatforms.includes("instagram") && (
            <TabsTrigger value="instagram" className="gap-1.5 text-xs font-ui">
              <InstagramIcon className="size-3.5 text-pink-500" />
              Instagram
            </TabsTrigger>
          )}
        </TabsList>

        <ScrollArea className="flex-1">
          {activeTab === "facebook" && (
            <TabsContent value="facebook">
              <FacebookPreview
                content={metaCaption}
                mediaFiles={mediaFiles}
                account={fbAccount}
              />
            </TabsContent>
          )}
          {activeTab === "instagram" && (
            <TabsContent value="instagram">
              <InstagramPreview
                content={metaCaption}
                mediaFiles={mediaFiles}
                account={igAccount}
              />
            </TabsContent>
          )}
        </ScrollArea>
      </Tabs>
    </div>
  )
}
