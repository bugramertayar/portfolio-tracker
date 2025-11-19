import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  Timestamp,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { 
  PortfolioItem, 
  Transaction, 
  AssetCategory 
} from "@/types/portfolio.types";

// Collection references
const USERS_COLLECTION = "users";
const PORTFOLIOS_COLLECTION = "portfolios";
const TRANSACTIONS_COLLECTION = "transactions";

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

  // Transaction Operations
  async addTransaction(
    userId: string, 
    transactionData: Omit<Transaction, "id" | "createdAt" | "date">
  ): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        // 1. Read portfolio item first (Reads must come before writes)
        const portfolioRef = doc(db, USERS_COLLECTION, userId, PORTFOLIOS_COLLECTION, transactionData.symbol);
        const portfolioDoc = await transaction.get(portfolioRef);

        // 2. Prepare transaction record
        const transactionRef = doc(collection(db, USERS_COLLECTION, userId, TRANSACTIONS_COLLECTION));
        const newTransaction: any = {
          ...transactionData,
          date: Date.now(),
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
            quantity: transactionData.quantity,
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

          if (transactionData.type === 'BUY') {
            newQuantity += transactionData.quantity;
            newTotalCost += transactionData.total;
          } else {
            // SELL
            if (currentData.quantity < transactionData.quantity) {
              throw new Error("Insufficient quantity to sell");
            }
            newQuantity -= transactionData.quantity;
            // For sell, we reduce total cost proportionally to keep average cost same
            const costPerShare = currentData.totalCost / currentData.quantity;
            newTotalCost -= (costPerShare * transactionData.quantity);
          }

          // 4. Perform writes
          transaction.set(transactionRef, newTransaction);
          
          if (newQuantity <= 0) {
            transaction.delete(portfolioRef);
          } else {
            transaction.update(portfolioRef, {
              quantity: newQuantity,
              totalCost: newTotalCost,
              averageCost: newTotalCost / newQuantity,
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
  }
};
