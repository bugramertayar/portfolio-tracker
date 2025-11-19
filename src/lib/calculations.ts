import { PortfolioItem, AssetCategory } from "@/types/portfolio.types";

export const calculatePortfolioTotal = (items: PortfolioItem[]) => {
  return items.reduce((total, item) => total + (item.currentValueTRY || item.currentValue || 0), 0);
};

export const calculateProfitLoss = (currentValue: number, totalCost: number) => {
  return currentValue - totalCost;
};

export const calculateProfitLossPercentage = (profit: number, totalCost: number) => {
  if (totalCost === 0) return 0;
  return (profit / totalCost) * 100;
};

export const calculateAverageCost = (totalCost: number, quantity: number) => {
  if (quantity === 0) return 0;
  return totalCost / quantity;
};

export const calculateDistribution = (items: PortfolioItem[]) => {
  const totalValue = calculatePortfolioTotal(items);
  if (totalValue === 0) return {};

  const distribution: Record<string, number> = {};
  
  items.forEach(item => {
    const itemValue = item.currentValueTRY || item.currentValue || 0;
    distribution[item.category] = (distribution[item.category] || 0) + itemValue;
  });

  // Convert to percentages
  Object.keys(distribution).forEach(key => {
    distribution[key] = (distribution[key] / totalValue) * 100;
  });

  return distribution;
};
