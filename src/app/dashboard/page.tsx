"use client"

import { useRouter } from "next/navigation"
import { logout } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function DashboardPage() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      // Remove session cookie
      document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
      toast.success("Logged out successfully")
      router.push("/login")
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      <p>Welcome to your portfolio tracker!</p>
    </div>
  )
}
