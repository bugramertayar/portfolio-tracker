import { create } from 'zustand';
import { PortfolioItem, PortfolioSummary, AssetCategory } from '@/types/portfolio.types';
import { FirestoreService } from '@/lib/firestore.service';
import { getQuotesAction } from '@/app/actions/portfolio';

interface PortfolioState {
  items: PortfolioItem[];
  isLoading: boolean;
  error: string | null;
  summary: PortfolioSummary;
  
  fetchPortfolio: (userId: string) => Promise<void>;
  refreshPrices: () => Promise<void>;
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
      const response = await getQuotesAction(symbols);

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch prices");
      }

      const prices = response.data;
      
      // Update items with new prices and calculate values
      const updatedItems = items.map(item => {
        const currentPrice = prices[item.symbol] || item.averageCost; // Fallback to cost if no price
        const currentValue = item.quantity * currentPrice;
        const profit = currentValue - item.totalCost;
        const profitPercentage = item.totalCost > 0 ? (profit / item.totalCost) * 100 : 0;

        return {
          ...item,
          currentPrice,
          currentValue,
          profit,
          profitPercentage,
          updatedAt: Date.now()
        };
      });

      // Calculate summaries
      const summary = { ...initialSummary };

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
          // For now, keeping them separate as per plan
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
