"use client"


import { usePortfolioStore } from "@/store/portfolio.store"
import { useTransactionStore } from "@/store/transaction.store"
import { PortfolioChart } from "./portfolio-chart"
import { PortfolioTable } from "./portfolio-table"
import { TransactionsTable } from "./transactions-table"
import { SummaryCards } from "./summary-cards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateDistribution } from "@/lib/calculations"

export function TotalPortfolioTab() {
  const { items, summary, isLoading: isPortfolioLoading } = usePortfolioStore()
  const { transactions, isLoading: isTransactionsLoading } = useTransactionStore()

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

  return (
    <div className="space-y-4">
      <SummaryCards summary={summary} />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <PortfolioChart 
          data={chartData} 
          title="Portfolio Distribution by Category" 
          currency="TRY" // Total is in TRY
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioTable items={items} currency="TRY" />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionsTable transactions={transactions.slice(0, 5)} currency="TRY" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
