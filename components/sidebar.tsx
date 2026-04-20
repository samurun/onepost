"use client"

import { cn } from "@/lib/utils"
import {
  PenSquare,
  Clock,
  Link2,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react"
import { ACTIVE_PLATFORMS, PLATFORMS } from "@/lib/platforms"
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
import { useAccounts } from "@/hooks/use-accounts"
import { useUser } from "@/hooks/use-user"

const navItems = [
  { icon: PenSquare, label: "Compose", href: "/" },
  { icon: Clock, label: "Posts", href: "/posts" },
  { icon: Link2, label: "Accounts", href: "/accounts" },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  // Auto-collapse on small screens
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)")
    setCollapsed(mq.matches)
    const handler = (e: MediaQueryListEvent) => setCollapsed(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  const { accounts } = useAccounts()
  const { user } = useUser()
  const connectedPlatforms = [...new Set(accounts.map((a) => a.platform))]
  const pathname = usePathname()
  const email = user?.email ?? ""
  const emailInitial = email ? email[0]!.toUpperCase() : "?"

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r border-border bg-sidebar transition-[width] duration-300",
        collapsed ? "w-17" : "w-60"
      )}
    >
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 px-4">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary shadow-sm">
          <span className="text-xs font-ui-strong text-primary-foreground">
            O
          </span>
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-ui tracking-tight text-foreground">
              OnePost
            </span>
            <span className="text-[10px] leading-none text-muted-foreground/80">
              Publish everywhere
            </span>
          </div>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-px p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Tooltip key={item.label} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-ui transition-colors",
                    isActive
                      ? "bg-white/4 text-foreground"
                      : "text-muted-foreground hover:bg-white/4 hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-4 shrink-0",
                      isActive ? "text-accent" : ""
                    )}
                  />
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
          <p className="mb-1 px-2.5 text-[10px] font-ui uppercase tracking-widest text-muted-foreground/60">
            Connected
          </p>
        )}
        <div className="flex flex-col gap-px">
          {PLATFORMS.filter((p) => ACTIVE_PLATFORMS.includes(p.id)).map(
            (account) => {
              const isConnected = connectedPlatforms.includes(account.id)
              return (
                <Tooltip key={account.id} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href="/accounts"
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 transition-colors hover:bg-white/4",
                        collapsed && "justify-center px-0"
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-sm",
                          account.bgColor
                        )}
                      >
                        <account.icon
                          className={cn("size-3", account.color)}
                        />
                      </div>
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-sm font-ui text-muted-foreground">
                            {account.label}
                          </span>
                          {isConnected ? (
                            <span
                              aria-hidden="true"
                              className="flex size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_theme(colors.emerald.500/0.5)]"
                            />
                          ) : (
                            <Badge
                              variant="outline"
                              className="h-4 px-1.5 text-[10px] font-ui"
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
            }
          )}
        </div>
      </div>

      {/* User footer */}
      {email && (
        <div className="p-2">
          <Separator className="mb-2" />
          <form action="/auth/sign-out" method="post">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  type="submit"
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-white/4",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <div
                    aria-hidden="true"
                    className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] font-ui-strong text-accent"
                  >
                    {emailInitial}
                  </div>
                  {!collapsed && (
                    <>
                      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                        {email}
                      </span>
                      <LogOut
                        className="size-3.5 text-muted-foreground/70"
                        aria-hidden="true"
                      />
                    </>
                  )}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">
                  Sign out ({email})
                </TooltipContent>
              )}
            </Tooltip>
          </form>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-16 flex size-6 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-white/4"
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
