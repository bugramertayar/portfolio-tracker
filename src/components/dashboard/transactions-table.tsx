"use client"

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

interface TransactionsTableProps {
  transactions: Transaction[]
  currency?: 'TRY' | 'USD'
}

export function TransactionsTable({ transactions, currency = 'TRY' }: TransactionsTableProps) {
  return (
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
                  <Badge variant={transaction.type === 'BUY' ? 'default' : 'destructive'}>
                    {transaction.type}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{transaction.symbol}</TableCell>
                <TableCell>{transaction.quantity}</TableCell>
                <TableCell>{formatCurrency(transaction.price, currency)}</TableCell>
                <TableCell>{formatCurrency(transaction.total || (transaction.price * transaction.quantity), currency)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
