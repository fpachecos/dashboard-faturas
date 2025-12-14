// Example implementation using Vercel KV instead of files
// To use this, install @vercel/kv and update lib/data.ts

/*
import { kv } from '@vercel/kv';
import { Transaction, Category } from '@/types';

const TRANSACTIONS_KEY = 'transactions';
const CATEGORIES_KEY = 'categories';

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

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const data = await kv.get<Transaction[]>(TRANSACTIONS_KEY);
    return data || [];
  } catch (error) {
    console.error('Error reading transactions from KV:', error);
    return [];
  }
}

export async function saveTransactions(transactions: Transaction[]): Promise<void> {
  try {
    await kv.set(TRANSACTIONS_KEY, transactions);
  } catch (error) {
    console.error('Error saving transactions to KV:', error);
    throw error;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const data = await kv.get<Category[]>(CATEGORIES_KEY);
    if (!data || data.length === 0) {
      await saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    return data;
  } catch (error) {
    console.error('Error reading categories from KV:', error);
    await saveCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  try {
    await kv.set(CATEGORIES_KEY, categories);
  } catch (error) {
    console.error('Error saving categories to KV:', error);
    throw error;
  }
}
*/

