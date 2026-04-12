"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import type { AccountInfo } from "@/types"

interface AccountsContextValue {
  accounts: AccountInfo[]
  loading: boolean
  refetch: () => void
}

const AccountsContext = createContext<AccountsContextValue>({
  accounts: [],
  loading: true,
  refetch: () => {},
})

export function AccountsProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<AccountInfo[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then(setAccounts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return (
    <AccountsContext value={{ accounts, loading, refetch }}>
      {children}
    </AccountsContext>
  )
}

export function useAccounts() {
  return useContext(AccountsContext)
}
