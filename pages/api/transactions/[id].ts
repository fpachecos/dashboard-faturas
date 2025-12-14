import type { NextApiRequest, NextApiResponse } from 'next';
import { getTransactions, saveTransactions } from '@/lib/data';
import { Transaction } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (req.method === 'PUT') {
    try {
      const transactions = await getTransactions();
      const updatedTransaction: Partial<Transaction> = req.body;
      
      const index = transactions.findIndex(t => t.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      transactions[index] = { ...transactions[index], ...updatedTransaction };
      await saveTransactions(transactions);
      
      res.status(200).json(transactions[index]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update transaction' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const transactions = await getTransactions();
      const filtered = transactions.filter(t => t.id !== id);
      await saveTransactions(filtered);
      
      res.status(200).json({ message: 'Transaction deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete transaction' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

