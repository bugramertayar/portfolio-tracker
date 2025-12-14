'use server'

import { YahooFinanceService } from "@/lib/yahoo-finance.service";

export async function getQuotesAction(symbols: string[]) {
  try {
    const prices = await YahooFinanceService.getPrices(symbols);
    return { success: true, data: prices };
  } catch (error: any) {
    console.error("Server Action Error:", error);
    return { success: false, error: error.message };
  }
}

export async function searchAssetsAction(query: string) {
  try {
    const results = await YahooFinanceService.searchAssets(query);
    return { success: true, data: results };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getHistoricalPricesAction(symbol: string, period1: Date, period2: Date, interval: '1d' | '1wk' | '1mo' = '1d') {
  try {
    const prices = await YahooFinanceService.getHistoricalPrices(symbol, period1, period2, interval);
    return { success: true, data: prices };
  } catch (error: any) {
    console.error("Server Action Error (Historical):", error);
    return { success: false, error: error.message };
  }
}


export async function getExchangeRateAction() {
  try {
    const rate = await YahooFinanceService.getPrice("USDTRY=X");
    return { success: true, data: rate };
  } catch (error: any) {
    console.error("Server Action Error (Exchange Rate):", error);
    return { success: false, error: error.message };
  }
}
