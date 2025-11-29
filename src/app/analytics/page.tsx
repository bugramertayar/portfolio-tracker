"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { FirestoreService } from "@/lib/firestore.service"
import { getHistoricalPricesAction } from "@/app/actions/portfolio"
import { calculatePortfolioHistory, HistoricalDataPoint, PriceHistoryMap } from "@/lib/analytics-utils"
import { subDays, subMonths, subYears, format } from "date-fns"

type TimeRange = '1D' | '1W' | '1M' | '1Y' | '3Y' | '5Y'
type Category = 'ALL' | 'BIST100' | 'US_STOCKS' | 'METALS'

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('1M')
  const [selectedCategory, setSelectedCategory] = useState<Category>('ALL')
  const [data, setData] = useState<HistoricalDataPoint[]>([])
  const [error, setError] = useState<string | null>(null)
  
  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login")
      } else {
        setUserId(currentUser.uid)
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [router])

  // Fetch data when userId or timeRange changes
  useEffect(() => {
    if (!userId) return

    const fetchData = async () => {
      setDataLoading(true)
      setError(null)
      
      try {
        // 1. Fetch all transactions
        const transactions = await FirestoreService.getTransactions(userId)
        
        if (transactions.length === 0) {
          setData([])
          setDataLoading(false)
          return
        }

        // 2. Get unique symbols
        const symbols = [...new Set(transactions.map(t => t.symbol))]
        
        // Add TRY=X for exchange rate
        if (!symbols.includes('TRY=X')) {
          symbols.push('TRY=X')
        }

        // 3. Determine date range based on timeRange
        const now = new Date()
        let startDate: Date
        let interval: '1d' | '1wk' | '1mo' = '1d'

        switch (timeRange) {
          case '1D':
            startDate = subDays(now, 1)
            interval = '1d'
            break
          case '1W':
            startDate = subDays(now, 7)
            interval = '1d'
            break
          case '1M':
            startDate = subMonths(now, 1)
            interval = '1d'
            break
          case '1Y':
            startDate = subYears(now, 1)
            interval = '1d'
            break
          case '3Y':
            startDate = subYears(now, 3)
            interval = '1wk'
            break
          case '5Y':
            startDate = subYears(now, 5)
            interval = '1mo'
            break
          default:
            startDate = subMonths(now, 1)
            interval = '1d'
        }

        // 4. Fetch historical prices for all symbols
        const priceHistoryMap: PriceHistoryMap = {}
        
        await Promise.all(
          symbols.map(async (symbol) => {
            const response = await getHistoricalPricesAction(symbol, startDate, now, interval)
            if (response.success && response.data) {
              priceHistoryMap[symbol] = response.data.map((item: any) => ({
                date: format(new Date(item.date), 'yyyy-MM-dd'),
                close: item.close || 0
              }))
            }
          })
        )

        // 5. Calculate portfolio history
        const portfolioHistory = calculatePortfolioHistory(
          transactions,
          priceHistoryMap,
          startDate,
          now
        )

        setData(portfolioHistory)
      } catch (err: any) {
        console.error("Error fetching analytics data:", err)
        setError(err.message || "Failed to load analytics data")
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [userId, timeRange])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const ranges: TimeRange[] = ['1D', '1W', '1M', '1Y', '3Y', '5Y']
  const categories: { id: Category; label: string; color: string }[] = [
    { id: 'ALL', label: 'All Assets', color: 'var(--foreground)' },
    { id: 'BIST100', label: 'BIST 100', color: '#22c55e' }, // Green
    { id: 'US_STOCKS', label: 'US Stocks', color: '#3b82f6' }, // Blue
    { id: 'METALS', label: 'Metals', color: '#eab308' }, // Yellow/Gold
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="mb-2 text-sm font-medium text-muted-foreground">{label}</div>
          <div className="grid gap-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium" style={{ color: entry.color }}>
                  {entry.name}:
                </span>
                <span className="text-sm font-bold">
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex-1 space-y-4 p-4 ml-16 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Portfolio Analytics</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-1">
        <Card className="col-span-1 shadow-md border-border/40">
          <CardHeader>
            <CardTitle>Total Wealth Evolution</CardTitle>
            <CardDescription>
              Your aggregated portfolio value over time (BIST100, US Stocks, Metals).
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {dataLoading ? (
              <div className="h-[400px] w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="h-[400px] w-full flex items-center justify-center text-destructive">
                {error}
              </div>
            ) : data.length === 0 ? (
              <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">
                No transaction data available
              </div>
            ) : (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#e5e7eb" opacity={0.4} />
                    <XAxis 
                      dataKey="formattedDate" 
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={30}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}k`}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    
                    {(selectedCategory === 'ALL' || selectedCategory === 'BIST100') && (
                      <Line
                        type="monotone"
                        dataKey="bist100"
                        name="BIST 100"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "var(--background)", strokeWidth: 2 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    )}
                    {(selectedCategory === 'ALL' || selectedCategory === 'US_STOCKS') && (
                      <Line
                        type="monotone"
                        dataKey="usStocks"
                        name="US Stocks"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "var(--background)", strokeWidth: 2 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    )}
                    {(selectedCategory === 'ALL' || selectedCategory === 'METALS') && (
                      <Line
                        type="monotone"
                        dataKey="metals"
                        name="Metals"
                        stroke="#eab308"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "var(--background)", strokeWidth: 2 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            
            <div className="flex flex-col items-center justify-center gap-4 mt-6">
              {/* Category Filters */}
              <div className="flex items-center justify-center gap-2 p-1 bg-muted/50 rounded-lg">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`transition-all ${selectedCategory === category.id ? 'shadow-sm' : ''}`}
                  >
                    <span 
                      className="w-2 h-2 rounded-full mr-2" 
                      style={{ backgroundColor: category.id === 'ALL' ? 'currentColor' : category.color }}
                    />
                    {category.label}
                  </Button>
                ))}
              </div>

              {/* Time Range Filters */}
              <div className="flex items-center justify-center gap-2">
                {ranges.map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                    className="w-12 transition-all hover:scale-105"
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
