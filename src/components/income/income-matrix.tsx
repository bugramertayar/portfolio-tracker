"use client"

import { IncomeEntry } from "@/types/income"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { IncomeDetailsDialog } from "./income-details-dialog"
import { AddIncomeDialog } from "./add-income-dialog"
import { useEffect } from "react" // Re-add useEffect

interface IncomeMatrixProps {
  data: IncomeEntry[];
  onEdit?: (entry: IncomeEntry) => void;
  userId: string;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function IncomeMatrix({ data, onEdit, userId }: IncomeMatrixProps) {
  const [selectedCell, setSelectedCell] = useState<{year: number, month: number, entries: IncomeEntry[]} | null>(null);
  const [addIncomeCell, setAddIncomeCell] = useState<{year: number, month: number} | null>(null);
  const [currency, setCurrency] = useState<"TRY" | "USD">("TRY");
  const [usdRate, setUsdRate] = useState<number>(35);

  useEffect(() => {
    // Fetch rate once for fallback calculations
    import("@/app/actions/portfolio").then(mod => {
        mod.getExchangeRateAction().then(res => {
            if (res.success && res.data) setUsdRate(res.data as number);
        });
    });
  }, []);

  // Get unique years from data
  const dataYears = Array.from(new Set(data.map(d => d.year)));
  const minYear = 2025;
  const maxYear = Math.max(2036, ...dataYears); 
  
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  // Group data by year and month
  const matrix = years.reduce((acc, year) => {
    acc[year] = {};
    MONTHS.forEach((_, monthIndex) => {
      const entries = data.filter(d => d.year === year && d.month === monthIndex);
      const total = entries.reduce((sum, entry) => {
         if (currency === 'USD') {
             // Use amountUsd if exists, else fallback
             if (entry.amountUsd) return sum + entry.amountUsd;
             return sum + (entry.amount / usdRate);
         }
         return sum + entry.amount;
      }, 0);
      acc[year][monthIndex] = { total, entries };
    });
    return acc;
  }, {} as Record<number, Record<number, { total: number, entries: IncomeEntry[] }>>);

  const yearlyTotals = years.reduce((acc, year) => {
    acc[year] = Object.values(matrix[year]).reduce((sum, { total }) => sum + total, 0);
    return acc;
  }, {} as Record<number, number>);

  const formatCurrency = (amount: number, code: "TRY" | "USD" = currency) => {
    return new Intl.NumberFormat(code === 'TRY' ? 'tr-TR' : 'en-US', { style: 'currency', currency: code }).format(amount);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Income Matrix</CardTitle>
        <div className="flex items-center space-x-2">
           <Label htmlFor="income-currency-mode" className="text-sm font-medium">
             {currency}
           </Label>
           <Switch 
             id="income-currency-mode"
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
                              "h-10 flex items-center justify-center rounded-md border text-sm transition-colors cursor-pointer",
                              hasData 
                                ? "bg-primary/10 hover:bg-primary/20 font-medium text-primary" 
                                : "bg-muted/20 text-muted-foreground/50 hover:bg-muted/30"
                            )}
                            onClick={() => {
                              if (hasData) {
                                setSelectedCell({ year, month: monthIndex, entries });
                              } else {
                                setAddIncomeCell({ year, month: monthIndex });
                              }
                            }}
                          >
                            {hasData ? formatCurrency(total) : "-"}
                          </div>
                        </TooltipTrigger>
                        {hasData && (
                          <TooltipContent className="min-w-[300px]">
                            <div className="space-y-1">
                              <p className="font-bold border-b pb-1 mb-1 flex justify-between">
                                  <span>Total:</span>
                                  <span>{formatCurrency(total)}</span>
                              </p>
                              <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-muted-foreground mb-1">
                                  <span className="col-span-2">Source</span>
                                  <span className="text-right">TRY</span>
                                  <span className="text-right">USD</span>
                              </div>
                              {entries.map((entry) => {
                                 const usdVal = entry.amountUsd || (entry.amount / usdRate);
                                 return (
                                    <div key={entry.id} className="grid grid-cols-4 gap-2 text-xs border-b border-muted/50 last:border-0 pb-1">
                                      <span className="col-span-2 truncate">
                                        {entry.category}
                                        {entry.company && <span className="text-muted-foreground ml-1">({entry.company})</span>}
                                      </span>
                                      <span className="text-right whitespace-nowrap">{formatCurrency(entry.amount, 'TRY')}</span>
                                      <span className="text-right whitespace-nowrap">{formatCurrency(usdVal, 'USD')}</span>
                                    </div>
                                 );
                              })}
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

      {selectedCell && (
        <IncomeDetailsDialog
          isOpen={!!selectedCell}
          onClose={() => setSelectedCell(null)}
          year={selectedCell.year}
          month={selectedCell.month}
          entries={selectedCell.entries}
          onUpdate={() => {
            setSelectedCell(null);
            if (onEdit) onEdit(selectedCell.entries[0]); // Trigger refresh in parent
          }}
        />
      )}

      {addIncomeCell && (
        <AddIncomeDialog
          userId={userId}
          initialYear={addIncomeCell.year}
          initialMonth={addIncomeCell.month}
          isOpen={!!addIncomeCell}
          onOpenChange={(open) => {
            if (!open) setAddIncomeCell(null);
          }}
          onSuccess={() => {
            setAddIncomeCell(null);
            if (onEdit) onEdit({} as IncomeEntry); // Trigger refresh in parent
          }}
        />
      )}
    </Card>
  )
}
