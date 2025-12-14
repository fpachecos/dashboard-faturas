import type { NextApiRequest, NextApiResponse } from 'next';
import { updateTransaction, deleteTransaction, getTransactions } from '@/lib/data';
import { Transaction } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (req.method === 'PUT') {
    try {
      const updatedTransaction: Partial<Transaction> = req.body;
      
      await updateTransaction(id as string, updatedTransaction);
      
      // Fetch updated transaction
      const transactions = await getTransactions();
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
      await deleteTransaction(id as string);
      
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

