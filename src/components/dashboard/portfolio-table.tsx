"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PortfolioItem } from "@/types/portfolio.types"
import { formatCurrency, formatPercentage } from "@/lib/formatters"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PortfolioTableProps {
  items: PortfolioItem[]
  currency?: 'TRY' | 'USD'
}

type SortField = 'symbol' | 'name' | 'quantity' | 'averageCost' | 'currentPrice' | 'currentValue' | 'profit' | 'profitPercentage'
type SortDirection = 'asc' | 'desc'

export function PortfolioTable({ items, currency = 'TRY' }: PortfolioTableProps) {
  const [sortField, setSortField] = useState<SortField>('symbol')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedItems = [...items].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (aValue === undefined || bValue === undefined) return 0

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' 
        ? aValue - bValue 
        : bValue - aValue
    }

    return 0
  })

  const SortHeader = ({ field, label }: { field: SortField, label: string }) => (
    <TableHead>
      <Button 
        variant="ghost" 
        onClick={() => handleSort(field)}
        className="hover:bg-transparent px-0 font-bold"
      >
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  )

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortHeader field="symbol" label="Symbol" />
            <SortHeader field="name" label="Name" />
            <SortHeader field="quantity" label="Quantity" />
            <SortHeader field="averageCost" label="Avg Cost" />
            <SortHeader field="currentPrice" label="Price" />
            <SortHeader field="currentValue" label="Total Value" />
            <SortHeader field="profit" label="P/L" />
            <SortHeader field="profitPercentage" label="P/L %" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center h-24">
                No assets found.
              </TableCell>
            </TableRow>
          ) : (
            sortedItems.map((item) => (
              <TableRow key={item.id || item.symbol}>
                <TableCell className="font-medium">{item.symbol}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{formatCurrency(item.averageCost, currency)}</TableCell>
                <TableCell>{formatCurrency(item.currentPrice || 0, currency)}</TableCell>
                <TableCell>{formatCurrency(item.currentValue || 0, currency)}</TableCell>
                <TableCell className={item.profit && item.profit >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(item.profit || 0, currency)}
                </TableCell>
                <TableCell className={item.profitPercentage && item.profitPercentage >= 0 ? "text-green-600" : "text-red-600"}>
                  {formatPercentage(item.profitPercentage || 0)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
