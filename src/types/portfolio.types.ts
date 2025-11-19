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
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number; // Added
  date: number; // Timestamp
  category: AssetCategory;
  createdAt: number;
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
  currentPrice?: number;
  currentValue?: number; // Added
  totalValue?: number;
  profit?: number;
  profitPercentage?: number;
  category: AssetCategory;
  updatedAt?: number; // Added
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
