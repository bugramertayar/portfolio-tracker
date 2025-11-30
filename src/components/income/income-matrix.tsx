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
import { IncomeDetailsDialog } from "./income-details-dialog"

interface IncomeMatrixProps {
  data: IncomeEntry[];
  onEdit?: (entry: IncomeEntry) => void;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function IncomeMatrix({ data, onEdit }: IncomeMatrixProps) {
  const [selectedCell, setSelectedCell] = useState<{year: number, month: number, entries: IncomeEntry[]} | null>(null);

  // Get unique years from data
  const dataYears = Array.from(new Set(data.map(d => d.year)));
  const minYear = 2025;
  const maxYear = Math.max(2036, ...dataYears); // Ensure we show at least up to 2036
  
  // Create array of years from minYear to maxYear (Ascending order: 2025, 2026, ...)
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  // Group data by year and month
  const matrix = years.reduce((acc, year) => {
    acc[year] = {};
    MONTHS.forEach((_, monthIndex) => {
      const entries = data.filter(d => d.year === year && d.month === monthIndex);
      const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
      acc[year][monthIndex] = { total, entries };
    });
    return acc;
  }, {} as Record<number, Record<number, { total: number, entries: IncomeEntry[] }>>);

  // Calculate yearly totals
  const yearlyTotals = years.reduce((acc, year) => {
    acc[year] = Object.values(matrix[year]).reduce((sum, { total }) => sum + total, 0);
    return acc;
  }, {} as Record<number, number>);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Income Matrix</CardTitle>
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
                                ? "bg-primary/10 hover:bg-primary/20 cursor-pointer font-medium text-primary" 
                                : "bg-muted/20 text-muted-foreground/50"
                            )}
                            onClick={() => {
                              if (hasData) {
                                setSelectedCell({ year, month: monthIndex, entries });
                              }
                            }}
                          >
                            {hasData ? formatCurrency(total) : "-"}
                          </div>
                        </TooltipTrigger>
                        {hasData && (
                          <TooltipContent>
                            <div className="space-y-1">
                              <p className="font-bold border-b pb-1 mb-1">Total: {formatCurrency(total)}</p>
                              {entries.map((entry) => (
                                <div key={entry.id} className="text-xs flex justify-between gap-4">
                                  <span>
                                    {entry.category}
                                    {entry.company && (
                                      <span className="text-muted-foreground ml-1">
                                        ({entry.company})
                                      </span>
                                    )}
                                  </span>
                                  <span>{formatCurrency(entry.amount)}</span>
                                </div>
                              ))}
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
    </Card>
  )
}
