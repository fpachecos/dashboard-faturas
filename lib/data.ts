import { Transaction, Category } from '@/types';
import { supabase, transactionToRow, rowToTransaction, categoryToRow, rowToCategory } from './supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

// Type for Supabase client that accepts any schema
type SupabaseClientAny = SupabaseClient<any, any, any, any>;

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Alimentação', color: '#FF6B6B' },
  { id: '2', name: 'Transporte', color: '#4ECDC4' },
  { id: '3', name: 'Saúde', color: '#45B7D1' },
  { id: '4', name: 'Educação', color: '#FFA07A' },
  { id: '5', name: 'Lazer', color: '#98D8C8' },
  { id: '6', name: 'Compras', color: '#F7DC6F' },
  { id: '7', name: 'Serviços', color: '#BB8FCE' },
  { id: '8', name: 'Assinaturas', color: '#85C1E2' },
  { id: '9', name: 'Combustível', color: '#F8B739' },
  { id: '10', name: 'Supermercado', color: '#52BE80' },
  { id: '11', name: 'Farmácia', color: '#EC7063' },
  { id: '12', name: 'Restaurante', color: '#F1948A' },
  { id: '13', name: 'Outros', color: '#95A5A6' },
];

export async function getTransactions(userId: string, client?: SupabaseClientAny): Promise<Transaction[]> {
  const db = client || supabase;
  
  if (!db) {
    console.warn('Supabase not configured, returning empty array');
    return [];
  }

  if (!userId) {
    return [];
  }

  try {
    const { data, error } = await db
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions from Supabase:', error);
      return [];
    }

    return (data || []).map(rowToTransaction);
  } catch (error) {
    console.error('Error in getTransactions:', error);
    return [];
  }
}

export async function saveTransactions(transactions: Transaction[], userId: string, client?: SupabaseClientAny): Promise<void> {
  const db = client || supabase;
  
  if (!db) {
    console.warn('Supabase not configured, cannot save transactions');
    return;
  }

  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    // Delete all existing transactions for this user and insert new ones
    const { error: deleteError } = await db
      .from('transactions')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting transactions:', deleteError);
    }

    if (transactions.length > 0) {
      const rows = transactions.map(t => transactionToRow(t, userId));
      const { error: insertError } = await db
        .from('transactions')
        .insert(rows);

      if (insertError) {
        console.error('Error inserting transactions:', insertError);
        throw insertError;
      }
    }
  } catch (error) {
    console.error('Error in saveTransactions:', error);
    throw error;
  }
}

export async function getCategories(userId: string, client?: SupabaseClientAny): Promise<Category[]> {
  const db = client || supabase;
  
  if (!db) {
    console.warn('Supabase not configured, returning default categories');
    return DEFAULT_CATEGORIES;
  }

  if (!userId) {
    return DEFAULT_CATEGORIES;
  }

  try {
    const { data, error } = await db
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories from Supabase:', error);
      return DEFAULT_CATEGORIES;
    }

    if (!data || data.length === 0) {
      // Initialize with default categories for this user
      await saveCategories(DEFAULT_CATEGORIES, userId, client);
      return DEFAULT_CATEGORIES;
    }

    return data.map(rowToCategory);
  } catch (error) {
    console.error('Error in getCategories:', error);
    return DEFAULT_CATEGORIES;
  }
}

export async function saveCategories(categories: Category[], userId: string, client?: SupabaseClientAny): Promise<void> {
  const db = client || supabase;
  
  if (!db) {
    console.warn('Supabase not configured, cannot save categories');
    return;
  }

  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    // Delete all existing categories for this user and insert new ones
    const { error: deleteError } = await db
      .from('categories')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting categories:', deleteError);
    }

    if (categories.length > 0) {
      const rows = categories.map(cat => categoryToRow(cat, userId));
      const { error: insertError } = await db
        .from('categories')
        .insert(rows);

      if (insertError) {
        console.error('Error inserting categories:', insertError);
        throw insertError;
      }
    }
  } catch (error) {
    console.error('Error in saveCategories:', error);
    throw error;
  }
}

// Helper function to add a single category
export async function addCategory(category: Category, userId: string, client?: SupabaseClientAny): Promise<void> {
  const db = client || supabase;
  
  if (!db) {
    console.warn('Supabase not configured, cannot add category');
    return;
  }

  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const row = categoryToRow(category, userId);
    const { error } = await db
      .from('categories')
      .insert(row);

    if (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in addCategory:', error);
    throw error;
  }
}

