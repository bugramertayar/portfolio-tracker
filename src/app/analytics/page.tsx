"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { generatePortfolioHistory, TimeRange, PortfolioDataPoint } from "@/lib/mock-data"

type Category = 'ALL' | 'BIST100' | 'US_STOCKS' | 'METALS'

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('1M')
  const [selectedCategory, setSelectedCategory] = useState<Category>('ALL')
  const [data, setData] = useState<PortfolioDataPoint[]>([])
  
  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login")
      } else {
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [router])

  // Data generation
  useEffect(() => {
    const newData = generatePortfolioHistory(timeRange)
    setData(newData)
  }, [timeRange])

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
