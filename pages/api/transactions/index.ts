import type { NextApiRequest, NextApiResponse } from 'next';
import { getTransactions, addTransaction, deleteTransactionsByInvoiceMonth } from '@/lib/data';
import { Transaction, FilterOptions } from '@/types';
import { parseCSV, extractInvoiceDateFromFilename } from '@/lib/csvParser';
import { classifyTransactionsWithAI } from '@/lib/aiClassifier';
import { getCategories } from '@/lib/data';
import { getUserId } from '@/lib/api-auth';
import { createAuthenticatedClient } from '@/lib/supabase-server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get user ID from request
  const userId = await getUserId(req);
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Create authenticated Supabase client
  const supabaseClient = await createAuthenticatedClient(req);
  
  if (!supabaseClient) {
    return res.status(401).json({ error: 'Failed to authenticate' });
  }

  if (req.method === 'GET') {
    try {
      const transactions = await getTransactions(userId, supabaseClient);
      const filters: FilterOptions = req.query;
      
      let filtered = transactions;
      
      if (filters.category) {
        filtered = filtered.filter(t => t.category === filters.category);
      }
      
      if (filters.dateFrom || filters.dateTo) {
        filtered = filtered.filter(t => {
          const [day, month, year] = t.date.split('/');
          const date = new Date(`${year}-${month}-${day}`);
          
          if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            if (date < fromDate) return false;
          }
          
          if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            if (date > toDate) return false;
          }
          
          return true;
        });
      }
      
      if (filters.valueMin !== undefined) {
        filtered = filtered.filter(t => t.value >= filters.valueMin!);
      }
      
      if (filters.valueMax !== undefined) {
        filtered = filtered.filter(t => t.value <= filters.valueMax!);
      }
      
      if (filters.invoiceDate) {
        // Filter by month and year only (format: YYYY-MM)
        const filterMonthYear = filters.invoiceDate.substring(0, 7); // Get YYYY-MM from YYYY-MM-DD or YYYY-MM
        filtered = filtered.filter(t => {
          const transactionMonthYear = t.invoiceDate.substring(0, 7);
          return transactionMonthYear === filterMonthYear;
        });
      }
      
      if (filters.type) {
        filtered = filtered.filter(t => t.type === filters.type);
      }
      
      res.status(200).json(filtered);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  } else if (req.method === 'POST') {
    try {
      const { csvContent, filename } = req.body;
      
      if (!csvContent) {
        return res.status(400).json({ error: 'CSV content is required' });
      }
      
      const invoiceDate = filename 
        ? extractInvoiceDateFromFilename(filename)
        : new Date().toISOString().split('T')[0];
      
      // Delete all existing transactions for the same invoice year and month
      await deleteTransactionsByInvoiceMonth(invoiceDate, userId, supabaseClient);
      
      const newTransactions = parseCSV(csvContent, invoiceDate);
      const categories = await getCategories(userId, supabaseClient);
      
      // Classify new transactions with AI
      const classifiedTransactions = await classifyTransactionsWithAI(
        newTransactions,
        categories
      );
      
      // Add new transactions one by one (more efficient with Supabase)
      for (const transaction of classifiedTransactions) {
        await addTransaction(transaction, userId, supabaseClient);
      }
      
      res.status(200).json({ 
        message: 'Transactions imported successfully',
        count: classifiedTransactions.length 
      });
    } catch (error) {
      console.error('Error importing transactions:', error);
      res.status(500).json({ error: 'Failed to import transactions' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

