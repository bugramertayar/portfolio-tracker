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
import { IncomeEntry } from "@/types/income"
import { formatCurrency } from "@/lib/formatters"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface IncomeHistoryTableProps {
  incomes: IncomeEntry[]
}

const ITEMS_PER_PAGE = 15

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function IncomeHistoryTable({ incomes }: IncomeHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1)

  // Sort incomes by date (year/month) descending
  // If year and month are equal, you might want to sort by createdAt if available, 
  // but for now year/month is the primary sort key.
  const sortedIncomes = [...incomes].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    if (a.month !== b.month) return b.month - a.month
    // Secondary sort by createdAt if available to show most recently added first within the same month
    if (a.createdAt && b.createdAt) {
        return b.createdAt.toMillis() - a.createdAt.toMillis();
    }
    return 0
  })

  const totalPages = Math.ceil(sortedIncomes.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedIncomes = sortedIncomes.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Income History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Amount (TRY)</TableHead>
                <TableHead>Amount (USD)</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedIncomes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    No income history found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedIncomes.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell className="font-medium">{income.category}</TableCell>
                    <TableCell>{income.company || "-"}</TableCell>
                    <TableCell>{formatCurrency(income.amount, 'TRY')}</TableCell>
                    <TableCell>
                      {income.amountUsd 
                        ? formatCurrency(income.amountUsd, 'USD') 
                        : '-'}
                    </TableCell>
                    <TableCell>{`${MONTHS[income.month]} ${income.year}`}</TableCell>
                    <TableCell>{income.description || "-"}</TableCell>
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
