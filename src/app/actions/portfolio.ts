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
