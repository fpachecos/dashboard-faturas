import { createClient } from '@supabase/supabase-js';
import { Transaction, Category } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using fallback to file system.');
}

// Create Supabase client with schema configuration
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      db: {
        schema: 'faturas',
      },
    })
  : null;

// Database types
export interface TransactionRow {
  id: string;
  user_id: string;
  date: string;
  establishment: string;
  cardholder: string;
  value: number;
  installment: string;
  invoice_date: string;
  category: string | null;
  type: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryRow {
  id: string;
  user_id: string | null;
  name: string;
  color: string;
  created_at?: string;
  updated_at?: string;
}

// Helper functions to convert between app types and database types
export function transactionToRow(transaction: Transaction, userId: string): TransactionRow {
  return {
    id: transaction.id,
    user_id: userId,
    date: transaction.date,
    establishment: transaction.establishment,
    cardholder: transaction.cardholder,
    value: transaction.value,
    installment: transaction.installment,
    invoice_date: transaction.invoiceDate,
    category: transaction.category || null,
    type: transaction.type || null,
  };
}

export function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    date: row.date,
    establishment: row.establishment,
    cardholder: row.cardholder,
    value: row.value,
    installment: row.installment,
    invoiceDate: row.invoice_date,
    category: row.category || undefined,
    type: (row.type as 'Fixo' | 'Variável') || undefined,
  };
}

export function categoryToRow(category: Category, userId: string | null = null): CategoryRow {
  return {
    id: category.id,
    user_id: userId,
    name: category.name,
    color: category.color,
  };
}

export function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
  };
}

