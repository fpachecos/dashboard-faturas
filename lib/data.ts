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
  await ensureDataDir();
  await fs.writeFile(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2));
}

export async function getCategories(): Promise<Category[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(CATEGORIES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Return default categories if file doesn't exist
    await saveCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
}

