import { create } from 'zustand';
import { Transaction, AssetCategory } from '@/types/portfolio.types';
import { FirestoreService } from '@/lib/firestore.service';

interface TransactionState {
  transactions: Transaction[];
  lastVisible: any;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  
  fetchTransactions: (userId: string, category?: AssetCategory, isNextPage?: boolean) => Promise<void>;
  refreshTransactions: (userId: string, category?: AssetCategory) => Promise<void>; // Silent refresh
  addTransaction: (transaction: Transaction) => void; // Optimistic update
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  lastVisible: null,
  hasMore: true,
  isLoading: false,
  error: null,

  fetchTransactions: async (userId: string, category?: AssetCategory, isNextPage: boolean = false) => {
    const state = get();
    if (state.isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const lastVisible = isNextPage ? state.lastVisible : undefined;
      const { transactions, lastVisible: newLastVisible } = await FirestoreService.getPaginatedTransactions(userId, category, 5, lastVisible);
      
      set((state) => ({ 
        transactions: isNextPage ? [...state.transactions, ...transactions] : transactions,
        lastVisible: newLastVisible,
        hasMore: transactions.length === 5, // If we got 5, assume there might be more
        isLoading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  refreshTransactions: async (userId: string, category?: AssetCategory) => {
    // Silent refresh - fetches first page only
    try {
      const { transactions, lastVisible } = await FirestoreService.getPaginatedTransactions(userId, category, 5);
      set({ 
        transactions, 
        lastVisible,
        hasMore: transactions.length === 5
      });
    } catch (error: any) {
      console.error('Error refreshing transactions:', error);
    }
  },

  addTransaction: (transaction: Transaction) => {
    set((state) => ({
      transactions: [transaction, ...state.transactions]
    }));
  }
}));
