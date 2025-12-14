import type { NextApiRequest, NextApiResponse } from 'next';
import { updateCategory, deleteCategory, getCategories } from '@/lib/data';
import { Category } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (req.method === 'PUT') {
    try {
      const updatedCategory: Partial<Category> = req.body;
      
      await updateCategory(id as string, updatedCategory);
      
      // Fetch updated category
      const categories = await getCategories();
      const updated = categories.find(c => c.id === id);
      
      if (!updated) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.status(200).json(updated);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await deleteCategory(id as string);
      
      res.status(200).json({ message: 'Category deleted' });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

