import type { NextApiRequest, NextApiResponse } from 'next';
import { getCategories, addCategory } from '@/lib/data';
import { Category } from '@/types';
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
      const categories = await getCategories(userId, supabaseClient);
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
      
      await addCategory(newCategory, userId, supabaseClient);
      
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

