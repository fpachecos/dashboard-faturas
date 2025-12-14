import type { NextApiRequest, NextApiResponse } from 'next';
import { getCategories, saveCategories } from '@/lib/data';
import { Category } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (req.method === 'PUT') {
    try {
      const categories = await getCategories();
      const updatedCategory: Partial<Category> = req.body;
      
      const index = categories.findIndex(c => c.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      categories[index] = { ...categories[index], ...updatedCategory };
      await saveCategories(categories);
      
      res.status(200).json(categories[index]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update category' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const categories = await getCategories();
      const filtered = categories.filter(c => c.id !== id);
      await saveCategories(filtered);
      
      res.status(200).json({ message: 'Category deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

