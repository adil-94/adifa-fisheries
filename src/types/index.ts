import type { User } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  ownerName: string | null;
}

export interface ExpenseFormData {
  amount: string;
  description: string;
  expense_date: string;
}

export interface DateFilter {
  startDate: string;
  endDate: string;
}

export const PARTNERS = {
  ADIL: {
    name: 'Adil',
    email: 'adil143420@gmail.com',
  },
  AEJAZ: {
    name: 'Aejaz',
    email: 'aejazfishkcp@gmail.com',
  },
} as const;

export type PartnerName = 'Adil' | 'Aejaz';
