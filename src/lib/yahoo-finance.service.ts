import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

interface PriceCache {
  [symbol: string]: {
    price: number;
    timestamp: number;
  };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const priceCache: PriceCache = {};

export const YahooFinanceService = {
  async getPrice(symbol: string): Promise<number> {
    // Check cache first
    const cached = priceCache[symbol];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.price;
    }

    try {
      const quote = await yahooFinance.quote(symbol);
      const price = (quote as any).regularMarketPrice || (quote as any).currentPrice || 0;
      
      // Update cache
      priceCache[symbol] = {
        price,
        timestamp: Date.now()
      };

      return price;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      // Return cached price if available (even if expired) to avoid breaking UI
      if (cached) return cached.price;
      throw error;
    }
  },

  async getPrices(symbols: string[]): Promise<Record<string, number>> {
    const results: Record<string, number> = {};
    const symbolsToFetch: string[] = [];

    // Check cache first
    symbols.forEach(symbol => {
      const cached = priceCache[symbol];
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        results[symbol] = cached.price;
      } else {
        symbolsToFetch.push(symbol);
      }
    });

    if (symbolsToFetch.length === 0) {
      return results;
    }

    try {
      // yahoo-finance2 doesn't have a bulk quote method exposed simply in all versions,
      // but we can map over symbols. For better performance in production, 
      // we might want to look for a bulk endpoint or batch these.
      // For now, parallel requests are okay for small portfolios.
      const quotes = await Promise.all(
        symbolsToFetch.map(symbol => (yahooFinance.quote(symbol) as Promise<any>).catch(() => null))
      );

      quotes.forEach((quote, index) => {
        const symbol = symbolsToFetch[index];
        if (quote) {
          const price = (quote as any).regularMarketPrice || (quote as any).currentPrice || 0;
          results[symbol] = price;
          priceCache[symbol] = {
            price,
            timestamp: Date.now()
          };
        }
      });

      return results;
    } catch (error) {
      console.error("Error fetching prices:", error);
      return results;
    }
  },

  async searchAssets(query: string): Promise<any[]> {
    try {
      const results = await yahooFinance.search(query) as any;
      // console.log("Raw search results:", results);
      // Filter out items without a symbol
      return results.quotes.filter((quote: any) => quote.symbol);
    } catch (error) {
      console.error("Error searching assets:", error);
      return [];
    }
  },

  async getHistoricalPrices(symbol: string, period1: Date, period2: Date, interval: '1d' | '1wk' | '1mo' = '1d'): Promise<any[]> {
    try {
      const queryOptions = {
        period1,
        period2,
        interval
      };
      const result = await yahooFinance.historical(symbol, queryOptions);
      return result;
    } catch (error) {
      console.error(`Error fetching historical prices for ${symbol}:`, error);
      return [];
    }
  },
  async getQuotesWithData(symbols: string[]): Promise<Record<string, { price: number, change: number, changePercent: number, currency: string, symbol: string }>> {
    const results: Record<string, { price: number, change: number, changePercent: number, currency: string, symbol: string }> = {};
    
    if (symbols.length === 0) {
      return results;
    }

    try {
      const quotes = await Promise.all(
        symbols.map(symbol => (yahooFinance.quote(symbol) as Promise<any>).catch(() => null))
      );

      quotes.forEach((quote, index) => {
        const symbol = symbols[index];
        if (quote) {
          const price = (quote as any).regularMarketPrice || (quote as any).currentPrice || 0;
          const change = (quote as any).regularMarketChange || 0;
          const changePercent = (quote as any).regularMarketChangePercent || 0;
          const currency = (quote as any).currency || 'USD';
          
          results[symbol] = {
            price,
            change,
            changePercent,
            currency,
            symbol
          };
          
          // Also update the simple price cache since we have the data
          priceCache[symbol] = {
            price,
            timestamp: Date.now()
          };
        }
      });

      return results;
    } catch (error) {
      console.error("Error fetching quotes with data:", error);
      return results;
    }
  }
};
