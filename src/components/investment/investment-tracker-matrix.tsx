"use client"

import { Transaction } from "@/types/portfolio.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useState, useMemo } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"

interface InvestmentTrackerMatrixProps {
  transactions: Transaction[];
  currentUsdRate: number;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function InvestmentTrackerMatrix({ transactions, currentUsdRate }: InvestmentTrackerMatrixProps) {
  const [currency, setCurrency] = useState<"TRY" | "USD">("TRY");

  // Filter only BUY transactions
  const buyTransactions = useMemo(() => 
    transactions.filter(t => t.type === 'BUY'), 
  [transactions]);

  // Extract years
  const years = useMemo(() => {
    let minYear = 2025;
    let maxYear = 2036;

    if (buyTransactions.length > 0) {
      const uniqueYears = Array.from(new Set(buyTransactions.map(t => new Date(t.date).getFullYear())));
      const dataMin = Math.min(...uniqueYears);
      const dataMax = Math.max(...uniqueYears);
      
      minYear = Math.min(minYear, dataMin);
      maxYear = Math.max(maxYear, dataMax);
    }
    
    return Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
  }, [buyTransactions]);

  // Group data by year and month
  const matrix = useMemo(() => {
    const acc: Record<number, Record<number, { total: number, entries: Transaction[] }>> = {};
    
    years.forEach(year => {
      acc[year] = {};
      MONTHS.forEach((_, monthIndex) => {
        const entries = buyTransactions.filter(t => {
           const d = new Date(t.date);
           return d.getFullYear() === year && d.getMonth() === monthIndex;
        });

        const total = entries.reduce((sum, t) => {
           if (currency === 'USD') {
             // Use stored totalUsdValue if available, otherwise fallback using current rate
             // If t.totalUsdValue is set, use it.
             // If not (e.g. old US stock purchase before migration?), use total (assuming it was USD if category US)
             // Or calculate from total (TRY) / rate.
             
             if (t.totalUsdValue) return sum + t.totalUsdValue;
             
             // Fallbacks
             if (t.category === 'US_MARKETS') return sum + t.total;
             
             // If BIST and no usd value (shouldn't happen after migration), use current rate or fixed
             return sum + (t.total / (currentUsdRate || 42));
           } else {
             // TRY View
             if (t.category === 'BIST100') return sum + t.total;
             
             // For US Markets, we want the TRY equivalent. 
             // Ideally historical, but we don't track it.
             // Use current rate * USD value.
             const usdVal = t.totalUsdValue || t.total; 
             return sum + (usdVal * (currentUsdRate || 35));
           }
        }, 0);
        
        acc[year][monthIndex] = { total, entries };
      });
    });
    return acc;
  }, [years, buyTransactions, currency, currentUsdRate]);

  const yearlyTotals = useMemo(() => {
    return years.reduce((acc, year) => {
      acc[year] = Object.values(matrix[year] || {}).reduce((sum, val) => sum + (val?.total || 0), 0);
      return acc;
    }, {} as Record<number, number>);
  }, [years, matrix]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(currency === 'TRY' ? 'tr-TR' : 'en-US', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
  };
  
  const formatMoney = (amount: number, currencyCode: "TRY" | "USD") => {
     return new Intl.NumberFormat(currencyCode === 'TRY' ? 'tr-TR' : 'en-US', { 
      style: 'currency', 
      currency: currencyCode
    }).format(amount);
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Investment Tracker Matrix</CardTitle>
        <div className="flex items-center space-x-2">
          <Label htmlFor="currency-mode" className="text-sm font-medium">
             {currency}
          </Label>
          <Switch 
             id="currency-mode"
             checked={currency === 'USD'}
             onCheckedChange={(checked) => setCurrency(checked ? 'USD' : 'TRY')}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <div className="flex w-max space-x-4 p-4">
            {/* Month Labels Column */}
            <div className="flex flex-col space-y-2 pt-12">
              {MONTHS.map((month) => (
                <div key={month} className="h-10 flex items-center font-medium text-sm text-muted-foreground w-16">
                  {month}
                </div>
              ))}
              <div className="h-10 flex items-center font-bold text-sm w-16 border-t mt-2">
                Total
              </div>
            </div>

            {/* Year Columns */}
            {years.map((year) => (
              <div key={year} className="flex flex-col space-y-2 min-w-[120px]">
                <div className="h-10 flex items-center justify-center font-bold text-lg border-b mb-2">
                  {year}
                </div>
                {MONTHS.map((_, monthIndex) => {
                  const { total, entries } = matrix[year][monthIndex];
                  const hasData = total > 0;

                  return (
                    <TooltipProvider key={`${year}-${monthIndex}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "h-10 flex items-center justify-center rounded-md border text-sm transition-colors",
                              hasData 
                                ? "bg-primary/10 hover:bg-primary/20 font-medium text-primary cursor-pointer" 
                                : "bg-muted/20 text-muted-foreground/50 cursor-default"
                            )}
                          >
                            {hasData ? formatCurrency(total) : "-"}
                          </div>
                        </TooltipTrigger>
                        {hasData && (
                          <TooltipContent className="min-w-[300px] p-0">
                            <div className="p-3">
                              <div className="font-bold border-b pb-2 mb-2 flex justify-between items-center">
                                <span>{MONTHS[monthIndex]} {year}</span>
                                <span className="text-primary">{formatCurrency(total)}</span>
                              </div>
                              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-muted-foreground mb-1">
                                    <span>Symbol</span>
                                    <span>Date</span>
                                    <span className="text-right">TRY</span>
                                    <span className="text-right">USD</span>
                                </div>
                                {entries.map((entry) => {
                                  // Determine display values for individual row
                                  const tryVal = entry.category === 'BIST100' ? entry.total : (entry.total * currentUsdRate);
                                  const usdVal = entry.totalUsdValue || (entry.category === 'US_MARKETS' ? entry.total : entry.total / (currentUsdRate || 42));
                                  
                                  return (
                                    <div key={entry.id} className="grid grid-cols-4 gap-2 text-xs border-b border-muted/50 last:border-0 pb-1">
                                      <span className="font-medium">{entry.symbol}</span>
                                      <span className="text-muted-foreground">{format(new Date(entry.date), 'dd MMM')}</span>
                                      <span className="text-right whitespace-nowrap">{formatMoney(tryVal, 'TRY')}</span>
                                      <span className="text-right whitespace-nowrap">{formatMoney(usdVal, 'USD')}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
                <div className="h-10 flex items-center justify-center font-bold text-sm border-t mt-2 bg-muted/50 rounded-md">
                  {formatCurrency(yearlyTotals[year])}
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
