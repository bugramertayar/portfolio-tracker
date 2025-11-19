import { create } from 'zustand';
import { Transaction, AssetCategory } from '@/types/portfolio.types';
import { FirestoreService } from '@/lib/firestore.service';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  
  fetchTransactions: (userId: string, category?: AssetCategory) => Promise<void>;
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

  addTransaction: (transaction: Transaction) => {
    set((state) => ({
      transactions: [transaction, ...state.transactions]
    }));
  }
}));
