import { create } from 'zustand';
import { PortfolioItem, PortfolioSummary, AssetCategory } from '@/types/portfolio.types';
import { FirestoreService } from '@/lib/firestore.service';
import { getQuotesAction, getMarketDataAction } from '@/app/actions/portfolio';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
}

interface PortfolioState {
  items: PortfolioItem[];
  isLoading: boolean;
  error: string | null;
  summary: PortfolioSummary;
  
  fetchPortfolio: (userId: string) => Promise<void>;
  refreshPrices: () => Promise<void>;
  exchangeRate: number;
  marketData: {
    bist100: MarketData | null;
    usdTry: MarketData | null;
  };
}

const initialSummary: PortfolioSummary = {
  totalValueTRY: 0,
  totalCostTRY: 0,
  totalProfitTRY: 0,
  totalProfitPercentageTRY: 0,
  bist100: {
    totalValue: 0,
    totalCost: 0,
    totalProfit: 0,
    totalProfitPercentage: 0,
    currency: 'TRY'
  },
  usMarket: {
    totalValue: 0,
    totalCost: 0,
    totalProfit: 0,
    totalProfitPercentage: 0,
    currency: 'USD'
  },
  preciousMetals: {
    totalValue: 0,
    totalCost: 0,
    totalProfit: 0,
    totalProfitPercentage: 0,
    currency: 'TRY'
  }
};

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  summary: initialSummary,
  exchangeRate: 0,
  marketData: {
    bist100: null,
    usdTry: null
  },

  fetchPortfolio: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const items = await FirestoreService.getPortfolio(userId);
      set({ items });
      
      // After fetching items, fetch current prices
      await get().refreshPrices();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  refreshPrices: async () => {
    const { items } = get();
    if (items.length === 0) {
      set({ isLoading: false, summary: initialSummary });
      return;
    }

    try {
      const symbols = items.map(item => item.symbol);
      
      // Fetch portfolio prices and market data in parallel
      const [pricesResponse, marketDataResponse] = await Promise.all([
        getQuotesAction(symbols),
        getMarketDataAction(['XU100.IS', 'TRY=X'])
      ]);

      if (!pricesResponse.success || !pricesResponse.data) {
        throw new Error(pricesResponse.error || "Failed to fetch prices");
      }

      const prices = pricesResponse.data;
      let exchangeRate = get().exchangeRate;
      let marketData = get().marketData;

      if (marketDataResponse.success && marketDataResponse.data) {
        const md = marketDataResponse.data;
        const bist100 = md['XU100.IS'];
        const usdTry = md['TRY=X'];

        if (usdTry) {
           exchangeRate = usdTry.price;
        }

        marketData = {
          bist100: bist100 || null,
          usdTry: usdTry || null
        };
        
        set({ exchangeRate, marketData });
      }
      
      // Update items with new prices and calculate values
      const updatedItems = items.map(item => {
        const currentPrice = prices[item.symbol] || item.averageCost; // Fallback to cost if no price
        const currentValue = Math.floor(item.quantity) * currentPrice;
        // Profit = Current Value - Total Cost + Cash Dividends (not reinvested)
        const profit = currentValue - item.totalCost + (item.cashDividends || 0);
        const profitPercentage = item.totalCost > 0 ? (profit / item.totalCost) * 100 : 0;
        
        let currency: 'TRY' | 'USD' = 'TRY';
        let currentValueTRY = currentValue;

        if (item.category === AssetCategory.US_MARKETS) {
          currency = 'USD';
          currentValueTRY = currentValue * exchangeRate;
        }

        return {
          ...item,
          currentPrice,
          currentValue,
          profit,
          profitPercentage,
          updatedAt: Date.now(),
          currency,
          currentValueTRY
        };
      });

      // Calculate summaries - use deep copy to avoid reference issues
      const summary: PortfolioSummary = JSON.parse(JSON.stringify(initialSummary));

      updatedItems.forEach(item => {
        if (item.category === AssetCategory.BIST100) {
          summary.bist100.totalValue += item.currentValue || 0;
          summary.bist100.totalCost += item.totalCost;
          summary.bist100.totalProfit += item.profit || 0;
          
          // Add to total TRY (BIST100 is in TRY)
          summary.totalValueTRY += item.currentValue || 0;
          summary.totalCostTRY += item.totalCost;
          summary.totalProfitTRY += item.profit || 0;
        } else if (item.category === AssetCategory.US_MARKETS) {
          summary.usMarket.totalValue += item.currentValue || 0;
          summary.usMarket.totalCost += item.totalCost;
          summary.usMarket.totalProfit += item.profit || 0;
          
          // Note: US Market is in USD, not adding to Total TRY directly without conversion
          // Now we convert using the calculated currentValueTRY
          summary.totalValueTRY += item.currentValueTRY || 0;
          // For cost, we might need historical exchange rate but for now let's assume we want current value in TRY
          // Ideally cost should be stored in TRY or converted. 
          // If we bought in USD, cost is USD. To show total portfolio cost in TRY, we need conversion.
          // For simplicity and "Total Value" focus, we use current exchange rate for cost conversion too 
          // OR we just don't add cost to Total TRY if we want to be strict.
          // But user wants "Total" tab to show everything.
          summary.totalCostTRY += item.totalCost * (item.category === AssetCategory.US_MARKETS ? exchangeRate : 1);
          
          // Profit in TRY
          // Profit = (Current Value TRY - Cost TRY) + Cash Dividends TRY (not reinvested)
          const cashDividendsTRY = (item.cashDividends || 0) * exchangeRate;
          summary.totalProfitTRY += (item.currentValueTRY || 0) - (item.totalCost * exchangeRate) + cashDividendsTRY;
        } else if (item.category === AssetCategory.PRECIOUS_METALS) {
          summary.preciousMetals.totalValue += item.currentValue || 0;
          summary.preciousMetals.totalCost += item.totalCost;
          summary.preciousMetals.totalProfit += item.profit || 0;

          // Add to total TRY (Precious Metals in TRY)
          summary.totalValueTRY += item.currentValue || 0;
          summary.totalCostTRY += item.totalCost;
          summary.totalProfitTRY += item.profit || 0;
        }
      });

      // Calculate percentages
      if (summary.bist100.totalCost > 0) {
        summary.bist100.totalProfitPercentage = (summary.bist100.totalProfit / summary.bist100.totalCost) * 100;
      }
      if (summary.usMarket.totalCost > 0) {
        summary.usMarket.totalProfitPercentage = (summary.usMarket.totalProfit / summary.usMarket.totalCost) * 100;
      }
      if (summary.preciousMetals.totalCost > 0) {
        summary.preciousMetals.totalProfitPercentage = (summary.preciousMetals.totalProfit / summary.preciousMetals.totalCost) * 100;
      }
      if (summary.totalCostTRY > 0) {
        summary.totalProfitPercentageTRY = (summary.totalProfitTRY / summary.totalCostTRY) * 100;
      }

      set({ items: updatedItems, summary, isLoading: false });
      
    } catch (error: any) {
      console.error("Error refreshing prices:", error);
      set({ error: error.message, isLoading: false });
    }
  }
}));
