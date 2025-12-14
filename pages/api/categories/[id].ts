import type { NextApiRequest, NextApiResponse } from 'next';
import { updateCategory, deleteCategory, getCategories } from '@/lib/data';
import { Category } from '@/types';
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
      const updatedCategory: Partial<Category> = req.body;
      
      await updateCategory(id as string, updatedCategory, userId, supabaseClient);
      
      // Fetch updated category
      const categories = await getCategories(userId, supabaseClient);
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
      await deleteCategory(id as string, userId, supabaseClient);
      
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

