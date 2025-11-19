"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PortfolioSummary } from "@/types/portfolio.types"
import { formatCurrency, formatPercentage } from "@/lib/formatters"
import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react"

interface SummaryCardsProps {
  summary: PortfolioSummary
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  // Calculate total values in TRY (or main currency)
  // The summary object has totalValueTRY, totalProfitTRY etc.
  
  const isProfit = summary.totalProfitTRY >= 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Portfolio Value
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalValueTRY, 'TRY')}</div>
          <p className="text-xs text-muted-foreground">
            Across all categories
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Profit/Loss
          </CardTitle>
          {isProfit ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(summary.totalProfitTRY, 'TRY')}
          </div>
          <p className={`text-xs ${isProfit ? "text-green-600" : "text-red-600"}`}>
            {formatPercentage(summary.totalProfitPercentageTRY)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            BIST 100 Value
          </CardTitle>
          <span className="font-bold text-muted-foreground">TRY</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.bist100.totalValue, 'TRY')}</div>
          <p className={`text-xs ${summary.bist100.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatPercentage(summary.bist100.totalProfitPercentage)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            US Markets Value
          </CardTitle>
          <span className="font-bold text-muted-foreground">USD</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.usMarket.totalValue, 'USD')}</div>
          <p className={`text-xs ${summary.usMarket.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatPercentage(summary.usMarket.totalProfitPercentage)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
