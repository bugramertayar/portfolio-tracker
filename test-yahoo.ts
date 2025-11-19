
import { YahooFinanceService } from "./src/lib/yahoo-finance.service";

async function test() {
  try {
    console.log("Testing searchAssets...");
    const results = await YahooFinanceService.searchAssets("AAPL");
    console.log("Search Results:", results);
    
    if (results.length > 0) {
        console.log("SUCCESS: Found assets.");
    } else {
        console.log("WARNING: No assets found, but no error.");
    }

    console.log("Testing getPrice...");
    const price = await YahooFinanceService.getPrice("AAPL");
    console.log("Price:", price);
  } catch (error) {
    console.error("ERROR:", error);
  }
}

test();
