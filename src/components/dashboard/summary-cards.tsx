"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PortfolioSummary } from "@/types/portfolio.types"
import { formatCurrency, formatPercentage } from "@/lib/formatters"
import { TrendingUp, TrendingDown, Wallet } from "lucide-react"

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
}

interface SummaryCardsProps {
  summary: PortfolioSummary
  marketData?: {
    bist100: MarketData | null
    usdTry: MarketData | null
  }
}

export function SummaryCards({ summary, marketData }: SummaryCardsProps) {
  // Calculate total values in TRY (or main currency)
  // The summary object has totalValueTRY, totalProfitTRY etc.
  
  const isProfit = summary.totalProfitTRY >= 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="py-3 gap-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-1">
          <CardTitle className="text-sm font-medium">
            Total Portfolio Value
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-xl font-bold">{formatCurrency(summary.totalValueTRY, 'TRY')}</div>
          <p className="text-xs text-muted-foreground">
            Across all categories
          </p>
        </CardContent>
      </Card>
      <Card className="py-3 gap-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-1">
          <CardTitle className="text-sm font-medium">
            Total Profit/Loss
          </CardTitle>
          {isProfit ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent className="px-4">
          <div className={`text-xl font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(summary.totalProfitTRY, 'TRY')}
          </div>
          <p className={`text-xs ${isProfit ? "text-green-600" : "text-red-600"}`}>
            {formatPercentage(summary.totalProfitPercentageTRY)}
          </p>
        </CardContent>
      </Card>
      <Card className="py-3 gap-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-1">
          <CardTitle className="text-sm font-medium">
            BIST 100
          </CardTitle>
          <span className="font-bold text-muted-foreground">INDEX</span>
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-xl font-bold">
            {marketData?.bist100 ? formatCurrency(marketData.bist100.price, 'TRY').replace('₺', '').trim() : '-'}
          </div>
          <p className={`text-xs ${marketData?.bist100 && marketData.bist100.changePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
            {marketData?.bist100 ? formatPercentage(marketData.bist100.changePercent) : '-'}
          </p>
        </CardContent>
      </Card>
      <Card className="py-3 gap-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-1">
          <CardTitle className="text-sm font-medium">
            USD/TRY
          </CardTitle>
          <span className="font-bold text-muted-foreground">RATE</span>
        </CardHeader>
        <CardContent className="px-4">
          <div className="text-xl font-bold">
            {marketData?.usdTry ? formatCurrency(marketData.usdTry.price, 'TRY') : '-'}
          </div>
          <p className={`text-xs ${marketData?.usdTry && marketData.usdTry.changePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
            {marketData?.usdTry ? formatPercentage(marketData.usdTry.changePercent) : '-'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
