"use client"

import { useState, useEffect } from "react"
import { usePortfolioStore } from "@/store/portfolio.store"
import { useTransactionStore } from "@/store/transaction.store"
import { PortfolioChart } from "./portfolio-chart"
import { PortfolioTable } from "./portfolio-table"
import { TransactionsTable } from "./transactions-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AssetCategory } from "@/types/portfolio.types"

export function Bist100Tab({ userId }: { userId: string }) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { items } = usePortfolioStore()
  const { transactions, refreshTransactions, hasMore, fetchTransactions, isLoading: isTransactionsLoading } = useTransactionStore()

  // Fetch transactions on mount
  useEffect(() => {
    fetchTransactions(userId, AssetCategory.BIST100)
  }, [userId, fetchTransactions])

  const filteredItems = items.filter(item => item.category === AssetCategory.BIST100)
  const filteredTransactions = transactions.filter(t => t.category === AssetCategory.BIST100)

  // Calculate distribution for BIST100 assets
  const chartData = filteredItems.map(item => ({
    name: item.symbol,
    value: item.currentValue || 0
  }))

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <PortfolioChart 
          data={chartData} 
          title="BIST 100 Allocation" 
          currency="TRY"
          className="col-span-7"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>BIST 100 Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioTable items={filteredItems} currency="TRY" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardContent className="pt-6">
            <TransactionsTable 
              transactions={filteredTransactions} 
              currency="TRY"
              onRefresh={async () => {
                setIsRefreshing(true)
                try {
                  const { auth } = await import("@/lib/firebase")
                  if (auth.currentUser) {
                    await refreshTransactions(auth.currentUser.uid, AssetCategory.BIST100)
                  }
                } finally {
                  setIsRefreshing(false)
                }
              }}
              isRefreshing={isRefreshing}
              hasMore={hasMore}
              onLoadMore={() => fetchTransactions(userId, AssetCategory.BIST100, true)}
              isLoadingMore={isTransactionsLoading && filteredTransactions.length > 0}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
