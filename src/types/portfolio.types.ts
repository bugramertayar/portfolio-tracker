export enum AssetCategory {
  BIST100 = 'BIST100',
  US_MARKETS = 'US_MARKETS',
  PRECIOUS_METALS = 'PRECIOUS_METALS',
}

export interface Asset {
  symbol: string;
  name: string;
  category: AssetCategory;
  currency: 'TRY' | 'USD';
}

export interface Transaction {
  id: string;
  userId: string;
  assetId: string; // Symbol or unique ID
  symbol: string;
  type: 'BUY' | 'SELL' | 'DIVIDEND';
  quantity: number;
  price: number;
  total: number; // Added
  date: number; // Timestamp
  category: AssetCategory;
  createdAt: number;
  isDividendReinvested?: boolean; // Only for DIVIDEND type - tracks if dividend was reinvested
  totalUsdValue?: number; // Added: Total value in USD at the time of transaction
}

export interface PortfolioItem {
  id?: string; // Firestore ID
  userId?: string;
  assetId?: string;
  symbol: string;
  name: string;
  quantity: number;
  averageCost: number;
  totalCost: number; // Added
  totalDividends?: number; // Total dividends received (cash + reinvested) - for display
  cashDividends?: number; // Only cash dividends - used in P/L calculation
  reinvestedDividends?: number; // Only reinvested dividends - for display
  currentPrice?: number;
  currentValue?: number; // Added
  totalValue?: number;
  profit?: number;
  profitPercentage?: number;
  category: AssetCategory;
  updatedAt?: number; // Added
  currency?: 'TRY' | 'USD';
  currentValueTRY?: number;
}

export interface CategorySummary {
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  totalProfitPercentage: number;
  currency: 'TRY' | 'USD';
}

export interface PortfolioSummary {
  totalValueTRY: number;
  totalCostTRY: number;
  totalProfitTRY: number;
  totalProfitPercentageTRY: number;
  bist100: CategorySummary;
  usMarket: CategorySummary;
  preciousMetals: CategorySummary;
}
