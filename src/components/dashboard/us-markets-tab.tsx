"use client"

import { useState } from "react"
import { usePortfolioStore } from "@/store/portfolio.store"
import { useTransactionStore } from "@/store/transaction.store"
import { PortfolioChart } from "./portfolio-chart"
import { PortfolioTable } from "./portfolio-table"
import { TransactionsTable } from "./transactions-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AssetCategory } from "@/types/portfolio.types"

export function UsMarketsTab() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { items } = usePortfolioStore()
  const { transactions, refreshTransactions } = useTransactionStore()

  const filteredItems = items.filter(item => item.category === AssetCategory.US_MARKETS)
  const filteredTransactions = transactions.filter(t => t.category === AssetCategory.US_MARKETS)

  const chartData = filteredItems.map(item => ({
    name: item.symbol,
    value: item.currentValue || 0
  }))

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <PortfolioChart 
          data={chartData} 
          title="US Markets Allocation" 
          currency="USD"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>US Market Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioTable items={filteredItems} currency="USD" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardContent className="pt-6">
            <TransactionsTable 
              transactions={filteredTransactions.slice(0, 5)} 
              currency="USD"
              onRefresh={async () => {
                setIsRefreshing(true)
                try {
                  const { auth } = await import("@/lib/firebase")
                  if (auth.currentUser) {
                    await refreshTransactions(auth.currentUser.uid, AssetCategory.US_MARKETS)
                  }
                } finally {
                  setIsRefreshing(false)
                }
              }}
              isRefreshing={isRefreshing}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
