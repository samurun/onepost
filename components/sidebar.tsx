"use client"

import { cn } from "@/lib/utils"
import { PenSquare, Clock, Link2, ChevronLeft, ChevronRight } from "lucide-react"
import { FacebookIcon, InstagramIcon, YouTubeIcon } from "@/components/icons"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

const navItems = [
  { icon: PenSquare, label: "Compose", href: "/" },
  { icon: Clock, label: "Posts", href: "/posts" },
  { icon: Link2, label: "Accounts", href: "/accounts" },
]

const platformConfig = [
  {
    platform: "facebook",
    label: "Facebook",
    icon: FacebookIcon,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    platform: "instagram",
    label: "Instagram",
    icon: InstagramIcon,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    platform: "youtube",
    label: "YouTube",
    icon: YouTubeIcon,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])
  const pathname = usePathname()

  useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((accounts: { platform: string }[]) => {
        const platforms = [...new Set(accounts.map((a) => a.platform))]
        setConnectedPlatforms(platforms)
      })
      .catch(() => {})
  }, [])

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-17" : "w-60"
      )}
    >
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 px-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-violet-600 to-indigo-600 shadow-sm">
          <span className="text-sm font-bold text-white">O</span>
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight">
              OnePost
            </span>
            <span className="text-[10px] leading-none text-muted-foreground">
              Publish everywhere
            </span>
          </div>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Tooltip key={item.label} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">{item.label}</TooltipContent>
              )}
            </Tooltip>
          )
        })}
      </nav>

      {/* Connected Accounts */}
      <div className="p-2">
        <Separator className="mb-2" />
        {!collapsed && (
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Connected
          </p>
        )}
        <div className="flex flex-col gap-0.5">
          {platformConfig.map((account) => {
            const isConnected = connectedPlatforms.includes(account.platform)
            return (
              <Tooltip key={account.platform} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href="/accounts"
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-accent",
                      collapsed && "justify-center px-0"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-md",
                        account.bgColor
                      )}
                    >
                      <account.icon
                        className={cn("size-3.5", account.color)}
                      />
                    </div>
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-sm text-foreground/80">
                          {account.label}
                        </span>
                        {isConnected ? (
                          <span className="flex size-2 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.4)]" />
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-normal text-muted-foreground"
                          >
                            Connect
                          </Badge>
                        )}
                      </>
                    )}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    {account.label} —{" "}
                    {isConnected ? "Connected" : "Not connected"}
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 flex size-6 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-colors hover:bg-accent"
      >
        {collapsed ? (
          <ChevronRight className="size-3" />
        ) : (
          <ChevronLeft className="size-3" />
        )}
      </button>
    </aside>
  )
}
