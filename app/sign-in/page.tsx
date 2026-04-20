"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, Mail, ArrowLeft, Check } from "lucide-react"

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}

type Stage = "email" | "code"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/"

  const [stage, setStage] = useState<Stage>("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sendCode(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError(null)
    try {
      const supabase = createSupabaseBrowserClient()
      const { error: err } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      })
      if (err) throw err
      setStage("code")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code")
    } finally {
      setLoading(false)
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault()
    if (!code || code.length < 6) return
    setLoading(true)
    setError(null)
    try {
      const supabase = createSupabaseBrowserClient()
      const { error: err } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      })
      if (err) throw err
      router.replace(next)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex size-10 items-center justify-center rounded-md bg-primary shadow-sm">
            <span className="text-sm font-ui-strong text-primary-foreground">
              O
            </span>
          </div>
          <h1 className="text-[22px] font-ui-strong tracking-tight text-foreground">
            Sign in to OnePost
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground/80">
            {stage === "email"
              ? "We\u2019ll email you a sign-in code"
              : "Enter the code we just sent"}
          </p>
        </div>

        {stage === "email" ? (
          <form onSubmit={sendCode} className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-ui text-muted-foreground">
                Email
              </span>
              <input
                type="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border border-border bg-white/2 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-ring/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
              />
            </label>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2"
              disabled={loading || !email}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Mail className="size-4" aria-hidden="true" />
              )}
              {loading ? "Sending\u2026" : "Send code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="space-y-3">
            <div className="flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
              <Check
                className="size-3.5 shrink-0 text-emerald-400"
                aria-hidden="true"
              />
              <p className="truncate text-xs text-emerald-400">
                Code sent to <span className="font-ui">{email}</span>
              </p>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-ui text-muted-foreground">
                Verification code
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6,8}"
                maxLength={8}
                autoFocus
                required
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 8))
                }
                placeholder="00000000"
                className="w-full rounded-md border border-border bg-white/2 px-3 py-2 text-center text-lg tracking-[0.4em] font-ui-strong text-foreground placeholder:text-muted-foreground/40 focus-visible:border-ring/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
              />
            </label>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2"
              disabled={loading || code.length < 6}
            >
              {loading && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              {loading ? "Verifying\u2026" : "Verify & sign in"}
            </Button>

            <button
              type="button"
              onClick={() => {
                setStage("email")
                setCode("")
                setError(null)
              }}
              className="flex w-full items-center justify-center gap-1.5 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3" aria-hidden="true" />
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
