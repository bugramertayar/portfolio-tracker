import { create } from 'zustand';
import { Transaction, AssetCategory } from '@/types/portfolio.types';
import { FirestoreService } from '@/lib/firestore.service';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  
  fetchTransactions: (userId: string, category?: AssetCategory) => Promise<void>;
  refreshTransactions: (userId: string, category?: AssetCategory) => Promise<void>; // Silent refresh
  addTransaction: (transaction: Transaction) => void; // Optimistic update
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  isLoading: false,
  error: null,

  fetchTransactions: async (userId: string, category?: AssetCategory) => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await FirestoreService.getTransactions(userId, category);
      set({ transactions, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  refreshTransactions: async (userId: string, category?: AssetCategory) => {
    // Silent refresh - doesn't change isLoading state
    try {
      const transactions = await FirestoreService.getTransactions(userId, category);
      set({ transactions });
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
