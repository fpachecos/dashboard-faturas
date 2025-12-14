import type { NextApiRequest, NextApiResponse } from 'next';
import { getCategories, saveCategories } from '@/lib/data';
import { Category } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const categories = await getCategories();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  } else if (req.method === 'POST') {
    try {
      const newCategory: Category = req.body;
      const categories = await getCategories();
      
      categories.push(newCategory);
      await saveCategories(categories);
      
      res.status(200).json(newCategory);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create category' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

