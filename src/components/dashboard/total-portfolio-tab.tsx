"use client"

import { useState } from "react"
import { usePortfolioStore } from "@/store/portfolio.store"
import { useTransactionStore } from "@/store/transaction.store"
import { PortfolioChart } from "./portfolio-chart"
import { PortfolioTable } from "./portfolio-table"
import { TransactionsTable } from "./transactions-table"
import { SummaryCards } from "./summary-cards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateDistribution } from "@/lib/calculations"
import { AssetCategory } from "@/types/portfolio.types"

import { AddAssetDialog } from "./add-asset-dialog"

export function TotalPortfolioTab({ userId }: { userId: string }) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { items, summary, isLoading: isPortfolioLoading } = usePortfolioStore()
  const { transactions, isLoading: isTransactionsLoading, refreshTransactions } = useTransactionStore()

  if (isPortfolioLoading || isTransactionsLoading) {
    return <div>Loading...</div>
  }

  // Prepare chart data
  // For Total tab, we want distribution by Category or by Asset?
  // Plan says "Aggregated portfolio distribution chart". Usually by Category or Asset.
  // Let's do by Category for Total tab.
  const distribution = calculateDistribution(items)
  const chartData = Object.entries(distribution).map(([name, value]) => ({
    name,
    value
  }))

  const activeCategories = [
    AssetCategory.BIST100,
    AssetCategory.US_MARKETS,
    AssetCategory.PRECIOUS_METALS
  ].filter(category => items.some(item => item.category === category))

  return (
    <div className="space-y-4">
      <SummaryCards summary={summary} />
      
      <div className={`grid gap-4 grid-cols-1 ${
        activeCategories.length + 1 === 2 ? 'lg:grid-cols-2' :
        activeCategories.length + 1 === 3 ? 'md:grid-cols-2 lg:grid-cols-3' :
        activeCategories.length + 1 >= 4 ? 'md:grid-cols-2 lg:grid-cols-4' : ''
      }`}>
        {/* Individual Category Charts */}
        {activeCategories.map(category => (
          <PortfolioChart 
            key={category}
            data={items
              .filter(item => item.category === category)
              .map(item => ({ name: item.symbol, value: item.currentValue || 0 }))}
            title={`${
              category === AssetCategory.BIST100 ? 'BIST 100' : 
              category === AssetCategory.US_MARKETS ? 'US Markets' : 
              'Precious Metals'
            } Distribution`}
            currency={category === AssetCategory.US_MARKETS ? 'USD' : 'TRY'}
            className="col-span-1"
          />
        ))}

        {/* Total Portfolio Chart */}
        <PortfolioChart 
          data={chartData} 
          title="Portfolio Distribution by Category" 
          currency="TRY" // Total is in TRY
          valueType="percentage"
          className="col-span-1"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Holdings</CardTitle>
            <AddAssetDialog userId={userId} />
          </CardHeader>
          <CardContent>
            <PortfolioTable items={items} currency="TRY" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardContent className="pt-6">
            <TransactionsTable 
              transactions={transactions.slice(0, 5)} 
              currency="TRY"
              userId={userId}
              onRefresh={async () => {
                setIsRefreshing(true)
                try {
                  // Get userId from auth context or props
                  const { auth } = await import("@/lib/firebase")
                  if (auth.currentUser) {
                  await refreshTransactions(auth.currentUser.uid)
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
