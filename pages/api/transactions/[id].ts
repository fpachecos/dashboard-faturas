import type { NextApiRequest, NextApiResponse } from 'next';
import { updateTransaction, deleteTransaction, getTransactions } from '@/lib/data';
import { Transaction } from '@/types';
import { getUserId } from '@/lib/api-auth';
import { createAuthenticatedClient } from '@/lib/supabase-server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
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
  
  if (req.method === 'PUT') {
    try {
      const updatedTransaction: Partial<Transaction> = req.body;
      
      await updateTransaction(id as string, updatedTransaction, userId, supabaseClient);
      
      // Fetch updated transaction
      const transactions = await getTransactions(userId, supabaseClient);
      const updated = transactions.find(t => t.id === id);
      
      if (!updated) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      res.status(200).json(updated);
    } catch (error) {
      console.error('Error updating transaction:', error);
      res.status(500).json({ error: 'Failed to update transaction' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await deleteTransaction(id as string, userId, supabaseClient);
      
      res.status(200).json({ message: 'Transaction deleted' });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      res.status(500).json({ error: 'Failed to delete transaction' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

