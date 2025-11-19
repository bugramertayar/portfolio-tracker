"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { usePortfolioStore } from "@/store/portfolio.store"
import { useTransactionStore } from "@/store/transaction.store"
import { DashboardTabs } from "@/components/dashboard/tabs"
import { AddAssetDialog } from "@/components/dashboard/add-asset-dialog"
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog"
import { Loader2, LogOut } from "lucide-react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const { fetchPortfolio, isLoading: isPortfolioLoading } = usePortfolioStore()
  const { fetchTransactions, isLoading: isTransactionsLoading } = useTransactionStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        fetchPortfolio(currentUser.uid)
        fetchTransactions(currentUser.uid)
      } else {
        router.push("/login")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router, fetchPortfolio, fetchTransactions])

  const handleLogout = async () => {
    try {
      await logout()
      document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
      toast.success("Logged out successfully")
      router.push("/login")
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

  if (loading || isPortfolioLoading || isTransactionsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <AddAssetDialog userId={user.uid} />
          <AddTransactionDialog userId={user.uid} />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <DashboardTabs />
    </div>
  )
}
