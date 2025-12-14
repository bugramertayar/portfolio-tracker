"use client"

import { useEffect, useState } from "react"
// import { useAuth } from "@/lib/auth" 
import { FirestoreService } from "@/lib/firestore.service"
import { IncomeEntry } from "@/types/income"
import { AddIncomeDialog } from "@/components/income/add-income-dialog"
import { IncomeMatrix } from "@/components/income/income-matrix"
import { IncomeHistoryTable } from "@/components/income/income-history-table"
import { Loader2 } from "lucide-react"
import { IncomeMatrixSkeleton, TableSkeleton } from "@/components/skeletons/app-skeletons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function IncomeTrackerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [incomes, setIncomes] = useState<IncomeEntry[]>([])
  
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login")
      } else {
        setUserId(currentUser.uid)
        // Migration is complete, no need to check every time
        fetchIncomes(currentUser.uid)
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [router])

  const fetchIncomes = async (uid: string) => {
    try {
      setLoading(true);
      const data = await FirestoreService.getIncomes(uid);
      setIncomes(data);
    } catch (error) {
      console.error("Error fetching incomes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return null; // Or redirect
  }

  return (
    <div className="flex-1 space-y-4 p-4 ml-16 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Income Tracker</h1>
          <p className="text-muted-foreground">
            Track your monthly income streams from dividends, rents, and more.
          </p>
        </div>
        <AddIncomeDialog userId={userId} onSuccess={() => fetchIncomes(userId)} />
      </div>

      {loading ? (
        <IncomeMatrixSkeleton />
      ) : (
        <IncomeMatrix 
          data={incomes} 
          userId={userId}
          onEdit={() => userId && fetchIncomes(userId)} 
        />
      )}
      
      {loading ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-[150px]" /></CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton />
          </CardContent>
        </Card>
      ) : (
        <IncomeHistoryTable incomes={incomes} />
      )}
    </div>
  )
}
