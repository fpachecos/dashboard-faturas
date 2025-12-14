import { promises as fs } from 'fs';
import path from 'path';
import { Transaction, Category } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

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
  await ensureDataDir();
  try {
    const data = await fs.readFile(TRANSACTIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export async function saveTransactions(transactions: Transaction[]): Promise<void> {
  try {
    await ensureDataDir();
    await fs.writeFile(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2));
  } catch (error) {
    // In read-only environments (like Vercel), log but don't throw
    console.error('Could not save transactions (read-only filesystem):', error);
    // Don't throw error to allow app to continue
  }
}

export async function getCategories(): Promise<Category[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(CATEGORIES_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    // Ensure we always return an array
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATEGORIES;
  } catch (error) {
    // Return default categories if file doesn't exist
    // Don't try to save in Vercel (read-only filesystem)
    // Only save if we're in a writable environment
    try {
      await saveCategories(DEFAULT_CATEGORIES);
    } catch (saveError) {
      // Ignore save errors (e.g., in Vercel read-only environment)
      console.log('Could not save default categories (read-only filesystem), returning defaults');
    }
    return DEFAULT_CATEGORIES;
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  try {
    await ensureDataDir();
    await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
  } catch (error) {
    // In read-only environments (like Vercel), log but don't throw
    console.error('Could not save categories (read-only filesystem):', error);
    // Don't throw error to allow app to continue with in-memory data
  }
}

