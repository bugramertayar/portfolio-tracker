"use client"

import { useEffect, useState, useCallback } from "react"
import { usePortfolioStore } from "@/store/portfolio.store"
import { FirestoreService } from "@/lib/firestore.service"
import { Goal, GoalCategory, AssetCategory, PortfolioItem } from "@/types/portfolio.types"
import { getExchangeRateAction } from "@/app/actions/portfolio"
import { AddGoalForm } from "./add-goal-form"
import { GoalCard } from "./goal-card"
import { formatCurrency } from "@/lib/formatters"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Target, TrendingUp, DollarSign } from "lucide-react"

interface GoalsPageContentProps {
  userId: string
}

export default function GoalsPageContent({ userId }: GoalsPageContentProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [usdTryRate, setUsdTryRate] = useState<number>(34) // Fallback default
  const { items: portfolio, fetchPortfolio } = usePortfolioStore() // Use store for consistency
  const [currentValues, setCurrentValues] = useState<Record<GoalCategory, number>>({
    'BIST100': 0,
    'US STOCKS': 0,
    'PRECIOUS METALS': 0,
    'EUROBOND': 0,
    'MUTUAL FUNDS': 0,
  })

  // Data Fetching
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Parallel fetching
      const [goalsData, rateResult] = await Promise.all([
        FirestoreService.getGoals(userId),
        getExchangeRateAction(),
        fetchPortfolio(userId) // Ensure portfolio is up to date
      ])

      setGoals(goalsData)

      if (rateResult.success && rateResult.data) {
        setUsdTryRate(rateResult.data)
      }

    } catch (error) {
      console.error("Error loading goals data:", error)
    } finally {
      setLoading(false)
    }
  }, [userId, fetchPortfolio])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Calculation Logic
  useEffect(() => {
    if (!portfolio || portfolio.length === 0) return

    const values: Record<GoalCategory, number> = {
      'BIST100': 0,
      'US STOCKS': 0,
      'PRECIOUS METALS': 0,
      'EUROBOND': 0,
      'MUTUAL FUNDS': 0,
    }

    portfolio.forEach((item: PortfolioItem) => {
      // Determine value in USD
      // Strategy: 
      // 1. If item has totalUsdValue (from transaction) - likely not persisted on portfolio item directly in same way
      // 2. Use item.currentValue (this is usually total value) and convert if needed.
      
      let usdValue = 0
      
      // Check currency
      const isUsd = item.currency === 'USD' || item.category === AssetCategory.US_MARKETS
      
      // Calculate current value if not strictly present, or use totalValue
      const itemValue = item.currentValue || item.totalValue || 0
      
      if (isUsd) {
        usdValue = itemValue
      } else {
        // Assume TRY
        usdValue = itemValue / usdTryRate
      }

      // Mapping Logic
      if (item.category === AssetCategory.BIST100) {
        values['BIST100'] += usdValue
      } else if (item.category === AssetCategory.US_MARKETS) {
        values['US STOCKS'] += usdValue
      } else if (item.category === AssetCategory.PRECIOUS_METALS) {
        values['PRECIOUS METALS'] += usdValue
      } 
      
      // Heuristic Matching for custom categories not in Enum
      const name = (item.name || "").toLowerCase()
      const symbol = (item.symbol || "").toLowerCase()
      
      if (name.includes("eurobond") || symbol.includes("eurobond")) {
        values['EUROBOND'] += usdValue
      }
      
      if (name.includes("money market") || name.includes("para piyasası") || name.includes("ppf")) {
        values['MUTUAL FUNDS'] += usdValue
      }
    })

    setCurrentValues(values)
  }, [portfolio, usdTryRate])

  // Summary Metrics
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalCurrentProgress = goals.reduce((sum, goal) => sum + (currentValues[goal.category] || 0), 0)
  const totalProgressPercent = totalTarget > 0 ? (totalCurrentProgress / totalTarget) * 100 : 0

  if (loading && goals.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Goals & Targets</h2>
          <p className="text-muted-foreground">Track your financial milestones in USD across all assets.</p>
        </div>
        
        {/* Exchange Rate Badge */}
        <div className="bg-muted/50 px-3 py-1 rounded-full text-xs font-mono text-muted-foreground border border-border">
          1 USD ≈ {usdTryRate.toFixed(2)} TRY
        </div>
      </div>

      {/* Top Section: Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Target Value</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalTarget, 'USD')}</div>
            <p className="text-xs text-muted-foreground">Sum of all active goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Progress</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCurrentProgress, 'USD')}</div>
            <p className="text-xs text-muted-foreground">
              {totalProgressPercent.toFixed(1)}% of total target
            </p>
          </CardContent>
        </Card>

        <Card className={totalProgressPercent >= 100 ? "bg-emerald-500/10 border-emerald-500/20" : ""}>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProgressPercent.toFixed(1)}%</div>
            <div className="w-full bg-secondary h-2 mt-2 rounded-full overflow-hidden">
               <div 
                 className="bg-primary h-full transition-all duration-1000" 
                 style={{ width: `${Math.min(totalProgressPercent, 100)}%` }} 
               />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section: Add Goal */}
      <div className="max-w-3xl mx-auto">
        <AddGoalForm 
          userId={userId} 
          onGoalAdded={loadData} 
          existingCategories={goals.map(g => g.category)} 
        />
      </div>

      {/* Bottom Section: Goal List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Your Goals</h3>
        {goals.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">No goals set yet</h3>
            <p className="text-muted-foreground">Start by adding a financial target above.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {goals.map((goal) => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                currentAmount={currentValues[goal.category] || 0}
                userId={userId}
                onUpdate={loadData}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
