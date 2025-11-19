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

export function PortfolioChart({ data, title = "Portfolio Distribution", currency = 'TRY', valueType = 'currency', className }: PortfolioChartProps) {
  const chartData = data.map((item, index) => ({
    ...item,
    fill: item.color || COLORS[index % COLORS.length]
  }))

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
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => valueType === 'percentage' ? `${value.toFixed(2)}%` : formatCurrency(value, currency)}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
