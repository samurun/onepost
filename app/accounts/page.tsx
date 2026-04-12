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
import { Separator } from "@/components/ui/separator"
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
  const ytAccounts = accounts.filter((a) => a.platform === "youtube")
  const ttAccounts = accounts.filter((a) => a.platform === "tiktok")

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex flex-1 flex-col overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-lg font-semibold tracking-tight">Accounts</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Connect your social media accounts to start posting.
          </p>
        </div>

        {/* Status Messages */}
        {success && (
          <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm font-medium text-green-700 dark:text-green-400">
            <CheckCircle2 className="size-4 shrink-0" />
            Account connected successfully!
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive">
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
          <Card className="transition-shadow hover:shadow-md">
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
              <Button asChild className="gap-2">
                <a href="/api/auth/facebook">
                  <FacebookIcon className="size-4" />
                  {fbAccounts.length > 0 ? "Add Another Page" : "Connect"}
                  <ExternalLink className="size-3" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
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
              <Button
                asChild
                className="gap-2 bg-pink-500 hover:bg-pink-600"
              >
                <a href="/api/auth/instagram">
                  <InstagramIcon className="size-4" />
                  {igAccounts.length > 0 ? "Reconnect" : "Connect"}
                  <ExternalLink className="size-3" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-red-500/10">
                  <YouTubeIcon className="size-4 text-red-500" />
                </div>
                YouTube
              </CardTitle>
              <CardDescription>
                Upload videos to your YouTube channel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="gap-2 bg-red-500 hover:bg-red-600">
                <a href="/api/auth/youtube">
                  <YouTubeIcon className="size-4" />
                  {ytAccounts.length > 0 ? "Reconnect" : "Connect"}
                  <ExternalLink className="size-3" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-foreground/10">
                  <TikTokIcon className="size-4" />
                </div>
                TikTok
              </CardTitle>
              <CardDescription>
                Post videos to your TikTok account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="gap-2 bg-foreground hover:bg-foreground/90">
                <a href="/api/auth/tiktok">
                  <TikTokIcon className="size-4" />
                  {ttAccounts.length > 0 ? "Reconnect" : "Connect"}
                  <ExternalLink className="size-3" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Connected Accounts */}
        <div>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
            Connected Accounts
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/15 py-16 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted/50">
                <Unplug className="size-5 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
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
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <FacebookIcon className="size-3.5 text-blue-500" />
                    Facebook Pages
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {fbAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm"
                      >
                        <Avatar className="size-10 ring-1 ring-border">
                          <AvatarImage src={account.avatarUrl || undefined} />
                          <AvatarFallback className="bg-blue-500/10 text-sm font-semibold text-blue-500">
                            {account.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
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
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <InstagramIcon className="size-3.5 text-pink-500" />
                    Instagram
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {igAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm"
                      >
                        <Avatar className="size-10 ring-1 ring-border">
                          <AvatarImage src={account.avatarUrl || undefined} />
                          <AvatarFallback className="bg-pink-500/10 text-sm font-semibold text-pink-500">
                            {account.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
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

              {/* YouTube Channels */}
              {ytAccounts.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <YouTubeIcon className="size-3.5 text-red-500" />
                    YouTube
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {ytAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm"
                      >
                        <Avatar className="size-10 ring-1 ring-border">
                          <AvatarImage src={account.avatarUrl || undefined} />
                          <AvatarFallback className="bg-red-500/10 text-sm font-semibold text-red-500">
                            {account.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {account.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Channel · Active
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

              {/* TikTok Accounts */}
              {ttAccounts.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <TikTokIcon className="size-3.5" />
                    TikTok
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {ttAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm"
                      >
                        <Avatar className="size-10 ring-1 ring-border">
                          <AvatarImage src={account.avatarUrl || undefined} />
                          <AvatarFallback className="bg-foreground/10 text-sm font-semibold">
                            {account.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            @{account.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Creator · Active
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
