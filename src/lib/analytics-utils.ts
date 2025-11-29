import { Transaction, AssetCategory } from "@/types/portfolio.types";
import { format, isSameDay, startOfDay, addDays, isAfter, isBefore, eachDayOfInterval, parseISO } from "date-fns";

export interface HistoricalDataPoint {
  date: string;
  formattedDate: string;
  total: number;
  bist100: number;
  usStocks: number;
  metals: number;
}

export interface PriceHistoryMap {
  [symbol: string]: {
    date: string; // YYYY-MM-DD
    close: number;
  }[];
}

export function calculatePortfolioHistory(
  transactions: Transaction[],
  priceHistory: PriceHistoryMap,
  startDate: Date,
  endDate: Date
): HistoricalDataPoint[] {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Sort transactions by date ascending
  const sortedTransactions = [...transactions].sort((a, b) => a.date - b.date);

  // Helper to get price on a specific date
  const getPriceOnDate = (symbol: string, dateStr: string): number => {
    const history = priceHistory[symbol];
    if (!history) return 0;

    // Find exact match or last known price
    // Assuming history is sorted by date
    // We can optimize this, but for now simple find/filter
    
    // Find the price record for this date
    const exactMatch = history.find(h => h.date.startsWith(dateStr));
    if (exactMatch) return exactMatch.close;

    // If no exact match (weekend/holiday), find the last available price before this date
    const reversedHistory = [...history].reverse();
    const lastPrice = reversedHistory.find(h => h.date < dateStr);
    
    return lastPrice ? lastPrice.close : 0;
  };

  return days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayTimestamp = day.getTime();

    // Filter transactions that happened on or before this day
    const relevantTransactions = sortedTransactions.filter(t => t.date <= dayTimestamp + 86400000); // Include full day

    // Calculate holdings for this day
    const holdings: Record<string, { quantity: number; category: AssetCategory }> = {};

    relevantTransactions.forEach(t => {
      if (!holdings[t.symbol]) {
        holdings[t.symbol] = { quantity: 0, category: t.category };
      }

      if (t.type === 'BUY') {
        holdings[t.symbol].quantity += t.quantity;
      } else if (t.type === 'SELL') {
        holdings[t.symbol].quantity -= t.quantity;
      } else if (t.type === 'DIVIDEND' && t.isDividendReinvested && t.price > 0) {
         // Add reinvested shares
         const additionalShares = t.total / t.price;
         holdings[t.symbol].quantity += additionalShares;
      }
    });

    // Calculate values
    let bist100 = 0;
    let usStocks = 0;
    let metals = 0;

    Object.entries(holdings).forEach(([symbol, data]) => {
      if (data.quantity > 0) {
        const price = getPriceOnDate(symbol, dayStr);
        const value = data.quantity * price;

        if (data.category === AssetCategory.BIST100) {
          bist100 += value;
        } else if (data.category === AssetCategory.US_MARKETS) {
          // Convert USD to TRY using historical exchange rate (TRY=X symbol)
          const usdTryRate = getPriceOnDate('TRY=X', dayStr) || 34; // Fallback to 34 if exchange rate data is missing
          usStocks += value * usdTryRate;
        } else if (data.category === AssetCategory.PRECIOUS_METALS) {
          metals += value;
        }
      }
    });

    return {
      date: day.toISOString(),
      formattedDate: format(day, 'MMM dd'),
      total: bist100 + usStocks + metals,
      bist100,
      usStocks,
      metals
    };
  });
}
