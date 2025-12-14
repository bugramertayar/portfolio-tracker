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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Transaction } from "@/types/portfolio.types"
import { formatCurrency, formatDate } from "@/lib/formatters"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface InvestmentHistoryTableProps {
  transactions: Transaction[]
}

const ITEMS_PER_PAGE = 15

export function InvestmentHistoryTable({ transactions }: InvestmentHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1)

  // Filter only BUY transactions and sort descending by date
  const buyTransactions = transactions
    .filter(t => t.type === 'BUY')
    .sort((a, b) => b.date - a.date)

  const totalPages = Math.ceil(buyTransactions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedTransactions = buyTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Investment History (Buys Only)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total (TRY)</TableHead>
                <TableHead>Total (USD)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    No investment history found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{formatDate(t.date)}</TableCell>
                    <TableCell className="font-medium">{t.symbol}</TableCell>
                    <TableCell>{t.category}</TableCell>
                    <TableCell>{Math.floor(t.quantity)}</TableCell>
                    <TableCell>
                      {formatCurrency(t.price, t.category ===('US_MARKETS' as any) ? 'USD' : 'TRY')}
                    </TableCell>
                    <TableCell>
                       {t.category === 'BIST100' ? formatCurrency(t.total, 'TRY') : '-'}
                    </TableCell>
                    <TableCell>
                      {t.totalUsdValue 
                        ? formatCurrency(t.totalUsdValue, 'USD') 
                        : (t.category === 'US_MARKETS' ? formatCurrency(t.total, 'USD') : '-')
                      }
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
