"use client"

import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { logout } from "@/lib/auth"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"

export function SiteHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const isDashboard = pathname === "/dashboard"

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

  return (
    <header className="p-4 flex items-center justify-between border-b">
      <div className="flex items-center">
        {isDashboard && <h1 className="text-xl font-bold">Dashboard</h1>}
      </div>
      <div className="flex items-center space-x-2">
        <ModeToggle />
        {isDashboard && (
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  )
}
