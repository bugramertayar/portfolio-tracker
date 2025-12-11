import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  runTransaction,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  limit,
  startAfter,
  QueryDocumentSnapshot
} from "firebase/firestore";
import { db } from "./firebase";
import { 
  PortfolioItem, 
  Transaction, 
  AssetCategory 
} from "@/types/portfolio.types";
import { IncomeEntry } from "@/types/income";

// Collection references
const USERS_COLLECTION = "users";
const PORTFOLIOS_COLLECTION = "portfolios";
const TRANSACTIONS_COLLECTION = "transactions";
const QUOTES_COLLECTION = "quotes";
const INCOMES_COLLECTION = "incomes";

export const FirestoreService = {
  // Portfolio Operations
  async getPortfolio(userId: string): Promise<PortfolioItem[]> {
    try {
      const q = query(
        collection(db, USERS_COLLECTION, userId, PORTFOLIOS_COLLECTION)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PortfolioItem));
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      throw error;
    }
  },

  async getPortfolioItem(userId: string, symbol: string): Promise<PortfolioItem | null> {
    try {
      // We use symbol as ID for uniqueness within user's portfolio
      const docRef = doc(db, USERS_COLLECTION, userId, PORTFOLIOS_COLLECTION, symbol);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as PortfolioItem;
      }
      return null;
    } catch (error) {
      console.error("Error fetching portfolio item:", error);
      throw error;
    }
  },

  async updatePortfolioItemDividends(userId: string, symbol: string, dividendAmount: number): Promise<void> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId, PORTFOLIOS_COLLECTION, symbol);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error(`Portfolio item ${symbol} not found`);
      }
      
      const currentData = docSnap.data() as PortfolioItem;
      const newTotalDividends = (currentData.totalDividends || 0) + dividendAmount;
      const newCashDividends = (currentData.cashDividends || 0) + dividendAmount;
      
      await updateDoc(docRef, {
        totalDividends: newTotalDividends,
        cashDividends: newCashDividends,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error("Error updating portfolio item dividends:", error);
      throw error;
    }
  },

  // Transaction Operations
  async addTransaction(
    userId: string, 
    transactionData: Omit<Transaction, "id" | "createdAt" | "date"> & { date?: number }
  ): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        // 1. Read portfolio item first (Reads must come before writes)
        const portfolioRef = doc(db, USERS_COLLECTION, userId, PORTFOLIOS_COLLECTION, transactionData.symbol);
        const portfolioDoc = await transaction.get(portfolioRef);

        // 2. Prepare transaction record
        const transactionRef = doc(collection(db, USERS_COLLECTION, userId, TRANSACTIONS_COLLECTION));
        
        // Clean undefined values (Firestore doesn't accept undefined)
        const cleanedData = Object.fromEntries(
          Object.entries(transactionData).filter(([_, value]) => value !== undefined)
        );
        
        const transactionDate = transactionData.date || Date.now();

        const newTransaction: any = {
          ...cleanedData,
          date: transactionDate,
          createdAt: Date.now()
        };

        // 3. Calculate portfolio updates
        if (!portfolioDoc.exists()) {
          // New asset
          if (transactionData.type === 'SELL') {
            throw new Error("Cannot sell an asset you don't own");
          }

          const newPortfolioItem: Omit<PortfolioItem, "id"> = {
            userId,
            assetId: transactionData.assetId,
            symbol: transactionData.symbol,
            name: transactionData.symbol, // Ideally we get name from asset metadata
            category: transactionData.category,
            quantity: Math.floor(transactionData.quantity),
            averageCost: transactionData.price,
            totalCost: transactionData.total,
            updatedAt: Date.now()
          };
          
          // 4. Perform writes
          transaction.set(transactionRef, newTransaction);
          transaction.set(portfolioRef, newPortfolioItem);
        } else {
          // Update existing asset
          const currentData = portfolioDoc.data() as PortfolioItem;
          let newQuantity = currentData.quantity;
          let newTotalCost = currentData.totalCost;
          let newTotalDividends = currentData.totalDividends || 0;
          let newCashDividends = currentData.cashDividends || 0;
          let newReinvestedDividends = currentData.reinvestedDividends || 0;

          if (transactionData.type === 'BUY') {
            newQuantity += Math.floor(transactionData.quantity);
            newTotalCost += transactionData.total;
          } else if (transactionData.type === 'SELL') {
            // SELL
            const sellQuantity = Math.floor(transactionData.quantity);
            if (currentData.quantity < sellQuantity) {
              throw new Error("Insufficient quantity to sell");
            }
            newQuantity -= sellQuantity;
            // For sell, we reduce total cost proportionally to keep average cost same
            const costPerShare = currentData.totalCost / currentData.quantity;
            newTotalCost -= (costPerShare * sellQuantity);
          } else if (transactionData.type === 'DIVIDEND') {
            // Track total dividends for display
            newTotalDividends += transactionData.total;
            
            if (transactionData.isDividendReinvested) {
              // Reinvested dividend: keep cost basis same (money from pocket unchanged) but increase quantity
              newReinvestedDividends += transactionData.total;
              // DO NOT reduce totalCost - the original investment amount stays the same
              // Only increase quantity based on reinvestment price
              // Note: transactionData.price should be the price at which dividend was reinvested
              if (transactionData.price > 0) {
                // Floor the additional shares to avoid fractional shares
                const additionalShares = Math.floor(transactionData.total / transactionData.price);
                newQuantity += additionalShares;
              }
              // New average cost will be: original totalCost / new quantity
            } else {
              // Cash dividend: only add to cash dividends (affects P/L)
              newCashDividends += transactionData.total;
            }

            // Add to Income Tracker
            const incomeRef = doc(collection(db, INCOMES_COLLECTION));
            const incomeDateObj = new Date(transactionDate);
            
            const incomeData: any = {
              userId,
              year: incomeDateObj.getFullYear(),
              month: incomeDateObj.getMonth(),
              amount: transactionData.total,
              category: "Dividend",
              description: `Dividend from ${transactionData.symbol}` + (transactionData.isDividendReinvested ? " (Reinvested)" : ""),
              company: transactionData.symbol,
              createdAt: Timestamp.now()
            };
            
            transaction.set(incomeRef, incomeData);
          }

          // 4. Perform writes
          transaction.set(transactionRef, newTransaction);
          
          if (newQuantity <= 0 && transactionData.type !== 'DIVIDEND') {
            // Only delete if quantity is 0 AND it's not a dividend transaction (though dividend shouldn't happen on 0 quantity usually)
            // Actually if sell makes it 0, we delete.
            // If dividend comes, quantity doesn't change.
            transaction.delete(portfolioRef);
          } else {
            transaction.update(portfolioRef, {
              quantity: newQuantity,
              totalCost: newTotalCost,
              averageCost: newQuantity > 0 ? newTotalCost / newQuantity : 0,
              totalDividends: newTotalDividends,
              cashDividends: newCashDividends,
              reinvestedDividends: newReinvestedDividends,
              updatedAt: Date.now()
            });
          }
        }
      });
    } catch (error) {
      console.error("Error adding transaction:", error);
      throw error;
    }
  },

  async getTransactions(userId: string, category?: AssetCategory): Promise<Transaction[]> {
    try {
      let q = query(
        collection(db, USERS_COLLECTION, userId, TRANSACTIONS_COLLECTION),
        orderBy("date", "desc")
      );

      if (category) {
        q = query(
          collection(db, USERS_COLLECTION, userId, TRANSACTIONS_COLLECTION),
          where("category", "==", category),
          orderBy("date", "desc")
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  },

  async getPaginatedTransactions(
    userId: string, 
    category?: AssetCategory,
    limitCount: number = 10, 
    lastVisible?: QueryDocumentSnapshot
  ): Promise<{ transactions: Transaction[], lastVisible: QueryDocumentSnapshot | null }> {
    try {
      let constraints: any[] = [orderBy("date", "desc")];
      
      if (category) {
        constraints = [where("category", "==", category), ...constraints];
      }
      
      if (lastVisible) {
        constraints.push(startAfter(lastVisible));
      }
      
      constraints.push(limit(limitCount));

      const q = query(
        collection(db, USERS_COLLECTION, userId, TRANSACTIONS_COLLECTION),
        ...constraints
      );

      const querySnapshot = await getDocs(q);
      const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
      const transactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      
      return { transactions, lastVisible: lastVisibleDoc };
    } catch (error) {
      console.error("Error fetching paginated transactions:", error);
      throw error;
    }
  },

  // Income Operations
  async addIncome(userId: string, data: Omit<IncomeEntry, "id" | "userId" | "createdAt">) {
    try {
      // Validate required fields
      if (!userId || typeof userId !== 'string') {
        throw new Error("Invalid userId");
      }
      
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid income data");
      }
      
      if (typeof data.year !== 'number' || data.year < 2000 || data.year > 2100) {
        throw new Error("Invalid year");
      }
      
      if (typeof data.month !== 'number' || data.month < 0 || data.month > 11) {
        throw new Error("Invalid month");
      }
      
      if (typeof data.amount !== 'number' || data.amount <= 0) {
        throw new Error("Invalid amount");
      }
      
      if (!data.category || typeof data.category !== 'string') {
        throw new Error("Invalid category");
      }
      
      // Clean undefined, null, and empty string values (Firestore doesn't accept undefined)
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([key, value]) => {
          // Keep all required fields
          if (['year', 'month', 'amount', 'category'].includes(key)) {
            return true;
          }
          // For optional fields, filter out undefined, null, and empty strings
          return value !== undefined && value !== null && value !== '';
        })
      );
      
      const docRef = await addDoc(collection(db, INCOMES_COLLECTION), {
        ...cleanedData,
        userId,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding income:", error);
      throw error;
    }
  },

  async getIncomes(userId: string, year?: number) {
    try {
      let q = query(
        collection(db, INCOMES_COLLECTION),
        where("userId", "==", userId)
      );

      if (year) {
        q = query(
          collection(db, INCOMES_COLLECTION),
          where("userId", "==", userId),
          where("year", "==", year)
        );
      }

      const querySnapshot = await getDocs(q);
      const incomes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as IncomeEntry[];

      // Sort client-side to avoid index requirements
      return incomes.sort((a, b) => {
        if (a.year !== b.year) {
          return b.year - a.year; // Descending year
        }
        return a.month - b.month; // Ascending month
      });
    } catch (error) {
      console.error("Error getting incomes:", error);
      throw error;
    }
  },

  async updateIncome(id: string, data: Partial<Omit<IncomeEntry, "id" | "userId" | "createdAt">>) {
    try {
      const docRef = doc(db, INCOMES_COLLECTION, id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error("Error updating income:", error);
      throw error;
    }
  },

  async deleteIncome(id: string) {
    try {
      const docRef = doc(db, INCOMES_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting income:", error);
      throw error;
    }
  }
};

export interface Quote {
  id: number;
  quote: string;
  author: string;
}

// Extend FirestoreService with quotes operations
export const FirestoreQuotesService = {
  async getAllQuotes(): Promise<Quote[]> {
    try {
      const q = query(
        collection(db, QUOTES_COLLECTION),
        orderBy("id", "asc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ ...doc.data(), id: Number(doc.id) } as Quote));
    } catch (error) {
      console.error("Error fetching quotes:", error);
      throw error;
    }
  },

  async addQuote(quoteData: Quote): Promise<void> {
    try {
      const quoteRef = doc(db, QUOTES_COLLECTION, quoteData.id.toString());
      await setDoc(quoteRef, quoteData);
    } catch (error) {
      console.error("Error adding quote:", error);
      throw error;
    }
  }
};
