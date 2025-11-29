import { addDays, addHours, addMonths, addWeeks, addYears, format, subDays, subHours, subMonths, subYears } from "date-fns";

export type TimeRange = '1D' | '1W' | '1M' | '1Y' | '3Y' | '5Y';

export interface PortfolioDataPoint {
  date: string;
  bist100: number;
  usStocks: number;
  metals: number;
  formattedDate: string;
}

const generateRandomWalk = (startValue: number, steps: number, volatility: number, trend: number): number[] => {
  let currentValue = startValue;
  const values = [currentValue];

  for (let i = 0; i < steps; i++) {
    const change = (Math.random() - 0.5) * volatility + trend;
    currentValue = currentValue * (1 + change);
    values.push(currentValue);
  }

  return values;
};

export const generatePortfolioHistory = (range: TimeRange): PortfolioDataPoint[] => {
  const now = new Date();
  let startDate: Date;
  let points: number;
  let volatility: number;
  let trend: number; // Daily trend
  let dateFormat: string;

  // Base values for each category
  const bist100Base = 75000;
  const usStocksBase = 35000;
  const metalsBase = 15000;

  switch (range) {
    case '1D':
      startDate = subDays(now, 1);
      points = 24; // Hourly
      volatility = 0.005; // Low volatility for hourly
      trend = 0.0005;
      dateFormat = 'HH:mm';
      break;
    case '1W':
      startDate = subDays(now, 7);
      points = 7 * 4; // Every 6 hours approx
      volatility = 0.01;
      trend = 0.001;
      dateFormat = 'EEE HH:mm';
      break;
    case '1M':
      startDate = subMonths(now, 1);
      points = 30; // Daily
      volatility = 0.015;
      trend = 0.0015;
      dateFormat = 'MMM dd';
      break;
    case '1Y':
      startDate = subYears(now, 1);
      points = 52; // Weekly
      volatility = 0.02;
      trend = 0.002;
      dateFormat = 'MMM dd';
      break;
    case '3Y':
      startDate = subYears(now, 3);
      points = 36; // Monthly
      volatility = 0.03;
      trend = 0.0025;
      dateFormat = 'MMM yyyy';
      break;
    case '5Y':
      startDate = subYears(now, 5);
      points = 60; // Monthly
      volatility = 0.035;
      trend = 0.003;
      dateFormat = 'MMM yyyy';
      break;
    default:
      startDate = subMonths(now, 1);
      points = 30;
      volatility = 0.015;
      trend = 0.0015;
      dateFormat = 'MMM dd';
  }

  const bist100Values = generateRandomWalk(bist100Base, points, volatility, trend);
  const usStocksValues = generateRandomWalk(usStocksBase, points, volatility, trend);
  const metalsValues = generateRandomWalk(metalsBase, points, volatility, trend);
  
  // Create data points
  const data: PortfolioDataPoint[] = bist100Values.map((_, index) => {
    let date: Date;
    
    // Calculate date based on range
    if (range === '1D') {
        date = addHours(startDate, index);
    } else if (range === '1W') {
        const totalHours = 7 * 24;
        const hoursToAdd = (totalHours / points) * index;
        date = addHours(startDate, hoursToAdd);
    } else if (range === '1M') {
        date = addDays(startDate, index);
    } else if (range === '1Y') {
        date = addWeeks(startDate, index);
    } else if (range === '3Y' || range === '5Y') {
        date = addMonths(startDate, index);
    } else {
        date = addDays(startDate, index);
    }

    return {
      date: date.toISOString(),
      bist100: Math.round(bist100Values[index] * 100) / 100,
      usStocks: Math.round(usStocksValues[index] * 100) / 100,
      metals: Math.round(metalsValues[index] * 100) / 100,
      formattedDate: format(date, dateFormat),
    };
  });

  return data;
};
