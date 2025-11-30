import { Timestamp } from "firebase/firestore";

export interface IncomeEntry {
  id: string;
  userId: string;
  year: number;
  month: number; // 0-11 for Jan-Dec
  amount: number;
  category: string;
  description?: string;
  createdAt: Timestamp;
}

export interface IncomeMonthData {
  month: number;
  total: number;
  entries: IncomeEntry[];
}

export interface IncomeYearData {
  year: number;
  months: { [key: number]: IncomeMonthData };
  total: number;
}
