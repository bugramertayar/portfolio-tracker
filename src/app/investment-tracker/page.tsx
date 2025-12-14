"use client"

import { useEffect, useState } from "react"
import { FirestoreService } from "@/lib/firestore.service"
import { Transaction } from "@/types/portfolio.types"
import { InvestmentTrackerMatrix } from "@/components/investment/investment-tracker-matrix"
import { InvestmentHistoryTable } from "@/components/investment/investment-history-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getExchangeRateAction } from "@/app/actions/portfolio"

export default function InvestmentTrackerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [usdRate, setUsdRate] = useState<number>(35);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login")
      } else {
        initializeData(currentUser.uid)
      }
    })
    return () => unsubscribe()
  }, [router])

  const initializeData = async (uid: string) => {
    try {
      setLoading(true);
      
      // 1. Fetch USD Rate (Server Action)
      const rateRes = await getExchangeRateAction();
      if (rateRes.success && typeof rateRes.data === 'number') {
        setUsdRate(rateRes.data);
      }

      // 2. Migration - Removed as data is now fixed

      // 3. Fetch Transactions
      const data = await FirestoreService.getTransactions(uid);
      setTransactions(data);
      
    } catch (error) {
      console.error("Error initializing investment tracker:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
       <div className="flex-1 space-y-4 p-4 ml-16 pt-6">
         <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-[250px]" />
              <Skeleton className="h-4 w-[400px]" />
            </div>
         </div>
         <Card className="w-full">
           <CardHeader><Skeleton className="h-6 w-[200px]" /></CardHeader>
           <CardContent className="h-[400px] flex items-center justify-center">
             <Skeleton className="h-[300px] w-full" />
           </CardContent>
         </Card>
       </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 ml-16 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investment Tracker</h1>
          <p className="text-muted-foreground">
            Track your total invested capital over time across all assets.
          </p>
        </div>
      </div>

      <InvestmentTrackerMatrix 
        transactions={transactions} 
        currentUsdRate={usdRate}
      />
      
      <InvestmentHistoryTable transactions={transactions} />
    </div>
  )
}
