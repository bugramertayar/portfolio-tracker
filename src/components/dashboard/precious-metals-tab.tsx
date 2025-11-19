"use client"

import { usePortfolioStore } from "@/store/portfolio.store"
import { useTransactionStore } from "@/store/transaction.store"
import { PortfolioChart } from "./portfolio-chart"
import { PortfolioTable } from "./portfolio-table"
import { TransactionsTable } from "./transactions-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AssetCategory } from "@/types/portfolio.types"

export function PreciousMetalsTab() {
  const { items } = usePortfolioStore()
  const { transactions } = useTransactionStore()

  const filteredItems = items.filter(item => item.category === AssetCategory.PRECIOUS_METALS)
  const filteredTransactions = transactions.filter(t => t.category === AssetCategory.PRECIOUS_METALS)

  const chartData = filteredItems.map(item => ({
    name: item.symbol,
    value: item.currentValue || 0
  }))

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <PortfolioChart 
          data={chartData} 
          title="Precious Metals Allocation" 
          currency="TRY"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Precious Metals Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioTable items={filteredItems} currency="TRY" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionsTable transactions={filteredTransactions.slice(0, 5)} currency="TRY" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
