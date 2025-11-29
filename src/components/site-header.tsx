"use client"

import Image from "next/image"

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
  const isAuthPage = pathname === "/login" || pathname === "/register"

  if (isAuthPage) {
    return null
  }

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
    <header className="fixed left-0 top-0 z-50 flex h-screen w-16 flex-col items-center justify-between border-r bg-background py-4">
      <div className="flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="Portfolio Tracker Logo"
          width={40}
          height={40}
          className="rounded-lg"
        />
      </div>
      <div className="flex flex-col items-center space-y-4">
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
