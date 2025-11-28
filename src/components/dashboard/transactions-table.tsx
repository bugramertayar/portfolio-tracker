"use client"

import { RefreshCw } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Transaction } from "@/types/portfolio.types"
import { formatCurrency, formatDate } from "@/lib/formatters"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { AddTransactionDialog } from "./add-transaction-dialog"

interface TransactionsTableProps {
  transactions: Transaction[]
  currency?: 'TRY' | 'USD'
  onRefresh?: () => void
  isRefreshing?: boolean
  userId?: string
}

export function TransactionsTable({ 
  transactions, 
  currency = 'TRY',
  onRefresh,
  isRefreshing = false,
  userId
}: TransactionsTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <div className="flex items-center space-x-2">
          {userId && <AddTransactionDialog userId={userId} />}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === 'BUY' ? 'default' : transaction.type === 'SELL' ? 'destructive' : 'secondary'}>
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{transaction.symbol}</TableCell>
                  <TableCell>{transaction.type === 'DIVIDEND' ? '-' : transaction.quantity}</TableCell>
                  <TableCell>{transaction.type === 'DIVIDEND' ? '-' : formatCurrency(transaction.price, transaction.category === 'US_MARKETS' ? 'USD' : currency)}</TableCell>
                  <TableCell>{formatCurrency(transaction.total || (transaction.price * transaction.quantity), transaction.category === 'US_MARKETS' ? 'USD' : currency)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
