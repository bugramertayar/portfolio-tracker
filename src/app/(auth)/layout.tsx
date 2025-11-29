"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { FirestoreQuotesService, type Quote } from "@/lib/firestore.service"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Initialize with null to avoid hydration mismatch
  const [randomQuote, setRandomQuote] = useState<Quote | null>(null)

  // Fetch random quote from Firestore on mount
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const quotes = await FirestoreQuotesService.getAllQuotes()
        
        if (quotes && quotes.length > 0) {
          const randomIndex = Math.floor(Math.random() * quotes.length)
          setRandomQuote(quotes[randomIndex])
        }
      } catch (error) {
        console.error("Error fetching quote:", error)
        // No fallback, just don't show anything
      }
    }
    
    fetchQuote()
  }, [])

  return (
    <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <Image
          src="/auth-bg.png"
          alt="Authentication Background"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Image
            src="/logo.png"
            alt="Portfolio Tracker Logo"
            width={40}
            height={40}
            className="mr-2 rounded-lg"
          />
          Portfolio Tracker
        </div>
        <div className="relative z-20 mt-auto">
          {randomQuote && (
            <blockquote className="space-y-2 rounded-lg bg-black/20 p-4 backdrop-blur-sm">
              <p className="text-lg">
                &ldquo;{randomQuote.quote}&rdquo;
              </p>
              <footer className="text-sm">{randomQuote.author}</footer>
            </blockquote>
          )}
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {children}
        </div>
      </div>
    </div>
  )
}