// Helper function to update a single category
export async function updateCategory(id: string, updates: Partial<Category>, userId: string, client?: SupabaseClientAny): Promise<void> {
  const db = client || supabase;
  
  if (!db) {
    console.warn('Supabase not configured, cannot update category');
    return;
  }

  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.color !== undefined) updateData.color = updates.color;

    const { error } = await db
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId); // Ensure user can only update their own categories

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateCategory:', error);
    throw error;
  }
}

// Helper function to delete a single category
export async function deleteCategory(id: string, userId: string, client?: SupabaseClientAny): Promise<void> {
  const db = client || supabase;
  
  if (!db) {
    console.warn('Supabase not configured, cannot delete category');
    return;
  }

  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const { error } = await db
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Ensure user can only delete their own categories

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    throw error;
  }
}

// Helper function to add a single transaction (for better performance)
export async function addTransaction(transaction: Transaction, userId: string, client?: SupabaseClientAny): Promise<void> {
  const db = client || supabase;
  
  if (!db) {
    console.warn('Supabase not configured, cannot add transaction');
    return;
  }

  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const row = transactionToRow(transaction, userId);
    const { error } = await db
      .from('transactions')
      .insert(row);

    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in addTransaction:', error);
    throw error;
  }
}

// Helper function to update a single transaction
export async function updateTransaction(id: string, updates: Partial<Transaction>, userId: string, client?: SupabaseClientAny): Promise<void> {
  const db = client || supabase;
  
  if (!db) {
    console.warn('Supabase not configured, cannot update transaction');
    return;
  }

  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const updateData: any = {};
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.establishment !== undefined) updateData.establishment = updates.establishment;
    if (updates.cardholder !== undefined) updateData.cardholder = updates.cardholder;
    if (updates.value !== undefined) updateData.value = updates.value;
    if (updates.installment !== undefined) updateData.installment = updates.installment;
    if (updates.invoiceDate !== undefined) updateData.invoice_date = updates.invoiceDate;

    const { error } = await db
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId); // Ensure user can only update their own transactions

    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateTransaction:', error);
    throw error;
  }
}

// Helper function to delete a single transaction
export async function deleteTransaction(id: string, userId: string, client?: SupabaseClientAny): Promise<void> {
  const db = client || supabase;
  
  if (!db) {
    console.warn('Supabase not configured, cannot delete transaction');
    return;
  }

  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const { error } = await db
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Ensure user can only delete their own transactions

    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteTransaction:', error);
    throw error;
  }
}

// Helper function to delete transactions by invoice year and month
// invoiceDate should be in format YYYY-MM-DD or YYYY-MM
export async function deleteTransactionsByInvoiceMonth(invoiceDate: string, userId: string, client?: SupabaseClientAny): Promise<void> {
  const db = client || supabase;
  
  if (!db) {
    console.warn('Supabase not configured, cannot delete transactions');
    return;
  }

  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    // Extract year and month from invoiceDate (format: YYYY-MM-DD or YYYY-MM)
    const yearMonth = invoiceDate.substring(0, 7); // Get YYYY-MM
    
    // Delete all transactions for this user with invoice_date starting with YYYY-MM
    const { error } = await db
      .from('transactions')
      .delete()
      .eq('user_id', userId)
      .like('invoice_date', `${yearMonth}%`); // Use LIKE to match YYYY-MM-*

    if (error) {
      console.error('Error deleting transactions by invoice month:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteTransactionsByInvoiceMonth:', error);
    throw error;
  }
}

// Helper function to find the most recent transaction by establishment name
export async function findMostRecentTransactionByEstablishment(
  establishment: string,
  userId: string,
  client?: SupabaseClientAny
): Promise<Transaction | null> {
  const db = client || supabase;
  
  if (!db) {
    return null;
  }

  if (!userId || !establishment) {
    return null;
  }

  try {
    const { data, error } = await db
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('establishment', establishment)
      .order('date', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error finding transaction by establishment:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return rowToTransaction(data[0]);
  } catch (error) {
    console.error('Error in findMostRecentTransactionByEstablishment:', error);
    return null;
  }
}
