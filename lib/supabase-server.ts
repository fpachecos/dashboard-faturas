import type { NextApiRequest } from 'next';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create an authenticated Supabase client for server-side operations
export async function createAuthenticatedClient(req: NextApiRequest): Promise<SupabaseClient<any, 'faturas', 'faturas', any> | null> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    // Create a base client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      db: {
        schema: 'faturas',
      },
    });

    // Try to get the access token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Set the session using the access token
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        // Create a new client with the user's session
        return createClient(supabaseUrl, supabaseAnonKey, {
          db: {
            schema: 'faturas',
          },
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }) as SupabaseClient<any, 'faturas', 'faturas', any>;
      }
    }

    // Fallback: try to get session from cookies
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = decodeURIComponent(value);
        return acc;
      }, {} as Record<string, string>);

      const authTokenKey = Object.keys(cookies).find(key => 
        key.startsWith('sb-') && key.endsWith('-auth-token')
      );

      if (authTokenKey) {
        try {
          const sessionData = JSON.parse(cookies[authTokenKey]);
          if (sessionData?.access_token) {
            return createClient(supabaseUrl, supabaseAnonKey, {
              db: {
                schema: 'faturas',
              },
              global: {
                headers: {
                  Authorization: `Bearer ${sessionData.access_token}`,
                },
              },
            }) as SupabaseClient<any, 'faturas', 'faturas', any>;
          }
        } catch (parseError) {
          console.warn('Could not parse auth token from cookie', parseError);
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error creating authenticated client:', error);
    return null;
  }
}

