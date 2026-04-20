"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  TikTokIcon,
} from "@/components/icons"
import {
  ExternalLink,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Unplug,
} from "lucide-react"
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

interface Account {
  id: string
  platform: string
  name: string
  platformId: string
  avatarUrl: string | null
  tokenExpiry: string | null
  createdAt: string
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null
  const success = searchParams?.get("success")
  const error = searchParams?.get("error")

  useEffect(() => {
    fetchAccounts()
  }, [])

  async function fetchAccounts() {
    try {
      const res = await fetch("/api/accounts")
      const data = await res.json()
      setAccounts(data)
    } catch {
      toast.error("Failed to load accounts")
    } finally {
      setLoading(false)
    }
  }

  async function disconnectAccount(id: string, name: string) {
    setDeleting(id)
    try {
      await fetch("/api/accounts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      setAccounts((prev) => prev.filter((a) => a.id !== id))
      toast.success(`Disconnected ${name}`)
    } catch {
      toast.error("Failed to disconnect account")
    } finally {
      setDeleting(null)
    }
  }

  const fbAccounts = accounts.filter((a) => a.platform === "facebook")
  const igAccounts = accounts.filter((a) => a.platform === "instagram")
  const hasConnected = fbAccounts.length > 0 || igAccounts.length > 0

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex flex-1 flex-col overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-[22px] font-ui-strong tracking-tight text-foreground">
            Accounts
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground/80">
            Connect your social media accounts to start posting.
          </p>
        </div>

        {/* Status Messages */}
        {success && (
          <div className="mb-4 flex items-center gap-2.5 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-[13px] font-ui text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0" />
            Account connected successfully!
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center gap-2.5 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-[13px] font-ui text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {error === "no_pages"
              ? "No Facebook Pages found. Create a Page first."
              : error === "auth_denied"
                ? "Authorization was denied."
                : "Something went wrong. Please try again."}
          </div>
        )}

        {/* Connect Buttons */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-colors hover:bg-white/2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
                  <FacebookIcon className="size-4 text-blue-500" />
                </div>
                Facebook
              </CardTitle>
              <CardDescription>
                Post to your Facebook Page directly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="gap-2" variant="outline">
                <a href="/api/auth/facebook">
                  {fbAccounts.length > 0 ? "Add Another Page" : "Connect"}
                  <ExternalLink className="size-3" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-colors hover:bg-white/2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-pink-500/10">
                  <InstagramIcon className="size-4 text-pink-500" />
                </div>
                Instagram
              </CardTitle>
              <CardDescription>
                Requires a Business or Creator account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="gap-2" variant="outline">
                <a href="/api/auth/instagram">
                  {igAccounts.length > 0 ? "Reconnect" : "Connect"}
                  <ExternalLink className="size-3" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-red-500/10">
                  <YouTubeIcon className="size-4 text-red-500" />
                </div>
                YouTube
                <span className="ml-auto rounded-full border border-border bg-white/4 px-2 py-0.5 text-[10px] font-ui tracking-wider text-muted-foreground uppercase">
                  Soon
                </span>
              </CardTitle>
              <CardDescription>
                Upload videos to your YouTube channel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled variant="outline">
                Coming soon
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-foreground/10">
                  <TikTokIcon className="size-4" />
                </div>
                TikTok
                <span className="ml-auto rounded-full border border-border bg-white/4 px-2 py-0.5 text-[10px] font-ui tracking-wider text-muted-foreground uppercase">
                  Soon
                </span>
              </CardTitle>
              <CardDescription>
                Post videos to your TikTok account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled variant="outline">
                <TikTokIcon className="size-4" />
                Coming soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Connected Accounts */}
        <div>
          <h2 className="mb-4 text-[10px] font-ui tracking-widest text-muted-foreground/60 uppercase">
            Connected accounts
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : !hasConnected ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
              <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-white/4">
                <Unplug className="size-4 text-muted-foreground/50" aria-hidden="true" />
              </div>
              <p className="text-sm font-ui text-foreground">
                No accounts connected yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Connect a platform above to get started
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Facebook Pages */}
              {fbAccounts.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-[13px] font-ui text-foreground">
                    <FacebookIcon className="size-3.5 text-blue-500" />
                    Facebook Pages
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {fbAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-white/4"
                      >
                        <Avatar className="size-10 ring-1 ring-border">
                          <AvatarImage src={account.avatarUrl || undefined} />
                          <AvatarFallback className="bg-blue-500/10 text-sm font-semibold text-blue-500">
                            {account.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-ui text-foreground">
                            {account.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Page · Active
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                              disabled={deleting === account.id}
                            >
                              {deleting === account.id ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="size-3.5" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Disconnect {account.name}?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the account connection. You can
                                reconnect it later.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  disconnectAccount(account.id, account.name)
                                }
                              >
                                Disconnect
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instagram Accounts */}
              {igAccounts.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-[13px] font-ui text-foreground">
                    <InstagramIcon className="size-3.5 text-pink-500" />
                    Instagram
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {igAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-white/4"
                      >
                        <Avatar className="size-10 ring-1 ring-border">
                          <AvatarImage src={account.avatarUrl || undefined} />
                          <AvatarFallback className="bg-pink-500/10 text-sm font-semibold text-pink-500">
                            {account.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-ui text-foreground">
                            @{account.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Business · Active
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                              disabled={deleting === account.id}
                            >
                              {deleting === account.id ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="size-3.5" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Disconnect {account.name}?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the account connection. You can
                                reconnect it later.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  disconnectAccount(account.id, account.name)
                                }
                              >
                                Disconnect
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
