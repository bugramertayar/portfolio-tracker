"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Loader2 } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, redirect to dashboard
        router.push("/dashboard")
      } else {
        // User is not signed in, redirect to login
        router.push("/login")
      }
      setIsChecking(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [router])

  // Show a professional loading screen while checking auth state
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-600 dark:text-zinc-400" />
        <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
          Loading...
        </p>
      </div>
    </div>
  )
}
