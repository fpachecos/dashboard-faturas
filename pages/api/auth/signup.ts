import type { NextApiRequest, NextApiResponse } from 'next';
import { signUp } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { user, session } = await signUp(email, password, fullName);

    res.status(201).json({
      user: {
        id: user?.id,
        email: user?.email,
      },
      session,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message || 'Failed to create account' });
  }
}

