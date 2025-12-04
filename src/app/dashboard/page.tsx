"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/auth"
import { toast } from "sonner"
import { usePortfolioStore } from "@/store/portfolio.store"
import { DashboardTabs } from "@/components/dashboard/tabs"
import { Loader2 } from "lucide-react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  
  const { fetchPortfolio } = usePortfolioStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        fetchPortfolio(currentUser.uid)
      } else {
        router.push("/login")
      }
    })

    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

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

  if (!user) return null

  return (
    <div className="flex-1 space-y-4 p-4 ml-16">
      <div className="flex items-center justify-between space-y-2">
        {/* Header elements moved to SiteHeader */}
      </div>
      
      <DashboardTabs userId={user.uid} />
    </div>
  )
}
