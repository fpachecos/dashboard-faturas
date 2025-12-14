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
      // Ensure we always return an array
      if (!Array.isArray(categories)) {
        return res.status(200).json([]);
      }
      res.status(200).json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Return empty array instead of error to prevent frontend crash
      res.status(200).json([]);
    }
  } else if (req.method === 'POST') {
    try {
      const newCategory: Category = req.body;
      const { addCategory } = await import('@/lib/data');
      
      await addCategory(newCategory);
      
      res.status(200).json(newCategory);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

