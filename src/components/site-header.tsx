"use client"

import Image from "next/image"

import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { logout } from "@/lib/auth"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { LayoutDashboard, TrendingUp, Wallet } from "lucide-react"

export function SiteHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const isDashboard = pathname === "/dashboard"
  const isAnalytics = pathname === "/analytics"
  const isIncomeTracker = pathname === "/income-tracker"
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
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center justify-center">
          <Link href="/dashboard">
            <Image
              src="/logo.png"
              alt="Portfolio Tracker Logo"
              width={40}
              height={40}
              className="rounded-lg hover:opacity-80 transition-opacity"
            />
          </Link>
        </div>

        <nav className="flex flex-col items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                asChild
                variant={isDashboard ? "secondary" : "ghost"} 
                size="icon" 
                className="h-10 w-10"
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Dashboard</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                asChild
                variant={isAnalytics ? "secondary" : "ghost"} 
                size="icon" 
                className="h-10 w-10"
              >
                <Link href="/analytics">
                  <TrendingUp className="h-5 w-5" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Portfolio Analytics</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                asChild
                variant={isIncomeTracker ? "secondary" : "ghost"} 
                size="icon" 
                className="h-10 w-10"
              >
                <Link href="/income-tracker">
                  <Wallet className="h-5 w-5" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Income Tracker</TooltipContent>
          </Tooltip>
        </nav>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <ModeToggle />
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
