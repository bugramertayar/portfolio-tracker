"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/formatters"

interface PortfolioChartProps {
  data: {
    name: string
    value: number
    color?: string
  }[]
  title?: string
  currency?: 'TRY' | 'USD'
  valueType?: 'currency' | 'percentage'
  className?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#a4de6c', '#d0ed57']

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, currency, valueType, total }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    const value = data.value
    const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : '0.00'
    const formattedValue = valueType === 'percentage' 
      ? `${value.toFixed(2)}%` 
      : formatCurrency(value, currency)

    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 min-w-[180px]">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.payload.fill }}
          />
          <p className="font-semibold text-sm text-foreground">{data.name}</p>
        </div>
        <div className="space-y-1">
          <p className="text-lg font-bold text-foreground">{formattedValue}</p>
          <p className="text-xs text-muted-foreground">
            {percentage}% of total
          </p>
        </div>
      </div>
    )
  }
  return null
}

export function PortfolioChart({ data, title = "Portfolio Distribution", currency = 'TRY', valueType = 'currency', className }: PortfolioChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: item.color || COLORS[index % COLORS.length]
  }))

  // Calculate total for percentage
  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (data.length === 0) {
    return (
      <Card className={cn("col-span-4", className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          No data available
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("col-span-4", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
                cursor="pointer"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} style={{ cursor: 'pointer' }} />
                ))}
              </Pie>
              <Tooltip 
                content={<CustomTooltip currency={currency} valueType={valueType} total={total} />}
                animationDuration={0}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
